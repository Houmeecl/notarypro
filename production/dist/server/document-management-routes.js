"use strict";
/**
 * Sistema de Gestión Documental Unificado
 *
 * Este módulo proporciona una API centralizada para la gestión de documentos
 * en todo el ecosistema VecinoXpress, permitiendo acceso desde todas las interfaces
 * (POS, web, móvil, etc.)
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentManagementRouter = void 0;
const express_1 = require("express");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const multer_1 = __importDefault(require("multer"));
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
const document_schema_1 = require("@shared/document-schema");
const contract_routes_1 = require("./contract-routes");
// Configuración de almacenamiento para documentos subidos
const storage = multer_1.default.diskStorage({
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
const upload = (0, multer_1.default)({
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
        }
        else {
            cb(new Error('Tipo de archivo no soportado. Por favor suba PDF o documentos de Office.'), false);
        }
    }
});
// Crear router principal para la gestión documental
exports.documentManagementRouter = (0, express_1.Router)();
// Función para verificar autenticación
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Acceso no autorizado' });
}
/**
 * Obtener categorías de documentos
 * GET /api/document-management/categories
 */
exports.documentManagementRouter.get('/categories', async (req, res) => {
    try {
        // Usamos documentCategories de nuestro nuevo esquema
        const categories = await db_1.db.select().from(document_schema_1.documentCategories).orderBy(document_schema_1.documentCategories.name);
        // Incluir categorías ya existentes si existen
        try {
            const existingCats = await db_1.db.select().from(document_schema_1.documentCategories).orderBy(document_schema_1.documentCategories.name);
            // Combinar categorías existentes con las nuevas
            const combinedCategories = [...categories];
            // Solo agregamos categorías que no coincidan por nombre
            for (const existingCat of existingCats) {
                if (!categories.some(cat => cat.name === existingCat.name)) {
                    combinedCategories.push(existingCat);
                }
            }
            res.json(combinedCategories);
        }
        catch (e) {
            // Si hay error al obtener categorías existentes, solo devolver las nuevas
            console.log('Usando solo categorías del nuevo esquema:', e);
            res.json(categories);
        }
    }
    catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
});
/**
 * Obtener documentos por categoría
 * GET /api/document-management/documents/category/:categoryId
 */
exports.documentManagementRouter.get('/documents/category/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const docs = await db_1.db.select()
            .from(document_schema_1.documents)
            .where((0, drizzle_orm_1.eq)(document_schema_1.documents.categoryId, parseInt(categoryId)))
            .orderBy((0, drizzle_orm_1.desc)(document_schema_1.documents.createdAt));
        res.json(docs);
    }
    catch (error) {
        console.error('Error al obtener documentos por categoría:', error);
        res.status(500).json({ error: 'Error al obtener documentos' });
    }
});
/**
 * Búsqueda de documentos
 * GET /api/document-management/documents/search?q=texto
 */
exports.documentManagementRouter.get('/documents/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ error: 'Término de búsqueda requerido' });
        }
        const searchTerm = `%${q}%`;
        const results = await db_1.db.select()
            .from(document_schema_1.documents)
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(document_schema_1.documents.title, searchTerm), (0, drizzle_orm_1.like)(document_schema_1.documents.description, searchTerm), (0, drizzle_orm_1.like)(document_schema_1.documents.metadata, searchTerm)))
            .orderBy((0, drizzle_orm_1.desc)(document_schema_1.documents.createdAt));
        res.json(results);
    }
    catch (error) {
        console.error('Error en búsqueda de documentos:', error);
        res.status(500).json({ error: 'Error al buscar documentos' });
    }
});
/**
 * Obtener documentos recientes
 * GET /api/document-management/documents/recent
 */
exports.documentManagementRouter.get('/documents/recent', async (req, res) => {
    try {
        const recentDocs = await db_1.db.select()
            .from(document_schema_1.documents)
            .orderBy((0, drizzle_orm_1.desc)(document_schema_1.documents.createdAt))
            .limit(20);
        res.json(recentDocs);
    }
    catch (error) {
        console.error('Error al obtener documentos recientes:', error);
        res.status(500).json({ error: 'Error al obtener documentos recientes' });
    }
});
/**
 * Obtener un documento específico con sus versiones
 * GET /api/document-management/documents/:id
 */
