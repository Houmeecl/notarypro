"use strict";
/**
 * SERVICIO JITSI MEET - Sistema de Video RON
 * Implementación completa con Jitsi Meet para videollamadas RON
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupExpiredSessions = exports.getJitsiUsageStats = exports.createCustomJitsiRoom = exports.getJitsiDemoConfig = exports.isJitsiConfigured = exports.generateJitsiMeetUrl = exports.getJitsiSessionInfo = exports.getJitsiCertifierSessions = exports.finishJitsiRonSession = exports.getJitsiConfigForUser = exports.createJitsiRonSession = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("@shared/schema");
// Configuración Jitsi
const JITSI_DOMAIN = process.env.JITSI_DOMAIN || 'meet.jit.si';
const JITSI_APP_ID = process.env.JITSI_APP_ID || 'notaryvecino';
const JITSI_PRIVATE_KEY = process.env.JITSI_PRIVATE_KEY || '';
const JITSI_KEY_ID = process.env.JITSI_KEY_ID || 'jitsi-key';
// Almacén de sesiones RON con Jitsi
const jitsiSessions = new Map();
/**
 * Generar JWT para Jitsi Meet (si está configurado)
 */
function generateJitsiJWT(roomName, userName, email, isModerator = false) {
    if (!JITSI_PRIVATE_KEY || !JITSI_APP_ID) {
        return null; // Modo público sin JWT
    }
    const payload = {
        iss: JITSI_APP_ID,
        sub: JITSI_DOMAIN,
        aud: JITSI_APP_ID,
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hora
        room: roomName,
        context: {
            user: {
                name: userName,
                email: email,
                id: crypto_1.default.randomUUID(),
                moderator: isModerator
            },
            features: {
                recording: isModerator,
                livestreaming: isModerator,
                transcription: true,
                "outbound-call": false
            }
        }
    };
    try {
        return jsonwebtoken_1.default.sign(payload, JITSI_PRIVATE_KEY, {
            algorithm: 'RS256',
            header: { kid: JITSI_KEY_ID }
        });
    }
    catch (error) {
        console.error('Error generando JWT de Jitsi:', error);
        return null;
    }
}
/**
 * Crear sesión RON con Jitsi Meet
 */
const createJitsiRonSession = async (certifierId, clientId, documentId, scheduledAt) => {
    try {
        // Generar nombre de sala único
        const timestamp = Date.now();
        const randomId = crypto_1.default.randomBytes(4).toString('hex');
        const roomName = `ron-${timestamp}-${randomId}`;
        const sessionId = `JITSI-RON-${timestamp}-${randomId}`;
        // Obtener información de usuarios
        const [certifier] = await db_1.db
            .select({
            fullName: schema_1.users.fullName,
            email: schema_1.users.email
        })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, certifierId));
        const [client] = await db_1.db
            .select({
            fullName: schema_1.users.fullName,
            email: schema_1.users.email
        })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, clientId));
        // Configuración Jitsi para la sala
        const jitsiConfig = {
            roomName,
            domain: JITSI_DOMAIN,
            moderator: false, // Se determinará por usuario
            features: {
                recording: true,
                livestreaming: false,
                transcription: true,
                chat: true,
                screenshare: true,
                whiteboard: true
            }
        };
        // Crear sesión
        const ronSession = {
            id: sessionId,
            roomName,
            certifierId,
            clientId,
            documentId,
            status: 'scheduled',
            scheduledAt,
            jitsiConfig
        };
        // Guardar sesión
        jitsiSessions.set(sessionId, ronSession);
        // Registrar evento
        await db_1.db.insert(schema_1.analyticsEvents).values({
            eventType: 'ron_jitsi_session_created',
            userId: certifierId,
            documentId,
            metadata: {
                sessionId,
                roomName,
                clientId,
                certifierId,
                scheduledAt,
                jitsiDomain: JITSI_DOMAIN,
                timestamp: new Date()
            },
            createdAt: new Date()
        });
        console.log(`✅ Sesión RON Jitsi creada: ${sessionId}`);
        return ronSession;
    }
    catch (error) {
        console.error('Error creando sesión RON Jitsi:', error);
        throw new Error('No se pudo crear la sesión RON con Jitsi');
    }
};
exports.createJitsiRonSession = createJitsiRonSession;
/**
 * Obtener configuración Jitsi para un usuario específico
 */
