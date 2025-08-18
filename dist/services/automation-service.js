"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.automationService = exports.AutomationService = void 0;
const schema_1 = require("@shared/schema");
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const crm_service_1 = require("./crm-service");
const whatsapp_service_1 = require("./whatsapp-service");
/**
 * Servicio para manejar automatizaciones entre CRM, WhatsApp y Dialogflow
 */
class AutomationService {
    /**
     * Procesa un evento del sistema y ejecuta las automatizaciones correspondientes
     */
    async processEvent(eventType, data, user) {
        try {
            // Buscar reglas de automatización activas para este tipo de evento
            const rules = await db_1.db.select()
                .from(automationRules)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(automationRules.triggerType, 'event_based'), (0, drizzle_orm_1.eq)(automationRules.triggerEvent, eventType), (0, drizzle_orm_1.eq)(automationRules.isActive, true)));
            // Ejecutar cada regla de automatización
            for (const rule of rules) {
                await this.executeRule(rule, data, user);
            }
        }
        catch (error) {
            console.error(`Error processing event ${eventType}:`, error);
        }
    }
    /**
     * Captura eventos de documento y actualiza leads en el CRM
     */
    async handleDocumentEvent(document, eventType, user) {
        try {
            // Buscar lead asociado al usuario
            const [lead] = await db_1.db.select()
                .from(schema_1.crmLeads)
                .where((0, drizzle_orm_1.eq)(schema_1.crmLeads.email, user?.email || ''))
                .limit(1);
            if (!lead) {
                // Crear lead en el CRM si no existe
                if (user) {
                    const newLead = {
                        fullName: user.fullName,
                        email: user.email,
                        phone: '', // Tendremos que obtener el teléfono de otro lado
                        status: this.mapDocumentStatusToCrmStatus(document.status),
                        pipelineStage: this.mapDocumentStatusToPipelineStage(document.status),
                        documentType: document.title,
                        source: 'webapp'
                    };
                    // Insertar en nuestra base de datos
                    const [createdLead] = await db_1.db.insert(schema_1.crmLeads)
                        .values(newLead)
                        .returning();
                    // Sincronizar con el CRM externo
                    const externalId = await crm_service_1.crmService.syncLead(createdLead);
                    if (externalId) {
                        await db_1.db.update(schema_1.crmLeads)
                            .set({ crmExternalId: externalId })
                            .where((0, drizzle_orm_1.eq)(schema_1.crmLeads.id, createdLead.id));
                    }
                    // Disparar evento para la automatización
                    await this.processEvent(eventType, { document, lead: createdLead }, user);
                }
            }
            else {
                // Actualizar el lead existente
                const updatedLead = {
                    ...lead,
                    status: this.mapDocumentStatusToCrmStatus(document.status),
                    pipelineStage: this.mapDocumentStatusToPipelineStage(document.status),
                    documentType: document.title,
                    lastContactDate: new Date()
                };
                // Actualizar en nuestra base de datos
                await db_1.db.update(schema_1.crmLeads)
                    .set(updatedLead)
                    .where((0, drizzle_orm_1.eq)(schema_1.crmLeads.id, lead.id));
                // Sincronizar con el CRM externo
                if (lead.crmExternalId) {
                    await crm_service_1.crmService.updateLead(updatedLead);
                }
                // Disparar evento para la automatización
                await this.processEvent(eventType, { document, lead: updatedLead }, user);
            }
        }
        catch (error) {
            console.error(`Error handling document event ${eventType}:`, error);
        }
    }
    /**
     * Ejecuta una regla de automatización específica
     */
    async executeRule(rule, data, user) {
        try {
            const config = rule.actionConfig;
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
        }
        catch (error) {
            console.error(`Error executing rule ${rule.name}:`, error);
        }
    }
    /**
     * Acción: Enviar mensaje de WhatsApp
     */
    async executeSendWhatsAppAction(config, data, user) {
        try {
            const { templateName, useDynamicPhone } = config;
            // Determinar el número de teléfono
            let phoneNumber = config.phoneNumber;
            if (useDynamicPhone && data.lead?.phone) {
                phoneNumber = data.lead.phone;
            }
            else if (useDynamicPhone && data.document?.userId && user?.phone) {
                phoneNumber = user.phone;
            }
            if (!phoneNumber) {
                console.warn('No phone number available for WhatsApp message');
                return;
            }
            // Construir parámetros dinámicos para la plantilla
            const parameters = {};
            if (data.document) {
                parameters.document_title = data.document.title;
                parameters.document_status = data.document.status;
            }
            if (user) {
                parameters.user_name = user.fullName;
            }
            // Enviar mensaje usando el servicio de WhatsApp
            await whatsapp_service_1.whatsappService.sendTemplateMessage(phoneNumber, templateName, parameters);
        }
        catch (error) {
            console.error('Error executing send WhatsApp action:', error);
        }
    }
    /**
     * Acción: Crear lead en CRM
     */
    async executeCreateLeadAction(config, data, user) {
        // La lógica ya está implementada en handleDocumentEvent
        // Esta función es un punto de extensión para reglas más complejas
        console.log('Create lead action executed via rule');
    }
    /**
     * Acción: Actualizar lead en CRM
     */
    async executeUpdateLeadAction(config, data) {
        try {
            const { status, pipelineStage } = config;
            if (!data.lead?.id) {
                console.warn('No lead available for update');
                return;
            }
            // Actualizar el lead en nuestra base de datos
            const updateData = {
                lastContactDate: new Date(),
                updatedAt: new Date()
            };
            if (status) {
                updateData.status = status;
            }
            if (pipelineStage) {
                updateData.pipelineStage = pipelineStage;
            }
            await db_1.db.update(schema_1.crmLeads)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.crmLeads.id, data.lead.id));
            // Sincronizar con el CRM externo
            if (data.lead.crmExternalId) {
                await crm_service_1.crmService.updateLead({
                    ...data.lead,
                    ...updateData
                });
            }
        }
        catch (error) {
            console.error('Error executing update lead action:', error);
        }
    }
    /**
     * Acción: Transferir a humano
     */
    async executeTransferToHumanAction(config, data) {
        try {
            const { assignToUserId } = config;
            if (!data.dialogflowSession?.id) {
                console.warn('No Dialogflow session available for transfer');
                return;
            }
            // Actualizar la sesión para marcarla como transferida
            await db_1.db.update(schema_1.dialogflowSessions)
                .set({
                status: 'transferred',
                transferredToUserId: assignToUserId || null,
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_1.dialogflowSessions.id, data.dialogflowSession.id));
            // Si hay un lead asociado, actualizarlo
            if (data.lead?.id) {
                await db_1.db.update(schema_1.crmLeads)
                    .set({
                    assignedToUserId: assignToUserId || null,
                    notes: `${data.lead.notes || ''}\nTransferido a agente humano el ${new Date().toLocaleString()}`,
                    updatedAt: new Date()
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.crmLeads.id, data.lead.id));
                // Sincronizar con el CRM externo
                if (data.lead.crmExternalId) {
                    const updatedLead = {
                        ...data.lead,
                        assignedToUserId: assignToUserId || null,
                        notes: `${data.lead.notes || ''}\nTransferido a agente humano el ${new Date().toLocaleString()}`,
                        updatedAt: new Date()
                    };
                    await crm_service_1.crmService.updateLead(updatedLead);
                }
            }
        }
        catch (error) {
            console.error('Error executing transfer to human action:', error);
        }
    }
    /**
     * Convierte el estado del documento al estado del CRM
     */
    mapDocumentStatusToCrmStatus(documentStatus) {
        const statusMap = {
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
    mapDocumentStatusToPipelineStage(documentStatus) {
        // Por ahora usamos el mismo mapeo que para status
        return this.mapDocumentStatusToCrmStatus(documentStatus);
    }
}
exports.AutomationService = AutomationService;
exports.automationService = new AutomationService();
