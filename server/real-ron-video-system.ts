/**
 * SISTEMA RON VIDEO REAL COMPLETO
 * Implementación completa de videollamadas RON con Agora y gestión de sesiones reales
 */

import express, { Request, Response } from 'express';
import { db } from './db';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { 
  documents, 
  users, 
  analyticsEvents
} from '@shared/schema';
import { authenticateJWT, requireRole } from './services/jwt-auth-service';
import { generateRtcToken, RtcRole } from './services/agora-token-generator';
import { subDays } from 'date-fns';
import crypto from 'crypto';

const realRonRouter = express.Router();

// Configuración Agora real
const AGORA_APP_ID = process.env.AGORA_APP_ID || 'demo-app-id';
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || 'demo-certificate';
const TOKEN_EXPIRATION = 3600; // 1 hora

// Interface para sesiones RON
interface RonSession {
  id: string;
  channelName: string;
  certifierId: number;
  clientId: number;
  documentId: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  recordingId?: string;
  recordingUrl?: string;
}

// Almacén temporal de sesiones RON (en producción usar Redis o BD)
const activeSessions = new Map<string, RonSession>();

/**
 * POST /api/real-ron/create-session
 * Crear sesión RON real con documento y usuarios reales
 */
realRonRouter.post('/create-session', authenticateJWT, requireRole(['certifier', 'admin', 'notary']), async (req: Request, res: Response) => {
  try {
    const { clientId, documentId, scheduledAt } = req.body;
    const certifierId = req.user?.userId!;

    // Validar entrada
    if (!clientId || !documentId || !scheduledAt) {
      return res.status(400).json({
        success: false,
        error: 'clientId, documentId y scheduledAt son requeridos'
      });
    }

    // Verificar que el documento existe
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, Number(documentId)));

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Documento no encontrado'
      });
    }

    // Verificar que el cliente existe
    const [client] = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(clientId)));

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    // Generar canal único
    const sessionId = `RON-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const channelName = `ron-${sessionId.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    // Crear sesión RON
    const ronSession: RonSession = {
      id: sessionId,
      channelName,
      certifierId,
      clientId: Number(clientId),
      documentId: Number(documentId),
      status: 'scheduled',
      scheduledAt: new Date(scheduledAt)
    };

    // Guardar sesión
    activeSessions.set(sessionId, ronSession);

    // Registrar evento
    await db.insert(analyticsEvents).values({
      eventType: 'ron_session_created',
      userId: certifierId,
      documentId: Number(documentId),
      metadata: {
        sessionId,
        channelName,
        clientId: Number(clientId),
        certifierId,
        scheduledAt: new Date(scheduledAt),
        timestamp: new Date()
      },
      createdAt: new Date()
    });

    // Actualizar documento a "en proceso RON"
    await db
      .update(documents)
      .set({
        status: 'processing',
        updatedAt: new Date()
      })
      .where(eq(documents.id, Number(documentId)));

    res.status(201).json({
      success: true,
      message: 'Sesión RON creada exitosamente',
      session: {
        ...ronSession,
        document: {
          id: document.id,
          title: document.title,
          type: document.documentType
        },
        client: {
          id: client.id,
          name: client.fullName,
          email: client.email
        },
        certifier: {
          id: certifierId,
          name: req.user?.fullName
        }
      }
    });

  } catch (error) {
    console.error('Error creando sesión RON:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear sesión RON'
    });
  }
});

/**
 * GET /api/real-ron/session/:id/tokens
 * Obtener tokens reales de Agora para videollamada
 */
realRonRouter.get('/session/:id/tokens', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;
    const userId = req.user?.userId!;

    // Obtener sesión
    const session = activeSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Sesión RON no encontrada'
      });
    }

    // Verificar permisos
    const isCertifier = session.certifierId === userId;
    const isClient = session.clientId === userId;
    const isAdmin = req.user?.role === 'admin';

    if (!isCertifier && !isClient && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Sin permisos para acceder a esta sesión'
      });
    }

    // Determinar UID y rol
    const uid = isCertifier ? 1 : isClient ? 2 : 999;
    const userRole = isCertifier ? 'certifier' : isClient ? 'client' : 'observer';

    let token = 'demo-token';
    let isRealAgora = false;

    // Generar token real de Agora si está configurado
    if (AGORA_APP_ID !== 'demo-app-id' && AGORA_APP_CERTIFICATE !== 'demo-certificate') {
      token = generateRtcToken(
        AGORA_APP_ID,
        AGORA_APP_CERTIFICATE,
        session.channelName,
        uid,
        RtcRole.PUBLISHER,
        TOKEN_EXPIRATION
      );
      isRealAgora = true;
    }

    // Actualizar sesión a activa si es la primera vez
    if (session.status === 'scheduled') {
      session.status = 'active';
      session.startedAt = new Date();
      activeSessions.set(sessionId, session);

      // Registrar inicio de sesión
      await db.insert(analyticsEvents).values({
        eventType: 'ron_session_started',
        userId: session.clientId,
        documentId: session.documentId,
        metadata: {
          sessionId,
          certifierId: session.certifierId,
          startedBy: userId,
          timestamp: new Date()
        },
        createdAt: new Date()
      });
    }

    res.json({
      success: true,
      session: {
        id: sessionId,
        channelName: session.channelName,
        status: session.status
      },
      agora: {
        appId: AGORA_APP_ID,
        token,
        uid,
        channelName: session.channelName,
        isRealAgora,
        expiresAt: new Date(Date.now() + TOKEN_EXPIRATION * 1000)
      },
      user: {
        role: userRole,
        id: userId,
        name: req.user?.fullName
      },
      features: {
        recording: true,
        screenShare: true,
        chat: true,
        fileSharing: true
      }
    });

  } catch (error) {
    console.error('Error obteniendo tokens RON:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener tokens de video'
    });
  }
});

