import { pgTable, serial, text, varchar, boolean, timestamp, integer, decimal, json } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { relations } from 'drizzle-orm';

// Tabla de dispositivos POS
export const posDevices = pgTable('pos_devices', {
  id: serial('id').primaryKey(),
  deviceName: varchar('device_name', { length: 100 }).notNull(),
  deviceCode: varchar('device_code', { length: 50 }).notNull().unique(),
  deviceType: varchar('device_type', { length: 20 }).notNull().default('pos'),
  deviceModel: varchar('device_model', { length: 100 }),
  location: varchar('location', { length: 200 }),
  storeCode: varchar('store_code', { length: 50 }),
  isActive: boolean('is_active').notNull().default(true),
  isDemo: boolean('is_demo').notNull().default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabla de sesiones de POS
export const posSessions = pgTable('pos_sessions', {
  id: serial('id').primaryKey(),
  deviceId: integer('device_id').notNull().references(() => posDevices.id),
  sessionCode: varchar('session_code', { length: 20 }).notNull().unique(),
  operatorId: integer('operator_id'),
  operatorName: varchar('operator_name', { length: 100 }),
  initialAmount: decimal('initial_amount', { precision: 10, scale: 2 }).default('0'),
  finalAmount: decimal('final_amount', { precision: 10, scale: 2 }),
  isOpen: boolean('is_open').notNull().default(true),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  notes: text('notes'),
  openedAt: timestamp('opened_at').defaultNow().notNull(),
  closedAt: timestamp('closed_at'),
});

// Tabla de ventas realizadas en sesiones POS
export const posSales = pgTable('pos_sales', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').notNull().references(() => posSessions.id),
  deviceId: integer('device_id').notNull().references(() => posDevices.id),
  receiptNumber: varchar('receipt_number', { length: 50 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  documentType: varchar('document_type', { length: 50 }),
  documentId: integer('document_id'),
  customerName: varchar('customer_name', { length: 100 }),
  customerId: varchar('customer_id', { length: 50 }),
  status: varchar('status', { length: 20 }).notNull().default('completed'),
  description: text('description'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relaciones
export const posDevicesRelations = relations(posDevices, ({ many }) => ({
  sessions: many(posSessions),
  sales: many(posSales),
}));

export const posSessionsRelations = relations(posSessions, ({ one, many }) => ({
  device: one(posDevices, {
    fields: [posSessions.deviceId],
    references: [posDevices.id],
  }),
  sales: many(posSales),
}));

export const posSalesRelations = relations(posSales, ({ one }) => ({
  session: one(posSessions, {
    fields: [posSales.sessionId],
    references: [posSessions.id],
  }),
  device: one(posDevices, {
    fields: [posSales.deviceId],
    references: [posDevices.id],
  }),
}));

// Esquemas de inserción usando Zod
export const insertPosDeviceSchema = createInsertSchema(posDevices).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true
});

export const insertPosSessionSchema = createInsertSchema(posSessions).omit({ 
  id: true, 
  openedAt: true,
  closedAt: true,
  finalAmount: true,
  status: true,
  isOpen: true
});

export const insertPosSaleSchema = createInsertSchema(posSales).omit({ 
  id: true, 
  createdAt: true
});

export const closePosSessionSchema = z.object({
  finalAmount: z.coerce.number().min(0),
  notes: z.string().optional(),
});

// Tipos de inserción
export type InsertPosDevice = z.infer<typeof insertPosDeviceSchema>;
export type InsertPosSession = z.infer<typeof insertPosSessionSchema>;
export type InsertPosSale = z.infer<typeof insertPosSaleSchema>;
export type ClosePosSession = z.infer<typeof closePosSessionSchema>;

// Tipos de selección
export type PosDevice = typeof posDevices.$inferSelect;
export type PosSession = typeof posSessions.$inferSelect;
export type PosSale = typeof posSales.$inferSelect;