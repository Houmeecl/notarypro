/**
 * Sistema de Gestión Documental Unificado
 * 
 * Este módulo proporciona una API centralizada para la gestión de documentos
 * en todo el ecosistema VecinoXpress, permitiendo acceso desde todas las interfaces
 * (POS, web, móvil, etc.)
 */

import { Router, Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import multer from "multer";
import { db } from "./db";
import { eq, desc, and, or, like } from "drizzle-orm";
import { 
  documents as existingDocuments, 
  documentCategories as existingCategories,
  Document,
  DocumentVersion,
  DocumentCategory,
  DocumentTag,
  documentVersions,
  documentCategories,
  documents,
  documentTags 
} from "@shared/document-schema";
import { contractRouter } from "./contract-routes";

// Configuración de almacenamiento para documentos subidos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
  fileFilter: (req, file, cb) => {
    // Permitir solo archivos PDF y documentos de Office
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no soportado. Por favor suba PDF o documentos de Office.'), false);
    }
  }
});

// Crear router principal para la gestión documental
export const documentManagementRouter = Router();

// Función para verificar autenticación
function isAuthenticated(req: Request, res: Response, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Acceso no autorizado' });
}

/**
 * Obtener categorías de documentos
 * GET /api/document-management/categories
 */
documentManagementRouter.get('/categories', async (req: Request, res: Response) => {
  try {
    // Usamos documentCategories de nuestro nuevo esquema
    const categories = await db.select().from(documentCategories).orderBy(documentCategories.name);
    
    // Incluir categorías ya existentes si existen
    try {
      const existingCats = await db.select().from(existingCategories).orderBy(existingCategories.name);
      // Combinar categorías existentes con las nuevas
      const combinedCategories = [...categories];
      
      // Solo agregamos categorías que no coincidan por nombre
      for (const existingCat of existingCats) {
        if (!categories.some(cat => cat.name === existingCat.name)) {
          combinedCategories.push(existingCat);
        }
      }
      
      res.json(combinedCategories);
    } catch (e) {
      // Si hay error al obtener categorías existentes, solo devolver las nuevas
      console.log('Usando solo categorías del nuevo esquema:', e);
      res.json(categories);
    }
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

/**
 * Obtener documentos por categoría
 * GET /api/document-management/documents/category/:categoryId
 */
documentManagementRouter.get('/documents/category/:categoryId', async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const docs = await db.select()
      .from(documents)
      .where(eq(documents.categoryId, parseInt(categoryId)))
      .orderBy(desc(documents.createdAt));
    
    res.json(docs);
  } catch (error) {
    console.error('Error al obtener documentos por categoría:', error);
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
});

/**
 * Búsqueda de documentos
 * GET /api/document-management/documents/search?q=texto
 */
documentManagementRouter.get('/documents/search', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Término de búsqueda requerido' });
    }
    
    const searchTerm = `%${q}%`;
    
    const results = await db.select()
      .from(documents)
      .where(
        or(
          like(documents.title, searchTerm),
          like(documents.description, searchTerm),
          like(documents.metadata, searchTerm)
        )
      )
      .orderBy(desc(documents.createdAt));
    
    res.json(results);
  } catch (error) {
    console.error('Error en búsqueda de documentos:', error);
    res.status(500).json({ error: 'Error al buscar documentos' });
  }
});

/**
 * Obtener documentos recientes
 * GET /api/document-management/documents/recent
 */
documentManagementRouter.get('/documents/recent', async (req: Request, res: Response) => {
  try {
    const recentDocs = await db.select()
      .from(documents)
      .orderBy(desc(documents.createdAt))
      .limit(20);
    
    res.json(recentDocs);
  } catch (error) {
    console.error('Error al obtener documentos recientes:', error);
    res.status(500).json({ error: 'Error al obtener documentos recientes' });
  }
});

/**
 * Obtener un documento específico con sus versiones
 * GET /api/document-management/documents/:id
 */
documentManagementRouter.get('/documents/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const doc = await db.select()
      .from(documents)
      .where(eq(documents.id, parseInt(id)))
      .limit(1);
    
    if (doc.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    
    // Obtener versiones del documento
    const versions = await db.select()
      .from(documentVersions)
      .where(eq(documentVersions.documentId, parseInt(id)))
      .orderBy(desc(documentVersions.version));
    
    res.json({
      document: doc[0],
      versions
    });
  } catch (error) {
    console.error('Error al obtener documento:', error);
    res.status(500).json({ error: 'Error al obtener documento' });
  }
});