exports.documentManagementRouter.get('/documents/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db_1.db.select()
            .from(document_schema_1.documents)
            .where((0, drizzle_orm_1.eq)(document_schema_1.documents.id, parseInt(id)))
            .limit(1);
        if (doc.length === 0) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }
        // Obtener versiones del documento
        const versions = await db_1.db.select()
            .from(document_schema_1.documentVersions)
            .where((0, drizzle_orm_1.eq)(document_schema_1.documentVersions.documentId, parseInt(id)))
            .orderBy((0, drizzle_orm_1.desc)(document_schema_1.documentVersions.version));
        res.json({
            document: doc[0],
            versions
        });
    }
    catch (error) {
        console.error('Error al obtener documento:', error);
        res.status(500).json({ error: 'Error al obtener documento' });
    }
});
/**
 * Subir un nuevo documento
 * POST /api/document-management/documents
 */
exports.documentManagementRouter.post('/documents', isAuthenticated, upload.single('file'), async (req, res) => {
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
        const [newDoc] = await db_1.db.insert(document_schema_1.documents)
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
        await db_1.db.insert(document_schema_1.documentVersions)
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
                await db_1.db.insert(document_schema_1.documentTags)
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
    }
    catch (error) {
        console.error('Error al crear documento:', error);
        res.status(500).json({ error: 'Error al crear documento' });
    }
});
/**
 * Subir una nueva versión de un documento existente
 * POST /api/document-management/documents/:id/versions
 */
exports.documentManagementRouter.post('/documents/:id/versions', isAuthenticated, upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const { changes } = req.body;
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
        }
        // Verificar que el documento existe
        const doc = await db_1.db.select()
            .from(document_schema_1.documents)
            .where((0, drizzle_orm_1.eq)(document_schema_1.documents.id, parseInt(id)))
            .limit(1);
        if (doc.length === 0) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }
        // Obtener la última versión
        const latestVersion = await db_1.db.select()
            .from(document_schema_1.documentVersions)
            .where((0, drizzle_orm_1.eq)(document_schema_1.documentVersions.documentId, parseInt(id)))
            .orderBy((0, drizzle_orm_1.desc)(document_schema_1.documentVersions.version))
            .limit(1);
        const newVersionNumber = latestVersion.length > 0 ? latestVersion[0].version + 1 : 1;
        // Crear la nueva versión
        const [newVersion] = await db_1.db.insert(document_schema_1.documentVersions)
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
        await db_1.db.update(document_schema_1.documents)
            .set({
            filePath: req.file.path,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            fileType: req.file.mimetype,
            updatedAt: new Date(),
            updatedBy: req.user?.id
        })
            .where((0, drizzle_orm_1.eq)(document_schema_1.documents.id, parseInt(id)));
        res.status(200).json({
            message: 'Nueva versión creada exitosamente',
            version: newVersion
        });
    }
    catch (error) {
        console.error('Error al crear nueva versión:', error);
        res.status(500).json({ error: 'Error al crear nueva versión' });
    }
});
/**
 * Descargar un documento específico
 * GET /api/document-management/documents/:id/download
 */
exports.documentManagementRouter.get('/documents/:id/download', async (req, res) => {
    try {
        const { id } = req.params;
        const { version } = req.query;
        let filePath, fileName;
        if (version && typeof version === 'string') {
            // Descargar una versión específica
            const versionData = await db_1.db.select()
                .from(document_schema_1.documentVersions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(document_schema_1.documentVersions.documentId, parseInt(id)), (0, drizzle_orm_1.eq)(document_schema_1.documentVersions.version, parseInt(version))))
                .limit(1);
            if (versionData.length === 0) {
                return res.status(404).json({ error: 'Versión no encontrada' });
            }
            filePath = versionData[0].filePath;
            fileName = versionData[0].fileName;
        }
        else {
            // Descargar la versión actual
            const doc = await db_1.db.select()
                .from(document_schema_1.documents)
                .where((0, drizzle_orm_1.eq)(document_schema_1.documents.id, parseInt(id)))
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
    }
    catch (error) {
        console.error('Error al descargar documento:', error);
        res.status(500).json({ error: 'Error al descargar documento' });
    }
});
/**
 * Verificar un documento por código
 * GET /api/document-management/verify/:code
 */
exports.documentManagementRouter.get('/verify/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const doc = await db_1.db.select()
            .from(document_schema_1.documents)
            .where((0, drizzle_orm_1.eq)(document_schema_1.documents.verificationCode, code))
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
    }
    catch (error) {
        console.error('Error al verificar documento:', error);
        res.status(500).json({ error: 'Error al verificar documento' });
    }
});
/**
 * Crear una nueva categoría de documentos
 * POST /api/document-management/categories
 */
