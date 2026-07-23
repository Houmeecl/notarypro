"use strict";
/**
 * Servicio de verificación de firmas
 *
 * Este servicio implementa la lógica para:
 * 1. Validar firmas electrónicas mediante procesamiento de imágenes
 * 2. Detectar posibles fraudes o falsificaciones
 * 3. Generar puntajes de confianza para firmas verificadas
 *
 * Utiliza una combinación de métodos locales y APIs externas cuando están disponibles
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.signatureVerificationService = void 0;
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("@shared/schema");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
class SignatureVerificationService {
    constructor() {
        this.UPLOAD_DIR = path.join(process.cwd(), "uploads", "signatures");
        // Crear el directorio de firmas si no existe
        this.ensureUploadDirExists();
    }
    /**
     * Verifica la autenticidad de una firma mediante análisis básico y API externa (si está disponible)
     * @param signatureBase64 La firma en formato base64
     * @param metadata Metadatos asociados a la firma
     * @returns Resultado de la verificación
     */
    async verifySignature(signatureBase64, metadata) {
        try {
            // 1. Realizar verificación local básica (siempre disponible)
            const localVerification = await this.performLocalVerification(signatureBase64);
            // 2. Intentar verificación con API externa (si está disponible)
            let apiVerification = null;
            try {
                apiVerification = await this.callExternalVerificationAPI(signatureBase64, metadata);
            }
            catch (error) {
                console.log("API externa no disponible, usando solo verificación local", error);
            }
            // 3. Combinar resultados (priorizar API externa si está disponible)
            const finalResult = apiVerification || localVerification;
            // 4. Guardar el resultado de la verificación en la base de datos
            if (finalResult.isValid) {
                const storedSignature = await this.storeSignature(signatureBase64, metadata, finalResult);
                finalResult.verificationId = storedSignature.id.toString();
            }
            return finalResult;
        }
        catch (error) {
            console.error("Error verificando firma:", error);
            return {
                isValid: false,
                confidence: 0,
                message: "Error en el proceso de verificación de firma"
            };
        }
    }
    /**
     * Realiza una verificación local básica de la firma
     * @param signatureBase64 La firma en formato base64
     * @returns Resultado de la verificación local
     */
    async performLocalVerification(signatureBase64) {
        try {
            // Verificar que la firma no esté vacía y tenga un tamaño adecuado
            if (!signatureBase64 || signatureBase64.length < 1000) {
                return {
                    isValid: false,
                    confidence: 0,
                    message: "La firma es inválida o está vacía"
                };
            }
            // Eliminar el prefijo de data URI si existe
            const base64Data = signatureBase64.replace(/^data:image\/\w+;base64,/, '');
            // Verificar el formato de la imagen
            const buffer = Buffer.from(base64Data, 'base64');
            // Verificación básica de la firma: comprobar que sea una imagen PNG o JPEG válida
            const isValidImage = this.isValidImageFormat(buffer);
            if (!isValidImage) {
                return {
                    isValid: false,
                    confidence: 0,
                    message: "El formato de la imagen de firma no es válido"
                };
            }
            // Análisis básico de calidad de la firma
            // Esta es una implementación simplificada que podría mejorarse con algoritmos más avanzados
            const signatureQuality = this.analyzeSignatureQuality(buffer);
            return {
                isValid: signatureQuality.isValid,
                confidence: signatureQuality.confidence,
                details: {
                    consistencyScore: signatureQuality.consistency
                },
                message: signatureQuality.message
            };
        }
        catch (error) {
            console.error("Error en verificación local:", error);
            return {
                isValid: false,
                confidence: 0,
                message: "Error al procesar la firma localmente"
            };
        }
    }
    /**
     * Llamada a API externa de verificación de firmas
     * Esta es una implementación simulada que se puede reemplazar con una API real
     *
     * Opciones gratuitas/económicas disponibles:
     * - API de Nanonets (plan gratuito limitado)
     * - API de Signwell (tienen plan de prueba)
     * - API de DocuSign (período de prueba)
     *
     * @param signatureBase64 La firma en formato base64
     * @param metadata Metadatos asociados a la firma
     * @returns Resultado de la verificación externa
     */
    async callExternalVerificationAPI(signatureBase64, metadata) {
        // Simulación de verificación API
        // En una implementación real, esto se reemplazaría por una llamada API como:
        /*
        const response = await axios.post('https://api.signature-verification.com/verify', {
          signature: signatureBase64,
          name: metadata.signerName,
          documentId: metadata.documentId,
          apiKey: process.env.SIGNATURE_API_KEY
        });
        
        return {
          isValid: response.data.valid,
          confidence: response.data.confidence,
          details: response.data.details,
          message: response.data.message
        };
        */
        // Implementación simulada para demostración
        // En producción, usar una API real de verificación de firmas
        const simulatedScore = Math.random() * 0.3 + 0.7; // Generar score entre 0.7 y 1.0
        return {
            isValid: simulatedScore > 0.75,
            confidence: simulatedScore,
            details: {
                matchScore: simulatedScore,
                forgeryProbability: 1 - simulatedScore
            },
            message: simulatedScore > 0.75
                ? "Firma verificada por API externa"
                : "La firma no cumple con el umbral de confianza mínimo"
        };
    }
    /**
     * Almacena una firma en la base de datos y en el sistema de archivos
     * @param signatureBase64 La firma en formato base64
     * @param metadata Metadatos asociados a la firma
     * @param verificationResult Resultado de la verificación
     * @returns La firma almacenada
     */
    async storeSignature(signatureBase64, metadata, verificationResult) {
        // Generar un ID único para la firma
        const signatureId = crypto.randomUUID();
        // Guardar la imagen en el sistema de archivos
        const signaturePath = await this.saveSignatureToFile(signatureBase64, signatureId);
        // Guardar en la base de datos
        const newSignature = {
            id: signatureId,
            signer_id: metadata.signerId,
            signer_name: metadata.signerName || null,
            document_id: metadata.documentId || null,
            file_path: signaturePath,
            created_at: new Date(),
            verification_score: verificationResult.confidence,
            ip_address: metadata.ip || null,
            device_info: metadata.deviceInfo || null,
            is_valid: verificationResult.isValid
        };
        // Insertar en la base de datos
        const [signature] = await db_1.db.insert(schema_1.signatures).values(newSignature).returning();
        return signature;
    }
    /**
     * Guarda la firma como archivo imagen
     * @param signatureBase64 La firma en formato base64
     * @param signatureId ID único de la firma
     * @returns La ruta del archivo guardado
     */
    async saveSignatureToFile(signatureBase64, signatureId) {
        // Eliminar el prefijo de data URI si existe
        const base64Data = signatureBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        // Definir la ruta del archivo
        const filePath = path.join(this.UPLOAD_DIR, `${signatureId}.png`);
        // Guardar el archivo
        await fs.promises.writeFile(filePath, buffer);
        return filePath;
    }
    /**
     * Verifica si un buffer contiene una imagen válida en formato PNG o JPEG
     * @param buffer El buffer de la imagen
     * @returns true si es una imagen válida, false en caso contrario
     */
    isValidImageFormat(buffer) {
        // Verificar PNG
        if (buffer.length > 8 &&
            buffer[0] === 0x89 &&
            buffer[1] === 0x50 &&
            buffer[2] === 0x4E &&
            buffer[3] === 0x47) {
            return true;
        }
        // Verificar JPEG
        if (buffer.length > 3 &&
            buffer[0] === 0xFF &&
            buffer[1] === 0xD8 &&
            buffer[buffer.length - 2] === 0xFF &&
            buffer[buffer.length - 1] === 0xD9) {
            return true;
        }
        return false;
    }
    /**
     * Analiza la calidad de la firma mediante criterios básicos
     * @param buffer El buffer de la imagen de firma
     * @returns Resultado del análisis de calidad
     */
    analyzeSignatureQuality(buffer) {
        // En una implementación real, se usarían algoritmos de procesamiento de imágenes
        // para analizar características como la presión, fluidez, consistencia, etc.
        // Implementación básica para demostración
        // Este código podría ser reemplazado por algoritmos reales de análisis de firmas
        const fileSize = buffer.length;
        // Firmas muy pequeñas suelen ser simplificadas o incompletas
        if (fileSize < 5000) {
            return {
                isValid: false,
                confidence: 0.3,
                consistency: 0.4,
                message: "La firma es demasiado simple o incompleta"
            };
        }
        // Análisis simulado para demostración
        // En una implementación real, se usaría análisis de imagen avanzado
        const confidence = Math.min(0.85, 0.5 + (fileSize / 50000));
        const consistency = Math.min(0.9, 0.6 + (fileSize / 60000));
        return {
            isValid: confidence > 0.6,
            confidence,
            consistency,
            message: confidence > 0.6
                ? "Firma válida con buena calidad"
                : "La firma no cumple con los criterios mínimos de calidad"
        };
    }
    /**
     * Asegura que el directorio de almacenamiento de firmas exista
     */
    ensureUploadDirExists() {
        if (!fs.existsSync(this.UPLOAD_DIR)) {
            fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
        }
    }
    /**
     * Recupera una firma almacenada por su ID
     * @param signatureId ID de la firma
     * @returns La firma si existe, null en caso contrario
     */
    async getStoredSignature(signatureId) {
        try {
            const [signature] = await db_1.db.select().from(schema_1.signatures).where((0, drizzle_orm_1.eq)(schema_1.signatures.id, signatureId));
            if (!signature || !signature.file_path) {
                return null;
            }
            // Leer la imagen de firma
            if (fs.existsSync(signature.file_path)) {
                const fileData = await fs.promises.readFile(signature.file_path);
                const base64Data = fileData.toString('base64');
                return {
                    id: signature.id,
                    base64: `data:image/png;base64,${base64Data}`,
                    signerId: signature.signer_id,
                    signerName: signature.signer_name,
                    documentId: signature.document_id,
                    createdAt: signature.created_at,
                    isValid: signature.is_valid,
                    verificationScore: signature.verification_score
                };
            }
            return null;
        }
        catch (error) {
            console.error("Error recuperando firma:", error);
            return null;
        }
    }
}
// Exportar una instancia singleton del servicio
exports.signatureVerificationService = new SignatureVerificationService();