/**
 * Subir un nuevo documento
 * POST /api/document-management/documents
 */
documentManagementRouter.post('/documents', isAuthenticated, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { title, description, categoryId, tags } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
    }
    
    if (!title || !categoryId) {
      return res.status(400).json({ error: 'Título y categoría son obligatorios' });
    }
    
    // Generar código de verificación único
    const verificationCode = generateVerificationCode();
    
    // Crear el documento en la base de datos
    const [newDoc] = await db.insert(documents)
      .values({
        title,
        description: description || '',
        filePath: req.file.path,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        categoryId: parseInt(categoryId),
        createdBy: req.user?.id,
        status: 'active',
        verificationCode,
        metadata: JSON.stringify({
          uploadedFrom: req.headers['user-agent'],
          ip: req.ip
        })
      })
      .returning();
    
    // Crear la primera versión del documento
    await db.insert(documentVersions)
      .values({
        documentId: newDoc.id,
        version: 1,
        filePath: req.file.path,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        createdBy: req.user?.id,
        changes: 'Versión inicial'
      });
    
    // Procesar etiquetas si existen
    if (tags && typeof tags === 'string') {
      const tagList = tags.split(',').map(tag => tag.trim());
      
      for (const tagName of tagList) {
        await db.insert(documentTags)
          .values({
            documentId: newDoc.id,
            name: tagName
          });
      }
    }
    
    res.status(201).json({
      message: 'Documento creado exitosamente',
      document: newDoc
    });
  } catch (error) {
    console.error('Error al crear documento:', error);
    res.status(500).json({ error: 'Error al crear documento' });
  }
});

/**
 * Subir una nueva versión de un documento existente
 * POST /api/document-management/documents/:id/versions
 */
documentManagementRouter.post('/documents/:id/versions', isAuthenticated, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { changes } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
    }
    
    // Verificar que el documento existe
    const doc = await db.select()
      .from(documents)
      .where(eq(documents.id, parseInt(id)))
      .limit(1);
    
    if (doc.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    
    // Obtener la última versión
    const latestVersion = await db.select()
      .from(documentVersions)
      .where(eq(documentVersions.documentId, parseInt(id)))
      .orderBy(desc(documentVersions.version))
      .limit(1);
    
    const newVersionNumber = latestVersion.length > 0 ? latestVersion[0].version + 1 : 1;
    
    // Crear la nueva versión
    const [newVersion] = await db.insert(documentVersions)
      .values({
        documentId: parseInt(id),
        version: newVersionNumber,
        filePath: req.file.path,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        createdBy: req.user?.id,
        changes: changes || `Versión ${newVersionNumber}`
      })
      .returning();
    
    // Actualizar la información del documento principal
    await db.update(documents)
      .set({
        filePath: req.file.path,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        updatedAt: new Date(),
        updatedBy: req.user?.id
      })
      .where(eq(documents.id, parseInt(id)));
    
    res.status(200).json({
      message: 'Nueva versión creada exitosamente',
      version: newVersion
    });
  } catch (error) {
    console.error('Error al crear nueva versión:', error);
    res.status(500).json({ error: 'Error al crear nueva versión' });
  }
});

/**
 * Descargar un documento específico
 * GET /api/document-management/documents/:id/download
 */
documentManagementRouter.get('/documents/:id/download', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { version } = req.query;
    
    let filePath, fileName;
    
    if (version && typeof version === 'string') {
      // Descargar una versión específica
      const versionData = await db.select()
        .from(documentVersions)
        .where(
          and(
            eq(documentVersions.documentId, parseInt(id)),
            eq(documentVersions.version, parseInt(version))
          )
        )
        .limit(1);
      
      if (versionData.length === 0) {
        return res.status(404).json({ error: 'Versión no encontrada' });
      }
      
      filePath = versionData[0].filePath;
      fileName = versionData[0].fileName;
    } else {
      // Descargar la versión actual
      const doc = await db.select()
        .from(documents)
        .where(eq(documents.id, parseInt(id)))
        .limit(1);
      
      if (doc.length === 0) {
        return res.status(404).json({ error: 'Documento no encontrado' });
      }
      
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
    console.error('Error al descargar documento:', error);
    res.status(500).json({ error: 'Error al descargar documento' });
  }
});