const getJitsiConfigForUser = async (sessionId, userId) => {
    try {
        const session = jitsiSessions.get(sessionId);
        if (!session) {
            return {
                success: false,
                error: 'Sesión RON no encontrada'
            };
        }
        // Verificar permisos
        const isCertifier = session.certifierId === userId;
        const isClient = session.clientId === userId;
        if (!isCertifier && !isClient) {
            return {
                success: false,
                error: 'Sin permisos para acceder a esta sesión'
            };
        }
        // Obtener información del usuario
        const [user] = await db_1.db
            .select({
            fullName: schema_1.users.fullName,
            email: schema_1.users.email
        })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
        if (!user) {
            return {
                success: false,
                error: 'Usuario no encontrado'
            };
        }
        // Generar JWT si está configurado
        const jitsiJWT = generateJitsiJWT(session.roomName, user.fullName, user.email, isCertifier // Solo el certificador es moderador
        );
        // Actualizar sesión a activa si es la primera vez
        if (session.status === 'scheduled') {
            session.status = 'active';
            session.startedAt = new Date();
            jitsiSessions.set(sessionId, session);
            // Registrar inicio
            await db_1.db.insert(schema_1.analyticsEvents).values({
                eventType: 'ron_jitsi_session_started',
                userId: session.clientId,
                documentId: session.documentId,
                metadata: {
                    sessionId,
                    roomName: session.roomName,
                    startedBy: userId,
                    userRole: isCertifier ? 'certifier' : 'client',
                    timestamp: new Date()
                },
                createdAt: new Date()
            });
        }
        return {
            success: true,
            config: {
                ...session.jitsiConfig,
                jwt: jitsiJWT,
                userRole: isCertifier ? 'certifier' : 'client',
                userName: user.fullName,
                userEmail: user.email
            }
        };
    }
    catch (error) {
        console.error('Error obteniendo configuración Jitsi:', error);
        return {
            success: false,
            error: 'Error al obtener configuración de video'
        };
    }
};
exports.getJitsiConfigForUser = getJitsiConfigForUser;
/**
 * Finalizar sesión RON Jitsi
 */
const finishJitsiRonSession = async (sessionId, userId, recordingUrl, sessionSummary) => {
    try {
        const session = jitsiSessions.get(sessionId);
        if (!session) {
            throw new Error('Sesión RON no encontrada');
        }
        // Solo el certificador puede finalizar
        if (session.certifierId !== userId) {
            throw new Error('Solo el certificador puede finalizar la sesión');
        }
        // Actualizar sesión
        session.status = 'completed';
        session.endedAt = new Date();
        session.recordingUrl = recordingUrl;
        jitsiSessions.set(sessionId, session);
        // Certificar documento automáticamente
        await db_1.db
            .update(schema_1.documents)
            .set({
            status: 'certified',
            updatedAt: new Date(),
            description: sessionSummary || 'Certificado vía RON con Jitsi Meet'
        })
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, session.documentId));
        // Registrar finalización
        await db_1.db.insert(schema_1.analyticsEvents).values({
            eventType: 'ron_jitsi_session_completed',
            userId: session.clientId,
            documentId: session.documentId,
            metadata: {
                sessionId,
                roomName: session.roomName,
                certifierId: session.certifierId,
                recordingUrl,
                sessionSummary,
                duration: session.startedAt ?
                    Math.round((new Date().getTime() - session.startedAt.getTime()) / 1000) : 0,
                timestamp: new Date()
            },
            createdAt: new Date()
        });
        console.log(`✅ Sesión RON Jitsi finalizada: ${sessionId}`);
        return {
            success: true,
            message: 'Sesión RON finalizada y documento certificado'
        };
    }
    catch (error) {
        console.error('Error finalizando sesión RON Jitsi:', error);
        throw error;
    }
};
exports.finishJitsiRonSession = finishJitsiRonSession;
/**
 * Obtener sesiones Jitsi de un certificador
 */
