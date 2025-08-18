"use strict";
/**
 * Rutas para Documentos Seguros
 *
 * Este módulo implementa los endpoints relacionados con el almacenamiento
 * seguro, firma electrónica avanzada y verificación de identidad para documentos.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.secureDocumentRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db_1 = require("../db");
const schema_1 = require("@shared/schema");
const drizzle_orm_1 = require("drizzle-orm");
const advanced_signature_1 = require("../services/advanced-signature");
const secure_storage_1 = require("../services/secure-storage");
const identity_verification_1 = require("../services/identity-verification");
const qr_verification_1 = require("../services/qr-verification");
const audit_logger_1 = require("../services/audit-logger");
// Configuración de Multer para almacenamiento temporal de archivos
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(process.cwd(), 'uploads', 'temp');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});
const upload = (0, multer_1.default)({ storage });
exports.secureDocumentRouter = (0, express_1.Router)();
// Middleware para verificar autenticación
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ success: false, message: 'No autenticado' });
}
/**
 * Iniciar verificación de identidad
 * POST /api/secure-documents/verify-identity
 */
exports.secureDocumentRouter.post('/verify-identity', isAuthenticated, async (req, res) => {
    try {
        const { type = 'combined', provider } = req.body;
        const userId = req.user.id;
        // Iniciar verificación de identidad
        const verificationResult = await identity_verification_1.identityVerificationService.initVerification(userId, type, provider);
        // Registrar acción en logs de auditoría
        await audit_logger_1.auditLogService.logIdentityAction(audit_logger_1.AuditActionType.IDENTITY_VERIFICATION_INITIATED, userId, {
            provider: verificationResult.provider,
            type,
            success: verificationResult.success
        }, req);
        res.json(verificationResult);
    }
    catch (error) {
        console.error('Error al iniciar verificación de identidad:', error);
        res.status(500).json({
            success: false,
            message: 'Error al iniciar la verificación de identidad',
            error: error.message
        });
    }
});
/**
 * Verificar estado de verificación de identidad
 * GET /api/secure-documents/verify-identity/:verificationId
 */
exports.secureDocumentRouter.get('/verify-identity/:verificationId', isAuthenticated, async (req, res) => {
    try {
        const { verificationId } = req.params;
        const userId = req.user.id;
        // Verificar estado
        const status = await identity_verification_1.identityVerificationService.checkVerificationStatus(verificationId);
        // Obtener detalles
        const details = await identity_verification_1.identityVerificationService.getVerificationDetails(verificationId);
        res.json({
            success: true,
            status,
            details
        });
    }
    catch (error) {
        console.error('Error al verificar estado de identidad:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar estado de identidad',
            error: error.message
        });
    }
});
/**
 * Iniciar firma electrónica avanzada
 * POST /api/secure-documents/sign/:documentId
 */
exports.secureDocumentRouter.post('/sign/:documentId', isAuthenticated, async (req, res) => {
    try {
        const { documentId } = req.params;
        const { type = 'advanced', provider } = req.body;
        const userId = req.user.id;
        // Verificar que el documento existe
        const [document] = await db_1.db
            .select()
            .from(schema_1.documents)
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, parseInt(documentId)));
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Documento no encontrado'
            });
        }
        // Iniciar firma
        const signatureResult = await advanced_signature_1.electronicSignatureService.initSignature(parseInt(documentId), userId, type, provider);
        // Registrar acción en logs de auditoría
        await audit_logger_1.auditLogService.logSignatureAction(audit_logger_1.AuditActionType.SIGNATURE_INITIATED, userId, parseInt(documentId), {
            provider: signatureResult.provider,
            type,
            success: signatureResult.success
        }, req);
        res.json(signatureResult);
    }
    catch (error) {
        console.error('Error al iniciar firma electrónica:', error);
        res.status(500).json({
            success: false,
            message: 'Error al iniciar la firma electrónica',
            error: error.message
        });
    }
});
/**
 * Verificar estado de firma
 * GET /api/secure-documents/sign/:signatureId
 */
exports.secureDocumentRouter.get('/sign/:signatureId', isAuthenticated, async (req, res) => {
    try {
        const { signatureId } = req.params;
        // Verificar estado
        const status = await advanced_signature_1.electronicSignatureService.checkSignatureStatus(signatureId);
        // Obtener detalles
        const details = await advanced_signature_1.electronicSignatureService.getSignatureDetails(signatureId);
        res.json({
            success: true,
            status,
            details
        });
    }
    catch (error) {
        console.error('Error al verificar estado de firma:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar estado de firma',
            error: error.message
        });
    }
});
/**
 * Completar firma con eToken
 * POST /api/secure-documents/sign/:signatureId/complete-etoken
 */
