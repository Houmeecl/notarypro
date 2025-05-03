import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { identity_verifications, type IdentityVerification } from '@shared/schema';
import jwt from 'jsonwebtoken';

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'identity');
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Permitir solo imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  }
});

export const identityApiRouter = Router();

// Verificar API key
function validateApiKey(req: Request, res: Response, next: any) {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key no proporcionada',
      code: 'MISSING_API_KEY'
    });
  }

  // En producción, validar contra base de datos
  // Por ahora, usamos una clave de ejemplo
  if (apiKey !== process.env.NOTARYPRO_API_KEY && apiKey !== 'test_api_key_notarypro_identity') {
    return res.status(403).json({
      success: false,
      error: 'API key inválida',
      code: 'INVALID_API_KEY'
    });
  }
  
  next();
}

// Verificar token de identidad
function validateIdentityToken(req: Request, res: Response, next: any) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token de identidad no proporcionado',
      code: 'MISSING_TOKEN'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'notarypro_identity_secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Token de identidad inválido',
      code: 'INVALID_TOKEN'
    });
  }
}

/**
 * @route POST /api/identity-api/create-session
 * @description Crea una nueva sesión de verificación de identidad
 * @access Privado (requiere API key)
 */
identityApiRouter.post('/create-session', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { 
      callbackUrl, 
      userData, 
      requiredVerifications = ['document', 'facial', 'nfc'],
      customBranding = {}
    } = req.body;
    
    if (!callbackUrl) {
      return res.status(400).json({
        success: false,
        error: 'URL de callback es requerida',
        code: 'MISSING_CALLBACK_URL'
      });
    }
    
    // Generar ID único para esta sesión
    const sessionId = uuidv4();
    
    // Crear token JWT para esta sesión
    const token = jwt.sign(
      { 
        sessionId, 
        userData,
        requiredVerifications,
        callbackUrl 
      }, 
      process.env.JWT_SECRET || 'notarypro_identity_secret',
      { expiresIn: '1h' }
    );
    
    // Almacenar sesión en la base de datos
    await db.insert(identity_verifications).values({
      sessionId,
      status: 'pending',
      requiredVerifications: JSON.stringify(requiredVerifications),
      userData: userData ? JSON.stringify(userData) : null,
      callbackUrl,
      customBranding: customBranding ? JSON.stringify(customBranding) : null,
      createdAt: new Date(),
    });
    
    // Generar URL para verificación
    const verificationUrl = `${process.env.APP_URL || 'https://notarypro.cl'}/identity-verification/${sessionId}?token=${token}`;
    
    // Devolver datos de sesión
    return res.status(201).json({
      success: true,
      data: {
        sessionId,
        token,
        verificationUrl,
        expiresIn: 3600, // 1 hora en segundos
      }
    });
  } catch (error) {
    console.error('Error al crear sesión de verificación:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al crear sesión de verificación',
      code: 'SESSION_CREATION_ERROR'
    });
  }
});

/**
 * @route GET /api/identity-api/session/:sessionId
 * @description Obtiene el estado de una sesión de verificación
 * @access Privado (requiere API key)
 */
identityApiRouter.get('/session/:sessionId', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    // Buscar sesión en la base de datos
    const [session] = await db
      .select()
      .from(identity_verifications)
      .where(eq(identity_verifications.sessionId, sessionId));
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Sesión no encontrada',
        code: 'SESSION_NOT_FOUND'
      });
    }
    
    // Devolver estado de sesión
    return res.status(200).json({
      success: true,
      data: {
        sessionId: session.sessionId,
        status: session.status,
        requiredVerifications: JSON.parse(session.requiredVerifications as string),
        completedVerifications: session.completedVerifications ? JSON.parse(session.completedVerifications as string) : [],
        verificationResult: session.verificationResult ? JSON.parse(session.verificationResult as string) : null,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }
    });
  } catch (error) {
    console.error('Error al obtener sesión de verificación:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener sesión de verificación',
      code: 'SESSION_FETCH_ERROR'
    });
  }
});

/**
 * @route POST /api/identity-api/verify/document
 * @description Verifica un documento de identidad subido
 * @access Privado (requiere token de identidad)
 */
