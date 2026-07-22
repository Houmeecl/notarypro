"use strict";
/**
 * Módulo de Gestión Documental Notarial
 *
 * Este módulo extiende el sistema de gestión documental principal para incluir
 * funcionalidades específicas para documentos notariales, certificaciones y trámites
 * legales utilizados en NotaryPro, pero accesibles desde todo el ecosistema.
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
exports.notaryDocumentRouter = void 0;
const express_1 = require("express");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const multer_1 = __importDefault(require("multer"));
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("@shared/schema");
const qrcode_1 = __importDefault(require("qrcode"));
const pdf_lib_1 = require("pdf-lib");
// Configuración de almacenamiento para documentos notariales
const storage = multer_1.default.diskStorage({
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
const upload = (0, multer_1.default)({
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
        }
        else {
            cb(new Error('Tipo de archivo no soportado. Por favor suba PDF, documentos de Word o imágenes.'), false);
        }
    }
});
// Crear router para documentos notariales
exports.notaryDocumentRouter = (0, express_1.Router)();
// Funciones de autorización
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Acceso no autorizado' });
}
function isCertifier(req, res, next) {
    if (req.isAuthenticated() && (req.user?.role === 'certifier' || req.user?.role === 'admin')) {
        return next();
    }
    res.status(403).json({ error: 'Se requiere rol de certificador' });
}
function isNotary(req, res, next) {
    if (req.isAuthenticated() && (req.user?.role === 'notary' || req.user?.role === 'admin')) {
        return next();
    }
    res.status(403).json({ error: 'Se requiere rol de notario' });
}
function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user?.role === 'admin') {
        return next();
    }
    res.status(403).json({ error: 'Se requiere rol de administrador' });
}
/**
 * Obtener plantillas de documentos notariales
 * GET /api/notary-documents/templates
 */
exports.notaryDocumentRouter.get('/templates', async (req, res) => {
    try {
        const templates = await db_1.db.select().from(schema_1.notaryTemplates).orderBy(schema_1.notaryTemplates.name);
        res.json(templates);
    }
    catch (error) {
        console.error('Error al obtener plantillas notariales:', error);
        res.status(500).json({ error: 'Error al obtener plantillas' });
    }
});
/**
 * Obtener documentos pendientes de certificación
 * GET /api/notary-documents/pending
 */
exports.notaryDocumentRouter.get('/pending', isCertifier, async (req, res) => {
    try {
        const pendingDocs = await db_1.db.select({
            document: schema_1.notaryDocuments,
            user: {
                id: schema_1.users.id,
                username: schema_1.users.username,
                fullName: schema_1.users.fullName,
                email: schema_1.users.email
            }
        })
            .from(schema_1.notaryDocuments)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.notaryDocuments.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.eq)(schema_1.notaryDocuments.status, 'pending'))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.notaryDocuments.createdAt));
        res.json(pendingDocs);
    }
    catch (error) {
        console.error('Error al obtener documentos pendientes:', error);
        res.status(500).json({ error: 'Error al obtener documentos pendientes' });
    }
});
/**
 * Obtener documentos certificados por un usuario
 * GET /api/notary-documents/my-documents
 */
exports.notaryDocumentRouter.get('/my-documents', isAuthenticated, async (req, res) => {
    try {
        const userDocs = await db_1.db.select()
            .from(schema_1.notaryDocuments)
            .where((0, drizzle_orm_1.eq)(schema_1.notaryDocuments.userId, req.user.id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.notaryDocuments.createdAt));
        res.json(userDocs);
    }
    catch (error) {
        console.error('Error al obtener documentos del usuario:', error);
        res.status(500).json({ error: 'Error al obtener documentos' });
    }
});
/**
 * Subir un documento para certificación
 * POST /api/notary-documents/upload
 */