const getJitsiCertifierSessions = async (certifierId, status) => {
    try {
        const userSessions = Array.from(jitsiSessions.values()).filter(session => {
            const matchesCertifier = session.certifierId === certifierId;
            const matchesStatus = !status || session.status === status;
            return matchesCertifier && matchesStatus;
        });
        return userSessions.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
    }
    catch (error) {
        console.error('Error obteniendo sesiones Jitsi del certificador:', error);
        return [];
    }
};
exports.getJitsiCertifierSessions = getJitsiCertifierSessions;
/**
 * Obtener información completa de sesión Jitsi
 */
const getJitsiSessionInfo = async (sessionId) => {
    try {
        const session = jitsiSessions.get(sessionId);
        if (!session) {
            return null;
        }
        // Obtener información completa
        const [certifier] = await db_1.db
            .select({
            id: schema_1.users.id,
            fullName: schema_1.users.fullName,
            email: schema_1.users.email,
            role: schema_1.users.role
        })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, session.certifierId));
        const [client] = await db_1.db
            .select({
            id: schema_1.users.id,
            fullName: schema_1.users.fullName,
            email: schema_1.users.email,
            role: schema_1.users.role
        })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, session.clientId));
        const [document] = await db_1.db
            .select()
            .from(schema_1.documents)
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, session.documentId));
        return {
            session,
            certifier,
            client,
            document
        };
    }
    catch (error) {
        console.error('Error obteniendo información de sesión Jitsi:', error);
        return null;
    }
};
exports.getJitsiSessionInfo = getJitsiSessionInfo;
/**
 * Generar URL de Jitsi Meet para la sesión
 */
const generateJitsiMeetUrl = (roomName, userName, userEmail, isModerator = false, customDomain) => {
    const domain = customDomain || JITSI_DOMAIN;
    const baseUrl = `https://${domain}/${roomName}`;
    // Parámetros de configuración
    const params = new URLSearchParams({
        'config.startWithAudioMuted': (!isModerator).toString(),
        'config.startWithVideoMuted': 'false',
        'config.requireDisplayName': 'true',
        'config.enableWelcomePage': 'false',
        'config.prejoinPageEnabled': 'true',
        'config.enableClosePage': 'false',
        'userInfo.displayName': userName,
        'userInfo.email': userEmail
    });
    // Configuración específica para RON
    if (isModerator) {
        params.append('config.enableRecording', 'true');
        params.append('config.enableLiveStreaming', 'false');
        params.append('config.moderatedRoomServiceUrl', '');
    }
    return `${baseUrl}#${params.toString()}`;
};
exports.generateJitsiMeetUrl = generateJitsiMeetUrl;
/**
 * Verificar si Jitsi está configurado correctamente
 */
const isJitsiConfigured = () => {
    const hasJWT = !!(JITSI_PRIVATE_KEY && JITSI_APP_ID && JITSI_KEY_ID);
    return {
        configured: true, // Jitsi siempre está disponible
        domain: JITSI_DOMAIN,
        hasJWT,
        features: [
            'video',
            'audio',
            'chat',
            'screenshare',
            'recording',
            'whiteboard',
            'breakout-rooms',
            'live-streaming',
            'transcription'
        ]
    };
};
exports.isJitsiConfigured = isJitsiConfigured;
/**
 * Obtener configuración de demo para Jitsi
 */
const getJitsiDemoConfig = () => {
    return {
        provider: 'Jitsi Meet',
        domain: JITSI_DOMAIN,
        demoMode: !JITSI_PRIVATE_KEY,
        message: JITSI_PRIVATE_KEY ?
            'Jitsi configurado con JWT personalizado' :
            'Jitsi en modo público - Configure JITSI_PRIVATE_KEY para salas privadas',
        features: [
            'Videollamadas HD',
            'Audio cristalino',
            'Chat en tiempo real',
            'Compartir pantalla',
            'Grabación (con JWT)',
            'Pizarra colaborativa',
            'Salas de reunión',
            'Transcripción automática'
        ]
    };
};
exports.getJitsiDemoConfig = getJitsiDemoConfig;
/**
 * Crear sala Jitsi personalizada para RON
 */