exports.secureDocumentRouter.post('/sign/:signatureId/complete-etoken', isAuthenticated, async (req, res) => {
    try {
        const { signatureId } = req.params;
        const { certificate, timestamp, signature } = req.body;
        const userId = req.user.id;
        if (!certificate || !timestamp || !signature) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos para completar la firma'
            });
        }
        // Completar firma
        const status = await advanced_signature_1.electronicSignatureService.completeETokenSignature(signatureId, { certificate, timestamp, signature });
        // Obtener detalles de la firma para el registro de auditoría
        const details = await advanced_signature_1.electronicSignatureService.getSignatureDetails(signatureId);
        const [docSignature] = await db_1.db
            .select()
            .from(documentSignatures)
            .where((0, drizzle_orm_1.eq)(documentSignatures.signatureId, signatureId));
        const documentId = docSignature ? docSignature.documentId : null;
        // Registrar acción en logs de auditoría
        if (documentId) {
            await audit_logger_1.auditLogService.logSignatureAction(audit_logger_1.AuditActionType.SIGNATURE_COMPLETED, userId, documentId, {
                signatureId,
                provider: advanced_signature_1.SignatureProvider.ETOKEN,
                status
            }, req);
        }
        res.json({
            success: true,
            status,
            details
        });
    }
    catch (error) {
        console.error('Error al completar firma con eToken:', error);
        res.status(500).json({
            success: false,
            message: 'Error al completar firma con eToken',
            error: error.message
        });
    }
});
/**
 * Completar firma simple
 * POST /api/secure-documents/sign/:signatureId/complete-simple
 */
exports.secureDocumentRouter.post('/sign/:signatureId/complete-simple', isAuthenticated, async (req, res) => {
    try {
        const { signatureId } = req.params;
        const { signatureImageData } = req.body;
        const userId = req.user.id;
        if (!signatureImageData) {
            return res.status(400).json({
                success: false,
                message: 'Falta imagen de firma para completar'
            });
        }
        // Completar firma
        const status = await advanced_signature_1.electronicSignatureService.completeSimpleSignature(signatureId, signatureImageData);
        // Obtener detalles para registro de auditoría
        const details = await advanced_signature_1.electronicSignatureService.getSignatureDetails(signatureId);
        const [docSignature] = await db_1.db
            .select()
            .from(documentSignatures)
            .where((0, drizzle_orm_1.eq)(documentSignatures.signatureId, signatureId));
        const documentId = docSignature ? docSignature.documentId : null;
        // Registrar acción en logs de auditoría
        if (documentId) {
            await audit_logger_1.auditLogService.logSignatureAction(audit_logger_1.AuditActionType.SIGNATURE_COMPLETED, userId, documentId, {
                signatureId,
                provider: advanced_signature_1.SignatureProvider.SIMPLE,
                status
            }, req);
        }
        res.json({
            success: true,
            status,
            details
        });
    }
    catch (error) {
        console.error('Error al completar firma simple:', error);
        res.status(500).json({
            success: false,
            message: 'Error al completar firma simple',
            error: error.message
        });
    }
});
/**
 * Almacenar documento de forma segura
 * POST /api/secure-documents/store/:documentId
 */
exports.secureDocumentRouter.post('/store/:documentId', isAuthenticated, upload.single('file'), async (req, res) => {
    try {
        const { documentId } = req.params;
        const { metadata = '{}', encryptionType = 'aes-256-gcm' } = req.body;
        const userId = req.user.id;
        // Verificar que el documento existe
        const [document] = await db_1.db
            .select()
            .from(schema_1.documents)
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, parseInt(documentId)));
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Documento no encontrado'
            });
        }
        let documentData;
        // Si se adjuntó un archivo, usar ese
        if (req.file) {
            documentData = fs_1.default.readFileSync(req.file.path);
        }
        // Si no, usar el contenido del documento
        else if (document.content) {
            documentData = Buffer.from(document.content);
        }
        // Si no hay contenido, error
        else {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionó un archivo y el documento no tiene contenido'
            });
        }
        // Parsear metadatos
        let parsedMetadata;
        try {
            parsedMetadata = JSON.parse(metadata);
        }
        catch {
            parsedMetadata = {};
        }
        // Incluir información del usuario y documento en metadatos
        parsedMetadata = {
            ...parsedMetadata,
            documentId: parseInt(documentId),
            userId,
            documentTitle: document.title,
            storedAt: new Date().toISOString()
        };
        // Almacenar documento
        const storageResult = await secure_storage_1.secureStorageService.storeDocument(parseInt(documentId), documentData, parsedMetadata, { encryptionType: encryptionType });
        // Limpiar archivo temporal si existe
        if (req.file) {
            fs_1.default.unlinkSync(req.file.path);
        }
        // Registrar acción en logs de auditoría
        await audit_logger_1.auditLogService.logDocumentAction(audit_logger_1.AuditActionType.DOCUMENT_STORED, parseInt(documentId), userId, {
            storageId: storageResult.storageId,
            provider: storageResult.provider,
            encryptionType: storageResult.encryptionType,
            success: storageResult.success
        }, req);
        res.json(storageResult);
    }
    catch (error) {
        console.error('Error al almacenar documento:', error);
        // Limpiar archivo temporal si existe
        if (req.file) {
            try {
                fs_1.default.unlinkSync(req.file.path);
            }
            catch { }
        }
        res.status(500).json({
            success: false,
            message: 'Error al almacenar documento',
            error: error.message
        });
    }
});
/**
 * Recuperar documento almacenado
 * GET /api/secure-documents/retrieve/:storageId
 */
