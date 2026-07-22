"use strict";
/**
 * Servicio de Verificación mediante Códigos QR
 *
 * Este módulo proporciona funcionalidades para generar y validar
 * códigos QR de verificación para documentos firmados electrónicamente.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.qrVerificationService = exports.QRVerificationService = exports.QRCodeStatus = exports.QRCodeType = void 0;
const uuid_1 = require("uuid");
const db_1 = require("../db");
const schema_1 = require("@shared/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
const qrcode_1 = __importDefault(require("qrcode"));
// Temporalmente utilizamos definiciones locales hasta que se actualice el esquema principal
const documentQrCodes = {
    id: "document_qr_codes.id",
    documentId: "document_qr_codes.document_id",
    signatureId: "document_qr_codes.signature_id",
    userId: "document_qr_codes.user_id",
    codeType: "document_qr_codes.code_type",
    verificationCode: "document_qr_codes.verification_code",
    status: "document_qr_codes.status"
};
const signatures = {
    id: "signatures.id",
    userId: "signatures.user_id",
    provider: "signatures.provider",
    status: "signatures.status"
};
// Tipos para verificación de QR
var QRCodeType;
(function (QRCodeType) {
    QRCodeType["DOCUMENT_VERIFICATION"] = "document_verification";
    QRCodeType["SIGNATURE_VERIFICATION"] = "signature_verification";
    QRCodeType["ACCESS_LINK"] = "access_link";
    QRCodeType["MOBILE_SIGNING"] = "mobile_signing";
})(QRCodeType || (exports.QRCodeType = QRCodeType = {}));
var QRCodeStatus;
(function (QRCodeStatus) {
    QRCodeStatus["ACTIVE"] = "active";
    QRCodeStatus["USED"] = "used";
    QRCodeStatus["EXPIRED"] = "expired";
    QRCodeStatus["REVOKED"] = "revoked";
})(QRCodeStatus || (exports.QRCodeStatus = QRCodeStatus = {}));
/**
 * Clase principal del servicio de verificación por QR
 */