exports.documentManagementRouter.post('/categories', isAuthenticated, async (req, res) => {
    try {
        if (!req.user?.role || !['admin', 'certifier'].includes(req.user.role)) {
            return res.status(403).json({ error: 'No tiene permisos para crear categorías' });
        }
        const { name, description, icon, color, parentId } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
        }
        // Validar si ya existe una categoría con el mismo nombre
        const existingCategory = await db_1.db.select()
            .from(document_schema_1.documentCategories)
            .where((0, drizzle_orm_1.eq)(document_schema_1.documentCategories.name, name))
            .limit(1);
        if (existingCategory.length > 0) {
            return res.status(409).json({ error: 'Ya existe una categoría con este nombre' });
        }
        // Crear la categoría
        const [newCategory] = await db_1.db.insert(document_schema_1.documentCategories)
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
    }
    catch (error) {
        console.error('Error al crear categoría:', error);
        res.status(500).json({ error: 'Error al crear categoría' });
    }
});
/**
 * Actualizar una categoría existente
 * PUT /api/document-management/categories/:id
 */
exports.documentManagementRouter.put('/categories/:id', isAuthenticated, async (req, res) => {
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
        const category = await db_1.db.select()
            .from(document_schema_1.documentCategories)
            .where((0, drizzle_orm_1.eq)(document_schema_1.documentCategories.id, parseInt(id)))
            .limit(1);
        if (category.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        // Validar si ya existe otra categoría con el mismo nombre (que no sea la misma que estamos editando)
        const existingCategory = await db_1.db.select()
            .from(document_schema_1.documentCategories)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(document_schema_1.documentCategories.name, name), not((0, drizzle_orm_1.eq)(document_schema_1.documentCategories.id, parseInt(id)))))
            .limit(1);
        if (existingCategory.length > 0) {
            return res.status(409).json({ error: 'Ya existe otra categoría con este nombre' });
        }
        // Actualizar la categoría
        const [updatedCategory] = await db_1.db.update(document_schema_1.documentCategories)
            .set({
            name,
            description: description || null,
            icon: icon || null,
            color: color || null,
            parentId: parentId ? parseInt(parentId) : null,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(document_schema_1.documentCategories.id, parseInt(id)))
            .returning();
        res.status(200).json(updatedCategory);
    }
    catch (error) {
        console.error('Error al actualizar categoría:', error);
        res.status(500).json({ error: 'Error al actualizar categoría' });
    }
});
/**
 * Eliminar una categoría
 * DELETE /api/document-management/categories/:id
 */
exports.documentManagementRouter.delete('/categories/:id', isAuthenticated, async (req, res) => {
    try {
        if (!req.user?.role || !['admin'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Solo los administradores pueden eliminar categorías' });
        }
        const { id } = req.params;
        // Verificar que la categoría existe
        const category = await db_1.db.select()
            .from(document_schema_1.documentCategories)
            .where((0, drizzle_orm_1.eq)(document_schema_1.documentCategories.id, parseInt(id)))
            .limit(1);
        if (category.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        // Verificar si hay documentos asociados a esta categoría
        const documentsInCategory = await db_1.db.select()
            .from(document_schema_1.documents)
            .where((0, drizzle_orm_1.eq)(document_schema_1.documents.categoryId, parseInt(id)))
            .limit(1);
        if (documentsInCategory.length > 0) {
            return res.status(400).json({
                error: 'No se puede eliminar esta categoría porque tiene documentos asociados',
                message: 'Debe reasignar o eliminar primero los documentos de esta categoría'
            });
        }
        // Eliminar la categoría
        await db_1.db.delete(document_schema_1.documentCategories)
            .where((0, drizzle_orm_1.eq)(document_schema_1.documentCategories.id, parseInt(id)));
        res.status(200).json({ message: 'Categoría eliminada correctamente' });
    }
    catch (error) {
        console.error('Error al eliminar categoría:', error);
        res.status(500).json({ error: 'Error al eliminar categoría' });
    }
});
/**
 * Integración con el sistema de contratos
 */
exports.documentManagementRouter.use('/contracts', contract_routes_1.contractRouter);
/**
 * Generar un código de verificación único
 * @returns Código de verificación
 */
function generateVerificationCode() {
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
