"use strict";
/**
 * RUTAS RON CON JITSI MEET
 * Sistema completo de videollamadas RON usando Jitsi Meet
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ronJitsiRouter = void 0;
const express_1 = __importDefault(require("express"));
const jwt_auth_service_1 = require("./services/jwt-auth-service");
const jitsi_video_service_1 = require("./services/jitsi-video-service");
const ronJitsiRouter = express_1.default.Router();
exports.ronJitsiRouter = ronJitsiRouter;
/**
 * GET /api/ron-jitsi/config
 * Configuración del sistema Jitsi
 */
ronJitsiRouter.get('/config', async (req, res) => {
    try {
        const config = (0, jitsi_video_service_1.isJitsiConfigured)();
        const demoConfig = (0, jitsi_video_service_1.getJitsiDemoConfig)();
        res.json({
            success: true,
            provider: 'Jitsi Meet',
            ...config,
            demo: demoConfig,
            endpoints: {
                createSession: '/api/ron-jitsi/create-session',
                joinSession: '/api/ron-jitsi/session/:id/join',
                getTokens: '/api/ron-jitsi/session/:id/config',
                finishSession: '/api/ron-jitsi/session/:id/finish'
            }
        });
    }
    catch (error) {
        console.error('Error obteniendo configuración Jitsi:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener configuración'
        });
    }
});
/**
 * POST /api/ron-jitsi/create-session
 * Crear sesión RON con Jitsi Meet
 */
ronJitsiRouter.post('/create-session', jwt_auth_service_1.authenticateJWT, (0, jwt_auth_service_1.requireRole)(['certifier', 'admin', 'notary']), async (req, res) => {
    try {
        const { clientId, documentId, scheduledAt, notes } = req.body;
        const certifierId = req.user?.userId;
        if (!clientId || !documentId || !scheduledAt) {
            return res.status(400).json({
                success: false,
                error: 'clientId, documentId y scheduledAt son requeridos'
            });
        }
        const session = await (0, jitsi_video_service_1.createJitsiRonSession)(certifierId, Number(clientId), Number(documentId), new Date(scheduledAt));
        res.status(201).json({
            success: true,
            message: 'Sesión RON con Jitsi creada exitosamente',
            session: {
                id: session.id,
                roomName: session.roomName,
                status: session.status,
                scheduledAt: session.scheduledAt,
                jitsiDomain: session.jitsiConfig.domain
            },
            urls: {
                certifier: `/ron-jitsi/${session.id}?role=certifier`,
                client: `/ron-jitsi/${session.id}?role=client`
            }
        });
    }
    catch (error) {
        console.error('Error creando sesión RON Jitsi:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error al crear sesión RON'
        });
    }
});
/**
 * GET /api/ron-jitsi/session/:id/config
 * Obtener configuración Jitsi para usuario específico
 */
ronJitsiRouter.get('/session/:id/config', jwt_auth_service_1.authenticateJWT, async (req, res) => {
    try {
        const sessionId = req.params.id;
        const userId = req.user?.userId;
        const result = await (0, jitsi_video_service_1.getJitsiConfigForUser)(sessionId, userId);
        if (!result.success) {
            return res.status(404).json(result);
        }
        res.json({
            success: true,
            jitsi: result.config,
            session: {
                id: sessionId,
                userRole: result.config?.userRole
            },
            urls: {
                directJoin: (0, jitsi_video_service_1.generateJitsiMeetUrl)(result.config.roomName, result.config.userName, result.config.userEmail, result.config.userRole === 'certifier'),
                embed: `/ron-jitsi/${sessionId}/embed`
            }
        });
    }
    catch (error) {
        console.error('Error obteniendo configuración Jitsi:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener configuración de video'
        });
    }
});
/**
 * GET /api/ron-jitsi/session/:id/join
 * Obtener URL para unirse a sesión Jitsi
 */
