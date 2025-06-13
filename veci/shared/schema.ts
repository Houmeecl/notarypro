import { pgTable, text, serial, integer, boolean, date, timestamp, jsonb, real, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

// Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  actionType: text("action_type").notNull(),
  details: jsonb("details"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Analytics Events
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(), // document_created, document_signed, document_certified, user_registered, etc.
  userId: integer("user_id"),
  documentId: integer("document_id"),
  templateId: integer("template_id"),
  courseId: integer("course_id"),
  videoCallId: integer("video_call_id"),
  metadata: jsonb("metadata"), // Additional data related to the event
  createdAt: timestamp("created_at").defaultNow(),
});

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("user"), // user, certifier, admin, lawyer, notary, partner
  platform: text("platform").default("notarypro"), // notarypro, vecinos
  businessName: text("business_name"), // For partners
  address: text("address"),
  region: text("region"),
  comuna: text("comuna"), // Community/District
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
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
export const documentCategories = pgTable("document_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDocumentCategorySchema = createInsertSchema(documentCategories).pick({
  name: true,
  description: true,
  order: true,
});

// Document Templates
export const documentTemplates = pgTable("document_templates", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  htmlTemplate: text("html_template").notNull(),
  price: integer("price").notNull().default(0), // Price in cents
  formSchema: jsonb("form_schema").notNull(), // JSON schema for the form
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  active: boolean("active").notNull().default(true),
});

export const insertDocumentTemplateSchema = createInsertSchema(documentTemplates).pick({
  categoryId: true,
  name: true,
  description: true,
  htmlTemplate: true,
  price: true,
  formSchema: true,
  active: true,
});

// Documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  templateId: integer("template_id").notNull(),
  title: text("title").notNull(),
  formData: jsonb("form_data").notNull(), // JSON with form data
  status: text("status").notNull().default("draft"), // draft, pending_payment, pending_identity, pending_signature, pending_certification, certified, rejected
  filePath: text("file_path"),
  pdfPath: text("pdf_path"),
  qrCode: text("qr_code"),
  certifierId: integer("certifier_id"),
  paymentId: text("payment_id"),
  paymentAmount: integer("payment_amount"),
  paymentStatus: text("payment_status"),
  paymentMethod: text("payment_method"),
  paymentTimestamp: timestamp("payment_timestamp"),
  email: text("email"), // Email para envío del documento
  receiveNotifications: boolean("receive_notifications").default(false),
  sendCopy: boolean("send_copy").default(false),
  signatureData: text("signature_data"),
  signatureTimestamp: timestamp("signature_timestamp"),
  certifierSignatureData: text("certifier_signature_data"),
  certifierSignatureTimestamp: timestamp("certifier_signature_timestamp"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  userId: true,
  templateId: true,
  title: true,
  formData: true,
});

// Identity Verification
export const identityVerifications = pgTable("identity_verifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  documentId: integer("document_id").notNull(),
  idPhotoPath: text("id_photo_path").notNull(),
  selfiePath: text("selfie_path").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  certifierId: integer("certifier_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertIdentityVerificationSchema = createInsertSchema(identityVerifications).pick({
  userId: true,
  documentId: true,
  idPhotoPath: true,
  selfiePath: true,
});

// Courses
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCourseSchema = createInsertSchema(courses).pick({
  title: true,
  description: true,
  price: true,
  imageUrl: true,
});

// Course Modules
export const courseModules = pgTable("course_modules", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: text("title").notNull(),
  order: integer("order").notNull(),
});

export const insertCourseModuleSchema = createInsertSchema(courseModules).pick({
  courseId: true,
  title: true,
  order: true,
});

// Course Contents
export const courseContents = pgTable("course_contents", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull(),
  title: text("title").notNull(),
  contentType: text("content_type").notNull(), // video, pdf, text
  content: text("content").notNull(),
  order: integer("order").notNull(),
});

export const insertCourseContentSchema = createInsertSchema(courseContents).pick({
  moduleId: true,
  title: true,
  contentType: true,
  content: true,
  order: true,
});

// Course Enrollments
export const courseEnrollments = pgTable("course_enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  completed: boolean("completed").default(false),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertCourseEnrollmentSchema = createInsertSchema(courseEnrollments).pick({
  userId: true,
  courseId: true,
});

// Quizzes
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull(),
  title: text("title").notNull(),
  passingScore: integer("passing_score").notNull().default(70),
});

