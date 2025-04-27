import { pgTable, text, serial, integer, boolean, date, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  role: text("role").notNull().default("user"), // user, certifier, admin
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  role: true,
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
