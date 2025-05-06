/**
 * Rutas para Documentos Seguros
 * 
 * Este módulo implementa los endpoints relacionados con el almacenamiento
 * seguro, firma electrónica avanzada y verificación de identidad para documentos.
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { db } from '../db';
import { documents, users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { electronicSignatureService, SignatureType, SignatureProvider } from '../services/advanced-signature';
import { secureStorageService, EncryptionType } from '../services/secure-storage';
import { identityVerificationService, VerificationType } from '../services/identity-verification';
import { qrVerificationService } from '../services/qr-verification';
import { auditLogService, AuditActionType, AuditSeverity } from '../services/audit-logger';

// Configuración de Multer para almacenamiento temporal de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'temp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

export const secureDocumentRouter = Router();

// Middleware para verificar autenticación
function isAuthenticated(req: Request, res: Response, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ success: false, message: 'No autenticado' });
}

/**
 * Iniciar verificación de identidad
 * POST /api/secure-documents/verify-identity
 */
secureDocumentRouter.post('/verify-identity', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { type = 'combined', provider } = req.body;
    const userId = req.user!.id;
    
    // Iniciar verificación de identidad
    const verificationResult = await identityVerificationService.initVerification(
      userId,
      type as VerificationType,
      provider
    );
    
    // Registrar acción en logs de auditoría
    await auditLogService.logIdentityAction(
      AuditActionType.IDENTITY_VERIFICATION_INITIATED,
      userId,
      {
        provider: verificationResult.provider,
        type,
        success: verificationResult.success
      },
      req
    );
    
    res.json(verificationResult);
    
  } catch (error) {
    console.error('Error al iniciar verificación de identidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar la verificación de identidad',
      error: error.message
    });
  }
});

/**
 * Verificar estado de verificación de identidad
 * GET /api/secure-documents/verify-identity/:verificationId
 */
secureDocumentRouter.get('/verify-identity/:verificationId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { verificationId } = req.params;
    const userId = req.user!.id;
    
    // Verificar estado
    const status = await identityVerificationService.checkVerificationStatus(verificationId);
    
    // Obtener detalles
    const details = await identityVerificationService.getVerificationDetails(verificationId);
    
    res.json({
      success: true,
      status,
      details
    });
    
  } catch (error) {
    console.error('Error al verificar estado de identidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar estado de identidad',
      error: error.message
    });
  }
});

/**
 * Iniciar firma electrónica avanzada
 * POST /api/secure-documents/sign/:documentId
 */
secureDocumentRouter.post('/sign/:documentId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { type = 'advanced', provider } = req.body;
    const userId = req.user!.id;
    
    // Verificar que el documento existe
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, parseInt(documentId)));
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }
    
    // Iniciar firma
    const signatureResult = await electronicSignatureService.initSignature(
      parseInt(documentId),
      userId,
      type as SignatureType,
      provider as SignatureProvider
    );
    
    // Registrar acción en logs de auditoría
    await auditLogService.logSignatureAction(
      AuditActionType.SIGNATURE_INITIATED,
      userId,
      parseInt(documentId),
      {
        provider: signatureResult.provider,
        type,
        success: signatureResult.success
      },
      req
    );
    
    res.json(signatureResult);
    
  } catch (error) {
    console.error('Error al iniciar firma electrónica:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar la firma electrónica',
      error: error.message
    });
  }
});

/**
 * Verificar estado de firma
 * GET /api/secure-documents/sign/:signatureId
 */
secureDocumentRouter.get('/sign/:signatureId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { signatureId } = req.params;
    
    // Verificar estado
    const status = await electronicSignatureService.checkSignatureStatus(signatureId);
    
    // Obtener detalles
    const details = await electronicSignatureService.getSignatureDetails(signatureId);
    
    res.json({
      success: true,
      status,
      details
    });
    
  } catch (error) {
    console.error('Error al verificar estado de firma:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar estado de firma',
      error: error.message
    });
  }
});

/**
 * Completar firma con eToken
 * POST /api/secure-documents/sign/:signatureId/complete-etoken
 */
