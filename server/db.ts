import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { InsertAnalyticsEvent, AnalyticsEvent } from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Add the analytics methods to the DatabaseStorage class in storage.ts
// These need to be implemented to match the new interface methods

// These helper methods can be called from the DatabaseStorage class
export async function createAnalyticsEvent(insertEvent: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
  const [event] = await db
    .insert(schema.analyticsEvents)
    .values(insertEvent)
    .returning();
  return event;
}

export async function getAnalyticsEvents(options?: { 
  startDate?: Date; 
  endDate?: Date; 
  eventType?: string; 
  userId?: number;
}): Promise<AnalyticsEvent[]> {
  let query = db.select().from(schema.analyticsEvents);
  
  if (options) {
    if (options.startDate) {
      query = query.where(sql`${schema.analyticsEvents.createdAt} >= ${options.startDate}`);
    }
    
    if (options.endDate) {
      query = query.where(sql`${schema.analyticsEvents.createdAt} <= ${options.endDate}`);
    }
    
    if (options.eventType) {
      query = query.where(eq(schema.analyticsEvents.eventType, options.eventType));
    }
    
    if (options.userId) {
      query = query.where(eq(schema.analyticsEvents.userId, options.userId));
    }
  }
  
  const events = await query.orderBy(sql`${schema.analyticsEvents.createdAt} DESC`);
  return events;
}

export async function getDailyEventCounts(options?: { 
  startDate?: Date; 
  endDate?: Date;
  eventType?: string; 
}): Promise<{ date: string; count: number }[]> {
  let query = db.select({
    date: sql`DATE(${schema.analyticsEvents.createdAt})`,
    count: sql`COUNT(*)`,
  })
  .from(schema.analyticsEvents);
  
  if (options) {
    if (options.startDate) {
      query = query.where(sql`${schema.analyticsEvents.createdAt} >= ${options.startDate}`);
    }
    
    if (options.endDate) {
      query = query.where(sql`${schema.analyticsEvents.createdAt} <= ${options.endDate}`);
    }
    
    if (options.eventType) {
      query = query.where(eq(schema.analyticsEvents.eventType, options.eventType));
    }
  }
  
  const results = await query.groupBy(sql`DATE(${schema.analyticsEvents.createdAt})`)
    .orderBy(sql`DATE(${schema.analyticsEvents.createdAt})`);
  
  return results.map(r => ({
    date: r.date.toString(),
    count: Number(r.count)
  }));
}

export async function getUserActivityStats(): Promise<{ 
  totalUsers: number; 
  newUsersToday: number; 
  newUsersThisWeek: number; 
  newUsersThisMonth: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [totalCount] = await db
    .select({ count: sql`COUNT(*)` })
    .from(schema.users);
  
  const [todayCount] = await db
    .select({ count: sql`COUNT(*)` })
    .from(schema.users)
    .where(sql`${schema.users.createdAt} >= ${today}`);
  
  const [weekCount] = await db
    .select({ count: sql`COUNT(*)` })
    .from(schema.users)
    .where(sql`${schema.users.createdAt} >= ${oneWeekAgo}`);
  
  const [monthCount] = await db
    .select({ count: sql`COUNT(*)` })
    .from(schema.users)
    .where(sql`${schema.users.createdAt} >= ${startOfMonth}`);
  
  return {
    totalUsers: Number(totalCount.count),
    newUsersToday: Number(todayCount.count),
    newUsersThisWeek: Number(weekCount.count),
    newUsersThisMonth: Number(monthCount.count)
  };
}

export async function getDocumentStats(): Promise<{ 
  totalDocuments: number; 
  documentsCreatedToday: number; 
  documentsByStatus: Record<string, number>;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [totalCount] = await db
    .select({ count: sql`COUNT(*)` })
    .from(schema.documents);
  
  const [todayCount] = await db
    .select({ count: sql`COUNT(*)` })
    .from(schema.documents)
    .where(sql`${schema.documents.createdAt} >= ${today}`);
  
  const statusCounts = await db
    .select({
      status: schema.documents.status,
      count: sql`COUNT(*)`
    })
    .from(schema.documents)
    .groupBy(schema.documents.status);
  
  const documentsByStatus: Record<string, number> = {};
  
  statusCounts.forEach(item => {
    documentsByStatus[item.status] = Number(item.count);
  });
  
  return {
    totalDocuments: Number(totalCount.count),
    documentsCreatedToday: Number(todayCount.count),
    documentsByStatus
  };
}

export async function getRevenueStats(): Promise<{
  totalRevenue: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  documentRevenue: number;
  courseRevenue: number;
  videoCallRevenue: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // Calculate document revenue
  const [documentTotal] = await db
    .select({ total: sql`COALESCE(SUM(${schema.documents.paymentAmount}), 0)` })
    .from(schema.documents)
    .where(eq(schema.documents.paymentStatus, 'completed'));
  
  // Calculate video call revenue
  const [videoCallTotal] = await db
    .select({ total: sql`COALESCE(SUM(${schema.videoCallSessions.paymentAmount}), 0)` })
    .from(schema.videoCallSessions)
    .where(eq(schema.videoCallSessions.paymentStatus, 'completed'));
  
  // Calculate today's revenue
  const [todayTotal] = await db
    .select({ total: sql`COALESCE(SUM(${schema.documents.paymentAmount}), 0)` })
    .from(schema.documents)
    .where(and(
      eq(schema.documents.paymentStatus, 'completed'),
      sql`${schema.documents.updatedAt} >= ${today}`
    ));
  
  // Calculate week's revenue
  const [weekTotal] = await db
    .select({ total: sql`COALESCE(SUM(${schema.documents.paymentAmount}), 0)` })
    .from(schema.documents)
    .where(and(
      eq(schema.documents.paymentStatus, 'completed'),
      sql`${schema.documents.updatedAt} >= ${oneWeekAgo}`
    ));
  
  // Calculate month's revenue
  const [monthTotal] = await db
    .select({ total: sql`COALESCE(SUM(${schema.documents.paymentAmount}), 0)` })
    .from(schema.documents)
    .where(and(
      eq(schema.documents.paymentStatus, 'completed'),
      sql`${schema.documents.updatedAt} >= ${startOfMonth}`
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