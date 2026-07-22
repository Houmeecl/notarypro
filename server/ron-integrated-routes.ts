/**
 * RUTAS RON INTEGRADAS CON VISTA PRELIMINAR
 * Sistema completo que combina videollamada, documento y firma
 */

import express, { Request, Response } from 'express';
import { 
  createDocumentFromTemplate,
  processCanvasSignature,
  getDocumentStatus
} from './services/identity-verification-complete';
import { authenticateJWT, requireRole } from './services/jwt-auth-service';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { users, documents, analyticsEvents } from '@shared/schema';

const ronIntegratedRouter = express.Router();

/**
 * GET /api/ron-integrated/session/:sessionId/full-data
 * Obtener datos completos de sesión RON (video + documento + estado)
 */
ronIntegratedRouter.get('/session/:sessionId/full-data', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId!;
    const userRole = req.user?.role || 'client';

    // Obtener información del usuario
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Simular datos de sesión RON completa
    const sessionData = {
      sessionId,
      roomName: `ron-${sessionId.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      participants: {
        certifier: { 
          name: 'Juan Certificador', 
          connected: true,
          id: userRole.includes('certifier') ? userId : 1
        },
        client: { 
          name: user.fullName, 
          connected: true,
          id: userId
        }
      },
      document: {
        id: `doc-${sessionId}`,
        title: 'Contrato de Servicios Notariales RON',
        status: 'preview',
        previewUrl: `/api/ron-integrated/document/doc-${sessionId}/preview`,
        signatureToken: `token-${sessionId}-${Date.now()}`,
        content: generateDocumentContent(user, sessionId)
      },
      jitsiConfig: {
        domain: process.env.JITSI_DOMAIN || 'meet.jit.si',
        roomName: `ron-${sessionId.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        userName: `${user.fullName} (${userRole.includes('certifier') ? 'Certificador' : 'Cliente'})`,
        userEmail: user.email,
        isModerator: userRole.includes('certifier') || userRole.includes('admin')
      },
      status: 'document_review',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Registrar acceso a sesión
    await db.insert(analyticsEvents).values({
      eventType: 'ron_session_accessed',
      userId,
      metadata: {
        sessionId,
        userRole,
        timestamp: new Date()
      },
      createdAt: new Date()
    });

    res.json({
      success: true,
      session: sessionData
    });

  } catch (error) {
    console.error('Error obteniendo datos de sesión RON:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener datos de sesión'
    });
  }
});

/**
 * POST /api/ron-integrated/session/:sessionId/create-document
 * Crear documento durante sesión RON
 */
ronIntegratedRouter.post('/session/:sessionId/create-document', 
  authenticateJWT, 
  requireRole(['certifier', 'admin', 'notary']),
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { clientId, documentData } = req.body;
      const certifierId = req.user?.userId!;

      if (!clientId || !documentData) {
        return res.status(400).json({
          success: false,
          error: 'clientId y documentData son requeridos'
        });
      }

      // Crear documento integrado en sesión RON
      const result = await createDocumentFromTemplate(
        1, // templateId por defecto
        clientId,
        certifierId,
        {
          title: documentData.title || `Documento RON - ${sessionId}`,
          variables: {
            ...documentData.variables,
            sessionId,
            fechaSesion: new Date().toLocaleDateString('es-CL'),
            horaSesion: new Date().toLocaleTimeString('es-CL')
          }
        }
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Registrar creación en sesión RON
      await db.insert(analyticsEvents).values({
        eventType: 'ron_document_created',
        userId: certifierId,
        metadata: {
          sessionId,
          documentId: result.documentId,
          clientId,
          timestamp: new Date()
        },
        createdAt: new Date()
      });

      res.status(201).json({
        success: true,
        message: 'Documento creado en sesión RON',
        document: {
          id: result.documentId,
          sessionId,
          previewUrl: result.previewUrl,
          signatureToken: result.signatureToken,
          status: 'preview',
          createdAt: new Date()
        }
      });

    } catch (error) {
      console.error('Error creando documento en sesión RON:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear documento'
      });
    }
  }
);

/**
 * POST /api/ron-integrated/session/:sessionId/sign-document
 * Firmar documento durante sesión RON
 */
