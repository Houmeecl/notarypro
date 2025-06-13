"use strict";
/**
 * Servicio para integración con Dialogflow de Google Cloud
 * Permite gestionar la conversación con el Agente IA
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dialogflowService = exports.DialogflowService = void 0;
const axios_1 = __importDefault(require("axios"));
const whatsapp_service_1 = require("./whatsapp-service");
const db_1 = require("../db");
const schema_1 = require("@shared/schema");
const drizzle_orm_1 = require("drizzle-orm");
class DialogflowService {
    constructor() {
        // Get configuration from environment variables
        this.apiKey = process.env.DIALOGFLOW_API_KEY || '';
        this.projectId = process.env.DIALOGFLOW_PROJECT_ID || '';
        this.apiUrl = process.env.DIALOGFLOW_API_URL || `https://dialogflow.googleapis.com/v2/projects/${this.projectId}`;
        this.languageCode = 'es'; // Español para Chile
        if (!this.apiKey) {
            console.warn('DIALOGFLOW_API_KEY environment variable is not set. Dialogflow integration will not work.');
        }
    }
    /**
     * Procesa un mensaje entrante y obtiene una respuesta del agente
     */
    processMessage(message, session) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!this.apiKey) {
                return {
                    responseText: 'Lo siento, el sistema de asistencia virtual no está disponible en este momento.',
                    intent: 'default.fallback',
                    parameters: {}
                };
            }
            try {
                // Configurar la solicitud a Dialogflow
                const queryInput = {
                    text: {
                        text: message.content,
                        languageCode: this.languageCode
                    }
                };
                // Enviar texto a Dialogflow
                const response = yield axios_1.default.post(`${this.apiUrl}/agent/sessions/${session.sessionId}:detectIntent`, {
                    queryInput,
                    queryParams: {
                        timeZone: 'America/Santiago'
                    }
                }, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                // Extraer datos de la respuesta
                const queryResult = response.data.queryResult || {};
                const responseText = queryResult.fulfillmentText || 'No pude entenderte. ¿Podrías reformular tu pregunta?';
                const intent = ((_a = queryResult.intent) === null || _a === void 0 ? void 0 : _a.displayName) || 'default.fallback';
                const parameters = queryResult.parameters || {};
                // Actualizar la sesión con el nuevo intent y parámetros
                yield this.updateSession(session.id, intent, parameters);
                // Si es un intent que requiere transferir a humano
                if (intent === 'transfer.to.human') {
                    yield this.transferToHuman(session.id);
                }
                return { responseText, intent, parameters };
            }
            catch (error) {
                console.error('Error processing message with Dialogflow', error);
                return {
                    responseText: 'Lo siento, tuve un problema para procesar tu mensaje. Por favor, intenta nuevamente.',
                    intent: 'error',
                    parameters: {}
                };
            }
        });
    }
    /**
     * Envía respuesta automática por WhatsApp
     */
    sendResponse(phoneNumber, responseText, sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = {
                direction: 'outgoing',
                phoneNumber,
                messageType: 'text',
                content: responseText,
                status: 'pending'
            };
            try {
                // Guardar mensaje en la base de datos
                const [savedMessage] = yield db_1.db.insert(schema_1.whatsappMessages)
                    .values(message)
                    .returning();
                // Enviar a través del servicio de WhatsApp
                const externalMessageId = yield whatsapp_service_1.whatsappService.sendMessage(savedMessage);
                if (externalMessageId) {
                    // Actualizar con ID externo
                    yield db_1.db.update(schema_1.whatsappMessages)
                        .set({
                        externalMessageId,
                        status: 'sent'
                    })
                        .where((0, drizzle_orm_1.eq)(schema_1.whatsappMessages.id, savedMessage.id));
                }
                return externalMessageId;
            }
            catch (error) {
                console.error('Error sending Dialogflow response', error);
                return null;
            }
        });
    }
    /**
     * Crea una nueva sesión de Dialogflow
     */
    createSession(leadId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Generar un ID de sesión único
            const sessionId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            try {
                // Inicializar sesión con Dialogflow
                yield axios_1.default.post(`${this.apiUrl}/agent/sessions/${sessionId}:detectIntent`, {
                    queryInput: {
                        event: {
                            name: 'WELCOME',
                            languageCode: this.languageCode
                        }
                    }
                }, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                return sessionId;
            }
            catch (error) {
                console.error('Error creating Dialogflow session', error);
                return sessionId; // Return sessionId even on error
            }
        });
    }
    /**
     * Actualiza los datos de la sesión
     */
    updateSession(sessionId, intent, parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield db_1.db.update(dialogflowSessions)
                    .set({
                    intent,
                    parameters,
                    lastInteractionAt: new Date(),
                    updatedAt: new Date()
                })
                    .where((0, drizzle_orm_1.eq)(dialogflowSessions.id, sessionId));
            }
            catch (error) {
                console.error('Error updating Dialogflow session', error);
            }
        });
    }
    /**
     * Marca la sesión para transferir a un humano
     */
    transferToHuman(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield db_1.db.update(dialogflowSessions)
                    .set({
                    status: 'transferred',
                    updatedAt: new Date()
                })
                    .where((0, drizzle_orm_1.eq)(dialogflowSessions.id, sessionId));
            }
            catch (error) {
                console.error('Error transferring Dialogflow session to human', error);
            }
        });
    }
}
exports.DialogflowService = DialogflowService;
exports.dialogflowService = new DialogflowService();
