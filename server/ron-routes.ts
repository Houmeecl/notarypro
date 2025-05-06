/**
 * Rutas API para el sistema RON (Remote Online Notarization)
 */

import { Router, Request, Response } from 'express';
import { agoraService } from './services/agora-service';
import { helloSignService } from './services/hellosign-service';
import { s3StorageService } from './services/s3-storage-service';
import { certificationService } from './services/certification-service';
import multer from 'multer';

// Configuración de multer para manejar archivos
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limitar a 10MB
  }
});

// Middleware de autenticación
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'No autenticado' });
};

// Middleware para verificar rol de certificador
const isCertifier = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user && req.user.role === 'certifier') {
    return next();
  }
  res.status(403).json({ error: 'Acceso denegado. Se requiere rol de certificador.' });
};

// Crear router
const ronRouter = Router();

// Ruta para verificar configuración y estado de servicios RON
ronRouter.get('/status', isAuthenticated, async (req: Request, res: Response) => {
  const status = {
    video: agoraService.isConfigured(),
    signature: helloSignService.isConfigured(),
    storage: s3StorageService.isConfigured()
  };
  
  res.json({
    status,
    ready: Object.values(status).every(Boolean),
    timestamp: new Date().toISOString()
  });
});

// Ruta para iniciar sesión de certificación RON
ronRouter.post('/session/initialize', isAuthenticated, async (req: Request, res: Response) => {
  const { sessionId, documentId, documentName, clientId, clientEmail, clientName } = req.body;
  
  if (!sessionId || !documentId || !clientId) {
    return res.status(400).json({ 
      error: 'Se requieren sessionId, documentId y clientId' 
    });
  }
  
  const result = await certificationService.initializeRONSession({
    sessionId,
    documentId,
    documentName: documentName || 'Documento sin nombre',
    certifierId: req.user.id,
    clientId,
    clientEmail: clientEmail || 'cliente@example.com',
    clientName: clientName || 'Cliente'
  });
  
  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }
  
  res.json(result);
});

// Ruta para obtener tokens de video para una sesión
ronRouter.get('/session/:sessionId/video-tokens', isAuthenticated, async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role === 'certifier' ? 'host' : 'audience';
  
  const token = agoraService.generateToken({
    sessionId,
    userId,
    userRole,
    channelName: `ron-session-${sessionId}`
  });
  
  if (!token) {
    return res.status(500).json({ error: 'No se pudo generar el token de video' });
  }
  
  res.json({ 
    token,
    channelName: `ron-session-${sessionId}`,
    userId
  });
});

// Ruta para capturar documento de identidad
ronRouter.post(
  '/session/:sessionId/capture-identity', 
  isAuthenticated, 
  upload.single('image'), 
  async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const { documentType, notes } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó imagen' });
    }
    
    const result = await certificationService.captureIdentityDocument(
      sessionId,
      req.file.buffer,
      {
        capturedBy: req.user.id,
        documentType,
        notes
      }
    );
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    res.json(result);
  }
);

// Ruta para iniciar proceso de firma
ronRouter.post(
  '/session/:sessionId/sign-document',
  isAuthenticated,
  upload.single('document'),
  async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const { documentId, documentName, signers } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó documento' });
    }
    
    let parsedSigners;
    try {
      parsedSigners = JSON.parse(signers);
      if (!Array.isArray(parsedSigners)) {
        throw new Error('El formato de firmantes es inválido');
      }
    } catch (e) {
      return res.status(400).json({ error: 'El formato de firmantes es inválido' });
    }
    
    const result = await certificationService.initializeSignatureProcess(
      sessionId,
      documentId,
      documentName || 'Documento sin nombre',
      req.file.buffer,
      parsedSigners
    );
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    res.json(result);
  }
);

// Ruta para verificar estado de firma
ronRouter.get('/signature/:signatureId/status', isAuthenticated, async (req: Request, res: Response) => {
  const { signatureId } = req.params;
  
  const status = await helloSignService.checkSignatureStatus(signatureId);
  
  if (!status) {
    return res.status(404).json({ error: 'No se encontró información de firma' });
  }
  
  res.json(status);
});

// Ruta para generar constancia de certificación
ronRouter.post('/session/:sessionId/generate-certificate', isAuthenticated, async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { 
    documentId, 
    documentName,
    participantName,
    verificationResult,
    signatureInfo
  } = req.body;
  
  if (!documentId || !documentName) {
    return res.status(400).json({ error: 'Se requieren documentId y documentName' });
  }
  
  const result = await certificationService.generateCertificate({
    sessionId,
    documentId,
    documentName,
    participantName: participantName || 'Participante',
    certifierName: req.user.username || 'Certificador',
    verificationResult: verificationResult || { success: false },
    signatureInfo
  });
  
  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }
  
  res.json(result);
});

// Ruta para completar sesión RON
ronRouter.post('/session/:sessionId/complete', isAuthenticated, async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { 
    documentId, 
    clientId,
    verificationId,
    signatureId,
    certificateId,
    status,
    notes
  } = req.body;
  
  if (!documentId || !clientId) {
    return res.status(400).json({ error: 'Se requieren documentId y clientId' });
  }
  
  const completed = await certificationService.completeRONSession(
    sessionId,
    {
      documentId,
      certifierId: req.user.id,
      clientId,
      verificationId,
      signatureId,
      certificateId,
      status: status || 'completed',
      notes
    }
  );
  
  if (!completed) {
    return res.status(500).json({ error: 'No se pudo completar la sesión RON' });
  }
  
  res.json({ success: true, message: 'Sesión RON completada correctamente' });
});

export default ronRouter;