identityApiRouter.post('/verify/document', validateIdentityToken, upload.single('document'), async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.user;
    const documentFile = req.file;
    
    if (!documentFile) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó imagen del documento',
        code: 'MISSING_DOCUMENT'
      });
    }
    
    // Aquí iría la lógica real de verificación del documento
    // Por ejemplo, llamar a un servicio externo, OCR, etc.
    // Por ahora, simulamos una verificación exitosa:
    
    const documentData = {
      documentType: 'ID_CARD', // o PASSPORT, DRIVER_LICENSE, etc.
      documentNumber: 'XXXX-XXXX-XX',
      fullName: 'Juan Ejemplo',
      dateOfBirth: '01/01/1990',
      expiryDate: '01/01/2030',
      nationality: 'CL',
      documentImagePath: documentFile.path,
      verificationScore: 0.95
    };
    
    // Actualizar estado de verificación en la base de datos
    const [session] = await db
      .select()
      .from(identity_verifications)
      .where(eq(identity_verifications.sessionId, sessionId));
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Sesión no encontrada',
        code: 'SESSION_NOT_FOUND'
      });
    }
    
    const completedVerifications = session.completedVerifications 
      ? JSON.parse(session.completedVerifications as string) 
      : [];
    
    completedVerifications.push('document');
    
    await db
      .update(identity_verifications)
      .set({
        completedVerifications: JSON.stringify(completedVerifications),
        documentData: JSON.stringify(documentData),
        updatedAt: new Date()
      })
      .where(eq(identity_verifications.sessionId, sessionId));
    
    return res.status(200).json({
      success: true,
      data: {
        verificationId: uuidv4(),
        verificationType: 'document',
        verificationScore: documentData.verificationScore,
        documentData
      }
    });
  } catch (error) {
    console.error('Error en verificación de documento:', error);
    return res.status(500).json({
      success: false,
      error: 'Error en la verificación de documento',
      code: 'DOCUMENT_VERIFICATION_ERROR'
    });
  }
});

/**
 * @route POST /api/identity-api/verify/facial
 * @description Verifica la identidad facial
 * @access Privado (requiere token de identidad)
 */
identityApiRouter.post('/verify/facial', validateIdentityToken, upload.single('selfie'), async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.user;
    const selfieFile = req.file;
    
    if (!selfieFile) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó imagen de selfie',
        code: 'MISSING_SELFIE'
      });
    }
    
    // Aquí iría la lógica real de verificación facial
    // Por ejemplo, comparación con la foto del documento,
    // detección de vida (liveness), etc.
    // Por ahora, simulamos una verificación exitosa:
    
    const facialData = {
      livenessPassed: true,
      matchWithDocument: true,
      selfieImagePath: selfieFile.path,
      verificationScore: 0.92
    };
    
    // Actualizar estado de verificación en la base de datos
    const [session] = await db
      .select()
      .from(identity_verifications)
      .where(eq(identity_verifications.sessionId, sessionId));
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Sesión no encontrada',
        code: 'SESSION_NOT_FOUND'
      });
    }
    
    const completedVerifications = session.completedVerifications 
      ? JSON.parse(session.completedVerifications as string) 
      : [];
    
    completedVerifications.push('facial');
    
    await db
      .update(identity_verifications)
      .set({
        completedVerifications: JSON.stringify(completedVerifications),
        facialData: JSON.stringify(facialData),
        updatedAt: new Date()
      })
      .where(eq(identity_verifications.sessionId, sessionId));
    
    return res.status(200).json({
      success: true,
      data: {
        verificationId: uuidv4(),
        verificationType: 'facial',
        verificationScore: facialData.verificationScore,
        facialData
      }
    });
  } catch (error) {
    console.error('Error en verificación facial:', error);
    return res.status(500).json({
      success: false,
      error: 'Error en la verificación facial',
      code: 'FACIAL_VERIFICATION_ERROR'
    });
  }
});

/**
 * @route POST /api/identity-api/verify/nfc
 * @description Verifica la identidad mediante NFC
 * @access Privado (requiere token de identidad)
 */
