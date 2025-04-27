import { pgTable, text, serial, integer, boolean, date, timestamp, jsonb } from "drizzle-orm/pg-core";
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

// Export types
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
