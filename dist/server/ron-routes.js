"use strict";
/**
 * Rutas para el sistema RON (Remote Online Notarization)
 *
 * Este módulo proporciona las APIs necesarias para la gestión de sesiones
 * de notarización en línea, incluyendo la creación, programación, y gestión
 * de sesiones de video usando Agora.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ronRouter = void 0;
const express_1 = require("express");
const agora_service_1 = require("./services/agora-service");
const storage_1 = require("./storage");
const auth_1 = require("./auth");
exports.ronRouter = (0, express_1.Router)();
// Middleware de autenticación para rutas protegidas
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.status(401).json({
        success: false,
        error: 'No autenticado'
    });
}
// Middleware para verificar rol de certificador
function isCertifier(req, res, next) {
    if (req.session && req.session.user &&
        (req.session.user.role === 'certifier' || req.session.user.role === 'admin')) {
        return next();
    }
    res.status(403).json({
        success: false,
        error: 'Acceso restringido a certificadores'
    });
}
/**
 * Obtener sesiones RON programadas para un certificador
 * GET /api/ron/sessions
 */
exports.ronRouter.get('/sessions', isAuthenticated, isCertifier, async (req, res) => {
    try {
        // En implementación real, obtener desde la base de datos
        // Para este demo, devolvemos sesiones simuladas
        const sessions = [
            {
                id: 'RON-2025-001',
                client: 'Cliente Demo 1',
                documentType: 'Contrato de Arriendo',
                scheduledFor: new Date(2025, 4, 15, 10, 0, 0).toISOString(),
                region: 'Santiago',
                status: 'programada'
            },
            {
                id: 'RON-2025-002',
                client: 'Cliente Demo 2',
                documentType: 'Poder Notarial',
                scheduledFor: new Date(2025, 4, 16, 15, 30, 0).toISOString(),
                region: 'Valparaíso',
                status: 'en_espera'
            }
        ];
        res.json({
            success: true,
            sessions
        });
    }
    catch (error) {
        console.error('Error al obtener sesiones RON:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener sesiones RON'
        });
    }
});
/**
 * Crear una nueva sesión RON
 * POST /api/ron/sessions
 */
