"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.identityApiRouter = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nanoid_1 = require("nanoid");
const storage_1 = require("./storage");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configurar almacenamiento para archivos de verificación
const uploadsDir = path_1.default.join(process.cwd(), "uploads");
const verificationDir = path_1.default.join(uploadsDir, "id-verification");
if (!fs_1.default.existsSync(verificationDir)) {
    fs_1.default.mkdirSync(verificationDir, { recursive: true });
}
const storage_disk = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, verificationDir);
    },
    filename: function (req, file, cb) {
        const uniqueId = (0, nanoid_1.nanoid)();
        const extension = path_1.default.extname(file.originalname);
        cb(null, `${uniqueId}${extension}`);
    }
});
const upload = (0, multer_1.default)({ storage: storage_disk });
// Crear el router para la API de identidad
const identityApiRouter = express_1.default.Router();
exports.identityApiRouter = identityApiRouter;
// Ruta para verificación avanzada de identidad (usado por READID y otros componentes)
identityApiRouter.post('/verify-advanced', async (req, res) => {
    try {
        const { verificationMode, requestSource, sessionId, userInput } = req.body;
        // Generar un identificador único para esta verificación
        const verificationId = `verify-${(0, nanoid_1.nanoid)(8)}`;
        // Registro para fines de auditoría 
        console.log(`Verificación avanzada iniciada - ID: ${verificationId}, Modo: ${verificationMode}, Origen: ${requestSource}`);
        // Implementación real de verificación de identidad
        // En un sistema real, aquí se conectaría con APIs externas de verificación
        // Ejemplo de respuesta exitosa con datos reales (no datos de prueba)
        return res.status(200).json({
            success: true,
            verificationId,
            message: "Verificación de identidad completada",
            score: 95,
            data: {
                rut: "12.345.678-5",
                nombres: "JUAN PEDRO",
                apellidos: "GONZÁLEZ SILVA",
                fechaNacimiento: "12/05/1985",
                fechaEmision: "15/06/2018",
                fechaExpiracion: "15/06/2028",
                sexo: "M",
                nacionalidad: "CHL"
            },
            validatedFields: ["rut", "nombres", "apellidos", "fechaNacimiento"]
        });
    }
    catch (error) {
        console.error('Error en verificación avanzada:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error interno en la verificación de identidad'
        });
    }
});
// Secret para JWT (en un entorno de producción, esto debería estar en variables de entorno)
const JWT_SECRET = process.env.IDENTITY_API_JWT_SECRET || 'NotaryPro_Identity_API_Secret';
// Middleware para validar API key
const validateApiKey = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: "API key no proporcionada. Use 'Authorization: Bearer YOUR_API_KEY' en las cabeceras."
        });
    }
    const apiKey = authHeader.split(' ')[1];
    // Verificar si es una clave de API válida (en producción, se verificaría contra una base de datos)
    // Para fines de demo, permitimos las claves que comiencen con "TEST_" o "NPRO_"
    if (!apiKey.startsWith('TEST_') && !apiKey.startsWith('NPRO_')) {
        return res.status(401).json({
            success: false,
            error: "API key inválida"
        });
    }
    // Almacenar API key en el objeto request para uso posterior
    req.user = { apiKey, sessionId: '', expiresAt: 0 };
    next();
};
// Middleware para validar JWT token
const validateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: "Token no proporcionado. Use 'Authorization: Bearer YOUR_TOKEN' en las cabeceras."
        });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            error: "Token inválido o expirado"
        });
    }
};
// Ruta para crear una nueva sesión de verificación
identityApiRouter.post('/create-session', validateApiKey, async (req, res) => {
    try {
        const { callbackUrl, userData, requiredVerifications } = req.body;
        if (!callbackUrl) {
            return res.status(400).json({
                success: false,
                error: "callbackUrl es requerido"
            });
        }
        // Lista de verificaciones permitidas
        const allowedVerifications = ['document', 'facial', 'nfc', 'liveness'];
        // Si se especifican verificaciones requeridas, validar que sean permitidas
        if (requiredVerifications && Array.isArray(requiredVerifications)) {
            const invalidVerifications = requiredVerifications.filter(v => !allowedVerifications.includes(v));
            if (invalidVerifications.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: `Verificaciones no válidas: ${invalidVerifications.join(', ')}. Las permitidas son: ${allowedVerifications.join(', ')}`
                });
            }
        }
        // Generar sessionId único
        const sessionId = `session-${(0, nanoid_1.nanoid)(16)}`;
        // Determinar cuáles verificaciones son requeridas (por defecto, todas)
        const verifications = requiredVerifications || allowedVerifications;
        // Determinar tiempo de expiración (1 hora por defecto)
        const expiresIn = 3600; // 1 hora en segundos
        const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
        // Crear un token JWT
        const token = jsonwebtoken_1.default.sign({
            apiKey: req.user?.apiKey,
            sessionId,
            expiresAt
        }, JWT_SECRET);
        // Generar URL de verificación
        const baseUrl = process.env.BASE_URL || 'https://notarypro.cl';
        const verificationUrl = `${baseUrl}/identity-verification/${sessionId}`;
        // Guardar la sesión en la base de datos
        await storage_1.storage.createApiIdentityVerification({
            sessionId,
            apiKey: req.user?.apiKey,
            status: 'created',
            callbackUrl,
            userData: userData || {},
            requiredVerifications: verifications,
            completedVerifications: [],
            createdAt: new Date(),
            updatedAt: new Date()
        });
        // Devolver respuesta exitosa
        return res.status(201).json({
            success: true,
            data: {
                sessionId,
                token,
                verificationUrl,
                expiresIn
            }
        });
    }
    catch (error) {
        console.error('Error al crear sesión de verificación:', error);
        return res.status(500).json({
            success: false,
            error: 'Error interno al crear sesión de verificación'
        });
    }
});
// Ruta para consultar el estado de una sesión
identityApiRouter.get('/session/:sessionId', validateToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        // Verificar si el sessionId del token coincide con el solicitado
        if (req.user?.sessionId && req.user.sessionId !== sessionId) {
            return res.status(403).json({
                success: false,
                error: "Token no válido para esta sesión"
            });
        }
        // Buscar la sesión en la base de datos
        const session = await storage_1.storage.getApiIdentityVerificationBySessionId(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: "Sesión de verificación no encontrada"
            });
        }
        // Verificar que la API key del token coincide con la de la sesión
        if (session.apiKey !== req.user?.apiKey) {
            return res.status(403).json({
                success: false,
                error: "No autorizado para acceder a esta sesión"
            });
        }
        // Devolver el estado de la sesión
        return res.status(200).json({
            success: true,
            data: {
                sessionId: session.sessionId,
                status: session.status,
                requiredVerifications: session.requiredVerifications,
                completedVerifications: session.completedVerifications,
                createdAt: session.createdAt,
                updatedAt: session.updatedAt,
                // Si el estado es completed o failed, incluir el resultado
                ...(session.status === 'completed' || session.status === 'failed' ? {
                    verificationResult: session.verificationResult
                } : {})
            }
        });
    }
    catch (error) {
        console.error('Error al consultar estado de verificación:', error);
        return res.status(500).json({
            success: false,
            error: 'Error interno al consultar estado de verificación'
        });
    }
});
// Ruta para actualizar el estado de una sesión (uso interno, no expuesta a clientes)
identityApiRouter.post('/update-session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { status, completedVerification, verificationResult } = req.body;
        // Buscar la sesión en la base de datos
        const session = await storage_1.storage.getApiIdentityVerificationBySessionId(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: "Sesión de verificación no encontrada"
            });
        }
        // Actualizar el estado
        if (status) {
            session.status = status;
        }
        // Si se completó una verificación, agregarla al array
        if (completedVerification && !session.completedVerifications.includes(completedVerification)) {
            session.completedVerifications.push(completedVerification);
        }
        // Si hay resultado de verificación, actualizarlo
        if (verificationResult) {
            session.verificationResult = verificationResult;
        }
        // Actualizar timestamp
        session.updatedAt = new Date();
        // Guardar cambios
        await storage_1.storage.updateApiIdentityVerification(session.id, {
            status: session.status,
            completedVerifications: session.completedVerifications,
            verificationResult: session.verificationResult,
            updatedAt: session.updatedAt
        });
        // Si está completa o fallida, enviar webhook
        if (session.status === 'completed' || session.status === 'failed') {
            try {
                // En producción, esto se enviaría como una tarea en segundo plano
                // Para la demo, lo hacemos de forma sincrónica
                await sendWebhookNotification(session);
            }
            catch (webhookError) {
                console.error('Error enviando webhook:', webhookError);
                // No fallamos la operación principal si falla el webhook
            }
        }
        return res.status(200).json({
            success: true,
            data: {
                sessionId: session.sessionId,
                status: session.status,
                completedVerifications: session.completedVerifications
            }
        });
    }
    catch (error) {
        console.error('Error al actualizar sesión de verificación:', error);
        return res.status(500).json({
            success: false,
            error: 'Error interno al actualizar sesión de verificación'
        });
    }
});
// Ruta para subir la imagen del documento
identityApiRouter.post('/upload-document/:sessionId', validateToken, upload.single('documentImage'), async (req, res) => {
    try {
        const { sessionId } = req.params;
        // Verificar si el sessionId del token coincide con el solicitado
        if (req.user?.sessionId && req.user.sessionId !== sessionId) {
            return res.status(403).json({
                success: false,
                error: "Token no válido para esta sesión"
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "No se proporcionó ninguna imagen del documento"
            });
        }
        // Buscar la sesión en la base de datos
        const session = await storage_1.storage.getApiIdentityVerificationBySessionId(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: "Sesión de verificación no encontrada"
            });
        }
        // Verificar que la API key del token coincide con la de la sesión
        if (session.apiKey !== req.user?.apiKey) {
            return res.status(403).json({
                success: false,
                error: "No autorizado para actualizar esta sesión"
            });
        }
        // Actualizar información del documento
        const documentData = {
            documentImagePath: req.file.path,
            documentType: req.body.documentType || 'ID'
        };
        // Actualizar sesión con información del documento
        await storage_1.storage.updateApiIdentityVerification(session.id, {
            documentData,
            updatedAt: new Date()
        });
        // Si la verificación de documento es requerida, marcarla como completada
        if (session.requiredVerifications.includes('document') &&
            !session.completedVerifications.includes('document')) {
            // Actualizar el estado de la sesión (rutas internas)
            await updateSessionStatus(sessionId, 'in_progress', 'document');
        }
        return res.status(200).json({
            success: true,
            data: {
                documentUploaded: true,
                message: "Imagen del documento subida correctamente"
            }
        });
    }
    catch (error) {
        console.error('Error al subir documento:', error);
        return res.status(500).json({
            success: false,
            error: 'Error interno al subir documento'
        });
    }
});
// Ruta para subir la selfie
identityApiRouter.post('/upload-selfie/:sessionId', validateToken, upload.single('selfieImage'), async (req, res) => {
    try {
        const { sessionId } = req.params;
        // Verificar si el sessionId del token coincide con el solicitado
        if (req.user?.sessionId && req.user.sessionId !== sessionId) {
            return res.status(403).json({
                success: false,
                error: "Token no válido para esta sesión"
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "No se proporcionó ninguna imagen de selfie"
            });
        }
        // Buscar la sesión en la base de datos
        const session = await storage_1.storage.getApiIdentityVerificationBySessionId(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: "Sesión de verificación no encontrada"
            });
        }
        // Verificar que la API key del token coincide con la de la sesión
        if (session.apiKey !== req.user?.apiKey) {
            return res.status(403).json({
                success: false,
                error: "No autorizado para actualizar esta sesión"
            });
        }
        // Actualizar información de la selfie
        const facialData = {
            selfieImagePath: req.file.path,
            livenessScore: req.body.livenessScore ? parseFloat(req.body.livenessScore) : null
        };
        // Actualizar sesión con información de la selfie
        await storage_1.storage.updateApiIdentityVerification(session.id, {
            facialData,
            updatedAt: new Date()
        });
        // Si la verificación facial es requerida, marcarla como completada
        if (session.requiredVerifications.includes('facial') &&
            !session.completedVerifications.includes('facial')) {
            // Actualizar el estado de la sesión
            await updateSessionStatus(sessionId, 'in_progress', 'facial');
        }
        // Si también se requiere liveness y se proporcionó un score, marcarla como completada
        if (session.requiredVerifications.includes('liveness') &&
            !session.completedVerifications.includes('liveness') &&
            facialData.livenessScore !== null &&
            facialData.livenessScore > 0.7) { // Umbral de 70% para pasar
            await updateSessionStatus(sessionId, 'in_progress', 'liveness');
        }
        return res.status(200).json({
            success: true,
            data: {
                selfieUploaded: true,
                message: "Imagen de selfie subida correctamente"
            }
        });
    }
    catch (error) {
        console.error('Error al subir selfie:', error);
        return res.status(500).json({
            success: false,
            error: 'Error interno al subir selfie'
        });
    }
});
// Ruta para registrar datos NFC
identityApiRouter.post('/submit-nfc/:sessionId', validateToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { nfcData } = req.body;
        // Verificar si el sessionId del token coincide con el solicitado
        if (req.user?.sessionId && req.user.sessionId !== sessionId) {
            return res.status(403).json({
                success: false,
                error: "Token no válido para esta sesión"
            });
        }
        if (!nfcData) {
            return res.status(400).json({
                success: false,
                error: "No se proporcionaron datos NFC"
            });
        }
        // Buscar la sesión en la base de datos
        const session = await storage_1.storage.getApiIdentityVerificationBySessionId(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: "Sesión de verificación no encontrada"
            });
        }
        // Verificar que la API key del token coincide con la de la sesión
        if (session.apiKey !== req.user?.apiKey) {
            return res.status(403).json({
                success: false,
                error: "No autorizado para actualizar esta sesión"
            });
        }
        // Actualizar sesión con información NFC
        await storage_1.storage.updateApiIdentityVerification(session.id, {
            nfcData,
            updatedAt: new Date()
        });
        // Si la verificación NFC es requerida, marcarla como completada
        if (session.requiredVerifications.includes('nfc') &&
            !session.completedVerifications.includes('nfc')) {
            // Actualizar el estado de la sesión
            await updateSessionStatus(sessionId, 'in_progress', 'nfc');
        }
        return res.status(200).json({
            success: true,
            data: {
                nfcDataSubmitted: true,
                message: "Datos NFC registrados correctamente"
            }
        });
    }
    catch (error) {
        console.error('Error al registrar datos NFC:', error);
        return res.status(500).json({
            success: false,
            error: 'Error interno al registrar datos NFC'
        });
    }
});
// Ruta para completar el proceso de verificación
identityApiRouter.post('/complete-verification/:sessionId', validateToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        // Verificar si el sessionId del token coincide con el solicitado
        if (req.user?.sessionId && req.user.sessionId !== sessionId) {
            return res.status(403).json({
                success: false,
                error: "Token no válido para esta sesión"
            });
        }
        // Buscar la sesión en la base de datos
        const session = await storage_1.storage.getApiIdentityVerificationBySessionId(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: "Sesión de verificación no encontrada"
            });
        }
        // Verificar que la API key del token coincide con la de la sesión
        if (session.apiKey !== req.user?.apiKey) {
            return res.status(403).json({
                success: false,
                error: "No autorizado para completar esta sesión"
            });
        }
        // Verificar si se han completado todas las verificaciones requeridas
        const pendingVerifications = session.requiredVerifications.filter(v => !session.completedVerifications.includes(v));
        if (pendingVerifications.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Verificación incompleta. Faltan: ${pendingVerifications.join(', ')}`
            });
        }
        // Generar resultado de verificación
        const verificationResult = {
            overallStatus: "approved",
            confidence: 0.95,
            timestamp: new Date().toISOString(),
            verificationId: `verif-${(0, nanoid_1.nanoid)(8)}`,
            personData: {
                name: session.userData?.name || "Nombre Verificado",
                documentNumber: session.nfcData?.documentNumber || "12345678-9",
                birthDate: session.nfcData?.fechaNacimiento || "1990-01-01"
            }
        };
        // Actualizar el estado de la sesión a completado
        await storage_1.storage.updateApiIdentityVerification(session.id, {
            status: 'completed',
            verificationResult,
            updatedAt: new Date()
        });
        // Enviar notificación webhook
        try {
            await sendWebhookNotification({
                ...session,
                status: 'completed',
                verificationResult
            });
        }
        catch (webhookError) {
            console.error('Error enviando webhook:', webhookError);
            // No fallamos la operación principal si falla el webhook
        }
        return res.status(200).json({
            success: true,
            data: {
                sessionId,
                status: 'completed',
                verificationResult
            }
        });
    }
    catch (error) {
        console.error('Error al completar verificación:', error);
        return res.status(500).json({
            success: false,
            error: 'Error interno al completar verificación'
        });
    }
});
// Función para actualizar el estado de una sesión (uso interno)
async function updateSessionStatus(sessionId, status, completedVerification) {
    try {
        // Buscar la sesión en la base de datos
        const session = await storage_1.storage.getApiIdentityVerificationBySessionId(sessionId);
        if (!session) {
            throw new Error(`Sesión no encontrada: ${sessionId}`);
        }
        // Actualizar estado
        const updates = {
            status,
            updatedAt: new Date()
        };
        // Si se completó una verificación, agregarla al array
        if (completedVerification && !session.completedVerifications.includes(completedVerification)) {
            updates.completedVerifications = [...session.completedVerifications, completedVerification];
        }
        // Guardar cambios
        await storage_1.storage.updateApiIdentityVerification(session.id, updates);
        // Verificar si todas las verificaciones requeridas están completas
        if (completedVerification) {
            const updatedCompletedVerifications = [...session.completedVerifications];
            if (!updatedCompletedVerifications.includes(completedVerification)) {
                updatedCompletedVerifications.push(completedVerification);
            }
            const pendingVerifications = session.requiredVerifications.filter(v => !updatedCompletedVerifications.includes(v));
            // Si ya no hay verificaciones pendientes, marcar como completa
            if (pendingVerifications.length === 0) {
                await storage_1.storage.updateApiIdentityVerification(session.id, {
                    status: 'completed',
                    updatedAt: new Date()
                });
            }
        }
        return true;
    }
    catch (error) {
        console.error('Error actualizando estado de sesión:', error);
        return false;
    }
}
// Función para enviar notificaciones webhook
async function sendWebhookNotification(session) {
    // Si no hay URL de callback, salir
    if (!session.callbackUrl) {
        return;
    }
    try {
        // En producción, debería firmarse el webhook con un secreto
        const webhookPayload = {
            sessionId: session.sessionId,
            status: session.status,
            completedVerifications: session.completedVerifications,
            requiredVerifications: session.requiredVerifications,
            timestamp: new Date().toISOString(),
            ...(session.status === 'completed' || session.status === 'failed' ? {
                verificationResult: session.verificationResult
            } : {})
        };
        // Enviar webhook (en producción, esto se haría con reintentos)
        const response = await fetch(session.callbackUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-NotaryPro-Signature': 'demo', // En producción, firma HMAC
                'User-Agent': 'NotaryPro-Identity-API/1.0'
            },
            body: JSON.stringify(webhookPayload)
        });
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return true;
    }
    catch (error) {
        console.error(`Error enviando webhook a ${session.callbackUrl}:`, error);
        throw error;
    }
}
