/**
 * RUTAS API PARA VERIFICACIÓN DE IDENTIDAD COMPLETA
 * Sistema de verificación, creación de documentos, firma y envío
 */

import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import {
  startIdentityVerification,
  processVerificationImage,
  completeIdentityVerification,
  createDocumentFromTemplate,
  sendDocumentPreview,
  processCanvasSignature,
  getDocumentStatus
} from './services/identity-verification-complete';
import { authenticateJWT, requireRole } from './services/jwt-auth-service';

const identityVerificationRouter = express.Router();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'identity');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG)'));
    }
  }
});

/**
 * POST /api/identity/start-verification
 * Iniciar proceso de verificación de identidad
 */
identityVerificationRouter.post('/start-verification', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const { verificationType = 'cedula', documentId } = req.body;
    const userId = req.user?.userId!;

    const result = await startIdentityVerification(userId, verificationType, documentId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json({
      success: true,
      message: 'Verificación de identidad iniciada',
      verification: {
        id: result.verificationId,
        type: verificationType,
        uploadUrls: result.uploadUrls,
        instructions: result.instructions,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

  } catch (error) {
    console.error('Error iniciando verificación:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/identity/upload/:verificationId/:imageType
 * Subir imagen para verificación (front, back, selfie)
 */
identityVerificationRouter.post('/upload/:verificationId/:imageType', 
  authenticateJWT,
  upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      const { verificationId, imageType } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No se recibió ninguna imagen'
        });
      }

      if (!['front', 'back', 'selfie'].includes(imageType)) {
        return res.status(400).json({
          success: false,
          error: 'Tipo de imagen inválido'
        });
      }

      const result = await processVerificationImage(
        verificationId,
        imageType as 'front' | 'back' | 'selfie',
        req.file.path
      );

      if (!result.success) {
        // Eliminar archivo si el procesamiento falló
        await fs.unlink(req.file.path).catch(() => {});
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message: `Imagen ${imageType} procesada correctamente`,
        analysis: result.analysis,
        nextStep: result.nextStep,
        imageProcessed: {
          type: imageType,
          filename: req.file.filename,
          confidence: result.analysis?.confidence || 0
        }
      });

    } catch (error) {
      console.error('Error procesando imagen:', error);
      
      // Limpiar archivo en caso de error
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      
      res.status(500).json({
        success: false,
        error: 'Error procesando imagen'
      });
    }
  }
);

/**
 * GET /api/identity/verification/:verificationId/status
 * Obtener estado de verificación
 */
identityVerificationRouter.get('/verification/:verificationId/status', 
  authenticateJWT, 
  async (req: Request, res: Response) => {
    try {
      const { verificationId } = req.params;
      
      // Simular obtención de estado
      const status = {
        id: verificationId,
        status: 'completed',
        progress: 100,
        steps: {
          frontImage: { completed: true, confidence: 0.95 },
          backImage: { completed: true, confidence: 0.93 },
          selfie: { completed: true, confidence: 0.96 },
          analysis: { completed: true, score: 0.95 }
        },
        result: {
          verified: true,
          score: 0.95,
          documentType: 'cedula',
          extractedData: {
            fullName: 'Juan Pérez González',
            documentNumber: '12.345.678-9',
            dateOfBirth: '1985-03-15'
          }
        },
        completedAt: new Date()
      };

      res.json({
        success: true,
        verification: status
      });

    } catch (error) {
      console.error('Error obteniendo estado de verificación:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo estado de verificación'
      });
    }
  }
);

/**
 * POST /api/identity/create-document
 * Crear documento basado en template
 */
