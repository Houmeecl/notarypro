/**
 * Módulo de Gestión de Contratos
 * 
 * Este módulo proporciona funcionalidades para la generación, gestión y
 * validación de contratos como parte del sistema de documentos.
 */

import { Router, Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { documents, documentTemplates } from "@shared/schema";
import multer from "multer";

// Configurar almacenamiento para archivos de contrato
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'contracts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'contract-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max file size
});

export const contractRouter = Router();

// Middleware para verificar autenticación
function isAuthenticated(req: Request, res: Response, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Acceso no autorizado' });
}

/**
 * Obtener plantillas de contrato disponibles
 * GET /api/contracts/templates
 */
contractRouter.get('/templates', async (req: Request, res: Response) => {
  try {
    const templates = await db.select().from(documentTemplates).where(eq(documentTemplates.active, true));
    res.json(templates);
  } catch (error) {
    console.error('Error al obtener plantillas de contrato:', error);
    res.status(500).json({ error: 'Error al obtener plantillas de contrato' });
  }
});

/**
 * Obtener una plantilla específica
 * GET /api/contracts/templates/:id
 */
contractRouter.get('/templates/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const template = await db.select().from(documentTemplates).where(eq(documentTemplates.id, parseInt(id))).limit(1);
    
    if (template.length === 0) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }
    
    res.json(template[0]);
  } catch (error) {
    console.error('Error al obtener plantilla:', error);
    res.status(500).json({ error: 'Error al obtener plantilla' });
  }
});

/**
 * Generar un contrato a partir de una plantilla
 * POST /api/contracts/generate
 */
contractRouter.post('/generate', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { templateId, formData, title } = req.body;
    
    if (!templateId || !formData) {
      return res.status(400).json({ error: 'Se requiere templateId y formData' });
    }
    
    // Obtener la plantilla
    const template = await db.select().from(documentTemplates).where(eq(documentTemplates.id, templateId)).limit(1);
    
    if (template.length === 0) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }
    
    // Generar contrato HTML con los datos del formulario
    let contractHtml = template[0].htmlTemplate;
    
    // Reemplazar variables en la plantilla
    // Asumimos que las variables están en formato {{nombreVariable}}
    contractHtml = contractHtml.replace(/\{\{([^}]+)\}\}/g, (match, field) => {
      return formData[field] || '';
    });
    
    // Guardar el HTML generado en un archivo
    const contractFileName = `contract-${Date.now()}.html`;
    const contractFilePath = path.join(process.cwd(), 'docs', contractFileName);
    
    fs.writeFileSync(contractFilePath, contractHtml);
    
    // Registrar el contrato en la base de datos
    const [document] = await db.insert(documents)
      .values({
        userId: req.user.id,
        templateId,
        title: title || `Contrato generado - ${new Date().toLocaleDateString('es-CL')}`,
        formData,
        status: 'draft',
        filePath: contractFilePath,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    res.status(201).json({
      message: 'Contrato generado exitosamente',
      document,
      contractUrl: `/docs/${contractFileName}`
    });
  } catch (error) {
    console.error('Error al generar contrato:', error);
    res.status(500).json({ error: 'Error al generar contrato' });
  }
});

/**
 * Subir un contrato firmado manualmente
 * POST /api/contracts/:id/upload-signed
 */
contractRouter.post('/:id/upload-signed', isAuthenticated, upload.single('signedFile'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
    }
    
    // Verificar que el documento existe
    const doc = await db.select().from(documents).where(eq(documents.id, parseInt(id))).limit(1);
    
    if (doc.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    
    // Actualizar la información del documento
    await db.update(documents)
      .set({
        filePath: req.file.path,
        status: 'signed',
        signatureTimestamp: new Date(),
        updatedAt: new Date()
      })
      .where(eq(documents.id, parseInt(id)));
    
    res.status(200).json({
      message: 'Contrato firmado actualizado exitosamente',
      filePath: req.file.path
    });
  } catch (error) {
    console.error('Error al subir contrato firmado:', error);
    res.status(500).json({ error: 'Error al subir contrato firmado' });
  }
});

/**
 * Función auxiliar para generar PDF a partir de HTML
 * Esta función es un placeholder - en una implementación real
 * se usaría una biblioteca como puppeteer o html-pdf
 */
async function generatePdfFromHtml(html: string, outputPath: string): Promise<boolean> {
  // Este es un ejemplo simplificado
  // En producción, deberías usar una biblioteca para convertir HTML a PDF
  try {
    // Aquí iría el código para generar el PDF
    // Por ahora, simplemente guardamos el HTML
    fs.writeFileSync(outputPath, html);
    return true;
  } catch (error) {
    console.error('Error al generar PDF:', error);
    return false;
  }
}