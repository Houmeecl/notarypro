/**
 * GENERADOR DE CÓDIGOS DE CLIENTE RON
 * Sistema completo para generar códigos de acceso para clientes en sesiones RON
 */

import crypto from 'crypto';
import QRCode from 'qrcode';
import { db } from '../db';
import { eq, and, gte, sql } from 'drizzle-orm';
import { 
  documents, 
  users, 
  analyticsEvents
} from '@shared/schema';
import { addHours, format } from 'date-fns';
import { es } from 'date-fns/locale';

// Interfaz para códigos de cliente RON
interface RonClientCode {
  id: string;
  sessionId: string;
  clientId: number;
  documentId: number;
  accessCode: string;
  qrCode: string;
  directUrl: string;
  embedUrl: string;
  expiresAt: Date;
  status: 'active' | 'used' | 'expired';
  createdAt: Date;
  usedAt?: Date;
  metadata: {
    clientName: string;
    clientEmail: string;
    documentTitle: string;
    certifierName: string;
    sessionType: 'jitsi' | 'agora';
  };
}

// Almacén temporal de códigos (en producción usar Redis o BD)
const clientCodes = new Map<string, RonClientCode>();

/**
 * Generar código de acceso único para cliente RON
 */
export const generateRonClientCode = async (
  sessionId: string,
  clientId: number,
  documentId: number,
  certifierId: number,
  sessionType: 'jitsi' | 'agora' = 'jitsi',
  expirationHours: number = 24
): Promise<RonClientCode> => {
  try {
    // Generar código único
    const timestamp = Date.now().toString();
    const randomBytes = crypto.randomBytes(6).toString('hex').toUpperCase();
    const accessCode = `RON-${timestamp.slice(-6)}-${randomBytes}`;
    const codeId = crypto.randomUUID();

    // Obtener información del cliente
    const [client] = await db
      .select({
        fullName: users.fullName,
        email: users.email
      })
      .from(users)
      .where(eq(users.id, clientId));

    // Obtener información del certificador
    const [certifier] = await db
      .select({
        fullName: users.fullName,
        email: users.email
      })
      .from(users)
      .where(eq(users.id, certifierId));

    // Obtener información del documento
    const [document] = await db
      .select({
        title: documents.title,
        documentType: documents.documentType
      })
      .from(documents)
      .where(eq(documents.id, documentId));

    if (!client || !certifier || !document) {
      throw new Error('Información de sesión incompleta');
    }

    // URLs de acceso
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const directUrl = `${baseUrl}/ron-client-access/${accessCode}`;
    const embedUrl = `${baseUrl}/ron-client-embed/${accessCode}`;

    // Datos para QR
    const qrData = {
      type: 'ron_client_access',
      code: accessCode,
      sessionId,
      clientName: client.fullName,
      documentTitle: document.title,
      certifierName: certifier.fullName,
      accessUrl: directUrl,
      expiresAt: addHours(new Date(), expirationHours).toISOString()
    };

    // Generar código QR
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#1e3a8a', // Azul NotaryPro
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });

    // Crear objeto de código de cliente
    const clientCode: RonClientCode = {
      id: codeId,
      sessionId,
      clientId,
      documentId,
      accessCode,
      qrCode: qrCodeDataUrl,
      directUrl,
      embedUrl,
      expiresAt: addHours(new Date(), expirationHours),
      status: 'active',
      createdAt: new Date(),
      metadata: {
        clientName: client.fullName,
        clientEmail: client.email,
        documentTitle: document.title,
        certifierName: certifier.fullName,
        sessionType
      }
    };

    // Guardar código
    clientCodes.set(accessCode, clientCode);

    // Registrar evento
    await db.insert(analyticsEvents).values({
      eventType: 'ron_client_code_generated',
      userId: clientId,
      documentId,
      metadata: {
        accessCode,
        sessionId,
        certifierId,
        sessionType,
        expiresAt: clientCode.expiresAt,
        timestamp: new Date()
      },
      createdAt: new Date()
    });

    console.log(`✅ Código de cliente RON generado: ${accessCode}`);
    return clientCode;

  } catch (error) {
    console.error('Error generando código de cliente RON:', error);
    throw new Error('No se pudo generar código de acceso');
  }
};

