import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and, sql } from "drizzle-orm";
import { pgTable, text, timestamp, integer, varchar, boolean, serial, decimal } from 'drizzle-orm/pg-core';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// ✅ Definición de esquemas directamente aquí (reemplazando @shared/schema)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }),
  role: varchar('role', { length: 50 }).default('user'),
  platform: varchar('platform', { length: 50 }).default('notary'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const partners = pgTable('partners', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  phone: varchar('phone', { length: 50 }),
  code: varchar('code', { length: 100 }).unique(),
  status: varchar('status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  userId: integer('user_id').references(() => users.id),
  status: varchar('status', { length: 50 }).default('draft'),
  paymentAmount: decimal('payment_amount', { precision: 10, scale: 2 }),
  paymentStatus: varchar('payment_status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const videoCallSessions = pgTable('video_call_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  duration: integer('duration'), // en minutos
  paymentAmount: decimal('payment_amount', { precision: 10, scale: 2 }),
  paymentStatus: varchar('payment_status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const analyticsEvents = pgTable('analytics_events', {
  id: serial('id').primaryKey(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  userId: integer('user_id'),
  data: text('data'), // JSON string
  createdAt: timestamp('created_at').defaultNow(),
  platform: varchar('platform', { length: 50 }).default('notary')
});

// ✅ Tipos de TypeScript
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;

// ✅ Schema object para drizzle
const schema = {
  users,
  partners,
  documents,
  videoCallSessions,
  analyticsEvents
};

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// Analytics methods
export async function createAnalyticsEvent(insertEvent: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
  const [event] = await db
    .insert(analyticsEvents)
    .values(insertEvent)
    .returning();
  return event;
}

export async function getAnalyticsEvents(options?: { 
  startDate?: Date; 
  endDate?: Date;
  eventType?: string; 
  userId?: number;
}) {
  const conditions = [];
  
  if (options) {
    if (options.startDate) {
      conditions.push(sql`${analyticsEvents.createdAt} >= ${options.startDate}`);
    }
    
    if (options.endDate) {
      conditions.push(sql`${analyticsEvents.createdAt} <= ${options.endDate}`);
    }
    
    if (options.eventType) {
      conditions.push(eq(analyticsEvents.eventType, options.eventType));
    }
    
    if (options.userId) {
      conditions.push(eq(analyticsEvents.userId, options.userId));
    }
  }
  
  let query = db.select().from(analyticsEvents);
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  const events = await query.orderBy(sql`${analyticsEvents.createdAt} DESC`);
  return events;
}

export async function getDailyEventCounts(options?: { 
  startDate?: Date; 
  endDate?: Date;
  eventType?: string; 
}) {
  const conditions = [];
  
  if (options) {
    if (options.startDate) {
      conditions.push(sql`${analyticsEvents.createdAt} >= ${options.startDate}`);
    }
    
    if (options.endDate) {
      conditions.push(sql`${analyticsEvents.createdAt} <= ${options.endDate}`);
    }
    
    if (options.eventType) {
      conditions.push(eq(analyticsEvents.eventType, options.eventType));
    }
  }
  
  let query = db.select({
    date: sql`DATE(${analyticsEvents.createdAt})`,
    count: sql`COUNT(*)`,
  })
  .from(analyticsEvents);
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  const results = await query.groupBy(sql`DATE(${analyticsEvents.createdAt})`)
    .orderBy(sql`DATE(${analyticsEvents.createdAt})`);
  
  return results.map(r => ({
    date: String(r.date),
    count: Number(r.count)
  }));
}

export async function getUserActivityStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [totalCount] = await db
    .select({ count: sql`COUNT(*)` })
    .from(users);
  
  const [todayCount] = await db
    .select({ count: sql`COUNT(*)` })
    .from(users)
    .where(sql`${users.createdAt} >= ${today}`);
  
  const [weekCount] = await db
    .select({ count: sql`COUNT(*)` })
    .from(users)
    .where(sql`${users.createdAt} >= ${oneWeekAgo}`);
  
  const [monthCount] = await db
    .select({ count: sql`COUNT(*)` })
    .from(users)
    .where(sql`${users.createdAt} >= ${startOfMonth}`);
  
  return {
    totalUsers: Number(totalCount.count),
    newUsersToday: Number(todayCount.count),
    newUsersThisWeek: Number(weekCount.count),
    newUsersThisMonth: Number(monthCount.count)
  };
}

export async function getDocumentStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [totalCount] = await db
    .select({ count: sql`COUNT(*)` })
    .from(documents);
  
  const [todayCount] = await db
    .select({ count: sql`COUNT(*)` })
    .from(documents)
    .where(sql`${documents.createdAt} >= ${today}`);
  
  const statusCounts = await db
    .select({
      status: documents.status,
      count: sql`COUNT(*)`
    })
    .from(documents)
    .groupBy(documents.status);
  
  const documentsByStatus: Record<string, number> = {};
  
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

export async function getRevenueStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // Calculate document revenue
  const [documentTotal] = await db
    .select({ total: sql`COALESCE(SUM(${documents.paymentAmount}), 0)` })
    .from(documents)
    .where(eq(documents.paymentStatus, 'completed'));
  
  // Calculate video call revenue
  const [videoCallTotal] = await db
    .select({ total: sql`COALESCE(SUM(${videoCallSessions.paymentAmount}), 0)` })
    .from(videoCallSessions)
    .where(eq(videoCallSessions.paymentStatus, 'completed'));
  
  // Calculate today's revenue
  const [todayTotal] = await db
    .select({ total: sql`COALESCE(SUM(${documents.paymentAmount}), 0)` })
    .from(documents)
    .where(and(
      eq(documents.paymentStatus, 'completed'),
      sql`${documents.updatedAt} >= ${today}`
    ));
  
  // Calculate week's revenue
  const [weekTotal] = await db
    .select({ total: sql`COALESCE(SUM(${documents.paymentAmount}), 0)` })
    .from(documents)
    .where(and(
      eq(documents.paymentStatus, 'completed'),
      sql`${documents.updatedAt} >= ${oneWeekAgo}`
    ));
  
  // Calculate month's revenue
  const [monthTotal] = await db
    .select({ total: sql`COALESCE(SUM(${documents.paymentAmount}), 0)` })
    .from(documents)
    .where(and(
      eq(documents.paymentStatus, 'completed'),
      sql`${documents.updatedAt} >= ${startOfMonth}`
    ));
  
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