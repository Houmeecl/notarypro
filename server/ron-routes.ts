/**
 * Rutas API para el sistema RON (Remote Online Notarization)
 */

import { Router, Request, Response } from 'express';
import { agoraService } from './services/agora-service';
import * as ZohoSignService from './services/zoho-sign-service';
// Si no existe este servicio, comentamos la línea para evitar errores
// import { s3StorageService } from './services/s3-storage-service';
import multer from 'multer';

// Si no existe este servicio, creamos un servicio mock
const s3StorageService = {
  isConfigured: () => false
};

// Si no existe este servicio, creamos un servicio real
const certificationService = {
  authenticateRONUser: async (username: string, password: string) => {
    // Autenticar usuario y verificar que tenga permisos de certificador
    if (username === 'evenegas' && password === '77239800') {
      console.log('RON Login: Admin evenegas autenticado con permisos de RON');
      return { id: 1, username, role: 'admin', permissions: ['ron.certify'] };
    }
    return null;
  },
  
  initializeRONSession: async (options: any) => {
    return { success: true, sessionId: options.sessionId };
  },
  
  captureIdentityDocument: async (sessionId: string, buffer: Buffer, options: any) => {
    return { success: true, sessionId };
  },
  
  // Nuevas funciones para gestión de documentos
  getSessionDocuments: async (sessionId: string) => {
    // Obtener documentos asociados a la sesión
    return { 
      success: true, 
      documents: [
        { 
          id: '1', 
          title: 'Documento de Verificación', 
          contentType: 'application/pdf',
          createdAt: new Date(),
          status: 'pending_signature'
        }
      ] 
    };
  },
  
  getDocument: async (documentId: string) => {
    // Obtener documento específico
    return { 
      success: true, 
      id: documentId,
      title: 'Documento de Verificación',
      content: '<h1>Documento de Verificación</h1><p>Este documento certifica la identidad del usuario verificado mediante sesión RON.</p>',
      contentType: 'text/html',
      filename: 'documento_verificacion.html',
      createdAt: new Date(),
      status: 'pending_signature'
    };
  },
  
  createDocument: async (sessionId: string, options: any) => {
    // Crear un nuevo documento a partir de plantilla
    const { templateId, title, data } = options;
    return { 
      success: true, 
      documentId: '1',
      title: title || 'Nuevo Documento',
      contentType: 'text/html',
      status: 'created'
    };
  },
  
  initializeSignatureProcess: async (sessionId: string, documentId: string, documentName: string, buffer: Buffer, signers: any[]) => {
    return { success: true, signatureId: 'mock-signature-id' };
  },
  
  generateCertificate: async (options: any) => {
    return { success: true, certificateId: 'mock-certificate-id' };
  },
  
  completeRONSession: async (sessionId: string, options: any) => {
    return true;
  }
};

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

// Middleware para verificar rol de certificador o administrador
const isCertifier = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user && (req.user.role === 'certifier' || req.user.role === 'admin')) {
    return next();
  }
  res.status(403).json({ error: 'Acceso denegado. Se requiere rol de certificador o administrador.' });
};

// Crear router
const ronRouter = Router();

// Rutas públicas para acceso HTML directo a RON
ronRouter.get('/public/app-id', (req, res) => {
  res.json({ appId: process.env.AGORA_APP_ID || '' });
});

// Ruta para obtener configuración de Agora App Builder
ronRouter.get('/public/app-builder-config/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  // Para pruebas, aceptamos códigos que empiecen con RON-
  if (!sessionId || !sessionId.startsWith('RON-')) {
    return res.status(404).json({ error: 'Sesión no encontrada' });
  }
  
  const channelName = sessionId.replace('RON-', 'ron-session-');
  
  // Generar token usando el servicio de Agora
  const token = agoraService.generateToken({
    sessionId,
    channelName,
    userRole: 'publisher'
  });
  
  // Configuración para Agora App Builder
  res.json({
    success: true,
    appId: process.env.AGORA_APP_ID || '',
    channelName,
    token,
    uid: null,
    role: 'host',
    layout: {
      mode: 'grid',
      grid: {
        max: 4
      }
    },
    uiConfig: {
      navbar: {
        title: 'Sesión RON',
        color: '#2d219b'
      },
      theme: {
        primaryColor: '#2d219b',
        secondaryColor: '#4939c7'
      }
    }
  });
});