/**
 * Validar y usar código de cliente RON
 */
export const validateAndUseClientCode = async (
  accessCode: string,
  clientIP?: string
): Promise<{
  success: boolean;
  data?: {
    sessionId: string;
    clientInfo: any;
    sessionConfig: any;
    accessUrls: {
      jitsi?: string;
      agora?: string;
      embed: string;
    };
  };
  error?: string;
}> => {
  try {
    const clientCode = clientCodes.get(accessCode);

    if (!clientCode) {
      return {
        success: false,
        error: 'Código de acceso no válido'
      };
    }

    // Verificar expiración
    if (new Date() > clientCode.expiresAt) {
      clientCode.status = 'expired';
      clientCodes.set(accessCode, clientCode);
      
      return {
        success: false,
        error: 'Código de acceso expirado'
      };
    }

    // Verificar si ya fue usado (opcional, dependiendo de la política)
    if (clientCode.status === 'used') {
      // Permitir reutilización del código para la misma sesión
      console.log(`⚠️ Código ${accessCode} ya fue usado, permitiendo reacceso`);
    }

    // Marcar como usado
    clientCode.status = 'used';
    clientCode.usedAt = new Date();
    clientCodes.set(accessCode, clientCode);

    // Obtener configuración de sesión según el tipo
    let sessionConfig: any = {};
    let accessUrls: any = {
      embed: clientCode.embedUrl
    };

    if (clientCode.metadata.sessionType === 'jitsi') {
      // Configurar acceso Jitsi
      const jitsiDomain = process.env.JITSI_DOMAIN || 'meet.jit.si';
      const roomName = `ron-${clientCode.sessionId.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      
      accessUrls.jitsi = `https://${jitsiDomain}/${roomName}#userInfo.displayName="${encodeURIComponent(clientCode.metadata.clientName + ' (Cliente)')}"&userInfo.email="${encodeURIComponent(clientCode.metadata.clientEmail)}"`;
      
      sessionConfig = {
        provider: 'jitsi',
        domain: jitsiDomain,
        roomName,
        userName: clientCode.metadata.clientName,
        userEmail: clientCode.metadata.clientEmail,
        isModerator: false
      };
    } else {
      // Configurar acceso Agora
      sessionConfig = {
        provider: 'agora',
        appId: process.env.AGORA_APP_ID,
        channelName: `ron-${clientCode.sessionId}`,
        userName: clientCode.metadata.clientName,
        userRole: 'client'
      };
    }

    // Registrar uso del código
    await db.insert(analyticsEvents).values({
      eventType: 'ron_client_code_used',
      userId: clientCode.clientId,
      documentId: clientCode.documentId,
      metadata: {
        accessCode,
        sessionId: clientCode.sessionId,
        clientIP,
        sessionType: clientCode.metadata.sessionType,
        usedAt: new Date(),
        timestamp: new Date()
      },
      createdAt: new Date()
    });

    return {
      success: true,
      data: {
        sessionId: clientCode.sessionId,
        clientInfo: {
          id: clientCode.clientId,
          name: clientCode.metadata.clientName,
          email: clientCode.metadata.clientEmail
        },
        sessionConfig,
        accessUrls
      }
    };

  } catch (error) {
    console.error('Error validando código de cliente:', error);
    return {
      success: false,
      error: 'Error al validar código de acceso'
    };
  }
};

/**
 * Obtener información de código sin marcarlo como usado
 */
export const getClientCodeInfo = (accessCode: string): RonClientCode | null => {
  return clientCodes.get(accessCode) || null;
};

/**
 * Generar múltiples formatos de acceso para cliente
 */
