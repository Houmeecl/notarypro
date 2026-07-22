"use strict";
/**
 * Servicio de integración con GetAPI.cl para validación de identidad
 *
 * Este servicio implementa la integración con la API de validación de identidad
 * de GetAPI.cl (https://getapi.cl/identity-validation/)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAPIService = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
// URL base para las API de GetAPI.cl
const GET_API_BASE_URL = 'https://api.getapi.cl/v1';
class GetAPIService {
    constructor() {
        // Verificar que tenemos API key
        if (!process.env.GETAPI_API_KEY) {
            console.warn("ADVERTENCIA: GETAPI_API_KEY no está definida en variables de entorno");
        }
        this.apiKey = process.env.GETAPI_API_KEY || '';
    }
    /**
     * Genera una solicitud a GetAPI con la configuración adecuada
     */
    async makeRequest(endpoint, method, data) {
        try {
            // Generar un ID de solicitud único basado en timestamp
            const requestId = `vecinos-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const response = await (0, axios_1.default)({
                method,
                url: `${GET_API_BASE_URL}${endpoint}`,
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey,
                    'X-Request-ID': requestId
                },
                data
            });
            return response.data;
        }
        catch (error) {
            console.error(`Error en solicitud a GetAPI (${endpoint}):`, error);
            // Transformar error de axios a formato estándar
            if (axios_1.default.isAxiosError(error) && error.response) {
                return {
                    success: false,
                    error: error.response.data?.error || error.message,
                    statusCode: error.response.status
                };
            }
            // Error genérico
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido al contactar GetAPI'
            };
        }
    }
    /**
     * Validación de documento de identidad
     *
     * Envía las imágenes del documento para validar su autenticidad y extraer información
     *
     * @param frontImage Imagen del frente del documento en base64
     * @param backImage Imagen del reverso del documento en base64 (opcional)
     * @param faceImage Imagen del rostro de la persona en base64 (opcional para comparación)
     */
    async validateIdentityDocument(frontImage, backImage, faceImage) {
        // Preparar datos para enviar
        const payload = {
            documentFront: frontImage.startsWith('data:') ? frontImage : `data:image/jpeg;base64,${frontImage}`
        };
        if (backImage) {
            payload.documentBack = backImage.startsWith('data:') ? backImage : `data:image/jpeg;base64,${backImage}`;
        }
        if (faceImage) {
            payload.faceImage = faceImage.startsWith('data:') ? faceImage : `data:image/jpeg;base64,${faceImage}`;
        }
        // Realizar solicitud a la API
        return this.makeRequest('/identity/validate-document', 'POST', payload);
    }
    /**
     * Verificación facial
     *
     * Compara una imagen de rostro con datos previamente validados
     *
     * @param faceImage Imagen del rostro en base64
     * @param documentId Identificador del documento (RUT, DNI, etc.)
     * @param sessionId Identificador de sesión para trazabilidad (opcional)
     */
    async verifyFacialIdentity(faceImage, documentId, sessionId) {
        // Preparar datos para enviar
        const payload = {
            faceImage: faceImage.startsWith('data:') ? faceImage : `data:image/jpeg;base64,${faceImage}`,
            documentId,
            sessionId: sessionId || `session-${Date.now()}`
        };
        // Realizar solicitud a la API
        return this.makeRequest('/identity/verify-face', 'POST', payload);
    }
    /**
     * Verificación de vitalidad (liveness)
     *
     * Verifica que la imagen facial corresponde a una persona real y no una fotografía
     *
     * @param faceImage Imagen del rostro en base64
     * @param sessionId Identificador de sesión para trazabilidad (opcional)
     */
    async verifyLiveness(faceImage, sessionId) {
        // Preparar datos para enviar
        const payload = {
            faceImage: faceImage.startsWith('data:') ? faceImage : `data:image/jpeg;base64,${faceImage}`,
            sessionId: sessionId || `liveness-${Date.now()}`
        };
        // Realizar solicitud a la API
        return this.makeRequest('/identity/verify-liveness', 'POST', payload);
    }
    /**
     * Verificación rápida de identidad
     *
     * Valida la información de identidad básica
     *
     * @param rut RUT o número de documento
     * @param fullName Nombre completo
     * @param birthDate Fecha de nacimiento (YYYY-MM-DD)
     */
    async quickVerifyIdentity(rut, fullName, birthDate) {
        // Normalizar RUT (quitar puntos y guión)
        const normalizedRut = rut.replace(/\./g, '').replace(/-/g, '');
        // Preparar datos para enviar
        const payload = {
            documentId: normalizedRut,
            fullName,
            birthDate
        };
        // Realizar solicitud a la API
        return this.makeRequest('/identity/quick-verify', 'POST', payload);
    }
    /**
     * Genera un hash para la verificación de un documento
     *
     * @param documentData Datos del documento
     * @returns Hash único para el documento
     */
    generateVerificationHash(documentData) {
        const data = typeof documentData === 'string'
            ? documentData
            : JSON.stringify(documentData);
        return (0, crypto_1.createHash)('sha256')
            .update(data)
            .digest('hex');
    }
}
// Exportar instancia singleton
exports.getAPIService = new GetAPIService();