export const insertQuizSchema = createInsertSchema(quizzes).pick({
  moduleId: true,
  title: true,
  passingScore: true,
});

// Quiz Questions
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull(),
  question: text("question").notNull(),
  options: text("options").notNull(), // JSON string of options
  correctAnswerIndex: integer("correct_answer_index").notNull(),
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).pick({
  quizId: true,
  question: true,
  options: true,
  correctAnswerIndex: true,
});

// Quiz Attempts
export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  quizId: integer("quiz_id").notNull(),
  score: integer("score").notNull(),
  passed: boolean("passed").notNull(),
  attemptedAt: timestamp("attempted_at").defaultNow(),
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).pick({
  userId: true,
  quizId: true,
  score: true,
  passed: true,
});

// Certificates
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  certificateNumber: text("certificate_number").notNull().unique(),
  issuedAt: timestamp("issued_at").defaultNow(),
});

export const insertCertificateSchema = createInsertSchema(certificates).pick({
  userId: true,
  courseId: true,
  certificateNumber: true,
});

// Video Call Services
export const videoCallServices = pgTable("video_call_services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Price in cents
  duration: integer("duration").notNull(), // Duration in minutes
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVideoCallServiceSchema = createInsertSchema(videoCallServices).pick({
  name: true,
  description: true,
  price: true,
  duration: true,
  active: true,
});

// Video Call Sessions
export const videoCallSessions = pgTable("video_call_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  serviceId: integer("service_id").notNull(),
  certifierId: integer("certifier_id"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: text("status").notNull().default("pending_payment"), // pending_payment, scheduled, completed, cancelled
  meetingUrl: text("meeting_url"),
  meetingId: text("meeting_id"),
  meetingPassword: text("meeting_password"),
  paymentId: text("payment_id"),
  paymentAmount: integer("payment_amount"),
  paymentStatus: text("payment_status"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVideoCallSessionSchema = createInsertSchema(videoCallSessions).pick({
  userId: true,
  serviceId: true,
  scheduledAt: true,
});

// Partners (Vecinos NotaryPro Express)
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),  // Associated user account for login
  storeName: text("store_name").notNull(),
  managerName: text("manager_name").notNull(),
  region: text("region").notNull(),
  commune: text("commune").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull().unique(),
  hasInternet: boolean("has_internet").notNull(),
  hasDevice: boolean("has_device").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  notes: text("notes"),
  // POS integration fields
  posIntegrated: boolean("pos_integrated").default(false),
  posProvider: text("pos_provider"),
  posApiKey: text("pos_api_key"),
  posStoreId: text("pos_store_id"),
  posSalesEndpoint: text("pos_sales_endpoint"),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Partner Stores (for the webapp alternative)
export const partnerStores = pgTable("partner_stores", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  address: text("address").notNull(),
  storeCode: text("store_code").notNull().unique(), // Unique code for webapp login
  commissionRate: real("commission_rate").notNull().default(0.1), // Default 10%
  active: boolean("active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Partner Transactions (for the webapp alternative)
export const partnerTransactions = pgTable("partner_transactions", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull().references(() => partnerStores.id),
  documentTemplateId: integer("document_template_id").notNull().references(() => documentTemplates.id),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone").notNull(),
  clientDocument: text("client_document"),
  amount: integer("amount").notNull(), // Total amount in cents
  commission: integer("commission").notNull(), // Commission amount in cents
  status: text("status").notNull().default("pending"), // pending, completed, cancelled
  processingCode: text("processing_code").notNull().unique(), // Unique code for tracking
  completedAt: timestamp("completed_at"),
  paymentMethod: text("payment_method"),
  paymentReference: text("payment_reference"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPartnerSchema = createInsertSchema(partners).pick({
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
export const posTransactions = pgTable("pos_transactions", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => partners.id),
  transactionDate: timestamp("transaction_date", { mode: 'date' }).notNull(),
  transactionId: text("transaction_id"),
  posReference: text("pos_reference"),
  amount: integer("amount").notNull(), // Amount in cents
  items: jsonb("items"), // Items sold in this transaction
  commissionAmount: integer("commission_amount"), // Commission in cents
  commissionRate: real("commission_rate"),
  synchronized: boolean("synchronized").default(true).notNull(),
  metadata: jsonb("metadata"), // Additional POS data
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
});

export const insertPosTransactionSchema = createInsertSchema(posTransactions).pick({
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
export const posProviders = pgTable("pos_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  apiBaseUrl: text("api_base_url").notNull(),
  apiDocumentationUrl: text("api_documentation_url"),
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").default(true).notNull(),
  requiredFields: jsonb("required_fields").notNull(),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
});

export const insertPosProviderSchema = createInsertSchema(posProviders).pick({
  name: true,
  displayName: true,
  apiBaseUrl: true,
  apiDocumentationUrl: true,
  logoUrl: true,
  isActive: true,
  requiredFields: true,
});

// Partner Bank Details
export const partnerBankDetails = pgTable("partner_bank_details", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull(),
  bank: text("bank").notNull(),
  accountType: text("account_type").notNull(), // checking, savings, vista
  accountNumber: text("account_number").notNull(),
  rut: text("rut").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPartnerBankDetailsSchema = createInsertSchema(partnerBankDetails).pick({
  partnerId: true,
  bank: true,
  accountType: true,
  accountNumber: true,
  rut: true,
});

// Partner Sales
export const partnerSales = pgTable("partner_sales", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull(),
  documentId: integer("document_id").notNull(),
  amount: integer("amount").notNull(), // Total sale amount
  commission: integer("commission").notNull(), // Commission amount for partner
  commissionRate: real("commission_rate").notNull(), // Rate applied for this sale (e.g., 0.15 for 15%)
  status: text("status").notNull().default("pending"), // pending, available, paid
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPartnerSaleSchema = createInsertSchema(partnerSales).pick({
  partnerId: true,
  documentId: true,
  amount: true,
  commission: true,
  commissionRate: true,
});

// Partner Payments
export const partnerPayments = pgTable("partner_payments", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull(),
  amount: integer("amount").notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentMethod: text("payment_method").notNull(), // bank_transfer, check, etc.
  reference: text("reference"), // Reference number, transaction ID, etc.
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPartnerPaymentSchema = createInsertSchema(partnerPayments).pick({
  partnerId: true,
  amount: true,
  paymentDate: true,
  paymentMethod: true,
  reference: true,
  notes: true,
});

// CRM Leads
export const crmLeads = pgTable("crm_leads", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  rut: text("rut"),
  documentType: text("document_type"),
  status: text("status").notNull().default("initiated"), // initiated, data_completed, payment_completed, certified, incomplete
  source: text("source").notNull().default("webapp"), // webapp, android, website, whatsapp
  pipelineStage: text("pipeline_stage").notNull().default("initiated"), // initiated, data_completed, payment_completed, certified, incomplete
  lastContactDate: timestamp("last_contact_date").defaultNow(),
  assignedToUserId: integer("assigned_to_user_id"),
  notes: text("notes"),
  metadata: jsonb("metadata"), // Additional data
  crmExternalId: text("crm_external_id"), // ID in external CRM system
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCrmLeadSchema = createInsertSchema(crmLeads).pick({
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
export const whatsappMessages = pgTable("whatsapp_messages", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id"),
  userId: integer("user_id"),
  direction: text("direction").notNull(), // incoming, outgoing
  phoneNumber: text("phone_number").notNull(),
  messageType: text("message_type").notNull().default("text"), // text, image, document, template
  content: text("content").notNull(),
  templateName: text("template_name"), // For template messages
  status: text("status").notNull().default("pending"), // pending, sent, delivered, read, failed
  externalMessageId: text("external_message_id"), // ID from WhatsApp API
  metadata: jsonb("metadata"), // Additional data
  sentAt: timestamp("sent_at").defaultNow(),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
});

export const insertWhatsappMessageSchema = createInsertSchema(whatsappMessages).pick({
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
export const dialogflowSessions = pgTable("dialogflow_sessions", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id"),
  userId: integer("user_id"),
  sessionId: text("session_id").notNull().unique(), // Dialogflow session ID
  intent: text("intent"), // Current/last detected intent
  parameters: jsonb("parameters"), // Session parameters
  status: text("status").notNull().default("active"), // active, transferred, closed
  transferredToUserId: integer("transferred_to_user_id"), // If conversation was transferred to human
  metadata: jsonb("metadata"), // Additional data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastInteractionAt: timestamp("last_interaction_at").defaultNow(),
});

export const insertDialogflowSessionSchema = createInsertSchema(dialogflowSessions).pick({
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
export const messageTemplates = pgTable("message_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category").notNull(), // onboarding, payment, certification, follow_up, etc.
  content: text("content").notNull(),
  variables: jsonb("variables"), // Available variables for this template
  isWhatsappTemplate: boolean("is_whatsapp_template").default(false).notNull(), // If approved by WhatsApp
  whatsappTemplateNamespace: text("whatsapp_template_namespace"), // WhatsApp template namespace
  whatsappTemplateElementName: text("whatsapp_template_element_name"), // Element name in WhatsApp
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMessageTemplateSchema = createInsertSchema(messageTemplates).pick({
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
export const automationRules = pgTable("automation_rules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  triggerType: text("trigger_type").notNull(), // event_based, schedule_based, condition_based
  triggerEvent: text("trigger_event"), // For event_based: document_created, payment_completed, etc.
  triggerSchedule: text("trigger_schedule"), // For schedule_based: cron expression
  triggerCondition: jsonb("trigger_condition"), // For condition_based: JSON condition
  actionType: text("action_type").notNull(), // send_whatsapp, create_lead, update_lead, transfer_to_human
  actionConfig: jsonb("action_config").notNull(), // Action configuration
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAutomationRuleSchema = createInsertSchema(automationRules).pick({
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

// Export original types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type DocumentCategory = typeof documentCategories.$inferSelect;
export type InsertDocumentCategory = z.infer<typeof insertDocumentCategorySchema>;
export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type InsertDocumentTemplate = z.infer<typeof insertDocumentTemplateSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).pick({
  eventType: true,
  userId: true,
  documentId: true,
  templateId: true,
  courseId: true,
  videoCallId: true,
  metadata: true,
});
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;

export type IdentityVerification = typeof identityVerifications.$inferSelect;
export type InsertIdentityVerification = z.infer<typeof insertIdentityVerificationSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type CourseModule = typeof courseModules.$inferSelect;
export type InsertCourseModule = z.infer<typeof insertCourseModuleSchema>;
export type CourseContent = typeof courseContents.$inferSelect;
export type InsertCourseContent = z.infer<typeof insertCourseContentSchema>;
export type CourseEnrollment = typeof courseEnrollments.$inferSelect;
export type InsertCourseEnrollment = z.infer<typeof insertCourseEnrollmentSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type VideoCallService = typeof videoCallServices.$inferSelect;
export type InsertVideoCallService = z.infer<typeof insertVideoCallServiceSchema>;
export type VideoCallSession = typeof videoCallSessions.$inferSelect;
export type InsertVideoCallSession = z.infer<typeof insertVideoCallSessionSchema>;

// Partner Types
export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type PartnerBankDetails = typeof partnerBankDetails.$inferSelect;
export type InsertPartnerBankDetails = z.infer<typeof insertPartnerBankDetailsSchema>;
export type PartnerSale = typeof partnerSales.$inferSelect;
export type InsertPartnerSale = z.infer<typeof insertPartnerSaleSchema>;
export type PartnerPayment = typeof partnerPayments.$inferSelect;
export type InsertPartnerPayment = z.infer<typeof insertPartnerPaymentSchema>;

// POS Types
export type PosTransaction = typeof posTransactions.$inferSelect;
export type InsertPosTransaction = z.infer<typeof insertPosTransactionSchema>;
export type PosProvider = typeof posProviders.$inferSelect;
export type InsertPosProvider = z.infer<typeof insertPosProviderSchema>;

// CRM & Automation Types
export type CrmLead = typeof crmLeads.$inferSelect;
export type InsertCrmLead = z.infer<typeof insertCrmLeadSchema>;
export type WhatsappMessage = typeof whatsappMessages.$inferSelect;
export type InsertWhatsappMessage = z.infer<typeof insertWhatsappMessageSchema>;
export type DialogflowSession = typeof dialogflowSessions.$inferSelect;
export type InsertDialogflowSession = z.infer<typeof insertDialogflowSessionSchema>;
export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type InsertMessageTemplate = z.infer<typeof insertMessageTemplateSchema>;
export type AutomationRule = typeof automationRules.$inferSelect;
export type InsertAutomationRule = z.infer<typeof insertAutomationRuleSchema>;

// ======= GAMIFICACIÓN DE AUTENTICACIÓN DE DOCUMENTOS =======

// Desafíos de verificación de documentos
export const verificationChallenges = pgTable("verification_challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  points: integer("points").notNull(),
  requiredActions: jsonb("required_actions").notNull(), // array de acciones necesarias para completar
  completionCriteria: jsonb("completion_criteria").notNull(), // condiciones para completar el desafío
  isActive: boolean("is_active").notNull().default(true),
  difficultyLevel: integer("difficulty_level").notNull().default(1), // 1-5
  imageUrl: text("image_url"),
  badgeImage: text("badge_image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVerificationChallengeSchema = createInsertSchema(verificationChallenges).pick({
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
export const userChallengeProgress = pgTable("user_challenge_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  progress: jsonb("progress").notNull(), // estado actual de progreso
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  awardedPoints: integer("awarded_points"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserChallengeProgressSchema = createInsertSchema(userChallengeProgress).pick({
  userId: true,
  challengeId: true,
  progress: true,
  isCompleted: true,
  completedAt: true,
  awardedPoints: true,
});

// Insignias de verificación
export const verificationBadges = pgTable("verification_badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  requiredPoints: integer("required_points").notNull(),
  tier: text("tier").notNull(), // bronce, plata, oro, platino, diamante
  isRare: boolean("is_rare").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVerificationBadgeSchema = createInsertSchema(verificationBadges).pick({
  name: true,
  description: true,
  imageUrl: true,
  requiredPoints: true,
  tier: true,
  isRare: true,
});

// Insignias conseguidas por usuario
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  badgeId: integer("badge_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
  showcaseOrder: integer("showcase_order"), // posición para mostrar en perfil (NULL si no se muestra)
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).pick({
  userId: true,
  badgeId: true,
  showcaseOrder: true,
});

// Perfil de gamificación de usuario
export const userGameProfiles = pgTable("user_game_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  totalPoints: integer("total_points").notNull().default(0),
  level: integer("level").notNull().default(1),
  consecutiveDays: integer("consecutive_days").notNull().default(0),
  lastActive: timestamp("last_active").defaultNow(),
  verificationStreak: integer("verification_streak").notNull().default(0),
  totalVerifications: integer("total_verifications").notNull().default(0),
  rank: text("rank").notNull().default("Novato"),
  preferences: jsonb("preferences"), // preferencias de gamificación
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserGameProfileSchema = createInsertSchema(userGameProfiles).pick({
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
export const gamificationActivities = pgTable("gamification_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityType: text("activity_type").notNull(), // verificación, desafío_completado, insignia_ganada, nivel_subido
  description: text("description").notNull(),
  pointsEarned: integer("points_earned").notNull().default(0),
  metadata: jsonb("metadata"), // datos adicionales sobre la actividad
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGamificationActivitySchema = createInsertSchema(gamificationActivities).pick({
  userId: true,
  activityType: true,
  description: true,
  pointsEarned: true,
  metadata: true,
});

// Tabla de clasificación (leaderboard)
export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  period: text("period").notNull(), // diario, semanal, mensual, total
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  score: integer("score").notNull().default(0),
  rank: integer("rank").notNull(),
  region: text("region"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).pick({
  userId: true,
  period: true,
  periodStart: true,
  periodEnd: true,
  score: true,
  rank: true,
  region: true,
});

// Recompensas por logros de gamificación
export const gamificationRewards = pgTable("gamification_rewards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  rewardType: text("reward_type").notNull(), // descuento, crédito, físico, virtual
  value: integer("value"), // valor de la recompensa (si aplica)
  requiredPoints: integer("required_points").notNull(),
  code: text("code"), // código de redención
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGamificationRewardSchema = createInsertSchema(gamificationRewards).pick({
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
export const userClaimedRewards = pgTable("user_claimed_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  rewardId: integer("reward_id").notNull(),
  claimedAt: timestamp("claimed_at").defaultNow(),
  status: text("status").notNull().default("pending"), // pending, processed, delivered, expired
  redemptionCode: text("redemption_code"),
  expiresAt: timestamp("expires_at"),
  processedAt: timestamp("processed_at"),
});

export const insertUserClaimedRewardSchema = createInsertSchema(userClaimedRewards).pick({
  userId: true,
  rewardId: true,
  status: true,
  redemptionCode: true,
  expiresAt: true,
  processedAt: true,
});

// Tipos de gamificación
export type VerificationChallenge = typeof verificationChallenges.$inferSelect;
export type InsertVerificationChallenge = z.infer<typeof insertVerificationChallengeSchema>;
export type UserChallengeProgress = typeof userChallengeProgress.$inferSelect;
export type InsertUserChallengeProgress = z.infer<typeof insertUserChallengeProgressSchema>;
export type VerificationBadge = typeof verificationBadges.$inferSelect;
export type InsertVerificationBadge = z.infer<typeof insertVerificationBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserGameProfile = typeof userGameProfiles.$inferSelect;
export type InsertUserGameProfile = z.infer<typeof insertUserGameProfileSchema>;
export type GamificationActivity = typeof gamificationActivities.$inferSelect;
export type InsertGamificationActivity = z.infer<typeof insertGamificationActivitySchema>;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;
export type GamificationReward = typeof gamificationRewards.$inferSelect;
export type InsertGamificationReward = z.infer<typeof insertGamificationRewardSchema>;
export type UserClaimedReward = typeof userClaimedRewards.$inferSelect;
export type InsertUserClaimedReward = z.infer<typeof insertUserClaimedRewardSchema>;

// Interfaces de Gamificación
// Estas interfaces se utilizan para la tipificación de los datos de gamificación
export interface DocumentVerification {
  id: number;
  code: string;
  documentId: number;
  documentTitle: string;
  verified: boolean;
  verifiedAt: Date | null;
}

// ======= SISTEMA DE MICRO-INTERACCIONES =======

// Definición de micro-interacciones
export const microInteractions = pgTable("micro_interactions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'confetti', 'achievement', 'toast', 'animation', 'sound', 'badge'
  triggerEvent: text("trigger_event").notNull(), // Evento que activa la interacción
  displayMessage: text("display_message").notNull(),
  animationData: jsonb("animation_data"), // Configuración de la animación
  soundUrl: text("sound_url"), // URL del sonido a reproducir
  visualAsset: text("visual_asset"), // URL a un asset visual (imagen, icono)
  duration: integer("duration"), // Duración en milisegundos
  pointsAwarded: integer("points_awarded").default(0), // Puntos otorgados al usuario
  requiredLevel: integer("required_level").default(1), // Nivel mínimo requerido
  frequency: text("frequency").default("always"), // 'always', 'once', 'daily', 'weekly'
  cooldownSeconds: integer("cooldown_seconds").default(0), // Tiempo de espera entre activaciones
  isActive: boolean("is_active").notNull().default(true),
  showInHistory: boolean("show_in_history").notNull().default(false), // Si se muestra en el historial del usuario
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMicroInteractionSchema = createInsertSchema(microInteractions).pick({
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
export const userInteractionHistory = pgTable("user_interaction_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  interactionId: integer("interaction_id").notNull(),
  triggeredAt: timestamp("triggered_at").defaultNow(),
  pointsAwarded: integer("points_awarded").default(0),
  context: jsonb("context"), // Datos adicionales sobre cuando ocurrió
  viewed: boolean("viewed").notNull().default(true),
});

export const insertUserInteractionHistorySchema = createInsertSchema(userInteractionHistory).pick({
  userId: true,
  interactionId: true,
  pointsAwarded: true,
  context: true,
  viewed: true
});

// Logros rápidos (Quick Achievements)
export const quickAchievements = pgTable("quick_achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // URL al icono
  threshold: integer("threshold").notNull(), // Valor necesario para desbloquear
  metricType: text("metric_type").notNull(), // Tipo de métrica: 'consecutive_days', 'verifications', etc.
  rewardPoints: integer("reward_points").notNull().default(0),
  badgeId: integer("badge_id"), // Opcional: insignia relacionada
  level: integer("level").notNull().default(1), // Nivel de dificultad o progresión
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertQuickAchievementSchema = createInsertSchema(quickAchievements).pick({
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
export const userAchievementProgress = pgTable("user_achievement_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  currentValue: integer("current_value").notNull().default(0),
  unlocked: boolean("unlocked").notNull().default(false),
  unlockedAt: timestamp("unlocked_at"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertUserAchievementProgressSchema = createInsertSchema(userAchievementProgress).pick({
  userId: true,
  achievementId: true,
  currentValue: true,
  unlocked: true,
  unlockedAt: true
});

// Exportar tipos para el sistema de micro-interacciones
export type MicroInteraction = typeof microInteractions.$inferSelect;
export type InsertMicroInteraction = z.infer<typeof insertMicroInteractionSchema>;
export type UserInteractionHistory = typeof userInteractionHistory.$inferSelect;
export type InsertUserInteractionHistory = z.infer<typeof insertUserInteractionHistorySchema>;
export type QuickAchievement = typeof quickAchievements.$inferSelect;
export type InsertQuickAchievement = z.infer<typeof insertQuickAchievementSchema>;
export type UserAchievementProgress = typeof userAchievementProgress.$inferSelect;
export type InsertUserAchievementProgress = z.infer<typeof insertUserAchievementProgressSchema>;

// =====================================================
// Notary Public Section (Desactivado inicialmente)
// =====================================================

// Notary Profiles
export const notaryProfiles = pgTable("notary_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  registryNumber: text("registry_number").notNull().unique(),
  licenseNumber: text("license_number").notNull().unique(),
  jurisdiction: text("jurisdiction").notNull(),
  officeAddress: text("office_address").notNull(),
  officePhone: text("office_phone").notNull(),
  officeEmail: text("office_email").notNull(),
  website: text("website"),
  bio: text("bio"),
  specializations: jsonb("specializations"), // Array of specializations
  serviceArea: jsonb("service_area"), // Array of regions/jurisdictions served
  isActive: boolean("is_active").default(true),
  verificationStatus: text("verification_status").notNull().default("pending"), // pending, verified, rejected
  profileImageUrl: text("profile_image_url"),
  digitalSignatureId: text("digital_signature_id"), // ID of digital signature certificate
  digitalSignatureExpiry: date("digital_signature_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNotaryProfileSchema = createInsertSchema(notaryProfiles).pick({
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

export type NotaryProfile = typeof notaryProfiles.$inferSelect;
export type InsertNotaryProfile = z.infer<typeof insertNotaryProfileSchema>;

// Notary Protocol Books
export const notaryProtocolBooks = pgTable("notary_protocol_books", {
  id: serial("id").primaryKey(),
  notaryId: integer("notary_id").notNull().references(() => notaryProfiles.id),
  year: integer("year").notNull(),
  bookNumber: integer("book_number").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  totalDocuments: integer("total_documents").default(0),
  status: text("status").notNull().default("active"), // active, archived, closed
  physicalLocation: text("physical_location"),
  digitalBackupUrl: text("digital_backup_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNotaryProtocolBookSchema = createInsertSchema(notaryProtocolBooks).pick({
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

export type NotaryProtocolBook = typeof notaryProtocolBooks.$inferSelect;
export type InsertNotaryProtocolBook = z.infer<typeof insertNotaryProtocolBookSchema>;

// Notary Deeds and Documents
export const notaryDeeds = pgTable("notary_deeds", {
  id: serial("id").primaryKey(),
  notaryId: integer("notary_id").notNull().references(() => notaryProfiles.id),
  protocolBookId: integer("protocol_book_id").references(() => notaryProtocolBooks.id),
  deedNumber: text("deed_number").notNull(),
  deedType: text("deed_type").notNull(), // power_of_attorney, real_estate, will, etc.
  deedTitle: text("deed_title").notNull(),
  executionDate: date("execution_date").notNull(),
  folio: text("folio"),
  parties: jsonb("parties"), // Array of involved parties
  folioCount: integer("folio_count").default(1),
  digitalCopy: text("digital_copy"), // URL to digital copy
  status: text("status").notNull().default("active"), // active, cancelled, amended
  relatedDeedId: integer("related_deed_id"), // For amendments or related deeds
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNotaryDeedSchema = createInsertSchema(notaryDeeds).pick({
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

export type NotaryDeed = typeof notaryDeeds.$inferSelect;
export type InsertNotaryDeed = z.infer<typeof insertNotaryDeedSchema>;

// Notary Fee Schedule
export const notaryFeeSchedules = pgTable("notary_fee_schedules", {
  id: serial("id").primaryKey(),
  notaryId: integer("notary_id").notNull().references(() => notaryProfiles.id),
  serviceType: text("service_type").notNull(), // deed, certification, authentication, etc.
  serviceName: text("service_name").notNull(),
  description: text("description"),
  basePrice: integer("base_price").notNull(), // In cents
  variableRate: boolean("variable_rate").default(false),
  variableFactor: text("variable_factor"), // What the variable price depends on
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNotaryFeeScheduleSchema = createInsertSchema(notaryFeeSchedules).pick({
  notaryId: true,
  serviceType: true,
  serviceName: true,
  description: true,
  basePrice: true,
  variableRate: true,
  variableFactor: true,
  isActive: true,
});

export type NotaryFeeSchedule = typeof notaryFeeSchedules.$inferSelect;
export type InsertNotaryFeeSchedule = z.infer<typeof insertNotaryFeeScheduleSchema>;

// Notary Appointments
export const notaryAppointments = pgTable("notary_appointments", {
  id: serial("id").primaryKey(),
  notaryId: integer("notary_id").notNull().references(() => notaryProfiles.id),
  clientId: integer("client_id").notNull().references(() => users.id),
  serviceType: text("service_type").notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration").notNull().default(30), // In minutes
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled, no_show
  notes: text("notes"),
  location: text("location").notNull().default("office"), // office, remote, client_location
  clientLocationAddress: text("client_location_address"),
  meetingUrl: text("meeting_url"), // For remote appointments
  reminderSent: boolean("reminder_sent").default(false),
  feeEstimate: integer("fee_estimate"), // Estimated fee in cents
  actualFee: integer("actual_fee"), // Actual charged fee in cents
  paymentStatus: text("payment_status").default("pending"), // pending, paid, waived
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNotaryAppointmentSchema = createInsertSchema(notaryAppointments).pick({
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

export type NotaryAppointment = typeof notaryAppointments.$inferSelect;
export type InsertNotaryAppointment = z.infer<typeof insertNotaryAppointmentSchema>;

// Notary Biometric Verifications
export const notaryBiometricVerifications = pgTable("notary_biometric_verifications", {
  id: serial("id").primaryKey(),
  notaryId: integer("notary_id").notNull().references(() => notaryProfiles.id),
  clientId: integer("client_id").notNull().references(() => users.id),
  deedId: integer("deed_id").references(() => notaryDeeds.id),
  verificationType: text("verification_type").notNull(), // fingerprint, face, id_scan
  verificationData: jsonb("verification_data").notNull(),
  verificationResult: boolean("verification_result").notNull(),
  confidenceScore: real("confidence_score"),
  verificationTimestamp: timestamp("verification_timestamp").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  deviceInfo: text("device_info"),
  geoLocation: text("geo_location"),
  storageReference: text("storage_reference"), // Reference to stored biometric data
  expiryDate: date("expiry_date"), // When this verification expires
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotaryBiometricVerificationSchema = createInsertSchema(notaryBiometricVerifications).pick({
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

export type NotaryBiometricVerification = typeof notaryBiometricVerifications.$inferSelect;
export type InsertNotaryBiometricVerification = z.infer<typeof insertNotaryBiometricVerificationSchema>;

// Notary Registry Connections
export const notaryRegistryConnections = pgTable("notary_registry_connections", {
  id: serial("id").primaryKey(),
  notaryId: integer("notary_id").notNull().references(() => notaryProfiles.id),
  registryName: text("registry_name").notNull(), // property_registry, commercial_registry, etc.
  apiEndpoint: text("api_endpoint").notNull(),
  apiCredentialId: text("api_credential_id").notNull(),
  status: text("status").notNull().default("active"), // active, inactive, error
  lastSyncTimestamp: timestamp("last_sync_timestamp"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNotaryRegistryConnectionSchema = createInsertSchema(notaryRegistryConnections).pick({
  notaryId: true,
  registryName: true,
  apiEndpoint: true,
  apiCredentialId: true,
  status: true,
});

export type NotaryRegistryConnection = typeof notaryRegistryConnections.$inferSelect;
export type InsertNotaryRegistryConnection = z.infer<typeof insertNotaryRegistryConnectionSchema>;

// API Identity Verification (Nueva tabla para la API de verificación de identidad)
export const identity_verifications = pgTable("api_identity_verifications", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 128 }).notNull().unique(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, verified, failed, expired
  requiredVerifications: text("required_verifications").notNull(), // JSON: ["document", "facial", "nfc"]
  completedVerifications: text("completed_verifications"), // JSON: ["document", "facial"]
  userData: text("user_data"), // JSON con datos proporcionados del usuario
  documentData: text("document_data"), // JSON con datos extraídos del documento
  facialData: text("facial_data"), // JSON con datos de verificación facial
  nfcData: text("nfc_data"), // JSON con datos de verificación NFC
  verificationResult: text("verification_result"), // JSON con resultado final
  callbackUrl: text("callback_url").notNull(),
  customBranding: text("custom_branding"), // JSON con personalizaciones de marca
  apiKey: text("api_key"), // Clave API que hizo la solicitud
  tokenExpiry: timestamp("token_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export type ApiIdentityVerification = typeof identity_verifications.$inferSelect;
export type InsertApiIdentityVerification = typeof identity_verifications.$inferInsert;

export const insertApiIdentityVerificationSchema = createInsertSchema(identity_verifications).pick({
  sessionId: true,
  status: true,
  requiredVerifications: true,
  callbackUrl: true,
  apiKey: true,
  tokenExpiry: true,
});

// Exportación de los esquemas del sistema de gestión documental centralizado
export * from './document-schema';