identityApiRouter.post('/verify/nfc', validateIdentityToken, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.user;
    const { nfcData } = req.body;
    
    if (!nfcData) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron datos NFC',
        code: 'MISSING_NFC_DATA'
      });
    }
    
    // Aquí iría la lógica real de verificación NFC
    // Por ejemplo, verificar la autenticidad de los datos leídos del chip NFC
    // Por ahora, simulamos una verificación exitosa:
    
    const nfcVerificationData = {
      chipAuthenticated: true,
      dataAuthenticity: true,
      documentNumber: nfcData.documentNumber,
      fullName: nfcData.fullName,
      dateOfBirth: nfcData.dateOfBirth,
      verificationScore: 0.98
    };
    
    // Actualizar estado de verificación en la base de datos
    const [session] = await db
      .select()
      .from(identity_verifications)
      .where(eq(identity_verifications.sessionId, sessionId));
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Sesión no encontrada',
        code: 'SESSION_NOT_FOUND'
      });
    }
    
    const completedVerifications = session.completedVerifications 
      ? JSON.parse(session.completedVerifications as string) 
      : [];
    
    completedVerifications.push('nfc');
    
    await db
      .update(identity_verifications)
      .set({
        completedVerifications: JSON.stringify(completedVerifications),
        nfcData: JSON.stringify(nfcVerificationData),
        updatedAt: new Date()
      })
      .where(eq(identity_verifications.sessionId, sessionId));
    
    return res.status(200).json({
      success: true,
      data: {
        verificationId: uuidv4(),
        verificationType: 'nfc',
        verificationScore: nfcVerificationData.verificationScore,
        nfcData: nfcVerificationData
      }
    });
  } catch (error) {
    console.error('Error en verificación NFC:', error);
    return res.status(500).json({
      success: false,
      error: 'Error en la verificación NFC',
      code: 'NFC_VERIFICATION_ERROR'
    });
  }
});

/**
 * @route POST /api/identity-api/complete-verification
 * @description Finaliza el proceso de verificación
 * @access Privado (requiere token de identidad)
 */
identityApiRouter.post('/complete-verification', validateIdentityToken, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.user;
    
    // Obtener sesión de verificación
    const [session] = await db
      .select()
      .from(identity_verifications)
      .where(eq(identity_verifications.sessionId, sessionId));
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Sesión no encontrada',
        code: 'SESSION_NOT_FOUND'
      });
    }
    
    const requiredVerifications = JSON.parse(session.requiredVerifications as string);
    const completedVerifications = session.completedVerifications 
      ? JSON.parse(session.completedVerifications as string) 
      : [];
    
    // Verificar que se hayan completado todas las verificaciones requeridas
    const allVerificationsComplete = requiredVerifications.every(
      (v: string) => completedVerifications.includes(v)
    );
    
    if (!allVerificationsComplete) {
      return res.status(400).json({
        success: false,
        error: 'No se han completado todas las verificaciones requeridas',
        code: 'INCOMPLETE_VERIFICATIONS',
        data: {
          required: requiredVerifications,
          completed: completedVerifications
        }
      });
    }
    
    // Calcular resultado general de la verificación
    // En el mundo real, implementarías una lógica más compleja aquí
    
    // Obtener los datos de todas las verificaciones
    const documentData = session.documentData ? JSON.parse(session.documentData as string) : null;
    const facialData = session.facialData ? JSON.parse(session.facialData as string) : null;
    const nfcData = session.nfcData ? JSON.parse(session.nfcData as string) : null;
    
    // Calculamos un score general
    let overallScore = 0;
    let factorsCount = 0;
    
    if (documentData) {
      overallScore += documentData.verificationScore;
      factorsCount++;
    }
    
    if (facialData) {
      overallScore += facialData.verificationScore;
      factorsCount++;
    }
    
    if (nfcData) {
      overallScore += nfcData.verificationScore;
      factorsCount++;
    }
    
    overallScore = factorsCount > 0 ? overallScore / factorsCount : 0;
    
    // Determinar resultado final
    const passed = overallScore >= 0.7;
    
    const verificationResult = {
      passed,
      overallScore,
      completedAt: new Date(),
      verificationDetails: {
        document: documentData,
        facial: facialData,
        nfc: nfcData
      }
    };
    
    // Actualizar estado de la sesión
    await db
      .update(identity_verifications)
      .set({
        status: passed ? 'verified' : 'failed',
        verificationResult: JSON.stringify(verificationResult),
        updatedAt: new Date()
      })
      .where(eq(identity_verifications.sessionId, sessionId));
    
    // Generar certificado de verificación si la verificación fue exitosa
    let verificationCertificate = null;
    
    if (passed) {
      // En un escenario real, generarías un certificado PDF
      // Por ahora, simplemente generamos un ID de certificado
      verificationCertificate = {
        certificateId: uuidv4(),
        certificateUrl: `${process.env.APP_URL || 'https://notarypro.cl'}/identity-certificate/${sessionId}`,
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      };
    }
    
    // Notificar resultado a través del callback URL
    // En un escenario real, implementarías esta lógica aquí
    
    return res.status(200).json({
      success: true,
      data: {
        sessionId,
        status: passed ? 'verified' : 'failed',
        verificationResult,
        verificationCertificate
      }
    });
  } catch (error) {
    console.error('Error al completar verificación:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al completar la verificación',
      code: 'VERIFICATION_COMPLETION_ERROR'
    });
  }
});

// Importar el módulo de eq de drizzle-orm
import { eq } from 'drizzle-orm';