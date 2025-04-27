import {
  users, type User, type InsertUser,
  documentCategories, type DocumentCategory, type InsertDocumentCategory,
  documentTemplates, type DocumentTemplate, type InsertDocumentTemplate,
  documents, type Document, type InsertDocument,
  identityVerifications, type IdentityVerification, type InsertIdentityVerification,
  courses, type Course, type InsertCourse,
  courseModules, type CourseModule, type InsertCourseModule,
  courseContents, type CourseContent, type InsertCourseContent,
  courseEnrollments, type CourseEnrollment, type InsertCourseEnrollment,
  quizzes, type Quiz, type InsertQuiz,
  quizQuestions, type QuizQuestion, type InsertQuizQuestion,
  quizAttempts, type QuizAttempt, type InsertQuizAttempt,
  certificates, type Certificate, type InsertCertificate,
  videoCallServices, type VideoCallService, type InsertVideoCallService,
  videoCallSessions, type VideoCallSession, type InsertVideoCallSession
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and, asc, desc } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // Document Category operations
  createDocumentCategory(category: InsertDocumentCategory): Promise<DocumentCategory>;
  getDocumentCategory(id: number): Promise<DocumentCategory | undefined>;
  getAllDocumentCategories(): Promise<DocumentCategory[]>;
  updateDocumentCategory(id: number, category: Partial<DocumentCategory>): Promise<DocumentCategory | undefined>;
  deleteDocumentCategory(id: number): Promise<boolean>;
  
  // Document Template operations
  createDocumentTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate>;
  getDocumentTemplate(id: number): Promise<DocumentTemplate | undefined>;
  getDocumentTemplatesByCategory(categoryId: number): Promise<DocumentTemplate[]>;
  getAllDocumentTemplates(): Promise<DocumentTemplate[]>;
  updateDocumentTemplate(id: number, template: Partial<DocumentTemplate>): Promise<DocumentTemplate | undefined>;
  deleteDocumentTemplate(id: number): Promise<boolean>;
  
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: number): Promise<Document | undefined>;
  getUserDocuments(userId: number): Promise<Document[]>;
  updateDocument(id: number, document: Partial<Document>): Promise<Document | undefined>;
  getPendingDocuments(): Promise<Document[]>;
  getCertifierDocuments(certifierId: number): Promise<Document[]>;
  getDocumentsByStatus(status: string): Promise<Document[]>;
  
  // Identity verification operations
  createIdentityVerification(verification: InsertIdentityVerification): Promise<IdentityVerification>;
  getIdentityVerification(id: number): Promise<IdentityVerification | undefined>;
  getIdentityVerificationByDocument(documentId: number): Promise<IdentityVerification | undefined>;
  updateIdentityVerification(id: number, verification: Partial<IdentityVerification>): Promise<IdentityVerification | undefined>;
  
  // Course operations
  createCourse(course: InsertCourse): Promise<Course>;
  getCourse(id: number): Promise<Course | undefined>;
  getAllCourses(): Promise<Course[]>;
  
  // Course Module operations
  createCourseModule(module: InsertCourseModule): Promise<CourseModule>;
  getCourseModules(courseId: number): Promise<CourseModule[]>;
  
  // Course Content operations
  createCourseContent(content: InsertCourseContent): Promise<CourseContent>;
  getCourseContents(moduleId: number): Promise<CourseContent[]>;
  
  // Course Enrollment operations
  createCourseEnrollment(enrollment: InsertCourseEnrollment): Promise<CourseEnrollment>;
  getUserEnrollments(userId: number): Promise<CourseEnrollment[]>;
  updateCourseEnrollment(id: number, enrollment: Partial<CourseEnrollment>): Promise<CourseEnrollment | undefined>;
  
  // Quiz operations
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuiz(id: number): Promise<Quiz | undefined>;
  getModuleQuizzes(moduleId: number): Promise<Quiz[]>;
  
  // Quiz Question operations
  createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;
  getQuizQuestions(quizId: number): Promise<QuizQuestion[]>;
  
  // Quiz Attempt operations
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  getUserQuizAttempts(userId: number, quizId: number): Promise<QuizAttempt[]>;
  
  // Certificate operations
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  getUserCertificates(userId: number): Promise<Certificate[]>;
  verifyCertificate(certificateNumber: string): Promise<Certificate | undefined>;
  
  // Video Call Service operations
  createVideoCallService(service: InsertVideoCallService): Promise<VideoCallService>;
  getVideoCallService(id: number): Promise<VideoCallService | undefined>;
  getAllVideoCallServices(): Promise<VideoCallService[]>;
  getActiveVideoCallServices(): Promise<VideoCallService[]>;
  updateVideoCallService(id: number, service: Partial<VideoCallService>): Promise<VideoCallService | undefined>;
  deleteVideoCallService(id: number): Promise<boolean>;
  
  // Video Call Session operations
  createVideoCallSession(session: InsertVideoCallSession): Promise<VideoCallSession>;
  getVideoCallSession(id: number): Promise<VideoCallSession | undefined>;
  getUserVideoCallSessions(userId: number): Promise<VideoCallSession[]>;
  getCertifierVideoCallSessions(certifierId: number): Promise<VideoCallSession[]>;
  getVideoCallSessionsByStatus(status: string): Promise<VideoCallSession[]>;
  updateVideoCallSession(id: number, session: Partial<VideoCallSession>): Promise<VideoCallSession | undefined>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documentCategories: Map<number, DocumentCategory>;
  private documentTemplates: Map<number, DocumentTemplate>;
  private documents: Map<number, Document>;
  private identityVerifications: Map<number, IdentityVerification>;
  private courses: Map<number, Course>;
  private courseModules: Map<number, CourseModule>;
  private courseContents: Map<number, CourseContent>;
  private courseEnrollments: Map<number, CourseEnrollment>;
  private quizzes: Map<number, Quiz>;
  private quizQuestions: Map<number, QuizQuestion>;
  private quizAttempts: Map<number, QuizAttempt>;
  private certificates: Map<number, Certificate>;
  private videoCallServices: Map<number, VideoCallService>;
  private videoCallSessions: Map<number, VideoCallSession>;
  
  currentUserId: number;
  currentDocumentCategoryId: number;
  currentDocumentTemplateId: number;
  currentDocumentId: number;
  currentVerificationId: number;
  currentCourseId: number;
  currentModuleId: number;
  currentContentId: number;
  currentEnrollmentId: number;
  currentQuizId: number;
  currentQuestionId: number;
  currentAttemptId: number;
  currentCertificateId: number;
  currentVideoCallServiceId: number;
  currentVideoCallSessionId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.documentCategories = new Map();
    this.documentTemplates = new Map();
    this.documents = new Map();
    this.identityVerifications = new Map();
    this.courses = new Map();
    this.courseModules = new Map();
    this.courseContents = new Map();
    this.courseEnrollments = new Map();
    this.quizzes = new Map();
    this.quizQuestions = new Map();
    this.quizAttempts = new Map();
    this.certificates = new Map();
    this.videoCallServices = new Map();
    this.videoCallSessions = new Map();
    
    this.currentUserId = 1;
    this.currentDocumentCategoryId = 1;
    this.currentDocumentTemplateId = 1;
    this.currentDocumentId = 1;
    this.currentVerificationId = 1;
    this.currentCourseId = 1;
    this.currentModuleId = 1;
    this.currentContentId = 1;
    this.currentEnrollmentId = 1;
    this.currentQuizId = 1;
    this.currentQuestionId = 1;
    this.currentAttemptId = 1;
    this.currentCertificateId = 1;
    this.currentVideoCallServiceId = 1;
    this.currentVideoCallSessionId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.role === role,
    );
  }
  
  // Document Category operations
  async createDocumentCategory(category: InsertDocumentCategory): Promise<DocumentCategory> {
    const id = this.currentDocumentCategoryId++;
    const createdAt = new Date();
    const documentCategory: DocumentCategory = { 
      ...category, 
      id, 
      createdAt 
    };
    this.documentCategories.set(id, documentCategory);
    return documentCategory;
  }
  
  async getDocumentCategory(id: number): Promise<DocumentCategory | undefined> {
    return this.documentCategories.get(id);
  }
  
  async getAllDocumentCategories(): Promise<DocumentCategory[]> {
    return Array.from(this.documentCategories.values())
      .sort((a, b) => a.order - b.order);
  }
  
  async updateDocumentCategory(id: number, category: Partial<DocumentCategory>): Promise<DocumentCategory | undefined> {
    const existingCategory = this.documentCategories.get(id);
    if (!existingCategory) return undefined;
    
    const updatedCategory = { 
      ...existingCategory, 
      ...category
    };
    this.documentCategories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteDocumentCategory(id: number): Promise<boolean> {
    return this.documentCategories.delete(id);
  }

  // Document Template operations
  async createDocumentTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate> {
    const id = this.currentDocumentTemplateId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const documentTemplate: DocumentTemplate = {
      ...template,
      id,
      createdAt,
      updatedAt
    };
    this.documentTemplates.set(id, documentTemplate);
    return documentTemplate;
  }
  
  async getDocumentTemplate(id: number): Promise<DocumentTemplate | undefined> {
    return this.documentTemplates.get(id);
  }
  
  async getDocumentTemplatesByCategory(categoryId: number): Promise<DocumentTemplate[]> {
    return Array.from(this.documentTemplates.values())
      .filter(template => template.categoryId === categoryId && template.active);
  }
  
  async getAllDocumentTemplates(): Promise<DocumentTemplate[]> {
    return Array.from(this.documentTemplates.values());
  }
  
  async updateDocumentTemplate(id: number, template: Partial<DocumentTemplate>): Promise<DocumentTemplate | undefined> {
    const existingTemplate = this.documentTemplates.get(id);
    if (!existingTemplate) return undefined;
    
    const updatedTemplate = {
      ...existingTemplate,
      ...template,
      updatedAt: new Date()
    };
    this.documentTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }
  
  async deleteDocumentTemplate(id: number): Promise<boolean> {
    return this.documentTemplates.delete(id);
  }
  
  async getDocumentsByStatus(status: string): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter(document => document.status === status);
  }

  // Document operations
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const document: Document = { 
      ...insertDocument, 
      id, 
      createdAt, 
      updatedAt, 
      status: "pending", 
      certifierId: null,
      signatureData: null
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getUserDocuments(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.userId === userId,
    );
  }

  async updateDocument(id: number, document: Partial<Document>): Promise<Document | undefined> {
    const existingDocument = this.documents.get(id);
    if (!existingDocument) return undefined;
    
    const updatedDocument = { 
      ...existingDocument, 
      ...document, 
      updatedAt: new Date() 
    };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async getPendingDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.status === "pending",
    );
  }

  async getCertifierDocuments(certifierId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.certifierId === certifierId,
    );
  }

  // Identity verification operations
  async createIdentityVerification(insertVerification: InsertIdentityVerification): Promise<IdentityVerification> {
    const id = this.currentVerificationId++;
    const createdAt = new Date();
    const verification: IdentityVerification = { 
      ...insertVerification, 
      id, 
      createdAt, 
      status: "pending", 
      certifierId: null,
      notes: null
    };
    this.identityVerifications.set(id, verification);
    return verification;
  }

  async getIdentityVerification(id: number): Promise<IdentityVerification | undefined> {
    return this.identityVerifications.get(id);
  }

  async getIdentityVerificationByDocument(documentId: number): Promise<IdentityVerification | undefined> {
    return Array.from(this.identityVerifications.values()).find(
      (verification) => verification.documentId === documentId,
    );
  }

  async updateIdentityVerification(id: number, verification: Partial<IdentityVerification>): Promise<IdentityVerification | undefined> {
    const existingVerification = this.identityVerifications.get(id);
    if (!existingVerification) return undefined;
    
    const updatedVerification = { 
      ...existingVerification, 
      ...verification
    };
    this.identityVerifications.set(id, updatedVerification);
    return updatedVerification;
  }

  // Course operations
  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.currentCourseId++;
    const createdAt = new Date();
    const course: Course = { ...insertCourse, id, createdAt };
    this.courses.set(id, course);
    return course;
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  // Course Module operations
  async createCourseModule(insertModule: InsertCourseModule): Promise<CourseModule> {
    const id = this.currentModuleId++;
    const module: CourseModule = { ...insertModule, id };
    this.courseModules.set(id, module);
    return module;
  }

  async getCourseModules(courseId: number): Promise<CourseModule[]> {
    return Array.from(this.courseModules.values())
      .filter(module => module.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }

  // Course Content operations
  async createCourseContent(insertContent: InsertCourseContent): Promise<CourseContent> {
    const id = this.currentContentId++;
    const content: CourseContent = { ...insertContent, id };
    this.courseContents.set(id, content);
    return content;
  }

  async getCourseContents(moduleId: number): Promise<CourseContent[]> {
    return Array.from(this.courseContents.values())
      .filter(content => content.moduleId === moduleId)
      .sort((a, b) => a.order - b.order);
  }

  // Course Enrollment operations
  async createCourseEnrollment(insertEnrollment: InsertCourseEnrollment): Promise<CourseEnrollment> {
    const id = this.currentEnrollmentId++;
    const enrolledAt = new Date();
    const enrollment: CourseEnrollment = { 
      ...insertEnrollment, 
      id, 
      enrolledAt, 
      completed: false,
      completedAt: null
    };
    this.courseEnrollments.set(id, enrollment);
    return enrollment;
  }

  async getUserEnrollments(userId: number): Promise<CourseEnrollment[]> {
    return Array.from(this.courseEnrollments.values()).filter(
      enrollment => enrollment.userId === userId
    );
  }

  async updateCourseEnrollment(id: number, enrollment: Partial<CourseEnrollment>): Promise<CourseEnrollment | undefined> {
    const existingEnrollment = this.courseEnrollments.get(id);
    if (!existingEnrollment) return undefined;
    
    const updatedEnrollment = { 
      ...existingEnrollment, 
      ...enrollment
    };
    this.courseEnrollments.set(id, updatedEnrollment);
    return updatedEnrollment;
  }

  // Quiz operations
  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const id = this.currentQuizId++;
    const quiz: Quiz = { ...insertQuiz, id };
    this.quizzes.set(id, quiz);
    return quiz;
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async getModuleQuizzes(moduleId: number): Promise<Quiz[]> {
    return Array.from(this.quizzes.values()).filter(
      quiz => quiz.moduleId === moduleId
    );
  }

  // Quiz Question operations
  async createQuizQuestion(insertQuestion: InsertQuizQuestion): Promise<QuizQuestion> {
    const id = this.currentQuestionId++;
    const question: QuizQuestion = { ...insertQuestion, id };
    this.quizQuestions.set(id, question);
    return question;
  }

  async getQuizQuestions(quizId: number): Promise<QuizQuestion[]> {
    return Array.from(this.quizQuestions.values()).filter(
      question => question.quizId === quizId
    );
  }

  // Quiz Attempt operations
  async createQuizAttempt(insertAttempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const id = this.currentAttemptId++;
    const attemptedAt = new Date();
    const attempt: QuizAttempt = { ...insertAttempt, id, attemptedAt };
    this.quizAttempts.set(id, attempt);
    return attempt;
  }

  async getUserQuizAttempts(userId: number, quizId: number): Promise<QuizAttempt[]> {
    return Array.from(this.quizAttempts.values()).filter(
      attempt => attempt.userId === userId && attempt.quizId === quizId
    );
  }

  // Certificate operations
  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const id = this.currentCertificateId++;
    const issuedAt = new Date();
    const certificate: Certificate = { ...insertCertificate, id, issuedAt };
    this.certificates.set(id, certificate);
    return certificate;
  }

  async getUserCertificates(userId: number): Promise<Certificate[]> {
    return Array.from(this.certificates.values()).filter(
      certificate => certificate.userId === userId
    );
  }

  async verifyCertificate(certificateNumber: string): Promise<Certificate | undefined> {
    return Array.from(this.certificates.values()).find(
      certificate => certificate.certificateNumber === certificateNumber
    );
  }
  
  // Video Call Service operations
  async createVideoCallService(service: InsertVideoCallService): Promise<VideoCallService> {
    const id = this.currentVideoCallServiceId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const videoCallService: VideoCallService = { 
      ...service, 
      id, 
      createdAt,
      updatedAt
    };
    
    this.videoCallServices.set(id, videoCallService);
    return videoCallService;
  }
  
  async getVideoCallService(id: number): Promise<VideoCallService | undefined> {
    return this.videoCallServices.get(id);
  }
  
  async getAllVideoCallServices(): Promise<VideoCallService[]> {
    return Array.from(this.videoCallServices.values());
  }
  
  async getActiveVideoCallServices(): Promise<VideoCallService[]> {
    return Array.from(this.videoCallServices.values()).filter(service => service.active);
  }
  
  async updateVideoCallService(id: number, service: Partial<VideoCallService>): Promise<VideoCallService | undefined> {
    const existing = this.videoCallServices.get(id);
    if (!existing) {
      return undefined;
    }
    
    const updated = { 
      ...existing, 
      ...service,
      updatedAt: new Date()
    };
    
    this.videoCallServices.set(id, updated);
    return updated;
  }
  
  async deleteVideoCallService(id: number): Promise<boolean> {
    return this.videoCallServices.delete(id);
  }
  
  // Video Call Session operations
  async createVideoCallSession(session: InsertVideoCallSession): Promise<VideoCallSession> {
    const id = this.currentVideoCallSessionId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const videoCallSession: VideoCallSession = { 
      ...session, 
      id, 
      certifierId: null,
      meetingUrl: null,
      meetingId: null,
      meetingPassword: null,
      paymentId: null,
      paymentAmount: null,
      paymentStatus: null,
      notes: null,
      createdAt,
      updatedAt
    };
    
    this.videoCallSessions.set(id, videoCallSession);
    return videoCallSession;
  }
  
  async getVideoCallSession(id: number): Promise<VideoCallSession | undefined> {
    return this.videoCallSessions.get(id);
  }
  
  async getUserVideoCallSessions(userId: number): Promise<VideoCallSession[]> {
    return Array.from(this.videoCallSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());
  }
  
  async getCertifierVideoCallSessions(certifierId: number): Promise<VideoCallSession[]> {
    return Array.from(this.videoCallSessions.values())
      .filter(session => session.certifierId === certifierId)
      .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());
  }
  
  async getVideoCallSessionsByStatus(status: string): Promise<VideoCallSession[]> {
    return Array.from(this.videoCallSessions.values())
      .filter(session => session.status === status)
      .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());
  }
  
  async updateVideoCallSession(id: number, session: Partial<VideoCallSession>): Promise<VideoCallSession | undefined> {
    const existing = this.videoCallSessions.get(id);
    if (!existing) {
      return undefined;
    }
    
    const updated = { 
      ...existing, 
      ...session,
      updatedAt: new Date()
    };
    
    this.videoCallSessions.set(id, updated);
    return updated;
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }
  
  // Document Category operations
  async createDocumentCategory(category: InsertDocumentCategory): Promise<DocumentCategory> {
    const [documentCategory] = await db
      .insert(documentCategories)
      .values(category)
      .returning();
    return documentCategory;
  }
  
  async getDocumentCategory(id: number): Promise<DocumentCategory | undefined> {
    const [category] = await db.select().from(documentCategories).where(eq(documentCategories.id, id));
    return category || undefined;
  }
  
  async getAllDocumentCategories(): Promise<DocumentCategory[]> {
    return await db.select().from(documentCategories).orderBy(documentCategories.order);
  }
  
  async updateDocumentCategory(id: number, category: Partial<DocumentCategory>): Promise<DocumentCategory | undefined> {
    const [updatedCategory] = await db
      .update(documentCategories)
      .set(category)
      .where(eq(documentCategories.id, id))
      .returning();
    return updatedCategory || undefined;
  }
  
  async deleteDocumentCategory(id: number): Promise<boolean> {
    const result = await db
      .delete(documentCategories)
      .where(eq(documentCategories.id, id));
    return result.rowCount > 0;
  }
  
  // Document Template operations
  async createDocumentTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate> {
    const [documentTemplate] = await db
      .insert(documentTemplates)
      .values(template)
      .returning();
    return documentTemplate;
  }
  
  async getDocumentTemplate(id: number): Promise<DocumentTemplate | undefined> {
    const [template] = await db.select().from(documentTemplates).where(eq(documentTemplates.id, id));
    return template || undefined;
  }
  
  async getDocumentTemplatesByCategory(categoryId: number): Promise<DocumentTemplate[]> {
    return await db.select().from(documentTemplates)
      .where(and(
        eq(documentTemplates.categoryId, categoryId),
        eq(documentTemplates.active, true)
      ));
  }
  
  async getAllDocumentTemplates(): Promise<DocumentTemplate[]> {
    return await db.select().from(documentTemplates);
  }
  
  async updateDocumentTemplate(id: number, template: Partial<DocumentTemplate>): Promise<DocumentTemplate | undefined> {
    const [updatedTemplate] = await db
      .update(documentTemplates)
      .set({
        ...template,
        updatedAt: new Date()
      })
      .where(eq(documentTemplates.id, id))
      .returning();
    return updatedTemplate || undefined;
  }
  
  async deleteDocumentTemplate(id: number): Promise<boolean> {
    const result = await db
      .delete(documentTemplates)
      .where(eq(documentTemplates.id, id));
    return result.rowCount > 0;
  }

  // Document operations
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values({
        ...insertDocument,
        status: "draft",
        certifierId: null,
        signatureData: null,
      })
      .returning();
    return document;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async getUserDocuments(userId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.userId, userId));
  }

  async updateDocument(id: number, document: Partial<Document>): Promise<Document | undefined> {
    const [updatedDocument] = await db
      .update(documents)
      .set({
        ...document,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument || undefined;
  }

  async getPendingDocuments(): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.status, "pending"));
  }

  async getCertifierDocuments(certifierId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.certifierId, certifierId));
  }
  
  async getDocumentsByStatus(status: string): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.status, status));
  }

  // Identity verification operations
  async createIdentityVerification(insertVerification: InsertIdentityVerification): Promise<IdentityVerification> {
    const [verification] = await db
      .insert(identityVerifications)
      .values({
        ...insertVerification,
        status: "pending",
        certifierId: null,
        notes: null,
      })
      .returning();
    return verification;
  }

  async getIdentityVerification(id: number): Promise<IdentityVerification | undefined> {
    const [verification] = await db.select().from(identityVerifications).where(eq(identityVerifications.id, id));
    return verification || undefined;
  }

  async getIdentityVerificationByDocument(documentId: number): Promise<IdentityVerification | undefined> {
    const [verification] = await db.select().from(identityVerifications).where(eq(identityVerifications.documentId, documentId));
    return verification || undefined;
  }

  async updateIdentityVerification(id: number, verification: Partial<IdentityVerification>): Promise<IdentityVerification | undefined> {
    const [updatedVerification] = await db
      .update(identityVerifications)
      .set(verification)
      .where(eq(identityVerifications.id, id))
      .returning();
    return updatedVerification || undefined;
  }

  // Course operations
  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db
      .insert(courses)
      .values(insertCourse)
      .returning();
    return course;
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }

  async getAllCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  // Course Module operations
  async createCourseModule(insertModule: InsertCourseModule): Promise<CourseModule> {
    const [module] = await db
      .insert(courseModules)
      .values(insertModule)
      .returning();
    return module;
  }

  async getCourseModules(courseId: number): Promise<CourseModule[]> {
    return await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, courseId))
      .orderBy(asc(courseModules.order));
  }

  // Course Content operations
  async createCourseContent(insertContent: InsertCourseContent): Promise<CourseContent> {
    const [content] = await db
      .insert(courseContents)
      .values(insertContent)
      .returning();
    return content;
  }

  async getCourseContents(moduleId: number): Promise<CourseContent[]> {
    return await db
      .select()
      .from(courseContents)
      .where(eq(courseContents.moduleId, moduleId))
      .orderBy(asc(courseContents.order));
  }

  // Course Enrollment operations
  async createCourseEnrollment(insertEnrollment: InsertCourseEnrollment): Promise<CourseEnrollment> {
    const [enrollment] = await db
      .insert(courseEnrollments)
      .values({
        ...insertEnrollment,
        completed: false,
        completedAt: null,
      })
      .returning();
    return enrollment;
  }

  async getUserEnrollments(userId: number): Promise<CourseEnrollment[]> {
    return await db.select().from(courseEnrollments).where(eq(courseEnrollments.userId, userId));
  }

  async updateCourseEnrollment(id: number, enrollment: Partial<CourseEnrollment>): Promise<CourseEnrollment | undefined> {
    const [updatedEnrollment] = await db
      .update(courseEnrollments)
      .set(enrollment)
      .where(eq(courseEnrollments.id, id))
      .returning();
    return updatedEnrollment || undefined;
  }

  // Quiz operations
  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const [quiz] = await db
      .insert(quizzes)
      .values(insertQuiz)
      .returning();
    return quiz;
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz || undefined;
  }

  async getModuleQuizzes(moduleId: number): Promise<Quiz[]> {
    return await db.select().from(quizzes).where(eq(quizzes.moduleId, moduleId));
  }

  // Quiz Question operations
  async createQuizQuestion(insertQuestion: InsertQuizQuestion): Promise<QuizQuestion> {
    const [question] = await db
      .insert(quizQuestions)
      .values(insertQuestion)
      .returning();
    return question;
  }

  async getQuizQuestions(quizId: number): Promise<QuizQuestion[]> {
    return await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, quizId));
  }

  // Quiz Attempt operations
  async createQuizAttempt(insertAttempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const [attempt] = await db
      .insert(quizAttempts)
      .values(insertAttempt)
      .returning();
    return attempt;
  }

  async getUserQuizAttempts(userId: number, quizId: number): Promise<QuizAttempt[]> {
    return await db
      .select()
      .from(quizAttempts)
      .where(and(
        eq(quizAttempts.userId, userId),
        eq(quizAttempts.quizId, quizId)
      ));
  }

  // Certificate operations
  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const [certificate] = await db
      .insert(certificates)
      .values(insertCertificate)
      .returning();
    return certificate;
  }

  async getUserCertificates(userId: number): Promise<Certificate[]> {
    return await db.select().from(certificates).where(eq(certificates.userId, userId));
  }

  async verifyCertificate(certificateNumber: string): Promise<Certificate | undefined> {
    const [certificate] = await db
      .select()
      .from(certificates)
      .where(eq(certificates.certificateNumber, certificateNumber));
    return certificate || undefined;
  }
}

// Switch from memory storage to database storage
export const storage = new DatabaseStorage();
