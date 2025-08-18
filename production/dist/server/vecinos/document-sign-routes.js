"use strict";
/**
 * Rutas para firma electrónica avanzada de VecinoXpress
 *
 * Estas rutas permiten a los socios de VecinoXpress (tiendas de barrio)
 * gestionar la firma electrónica avanzada de documentos mediante
 * la integración con Zoho Sign y tokens criptográficos (eToken).
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const db_1 = require("../db"); // ✅ Importar desde ../db
const uuid_1 = require("uuid");
// import { partners, documents, partnerTransactions } from '@shared/vecinos-schema'; // ✅ COMENTADO
const drizzle_orm_1 = require("drizzle-orm");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// import * as ZohoSignService from '../services/zoho-sign-service'; // ✅ COMENTADO TEMPORALMENTE
// import { checkTokenAvailability, signWithToken } from '../lib/etoken-signer'; // ✅ COMENTADO TEMPORALMENTE
// ✅ Definición temporal de partnerTransactions (hasta que arregles el schema)
const pg_core_1 = require("drizzle-orm/pg-core");
const partnerTransactions = (0, pg_core_1.pgTable)('partner_transactions', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    partnerId: (0, pg_core_1.integer)('partner_id').notNull(),
    documentId: (0, pg_core_1.integer)('document_id'),
    amount: (0, pg_core_1.integer)('amount').notNull(),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).default('pending'),
    description: (0, pg_core_1.text)('description'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    completedAt: (0, pg_core_1.timestamp)('completed_at')
});
// Configuración de multer para recibir archivos
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(process.cwd(), 'uploads/vecinos/documents'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = (0, multer_1.default)({
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
        }
        else {
            cb(new Error('Tipo de archivo no permitido. Solo se permiten PDF y documentos de Office.'));
        }
    }
});
// Middleware para verificar el token JWT de Vecinos
const authenticateJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
            const user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'vecinos-secret');
            req.user = user;
            next();
        }
        catch (error) {
            return res.sendStatus(403);
        }
    }
    else {
        res.sendStatus(401);
    }
};
// Middleware para verificar si el usuario es un socio Vecinos
const isPartner = async (req, res, next) => {
    if (!req.user || req.user.role !== 'partner') {
        return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de socio.' });
    }
    next();
};
// Router de firma electrónica de documentos
const router = express_1.default.Router();
// Middleware de autenticación para todas las rutas
router.use(authenticateJWT);
/**
 * Comprueba la disponibilidad del servicio Zoho Sign
 * GET /api/vecinos/document-sign/check-service
 */
router.get('/check-service', async (req, res) => {
    try {
        // ✅ TEMPORALMENTE COMENTADO - descomentar cuando tengas los servicios
        // const isAuthenticated = await ZohoSignService.verifyZohoAuthentication();
        res.json({
            zoho_sign_available: false, // Temporalmente false
            etoken_available: false, // await checkTokenAvailability()
            message: 'Servicios de firma temporalmente deshabilitados'
        });
    }
    catch (error) {
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
router.post('/upload', isPartner, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha subido ningún documento' });
        }
        const { title, documentType, clientName, clientRut, clientPhone, clientEmail, price } = req.body;
        // Validar campos obligatorios
        if (!title || !documentType || !clientName || !clientRut || !clientPhone) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }
        // Generar código de verificación único
        const verificationCode = (0, uuid_1.v4)().substring(0, 8).toUpperCase();
        // ✅ USAR TABLA DE db.ts EN LUGAR DE @shared/vecinos-schema
        const [newDocument] = await db_1.db.insert(db_1.documents).values({
            userId: req.user.id, // Usar userId en lugar de partnerId temporalmente
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
    }
    catch (error) {
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
router.get('/documents', isPartner, async (req, res) => {
    try {
        const { status, startDate, endDate, page = '1', limit = '10' } = req.query;
        // ✅ USAR TABLA DE db.ts
        let query = db_1.db.select().from(db_1.documents).where((0, drizzle_orm_1.eq)(db_1.documents.userId, req.user.id) // Usar userId temporalmente
        );
        // Filtrar por estado
        if (status) {
            query = query.where((0, drizzle_orm_1.eq)(db_1.documents.status, status));
        }
        // Paginación
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const offset = (pageNum - 1) * limitNum;
        // Ejecutar consulta con límite y offset
        const documentsResults = await query.limit(limitNum).offset(offset).orderBy((0, drizzle_orm_1.desc)(db_1.documents.createdAt));
        res.json({
            documents: documentsResults,
            pagination: {
                total: documentsResults.length,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(documentsResults.length / limitNum)
            }
        });
    }
    catch (error) {
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
router.get('/documents/:documentId', isPartner, async (req, res) => {
    try {
        const { documentId } = req.params;
        // ✅ USAR TABLA DE db.ts
        const [document] = await db_1.db.select().from(db_1.documents).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.documents.id, parseInt(documentId, 10)), (0, drizzle_orm_1.eq)(db_1.documents.userId, req.user.id) // Usar userId temporalmente
        ));
        if (!document) {
            return res.status(404).json({ message: 'Documento no encontrado' });
        }
        res.json({
            document
        });
    }
    catch (error) {
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
exports.default = router;
