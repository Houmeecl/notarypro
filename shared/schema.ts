import { pgTable, text, serial, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

// Documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, validated, signed, rejected
  filePath: text("file_path").notNull(),
  certifierId: integer("certifier_id"),
  signatureData: text("signature_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  title: true,
  userId: true,
  filePath: true,
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

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
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
