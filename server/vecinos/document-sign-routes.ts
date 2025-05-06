/**
 * Rutas para firma electrónica avanzada de VecinoXpress
 * 
 * Estas rutas permiten a los socios de VecinoXpress (tiendas de barrio)
 * gestionar la firma electrónica avanzada de documentos mediante 
 * la integración con Zoho Sign y tokens criptográficos (eToken).
 */

import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { partners, documents, partnerTransactions } from '@shared/vecinos-schema';
import { and, eq, desc, gte, lte, sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import * as ZohoSignService from '../services/zoho-sign-service';
import { checkTokenAvailability, signWithToken } from '../lib/etoken-signer';

// Configuración de multer para recibir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads/vecinos/documents'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Límite de 10 MB
  },
  fileFilter: (req, file, cb) => {
    // Permitir solo PDF y archivos de Office
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten PDF y documentos de Office.'));
    }
  }
});

// Extensión de la interfaz Request para incluir el usuario de vecinos
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        partnerId: number;
        username: string;
        role: string;
      };
    }
  }
}

// Middleware para verificar el token JWT de Vecinos
const authenticateJWT = async (req: Request, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET || 'vecinos-secret') as {
        id: number;
        partnerId: number;
        username: string;
        role: string;
      };
      req.user = user;
      next();
    } catch (error) {
      return res.sendStatus(403);
    }
  } else {
    res.sendStatus(401);
  }
};

// Middleware para verificar si el usuario es un socio Vecinos
const isPartner = async (req: Request, res: Response, next: any) => {
  if (!req.user || req.user.role !== 'partner') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de socio.' });
  }
  
  next();
};

// Router de firma electrónica de documentos
const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateJWT);

/**
 * Comprueba la disponibilidad del servicio Zoho Sign
 * GET /api/vecinos/document-sign/check-service
 */
router.get('/check-service', async (req: Request, res: Response) => {
  try {
    const isAuthenticated = await ZohoSignService.verifyZohoAuthentication();
    
    res.json({
      zoho_sign_available: isAuthenticated,
      etoken_available: await checkTokenAvailability()
    });
  } catch (error: any) {
    console.error('Error al verificar servicios de firma:', error);
    res.status(500).json({ 
      error: 'Error al verificar servicios de firma', 
      message: error.message 
    });
  }
});

/**
 * Sube un documento para procesar firma
 * POST /api/vecinos/document-sign/upload
 */
router.post('/upload', isPartner, upload.single('document'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún documento' });
    }
    
    const { 
      title, 
      documentType, 
      clientName, 
      clientRut, 
      clientPhone, 
      clientEmail,
      price
    } = req.body;
    
    // Validar campos obligatorios
    if (!title || !documentType || !clientName || !clientRut || !clientPhone) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }
    
    // Generar código de verificación único
    const verificationCode = uuidv4().substring(0, 8).toUpperCase();
    
    // Registrar documento en la base de datos
    const [newDocument] = await db.insert(documents).values({
      partnerId: req.user!.partnerId,
      title,
      type: documentType,
      price: parseInt(price, 10) || 0,
      status: 'pending',
      clientName,
      clientRut,
      clientPhone,
      clientEmail: clientEmail || null,
      verificationCode,
      commissionRate: 20, // Tasa de comisión predeterminada
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    // Obtener información del socio
    const [partner] = await db.select().from(partners).where(
      eq(partners.id, req.user!.partnerId)
    );
    
    if (!partner) {
      return res.status(404).json({ message: 'Socio no encontrado' });
    }
    
    // Información del documento y ruta de archivo
    const documentInfo = {
      id: newDocument.id,
      title: newDocument.title,
      type: newDocument.type,
      status: newDocument.status,
      verificationCode: newDocument.verificationCode,
      createdAt: newDocument.createdAt,
      updatedAt: newDocument.updatedAt,
      filePath: req.file.path,
      fileName: req.file.filename,
      fileSize: req.file.size,
      fileType: req.file.mimetype
    };
    
    // Actualizar el campo fileName en la base de datos
    await db.update(documents)
      .set({
        fileName: req.file.filename
      })
      .where(eq(documents.id, newDocument.id));
    
    res.status(201).json({
      message: 'Documento subido exitosamente',
      document: documentInfo
    });
  } catch (error: any) {
    console.error('Error al subir documento:', error);
    res.status(500).json({ 
      error: 'Error al procesar documento', 
      message: error.message 
    });
  }
});