exports.notaryDocumentRouter.post('/upload', isAuthenticated, upload.single('file'), async (req, res) => {
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
        const [newDoc] = await db_1.db.insert(schema_1.notaryDocuments)
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
        const [generalDoc] = await db_1.db.insert(schema_1.documents)
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
        await db_1.db.update(schema_1.notaryDocuments)
            .set({ documentId: generalDoc.id })
            .where((0, drizzle_orm_1.eq)(schema_1.notaryDocuments.id, newDoc.id));
        res.status(201).json({
            message: 'Documento enviado para certificación exitosamente',
            document: {
                ...newDoc,
                documentId: generalDoc.id
            }
        });
    }
    catch (error) {
        console.error('Error al subir documento notarial:', error);
        res.status(500).json({ error: 'Error al subir documento' });
    }
});
/**
 * Certificar un documento
 * POST /api/notary-documents/:id/certify
 */
exports.notaryDocumentRouter.post('/:id/certify', isCertifier, upload.single('signedFile'), async (req, res) => {
    try {
        const { id } = req.params;
        const { certificationNote, certificationMethod } = req.body;
        // Verificar si el documento existe
        const doc = await db_1.db.select()
            .from(schema_1.notaryDocuments)
            .where((0, drizzle_orm_1.eq)(schema_1.notaryDocuments.id, parseInt(id)))
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
        }
        else if (doc[0].fileType === 'application/pdf') {
            // Agregar sello de certificación al PDF
            try {
                const modifiedPdfPath = await addCertificationToPdf(doc[0].filePath, req.user, doc[0].verificationCode);
                if (modifiedPdfPath) {
                    certifiedFilePath = modifiedPdfPath;
                    certifiedFileName = `certified_${doc[0].fileName}`;
                }
            }
            catch (pdfError) {
                console.error('Error al modificar PDF:', pdfError);
                // Continuar con el archivo original si hay error
            }
        }
        // Crear registro de certificación
        const [certification] = await db_1.db.insert(schema_1.notaryCertifications)
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
        await db_1.db.update(schema_1.notaryDocuments)
            .set({
            status: 'certified',
            certifiedBy: req.user.id,
            certifiedAt: new Date(),
            certifiedFilePath,
            certifiedFileName
        })
            .where((0, drizzle_orm_1.eq)(schema_1.notaryDocuments.id, parseInt(id)));
        // Actualizar también el documento general
        if (doc[0].documentId) {
            await db_1.db.update(schema_1.documents)
                .set({
                status: 'certified',
                filePath: certifiedFilePath,
                fileName: certifiedFileName,
                updatedAt: new Date(),
                updatedBy: req.user.id
            })
                .where((0, drizzle_orm_1.eq)(schema_1.documents.id, doc[0].documentId));
        }
        res.json({
            message: 'Documento certificado exitosamente',
            certification
        });
    }
    catch (error) {
        console.error('Error al certificar documento:', error);
        res.status(500).json({ error: 'Error al certificar documento' });
    }
});
/**
 * Verificar un documento notarial por código
 * GET /api/notary-documents/verify/:code
 */
exports.notaryDocumentRouter.get('/verify/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const doc = await db_1.db.select({
            document: schema_1.notaryDocuments,
            certifier: {
                fullName: schema_1.users.fullName,
                username: schema_1.users.username
            }
        })
            .from(schema_1.notaryDocuments)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.notaryDocuments.certifiedBy, schema_1.users.id))
            .where((0, drizzle_orm_1.eq)(schema_1.notaryDocuments.verificationCode, code))
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
    }
    catch (error) {
        console.error('Error al verificar documento notarial:', error);
        res.status(500).json({ error: 'Error al verificar documento' });
    }
});
/**
 * Descargar un documento notarial
 * GET /api/notary-documents/:id/download
 */