ronIntegratedRouter.post('/session/:sessionId/sign-document', 
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { 
        documentId,
        signatureToken,
        signatureImage,
        signerInfo = {}
      } = req.body;
      const userId = req.user?.userId!;
      const userRole = req.user?.role || 'client';

      if (!documentId || !signatureToken || !signatureImage) {
        return res.status(400).json({
          success: false,
          error: 'documentId, signatureToken y signatureImage son requeridos'
        });
      }

      // Procesar firma en contexto RON
      const result = await processCanvasSignature(
        documentId,
        signatureToken,
        {
          signatureImage,
          signerType: userRole.includes('certifier') ? 'certifier' : 'client',
          signerInfo: {
            ...signerInfo,
            userId,
            sessionId,
            signedInRonSession: true
          },
          metadata: {
            sessionId,
            signedDuringVideoCall: true,
            browser: req.get('User-Agent'),
            timestamp: new Date()
          }
        },
        {
          ip: req.ip,
          userAgent: req.get('User-Agent')
        }
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Registrar firma en sesión RON
      await db.insert(analyticsEvents).values({
        eventType: 'ron_document_signed',
        userId,
        metadata: {
          sessionId,
          documentId,
          signatureId: result.signatureId,
          signerType: userRole.includes('certifier') ? 'certifier' : 'client',
          timestamp: new Date()
        },
        createdAt: new Date()
      });

      res.json({
        success: true,
        message: 'Documento firmado en sesión RON',
        signature: {
          id: result.signatureId,
          documentId,
          sessionId,
          signerType: userRole.includes('certifier') ? 'certifier' : 'client',
          signedAt: new Date()
        },
        document: {
          signed: result.documentSigned,
          downloadUrl: result.downloadUrl,
          status: result.documentSigned ? 'completed' : 'partially_signed'
        }
      });

    } catch (error) {
      console.error('Error firmando documento en sesión RON:', error);
      res.status(500).json({
        success: false,
        error: 'Error al firmar documento'
      });
    }
  }
);

/**
 * POST /api/ron-integrated/session/:sessionId/status
 * Cambiar estado de sesión RON
 */
ronIntegratedRouter.post('/session/:sessionId/status', 
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { status } = req.body;
      const userId = req.user?.userId!;

      const validStatuses = [
        'waiting',
        'identity_verification', 
        'document_review',
        'signing',
        'completed'
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Estado no válido'
        });
      }

      // Registrar cambio de estado
      await db.insert(analyticsEvents).values({
        eventType: 'ron_session_status_changed',
        userId,
        metadata: {
          sessionId,
          newStatus: status,
          previousStatus: 'document_review', // En implementación real, obtener de BD
          timestamp: new Date()
        },
        createdAt: new Date()
      });

      res.json({
        success: true,
        message: `Estado de sesión RON cambiado a ${status}`,
        session: {
          id: sessionId,
          status,
          updatedAt: new Date(),
          updatedBy: userId
        }
      });

    } catch (error) {
      console.error('Error cambiando estado de sesión RON:', error);
      res.status(500).json({
        success: false,
        error: 'Error al cambiar estado'
      });
    }
  }
);

/**
 * GET /api/ron-integrated/session/:sessionId/chat-history
 * Obtener historial de chat de sesión RON
 */
ronIntegratedRouter.get('/session/:sessionId/chat-history', 
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      
      // Simular historial de chat
      const chatHistory = [
        {
          id: '1',
          sender: 'Sistema RON',
          senderType: 'system',
          message: `Sesión RON iniciada - ${sessionId}`,
          timestamp: new Date(Date.now() - 300000), // 5 minutos atrás
          type: 'action'
        },
        {
          id: '2',
          sender: 'Sistema RON',
          senderType: 'system',
          message: 'Bienvenidos a la sesión de notarización remota online',
          timestamp: new Date(Date.now() - 280000),
          type: 'action'
        },
        {
          id: '3',
          sender: 'Juan Certificador',
          senderType: 'certifier',
          message: 'Buenos días, procedamos con la revisión del documento',
          timestamp: new Date(Date.now() - 240000),
          type: 'text'
        }
      ];

      res.json({
        success: true,
        chatHistory,
        sessionId,
        totalMessages: chatHistory.length
      });

    } catch (error) {
      console.error('Error obteniendo historial de chat:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener historial'
      });
    }
  }
);

/**
 * POST /api/ron-integrated/session/:sessionId/send-message
 * Enviar mensaje en chat de sesión RON
 */
