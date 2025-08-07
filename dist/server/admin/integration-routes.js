"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_middleware_1 = require("./admin-middleware");
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("@shared/schema");
const crm_service_1 = require("../services/crm-service");
const whatsapp_service_1 = require("../services/whatsapp-service");
const integrationRouter = express_1.default.Router();
// Asegurar que todas las rutas requieren autenticación de administrador
integrationRouter.use(admin_middleware_1.requireAdmin);
// CRM - Gestión de leads
integrationRouter.get('/crm/leads', async (req, res) => {
    try {
        const { search, status, pipelineStage, page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        // Construir la consulta
        let query = db_1.db.select().from(schema_1.crmLeads);
        // Aplicar filtros
        if (search) {
            query = query.where(or((0, drizzle_orm_1.like)(schema_1.crmLeads.fullName, `%${search}%`), (0, drizzle_orm_1.like)(schema_1.crmLeads.email, `%${search}%`), (0, drizzle_orm_1.like)(schema_1.crmLeads.phone, `%${search}%`), (0, drizzle_orm_1.like)(schema_1.crmLeads.rut, `%${search}%`)));
        }
        if (status) {
            query = query.where((0, drizzle_orm_1.eq)(schema_1.crmLeads.status, String(status)));
        }
        if (pipelineStage) {
            query = query.where((0, drizzle_orm_1.eq)(schema_1.crmLeads.pipelineStage, String(pipelineStage)));
        }
        // Obtener total de registros para paginación
        const [{ count }] = await db_1.db
            .select({ count: db_1.db.fn.count() })
            .from(schema_1.crmLeads);
        // Ejecutar consulta paginada
        const leads = await query
            .orderBy((0, drizzle_orm_1.desc)(schema_1.crmLeads.updatedAt))
            .limit(Number(limit))
            .offset(offset);
        res.json({
            leads,
            pagination: {
                total: Number(count),
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(Number(count) / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Error al obtener leads:', error);
        res.status(500).json({ error: 'Error al obtener leads' });
    }
});
integrationRouter.get('/crm/leads/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Obtener lead
        const [lead] = await db_1.db
            .select()
            .from(schema_1.crmLeads)
            .where((0, drizzle_orm_1.eq)(schema_1.crmLeads.id, parseInt(id)))
            .limit(1);
        if (!lead) {
            return res.status(404).json({ error: 'Lead no encontrado' });
        }
        // Obtener mensajes asociados al lead
        const messages = await db_1.db
            .select()
            .from(schema_1.whatsappMessages)
            .where((0, drizzle_orm_1.eq)(schema_1.whatsappMessages.leadId, lead.id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.whatsappMessages.sentAt));
        // Obtener sesiones de Dialogflow asociadas
        const sessions = await db_1.db
            .select()
            .from(schema_1.dialogflowSessions)
            .where((0, drizzle_orm_1.eq)(schema_1.dialogflowSessions.leadId, lead.id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.dialogflowSessions.updatedAt));
        res.json({
            lead,
            messages,
            sessions
        });
    }
    catch (error) {
        console.error('Error al obtener detalle del lead:', error);
        res.status(500).json({ error: 'Error al obtener detalle del lead' });
    }
});
integrationRouter.patch('/crm/leads/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, phone, rut, documentType, status, pipelineStage, assignedToUserId, notes } = req.body;
        // Actualizar lead
        const [lead] = await db_1.db
            .update(schema_1.crmLeads)
            .set({
            fullName,
            email,
            phone,
            rut,
            documentType,
            status,
            pipelineStage,
            assignedToUserId: assignedToUserId || null,
            notes,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.crmLeads.id, parseInt(id)))
            .returning();
        if (!lead) {
            return res.status(404).json({ error: 'Lead no encontrado' });
        }
        // Sincronizar con CRM externo
        if (lead.crmExternalId) {
            await crm_service_1.crmService.updateLead(lead);
        }
        res.json(lead);
    }
    catch (error) {
        console.error('Error al actualizar lead:', error);
        res.status(500).json({ error: 'Error al actualizar lead' });
    }
});
// WhatsApp - Gestión de mensajes
integrationRouter.get('/whatsapp/messages', async (req, res) => {
    try {
        const { search, direction, status, page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        // Construir la consulta
        let query = db_1.db.select().from(schema_1.whatsappMessages);
        // Aplicar filtros
        if (search) {
            query = query.where(or((0, drizzle_orm_1.like)(schema_1.whatsappMessages.phoneNumber, `%${search}%`), (0, drizzle_orm_1.like)(schema_1.whatsappMessages.content, `%${search}%`)));
        }
        if (direction) {
            query = query.where((0, drizzle_orm_1.eq)(schema_1.whatsappMessages.direction, String(direction)));
        }
        if (status) {
            query = query.where((0, drizzle_orm_1.eq)(schema_1.whatsappMessages.status, String(status)));
        }
        // Obtener total de registros para paginación
        const [{ count }] = await db_1.db
            .select({ count: db_1.db.fn.count() })
            .from(schema_1.whatsappMessages);
        // Ejecutar consulta paginada
        const messages = await query
            .orderBy((0, drizzle_orm_1.desc)(schema_1.whatsappMessages.sentAt))
            .limit(Number(limit))
            .offset(offset);
        res.json({
            messages,
            pagination: {
                total: Number(count),
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(Number(count) / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Error al obtener mensajes:', error);
        res.status(500).json({ error: 'Error al obtener mensajes' });
    }
});
integrationRouter.post('/whatsapp/send', async (req, res) => {
    try {
        const { phoneNumber, content, templateName, parameters, leadId } = req.body;
        // Validar datos obligatorios
        if ((!content && !templateName) || !phoneNumber) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }
        let messageId = null;
        // Enviar mensaje según tipo
        if (templateName) {
            // Enviar mensaje de plantilla
            messageId = await whatsapp_service_1.whatsappService.sendTemplateMessage(phoneNumber, templateName, parameters || {});
        }
        else {
            // Enviar mensaje de texto
            const [message] = await db_1.db
                .insert(schema_1.whatsappMessages)
                .values({
                leadId: leadId || null,
                direction: 'outgoing',
                phoneNumber,
                messageType: 'text',
                content,
                status: 'pending',
                sentAt: new Date()
            })
                .returning();
            // Enviar a través del servicio de WhatsApp
            messageId = await whatsapp_service_1.whatsappService.sendMessage(message);
            // Actualizar status y ID externo
            if (messageId) {
                await db_1.db
                    .update(schema_1.whatsappMessages)
                    .set({
                    externalMessageId: messageId,
                    status: 'sent'
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.whatsappMessages.id, message.id));
            }
        }
        res.json({
            success: !!messageId,
            messageId,
            phoneNumber
        });
    }
    catch (error) {
        console.error('Error al enviar mensaje de WhatsApp:', error);
        res.status(500).json({ error: 'Error al enviar mensaje' });
    }
});
// Dialogflow - Gestión de sesiones
integrationRouter.get('/dialogflow/sessions', async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        // Construir la consulta
        let query = db_1.db.select().from(schema_1.dialogflowSessions);
        // Aplicar filtros
        if (status) {
            query = query.where((0, drizzle_orm_1.eq)(schema_1.dialogflowSessions.status, String(status)));
        }
        // Obtener total de registros para paginación
        const [{ count }] = await db_1.db
            .select({ count: db_1.db.fn.count() })
            .from(schema_1.dialogflowSessions);
        // Ejecutar consulta paginada
        const sessions = await query
            .orderBy((0, drizzle_orm_1.desc)(schema_1.dialogflowSessions.lastInteractionAt))
            .limit(Number(limit))
            .offset(offset);
        res.json({
            sessions,
            pagination: {
                total: Number(count),
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(Number(count) / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Error al obtener sesiones de Dialogflow:', error);
        res.status(500).json({ error: 'Error al obtener sesiones' });
    }
});
integrationRouter.get('/dialogflow/sessions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Obtener sesión
        const [session] = await db_1.db
            .select()
            .from(schema_1.dialogflowSessions)
            .where((0, drizzle_orm_1.eq)(schema_1.dialogflowSessions.id, parseInt(id)))
            .limit(1);
        if (!session) {
            return res.status(404).json({ error: 'Sesión no encontrada' });
        }
        // Obtener mensajes asociados
        let messages = [];
        if (session.leadId) {
            messages = await db_1.db
                .select()
                .from(schema_1.whatsappMessages)
                .where((0, drizzle_orm_1.eq)(schema_1.whatsappMessages.leadId, session.leadId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.whatsappMessages.sentAt));
        }
        res.json({
            session,
            messages
        });
    }
    catch (error) {
        console.error('Error al obtener detalle de sesión:', error);
        res.status(500).json({ error: 'Error al obtener detalle de sesión' });
    }
});
integrationRouter.patch('/dialogflow/sessions/:id/transfer', async (req, res) => {
    try {
        const { id } = req.params;
        const { transferredToUserId } = req.body;
        // Actualizar sesión
        const [session] = await db_1.db
            .update(schema_1.dialogflowSessions)
            .set({
            status: 'transferred',
            transferredToUserId: transferredToUserId || null,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.dialogflowSessions.id, parseInt(id)))
            .returning();
        if (!session) {
            return res.status(404).json({ error: 'Sesión no encontrada' });
        }
        // Actualizar lead si existe
        if (session.leadId) {
            await db_1.db
                .update(schema_1.crmLeads)
                .set({
                assignedToUserId: transferredToUserId || null,
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_1.crmLeads.id, session.leadId));
        }
        res.json(session);
    }
    catch (error) {
        console.error('Error al transferir sesión:', error);
        res.status(500).json({ error: 'Error al transferir sesión' });
    }
});
exports.default = integrationRouter;
