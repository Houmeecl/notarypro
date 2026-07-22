"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.realDataRouter = void 0;
const express_1 = __importDefault(require("express"));
const admin_middleware_1 = require("./admin-middleware");
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("@shared/schema");
const date_fns_1 = require("date-fns");
const realDataRouter = express_1.default.Router();
exports.realDataRouter = realDataRouter;
// Middleware de autenticación admin
realDataRouter.use(admin_middleware_1.requireAdmin);
/**
 * GET /api/admin/real-data/dashboard
 * Datos reales para el dashboard de administración
 */
realDataRouter.get('/dashboard', async (req, res) => {
    try {
        const today = new Date();
        const last30Days = (0, date_fns_1.subDays)(today, 30);
        const last7Days = (0, date_fns_1.subDays)(today, 7);
        // Estadísticas generales
        const [totalUsers, totalDocuments, totalVerifications, totalTransactions, activeUsers, todayDocuments, todayTransactions] = await Promise.all([
            // Total de usuarios
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.users),
            // Total de documentos
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.documents),
            // Total de verificaciones de identidad
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.identityVerifications),
            // Total de transacciones POS
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.posTransactions),
            // Usuarios activos últimos 30 días
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema_1.users)
                .where((0, drizzle_orm_1.gte)(schema_1.users.createdAt, last30Days)),
            // Documentos de hoy
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema_1.documents)
                .where((0, drizzle_orm_1.gte)(schema_1.documents.createdAt, (0, date_fns_1.startOfDay)(today))),
            // Transacciones de hoy
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema_1.posTransactions)
                .where((0, drizzle_orm_1.gte)(schema_1.posTransactions.createdAt, (0, date_fns_1.startOfDay)(today)))
        ]);
        // Distribución de usuarios por rol
        const usersByRole = await db_1.db
            .select({
            role: schema_1.users.role,
            count: (0, drizzle_orm_1.sql) `count(*)`
        })
            .from(schema_1.users)
            .groupBy(schema_1.users.role);
        // Documentos por estado últimos 7 días
        const documentsByStatus = await db_1.db
            .select({
            status: schema_1.documents.status,
            count: (0, drizzle_orm_1.sql) `count(*)`
        })
            .from(schema_1.documents)
            .where((0, drizzle_orm_1.gte)(schema_1.documents.createdAt, last7Days))
            .groupBy(schema_1.documents.status);
        // Actividad diaria últimos 7 días
        const dailyActivity = await db_1.db
            .select({
            date: (0, drizzle_orm_1.sql) `DATE(${schema_1.documents.createdAt})`,
            documents: (0, drizzle_orm_1.sql) `count(*)`
        })
            .from(schema_1.documents)
            .where((0, drizzle_orm_1.gte)(schema_1.documents.createdAt, last7Days))
            .groupBy((0, drizzle_orm_1.sql) `DATE(${schema_1.documents.createdAt})`)
            .orderBy((0, drizzle_orm_1.sql) `DATE(${schema_1.documents.createdAt})`);
        // Últimos documentos creados
        const recentDocuments = await db_1.db
            .select({
            id: schema_1.documents.id,
            title: schema_1.documents.title,
            status: schema_1.documents.status,
            createdAt: schema_1.documents.createdAt,
            userId: schema_1.documents.userId
        })
            .from(schema_1.documents)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.documents.createdAt))
            .limit(5);
        // Últimas verificaciones de identidad
        const recentVerifications = await db_1.db
            .select({
            id: schema_1.identityVerifications.id,
            status: schema_1.identityVerifications.status,
            createdAt: schema_1.identityVerifications.createdAt,
            userId: schema_1.identityVerifications.userId
        })
            .from(schema_1.identityVerifications)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.identityVerifications.createdAt))
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
    }
    catch (error) {
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
realDataRouter.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', role = '' } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let query = db_1.db
            .select({
            id: schema_1.users.id,
            username: schema_1.users.username,
            fullName: schema_1.users.fullName,
            email: schema_1.users.email,
            role: schema_1.users.role,
            platform: schema_1.users.platform,
            createdAt: schema_1.users.createdAt
        })
            .from(schema_1.users);
        // Filtros
        const conditions = [];
        if (search) {
            conditions.push((0, drizzle_orm_1.sql) `(${schema_1.users.username} ILIKE ${`%${search}%`} OR ${schema_1.users.fullName} ILIKE ${`%${search}%`} OR ${schema_1.users.email} ILIKE ${`%${search}%`})`);
        }
        if (role) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.users.role, role));
        }
        if (conditions.length > 0) {
            query = query.where((0, drizzle_orm_1.and)(...conditions));
        }
        const usersList = await query
            .orderBy((0, drizzle_orm_1.desc)(schema_1.users.createdAt))
            .limit(Number(limit))
            .offset(offset);
        // Contar total para paginación
        const totalCount = await db_1.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(schema_1.users)
            .where(conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined);
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
    }
    catch (error) {
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
realDataRouter.get('/documents', async (req, res) => {
    try {
        const { status = '', limit = 10, userId } = req.query;
        let query = db_1.db
            .select({
            id: schema_1.documents.id,
            title: schema_1.documents.title,
            status: schema_1.documents.status,
            documentType: schema_1.documents.documentType,
            createdAt: schema_1.documents.createdAt,
            updatedAt: schema_1.documents.updatedAt,
            userId: schema_1.documents.userId
        })
            .from(schema_1.documents);
        const conditions = [];
        if (status) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.documents.status, status));
        }
        if (userId) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.documents.userId, Number(userId)));
        }
        if (conditions.length > 0) {
            query = query.where((0, drizzle_orm_1.and)(...conditions));
        }
        const documentsList = await query
            .orderBy((0, drizzle_orm_1.desc)(schema_1.documents.createdAt))
            .limit(Number(limit));
        // Obtener información del usuario para cada documento
        const documentsWithUser = await Promise.all(documentsList.map(async (doc) => {
            const [user] = await db_1.db
                .select({
                id: schema_1.users.id,
                username: schema_1.users.username,
                fullName: schema_1.users.fullName,
                email: schema_1.users.email
            })
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, doc.userId));
            return {
                ...doc,
                user
            };
        }));
        res.json({
            success: true,
            documents: documentsWithUser
        });
    }
    catch (error) {
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
realDataRouter.get('/analytics', async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const startDate = (0, date_fns_1.subDays)(new Date(), Number(days));
        // Eventos de analytics por tipo
        const eventsByType = await db_1.db
            .select({
            eventType: schema_1.analyticsEvents.eventType,
            count: (0, drizzle_orm_1.sql) `count(*)`
        })
            .from(schema_1.analyticsEvents)
            .where((0, drizzle_orm_1.gte)(schema_1.analyticsEvents.createdAt, startDate))
            .groupBy(schema_1.analyticsEvents.eventType);
        // Actividad por día
        const dailyEvents = await db_1.db
            .select({
            date: (0, drizzle_orm_1.sql) `DATE(${schema_1.analyticsEvents.createdAt})`,
            count: (0, drizzle_orm_1.sql) `count(*)`
        })
            .from(schema_1.analyticsEvents)
            .where((0, drizzle_orm_1.gte)(schema_1.analyticsEvents.createdAt, startDate))
            .groupBy((0, drizzle_orm_1.sql) `DATE(${schema_1.analyticsEvents.createdAt})`)
            .orderBy((0, drizzle_orm_1.sql) `DATE(${schema_1.analyticsEvents.createdAt})`);
        res.json({
            success: true,
            analytics: {
                eventsByType,
                dailyEvents,
                period: `${days} días`
            }
        });
    }
    catch (error) {
        console.error('Error al obtener analytics reales:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener analytics'
        });
    }
});