exports.secureDocumentRouter.get('/retrieve/:storageId', isAuthenticated, async (req, res) => {
    try {
        const { storageId } = req.params;
        const { decrypt = 'true' } = req.query;
        const userId = req.user.id;
        // Recuperar documento
        const { data, metadata } = await secure_storage_1.secureStorageService.retrieveDocument(storageId, { decrypt: decrypt === 'true' });
        // Registrar acción en logs de auditoría
        await audit_logger_1.auditLogService.logDocumentAction(audit_logger_1.AuditActionType.DOCUMENT_DOWNLOADED, metadata.documentId, userId, {
            storageId,
            decrypt: decrypt === 'true'
        }, req);
        // Configurar headers para descarga
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${metadata.documentTitle || 'document'}.pdf"`);
        res.setHeader('Content-Length', data.length);
        // Enviar documento
        res.send(data);
    }
    catch (error) {
        console.error('Error al recuperar documento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al recuperar documento',
            error: error.message
        });
    }
});
/**
 * Generar URL de acceso temporal
 * GET /api/secure-documents/presigned-url/:storageId
 */
exports.secureDocumentRouter.get('/presigned-url/:storageId', isAuthenticated, async (req, res) => {
    try {
        const { storageId } = req.params;
        const { expiresIn = '3600' } = req.query;
        // Generar URL temporal
        const url = await secure_storage_1.secureStorageService.generatePresignedUrl(storageId, parseInt(expiresIn));
        res.json({
            success: true,
            url,
            expiresIn: parseInt(expiresIn)
        });
    }
    catch (error) {
        console.error('Error al generar URL temporal:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar URL temporal',
            error: error.message
        });
    }
});
/**
 * Verificar integridad de documento
 * GET /api/secure-documents/verify-integrity/:storageId
 */
exports.secureDocumentRouter.get('/verify-integrity/:storageId', async (req, res) => {
    try {
        const { storageId } = req.params;
        // Verificar integridad
        const verificationResult = await secure_storage_1.secureStorageService.verifyDocumentIntegrity(storageId);
        res.json(verificationResult);
    }
    catch (error) {
        console.error('Error al verificar integridad del documento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar integridad del documento',
            error: error.message
        });
    }
});
/**
 * Generar código QR para verificación de documento
 * POST /api/secure-documents/generate-qr/:documentId
 */
exports.secureDocumentRouter.post('/generate-qr/:documentId', isAuthenticated, async (req, res) => {
    try {
        const { documentId } = req.params;
        const { type = 'document', includeSignatures = false, expiresInDays = 365, size = 200 } = req.body;
        const userId = req.user.id;
        let qrResult;
        if (type === 'document') {
            // QR para verificación de documento
            qrResult = await qr_verification_1.qrVerificationService.generateDocumentVerificationQR(parseInt(documentId), {
                includeSignatures,
                expiresInDays,
                size
            });
        }
        else if (type === 'mobile') {
            // QR para firma desde móvil
            qrResult = await qr_verification_1.qrVerificationService.generateMobileSigningQR(parseInt(documentId), userId, {
                expiresInHours: 24,
                size
            });
        }
        else if (type === 'signature' && req.body.signatureId) {
            // QR para verificación de firma
            qrResult = await qr_verification_1.qrVerificationService.generateSignatureVerificationQR(req.body.signatureId, {
                expiresInDays,
                size
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: 'Tipo de QR no válido'
            });
        }
        // Registrar acción en logs de auditoría
        await audit_logger_1.auditLogService.logDocumentAction(audit_logger_1.AuditActionType.DOCUMENT_VERIFIED, parseInt(documentId), userId, {
            qrType: type,
            qrCodeId: qrResult.qrCodeId,
            success: qrResult.success
        }, req);
        res.json(qrResult);
    }
    catch (error) {
        console.error('Error al generar código QR:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar código QR',
            error: error.message
        });
    }
});
/**
 * Verificar código QR
 * GET /api/secure-documents/verify-qr/:code
 */
exports.secureDocumentRouter.get('/verify-qr/:code', async (req, res) => {
    try {
        const { code } = req.params;
        // Verificar código
        const verificationResult = await qr_verification_1.qrVerificationService.verifyCode(code);
        // Si hay un usuario autenticado, registrar acción
        if (req.isAuthenticated() && verificationResult.isValid && verificationResult.documentId) {
            await audit_logger_1.auditLogService.logDocumentAction(audit_logger_1.AuditActionType.DOCUMENT_VERIFIED, verificationResult.documentId, req.user.id, {
                verificationCode: code,
                qrCodeType: verificationResult.qrCodeType,
                success: verificationResult.isValid
            }, req);
        }
        res.json(verificationResult);
    }
    catch (error) {
        console.error('Error al verificar código QR:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar código QR',
            error: error.message
        });
    }
});