ronJitsiRouter.get('/session/:id/join', jwt_auth_service_1.authenticateJWT, async (req, res) => {
    try {
        const sessionId = req.params.id;
        const userId = req.user?.userId;
        const sessionInfo = await (0, jitsi_video_service_1.getJitsiSessionInfo)(sessionId);
        if (!sessionInfo) {
            return res.status(404).json({
                success: false,
                error: 'Sesión RON no encontrada'
            });
        }
        const { session, certifier, client } = sessionInfo;
        // Verificar permisos
        const isCertifier = session.certifierId === userId;
        const isClient = session.clientId === userId;
        const isAdmin = req.user?.role === 'admin';
        if (!isCertifier && !isClient && !isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Sin permisos para acceder a esta sesión'
            });
        }
        const user = isCertifier ? certifier : client;
        const joinUrl = (0, jitsi_video_service_1.generateJitsiMeetUrl)(session.roomName, `${user.fullName} (${isCertifier ? 'Certificador' : 'Cliente'})`, user.email, isCertifier);
        res.json({
            success: true,
            joinUrl,
            session: {
                id: sessionId,
                roomName: session.roomName,
                status: session.status,
                userRole: isCertifier ? 'certifier' : 'client'
            },
            instructions: [
                'Haz clic en el enlace para unirte a la videollamada',
                'Asegúrate de tener cámara y micrófono funcionando',
                'La sesión será grabada para fines legales',
                'Ten tu documento de identidad a mano',
                isCertifier ? 'Como certificador, tienes permisos de moderador' : 'Espera a que el certificador inicie la sesión'
            ]
        });
    }
    catch (error) {
        console.error('Error obteniendo URL de unión Jitsi:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener URL de unión'
        });
    }
});
/**
 * POST /api/ron-jitsi/session/:id/finish
 * Finalizar sesión RON Jitsi
 */
ronJitsiRouter.post('/session/:id/finish', jwt_auth_service_1.authenticateJWT, (0, jwt_auth_service_1.requireRole)(['certifier', 'admin', 'notary']), async (req, res) => {
    try {
        const sessionId = req.params.id;
        const { recordingUrl, sessionSummary, certificationNotes } = req.body;
        const userId = req.user?.userId;
        const result = await (0, jitsi_video_service_1.finishJitsiRonSession)(sessionId, userId, recordingUrl, sessionSummary || certificationNotes);
        res.json({
            success: true,
            message: result.message,
            session: {
                id: sessionId,
                status: 'completed',
                completedAt: new Date(),
                completedBy: req.user?.fullName
            }
        });
    }
    catch (error) {
        console.error('Error finalizando sesión RON Jitsi:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error al finalizar sesión'
        });
    }
});
/**
 * GET /api/ron-jitsi/sessions
 * Obtener sesiones Jitsi del usuario
 */
ronJitsiRouter.get('/sessions', jwt_auth_service_1.authenticateJWT, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { status = 'all' } = req.query;
        // Si es certificador, obtener sus sesiones
        if (['certifier', 'admin', 'notary'].includes(req.user?.role || '')) {
            const sessions = await (0, jitsi_video_service_1.getJitsiCertifierSessions)(userId, status === 'all' ? undefined : status);
            // Obtener información adicional para cada sesión
            const sessionsWithDetails = await Promise.all(sessions.map(async (session) => {
                const info = await (0, jitsi_video_service_1.getJitsiSessionInfo)(session.id);
                return {
                    ...session,
                    ...info
                };
            }));
            res.json({
                success: true,
                sessions: sessionsWithDetails,
                userRole: 'certifier',
                summary: {
                    total: sessions.length,
                    active: sessions.filter(s => s.status === 'active').length,
                    scheduled: sessions.filter(s => s.status === 'scheduled').length,
                    completed: sessions.filter(s => s.status === 'completed').length
                }
            });
        }
        else {
            // Para clientes, buscar sesiones donde sean participantes
            const allSessions = Array.from(jitsiSessions.values());
            const userSessions = allSessions.filter(session => session.clientId === userId);
            res.json({
                success: true,
                sessions: userSessions,
                userRole: 'client',
                summary: {
                    total: userSessions.length,
                    active: userSessions.filter(s => s.status === 'active').length,
                    scheduled: userSessions.filter(s => s.status === 'scheduled').length,
                    completed: userSessions.filter(s => s.status === 'completed').length
                }
            });
        }
    }
    catch (error) {
        console.error('Error obteniendo sesiones Jitsi:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener sesiones'
        });
    }
});
/**
 * GET /api/ron-jitsi/dashboard
 * Dashboard RON con métricas de Jitsi
 */
