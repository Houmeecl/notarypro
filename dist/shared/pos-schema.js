"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closePosSessionSchema = exports.insertPosSaleSchema = exports.insertPosSessionSchema = exports.insertPosDeviceSchema = exports.posSalesRelations = exports.posSessionsRelations = exports.posDevicesRelations = exports.posSales = exports.posSessions = exports.posDevices = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const drizzle_orm_1 = require("drizzle-orm");
// Tabla de dispositivos POS
exports.posDevices = (0, pg_core_1.pgTable)('pos_devices', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    deviceName: (0, pg_core_1.varchar)('device_name', { length: 100 }).notNull(),
    deviceCode: (0, pg_core_1.varchar)('device_code', { length: 50 }).notNull().unique(),
    deviceType: (0, pg_core_1.varchar)('device_type', { length: 20 }).notNull().default('pos'),
    deviceModel: (0, pg_core_1.varchar)('device_model', { length: 100 }),
    location: (0, pg_core_1.varchar)('location', { length: 200 }),
    storeCode: (0, pg_core_1.varchar)('store_code', { length: 50 }),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    isDemo: (0, pg_core_1.boolean)('is_demo').notNull().default(false),
    notes: (0, pg_core_1.text)('notes'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// Tabla de sesiones de POS
exports.posSessions = (0, pg_core_1.pgTable)('pos_sessions', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    deviceId: (0, pg_core_1.integer)('device_id').notNull().references(() => exports.posDevices.id),
    sessionCode: (0, pg_core_1.varchar)('session_code', { length: 20 }).notNull().unique(),
    operatorId: (0, pg_core_1.integer)('operator_id'),
    operatorName: (0, pg_core_1.varchar)('operator_name', { length: 100 }),
    initialAmount: (0, pg_core_1.decimal)('initial_amount', { precision: 10, scale: 2 }).default('0'),
    finalAmount: (0, pg_core_1.decimal)('final_amount', { precision: 10, scale: 2 }),
    isOpen: (0, pg_core_1.boolean)('is_open').notNull().default(true),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('active'),
    notes: (0, pg_core_1.text)('notes'),
    openedAt: (0, pg_core_1.timestamp)('opened_at').defaultNow().notNull(),
    closedAt: (0, pg_core_1.timestamp)('closed_at'),
});
// Tabla de ventas realizadas en sesiones POS
exports.posSales = (0, pg_core_1.pgTable)('pos_sales', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    sessionId: (0, pg_core_1.integer)('session_id').notNull().references(() => exports.posSessions.id),
    deviceId: (0, pg_core_1.integer)('device_id').notNull().references(() => exports.posDevices.id),
    receiptNumber: (0, pg_core_1.varchar)('receipt_number', { length: 50 }).notNull(),
    amount: (0, pg_core_1.decimal)('amount', { precision: 10, scale: 2 }).notNull(),
    paymentMethod: (0, pg_core_1.varchar)('payment_method', { length: 50 }).notNull(),
    documentType: (0, pg_core_1.varchar)('document_type', { length: 50 }),
    documentId: (0, pg_core_1.integer)('document_id'),
    customerName: (0, pg_core_1.varchar)('customer_name', { length: 100 }),
    customerId: (0, pg_core_1.varchar)('customer_id', { length: 50 }),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('completed'),
    description: (0, pg_core_1.text)('description'),
    metadata: (0, pg_core_1.json)('metadata'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// Relaciones
exports.posDevicesRelations = (0, drizzle_orm_1.relations)(exports.posDevices, ({ many }) => ({
    sessions: many(exports.posSessions),
    sales: many(exports.posSales),
}));
exports.posSessionsRelations = (0, drizzle_orm_1.relations)(exports.posSessions, ({ one, many }) => ({
    device: one(exports.posDevices, {
        fields: [exports.posSessions.deviceId],
        references: [exports.posDevices.id],
    }),
    sales: many(exports.posSales),
}));
exports.posSalesRelations = (0, drizzle_orm_1.relations)(exports.posSales, ({ one }) => ({
    session: one(exports.posSessions, {
        fields: [exports.posSales.sessionId],
        references: [exports.posSessions.id],
    }),
    device: one(exports.posDevices, {
        fields: [exports.posSales.deviceId],
        references: [exports.posDevices.id],
    }),
}));
// Esquemas de inserción usando Zod
exports.insertPosDeviceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.posDevices).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
exports.insertPosSessionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.posSessions).omit({
    id: true,
    openedAt: true,
    closedAt: true,
    finalAmount: true,
    status: true,
    isOpen: true
});
exports.insertPosSaleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.posSales).omit({
    id: true,
    createdAt: true
});
exports.closePosSessionSchema = zod_1.z.object({
    finalAmount: zod_1.z.coerce.number().min(0),
    notes: zod_1.z.string().optional(),
});
