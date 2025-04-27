import { AutomationRule, CrmLead, Document, User, crmLeads, dialogflowSessions } from '@shared/schema';
import { db } from '../db';
import { eq, and, gte, lte } from 'drizzle-orm';
import { crmService } from './crm-service';
import { whatsappService } from './whatsapp-service';
import { dialogflowService } from './dialogflow-service';

/**
 * Servicio para manejar automatizaciones entre CRM, WhatsApp y Dialogflow
 */
export class AutomationService {
  /**
   * Procesa un evento del sistema y ejecuta las automatizaciones correspondientes
   */
  async processEvent(
    eventType: string, 
    data: any, 
    user?: User
  ): Promise<void> {
    try {
      // Buscar reglas de automatización activas para este tipo de evento
      const rules = await db.select()
        .from(automationRules)
        .where(
          and(
            eq(automationRules.triggerType, 'event_based'),
            eq(automationRules.triggerEvent, eventType),
            eq(automationRules.isActive, true)
          )
        );

      // Ejecutar cada regla de automatización
      for (const rule of rules) {
        await this.executeRule(rule, data, user);
      }
    } catch (error) {
      console.error(`Error processing event ${eventType}:`, error);
    }
  }

  /**
   * Captura eventos de documento y actualiza leads en el CRM
   */
  async handleDocumentEvent(document: Document, eventType: string, user?: User): Promise<void> {
    try {
      // Buscar lead asociado al usuario
      const [lead] = await db.select()
        .from(crmLeads)
        .where(eq(crmLeads.email, user?.email || ''))
        .limit(1);

      if (!lead) {
        // Crear lead en el CRM si no existe
        if (user) {
          const newLead: Partial<CrmLead> = {
            fullName: user.fullName,
            email: user.email,
            phone: '', // Tendremos que obtener el teléfono de otro lado
            status: this.mapDocumentStatusToCrmStatus(document.status),
            pipelineStage: this.mapDocumentStatusToPipelineStage(document.status),
            documentType: document.title,
            source: 'webapp'
          };

          // Insertar en nuestra base de datos
          const [createdLead] = await db.insert(crmLeads)
            .values(newLead as any)
            .returning();

          // Sincronizar con el CRM externo
          const externalId = await crmService.syncLead(createdLead);
          if (externalId) {
            await db.update(crmLeads)
              .set({ crmExternalId: externalId })
              .where(eq(crmLeads.id, createdLead.id));
          }

          // Disparar evento para la automatización
          await this.processEvent(eventType, { document, lead: createdLead }, user);
        }
      } else {
        // Actualizar el lead existente
        const updatedLead = {
          ...lead,
          status: this.mapDocumentStatusToCrmStatus(document.status),
          pipelineStage: this.mapDocumentStatusToPipelineStage(document.status),
          documentType: document.title,
          lastContactDate: new Date()
        };

        // Actualizar en nuestra base de datos
        await db.update(crmLeads)
          .set(updatedLead)
          .where(eq(crmLeads.id, lead.id));

        // Sincronizar con el CRM externo
        if (lead.crmExternalId) {
          await crmService.updateLead(updatedLead);
        }

        // Disparar evento para la automatización
        await this.processEvent(eventType, { document, lead: updatedLead }, user);
      }
    } catch (error) {
      console.error(`Error handling document event ${eventType}:`, error);
    }
  }

  /**
   * Ejecuta una regla de automatización específica
   */
  private async executeRule(
    rule: AutomationRule, 
    data: any, 
    user?: User
  ): Promise<void> {
    try {
      const config = rule.actionConfig as any;

      switch (rule.actionType) {
        case 'send_whatsapp': 
          await this.executeSendWhatsAppAction(config, data, user);
          break;
        
        case 'create_lead':
          await this.executeCreateLeadAction(config, data, user);
          break;
        
        case 'update_lead':
          await this.executeUpdateLeadAction(config, data);
          break;
        
        case 'transfer_to_human':
          await this.executeTransferToHumanAction(config, data);
          break;
        
        default:
          console.warn(`Unknown action type: ${rule.actionType}`);
      }
    } catch (error) {
      console.error(`Error executing rule ${rule.name}:`, error);
    }
  }

