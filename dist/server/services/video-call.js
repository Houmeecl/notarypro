"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVideoToken = generateVideoToken;
exports.validateChannel = validateChannel;
exports.registerSessionParticipant = registerSessionParticipant;
exports.getSessionParticipants = getSessionParticipants;
exports.endSession = endSession;
// En ESM no podemos usar require, tenemos que utilizar un enfoque diferente
// @ts-ignore - Importación dinámica para compatibilidad ESM/CommonJS
const agora_access_token_1 = __importDefault(require("agora-access-token"));
// Definimos manualmente los roles para evitar problemas de compatibilidad
var RtcRoleFix;
(function (RtcRoleFix) {
    RtcRoleFix[RtcRoleFix["PUBLISHER"] = 1] = "PUBLISHER";
    RtcRoleFix[RtcRoleFix["SUBSCRIBER"] = 2] = "SUBSCRIBER";
})(RtcRoleFix || (RtcRoleFix = {}));
// Obtenemos el constructor del token desde el módulo importado
const RtcTokenBuilderFix = agora_access_token_1.default.RtcTokenBuilder;
/**
 * Genera un token de acceso para videollamadas con Agora.io
 * @param channelName Nombre del canal único para la sesión
 * @param uid ID del usuario
 * @param role Rol del usuario (por defecto publicador)
 * @returns Datos para conectarse a la videollamada
 */
function generateVideoToken(channelName, uid, role = RtcRoleFix.PUBLISHER) {
    if (!process.env.AGORA_APP_ID || !process.env.AGORA_APP_CERTIFICATE) {
        throw new Error("Faltan credenciales de Agora: AGORA_APP_ID y/o AGORA_APP_CERTIFICATE no están configuradas");
    }
    const appID = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    // Expiración en 3600 segundos (1 hora)
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    // Construir el token
    const token = RtcTokenBuilderFix.buildTokenWithUid(appID, appCertificate, channelName, Number(uid), role, privilegeExpiredTs);
    return {
        token,
        appID,
        channelName,
        uid: Number(uid),
        expiresIn: expirationTimeInSeconds
    };
}
/**
 * Valida si un canal de videollamada está activo
 * @param channelName Nombre del canal a validar
 * @returns Estado del canal
 */
function validateChannel(channelName) {
    // En una implementación real, aquí verificaríamos con la API de Agora
    // si el canal está activo y cuántos participantes tiene.
    // Por ahora, simplemente verificamos que tenemos configuración:
    if (!process.env.AGORA_APP_ID || !process.env.AGORA_APP_CERTIFICATE) {
        throw new Error("Faltan credenciales de Agora");
    }
    return {
        active: true,
        channelName,
        participants: 0 // En implementación real, obtendríamos este dato de la API de Agora
    };
}
// Almacenamiento temporal de sesiones activas
// En producción, esto debería estar en una base de datos
const activeSessions = new Map();
/**
 * Registra un participante en una sesión de video
 * @param channelName Nombre del canal
 * @param participant Datos del participante
 */
function registerSessionParticipant(channelName, participant) {
    if (!activeSessions.has(channelName)) {
        activeSessions.set(channelName, []);
    }
    const participants = activeSessions.get(channelName);
    participants.push(participant);
    return {
        channelName,
        participantCount: participants.length
    };
}
/**
 * Obtiene los participantes de una sesión
 * @param channelName Nombre del canal
 * @returns Lista de participantes
 */
function getSessionParticipants(channelName) {
    return activeSessions.get(channelName) || [];
}
/**
 * Finaliza una sesión de videollamada
 * @param channelName Nombre del canal
 * @returns Resumen de la sesión finalizada
 */
function endSession(channelName) {
    const participants = activeSessions.get(channelName) || [];
    activeSessions.delete(channelName);
    return {
        channelName,
        participantCount: participants.length,
        endTime: new Date()
    };
}
