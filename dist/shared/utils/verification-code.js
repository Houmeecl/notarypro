"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVerificationCode = generateVerificationCode;
exports.getVerificationUrl = getVerificationUrl;
exports.generateQRCodeSVG = generateQRCodeSVG;
exports.generateSignatureData = generateSignatureData;
exports.parseSignatureData = parseSignatureData;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Genera un código de verificación único para un documento
 * @param documentId - ID del documento
 * @param title - Título del documento
 * @param timestamp - Timestamp de la firma (opcional)
 * @returns String con código de verificación alfanumérico
 */
function generateVerificationCode(documentId, title, timestamp = new Date()) {
    // Crear un hash basado en varios parámetros para garantizar unicidad
    const data = `${documentId}-${title}-${timestamp.getTime()}-${crypto_1.default.randomBytes(8).toString('hex')}`;
    // Generar un hash SHA-256 y tomar los primeros 8 caracteres
    const hash = crypto_1.default.createHash('sha256').update(data).digest('hex').substring(0, 8);
    // Formatear como código alfanumérico con guiones para mejor legibilidad
    // Formato: XX-XXXX-XX (donde X es alfanumérico)
    return `${hash.substring(0, 2)}-${hash.substring(2, 6)}-${hash.substring(6, 8)}`.toUpperCase();
}
/**
 * Genera una URL para verificar un documento
 * @param code - Código de verificación del documento
 * @returns URL para verificación
 */
function getVerificationUrl(code) {
    return `/verificar-documento/${code}`;
}
/**
 * Genera un código QR para verificación de documento
 * @param code - Código de verificación del documento
 * @returns String con el código QR en formato SVG
 */
function generateQRCodeSVG(code) {
    // Esta función generaría el SVG del código QR pero requiere una librería adicional
    // Ejemplo de implementación con una librería ficticia:
    // Para simplificar, retornamos un marcador de posición de SVG
    return `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="#ffffff"/>
    <text x="10" y="50" font-family="Arial" font-size="12" fill="#000000">
      QR: ${code}
    </text>
  </svg>`;
}
/**
 * Genera una cadena con datos de firma para un documento
 * @param userId - ID del usuario que firma
 * @param documentId - ID del documento
 * @param verificationCode - Código de verificación
 * @returns Cadena con datos de firma
 */
function generateSignatureData(userId, documentId, verificationCode) {
    const timestamp = new Date().toISOString();
    return JSON.stringify({
        userId,
        documentId,
        verificationCode,
        timestamp
    });
}
/**
 * Extrae información de la cadena de datos de firma
 * @param signatureData - Cadena JSON con datos de firma
 * @returns Objeto con datos de la firma
 */
function parseSignatureData(signatureData) {
    try {
        return JSON.parse(signatureData);
    }
    catch (error) {
        throw new Error('Formato de datos de firma inválido');
    }
}