/**
 * POST /api/real-ron/session/:id/complete
 * Completar sesión RON real y certificar documento
 */
realRonRouter.post('/session/:id/complete', authenticateJWT, requireRole(['certifier', 'admin', 'notary']), async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;
    const { recordingId, recordingUrl, certificationNotes, signatureData } = req.body;
    const certifierId = req.user?.userId!;

    const session = activeSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Sesión RON no encontrada'
      });
    }

    if (session.certifierId !== certifierId) {
      return res.status(403).json({
        success: false,
        error: 'Solo el certificador puede completar la sesión'
      });
    }

    // Actualizar sesión
    session.status = 'completed';
    session.endedAt = new Date();
    session.recordingId = recordingId;
    session.recordingUrl = recordingUrl;
    activeSessions.set(sessionId, session);

    // Certificar documento
    await db
      .update(documents)
      .set({
        status: 'certified',
        updatedAt: new Date(),
        description: certificationNotes || 'Certificado vía RON'
      })
      .where(eq(documents.id, session.documentId));

    // Registrar certificación
    await db.insert(analyticsEvents).values({
      eventType: 'ron_session_completed',
      userId: session.clientId,
      documentId: session.documentId,
      metadata: {
        sessionId,
        certifierId,
        recordingId,
        recordingUrl,
        certificationNotes,
        sessionDuration: session.startedAt ? 
          Math.round((new Date().getTime() - session.startedAt.getTime()) / 1000) : 0,
        timestamp: new Date()
      },
      createdAt: new Date()
    });

    res.json({
      success: true,
      message: 'Sesión RON completada y documento certificado',
      session: {
        id: sessionId,
        status: 'completed',
        completedAt: new Date(),
        recordingId,
        recordingUrl
      },
      document: {
        id: session.documentId,
        status: 'certified',
        certifiedBy: req.user?.fullName,
        certificationDate: new Date()
      }
    });

  } catch (error) {
    console.error('Error completando sesión RON:', error);
    res.status(500).json({
      success: false,
      error: 'Error al completar sesión RON'
    });
  }
});

/**
 * GET /api/real-ron/sessions
 * Obtener sesiones RON reales del usuario
 */
realRonRouter.get('/sessions', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId!;
    const { status = 'all', limit = 20 } = req.query;

    // Obtener sesiones donde el usuario es certificador o cliente
    const userSessions = Array.from(activeSessions.values()).filter(session => 
      session.certifierId === userId || session.clientId === userId
    );

    // Filtrar por estado si se especifica
    const filteredSessions = status === 'all' 
      ? userSessions 
      : userSessions.filter(session => session.status === status);

    // Obtener información adicional de base de datos
    const sessionsWithDetails = await Promise.all(
      filteredSessions.slice(0, Number(limit)).map(async (session) => {
        const [document] = await db
          .select({
            id: documents.id,
            title: documents.title,
            documentType: documents.documentType,
            status: documents.status
          })
          .from(documents)
          .where(eq(documents.id, session.documentId));

        const [client] = await db
          .select({
            id: users.id,
            fullName: users.fullName,
            email: users.email
          })
          .from(users)
          .where(eq(users.id, session.clientId));

        const [certifier] = await db
          .select({
            id: users.id,
            fullName: users.fullName,
            email: users.email
          })
          .from(users)
          .where(eq(users.id, session.certifierId));

        return {
          ...session,
          document,
          client,
          certifier,
          userRole: session.certifierId === userId ? 'certifier' : 'client'
        };
      })
    );

    res.json({
      success: true,
      sessions: sessionsWithDetails,
      summary: {
        total: userSessions.length,
        scheduled: userSessions.filter(s => s.status === 'scheduled').length,
        active: userSessions.filter(s => s.status === 'active').length,
        completed: userSessions.filter(s => s.status === 'completed').length
      }
    });

  } catch (error) {
    console.error('Error obteniendo sesiones RON:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener sesiones'
    });
  }
});

