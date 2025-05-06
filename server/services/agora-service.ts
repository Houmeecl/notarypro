/**
 * Servicio de Agora para la generación de tokens
 */
import { Response } from 'express';
import { generateRtcToken, RtcRole } from './agora-token-generator';

// Credenciales de Agora (desde variables de entorno)
const appId = process.env.AGORA_APP_ID || '';
const appCertificate = process.env.AGORA_APP_CERTIFICATE || '';

// Duración por defecto del token en segundos (1 hora)
const expirationTimeInSeconds = 3600;

/**
 * Verifica si las credenciales de Agora están configuradas
 * @returns booleano indicando si están configuradas
 */
export const areAgoraCredentialsConfigured = (): boolean => {
  return !!appId && !!appCertificate;
};

/**
 * Obtiene el AppID de Agora
 * @returns AppID configurado
 */
export const getAgoraAppId = (): string => {
  return appId;
};

/**
 * Genera y envía tokens para un canal específico
 * @param res Respuesta Express
 * @param channelName Nombre del canal
 * @param isNotarial Indica si es una sesión notarial
 */
export const sendAgoraTokens = (
  res: Response,
  channelName: string,
  isNotarial: boolean = true
): void => {
  if (!areAgoraCredentialsConfigured()) {
    res.status(500).json({
      success: false,
      error: 'Credenciales de Agora no configuradas'
    });
    return;
  }

  try {
    // Generar token para certifier (uid=1)
    const certifierToken = generateRtcToken(
      appId,
      appCertificate,
      channelName,
      1, // UID para certifier
      RtcRole.PUBLISHER,
      expirationTimeInSeconds
    );
    
    // Generar token para cliente (uid=2)
    const clientToken = generateRtcToken(
      appId,
      appCertificate,
      channelName,
      2, // UID para cliente
      RtcRole.PUBLISHER,
      expirationTimeInSeconds
    );

    // Preparar respuesta con toda la información necesaria
    res.json({
      success: true,
      appId,
      channelName,
      certifierToken,
      token: clientToken,  // Cliente actual, compatible con versiones anteriores
      isNotarial
    });
  } catch (error) {
    console.error('Error al enviar tokens de Agora:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar tokens de Agora'
    });
  }
};

/**
 * Envía el AppID para casos de modo forzado
 * @param res Respuesta Express
 */
export const sendAgoraAppId = (res: Response): void => {
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