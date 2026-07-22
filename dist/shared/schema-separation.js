"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertZoneSchema = exports.insertCertificationSessionSchema = exports.insertTransactionSchema = exports.insertDocumentSchema = exports.insertSellerProfileSchema = exports.insertSupervisorProfileSchema = exports.insertCertifierProfileSchema = exports.insertPartnerProfileSchema = exports.insertUserSchema = exports.zones = exports.certificationSessions = exports.transactions = exports.documents = exports.sellerProfiles = exports.supervisorProfiles = exports.certifierProfiles = exports.partnerProfiles = exports.users = exports.userPlatformEnum = exports.userRoleEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
// Enumeraciones compartidas
exports.userRoleEnum = (0, pg_core_1.pgEnum)('user_role', ['admin', 'user', 'certifier', 'partner', 'supervisor', 'seller']);
exports.userPlatformEnum = (0, pg_core_1.pgEnum)('user_platform', ['notarypro', 'vecinos']);
// Base de usuarios compartida
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.integer)('id').primaryKey().notNull(),
    username: (0, pg_core_1.text)('username').notNull().unique(),
    password: (0, pg_core_1.text)('password').notNull(),
    email: (0, pg_core_1.text)('email'),
    role: (0, exports.userRoleEnum)('role').default('user').notNull(),
    platform: (0, exports.userPlatformEnum)('platform').default('notarypro').notNull(), // Campo clave para separación
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at')
});
// Perfiles específicos para Vecinos
exports.partnerProfiles = (0, pg_core_1.pgTable)('partner_profiles', {
    id: (0, pg_core_1.integer)('id').primaryKey().notNull(),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id).notNull(),
    storeName: (0, pg_core_1.text)('store_name').notNull(),
    storeAddress: (0, pg_core_1.text)('store_address'),
    storeCode: (0, pg_core_1.text)('store_code').notNull().unique(),
    balance: (0, pg_core_1.integer)('balance').default(0),
    commissionRate: (0, pg_core_1.integer)('commission_rate').default(5),
    contactPhone: (0, pg_core_1.text)('contact_phone'),
    bankInfo: (0, pg_core_1.text)('bank_info'),
    lastWithdrawal: (0, pg_core_1.timestamp)('last_withdrawal')
});
// Perfiles específicos para Certificadores
exports.certifierProfiles = (0, pg_core_1.pgTable)('certifier_profiles', {
    id: (0, pg_core_1.integer)('id').primaryKey().notNull(),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id).notNull(),
    fullName: (0, pg_core_1.text)('full_name').notNull(),
    professionalId: (0, pg_core_1.text)('professional_id'),
    specialization: (0, pg_core_1.text)('specialization'),
    regions: (0, pg_core_1.text)('regions').array(),
    documentsProcessed: (0, pg_core_1.integer)('documents_processed').default(0),
    pendingPayment: (0, pg_core_1.integer)('pending_payment').default(0),
    lastActivity: (0, pg_core_1.timestamp)('last_activity')
});
// Perfiles específicos para Supervisores
exports.supervisorProfiles = (0, pg_core_1.pgTable)('supervisor_profiles', {
    id: (0, pg_core_1.integer)('id').primaryKey().notNull(),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id).notNull(),
    fullName: (0, pg_core_1.text)('full_name').notNull(),
    zone: (0, pg_core_1.text)('zone').notNull(), // Zona geográfica asignada
    partners: (0, pg_core_1.integer)('partners').array(), // IDs de socios supervisados
    performanceRating: (0, pg_core_1.integer)('performance_rating'), // Calificación de desempeño
    targetQuota: (0, pg_core_1.integer)('target_quota'), // Meta mensual en ventas/transacciones
    phoneNumber: (0, pg_core_1.text)('phone_number'),
    lastFieldVisit: (0, pg_core_1.timestamp)('last_field_visit'),
    notes: (0, pg_core_1.text)('notes')
});
// Perfiles específicos para Vendedores
exports.sellerProfiles = (0, pg_core_1.pgTable)('seller_profiles', {
    id: (0, pg_core_1.integer)('id').primaryKey().notNull(),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id).notNull(),
    fullName: (0, pg_core_1.text)('full_name').notNull(),
    supervisorId: (0, pg_core_1.integer)('supervisor_id').references(() => exports.supervisorProfiles.id), // Supervisor asignado
    zone: (0, pg_core_1.text)('zone').notNull(), // Zona de trabajo
    salesQuota: (0, pg_core_1.integer)('sales_quota'), // Meta de ventas
    currentSales: (0, pg_core_1.integer)('current_sales').default(0),
    commission: (0, pg_core_1.integer)('commission').default(0),
    leadCount: (0, pg_core_1.integer)('lead_count').default(0), // Número de leads generados
    lastActivity: (0, pg_core_1.timestamp)('last_activity')
});
// Documentos (compartidos)
exports.documents = (0, pg_core_1.pgTable)('documents', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    title: (0, pg_core_1.text)('title').notNull(),
    content: (0, pg_core_1.text)('content'),
    documentType: (0, pg_core_1.text)('document_type'),
    status: (0, pg_core_1.text)('status').default('pending'),
    creatorId: (0, pg_core_1.integer)('creator_id').references(() => exports.users.id).notNull(),
    certifierId: (0, pg_core_1.integer)('certifier_id').references(() => exports.users.id),
    partnerId: (0, pg_core_1.integer)('partner_id').references(() => exports.users.id),
    sourceType: (0, pg_core_1.text)('source_type'), // 'vecinos' o 'notarypro'
    signedAt: (0, pg_core_1.timestamp)('signed_at'),
    certifiedAt: (0, pg_core_1.timestamp)('certified_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at')
});
// Transacciones (compartidas)
exports.transactions = (0, pg_core_1.pgTable)('transactions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    amount: (0, pg_core_1.integer)('amount').notNull(),
    type: (0, pg_core_1.text)('type').notNull(),
    partnerId: (0, pg_core_1.integer)('partner_id').references(() => exports.users.id),
    certifierId: (0, pg_core_1.integer)('certifier_id').references(() => exports.users.id),
    documentId: (0, pg_core_1.uuid)('document_id').references(() => exports.documents.id),
    platformFee: (0, pg_core_1.integer)('platform_fee'),
    commissionAmount: (0, pg_core_1.integer)('commission_amount'),
    status: (0, pg_core_1.text)('status').default('pending'),
    paymentMethod: (0, pg_core_1.text)('payment_method'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow()
});
// Sesiones (compartidas pero separables por tipo)
exports.certificationSessions = (0, pg_core_1.pgTable)('certification_sessions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    clientId: (0, pg_core_1.integer)('client_id').references(() => exports.users.id).notNull(),
    certifierId: (0, pg_core_1.integer)('certifier_id').references(() => exports.users.id).notNull(),
    documentId: (0, pg_core_1.uuid)('document_id').references(() => exports.documents.id),
    scheduledFor: (0, pg_core_1.timestamp)('scheduled_for'),
    sessionType: (0, pg_core_1.text)('session_type').default('videoconference'),
    status: (0, pg_core_1.text)('status').default('pending'),
    sourceType: (0, pg_core_1.text)('source_type'), // 'vecinos' o 'notarypro'
    notes: (0, pg_core_1.text)('notes'),
    startedAt: (0, pg_core_1.timestamp)('started_at'),
    endedAt: (0, pg_core_1.timestamp)('ended_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow()
});
// Zonas geográficas para la gestión territorial
exports.zones = (0, pg_core_1.pgTable)('zones', {
    id: (0, pg_core_1.integer)('id').primaryKey().notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    region: (0, pg_core_1.text)('region').notNull(),
    commune: (0, pg_core_1.text)('commune').notNull(),
    description: (0, pg_core_1.text)('description'),
    supervisorId: (0, pg_core_1.integer)('supervisor_id').references(() => exports.supervisorProfiles.id),
    partnerCount: (0, pg_core_1.integer)('partner_count').default(0),
    sellerCount: (0, pg_core_1.integer)('seller_count').default(0),
    status: (0, pg_core_1.text)('status').default('active'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at')
});
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users);
exports.insertPartnerProfileSchema = (0, drizzle_zod_1.createInsertSchema)(exports.partnerProfiles);
exports.insertCertifierProfileSchema = (0, drizzle_zod_1.createInsertSchema)(exports.certifierProfiles);
exports.insertSupervisorProfileSchema = (0, drizzle_zod_1.createInsertSchema)(exports.supervisorProfiles);
exports.insertSellerProfileSchema = (0, drizzle_zod_1.createInsertSchema)(exports.sellerProfiles);
exports.insertDocumentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.documents);
exports.insertTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.transactions);
exports.insertCertificationSessionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.certificationSessions);
exports.insertZoneSchema = (0, drizzle_zod_1.createInsertSchema)(exports.zones);
