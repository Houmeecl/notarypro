"use strict";
/**
 * Servicio para integración con WhatsApp Business API
 * Compatible con Twilio o 360Dialog como proveedores
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappService = exports.WhatsappService = void 0;
const axios_1 = __importDefault(require("axios"));
const schema_1 = require("@shared/schema");
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
class WhatsappService {
    constructor() {
        // Get configuration from environment variables
        this.provider = (process.env.WHATSAPP_PROVIDER || 'twilio');
        this.apiKey = process.env.WHATSAPP_API_KEY || '';
        this.apiUrl = process.env.WHATSAPP_API_URL || '';
        this.fromNumber = process.env.WHATSAPP_FROM_NUMBER || '';
        if (!this.apiKey || !this.apiUrl) {
            console.warn('WHATSAPP_API_KEY or WHATSAPP_API_URL environment variables are not set. WhatsApp integration will not work.');
        }
    }
    /**
     * Envía un mensaje de WhatsApp
     * @param message Mensaje a enviar
     * @returns ID externo del mensaje o null si hay error
     */
    async sendMessage(message) {
        if (!this.apiKey || !this.apiUrl) {
            console.warn('WhatsApp API configuration is incomplete');
            return null;
        }
        try {
            if (this.provider === 'twilio') {
                return await this.sendViaTwilio(message);
            }
            else {
                return await this.sendVia360Dialog(message);
            }
        }
        catch (error) {
            console.error('Error sending WhatsApp message:', error);
            return null;
        }
    }
    /**
     * Envía un mensaje usando plantillas preaprobadas
     * @param phoneNumber Número de teléfono de destino
     * @param templateName Nombre de la plantilla
     * @param parameters Parámetros para la plantilla
     * @returns ID externo del mensaje o null si hay error
     */
    async sendTemplateMessage(phoneNumber, templateName, parameters = {}) {
        if (!this.apiKey || !this.apiUrl) {
            console.warn('WhatsApp API configuration is incomplete');
            return null;
        }
        try {
            const message = {
                direction: 'outgoing',
                phoneNumber,
                messageType: 'template',
                content: templateName,
                metadata: { templateName, parameters },
                status: 'pending',
                sentAt: new Date()
            };
            // Guardar en base de datos
            const [savedMessage] = await db_1.db.insert(schema_1.whatsappMessages)
                .values(message)
                .returning();
            let externalMessageId = null;
            if (this.provider === 'twilio') {
                externalMessageId = await this.sendTemplateViaTwilio(savedMessage, templateName, parameters);
            }
            else {
                externalMessageId = await this.sendTemplateVia360Dialog(savedMessage, templateName, parameters);
            }
            if (externalMessageId) {
                // Actualizar con ID externo
                await db_1.db.update(schema_1.whatsappMessages)
                    .set({
                    externalMessageId,
                    status: 'sent'
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.whatsappMessages.id, savedMessage.id));
            }
            return externalMessageId;
        }
        catch (error) {
            console.error('Error sending template message:', error);
            return null;
        }
    }
    /**
     * Procesa webhooks entrantes de WhatsApp
     * @param data Datos del webhook
     * @returns Mensaje procesado o null
     */
    async processWebhook(data) {
        try {
            // Formato depende del proveedor
            if (this.provider === 'twilio') {
                return await this.processTwilioWebhook(data);
            }
            else {
                return await this.process360DialogWebhook(data);
            }
        }
        catch (error) {
            console.error('Error processing WhatsApp webhook:', error);
            return null;
        }
    }
    /**
     * Envía mensaje vía Twilio
     */
    async sendViaTwilio(message) {
        try {
            const response = await axios_1.default.post(`${this.apiUrl}/Messages.json`, new URLSearchParams({
                To: `whatsapp:+${message.phoneNumber}`,
                From: `whatsapp:+${this.fromNumber}`,
                Body: message.content
            }), {
                auth: {
                    username: process.env.TWILIO_ACCOUNT_SID || '',
                    password: this.apiKey
                }
            });
            return response.data.sid;
        }
        catch (error) {
            console.error('Error sending via Twilio:', error);
            return null;
        }
    }
    /**
     * Envía mensaje vía 360Dialog
     */
    async sendVia360Dialog(message) {
        try {
            const response = await axios_1.default.post(`${this.apiUrl}/messages`, {
                to: message.phoneNumber,
                type: "text",
                text: {
                    body: message.content
                }
            }, {
                headers: {
                    'D360-API-KEY': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.messages[0].id;
        }
        catch (error) {
            console.error('Error sending via 360Dialog:', error);
            return null;
        }
    }
    /**
     * Envía plantilla vía Twilio
     */
    async sendTemplateViaTwilio(message, templateName, parameters) {
        try {
            // Twilio requiere un formato específico para plantillas
            // Este es un ejemplo básico, debería adaptarse según documentación actual de Twilio
            // Construir variables de la plantilla
            const variables = Object.values(parameters);
            const response = await axios_1.default.post(`${this.apiUrl}/Messages.json`, new URLSearchParams({
                To: `whatsapp:+${message.phoneNumber}`,
                From: `whatsapp:+${this.fromNumber}`,
                ContentSid: templateName,
                ContentVariables: JSON.stringify(variables)
            }), {
                auth: {
                    username: process.env.TWILIO_ACCOUNT_SID || '',
                    password: this.apiKey
                }
            });
            return response.data.sid;
        }
        catch (error) {
            console.error('Error sending template via Twilio:', error);
            return null;
        }
    }
    /**
     * Envía plantilla vía 360Dialog
     */
    async sendTemplateVia360Dialog(message, templateName, parameters) {
        try {
            // Convertir parámetros al formato de 360Dialog
            const components = [
                {
                    type: "body",
                    parameters: Object.entries(parameters).map(([_, value]) => ({
                        type: "text",
                        text: value
                    }))
                }
            ];
            const response = await axios_1.default.post(`${this.apiUrl}/messages`, {
                to: message.phoneNumber,
                type: "template",
                template: {
                    namespace: process.env.WHATSAPP_TEMPLATE_NAMESPACE || "",
                    name: templateName,
                    language: {
                        code: "es",
                        policy: "deterministic"
                    },
                    components
                }
            }, {
                headers: {
                    'D360-API-KEY': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.messages[0].id;
        }
        catch (error) {
            console.error('Error sending template via 360Dialog:', error);
            return null;
        }
    }
    /**
     * Procesa webhook de Twilio
     */
    async processTwilioWebhook(data) {
        try {
            // Extraer datos del webhook de Twilio
            const phoneNumber = data.From.replace('whatsapp:+', '');
            const content = data.Body;
            const externalMessageId = data.SmsSid;
            // Crear registro en base de datos
            const [message] = await db_1.db.insert(schema_1.whatsappMessages)
                .values({
                direction: 'incoming',
                phoneNumber,
                messageType: 'text',
                content,
                externalMessageId,
                status: 'received',
                receivedAt: new Date()
            })
                .returning();
            return message;
        }
        catch (error) {
            console.error('Error processing Twilio webhook:', error);
            return null;
        }
    }
    /**
     * Procesa webhook de 360Dialog
     */
    async process360DialogWebhook(data) {
        try {
            // Extraer datos del webhook de 360Dialog
            // Formato difiere según la documentación actual de 360Dialog
            const entry = data.entry[0];
            const changes = entry.changes[0];
            const value = changes.value;
            const messages = value.messages;
            if (!messages || messages.length === 0) {
                return null;
            }
            const message = messages[0];
            const phoneNumber = message.from;
            let content = '';
            let messageType = 'text';
            // Determinar tipo de mensaje y contenido
            if (message.type === 'text') {
                content = message.text.body;
            }
            else if (message.type === 'image') {
                content = message.image.caption || 'Imagen recibida';
                messageType = 'image';
            }
            else {
                content = `Mensaje tipo ${message.type} recibido`;
                messageType = message.type;
            }
            // Crear registro en base de datos
            const [savedMessage] = await db_1.db.insert(schema_1.whatsappMessages)
                .values({
                direction: 'incoming',
                phoneNumber,
                messageType,
                content,
                externalMessageId: message.id,
                status: 'received',
                receivedAt: new Date(),
                metadata: message
            })
                .returning();
            return savedMessage;
        }
        catch (error) {
            console.error('Error processing 360Dialog webhook:', error);
            return null;
        }
    }
}
exports.WhatsappService = WhatsappService;
exports.whatsappService = new WhatsappService();
