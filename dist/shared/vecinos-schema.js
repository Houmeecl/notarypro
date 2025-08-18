"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relations = exports.insertPartnerNotificationSchema = exports.partnerNotifications = exports.insertWithdrawalRequestSchema = exports.withdrawalRequests = exports.insertPartnerTransactionSchema = exports.partnerTransactions = exports.insertDocumentSchema = exports.documents = exports.insertPartnerSchema = exports.partners = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
// Socios de Vecinos Xpress
exports.partners = (0, pg_core_1.pgTable)("vecinos_partners", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
    storeName: (0, pg_core_1.text)("store_name").notNull(),
    businessType: (0, pg_core_1.text)("business_type").notNull(),
    address: (0, pg_core_1.text)("address").notNull(),
    city: (0, pg_core_1.text)("city").notNull(),
    phone: (0, pg_core_1.text)("phone").notNull(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    ownerName: (0, pg_core_1.text)("owner_name").notNull(),
    ownerRut: (0, pg_core_1.text)("owner_rut").notNull(),
    ownerPhone: (0, pg_core_1.text)("owner_phone").notNull(),
    bankName: (0, pg_core_1.text)("bank_name"),
    accountType: (0, pg_core_1.text)("account_type"),
    accountNumber: (0, pg_core_1.text)("account_number"),
    commissionRate: (0, pg_core_1.integer)("commission_rate").default(20).notNull(), // Porcentaje de comisión (por defecto 20%)
    balance: (0, pg_core_1.integer)("balance").default(0).notNull(), // Balance en pesos chilenos
    status: (0, pg_core_1.text)("status").default("pending").notNull(), // pending, approved, rejected
    avatarUrl: (0, pg_core_1.text)("avatar_url"),
    lastLoginAt: (0, pg_core_1.timestamp)("last_login_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.insertPartnerSchema = (0, drizzle_zod_1.createInsertSchema)(exports.partners).omit({
    id: true,
    balance: true,
    status: true,
    avatarUrl: true,
    lastLoginAt: true,
    createdAt: true,
    updatedAt: true,
});
// Documentos procesados por socios Vecinos
exports.documents = (0, pg_core_1.pgTable)("vecinos_documents", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    partnerId: (0, pg_core_1.integer)("partner_id").notNull(),
    title: (0, pg_core_1.text)("title").notNull(),
    type: (0, pg_core_1.text)("type").notNull(),
    price: (0, pg_core_1.integer)("price").notNull(),
    status: (0, pg_core_1.text)("status").default("pending").notNull(), // pending, signing, completed, rejected
    clientName: (0, pg_core_1.text)("client_name").notNull(),
    clientRut: (0, pg_core_1.text)("client_rut").notNull(),
    clientPhone: (0, pg_core_1.text)("client_phone").notNull(),
    clientEmail: (0, pg_core_1.text)("client_email"),
    verificationCode: (0, pg_core_1.text)("verification_code").notNull().unique(),
    commissionRate: (0, pg_core_1.integer)("commission_rate").default(20).notNull(),
    fileName: (0, pg_core_1.text)("file_name"), // Nombre del archivo subido
    signatureData: (0, pg_core_1.jsonb)("signature_data"), // Datos de la firma electrónica
    zohoRequestId: (0, pg_core_1.text)("zoho_request_id"), // ID de solicitud de Zoho Sign
    zohoSignUrl: (0, pg_core_1.text)("zoho_sign_url"), // URL de firma de Zoho Sign
    signedAt: (0, pg_core_1.timestamp)("signed_at"), // Fecha de firma
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.insertDocumentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.documents).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Transacciones de socios Vecinos
exports.partnerTransactions = (0, pg_core_1.pgTable)("vecinos_partner_transactions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    partnerId: (0, pg_core_1.integer)("partner_id").notNull(),
    documentId: (0, pg_core_1.integer)("document_id"),
    amount: (0, pg_core_1.integer)("amount").notNull(),
    type: (0, pg_core_1.text)("type").notNull(), // commission, withdrawal, adjustment
    status: (0, pg_core_1.text)("status").default("pending").notNull(), // pending, completed, cancelled
    description: (0, pg_core_1.text)("description").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
});
exports.insertPartnerTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.partnerTransactions).omit({
    id: true,
    createdAt: true,
    completedAt: true,
});
// Solicitudes de retiro de comisiones
exports.withdrawalRequests = (0, pg_core_1.pgTable)("vecinos_withdrawal_requests", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    partnerId: (0, pg_core_1.integer)("partner_id").notNull(),
    amount: (0, pg_core_1.integer)("amount").notNull(),
    bankName: (0, pg_core_1.text)("bank_name").notNull(),
    accountType: (0, pg_core_1.text)("account_type").notNull(),
    accountNumber: (0, pg_core_1.text)("account_number").notNull(),
    status: (0, pg_core_1.text)("status").default("pending").notNull(), // pending, completed, rejected
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    processedAt: (0, pg_core_1.timestamp)("processed_at"),
    processedBy: (0, pg_core_1.integer)("processed_by"),
});
exports.insertWithdrawalRequestSchema = (0, drizzle_zod_1.createInsertSchema)(exports.withdrawalRequests).omit({
    id: true,
    status: true,
    notes: true,
    createdAt: true,
    processedAt: true,
    processedBy: true,
});
// Notificaciones para socios
exports.partnerNotifications = (0, pg_core_1.pgTable)("vecinos_partner_notifications", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    partnerId: (0, pg_core_1.integer)("partner_id").notNull(),
    title: (0, pg_core_1.text)("title").notNull(),
    message: (0, pg_core_1.text)("message").notNull(),
    type: (0, pg_core_1.text)("type").default("info").notNull(), // info, success, warning, error
    read: (0, pg_core_1.boolean)("read").default(false).notNull(),
    action: (0, pg_core_1.text)("action"), // Ruta o acción opcional
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    readAt: (0, pg_core_1.timestamp)("read_at"),
});
exports.insertPartnerNotificationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.partnerNotifications).omit({
    id: true,
    read: true,
    createdAt: true,
    readAt: true,
});
// Relaciones entre tablas
exports.relations = {
    partners: {
        documents: {
            relationship: "1:n",
            foreignKey: "partnerId",
            references: () => exports.documents,
        },
        transactions: {
            relationship: "1:n",
            foreignKey: "partnerId",
            references: () => exports.partnerTransactions,
        },
        withdrawalRequests: {
            relationship: "1:n",
            foreignKey: "partnerId",
            references: () => exports.withdrawalRequests,
        },
        notifications: {
            relationship: "1:n",
            foreignKey: "partnerId",
            references: () => exports.partnerNotifications,
        },
    },
    documents: {
        partner: {
            relationship: "n:1",
            foreignKey: "partnerId",
            references: () => exports.partners,
        },
        transactions: {
            relationship: "1:n",
            foreignKey: "documentId",
            references: () => exports.partnerTransactions,
        },
    },
    partnerTransactions: {
        partner: {
            relationship: "n:1",
            foreignKey: "partnerId",
            references: () => exports.partners,
        },
        document: {
            relationship: "n:1",
            foreignKey: "documentId",
            references: () => exports.documents,
        },
    },
    withdrawalRequests: {
        partner: {
            relationship: "n:1",
            foreignKey: "partnerId",
            references: () => exports.partners,
        },
    },
    partnerNotifications: {
        partner: {
            relationship: "n:1",
            foreignKey: "partnerId",
            references: () => exports.partners,
        },
    },
};