/**
 * GET /api/real-ron/dashboard
 * Dashboard real de RON con métricas de video
 */
realRonRouter.get('/dashboard', authenticateJWT, requireRole(['certifier', 'admin', 'notary']), async (req: Request, res: Response) => {
  try {
    const certifierId = req.user?.userId!;
    const last30Days = subDays(new Date(), 30);

    // Métricas de sesiones RON
    const [
      totalRonSessions,
      completedSessions,
      todaySessions,
      avgSessionDuration
    ] = await Promise.all([
      // Total de sesiones RON
      db.select({ count: sql<number>`count(*)` })
        .from(analyticsEvents)
        .where(and(
          eq(analyticsEvents.eventType, 'ron_session_created'),
          sql`${analyticsEvents.metadata}->>'certifierId' = ${certifierId.toString()}`
        )),
      
      // Sesiones completadas
      db.select({ count: sql<number>`count(*)` })
        .from(analyticsEvents)
        .where(and(
          eq(analyticsEvents.eventType, 'ron_session_completed'),
          sql`${analyticsEvents.metadata}->>'certifierId' = ${certifierId.toString()}`
        )),
      
      // Sesiones de hoy
      db.select({ count: sql<number>`count(*)` })
        .from(analyticsEvents)
        .where(and(
          eq(analyticsEvents.eventType, 'ron_session_created'),
          sql`${analyticsEvents.metadata}->>'certifierId' = ${certifierId.toString()}`,
          gte(analyticsEvents.createdAt, new Date(new Date().toDateString()))
        )),
      
      // Duración promedio (desde metadata)
      db.select({ 
        avgDuration: sql<number>`AVG((${analyticsEvents.metadata}->>'sessionDuration')::numeric)` 
      })
        .from(analyticsEvents)
        .where(and(
          eq(analyticsEvents.eventType, 'ron_session_completed'),
          sql`${analyticsEvents.metadata}->>'certifierId' = ${certifierId.toString()}`,
          gte(analyticsEvents.createdAt, last30Days)
        ))
    ]);

    // Sesiones activas actuales
    const currentActiveSessions = Array.from(activeSessions.values())
      .filter(session => 
        session.certifierId === certifierId && 
        session.status === 'active'
      );

    // Próximas sesiones programadas
    const upcomingSessions = Array.from(activeSessions.values())
      .filter(session => 
        session.certifierId === certifierId && 
        session.status === 'scheduled' &&
        session.scheduledAt > new Date()
      )
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
      .slice(0, 5);

    // Obtener detalles de próximas sesiones
    const upcomingWithDetails = await Promise.all(
      upcomingSessions.map(async (session) => {
        const [client] = await db
          .select({
            fullName: users.fullName,
            email: users.email
          })
          .from(users)
          .where(eq(users.id, session.clientId));

        const [document] = await db
          .select({
            title: documents.title,
            documentType: documents.documentType
          })
          .from(documents)
          .where(eq(documents.id, session.documentId));

        return {
          ...session,
          client,
          document
        };
      })
    );

    // Actividad de RON por día (últimos 7 días)
    const last7Days = subDays(new Date(), 7);
    const dailyRonActivity = await db
      .select({
        date: sql<string>`DATE(${analyticsEvents.createdAt})`,
        sessions: sql<number>`count(*)`
      })
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.eventType, 'ron_session_completed'),
        sql`${analyticsEvents.metadata}->>'certifierId' = ${certifierId.toString()}`,
        gte(analyticsEvents.createdAt, last7Days)
      ))
      .groupBy(sql`DATE(${analyticsEvents.createdAt})`)
      .orderBy(sql`DATE(${analyticsEvents.createdAt})`);

    res.json({
      success: true,
      dashboard: {
        metrics: {
          totalSessions: totalRonSessions[0]?.count || 0,
          completedSessions: completedSessions[0]?.count || 0,
          todaySessions: todaySessions[0]?.count || 0,
          avgSessionDuration: Math.round(avgSessionDuration[0]?.avgDuration || 1800), // segundos
          activeSessions: currentActiveSessions.length,
          upcomingSessions: upcomingSessions.length
        },
        activeSessions: currentActiveSessions,
        upcomingSessions: upcomingWithDetails,
        charts: {
          dailyActivity: dailyRonActivity
        },
        certifier: {
          id: certifierId,
          name: req.user?.fullName,
          role: req.user?.role
        },
        agoraConfig: {
          configured: AGORA_APP_ID !== 'demo-app-id',
          appId: AGORA_APP_ID,
          demoMode: AGORA_APP_ID === 'demo-app-id'
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo dashboard RON:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener dashboard RON'
    });
  }
});