exports.ronRouter.post('/sessions', isAuthenticated, isCertifier, async (req, res) => {
    try {
        const { client, documentType, scheduledFor, region } = req.body;
        // Validación básica
        if (!client || !documentType || !scheduledFor || !region) {
            return res.status(400).json({
                success: false,
                error: 'Faltan campos obligatorios'
            });
        }
        // Generar ID único para la sesión
        const sessionId = `RON-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        // En implementación real, guardar en la base de datos
        // Para este demo, simplemente devolvemos éxito con el ID
        res.json({
            success: true,
            sessionId,
            message: 'Sesión RON creada exitosamente'
        });
    }
    catch (error) {
        console.error('Error al crear sesión RON:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear sesión RON'
        });
    }
});
/**
 * Obtener detalles de una sesión RON específica
 * GET /api/ron/sessions/:id
 */
exports.ronRouter.get('/sessions/:id', isAuthenticated, async (req, res) => {
    try {
        const sessionId = req.params.id;
        // En implementación real, buscar en la base de datos
        // Para este demo, verificamos IDs simulados
        if (sessionId === 'RON-2025-001' || sessionId === 'RON-2025-002') {
            const isFirst = sessionId === 'RON-2025-001';
            res.json({
                success: true,
                session: {
                    id: sessionId,
                    client: isFirst ? 'Cliente Demo 1' : 'Cliente Demo 2',
                    documentType: isFirst ? 'Contrato de Arriendo' : 'Poder Notarial',
                    scheduledFor: isFirst
                        ? new Date(2025, 4, 15, 10, 0, 0).toISOString()
                        : new Date(2025, 4, 16, 15, 30, 0).toISOString(),
                    region: isFirst ? 'Santiago' : 'Valparaíso',
                    status: isFirst ? 'programada' : 'en_espera',
                    certifierName: 'Certificador Demo',
                    purpose: isFirst ? 'Firma de contrato de arriendo' : 'Otorgamiento de poder notarial',
                    documents: [
                        {
                            id: isFirst ? 'doc-001' : 'doc-003',
                            title: isFirst ? 'Contrato de Arriendo' : 'Poder Notarial',
                            type: isFirst ? 'contrato' : 'poder',
                            status: 'pendiente'
                        }
                    ]
                }
            });
        }
        else {
            res.status(404).json({
                success: false,
                error: 'Sesión RON no encontrada'
            });
        }
    }
    catch (error) {
        console.error('Error al obtener detalles de sesión RON:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener detalles de sesión RON'
        });
    }
});
/**
 * Actualizar estado de una sesión RON
 * PATCH /api/ron/sessions/:id
 */
exports.ronRouter.patch('/sessions/:id', isAuthenticated, isCertifier, async (req, res) => {
    try {
        const sessionId = req.params.id;
        const { status } = req.body;
        // Validación básica
        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'Falta el campo status'
            });
        }
        // En implementación real, actualizar en la base de datos
        // Para este demo, simplemente verificamos el ID
        if (sessionId === 'RON-2025-001' || sessionId === 'RON-2025-002') {
            res.json({
                success: true,
                message: `Estado de sesión ${sessionId} actualizado a ${status}`
            });
        }
        else {
            res.status(404).json({
                success: false,
                error: 'Sesión RON no encontrada'
            });
        }
    }
    catch (error) {
        console.error('Error al actualizar sesión RON:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar sesión RON'
        });
    }
});
/**
 * Obtener tokens para videollamada de una sesión RON
 * GET /api/ron/session/:id/video-tokens
 */
exports.ronRouter.get('/session/:id/video-tokens', isAuthenticated, async (req, res) => {
    try {
        const sessionId = req.params.id;
        // Verificar que la sesión existe
        if (sessionId !== 'RON-2025-001' && sessionId !== 'RON-2025-002') {
            return res.status(404).json({
                success: false,
                error: 'Sesión RON no encontrada'
            });
        }
        // Generar y enviar tokens para Agora
        const channelName = `ron-session-${sessionId.replace('RON-', '')}`;
        (0, agora_service_1.sendAgoraTokens)(res, channelName, true);
    }
    catch (error) {
        console.error('Error al obtener tokens para videollamada:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener tokens para videollamada'
        });
    }
});
// ===== Rutas públicas (sin autenticación) =====
/**
 * Verificar existencia de una sesión RON por su código
 * GET /api/ron/public/session/:code
 */
exports.ronRouter.get('/public/session/:code', async (req, res) => {
    try {
        const sessionCode = req.params.code;
        // En implementación real, buscar en la base de datos
        // Para este demo, verificamos códigos simulados
        if (sessionCode === 'RON-2025-001' || sessionCode === 'RON-2025-002') {
            const isFirst = sessionCode === 'RON-2025-001';
            res.json({
                success: true,
                id: sessionCode,
                client: isFirst ? 'Cliente Demo 1' : 'Cliente Demo 2',
                documentType: isFirst ? 'Contrato de Arriendo' : 'Poder Notarial',
                scheduledFor: isFirst
                    ? new Date(2025, 4, 15, 10, 0, 0).toISOString()
                    : new Date(2025, 4, 16, 15, 30, 0).toISOString(),
                region: isFirst ? 'Santiago' : 'Valparaíso',
                status: isFirst ? 'programada' : 'en_espera',
                certifierName: 'Certificador Demo',
                purpose: isFirst ? 'Firma de contrato de arriendo' : 'Otorgamiento de poder notarial'
            });
        }
        else {
            res.status(404).json({
                success: false,
                error: 'Código de sesión RON no válido o no encontrado'
            });
        }
    }
    catch (error) {
        console.error('Error al verificar código RON:', error);
        res.status(500).json({
            success: false,
            error: 'Error al verificar código RON'
        });
    }
});
/**
 * Obtener tokens públicos para una sesión RON
 * GET /api/ron/public/session/:code/tokens
 */
exports.ronRouter.get('/public/session/:code/tokens', async (req, res) => {
    try {
        const sessionCode = req.params.code;
        // Verificar que el código es válido
        if (sessionCode !== 'RON-2025-001' && sessionCode !== 'RON-2025-002') {
            return res.status(404).json({
                success: false,
                error: 'Código de sesión RON no válido o no encontrado'
            });
        }
        // Generar y enviar tokens para Agora (desde acceso público, cliente)
        const channelName = `ron-session-${sessionCode.replace('RON-', '')}`;
        (0, agora_service_1.sendAgoraTokens)(res, channelName, true);
    }
    catch (error) {
        console.error('Error al obtener tokens públicos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener tokens públicos'
        });
    }
});
/**
 * Obtener AppID de Agora (para modo forzado/pruebas)
 * GET /api/ron/public/app-id
 */
exports.ronRouter.get('/public/app-id', async (req, res) => {
    try {
        (0, agora_service_1.sendAgoraAppId)(res);
    }
    catch (error) {
        console.error('Error al obtener AppID de Agora:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener AppID de Agora'
        });
    }
});
/**
 * Ruta para inicio de sesión especial para el sistema RON
 * Esta ruta permite iniciar sesión al subsistema utilizando el sistema de autenticación principal
 * POST /api/ron/login
 */
exports.ronRouter.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        // Validación básica
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Nombre de usuario y contraseña requeridos'
            });
        }
        // Buscar usuario en el sistema
        const user = await storage_1.storage.getUserByUsername(username);
        // Verificar si el usuario existe
        if (!user) {
            console.log(`Inicio de sesión RON fallido - Usuario no encontrado: ${username}`);
            return res.status(401).json({
                success: false,
                error: 'Usuario o contraseña incorrectos'
            });
        }
        // Verificar contraseña
        const passwordValid = await (0, auth_1.comparePasswords)(password, user.password);
        if (!passwordValid) {
            console.log(`Inicio de sesión RON fallido - Contraseña incorrecta para: ${username}`);
            return res.status(401).json({
                success: false,
                error: 'Usuario o contraseña incorrectos'
            });
        }
        // Iniciar sesión exitosamente
        req.login(user, (loginErr) => {
            if (loginErr) {
                console.error("Error en login RON:", loginErr);
                return res.status(500).json({
                    success: false,
                    error: 'Error interno al iniciar sesión'
                });
            }
            console.log(`Inicio de sesión RON exitoso para: ${username} (${user.role})`);
            // Devolver información del usuario (sin la contraseña)
            const userResponse = {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            };
            return res.status(200).json({
                success: true,
                user: userResponse,
                message: 'Inicio de sesión exitoso'
            });
        });
    }
    catch (error) {
        console.error('Error en el proceso de login RON:', error);
        res.status(500).json({
            success: false,
            error: 'Error al procesar la solicitud de inicio de sesión'
        });
    }
});
