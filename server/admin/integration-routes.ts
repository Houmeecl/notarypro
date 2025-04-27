import express, { Request, Response } from 'express';
import { requireAdmin } from './admin-middleware';
import { db } from '../db';
import { eq, desc, and, like } from 'drizzle-orm';
import { 
  crmLeads, whatsappMessages, dialogflowSessions
} from '@shared/schema';
import { crmService } from '../services/crm-service';
import { whatsappService } from '../services/whatsapp-service';
import { dialogflowService } from '../services/dialogflow-service';

const integrationRouter = express.Router();

// Asegurar que todas las rutas requieren autenticación de administrador
integrationRouter.use(requireAdmin);

// CRM - Gestión de leads
integrationRouter.get('/crm/leads', async (req: Request, res: Response) => {
  try {
    const { 
      search, status, pipelineStage, page = 1, limit = 20 
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    // Construir la consulta
    let query = db.select().from(crmLeads);
    
    // Aplicar filtros
    if (search) {
      query = query.where(
        or(
          like(crmLeads.fullName, `%${search}%`),
          like(crmLeads.email, `%${search}%`),
          like(crmLeads.phone, `%${search}%`),
          like(crmLeads.rut, `%${search}%`)
        )
      );
    }
    
    if (status) {
      query = query.where(eq(crmLeads.status, String(status)));
    }
    
    if (pipelineStage) {
      query = query.where(eq(crmLeads.pipelineStage, String(pipelineStage)));
    }
    
    // Obtener total de registros para paginación
    const [{ count }] = await db
      .select({ count: db.fn.count() })
      .from(crmLeads);
    
    // Ejecutar consulta paginada
    const leads = await query
      .orderBy(desc(crmLeads.updatedAt))
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
  } catch (error) {
    console.error('Error al obtener leads:', error);
    res.status(500).json({ error: 'Error al obtener leads' });
  }
});

integrationRouter.get('/crm/leads/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Obtener lead
    const [lead] = await db
      .select()
      .from(crmLeads)
      .where(eq(crmLeads.id, parseInt(id)))
      .limit(1);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead no encontrado' });
    }
    
    // Obtener mensajes asociados al lead
    const messages = await db
      .select()
      .from(whatsappMessages)
      .where(eq(whatsappMessages.leadId, lead.id))
      .orderBy(desc(whatsappMessages.sentAt));
    
    // Obtener sesiones de Dialogflow asociadas
    const sessions = await db
      .select()
      .from(dialogflowSessions)
      .where(eq(dialogflowSessions.leadId, lead.id))
      .orderBy(desc(dialogflowSessions.updatedAt));
    
    res.json({
      lead,
      messages,
      sessions
    });
  } catch (error) {
    console.error('Error al obtener detalle del lead:', error);
    res.status(500).json({ error: 'Error al obtener detalle del lead' });
  }
});

integrationRouter.patch('/crm/leads/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      email,
      phone,
      rut,
      documentType,
      status,
      pipelineStage,
      assignedToUserId,
      notes
    } = req.body;
    
    // Actualizar lead
    const [lead] = await db
      .update(crmLeads)
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
      .where(eq(crmLeads.id, parseInt(id)))
      .returning();
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead no encontrado' });
    }
    
    // Sincronizar con CRM externo
    if (lead.crmExternalId) {
      await crmService.updateLead(lead);
    }
    
    res.json(lead);
  } catch (error) {
    console.error('Error al actualizar lead:', error);
    res.status(500).json({ error: 'Error al actualizar lead' });
  }
});

