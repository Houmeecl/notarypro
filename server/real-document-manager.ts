/**
 * GESTOR DOCUMENTAL REAL COMPLETO
 * Sistema de gestión de documentos con funcionalidad real de base de datos
 */

import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { db } from './db';
import { eq, desc, and, or, like, sql, count } from 'drizzle-orm';
import { documents, users, documentCategories } from '@shared/schema';
import { authenticateJWT, requireRole } from './services/jwt-auth-service';

const realDocumentRouter = express.Router();

// Configuración de multer para subida real de archivos
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
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedName}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

/**
 * GET /api/real-documents/list
 * Obtener lista real de documentos desde base de datos
 */
realDocumentRouter.get('/list', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search = '', status = '', userId } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Construir query con filtros
    let query = db
      .select({
        id: documents.id,
        title: documents.title,
        documentType: documents.documentType,
        status: documents.status,
        filePath: documents.filePath,
        fileSize: documents.fileSize,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        userId: documents.userId,
        // Información del usuario
        userName: users.fullName,
        userEmail: users.email
      })
      .from(documents)
      .leftJoin(users, eq(documents.userId, users.id));

    // Aplicar filtros
    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          like(documents.title, `%${search}%`),
          like(documents.documentType, `%${search}%`),
          like(users.fullName, `%${search}%`)
        )
      );
    }
    
    if (status) {
      conditions.push(eq(documents.status, status as string));
    }
    
    if (userId) {
      conditions.push(eq(documents.userId, Number(userId)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const documentsList = await query
      .orderBy(desc(documents.createdAt))
      .limit(Number(limit))
      .offset(offset);

    // Contar total para paginación
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .leftJoin(users, eq(documents.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    res.json({
      success: true,
      documents: documentsList,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalResult?.count || 0,
        totalPages: Math.ceil((totalResult?.count || 0) / Number(limit))
      },
      filters: {
        search,
        status,
        userId
      }
    });

  } catch (error) {
    console.error('Error obteniendo lista de documentos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener documentos'
    });
  }
});

/**
 * POST /api/real-documents/upload
 * Subir documento real al sistema
 */
realDocumentRouter.post('/upload', authenticateJWT, upload.single('document'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó archivo'
      });
    }

    const { title, documentType, description } = req.body;
    const userId = req.user?.userId;

    if (!title || !documentType || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: title, documentType'
      });
    }

    // Calcular hash del archivo para integridad
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Guardar en base de datos
    const [newDocument] = await db.insert(documents).values({
      title,
      documentType,
      description: description || null,
      filePath: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      fileHash,
      status: 'uploaded',
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    res.status(201).json({
      success: true,
      message: 'Documento subido exitosamente',
      document: {
        id: newDocument.id,
        title: newDocument.title,
        documentType: newDocument.documentType,
        status: newDocument.status,
        fileName: newDocument.fileName,
        fileSize: newDocument.fileSize,
        createdAt: newDocument.createdAt
      }
    });

  } catch (error) {
    console.error('Error subiendo documento:', error);
    
    // Limpiar archivo si hubo error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: 'Error al subir documento'
    });
  }
});

/**
 * GET /api/real-documents/:id
 * Obtener documento específico con datos reales
 */
realDocumentRouter.get('/:id', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const documentId = Number(req.params.id);
    const userId = req.user?.userId;

    const [document] = await db
      .select({
        id: documents.id,
        title: documents.title,
        documentType: documents.documentType,
        description: documents.description,
        status: documents.status,
        filePath: documents.filePath,
        fileName: documents.fileName,
        fileSize: documents.fileSize,
        mimeType: documents.mimeType,
        fileHash: documents.fileHash,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        userId: documents.userId,
        // Información del usuario
        userName: users.fullName,
        userEmail: users.email,
        userRole: users.role
      })
      .from(documents)
      .leftJoin(users, eq(documents.userId, users.id))
      .where(eq(documents.id, documentId));

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Documento no encontrado'
      });
    }

    // Verificar permisos: solo el dueño, admin o certificador pueden ver
    const canView = document.userId === userId || 
                   req.user?.role === 'admin' || 
                   req.user?.role === 'certifier' ||
                   req.user?.role === 'notary';

    if (!canView) {
      return res.status(403).json({
        success: false,
        error: 'Sin permisos para ver este documento'
      });
    }

    res.json({
      success: true,
      document
    });

  } catch (error) {
    console.error('Error obteniendo documento:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener documento'
    });
  }
});

/**
 * GET /api/real-documents/:id/download
 * Descargar archivo real del documento
 */
realDocumentRouter.get('/:id/download', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const documentId = Number(req.params.id);
    const userId = req.user?.userId;

    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId));

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Documento no encontrado'
      });
    }

    // Verificar permisos
    const canDownload = document.userId === userId || 
                       req.user?.role === 'admin' || 
                       req.user?.role === 'certifier' ||
                       req.user?.role === 'notary';

    if (!canDownload) {
      return res.status(403).json({
        success: false,
        error: 'Sin permisos para descargar este documento'
      });
    }

    // Verificar que el archivo existe
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Archivo no encontrado en el sistema'
      });
    }

    // Configurar headers para descarga
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
    res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
    res.setHeader('Content-Length', document.fileSize?.toString() || '0');

    // Enviar archivo
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error descargando documento:', error);
    res.status(500).json({
      success: false,
      error: 'Error al descargar documento'
    });
  }
});

