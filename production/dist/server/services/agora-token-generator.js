"use strict";
/**
 * Implementación simplificada para la generación de tokens Agora RTC
 * Basada en https://github.com/AgoraIO/Tools/blob/master/DynamicKey/AgoraDynamicKey/nodejs/src/RtcTokenBuilder.js
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Privileges = exports.RtcRole = void 0;
exports.generateRtcToken = generateRtcToken;
const crypto_1 = __importDefault(require("crypto"));
// Constantes
exports.RtcRole = {
    PUBLISHER: 1,
    SUBSCRIBER: 2
};
// Privilegios
exports.Privileges = {
    JOIN_CHANNEL: 1,
    PUBLISH_AUDIO_STREAM: 2,
    PUBLISH_VIDEO_STREAM: 3,
    PUBLISH_DATA_STREAM: 4
};
/**
 * Genera un token RTC para Agora
 * @param appId - El AppID de Agora
 * @param appCertificate - El certificado secreto
 * @param channelName - Nombre del canal
 * @param uid - ID de usuario (debe ser un número)
 * @param role - Rol (PUBLISHER o SUBSCRIBER)
 * @param tokenExpireSeconds - Tiempo en segundos hasta que expire el token
 * @returns Token generado
 */
function generateRtcToken(appId, appCertificate, channelName, uid, role, tokenExpireSeconds) {
    // Timestamp actual en segundos
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expireTimestamp = currentTimestamp + tokenExpireSeconds;
    // Construir el mensaje de información del token
    const tokenInfo = {
        appId: appId,
        channelName: channelName,
        uid: uid.toString(),
        expire: expireTimestamp,
        salt: Math.floor(Math.random() * 100000),
        role: role
    };
    // Crear privilegios basados en el rol
    let privileges = {};
    // Asignar privilegios según el rol
    if (role === exports.RtcRole.PUBLISHER) {
        privileges[exports.Privileges.JOIN_CHANNEL.toString()] = expireTimestamp;
        privileges[exports.Privileges.PUBLISH_AUDIO_STREAM.toString()] = expireTimestamp;
        privileges[exports.Privileges.PUBLISH_VIDEO_STREAM.toString()] = expireTimestamp;
        privileges[exports.Privileges.PUBLISH_DATA_STREAM.toString()] = expireTimestamp;
    }
    else {
        privileges[exports.Privileges.JOIN_CHANNEL.toString()] = expireTimestamp;
    }
    // Crear mensaje a firmar
    const message = [
        tokenInfo.appId,
        tokenInfo.channelName,
        tokenInfo.uid,
        tokenInfo.expire.toString(),
        tokenInfo.salt.toString(),
        JSON.stringify(privileges)
    ].join(':');
    // Generar firma
    const signature = crypto_1.default
        .createHmac('sha256', appCertificate)
        .update(message)
        .digest('hex');
    // Crear token final (versión simplificada)
    const token = [
        tokenInfo.appId,
        tokenInfo.channelName,
        tokenInfo.uid,
        tokenInfo.expire.toString(),
        tokenInfo.salt.toString(),
        signature
    ].join(':');
    // Codificar en base64 y convertir a URL segura
    return Buffer.from(token).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}
