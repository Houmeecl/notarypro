"use strict";
/**
 * Rutas de API para el sistema de firma con QR
 *
 * Este módulo proporciona endpoints para:
 * - Generar códigos QR para firma móvil
 * - Verificar el estado de firmas mediante QR
 * - Procesar firmas de documentos vía dispositivo móvil
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.qrSignatureRouter = void 0;
const express_1 = require("express");
const crypto_1 = require("crypto");
const db_1 = require("../db");
const schema_1 = require("@shared/schema");
const drizzle_orm_1 = require("drizzle-orm");
exports.qrSignatureRouter = (0, express_1.Router)();
// Middleware de autenticación básico para las rutas
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'No autenticado' });
}
/**
 * Generar un nuevo código QR para firma
 * POST /api/qr-signature/generate
 */
exports.qrSignatureRouter.post('/generate', isAuthenticated, async (req, res) => {
    try {
        const { documentId } = req.body;
        if (!documentId) {
            return res.status(400).json({ error: 'Se requiere el ID del documento' });
        }
        // Verificar que el documento existe
        const document = await db_1.db.query.documents.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.documents.id, documentId)
        });
        if (!document) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }
        // Generar un código único para el QR
        const verificationCode = (0, crypto_1.randomBytes)(16).toString('hex');
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos de expiración
        // En una implementación real, guardaríamos esto en la base de datos
        // Aquí se simula la respuesta
        // URL para acceder a la página de firma móvil
        const signatureUrl = `${req.protocol}://${req.get('host')}/firma-movil/${documentId}/${verificationCode}`;
        res.status(200).json({
            success: true,
            documentId,
            verificationCode,
            expiresAt,
            signatureUrl,
            qrData: signatureUrl
        });
    }
    catch (error) {
        console.error('Error al generar QR:', error);
        res.status(500).json({ error: 'Error interno del servidor al generar QR' });
    }
});
/**
 * Verificar el estado de una firma por QR
 * GET /api/qr-signature/status/:documentId/:verificationCode
 */
exports.qrSignatureRouter.get('/status/:documentId/:verificationCode', isAuthenticated, async (req, res) => {
    try {
        const { documentId, verificationCode } = req.params;
        // En una implementación real, consultaríamos la base de datos para ver si el código
        // ha sido escaneado o usado para firmar
        // Simulamos una respuesta con tres estados posibles:
        // - waiting: el código no ha sido escaneado aún
        // - scanned: el código fue escaneado pero no firmado
        // - signed: el documento fue firmado
        // Asignar un estado aleatorio para la demostración
        const randomState = Math.floor(Math.random() * 3);
        let status = 'waiting';
        if (randomState === 1) {
            status = 'scanned';
        }
        else if (randomState === 2) {
            status = 'signed';
        }
        res.status(200).json({
            success: true,
            documentId,
            verificationCode,
            status,
            lastUpdated: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error al verificar estado QR:', error);
        res.status(500).json({ error: 'Error interno del servidor al verificar estado' });
    }
});
/**
 * Registrar una firma realizada desde un dispositivo móvil
 * POST /api/qr-signature/sign
 */
exports.qrSignatureRouter.post('/sign', async (req, res) => {
    try {
        const { documentId, verificationCode, signatureData } = req.body;
        if (!documentId || !verificationCode) {
            return res.status(400).json({ error: 'Se requieren documentId y verificationCode' });
        }
        // Verificar que el documento existe
        const document = await db_1.db.query.documents.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.documents.id, documentId)
        });
        if (!document) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }
        // En una implementación real, validaríamos el código de verificación
        // y registraríamos la firma en la base de datos
        // Simulamos una respuesta exitosa
        res.status(200).json({
            success: true,
            documentId,
            verificationCode,
            signedAt: new Date().toISOString(),
            message: 'Documento firmado correctamente mediante QR móvil'
        });
    }
    catch (error) {
        console.error('Error al firmar con QR:', error);
        res.status(500).json({ error: 'Error interno del servidor al procesar firma' });
    }
});
/**
 * Obtener información para mostrar en la página de firma móvil
 * GET /api/qr-signature/document-info/:documentId/:verificationCode
 */
exports.qrSignatureRouter.get('/document-info/:documentId/:verificationCode', async (req, res) => {
    try {
        const { documentId, verificationCode } = req.params;
        // Verificar que el documento existe
        const document = await db_1.db.query.documents.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.documents.id, documentId)
        });
        if (!document) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }
        // En una implementación real, validaríamos que el código de verificación
        // corresponde al documento y está vigente
        // Información a mostrar en la pantalla móvil
        res.status(200).json({
            success: true,
            documentId,
            verificationCode,
            documentInfo: {
                title: document.title,
                type: document.status || 'documento',
                createdAt: document.createdAt,
                pages: 1, // En una implementación real, esto se obtendría de los metadatos del documento
                client: {
                    name: "Nombre del cliente", // En una implementación real, esto vendría de la base de datos
                    identification: "12.345.678-9"
                }
            },
            isValid: true,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        });
    }
    catch (error) {
        console.error('Error al obtener info de documento:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
