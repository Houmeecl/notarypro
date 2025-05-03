/**
 * Módulo de Gestión Documental Notarial
 * 
 * Este módulo extiende el sistema de gestión documental principal para incluir
 * funcionalidades específicas para documentos notariales, certificaciones y trámites
 * legales utilizados en NotaryPro, pero accesibles desde todo el ecosistema.
 */

import { Router, Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import multer from "multer";
import { db } from "./db";
import { eq, desc, and, not, like } from "drizzle-orm";
import { 
  notaryDocuments, 
  notaryCertifications,
  notaryProcesses,
  notaryTemplates,
  documents,
  users
} from "@shared/schema";
import QRCode from "qrcode";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// Configuración de almacenamiento para documentos notariales
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'notary_documents');
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
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max file size
  fileFilter: (req, file, cb) => {
    // Permitir solo archivos PDF y documentos de Office e imágenes
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no soportado. Por favor suba PDF, documentos de Word o imágenes.'), false);
    }
  }
});

// Crear router para documentos notariales
export const notaryDocumentRouter = Router();

// Funciones de autorización
function isAuthenticated(req: Request, res: Response, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Acceso no autorizado' });
}

function isCertifier(req: Request, res: Response, next: any) {
  if (req.isAuthenticated() && (req.user?.role === 'certifier' || req.user?.role === 'admin')) {
    return next();
  }
  res.status(403).json({ error: 'Se requiere rol de certificador' });
}

function isNotary(req: Request, res: Response, next: any) {
  if (req.isAuthenticated() && (req.user?.role === 'notary' || req.user?.role === 'admin')) {
    return next();
  }
  res.status(403).json({ error: 'Se requiere rol de notario' });
}

function isAdmin(req: Request, res: Response, next: any) {
  if (req.isAuthenticated() && req.user?.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'Se requiere rol de administrador' });
}

/**
 * Obtener plantillas de documentos notariales
 * GET /api/notary-documents/templates
 */
notaryDocumentRouter.get('/templates', async (req: Request, res: Response) => {
  try {
    const templates = await db.select().from(notaryTemplates).orderBy(notaryTemplates.name);
    res.json(templates);
  } catch (error) {
    console.error('Error al obtener plantillas notariales:', error);
    res.status(500).json({ error: 'Error al obtener plantillas' });
  }
});

/**
 * Obtener documentos pendientes de certificación
 * GET /api/notary-documents/pending
 */
notaryDocumentRouter.get('/pending', isCertifier, async (req: Request, res: Response) => {
  try {
    const pendingDocs = await db.select({
      document: notaryDocuments,
      user: {
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        email: users.email
      }
    })
    .from(notaryDocuments)
    .leftJoin(users, eq(notaryDocuments.userId, users.id))
    .where(eq(notaryDocuments.status, 'pending'))
    .orderBy(desc(notaryDocuments.createdAt));
    
    res.json(pendingDocs);
  } catch (error) {
    console.error('Error al obtener documentos pendientes:', error);
    res.status(500).json({ error: 'Error al obtener documentos pendientes' });
  }
});

/**
 * Obtener documentos certificados por un usuario
 * GET /api/notary-documents/my-documents
 */
notaryDocumentRouter.get('/my-documents', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userDocs = await db.select()
      .from(notaryDocuments)
      .where(eq(notaryDocuments.userId, req.user.id))
      .orderBy(desc(notaryDocuments.createdAt));
    
    res.json(userDocs);
  } catch (error) {
    console.error('Error al obtener documentos del usuario:', error);
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
});

/**
 * Subir un documento para certificación
 * POST /api/notary-documents/upload
 */
notaryDocumentRouter.post('/upload', isAuthenticated, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { title, description, documentType, urgency } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
    }
    
    if (!title || !documentType) {
      return res.status(400).json({ error: 'Título y tipo de documento son obligatorios' });
    }
    
    // Generar código de verificación único
    const verificationCode = generateVerificationCode();
    
    // Crear el documento en la base de datos
    const [newDoc] = await db.insert(notaryDocuments)
      .values({
        title,
        description: description || '',
        filePath: req.file.path,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        documentType,
        urgency: urgency || 'normal',
        userId: req.user.id,
        status: 'pending',
        verificationCode,
        metadata: JSON.stringify({
          uploadedFrom: req.headers['user-agent'],
          ip: req.ip,
          platform: req.body.platform || 'web'
        })
      })
      .returning();
    
    // También registrar en la tabla general de documentos
    const [generalDoc] = await db.insert(documents)
      .values({
        title,
        description: description || '',
        filePath: req.file.path,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        categoryId: 3, // Asumimos categoría 3 para documentos notariales
        createdBy: req.user.id,
        status: 'pending',
        verificationCode,
        metadata: JSON.stringify({
          notaryDocumentId: newDoc.id,
          documentType
        })
      })
      .returning();
    
    // Actualizar el notaryDocument con el ID del documento general
    await db.update(notaryDocuments)
      .set({ documentId: generalDoc.id })
      .where(eq(notaryDocuments.id, newDoc.id));
    
    res.status(201).json({
      message: 'Documento enviado para certificación exitosamente',
      document: {
        ...newDoc,
        documentId: generalDoc.id
      }
    });
  } catch (error) {
    console.error('Error al subir documento notarial:', error);
    res.status(500).json({ error: 'Error al subir documento' });
  }
});