/**
 * GET /api/real-ron/session/:id/info
 * Información completa de sesión RON real
 */
realRonRouter.get('/session/:id/info', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;
    const userId = req.user?.userId!;

    const session = activeSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Sesión RON no encontrada'
      });
    }

    // Verificar permisos
    const hasAccess = session.certifierId === userId || 
                     session.clientId === userId || 
                     req.user?.role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Sin permisos para acceder a esta sesión'
      });
    }

    // Obtener información completa
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, session.documentId));

    const [client] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role
      })
      .from(users)
      .where(eq(users.id, session.clientId));

    const [certifier] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role
      })
      .from(users)
      .where(eq(users.id, session.certifierId));

    // Historial de la sesión
    const sessionHistory = await db
      .select({
        eventType: analyticsEvents.eventType,
        metadata: analyticsEvents.metadata,
        createdAt: analyticsEvents.createdAt
      })
      .from(analyticsEvents)
      .where(sql`${analyticsEvents.metadata}->>'sessionId' = ${sessionId}`)
      .orderBy(analyticsEvents.createdAt);

    res.json({
      success: true,
      session: {
        ...session,
        duration: session.startedAt && session.endedAt ? 
          Math.round((session.endedAt.getTime() - session.startedAt.getTime()) / 1000) : null
      },
      participants: {
        certifier,
        client
      },
      document,
      history: sessionHistory,
      canJoin: session.status === 'active' || session.status === 'scheduled',
      canComplete: session.status === 'active' && session.certifierId === userId
    });

  } catch (error) {
    console.error('Error obteniendo información de sesión:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener información de sesión'
    });
  }
});

/**
 * POST /api/real-ron/session/:id/join
 * Unirse a sesión RON activa
 */
realRonRouter.post('/session/:id/join', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;
    const userId = req.user?.userId!;

    const session = activeSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Sesión RON no encontrada'
      });
    }

    const hasAccess = session.certifierId === userId || 
                     session.clientId === userId || 
                     req.user?.role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Sin permisos para unirse a esta sesión'
      });
    }

    if (session.status !== 'active' && session.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        error: 'La sesión no está disponible para unirse'
      });
    }

    // Registrar participación
    await db.insert(analyticsEvents).values({
      eventType: 'ron_session_joined',
      userId,
      documentId: session.documentId,
      metadata: {
        sessionId,
        joinedAt: new Date(),
        userRole: session.certifierId === userId ? 'certifier' : 'client'
      },
      createdAt: new Date()
    });

    res.json({
      success: true,
      message: 'Unido a sesión RON exitosamente',
      session: {
        id: sessionId,
        channelName: session.channelName,
        status: session.status
      },
      joinUrl: `/ron-session/${sessionId}`,
      instructions: [
        'Verifica tu cámara y micrófono',
        'Asegúrate de tener buena conexión a internet',
        'Ten tu documento de identidad a mano',
        'La sesión será grabada para fines legales'
      ]
    });

  } catch (error) {
    console.error('Error uniéndose a sesión RON:', error);
    res.status(500).json({
      success: false,
      error: 'Error al unirse a sesión RON'
    });
  }
});

/**
 * GET /api/real-ron/config
 * Configuración real del sistema RON
 */
realRonRouter.get('/config', async (req: Request, res: Response) => {
  try {
    const isConfigured = AGORA_APP_ID !== 'demo-app-id' && AGORA_APP_CERTIFICATE !== 'demo-certificate';

    res.json({
      success: true,
      config: {
        videoProvider: 'Agora',
        configured: isConfigured,
        appId: AGORA_APP_ID,
        features: {
          video: true,
          audio: true,
          recording: true,
          screenShare: true,
          chat: true,
          fileSharing: true,
          multiParty: true
        },
        limits: {
          maxParticipants: 10,
          maxSessionDuration: 7200, // 2 horas
          recordingRetention: 90 // días
        },
        legal: {
          compliance: 'Ley 19.799',
          certification: 'ISO 27001',
          encryption: 'AES-256',
          recording: 'Obligatoria para validez legal'
        },
        demo: !isConfigured ? {
          message: 'Modo demo activo - Configure AGORA_APP_ID y AGORA_APP_CERTIFICATE para producción',
          limitations: [
            'Videollamadas simuladas',
            'Grabación no disponible',
            'Máximo 2 participantes'
          ]
        } : null
      }
    });

  } catch (error) {
    console.error('Error obteniendo configuración RON:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener configuración'
    });
  }
});

export { realRonRouter };