secureDocumentRouter.post('/sign/:signatureId/complete-etoken', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { signatureId } = req.params;
    const { certificate, timestamp, signature } = req.body;
    const userId = req.user!.id;
    
    if (!certificate || !timestamp || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos para completar la firma'
      });
    }
    
    // Completar firma
    const status = await electronicSignatureService.completeETokenSignature(
      signatureId,
      { certificate, timestamp, signature }
    );
    
    // Obtener detalles de la firma para el registro de auditoría
    const details = await electronicSignatureService.getSignatureDetails(signatureId);
    const [docSignature] = await db
      .select()
      .from(documentSignatures)
      .where(eq(documentSignatures.signatureId, signatureId));
    
    const documentId = docSignature ? docSignature.documentId : null;
    
    // Registrar acción en logs de auditoría
    if (documentId) {
      await auditLogService.logSignatureAction(
        AuditActionType.SIGNATURE_COMPLETED,
        userId,
        documentId,
        {
          signatureId,
          provider: SignatureProvider.ETOKEN,
          status
        },
        req
      );
    }
    
    res.json({
      success: true,
      status,
      details
    });
    
  } catch (error) {
    console.error('Error al completar firma con eToken:', error);
    res.status(500).json({
      success: false,
      message: 'Error al completar firma con eToken',
      error: error.message
    });
  }
});

/**
 * Completar firma simple
 * POST /api/secure-documents/sign/:signatureId/complete-simple
 */
secureDocumentRouter.post('/sign/:signatureId/complete-simple', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { signatureId } = req.params;
    const { signatureImageData } = req.body;
    const userId = req.user!.id;
    
    if (!signatureImageData) {
      return res.status(400).json({
        success: false,
        message: 'Falta imagen de firma para completar'
      });
    }
    
    // Completar firma
    const status = await electronicSignatureService.completeSimpleSignature(
      signatureId,
      signatureImageData
    );
    
    // Obtener detalles para registro de auditoría
    const details = await electronicSignatureService.getSignatureDetails(signatureId);
    const [docSignature] = await db
      .select()
      .from(documentSignatures)
      .where(eq(documentSignatures.signatureId, signatureId));
    
    const documentId = docSignature ? docSignature.documentId : null;
    
    // Registrar acción en logs de auditoría
    if (documentId) {
      await auditLogService.logSignatureAction(
        AuditActionType.SIGNATURE_COMPLETED,
        userId,
        documentId,
        {
          signatureId,
          provider: SignatureProvider.SIMPLE,
          status
        },
        req
      );
    }
    
    res.json({
      success: true,
      status,
      details
    });
    
  } catch (error) {
    console.error('Error al completar firma simple:', error);
    res.status(500).json({
      success: false,
      message: 'Error al completar firma simple',
      error: error.message
    });
  }
});

/**
 * Almacenar documento de forma segura
 * POST /api/secure-documents/store/:documentId
 */
secureDocumentRouter.post('/store/:documentId', isAuthenticated, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { metadata = '{}', encryptionType = 'aes-256-gcm' } = req.body;
    const userId = req.user!.id;
    
    // Verificar que el documento existe
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, parseInt(documentId)));
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }
    
    let documentData: Buffer;
    
    // Si se adjuntó un archivo, usar ese
    if (req.file) {
      documentData = fs.readFileSync(req.file.path);
    } 
    // Si no, usar el contenido del documento
    else if (document.content) {
      documentData = Buffer.from(document.content);
    }
    // Si no hay contenido, error
    else {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó un archivo y el documento no tiene contenido'
      });
    }
    
    // Parsear metadatos
    let parsedMetadata: Record<string, any>;
    try {
      parsedMetadata = JSON.parse(metadata);
    } catch {
      parsedMetadata = {};
    }
    
    // Incluir información del usuario y documento en metadatos
    parsedMetadata = {
      ...parsedMetadata,
      documentId: parseInt(documentId),
      userId,
      documentTitle: document.title,
      storedAt: new Date().toISOString()
    };
    
    // Almacenar documento
    const storageResult = await secureStorageService.storeDocument(
      parseInt(documentId),
      documentData,
      parsedMetadata,
      { encryptionType: encryptionType as EncryptionType }
    );
    
    // Limpiar archivo temporal si existe
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    // Registrar acción en logs de auditoría
    await auditLogService.logDocumentAction(
      AuditActionType.DOCUMENT_STORED,
      parseInt(documentId),
      userId,
      {
        storageId: storageResult.storageId,
        provider: storageResult.provider,
        encryptionType: storageResult.encryptionType,
        success: storageResult.success
      },
      req
    );
    
    res.json(storageResult);
    
  } catch (error) {
    console.error('Error al almacenar documento:', error);
    
    // Limpiar archivo temporal si existe
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al almacenar documento',
      error: error.message
    });
  }
});

/**
 * Recuperar documento almacenado
 * GET /api/secure-documents/retrieve/:storageId
 */
