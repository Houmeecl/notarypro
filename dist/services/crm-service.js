"use strict";
/**
 * Servicio para integración con CRM externo
 * Permite sincronizar leads y seguimiento de clientes
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crmService = exports.CrmService = void 0;
const axios_1 = __importDefault(require("axios"));
class CrmService {
    constructor() {
        // Get configuration from environment variables
        this.apiKey = process.env.CRM_API_KEY || '';
        this.apiUrl = process.env.CRM_API_URL || '';
        // Mapeo de estados internos a estados del CRM
        this.mappings = {
            status: {
                'initiated': 'nuevo',
                'data_completed': 'datos_completos',
                'payment_completed': 'pago_realizado',
                'certified': 'certificado',
                'rejected': 'rechazado',
                'incomplete': 'incompleto'
            },
            pipelineStage: {
                'initiated': 'etapa_inicial',
                'data_completed': 'etapa_datos',
                'payment_completed': 'etapa_pago',
                'certified': 'etapa_final',
                'rejected': 'etapa_rechazado',
                'incomplete': 'etapa_abandono'
            }
        };
        if (!this.apiKey || !this.apiUrl) {
            console.warn('CRM_API_KEY or CRM_API_URL environment variables are not set. CRM integration will not work.');
        }
    }
    /**
     * Sincroniza un lead con el CRM externo
     * @param lead Lead a sincronizar
     * @returns ID externo del lead en el CRM
     */
    async syncLead(lead) {
        if (!this.apiKey || !this.apiUrl) {
            console.warn('CRM API configuration is incomplete');
            return null;
        }
        try {
            // Si ya tiene ID externo, actualizar en lugar de crear
            if (lead.crmExternalId) {
                await this.updateLead(lead);
                return lead.crmExternalId;
            }
            // Mapear datos al formato del CRM
            const crmData = this.mapLeadToCrmFormat(lead);
            // Crear lead en el CRM
            const response = await axios_1.default.post(`${this.apiUrl}/leads`, crmData, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            // Retornar el ID externo del lead
            return response.data.id;
        }
        catch (error) {
            console.error('Error syncing lead with CRM:', error);
            return null;
        }
    }
    /**
     * Actualiza un lead en el CRM externo
     * @param lead Lead con datos actualizados
     * @returns true si se actualizó correctamente
     */
    async updateLead(lead) {
        if (!this.apiKey || !this.apiUrl || !lead.crmExternalId) {
            console.warn('CRM API configuration is incomplete or missing external ID');
            return false;
        }
        try {
            // Mapear datos al formato del CRM
            const crmData = this.mapLeadToCrmFormat(lead);
            // Actualizar lead en el CRM
            await axios_1.default.patch(`${this.apiUrl}/leads/${lead.crmExternalId}`, crmData, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return true;
        }
        catch (error) {
            console.error('Error updating lead in CRM:', error);
            return false;
        }
    }
    /**
     * Obtiene un lead desde el CRM externo
     * @param externalId ID externo del lead en el CRM
     * @returns Datos del lead
     */
    async getLead(externalId) {
        if (!this.apiKey || !this.apiUrl) {
            console.warn('CRM API configuration is incomplete');
            return null;
        }
        try {
            // Obtener lead del CRM
            const response = await axios_1.default.get(`${this.apiUrl}/leads/${externalId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            // Retornar datos del lead
            return response.data;
        }
        catch (error) {
            console.error('Error getting lead from CRM:', error);
            return null;
        }
    }
    /**
     * Busca leads en el CRM externo
     * @param query Criterios de búsqueda
     * @returns Lista de leads
     */
    async searchLeads(query) {
        if (!this.apiKey || !this.apiUrl) {
            console.warn('CRM API configuration is incomplete');
            return null;
        }
        try {
            // Construir parámetros de búsqueda
            const params = new URLSearchParams();
            Object.entries(query).forEach(([key, value]) => {
                params.append(key, String(value));
            });
            // Buscar leads en el CRM
            const response = await axios_1.default.get(`${this.apiUrl}/leads/search?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            // Retornar lista de leads
            return response.data.leads || [];
        }
        catch (error) {
            console.error('Error searching leads in CRM:', error);
            return null;
        }
    }
    /**
     * Registra actividad para un lead en el CRM
     * @param externalId ID externo del lead
     * @param activityType Tipo de actividad
     * @param activityData Datos de la actividad
     * @returns true si se registró correctamente
     */
    async trackActivity(externalId, activityType, activityData) {
        if (!this.apiKey || !this.apiUrl) {
            console.warn('CRM API configuration is incomplete');
            return false;
        }
        try {
            // Registrar actividad en el CRM
            await axios_1.default.post(`${this.apiUrl}/leads/${externalId}/activities`, {
                type: activityType,
                timestamp: new Date().toISOString(),
                data: activityData
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return true;
        }
        catch (error) {
            console.error('Error tracking activity in CRM:', error);
            return false;
        }
    }
    /**
     * Convierte el lead interno al formato del CRM
     */
    mapLeadToCrmFormat(lead) {
        return {
            fullName: lead.fullName,
            email: lead.email,
            phone: lead.phone,
            documentType: lead.documentType,
            // Mapear estado interno al estado del CRM
            status: this.mappings.status[lead.status] || lead.status,
            // Mapear etapa interna a la etapa del CRM
            pipelineStage: this.mappings.pipelineStage[lead.pipelineStage] || lead.pipelineStage,
            source: lead.source,
            rut: lead.rut,
            notes: lead.notes,
            assignedTo: lead.assignedToUserId ? String(lead.assignedToUserId) : null,
            lastContactDate: lead.lastContactDate ? lead.lastContactDate.toISOString() : null,
            // Datos adicionales
            additionalData: {
                documentId: lead.documentId,
                internalId: lead.id
            }
        };
    }
}
exports.CrmService = CrmService;
exports.crmService = new CrmService();
