"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.pool = exports.analyticsEvents = exports.videoCallSessions = exports.documents = exports.partners = exports.users = void 0;
exports.createAnalyticsEvent = createAnalyticsEvent;
exports.getAnalyticsEvents = getAnalyticsEvents;
exports.getDailyEventCounts = getDailyEventCounts;
exports.getUserActivityStats = getUserActivityStats;
exports.getDocumentStats = getDocumentStats;
exports.getRevenueStats = getRevenueStats;
const pg_1 = require("pg");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}
// ✅ Definición de esquemas directamente aquí (reemplazando @shared/schema)
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    username: (0, pg_core_1.varchar)('username', { length: 255 }).notNull().unique(),
    password: (0, pg_core_1.varchar)('password', { length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull(),
    fullName: (0, pg_core_1.varchar)('full_name', { length: 255 }),
    role: (0, pg_core_1.varchar)('role', { length: 50 }).default('user'),
    platform: (0, pg_core_1.varchar)('platform', { length: 50 }).default('notary'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
exports.partners = (0, pg_core_1.pgTable)('partners', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    address: (0, pg_core_1.text)('address'),
    phone: (0, pg_core_1.varchar)('phone', { length: 50 }),
    code: (0, pg_core_1.varchar)('code', { length: 100 }).unique(),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).default('pending'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
exports.documents = (0, pg_core_1.pgTable)('documents', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    content: (0, pg_core_1.text)('content'),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).default('draft'),
    paymentAmount: (0, pg_core_1.decimal)('payment_amount', { precision: 10, scale: 2 }),
    paymentStatus: (0, pg_core_1.varchar)('payment_status', { length: 50 }).default('pending'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
exports.videoCallSessions = (0, pg_core_1.pgTable)('video_call_sessions', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id),
    duration: (0, pg_core_1.integer)('duration'), // en minutos
    paymentAmount: (0, pg_core_1.decimal)('payment_amount', { precision: 10, scale: 2 }),
    paymentStatus: (0, pg_core_1.varchar)('payment_status', { length: 50 }).default('pending'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
exports.analyticsEvents = (0, pg_core_1.pgTable)('analytics_events', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    eventType: (0, pg_core_1.varchar)('event_type', { length: 100 }).notNull(),
    userId: (0, pg_core_1.integer)('user_id'),
    data: (0, pg_core_1.text)('data'), // JSON string
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    platform: (0, pg_core_1.varchar)('platform', { length: 50 }).default('notary')
});
// ✅ Schema object para drizzle
const schema = {
    users: exports.users,
    partners: exports.partners,
    documents: exports.documents,
    videoCallSessions: exports.videoCallSessions,
    analyticsEvents: exports.analyticsEvents
};
exports.pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
exports.db = (0, node_postgres_1.drizzle)(exports.pool, { schema });
// Analytics methods
async function createAnalyticsEvent(insertEvent) {
    const [event] = await exports.db
        .insert(exports.analyticsEvents)
        .values(insertEvent)
        .returning();
    return event;
}
async function getAnalyticsEvents(options) {
    const conditions = [];
    if (options) {
        if (options.startDate) {
            conditions.push((0, drizzle_orm_1.sql) `${exports.analyticsEvents.createdAt} >= ${options.startDate}`);
        }
        if (options.endDate) {
            conditions.push((0, drizzle_orm_1.sql) `${exports.analyticsEvents.createdAt} <= ${options.endDate}`);
        }
        if (options.eventType) {
            conditions.push((0, drizzle_orm_1.eq)(exports.analyticsEvents.eventType, options.eventType));
        }
        if (options.userId) {
            conditions.push((0, drizzle_orm_1.eq)(exports.analyticsEvents.userId, options.userId));
        }
    }
    let query = exports.db.select().from(exports.analyticsEvents);
    if (conditions.length > 0) {
        query = query.where((0, drizzle_orm_1.and)(...conditions));
    }
    const events = await query.orderBy((0, drizzle_orm_1.sql) `${exports.analyticsEvents.createdAt} DESC`);
    return events;
}
async function getDailyEventCounts(options) {
    const conditions = [];
    if (options) {
        if (options.startDate) {
            conditions.push((0, drizzle_orm_1.sql) `${exports.analyticsEvents.createdAt} >= ${options.startDate}`);
        }
        if (options.endDate) {
            conditions.push((0, drizzle_orm_1.sql) `${exports.analyticsEvents.createdAt} <= ${options.endDate}`);
        }
        if (options.eventType) {
            conditions.push((0, drizzle_orm_1.eq)(exports.analyticsEvents.eventType, options.eventType));
        }
    }
    let query = exports.db.select({
        date: (0, drizzle_orm_1.sql) `DATE(${exports.analyticsEvents.createdAt})`,
        count: (0, drizzle_orm_1.sql) `COUNT(*)`,
    })
        .from(exports.analyticsEvents);
    if (conditions.length > 0) {
        query = query.where((0, drizzle_orm_1.and)(...conditions));
    }
    const results = await query.groupBy((0, drizzle_orm_1.sql) `DATE(${exports.analyticsEvents.createdAt})`)
        .orderBy((0, drizzle_orm_1.sql) `DATE(${exports.analyticsEvents.createdAt})`);
    return results.map(r => ({
        date: String(r.date),
        count: Number(r.count)
    }));
}
async function getUserActivityStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [totalCount] = await exports.db
        .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
        .from(exports.users);
    const [todayCount] = await exports.db
        .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
        .from(exports.users)
        .where((0, drizzle_orm_1.sql) `${exports.users.createdAt} >= ${today}`);
    const [weekCount] = await exports.db
        .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
        .from(exports.users)
        .where((0, drizzle_orm_1.sql) `${exports.users.createdAt} >= ${oneWeekAgo}`);
    const [monthCount] = await exports.db
        .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
        .from(exports.users)
        .where((0, drizzle_orm_1.sql) `${exports.users.createdAt} >= ${startOfMonth}`);
    return {
        totalUsers: Number(totalCount.count),
        newUsersToday: Number(todayCount.count),
        newUsersThisWeek: Number(weekCount.count),
        newUsersThisMonth: Number(monthCount.count)
    };
}
async function getDocumentStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [totalCount] = await exports.db
        .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
        .from(exports.documents);
    const [todayCount] = await exports.db
        .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
        .from(exports.documents)
        .where((0, drizzle_orm_1.sql) `${exports.documents.createdAt} >= ${today}`);
    const statusCounts = await exports.db
        .select({
        status: exports.documents.status,
        count: (0, drizzle_orm_1.sql) `COUNT(*)`
    })
        .from(exports.documents)
        .groupBy(exports.documents.status);
    const documentsByStatus = {};
    statusCounts.forEach(item => {
        if (item.status) {
            documentsByStatus[item.status] = Number(item.count);
        }
    });
    return {
        totalDocuments: Number(totalCount.count),
        documentsCreatedToday: Number(todayCount.count),
        documentsByStatus
    };
}
async function getRevenueStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    // Calculate document revenue
    const [documentTotal] = await exports.db
        .select({ total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${exports.documents.paymentAmount}), 0)` })
        .from(exports.documents)
        .where((0, drizzle_orm_1.eq)(exports.documents.paymentStatus, 'completed'));
    // Calculate video call revenue
    const [videoCallTotal] = await exports.db
        .select({ total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${exports.videoCallSessions.paymentAmount}), 0)` })
        .from(exports.videoCallSessions)
        .where((0, drizzle_orm_1.eq)(exports.videoCallSessions.paymentStatus, 'completed'));
    // Calculate today's revenue
    const [todayTotal] = await exports.db
        .select({ total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${exports.documents.paymentAmount}), 0)` })
        .from(exports.documents)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(exports.documents.paymentStatus, 'completed'), (0, drizzle_orm_1.sql) `${exports.documents.updatedAt} >= ${today}`));
    // Calculate week's revenue
    const [weekTotal] = await exports.db
        .select({ total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${exports.documents.paymentAmount}), 0)` })
        .from(exports.documents)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(exports.documents.paymentStatus, 'completed'), (0, drizzle_orm_1.sql) `${exports.documents.updatedAt} >= ${oneWeekAgo}`));
    // Calculate month's revenue
    const [monthTotal] = await exports.db
        .select({ total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${exports.documents.paymentAmount}), 0)` })
        .from(exports.documents)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(exports.documents.paymentStatus, 'completed'), (0, drizzle_orm_1.sql) `${exports.documents.updatedAt} >= ${startOfMonth}`));
    // For course revenue, we can add this later if needed
    const courseRevenue = 0;
    const documentRevenue = Number(documentTotal.total);
    const videoCallRevenue = Number(videoCallTotal.total);
    return {
        totalRevenue: documentRevenue + courseRevenue + videoCallRevenue,
        revenueToday: Number(todayTotal.total),
        revenueThisWeek: Number(weekTotal.total),
        revenueThisMonth: Number(monthTotal.total),
        documentRevenue,
        courseRevenue,
        videoCallRevenue
    };
}
