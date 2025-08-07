"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertWhatsappMessageSchema = exports.whatsappMessages = exports.insertCrmLeadSchema = exports.crmLeads = exports.insertPartnerPaymentSchema = exports.partnerPayments = exports.insertPartnerSaleSchema = exports.partnerSales = exports.insertPartnerBankDetailsSchema = exports.partnerBankDetails = exports.insertPosProviderSchema = exports.posProviders = exports.insertPosTransactionSchema = exports.posTransactions = exports.insertPartnerSchema = exports.partnerTransactions = exports.partnerStores = exports.partners = exports.insertVideoCallSessionSchema = exports.videoCallSessions = exports.insertVideoCallServiceSchema = exports.videoCallServices = exports.insertCertificateSchema = exports.certificates = exports.insertQuizAttemptSchema = exports.quizAttempts = exports.insertQuizQuestionSchema = exports.quizQuestions = exports.insertQuizSchema = exports.quizzes = exports.insertCourseEnrollmentSchema = exports.courseEnrollments = exports.insertCourseContentSchema = exports.courseContents = exports.insertCourseModuleSchema = exports.courseModules = exports.insertCourseSchema = exports.courses = exports.insertIdentityVerificationSchema = exports.identityVerifications = exports.insertDocumentSchema = exports.documents = exports.insertDocumentTemplateSchema = exports.documentTemplates = exports.insertDocumentCategorySchema = exports.documentCategories = exports.insertUserSchema = exports.users = exports.analyticsEvents = exports.auditLogs = void 0;
exports.insertApiIdentityVerificationSchema = exports.identity_verifications = exports.insertNotaryRegistryConnectionSchema = exports.notaryRegistryConnections = exports.insertNotaryBiometricVerificationSchema = exports.notaryBiometricVerifications = exports.insertNotaryAppointmentSchema = exports.notaryAppointments = exports.insertNotaryFeeScheduleSchema = exports.notaryFeeSchedules = exports.insertNotaryDeedSchema = exports.notaryDeeds = exports.insertNotaryProtocolBookSchema = exports.notaryProtocolBooks = exports.insertNotaryProfileSchema = exports.notaryProfiles = exports.insertUserAchievementProgressSchema = exports.userAchievementProgress = exports.insertQuickAchievementSchema = exports.quickAchievements = exports.insertUserInteractionHistorySchema = exports.userInteractionHistory = exports.insertMicroInteractionSchema = exports.microInteractions = exports.insertUserClaimedRewardSchema = exports.userClaimedRewards = exports.insertGamificationRewardSchema = exports.gamificationRewards = exports.insertLeaderboardEntrySchema = exports.leaderboardEntries = exports.insertGamificationActivitySchema = exports.gamificationActivities = exports.insertUserGameProfileSchema = exports.userGameProfiles = exports.insertUserBadgeSchema = exports.userBadges = exports.insertVerificationBadgeSchema = exports.verificationBadges = exports.insertUserChallengeProgressSchema = exports.userChallengeProgress = exports.insertVerificationChallengeSchema = exports.verificationChallenges = exports.insertAnalyticsEventSchema = exports.insertAutomationRuleSchema = exports.automationRules = exports.insertMessageTemplateSchema = exports.messageTemplates = exports.insertDialogflowSessionSchema = exports.dialogflowSessions = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
// Audit Logs
exports.auditLogs = (0, pg_core_1.pgTable)("audit_logs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id"),
    actionType: (0, pg_core_1.text)("action_type").notNull(),
    details: (0, pg_core_1.jsonb)("details"),
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow(),
});
// Analytics Events
exports.analyticsEvents = (0, pg_core_1.pgTable)("analytics_events", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    eventType: (0, pg_core_1.text)("event_type").notNull(), // document_created, document_signed, document_certified, user_registered, etc.
    userId: (0, pg_core_1.integer)("user_id"),
    documentId: (0, pg_core_1.integer)("document_id"),
    templateId: (0, pg_core_1.integer)("template_id"),
    courseId: (0, pg_core_1.integer)("course_id"),
    videoCallId: (0, pg_core_1.integer)("video_call_id"),
    metadata: (0, pg_core_1.jsonb)("metadata"), // Additional data related to the event
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Users
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    fullName: (0, pg_core_1.text)("full_name").notNull(),
    role: (0, pg_core_1.text)("role").notNull().default("user"), // user, certifier, admin, lawyer, notary, partner
    platform: (0, pg_core_1.text)("platform").default("notarypro"), // notarypro, vecinos
    businessName: (0, pg_core_1.text)("business_name"), // For partners
    address: (0, pg_core_1.text)("address"),
    region: (0, pg_core_1.text)("region"),
    comuna: (0, pg_core_1.text)("comuna"), // Community/District
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).pick({
    username: true,
    password: true,
    email: true,
    fullName: true,
    role: true,
    platform: true,
    businessName: true,
    address: true,
    region: true,
    comuna: true,
});
// Document Categories
exports.documentCategories = (0, pg_core_1.pgTable)("document_categories", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    order: (0, pg_core_1.integer)("order").notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertDocumentCategorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.documentCategories).pick({
    name: true,
    description: true,
    order: true,
});
// Document Templates
exports.documentTemplates = (0, pg_core_1.pgTable)("document_templates", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    categoryId: (0, pg_core_1.integer)("category_id").notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    htmlTemplate: (0, pg_core_1.text)("html_template").notNull(),
    price: (0, pg_core_1.integer)("price").notNull().default(0), // Price in cents
    formSchema: (0, pg_core_1.jsonb)("form_schema").notNull(), // JSON schema for the form
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
    active: (0, pg_core_1.boolean)("active").notNull().default(true),
});
exports.insertDocumentTemplateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.documentTemplates).pick({
    categoryId: true,
    name: true,
    description: true,
    htmlTemplate: true,
    price: true,
    formSchema: true,
    active: true,
});
// Documents
exports.documents = (0, pg_core_1.pgTable)("documents", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    templateId: (0, pg_core_1.integer)("template_id").notNull(),
    title: (0, pg_core_1.text)("title").notNull(),
    formData: (0, pg_core_1.jsonb)("form_data").notNull(), // JSON with form data
    status: (0, pg_core_1.text)("status").notNull().default("draft"), // draft, pending_payment, pending_identity, pending_signature, pending_certification, certified, rejected
    filePath: (0, pg_core_1.text)("file_path"),
    pdfPath: (0, pg_core_1.text)("pdf_path"),
    qrCode: (0, pg_core_1.text)("qr_code"),
    certifierId: (0, pg_core_1.integer)("certifier_id"),
    paymentId: (0, pg_core_1.text)("payment_id"),
    paymentAmount: (0, pg_core_1.integer)("payment_amount"),
    paymentStatus: (0, pg_core_1.text)("payment_status"),
    paymentMethod: (0, pg_core_1.text)("payment_method"),
    paymentTimestamp: (0, pg_core_1.timestamp)("payment_timestamp"),
    email: (0, pg_core_1.text)("email"), // Email para envío del documento
    receiveNotifications: (0, pg_core_1.boolean)("receive_notifications").default(false),
    sendCopy: (0, pg_core_1.boolean)("send_copy").default(false),
    signatureData: (0, pg_core_1.text)("signature_data"),
    signatureTimestamp: (0, pg_core_1.timestamp)("signature_timestamp"),
    certifierSignatureData: (0, pg_core_1.text)("certifier_signature_data"),
    certifierSignatureTimestamp: (0, pg_core_1.timestamp)("certifier_signature_timestamp"),
    rejectionReason: (0, pg_core_1.text)("rejection_reason"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertDocumentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.documents).pick({
    userId: true,
    templateId: true,
    title: true,
    formData: true,
});
// Identity Verification
exports.identityVerifications = (0, pg_core_1.pgTable)("identity_verifications", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    documentId: (0, pg_core_1.integer)("document_id").notNull(),
    idPhotoPath: (0, pg_core_1.text)("id_photo_path").notNull(),
    selfiePath: (0, pg_core_1.text)("selfie_path").notNull(),
    status: (0, pg_core_1.text)("status").notNull().default("pending"), // pending, approved, rejected
    certifierId: (0, pg_core_1.integer)("certifier_id"),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertIdentityVerificationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.identityVerifications).pick({
    userId: true,
    documentId: true,
    idPhotoPath: true,
    selfiePath: true,
});
// Courses
exports.courses = (0, pg_core_1.pgTable)("courses", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    price: (0, pg_core_1.integer)("price").notNull(),
    imageUrl: (0, pg_core_1.text)("image_url"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertCourseSchema = (0, drizzle_zod_1.createInsertSchema)(exports.courses).pick({
    title: true,
    description: true,
    price: true,
    imageUrl: true,
});
// Course Modules
exports.courseModules = (0, pg_core_1.pgTable)("course_modules", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    courseId: (0, pg_core_1.integer)("course_id").notNull(),
    title: (0, pg_core_1.text)("title").notNull(),
    order: (0, pg_core_1.integer)("order").notNull(),
});
exports.insertCourseModuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.courseModules).pick({
    courseId: true,
    title: true,
    order: true,
});
// Course Contents
exports.courseContents = (0, pg_core_1.pgTable)("course_contents", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    moduleId: (0, pg_core_1.integer)("module_id").notNull(),
    title: (0, pg_core_1.text)("title").notNull(),
    contentType: (0, pg_core_1.text)("content_type").notNull(), // video, pdf, text
    content: (0, pg_core_1.text)("content").notNull(),
    order: (0, pg_core_1.integer)("order").notNull(),
});
exports.insertCourseContentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.courseContents).pick({
    moduleId: true,
    title: true,
    contentType: true,
    content: true,
    order: true,
});
// Course Enrollments
exports.courseEnrollments = (0, pg_core_1.pgTable)("course_enrollments", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    courseId: (0, pg_core_1.integer)("course_id").notNull(),
    completed: (0, pg_core_1.boolean)("completed").default(false),
    enrolledAt: (0, pg_core_1.timestamp)("enrolled_at").defaultNow(),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
});
exports.insertCourseEnrollmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.courseEnrollments).pick({
    userId: true,
    courseId: true,
});
// Quizzes
exports.quizzes = (0, pg_core_1.pgTable)("quizzes", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    moduleId: (0, pg_core_1.integer)("module_id").notNull(),
    title: (0, pg_core_1.text)("title").notNull(),
    passingScore: (0, pg_core_1.integer)("passing_score").notNull().default(70),
});
exports.insertQuizSchema = (0, drizzle_zod_1.createInsertSchema)(exports.quizzes).pick({
    moduleId: true,
    title: true,
    passingScore: true,
});
// Quiz Questions
exports.quizQuestions = (0, pg_core_1.pgTable)("quiz_questions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    quizId: (0, pg_core_1.integer)("quiz_id").notNull(),
    question: (0, pg_core_1.text)("question").notNull(),
    options: (0, pg_core_1.text)("options").notNull(), // JSON string of options
    correctAnswerIndex: (0, pg_core_1.integer)("correct_answer_index").notNull(),
});
exports.insertQuizQuestionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.quizQuestions).pick({
    quizId: true,
    question: true,
    options: true,
    correctAnswerIndex: true,
});
// Quiz Attempts
exports.quizAttempts = (0, pg_core_1.pgTable)("quiz_attempts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    quizId: (0, pg_core_1.integer)("quiz_id").notNull(),
    score: (0, pg_core_1.integer)("score").notNull(),
    passed: (0, pg_core_1.boolean)("passed").notNull(),
    attemptedAt: (0, pg_core_1.timestamp)("attempted_at").defaultNow(),
});
exports.insertQuizAttemptSchema = (0, drizzle_zod_1.createInsertSchema)(exports.quizAttempts).pick({
    userId: true,
    quizId: true,
    score: true,
    passed: true,
});
// Certificates
exports.certificates = (0, pg_core_1.pgTable)("certificates", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    courseId: (0, pg_core_1.integer)("course_id").notNull(),
    certificateNumber: (0, pg_core_1.text)("certificate_number").notNull().unique(),
    issuedAt: (0, pg_core_1.timestamp)("issued_at").defaultNow(),
});
exports.insertCertificateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.certificates).pick({
    userId: true,
    courseId: true,
    certificateNumber: true,
});
// Video Call Services
exports.videoCallServices = (0, pg_core_1.pgTable)("video_call_services", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    price: (0, pg_core_1.integer)("price").notNull(), // Price in cents
    duration: (0, pg_core_1.integer)("duration").notNull(), // Duration in minutes
    active: (0, pg_core_1.boolean)("active").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertVideoCallServiceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.videoCallServices).pick({
    name: true,
    description: true,
    price: true,
    duration: true,
    active: true,
});
// Video Call Sessions
exports.videoCallSessions = (0, pg_core_1.pgTable)("video_call_sessions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    serviceId: (0, pg_core_1.integer)("service_id").notNull(),
    certifierId: (0, pg_core_1.integer)("certifier_id"),
    scheduledAt: (0, pg_core_1.timestamp)("scheduled_at").notNull(),
    status: (0, pg_core_1.text)("status").notNull().default("pending_payment"), // pending_payment, scheduled, completed, cancelled
    meetingUrl: (0, pg_core_1.text)("meeting_url"),
    meetingId: (0, pg_core_1.text)("meeting_id"),
    meetingPassword: (0, pg_core_1.text)("meeting_password"),
    paymentId: (0, pg_core_1.text)("payment_id"),
    paymentAmount: (0, pg_core_1.integer)("payment_amount"),
    paymentStatus: (0, pg_core_1.text)("payment_status"),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertVideoCallSessionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.videoCallSessions).pick({
    userId: true,
    serviceId: true,
    scheduledAt: true,
});
// Partners (Vecinos NotaryPro Express)
exports.partners = (0, pg_core_1.pgTable)("partners", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(), // Associated user account for login
    storeName: (0, pg_core_1.text)("store_name").notNull(),
    managerName: (0, pg_core_1.text)("manager_name").notNull(),
    region: (0, pg_core_1.text)("region").notNull(),
    commune: (0, pg_core_1.text)("commune").notNull(),
    address: (0, pg_core_1.text)("address").notNull(),
    phone: (0, pg_core_1.text)("phone").notNull(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    hasInternet: (0, pg_core_1.boolean)("has_internet").notNull(),
    hasDevice: (0, pg_core_1.boolean)("has_device").notNull(),
    status: (0, pg_core_1.text)("status").notNull().default("pending"), // pending, approved, rejected
    notes: (0, pg_core_1.text)("notes"),
    // POS integration fields
    posIntegrated: (0, pg_core_1.boolean)("pos_integrated").default(false),
    posProvider: (0, pg_core_1.text)("pos_provider"),
    posApiKey: (0, pg_core_1.text)("pos_api_key"),
    posStoreId: (0, pg_core_1.text)("pos_store_id"),
    posSalesEndpoint: (0, pg_core_1.text)("pos_sales_endpoint"),
    lastSyncedAt: (0, pg_core_1.timestamp)("last_synced_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Partner Stores (for the webapp alternative)
exports.partnerStores = (0, pg_core_1.pgTable)("partner_stores", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    ownerId: (0, pg_core_1.integer)("owner_id").notNull().references(() => exports.users.id),
    name: (0, pg_core_1.text)("name").notNull(),
    address: (0, pg_core_1.text)("address").notNull(),
    storeCode: (0, pg_core_1.text)("store_code").notNull().unique(), // Unique code for webapp login
    commissionRate: (0, pg_core_1.real)("commission_rate").notNull().default(0.1), // Default 10%
    active: (0, pg_core_1.boolean)("active").notNull().default(true),
    lastLoginAt: (0, pg_core_1.timestamp)("last_login_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Partner Transactions (for the webapp alternative)
exports.partnerTransactions = (0, pg_core_1.pgTable)("partner_transactions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    storeId: (0, pg_core_1.integer)("store_id").notNull().references(() => exports.partnerStores.id),
    documentTemplateId: (0, pg_core_1.integer)("document_template_id").notNull().references(() => exports.documentTemplates.id),
    clientName: (0, pg_core_1.text)("client_name").notNull(),
    clientEmail: (0, pg_core_1.text)("client_email").notNull(),
    clientPhone: (0, pg_core_1.text)("client_phone").notNull(),
    clientDocument: (0, pg_core_1.text)("client_document"),
    amount: (0, pg_core_1.integer)("amount").notNull(), // Total amount in cents
    commission: (0, pg_core_1.integer)("commission").notNull(), // Commission amount in cents
    status: (0, pg_core_1.text)("status").notNull().default("pending"), // pending, completed, cancelled
    processingCode: (0, pg_core_1.text)("processing_code").notNull().unique(), // Unique code for tracking
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    paymentMethod: (0, pg_core_1.text)("payment_method"),
    paymentReference: (0, pg_core_1.text)("payment_reference"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertPartnerSchema = (0, drizzle_zod_1.createInsertSchema)(exports.partners).pick({
    storeName: true,
    managerName: true,
    region: true,
    commune: true,
    address: true,
    phone: true,
    email: true,
    hasInternet: true,
    hasDevice: true,
});
// POS Transactions
exports.posTransactions = (0, pg_core_1.pgTable)("pos_transactions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    partnerId: (0, pg_core_1.integer)("partner_id").notNull().references(() => exports.partners.id),
    transactionDate: (0, pg_core_1.timestamp)("transaction_date", { mode: 'date' }).notNull(),
    transactionId: (0, pg_core_1.text)("transaction_id"),
    posReference: (0, pg_core_1.text)("pos_reference"),
    amount: (0, pg_core_1.integer)("amount").notNull(), // Amount in cents
    items: (0, pg_core_1.jsonb)("items"), // Items sold in this transaction
    commissionAmount: (0, pg_core_1.integer)("commission_amount"), // Commission in cents
    commissionRate: (0, pg_core_1.real)("commission_rate"),
    synchronized: (0, pg_core_1.boolean)("synchronized").default(true).notNull(),
    metadata: (0, pg_core_1.jsonb)("metadata"), // Additional POS data
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'date' }).defaultNow().notNull(),
});
exports.insertPosTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.posTransactions).pick({
    partnerId: true,
    transactionDate: true,
    transactionId: true,
    posReference: true,
    amount: true,
    items: true,
    commissionAmount: true,
    commissionRate: true,
    synchronized: true,
    metadata: true,
});
// POS Providers
exports.posProviders = (0, pg_core_1.pgTable)("pos_providers", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    displayName: (0, pg_core_1.text)("display_name").notNull(),
    apiBaseUrl: (0, pg_core_1.text)("api_base_url").notNull(),
    apiDocumentationUrl: (0, pg_core_1.text)("api_documentation_url"),
    logoUrl: (0, pg_core_1.text)("logo_url"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    requiredFields: (0, pg_core_1.jsonb)("required_fields").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'date' }).defaultNow().notNull(),
});
exports.insertPosProviderSchema = (0, drizzle_zod_1.createInsertSchema)(exports.posProviders).pick({
    name: true,
    displayName: true,
    apiBaseUrl: true,
    apiDocumentationUrl: true,
    logoUrl: true,
    isActive: true,
    requiredFields: true,
});
// Partner Bank Details
exports.partnerBankDetails = (0, pg_core_1.pgTable)("partner_bank_details", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    partnerId: (0, pg_core_1.integer)("partner_id").notNull(),
    bank: (0, pg_core_1.text)("bank").notNull(),
    accountType: (0, pg_core_1.text)("account_type").notNull(), // checking, savings, vista
    accountNumber: (0, pg_core_1.text)("account_number").notNull(),
    rut: (0, pg_core_1.text)("rut").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertPartnerBankDetailsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.partnerBankDetails).pick({
    partnerId: true,
    bank: true,
    accountType: true,
    accountNumber: true,
    rut: true,
});
// Partner Sales
exports.partnerSales = (0, pg_core_1.pgTable)("partner_sales", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    partnerId: (0, pg_core_1.integer)("partner_id").notNull(),
    documentId: (0, pg_core_1.integer)("document_id").notNull(),
    amount: (0, pg_core_1.integer)("amount").notNull(), // Total sale amount
    commission: (0, pg_core_1.integer)("commission").notNull(), // Commission amount for partner
    commissionRate: (0, pg_core_1.real)("commission_rate").notNull(), // Rate applied for this sale (e.g., 0.15 for 15%)
    status: (0, pg_core_1.text)("status").notNull().default("pending"), // pending, available, paid
    paidAt: (0, pg_core_1.timestamp)("paid_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertPartnerSaleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.partnerSales).pick({
    partnerId: true,
    documentId: true,
    amount: true,
    commission: true,
    commissionRate: true,
});
// Partner Payments
exports.partnerPayments = (0, pg_core_1.pgTable)("partner_payments", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    partnerId: (0, pg_core_1.integer)("partner_id").notNull(),
    amount: (0, pg_core_1.integer)("amount").notNull(),
    paymentDate: (0, pg_core_1.timestamp)("payment_date").notNull(),
    paymentMethod: (0, pg_core_1.text)("payment_method").notNull(), // bank_transfer, check, etc.
    reference: (0, pg_core_1.text)("reference"), // Reference number, transaction ID, etc.
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertPartnerPaymentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.partnerPayments).pick({
    partnerId: true,
    amount: true,
    paymentDate: true,
    paymentMethod: true,
    reference: true,
    notes: true,
});
// CRM Leads
exports.crmLeads = (0, pg_core_1.pgTable)("crm_leads", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    fullName: (0, pg_core_1.text)("full_name").notNull(),
    email: (0, pg_core_1.text)("email").notNull(),
    phone: (0, pg_core_1.text)("phone").notNull(),
    rut: (0, pg_core_1.text)("rut"),
    documentType: (0, pg_core_1.text)("document_type"),
    status: (0, pg_core_1.text)("status").notNull().default("initiated"), // initiated, data_completed, payment_completed, certified, incomplete
    source: (0, pg_core_1.text)("source").notNull().default("webapp"), // webapp, android, website, whatsapp
    pipelineStage: (0, pg_core_1.text)("pipeline_stage").notNull().default("initiated"), // initiated, data_completed, payment_completed, certified, incomplete
    lastContactDate: (0, pg_core_1.timestamp)("last_contact_date").defaultNow(),
    assignedToUserId: (0, pg_core_1.integer)("assigned_to_user_id"),
    notes: (0, pg_core_1.text)("notes"),
    metadata: (0, pg_core_1.jsonb)("metadata"), // Additional data
    crmExternalId: (0, pg_core_1.text)("crm_external_id"), // ID in external CRM system
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertCrmLeadSchema = (0, drizzle_zod_1.createInsertSchema)(exports.crmLeads).pick({
    fullName: true,
    email: true,
    phone: true,
    rut: true,
    documentType: true,
    status: true,
    source: true,
    pipelineStage: true,
    assignedToUserId: true,
    notes: true,
    metadata: true,
    crmExternalId: true,
});
// WhatsApp Messages
exports.whatsappMessages = (0, pg_core_1.pgTable)("whatsapp_messages", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    leadId: (0, pg_core_1.integer)("lead_id"),
    userId: (0, pg_core_1.integer)("user_id"),
    direction: (0, pg_core_1.text)("direction").notNull(), // incoming, outgoing
    phoneNumber: (0, pg_core_1.text)("phone_number").notNull(),
    messageType: (0, pg_core_1.text)("message_type").notNull().default("text"), // text, image, document, template
    content: (0, pg_core_1.text)("content").notNull(),
    templateName: (0, pg_core_1.text)("template_name"), // For template messages
    status: (0, pg_core_1.text)("status").notNull().default("pending"), // pending, sent, delivered, read, failed
    externalMessageId: (0, pg_core_1.text)("external_message_id"), // ID from WhatsApp API
    metadata: (0, pg_core_1.jsonb)("metadata"), // Additional data
    sentAt: (0, pg_core_1.timestamp)("sent_at").defaultNow(),
    deliveredAt: (0, pg_core_1.timestamp)("delivered_at"),
    readAt: (0, pg_core_1.timestamp)("read_at"),
});
exports.insertWhatsappMessageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.whatsappMessages).pick({
    leadId: true,
    userId: true,
    direction: true,
    phoneNumber: true,
    messageType: true,
    content: true,
    templateName: true,
    status: true,
    externalMessageId: true,
    metadata: true,
});
// Dialogflow Sessions
exports.dialogflowSessions = (0, pg_core_1.pgTable)("dialogflow_sessions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    leadId: (0, pg_core_1.integer)("lead_id"),
    userId: (0, pg_core_1.integer)("user_id"),
    sessionId: (0, pg_core_1.text)("session_id").notNull().unique(), // Dialogflow session ID
    intent: (0, pg_core_1.text)("intent"), // Current/last detected intent
    parameters: (0, pg_core_1.jsonb)("parameters"), // Session parameters
    status: (0, pg_core_1.text)("status").notNull().default("active"), // active, transferred, closed
    transferredToUserId: (0, pg_core_1.integer)("transferred_to_user_id"), // If conversation was transferred to human
    metadata: (0, pg_core_1.jsonb)("metadata"), // Additional data
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
    lastInteractionAt: (0, pg_core_1.timestamp)("last_interaction_at").defaultNow(),
});
exports.insertDialogflowSessionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.dialogflowSessions).pick({
    leadId: true,
    userId: true,
    sessionId: true,
    intent: true,
    parameters: true,
    status: true,
    transferredToUserId: true,
    metadata: true,
});
// Message Templates
exports.messageTemplates = (0, pg_core_1.pgTable)("message_templates", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull().unique(),
    category: (0, pg_core_1.text)("category").notNull(), // onboarding, payment, certification, follow_up, etc.
    content: (0, pg_core_1.text)("content").notNull(),
    variables: (0, pg_core_1.jsonb)("variables"), // Available variables for this template
    isWhatsappTemplate: (0, pg_core_1.boolean)("is_whatsapp_template").default(false).notNull(), // If approved by WhatsApp
    whatsappTemplateNamespace: (0, pg_core_1.text)("whatsapp_template_namespace"), // WhatsApp template namespace
    whatsappTemplateElementName: (0, pg_core_1.text)("whatsapp_template_element_name"), // Element name in WhatsApp
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertMessageTemplateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.messageTemplates).pick({
    name: true,
    category: true,
    content: true,
    variables: true,
    isWhatsappTemplate: true,
    whatsappTemplateNamespace: true,
    whatsappTemplateElementName: true,
    isActive: true,
});
// Automation Rules
exports.automationRules = (0, pg_core_1.pgTable)("automation_rules", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    triggerType: (0, pg_core_1.text)("trigger_type").notNull(), // event_based, schedule_based, condition_based
    triggerEvent: (0, pg_core_1.text)("trigger_event"), // For event_based: document_created, payment_completed, etc.
    triggerSchedule: (0, pg_core_1.text)("trigger_schedule"), // For schedule_based: cron expression
    triggerCondition: (0, pg_core_1.jsonb)("trigger_condition"), // For condition_based: JSON condition
    actionType: (0, pg_core_1.text)("action_type").notNull(), // send_whatsapp, create_lead, update_lead, transfer_to_human
    actionConfig: (0, pg_core_1.jsonb)("action_config").notNull(), // Action configuration
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertAutomationRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.automationRules).pick({
    name: true,
    description: true,
    triggerType: true,
    triggerEvent: true,
    triggerSchedule: true,
    triggerCondition: true,
    actionType: true,
    actionConfig: true,
    isActive: true,
});
exports.insertAnalyticsEventSchema = (0, drizzle_zod_1.createInsertSchema)(exports.analyticsEvents).pick({
    eventType: true,
    userId: true,
    documentId: true,
    templateId: true,
    courseId: true,
    videoCallId: true,
    metadata: true,
});
// ======= GAMIFICACIÓN DE AUTENTICACIÓN DE DOCUMENTOS =======
// Desafíos de verificación de documentos
exports.verificationChallenges = (0, pg_core_1.pgTable)("verification_challenges", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    points: (0, pg_core_1.integer)("points").notNull(),
    requiredActions: (0, pg_core_1.jsonb)("required_actions").notNull(), // array de acciones necesarias para completar
    completionCriteria: (0, pg_core_1.jsonb)("completion_criteria").notNull(), // condiciones para completar el desafío
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    difficultyLevel: (0, pg_core_1.integer)("difficulty_level").notNull().default(1), // 1-5
    imageUrl: (0, pg_core_1.text)("image_url"),
    badgeImage: (0, pg_core_1.text)("badge_image"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertVerificationChallengeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.verificationChallenges).pick({
    title: true,
    description: true,
    points: true,
    requiredActions: true,
    completionCriteria: true,
    isActive: true,
    difficultyLevel: true,
    imageUrl: true,
    badgeImage: true,
});
// Progreso de usuarios en desafíos
exports.userChallengeProgress = (0, pg_core_1.pgTable)("user_challenge_progress", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    challengeId: (0, pg_core_1.integer)("challenge_id").notNull(),
    progress: (0, pg_core_1.jsonb)("progress").notNull(), // estado actual de progreso
    isCompleted: (0, pg_core_1.boolean)("is_completed").notNull().default(false),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    awardedPoints: (0, pg_core_1.integer)("awarded_points"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertUserChallengeProgressSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userChallengeProgress).pick({
    userId: true,
    challengeId: true,
    progress: true,
    isCompleted: true,
    completedAt: true,
    awardedPoints: true,
});
// Insignias de verificación
exports.verificationBadges = (0, pg_core_1.pgTable)("verification_badges", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    imageUrl: (0, pg_core_1.text)("image_url").notNull(),
    requiredPoints: (0, pg_core_1.integer)("required_points").notNull(),
    tier: (0, pg_core_1.text)("tier").notNull(), // bronce, plata, oro, platino, diamante
    isRare: (0, pg_core_1.boolean)("is_rare").notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertVerificationBadgeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.verificationBadges).pick({
    name: true,
    description: true,
    imageUrl: true,
    requiredPoints: true,
    tier: true,
    isRare: true,
});
// Insignias conseguidas por usuario
exports.userBadges = (0, pg_core_1.pgTable)("user_badges", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    badgeId: (0, pg_core_1.integer)("badge_id").notNull(),
    earnedAt: (0, pg_core_1.timestamp)("earned_at").defaultNow(),
    showcaseOrder: (0, pg_core_1.integer)("showcase_order"), // posición para mostrar en perfil (NULL si no se muestra)
});
exports.insertUserBadgeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userBadges).pick({
    userId: true,
    badgeId: true,
    showcaseOrder: true,
});
// Perfil de gamificación de usuario
exports.userGameProfiles = (0, pg_core_1.pgTable)("user_game_profiles", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().unique(),
    totalPoints: (0, pg_core_1.integer)("total_points").notNull().default(0),
    level: (0, pg_core_1.integer)("level").notNull().default(1),
    consecutiveDays: (0, pg_core_1.integer)("consecutive_days").notNull().default(0),
    lastActive: (0, pg_core_1.timestamp)("last_active").defaultNow(),
    verificationStreak: (0, pg_core_1.integer)("verification_streak").notNull().default(0),
    totalVerifications: (0, pg_core_1.integer)("total_verifications").notNull().default(0),
    rank: (0, pg_core_1.text)("rank").notNull().default("Novato"),
    preferences: (0, pg_core_1.jsonb)("preferences"), // preferencias de gamificación
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertUserGameProfileSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userGameProfiles).pick({
    userId: true,
    totalPoints: true,
    level: true,
    consecutiveDays: true,
    lastActive: true,
    verificationStreak: true,
    totalVerifications: true,
    rank: true,
    preferences: true,
});
// Historial de actividades de gamificación
exports.gamificationActivities = (0, pg_core_1.pgTable)("gamification_activities", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    activityType: (0, pg_core_1.text)("activity_type").notNull(), // verificación, desafío_completado, insignia_ganada, nivel_subido
    description: (0, pg_core_1.text)("description").notNull(),
    pointsEarned: (0, pg_core_1.integer)("points_earned").notNull().default(0),
    metadata: (0, pg_core_1.jsonb)("metadata"), // datos adicionales sobre la actividad
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertGamificationActivitySchema = (0, drizzle_zod_1.createInsertSchema)(exports.gamificationActivities).pick({
    userId: true,
    activityType: true,
    description: true,
    pointsEarned: true,
    metadata: true,
});
// Tabla de clasificación (leaderboard)
exports.leaderboardEntries = (0, pg_core_1.pgTable)("leaderboard_entries", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    period: (0, pg_core_1.text)("period").notNull(), // diario, semanal, mensual, total
    periodStart: (0, pg_core_1.timestamp)("period_start").notNull(),
    periodEnd: (0, pg_core_1.timestamp)("period_end").notNull(),
    score: (0, pg_core_1.integer)("score").notNull().default(0),
    rank: (0, pg_core_1.integer)("rank").notNull(),
    region: (0, pg_core_1.text)("region"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertLeaderboardEntrySchema = (0, drizzle_zod_1.createInsertSchema)(exports.leaderboardEntries).pick({
    userId: true,
    period: true,
    periodStart: true,
    periodEnd: true,
    score: true,
    rank: true,
    region: true,
});
// Recompensas por logros de gamificación
exports.gamificationRewards = (0, pg_core_1.pgTable)("gamification_rewards", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    rewardType: (0, pg_core_1.text)("reward_type").notNull(), // descuento, crédito, físico, virtual
    value: (0, pg_core_1.integer)("value"), // valor de la recompensa (si aplica)
    requiredPoints: (0, pg_core_1.integer)("required_points").notNull(),
    code: (0, pg_core_1.text)("code"), // código de redención
    expiresAt: (0, pg_core_1.timestamp)("expires_at"),
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertGamificationRewardSchema = (0, drizzle_zod_1.createInsertSchema)(exports.gamificationRewards).pick({
    name: true,
    description: true,
    rewardType: true,
    value: true,
    requiredPoints: true,
    code: true,
    expiresAt: true,
    isActive: true,
});
// Recompensas reclamadas por usuarios
exports.userClaimedRewards = (0, pg_core_1.pgTable)("user_claimed_rewards", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    rewardId: (0, pg_core_1.integer)("reward_id").notNull(),
    claimedAt: (0, pg_core_1.timestamp)("claimed_at").defaultNow(),
    status: (0, pg_core_1.text)("status").notNull().default("pending"), // pending, processed, delivered, expired
    redemptionCode: (0, pg_core_1.text)("redemption_code"),
    expiresAt: (0, pg_core_1.timestamp)("expires_at"),
    processedAt: (0, pg_core_1.timestamp)("processed_at"),
});
exports.insertUserClaimedRewardSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userClaimedRewards).pick({
    userId: true,
    rewardId: true,
    status: true,
    redemptionCode: true,
    expiresAt: true,
    processedAt: true,
});
// ======= SISTEMA DE MICRO-INTERACCIONES =======
// Definición de micro-interacciones
exports.microInteractions = (0, pg_core_1.pgTable)("micro_interactions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    type: (0, pg_core_1.text)("type").notNull(), // 'confetti', 'achievement', 'toast', 'animation', 'sound', 'badge'
    triggerEvent: (0, pg_core_1.text)("trigger_event").notNull(), // Evento que activa la interacción
    displayMessage: (0, pg_core_1.text)("display_message").notNull(),
    animationData: (0, pg_core_1.jsonb)("animation_data"), // Configuración de la animación
    soundUrl: (0, pg_core_1.text)("sound_url"), // URL del sonido a reproducir
    visualAsset: (0, pg_core_1.text)("visual_asset"), // URL a un asset visual (imagen, icono)
    duration: (0, pg_core_1.integer)("duration"), // Duración en milisegundos
    pointsAwarded: (0, pg_core_1.integer)("points_awarded").default(0), // Puntos otorgados al usuario
    requiredLevel: (0, pg_core_1.integer)("required_level").default(1), // Nivel mínimo requerido
    frequency: (0, pg_core_1.text)("frequency").default("always"), // 'always', 'once', 'daily', 'weekly'
    cooldownSeconds: (0, pg_core_1.integer)("cooldown_seconds").default(0), // Tiempo de espera entre activaciones
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    showInHistory: (0, pg_core_1.boolean)("show_in_history").notNull().default(false), // Si se muestra en el historial del usuario
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertMicroInteractionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.microInteractions).pick({
    name: true,
    type: true,
    triggerEvent: true,
    displayMessage: true,
    animationData: true,
    soundUrl: true,
    visualAsset: true,
    duration: true,
    pointsAwarded: true,
    requiredLevel: true,
    frequency: true,
    cooldownSeconds: true,
    isActive: true,
    showInHistory: true
});
// Historial de micro-interacciones por usuario
exports.userInteractionHistory = (0, pg_core_1.pgTable)("user_interaction_history", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    interactionId: (0, pg_core_1.integer)("interaction_id").notNull(),
    triggeredAt: (0, pg_core_1.timestamp)("triggered_at").defaultNow(),
    pointsAwarded: (0, pg_core_1.integer)("points_awarded").default(0),
    context: (0, pg_core_1.jsonb)("context"), // Datos adicionales sobre cuando ocurrió
    viewed: (0, pg_core_1.boolean)("viewed").notNull().default(true),
});
exports.insertUserInteractionHistorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.userInteractionHistory).pick({
    userId: true,
    interactionId: true,
    pointsAwarded: true,
    context: true,
    viewed: true
});
// Logros rápidos (Quick Achievements)
exports.quickAchievements = (0, pg_core_1.pgTable)("quick_achievements", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    icon: (0, pg_core_1.text)("icon").notNull(), // URL al icono
    threshold: (0, pg_core_1.integer)("threshold").notNull(), // Valor necesario para desbloquear
    metricType: (0, pg_core_1.text)("metric_type").notNull(), // Tipo de métrica: 'consecutive_days', 'verifications', etc.
    rewardPoints: (0, pg_core_1.integer)("reward_points").notNull().default(0),
    badgeId: (0, pg_core_1.integer)("badge_id"), // Opcional: insignia relacionada
    level: (0, pg_core_1.integer)("level").notNull().default(1), // Nivel de dificultad o progresión
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertQuickAchievementSchema = (0, drizzle_zod_1.createInsertSchema)(exports.quickAchievements).pick({
    name: true,
    description: true,
    icon: true,
    threshold: true,
    metricType: true,
    rewardPoints: true,
    badgeId: true,
    level: true,
    isActive: true
});
// Progreso de logros por usuario
exports.userAchievementProgress = (0, pg_core_1.pgTable)("user_achievement_progress", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    achievementId: (0, pg_core_1.integer)("achievement_id").notNull(),
    currentValue: (0, pg_core_1.integer)("current_value").notNull().default(0),
    unlocked: (0, pg_core_1.boolean)("unlocked").notNull().default(false),
    unlockedAt: (0, pg_core_1.timestamp)("unlocked_at"),
    lastUpdated: (0, pg_core_1.timestamp)("last_updated").defaultNow(),
});
exports.insertUserAchievementProgressSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userAchievementProgress).pick({
    userId: true,
    achievementId: true,
    currentValue: true,
    unlocked: true,
    unlockedAt: true
});
// =====================================================
// Notary Public Section (Desactivado inicialmente)
// =====================================================
// Notary Profiles
exports.notaryProfiles = (0, pg_core_1.pgTable)("notary_profiles", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    registryNumber: (0, pg_core_1.text)("registry_number").notNull().unique(),
    licenseNumber: (0, pg_core_1.text)("license_number").notNull().unique(),
    jurisdiction: (0, pg_core_1.text)("jurisdiction").notNull(),
    officeAddress: (0, pg_core_1.text)("office_address").notNull(),
    officePhone: (0, pg_core_1.text)("office_phone").notNull(),
    officeEmail: (0, pg_core_1.text)("office_email").notNull(),
    website: (0, pg_core_1.text)("website"),
    bio: (0, pg_core_1.text)("bio"),
    specializations: (0, pg_core_1.jsonb)("specializations"), // Array of specializations
    serviceArea: (0, pg_core_1.jsonb)("service_area"), // Array of regions/jurisdictions served
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    verificationStatus: (0, pg_core_1.text)("verification_status").notNull().default("pending"), // pending, verified, rejected
    profileImageUrl: (0, pg_core_1.text)("profile_image_url"),
    digitalSignatureId: (0, pg_core_1.text)("digital_signature_id"), // ID of digital signature certificate
    digitalSignatureExpiry: (0, pg_core_1.date)("digital_signature_expiry"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertNotaryProfileSchema = (0, drizzle_zod_1.createInsertSchema)(exports.notaryProfiles).pick({
    userId: true,
    registryNumber: true,
    licenseNumber: true,
    jurisdiction: true,
    officeAddress: true,
    officePhone: true,
    officeEmail: true,
    website: true,
    bio: true,
    specializations: true,
    serviceArea: true,
    isActive: true,
    profileImageUrl: true,
    digitalSignatureId: true,
    digitalSignatureExpiry: true,
});
// Notary Protocol Books
exports.notaryProtocolBooks = (0, pg_core_1.pgTable)("notary_protocol_books", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    notaryId: (0, pg_core_1.integer)("notary_id").notNull().references(() => exports.notaryProfiles.id),
    year: (0, pg_core_1.integer)("year").notNull(),
    bookNumber: (0, pg_core_1.integer)("book_number").notNull(),
    startDate: (0, pg_core_1.date)("start_date").notNull(),
    endDate: (0, pg_core_1.date)("end_date"),
    totalDocuments: (0, pg_core_1.integer)("total_documents").default(0),
    status: (0, pg_core_1.text)("status").notNull().default("active"), // active, archived, closed
    physicalLocation: (0, pg_core_1.text)("physical_location"),
    digitalBackupUrl: (0, pg_core_1.text)("digital_backup_url"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertNotaryProtocolBookSchema = (0, drizzle_zod_1.createInsertSchema)(exports.notaryProtocolBooks).pick({
    notaryId: true,
    year: true,
    bookNumber: true,
    startDate: true,
    endDate: true,
    totalDocuments: true,
    status: true,
    physicalLocation: true,
    digitalBackupUrl: true,
});
// Notary Deeds and Documents
exports.notaryDeeds = (0, pg_core_1.pgTable)("notary_deeds", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    notaryId: (0, pg_core_1.integer)("notary_id").notNull().references(() => exports.notaryProfiles.id),
    protocolBookId: (0, pg_core_1.integer)("protocol_book_id").references(() => exports.notaryProtocolBooks.id),
    deedNumber: (0, pg_core_1.text)("deed_number").notNull(),
    deedType: (0, pg_core_1.text)("deed_type").notNull(), // power_of_attorney, real_estate, will, etc.
    deedTitle: (0, pg_core_1.text)("deed_title").notNull(),
    executionDate: (0, pg_core_1.date)("execution_date").notNull(),
    folio: (0, pg_core_1.text)("folio"),
    parties: (0, pg_core_1.jsonb)("parties"), // Array of involved parties
    folioCount: (0, pg_core_1.integer)("folio_count").default(1),
    digitalCopy: (0, pg_core_1.text)("digital_copy"), // URL to digital copy
    status: (0, pg_core_1.text)("status").notNull().default("active"), // active, cancelled, amended
    relatedDeedId: (0, pg_core_1.integer)("related_deed_id"), // For amendments or related deeds
    notes: (0, pg_core_1.text)("notes"),
    metadata: (0, pg_core_1.jsonb)("metadata"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertNotaryDeedSchema = (0, drizzle_zod_1.createInsertSchema)(exports.notaryDeeds).pick({
    notaryId: true,
    protocolBookId: true,
    deedNumber: true,
    deedType: true,
    deedTitle: true,
    executionDate: true,
    folio: true,
    parties: true,
    folioCount: true,
    digitalCopy: true,
    status: true,
    relatedDeedId: true,
    notes: true,
    metadata: true,
});
// Notary Fee Schedule
exports.notaryFeeSchedules = (0, pg_core_1.pgTable)("notary_fee_schedules", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    notaryId: (0, pg_core_1.integer)("notary_id").notNull().references(() => exports.notaryProfiles.id),
    serviceType: (0, pg_core_1.text)("service_type").notNull(), // deed, certification, authentication, etc.
    serviceName: (0, pg_core_1.text)("service_name").notNull(),
    description: (0, pg_core_1.text)("description"),
    basePrice: (0, pg_core_1.integer)("base_price").notNull(), // In cents
    variableRate: (0, pg_core_1.boolean)("variable_rate").default(false),
    variableFactor: (0, pg_core_1.text)("variable_factor"), // What the variable price depends on
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertNotaryFeeScheduleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.notaryFeeSchedules).pick({
    notaryId: true,
    serviceType: true,
    serviceName: true,
    description: true,
    basePrice: true,
    variableRate: true,
    variableFactor: true,
    isActive: true,
});
// Notary Appointments
exports.notaryAppointments = (0, pg_core_1.pgTable)("notary_appointments", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    notaryId: (0, pg_core_1.integer)("notary_id").notNull().references(() => exports.notaryProfiles.id),
    clientId: (0, pg_core_1.integer)("client_id").notNull().references(() => exports.users.id),
    serviceType: (0, pg_core_1.text)("service_type").notNull(),
    appointmentDate: (0, pg_core_1.timestamp)("appointment_date").notNull(),
    duration: (0, pg_core_1.integer)("duration").notNull().default(30), // In minutes
    status: (0, pg_core_1.text)("status").notNull().default("scheduled"), // scheduled, completed, cancelled, no_show
    notes: (0, pg_core_1.text)("notes"),
    location: (0, pg_core_1.text)("location").notNull().default("office"), // office, remote, client_location
    clientLocationAddress: (0, pg_core_1.text)("client_location_address"),
    meetingUrl: (0, pg_core_1.text)("meeting_url"), // For remote appointments
    reminderSent: (0, pg_core_1.boolean)("reminder_sent").default(false),
    feeEstimate: (0, pg_core_1.integer)("fee_estimate"), // Estimated fee in cents
    actualFee: (0, pg_core_1.integer)("actual_fee"), // Actual charged fee in cents
    paymentStatus: (0, pg_core_1.text)("payment_status").default("pending"), // pending, paid, waived
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertNotaryAppointmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.notaryAppointments).pick({
    notaryId: true,
    clientId: true,
    serviceType: true,
    appointmentDate: true,
    duration: true,
    notes: true,
    location: true,
    clientLocationAddress: true,
    meetingUrl: true,
    feeEstimate: true,
});
// Notary Biometric Verifications
exports.notaryBiometricVerifications = (0, pg_core_1.pgTable)("notary_biometric_verifications", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    notaryId: (0, pg_core_1.integer)("notary_id").notNull().references(() => exports.notaryProfiles.id),
    clientId: (0, pg_core_1.integer)("client_id").notNull().references(() => exports.users.id),
    deedId: (0, pg_core_1.integer)("deed_id").references(() => exports.notaryDeeds.id),
    verificationType: (0, pg_core_1.text)("verification_type").notNull(), // fingerprint, face, id_scan
    verificationData: (0, pg_core_1.jsonb)("verification_data").notNull(),
    verificationResult: (0, pg_core_1.boolean)("verification_result").notNull(),
    confidenceScore: (0, pg_core_1.real)("confidence_score"),
    verificationTimestamp: (0, pg_core_1.timestamp)("verification_timestamp").defaultNow().notNull(),
    ipAddress: (0, pg_core_1.text)("ip_address"),
    deviceInfo: (0, pg_core_1.text)("device_info"),
    geoLocation: (0, pg_core_1.text)("geo_location"),
    storageReference: (0, pg_core_1.text)("storage_reference"), // Reference to stored biometric data
    expiryDate: (0, pg_core_1.date)("expiry_date"), // When this verification expires
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertNotaryBiometricVerificationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.notaryBiometricVerifications).pick({
    notaryId: true,
    clientId: true,
    deedId: true,
    verificationType: true,
    verificationData: true,
    verificationResult: true,
    confidenceScore: true,
    ipAddress: true,
    deviceInfo: true,
    geoLocation: true,
    storageReference: true,
    expiryDate: true,
});
// Notary Registry Connections
exports.notaryRegistryConnections = (0, pg_core_1.pgTable)("notary_registry_connections", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    notaryId: (0, pg_core_1.integer)("notary_id").notNull().references(() => exports.notaryProfiles.id),
    registryName: (0, pg_core_1.text)("registry_name").notNull(), // property_registry, commercial_registry, etc.
    apiEndpoint: (0, pg_core_1.text)("api_endpoint").notNull(),
    apiCredentialId: (0, pg_core_1.text)("api_credential_id").notNull(),
    status: (0, pg_core_1.text)("status").notNull().default("active"), // active, inactive, error
    lastSyncTimestamp: (0, pg_core_1.timestamp)("last_sync_timestamp"),
    errorMessage: (0, pg_core_1.text)("error_message"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertNotaryRegistryConnectionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.notaryRegistryConnections).pick({
    notaryId: true,
    registryName: true,
    apiEndpoint: true,
    apiCredentialId: true,
    status: true,
});
// API Identity Verification (Nueva tabla para la API de verificación de identidad)
exports.identity_verifications = (0, pg_core_1.pgTable)("api_identity_verifications", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    sessionId: (0, pg_core_1.varchar)("session_id", { length: 128 }).notNull().unique(),
    status: (0, pg_core_1.varchar)("status", { length: 50 }).notNull().default("pending"), // pending, verified, failed, expired
    requiredVerifications: (0, pg_core_1.text)("required_verifications").notNull(), // JSON: ["document", "facial", "nfc"]
    completedVerifications: (0, pg_core_1.text)("completed_verifications"), // JSON: ["document", "facial"]
    userData: (0, pg_core_1.text)("user_data"), // JSON con datos proporcionados del usuario
    documentData: (0, pg_core_1.text)("document_data"), // JSON con datos extraídos del documento
    facialData: (0, pg_core_1.text)("facial_data"), // JSON con datos de verificación facial
    nfcData: (0, pg_core_1.text)("nfc_data"), // JSON con datos de verificación NFC
    verificationResult: (0, pg_core_1.text)("verification_result"), // JSON con resultado final
    callbackUrl: (0, pg_core_1.text)("callback_url").notNull(),
    customBranding: (0, pg_core_1.text)("custom_branding"), // JSON con personalizaciones de marca
    apiKey: (0, pg_core_1.text)("api_key"), // Clave API que hizo la solicitud
    tokenExpiry: (0, pg_core_1.timestamp)("token_expiry"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at"),
});
exports.insertApiIdentityVerificationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.identity_verifications).pick({
    sessionId: true,
    status: true,
    requiredVerifications: true,
    callbackUrl: true,
    apiKey: true,
    tokenExpiry: true,
});
// Exportación de los esquemas del sistema de gestión documental centralizado
__exportStar(require("./document-schema"), exports);
