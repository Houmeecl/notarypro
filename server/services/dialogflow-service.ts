/**
 * Servicio para integración con Dialogflow de Google Cloud
 * Permite gestionar la conversación con el Agente IA
 */

import axios from 'axios';
import { DialogflowSession, InsertWhatsappMessage, WhatsappMessage } from '@shared/schema';
import { whatsappService } from './whatsapp-service';
import { db } from '../db';
import { whatsappMessages } from '@shared/schema';
import { eq } from 'drizzle-orm';

export class DialogflowService {
  private apiUrl: string;
  private apiKey: string;
  private projectId: string;
  private languageCode: string;

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
  async processMessage(
    message: WhatsappMessage,
    session: DialogflowSession
  ): Promise<{ responseText: string; intent: string; parameters: any; }> {
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
      const response = await axios.post(
        `${this.apiUrl}/agent/sessions/${session.sessionId}:detectIntent`,
        {
          queryInput,
          queryParams: {
            timeZone: 'America/Santiago'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Extraer datos de la respuesta
      const queryResult = response.data.queryResult || {};
      const responseText = queryResult.fulfillmentText || 'No pude entenderte. ¿Podrías reformular tu pregunta?';
      const intent = queryResult.intent?.displayName || 'default.fallback';
      const parameters = queryResult.parameters || {};

      // Actualizar la sesión con el nuevo intent y parámetros
      await this.updateSession(session.id, intent, parameters);

      // Si es un intent que requiere transferir a humano
      if (intent === 'transfer.to.human') {
        await this.transferToHuman(session.id);
      }

      return { responseText, intent, parameters };
    } catch (error) {
      console.error('Error processing message with Dialogflow', error);
      return {
        responseText: 'Lo siento, tuve un problema para procesar tu mensaje. Por favor, intenta nuevamente.',
        intent: 'error',
        parameters: {}
      };
    }
  }

  /**
   * Envía respuesta automática por WhatsApp
   */
  async sendResponse(phoneNumber: string, responseText: string, sessionId: string): Promise<string | null> {
    const message: InsertWhatsappMessage = {
      direction: 'outgoing',
      phoneNumber,
      messageType: 'text',
      content: responseText,
      status: 'pending'
    };

    try {
      // Guardar mensaje en la base de datos
      const [savedMessage] = await db.insert(whatsappMessages)
        .values(message)
        .returning();

      // Enviar a través del servicio de WhatsApp
      const externalMessageId = await whatsappService.sendMessage(savedMessage);

      if (externalMessageId) {
        // Actualizar con ID externo
        await db.update(whatsappMessages)
          .set({ 
            externalMessageId,
            status: 'sent'
          })
          .where(eq(whatsappMessages.id, savedMessage.id));
      }

      return externalMessageId;
    } catch (error) {
      console.error('Error sending Dialogflow response', error);
      return null;
    }
  }

  /**
   * Crea una nueva sesión de Dialogflow
   */
  async createSession(leadId?: number, userId?: number): Promise<string> {
    // Generar un ID de sesión único
    const sessionId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    try {
      // Inicializar sesión con Dialogflow
      await axios.post(
        `${this.apiUrl}/agent/sessions/${sessionId}:detectIntent`,
        {
          queryInput: {
            event: {
              name: 'WELCOME',
              languageCode: this.languageCode
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return sessionId;
    } catch (error) {
      console.error('Error creating Dialogflow session', error);
      return sessionId; // Return sessionId even on error
    }
  }

  /**
   * Actualiza los datos de la sesión
   */
  private async updateSession(
    sessionId: number, 
    intent: string, 
    parameters: any
  ): Promise<void> {
    try {
      await db.update(dialogflowSessions)
        .set({ 
          intent,
          parameters,
          lastInteractionAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(dialogflowSessions.id, sessionId));
    } catch (error) {
      console.error('Error updating Dialogflow session', error);
    }
  }

  /**
   * Marca la sesión para transferir a un humano
   */
  private async transferToHuman(sessionId: number): Promise<void> {
    try {
      await db.update(dialogflowSessions)
        .set({ 
          status: 'transferred',
          updatedAt: new Date()
        })
        .where(eq(dialogflowSessions.id, sessionId));
    } catch (error) {
      console.error('Error transferring Dialogflow session to human', error);
    }
  }
}

export const dialogflowService = new DialogflowService();