ronJitsiRouter.get('/dashboard', jwt_auth_service_1.authenticateJWT, (0, jwt_auth_service_1.requireRole)(['certifier', 'admin', 'notary']), async (req, res) => {
    try {
        const certifierId = req.user?.userId;
        const isAdmin = req.user?.role === 'admin';
        // Obtener estadísticas
        const stats = await (0, jitsi_video_service_1.getJitsiUsageStats)(isAdmin ? undefined : certifierId);
        // Limpiar sesiones expiradas
        const cleanedSessions = (0, jitsi_video_service_1.cleanupExpiredSessions)();
        // Sesiones activas actuales
        const activeSessions = Array.from(jitsiSessions.values())
            .filter(session => session.status === 'active' &&
            (isAdmin || session.certifierId === certifierId));
        // Próximas sesiones
        const upcomingSessions = Array.from(jitsiSessions.values())
            .filter(session => session.status === 'scheduled' &&
            session.scheduledAt > new Date() &&
            (isAdmin || session.certifierId === certifierId))
            .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
            .slice(0, 5);
        res.json({
            success: true,
            dashboard: {
                provider: 'Jitsi Meet',
                metrics: stats,
                activeSessions: activeSessions.length,
                upcomingSessions: upcomingSessions.length,
                cleanedSessions,
                jitsiConfig: (0, jitsi_video_service_1.isJitsiConfigured)()
            },
            sessions: {
                active: activeSessions,
                upcoming: upcomingSessions
            },
            user: {
                id: certifierId,
                name: req.user?.fullName,
                role: req.user?.role,
                isAdmin
            }
        });
    }
    catch (error) {
        console.error('Error obteniendo dashboard RON Jitsi:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener dashboard'
        });
    }
});
/**
 * GET /api/ron-jitsi/session/:id/embed
 * Configuración para embed de Jitsi
 */
ronJitsiRouter.get('/session/:id/embed', jwt_auth_service_1.authenticateJWT, async (req, res) => {
    try {
        const sessionId = req.params.id;
        const userId = req.user?.userId;
        const sessionInfo = await (0, jitsi_video_service_1.getJitsiSessionInfo)(sessionId);
        if (!sessionInfo) {
            return res.status(404).json({
                success: false,
                error: 'Sesión no encontrada'
            });
        }
        const { session } = sessionInfo;
        const isCertifier = session.certifierId === userId;
        const isClient = session.clientId === userId;
        if (!isCertifier && !isClient && req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Sin permisos para acceder'
            });
        }
        const embedConfig = await (0, jitsi_video_service_1.createCustomJitsiRoom)(sessionId, session.certifierId, session.clientId);
        res.json({
            success: true,
            embed: embedConfig.embedConfig,
            roomName: session.roomName,
            domain: session.jitsiConfig.domain,
            userRole: isCertifier ? 'certifier' : 'client'
        });
    }
    catch (error) {
        console.error('Error obteniendo configuración embed:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener configuración embed'
        });
    }
});
/**
 * POST /api/ron-jitsi/session/:id/record
 * Iniciar/detener grabación de sesión
 */