/**
 * Certificar un documento
 * POST /api/notary-documents/:id/certify
 */
notaryDocumentRouter.post('/:id/certify', isCertifier, upload.single('signedFile'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { certificationNote, certificationMethod } = req.body;
    
    // Verificar si el documento existe
    const doc = await db.select()
      .from(notaryDocuments)
      .where(eq(notaryDocuments.id, parseInt(id)))
      .limit(1);
    
    if (doc.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    
    if (doc[0].status !== 'pending') {
      return res.status(400).json({ 
        error: 'El documento no está en estado pendiente',
        status: doc[0].status
      });
    }
    
    let certifiedFilePath = doc[0].filePath;
    let certifiedFileName = doc[0].fileName;
    
    // Si se sube un nuevo archivo (documento ya firmado), usarlo
    if (req.file) {
      certifiedFilePath = req.file.path;
      certifiedFileName = req.file.originalname;
    } else if (doc[0].fileType === 'application/pdf') {
      // Agregar sello de certificación al PDF
      try {
        const modifiedPdfPath = await addCertificationToPdf(
          doc[0].filePath, 
          req.user,
          doc[0].verificationCode
        );
        
        if (modifiedPdfPath) {
          certifiedFilePath = modifiedPdfPath;
          certifiedFileName = `certified_${doc[0].fileName}`;
        }
      } catch (pdfError) {
        console.error('Error al modificar PDF:', pdfError);
        // Continuar con el archivo original si hay error
      }
    }
    
    // Crear registro de certificación
    const [certification] = await db.insert(notaryCertifications)
      .values({
        documentId: doc[0].id,
        certifierId: req.user.id,
        certificationDate: new Date(),
        certificationMethod: certificationMethod || 'standard',
        certificationNote: certificationNote || 'Documento certificado',
        certifiedFilePath,
        certifiedFileName,
        metadataSnapshot: JSON.stringify({
          originalFilePath: doc[0].filePath,
          originalFileName: doc[0].fileName,
          certifierName: req.user.fullName,
          certifierRole: req.user.role,
          certificationTimestamp: new Date().toISOString()
        })
      })
      .returning();
    
    // Actualizar estado del documento
    await db.update(notaryDocuments)
      .set({
        status: 'certified',
        certifiedBy: req.user.id,
        certifiedAt: new Date(),
        certifiedFilePath,
        certifiedFileName
      })
      .where(eq(notaryDocuments.id, parseInt(id)));
    
    // Actualizar también el documento general
    if (doc[0].documentId) {
      await db.update(documents)
        .set({
          status: 'certified',
          filePath: certifiedFilePath,
          fileName: certifiedFileName,
          updatedAt: new Date(),
          updatedBy: req.user.id
        })
        .where(eq(documents.id, doc[0].documentId));
    }
    
    res.json({
      message: 'Documento certificado exitosamente',
      certification
    });
  } catch (error) {
    console.error('Error al certificar documento:', error);
    res.status(500).json({ error: 'Error al certificar documento' });
  }
});

/**
 * Verificar un documento notarial por código
 * GET /api/notary-documents/verify/:code
 */
notaryDocumentRouter.get('/verify/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    
    const doc = await db.select({
      document: notaryDocuments,
      certifier: {
        fullName: users.fullName,
        username: users.username
      }
    })
    .from(notaryDocuments)
    .leftJoin(users, eq(notaryDocuments.certifiedBy, users.id))
    .where(eq(notaryDocuments.verificationCode, code))
    .limit(1);
    
    if (doc.length === 0) {
      return res.status(404).json({ 
        verified: false, 
        message: 'Documento no encontrado con este código de verificación' 
      });
    }
    
    const document = doc[0].document;
    const certifier = doc[0].certifier;
    
    res.json({
      verified: document.status === 'certified',
      document: {
        id: document.id,
        title: document.title,
        description: document.description,
        documentType: document.documentType,
        status: document.status,
        verificationCode: document.verificationCode,
        createdAt: document.createdAt,
        certifiedAt: document.certifiedAt
      },
      certifier: document.status === 'certified' ? {
        name: certifier.fullName,
        username: certifier.username
      } : null
    });
  } catch (error) {
    console.error('Error al verificar documento notarial:', error);
    res.status(500).json({ error: 'Error al verificar documento' });
  }
});