secureDocumentRouter.get('/retrieve/:storageId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { storageId } = req.params;
    const { decrypt = 'true' } = req.query;
    const userId = req.user!.id;
    
    // Recuperar documento
    const { data, metadata } = await secureStorageService.retrieveDocument(
      storageId,
      { decrypt: decrypt === 'true' }
    );
    
    // Registrar acción en logs de auditoría
    await auditLogService.logDocumentAction(
      AuditActionType.DOCUMENT_DOWNLOADED,
      metadata.documentId,
      userId,
      {
        storageId,
        decrypt: decrypt === 'true'
      },
      req
    );
    
    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${metadata.documentTitle || 'document'}.pdf"`);
    res.setHeader('Content-Length', data.length);
    
    // Enviar documento
    res.send(data);
    
  } catch (error) {
    console.error('Error al recuperar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al recuperar documento',
      error: error.message
    });
  }
});

/**
 * Generar URL de acceso temporal
 * GET /api/secure-documents/presigned-url/:storageId
 */
secureDocumentRouter.get('/presigned-url/:storageId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { storageId } = req.params;
    const { expiresIn = '3600' } = req.query;
    
    // Generar URL temporal
    const url = await secureStorageService.generatePresignedUrl(
      storageId,
      parseInt(expiresIn as string)
    );
    
    res.json({
      success: true,
      url,
      expiresIn: parseInt(expiresIn as string)
    });
    
  } catch (error) {
    console.error('Error al generar URL temporal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar URL temporal',
      error: error.message
    });
  }
});

/**
 * Verificar integridad de documento
 * GET /api/secure-documents/verify-integrity/:storageId
 */
secureDocumentRouter.get('/verify-integrity/:storageId', async (req: Request, res: Response) => {
  try {
    const { storageId } = req.params;
    
    // Verificar integridad
    const verificationResult = await secureStorageService.verifyDocumentIntegrity(storageId);
    
    res.json(verificationResult);
    
  } catch (error) {
    console.error('Error al verificar integridad del documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar integridad del documento',
      error: error.message
    });
  }
});

/**
 * Generar código QR para verificación de documento
 * POST /api/secure-documents/generate-qr/:documentId
 */
secureDocumentRouter.post('/generate-qr/:documentId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { type = 'document', includeSignatures = false, expiresInDays = 365, size = 200 } = req.body;
    const userId = req.user!.id;
    
    let qrResult;
    
    if (type === 'document') {
      // QR para verificación de documento
      qrResult = await qrVerificationService.generateDocumentVerificationQR(
        parseInt(documentId),
        {
          includeSignatures,
          expiresInDays,
          size
        }
      );
    } else if (type === 'mobile') {
      // QR para firma desde móvil
      qrResult = await qrVerificationService.generateMobileSigningQR(
        parseInt(documentId),
        userId,
        {
          expiresInHours: 24,
          size
        }
      );
    } else if (type === 'signature' && req.body.signatureId) {
      // QR para verificación de firma
      qrResult = await qrVerificationService.generateSignatureVerificationQR(
        req.body.signatureId,
        {
          expiresInDays,
          size
        }
      );
    } else {
      return res.status(400).json({
        success: false,
        message: 'Tipo de QR no válido'
      });
    }
    
    // Registrar acción en logs de auditoría
    await auditLogService.logDocumentAction(
      AuditActionType.DOCUMENT_VERIFIED,
      parseInt(documentId),
      userId,
      {
        qrType: type,
        qrCodeId: qrResult.qrCodeId,
        success: qrResult.success
      },
      req
    );
    
    res.json(qrResult);
    
  } catch (error) {
    console.error('Error al generar código QR:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar código QR',
      error: error.message
    });
  }
});

/**
 * Verificar código QR
 * GET /api/secure-documents/verify-qr/:code
 */
secureDocumentRouter.get('/verify-qr/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    
    // Verificar código
    const verificationResult = await qrVerificationService.verifyCode(code);
    
    // Si hay un usuario autenticado, registrar acción
    if (req.isAuthenticated() && verificationResult.isValid && verificationResult.documentId) {
      await auditLogService.logDocumentAction(
        AuditActionType.DOCUMENT_VERIFIED,
        verificationResult.documentId,
        req.user!.id,
        {
          verificationCode: code,
          qrCodeType: verificationResult.qrCodeType,
          success: verificationResult.isValid
        },
        req
      );
    }
    
    res.json(verificationResult);
    
  } catch (error) {
    console.error('Error al verificar código QR:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar código QR',
      error: error.message
    });
  }
});