identityVerificationRouter.post('/create-document', 
  authenticateJWT, 
  requireRole(['certifier', 'admin', 'notary']),
  async (req: Request, res: Response) => {
    try {
      const { templateId = 1, clientId, documentData } = req.body;
      const certifierId = req.user?.userId!;

      if (!clientId || !documentData) {
        return res.status(400).json({
          success: false,
          error: 'clientId y documentData son requeridos'
        });
      }

      const result = await createDocumentFromTemplate(
        templateId,
        clientId,
        certifierId,
        documentData
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json({
        success: true,
        message: 'Documento creado exitosamente',
        document: {
          id: result.documentId,
          previewUrl: result.previewUrl,
          signatureToken: result.signatureToken,
          status: 'preview',
          createdAt: new Date()
        },
        nextSteps: [
          'Revisar documento generado',
          'Enviar vista preliminar al cliente',
          'Cliente firma el documento',
          'Certificador firma el documento',
          'Documento completado y enviado'
        ]
      });

    } catch (error) {
      console.error('Error creando documento:', error);
      res.status(500).json({
        success: false,
        error: 'Error creando documento'
      });
    }
  }
);

/**
 * POST /api/identity/send-preview/:documentId
 * Enviar vista preliminar al cliente
 */
identityVerificationRouter.post('/send-preview/:documentId', 
  authenticateJWT, 
  requireRole(['certifier', 'admin', 'notary']),
  async (req: Request, res: Response) => {
    try {
      const { documentId } = req.params;
      const { clientEmail } = req.body;
      const certifierName = req.user?.fullName || 'Certificador';

      if (!clientEmail) {
        return res.status(400).json({
          success: false,
          error: 'Email del cliente es requerido'
        });
      }

      const result = await sendDocumentPreview(documentId, clientEmail, certifierName);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message: 'Vista preliminar enviada exitosamente',
        preview: {
          documentId,
          sentTo: clientEmail,
          sentBy: certifierName,
          sentAt: new Date()
        }
      });

    } catch (error) {
      console.error('Error enviando vista preliminar:', error);
      res.status(500).json({
        success: false,
        error: 'Error enviando vista preliminar'
      });
    }
  }
);

/**
 * GET /api/identity/document/:documentId/preview
 * Ver vista preliminar de documento (sin autenticación para clientes)
 */
identityVerificationRouter.get('/document/:documentId/preview', async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { token } = req.query;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de acceso requerido'
      });
    }

    const result = await getDocumentStatus(documentId, token as string);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      document: result.document,
      signatures: result.signatures,
      canSign: result.canSign,
      previewData: {
        accessToken: token,
        signatureUrl: `/api/identity/sign-document/${documentId}`,
        downloadUrl: result.document?.status === 'completed' ? 
          `/api/identity/document/${documentId}/download?token=${token}` : null
      }
    });

  } catch (error) {
    console.error('Error obteniendo vista preliminar:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo vista preliminar'
    });
  }
});

/**
 * POST /api/identity/sign-document/:documentId
 * Firmar documento con canvas
 */
