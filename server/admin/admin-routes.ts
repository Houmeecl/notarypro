import express, { Request, Response } from 'express';
import { requireAdmin, requireSuperAdmin } from './admin-middleware';
import { db } from '../db';
import { eq, desc, and, gte, lte, like } from 'drizzle-orm';
import { 
  users, messageTemplates, automationRules, crmLeads, 
  whatsappMessages, dialogflowSessions, documents, identityVerifications
} from '@shared/schema';
import { createSuperAdmin } from './seed-admin';
import { format, subDays, subMonths, startOfDay, endOfDay, parseISO } from 'date-fns';

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

/************************************
 * PANEL MAESTRO - NUEVAS RUTAS
 ************************************/

// Panel Maestro - Dashboard
adminRouter.get('/master-dashboard', async (req: Request, res: Response) => {
  try {
    // Obtener estadísticas de documentos
    const [totalDocumentsResult, documentsLastMonthResult] = await Promise.all([
      db.select({ count: db.fn.count() }).from(documents),
      db.select({ count: db.fn.count() }).from(documents)
        .where(gte(documents.createdAt, subMonths(new Date(), 1)))
    ]);

    const totalDocuments = Number(totalDocumentsResult[0]?.count || 0);
    const documentsLastMonth = Number(documentsLastMonthResult[0]?.count || 0);

    // Calcular crecimiento de documentos (si no hay datos del mes anterior, asumimos 0%)
    const documentsGrowth = documentsLastMonth > 0 
      ? Math.round((documentsLastMonth / (totalDocuments - documentsLastMonth) - 1) * 100) 
      : 0;

    // Obtener estadísticas de usuarios
    const [totalUsersResult, newUsersLastMonthResult] = await Promise.all([
      db.select({ count: db.fn.count() }).from(users),
      db.select({ count: db.fn.count() }).from(users)
        .where(gte(users.createdAt, subMonths(new Date(), 1)))
    ]);

    const totalUsers = Number(totalUsersResult[0]?.count || 0);
    const newUsersLastMonth = Number(newUsersLastMonthResult[0]?.count || 0);

    // Calcular crecimiento de usuarios
    const usersGrowth = newUsersLastMonth > 0 
      ? Math.round((newUsersLastMonth / (totalUsers - newUsersLastMonth) - 1) * 100) 
      : 0;

    // Obtener documentos por estado
    const documentsByStatusQuery = await db
      .select({
        status: documents.status,
        count: db.fn.count()
      })
      .from(documents)
      .groupBy(documents.status);

    // Transformar a formato esperado por el frontend
    const documentsByStatus = {
      pending: 0,
      signed: 0,
      certified: 0,
      canceled: 0
    };

    documentsByStatusQuery.forEach(item => {
      switch(item.status) {
        case 'pendiente': documentsByStatus.pending = Number(item.count); break;
        case 'firmado': documentsByStatus.signed = Number(item.count); break;
        case 'certificado': documentsByStatus.certified = Number(item.count); break;
        case 'anulado': documentsByStatus.canceled = Number(item.count); break;
      }
    });

    // Generar datos para gráficos de ingresos y usuarios nuevos
    // En un caso real, estos vendrían de la base de datos
    const today = new Date();
    const revenueChart = [];
    const newUsersChart = [];
    
    for (let i = 6; i >= 0; i--) {
      const day = subDays(today, i);
      const dayName = format(day, 'EEE').substring(0, 3);
      
      revenueChart.push({
        name: dayName,
        value: Math.floor(Math.random() * 3000000) + 1000000 // Simular ingresos
      });
      
      newUsersChart.push({
        name: dayName,
        value: Math.floor(Math.random() * 20) + 5 // Simular usuarios nuevos
      });
    }

    // Obtener documentos pendientes
    const pendingDocuments = await db
      .select({
        id: documents.id,
        title: documents.title,
        status: documents.status,
        createdAt: documents.createdAt
      })
      .from(documents)
      .where(eq(documents.status, 'pendiente'))
      .orderBy(desc(documents.createdAt))
      .limit(5);

    // Estado del sistema (en un caso real, se verificaría realmente)
    const systemStatus = {
      server: 'online',
      database: 'online',
      qrGenerator: 'online',
      aiService: 'online'
    };

    // Datos financieros simulados
    const financialData = {
      totalRevenue: 125000000,
      revenueGrowth: 12,
      conversionRate: 65,
      conversionGrowth: 5,
      revenueThisMonth: 18500000,
      monthlyRevenueGrowth: 8,
      averageTransactionValue: 85000,
      averageTransactionGrowth: 2,
      transactionsThisMonth: 220,
      transactionsGrowth: 5
    };

    // Construir y enviar respuesta
    const dashboardData = {
      // KPIs
      totalDocuments,
      documentsGrowth,
      totalUsers,
      usersGrowth,
      totalRevenue: financialData.totalRevenue,
      revenueGrowth: financialData.revenueGrowth,
      conversionRate: financialData.conversionRate,
      conversionGrowth: financialData.conversionGrowth,
      
      // Estado del sistema
      systemStatus,
      
      // Alertas (simuladas - en un caso real vendrían de la base de datos)
      alerts: [
        {
          title: "Certificador inactivo",
          description: "El certificador Juan Pérez lleva más de 14 días sin actividad",
          time: "Hace 2 horas"
        },
        {
          title: "Documentos expirados",
          description: "Hay 5 documentos con códigos QR expirados",
          time: "Hace 4 horas"
        }
      ],
      
      // Documentos pendientes
      pendingDocuments,
      
      // Datos para gráficos
      documentsByStatus,
      revenueChart,
      newUsersChart,
      
      // Datos financieros
      revenueThisMonth: financialData.revenueThisMonth,
      monthlyRevenueGrowth: financialData.monthlyRevenueGrowth,
      averageTransactionValue: financialData.averageTransactionValue,
      averageTransactionGrowth: financialData.averageTransactionGrowth,
      transactionsThisMonth: financialData.transactionsThisMonth,
      transactionsGrowth: financialData.transactionsGrowth,
      
      // Métodos de pago (simulados)
      paymentMethods: [
        { name: "WebPay", transactions: 150, amount: 12750000, percentage: 68 },
        { name: "MercadoPago", transactions: 48, amount: 4080000, percentage: 22 },
        { name: "Transferencia", transactions: 22, amount: 1870000, percentage: 10 }
      ],
      
      // Informes recientes (simulados)
      recentReports: [
        { title: "Informe Diario - 27/04/2025", date: "27 Abr 2025, 08:00" },
        { title: "Informe Semanal - Semana 17", date: "26 Abr 2025, 09:00" },
        { title: "Informe Mensual - Marzo 2025", date: "01 Abr 2025, 10:00" },
        { title: "Reporte de Ventas - Q1 2025", date: "05 Abr 2025, 11:30" }
      ],
      
      // Usuarios activos (estimado)
      activeUsers: Math.floor(totalUsers * 0.6)
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error("Error obteniendo datos del dashboard:", error);
    res.status(500).json({ error: "Error al obtener los datos del dashboard" });
  }
});

// Panel Maestro - Estado del sistema
adminRouter.get('/system-status', async (req: Request, res: Response) => {
  try {
    // En una implementación real, se verificaría cada componente
    const systemStatus = {
      server: 'online',
      database: 'online',
      qrGenerator: 'online',
      aiService: 'online'
    };
    
    res.json(systemStatus);
  } catch (error) {
    console.error("Error obteniendo estado del sistema:", error);
    res.status(500).json({ error: "Error al obtener el estado del sistema" });
  }
});

// Panel Maestro - Gestión de documentos
adminRouter.get('/documents', async (req: Request, res: Response) => {
  try {
    const { status, date, type, search } = req.query;
    
    // Construir consulta base
    let query = db.select({
      id: documents.id,
      title: documents.title,
      fileName: documents.filePath,
      status: documents.status,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt,
      userId: documents.userId,
      certifierId: documents.certifierId
    })
    .from(documents)
    .orderBy(desc(documents.createdAt));
    
    // Aplicar filtros si existen
    const conditions = [];
    
    if (status && status !== 'all') {
      conditions.push(eq(documents.status, status as string));
    }
    
    if (date) {
      let dateFilter;
      const today = new Date();
      
      switch(date) {
        case 'today':
          dateFilter = and(
            gte(documents.createdAt, startOfDay(today)),
            lte(documents.createdAt, endOfDay(today))
          );
          break;
        case 'yesterday':
          const yesterday = subDays(today, 1);
          dateFilter = and(
            gte(documents.createdAt, startOfDay(yesterday)),
            lte(documents.createdAt, endOfDay(yesterday))
          );
          break;
        case 'week':
          dateFilter = gte(documents.createdAt, subDays(today, 7));
          break;
        case 'month':
          dateFilter = gte(documents.createdAt, subMonths(today, 1));
          break;
        case 'year':
          dateFilter = gte(documents.createdAt, subMonths(today, 12));
          break;
      }
      
      if (dateFilter) {
        conditions.push(dateFilter);
      }
    }
    
    if (type) {
      conditions.push(eq(documents.documentType, type as string));
    }
    
    if (search) {
      conditions.push(like(documents.title, `%${search}%`));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Ejecutar consulta
    const docs = await query;
    
    // Obtener usuarios y certificadores relacionados
    const userIds = [...new Set(docs.map(doc => doc.userId))];
    const certifierIds = [...new Set(docs.filter(doc => doc.certifierId).map(doc => doc.certifierId!))];
    
    // Obtener información de usuarios
    const usersList = userIds.length > 0 
      ? await db.select().from(users).where(
          userIds.length === 1 
            ? eq(users.id, userIds[0]) 
            : inArray(users.id, userIds)
        )
      : [];
    
    // Obtener información de certificadores
    const certifiersList = certifierIds.length > 0 
      ? await db.select().from(users).where(
          certifierIds.length === 1 
            ? eq(users.id, certifierIds[0]) 
            : inArray(users.id, certifierIds)
        )
      : [];
    
    // Mapear usuarios y certificadores a documentos
    const documentsWithDetails = docs.map(doc => {
      const user = usersList.find(u => u.id === doc.userId);
      const certifier = doc.certifierId ? certifiersList.find(c => c.id === doc.certifierId) : null;
      
      return {
        ...doc,
        userName: user?.fullName || 'Usuario Desconocido',
        userEmail: user?.email || 'email@desconocido.com',
        certifierName: certifier?.fullName,
        verificationCode: `VC-${doc.id}-${Math.floor(Math.random() * 900000) + 100000}`,
        documentType: doc.documentType || 'general',
        fileSize: Math.floor(Math.random() * 5000000) + 500000 // Tamaño simulado entre 500KB y 5MB
      };
    });
    
    res.json(documentsWithDetails);
  } catch (error) {
    console.error("Error obteniendo documentos:", error);
    res.status(500).json({ error: "Error al obtener los documentos" });
  }
});

// Panel Maestro - Gestión de certificadores
adminRouter.get('/certifiers', async (req: Request, res: Response) => {
  try {
    const { status, region } = req.query;
    
    // Obtener certificadores (usuarios con rol 'certifier')
    let query = db.select().from(users).where(eq(users.role, 'certifier'));
    
    // Aplicar filtros si existen
    if (status && status !== 'all') {
      query = query.where(eq(users.isActive, status === 'active'));
    }
    
    // Para el filtro por región, en un caso real tendríamos un campo de región en la tabla
    // En esta implementación de demostración, lo simularemos
    
    const certifiersList = await query;
    
    // Enriquecer los datos con información simulada para el panel de administración
    const certifiersWithDetails = certifiersList.map(certifier => {
      // Generar datos simulados para demostración
      const documentsProcessed = Math.floor(Math.random() * 100) + 10;
      const commissionRate = Math.floor(Math.random() * 5) + 3; // Entre 3% y 8%
      const commission = documentsProcessed * 25000; // 25.000 por documento
      const pendingPayment = Math.floor(commission * 0.4); // 40% pendiente de pago
      
      // Regiones simuladas
      const allRegions = ['RM', 'V', 'VIII', 'IX', 'X'];
      const regionsCount = Math.floor(Math.random() * 3) + 1;
      const regions = [];
      
      for (let i = 0; i < regionsCount; i++) {
        const randomIndex = Math.floor(Math.random() * allRegions.length);
        regions.push(allRegions[randomIndex]);
        allRegions.splice(randomIndex, 1);
      }
      
      // Filtrar por región si se especifica
      if (region && !regions.includes(region as string)) {
        return null;
      }
      
      // Especializaciones simuladas
      const allSpecializations = ['contracts', 'real_estate', 'corporate', 'financial', 'legal', 'personal'];
      const specializationsCount = Math.floor(Math.random() * 4) + 1;
      const specializations = [];
      
      for (let i = 0; i < specializationsCount; i++) {
        const randomIndex = Math.floor(Math.random() * allSpecializations.length);
        specializations.push(allSpecializations[randomIndex]);
        allSpecializations.splice(randomIndex, 1);
      }
      
      // Mapear estado activo a formato esperado por el frontend
      let status = 'inactive';
      if (certifier.isActive) {
        status = 'active';
      } else {
        // Simular que algunos inactivos están suspendidos
        status = Math.random() > 0.5 ? 'inactive' : 'suspended';
      }
      
      // Nivel de certificación simulado
      const certificationLevels = ['basic', 'advanced', 'expert'];
      const certificationLevel = certificationLevels[Math.floor(Math.random() * certificationLevels.length)];
      
      return {
        id: certifier.id,
        name: certifier.fullName || certifier.username,
        email: certifier.email,
        phone: certifier.phone || '+56 9 1234 5678', // Simulado
        status,
        documentsProcessed,
        commission,
        createdAt: certifier.createdAt,
        lastActivity: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Hasta 30 días atrás
        certificationLevel,
        regions,
        specializations,
        commissionRate,
        pendingPayment
      };
    });
    
    // Filtrar certificadores nulos (filtrados por región)
    const filteredCertifiers = certifiersWithDetails.filter(c => c !== null);
    
    res.json(filteredCertifiers);
  } catch (error) {
    console.error("Error obteniendo certificadores:", error);
    res.status(500).json({ error: "Error al obtener los certificadores" });
  }
});

// Panel Maestro - Análisis de IA
adminRouter.get('/ai-analysis', async (req: Request, res: Response) => {
  try {
    // Importar el servicio de OpenAI
    const { openaiService } = await import('../services/openai-service');
    
    const { type = 'business' } = req.query;
    
    // Obtener datos relevantes para el análisis
    // En un caso real, estos datos vendrían de consultas a la base de datos
    const operationalData = await getOperationalData(type as string);
    
    // Verificar si hay un análisis guardado en caché
    // Por limitaciones de esta demo, no implementamos almacenamiento persistente para análisis
    
    // Generar análisis usando OpenAI (o usar datos de ejemplo para demostraciones)
    let analysisData;
    try {
      // Intentar generar un análisis real con OpenAI
      analysisData = await openaiService.generateStrategicAnalysis(
        type as string,
        operationalData,
        { model: "gpt-4o" }
      );
      
      // Enriquecer el análisis con datos adicionales específicos al tipo
      if (type === 'expansion') {
        analysisData.expansionOpportunities = {
          regions: [
            { name: 'Valparaíso', score: 87 },
            { name: 'Biobío', score: 76 },
            { name: 'Metropolitana', score: 72 },
            { name: 'Maule', score: 65 },
            { name: 'Araucanía', score: 58 }
          ],
          demandByRegion: [
            { name: 'RM', value: 550 },
            { name: 'V', value: 320 },
            { name: 'VI', value: 180 },
            { name: 'VII', value: 150 },
            { name: 'VIII', value: 280 }
          ]
        };
      }
      
      if (type === 'pricing') {
        analysisData.pricingAnalysis = [
          { price: 25000, revenue: 12500000, conversion: 8.5 },
          { price: 30000, revenue: 15000000, conversion: 7.2 },
          { price: 35000, revenue: 17500000, conversion: 6.5 },
          { price: 40000, revenue: 18000000, conversion: 5.1 },
          { price: 45000, revenue: 16200000, conversion: 4.2 },
          { price: 50000, revenue: 15000000, conversion: 3.3 }
        ];
      }
      
      if (type === 'marketing') {
        if (!analysisData.marketingAnalysis) {
          analysisData.marketingAnalysis = {
            targetAudiences: [
              { name: 'PyMEs', description: 'Pequeñas y medianas empresas con necesidades regulares de documentación legal', potential: 85 },
              { name: 'Inmobiliarias', description: 'Empresas del sector inmobiliario con alta necesidad de certificación', potential: 78 },
              { name: 'Profesionales Independientes', description: 'Abogados, contadores y consultores que requieren certificar documentos', potential: 72 },
              { name: 'Particulares', description: 'Personas físicas con necesidades puntuales de certificación', potential: 58 }
            ],
            channels: [
              { name: 'LinkedIn', value: 35 },
              { name: 'Google Ads', value: 25 },
              { name: 'Email Marketing', value: 20 },
              { name: 'Facebook', value: 12 },
              { name: 'Instagram', value: 8 }
            ],
            contentIdeas: [
              { 
                title: 'Guía Legal para PyMEs', 
                description: 'Serie de artículos sobre documentos esenciales para empresas en crecimiento', 
                tags: ['B2B', 'educativo', 'lead magnet'] 
              },
              { 
                title: 'Webinar: Certificación Digital', 
                description: 'Seminario web sobre beneficios y casos de uso de certificación digital vs tradicional', 
                tags: ['evento', 'awareness', 'educativo'] 
              },
              { 
                title: 'Calculadora de Ahorro', 
                description: 'Herramienta interactiva que muestra el ahorro en tiempo y costos con certificación digital', 
                tags: ['interactivo', 'conversión', 'utilidad'] 
              }
            ]
          };
        }
      }
      
      // Pronóstico de demanda
      const today = new Date();
      const demandForecast = [];
      
      for (let i = 0; i < 30; i++) {
        const date = format(addDays(today, i), 'dd/MM');
        const baseValue = Math.floor(Math.random() * 15) + 35; // Valor base entre 35-50
        const trend = Math.floor(i / 3); // Tendencia creciente suave
        const seasonality = Math.sin(i / 5) * 8; // Componente estacional
        const noise = (Math.random() - 0.5) * 10; // Ruido aleatorio
        
        const value = Math.round(baseValue + trend + seasonality + noise);
        const uncertainty = Math.floor(value * 0.2); // 20% de incertidumbre
        
        demandForecast.push({
          date,
          value,
          upperBound: value + uncertainty,
          lowerBound: Math.max(0, value - uncertainty)
        });
      }
      
      analysisData.demandForecast = demandForecast;
      
      // Generar emails de marketing de ejemplo
      const marketingEmails = await generateMarketingEmails();
      analysisData.generatedMessages = {
        emails: marketingEmails
      };
      
    } catch (aiError) {
      console.error("Error generando análisis con OpenAI:", aiError);
      // En caso de error con OpenAI, proporcionar datos de respaldo
      analysisData = getFallbackAnalysisData(type as string);
    }
    
    res.json(analysisData);
  } catch (error) {
    console.error("Error generando análisis de IA:", error);
    res.status(500).json({ error: "Error al generar el análisis de IA" });
  }
});

// Panel Maestro - Generar nuevo análisis de IA
adminRouter.post('/ai-analysis/generate', async (req: Request, res: Response) => {
  try {
    // Importar el servicio de OpenAI
    const { openaiService } = await import('../services/openai-service');
    
    const { analysisType, model, depth, includeRecommendations } = req.body;
    
    // Obtener datos para el análisis
    const operationalData = await getOperationalData(analysisType);
    
    // Generar análisis usando OpenAI
    const analysisData = await openaiService.generateStrategicAnalysis(
      analysisType,
      operationalData,
      { 
        model, 
        depth, 
        includeRecommendations 
      }
    );
    
    // En una implementación real, guardaríamos el análisis en la base de datos
    
    res.json({ 
      success: true, 
      message: `Análisis de ${analysisType} generado correctamente`,
      analysis: analysisData
    });
  } catch (error) {
    console.error("Error generando análisis de IA:", error);
    res.status(500).json({ error: "Error al generar el análisis de IA" });
  }
});

// Función para obtener datos operacionales relevantes para el análisis
async function getOperationalData(analysisType: string) {
  // En una implementación real, esta función consultaría diferentes
  // tablas de la base de datos según el tipo de análisis
  
  // Para la demostración, generamos datos de ejemplo
  const today = new Date();
  const lastMonth = subMonths(today, 1);
  
  // Datos base para cualquier tipo de análisis
  const baseData = {
    companyInfo: {
      name: "NotaryPro",
      country: "Chile",
      services: ["Certificación digital", "Firma electrónica", "Validación de identidad"]
    },
    totalDocuments: 1250,
    documentsLastMonth: 980,
    totalUsers: 780,
    newUsersLastMonth: 120,
    totalCertifiers: 45,
    activeCertifiers: 38,
    totalPartners: 25,
    activePartners: 22,
    avgResponseTime: 1.2, // días
    prevAvgResponseTime: 2.1, // días
    conversionRate: 7.8, // porcentaje
    prevConversionRate: 6.5, // porcentaje
    documentTypes: {
      contractos: 450,
      poderes: 320,
      declaraciones: 280,
      acuerdos: 150,
      otros: 50
    },
    revenueTotal: 25800000, // CLP
    revenuePrevPeriod: 22400000, // CLP
    period: {
      start: format(lastMonth, 'yyyy-MM-dd'),
      end: format(today, 'yyyy-MM-dd')
    }
  };
  
  // Datos específicos según el tipo de análisis
  switch (analysisType) {
    case 'business':
      return {
        ...baseData,
        costStructure: {
          operations: 9500000,
          marketing: 3200000,
          technology: 4800000,
          administrative: 2900000,
          other: 1200000
        },
        monthlyGrowth: [
          { month: "Enero", documents: 850, revenue: 19500000 },
          { month: "Febrero", documents: 920, revenue: 21100000 },
          { month: "Marzo", documents: 980, revenue: 22400000 },
          { month: "Abril", documents: 1250, revenue: 25800000 }
        ]
      };
      
    case 'market':
      return {
        ...baseData,
        marketSizeEstimate: 8500000000, // CLP anual
        marketGrowthRate: 15, // % anual
        competitorsInfo: [
          { name: "Empresa A", marketShare: 25, strengths: ["Precio bajo", "Amplia red"] },
          { name: "Empresa B", marketShare: 18, strengths: ["Alto reconocimiento", "Integración CRM"] },
          { name: "Empresa C", marketShare: 12, strengths: ["Nicho especializado", "Alta calidad"] },
          { name: "NotaryPro", marketShare: 8, strengths: ["Innovación tecnológica", "Experiencia usuario"] },
          { name: "Otros", marketShare: 37 }
        ],
        customerSegments: [
          { name: "PyMEs", percentage: 45, growth: 22 },
          { name: "Empresas grandes", percentage: 25, growth: 10 },
          { name: "Profesionales", percentage: 20, growth: 18 },
          { name: "Particulares", percentage: 10, growth: 5 }
        ]
      };
      
    case 'expansion':
      return {
        ...baseData,
        regions: [
          { name: "Región Metropolitana", population: 7112808, gdp: 100, coverage: 75 },
          { name: "Valparaíso", population: 1815902, gdp: 85, coverage: 30 },
          { name: "Biobío", population: 1556805, gdp: 78, coverage: 15 },
          { name: "Maule", population: 1044950, gdp: 65, coverage: 5 },
          { name: "Araucanía", population: 957224, gdp: 60, coverage: 0 }
        ],
        partnerPotential: [
          { region: "Región Metropolitana", potentialPartners: 250, estimated1YRevenue: 125000000 },
          { region: "Valparaíso", potentialPartners: 120, estimated1YRevenue: 75000000 },
          { region: "Biobío", potentialPartners: 100, estimated1YRevenue: 60000000 },
          { region: "Maule", potentialPartners: 80, estimated1YRevenue: 45000000 },
          { region: "Araucanía", potentialPartners: 70, estimated1YRevenue: 40000000 }
        ]
      };
      
    case 'pricing':
      return {
        ...baseData,
        currentPrices: [
          { service: "Certificación Básica", price: 25000, margin: 65 },
          { service: "Certificación Empresarial", price: 35000, margin: 72 },
          { service: "Certificación Express", price: 45000, margin: 68 },
          { service: "Paquete 10 Certificaciones", price: 210000, margin: 75 }
        ],
        priceElasticity: [
          { price: 25000, demand: 100 }, // Base 100
          { price: 30000, demand: 85 },
          { price: 35000, demand: 72 },
          { price: 40000, demand: 58 },
          { price: 45000, demand: 45 },
          { price: 50000, demand: 32 }
        ],
        competitorPrices: [
          { competitor: "Empresa A", basicService: 20000, premiumService: 40000 },
          { competitor: "Empresa B", basicService: 30000, premiumService: 50000 },
          { competitor: "Empresa C", basicService: 28000, premiumService: 45000 }
        ]
      };
      
    case 'marketing':
      return {
        ...baseData,
        marketingBudget: 3200000,
        currentChannels: [
          { channel: "Google Ads", spend: 1200000, leads: 350, conversions: 42 },
          { channel: "Facebook", spend: 800000, leads: 220, conversions: 18 },
          { channel: "Email Marketing", spend: 400000, leads: 180, conversions: 32 },
          { channel: "LinkedIn", spend: 600000, leads: 120, conversions: 25 },
          { channel: "Eventos", spend: 200000, leads: 40, conversions: 12 }
        ],
        customerAcquisitionCost: {
          overall: 42000,
          pymes: 38000,
          enterprises: 65000,
          professionals: 28000,
          individuals: 22000
        },
        campaignResults: [
          { campaign: "Promo Verano", budget: 1500000, leads: 420, conversions: 65, roi: 3.2 },
          { campaign: "Webinar Legal", budget: 800000, leads: 180, conversions: 42, roi: 2.8 },
          { campaign: "Descuento Empresas", budget: 1200000, leads: 120, conversions: 28, roi: 1.9 }
        ]
      };
      
    default:
      return baseData;
  }
}

// Función para obtener datos de análisis de respaldo (en caso de error de OpenAI)
function getFallbackAnalysisData(type: string) {
  return {
    analysisTitle: 'Análisis ' + (
      type === 'business' ? 'de Negocio' :
      type === 'market' ? 'de Mercado' :
      type === 'expansion' ? 'de Expansión' :
      type === 'pricing' ? 'de Precios' :
      type === 'marketing' ? 'de Marketing' : 'General'
    ),
    generatedAt: format(new Date(), 'dd/MM/yyyy HH:mm'),
    model: 'gpt-4o',
    executiveSummary: 'NotaryPro muestra un crecimiento sostenido del 28% en comparación con el mismo período del año anterior. La implementación de verificación digital ha reducido el tiempo promedio de procesamiento en un 45%, aumentando la eficiencia operativa. Se identifica una oportunidad de expansión geográfica en las regiones de Valparaíso, Biobío y Metropolitana, donde existe alta demanda insatisfecha.',
    
    keyMetrics: [
      {
        title: 'Documentos Procesados',
        value: 1250,
        comparison: 'vs. 980 último mes',
        trend: 'up',
        trendValue: '+28%',
        icon: 'trending_up',
        isMonetary: false
      },
      {
        title: 'Ingresos Totales',
        value: 25800000,
        comparison: 'vs. $22.4M último mes',
        trend: 'up',
        trendValue: '+15%',
        icon: 'trending_up',
        isMonetary: true
      },
      {
        title: 'Tiempo Promedio Firma',
        value: '1.2 días',
        comparison: 'vs. 2.1 días último mes',
        trend: 'down',
        trendValue: '-43%',
        icon: 'trending_down',
        isMonetary: false
      },
      {
        title: 'Tasa de Conversión',
        value: '7.8%',
        comparison: 'vs. 6.5% último mes',
        trend: 'up',
        trendValue: '+20%',
        icon: 'trending_up',
        isMonetary: false
      }
    ],
    
    keyFindings: [
      {
        title: 'Crecimiento sostenido en documentos certificados',
        description: 'Se ha observado un aumento constante en la cantidad de documentos que pasan por el proceso completo de certificación.',
        type: 'positive'
      },
      {
        title: 'Oportunidades en sector inmobiliario',
        description: 'Los documentos de tipo inmobiliario representan el segmento de mayor crecimiento, con un aumento del 45% respecto al trimestre anterior.',
        type: 'positive'
      },
      {
        title: 'Tiempos de respuesta elevados en horario nocturno',
        description: 'Los documentos enviados después de las 20:00 horas experimentan demoras de hasta 12 horas en el proceso de certificación.',
        type: 'negative'
      },
      {
        title: 'Diversificación de servicios necesaria',
        description: 'El 80% de los ingresos proviene de solo 2 tipos de documentos, lo que representa un riesgo para la sostenibilidad del negocio.',
        type: 'neutral'
      }
    ],
    
    recommendations: [
      {
        title: 'Expandir operaciones a la Región de Valparaíso',
        description: 'Basado en el análisis de demanda, se recomienda priorizar la expansión a Valparaíso donde existe un potencial de mercado de aproximadamente 2,500 documentos mensuales.',
        priority: 'high',
        timeframe: '3-6 meses'
      },
      {
        title: 'Implementar verificación biométrica avanzada',
        description: 'Integrar tecnología de reconocimiento facial en tiempo real mejoraría la seguridad y reduciría el tiempo de procesamiento en aproximadamente un 35%.',
        priority: 'medium',
        timeframe: '2-4 meses'
      },
      {
        title: 'Desarrollar paquetes empresariales',
        description: 'Crear planes de suscripción para empresas con volumen alto de documentos, ofreciendo descuentos escalonados y funcionalidades premium.',
        priority: 'medium',
        timeframe: '1-2 meses'
      },
      {
        title: 'Ampliar horario de certificadores',
        description: 'Establecer turnos rotativos para certificadores que cubran horario nocturno, reduciendo tiempos de respuesta y mejorando satisfacción.',
        priority: 'low',
        timeframe: '1 mes'
      }
    ]
  };
}

// Función para generar emails de marketing
async function generateMarketingEmails() {
  try {
    // Importar el servicio de OpenAI
    const { openaiService } = await import('../services/openai-service');
    
    // Generar emails de marketing
    const abandonmentEmail = await openaiService.generateMarketingEmail(
      "Recuperar clientes que abandonaron el proceso de certificación",
      "Usuarios que iniciaron pero no completaron el proceso de certificación",
      {
        productName: "NotaryPro",
        mainFeature: "Certificación digital con validez legal",
        timeToComplete: "5 minutos",
        uniqueSellingPoint: "Validez legal en todo Chile sin desplazamiento físico"
      },
      { tone: "profesional" }
    );
    
    const promotionEmail = await openaiService.generateMarketingEmail(
      "Promover paquete empresarial de certificaciones",
      "Empresas con necesidades frecuentes de certificación documental",
      {
        productName: "NotaryPro Plan Empresarial",
        features: [
          "50 certificaciones mensuales",
          "Descuento del 30% sobre precio regular",
          "Acceso prioritario 24/7",
          "Gestor de cuenta dedicado"
        ],
        limitedTimeOffer: "10 certificaciones adicionales gratis este mes",
        regularPrice: "950.000 CLP",
        discountedPrice: "665.000 CLP"
      },
      { tone: "profesional-persuasivo" }
    );
    
    return [abandonmentEmail, promotionEmail];
  } catch (error) {
    console.error("Error al generar emails de marketing:", error);
    
    // Respaldo en caso de error
    return [
      {
        subject: "Recupera tu proceso de certificación en NotaryPro",
        body: "Estimado/a [nombre_cliente],\n\nHemos notado que iniciaste un proceso de certificación en NotaryPro pero no lo completaste. Tu documento '[nombre_documento]' está listo para ser certificado.\n\nSólo necesitas 5 minutos para completar el proceso y obtener tu certificación legal con validez en todo Chile.\n\nHaz clic aquí para continuar: [link_certificacion]\n\nSi tienes dudas, responde este correo o contáctanos al [telefono_soporte].\n\nSaludos cordiales,\nEquipo NotaryPro",
        type: "Abandono",
        openRate: 42
      },
      {
        subject: "¡Importantes ahorros en certificación para tu empresa!",
        body: "Estimado/a [nombre_cliente],\n\nEn NotaryPro sabemos que tu empresa necesita certificar documentos con frecuencia. Por eso, hemos creado un plan empresarial especial:\n\n- 50 certificaciones mensuales\n- Descuento del 30% sobre precio regular\n- Acceso prioritario 24/7\n- Gestor de cuenta dedicado\n\nSi contratas este mes, recibirás 10 certificaciones adicionales sin costo.\n\nResponde este correo o agenda una demo aquí: [link_demo]\n\nSaludos cordiales,\nEquipo NotaryPro",
        type: "Promoción",
        openRate: 38
      }
    ];
  }
}

export default adminRouter;