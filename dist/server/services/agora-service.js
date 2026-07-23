"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAgoraAppId = exports.sendAgoraTokens = exports.getAgoraAppId = exports.areAgoraCredentialsConfigured = void 0;
const agora_token_generator_1 = require("./agora-token-generator");
// Credenciales de Agora (desde variables de entorno)
const appId = process.env.AGORA_APP_ID || '';
const appCertificate = process.env.AGORA_APP_CERTIFICATE || '';
// Duración por defecto del token en segundos (1 hora)
const expirationTimeInSeconds = 3600;
/**
 * Verifica si las credenciales de Agora están configuradas
 * @returns booleano indicando si están configuradas
 */
const areAgoraCredentialsConfigured = () => {
    return !!appId && !!appCertificate;
};
exports.areAgoraCredentialsConfigured = areAgoraCredentialsConfigured;
/**
 * Obtiene el AppID de Agora
 * @returns AppID configurado
 */
const getAgoraAppId = () => {
    return appId;
};
exports.getAgoraAppId = getAgoraAppId;
/**
 * Genera y envía tokens para un canal específico
 * @param res Respuesta Express
 * @param channelName Nombre del canal
 * @param isNotarial Indica si es una sesión notarial
 */
const sendAgoraTokens = (res, channelName, isNotarial = true) => {
    if (!(0, exports.areAgoraCredentialsConfigured)()) {
        res.status(500).json({
            success: false,
            error: 'Credenciales de Agora no configuradas'
        });
        return;
    }
    try {
        // Generar token para certifier (uid=1)
        const certifierToken = (0, agora_token_generator_1.generateRtcToken)(appId, appCertificate, channelName, 1, // UID para certifier
        agora_token_generator_1.RtcRole.PUBLISHER, expirationTimeInSeconds);
        // Generar token para cliente (uid=2)
        const clientToken = (0, agora_token_generator_1.generateRtcToken)(appId, appCertificate, channelName, 2, // UID para cliente
        agora_token_generator_1.RtcRole.PUBLISHER, expirationTimeInSeconds);
        // Preparar respuesta con toda la información necesaria
        res.json({
            success: true,
            appId,
            channelName,
            certifierToken,
            token: clientToken, // Cliente actual, compatible con versiones anteriores
            isNotarial
        });
    }
    catch (error) {
        console.error('Error al enviar tokens de Agora:', error);
        res.status(500).json({
            success: false,
            error: 'Error al generar tokens de Agora'
        });
    }
};
exports.sendAgoraTokens = sendAgoraTokens;
/**
 * Envía el AppID para casos de modo forzado
 * @param res Respuesta Express
 */
const sendAgoraAppId = (res) => {
    if (!appId) {
        res.status(500).json({
            success: false,
            error: 'AppID de Agora no configurado'
        });
        return;
    }
    res.json({
        success: true,
        appId
    });
};
exports.sendAgoraAppId = sendAgoraAppId;
