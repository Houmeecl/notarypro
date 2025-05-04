import { pgEnum, pgTable, serial, varchar, boolean, timestamp, integer, decimal, text } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Definición de tablas

export const posDevices = pgTable('pos_devices', {
  id: serial('id').primaryKey(),
  deviceCode: varchar('device_code', { length: 20 }).notNull().unique(),
  deviceName: varchar('device_name', { length: 100 }).notNull(),
  deviceType: varchar('device_type', { length: 50 }).notNull(),
  deviceModel: varchar('device_model', { length: 50 }),
  storeId: integer('store_id'),
  location: varchar('location', { length: 100 }),
  isActive: boolean('is_active').default(true),
  isDemo: boolean('is_demo').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  lastActive: timestamp('last_active')
});

export const posSessions = pgTable('pos_sessions', {
  id: serial('id').primaryKey(),
  deviceCode: varchar('device_code', { length: 20 }).notNull().references(() => posDevices.deviceCode),
  sessionCode: varchar('session_code', { length: 20 }).notNull().unique(),
  openingUserId: integer('opening_user_id').notNull(),
  closingUserId: integer('closing_user_id'),
  openingTime: timestamp('opening_time').defaultNow(),
  closingTime: timestamp('closing_time'),
  initialAmount: decimal('initial_amount', { precision: 10, scale: 2 }).default('0'),
  finalAmount: decimal('final_amount', { precision: 10, scale: 2 }),
  totalTransactions: integer('total_transactions').default(0),
  totalSales: decimal('total_sales', { precision: 10, scale: 2 }).default('0'),
  status: varchar('status', { length: 20 }).default('open'),
  notes: text('notes')
});

export const posSales = pgTable('pos_sales', {
  id: serial('id').primaryKey(),
  deviceCode: varchar('device_code', { length: 20 }).notNull().references(() => posDevices.deviceCode),
  transactionId: varchar('transaction_id', { length: 100 }).notNull(),
  documentId: integer('document_id'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  commission: decimal('commission', { precision: 10, scale: 2 }),
  paymentMethod: varchar('payment_method', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  status: varchar('status', { length: 20 }).default('completed'),
  certifierId: integer('certifier_id'),
  sessionId: integer('session_id').references(() => posSessions.id)
});

// Esquemas para validación e inserción

export const insertPosDeviceSchema = createInsertSchema(posDevices).omit({ 
  id: true,
  createdAt: true,
  lastActive: true
});

export const insertPosSessionSchema = createInsertSchema(posSessions).omit({ 
  id: true,
  openingTime: true,
  closingTime: true,
  totalTransactions: true,
  totalSales: true
});

export const insertPosSaleSchema = createInsertSchema(posSales).omit({ 
  id: true,
  createdAt: true
});

// Esquemas de apertura y cierre de sesión

export const openSessionSchema = z.object({
  deviceCode: z.string().min(1).max(20),
  initialAmount: z.number().default(0),
  notes: z.string().optional()
});

export const closeSessionSchema = z.object({
  sessionId: z.number(),
  finalAmount: z.number(),
  notes: z.string().optional()
});

// Tipos inferidos

export type PosDevice = typeof posDevices.$inferSelect;
export type InsertPosDevice = z.infer<typeof insertPosDeviceSchema>;

export type PosSession = typeof posSessions.$inferSelect;
export type InsertPosSession = z.infer<typeof insertPosSessionSchema>;

export type PosSale = typeof posSales.$inferSelect;
export type InsertPosSale = z.infer<typeof insertPosSaleSchema>;

export type OpenSession = z.infer<typeof openSessionSchema>;
export type CloseSession = z.infer<typeof closeSessionSchema>;

// Generador de códigos de sesión
export function generateSessionCode(deviceCode: string): string {
  const date = new Date();
  const dateStr = date.getFullYear().toString().substring(2) + 
                 (date.getMonth() + 1).toString().padStart(2, '0') + 
                 date.getDate().toString().padStart(2, '0');
  
  // Extraer prefijo del código de dispositivo (ej. TUU de POS-TUU-001)
  const prefix = deviceCode.split('-')[1] || 'POS';
  
  // Número aleatorio de 3 dígitos
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `S-${prefix}-${dateStr}-${random}`;
}