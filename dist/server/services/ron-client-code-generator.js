"use strict";
/**
 * GENERADOR DE CÓDIGOS DE CLIENTE RON
 * Sistema completo para generar códigos de acceso para clientes en sesiones RON
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientCodeStats = exports.generateCustomQRCode = exports.cleanupExpiredClientCodes = exports.getCertifierClientCodes = exports.getClientCodeDetails = exports.generateClientAccessPackage = exports.getClientCodeInfo = exports.validateAndUseClientCode = exports.generateRonClientCode = void 0;
const crypto_1 = __importDefault(require("crypto"));
const qrcode_1 = __importDefault(require("qrcode"));
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("@shared/schema");
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
// Almacén temporal de códigos (en producción usar Redis o BD)
const clientCodes = new Map();
/**
 * Generar código de acceso único para cliente RON
 */
const generateRonClientCode = async (sessionId, clientId, documentId, certifierId, sessionType = 'jitsi', expirationHours = 24) => {
    try {
        // Generar código único
        const timestamp = Date.now().toString();
        const randomBytes = crypto_1.default.randomBytes(6).toString('hex').toUpperCase();
        const accessCode = `RON-${timestamp.slice(-6)}-${randomBytes}`;
        const codeId = crypto_1.default.randomUUID();
        // Obtener información del cliente
        const [client] = await db_1.db
            .select({
            fullName: schema_1.users.fullName,
            email: schema_1.users.email
        })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, clientId));
        // Obtener información del certificador
        const [certifier] = await db_1.db
            .select({
            fullName: schema_1.users.fullName,
            email: schema_1.users.email
        })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, certifierId));
        // Obtener información del documento
        const [document] = await db_1.db
            .select({
            title: schema_1.documents.title,
            documentType: schema_1.documents.documentType
        })
            .from(schema_1.documents)
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, documentId));
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
            expiresAt: (0, date_fns_1.addHours)(new Date(), expirationHours).toISOString()
        };
        // Generar código QR
        const qrCodeDataUrl = await qrcode_1.default.toDataURL(JSON.stringify(qrData), {
            width: 300,
            margin: 2,
            color: {
                dark: '#1e3a8a', // Azul NotaryPro
                light: '#ffffff'
            },
            errorCorrectionLevel: 'M'
        });
        // Crear objeto de código de cliente
        const clientCode = {
            id: codeId,
            sessionId,
            clientId,
            documentId,
            accessCode,
            qrCode: qrCodeDataUrl,
            directUrl,
            embedUrl,
            expiresAt: (0, date_fns_1.addHours)(new Date(), expirationHours),
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
        await db_1.db.insert(schema_1.analyticsEvents).values({
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
    }
    catch (error) {
        console.error('Error generando código de cliente RON:', error);
        throw new Error('No se pudo generar código de acceso');
    }
};
exports.generateRonClientCode = generateRonClientCode;
/**
 * Validar y usar código de cliente RON
 */
const validateAndUseClientCode = async (accessCode, clientIP) => {
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
        let sessionConfig = {};
        let accessUrls = {
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
        }
        else {
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
        await db_1.db.insert(schema_1.analyticsEvents).values({
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
    }
    catch (error) {
        console.error('Error validando código de cliente:', error);
        return {
            success: false,
            error: 'Error al validar código de acceso'
        };
    }
};
exports.validateAndUseClientCode = validateAndUseClientCode;
/**
 * Obtener información de código sin marcarlo como usado
 */
const getClientCodeInfo = (accessCode) => {
    return clientCodes.get(accessCode) || null;
};
exports.getClientCodeInfo = getClientCodeInfo;
/**
 * Generar múltiples formatos de acceso para cliente
 */
const generateClientAccessPackage = async (sessionId, clientId, documentId, certifierId, sessionType = 'jitsi') => {
    try {
        const clientCode = await (0, exports.generateRonClientCode)(sessionId, clientId, documentId, certifierId, sessionType);
        // Mensaje para SMS
        const smsMessage = `NotaryPro RON: Su sesión de notarización está lista. Código: ${clientCode.accessCode}. Acceda en: ${clientCode.directUrl}. Válido hasta: ${(0, date_fns_1.format)(clientCode.expiresAt, 'dd/MM/yyyy HH:mm', { locale: locale_1.es })}`;
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
            <p><strong>Válido hasta:</strong> ${(0, date_fns_1.format)(clientCode.expiresAt, 'PPpp', { locale: locale_1.es })}</p>
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
        const whatsappMessage = `🏛️ *NotaryPro RON*\n\n📄 Su sesión de notarización está lista:\n\n*Documento:* ${clientCode.metadata.documentTitle}\n*Certificador:* ${clientCode.metadata.certifierName}\n*Código:* ${clientCode.accessCode}\n\n🎥 *Acceder:* ${clientCode.directUrl}\n\n⏰ *Válido hasta:* ${(0, date_fns_1.format)(clientCode.expiresAt, 'dd/MM/yyyy HH:mm', { locale: locale_1.es })}\n\n📋 *Instrucciones:*\n• Tenga su cédula a mano\n• Asegúrese de tener buena luz\n• Use conexión estable\n• La sesión será grabada\n\n*NotaryPro* - Notarización Digital Certificada`;
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
    }
    catch (error) {
        console.error('Error generando paquete de acceso:', error);
        throw new Error('No se pudo generar paquete de acceso para cliente');
    }
};
exports.generateClientAccessPackage = generateClientAccessPackage;
/**
 * Obtener información completa de código de cliente
 */
const getClientCodeDetails = async (accessCode) => {
    try {
        const clientCode = clientCodes.get(accessCode);
        if (!clientCode) {
            return {
                success: false,
                error: 'Código de acceso no encontrado'
            };
        }
        // Obtener información completa de la sesión
        const [document] = await db_1.db
            .select()
            .from(schema_1.documents)
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, clientCode.documentId));
        const [client] = await db_1.db
            .select({
            id: schema_1.users.id,
            fullName: schema_1.users.fullName,
            email: schema_1.users.email,
            role: schema_1.users.role
        })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, clientCode.clientId));
        // Buscar información del certificador desde metadata
        const [certifier] = await db_1.db
            .select({
            id: schema_1.users.id,
            fullName: schema_1.users.fullName,
            email: schema_1.users.email,
            role: schema_1.users.role
        })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.fullName, clientCode.metadata.certifierName));
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
    }
    catch (error) {
        console.error('Error obteniendo detalles del código:', error);
        return {
            success: false,
            error: 'Error al obtener información del código'
        };
    }
};
exports.getClientCodeDetails = getClientCodeDetails;
/**
 * Listar códigos activos de un certificador
 */
