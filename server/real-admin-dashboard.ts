/**
 * DASHBOARD DE ADMINISTRACIÓN REAL COMPLETO
 * Panel de administración con datos reales de base de datos
 */

import express, { Request, Response } from 'express';
import { db } from './db';
import { eq, desc, and, gte, lte, sql, count } from 'drizzle-orm';
import { 
  users, 
  documents, 
  identityVerifications,
  auditLogs,
  analyticsEvents
} from '@shared/schema';
import { authenticateJWT, requireAdmin } from './services/jwt-auth-service';
import { format, subDays, startOfDay, endOfDay, subMonths } from 'date-fns';

const realAdminRouter = express.Router();

// Middleware de autenticación admin
realAdminRouter.use(authenticateJWT);
realAdminRouter.use(requireAdmin);

/**
 * GET /api/real-admin/dashboard
 * Dashboard principal con métricas reales
 */
realAdminRouter.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const yesterday = subDays(today, 1);
    const last7Days = subDays(today, 7);
    const last30Days = subDays(today, 30);
    const lastMonth = subMonths(today, 1);

    // Métricas principales
    const [
      totalUsers,
      totalDocuments,
      totalVerifications,
      todayUsers,
      todayDocuments,
      weeklyDocuments,
      monthlyUsers
    ] = await Promise.all([
      // Total de usuarios
      db.select({ count: sql<number>`count(*)` }).from(users),
      
      // Total de documentos
      db.select({ count: sql<number>`count(*)` }).from(documents),
      
      // Total de verificaciones
      db.select({ count: sql<number>`count(*)` }).from(identityVerifications),
      
      // Usuarios registrados hoy
      db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(gte(users.createdAt, startOfDay(today))),
      
      // Documentos subidos hoy
      db.select({ count: sql<number>`count(*)` })
        .from(documents)
        .where(gte(documents.createdAt, startOfDay(today))),
      
      // Documentos de la semana
      db.select({ count: sql<number>`count(*)` })
        .from(documents)
        .where(gte(documents.createdAt, last7Days)),
      
      // Usuarios del mes
      db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(gte(users.createdAt, last30Days))
    ]);

    // Distribución de usuarios por rol
    const usersByRole = await db
      .select({
        role: users.role,
        count: sql<number>`count(*)`
      })
      .from(users)
      .groupBy(users.role)
      .orderBy(sql`count(*) DESC`);

    // Documentos por estado
    const documentsByStatus = await db
      .select({
        status: documents.status,
        count: sql<number>`count(*)`
      })
      .from(documents)
      .groupBy(documents.status)
      .orderBy(sql`count(*) DESC`);

    // Documentos por tipo
    const documentsByType = await db
      .select({
        type: documents.documentType,
        count: sql<number>`count(*)`
      })
      .from(documents)
      .groupBy(documents.documentType)
      .orderBy(sql`count(*) DESC`)
      .limit(10);

    // Actividad diaria últimos 7 días
    const dailyActivity = await db
      .select({
        date: sql<string>`DATE(${documents.createdAt})`,
        documents: sql<number>`count(*)`
      })
      .from(documents)
      .where(gte(documents.createdAt, last7Days))
      .groupBy(sql`DATE(${documents.createdAt})`)
      .orderBy(sql`DATE(${documents.createdAt})`);

    // Usuarios más activos
    const activeUsers = await db
      .select({
        userId: documents.userId,
        userName: users.fullName,
        userEmail: users.email,
        documentCount: sql<number>`count(*)`
      })
      .from(documents)
      .leftJoin(users, eq(documents.userId, users.id))
      .where(gte(documents.createdAt, last30Days))
      .groupBy(documents.userId, users.fullName, users.email)
      .orderBy(sql`count(*) DESC`)
      .limit(5);

    // Últimos documentos
    const recentDocuments = await db
      .select({
        id: documents.id,
        title: documents.title,
        documentType: documents.documentType,
        status: documents.status,
        createdAt: documents.createdAt,
        userName: users.fullName,
        userEmail: users.email
      })
      .from(documents)
      .leftJoin(users, eq(documents.userId, users.id))
      .orderBy(desc(documents.createdAt))
      .limit(10);

    // Últimas verificaciones de identidad
    const recentVerifications = await db
      .select({
        id: identityVerifications.id,
        status: identityVerifications.status,
        verificationType: identityVerifications.verificationType,
        createdAt: identityVerifications.createdAt,
        userId: identityVerifications.userId,
        userName: users.fullName
      })
      .from(identityVerifications)
      .leftJoin(users, eq(identityVerifications.userId, users.id))
      .orderBy(desc(identityVerifications.createdAt))
      .limit(10);

    // Cálculo de tendencias
    const calculateTrend = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // Datos del mes anterior para comparación
    const [lastMonthUsers] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(
        gte(users.createdAt, subMonths(lastMonth, 1)),
        lte(users.createdAt, lastMonth)
      ));

    const [lastMonthDocuments] = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .where(and(
        gte(documents.createdAt, subMonths(lastMonth, 1)),
        lte(documents.createdAt, lastMonth)
      ));

    res.json({
      success: true,
      dashboard: {
        // Métricas principales
        metrics: {
          totalUsers: totalUsers[0]?.count || 0,
          totalDocuments: totalDocuments[0]?.count || 0,
          totalVerifications: totalVerifications[0]?.count || 0,
          todayUsers: todayUsers[0]?.count || 0,
          todayDocuments: todayDocuments[0]?.count || 0,
          weeklyDocuments: weeklyDocuments[0]?.count || 0,
          monthlyUsers: monthlyUsers[0]?.count || 0
        },
        
        // Tendencias
        trends: {
          usersTrend: calculateTrend(monthlyUsers[0]?.count || 0, lastMonthUsers[0]?.count || 0),
          documentsTrend: calculateTrend(weeklyDocuments[0]?.count || 0, lastMonthDocuments[0]?.count || 0)
        },
        
        // Gráficos
        charts: {
          usersByRole,
          documentsByStatus,
          documentsByType,
          dailyActivity
        },
        
        // Datos recientes
        recent: {
          documents: recentDocuments,
          verifications: recentVerifications,
          activeUsers
        },
        
        // Metadatos
        lastUpdated: new Date(),
        period: '30 días'
      }
    });

  } catch (error) {
    console.error('Error obteniendo dashboard real:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener datos del dashboard'
    });
  }
});

