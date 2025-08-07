"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentSignaturesRouter = void 0;
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const schema_1 = require("@shared/schema");
const drizzle_orm_1 = require("drizzle-orm");
exports.documentSignaturesRouter = express_1.default.Router();
/**
 * Endpoint para agregar una firma digital de cliente a un documento
 * POST /api/documents/:documentId/client-signature
 */
exports.documentSignaturesRouter.post('/:documentId/client-signature', async (req, res) => {
    try {
        const { documentId } = req.params;
        const { signatureData } = req.body;
        if (!signatureData) {
            return res.status(400).json({ error: 'La firma digital es requerida' });
        }
        // Verificar que el documento existe
        const existingDocument = await db_1.db.select().from(schema_1.documents).where((0, drizzle_orm_1.eq)(schema_1.documents.id, parseInt(documentId))).limit(1);
        if (existingDocument.length === 0) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }
        // Actualizar el documento con la firma y cambiar su estado
        const [updatedDocument] = await db_1.db
            .update(schema_1.documents)
            .set({
            signatureData: signatureData,
            signatureTimestamp: new Date(),
            status: 'signed',
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, parseInt(documentId)))
            .returning();
        // Registrar evento de firma de cliente (simplificado para la demo)
        console.log(`Documento ${documentId} firmado por cliente: ${req.user?.id || 'usuario anónimo'}`);
        res.status(200).json(updatedDocument);
    }
    catch (error) {
        console.error('Error al guardar la firma del cliente:', error);
        res.status(500).json({ error: 'Error al guardar la firma del cliente' });
    }
});
/**
 * Endpoint para agregar una firma digital de certificador a un documento
 * POST /api/documents/:documentId/certifier-signature
 */
exports.documentSignaturesRouter.post('/:documentId/certifier-signature', async (req, res) => {
    try {
        const { documentId } = req.params;
        const { signatureData } = req.body;
        if (!signatureData) {
            return res.status(400).json({ error: 'La firma digital es requerida' });
        }
        // Verificar que el documento existe y ya tiene firma del cliente
        const existingDocument = await db_1.db.select().from(schema_1.documents).where((0, drizzle_orm_1.eq)(schema_1.documents.id, parseInt(documentId))).limit(1);
        if (existingDocument.length === 0) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }
        const document = existingDocument[0];
        if (!document.signatureData) {
            return res.status(400).json({ error: 'El documento debe ser firmado primero por el cliente' });
        }
        // Actualizar el documento con la firma del certificador y cambiar su estado
        const [updatedDocument] = await db_1.db
            .update(schema_1.documents)
            .set({
            certifierSignatureData: signatureData,
            certifierSignatureTimestamp: new Date(),
            certifierId: req.user?.id || null,
            status: 'certified',
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, parseInt(documentId)))
            .returning();
        // Registrar evento de certificación (simplificado para la demo)
        console.log(`Documento ${documentId} certificado por: ${req.user?.id || 'certificador anónimo'}`);
        res.status(200).json(updatedDocument);
    }
    catch (error) {
        console.error('Error al guardar la firma del certificador:', error);
        res.status(500).json({ error: 'Error al guardar la firma del certificador' });
    }
});
