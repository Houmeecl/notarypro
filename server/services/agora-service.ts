/**
 * Servicio para gestionar la integración con Agora.io
 * 
 * Este servicio proporciona funciones para generar tokens de acceso
 * y gestionar las sesiones de videollamada para el sistema RON.
 */

// ESM import para entorno moderno
import AgoraAccessToken from 'agora-access-token';
// Es necesario acceder a las propiedades de esta manera
// debido a la forma en que el paquete está estructurado
const RtcTokenBuilder = AgoraAccessToken.RtcTokenBuilder;
const RtcRole = AgoraAccessToken.RtcRole;

// Configuración de Agora desde variables de entorno
const appId = process.env.AGORA_APP_ID as string;
const appCertificate = process.env.AGORA_APP_CERTIFICATE as string;

if (!appId || !appCertificate) {
  console.error('Error: Se requieren las variables AGORA_APP_ID y AGORA_APP_CERTIFICATE');
}

// Interfaz para generar token
interface TokenOptions {
  sessionId: string;
  userId?: string | number;
  userRole?: string;
  channelName?: string;
}

/**
 * Convierte un código RON a un nombre de canal de Agora
 * Ejemplo: RON-2025-001 => ron-session-2025-001
 * 
 * @param ronCode Código RON
 * @returns Nombre de canal para Agora
 */
function ronCodeToChannelName(ronCode: string): string {
  if (!ronCode.startsWith('RON-')) {
    throw new Error('El código RON debe comenzar con "RON-"');
  }
  
  return ronCode.replace('RON-', 'ron-session-');
}

// Objeto de servicio exportado
export const agoraService = {
  isConfigured: () => !!appId && !!appCertificate,
  
  generateToken: (options: TokenOptions) => {
    try {
      const channelName = options.channelName || ronCodeToChannelName(options.sessionId);
      const uid = options.userId ? Number(options.userId) : 0;
      
      // Default a ROL_PUBLISHER si es host o publisher
      const userRole = (options.userRole === 'host' || options.userRole === 'publisher') 
        ? RtcRole.PUBLISHER 
        : RtcRole.SUBSCRIBER;
      
      // Tiempo de expiración (1 hora)
      const expirationTimeInSeconds = 3600;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const expirationTimestamp = currentTimestamp + expirationTimeInSeconds;
      
      // Generar token con RtcTokenBuilder
      return RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCertificate,
        channelName,
        uid,
        userRole,
        expirationTimestamp
      );
    } catch (error) {
      console.error('Error al generar token de Agora:', error);
      return '';
    }
  },
  
  // Generar tokens para una sesión RON
  generateVideoTokens: (ronSessionId: string) => {
    try {
      const channelName = ronCodeToChannelName(ronSessionId);
      
      return {
        channelName,
        token: agoraService.generateToken({
          sessionId: ronSessionId,
          channelName,
          userRole: 'publisher'
        }),
        uid: 0,
        appId
      };
    } catch (error) {
      console.error('Error al generar tokens para sesión RON:', error);
      return {
        channelName: '',
        token: '',
        uid: 0,
        appId: ''
      };
    }
  },
  
  // Obtener configuración para cliente
  getClientConfig: (ronSessionId: string) => {
    const channelName = ronCodeToChannelName(ronSessionId);
    
    return {
      appId,
      channelName,
      token: agoraService.generateToken({
        sessionId: ronSessionId,
        channelName,
        userRole: 'publisher'
      }),
      uid: null
    };
  },
  
  // Obtener configuración para certificador
  getCertifierConfig: (ronSessionId: string) => {
    const channelName = ronCodeToChannelName(ronSessionId);
    
    return {
      appId,
      channelName,
      token: agoraService.generateToken({
        sessionId: ronSessionId,
        channelName,
        userRole: 'publisher'
      }),
      uid: null
    };
  }
};