class QRVerificationService {
    /**
     * Genera un código QR para verificación de documento
     */
    async generateDocumentVerificationQR(documentId, options) {
        try {
            // Verificar que el documento existe
            const [document] = await db_1.db
                .select()
                .from(schema_1.documents)
                .where((0, drizzle_orm_1.eq)(schema_1.documents.id, documentId));
            if (!document) {
                throw new Error('Documento no encontrado');
            }
            const expiresInDays = options?.expiresInDays || 365; // 1 año por defecto
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + expiresInDays);
            // Generar código único de verificación
            const verificationCode = this.generateVerificationCode();
            // Crear registro de código QR en la base de datos
            const qrCodeId = (0, uuid_1.v4)();
            await db_1.db.insert(documentQrCodes).values({
                id: qrCodeId,
                documentId,
                codeType: QRCodeType.DOCUMENT_VERIFICATION,
                verificationCode,
                status: QRCodeStatus.ACTIVE,
                createdAt: new Date(),
                expiresAt,
                details: {
                    includeSignatures: options?.includeSignatures || false,
                    createdAt: new Date().toISOString()
                }
            });
            // Crear URL de verificación
            const baseUrl = process.env.APP_URL || 'https://notarypro.cl';
            const verificationUrl = `${baseUrl}/verificar/${verificationCode}`;
            // Generar imagen QR
            const size = options?.size || 200;
            const qrImageBase64 = await this.generateQRImageBase64(verificationUrl, size);
            return {
                success: true,
                qrCodeId,
                qrImageBase64,
                qrUrl: verificationUrl,
                verificationCode,
                expiresAt
            };
        }
        catch (error) {
            console.error('Error al generar QR de verificación de documento:', error);
            return {
                success: false,
                qrCodeId: (0, uuid_1.v4)(), // ID temporal para error
                error: error.message || 'Error desconocido al generar QR'
            };
        }
    }
    /**
     * Genera un código QR para verificación de firma
     */
    async generateSignatureVerificationQR(signatureId, options) {
        try {
            // Verificar que la firma existe
            const [signature] = await db_1.db
                .select()
                .from(signatures)
                .where((0, drizzle_orm_1.eq)(signatures.id, signatureId));
            if (!signature) {
                throw new Error('Firma no encontrada');
            }
            // Buscar el documento asociado a la firma
            const [docSignature] = await db_1.db
                .select()
                .from(documentSignatures)
                .where((0, drizzle_orm_1.eq)(documentSignatures.signatureId, signatureId));
            if (!docSignature) {
                throw new Error('No se encontró documento asociado a la firma');
            }
            const documentId = docSignature.documentId;
            const expiresInDays = options?.expiresInDays || 365; // 1 año por defecto
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + expiresInDays);
            // Generar código único de verificación
            const verificationCode = this.generateVerificationCode();
            // Crear registro de código QR en la base de datos
            const qrCodeId = (0, uuid_1.v4)();
            await db_1.db.insert(documentQrCodes).values({
                id: qrCodeId,
                documentId,
                signatureId,
                codeType: QRCodeType.SIGNATURE_VERIFICATION,
                verificationCode,
                status: QRCodeStatus.ACTIVE,
                createdAt: new Date(),
                expiresAt,
                details: {
                    createdAt: new Date().toISOString()
                }
            });
            // Crear URL de verificación
            const baseUrl = process.env.APP_URL || 'https://notarypro.cl';
            const verificationUrl = `${baseUrl}/verificar/${verificationCode}`;
            // Generar imagen QR
            const size = options?.size || 200;
            const qrImageBase64 = await this.generateQRImageBase64(verificationUrl, size);
            return {
                success: true,
                qrCodeId,
                qrImageBase64,
                qrUrl: verificationUrl,
                verificationCode,
                expiresAt
            };
        }
        catch (error) {
            console.error('Error al generar QR de verificación de firma:', error);
            return {
                success: false,
                qrCodeId: (0, uuid_1.v4)(), // ID temporal para error
                error: error.message || 'Error desconocido al generar QR'
            };
        }
    }
    /**
     * Genera un código QR para firma en dispositivo móvil
     */
    async generateMobileSigningQR(documentId, userId, options) {
        try {
            // Verificar que el documento existe
            const [document] = await db_1.db
                .select()
                .from(schema_1.documents)
                .where((0, drizzle_orm_1.eq)(schema_1.documents.id, documentId));
            if (!document) {
                throw new Error('Documento no encontrado');
            }
            const expiresInHours = options?.expiresInHours || 24; // 24 horas por defecto
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + expiresInHours);
            // Generar código único de verificación
            const verificationCode = this.generateVerificationCode();
            // Crear registro de código QR en la base de datos
            const qrCodeId = (0, uuid_1.v4)();
            await db_1.db.insert(documentQrCodes).values({
                id: qrCodeId,
                documentId,
                userId,
                codeType: QRCodeType.MOBILE_SIGNING,
                verificationCode,
                status: QRCodeStatus.ACTIVE,
                createdAt: new Date(),
                expiresAt,
                details: {
                    ...options?.additionalData,
                    createdAt: new Date().toISOString()
                }
            });
            // Crear URL de firma móvil
            const baseUrl = process.env.APP_URL || 'https://notarypro.cl';
            const signingUrl = `${baseUrl}/sign-mobile/${verificationCode}`;
            // Generar imagen QR
            const size = options?.size || 200;
            const qrImageBase64 = await this.generateQRImageBase64(signingUrl, size);
            return {
                success: true,
                qrCodeId,
                qrImageBase64,
                qrUrl: signingUrl,
                verificationCode,
                expiresAt
            };
        }
        catch (error) {
            console.error('Error al generar QR para firma móvil:', error);
            return {
                success: false,
                qrCodeId: (0, uuid_1.v4)(), // ID temporal para error
                error: error.message || 'Error desconocido al generar QR'
            };
        }
    }
    /**
     * Verifica un código de verificación
     */
    async verifyCode(verificationCode) {
        try {
            // Buscar el código en la base de datos
            const [qrCode] = await db_1.db
                .select()
                .from(documentQrCodes)
                .where((0, drizzle_orm_1.eq)(documentQrCodes.verificationCode, verificationCode));
            if (!qrCode) {
                return {
                    isValid: false,
                    error: 'Código de verificación no encontrado'
                };
            }
            // Verificar estado del código
            if (qrCode.status !== QRCodeStatus.ACTIVE) {
                return {
                    isValid: false,
                    error: `El código ha sido ${qrCode.status === QRCodeStatus.USED ? 'utilizado' :
                        qrCode.status === QRCodeStatus.EXPIRED ? 'expirado' :
                            'revocado'}`
                };
            }
            // Verificar fecha de expiración
            if (qrCode.expiresAt && qrCode.expiresAt < new Date()) {
                // Actualizar estado a expirado
                await db_1.db
                    .update(documentQrCodes)
                    .set({ status: QRCodeStatus.EXPIRED })
                    .where((0, drizzle_orm_1.eq)(documentQrCodes.id, qrCode.id));
                return {
                    isValid: false,
                    error: 'El código ha expirado'
                };
            }
            // Si es un código de tipo firma móvil, marcarlo como usado
            if (qrCode.codeType === QRCodeType.MOBILE_SIGNING) {
                await db_1.db
                    .update(documentQrCodes)
                    .set({ status: QRCodeStatus.USED })
                    .where((0, drizzle_orm_1.eq)(documentQrCodes.id, qrCode.id));
            }
            // Buscar documento asociado
            const [document] = await db_1.db
                .select()
                .from(schema_1.documents)
                .where((0, drizzle_orm_1.eq)(schema_1.documents.id, qrCode.documentId));
            if (!document) {
                return {
                    isValid: false,
                    error: 'El documento asociado no fue encontrado'
                };
            }
            // Preparar respuesta según tipo de código
            const result = {
                isValid: true,
                documentId: qrCode.documentId,
                qrCodeType: qrCode.codeType,
                details: {
                    documentTitle: document.title,
                    documentType: document.type,
                    createdAt: document.createdAt,
                    ...qrCode.details
                }
            };
            // Añadir información de firma si corresponde
            if (qrCode.signatureId) {
                result.signatureId = qrCode.signatureId;
                // Buscar información de la firma
                const [signature] = await db_1.db
                    .select()
                    .from(signatures)
                    .where((0, drizzle_orm_1.eq)(signatures.id, qrCode.signatureId));
                if (signature) {
                    result.details = {
                        ...result.details,
                        signatureProvider: signature.provider,
                        signatureType: signature.type,
                        signatureStatus: signature.status,
                        signatureCreatedAt: signature.createdAt
                    };
                }
            }
            return result;
        }
        catch (error) {
            console.error('Error al verificar código QR:', error);
            return {
                isValid: false,
                error: error.message || 'Error desconocido al verificar código'
            };
        }
    }
    /**
     * Genera un código de verificación único
     */
    generateVerificationCode() {
        // Generar código alfanumérico de 8 caracteres
        const hash = crypto_1.default.createHash('sha256');
        hash.update((0, uuid_1.v4)() + Date.now().toString());
        return hash.digest('hex').substring(0, 8).toUpperCase();
    }
    /**
     * Genera una imagen QR en formato Base64
     */
    async generateQRImageBase64(data, size = 200) {
        try {
            const qrOptions = {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                margin: 2,
                width: size,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            };
            return await qrcode_1.default.toDataURL(data, qrOptions);
        }
        catch (error) {
            console.error('Error al generar imagen QR:', error);
            throw error;
        }
    }
    /**
     * Revoca un código QR
     */
    async revokeQRCode(qrCodeId) {
        try {
            await db_1.db
                .update(documentQrCodes)
                .set({ status: QRCodeStatus.REVOKED })
                .where((0, drizzle_orm_1.eq)(documentQrCodes.id, qrCodeId));
            return true;
        }
        catch (error) {
            console.error('Error al revocar código QR:', error);
            return false;
        }
    }
}
exports.QRVerificationService = QRVerificationService;
// Exportar instancia del servicio
exports.qrVerificationService = new QRVerificationService();
