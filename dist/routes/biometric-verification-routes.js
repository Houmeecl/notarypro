"use strict";
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
exports.biometricRouter = void 0;
/**
 * Rutas para verificación biométrica
 *
 * Este módulo proporciona endpoints para la verificación biométrica
 * utilizando cámara para capturar selfie y documento de identidad.
 */
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const openai_vision_1 = require("../services/openai-vision");
exports.biometricRouter = (0, express_1.Router)();
// Configuración de multer para subida de archivos
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(process.cwd(), 'uploads', 'biometric');
        // Crear directorio si no existe
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB máximo
    },
    fileFilter: (req, file, cb) => {
        // Aceptar solo imágenes
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Solo se permiten archivos de imagen'));
        }
    }
});
/**
 * Middleware para verificar autenticación
 */
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    return res.status(401).json({ error: 'No autenticado' });
}
/**
 * Endpoint para procesar verificación biométrica con imágenes base64
 * POST /api/biometric/verify
 */
exports.biometricRouter.post('/verify', async (req, res) => {
    try {
        const { selfieImage, documentImage } = req.body;
        if (!selfieImage || !documentImage) {
            return res.status(400).json({
                error: 'Se requieren imágenes de selfie y documento'
            });
        }
        // Guardar imágenes base64
        const selfiePath = await (0, openai_vision_1.saveBase64Image)(selfieImage, 'selfie.jpg');
        const documentPath = await (0, openai_vision_1.saveBase64Image)(documentImage, 'document.jpg');
        // Extraer información del documento
        const documentInfo = await (0, openai_vision_1.extractDocumentInfo)(documentPath);
        // Verificar autenticidad del documento
        const documentAuthenticityResult = await (0, openai_vision_1.analyzeDocumentAuthenticity)(documentPath);
        // Verificar similitud facial
        const facialSimilarityResult = await (0, openai_vision_1.verifyFacialSimilarity)(selfiePath, documentPath);
        // Crear respuesta combinada
        const verificationResult = {
            status: 'completed',
            timestamp: new Date().toISOString(),
            documentInfo,
            documentAuthenticityResult,
            facialSimilarityResult,
            overallResult: {
                verified: documentInfo.isValid &&
                    documentAuthenticityResult.isAuthentic &&
                    facialSimilarityResult.match,
                confidenceScore: calculateConfidenceScore(documentInfo.isValid ? 1 : 0, documentAuthenticityResult.score, facialSimilarityResult.score),
                details: generateVerificationSummary(documentInfo, documentAuthenticityResult, facialSimilarityResult)
            }
        };
        // Devolver resultado
        return res.status(200).json(verificationResult);
    }
    catch (error) {
        console.error('Error en verificación biométrica:', error);
        return res.status(500).json({
            error: 'Error en verificación biométrica',
            message: error.message
        });
    }
});
/**
 * Endpoint para extraer información de un documento
 * POST /api/biometric/extract-document
 */
exports.biometricRouter.post('/extract-document', upload.single('documentImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó imagen del documento' });
        }
        const documentPath = req.file.path;
        // Extraer información del documento
        const documentInfo = await (0, openai_vision_1.extractDocumentInfo)(documentPath);
        // Devolver resultado
        return res.status(200).json({
            status: 'completed',
            timestamp: new Date().toISOString(),
            documentInfo
        });
    }
    catch (error) {
        console.error('Error en extracción de documento:', error);
        return res.status(500).json({
            error: 'Error en extracción de documento',
            message: error.message
        });
    }
});
/**
 * Endpoint para analizar autenticidad de un documento
 * POST /api/biometric/analyze-document
 */
exports.biometricRouter.post('/analyze-document', upload.single('documentImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó imagen del documento' });
        }
        const documentPath = req.file.path;
        // Analizar autenticidad del documento
        const documentAuthenticityResult = await (0, openai_vision_1.analyzeDocumentAuthenticity)(documentPath);
        // Devolver resultado
        return res.status(200).json({
            status: 'completed',
            timestamp: new Date().toISOString(),
            documentAuthenticityResult
        });
    }
    catch (error) {
        console.error('Error en análisis de autenticidad:', error);
        return res.status(500).json({
            error: 'Error en análisis de autenticidad',
            message: error.message
        });
    }
});
/**
 * Endpoint para verificar similitud facial
 * POST /api/biometric/facial-similarity
 */
exports.biometricRouter.post('/facial-similarity', upload.fields([
    { name: 'selfieImage', maxCount: 1 },
    { name: 'documentImage', maxCount: 1 }
]), async (req, res) => {
    try {
        const files = req.files;
        if (!files.selfieImage || !files.documentImage) {
            return res.status(400).json({
                error: 'Se requieren imágenes de selfie y documento'
            });
        }
        const selfiePath = files.selfieImage[0].path;
        const documentPath = files.documentImage[0].path;
        // Verificar similitud facial
        const facialSimilarityResult = await (0, openai_vision_1.verifyFacialSimilarity)(selfiePath, documentPath);
        // Devolver resultado
        return res.status(200).json({
            status: 'completed',
            timestamp: new Date().toISOString(),
            facialSimilarityResult
        });
    }
    catch (error) {
        console.error('Error en verificación facial:', error);
        return res.status(500).json({
            error: 'Error en verificación facial',
            message: error.message
        });
    }
});
/**
 * Función auxiliar para calcular una puntuación de confianza general
 */
function calculateConfidenceScore(documentValidityScore, documentAuthenticityScore, facialSimilarityScore) {
    // Promedio ponderado de las puntuaciones
    // Damos más peso al reconocimiento facial
    const weightedScore = ((documentValidityScore * 0.3) +
        (documentAuthenticityScore * 0.3) +
        (facialSimilarityScore * 0.4));
    // Redondear a 2 decimales
    return Math.round(weightedScore * 100) / 100;
}
/**
 * Función auxiliar para generar un resumen de la verificación
 */
function generateVerificationSummary(documentInfo, documentAuthenticityResult, facialSimilarityResult) {
    const documentStatus = documentInfo.isValid ? "válido" : "inválido";
    const authenticityStatus = documentAuthenticityResult.isAuthentic ? "auténtico" : "posiblemente alterado";
    const faceMatchStatus = facialSimilarityResult.match ? "coincidente" : "no coincidente";
    return `Documento ${documentStatus} (${documentInfo.documentType}), ${authenticityStatus}. Verificación facial: ${faceMatchStatus} con confianza ${facialSimilarityResult.confidence}.`;
}
