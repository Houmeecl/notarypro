"use strict";
/**
 * DASHBOARD DE ADMINISTRACIÓN REAL COMPLETO
 * Panel de administración con datos reales de base de datos
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.realAdminRouter = void 0;
const express_1 = __importDefault(require("express"));
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("@shared/schema");
const jwt_auth_service_1 = require("./services/jwt-auth-service");
const date_fns_1 = require("date-fns");
const realAdminRouter = express_1.default.Router();
exports.realAdminRouter = realAdminRouter;
// Middleware de autenticación admin
realAdminRouter.use(jwt_auth_service_1.authenticateJWT);
realAdminRouter.use(jwt_auth_service_1.requireAdmin);
/**
 * GET /api/real-admin/dashboard
 * Dashboard principal con métricas reales
 */
realAdminRouter.get('/dashboard', async (req, res) => {
    try {
        const today = new Date();
        const yesterday = (0, date_fns_1.subDays)(today, 1);
        const last7Days = (0, date_fns_1.subDays)(today, 7);
        const last30Days = (0, date_fns_1.subDays)(today, 30);
        const lastMonth = (0, date_fns_1.subMonths)(today, 1);
        // Métricas principales
        const [totalUsers, totalDocuments, totalVerifications, todayUsers, todayDocuments, weeklyDocuments, monthlyUsers] = await Promise.all([
            // Total de usuarios
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.users),
            // Total de documentos
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.documents),
            // Total de verificaciones
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.identityVerifications),
            // Usuarios registrados hoy
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema_1.users)
                .where((0, drizzle_orm_1.gte)(schema_1.users.createdAt, (0, date_fns_1.startOfDay)(today))),
            // Documentos subidos hoy
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema_1.documents)
                .where((0, drizzle_orm_1.gte)(schema_1.documents.createdAt, (0, date_fns_1.startOfDay)(today))),
            // Documentos de la semana
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema_1.documents)
                .where((0, drizzle_orm_1.gte)(schema_1.documents.createdAt, last7Days)),
            // Usuarios del mes
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema_1.users)
                .where((0, drizzle_orm_1.gte)(schema_1.users.createdAt, last30Days))
        ]);
        // Distribución de usuarios por rol
        const usersByRole = await db_1.db
            .select({
            role: schema_1.users.role,
            count: (0, drizzle_orm_1.sql) `count(*)`
        })
            .from(schema_1.users)
            .groupBy(schema_1.users.role)
            .orderBy((0, drizzle_orm_1.sql) `count(*) DESC`);
        // Documentos por estado
        const documentsByStatus = await db_1.db
            .select({
            status: schema_1.documents.status,
            count: (0, drizzle_orm_1.sql) `count(*)`
        })
            .from(schema_1.documents)
            .groupBy(schema_1.documents.status)
            .orderBy((0, drizzle_orm_1.sql) `count(*) DESC`);
        // Documentos por tipo
        const documentsByType = await db_1.db
            .select({
            type: schema_1.documents.documentType,
            count: (0, drizzle_orm_1.sql) `count(*)`
        })
            .from(schema_1.documents)
            .groupBy(schema_1.documents.documentType)
            .orderBy((0, drizzle_orm_1.sql) `count(*) DESC`)
            .limit(10);
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
        // Usuarios más activos
        const activeUsers = await db_1.db
            .select({
            userId: schema_1.documents.userId,
            userName: schema_1.users.fullName,
            userEmail: schema_1.users.email,
            documentCount: (0, drizzle_orm_1.sql) `count(*)`
        })
            .from(schema_1.documents)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.documents.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.gte)(schema_1.documents.createdAt, last30Days))
            .groupBy(schema_1.documents.userId, schema_1.users.fullName, schema_1.users.email)
            .orderBy((0, drizzle_orm_1.sql) `count(*) DESC`)
            .limit(5);
        // Últimos documentos
        const recentDocuments = await db_1.db
            .select({
            id: schema_1.documents.id,
            title: schema_1.documents.title,
            documentType: schema_1.documents.documentType,
            status: schema_1.documents.status,
            createdAt: schema_1.documents.createdAt,
            userName: schema_1.users.fullName,
            userEmail: schema_1.users.email
        })
            .from(schema_1.documents)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.documents.userId, schema_1.users.id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.documents.createdAt))
            .limit(10);
        // Últimas verificaciones de identidad
        const recentVerifications = await db_1.db
            .select({
            id: schema_1.identityVerifications.id,
            status: schema_1.identityVerifications.status,
            verificationType: schema_1.identityVerifications.verificationType,
            createdAt: schema_1.identityVerifications.createdAt,
            userId: schema_1.identityVerifications.userId,
            userName: schema_1.users.fullName
        })
            .from(schema_1.identityVerifications)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.identityVerifications.userId, schema_1.users.id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.identityVerifications.createdAt))
            .limit(10);
        // Cálculo de tendencias
        const calculateTrend = (current, previous) => {
            if (previous === 0)
                return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };
        // Datos del mes anterior para comparación
        const [lastMonthUsers] = await db_1.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.users.createdAt, (0, date_fns_1.subMonths)(lastMonth, 1)), (0, drizzle_orm_1.lte)(schema_1.users.createdAt, lastMonth)));
        const [lastMonthDocuments] = await db_1.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(schema_1.documents)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.documents.createdAt, (0, date_fns_1.subMonths)(lastMonth, 1)), (0, drizzle_orm_1.lte)(schema_1.documents.createdAt, lastMonth)));
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
    }
    catch (error) {
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
realAdminRouter.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', role = '', platform = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        // Construir query base
        let query = db_1.db
            .select({
            id: schema_1.users.id,
            username: schema_1.users.username,
            fullName: schema_1.users.fullName,
            email: schema_1.users.email,
            role: schema_1.users.role,
            platform: schema_1.users.platform,
            businessName: schema_1.users.businessName,
            address: schema_1.users.address,
            region: schema_1.users.region,
            comuna: schema_1.users.comuna,
            createdAt: schema_1.users.createdAt,
            // Contar documentos del usuario
            documentCount: (0, drizzle_orm_1.sql) `(
          SELECT COUNT(*) 
          FROM ${schema_1.documents} 
          WHERE ${schema_1.documents.userId} = ${schema_1.users.id}
        )`
        })
            .from(schema_1.users);
        // Aplicar filtros
        const conditions = [];
        if (search) {
            conditions.push(or(like(schema_1.users.username, `%${search}%`), like(schema_1.users.fullName, `%${search}%`), like(schema_1.users.email, `%${search}%`)));
        }
        if (role) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.users.role, role));
        }
        if (platform) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.users.platform, platform));
        }
        if (conditions.length > 0) {
            query = query.where((0, drizzle_orm_1.and)(...conditions));
        }
        // Aplicar ordenamiento
        const orderColumn = sortBy === 'fullName' ? schema_1.users.fullName :
            sortBy === 'email' ? schema_1.users.email :
                sortBy === 'role' ? schema_1.users.role : schema_1.users.createdAt;
        const orderDirection = sortOrder === 'asc' ? orderColumn : (0, drizzle_orm_1.desc)(orderColumn);
        const usersList = await query
            .orderBy(orderDirection)
            .limit(Number(limit))
            .offset(offset);
        // Contar total para paginación
        const [totalResult] = await db_1.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(schema_1.users)
            .where(conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined);
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
    }
    catch (error) {
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
realAdminRouter.put('/users/:id', async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const { fullName, email, role, platform, businessName, address, region, comuna } = req.body;
        const [updatedUser] = await db_1.db
            .update(schema_1.users)
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
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId))
            .returning({
            id: schema_1.users.id,
            username: schema_1.users.username,
            fullName: schema_1.users.fullName,
            email: schema_1.users.email,
            role: schema_1.users.role,
            platform: schema_1.users.platform
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
    }
    catch (error) {
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
realAdminRouter.get('/analytics', async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const days = Number(period);
        const startDate = (0, date_fns_1.subDays)(new Date(), days);
        // Eventos de analytics por tipo
        const eventsByType = await db_1.db
            .select({
            eventType: schema_1.analyticsEvents.eventType,
            count: (0, drizzle_orm_1.sql) `count(*)`
        })
            .from(schema_1.analyticsEvents)
            .where((0, drizzle_orm_1.gte)(schema_1.analyticsEvents.createdAt, startDate))
            .groupBy(schema_1.analyticsEvents.eventType)
            .orderBy((0, drizzle_orm_1.sql) `count(*) DESC`);
        // Actividad por día
        const dailyEvents = await db_1.db
            .select({
            date: (0, drizzle_orm_1.sql) `DATE(${schema_1.analyticsEvents.createdAt})`,
            events: (0, drizzle_orm_1.sql) `count(*)`
        })
            .from(schema_1.analyticsEvents)
            .where((0, drizzle_orm_1.gte)(schema_1.analyticsEvents.createdAt, startDate))
            .groupBy((0, drizzle_orm_1.sql) `DATE(${schema_1.analyticsEvents.createdAt})`)
            .orderBy((0, drizzle_orm_1.sql) `DATE(${schema_1.analyticsEvents.createdAt})`);
        // Usuarios más activos
        const activeUsers = await db_1.db
            .select({
            userId: schema_1.analyticsEvents.userId,
            userName: schema_1.users.fullName,
            eventCount: (0, drizzle_orm_1.sql) `count(*)`
        })
            .from(schema_1.analyticsEvents)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.analyticsEvents.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.gte)(schema_1.analyticsEvents.createdAt, startDate))
            .groupBy(schema_1.analyticsEvents.userId, schema_1.users.fullName)
            .orderBy((0, drizzle_orm_1.sql) `count(*) DESC`)
            .limit(10);
        // Documentos por estado en el período
        const documentStatusTrend = await db_1.db
            .select({
            status: schema_1.documents.status,
            count: (0, drizzle_orm_1.sql) `count(*)`
        })
            .from(schema_1.documents)
            .where((0, drizzle_orm_1.gte)(schema_1.documents.createdAt, startDate))
            .groupBy(schema_1.documents.status);
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
    }
    catch (error) {
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
realAdminRouter.get('/system-health', async (req, res) => {
    try {
        // Verificar conexión a base de datos
        const [dbTest] = await db_1.db.select({ count: (0, drizzle_orm_1.sql) `1` }).from(schema_1.users).limit(1);
        const dbHealthy = !!dbTest;
        // Verificar integridad de archivos
        const [documentsWithFiles] = await db_1.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(schema_1.documents)
            .where((0, drizzle_orm_1.sql) `${schema_1.documents.filePath} IS NOT NULL`);
        let filesHealthy = true;
        let missingFiles = 0;
        // Verificar algunos archivos aleatorios
        const [sampleDocuments] = await db_1.db
            .select({ filePath: schema_1.documents.filePath })
            .from(schema_1.documents)
            .where((0, drizzle_orm_1.sql) `${schema_1.documents.filePath} IS NOT NULL`)
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
                    const filePath = path.join(uploadsDir, file);
                    const stat = fs.statSync(filePath);
                    if (stat.isFile()) {
                        uploadsDirSize += stat.size;
                    }
                }
                catch (e) {
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
    }
    catch (error) {
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
realAdminRouter.post('/create-sample-data', async (req, res) => {
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
                const [existingUser] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.username, userData.username));
                if (!existingUser) {
                    await db_1.db.insert(schema_1.users).values({
                        ...userData,
                        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
                    });
                    createdData.users++;
                }
            }
            catch (e) {
                console.log(`Usuario ${userData.username} ya existe o error al crear`);
            }
        }
        // Crear eventos de analytics de muestra
        const eventTypes = ['document_uploaded', 'document_certified', 'user_login', 'identity_verified'];
        for (let i = 0; i < 50; i++) {
            try {
                await db_1.db.insert(schema_1.analyticsEvents).values({
                    eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
                    userId: Math.floor(Math.random() * 5) + 1,
                    metadata: { sample: true },
                    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
                });
                createdData.analytics++;
            }
            catch (e) {
                // Ignorar errores de eventos duplicados
            }
        }
        res.json({
            success: true,
            message: 'Datos de muestra creados exitosamente',
            created: createdData
        });
    }
    catch (error) {
        console.error('Error creando datos de muestra:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear datos de muestra'
        });
    }
});
// Función auxiliar para formatear uptime
function formatUptime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    }
    else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    else {
        return `${minutes}m`;
    }
}