/**
 * Inicia proceso de firma con Zoho Sign
 * POST /api/vecinos/document-sign/start-signing/:documentId
 */
router.post('/start-signing/:documentId', isPartner, async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    
    // Obtener información del documento
    const [document] = await db.select().from(documents).where(
      and(
        eq(documents.id, parseInt(documentId, 10)),
        eq(documents.partnerId, req.user!.partnerId)
      )
    );
    
    if (!document) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }
    
    // Obtener información del socio
    const [partner] = await db.select().from(partners).where(
      eq(partners.id, req.user!.partnerId)
    );
    
    if (!partner) {
      return res.status(404).json({ message: 'Socio no encontrado' });
    }
    
    // Verificar si el documento está en estado pendiente
    if (document.status !== 'pending') {
      return res.status(400).json({ 
        message: `El documento no puede ser procesado. Estado actual: ${document.status}` 
      });
    }
    
    // Ruta del archivo
    const documentPath = path.join(process.cwd(), 'uploads/vecinos/documents/', document.fileName || '');
    
    if (!document.fileName) {
      return res.status(400).json({ message: 'Documento sin archivo asociado' });
    }
    
    // Configurar destinatarios de la firma
    const recipients: ZohoSignService.Recipient[] = [];
    
    // Cliente como firmante principal
    if (document.clientEmail) {
      recipients.push({
        name: document.clientName,
        email: document.clientEmail,
        phonenumber: document.clientPhone,
        sign_sequence: 1,
        role: "signer"
      });
    }
    
    // Socio como firmante o aprobador
    recipients.push({
      name: partner.ownerName,
      email: partner.email,
      phonenumber: partner.phone,
      sign_sequence: document.clientEmail ? 2 : 1,
      role: "signer"
    });
    
    // Crear solicitud de firma en Zoho Sign
    const signRequest: ZohoSignService.SignRequest = {
      document_name: document.title,
      document_path: documentPath,
      recipients: recipients,
      expiry_days: 7,
      reminder_period: 1,
      notes: `Documento procesado por VecinoXpress a través del socio: ${partner.storeName}`,
      callback_url: `${process.env.APP_URL || 'https://notarypro.cl'}/api/vecinos/document-sign/webhook`,
      custom_data: {
        document_id: document.id.toString(),
        partner_id: partner.id.toString(),
        verification_code: document.verificationCode
      }
    };
    
    // Enviar solicitud a Zoho Sign
    const signResponse = await ZohoSignService.createSigningRequest(signRequest);
    
    // Actualizar documento con la información de la solicitud
    await db.update(documents)
      .set({
        status: 'signing',
        zohoRequestId: signResponse.request_id,
        zohoSignUrl: signResponse.sign_url,
        updatedAt: new Date()
      } as any)
      .where(eq(documents.id, document.id));
    
    res.json({
      message: 'Proceso de firma iniciado exitosamente',
      signing_request: signResponse
    });
  } catch (error: any) {
    console.error('Error al iniciar proceso de firma:', error);
    res.status(500).json({ 
      error: 'Error al iniciar proceso de firma', 
      message: error.message 
    });
  }
});

/**
 * Firma documento con eToken local
 * POST /api/vecinos/document-sign/sign-with-etoken/:documentId
 */