/**
 * Descargar un documento notarial
 * GET /api/notary-documents/:id/download
 */
notaryDocumentRouter.get('/:id/download', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { certified } = req.query;
    
    const doc = await db.select()
      .from(notaryDocuments)
      .where(eq(notaryDocuments.id, parseInt(id)))
      .limit(1);
    
    if (doc.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    
    let filePath, fileName;
    
    if (certified === 'true' && doc[0].status === 'certified') {
      // Descargar versión certificada
      filePath = doc[0].certifiedFilePath;
      fileName = doc[0].certifiedFileName;
    } else {
      // Descargar versión original
      filePath = doc[0].filePath;
      fileName = doc[0].fileName;
    }
    
    // Verificar si existe el archivo
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado en el servidor' });
    }
    
    // Enviar el archivo
    res.download(filePath, fileName);
  } catch (error) {
    console.error('Error al descargar documento notarial:', error);
    res.status(500).json({ error: 'Error al descargar documento' });
  }
});

/**
 * Generar QR de verificación para un documento
 * GET /api/notary-documents/:id/qr
 */
notaryDocumentRouter.get('/:id/qr', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const doc = await db.select()
      .from(notaryDocuments)
      .where(eq(notaryDocuments.id, parseInt(id)))
      .limit(1);
    
    if (doc.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    
    // Generar URL de verificación
    const baseUrl = process.env.BASE_URL || 'https://notarypro.io';
    const verificationUrl = `${baseUrl}/verificar-documento?code=${doc[0].verificationCode}`;
    
    // Generar QR como PNG
    const qrCode = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      color: {
        dark: '#2d219b',
        light: '#ffffff'
      }
    });
    
    // Enviar el código QR como respuesta
    res.json({
      verificationCode: doc[0].verificationCode,
      verificationUrl,
      qrCodeUrl: qrCode
    });
  } catch (error) {
    console.error('Error al generar QR:', error);
    res.status(500).json({ error: 'Error al generar código QR' });
  }
});

/**
 * Agregar sello de certificación a un PDF
 */
async function addCertificationToPdf(filePath: string, certifier: any, verificationCode: string): Promise<string | null> {
  try {
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    
    const { width, height } = lastPage.getSize();
    
    // Generar QR code para verificación
    const baseUrl = process.env.BASE_URL || 'https://notarypro.io';
    const verificationUrl = `${baseUrl}/verificar-documento?code=${verificationCode}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
    const qrCodeImageData = qrCodeDataUrl.split(',')[1];
    const qrCodeImage = await pdfDoc.embedPng(Buffer.from(qrCodeImageData, 'base64'));
    
    // Añadir texto y QR code al final del documento
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Agregar QR code
    const qrCodeDimension = 100;
    lastPage.drawImage(qrCodeImage, {
      x: width - qrCodeDimension - 50,
      y: 50,
      width: qrCodeDimension,
      height: qrCodeDimension,
    });
    
    // Agregar texto de certificación
    lastPage.drawText('DOCUMENTO CERTIFICADO', {
      x: 50,
      y: 120,
      size: 14,
      font: font,
      color: rgb(0.18, 0.13, 0.61), // #2d219b
    });
    
    lastPage.drawText(`Certificado por: ${certifier.fullName}`, {
      x: 50,
      y: 100,
      size: 10,
      font: font,
      color: rgb(0.18, 0.13, 0.61), // #2d219b
    });
    
    lastPage.drawText(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, {
      x: 50,
      y: 80,
      size: 10,
      font: font,
      color: rgb(0.18, 0.13, 0.61), // #2d219b
    });
    
    lastPage.drawText(`Código de verificación: ${verificationCode}`, {
      x: 50,
      y: 60,
      size: 10,
      font: font,
      color: rgb(0.18, 0.13, 0.61), // #2d219b
    });
    
    lastPage.drawText('Escanee el código QR para verificar la autenticidad', {
      x: width - qrCodeDimension - 50,
      y: 35,
      size: 8,
      font: font,
      color: rgb(0.18, 0.13, 0.61), // #2d219b
    });
    
    // Guardar el PDF modificado
    const modifiedPdfBytes = await pdfDoc.save();
    const outputPath = filePath.replace('.pdf', `_certified_${Date.now()}.pdf`);
    fs.writeFileSync(outputPath, modifiedPdfBytes);
    
    return outputPath;
  } catch (error) {
    console.error('Error al añadir certificación al PDF:', error);
    return null;
  }
}

/**
 * Generar un código de verificación único
 * @returns Código de verificación
 */
function generateVerificationCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Sin I, O para evitar confusiones
  const numbers = '0123456789';
  
  let code = '';
  
  // Generar 3 letras
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  code += '-';
  
  // Generar 3 números
  for (let i = 0; i < 3; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return code;
}