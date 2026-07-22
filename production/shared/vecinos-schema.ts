import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Socios de Vecinos Xpress
export const partners = pgTable("vecinos_partners", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  storeName: text("store_name").notNull(),
  businessType: text("business_type").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull().unique(),
  ownerName: text("owner_name").notNull(),
  ownerRut: text("owner_rut").notNull(),
  ownerPhone: text("owner_phone").notNull(),
  bankName: text("bank_name"),
  accountType: text("account_type"),
  accountNumber: text("account_number"),
  commissionRate: integer("commission_rate").default(20).notNull(), // Porcentaje de comisión (por defecto 20%)
  balance: integer("balance").default(0).notNull(), // Balance en pesos chilenos
  status: text("status").default("pending").notNull(), // pending, approved, rejected
  avatarUrl: text("avatar_url"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  balance: true,
  status: true,
  avatarUrl: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
});

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;

// Documentos procesados por socios Vecinos
export const documents = pgTable("vecinos_documents", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  price: integer("price").notNull(),
  status: text("status").default("pending").notNull(), // pending, signing, completed, rejected
  clientName: text("client_name").notNull(),
  clientRut: text("client_rut").notNull(),
  clientPhone: text("client_phone").notNull(),
  clientEmail: text("client_email"),
  verificationCode: text("verification_code").notNull().unique(),
  commissionRate: integer("commission_rate").default(20).notNull(),
  fileName: text("file_name"), // Nombre del archivo subido
  signatureData: jsonb("signature_data"), // Datos de la firma electrónica
  zohoRequestId: text("zoho_request_id"), // ID de solicitud de Zoho Sign
  zohoSignUrl: text("zoho_sign_url"), // URL de firma de Zoho Sign
  signedAt: timestamp("signed_at"), // Fecha de firma
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

// Transacciones de socios Vecinos
export const partnerTransactions = pgTable("vecinos_partner_transactions", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull(),
  documentId: integer("document_id"),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // commission, withdrawal, adjustment
  status: text("status").default("pending").notNull(), // pending, completed, cancelled
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertPartnerTransactionSchema = createInsertSchema(partnerTransactions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type PartnerTransaction = typeof partnerTransactions.$inferSelect;
export type InsertPartnerTransaction = z.infer<typeof insertPartnerTransactionSchema>;

// Solicitudes de retiro de comisiones
export const withdrawalRequests = pgTable("vecinos_withdrawal_requests", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull(),
  amount: integer("amount").notNull(),
  bankName: text("bank_name").notNull(),
  accountType: text("account_type").notNull(),
  accountNumber: text("account_number").notNull(),
  status: text("status").default("pending").notNull(), // pending, completed, rejected
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
  processedBy: integer("processed_by"),
});

export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests).omit({
  id: true,
  status: true,
  notes: true,
  createdAt: true,
  processedAt: true,
  processedBy: true,
});

export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;

// Notificaciones para socios
export const partnerNotifications = pgTable("vecinos_partner_notifications", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").default("info").notNull(), // info, success, warning, error
  read: boolean("read").default(false).notNull(),
  action: text("action"), // Ruta o acción opcional
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

export const insertPartnerNotificationSchema = createInsertSchema(partnerNotifications).omit({
  id: true,
  read: true,
  createdAt: true,
  readAt: true,
});

export type PartnerNotification = typeof partnerNotifications.$inferSelect;
export type InsertPartnerNotification = z.infer<typeof insertPartnerNotificationSchema>;

// Relaciones entre tablas
export const relations = {
  partners: {
    documents: {
      relationship: "1:n",
      foreignKey: "partnerId",
      references: () => documents,
    },
    transactions: {
      relationship: "1:n",
      foreignKey: "partnerId",
      references: () => partnerTransactions,
    },
    withdrawalRequests: {
      relationship: "1:n",
      foreignKey: "partnerId",
      references: () => withdrawalRequests,
    },
    notifications: {
      relationship: "1:n",
      foreignKey: "partnerId",
      references: () => partnerNotifications,
    },
  },
  documents: {
    partner: {
      relationship: "n:1",
      foreignKey: "partnerId",
      references: () => partners,
    },
    transactions: {
      relationship: "1:n",
      foreignKey: "documentId",
      references: () => partnerTransactions,
    },
  },
  partnerTransactions: {
    partner: {
      relationship: "n:1",
      foreignKey: "partnerId",
      references: () => partners,
    },
    document: {
      relationship: "n:1",
      foreignKey: "documentId",
      references: () => documents,
    },
  },
  withdrawalRequests: {
    partner: {
      relationship: "n:1",
      foreignKey: "partnerId",
      references: () => partners,
    },
  },
  partnerNotifications: {
    partner: {
      relationship: "n:1",
      foreignKey: "partnerId",
      references: () => partners,
    },
  },
};