/**
 * GET /api/real-admin/users
 * Gestión real de usuarios
 */
realAdminRouter.get('/users', async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      role = '', 
      platform = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);

    // Construir query base
    let query = db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        platform: users.platform,
        businessName: users.businessName,
        address: users.address,
        region: users.region,
        comuna: users.comuna,
        createdAt: users.createdAt,
        // Contar documentos del usuario
        documentCount: sql<number>`(
          SELECT COUNT(*) 
          FROM ${documents} 
          WHERE ${documents.userId} = ${users.id}
        )`
      })
      .from(users);

    // Aplicar filtros
    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          like(users.username, `%${search}%`),
          like(users.fullName, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }
    
    if (role) {
      conditions.push(eq(users.role, role as string));
    }
    
    if (platform) {
      conditions.push(eq(users.platform, platform as string));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Aplicar ordenamiento
    const orderColumn = sortBy === 'fullName' ? users.fullName : 
                       sortBy === 'email' ? users.email :
                       sortBy === 'role' ? users.role : users.createdAt;
    
    const orderDirection = sortOrder === 'asc' ? orderColumn : desc(orderColumn);

    const usersList = await query
      .orderBy(orderDirection)
      .limit(Number(limit))
      .offset(offset);

    // Contar total para paginación
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    res.json({
      success: true,
      users: usersList,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalResult?.count || 0,
        totalPages: Math.ceil((totalResult?.count || 0) / Number(limit))
      },
      filters: {
        search,
        role,
        platform,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuarios reales:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuarios'
    });
  }
});

/**
 * PUT /api/real-admin/users/:id
 * Actualizar usuario real
 */
realAdminRouter.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const { fullName, email, role, platform, businessName, address, region, comuna } = req.body;

    const [updatedUser] = await db
      .update(users)
      .set({
        fullName,
        email,
        role,
        platform,
        businessName,
        address,
        region,
        comuna
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        platform: users.platform
      });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar usuario'
    });
  }
});

/**
 * GET /api/real-admin/analytics
 * Analytics reales del sistema
 */
realAdminRouter.get('/analytics', async (req: Request, res: Response) => {
  try {
    const { period = '30' } = req.query;
    const days = Number(period);
    const startDate = subDays(new Date(), days);

    // Eventos de analytics por tipo
    const eventsByType = await db
      .select({
        eventType: analyticsEvents.eventType,
        count: sql<number>`count(*)`
      })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, startDate))
      .groupBy(analyticsEvents.eventType)
      .orderBy(sql`count(*) DESC`);

    // Actividad por día
    const dailyEvents = await db
      .select({
        date: sql<string>`DATE(${analyticsEvents.createdAt})`,
        events: sql<number>`count(*)`
      })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, startDate))
      .groupBy(sql`DATE(${analyticsEvents.createdAt})`)
      .orderBy(sql`DATE(${analyticsEvents.createdAt})`);

    // Usuarios más activos
    const activeUsers = await db
      .select({
        userId: analyticsEvents.userId,
        userName: users.fullName,
        eventCount: sql<number>`count(*)`
      })
      .from(analyticsEvents)
      .leftJoin(users, eq(analyticsEvents.userId, users.id))
      .where(gte(analyticsEvents.createdAt, startDate))
      .groupBy(analyticsEvents.userId, users.fullName)
      .orderBy(sql`count(*) DESC`)
      .limit(10);

    // Documentos por estado en el período
    const documentStatusTrend = await db
      .select({
        status: documents.status,
        count: sql<number>`count(*)`
      })
      .from(documents)
      .where(gte(documents.createdAt, startDate))
      .groupBy(documents.status);

    res.json({
      success: true,
      analytics: {
        period: `${days} días`,
        events: {
          byType: eventsByType,
          daily: dailyEvents,
          total: eventsByType.reduce((sum, item) => sum + (item.count || 0), 0)
        },
        users: {
          mostActive: activeUsers
        },
        documents: {
          statusTrend: documentStatusTrend
        },
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('Error obteniendo analytics reales:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener analytics'
    });
  }
});

