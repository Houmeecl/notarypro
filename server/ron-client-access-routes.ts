/**
 * RUTAS DE ACCESO DE CLIENTE RON
 * Sistema completo para que clientes accedan a sesiones RON con códigos
 */

import express, { Request, Response } from 'express';
import { 
  generateRonClientCode,
  validateAndUseClientCode,
  getClientCodeInfo,
  getClientCodeDetails,
  getCertifierClientCodes,
  cleanupExpiredClientCodes,
  generateClientAccessPackage,
  generateCustomQRCode,
  getClientCodeStats
} from './services/ron-client-code-generator';
import { authenticateJWT, requireRole } from './services/jwt-auth-service';

const ronClientAccessRouter = express.Router();

/**
 * POST /api/ron-client/generate-access
 * Generar código de acceso para cliente RON
 */
ronClientAccessRouter.post('/generate-access', authenticateJWT, requireRole(['certifier', 'admin', 'notary']), async (req: Request, res: Response) => {
  try {
    const { sessionId, clientId, documentId, sessionType = 'jitsi', expirationHours = 24 } = req.body;
    const certifierId = req.user?.userId!;

    if (!sessionId || !clientId || !documentId) {
      return res.status(400).json({
        success: false,
        error: 'sessionId, clientId y documentId son requeridos'
      });
    }

    const accessPackage = await generateClientAccessPackage(
      sessionId,
      Number(clientId),
      Number(documentId),
      certifierId,
      sessionType
    );

    res.status(201).json({
      success: true,
      message: 'Código de acceso generado exitosamente',
      access: accessPackage,
      session: {
        id: sessionId,
        type: sessionType
      },
      usage: {
        sms: 'Enviar por SMS al cliente',
        email: 'Enviar por correo electrónico',
        whatsapp: 'Enviar por WhatsApp',
        qr: 'Mostrar código QR para escanear',
        direct: 'Compartir enlace directo'
      }
    });

  } catch (error) {
    console.error('Error generando código de acceso:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al generar código de acceso'
    });
  }
});

/**
 * GET /api/ron-client/access/:code
 * Validar y obtener información de código de acceso
 */
ronClientAccessRouter.get('/access/:code', async (req: Request, res: Response) => {
  try {
    const accessCode = req.params.code;
    const clientIP = req.ip || req.connection.remoteAddress;

    const result = await validateAndUseClientCode(accessCode, clientIP);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'Código de acceso válido',
      ...result.data,
      instructions: [
        'Su código de acceso es válido',
        'Será redirigido a la videollamada RON',
        'Asegúrese de tener cámara y micrófono funcionando',
        'La sesión será grabada para fines legales'
      ]
    });

  } catch (error) {
    console.error('Error validando código de acceso:', error);
    res.status(500).json({
      success: false,
      error: 'Error al validar código de acceso'
    });
  }
});

/**
 * GET /api/ron-client/code-info/:code
 * Obtener información de código sin marcarlo como usado
 */
ronClientAccessRouter.get('/code-info/:code', async (req: Request, res: Response) => {
  try {
    const accessCode = req.params.code;
    
    const codeDetails = await getClientCodeDetails(accessCode);

    if (!codeDetails.success) {
      return res.status(404).json(codeDetails);
    }

    res.json({
      success: true,
      code: {
        accessCode,
        status: codeDetails.data?.code.status,
        expiresAt: codeDetails.data?.code.expiresAt,
        sessionType: codeDetails.data?.code.metadata.sessionType,
        createdAt: codeDetails.data?.code.createdAt,
        usedAt: codeDetails.data?.code.usedAt
      },
      session: codeDetails.data?.session,
      document: codeDetails.data?.document,
      client: codeDetails.data?.client,
      certifier: codeDetails.data?.certifier
    });

  } catch (error) {
    console.error('Error obteniendo información del código:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener información del código'
    });
  }
});

/**
 * GET /api/ron-client/my-codes
 * Obtener códigos generados por el certificador
 */
ronClientAccessRouter.get('/my-codes', authenticateJWT, requireRole(['certifier', 'admin', 'notary']), async (req: Request, res: Response) => {
  try {
    const certifierId = req.user?.userId!;
    const { status = 'all', limit = 20 } = req.query;

    const codes = await getCertifierClientCodes(certifierId);

    // Filtrar por estado si se especifica
    const filteredCodes = status === 'all' ? 
      codes : 
      codes.filter(code => code.status === status);

    // Limitar resultados
    const limitedCodes = filteredCodes.slice(0, Number(limit));

    // Obtener estadísticas
    const stats = await getClientCodeStats(certifierId);

    res.json({
      success: true,
      codes: limitedCodes,
      stats,
      filters: {
        status,
        limit: Number(limit),
        total: filteredCodes.length
      }
    });

  } catch (error) {
    console.error('Error obteniendo códigos del certificador:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener códigos'
    });
  }
});

/**
 * POST /api/ron-client/send-access
 * Enviar código de acceso por diferentes medios
 */
