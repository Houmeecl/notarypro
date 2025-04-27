import express, { Request, Response } from 'express';
import { requireAdmin, requireSuperAdmin } from './admin-middleware';
import { db } from '../db';
import { eq, desc } from 'drizzle-orm';
import { 
  users, messageTemplates, automationRules, crmLeads, 
  whatsappMessages, dialogflowSessions
} from '@shared/schema';
import { createSuperAdmin } from './seed-admin';

const adminRouter = express.Router();

// Asegurar que todas las rutas requieren autenticación de administrador
adminRouter.use(requireAdmin);

// Dashboard de administración - Estadísticas generales
adminRouter.get('/dashboard', async (req: Request, res: Response) => {
  try {
    // Obtener estadísticas básicas
    const [
      leadsCount,
      messagesCount,
      dialogflowSessionsCount,
      templatesCount,
      rulesCount
    ] = await Promise.all([
      db.select({ count: db.fn.count() }).from(crmLeads),
      db.select({ count: db.fn.count() }).from(whatsappMessages),
      db.select({ count: db.fn.count() }).from(dialogflowSessions),
      db.select({ count: db.fn.count() }).from(messageTemplates),
      db.select({ count: db.fn.count() }).from(automationRules)
    ]);

    // Obtener distribución de leads por etapa
    const leadsByStage = await db
      .select({
        stage: crmLeads.pipelineStage,
        count: db.fn.count()
      })
      .from(crmLeads)
      .groupBy(crmLeads.pipelineStage);

    // Obtener últimos mensajes de WhatsApp
    const recentMessages = await db
      .select()
      .from(whatsappMessages)
      .orderBy(desc(whatsappMessages.sentAt))
      .limit(5);

    res.json({
      stats: {
        leads: leadsCount[0]?.count || 0,
        messages: messagesCount[0]?.count || 0,
        dialogflowSessions: dialogflowSessionsCount[0]?.count || 0,
        templates: templatesCount[0]?.count || 0,
        rules: rulesCount[0]?.count || 0
      },
      leadsByStage,
      recentMessages
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Gestión de usuarios - Solo super admin
adminRouter.get('/users', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const usersList = await db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    res.json(usersList);
  } catch (error) {
    console.error('Error al obtener lista de usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Actualizar rol de usuario - Solo super admin
adminRouter.patch('/users/:id/role', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validar el rol
    if (!['user', 'certifier', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rol no válido' });
    }

    // Actualizar el rol
    const [updatedUser] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, parseInt(id)))
      .returning();

    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      id: updatedUser.id,
      username: updatedUser.username,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error) {
    console.error('Error al actualizar rol de usuario:', error);
    res.status(500).json({ error: 'Error al actualizar rol' });
  }
});

// Gestión de plantillas de mensajes
adminRouter.get('/message-templates', async (req: Request, res: Response) => {
  try {
    const templates = await db
      .select()
      .from(messageTemplates)
      .orderBy(desc(messageTemplates.updatedAt));

    res.json(templates);
  } catch (error) {
    console.error('Error al obtener plantillas de mensajes:', error);
    res.status(500).json({ error: 'Error al obtener plantillas' });
  }
});

adminRouter.post('/message-templates', async (req: Request, res: Response) => {
  try {
    const {
      name,
      category,
      content,
      variables,
      isWhatsappTemplate,
      whatsappTemplateNamespace,
      whatsappTemplateElementName
    } = req.body;

    // Validar datos obligatorios
    if (!name || !category || !content) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Crear plantilla
    const [template] = await db
      .insert(messageTemplates)
      .values({
        name,
        category,
        content,
        variables: variables || {},
        isWhatsappTemplate: isWhatsappTemplate || false,
        whatsappTemplateNamespace,
        whatsappTemplateElementName,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    res.status(201).json(template);
  } catch (error) {
    console.error('Error al crear plantilla:', error);
    res.status(500).json({ error: 'Error al crear plantilla' });
  }
});

adminRouter.patch('/message-templates/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      content,
      variables,
      isWhatsappTemplate,
      whatsappTemplateNamespace,
      whatsappTemplateElementName,
      isActive
    } = req.body;

    // Actualizar plantilla
    const [template] = await db
      .update(messageTemplates)
      .set({
        name,
        category,
        content,
        variables: variables || undefined,
        isWhatsappTemplate: isWhatsappTemplate !== undefined ? isWhatsappTemplate : undefined,
        whatsappTemplateNamespace,
        whatsappTemplateElementName,
        isActive: isActive !== undefined ? isActive : undefined,
        updatedAt: new Date()
      })
      .where(eq(messageTemplates.id, parseInt(id)))
      .returning();

    if (!template) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error al actualizar plantilla:', error);
    res.status(500).json({ error: 'Error al actualizar plantilla' });
  }
});

// Gestión de reglas de automatización
adminRouter.get('/automation-rules', async (req: Request, res: Response) => {
  try {
    const rules = await db
      .select()
      .from(automationRules)
      .orderBy(desc(automationRules.updatedAt));

    res.json(rules);
  } catch (error) {
    console.error('Error al obtener reglas de automatización:', error);
    res.status(500).json({ error: 'Error al obtener reglas' });
  }
});

adminRouter.post('/automation-rules', async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      triggerType,
      triggerEvent,
      triggerSchedule,
      triggerCondition,
      actionType,
      actionConfig,
      isActive
    } = req.body;

    // Validar datos obligatorios
    if (!name || !triggerType || !actionType || !actionConfig) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Crear regla
    const [rule] = await db
      .insert(automationRules)
      .values({
        name,
        description,
        triggerType,
        triggerEvent,
        triggerSchedule,
        triggerCondition,
        actionType,
        actionConfig,
        isActive: isActive !== undefined ? isActive : true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    res.status(201).json(rule);
  } catch (error) {
    console.error('Error al crear regla de automatización:', error);
    res.status(500).json({ error: 'Error al crear regla' });
  }
});

adminRouter.patch('/automation-rules/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      triggerType,
      triggerEvent,
      triggerSchedule,
      triggerCondition,
      actionType,
      actionConfig,
      isActive
    } = req.body;

    // Actualizar regla
    const [rule] = await db
      .update(automationRules)
      .set({
        name,
        description,
        triggerType,
        triggerEvent,
        triggerSchedule,
        triggerCondition,
        actionType,
        actionConfig,
        isActive: isActive !== undefined ? isActive : undefined,
        updatedAt: new Date()
      })
      .where(eq(automationRules.id, parseInt(id)))
      .returning();

    if (!rule) {
      return res.status(404).json({ error: 'Regla no encontrada' });
    }

    res.json(rule);
  } catch (error) {
    console.error('Error al actualizar regla:', error);
    res.status(500).json({ error: 'Error al actualizar regla' });
  }
});

// Inicializar super admin
adminRouter.post('/initialize-admin', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    await createSuperAdmin();
    res.json({ success: true, message: 'Administrador inicializado correctamente' });
  } catch (error) {
    console.error('Error al inicializar administrador:', error);
    res.status(500).json({ error: 'Error al inicializar administrador' });
  }
});

export default adminRouter;