router.post('/sign-with-etoken/:documentId', isPartner, async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { pin, providerId, certificateId } = req.body;
    
    // Validar campos obligatorios
    if (!pin || !providerId || !certificateId) {
      return res.status(400).json({ message: 'Faltan campos obligatorios para la firma con eToken' });
    }
    
    // Obtener información del documento
    const [document] = await db.select().from(documents).where(
      and(
        eq(documents.id, parseInt(documentId, 10)),
        eq(documents.partnerId, req.user!.partnerId)
      )
    );
    
    if (!document) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }
    
    // Verificar si el eToken está disponible
    const tokenAvailable = await checkTokenAvailability();
    if (!tokenAvailable) {
      return res.status(400).json({ 
        message: 'No se detectó ningún dispositivo eToken. Por favor conecte su token USB y vuelva a intentarlo.' 
      });
    }
    
    // Generar hash del documento para firmar
    // En una implementación real, deberíamos calcular el hash del PDF
    const documentHash = `document-${document.id}-${document.verificationCode}`;
    
    // Firmar documento con eToken
    const signatureData = await signWithToken(
      documentHash,
      pin,
      providerId,
      certificateId
    );
    
    // Actualizar documento con la información de la firma
    await db.update(documents)
      .set({
        status: 'completed',
        signatureData: JSON.stringify(signatureData),
        updatedAt: new Date()
      } as any)
      .where(eq(documents.id, document.id));
    
    // Obtener información del socio
    const [partner] = await db.select().from(partners).where(
      eq(partners.id, req.user!.partnerId)
    );
    
    // Registrar comisión para el socio
    const commissionAmount = Math.floor(document.price * (document.commissionRate / 100));
    
    if (commissionAmount > 0 && partner) {
      await db.insert(partnerTransactions).values({
        partnerId: req.user!.partnerId,
        documentId: document.id,
        amount: commissionAmount,
        type: 'commission',
        status: 'completed',
        description: `Comisión por documento ${document.title} (${document.verificationCode})`,
        createdAt: new Date(),
        completedAt: new Date()
      });
      
      // Actualizar balance del socio
      await db.update(partners)
        .set({
          balance: partner.balance + commissionAmount,
          updatedAt: new Date()
        })
        .where(eq(partners.id, req.user!.partnerId));
    }
    
    res.json({
      message: 'Documento firmado exitosamente con eToken',
      signature: {
        certificateAuthor: signatureData.tokenInfo.certificateAuthor,
        certificateId: signatureData.tokenInfo.certificateId,
        timestamp: signatureData.tokenInfo.timestamp
      }
    });
  } catch (error: any) {
    console.error('Error al firmar con eToken:', error);
    res.status(500).json({ 
      error: 'Error al firmar documento con eToken', 
      message: error.message 
    });
  }
});

/**
 * Webhook para Zoho Sign
 * POST /api/vecinos/document-sign/webhook
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    // Verificar la firma del webhook (en una implementación real)
    // ...
    
    const { action, request_id, document_id, custom_data } = req.body;
    
    if (!request_id || !action) {
      return res.status(400).json({ message: 'Datos de webhook incompletos' });
    }
    
    console.log('Webhook de Zoho Sign recibido:', { action, request_id, document_id });
    
    // Procesar según la acción
    if (action === 'sign_completed') {
      // Actualizar estado del documento
      if (custom_data && custom_data.document_id) {
        const documentId = parseInt(custom_data.document_id, 10);
        
        // Obtener información del documento
        const [document] = await db.select().from(documents).where(
          eq(documents.id, documentId)
        );
        
        if (document) {
          // Actualizar estado
          await db.update(documents)
            .set({
              status: 'completed',
              updatedAt: new Date()
            })
            .where(eq(documents.id, documentId));
          
          // Obtener información del socio
          const [partner] = await db.select().from(partners).where(
            eq(partners.id, document.partnerId)
          );
          
          if (partner) {
            // Registrar comisión
            const commissionAmount = Math.floor(document.price * (document.commissionRate / 100));
            
            if (commissionAmount > 0) {
              await db.insert(partnerTransactions).values({
                partnerId: document.partnerId,
                documentId: document.id,
                amount: commissionAmount,
                type: 'commission',
                status: 'completed',
                description: `Comisión por documento ${document.title} (${document.verificationCode})`,
                createdAt: new Date(),
                completedAt: new Date()
              });
              
              // Actualizar balance del socio
              await db.update(partners)
                .set({
                  balance: partner.balance + commissionAmount,
                  updatedAt: new Date()
                })
                .where(eq(partners.id, document.partnerId));
            }
          }
        }
      }
    } else if (action === 'sign_declined') {
      // Actualizar estado del documento a rechazado
      if (custom_data && custom_data.document_id) {
        const documentId = parseInt(custom_data.document_id, 10);
        
        await db.update(documents)
          .set({
            status: 'rejected',
            updatedAt: new Date()
          })
          .where(eq(documents.id, documentId));
      }
    }
    
    res.json({ status: 'success' });
  } catch (error: any) {
    console.error('Error al procesar webhook de Zoho Sign:', error);
    res.status(500).json({ error: 'Error al procesar webhook', message: error.message });
  }
});

/**
 * Obtener listado de documentos del socio
 * GET /api/vecinos/document-sign/documents
 */
