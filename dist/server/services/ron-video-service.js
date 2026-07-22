"use strict";
/**
 * Servicio RON Video - Gestión completa de videollamadas para notarización remota
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDemoConfig = exports.isAgoraConfigured = exports.getRonSessionInfo = exports.getCertifierSessions = exports.finishRonSession = exports.getRonVideoTokens = exports.createRonSession = void 0;
const agora_token_generator_1 = require("./agora-token-generator");
const db_1 = require("../db");
const schema_1 = require("@shared/schema");
const drizzle_orm_1 = require("drizzle-orm");
// Configuración de Agora
const appId = process.env.AGORA_APP_ID || 'demo-app-id';
const appCertificate = process.env.AGORA_APP_CERTIFICATE || 'demo-certificate';
const expirationTimeInSeconds = 3600; // 1 hora
/**
 * Crear una nueva sesión RON
 */
const createRonSession = async (certifierId, clientId, documentId, scheduledAt) => {
    try {
        // Generar un canal único
        const channelName = `ron-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const [newSession] = await db_1.db.insert(schema_1.ronSessions).values({
            channelName,
            certifierId,
            clientId,
            documentId,
            status: 'scheduled',
            scheduledAt,
            createdAt: new Date()
        }).returning();
        return {
            id: newSession.id.toString(),
            channelName: newSession.channelName,
            certifierId: newSession.certifierId,
            clientId: newSession.clientId,
            documentId: newSession.documentId,
            status: newSession.status,
            scheduledAt: newSession.scheduledAt,
            startedAt: newSession.startedAt,
            endedAt: newSession.endedAt,
            recordingUrl: newSession.recordingUrl
        };
    }
    catch (error) {
        console.error('Error al crear sesión RON:', error);
        throw new Error('No se pudo crear la sesión RON');
    }
};
exports.createRonSession = createRonSession;
/**
 * Obtener tokens de video para una sesión RON
 */
const getRonVideoTokens = async (sessionId, userId) => {
    try {
        // Obtener información de la sesión
        const [session] = await db_1.db
            .select()
            .from(schema_1.ronSessions)
            .where((0, drizzle_orm_1.eq)(schema_1.ronSessions.id, parseInt(sessionId)));
        if (!session) {
            throw new Error('Sesión RON no encontrada');
        }
        // Verificar que el usuario tiene acceso a esta sesión
        const isCertifier = session.certifierId === userId;
        const isClient = session.clientId === userId;
        if (!isCertifier && !isClient) {
            throw new Error('Acceso denegado a esta sesión RON');
        }
        // Determinar UID y rol
        const uid = isCertifier ? 1 : 2;
        const role = isCertifier ? 'certifier' : 'client';
        // Generar token
        let token = 'demo-token';
        if (appId !== 'demo-app-id' && appCertificate !== 'demo-certificate') {
            token = (0, agora_token_generator_1.generateRtcToken)(appId, appCertificate, session.channelName, uid, agora_token_generator_1.RtcRole.PUBLISHER, expirationTimeInSeconds);
        }
        // Actualizar estado de la sesión si es la primera vez que se accede
        if (session.status === 'scheduled') {
            await db_1.db
                .update(schema_1.ronSessions)
                .set({
                status: 'active',
                startedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_1.ronSessions.id, parseInt(sessionId)));
        }
        return {
            success: true,
            appId,
            channelName: session.channelName,
            token,
            uid,
            role,
            session: {
                id: session.id.toString(),
                channelName: session.channelName,
                certifierId: session.certifierId,
                clientId: session.clientId,
                documentId: session.documentId,
                status: session.status,
                scheduledAt: session.scheduledAt,
                startedAt: session.startedAt,
                endedAt: session.endedAt,
                recordingUrl: session.recordingUrl
            }
        };
    }
    catch (error) {
        console.error('Error al obtener tokens RON:', error);
        throw error;
    }
};
exports.getRonVideoTokens = getRonVideoTokens;
/**
 * Finalizar una sesión RON
 */
const finishRonSession = async (sessionId, userId, recordingUrl) => {
    try {
        const [session] = await db_1.db
            .select()
            .from(schema_1.ronSessions)
            .where((0, drizzle_orm_1.eq)(schema_1.ronSessions.id, parseInt(sessionId)));
        if (!session) {
            throw new Error('Sesión RON no encontrada');
        }
        // Solo el certificador puede finalizar la sesión
        if (session.certifierId !== userId) {
            throw new Error('Solo el certificador puede finalizar la sesión');
        }
        // Actualizar sesión
        await db_1.db
            .update(schema_1.ronSessions)
            .set({
            status: 'completed',
            endedAt: new Date(),
            recordingUrl: recordingUrl || null
        })
            .where((0, drizzle_orm_1.eq)(schema_1.ronSessions.id, parseInt(sessionId)));
        // Actualizar documento como certificado
        await db_1.db
            .update(schema_1.documents)
            .set({
            status: 'certified',
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, session.documentId));
        return {
            success: true,
            message: 'Sesión RON finalizada correctamente'
        };
    }
    catch (error) {
        console.error('Error al finalizar sesión RON:', error);
        throw error;
    }
};
exports.finishRonSession = finishRonSession;
/**
 * Obtener sesiones RON de un certificador
 */
const getCertifierSessions = async (certifierId, status) => {
    try {
        let query = db_1.db
            .select()
            .from(schema_1.ronSessions)
            .where((0, drizzle_orm_1.eq)(schema_1.ronSessions.certifierId, certifierId));
        if (status) {
            query = query.where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.ronSessions.certifierId, certifierId), (0, drizzle_orm_1.eq)(schema_1.ronSessions.status, status)));
        }
        const sessions = await query.orderBy(schema_1.ronSessions.scheduledAt);
        return sessions.map(session => ({
            id: session.id.toString(),
            channelName: session.channelName,
            certifierId: session.certifierId,
            clientId: session.clientId,
            documentId: session.documentId,
            status: session.status,
            scheduledAt: session.scheduledAt,
            startedAt: session.startedAt,
            endedAt: session.endedAt,
            recordingUrl: session.recordingUrl
        }));
    }
    catch (error) {
        console.error('Error al obtener sesiones del certificador:', error);
        return [];
    }
};
exports.getCertifierSessions = getCertifierSessions;
/**
 * Obtener información completa de una sesión RON
 */
const getRonSessionInfo = async (sessionId) => {
    try {
        const [session] = await db_1.db
            .select()
            .from(schema_1.ronSessions)
            .where((0, drizzle_orm_1.eq)(schema_1.ronSessions.id, parseInt(sessionId)));
        if (!session) {
            return null;
        }
        // Obtener información del certificador
        const [certifier] = await db_1.db
            .select({
            id: schema_1.users.id,
            username: schema_1.users.username,
            fullName: schema_1.users.fullName,
            email: schema_1.users.email
        })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, session.certifierId));
        // Obtener información del cliente
        const [client] = await db_1.db
            .select({
            id: schema_1.users.id,
            username: schema_1.users.username,
            fullName: schema_1.users.fullName,
            email: schema_1.users.email
        })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, session.clientId));
        // Obtener información del documento
        const [document] = await db_1.db
            .select()
            .from(schema_1.documents)
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, session.documentId));
        return {
            session: {
                id: session.id.toString(),
                channelName: session.channelName,
                certifierId: session.certifierId,
                clientId: session.clientId,
                documentId: session.documentId,
                status: session.status,
                scheduledAt: session.scheduledAt,
                startedAt: session.startedAt,
                endedAt: session.endedAt,
                recordingUrl: session.recordingUrl
            },
            certifier,
            client,
            document
        };
    }
    catch (error) {
        console.error('Error al obtener información de sesión RON:', error);
        return null;
    }
};
exports.getRonSessionInfo = getRonSessionInfo;
/**
 * Verificar si las credenciales de Agora están configuradas
 */
const isAgoraConfigured = () => {
    return appId !== 'demo-app-id' && appCertificate !== 'demo-certificate';
};
exports.isAgoraConfigured = isAgoraConfigured;
/**
 * Obtener configuración de demo para pruebas
 */
const getDemoConfig = () => {
    return {
        appId: 'demo-app-id',
        demoMode: true,
        message: 'Modo demo - Configure AGORA_APP_ID y AGORA_APP_CERTIFICATE para producción'
    };
};
exports.getDemoConfig = getDemoConfig;