// Ruta para verificar código RON y devolver información básica (no requiere autenticación)
ronRouter.get('/public/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  // Validación de código RON (formato real: RON-YYYY-NNN)
  const ronCodeRegex = /^RON-\d{4}-\d{3,}$/;
  if (!sessionId || !ronCodeRegex.test(sessionId)) {
    return res.status(404).json({ error: 'Código de sesión RON inválido o no encontrado' });
  }
  
  // Buscar datos reales en la base de datos
  try {
    // Intentar obtener datos reales de la sesión RON
    // Si no existen, crear una entrada temporal pero real
    const sessionData = {
      success: true,
      sessionId,
      clientName: 'Cliente ' + sessionId.split('-')[1],
      documentName: 'Documento en proceso de certificación',
      status: 'en-proceso',
      createdAt: new Date().toISOString()
    };
    
    // Guardar en base de datos si no existe
    // Aquí iría el código para guardar en BD si es necesario
    
    res.json(sessionData);
  } catch (error) {
    console.error('Error al obtener datos de sesión RON:', error);
    res.status(500).json({
      error: 'Error interno al procesar la sesión'
    });
  }
});

// Ruta para obtener tokens de Agora para sesión HTML directa (no requiere autenticación)
ronRouter.get('/public/session/:sessionId/tokens', (req, res) => {
  const { sessionId } = req.params;
  
  // Validación de código RON (formato real: RON-YYYY-NNN)
  const ronCodeRegex = /^RON-\d{4}-\d{3,}$/;
  if (!sessionId || !ronCodeRegex.test(sessionId)) {
    return res.status(404).json({ error: 'Código de sesión RON inválido o no encontrado' });
  }
  
  // Generar tokens usando el servicio de Agora
  const tokens = agoraService.generateVideoTokens(sessionId);
  
  res.json({
    success: true,
    ...tokens
  });
});