identityVerificationRouter.post('/sign-document/:documentId', async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { 
      signatureToken,
      signatureImage,
      signerType = 'client',
      signerInfo = {}
    } = req.body;

    if (!signatureToken || !signatureImage) {
      return res.status(400).json({
        success: false,
        error: 'Token de firma e imagen de firma son requeridos'
      });
    }

    const result = await processCanvasSignature(
      documentId,
      signatureToken,
      {
        signatureImage,
        signerType,
        signerInfo,
        metadata: {
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

    res.json({
      success: true,
      message: 'Documento firmado exitosamente',
      signature: {
        id: result.signatureId,
        documentId,
        signerType,
        signedAt: new Date()
      },
      document: {
        signed: result.documentSigned,
        downloadUrl: result.downloadUrl,
        status: result.documentSigned ? 'completed' : 'partially_signed'
      }
    });

  } catch (error) {
    console.error('Error procesando firma:', error);
    res.status(500).json({
      success: false,
      error: 'Error procesando firma'
    });
  }
});

/**
 * GET /api/identity/document/:documentId/download
 * Descargar documento firmado
 */
identityVerificationRouter.get('/document/:documentId/download', async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { token } = req.query;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de acceso requerido'
      });
    }

    const result = await getDocumentStatus(documentId, token as string);

    if (!result.success) {
      return res.status(400).json(result);
    }

    if (result.document?.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Documento no está completado aún'
      });
    }

    // Simular descarga de archivo
    const filename = `documento-${documentId}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    // En implementación real, enviar el archivo PDF
    res.json({
      success: true,
      message: 'Documento listo para descarga',
      download: {
        filename,
        documentId,
        downloadedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error descargando documento:', error);
    res.status(500).json({
      success: false,
      error: 'Error descargando documento'
    });
  }
});

/**
 * GET /api/identity/session/:sessionId/status
 * Estado de sesión colaborativa certificador-cliente
 */
identityVerificationRouter.get('/session/:sessionId/status', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    // Simular estado de sesión colaborativa
    const sessionStatus = {
      id: sessionId,
      status: 'active',
      participants: [
        {
          type: 'certifier',
          name: 'Juan Certificador',
          connected: true,
          role: 'moderator'
        },
        {
          type: 'client',
          name: 'María Cliente',
          connected: true,
          role: 'participant'
        }
      ],
      currentStep: 'document_review',
      steps: {
        identity_verification: { completed: true, timestamp: new Date() },
        document_creation: { completed: true, timestamp: new Date() },
        document_review: { active: true, timestamp: new Date() },
        client_signature: { pending: true },
        certifier_signature: { pending: true },
        completion: { pending: true }
      },
      documents: [
        {
          id: 'doc-123',
          title: 'Contrato de Servicios',
          status: 'pending_signature',
          previewUrl: '/api/identity/document/doc-123/preview'
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.json({
      success: true,
      session: sessionStatus
    });

  } catch (error) {
    console.error('Error obteniendo estado de sesión:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estado de sesión'
    });
  }
});

/**
 * POST /api/identity/session/:sessionId/action
 * Ejecutar acción en sesión colaborativa
 */
identityVerificationRouter.post('/session/:sessionId/action', 
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { action, data = {} } = req.body;
      const userId = req.user?.userId!;

      const validActions = [
        'start_document_review',
        'request_changes',
        'approve_document',
        'start_signature_process',
        'complete_signature',
        'finish_session'
      ];

      if (!validActions.includes(action)) {
        return res.status(400).json({
          success: false,
          error: 'Acción no válida'
        });
      }

      // Simular procesamiento de acción
      const actionResult = {
        sessionId,
        action,
        executedBy: userId,
        executedAt: new Date(),
        result: 'success',
        nextStep: getNextStep(action),
        data
      };

      res.json({
        success: true,
        message: `Acción ${action} ejecutada exitosamente`,
        action: actionResult
      });

    } catch (error) {
      console.error('Error ejecutando acción de sesión:', error);
      res.status(500).json({
        success: false,
        error: 'Error ejecutando acción'
      });
    }
  }
);

/**
 * GET /api/identity/templates
 * Obtener templates de documentos disponibles
 */
identityVerificationRouter.get('/templates', 
  authenticateJWT,
  requireRole(['certifier', 'admin', 'notary']),
  async (req: Request, res: Response) => {
    try {
      const templates = [
        {
          id: 1,
          name: 'Contrato de Servicios',
          description: 'Template para contratos de prestación de servicios',
          category: 'contratos',
          variables: [
            { name: 'nombreCliente', label: 'Nombre del Cliente', type: 'text', required: true },
            { name: 'cedulaCliente', label: 'Cédula del Cliente', type: 'text', required: true },
            { name: 'direccionCliente', label: 'Dirección del Cliente', type: 'text', required: true },
            { name: 'objetoContrato', label: 'Objeto del Contrato', type: 'textarea', required: true },
            { name: 'valor', label: 'Valor del Contrato', type: 'number', required: true },
            { name: 'fechaInicio', label: 'Fecha de Inicio', type: 'date', required: true },
            { name: 'fechaTermino', label: 'Fecha de Término', type: 'date', required: true }
          ],
          previewUrl: '/api/identity/templates/1/preview'
        },
        {
          id: 2,
          name: 'Poder Notarial',
          description: 'Template para poderes notariales generales',
          category: 'poderes',
          variables: [
            { name: 'nombrePoderdante', label: 'Nombre del Poderdante', type: 'text', required: true },
            { name: 'nombreApoderado', label: 'Nombre del Apoderado', type: 'text', required: true },
            { name: 'facultades', label: 'Facultades Otorgadas', type: 'textarea', required: true },
            { name: 'vigencia', label: 'Vigencia del Poder', type: 'text', required: true }
          ]
        },
        {
          id: 3,
          name: 'Declaración Jurada',
          description: 'Template para declaraciones juradas',
          category: 'declaraciones',
          variables: [
            { name: 'nombreDeclarante', label: 'Nombre del Declarante', type: 'text', required: true },
            { name: 'contenidoDeclaracion', label: 'Contenido de la Declaración', type: 'textarea', required: true },
            { name: 'proposito', label: 'Propósito de la Declaración', type: 'text', required: true }
          ]
        }
      ];

      res.json({
        success: true,
        templates,
        totalCount: templates.length,
        categories: ['contratos', 'poderes', 'declaraciones']
      });

    } catch (error) {
      console.error('Error obteniendo templates:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo templates'
      });
    }
  }
);

// Función auxiliar para determinar siguiente paso
function getNextStep(action: string): string {
  const nextSteps: Record<string, string> = {
    'start_document_review': 'document_review_in_progress',
    'request_changes': 'document_modification',
    'approve_document': 'signature_process',
    'start_signature_process': 'client_signature',
    'complete_signature': 'certifier_signature',
    'finish_session': 'completed'
  };

  return nextSteps[action] || 'unknown';
}

export { identityVerificationRouter };