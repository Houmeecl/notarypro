"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.identityVerificationRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configuración de multer para cargar imágenes
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(process.cwd(), "uploads", "identity");
        // Crear el directorio si no existe
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage });
exports.identityVerificationRouter = (0, express_1.Router)();
// Endpoint para verificación por selfie
exports.identityVerificationRouter.post("/verify-selfie", upload.single("photo"), async (req, res) => {
    try {
        // Si tenemos una foto en formato base64 (desde el cuerpo de la solicitud)
        if (req.body.photo && typeof req.body.photo === "string" && req.body.photo.includes("base64")) {
            const base64Data = req.body.photo.replace(/^data:image\/\w+;base64,/, "");
            const dataBuffer = Buffer.from(base64Data, "base64");
            // Guardar la imagen en el servidor
            const uploadDir = path_1.default.join(process.cwd(), "uploads", "identity");
            if (!fs_1.default.existsSync(uploadDir)) {
                fs_1.default.mkdirSync(uploadDir, { recursive: true });
            }
            const filename = `selfie-${Date.now()}.png`;
            const filePath = path_1.default.join(uploadDir, filename);
            fs_1.default.writeFileSync(filePath, dataBuffer);
            console.log(`Selfie guardada en: ${filePath}`);
            // En una implementación real, aquí se enviaría la imagen a un servicio de verificación
            // Por ahora, simulamos un proceso de verificación exitoso
            // Devolver resultado
            return res.status(200).json({
                success: true,
                message: "Verificación de identidad exitosa",
                verification: {
                    method: "selfie",
                    confidence: 0.89,
                    timestamp: new Date().toISOString()
                }
            });
        }
        // Si no hay foto en el cuerpo o si se proporcionó un archivo
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No se proporcionó una imagen para la verificación"
            });
        }
        console.log(`Foto recibida: ${req.file.path}`);
        // Simulamos un proceso de verificación
        return res.status(200).json({
            success: true,
            message: "Verificación de identidad exitosa",
            verification: {
                method: "selfie",
                confidence: 0.85,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error("Error en la verificación por selfie:", error);
        return res.status(500).json({
            success: false,
            message: "Error al procesar la verificación de identidad"
        });
    }
});
// Endpoint para validar un trámite iniciado
exports.identityVerificationRouter.get("/tramite/:id", async (req, res) => {
    try {
        const tramiteId = req.params.id;
        if (!tramiteId) {
            return res.status(400).json({
                success: false,
                message: "ID de trámite no proporcionado"
            });
        }
        // En una implementación real, aquí consultaríamos la base de datos
        // Por ahora, simulamos un trámite válido
        return res.status(200).json({
            success: true,
            tramite: {
                id: tramiteId,
                tipo: "compraventa",
                nombre: "Contrato de Compraventa",
                estado: "pendiente",
                fechaCreacion: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error("Error al validar trámite:", error);
        return res.status(500).json({
            success: false,
            message: "Error al validar el trámite"
        });
    }
});
// Endpoint para crear un nuevo trámite
exports.identityVerificationRouter.post("/tramite", async (req, res) => {
    try {
        const { documentType } = req.body;
        if (!documentType) {
            return res.status(400).json({
                success: false,
                message: "Tipo de documento no proporcionado"
            });
        }
        // Generar un ID único para el trámite
        const tramiteId = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
        // En una implementación real, registraríamos el trámite en la base de datos
        return res.status(200).json({
            success: true,
            message: "Trámite creado con éxito",
            tramite: {
                id: tramiteId,
                tipo: documentType,
                nombre: mapDocumentType(documentType),
                estado: "pendiente",
                fechaCreacion: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error("Error al crear trámite:", error);
        return res.status(500).json({
            success: false,
            message: "Error al crear el trámite"
        });
    }
});
// Función auxiliar para mapear el tipo de documento a un nombre
function mapDocumentType(type) {
    const documentTypes = {
        "compraventa": "Contrato de Compraventa",
        "trabajo": "Contrato de Trabajo",
        "poder": "Poder Bancario",
        "mandato": "Mandato General",
        "finiquito": "Finiquito Laboral"
    };
    return documentTypes[type] || "Documento";
}