ronIntegratedRouter.post('/session/:sessionId/send-message', 
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { message, messageType = 'text' } = req.body;
      const userId = req.user?.userId!;
      const userName = req.user?.fullName || 'Usuario';
      const userRole = req.user?.role || 'client';

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Mensaje es requerido'
        });
      }

      const chatMessage = {
        id: Date.now().toString(),
        sender: userName,
        senderType: userRole.includes('certifier') ? 'certifier' : 'client',
        message: message.trim(),
        timestamp: new Date(),
        type: messageType,
        sessionId,
        userId
      };

      // Registrar mensaje en analytics
      await db.insert(analyticsEvents).values({
        eventType: 'ron_chat_message_sent',
        userId,
        metadata: {
          sessionId,
          messageType,
          messageLength: message.length,
          timestamp: new Date()
        },
        createdAt: new Date()
      });

      // En implementación real, enviar por WebSocket a otros participantes
      console.log('Mensaje RON enviado:', chatMessage);

      res.json({
        success: true,
        message: 'Mensaje enviado en sesión RON',
        chatMessage
      });

    } catch (error) {
      console.error('Error enviando mensaje en sesión RON:', error);
      res.status(500).json({
        success: false,
        error: 'Error al enviar mensaje'
      });
    }
  }
);

/**
 * GET /api/ron-integrated/session/:sessionId/recording-info
 * Obtener información de grabación de sesión RON
 */
ronIntegratedRouter.get('/session/:sessionId/recording-info', 
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      
      // Simular información de grabación
      const recordingInfo = {
        sessionId,
        isRecording: true,
        recordingStarted: new Date(Date.now() - 600000), // 10 minutos atrás
        recordingDuration: '00:10:33',
        recordingSize: '45.2 MB',
        recordingFormat: 'MP4',
        recordingQuality: 'HD 720p',
        recordingUrl: `/api/ron-integrated/session/${sessionId}/download-recording`,
        legalNotice: 'Esta sesión está siendo grabada para fines legales y de auditoría conforme a la Ley 19.799 sobre Documentos Electrónicos.',
        retentionPeriod: '7 años',
        accessLevel: 'Restringido a participantes y autoridades competentes'
      };

      res.json({
        success: true,
        recording: recordingInfo
      });

    } catch (error) {
      console.error('Error obteniendo información de grabación:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener información de grabación'
      });
    }
  }
);

// Función auxiliar para generar contenido de documento
function generateDocumentContent(user: any, sessionId: string): string {
  const currentDate = new Date();
  
  return `
CONTRATO DE PRESTACIÓN DE SERVICIOS NOTARIALES RON

En Santiago, a ${currentDate.toLocaleDateString('es-CL')}, durante sesión RON ID: ${sessionId}, comparecen:

POR UNA PARTE: ${user.fullName}, cédula de identidad N° 12.345.678-9, 
domiciliado en Av. Providencia 1234, Santiago, en adelante "EL CLIENTE".

POR OTRA PARTE: Juan Certificador, cédula de identidad N° 11.111.111-1,
Notario Público certificado, en adelante "EL CERTIFICADOR".

OBJETO DEL CONTRATO:
Prestación de servicios de notarización remota online (RON) para la certificación 
de documentos digitales conforme a la Ley 19.799 sobre Documentos Electrónicos 
y normativa vigente sobre notarización remota.

CONDICIONES ESPECÍFICAS RON:
1. El servicio se presta mediante videollamada en tiempo real usando Jitsi Meet
2. Se ha verificado previamente la identidad del cliente mediante documentos oficiales
3. La presente sesión RON está siendo grabada para efectos de auditoría y validez legal
4. El documento será firmado digitalmente por ambas partes durante esta videollamada
5. La sesión cumple con todos los requisitos técnicos y legales para RON

ASPECTOS TÉCNICOS:
- Plataforma de videollamada: Jitsi Meet (encriptación end-to-end)
- Sesión ID: ${sessionId}
- Fecha y hora de inicio: ${currentDate.toLocaleString('es-CL')}
- Participantes verificados: Cliente y Certificador
- Grabación: Activa para validez legal

VALOR:
El valor de los servicios prestados asciende a $50.000 pesos chilenos.

VIGENCIA:
El presente contrato tendrá vigencia inmediata una vez firmado digitalmente 
por ambas partes durante esta sesión RON.

DECLARACIONES:
Las partes declaran:
- Haber verificado sus identidades mediante documentos oficiales
- Estar participando voluntariamente en esta sesión RON
- Comprender que la sesión está siendo grabada
- Aceptar la validez legal de las firmas digitales
- Haber leído y comprendido el presente contrato

En fe de lo cual, firman digitalmente durante la sesión RON:

________________________                    ________________________
${user.fullName}                            Juan Certificador
EL CLIENTE                                  EL CERTIFICADOR
Sesión RON: ${sessionId}                    Notario Público
Fecha: ${currentDate.toLocaleString('es-CL')}
  `;
}

export { ronIntegratedRouter };