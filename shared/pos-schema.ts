import { relations } from "drizzle-orm";
import { 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  boolean, 
  integer, 
  decimal 
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

// Tabla de dispositivos POS
export const posDevices = pgTable("pos_devices", {
  id: serial("id").primaryKey(),
  deviceCode: text("device_code").notNull().unique(),
  deviceName: text("device_name").notNull(),
  deviceType: text("device_type").notNull(),
  deviceModel: text("device_model"),
  storeId: integer("store_id"),
  location: text("location"),
  isActive: boolean("is_active").default(true),
  isDemo: boolean("is_demo").default(false),
  lastActive: timestamp("last_active", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  updatedAt: timestamp("updated_at", { mode: "date" })
});

// Tabla de sesiones POS
export const posSessions = pgTable("pos_sessions", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").notNull().references(() => posDevices.id),
  deviceCode: text("device_code").notNull(), // Para facilitar las consultas directas
  sessionCode: text("session_code").notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  openingUserId: integer("opening_user_id").references(() => users.id),
  closingUserId: integer("closing_user_id").references(() => users.id),
  openingTime: timestamp("opening_time", { mode: "date" }).defaultNow(),
  closingTime: timestamp("closing_time", { mode: "date" }),
  initialAmount: decimal("initial_amount", { precision: 10, scale: 2 }).default("0"),
  finalAmount: decimal("final_amount", { precision: 10, scale: 2 }),
  totalSales: decimal("total_sales", { precision: 10, scale: 2 }),
  transactionCount: integer("transaction_count"),
  notes: text("notes"),
  status: text("status").default("open"), // 'open', 'closed'
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
});

// Tabla de ventas POS
export const posSales = pgTable("pos_sales", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => posSessions.id),
  deviceId: integer("device_id").notNull().references(() => posDevices.id),
  transactionId: text("transaction_id"),
  documentId: integer("document_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 10, scale: 2 }),
  paymentMethod: text("payment_method").default("cash"), // 'cash', 'card', 'transfer'
  status: text("status").default("completed"), // 'completed', 'refunded', 'failed'
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
});

// Relaciones
export const posDevicesRelations = relations(posDevices, ({ many, one }) => ({
  sessions: many(posSessions),
  sales: many(posSales),
  createdByUser: one(users, {
    fields: [posDevices.createdBy],
    references: [users.id],
  }),
}));

export const posSessionsRelations = relations(posSessions, ({ many, one }) => ({
  device: one(posDevices, {
    fields: [posSessions.deviceId],
    references: [posDevices.id],
  }),
  sales: many(posSales),
  user: one(users, {
    fields: [posSessions.userId],
    references: [users.id],
  }),
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
  user: one(users, {
    fields: [posSales.userId],
    references: [users.id],
  }),
}));

// Esquemas Zod para validación
export const insertPosDeviceSchema = createInsertSchema(posDevices).omit({ 
  id: true, 
  lastActive: true,
  createdAt: true,
  updatedAt: true
});

export const insertPosSessionSchema = createInsertSchema(posSessions).omit({ 
  id: true, 
  closingTime: true,
  finalAmount: true,
  totalSales: true,
  transactionCount: true,
  createdAt: true,
  updatedAt: true
});

// Esquema para abrir una sesión
export const openSessionSchema = z.object({
  deviceCode: z.string().min(3, { message: 'Código de dispositivo inválido' }),
  initialAmount: z.number().nonnegative().default(0),
  notes: z.string().optional()
});

// Esquema para cerrar una sesión
export const closeSessionSchema = z.object({
  sessionId: z.number(),
  finalAmount: z.number().nonnegative(),
  notes: z.string().optional()
});

export const insertPosSaleSchema = createInsertSchema(posSales).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true
});

// Utilidades
/**
 * Genera un código de sesión basado en el código del dispositivo
 * @param deviceCode Código del dispositivo
 * @returns Código de sesión generado
 */
export function generateSessionCode(deviceCode: string): string {
  const prefix = deviceCode.split('-')[0] || 'SES';
  const timestamp = Date.now().toString();
  const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp.slice(-4)}-${randomDigits}`;
}

// Tipos para TypeScript
export type PosDevice = typeof posDevices.$inferSelect;
export type InsertPosDevice = z.infer<typeof insertPosDeviceSchema>;

export type PosSession = typeof posSessions.$inferSelect;
export type InsertPosSession = z.infer<typeof insertPosSessionSchema>;

export type PosSale = typeof posSales.$inferSelect;
export type InsertPosSale = z.infer<typeof insertPosSaleSchema>;