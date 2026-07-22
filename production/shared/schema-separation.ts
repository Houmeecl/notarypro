import { pgTable, text, integer, boolean, uuid, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enumeraciones compartidas
export const userRoleEnum = pgEnum('user_role', ['admin', 'user', 'certifier', 'partner', 'supervisor', 'seller']);
export const userPlatformEnum = pgEnum('user_platform', ['notarypro', 'vecinos']);

// Base de usuarios compartida
export const users = pgTable('users', {
  id: integer('id').primaryKey().notNull(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  email: text('email'),
  role: userRoleEnum('role').default('user').notNull(),
  platform: userPlatformEnum('platform').default('notarypro').notNull(), // Campo clave para separación
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
});

// Perfiles específicos para Vecinos
export const partnerProfiles = pgTable('partner_profiles', {
  id: integer('id').primaryKey().notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  storeName: text('store_name').notNull(),
  storeAddress: text('store_address'),
  storeCode: text('store_code').notNull().unique(),
  balance: integer('balance').default(0),
  commissionRate: integer('commission_rate').default(5),
  contactPhone: text('contact_phone'),
  bankInfo: text('bank_info'),
  lastWithdrawal: timestamp('last_withdrawal')
});

// Perfiles específicos para Certificadores
export const certifierProfiles = pgTable('certifier_profiles', {
  id: integer('id').primaryKey().notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  fullName: text('full_name').notNull(),
  professionalId: text('professional_id'),
  specialization: text('specialization'),
  regions: text('regions').array(),
  documentsProcessed: integer('documents_processed').default(0),
  pendingPayment: integer('pending_payment').default(0),
  lastActivity: timestamp('last_activity')
});

// Perfiles específicos para Supervisores
export const supervisorProfiles = pgTable('supervisor_profiles', {
  id: integer('id').primaryKey().notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  fullName: text('full_name').notNull(),
  zone: text('zone').notNull(), // Zona geográfica asignada
  partners: integer('partners').array(), // IDs de socios supervisados
  performanceRating: integer('performance_rating'), // Calificación de desempeño
  targetQuota: integer('target_quota'), // Meta mensual en ventas/transacciones
  phoneNumber: text('phone_number'),
  lastFieldVisit: timestamp('last_field_visit'),
  notes: text('notes')
});

// Perfiles específicos para Vendedores
export const sellerProfiles = pgTable('seller_profiles', {
  id: integer('id').primaryKey().notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  fullName: text('full_name').notNull(),
  supervisorId: integer('supervisor_id').references(() => supervisorProfiles.id), // Supervisor asignado
  zone: text('zone').notNull(), // Zona de trabajo
  salesQuota: integer('sales_quota'), // Meta de ventas
  currentSales: integer('current_sales').default(0), 
  commission: integer('commission').default(0),
  leadCount: integer('lead_count').default(0), // Número de leads generados
  lastActivity: timestamp('last_activity')
});

// Documentos (compartidos)
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content'),
  documentType: text('document_type'),
  status: text('status').default('pending'),
  creatorId: integer('creator_id').references(() => users.id).notNull(),
  certifierId: integer('certifier_id').references(() => users.id),
  partnerId: integer('partner_id').references(() => users.id),
  sourceType: text('source_type'), // 'vecinos' o 'notarypro'
  signedAt: timestamp('signed_at'),
  certifiedAt: timestamp('certified_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
});

// Transacciones (compartidas)
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  amount: integer('amount').notNull(),
  type: text('type').notNull(),
  partnerId: integer('partner_id').references(() => users.id),
  certifierId: integer('certifier_id').references(() => users.id),
  documentId: uuid('document_id').references(() => documents.id),
  platformFee: integer('platform_fee'),
  commissionAmount: integer('commission_amount'),
  status: text('status').default('pending'),
  paymentMethod: text('payment_method'),
  createdAt: timestamp('created_at').defaultNow()
});

// Sesiones (compartidas pero separables por tipo)
export const certificationSessions = pgTable('certification_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: integer('client_id').references(() => users.id).notNull(),
  certifierId: integer('certifier_id').references(() => users.id).notNull(),
  documentId: uuid('document_id').references(() => documents.id),
  scheduledFor: timestamp('scheduled_for'),
  sessionType: text('session_type').default('videoconference'),
  status: text('status').default('pending'),
  sourceType: text('source_type'), // 'vecinos' o 'notarypro'
  notes: text('notes'),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
  createdAt: timestamp('created_at').defaultNow()
});

// Zonas geográficas para la gestión territorial
export const zones = pgTable('zones', {
  id: integer('id').primaryKey().notNull(),
  name: text('name').notNull(),
  region: text('region').notNull(),
  commune: text('commune').notNull(),
  description: text('description'),
  supervisorId: integer('supervisor_id').references(() => supervisorProfiles.id),
  partnerCount: integer('partner_count').default(0),
  sellerCount: integer('seller_count').default(0),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
});

// Tipos para uso con Drizzle y Zod
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export const insertUserSchema = createInsertSchema(users);

export type PartnerProfile = typeof partnerProfiles.$inferSelect;
export type InsertPartnerProfile = typeof partnerProfiles.$inferInsert;
export const insertPartnerProfileSchema = createInsertSchema(partnerProfiles);

export type CertifierProfile = typeof certifierProfiles.$inferSelect;
export type InsertCertifierProfile = typeof certifierProfiles.$inferInsert;
export const insertCertifierProfileSchema = createInsertSchema(certifierProfiles);

export type SupervisorProfile = typeof supervisorProfiles.$inferSelect;
export type InsertSupervisorProfile = typeof supervisorProfiles.$inferInsert;
export const insertSupervisorProfileSchema = createInsertSchema(supervisorProfiles);

export type SellerProfile = typeof sellerProfiles.$inferSelect;
export type InsertSellerProfile = typeof sellerProfiles.$inferInsert;
export const insertSellerProfileSchema = createInsertSchema(sellerProfiles);

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
export const insertDocumentSchema = createInsertSchema(documents);

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
export const insertTransactionSchema = createInsertSchema(transactions);

export type CertificationSession = typeof certificationSessions.$inferSelect;
export type InsertCertificationSession = typeof certificationSessions.$inferInsert;
export const insertCertificationSessionSchema = createInsertSchema(certificationSessions);

export type Zone = typeof zones.$inferSelect;
export type InsertZone = typeof zones.$inferInsert;
export const insertZoneSchema = createInsertSchema(zones);