ronClientAccessRouter.post('/send-access', authenticateJWT, requireRole(['certifier', 'admin', 'notary']), async (req: Request, res: Response) => {
  try {
    const { accessCode, method, recipient } = req.body;
    
    if (!accessCode || !method || !recipient) {
      return res.status(400).json({
        success: false,
        error: 'accessCode, method y recipient son requeridos'
      });
    }

    const codeInfo = getClientCodeInfo(accessCode);
    
    if (!codeInfo) {
      return res.status(404).json({
        success: false,
        error: 'Código de acceso no encontrado'
      });
    }

    // Simular envío (en implementación real, integrar con servicios de SMS/Email/WhatsApp)
    let sentMessage = '';
    
    switch (method) {
      case 'sms':
        // Aquí integrarías con servicio SMS real (Twilio, etc.)
        sentMessage = `SMS enviado a ${recipient}`;
        break;
      case 'email':
        // Aquí integrarías con servicio de email real (SendGrid, etc.)
        sentMessage = `Email enviado a ${recipient}`;
        break;
      case 'whatsapp':
        // Aquí integrarías con WhatsApp Business API
        sentMessage = `WhatsApp enviado a ${recipient}`;
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Método no válido. Use: sms, email, whatsapp'
        });
    }

    // Registrar envío
    await db.insert(analyticsEvents).values({
      eventType: 'ron_client_code_sent',
      userId: codeInfo.clientId,
      documentId: codeInfo.documentId,
      metadata: {
        accessCode,
        method,
        recipient,
        sessionId: codeInfo.sessionId,
        sentAt: new Date(),
        timestamp: new Date()
      },
      createdAt: new Date()
    });

    res.json({
      success: true,
      message: sentMessage,
      sent: {
        method,
        recipient,
        accessCode,
        sentAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error enviando código de acceso:', error);
    res.status(500).json({
      success: false,
      error: 'Error al enviar código de acceso'
    });
  }
});

/**
 * POST /api/ron-client/regenerate/:code
 * Regenerar código de acceso expirado
 */
ronClientAccessRouter.post('/regenerate/:code', authenticateJWT, requireRole(['certifier', 'admin', 'notary']), async (req: Request, res: Response) => {
  try {
    const oldAccessCode = req.params.code;
    const { expirationHours = 24 } = req.body;
    const certifierId = req.user?.userId!;

    const oldCode = getClientCodeInfo(oldAccessCode);
    
    if (!oldCode) {
      return res.status(404).json({
        success: false,
        error: 'Código original no encontrado'
      });
    }

    // Generar nuevo código
    const newAccessPackage = await generateClientAccessPackage(
      oldCode.sessionId,
      oldCode.clientId,
      oldCode.documentId,
      certifierId,
      oldCode.metadata.sessionType
    );

    // Marcar código anterior como expirado
    oldCode.status = 'expired';
    clientCodes.set(oldAccessCode, oldCode);

    res.json({
      success: true,
      message: 'Código regenerado exitosamente',
      newAccess: newAccessPackage,
      oldCode: {
        code: oldAccessCode,
        status: 'expired'
      }
    });

  } catch (error) {
    console.error('Error regenerando código:', error);
    res.status(500).json({
      success: false,
      error: 'Error al regenerar código'
    });
  }
});

/**
 * GET /api/ron-client/stats
 * Estadísticas de códigos de cliente
 */
ronClientAccessRouter.get('/stats', authenticateJWT, requireRole(['certifier', 'admin', 'notary']), async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId!;
    const isAdmin = req.user?.role === 'admin';

    const stats = await getClientCodeStats(isAdmin ? undefined : userId);

    // Limpiar códigos expirados
    const cleanedCount = cleanupExpiredClientCodes();

    res.json({
      success: true,
      stats: {
        ...stats,
        cleanedExpired: cleanedCount
      },
      scope: isAdmin ? 'global' : 'user',
      lastCleaned: new Date()
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    });
  }
});

/**
 * POST /api/ron-client/cleanup
 * Limpiar códigos expirados (solo admin)
 */
ronClientAccessRouter.post('/cleanup', authenticateJWT, requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const cleanedCount = cleanupExpiredClientCodes();

    res.json({
      success: true,
      message: `${cleanedCount} códigos expirados limpiados`,
      cleanedCodes: cleanedCount,
      cleanedAt: new Date()
    });

  } catch (error) {
    console.error('Error limpiando códigos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al limpiar códigos'
    });
  }
});

/**
 * GET /api/ron-client/qr/:code
 * Obtener código QR específico
 */
ronClientAccessRouter.get('/qr/:code', async (req: Request, res: Response) => {
  try {
    const accessCode = req.params.code;
    const { size = 300, format = 'png' } = req.query;

    const codeInfo = getClientCodeInfo(accessCode);
    
    if (!codeInfo) {
      return res.status(404).json({
        success: false,
        error: 'Código no encontrado'
      });
    }

    if (format === 'json') {
      // Devolver información del QR
      res.json({
        success: true,
        qr: {
          code: accessCode,
          dataUrl: codeInfo.qrCode,
          directUrl: codeInfo.directUrl,
          expiresAt: codeInfo.expiresAt,
          status: codeInfo.status
        }
      });
    } else {
      // Devolver imagen QR directamente
      const base64Data = codeInfo.qrCode.replace(/^data:image\/png;base64,/, '');
      const imgBuffer = Buffer.from(base64Data, 'base64');
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Length', imgBuffer.length);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(imgBuffer);
    }

  } catch (error) {
    console.error('Error obteniendo QR:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener código QR'
    });
  }
});

export { ronClientAccessRouter };