const getCertifierClientCodes = async (certifierId) => {
    try {
        const [certifier] = await db_1.db
            .select({ fullName: schema_1.users.fullName })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, certifierId));
        if (!certifier) {
            return [];
        }
        // Filtrar códigos del certificador
        const certifierCodes = Array.from(clientCodes.values()).filter(code => code.metadata.certifierName === certifier.fullName);
        return certifierCodes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    catch (error) {
        console.error('Error obteniendo códigos del certificador:', error);
        return [];
    }
};
exports.getCertifierClientCodes = getCertifierClientCodes;
/**
 * Limpiar códigos expirados
 */
const cleanupExpiredClientCodes = () => {
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
exports.cleanupExpiredClientCodes = cleanupExpiredClientCodes;
/**
 * Generar código QR personalizado con logo
 */
const generateCustomQRCode = async (data, options = {}) => {
    try {
        const qrOptions = {
            width: options.size || 300,
            margin: 2,
            color: {
                dark: options.color || '#1e3a8a',
                light: options.backgroundColor || '#ffffff'
            },
            errorCorrectionLevel: 'M'
        };
        return await qrcode_1.default.toDataURL(JSON.stringify(data), qrOptions);
    }
    catch (error) {
        console.error('Error generando QR personalizado:', error);
        throw new Error('No se pudo generar código QR');
    }
};
exports.generateCustomQRCode = generateCustomQRCode;
/**
 * Estadísticas de códigos de cliente
 */
const getClientCodeStats = async (certifierId) => {
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
    }
    catch (error) {
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
exports.getClientCodeStats = getClientCodeStats;
exports.default = {
    generateRonClientCode: exports.generateRonClientCode,
    validateAndUseClientCode: exports.validateAndUseClientCode,
    getClientCodeInfo: exports.getClientCodeInfo,
    getClientCodeDetails: exports.getClientCodeDetails,
    getCertifierClientCodes: exports.getCertifierClientCodes,
    cleanupExpiredClientCodes: exports.cleanupExpiredClientCodes,
    generateClientAccessPackage: exports.generateClientAccessPackage,
    generateCustomQRCode: exports.generateCustomQRCode,
    getClientCodeStats: exports.getClientCodeStats
};