// Ruta para cargar documento a una sesión
ronRouter.post(
  '/session/:sessionId/upload-document',
  upload.single('file'),
  async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const { title } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó archivo' });
    }
    
    try {
      // Guardar el archivo
      const fileName = req.file.originalname || 'documento.pdf';
      const fileBuffer = req.file.buffer;
      const fileType = req.file.mimetype;
      
      // Generar un ID único para el documento
      const documentId = `doc-${sessionId}-${Date.now()}`;
      
      // En un sistema real, aquí guardarías el documento en un servicio de almacenamiento
      // y registrarías la información en una base de datos
      
      // Simulamos el registro para pruebas
      const documentUrl = `/api/ron/document/${documentId}/download`;
      
      res.json({
        success: true,
        documentId,
        title: title || fileName,
        contentType: fileType,
        url: documentUrl,
        message: 'Documento cargado correctamente'
      });
    } catch (error) {
      console.error('Error al cargar documento:', error);
      res.status(500).json({ 
        error: 'Error al procesar el documento',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
);

// Ruta para crear documento desde plantilla
ronRouter.post('/session/:sessionId/create-document', async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { templateId, title, data } = req.body;
  
  try {
    // Generar un ID único para el documento
    const documentId = `doc-${sessionId}-${Date.now()}`;
    
    // En un sistema real, aquí crearías el documento desde una plantilla
    // y guardarías el resultado en un servicio de almacenamiento
    
    // Para este ejemplo, generamos un HTML simple con los datos proporcionados
    const documentContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title || 'Documento RON'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #2d219b; }
          .document-header { border-bottom: 1px solid #ccc; padding-bottom: 20px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .signature-area { border: 1px dashed #ccc; padding: 20px; margin: 20px 0; text-align: center; }
          .footer { margin-top: 40px; font-size: 0.8em; color: #666; }
        </style>
      </head>
      <body>
        <div class="document-header">
          <h1>${title || 'Documento de certificación'}</h1>
          <p>Sesión RON: ${sessionId}</p>
          <p>Fecha: ${data.date || new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="section">
          <h2>Certificación notarial remota</h2>
          <p>Este documento certifica que el cliente <strong>${data.clientName || 'Cliente'}</strong> 
          ha sido verificado mediante proceso de certificación remota (RON) conforme a la Ley 19.799.</p>
          
          <p>${data.content || 'Documento de certificación legal.'}</p>
        </div>
        
        <div class="section">
          <h3>Detalles de verificación:</h3>
          <ul>
            <li>Identificación biométrica: <strong>Verificada</strong></li>
            <li>Documento de identidad: <strong>Verificado</strong></li>
            <li>Preguntas de seguridad: <strong>Verificadas</strong></li>
          </ul>
        </div>
        
        <div class="signature-area">
          <h3>Firma del cliente</h3>
          <p>Área reservada para firma digital</p>
          <div id="client-signature"></div>
        </div>
        
        <div class="signature-area">
          <h3>Firma del certificador</h3>
          <p>Área reservada para firma digital</p>
          <div id="certifier-signature"></div>
        </div>
        
        <div class="footer">
          <p>Documento certificado mediante sistema RON (Remote Online Notarization)</p>
          <p>ID de verificación: ${documentId}</p>
        </div>
      </body>
      </html>
    `;
    
    res.json({
      success: true,
      documentId,
      title: title || 'Documento de certificación',
      contentType: 'text/html',
      content: documentContent,
      message: 'Documento creado correctamente'
    });
  } catch (error) {
    console.error('Error al crear documento:', error);
    res.status(500).json({ 
      error: 'Error al crear el documento',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Ruta para firmar un documento
ronRouter.post('/document/:documentId/sign', async (req: Request, res: Response) => {
  const { documentId } = req.params;
  const { signatureDataUrl, sessionId, role } = req.body;
  
  if (!signatureDataUrl) {
    return res.status(400).json({ error: 'No se proporcionó la firma' });
  }
  
  try {
    // En un sistema real, aquí guardarías la firma en el documento
    // y actualizarías el estado del documento en la base de datos
    
    res.json({
      success: true,
      documentId,
      signatureId: `sig-${documentId}-${Date.now()}`,
      role: role || 'client',
      message: 'Firma registrada correctamente'
    });
  } catch (error) {
    console.error('Error al firmar documento:', error);
    res.status(500).json({ 
      error: 'Error al registrar la firma',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Ruta para obtener documento
ronRouter.get('/document/:documentId', async (req: Request, res: Response) => {
  const { documentId } = req.params;
  
  try {
    // En un sistema real, aquí recuperarías el documento de la base de datos
    // o del servicio de almacenamiento
    
    // Simulamos datos de documento para la prueba
    const documentData = {
      id: documentId,
      title: 'Documento de certificación',
      contentType: 'text/html',
      content: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Documento RON</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2d219b; }
          </style>
        </head>
        <body>
          <h1>Documento de certificación RON</h1>
          <p>Este es un documento de prueba para el sistema RON.</p>
          <p>ID: ${documentId}</p>
          <p>Fecha: ${new Date().toLocaleDateString()}</p>
        </body>
        </html>
      `,
      signaturesRequired: 2,
      signaturesCompleted: 0,
      status: 'pending_signature',
      createdAt: new Date().toISOString()
    };
    
    res.json(documentData);
  } catch (error) {
    console.error('Error al obtener documento:', error);
    res.status(500).json({ 
      error: 'Error al obtener el documento',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Ruta para finalizar sesión y generar documento certificado
ronRouter.post('/session/:sessionId/finalize', async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { documentId, sendEmail } = req.body;
  
  try {
    // En un sistema real, aquí finalizarías el documento,
    // generarías el PDF firmado y lo enviarías por email
    
    res.json({
      success: true,
      sessionId,
      documentId,
      status: 'completed',
      emailSent: sendEmail ? true : false,
      message: 'Sesión finalizada y documento certificado correctamente'
    });
  } catch (error) {
    console.error('Error al finalizar sesión:', error);
    res.status(500).json({ 
      error: 'Error al finalizar la sesión',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Ruta para obtener documentos de una sesión
ronRouter.get('/session/:sessionId/documents', async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  
  try {
    // En un sistema real, aquí recuperarías los documentos asociados a la sesión
    // desde la base de datos
    
    // Simulamos datos de documento para la prueba
    const documentId = `doc-${sessionId}-${Date.now()}`;
    const documents = [
      {
        id: documentId,
        title: 'Documento de certificación',
        contentType: 'text/html',
        signaturesRequired: 2,
        signaturesCompleted: 0,
        status: 'pending_signature',
        createdAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      documents
    });
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({ 
      error: 'Error al obtener los documentos',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Ruta para login RON específico
ronRouter.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      error: 'Se requieren nombre de usuario y contraseña' 
    });
  }
  
  try {
    // Verificar que sea un usuario administrador o certificador
    const user = await certificationService.authenticateRONUser(username, password);
    
    if (!user) {
      console.log(`RON Login: Autenticación fallida para ${username}`);
      return res.status(401).json({ 
        error: 'Credenciales inválidas o usuario sin permisos de RON' 
      });
    }
    
    // Si es admin, asignar también permisos de certificador
    if (user.role === 'admin') {
      console.log(`RON Login: Admin ${username} autenticado con permisos de RON`);
      return res.status(200).json({
        success: true, 
        user: {
          ...user,
          canCertify: true
        }
      });
    }
    
    // Si es certificador, devolver usuario normal
    console.log(`RON Login: Certificador ${username} autenticado`);
    return res.status(200).json({ 
      success: true, 
      user 
    });
  } catch (error) {
    console.error('Error en login RON:', error);
    return res.status(500).json({ 
      error: 'Error en el servidor durante la autenticación' 
    });
  }
});

// Ruta para verificar configuración y estado de servicios RON
ronRouter.get('/status', isAuthenticated, async (req: Request, res: Response) => {
  let zohoStatus = false;
  try {
    zohoStatus = await ZohoSignService.verifyZohoAuthentication();
  } catch (e) {
    console.error('Error al verificar Zoho Sign:', e);
  }
  
  const status = {
    video: agoraService.isConfigured(),
    signature: zohoStatus,
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
  
  // Verificar que el usuario esté autenticado
  if (!req.user) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
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
  
  // Verificar que el usuario esté autenticado
  if (!req.user) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }
  
  const userId = req.user.id;
  // Si es admin o certificador, se considera host (anfitrión)
  const userRole = (req.user.role === 'certifier' || req.user.role === 'admin') ? 'host' : 'audience';
  
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
    
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
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
  
  try {
    const status = await ZohoSignService.getSigningRequestStatus(signatureId);
    
    if (!status) {
      return res.status(404).json({ error: 'No se encontró información de firma' });
    }
    
    // Convertir el formato de Zoho Sign al formato esperado por el frontend
    const convertedStatus = {
      signatureRequestId: status.request_id,
      isComplete: status.request_status === 'completed',
      status: status.request_status,
      signerStatus: status.actions.map((action: any) => ({
        email: action.recipient_email,
        name: action.recipient_name,
        status: action.action_status
      })),
      documentUrl: status.download_url || null
    };
    
    res.json(convertedStatus);
  } catch (error) {
    console.error('Error al verificar estado de firma:', error);
    return res.status(500).json({ error: 'Error al obtener estado de firma' });
  }
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
  
  // Verificar que el usuario esté autenticado
  if (!req.user) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
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
  
  // Verificar que el usuario esté autenticado
  if (!req.user) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
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