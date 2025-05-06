/**
 * Servicio de Videollamadas con Agora para RON
 * 
 * Implementa la integración con Agora.io para videollamadas en tiempo real
 * dentro del sistema de certificación remota (RON)
 */

import { createHmac } from 'crypto';
// Importar correctamente desde agora-access-token con sintaxis ESM
import AgoraAccessToken from 'agora-access-token';

// Extraer los objetos necesarios
const RtcTokenBuilder = AgoraAccessToken.RtcTokenBuilder;
const Role = AgoraAccessToken.Role;

export interface VideoSessionParams {
  sessionId: string;
  userId: string | number;
  userRole: 'host' | 'audience'; // host = certifier, audience = client
  expirationTimeInSeconds?: number;
  channelName?: string;
}

export interface VideoSessionToken {
  appId: string;
  channelName: string;
  token: string;
  uid: string | number;
  role: string;
  privilegeExpiredTs: number;
}

export interface ScreenshotResult {
  success: boolean;
  imageUrl?: string;
  imageBuffer?: Buffer;
  timestamp?: Date;
  error?: string;
}

class AgoraService {
  private appId: string;
  private appCertificate: string;
  
  constructor() {
    this.appId = process.env.AGORA_APP_ID || '';
    this.appCertificate = process.env.AGORA_APP_CERTIFICATE || '';
    
    if (!this.appId || !this.appCertificate) {
      console.warn('AGORA_APP_ID or AGORA_APP_CERTIFICATE not set. Video calling functionality will not work properly.');
    }
  }
  
  /**
   * Verifica si el servicio está configurado correctamente
   */
  isConfigured(): boolean {
    return Boolean(this.appId && this.appCertificate);
  }
  
  /**
   * Genera un token para unirse a una sesión de video
   */
  generateToken(params: VideoSessionParams): VideoSessionToken | null {
    if (!this.isConfigured()) {
      console.error('Agora service not properly configured');
      return null;
    }
    
    try {
      const channelName = params.channelName || `ron-session-${params.sessionId}`;
      const uid = params.userId;
      const role = params.userRole === 'host' ? Role.PUBLISHER : Role.SUBSCRIBER;
      
      // El token expirará en 3 horas por defecto
      const expirationTimeInSeconds = params.expirationTimeInSeconds || 60 * 60 * 3;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
      
      // Generar token
      const token = RtcTokenBuilder.buildTokenWithUid(
        this.appId,
        this.appCertificate,
        channelName,
        uid,
        role,
        privilegeExpiredTs
      );
      
      return {
        appId: this.appId,
        channelName,
        token,
        uid,
        role: params.userRole,
        privilegeExpiredTs
      };
    } catch (error) {
      console.error('Failed to generate Agora token:', error);
      return null;
    }
  }
  
  /**
   * Crea una sesión de videollamada para RON
   */
  createVideoSession(sessionId: string, certifierId: string | number, clientId: string | number): {
    certifierToken: VideoSessionToken | null;
    clientToken: VideoSessionToken | null;
    channelName: string;
  } {
    const channelName = `ron-session-${sessionId}`;
    
    // Generar token para el certificador (host)
    const certifierToken = this.generateToken({
      sessionId,
      userId: certifierId,
      userRole: 'host',
      channelName
    });
    
    // Generar token para el cliente
    const clientToken = this.generateToken({
      sessionId,
      userId: clientId,
      userRole: 'audience',
      channelName
    });
    
    return {
      certifierToken,
      clientToken,
      channelName
    };
  }
  
  /**
   * Revoca los tokens de una sesión de video
   */
  revokeSessionTokens(sessionId: string): boolean {
    // En la implementación actual de Agora, no hay una API directa para revocar tokens
    // La estrategia es generar nuevos tokens con tiempo de expiración inmediato
    // o simplemente dejar que los tokens existentes expiren
    
    console.log(`Session ${sessionId} tokens will expire naturally.`);
    return true;
  }
  
  /**
   * Registra evento de sesión de video
   */
  logVideoEvent(sessionId: string, event: string, metadata?: Record<string, any>): void {
    console.log(`Video session ${sessionId} event: ${event}`, metadata || '');
    
    // Aquí se implementaría la lógica para registrar eventos en base de datos
    // Util para auditoría y seguimiento
  }
}

export const agoraService = new AgoraService();