/**
 * GET /api/real-admin/system-health
 * Estado de salud real del sistema
 */
realAdminRouter.get('/system-health', async (req: Request, res: Response) => {
  try {
    // Verificar conexión a base de datos
    const [dbTest] = await db.select({ count: sql<number>`1` }).from(users).limit(1);
    const dbHealthy = !!dbTest;

    // Verificar integridad de archivos
    const [documentsWithFiles] = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .where(sql`${documents.filePath} IS NOT NULL`);

    let filesHealthy = true;
    let missingFiles = 0;

    // Verificar algunos archivos aleatorios
    const [sampleDocuments] = await db
      .select({ filePath: documents.filePath })
      .from(documents)
      .where(sql`${documents.filePath} IS NOT NULL`)
      .limit(10);

    if (sampleDocuments) {
      const sampleDocs = Array.isArray(sampleDocuments) ? sampleDocuments : [sampleDocuments];
      for (const doc of sampleDocs) {
        if (!fs.existsSync(doc.filePath)) {
          missingFiles++;
          filesHealthy = false;
        }
      }
    }

    // Verificar espacio en disco
    const stats = fs.statSync(process.cwd());
    const uploadsDir = path.join(process.cwd(), 'uploads');
    let uploadsDirSize = 0;

    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir, { recursive: true });
      for (const file of files) {
        try {
          const filePath = path.join(uploadsDir, file as string);
          const stat = fs.statSync(filePath);
          if (stat.isFile()) {
            uploadsDirSize += stat.size;
          }
        } catch (e) {
          // Ignorar errores de archivos individuales
        }
      }
    }

    // Verificar memoria del proceso
    const memoryUsage = process.memoryUsage();

    res.json({
      success: true,
      health: {
        database: {
          status: dbHealthy ? 'healthy' : 'error',
          connected: dbHealthy
        },
        files: {
          status: filesHealthy ? 'healthy' : 'warning',
          missingFiles,
          totalDocuments: documentsWithFiles?.count || 0
        },
        storage: {
          uploadsSize: uploadsDirSize,
          uploadsSizeMB: Math.round(uploadsDirSize / (1024 * 1024))
        },
        memory: {
          used: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
          total: Math.round(memoryUsage.heapTotal / (1024 * 1024)),
          external: Math.round(memoryUsage.external / (1024 * 1024))
        },
        uptime: {
          seconds: process.uptime(),
          formatted: formatUptime(process.uptime())
        },
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Error verificando salud del sistema:', error);
    res.status(500).json({
      success: false,
      error: 'Error al verificar salud del sistema',
      health: {
        database: { status: 'error', connected: false },
        files: { status: 'error' },
        timestamp: new Date()
      }
    });
  }
});

/**
 * POST /api/real-admin/create-sample-data
 * Crear datos de muestra reales para testing
 */
realAdminRouter.post('/create-sample-data', async (req: Request, res: Response) => {
  try {
    const createdData = {
      users: 0,
      documents: 0,
      verifications: 0,
      analytics: 0
    };

    // Crear usuarios de muestra
    const sampleUsers = [
      {
        username: 'usuario1',
        password: '$2b$10$sample.hash.for.testing',
        email: 'usuario1@test.com',
        fullName: 'Usuario de Prueba 1',
        role: 'user',
        platform: 'notarypro'
      },
      {
        username: 'certificador1',
        password: '$2b$10$sample.hash.for.testing',
        email: 'cert1@test.com',
        fullName: 'Certificador de Prueba',
        role: 'certifier',
        platform: 'notarypro'
      },
      {
        username: 'partner1',
        password: '$2b$10$sample.hash.for.testing',
        email: 'partner1@test.com',
        fullName: 'Partner de Prueba',
        role: 'partner',
        platform: 'vecinos',
        businessName: 'Negocio de Prueba'
      }
    ];

    for (const userData of sampleUsers) {
      try {
        const [existingUser] = await db.select().from(users).where(eq(users.username, userData.username));
        
        if (!existingUser) {
          await db.insert(users).values({
            ...userData,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          });
          createdData.users++;
        }
      } catch (e) {
        console.log(`Usuario ${userData.username} ya existe o error al crear`);
      }
    }

    // Crear eventos de analytics de muestra
    const eventTypes = ['document_uploaded', 'document_certified', 'user_login', 'identity_verified'];
    
    for (let i = 0; i < 50; i++) {
      try {
        await db.insert(analyticsEvents).values({
          eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          userId: Math.floor(Math.random() * 5) + 1,
          metadata: { sample: true },
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        });
        createdData.analytics++;
      } catch (e) {
        // Ignorar errores de eventos duplicados
      }
    }

    res.json({
      success: true,
      message: 'Datos de muestra creados exitosamente',
      created: createdData
    });

  } catch (error) {
    console.error('Error creando datos de muestra:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear datos de muestra'
    });
  }
});

// Función auxiliar para formatear uptime
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export { realAdminRouter };