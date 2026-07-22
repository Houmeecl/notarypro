/**
 * PANEL DE CERTIFICADOR REAL COMPLETO
 * Sistema real para certificadores con documentos reales de base de datos
 */

import express, { Request, Response } from 'express';
import { db } from './db';
import { eq, desc, and, or, gte, sql } from 'drizzle-orm';
import { 
  documents, 
  users, 
  identityVerifications,
  analyticsEvents
} from '@shared/schema';
import { authenticateJWT, requireRole } from './services/jwt-auth-service';
import { subDays } from 'date-fns';
import fs from 'fs';
import path from 'path';

const realCertifierRouter = express.Router();

// Middleware de autenticación para certificadores
realCertifierRouter.use(authenticateJWT);
realCertifierRouter.use(requireRole(['certifier', 'admin', 'notary']));

/**
 * GET /api/real-certifier/pending-documents
 * Obtener documentos reales pendientes de certificación
 */
realCertifierRouter.get('/pending-documents', async (req: Request, res: Response) => {
  try {
    const { limit = 20, priority = 'all' } = req.query;

    // Obtener documentos pendientes con información del usuario
    const pendingDocuments = await db
      .select({
        id: documents.id,
        title: documents.title,
        documentType: documents.documentType,
        description: documents.description,
        status: documents.status,
        fileName: documents.fileName,
        fileSize: documents.fileSize,
        mimeType: documents.mimeType,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        // Información del usuario
        userId: users.id,
        userName: users.fullName,
        userEmail: users.email,
        userRole: users.role,
        userPlatform: users.platform,
        // Calcular prioridad basada en tiempo
        daysSinceUpload: sql<number>`EXTRACT(DAY FROM (NOW() - ${documents.createdAt}))`
      })
      .from(documents)
      .leftJoin(users, eq(documents.userId, users.id))
      .where(
        or(
          eq(documents.status, 'uploaded'),
          eq(documents.status, 'processing')
        )
      )
      .orderBy(documents.createdAt) // Más antiguos primero
      .limit(Number(limit));

    // Clasificar por prioridad
    const documentsWithPriority = pendingDocuments.map(doc => {
      const days = doc.daysSinceUpload || 0;
      let priorityLevel = 'normal';
      
      if (days > 7) priorityLevel = 'high';
      else if (days > 3) priorityLevel = 'medium';
      
      return {
        ...doc,
        priority: priorityLevel,
        urgency: days > 7 ? 'urgent' : days > 3 ? 'important' : 'normal'
      };
    });

    // Filtrar por prioridad si se especifica
    const filteredDocuments = priority !== 'all' 
      ? documentsWithPriority.filter(doc => doc.priority === priority)
      : documentsWithPriority;

    res.json({
      success: true,
      documents: filteredDocuments,
      summary: {
        total: pendingDocuments.length,
        urgent: documentsWithPriority.filter(d => d.urgency === 'urgent').length,
        important: documentsWithPriority.filter(d => d.urgency === 'important').length,
        normal: documentsWithPriority.filter(d => d.urgency === 'normal').length
      }
    });

  } catch (error) {
    console.error('Error obteniendo documentos pendientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener documentos pendientes'
    });
  }
});

/**
 * GET /api/real-certifier/document/:id
 * Obtener documento específico para certificación
 */
realCertifierRouter.get('/document/:id', async (req: Request, res: Response) => {
  try {
    const documentId = Number(req.params.id);

    const [document] = await db
      .select({
        id: documents.id,
        title: documents.title,
        documentType: documents.documentType,
        description: documents.description,
        status: documents.status,
        filePath: documents.filePath,
        fileName: documents.fileName,
        fileSize: documents.fileSize,
        mimeType: documents.mimeType,
        fileHash: documents.fileHash,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        // Información completa del usuario
        userId: users.id,
        userName: users.fullName,
        userEmail: users.email,
        userRole: users.role,
        userPlatform: users.platform,
        userAddress: users.address,
        userRegion: users.region,
        userComuna: users.comuna
      })
      .from(documents)
      .leftJoin(users, eq(documents.userId, users.id))
      .where(eq(documents.id, documentId));

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Documento no encontrado'
      });
    }

    // Verificar si el archivo existe físicamente
    const fileExists = fs.existsSync(document.filePath);

    // Obtener verificaciones de identidad del usuario
    const userVerifications = await db
      .select({
        id: identityVerifications.id,
        status: identityVerifications.status,
        verificationType: identityVerifications.verificationType,
        createdAt: identityVerifications.createdAt
      })
      .from(identityVerifications)
      .where(eq(identityVerifications.userId, document.userId))
      .orderBy(desc(identityVerifications.createdAt))
      .limit(5);

    // Historial de cambios del documento
    const documentHistory = await db
      .select({
        eventType: analyticsEvents.eventType,
        metadata: analyticsEvents.metadata,
        createdAt: analyticsEvents.createdAt
      })
      .from(analyticsEvents)
      .where(eq(analyticsEvents.documentId, documentId))
      .orderBy(desc(analyticsEvents.createdAt));

    res.json({
      success: true,
      document: {
        ...document,
        fileExists,
        verifications: userVerifications,
        history: documentHistory,
        canCertify: ['uploaded', 'processing'].includes(document.status),
        certificationInfo: {
          requiredVerifications: ['identity', 'document'],
          hasIdentityVerification: userVerifications.some(v => v.status === 'verified'),
          readyForCertification: userVerifications.some(v => v.status === 'verified') && fileExists
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo documento para certificación:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener documento'
    });
  }
});

