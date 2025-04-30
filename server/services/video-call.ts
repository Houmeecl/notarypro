// En ESM no podemos usar require, tenemos que utilizar un enfoque diferente
// @ts-ignore - Importación dinámica para compatibilidad ESM/CommonJS
import AgoraAccessToken from "agora-access-token";

// Definimos manualmente los roles para evitar problemas de compatibilidad
enum RtcRoleFix {
  PUBLISHER = 1,
  SUBSCRIBER = 2
}

// Obtenemos el constructor del token desde el módulo importado
const RtcTokenBuilderFix = AgoraAccessToken.RtcTokenBuilder;

/**
 * Genera un token de acceso para videollamadas con Agora.io
 * @param channelName Nombre del canal único para la sesión
 * @param uid ID del usuario
 * @param role Rol del usuario (por defecto publicador)
 * @returns Datos para conectarse a la videollamada
 */
export function generateVideoToken(
  channelName: string, 
  uid: string, 
  role = RtcRoleFix.PUBLISHER
) {
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
  const token = RtcTokenBuilderFix.buildTokenWithUid(
    appID, 
    appCertificate, 
    channelName, 
    Number(uid), 
    role, 
    privilegeExpiredTs
  );
  
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
export function validateChannel(channelName: string) {
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

/**
 * Estructura para almacenar información de sesiones
 */
interface SessionParticipant {
  userId: number;
  userName: string;
  role: string;
  joinTime: Date;
}

// Almacenamiento temporal de sesiones activas
// En producción, esto debería estar en una base de datos
const activeSessions = new Map<string, SessionParticipant[]>();

/**
 * Registra un participante en una sesión de video
 * @param channelName Nombre del canal
 * @param participant Datos del participante
 */
export function registerSessionParticipant(
  channelName: string,
  participant: SessionParticipant
) {
  if (!activeSessions.has(channelName)) {
    activeSessions.set(channelName, []);
  }
  
  const participants = activeSessions.get(channelName)!;
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
export function getSessionParticipants(channelName: string) {
  return activeSessions.get(channelName) || [];
}

/**
 * Finaliza una sesión de videollamada
 * @param channelName Nombre del canal
 * @returns Resumen de la sesión finalizada
 */
export function endSession(channelName: string) {
  const participants = activeSessions.get(channelName) || [];
  activeSessions.delete(channelName);
  
  return {
    channelName,
    participantCount: participants.length,
    endTime: new Date()
  };
}