const createCustomJitsiRoom = async (sessionId, certifierId, clientId) => {
    try {
        const session = jitsiSessions.get(sessionId);
        if (!session) {
            throw new Error('Sesión no encontrada');
        }
        // Obtener información de usuarios
        const [certifier] = await db_1.db
            .select({ fullName: schema_1.users.fullName, email: schema_1.users.email })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, certifierId));
        const [client] = await db_1.db
            .select({ fullName: schema_1.users.fullName, email: schema_1.users.email })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, clientId));
        // Generar URLs específicas
        const certifierUrl = (0, exports.generateJitsiMeetUrl)(session.roomName, `${certifier?.fullName} (Certificador)`, certifier?.email || '', true // Es moderador
        );
        const clientUrl = (0, exports.generateJitsiMeetUrl)(session.roomName, `${client?.fullName} (Cliente)`, client?.email || '', false // No es moderador
        );
        // Configuración para embed
        const embedConfig = {
            roomName: session.roomName,
            domain: JITSI_DOMAIN,
            configOverwrite: {
                startWithAudioMuted: false,
                startWithVideoMuted: false,
                enableWelcomePage: false,
                enableClosePage: false,
                prejoinPageEnabled: true,
                requireDisplayName: true,
                enableRecording: true,
                enableLiveStreaming: false,
                enableTranscription: true,
                toolbarButtons: [
                    'camera',
                    'chat',
                    'closedcaptions',
                    'desktop',
                    'download',
                    'embedmeeting',
                    'etherpad',
                    'feedback',
                    'filmstrip',
                    'fullscreen',
                    'hangup',
                    'help',
                    'invite',
                    'livestreaming',
                    'microphone',
                    'mute-everyone',
                    'mute-video-everyone',
                    'participants-pane',
                    'profile',
                    'raisehand',
                    'recording',
                    'security',
                    'settings',
                    'shareaudio',
                    'sharedvideo',
                    'shortcuts',
                    'stats',
                    'tileview',
                    'toggle-camera',
                    'videoquality',
                    'whiteboard'
                ]
            },
            interfaceConfigOverwrite: {
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                SHOW_BRAND_WATERMARK: false,
                BRAND_WATERMARK_LINK: '',
                SHOW_POWERED_BY: false,
                DISPLAY_WELCOME_PAGE_CONTENT: false,
                DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
                APP_NAME: 'NotaryPro RON',
                NATIVE_APP_NAME: 'NotaryPro RON',
                DEFAULT_BACKGROUND: '#1a1a1a',
                DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
                DISABLE_FOCUS_INDICATOR: false,
                DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
                DISABLE_PRESENCE_STATUS: false,
                DISABLE_RINGING: false,
                AUDIO_LEVEL_PRIMARY_COLOR: 'rgba(255,255,255,0.4)',
                AUDIO_LEVEL_SECONDARY_COLOR: 'rgba(255,255,255,0.2)'
            },
            userInfo: {
                displayName: isCertifier ?
                    `${certifier?.fullName} (Certificador)` :
                    `${client?.fullName} (Cliente)`,
                email: isCertifier ? certifier?.email : client?.email
            },
            onload: `
        // Configuración específica para RON
        api.executeCommand('displayName', '${isCertifier ? certifier?.fullName : client?.fullName}');
        api.executeCommand('email', '${isCertifier ? certifier?.email : client?.email}');
        
        // Eventos específicos de RON
        api.addEventListener('videoConferenceJoined', function(event) {
          console.log('Usuario unido a sesión RON:', event);
        });
        
        api.addEventListener('videoConferenceLeft', function(event) {
          console.log('Usuario salió de sesión RON:', event);
        });
        
        api.addEventListener('recordingStatusChanged', function(event) {
          console.log('Estado de grabación cambiado:', event);
        });
      `
        };
        return {
            certifierUrl,
            clientUrl,
            embedConfig
        };
    }
    catch (error) {
        console.error('Error creando sala Jitsi personalizada:', error);
        throw error;
    }
};
exports.createCustomJitsiRoom = createCustomJitsiRoom;
/**
 * Obtener estadísticas de uso de Jitsi
 */