/**
 * POST /api/real-certifier/document/:id/certify
 * Certificar documento real
 */
realCertifierRouter.post('/document/:id/certify', async (req: Request, res: Response) => {
  try {
    const documentId = Number(req.params.id);
    const { notes, certificationLevel = 'standard' } = req.body;
    const certifierId = req.user?.userId;
    const certifierName = req.user?.fullName;

    // Verificar que el documento existe y está en estado correcto
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId));

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Documento no encontrado'
      });
    }

    if (!['uploaded', 'processing'].includes(document.status)) {
      return res.status(400).json({
        success: false,
        error: 'El documento no está en estado válido para certificación'
      });
    }

    // Actualizar documento a certificado
    const [certifiedDocument] = await db
      .update(documents)
      .set({
        status: 'certified',
        updatedAt: new Date(),
        description: notes || document.description
      })
      .where(eq(documents.id, documentId))
      .returning();

    // Registrar evento de certificación
    await db.insert(analyticsEvents).values({
      eventType: 'document_certified',
      userId: document.userId,
      documentId: documentId,
      metadata: {
        certifierId,
        certifierName,
        certificationLevel,
        notes,
        timestamp: new Date()
      },
      createdAt: new Date()
    });

    res.json({
      success: true,
      message: 'Documento certificado exitosamente',
      document: certifiedDocument,
      certification: {
        certifiedBy: certifierName,
        certificationDate: new Date(),
        level: certificationLevel,
        notes
      }
    });

  } catch (error) {
    console.error('Error certificando documento:', error);
    res.status(500).json({
      success: false,
      error: 'Error al certificar documento'
    });
  }
});

/**
 * POST /api/real-certifier/document/:id/reject
 * Rechazar documento real
 */
realCertifierRouter.post('/document/:id/reject', async (req: Request, res: Response) => {
  try {
    const documentId = Number(req.params.id);
    const { reason, details } = req.body;
    const certifierId = req.user?.userId;
    const certifierName = req.user?.fullName;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere especificar la razón del rechazo'
      });
    }

    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId));

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Documento no encontrado'
      });
    }

    // Actualizar documento a rechazado
    const [rejectedDocument] = await db
      .update(documents)
      .set({
        status: 'rejected',
        updatedAt: new Date(),
        description: `RECHAZADO: ${reason}. ${details || ''}`
      })
      .where(eq(documents.id, documentId))
      .returning();

    // Registrar evento de rechazo
    await db.insert(analyticsEvents).values({
      eventType: 'document_rejected',
      userId: document.userId,
      documentId: documentId,
      metadata: {
        certifierId,
        certifierName,
        reason,
        details,
        timestamp: new Date()
      },
      createdAt: new Date()
    });

    res.json({
      success: true,
      message: 'Documento rechazado',
      document: rejectedDocument,
      rejection: {
        rejectedBy: certifierName,
        rejectionDate: new Date(),
        reason,
        details
      }
    });

  } catch (error) {
    console.error('Error rechazando documento:', error);
    res.status(500).json({
      success: false,
      error: 'Error al rechazar documento'
    });
  }
});

/**
 * GET /api/real-certifier/my-certifications
 * Obtener certificaciones realizadas por el certificador
 */
