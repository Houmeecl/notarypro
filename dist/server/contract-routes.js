"use strict";
/**
 * Módulo de Gestión de Contratos
 *
 * Este módulo proporciona funcionalidades para la generación, gestión y
 * validación de contratos como parte del sistema de documentos.
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
exports.contractRouter = void 0;
const express_1 = require("express");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("@shared/schema");
const multer_1 = __importDefault(require("multer"));
// Configurar almacenamiento para archivos de contrato
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads', 'contracts');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'contract-' + uniqueSuffix + ext);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max file size
});
exports.contractRouter = (0, express_1.Router)();
// Middleware para verificar autenticación
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Acceso no autorizado' });
}
/**
 * Obtener plantillas de contrato disponibles
 * GET /api/contracts/templates
 */
exports.contractRouter.get('/templates', async (req, res) => {
    try {
        const templates = await db_1.db.select().from(schema_1.documentTemplates).where((0, drizzle_orm_1.eq)(schema_1.documentTemplates.active, true));
        res.json(templates);
    }
    catch (error) {
        console.error('Error al obtener plantillas de contrato:', error);
        res.status(500).json({ error: 'Error al obtener plantillas de contrato' });
    }
});
/**
 * Obtener una plantilla específica
 * GET /api/contracts/templates/:id
 */
exports.contractRouter.get('/templates/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const template = await db_1.db.select().from(schema_1.documentTemplates).where((0, drizzle_orm_1.eq)(schema_1.documentTemplates.id, parseInt(id))).limit(1);
        if (template.length === 0) {
            return res.status(404).json({ error: 'Plantilla no encontrada' });
        }
        res.json(template[0]);
    }
    catch (error) {
        console.error('Error al obtener plantilla:', error);
        res.status(500).json({ error: 'Error al obtener plantilla' });
    }
});
/**
 * Generar un contrato a partir de una plantilla
 * POST /api/contracts/generate
 */
exports.contractRouter.post('/generate', isAuthenticated, async (req, res) => {
    try {
        const { templateId, formData, title } = req.body;
        if (!templateId || !formData) {
            return res.status(400).json({ error: 'Se requiere templateId y formData' });
        }
        // Obtener la plantilla
        const template = await db_1.db.select().from(schema_1.documentTemplates).where((0, drizzle_orm_1.eq)(schema_1.documentTemplates.id, templateId)).limit(1);
        if (template.length === 0) {
            return res.status(404).json({ error: 'Plantilla no encontrada' });
        }
        // Generar contrato HTML con los datos del formulario
        let contractHtml = template[0].htmlTemplate;
        // Reemplazar variables en la plantilla
        // Asumimos que las variables están en formato {{nombreVariable}}
        contractHtml = contractHtml.replace(/\{\{([^}]+)\}\}/g, (match, field) => {
            return formData[field] || '';
        });
        // Guardar el HTML generado en un archivo
        const contractFileName = `contract-${Date.now()}.html`;
        const contractFilePath = path.join(process.cwd(), 'docs', contractFileName);
        fs.writeFileSync(contractFilePath, contractHtml);
        // Registrar el contrato en la base de datos
        const [document] = await db_1.db.insert(schema_1.documents)
            .values({
            userId: req.user.id,
            templateId,
            title: title || `Contrato generado - ${new Date().toLocaleDateString('es-CL')}`,
            formData,
            status: 'draft',
            filePath: contractFilePath,
            createdAt: new Date(),
            updatedAt: new Date()
        })
            .returning();
        res.status(201).json({
            message: 'Contrato generado exitosamente',
            document,
            contractUrl: `/docs/${contractFileName}`
        });
    }
    catch (error) {
        console.error('Error al generar contrato:', error);
        res.status(500).json({ error: 'Error al generar contrato' });
    }
});
/**
 * Subir un contrato firmado manualmente
 * POST /api/contracts/:id/upload-signed
 */
exports.contractRouter.post('/:id/upload-signed', isAuthenticated, upload.single('signedFile'), async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
        }
        // Verificar que el documento existe
        const doc = await db_1.db.select().from(schema_1.documents).where((0, drizzle_orm_1.eq)(schema_1.documents.id, parseInt(id))).limit(1);
        if (doc.length === 0) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }
        // Actualizar la información del documento
        await db_1.db.update(schema_1.documents)
            .set({
            filePath: req.file.path,
            status: 'signed',
            signatureTimestamp: new Date(),
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, parseInt(id)));
        res.status(200).json({
            message: 'Contrato firmado actualizado exitosamente',
            filePath: req.file.path
        });
    }
    catch (error) {
        console.error('Error al subir contrato firmado:', error);
        res.status(500).json({ error: 'Error al subir contrato firmado' });
    }
});
/**
 * Función auxiliar para generar PDF a partir de HTML
 * Esta función es un placeholder - en una implementación real
 * se usaría una biblioteca como puppeteer o html-pdf
 */
async function generatePdfFromHtml(html, outputPath) {
    // Este es un ejemplo simplificado
    // En producción, deberías usar una biblioteca para convertir HTML a PDF
    try {
        // Aquí iría el código para generar el PDF
        // Por ahora, simplemente guardamos el HTML
        fs.writeFileSync(outputPath, html);
        return true;
    }
    catch (error) {
        console.error('Error al generar PDF:', error);
        return false;
    }
}
