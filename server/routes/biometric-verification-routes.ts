/**
 * Rutas para verificación biométrica
 * 
 * Este módulo proporciona endpoints para la verificación biométrica
 * utilizando cámara para capturar selfie y documento de identidad.
 */
import { Router, Request, Response } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import {
  verifyFacialSimilarity,
  extractDocumentInfo,
  analyzeDocumentAuthenticity,
  saveBase64Image
} from '../services/openai-vision';

export const biometricRouter = Router();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'biometric');
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Aceptar solo imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

/**
 * Middleware para verificar autenticación 
 */
function isAuthenticated(req: Request, res: Response, next: any) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ error: 'No autenticado' });
}

/**
 * Endpoint para procesar verificación biométrica con imágenes base64
 * POST /api/biometric/verify
 */
biometricRouter.post('/verify', async (req: Request, res: Response) => {
  try {
    const { selfieImage, documentImage } = req.body;
    
    if (!selfieImage || !documentImage) {
      return res.status(400).json({ 
        error: 'Se requieren imágenes de selfie y documento' 
      });
    }
    
    // Guardar imágenes base64
    const selfiePath = await saveBase64Image(selfieImage, 'selfie.jpg');
    const documentPath = await saveBase64Image(documentImage, 'document.jpg');
    
    // Extraer información del documento
    const documentInfo = await extractDocumentInfo(documentPath);
    
    // Verificar autenticidad del documento
    const documentAuthenticityResult = await analyzeDocumentAuthenticity(documentPath);
    
    // Verificar similitud facial
    const facialSimilarityResult = await verifyFacialSimilarity(selfiePath, documentPath);
    
    // Crear respuesta combinada
    const verificationResult = {
      status: 'completed',
      timestamp: new Date().toISOString(),
      documentInfo,
      documentAuthenticityResult,
      facialSimilarityResult,
      overallResult: {
        verified: 
          documentInfo.isValid && 
          documentAuthenticityResult.isAuthentic && 
          facialSimilarityResult.match,
        confidenceScore: calculateConfidenceScore(
          documentInfo.isValid ? 1 : 0,
          documentAuthenticityResult.score,
          facialSimilarityResult.score
        ),
        details: generateVerificationSummary(
          documentInfo,
          documentAuthenticityResult,
          facialSimilarityResult
        )
      }
    };
    
    // Devolver resultado
    return res.status(200).json(verificationResult);
  } catch (error) {
    console.error('Error en verificación biométrica:', error);
    return res.status(500).json({ 
      error: 'Error en verificación biométrica', 
      message: error.message 
    });
  }
});

/**
 * Endpoint para extraer información de un documento
 * POST /api/biometric/extract-document
 */
biometricRouter.post('/extract-document', upload.single('documentImage'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó imagen del documento' });
    }
    
    const documentPath = req.file.path;
    
    // Extraer información del documento
    const documentInfo = await extractDocumentInfo(documentPath);
    
    // Devolver resultado
    return res.status(200).json({
      status: 'completed',
      timestamp: new Date().toISOString(),
      documentInfo
    });
  } catch (error) {
    console.error('Error en extracción de documento:', error);
    return res.status(500).json({ 
      error: 'Error en extracción de documento', 
      message: error.message 
    });
  }
});

/**
 * Endpoint para analizar autenticidad de un documento
 * POST /api/biometric/analyze-document
 */
biometricRouter.post('/analyze-document', upload.single('documentImage'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó imagen del documento' });
    }
    
    const documentPath = req.file.path;
    
    // Analizar autenticidad del documento
    const documentAuthenticityResult = await analyzeDocumentAuthenticity(documentPath);
    
    // Devolver resultado
    return res.status(200).json({
      status: 'completed',
      timestamp: new Date().toISOString(),
      documentAuthenticityResult
    });
  } catch (error) {
    console.error('Error en análisis de autenticidad:', error);
    return res.status(500).json({ 
      error: 'Error en análisis de autenticidad', 
      message: error.message 
    });
  }
});

/**
 * Endpoint para verificar similitud facial
 * POST /api/biometric/facial-similarity
 */
biometricRouter.post('/facial-similarity', upload.fields([
  { name: 'selfieImage', maxCount: 1 },
  { name: 'documentImage', maxCount: 1 }
]), async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files.selfieImage || !files.documentImage) {
      return res.status(400).json({ 
        error: 'Se requieren imágenes de selfie y documento' 
      });
    }
    
    const selfiePath = files.selfieImage[0].path;
    const documentPath = files.documentImage[0].path;
    
    // Verificar similitud facial
    const facialSimilarityResult = await verifyFacialSimilarity(selfiePath, documentPath);
    
    // Devolver resultado
    return res.status(200).json({
      status: 'completed',
      timestamp: new Date().toISOString(),
      facialSimilarityResult
    });
  } catch (error) {
    console.error('Error en verificación facial:', error);
    return res.status(500).json({ 
      error: 'Error en verificación facial', 
      message: error.message 
    });
  }
});

/**
 * Función auxiliar para calcular una puntuación de confianza general
 */
function calculateConfidenceScore(
  documentValidityScore: number,
  documentAuthenticityScore: number,
  facialSimilarityScore: number
): number {
  // Promedio ponderado de las puntuaciones
  // Damos más peso al reconocimiento facial
  const weightedScore = (
    (documentValidityScore * 0.3) +
    (documentAuthenticityScore * 0.3) +
    (facialSimilarityScore * 0.4)
  );
  
  // Redondear a 2 decimales
  return Math.round(weightedScore * 100) / 100;
}

/**
 * Función auxiliar para generar un resumen de la verificación
 */
function generateVerificationSummary(
  documentInfo: any,
  documentAuthenticityResult: any,
  facialSimilarityResult: any
): string {
  const documentStatus = documentInfo.isValid ? "válido" : "inválido";
  const authenticityStatus = documentAuthenticityResult.isAuthentic ? "auténtico" : "posiblemente alterado";
  const faceMatchStatus = facialSimilarityResult.match ? "coincidente" : "no coincidente";
  
  return `Documento ${documentStatus} (${documentInfo.documentType}), ${authenticityStatus}. Verificación facial: ${faceMatchStatus} con confianza ${facialSimilarityResult.confidence}.`;
}