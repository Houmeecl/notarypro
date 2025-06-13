"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    processEvent(eventType, data, user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Buscar reglas de automatización activas para este tipo de evento
                const rules = yield db_1.db.select()
                    .from(automationRules)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(automationRules.triggerType, 'event_based'), (0, drizzle_orm_1.eq)(automationRules.triggerEvent, eventType), (0, drizzle_orm_1.eq)(automationRules.isActive, true)));
                // Ejecutar cada regla de automatización
                for (const rule of rules) {
                    yield this.executeRule(rule, data, user);
                }
            }
            catch (error) {
                console.error(`Error processing event ${eventType}:`, error);
            }
        });
    }
    /**
     * Captura eventos de documento y actualiza leads en el CRM
     */
    handleDocumentEvent(document, eventType, user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Buscar lead asociado al usuario
                const [lead] = yield db_1.db.select()
                    .from(schema_1.crmLeads)
                    .where((0, drizzle_orm_1.eq)(schema_1.crmLeads.email, (user === null || user === void 0 ? void 0 : user.email) || ''))
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
                        const [createdLead] = yield db_1.db.insert(schema_1.crmLeads)
                            .values(newLead)
                            .returning();
                        // Sincronizar con el CRM externo
                        const externalId = yield crm_service_1.crmService.syncLead(createdLead);
                        if (externalId) {
                            yield db_1.db.update(schema_1.crmLeads)
                                .set({ crmExternalId: externalId })
                                .where((0, drizzle_orm_1.eq)(schema_1.crmLeads.id, createdLead.id));
                        }
                        // Disparar evento para la automatización
                        yield this.processEvent(eventType, { document, lead: createdLead }, user);
                    }
                }
                else {
                    // Actualizar el lead existente
                    const updatedLead = Object.assign(Object.assign({}, lead), { status: this.mapDocumentStatusToCrmStatus(document.status), pipelineStage: this.mapDocumentStatusToPipelineStage(document.status), documentType: document.title, lastContactDate: new Date() });
                    // Actualizar en nuestra base de datos
                    yield db_1.db.update(schema_1.crmLeads)
                        .set(updatedLead)
                        .where((0, drizzle_orm_1.eq)(schema_1.crmLeads.id, lead.id));
                    // Sincronizar con el CRM externo
                    if (lead.crmExternalId) {
                        yield crm_service_1.crmService.updateLead(updatedLead);
                    }
                    // Disparar evento para la automatización
                    yield this.processEvent(eventType, { document, lead: updatedLead }, user);
                }
            }
            catch (error) {
                console.error(`Error handling document event ${eventType}:`, error);
            }
        });
    }
    /**
     * Ejecuta una regla de automatización específica
     */
    executeRule(rule, data, user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const config = rule.actionConfig;
                switch (rule.actionType) {
                    case 'send_whatsapp':
                        yield this.executeSendWhatsAppAction(config, data, user);
                        break;
                    case 'create_lead':
                        yield this.executeCreateLeadAction(config, data, user);
                        break;
                    case 'update_lead':
                        yield this.executeUpdateLeadAction(config, data);
                        break;
                    case 'transfer_to_human':
                        yield this.executeTransferToHumanAction(config, data);
                        break;
                    default:
                        console.warn(`Unknown action type: ${rule.actionType}`);
                }
            }
            catch (error) {
                console.error(`Error executing rule ${rule.name}:`, error);
            }
        });
    }
    /**
     * Acción: Enviar mensaje de WhatsApp
     */
    executeSendWhatsAppAction(config, data, user) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { templateName, useDynamicPhone } = config;
                // Determinar el número de teléfono
                let phoneNumber = config.phoneNumber;
                if (useDynamicPhone && ((_a = data.lead) === null || _a === void 0 ? void 0 : _a.phone)) {
                    phoneNumber = data.lead.phone;
                }
                else if (useDynamicPhone && ((_b = data.document) === null || _b === void 0 ? void 0 : _b.userId) && (user === null || user === void 0 ? void 0 : user.phone)) {
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
                yield whatsapp_service_1.whatsappService.sendTemplateMessage(phoneNumber, templateName, parameters);
            }
            catch (error) {
                console.error('Error executing send WhatsApp action:', error);
            }
        });
    }
    /**
     * Acción: Crear lead en CRM
     */
    executeCreateLeadAction(config, data, user) {
        return __awaiter(this, void 0, void 0, function* () {
            // La lógica ya está implementada en handleDocumentEvent
            // Esta función es un punto de extensión para reglas más complejas
            console.log('Create lead action executed via rule');
        });
    }
    /**
     * Acción: Actualizar lead en CRM
     */
    executeUpdateLeadAction(config, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { status, pipelineStage } = config;
                if (!((_a = data.lead) === null || _a === void 0 ? void 0 : _a.id)) {
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
                yield db_1.db.update(schema_1.crmLeads)
                    .set(updateData)
                    .where((0, drizzle_orm_1.eq)(schema_1.crmLeads.id, data.lead.id));
                // Sincronizar con el CRM externo
                if (data.lead.crmExternalId) {
                    yield crm_service_1.crmService.updateLead(Object.assign(Object.assign({}, data.lead), updateData));
                }
            }
            catch (error) {
                console.error('Error executing update lead action:', error);
            }
        });
    }
    /**
     * Acción: Transferir a humano
     */
    executeTransferToHumanAction(config, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { assignToUserId } = config;
                if (!((_a = data.dialogflowSession) === null || _a === void 0 ? void 0 : _a.id)) {
                    console.warn('No Dialogflow session available for transfer');
                    return;
                }
                // Actualizar la sesión para marcarla como transferida
                yield db_1.db.update(schema_1.dialogflowSessions)
                    .set({
                    status: 'transferred',
                    transferredToUserId: assignToUserId || null,
                    updatedAt: new Date()
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.dialogflowSessions.id, data.dialogflowSession.id));
                // Si hay un lead asociado, actualizarlo
                if ((_b = data.lead) === null || _b === void 0 ? void 0 : _b.id) {
                    yield db_1.db.update(schema_1.crmLeads)
                        .set({
                        assignedToUserId: assignToUserId || null,
                        notes: `${data.lead.notes || ''}\nTransferido a agente humano el ${new Date().toLocaleString()}`,
                        updatedAt: new Date()
                    })
                        .where((0, drizzle_orm_1.eq)(schema_1.crmLeads.id, data.lead.id));
                    // Sincronizar con el CRM externo
                    if (data.lead.crmExternalId) {
                        const updatedLead = Object.assign(Object.assign({}, data.lead), { assignedToUserId: assignToUserId || null, notes: `${data.lead.notes || ''}\nTransferido a agente humano el ${new Date().toLocaleString()}`, updatedAt: new Date() });
                        yield crm_service_1.crmService.updateLead(updatedLead);
                    }
                }
            }
            catch (error) {
                console.error('Error executing transfer to human action:', error);
            }
        });
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
