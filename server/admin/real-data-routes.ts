import express, { Request, Response } from 'express';
import { requireAdmin } from './admin-middleware';
import { db } from '../db';
import { eq, desc, count, and, gte, lte, sql } from 'drizzle-orm';
import { 
  users, 
  documents, 
  identityVerifications,
  posTransactions,
  analyticsEvents,
  auditLogs
} from '@shared/schema';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

const realDataRouter = express.Router();

// Middleware de autenticación admin
realDataRouter.use(requireAdmin);

/**
 * GET /api/admin/real-data/dashboard
 * Datos reales para el dashboard de administración
 */
realDataRouter.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const last30Days = subDays(today, 30);
    const last7Days = subDays(today, 7);

    // Estadísticas generales
    const [
      totalUsers,
      totalDocuments,
      totalVerifications,
      totalTransactions,
      activeUsers,
      todayDocuments,
      todayTransactions
    ] = await Promise.all([
      // Total de usuarios
      db.select({ count: sql<number>`count(*)` }).from(users),
      
      // Total de documentos
      db.select({ count: sql<number>`count(*)` }).from(documents),
      
      // Total de verificaciones de identidad
      db.select({ count: sql<number>`count(*)` }).from(identityVerifications),
      
      // Total de transacciones POS
      db.select({ count: sql<number>`count(*)` }).from(posTransactions),
      
      // Usuarios activos últimos 30 días
      db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(gte(users.createdAt, last30Days)),
      
      // Documentos de hoy
      db.select({ count: sql<number>`count(*)` })
        .from(documents)
        .where(gte(documents.createdAt, startOfDay(today))),
      
      // Transacciones de hoy
      db.select({ count: sql<number>`count(*)` })
        .from(posTransactions)
        .where(gte(posTransactions.createdAt, startOfDay(today)))
    ]);

    // Distribución de usuarios por rol
    const usersByRole = await db
      .select({
        role: users.role,
        count: sql<number>`count(*)`
      })
      .from(users)
      .groupBy(users.role);

    // Documentos por estado últimos 7 días
    const documentsByStatus = await db
      .select({
        status: documents.status,
        count: sql<number>`count(*)`
      })
      .from(documents)
      .where(gte(documents.createdAt, last7Days))
      .groupBy(documents.status);

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

    // Últimos documentos creados
    const recentDocuments = await db
      .select({
        id: documents.id,
        title: documents.title,
        status: documents.status,
        createdAt: documents.createdAt,
        userId: documents.userId
      })
      .from(documents)
      .orderBy(desc(documents.createdAt))
      .limit(5);

    // Últimas verificaciones de identidad
    const recentVerifications = await db
      .select({
        id: identityVerifications.id,
        status: identityVerifications.status,
        createdAt: identityVerifications.createdAt,
        userId: identityVerifications.userId
      })
      .from(identityVerifications)
      .orderBy(desc(identityVerifications.createdAt))
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers: totalUsers[0]?.count || 0,
        totalDocuments: totalDocuments[0]?.count || 0,
        totalVerifications: totalVerifications[0]?.count || 0,
        totalTransactions: totalTransactions[0]?.count || 0,
        activeUsers: activeUsers[0]?.count || 0,
        todayDocuments: todayDocuments[0]?.count || 0,
        todayTransactions: todayTransactions[0]?.count || 0
      },
      charts: {
        usersByRole,
        documentsByStatus,
        dailyActivity
      },
      recent: {
        documents: recentDocuments,
        verifications: recentVerifications
      }
    });

  } catch (error) {
    console.error('Error al obtener datos reales del dashboard:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener datos del dashboard' 
    });
  }
});

/**
 * GET /api/admin/real-data/users
 * Lista real de usuarios del sistema
 */
realDataRouter.get('/users', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        platform: users.platform,
        createdAt: users.createdAt
      })
      .from(users);

    // Filtros
    const conditions = [];
    
    if (search) {
      conditions.push(
        sql`(${users.username} ILIKE ${`%${search}%`} OR ${users.fullName} ILIKE ${`%${search}%`} OR ${users.email} ILIKE ${`%${search}%`})`
      );
    }
    
    if (role) {
      conditions.push(eq(users.role, role as string));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const usersList = await query
      .orderBy(desc(users.createdAt))
      .limit(Number(limit))
      .offset(offset);

    // Contar total para paginación
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    res.json({
      success: true,
      users: usersList,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / Number(limit))
      }
    });

  } catch (error) {
    console.error('Error al obtener usuarios reales:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener usuarios' 
    });
  }
});

/**
 * GET /api/admin/real-data/documents
 * Lista real de documentos para certificadores
 */
realDataRouter.get('/documents', async (req: Request, res: Response) => {
  try {
    const { status = '', limit = 10, userId } = req.query;

    let query = db
      .select({
        id: documents.id,
        title: documents.title,
        status: documents.status,
        documentType: documents.documentType,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        userId: documents.userId
      })
      .from(documents);

    const conditions = [];
    
    if (status) {
      conditions.push(eq(documents.status, status as string));
    }
    
    if (userId) {
      conditions.push(eq(documents.userId, Number(userId)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const documentsList = await query
      .orderBy(desc(documents.createdAt))
      .limit(Number(limit));

    // Obtener información del usuario para cada documento
    const documentsWithUser = await Promise.all(
      documentsList.map(async (doc) => {
        const [user] = await db
          .select({
            id: users.id,
            username: users.username,
            fullName: users.fullName,
            email: users.email
          })
          .from(users)
          .where(eq(users.id, doc.userId));
        
        return {
          ...doc,
          user
        };
      })
    );

    res.json({
      success: true,
      documents: documentsWithUser
    });

  } catch (error) {
    console.error('Error al obtener documentos reales:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener documentos' 
    });
  }
});

/**
 * GET /api/admin/real-data/analytics
 * Datos de analytics reales
 */
realDataRouter.get('/analytics', async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const startDate = subDays(new Date(), Number(days));

    // Eventos de analytics por tipo
    const eventsByType = await db
      .select({
        eventType: analyticsEvents.eventType,
        count: sql<number>`count(*)`
      })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, startDate))
      .groupBy(analyticsEvents.eventType);

    // Actividad por día
    const dailyEvents = await db
      .select({
        date: sql<string>`DATE(${analyticsEvents.createdAt})`,
        count: sql<number>`count(*)`
      })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, startDate))
      .groupBy(sql`DATE(${analyticsEvents.createdAt})`)
      .orderBy(sql`DATE(${analyticsEvents.createdAt})`);

    res.json({
      success: true,
      analytics: {
        eventsByType,
        dailyEvents,
        period: `${days} días`
      }
    });

  } catch (error) {
    console.error('Error al obtener analytics reales:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener analytics' 
    });
  }
});

export { realDataRouter };