  /**
   * Acción: Enviar mensaje de WhatsApp
   */
  private async executeSendWhatsAppAction(
    config: any, 
    data: any, 
    user?: User
  ): Promise<void> {
    try {
      const { templateName, useDynamicPhone } = config;
      
      // Determinar el número de teléfono
      let phoneNumber = config.phoneNumber;
      
      if (useDynamicPhone && data.lead?.phone) {
        phoneNumber = data.lead.phone;
      } else if (useDynamicPhone && data.document?.userId && user?.phone) {
        phoneNumber = user.phone;
      }
      
      if (!phoneNumber) {
        console.warn('No phone number available for WhatsApp message');
        return;
      }
      
      // Construir parámetros dinámicos para la plantilla
      const parameters: Record<string, string> = {};
      
      if (data.document) {
        parameters.document_title = data.document.title;
        parameters.document_status = data.document.status;
      }
      
      if (user) {
        parameters.user_name = user.fullName;
      }
      
      // Enviar mensaje usando el servicio de WhatsApp
      await whatsappService.sendTemplateMessage(phoneNumber, templateName, parameters);
    } catch (error) {
      console.error('Error executing send WhatsApp action:', error);
    }
  }

  /**
   * Acción: Crear lead en CRM
   */
  private async executeCreateLeadAction(
    config: any, 
    data: any, 
    user?: User
  ): Promise<void> {
    // La lógica ya está implementada en handleDocumentEvent
    // Esta función es un punto de extensión para reglas más complejas
    console.log('Create lead action executed via rule');
  }

  /**
   * Acción: Actualizar lead en CRM
   */
  private async executeUpdateLeadAction(
    config: any, 
    data: any
  ): Promise<void> {
    try {
      const { status, pipelineStage } = config;
      
      if (!data.lead?.id) {
        console.warn('No lead available for update');
        return;
      }
      
      // Actualizar el lead en nuestra base de datos
      const updateData: Partial<CrmLead> = {
        lastContactDate: new Date(),
        updatedAt: new Date()
      };
      
      if (status) {
        updateData.status = status;
      }
      
      if (pipelineStage) {
        updateData.pipelineStage = pipelineStage;
      }
      
      await db.update(crmLeads)
        .set(updateData)
        .where(eq(crmLeads.id, data.lead.id));
      
      // Sincronizar con el CRM externo
      if (data.lead.crmExternalId) {
        await crmService.updateLead({
          ...data.lead,
          ...updateData
        });
      }
    } catch (error) {
      console.error('Error executing update lead action:', error);
    }
  }

  /**
   * Acción: Transferir a humano
   */
  private async executeTransferToHumanAction(
    config: any, 
    data: any
  ): Promise<void> {
    try {
      const { assignToUserId } = config;
      
      if (!data.dialogflowSession?.id) {
        console.warn('No Dialogflow session available for transfer');
        return;
      }
      
      // Actualizar la sesión para marcarla como transferida
      await db.update(dialogflowSessions)
        .set({
          status: 'transferred',
          transferredToUserId: assignToUserId || null,
          updatedAt: new Date()
        })
        .where(eq(dialogflowSessions.id, data.dialogflowSession.id));
      
      // Si hay un lead asociado, actualizarlo
      if (data.lead?.id) {
        await db.update(crmLeads)
          .set({
            assignedToUserId: assignToUserId || null,
            notes: `${data.lead.notes || ''}\nTransferido a agente humano el ${new Date().toLocaleString()}`,
            updatedAt: new Date()
          })
          .where(eq(crmLeads.id, data.lead.id));
        
        // Sincronizar con el CRM externo
        if (data.lead.crmExternalId) {
          const updatedLead = {
            ...data.lead,
            assignedToUserId: assignToUserId || null,
            notes: `${data.lead.notes || ''}\nTransferido a agente humano el ${new Date().toLocaleString()}`,
            updatedAt: new Date()
          };
          
          await crmService.updateLead(updatedLead);
        }
      }
    } catch (error) {
      console.error('Error executing transfer to human action:', error);
    }
  }

  /**
   * Convierte el estado del documento al estado del CRM
   */
  private mapDocumentStatusToCrmStatus(documentStatus: string): string {
    const statusMap: Record<string, string> = {
      'draft': 'initiated',
      'pending_payment': 'data_completed',
      'pending_identity': 'data_completed',
      'pending_signature': 'data_completed',
      'pending_certification': 'payment_completed',
      'certified': 'certified',
      'rejected': 'incomplete'
    };
    
    return statusMap[documentStatus] || 'initiated';
  }

  /**
   * Convierte el estado del documento a la etapa del pipeline
   */
  private mapDocumentStatusToPipelineStage(documentStatus: string): string {
    // Por ahora usamos el mismo mapeo que para status
    return this.mapDocumentStatusToCrmStatus(documentStatus);
  }
}

export const automationService = new AutomationService();