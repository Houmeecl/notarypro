"use strict";
/**
 * GESTOR DOCUMENTAL REAL COMPLETO
 * Sistema de gestión de documentos con funcionalidad real de base de datos
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.realDocumentRouter = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("@shared/schema");
const jwt_auth_service_1 = require("./services/jwt-auth-service");
const realDocumentRouter = express_1.default.Router();
exports.realDocumentRouter = realDocumentRouter;
// Configuración de multer para subida real de archivos
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(process.cwd(), 'uploads', 'documents');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${uniqueSuffix}-${sanitizedName}`);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt'];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        }
        else {
            cb(new Error('Tipo de archivo no permitido'));
        }
    }
});
/**
 * GET /api/real-documents/list
 * Obtener lista real de documentos desde base de datos
 */
realDocumentRouter.get('/list', jwt_auth_service_1.authenticateJWT, async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', status = '', userId } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        // Construir query con filtros
        let query = db_1.db
            .select({
            id: schema_1.documents.id,
            title: schema_1.documents.title,
            documentType: schema_1.documents.documentType,
            status: schema_1.documents.status,
            filePath: schema_1.documents.filePath,
            fileSize: schema_1.documents.fileSize,
            createdAt: schema_1.documents.createdAt,
            updatedAt: schema_1.documents.updatedAt,
            userId: schema_1.documents.userId,
            // Información del usuario
            userName: schema_1.users.fullName,
            userEmail: schema_1.users.email
        })
            .from(schema_1.documents)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.documents.userId, schema_1.users.id));
        // Aplicar filtros
        const conditions = [];
        if (search) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.documents.title, `%${search}%`), (0, drizzle_orm_1.like)(schema_1.documents.documentType, `%${search}%`), (0, drizzle_orm_1.like)(schema_1.users.fullName, `%${search}%`)));
        }
        if (status) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.documents.status, status));
        }
        if (userId) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.documents.userId, Number(userId)));
        }
        if (conditions.length > 0) {
            query = query.where((0, drizzle_orm_1.and)(...conditions));
        }
        const documentsList = await query
            .orderBy((0, drizzle_orm_1.desc)(schema_1.documents.createdAt))
            .limit(Number(limit))
            .offset(offset);
        // Contar total para paginación
        const [totalResult] = await db_1.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(schema_1.documents)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.documents.userId, schema_1.users.id))
            .where(conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined);
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
    }
    catch (error) {
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
realDocumentRouter.post('/upload', jwt_auth_service_1.authenticateJWT, upload.single('document'), async (req, res) => {
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
        const fileBuffer = fs_1.default.readFileSync(req.file.path);
        const fileHash = crypto_1.default.createHash('sha256').update(fileBuffer).digest('hex');
        // Guardar en base de datos
        const [newDocument] = await db_1.db.insert(schema_1.documents).values({
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
    }
    catch (error) {
        console.error('Error subiendo documento:', error);
        // Limpiar archivo si hubo error
        if (req.file && fs_1.default.existsSync(req.file.path)) {
            fs_1.default.unlinkSync(req.file.path);
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
realDocumentRouter.get('/:id', jwt_auth_service_1.authenticateJWT, async (req, res) => {
    try {
        const documentId = Number(req.params.id);
        const userId = req.user?.userId;
        const [document] = await db_1.db
            .select({
            id: schema_1.documents.id,
            title: schema_1.documents.title,
            documentType: schema_1.documents.documentType,
            description: schema_1.documents.description,
            status: schema_1.documents.status,
            filePath: schema_1.documents.filePath,
            fileName: schema_1.documents.fileName,
            fileSize: schema_1.documents.fileSize,
            mimeType: schema_1.documents.mimeType,
            fileHash: schema_1.documents.fileHash,
            createdAt: schema_1.documents.createdAt,
            updatedAt: schema_1.documents.updatedAt,
            userId: schema_1.documents.userId,
            // Información del usuario
            userName: schema_1.users.fullName,
            userEmail: schema_1.users.email,
            userRole: schema_1.users.role
        })
            .from(schema_1.documents)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.documents.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, documentId));
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
    }
    catch (error) {
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
realDocumentRouter.get('/:id/download', jwt_auth_service_1.authenticateJWT, async (req, res) => {
    try {
        const documentId = Number(req.params.id);
        const userId = req.user?.userId;
        const [document] = await db_1.db
            .select()
            .from(schema_1.documents)
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, documentId));
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
        if (!fs_1.default.existsSync(document.filePath)) {
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
        const fileStream = fs_1.default.createReadStream(document.filePath);
        fileStream.pipe(res);
    }
    catch (error) {
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
realDocumentRouter.put('/:id/status', jwt_auth_service_1.authenticateJWT, (0, jwt_auth_service_1.requireRole)(['admin', 'certifier', 'notary']), async (req, res) => {
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
        const [updatedDocument] = await db_1.db
            .update(schema_1.documents)
            .set({
            status,
            updatedAt: new Date(),
            ...(notes && { description: notes })
        })
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, documentId))
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
    }
    catch (error) {
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
realDocumentRouter.get('/categories', jwt_auth_service_1.authenticateJWT, async (req, res) => {
    try {
        const categories = await db_1.db
            .select({
            id: schema_1.documentCategories.id,
            name: schema_1.documentCategories.name,
            description: schema_1.documentCategories.description,
            documentCount: (0, drizzle_orm_1.sql) `(
          SELECT COUNT(*) 
          FROM ${schema_1.documents} 
          WHERE ${schema_1.documents.documentType} = ${schema_1.documentCategories.name}
        )`
        })
            .from(schema_1.documentCategories)
            .orderBy(schema_1.documentCategories.name);
        res.json({
            success: true,
            categories
        });
    }
    catch (error) {
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
realDocumentRouter.get('/stats', jwt_auth_service_1.authenticateJWT, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const isAdmin = req.user?.role === 'admin';
        // Estadísticas generales o por usuario
        const baseQuery = isAdmin ?
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.documents) :
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.documents).where((0, drizzle_orm_1.eq)(schema_1.documents.userId, userId));
        const [totalDocuments, uploadedDocs, processingDocs, certifiedDocs, rejectedDocs] = await Promise.all([
            baseQuery,
            isAdmin ?
                db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.documents).where((0, drizzle_orm_1.eq)(schema_1.documents.status, 'uploaded')) :
                db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.documents).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.documents.status, 'uploaded'), (0, drizzle_orm_1.eq)(schema_1.documents.userId, userId))),
            isAdmin ?
                db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.documents).where((0, drizzle_orm_1.eq)(schema_1.documents.status, 'processing')) :
                db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.documents).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.documents.status, 'processing'), (0, drizzle_orm_1.eq)(schema_1.documents.userId, userId))),
            isAdmin ?
                db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.documents).where((0, drizzle_orm_1.eq)(schema_1.documents.status, 'certified')) :
                db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.documents).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.documents.status, 'certified'), (0, drizzle_orm_1.eq)(schema_1.documents.userId, userId))),
            isAdmin ?
                db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.documents).where((0, drizzle_orm_1.eq)(schema_1.documents.status, 'rejected')) :
                db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.documents).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.documents.status, 'rejected'), (0, drizzle_orm_1.eq)(schema_1.documents.userId, userId)))
        ]);
        // Documentos por tipo
        const documentsByType = await db_1.db
            .select({
            type: schema_1.documents.documentType,
            count: (0, drizzle_orm_1.sql) `count(*)`
        })
            .from(schema_1.documents)
            .where(isAdmin ? undefined : (0, drizzle_orm_1.eq)(schema_1.documents.userId, userId))
            .groupBy(schema_1.documents.documentType)
            .orderBy((0, drizzle_orm_1.sql) `count(*) DESC`);
        // Actividad reciente (últimos 30 días)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentActivity = await db_1.db
            .select({
            date: (0, drizzle_orm_1.sql) `DATE(${schema_1.documents.createdAt})`,
            count: (0, drizzle_orm_1.sql) `count(*)`
        })
            .from(schema_1.documents)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${schema_1.documents.createdAt} >= ${thirtyDaysAgo}`, isAdmin ? undefined : (0, drizzle_orm_1.eq)(schema_1.documents.userId, userId)))
            .groupBy((0, drizzle_orm_1.sql) `DATE(${schema_1.documents.createdAt})`)
            .orderBy((0, drizzle_orm_1.sql) `DATE(${schema_1.documents.createdAt})`);
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
    }
    catch (error) {
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
realDocumentRouter.post('/create-sample', jwt_auth_service_1.authenticateJWT, (0, jwt_auth_service_1.requireRole)(['admin']), async (req, res) => {
    try {
        const userId = req.user?.userId;
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
            const [newDoc] = await db_1.db.insert(schema_1.documents).values({
                ...docData,
                userId,
                filePath: `/uploads/samples/${docData.fileName}`,
                fileSize: Math.floor(Math.random() * 1000000) + 100000, // Tamaño simulado
                fileHash: crypto_1.default.randomBytes(32).toString('hex'),
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
    }
    catch (error) {
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
realDocumentRouter.delete('/:id', jwt_auth_service_1.authenticateJWT, async (req, res) => {
    try {
        const documentId = Number(req.params.id);
        const userId = req.user?.userId;
        // Obtener documento
        const [document] = await db_1.db
            .select()
            .from(schema_1.documents)
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, documentId));
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
        if (fs_1.default.existsSync(document.filePath)) {
            fs_1.default.unlinkSync(document.filePath);
        }
        // Eliminar de base de datos
        await db_1.db.delete(schema_1.documents).where((0, drizzle_orm_1.eq)(schema_1.documents.id, documentId));
        res.json({
            success: true,
            message: 'Documento eliminado exitosamente'
        });
    }
    catch (error) {
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
realDocumentRouter.get('/pending-certification', jwt_auth_service_1.authenticateJWT, (0, jwt_auth_service_1.requireRole)(['certifier', 'admin', 'notary']), async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const pendingDocuments = await db_1.db
            .select({
            id: schema_1.documents.id,
            title: schema_1.documents.title,
            documentType: schema_1.documents.documentType,
            description: schema_1.documents.description,
            status: schema_1.documents.status,
            fileName: schema_1.documents.fileName,
            fileSize: schema_1.documents.fileSize,
            createdAt: schema_1.documents.createdAt,
            userId: schema_1.documents.userId,
            // Información del usuario
            userName: schema_1.users.fullName,
            userEmail: schema_1.users.email
        })
            .from(schema_1.documents)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.documents.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.documents.status, 'uploaded'), (0, drizzle_orm_1.eq)(schema_1.documents.status, 'processing')))
            .orderBy(schema_1.documents.createdAt)
            .limit(Number(limit));
        res.json({
            success: true,
            documents: pendingDocuments,
            count: pendingDocuments.length
        });
    }
    catch (error) {
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
realDocumentRouter.post('/:id/certify', jwt_auth_service_1.authenticateJWT, (0, jwt_auth_service_1.requireRole)(['certifier', 'admin', 'notary']), async (req, res) => {
    try {
        const documentId = Number(req.params.id);
        const { notes, certificationLevel } = req.body;
        const certifierId = req.user?.userId;
        const [updatedDocument] = await db_1.db
            .update(schema_1.documents)
            .set({
            status: 'certified',
            updatedAt: new Date(),
            description: notes || 'Documento certificado'
        })
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, documentId))
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
    }
    catch (error) {
        console.error('Error certificando documento:', error);
        res.status(500).json({
            success: false,
            error: 'Error al certificar documento'
        });
    }
});