const getJitsiUsageStats = async (certifierId) => {
    try {
        const whereClause = certifierId ?
            (0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${schema_1.analyticsEvents.eventType} LIKE 'ron_jitsi_%'`, (0, drizzle_orm_1.sql) `${schema_1.analyticsEvents.metadata}->>'certifierId' = ${certifierId.toString()}`) :
            (0, drizzle_orm_1.sql) `${schema_1.analyticsEvents.eventType} LIKE 'ron_jitsi_%'`;
        const [sessionStats] = await db_1.db
            .select({
            total: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.analyticsEvents.eventType} = 'ron_jitsi_session_created' THEN 1 END)`,
            completed: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.analyticsEvents.eventType} = 'ron_jitsi_session_completed' THEN 1 END)`,
            avgDuration: (0, drizzle_orm_1.sql) `AVG(CASE WHEN ${schema_1.analyticsEvents.eventType} = 'ron_jitsi_session_completed' 
                                    THEN (${schema_1.analyticsEvents.metadata}->>'duration')::numeric 
                                    ELSE NULL END)`
        })
            .from(schema_1.analyticsEvents)
            .where(whereClause);
        const activeSessions = Array.from(jitsiSessions.values())
            .filter(session => session.status === 'active' &&
            (!certifierId || session.certifierId === certifierId)).length;
        return {
            totalSessions: sessionStats?.total || 0,
            activeSessions,
            completedSessions: sessionStats?.completed || 0,
            averageDuration: Math.round(sessionStats?.avgDuration || 0),
            totalRecordings: sessionStats?.completed || 0 // Asumiendo que todas las sesiones se graban
        };
    }
    catch (error) {
        console.error('Error obteniendo estadísticas de Jitsi:', error);
        return {
            totalSessions: 0,
            activeSessions: 0,
            completedSessions: 0,
            averageDuration: 0,
            totalRecordings: 0
        };
    }
};
exports.getJitsiUsageStats = getJitsiUsageStats;
/**
 * Limpiar sesiones expiradas
 */
const cleanupExpiredSessions = () => {
    const now = new Date();
    const expiredSessions = [];
    jitsiSessions.forEach((session, sessionId) => {
        // Sesiones activas por más de 4 horas se consideran abandonadas
        if (session.status === 'active' && session.startedAt) {
            const hoursSinceStart = (now.getTime() - session.startedAt.getTime()) / (1000 * 60 * 60);
            if (hoursSinceStart > 4) {
                expiredSessions.push(sessionId);
            }
        }
        // Sesiones programadas con más de 24 horas de retraso
        if (session.status === 'scheduled') {
            const hoursLate = (now.getTime() - session.scheduledAt.getTime()) / (1000 * 60 * 60);
            if (hoursLate > 24) {
                expiredSessions.push(sessionId);
            }
        }
    });
    // Limpiar sesiones expiradas
    expiredSessions.forEach(sessionId => {
        const session = jitsiSessions.get(sessionId);
        if (session) {
            session.status = 'cancelled';
            jitsiSessions.set(sessionId, session);
        }
    });
    console.log(`🧹 Limpiadas ${expiredSessions.length} sesiones expiradas`);
    return expiredSessions.length;
};
exports.cleanupExpiredSessions = cleanupExpiredSessions;
exports.default = {
    createJitsiRonSession: exports.createJitsiRonSession,
    getJitsiConfigForUser: exports.getJitsiConfigForUser,
    finishJitsiRonSession: exports.finishJitsiRonSession,
    getJitsiCertifierSessions: exports.getJitsiCertifierSessions,
    getJitsiSessionInfo: exports.getJitsiSessionInfo,
    generateJitsiMeetUrl: exports.generateJitsiMeetUrl,
    isJitsiConfigured: exports.isJitsiConfigured,
    getJitsiDemoConfig: exports.getJitsiDemoConfig,
    createCustomJitsiRoom: exports.createCustomJitsiRoom,
    getJitsiUsageStats: exports.getJitsiUsageStats,
    cleanupExpiredSessions: exports.cleanupExpiredSessions
};