router.get('/documents', isPartner, async (req: Request, res: Response) => {
  try {
    const { status, startDate, endDate, page = '1', limit = '10' } = req.query;
    
    // Construir consulta base
    let query = db.select().from(documents).where(
      eq(documents.partnerId, req.user!.partnerId)
    );
    
    // Filtrar por estado
    if (status) {
      query = query.where(eq(documents.status, status as string));
    }
    
    // Filtrar por rango de fechas
    if (startDate) {
      const start = new Date(startDate as string);
      query = query.where(gte(documents.createdAt, start));
    }
    
    if (endDate) {
      const end = new Date(endDate as string);
      query = query.where(lte(documents.createdAt, end));
    }
    
    // Paginación
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;
    
    // Ejecutar consulta con límite y offset
    const documentsResults = await query.limit(limitNum).offset(offset).orderBy(desc(documents.createdAt));
    
    // Obtener conteo total
    const [totalCount] = await db.select({ count: count() }).from(documents).where(
      eq(documents.partnerId, req.user!.partnerId)
    );
    
    // Aplicar los mismos filtros al conteo
    let countQuery = db.select({ count: count() }).from(documents).where(
      eq(documents.partnerId, req.user!.partnerId)
    );
    
    if (status) {
      countQuery = countQuery.where(eq(documents.status, status as string));
    }
    
    if (startDate) {
      const start = new Date(startDate as string);
      countQuery = countQuery.where(gte(documents.createdAt, start));
    }
    
    if (endDate) {
      const end = new Date(endDate as string);
      countQuery = countQuery.where(lte(documents.createdAt, end));
    }
    
    const [countResult] = await countQuery;
    
    res.json({
      documents: documentsResults,
      pagination: {
        total: countResult?.count || 0,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((countResult?.count || 0) / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({ 
      error: 'Error al obtener documentos', 
      message: error.message 
    });
  }
});

/**
 * Obtener detalles de un documento específico
 * GET /api/vecinos/document-sign/documents/:documentId
 */
router.get('/documents/:documentId', isPartner, async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    
    // Obtener información del documento
    const [document] = await db.select().from(documents).where(
      and(
        eq(documents.id, parseInt(documentId, 10)),
        eq(documents.partnerId, req.user!.partnerId)
      )
    );
    
    if (!document) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }
    
    // Si el documento está en proceso de firma con Zoho, obtener estado actualizado
    if (document.status === 'signing' && (document as any).zohoRequestId) {
      try {
        const signingStatus = await ZohoSignService.getSigningRequestStatus((document as any).zohoRequestId);
        
        // Actualizar estado si ha cambiado
        if (signingStatus.request_status !== document.status) {
          let newStatus = document.status;
          
          if (signingStatus.request_status === 'completed') {
            newStatus = 'completed';
          } else if (signingStatus.request_status === 'declined') {
            newStatus = 'rejected';
          }
          
          // Actualizar en base de datos
          if (newStatus !== document.status) {
            await db.update(documents)
              .set({
                status: newStatus,
                updatedAt: new Date()
              })
              .where(eq(documents.id, document.id));
            
            document.status = newStatus;
            document.updatedAt = new Date();
          }
        }
      } catch (error) {
        console.warn('Error al obtener estado de Zoho Sign:', error);
        // Continuar con el estado actual en caso de error
      }
    }
    
    res.json({
      document
    });
  } catch (error: any) {
    console.error('Error al obtener detalles del documento:', error);
    res.status(500).json({ 
      error: 'Error al obtener detalles del documento', 
      message: error.message 
    });
  }
});

export default router;