exports.notaryDocumentRouter.get('/:id/download', async (req, res) => {
    try {
        const { id } = req.params;
        const { certified } = req.query;
        const doc = await db_1.db.select()
            .from(schema_1.notaryDocuments)
            .where((0, drizzle_orm_1.eq)(schema_1.notaryDocuments.id, parseInt(id)))
            .limit(1);
        if (doc.length === 0) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }
        let filePath, fileName;
        if (certified === 'true' && doc[0].status === 'certified') {
            // Descargar versión certificada
            filePath = doc[0].certifiedFilePath;
            fileName = doc[0].certifiedFileName;
        }
        else {
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
    }
    catch (error) {
        console.error('Error al descargar documento notarial:', error);
        res.status(500).json({ error: 'Error al descargar documento' });
    }
});
/**
 * Generar QR de verificación para un documento
 * GET /api/notary-documents/:id/qr
 */
exports.notaryDocumentRouter.get('/:id/qr', async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db_1.db.select()
            .from(schema_1.notaryDocuments)
            .where((0, drizzle_orm_1.eq)(schema_1.notaryDocuments.id, parseInt(id)))
            .limit(1);
        if (doc.length === 0) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }
        // Generar URL de verificación
        const baseUrl = process.env.BASE_URL || 'https://notarypro.io';
        const verificationUrl = `${baseUrl}/verificar-documento?code=${doc[0].verificationCode}`;
        // Generar QR como PNG
        const qrCode = await qrcode_1.default.toDataURL(verificationUrl, {
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
    }
    catch (error) {
        console.error('Error al generar QR:', error);
        res.status(500).json({ error: 'Error al generar código QR' });
    }
});
/**
 * Agregar sello de certificación a un PDF
 */
async function addCertificationToPdf(filePath, certifier, verificationCode) {
    try {
        const pdfBytes = fs.readFileSync(filePath);
        const pdfDoc = await pdf_lib_1.PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        const lastPage = pages[pages.length - 1];
        const { width, height } = lastPage.getSize();
        // Generar QR code para verificación
        const baseUrl = process.env.BASE_URL || 'https://notarypro.io';
        const verificationUrl = `${baseUrl}/verificar-documento?code=${verificationCode}`;
        const qrCodeDataUrl = await qrcode_1.default.toDataURL(verificationUrl);
        const qrCodeImageData = qrCodeDataUrl.split(',')[1];
        const qrCodeImage = await pdfDoc.embedPng(Buffer.from(qrCodeImageData, 'base64'));
        // Añadir texto y QR code al final del documento
        const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
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
            color: (0, pdf_lib_1.rgb)(0.18, 0.13, 0.61), // #2d219b
        });
        lastPage.drawText(`Certificado por: ${certifier.fullName}`, {
            x: 50,
            y: 100,
            size: 10,
            font: font,
            color: (0, pdf_lib_1.rgb)(0.18, 0.13, 0.61), // #2d219b
        });
        lastPage.drawText(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, {
            x: 50,
            y: 80,
            size: 10,
            font: font,
            color: (0, pdf_lib_1.rgb)(0.18, 0.13, 0.61), // #2d219b
        });
        lastPage.drawText(`Código de verificación: ${verificationCode}`, {
            x: 50,
            y: 60,
            size: 10,
            font: font,
            color: (0, pdf_lib_1.rgb)(0.18, 0.13, 0.61), // #2d219b
        });
        lastPage.drawText('Escanee el código QR para verificar la autenticidad', {
            x: width - qrCodeDimension - 50,
            y: 35,
            size: 8,
            font: font,
            color: (0, pdf_lib_1.rgb)(0.18, 0.13, 0.61), // #2d219b
        });
        // Guardar el PDF modificado
        const modifiedPdfBytes = await pdfDoc.save();
        const outputPath = filePath.replace('.pdf', `_certified_${Date.now()}.pdf`);
        fs.writeFileSync(outputPath, modifiedPdfBytes);
        return outputPath;
    }
    catch (error) {
        console.error('Error al añadir certificación al PDF:', error);
        return null;
    }
}
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