ronJitsiRouter.post('/session/:id/record', jwt_auth_service_1.authenticateJWT, (0, jwt_auth_service_1.requireRole)(['certifier', 'admin', 'notary']), async (req, res) => {
    try {
        const sessionId = req.params.id;
        const { action, recordingId } = req.body; // action: 'start' | 'stop'
        const userId = req.user?.userId;
        const sessionInfo = await (0, jitsi_video_service_1.getJitsiSessionInfo)(sessionId);
        if (!sessionInfo) {
            return res.status(404).json({
                success: false,
                error: 'Sesión no encontrada'
            });
        }
        if (sessionInfo.session.certifierId !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Solo el certificador puede controlar la grabación'
            });
        }
        // Registrar acción de grabación
        await db.insert(analyticsEvents).values({
            eventType: `ron_jitsi_recording_${action}`,
            userId: sessionInfo.session.clientId,
            documentId: sessionInfo.session.documentId,
            metadata: {
                sessionId,
                action,
                recordingId,
                certifierId: userId,
                timestamp: new Date()
            },
            createdAt: new Date()
        });
        res.json({
            success: true,
            message: `Grabación ${action === 'start' ? 'iniciada' : 'detenida'} exitosamente`,
            recording: {
                action,
                recordingId,
                sessionId
            }
        });
    }
    catch (error) {
        console.error('Error controlando grabación:', error);
        res.status(500).json({
            success: false,
            error: 'Error al controlar grabación'
        });
    }
});
/**
 * GET /api/ron-jitsi/stats
 * Estadísticas de uso de Jitsi
 */
ronJitsiRouter.get('/stats', jwt_auth_service_1.authenticateJWT, (0, jwt_auth_service_1.requireRole)(['admin', 'certifier']), async (req, res) => {
    try {
        const userId = req.user?.userId;
        const isAdmin = req.user?.role === 'admin';
        const stats = await (0, jitsi_video_service_1.getJitsiUsageStats)(isAdmin ? undefined : userId);
        res.json({
            success: true,
            stats,
            provider: 'Jitsi Meet',
            period: '30 días',
            scope: isAdmin ? 'global' : 'user'
        });
    }
    catch (error) {
        console.error('Error obteniendo estadísticas Jitsi:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener estadísticas'
        });
    }
});
/**
 * POST /api/ron-jitsi/cleanup
 * Limpiar sesiones expiradas (solo admin)
 */
ronJitsiRouter.post('/cleanup', jwt_auth_service_1.authenticateJWT, (0, jwt_auth_service_1.requireRole)(['admin']), async (req, res) => {
    try {
        const cleanedCount = (0, jitsi_video_service_1.cleanupExpiredSessions)();
        res.json({
            success: true,
            message: `${cleanedCount} sesiones expiradas limpiadas`,
            cleanedSessions: cleanedCount
        });
    }
    catch (error) {
        console.error('Error limpiando sesiones:', error);
        res.status(500).json({
            success: false,
            error: 'Error al limpiar sesiones'
        });
    }
});
/**
 * GET /api/ron-jitsi/test-room
 * Crear sala de prueba de Jitsi
 */
ronJitsiRouter.get('/test-room', jwt_auth_service_1.authenticateJWT, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const userName = req.user?.fullName || 'Usuario Test';
        const userEmail = req.user?.email || 'test@notarypro.cl';
        const testRoomName = `test-${userId}-${Date.now()}`;
        const testUrl = (0, jitsi_video_service_1.generateJitsiMeetUrl)(testRoomName, `${userName} (Prueba)`, userEmail, true // Moderador en prueba
        );
        res.json({
            success: true,
            message: 'Sala de prueba Jitsi creada',
            test: {
                roomName: testRoomName,
                joinUrl: testUrl,
                domain: JITSI_DOMAIN,
                userName,
                userEmail,
                isModerator: true
            },
            instructions: [
                'Esta es una sala de prueba para verificar tu cámara y micrófono',
                'Puedes invitar a otros para probar la funcionalidad',
                'La sala se eliminará automáticamente después de 1 hora',
                'Usa esta prueba antes de sesiones RON importantes'
            ]
        });
    }
    catch (error) {
        console.error('Error creando sala de prueba:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear sala de prueba'
        });
    }
});