/**
 * PUT /api/real-documents/:id/status
 * Actualizar estado real del documento
 */
realDocumentRouter.put('/:id/status', authenticateJWT, requireRole(['admin', 'certifier', 'notary']), async (req: Request, res: Response) => {
  try {
    const documentId = Number(req.params.id);
    const { status, notes } = req.body;
    const userId = req.user?.userId;

    const validStatuses = ['uploaded', 'processing', 'certified', 'rejected', 'completed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Estado no válido'
      });
    }

    // Actualizar documento
    const [updatedDocument] = await db
      .update(documents)
      .set({
        status,
        updatedAt: new Date(),
        ...(notes && { description: notes })
      })
      .where(eq(documents.id, documentId))
      .returning();

    if (!updatedDocument) {
      return res.status(404).json({
        success: false,
        error: 'Documento no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Estado actualizado exitosamente',
      document: updatedDocument
    });

  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar estado'
    });
  }
});

/**
 * GET /api/real-documents/categories
 * Obtener categorías reales de documentos
 */
realDocumentRouter.get('/categories', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const categories = await db
      .select({
        id: documentCategories.id,
        name: documentCategories.name,
        description: documentCategories.description,
        documentCount: sql<number>`(
          SELECT COUNT(*) 
          FROM ${documents} 
          WHERE ${documents.documentType} = ${documentCategories.name}
        )`
      })
      .from(documentCategories)
      .orderBy(documentCategories.name);

    res.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener categorías'
    });
  }
});

/**
 * GET /api/real-documents/stats
 * Estadísticas reales de documentos
 */
realDocumentRouter.get('/stats', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === 'admin';

    // Estadísticas generales o por usuario
    const baseQuery = isAdmin ? 
      db.select({ count: sql<number>`count(*)` }).from(documents) :
      db.select({ count: sql<number>`count(*)` }).from(documents).where(eq(documents.userId, userId!));

    const [
      totalDocuments,
      uploadedDocs,
      processingDocs,
      certifiedDocs,
      rejectedDocs
    ] = await Promise.all([
      baseQuery,
      isAdmin ? 
        db.select({ count: sql<number>`count(*)` }).from(documents).where(eq(documents.status, 'uploaded')) :
        db.select({ count: sql<number>`count(*)` }).from(documents).where(and(eq(documents.status, 'uploaded'), eq(documents.userId, userId!))),
      isAdmin ?
        db.select({ count: sql<number>`count(*)` }).from(documents).where(eq(documents.status, 'processing')) :
        db.select({ count: sql<number>`count(*)` }).from(documents).where(and(eq(documents.status, 'processing'), eq(documents.userId, userId!))),
      isAdmin ?
        db.select({ count: sql<number>`count(*)` }).from(documents).where(eq(documents.status, 'certified')) :
        db.select({ count: sql<number>`count(*)` }).from(documents).where(and(eq(documents.status, 'certified'), eq(documents.userId, userId!))),
      isAdmin ?
        db.select({ count: sql<number>`count(*)` }).from(documents).where(eq(documents.status, 'rejected')) :
        db.select({ count: sql<number>`count(*)` }).from(documents).where(and(eq(documents.status, 'rejected'), eq(documents.userId, userId!)))
    ]);

    // Documentos por tipo
    const documentsByType = await db
      .select({
        type: documents.documentType,
        count: sql<number>`count(*)`
      })
      .from(documents)
      .where(isAdmin ? undefined : eq(documents.userId, userId!))
      .groupBy(documents.documentType)
      .orderBy(sql`count(*) DESC`);

    // Actividad reciente (últimos 30 días)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const recentActivity = await db
      .select({
        date: sql<string>`DATE(${documents.createdAt})`,
        count: sql<number>`count(*)`
      })
      .from(documents)
      .where(
        and(
          sql`${documents.createdAt} >= ${thirtyDaysAgo}`,
          isAdmin ? undefined : eq(documents.userId, userId!)
        )
      )
      .groupBy(sql`DATE(${documents.createdAt})`)
      .orderBy(sql`DATE(${documents.createdAt})`);

    res.json({
      success: true,
      stats: {
        total: totalDocuments[0]?.count || 0,
        uploaded: uploadedDocs[0]?.count || 0,
        processing: processingDocs[0]?.count || 0,
        certified: certifiedDocs[0]?.count || 0,
        rejected: rejectedDocs[0]?.count || 0
      },
      charts: {
        documentsByType,
        recentActivity
      },
      scope: isAdmin ? 'global' : 'user'
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    });
  }
});

/**
 * POST /api/real-documents/create-sample
 * Crear documentos de muestra para testing
 */
