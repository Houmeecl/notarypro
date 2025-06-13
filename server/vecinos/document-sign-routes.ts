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
import { db, partners, documents } from '../db'; // ✅ Importar desde ../db
import { v4 as uuidv4 } from 'uuid';
// import { partners, documents, partnerTransactions } from '@shared/vecinos-schema'; // ✅ COMENTADO
import { and, eq, desc, gte, lte, sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
// import * as ZohoSignService from '../services/zoho-sign-service'; // ✅ COMENTADO TEMPORALMENTE
// import { checkTokenAvailability, signWithToken } from '../lib/etoken-signer'; // ✅ COMENTADO TEMPORALMENTE

// ✅ Definición temporal de partnerTransactions (hasta que arregles el schema)
import { pgTable, serial, integer, decimal, varchar, timestamp, text } from 'drizzle-orm/pg-core';

const partnerTransactions = pgTable('partner_transactions', {
  id: serial('id').primaryKey(),
  partnerId: integer('partner_id').notNull(),
  documentId: integer('document_id'),
  amount: integer('amount').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at')
});

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
    // ✅ TEMPORALMENTE COMENTADO - descomentar cuando tengas los servicios
    // const isAuthenticated = await ZohoSignService.verifyZohoAuthentication();
    
    res.json({
      zoho_sign_available: false, // Temporalmente false
      etoken_available: false, // await checkTokenAvailability()
      message: 'Servicios de firma temporalmente deshabilitados'
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
    
    // ✅ USAR TABLA DE db.ts EN LUGAR DE @shared/vecinos-schema
    const [newDocument] = await db.insert(documents).values({
      userId: req.user!.id, // Usar userId en lugar de partnerId temporalmente
      title,
      content: `Tipo: ${documentType}, Cliente: ${clientName}, RUT: ${clientRut}`,
      status: 'draft', // Cambiar a 'pending' cuando tengas el campo correcto
      paymentAmount: price ? parseFloat(price) : 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    // Información del documento y ruta de archivo
    const documentInfo = {
      id: newDocument.id,
      title: newDocument.title,
      status: newDocument.status,
      verificationCode,
      createdAt: newDocument.createdAt,
      updatedAt: newDocument.updatedAt,
      filePath: req.file.path,
      fileName: req.file.filename,
      fileSize: req.file.size,
      fileType: req.file.mimetype
    };
    
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
 * Obtener listado de documentos del socio
 * GET /api/vecinos/document-sign/documents
 */
router.get('/documents', isPartner, async (req: Request, res: Response) => {
  try {
    const { status, startDate, endDate, page = '1', limit = '10' } = req.query;
    
    // ✅ USAR TABLA DE db.ts
    let query = db.select().from(documents).where(
      eq(documents.userId, req.user!.id) // Usar userId temporalmente
    );
    
    // Filtrar por estado
    if (status) {
      query = query.where(eq(documents.status, status as string));
    }
    
    // Paginación
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;
    
    // Ejecutar consulta con límite y offset
    const documentsResults = await query.limit(limitNum).offset(offset).orderBy(desc(documents.createdAt));
    
    res.json({
      documents: documentsResults,
      pagination: {
        total: documentsResults.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(documentsResults.length / limitNum)
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
    
    // ✅ USAR TABLA DE db.ts
    const [document] = await db.select().from(documents).where(
      and(
        eq(documents.id, parseInt(documentId, 10)),
        eq(documents.userId, req.user!.id) // Usar userId temporalmente
      )
    );
    
    if (!document) {
      return res.status(404).json({ message: 'Documento no encontrado' });
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

// ✅ Ruta de salud para verificar que el módulo funciona
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Document Sign API is working',
    timestamp: new Date().toISOString()
  });
});

export default router;