// WhatsApp - Gestión de mensajes
integrationRouter.get('/whatsapp/messages', async (req: Request, res: Response) => {
  try {
    const { 
      search, direction, status, page = 1, limit = 20 
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    // Construir la consulta
    let query = db.select().from(whatsappMessages);
    
    // Aplicar filtros
    if (search) {
      query = query.where(
        or(
          like(whatsappMessages.phoneNumber, `%${search}%`),
          like(whatsappMessages.content, `%${search}%`)
        )
      );
    }
    
    if (direction) {
      query = query.where(eq(whatsappMessages.direction, String(direction)));
    }
    
    if (status) {
      query = query.where(eq(whatsappMessages.status, String(status)));
    }
    
    // Obtener total de registros para paginación
    const [{ count }] = await db
      .select({ count: db.fn.count() })
      .from(whatsappMessages);
    
    // Ejecutar consulta paginada
    const messages = await query
      .orderBy(desc(whatsappMessages.sentAt))
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
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

integrationRouter.post('/whatsapp/send', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, content, templateName, parameters, leadId } = req.body;
    
    // Validar datos obligatorios
    if ((!content && !templateName) || !phoneNumber) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    let messageId: string | null = null;
    
    // Enviar mensaje según tipo
    if (templateName) {
      // Enviar mensaje de plantilla
      messageId = await whatsappService.sendTemplateMessage(
        phoneNumber,
        templateName,
        parameters || {}
      );
    } else {
      // Enviar mensaje de texto
      const [message] = await db
        .insert(whatsappMessages)
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
      messageId = await whatsappService.sendMessage(message);
      
      // Actualizar status y ID externo
      if (messageId) {
        await db
          .update(whatsappMessages)
          .set({
            externalMessageId: messageId,
            status: 'sent'
          })
          .where(eq(whatsappMessages.id, message.id));
      }
    }
    
    res.json({
      success: !!messageId,
      messageId,
      phoneNumber
    });
  } catch (error) {
    console.error('Error al enviar mensaje de WhatsApp:', error);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
});

// Dialogflow - Gestión de sesiones
integrationRouter.get('/dialogflow/sessions', async (req: Request, res: Response) => {
  try {
    const { 
      status, page = 1, limit = 20 
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    // Construir la consulta
    let query = db.select().from(dialogflowSessions);
    
    // Aplicar filtros
    if (status) {
      query = query.where(eq(dialogflowSessions.status, String(status)));
    }
    
    // Obtener total de registros para paginación
    const [{ count }] = await db
      .select({ count: db.fn.count() })
      .from(dialogflowSessions);
    
    // Ejecutar consulta paginada
    const sessions = await query
      .orderBy(desc(dialogflowSessions.lastInteractionAt))
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
  } catch (error) {
    console.error('Error al obtener sesiones de Dialogflow:', error);
    res.status(500).json({ error: 'Error al obtener sesiones' });
  }
});

integrationRouter.get('/dialogflow/sessions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Obtener sesión
    const [session] = await db
      .select()
      .from(dialogflowSessions)
      .where(eq(dialogflowSessions.id, parseInt(id)))
      .limit(1);
    
    if (!session) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }
    
    // Obtener mensajes asociados
    let messages = [];
    if (session.leadId) {
      messages = await db
        .select()
        .from(whatsappMessages)
        .where(eq(whatsappMessages.leadId, session.leadId))
        .orderBy(desc(whatsappMessages.sentAt));
    }
    
    res.json({
      session,
      messages
    });
  } catch (error) {
    console.error('Error al obtener detalle de sesión:', error);
    res.status(500).json({ error: 'Error al obtener detalle de sesión' });
  }
});

integrationRouter.patch('/dialogflow/sessions/:id/transfer', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { transferredToUserId } = req.body;
    
    // Actualizar sesión
    const [session] = await db
      .update(dialogflowSessions)
      .set({
        status: 'transferred',
        transferredToUserId: transferredToUserId || null,
        updatedAt: new Date()
      })
      .where(eq(dialogflowSessions.id, parseInt(id)))
      .returning();
    
    if (!session) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }
    
    // Actualizar lead si existe
    if (session.leadId) {
      await db
        .update(crmLeads)
        .set({
          assignedToUserId: transferredToUserId || null,
          updatedAt: new Date()
        })
        .where(eq(crmLeads.id, session.leadId));
    }
    
    res.json(session);
  } catch (error) {
    console.error('Error al transferir sesión:', error);
    res.status(500).json({ error: 'Error al transferir sesión' });
  }
});

export default integrationRouter;