realDocumentRouter.post('/create-sample', authenticateJWT, requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId!;
    
    const sampleDocuments = [
      {
        title: 'Contrato de Arrendamiento - Ejemplo',
        documentType: 'Contrato',
        description: 'Contrato de arrendamiento de propiedad residencial',
        status: 'uploaded',
        fileName: 'contrato_arrendamiento.pdf',
        mimeType: 'application/pdf'
      },
      {
        title: 'Poder Notarial - Muestra',
        documentType: 'Poder',
        description: 'Poder notarial para representación legal',
        status: 'processing',
        fileName: 'poder_notarial.pdf',
        mimeType: 'application/pdf'
      },
      {
        title: 'Declaración Jurada - Demo',
        documentType: 'Declaración',
        description: 'Declaración jurada de ingresos',
        status: 'certified',
        fileName: 'declaracion_jurada.pdf',
        mimeType: 'application/pdf'
      },
      {
        title: 'Certificado de Nacimiento - Ejemplo',
        documentType: 'Certificado',
        description: 'Certificado de nacimiento oficial',
        status: 'completed',
        fileName: 'certificado_nacimiento.pdf',
        mimeType: 'application/pdf'
      },
      {
        title: 'Escritura de Compraventa - Muestra',
        documentType: 'Escritura',
        description: 'Escritura de compraventa de inmueble',
        status: 'uploaded',
        fileName: 'escritura_compraventa.pdf',
        mimeType: 'application/pdf'
      }
    ];

    const createdDocuments = [];

    for (const docData of sampleDocuments) {
      const [newDoc] = await db.insert(documents).values({
        ...docData,
        userId,
        filePath: `/uploads/samples/${docData.fileName}`,
        fileSize: Math.floor(Math.random() * 1000000) + 100000, // Tamaño simulado
        fileHash: crypto.randomBytes(32).toString('hex'),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
        updatedAt: new Date()
      }).returning();

      createdDocuments.push(newDoc);
    }

    res.status(201).json({
      success: true,
      message: `${createdDocuments.length} documentos de muestra creados`,
      documents: createdDocuments
    });

  } catch (error) {
    console.error('Error creando documentos de muestra:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear documentos de muestra'
    });
  }
});

/**
 * DELETE /api/real-documents/:id
 * Eliminar documento real del sistema
 */
realDocumentRouter.delete('/:id', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const documentId = Number(req.params.id);
    const userId = req.user?.userId;

    // Obtener documento
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId));

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Documento no encontrado'
      });
    }

    // Verificar permisos: solo el dueño o admin pueden eliminar
    const canDelete = document.userId === userId || req.user?.role === 'admin';

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        error: 'Sin permisos para eliminar este documento'
      });
    }

    // Eliminar archivo físico
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Eliminar de base de datos
    await db.delete(documents).where(eq(documents.id, documentId));

    res.json({
      success: true,
      message: 'Documento eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando documento:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar documento'
    });
  }
});

/**
 * GET /api/real-documents/pending-certification
 * Obtener documentos pendientes de certificación (para certificadores)
 */
realDocumentRouter.get('/pending-certification', authenticateJWT, requireRole(['certifier', 'admin', 'notary']), async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const pendingDocuments = await db
      .select({
        id: documents.id,
        title: documents.title,
        documentType: documents.documentType,
        description: documents.description,
        status: documents.status,
        fileName: documents.fileName,
        fileSize: documents.fileSize,
        createdAt: documents.createdAt,
        userId: documents.userId,
        // Información del usuario
        userName: users.fullName,
        userEmail: users.email
      })
      .from(documents)
      .leftJoin(users, eq(documents.userId, users.id))
      .where(or(
        eq(documents.status, 'uploaded'),
        eq(documents.status, 'processing')
      ))
      .orderBy(documents.createdAt)
      .limit(Number(limit));

    res.json({
      success: true,
      documents: pendingDocuments,
      count: pendingDocuments.length
    });

  } catch (error) {
    console.error('Error obteniendo documentos pendientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener documentos pendientes'
    });
  }
});

/**
 * POST /api/real-documents/:id/certify
 * Certificar documento real
 */
realDocumentRouter.post('/:id/certify', authenticateJWT, requireRole(['certifier', 'admin', 'notary']), async (req: Request, res: Response) => {
  try {
    const documentId = Number(req.params.id);
    const { notes, certificationLevel } = req.body;
    const certifierId = req.user?.userId;

    const [updatedDocument] = await db
      .update(documents)
      .set({
        status: 'certified',
        updatedAt: new Date(),
        description: notes || 'Documento certificado'
      })
      .where(eq(documents.id, documentId))
      .returning();

    if (!updatedDocument) {
      return res.status(404).json({
        success: false,
        error: 'Documento no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Documento certificado exitosamente',
      document: updatedDocument,
      certifiedBy: req.user?.fullName,
      certificationDate: new Date()
    });

  } catch (error) {
    console.error('Error certificando documento:', error);
    res.status(500).json({
      success: false,
      error: 'Error al certificar documento'
    });
  }
});

export { realDocumentRouter };