realCertifierRouter.get('/my-certifications', async (req: Request, res: Response) => {
  try {
    const certifierId = req.user?.userId;
    const { page = 1, limit = 20, period = '30' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const startDate = subDays(new Date(), Number(period));

    // Obtener certificaciones realizadas
    const certifications = await db
      .select({
        eventId: analyticsEvents.id,
        documentId: analyticsEvents.documentId,
        eventType: analyticsEvents.eventType,
        metadata: analyticsEvents.metadata,
        createdAt: analyticsEvents.createdAt,
        // Información del documento
        documentTitle: documents.title,
        documentType: documents.documentType,
        documentStatus: documents.status,
        // Información del usuario del documento
        userName: users.fullName,
        userEmail: users.email
      })
      .from(analyticsEvents)
      .leftJoin(documents, eq(analyticsEvents.documentId, documents.id))
      .leftJoin(users, eq(documents.userId, users.id))
      .where(
        and(
          eq(analyticsEvents.eventType, 'document_certified'),
          sql`${analyticsEvents.metadata}->>'certifierId' = ${certifierId.toString()}`,
          gte(analyticsEvents.createdAt, startDate)
        )
      )
      .orderBy(desc(analyticsEvents.createdAt))
      .limit(Number(limit))
      .offset(offset);

    // Estadísticas del certificador
    const [certificationStats] = await db
      .select({
        totalCertifications: sql<number>`count(*)`
      })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.eventType, 'document_certified'),
          sql`${analyticsEvents.metadata}->>'certifierId' = ${certifierId.toString()}`
        )
      );

    // Certificaciones por tipo de documento
    const certificationsByType = await db
      .select({
        documentType: documents.documentType,
        count: sql<number>`count(*)`
      })
      .from(analyticsEvents)
      .leftJoin(documents, eq(analyticsEvents.documentId, documents.id))
      .where(
        and(
          eq(analyticsEvents.eventType, 'document_certified'),
          sql`${analyticsEvents.metadata}->>'certifierId' = ${certifierId.toString()}`,
          gte(analyticsEvents.createdAt, startDate)
        )
      )
      .groupBy(documents.documentType)
      .orderBy(sql`count(*) DESC`);

    res.json({
      success: true,
      certifications,
      stats: {
        totalCertifications: certificationStats?.totalCertifications || 0,
        periodCertifications: certifications.length,
        period: `${period} días`
      },
      charts: {
        certificationsByType
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        hasMore: certifications.length === Number(limit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo certificaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener certificaciones'
    });
  }
});

/**
 * GET /api/real-certifier/dashboard
 * Dashboard real del certificador con métricas
 */
realCertifierRouter.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const certifierId = req.user?.userId;
    const today = new Date();
    const last7Days = subDays(today, 7);
    const last30Days = subDays(today, 30);

    // Métricas del certificador
    const [
      pendingCount,
      todayCertifications,
      weeklyCertifications,
      totalCertifications
    ] = await Promise.all([
      // Documentos pendientes
      db.select({ count: sql<number>`count(*)` })
        .from(documents)
        .where(
          or(
            eq(documents.status, 'uploaded'),
            eq(documents.status, 'processing')
          )
        ),
      
      // Certificaciones de hoy
      db.select({ count: sql<number>`count(*)` })
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.eventType, 'document_certified'),
            sql`${analyticsEvents.metadata}->>'certifierId' = ${certifierId.toString()}`,
            gte(analyticsEvents.createdAt, new Date(today.toDateString()))
          )
        ),
      
      // Certificaciones de la semana
      db.select({ count: sql<number>`count(*)` })
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.eventType, 'document_certified'),
            sql`${analyticsEvents.metadata}->>'certifierId' = ${certifierId.toString()}`,
            gte(analyticsEvents.createdAt, last7Days)
          )
        ),
      
      // Total de certificaciones
      db.select({ count: sql<number>`count(*)` })
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.eventType, 'document_certified'),
            sql`${analyticsEvents.metadata}->>'certifierId' = ${certifierId.toString()}`
          )
        )
    ]);

    // Documentos urgentes (más de 7 días)
    const urgentDocuments = await db
      .select({
        id: documents.id,
        title: documents.title,
        documentType: documents.documentType,
        createdAt: documents.createdAt,
        userName: users.fullName,
        daysPending: sql<number>`EXTRACT(DAY FROM (NOW() - ${documents.createdAt}))`
      })
      .from(documents)
      .leftJoin(users, eq(documents.userId, users.id))
      .where(
        and(
          or(
            eq(documents.status, 'uploaded'),
            eq(documents.status, 'processing')
          ),
          sql`EXTRACT(DAY FROM (NOW() - ${documents.createdAt})) > 7`
        )
      )
      .orderBy(documents.createdAt)
      .limit(5);

    // Actividad de certificación últimos 7 días
    const dailyCertifications = await db
      .select({
        date: sql<string>`DATE(${analyticsEvents.createdAt})`,
        count: sql<number>`count(*)`
      })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.eventType, 'document_certified'),
          sql`${analyticsEvents.metadata}->>'certifierId' = ${certifierId.toString()}`,
          gte(analyticsEvents.createdAt, last7Days)
        )
      )
      .groupBy(sql`DATE(${analyticsEvents.createdAt})`)
      .orderBy(sql`DATE(${analyticsEvents.createdAt})`);

    res.json({
      success: true,
      dashboard: {
        metrics: {
          pendingDocuments: pendingCount[0]?.count || 0,
          todayCertifications: todayCertifications[0]?.count || 0,
          weeklyCertifications: weeklyCertifications[0]?.count || 0,
          totalCertifications: totalCertifications[0]?.count || 0,
          urgentDocuments: urgentDocuments.length
        },
        urgentDocuments,
        charts: {
          dailyCertifications
        },
        certifier: {
          id: certifierId,
          name: req.user?.fullName,
          role: req.user?.role
        },
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('Error obteniendo dashboard del certificador:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener dashboard'
    });
  }
});