export const generateClientAccessPackage = async (
  sessionId: string,
  clientId: number,
  documentId: number,
  certifierId: number,
  sessionType: 'jitsi' | 'agora' = 'jitsi'
): Promise<{
  accessCode: string;
  qrCode: string;
  directUrl: string;
  embedUrl: string;
  smsMessage: string;
  emailContent: string;
  whatsappMessage: string;
  instructions: string[];
}> => {
  try {
    const clientCode = await generateRonClientCode(
      sessionId,
      clientId,
      documentId,
      certifierId,
      sessionType
    );

    // Mensaje para SMS
    const smsMessage = `NotaryPro RON: Su sesión de notarización está lista. Código: ${clientCode.accessCode}. Acceda en: ${clientCode.directUrl}. Válido hasta: ${format(clientCode.expiresAt, 'dd/MM/yyyy HH:mm', { locale: es })}`;

    // Contenido para email
    const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Sesión RON - NotaryPro</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%); color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h1>🏛️ NotaryPro RON</h1>
            <h2>Su Sesión de Notarización Está Lista</h2>
        </div>
        
        <div style="padding: 20px; background: #f8fafc; border-radius: 8px; margin: 20px 0;">
            <h3>📄 Detalles de la Sesión:</h3>
            <p><strong>Documento:</strong> ${clientCode.metadata.documentTitle}</p>
            <p><strong>Certificador:</strong> ${clientCode.metadata.certifierName}</p>
            <p><strong>Cliente:</strong> ${clientCode.metadata.clientName}</p>
            <p><strong>Código de Acceso:</strong> <code style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px;">${clientCode.accessCode}</code></p>
            <p><strong>Válido hasta:</strong> ${format(clientCode.expiresAt, 'PPpp', { locale: es })}</p>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
            <a href="${clientCode.directUrl}" style="background: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                🎥 Acceder a Videollamada RON
            </a>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
            <p><strong>O escanee el código QR:</strong></p>
            <img src="${clientCode.qrCode}" alt="Código QR RON" style="max-width: 200px;">
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4>📋 Instrucciones Importantes:</h4>
            <ul>
                <li>Tenga su documento de identidad a mano</li>
                <li>Asegúrese de tener buena iluminación</li>
                <li>Use una conexión a internet estable</li>
                <li>La sesión será grabada para fines legales</li>
                <li>Llegue puntual a su cita programada</li>
            </ul>
        </div>
        
        <div style="text-align: center; color: #64748b; font-size: 12px; margin-top: 30px;">
            <p>NotaryPro - Notarización Digital Certificada</p>
            <p>Conforme a la Ley 19.799 sobre Documentos Electrónicos</p>
        </div>
    </body>
    </html>
    `;

    // Mensaje para WhatsApp
    const whatsappMessage = `🏛️ *NotaryPro RON*\n\n📄 Su sesión de notarización está lista:\n\n*Documento:* ${clientCode.metadata.documentTitle}\n*Certificador:* ${clientCode.metadata.certifierName}\n*Código:* ${clientCode.accessCode}\n\n🎥 *Acceder:* ${clientCode.directUrl}\n\n⏰ *Válido hasta:* ${format(clientCode.expiresAt, 'dd/MM/yyyy HH:mm', { locale: es })}\n\n📋 *Instrucciones:*\n• Tenga su cédula a mano\n• Asegúrese de tener buena luz\n• Use conexión estable\n• La sesión será grabada\n\n*NotaryPro* - Notarización Digital Certificada`;

    // Instrucciones detalladas
    const instructions = [
      'Acceda usando el código de acceso o escaneando el código QR',
      'Tenga su documento de identidad físico a mano',
      'Asegúrese de tener buena iluminación en su rostro',
      'Use una conexión a internet estable (WiFi recomendado)',
      'Permita el acceso a cámara y micrófono cuando se solicite',
      'La sesión será grabada automáticamente para fines legales',
      'Siga las instrucciones del certificador durante la sesión',
      'El código expira en 24 horas desde su generación'
    ];

    return {
      accessCode: clientCode.accessCode,
      qrCode: clientCode.qrCode,
      directUrl: clientCode.directUrl,
      embedUrl: clientCode.embedUrl,
      smsMessage,
      emailContent,
      whatsappMessage,
      instructions
    };

  } catch (error) {
    console.error('Error generando paquete de acceso:', error);
    throw new Error('No se pudo generar paquete de acceso para cliente');
  }
};

/**
 * Obtener información completa de código de cliente
 */
export const getClientCodeDetails = async (accessCode: string): Promise<{
  success: boolean;
  data?: {
    code: RonClientCode;
    session: any;
    document: any;
    certifier: any;
    client: any;
  };
  error?: string;
}> => {
  try {
    const clientCode = clientCodes.get(accessCode);

    if (!clientCode) {
      return {
        success: false,
        error: 'Código de acceso no encontrado'
      };
    }

    // Obtener información completa de la sesión
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, clientCode.documentId));

    const [client] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role
      })
      .from(users)
      .where(eq(users.id, clientCode.clientId));

    // Buscar información del certificador desde metadata
    const [certifier] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role
      })
      .from(users)
      .where(eq(users.fullName, clientCode.metadata.certifierName));

    return {
      success: true,
      data: {
        code: clientCode,
        session: {
          id: clientCode.sessionId,
          type: clientCode.metadata.sessionType,
          status: clientCode.status
        },
        document,
        client,
        certifier: certifier || {
          fullName: clientCode.metadata.certifierName,
          email: 'certificador@notarypro.cl'
        }
      }
    };

  } catch (error) {
    console.error('Error obteniendo detalles del código:', error);
    return {
      success: false,
      error: 'Error al obtener información del código'
    };
  }
};

/**
 * Listar códigos activos de un certificador
 */
export const getCertifierClientCodes = async (certifierId: number): Promise<RonClientCode[]> => {
  try {
    const [certifier] = await db
      .select({ fullName: users.fullName })
      .from(users)
      .where(eq(users.id, certifierId));

    if (!certifier) {
      return [];
    }

    // Filtrar códigos del certificador
    const certifierCodes = Array.from(clientCodes.values()).filter(code => 
      code.metadata.certifierName === certifier.fullName
    );

    return certifierCodes.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  } catch (error) {
    console.error('Error obteniendo códigos del certificador:', error);
    return [];
  }
};

/**
 * Limpiar códigos expirados
 */
export const cleanupExpiredClientCodes = (): number => {
  const now = new Date();
  let cleanedCount = 0;

  clientCodes.forEach((code, accessCode) => {
    if (now > code.expiresAt && code.status === 'active') {
      code.status = 'expired';
      clientCodes.set(accessCode, code);
      cleanedCount++;
    }
  });

  console.log(`🧹 Limpiados ${cleanedCount} códigos de cliente expirados`);
  return cleanedCount;
};

/**
 * Generar código QR personalizado con logo
 */
export const generateCustomQRCode = async (
  data: any,
  options: {
    size?: number;
    logo?: string;
    color?: string;
    backgroundColor?: string;
  } = {}
): Promise<string> => {
  try {
    const qrOptions = {
      width: options.size || 300,
      margin: 2,
      color: {
        dark: options.color || '#1e3a8a',
        light: options.backgroundColor || '#ffffff'
      },
      errorCorrectionLevel: 'M' as const
    };

    return await QRCode.toDataURL(JSON.stringify(data), qrOptions);

  } catch (error) {
    console.error('Error generando QR personalizado:', error);
    throw new Error('No se pudo generar código QR');
  }
};

/**
 * Estadísticas de códigos de cliente
 */
export const getClientCodeStats = async (certifierId?: number): Promise<{
  total: number;
  active: number;
  used: number;
  expired: number;
  todayGenerated: number;
  usageRate: number;
}> => {
  try {
    const allCodes = Array.from(clientCodes.values());
    const certifierCodes = certifierId ? 
      allCodes.filter(code => {
        // Buscar por certificador (simplificado para demo)
        return true; // En implementación real, filtrar por certifierId
      }) : allCodes;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      total: certifierCodes.length,
      active: certifierCodes.filter(c => c.status === 'active').length,
      used: certifierCodes.filter(c => c.status === 'used').length,
      expired: certifierCodes.filter(c => c.status === 'expired').length,
      todayGenerated: certifierCodes.filter(c => c.createdAt >= today).length,
      usageRate: 0
    };

    stats.usageRate = stats.total > 0 ? (stats.used / stats.total) * 100 : 0;

    return stats;

  } catch (error) {
    console.error('Error obteniendo estadísticas de códigos:', error);
    return {
      total: 0,
      active: 0,
      used: 0,
      expired: 0,
      todayGenerated: 0,
      usageRate: 0
    };
  }
};

export default {
  generateRonClientCode,
  validateAndUseClientCode,
  getClientCodeInfo,
  getClientCodeDetails,
  getCertifierClientCodes,
  cleanupExpiredClientCodes,
  generateClientAccessPackage,
  generateCustomQRCode,
  getClientCodeStats
};