/**
 * Verificar un documento por código
 * GET /api/document-management/verify/:code
 */
documentManagementRouter.get('/verify/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    
    const doc = await db.select()
      .from(documents)
      .where(eq(documents.verificationCode, code))
      .limit(1);
    
    if (doc.length === 0) {
      return res.status(404).json({ 
        verified: false, 
        message: 'Documento no encontrado con este código de verificación' 
      });
    }
    
    res.json({
      verified: true,
      document: {
        id: doc[0].id,
        title: doc[0].title,
        description: doc[0].description,
        createdAt: doc[0].createdAt,
        status: doc[0].status
      }
    });
  } catch (error) {
    console.error('Error al verificar documento:', error);
    res.status(500).json({ error: 'Error al verificar documento' });
  }
});

/**
 * Crear una nueva categoría de documentos
 * POST /api/document-management/categories
 */
documentManagementRouter.post('/categories', isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user?.role || !['admin', 'certifier'].includes(req.user.role)) {
      return res.status(403).json({ error: 'No tiene permisos para crear categorías' });
    }
    
    const { name, description, icon, color, parentId } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
    }
    
    // Validar si ya existe una categoría con el mismo nombre
    const existingCategory = await db.select()
      .from(documentCategories)
      .where(eq(documentCategories.name, name))
      .limit(1);
    
    if (existingCategory.length > 0) {
      return res.status(409).json({ error: 'Ya existe una categoría con este nombre' });
    }
    
    // Crear la categoría
    const [newCategory] = await db.insert(documentCategories)
      .values({
        name,
        description: description || null,
        icon: icon || null,
        color: color || null,
        parentId: parentId ? parseInt(parentId) : null,
        metadata: JSON.stringify({
          createdBy: req.user.id,
          createdByUsername: req.user.username
        })
      })
      .returning();
    
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
});

/**
 * Actualizar una categoría existente
 * PUT /api/document-management/categories/:id
 */
documentManagementRouter.put('/categories/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user?.role || !['admin', 'certifier'].includes(req.user.role)) {
      return res.status(403).json({ error: 'No tiene permisos para editar categorías' });
    }
    
    const { id } = req.params;
    const { name, description, icon, color, parentId } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
    }
    
    // Verificar que la categoría existe
    const category = await db.select()
      .from(documentCategories)
      .where(eq(documentCategories.id, parseInt(id)))
      .limit(1);
    
    if (category.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    // Validar si ya existe otra categoría con el mismo nombre (que no sea la misma que estamos editando)
    const existingCategory = await db.select()
      .from(documentCategories)
      .where(
        and(
          eq(documentCategories.name, name),
          not(eq(documentCategories.id, parseInt(id)))
        )
      )
      .limit(1);
    
    if (existingCategory.length > 0) {
      return res.status(409).json({ error: 'Ya existe otra categoría con este nombre' });
    }
    
    // Actualizar la categoría
    const [updatedCategory] = await db.update(documentCategories)
      .set({
        name,
        description: description || null,
        icon: icon || null,
        color: color || null,
        parentId: parentId ? parseInt(parentId) : null,
        updatedAt: new Date()
      })
      .where(eq(documentCategories.id, parseInt(id)))
      .returning();
    
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

/**
 * Eliminar una categoría
 * DELETE /api/document-management/categories/:id
 */
documentManagementRouter.delete('/categories/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user?.role || !['admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Solo los administradores pueden eliminar categorías' });
    }
    
    const { id } = req.params;
    
    // Verificar que la categoría existe
    const category = await db.select()
      .from(documentCategories)
      .where(eq(documentCategories.id, parseInt(id)))
      .limit(1);
    
    if (category.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    // Verificar si hay documentos asociados a esta categoría
    const documentsInCategory = await db.select()
      .from(documents)
      .where(eq(documents.categoryId, parseInt(id)))
      .limit(1);
    
    if (documentsInCategory.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar esta categoría porque tiene documentos asociados',
        message: 'Debe reasignar o eliminar primero los documentos de esta categoría'
      });
    }
    
    // Eliminar la categoría
    await db.delete(documentCategories)
      .where(eq(documentCategories.id, parseInt(id)));
    
    res.status(200).json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
});

/**
 * Integración con el sistema de contratos
 */
documentManagementRouter.use('/contracts', contractRouter);

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