/**
 * POST /api/real-certifier/batch-action
 * Acción en lote sobre múltiples documentos
 */
realCertifierRouter.post('/batch-action', async (req: Request, res: Response) => {
  try {
    const { documentIds, action, notes } = req.body;
    const certifierId = req.user?.userId;
    const certifierName = req.user?.fullName;

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere una lista de IDs de documentos'
      });
    }

    if (!['certify', 'reject', 'set-processing'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Acción no válida'
      });
    }

    const results = [];
    
    for (const docId of documentIds) {
      try {
        let newStatus = action === 'certify' ? 'certified' : 
                       action === 'reject' ? 'rejected' : 'processing';
        
        const [updatedDoc] = await db
          .update(documents)
          .set({
            status: newStatus,
            updatedAt: new Date(),
            ...(notes && { description: notes })
          })
          .where(eq(documents.id, Number(docId)))
          .returning();

        if (updatedDoc) {
          // Registrar evento
          await db.insert(analyticsEvents).values({
            eventType: action === 'certify' ? 'document_certified' : 
                      action === 'reject' ? 'document_rejected' : 'document_updated',
            userId: updatedDoc.userId,
            documentId: Number(docId),
            metadata: {
              certifierId,
              certifierName,
              action,
              notes,
              batchOperation: true,
              timestamp: new Date()
            },
            createdAt: new Date()
          });

          results.push({
            documentId: docId,
            success: true,
            newStatus
          });
        }
      } catch (error) {
        results.push({
          documentId: docId,
          success: false,
          error: 'Error al procesar documento'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    res.json({
      success: true,
      message: `Acción aplicada a ${successCount} de ${documentIds.length} documentos`,
      results,
      summary: {
        total: documentIds.length,
        successful: successCount,
        failed: documentIds.length - successCount,
        action
      }
    });

  } catch (error) {
    console.error('Error en acción en lote:', error);
    res.status(500).json({
      success: false,
      error: 'Error al ejecutar acción en lote'
    });
  }
});

/**
 * GET /api/real-certifier/workload
 * Carga de trabajo real del certificador
 */
realCertifierRouter.get('/workload', async (req: Request, res: Response) => {
  try {
    const certifierId = req.user?.userId;
    const last30Days = subDays(new Date(), 30);

    // Carga de trabajo por día
    const dailyWorkload = await db
      .select({
        date: sql<string>`DATE(${analyticsEvents.createdAt})`,
        certifications: sql<number>`count(*)`
      })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.eventType, 'document_certified'),
          sql`${analyticsEvents.metadata}->>'certifierId' = ${certifierId.toString()}`,
          gte(analyticsEvents.createdAt, last30Days)
        )
      )
      .groupBy(sql`DATE(${analyticsEvents.createdAt})`)
      .orderBy(sql`DATE(${analyticsEvents.createdAt})`);

    // Promedio de certificaciones por día
    const avgCertificationsPerDay = dailyWorkload.length > 0 
      ? dailyWorkload.reduce((sum, day) => sum + (day.certifications || 0), 0) / dailyWorkload.length
      : 0;

    // Tipos de documentos más certificados
    const topDocumentTypes = await db
      .select({
        documentType: documents.documentType,
        count: sql<number>`count(*)`
      })
      .from(analyticsEvents)
      .leftJoin(documents, eq(analyticsEvents.documentId, documents.id))
      .where(
        and(
          eq(analyticsEvents.eventType, 'document_certified'),
          sql`${analyticsEvents.metadata}->>'certifierId' = ${certifierId.toString()}`,
          gte(analyticsEvents.createdAt, last30Days)
        )
      )
      .groupBy(documents.documentType)
      .orderBy(sql`count(*) DESC`)
      .limit(5);

    res.json({
      success: true,
      workload: {
        period: '30 días',
        averagePerDay: Math.round(avgCertificationsPerDay * 100) / 100,
        totalCertifications: dailyWorkload.reduce((sum, day) => sum + (day.certifications || 0), 0),
        activeDays: dailyWorkload.length,
        charts: {
          dailyWorkload,
          topDocumentTypes
        },
        certifier: {
          id: certifierId,
          name: req.user?.fullName
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo carga de trabajo:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener carga de trabajo'
    });
  }
});

export { realCertifierRouter };