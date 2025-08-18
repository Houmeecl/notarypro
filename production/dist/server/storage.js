"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.DatabaseStorage = exports.MemStorage = void 0;
const schema_1 = require("@shared/schema");
const express_session_1 = __importDefault(require("express-session"));
const memorystore_1 = __importDefault(require("memorystore"));
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
const password_util_1 = require("@shared/utils/password-util");
const PostgresSessionStore = (0, connect_pg_simple_1.default)(express_session_1.default);
const MemoryStore = (0, memorystore_1.default)(express_session_1.default);
class MemStorage {
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
        this.analyticsEvents = new Map();
        this.partners = new Map();
        this.partnerBankDetails = new Map();
        this.partnerSales = new Map();
        this.partnerPayments = new Map();
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
        this.currentAnalyticsEventId = 1;
        this.currentPartnerId = 1;
        this.currentPartnerBankDetailsId = 1;
        this.currentPartnerSaleId = 1;
        this.currentPartnerPaymentId = 1;
        this.sessionStore = new MemoryStore({
            checkPeriod: 86400000,
        });
    }
    // User operations
    async getUser(id) {
        return this.users.get(id);
    }
    async getUserByUsername(username) {
        return Array.from(this.users.values()).find((user) => user.username.toLowerCase() === username.toLowerCase());
    }
    async getUserByEmail(email) {
        return Array.from(this.users.values()).find((user) => user.email.toLowerCase() === email.toLowerCase());
    }
    async createUser(insertUser) {
        const id = this.currentUserId++;
        const createdAt = new Date();
        // Si no se proporciona una contraseña y es un usuario POS, generar una segura
        if (!insertUser.password && insertUser.role === 'pos-user') {
            insertUser.password = (0, password_util_1.generateRandomPassword)(12, true, true, true);
        }
        const user = { ...insertUser, id, createdAt };
        this.users.set(id, user);
        return user;
    }
    async getUsersByRole(role) {
        return Array.from(this.users.values()).filter((user) => user.role === role);
    }
    async updateUser(id, userData) {
        const user = this.users.get(id);
        if (!user) {
            throw new Error(`User with id ${id} not found`);
        }
        const updatedUser = { ...user, ...userData };
        this.users.set(id, updatedUser);
        return updatedUser;
    }
    // Document Category operations
    async createDocumentCategory(category) {
        const id = this.currentDocumentCategoryId++;
        const createdAt = new Date();
        const documentCategory = {
            ...category,
            id,
            createdAt
        };
        this.documentCategories.set(id, documentCategory);
        return documentCategory;
    }
    async getDocumentCategory(id) {
        return this.documentCategories.get(id);
    }
    async getAllDocumentCategories() {
        return Array.from(this.documentCategories.values())
            .sort((a, b) => a.order - b.order);
    }
    async updateDocumentCategory(id, category) {
        const existingCategory = this.documentCategories.get(id);
        if (!existingCategory)
            return undefined;
        const updatedCategory = {
            ...existingCategory,
            ...category
        };
        this.documentCategories.set(id, updatedCategory);
        return updatedCategory;
    }
    async deleteDocumentCategory(id) {
        return this.documentCategories.delete(id);
    }
    // Document Template operations
    async createDocumentTemplate(template) {
        const id = this.currentDocumentTemplateId++;
        const createdAt = new Date();
        const updatedAt = new Date();
        const documentTemplate = {
            ...template,
            id,
            createdAt,
            updatedAt
        };
        this.documentTemplates.set(id, documentTemplate);
        return documentTemplate;
    }
    async getDocumentTemplate(id) {
        return this.documentTemplates.get(id);
    }
    async getDocumentTemplatesByCategory(categoryId) {
        return Array.from(this.documentTemplates.values())
            .filter(template => template.categoryId === categoryId && template.active);
    }
    async getAllDocumentTemplates() {
        return Array.from(this.documentTemplates.values());
    }
    async updateDocumentTemplate(id, template) {
        const existingTemplate = this.documentTemplates.get(id);
        if (!existingTemplate)
            return undefined;
        const updatedTemplate = {
            ...existingTemplate,
            ...template,
            updatedAt: new Date()
        };
        this.documentTemplates.set(id, updatedTemplate);
        return updatedTemplate;
    }
    async deleteDocumentTemplate(id) {
        return this.documentTemplates.delete(id);
    }
    async getDocumentsByStatus(status) {
        return Array.from(this.documents.values())
            .filter(document => document.status === status);
    }
    // Document operations
    async createDocument(insertDocument) {
        const id = this.currentDocumentId++;
        const createdAt = new Date();
        const updatedAt = new Date();
        const document = {
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
    async getDocument(id) {
        return this.documents.get(id);
    }
    async getUserDocuments(userId) {
        return Array.from(this.documents.values()).filter((document) => document.userId === userId);
    }
    async updateDocument(id, document) {
        const existingDocument = this.documents.get(id);
        if (!existingDocument)
            return undefined;
        const updatedDocument = {
            ...existingDocument,
            ...document,
            updatedAt: new Date()
        };
        this.documents.set(id, updatedDocument);
        return updatedDocument;
    }
    async getPendingDocuments() {
        return Array.from(this.documents.values()).filter((document) => document.status === "pending");
    }
    async getCertifierDocuments(certifierId) {
        return Array.from(this.documents.values()).filter((document) => document.certifierId === certifierId);
    }
    async getDocumentByVerificationCode(code) {
        return Array.from(this.documents.values()).find((document) => document.qrCode === code);
    }
    // Identity verification operations
    async createIdentityVerification(insertVerification) {
        const id = this.currentVerificationId++;
        const createdAt = new Date();
        const verification = {
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
    async getIdentityVerification(id) {
        return this.identityVerifications.get(id);
    }
    async getIdentityVerificationByDocument(documentId) {
        return Array.from(this.identityVerifications.values()).find((verification) => verification.documentId === documentId);
    }
    async updateIdentityVerification(id, verification) {
        const existingVerification = this.identityVerifications.get(id);
        if (!existingVerification)
            return undefined;
        const updatedVerification = {
            ...existingVerification,
            ...verification
        };
        this.identityVerifications.set(id, updatedVerification);
        return updatedVerification;
    }
    // Course operations
    async createCourse(insertCourse) {
        const id = this.currentCourseId++;
        const createdAt = new Date();
        const course = { ...insertCourse, id, createdAt };
        this.courses.set(id, course);
        return course;
    }
    async getCourse(id) {
        return this.courses.get(id);
    }
    async getAllCourses() {
        return Array.from(this.courses.values());
    }
    // Course Module operations
    async createCourseModule(insertModule) {
        const id = this.currentModuleId++;
        const module = { ...insertModule, id };
        this.courseModules.set(id, module);
        return module;
    }
    async getCourseModules(courseId) {
        return Array.from(this.courseModules.values())
            .filter(module => module.courseId === courseId)
            .sort((a, b) => a.order - b.order);
    }
    // Course Content operations
    async createCourseContent(insertContent) {
        const id = this.currentContentId++;
        const content = { ...insertContent, id };
        this.courseContents.set(id, content);
        return content;
    }
    async getCourseContents(moduleId) {
        return Array.from(this.courseContents.values())
            .filter(content => content.moduleId === moduleId)
            .sort((a, b) => a.order - b.order);
    }
    // Course Enrollment operations
    async createCourseEnrollment(insertEnrollment) {
        const id = this.currentEnrollmentId++;
        const enrolledAt = new Date();
        const enrollment = {
            ...insertEnrollment,
            id,
            enrolledAt,
            completed: false,
            completedAt: null
        };
        this.courseEnrollments.set(id, enrollment);
        return enrollment;
    }
    async getUserEnrollments(userId) {
        return Array.from(this.courseEnrollments.values()).filter(enrollment => enrollment.userId === userId);
    }
    async updateCourseEnrollment(id, enrollment) {
        const existingEnrollment = this.courseEnrollments.get(id);
        if (!existingEnrollment)
            return undefined;
        const updatedEnrollment = {
            ...existingEnrollment,
            ...enrollment
        };
        this.courseEnrollments.set(id, updatedEnrollment);
        return updatedEnrollment;
    }
    // Quiz operations
    async createQuiz(insertQuiz) {
        const id = this.currentQuizId++;
        const quiz = { ...insertQuiz, id };
        this.quizzes.set(id, quiz);
        return quiz;
    }
    async getQuiz(id) {
        return this.quizzes.get(id);
    }
    async getModuleQuizzes(moduleId) {
        return Array.from(this.quizzes.values()).filter(quiz => quiz.moduleId === moduleId);
    }
    // Quiz Question operations
    async createQuizQuestion(insertQuestion) {
        const id = this.currentQuestionId++;
        const question = { ...insertQuestion, id };
        this.quizQuestions.set(id, question);
        return question;
    }
    async getQuizQuestions(quizId) {
        return Array.from(this.quizQuestions.values()).filter(question => question.quizId === quizId);
    }
    // Quiz Attempt operations
    async createQuizAttempt(insertAttempt) {
        const id = this.currentAttemptId++;
        const attemptedAt = new Date();
        const attempt = { ...insertAttempt, id, attemptedAt };
        this.quizAttempts.set(id, attempt);
        return attempt;
    }
    async getUserQuizAttempts(userId, quizId) {
        return Array.from(this.quizAttempts.values()).filter(attempt => attempt.userId === userId && attempt.quizId === quizId);
    }
    // Certificate operations
    async createCertificate(insertCertificate) {
        const id = this.currentCertificateId++;
        const issuedAt = new Date();
        const certificate = { ...insertCertificate, id, issuedAt };
        this.certificates.set(id, certificate);
        return certificate;
    }
    async getUserCertificates(userId) {
        return Array.from(this.certificates.values()).filter(certificate => certificate.userId === userId);
    }
    async verifyCertificate(certificateNumber) {
        return Array.from(this.certificates.values()).find(certificate => certificate.certificateNumber === certificateNumber);
    }
    // Video Call Service operations
    async createVideoCallService(service) {
        const id = this.currentVideoCallServiceId++;
        const createdAt = new Date();
        const updatedAt = new Date();
        const videoCallService = {
            ...service,
            id,
            createdAt,
            updatedAt
        };
        this.videoCallServices.set(id, videoCallService);
        return videoCallService;
    }
    async getVideoCallService(id) {
        return this.videoCallServices.get(id);
    }
    async getAllVideoCallServices() {
        return Array.from(this.videoCallServices.values());
    }
    async getActiveVideoCallServices() {
        return Array.from(this.videoCallServices.values()).filter(service => service.active);
    }
    async updateVideoCallService(id, service) {
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
    async deleteVideoCallService(id) {
        return this.videoCallServices.delete(id);
    }
    // Video Call Session operations
    async createVideoCallSession(session) {
        const id = this.currentVideoCallSessionId++;
        const createdAt = new Date();
        const updatedAt = new Date();
        const videoCallSession = {
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
    async getVideoCallSession(id) {
        return this.videoCallSessions.get(id);
    }
    async getUserVideoCallSessions(userId) {
        return Array.from(this.videoCallSessions.values())
            .filter(session => session.userId === userId)
            .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());
    }
    async getCertifierVideoCallSessions(certifierId) {
        return Array.from(this.videoCallSessions.values())
            .filter(session => session.certifierId === certifierId)
            .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());
    }
    async getVideoCallSessionsByStatus(status) {
        return Array.from(this.videoCallSessions.values())
            .filter(session => session.status === status)
            .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());
    }
    async updateVideoCallSession(id, session) {
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
    // Partner operations
    async createPartner(insertPartner) {
        const id = this.currentPartnerId++;
        const createdAt = new Date();
        const updatedAt = new Date();
        const userId = this.currentUserId++; // Creamos un usuario para el partner
        // Generar contraseña segura para el partner
        const securePassword = (0, password_util_1.generateRandomPassword)(12, true, true, true);
        // Crear usuario asociado para el partner
        const user = {
            id: userId,
            username: insertPartner.email.split('@')[0] + '-partner',
            password: securePassword, // Contraseña segura generada aleatoriamente
            email: insertPartner.email,
            fullName: insertPartner.managerName,
            role: 'partner',
            createdAt
        };
        this.users.set(userId, user);
        // Crear el partner
        const partner = {
            ...insertPartner,
            id,
            userId,
            status: 'pending',
            notes: null,
            createdAt,
            updatedAt
        };
        this.partners.set(id, partner);
        return partner;
    }
    async getPartner(id) {
        return this.partners.get(id);
    }
    async getPartnerByEmail(email) {
        return Array.from(this.partners.values()).find((partner) => partner.email.toLowerCase() === email.toLowerCase());
    }
    async getPartnerByUserId(userId) {
        return Array.from(this.partners.values()).find((partner) => partner.userId === userId);
    }
    async updatePartner(id, partner) {
        const existingPartner = this.partners.get(id);
        if (!existingPartner)
            return undefined;
        const updatedPartner = {
            ...existingPartner,
            ...partner,
            updatedAt: new Date()
        };
        this.partners.set(id, updatedPartner);
        return updatedPartner;
    }
    async getAllPartners() {
        return Array.from(this.partners.values());
    }
    async getPartnersByStatus(status) {
        return Array.from(this.partners.values()).filter((partner) => partner.status === status);
    }
    async getPartnersByRegion(region) {
        return Array.from(this.partners.values()).filter((partner) => partner.region === region);
    }
    async getPartnersByCommune(commune) {
        return Array.from(this.partners.values()).filter((partner) => partner.commune === commune);
    }
    // Partner Bank Details operations
    async createPartnerBankDetails(insertBankDetails) {
        const id = this.currentPartnerBankDetailsId++;
        const createdAt = new Date();
        const updatedAt = new Date();
        const bankDetails = {
            ...insertBankDetails,
            id,
            createdAt,
            updatedAt
        };
        this.partnerBankDetails.set(id, bankDetails);
        return bankDetails;
    }
    async getPartnerBankDetails(partnerId) {
        return Array.from(this.partnerBankDetails.values()).find((details) => details.partnerId === partnerId);
    }
    async updatePartnerBankDetails(id, bankDetails) {
        const existingDetails = this.partnerBankDetails.get(id);
        if (!existingDetails)
            return undefined;
        const updatedDetails = {
            ...existingDetails,
            ...bankDetails,
            updatedAt: new Date()
        };
        this.partnerBankDetails.set(id, updatedDetails);
        return updatedDetails;
    }
    // Partner Sales operations
    async createPartnerSale(insertSale) {
        const id = this.currentPartnerSaleId++;
        const createdAt = new Date();
        const sale = {
            ...insertSale,
            id,
            status: 'pending',
            paidAt: null,
            createdAt
        };
        this.partnerSales.set(id, sale);
        return sale;
    }
    async getPartnerSale(id) {
        return this.partnerSales.get(id);
    }
    async getPartnerSales(partnerId, options) {
        let sales = Array.from(this.partnerSales.values()).filter((sale) => sale.partnerId === partnerId);
        if (options?.status) {
            sales = sales.filter(sale => sale.status === options.status);
        }
        return sales.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }
    async updatePartnerSale(id, sale) {
        const existingSale = this.partnerSales.get(id);
        if (!existingSale)
            return undefined;
        const updatedSale = {
            ...existingSale,
            ...sale
        };
        this.partnerSales.set(id, updatedSale);
        return updatedSale;
    }
    async getPartnerSalesStats(partnerId) {
        const sales = await this.getPartnerSales(partnerId);
        const pendingCommission = sales
            .filter(sale => sale.status === 'pending')
            .reduce((sum, sale) => sum + sale.commission, 0);
        const availableCommission = sales
            .filter(sale => sale.status === 'available')
            .reduce((sum, sale) => sum + sale.commission, 0);
        const paidCommission = sales
            .filter(sale => sale.status === 'paid')
            .reduce((sum, sale) => sum + sale.commission, 0);
        const totalCommission = pendingCommission + availableCommission + paidCommission;
        const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
        const salesCount = sales.length;
        return {
            totalSales,
            pendingCommission,
            availableCommission,
            paidCommission,
            totalCommission,
            salesCount
        };
    }
    // Partner Payments operations
    async createPartnerPayment(insertPayment) {
        const id = this.currentPartnerPaymentId++;
        const createdAt = new Date();
        const payment = {
            ...insertPayment,
            id,
            createdAt
        };
        this.partnerPayments.set(id, payment);
        // Actualizar el estado de las ventas asociadas a 'paid'
        const sales = await this.getPartnerSales(insertPayment.partnerId, { status: 'available' });
        let remainingAmount = insertPayment.amount;
        for (const sale of sales) {
            if (remainingAmount <= 0)
                break;
            const saleAmount = Math.min(sale.commission, remainingAmount);
            remainingAmount -= saleAmount;
            await this.updatePartnerSale(sale.id, {
                status: 'paid',
                paidAt: insertPayment.paymentDate
            });
        }
        return payment;
    }
    async getPartnerPayment(id) {
        return this.partnerPayments.get(id);
    }
    async getPartnerPayments(partnerId) {
        return Array.from(this.partnerPayments.values())
            .filter(payment => payment.partnerId === partnerId)
            .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
    }
    async getPartnerPaymentsTotal(partnerId) {
        const payments = await this.getPartnerPayments(partnerId);
        return payments.reduce((sum, payment) => sum + payment.amount, 0);
    }
    // Analytics operations
    async createAnalyticsEvent(insertEvent) {
        const id = this.currentAnalyticsEventId++;
        const createdAt = new Date();
        const event = { ...insertEvent, id, createdAt };
        this.analyticsEvents.set(id, event);
        return event;
    }
    async getAnalyticsEvents(options) {
        let events = Array.from(this.analyticsEvents.values());
        if (options) {
            if (options.startDate) {
                events = events.filter(event => event.createdAt >= options.startDate);
            }
            if (options.endDate) {
                events = events.filter(event => event.createdAt <= options.endDate);
            }
            if (options.eventType) {
                events = events.filter(event => event.eventType === options.eventType);
            }
            if (options.userId) {
                events = events.filter(event => event.userId === options.userId);
            }
        }
        return events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async getDailyEventCounts(options) {
        const events = await this.getAnalyticsEvents(options);
        const dailyCounts = {};
        events.forEach(event => {
            const dateStr = event.createdAt.toISOString().split('T')[0];
            dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
        });
        return Object.entries(dailyCounts)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }
    async getUserActivityStats() {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const users = Array.from(this.users.values());
        return {
            totalUsers: users.length,
            newUsersToday: users.filter(user => user.createdAt >= startOfDay).length,
            newUsersThisWeek: users.filter(user => user.createdAt >= oneWeekAgo).length,
            newUsersThisMonth: users.filter(user => user.createdAt >= startOfMonth).length
        };
    }
    async getDocumentStats() {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const documents = Array.from(this.documents.values());
        const documentsByStatus = {};
        documents.forEach(doc => {
            documentsByStatus[doc.status] = (documentsByStatus[doc.status] || 0) + 1;
        });
        return {
            totalDocuments: documents.length,
            documentsCreatedToday: documents.filter(doc => doc.createdAt >= startOfDay).length,
            documentsByStatus
        };
    }
    async getRevenueStats() {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        // Calculate document revenue
        const documents = Array.from(this.documents.values());
        const paidDocuments = documents.filter(doc => doc.paymentStatus === 'completed');
        const documentRevenue = paidDocuments.reduce((sum, doc) => sum + (doc.paymentAmount || 0), 0);
        // Calculate course revenue
        const enrollments = Array.from(this.courseEnrollments.values());
        const courseRevenue = 0; // To be implemented
        // Calculate video call revenue
        const videoSessions = Array.from(this.videoCallSessions.values());
        const paidSessions = videoSessions.filter(session => session.paymentStatus === 'completed');
        const videoCallRevenue = paidSessions.reduce((sum, session) => sum + (session.paymentAmount || 0), 0);
        // Calculate total revenue
        const totalRevenue = documentRevenue + courseRevenue + videoCallRevenue;
        // Calculate revenue by time period
        const revenueToday = paidDocuments
            .filter(doc => doc.updatedAt >= startOfDay)
            .reduce((sum, doc) => sum + (doc.paymentAmount || 0), 0);
        const revenueThisWeek = paidDocuments
            .filter(doc => doc.updatedAt >= oneWeekAgo)
            .reduce((sum, doc) => sum + (doc.paymentAmount || 0), 0);
        const revenueThisMonth = paidDocuments
            .filter(doc => doc.updatedAt >= startOfMonth)
            .reduce((sum, doc) => sum + (doc.paymentAmount || 0), 0);
        return {
            totalRevenue,
            revenueToday,
            revenueThisWeek,
            revenueThisMonth,
            documentRevenue,
            courseRevenue,
            videoCallRevenue
        };
    }
}
exports.MemStorage = MemStorage;
class DatabaseStorage {
    constructor() {
        this.sessionStore = new PostgresSessionStore({
            pool: db_1.pool,
            createTableIfMissing: true
        });
    }
    // Analytics operations
    async createAnalyticsEvent(insertEvent) {
        return await createAnalyticsEvent(insertEvent);
    }
    async getAnalyticsEvents(options) {
        return await getAnalyticsEvents(options);
    }
    async getDailyEventCounts(options) {
        return await getDailyEventCounts(options);
    }
    async getUserActivityStats() {
        return await getUserActivityStats();
    }
    async getDocumentStats() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const [totalCount] = await db_1.db
                .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
                .from(schema_1.documents);
            const [todayCount] = await db_1.db
                .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
                .from(schema_1.documents)
                .where((0, drizzle_orm_1.sql) `${schema_1.documents.createdAt} >= ${today}`);
            const statusCounts = await db_1.db
                .select({
                status: schema_1.documents.status,
                count: (0, drizzle_orm_1.sql) `COUNT(*)`
            })
                .from(schema_1.documents)
                .groupBy(schema_1.documents.status);
            const documentsByStatus = {};
            statusCounts.forEach(item => {
                documentsByStatus[item.status] = Number(item.count);
            });
            return {
                totalDocuments: Number(totalCount.count),
                documentsCreatedToday: Number(todayCount.count),
                documentsByStatus
            };
        }
        catch (error) {
            console.error("Error en getDocumentStats:", error);
            throw error;
        }
    }
    async getRevenueStats() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const oneWeekAgo = new Date(today);
            oneWeekAgo.setDate(today.getDate() - 7);
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            // Calculate document revenue
            const [documentTotal] = await db_1.db
                .select({ total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.documents.paymentAmount}), 0)` })
                .from(schema_1.documents)
                .where((0, drizzle_orm_1.eq)(schema_1.documents.paymentStatus, 'completed'));
            // Default video call revenue to 0 since the table may not exist
            let videoCallRevenue = 0;
            // Try to calculate video call revenue if table exists
            try {
                const [videoCallTotal] = await db_1.db
                    .select({ total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.videoCallSessions.paymentAmount}), 0)` })
                    .from(schema_1.videoCallSessions)
                    .where((0, drizzle_orm_1.eq)(schema_1.videoCallSessions.paymentStatus, 'completed'));
                videoCallRevenue = Number(videoCallTotal.total);
            }
            catch (error) {
                // If the table doesn't exist, just log it and continue with videoCallRevenue = 0
                console.log("Note: video_call_sessions table does not exist yet, setting videoCallRevenue to 0");
            }
            // Calculate today's revenue
            const [todayTotal] = await db_1.db
                .select({ total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.documents.paymentAmount}), 0)` })
                .from(schema_1.documents)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.documents.paymentStatus, 'completed'), (0, drizzle_orm_1.sql) `${schema_1.documents.updatedAt} >= ${today}`));
            // Calculate week's revenue
            const [weekTotal] = await db_1.db
                .select({ total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.documents.paymentAmount}), 0)` })
                .from(schema_1.documents)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.documents.paymentStatus, 'completed'), (0, drizzle_orm_1.sql) `${schema_1.documents.updatedAt} >= ${oneWeekAgo}`));
            // Calculate month's revenue
            const [monthTotal] = await db_1.db
                .select({ total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.documents.paymentAmount}), 0)` })
                .from(schema_1.documents)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.documents.paymentStatus, 'completed'), (0, drizzle_orm_1.sql) `${schema_1.documents.updatedAt} >= ${startOfMonth}`));
            // For course revenue, we can add this later if needed
            const courseRevenue = 0;
            const documentRevenue = Number(documentTotal.total);
            return {
                totalRevenue: documentRevenue + courseRevenue + videoCallRevenue,
                revenueToday: Number(todayTotal.total),
                revenueThisWeek: Number(weekTotal.total),
                revenueThisMonth: Number(monthTotal.total),
                documentRevenue,
                courseRevenue,
                videoCallRevenue
            };
        }
        catch (error) {
            console.error("Error en getRevenueStats:", error);
            // Return default values instead of throwing to prevent dashboard errors
            return {
                totalRevenue: 0,
                revenueToday: 0,
                revenueThisWeek: 0,
                revenueThisMonth: 0,
                documentRevenue: 0,
                courseRevenue: 0,
                videoCallRevenue: 0
            };
        }
    }
    // User operations
    async getUser(id) {
        const [user] = await db_1.db.select({
            id: schema_1.users.id,
            username: schema_1.users.username,
            password: schema_1.users.password,
            email: schema_1.users.email,
            fullName: schema_1.users.fullName,
            role: schema_1.users.role
        }).from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
        return user || undefined;
    }
    async getUserByUsername(username) {
        const [user] = await db_1.db.select({
            id: schema_1.users.id,
            username: schema_1.users.username,
            password: schema_1.users.password,
            email: schema_1.users.email,
            fullName: schema_1.users.fullName,
            role: schema_1.users.role
        }).from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.username, username));
        return user || undefined;
    }
    async getUserByEmail(email) {
        const [user] = await db_1.db.select({
            id: schema_1.users.id,
            username: schema_1.users.username,
            password: schema_1.users.password,
            email: schema_1.users.email,
            fullName: schema_1.users.fullName,
            role: schema_1.users.role
        }).from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
        return user || undefined;
    }
    async createUser(insertUser) {
        const [user] = await db_1.db
            .insert(schema_1.users)
            .values(insertUser)
            .returning();
        return user;
    }
    async getUsersByRole(role) {
        return await db_1.db.select({
            id: schema_1.users.id,
            username: schema_1.users.username,
            password: schema_1.users.password,
            email: schema_1.users.email,
            fullName: schema_1.users.fullName,
            role: schema_1.users.role
        }).from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.role, role));
    }
    async updateUser(id, userData) {
        const [updatedUser] = await db_1.db
            .update(schema_1.users)
            .set(userData)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
            .returning();
        if (!updatedUser) {
            throw new Error(`User with id ${id} not found`);
        }
        return updatedUser;
    }
    // Document Category operations
    async createDocumentCategory(category) {
        const [documentCategory] = await db_1.db
            .insert(schema_1.documentCategories)
            .values(category)
            .returning();
        return documentCategory;
    }
    async getDocumentCategory(id) {
        const [category] = await db_1.db.select().from(schema_1.documentCategories).where((0, drizzle_orm_1.eq)(schema_1.documentCategories.id, id));
        return category || undefined;
    }
    async getAllDocumentCategories() {
        return await db_1.db.select().from(schema_1.documentCategories).orderBy(schema_1.documentCategories.order);
    }
    async updateDocumentCategory(id, category) {
        const [updatedCategory] = await db_1.db
            .update(schema_1.documentCategories)
            .set(category)
            .where((0, drizzle_orm_1.eq)(schema_1.documentCategories.id, id))
            .returning();
        return updatedCategory || undefined;
    }
    async deleteDocumentCategory(id) {
        const result = await db_1.db
            .delete(schema_1.documentCategories)
            .where((0, drizzle_orm_1.eq)(schema_1.documentCategories.id, id));
        return result.rowCount > 0;
    }
    // Document Template operations
    async createDocumentTemplate(template) {
        const [documentTemplate] = await db_1.db
            .insert(schema_1.documentTemplates)
            .values(template)
            .returning();
        return documentTemplate;
    }
    async getDocumentTemplate(id) {
        const [template] = await db_1.db.select().from(schema_1.documentTemplates).where((0, drizzle_orm_1.eq)(schema_1.documentTemplates.id, id));
        return template || undefined;
    }
    async getDocumentTemplatesByCategory(categoryId) {
        return await db_1.db.select().from(schema_1.documentTemplates)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.documentTemplates.categoryId, categoryId), (0, drizzle_orm_1.eq)(schema_1.documentTemplates.active, true)));
    }
    async getAllDocumentTemplates() {
        return await db_1.db.select().from(schema_1.documentTemplates);
    }
    async updateDocumentTemplate(id, template) {
        const [updatedTemplate] = await db_1.db
            .update(schema_1.documentTemplates)
            .set({
            ...template,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.documentTemplates.id, id))
            .returning();
        return updatedTemplate || undefined;
    }
    async deleteDocumentTemplate(id) {
        const result = await db_1.db
            .delete(schema_1.documentTemplates)
            .where((0, drizzle_orm_1.eq)(schema_1.documentTemplates.id, id));
        return result.rowCount > 0;
    }
    // Document operations
    async createDocument(insertDocument) {
        const [document] = await db_1.db
            .insert(schema_1.documents)
            .values({
            ...insertDocument,
            status: "draft",
            certifierId: null,
            signatureData: null,
        })
            .returning();
        return document;
    }
    async getDocument(id) {
        const [document] = await db_1.db.select().from(schema_1.documents).where((0, drizzle_orm_1.eq)(schema_1.documents.id, id));
        return document || undefined;
    }
    async getUserDocuments(userId) {
        return await db_1.db.select().from(schema_1.documents).where((0, drizzle_orm_1.eq)(schema_1.documents.userId, userId));
    }
    async updateDocument(id, document) {
        const [updatedDocument] = await db_1.db
            .update(schema_1.documents)
            .set({
            ...document,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, id))
            .returning();
        return updatedDocument || undefined;
    }
    async getPendingDocuments() {
        return await db_1.db.select().from(schema_1.documents).where((0, drizzle_orm_1.eq)(schema_1.documents.status, "pending"));
    }
    async getCertifierDocuments(certifierId) {
        return await db_1.db.select().from(schema_1.documents).where((0, drizzle_orm_1.eq)(schema_1.documents.certifierId, certifierId));
    }
    async getDocumentsByStatus(status) {
        return await db_1.db.select().from(schema_1.documents).where((0, drizzle_orm_1.eq)(schema_1.documents.status, status));
    }
    async getDocumentByVerificationCode(code) {
        const [document] = await db_1.db.select().from(schema_1.documents).where((0, drizzle_orm_1.eq)(schema_1.documents.qrCode, code));
        return document || undefined;
    }
    // Identity verification operations
    async createIdentityVerification(insertVerification) {
        const [verification] = await db_1.db
            .insert(schema_1.identityVerifications)
            .values({
            ...insertVerification,
            status: "pending",
            certifierId: null,
            notes: null,
        })
            .returning();
        return verification;
    }
    async getIdentityVerification(id) {
        const [verification] = await db_1.db.select().from(schema_1.identityVerifications).where((0, drizzle_orm_1.eq)(schema_1.identityVerifications.id, id));
        return verification || undefined;
    }
    async getIdentityVerificationByDocument(documentId) {
        const [verification] = await db_1.db.select().from(schema_1.identityVerifications).where((0, drizzle_orm_1.eq)(schema_1.identityVerifications.documentId, documentId));
        return verification || undefined;
    }
    async updateIdentityVerification(id, verification) {
        const [updatedVerification] = await db_1.db
            .update(schema_1.identityVerifications)
            .set(verification)
            .where((0, drizzle_orm_1.eq)(schema_1.identityVerifications.id, id))
            .returning();
        return updatedVerification || undefined;
    }
    // Course operations
    async createCourse(insertCourse) {
        const [course] = await db_1.db
            .insert(schema_1.courses)
            .values(insertCourse)
            .returning();
        return course;
    }
    async getCourse(id) {
        const [course] = await db_1.db.select().from(schema_1.courses).where((0, drizzle_orm_1.eq)(schema_1.courses.id, id));
        return course || undefined;
    }
    async getAllCourses() {
        return await db_1.db.select().from(schema_1.courses);
    }
    // Course Module operations
    async createCourseModule(insertModule) {
        const [module] = await db_1.db
            .insert(schema_1.courseModules)
            .values(insertModule)
            .returning();
        return module;
    }
    async getCourseModules(courseId) {
        return await db_1.db
            .select()
            .from(schema_1.courseModules)
            .where((0, drizzle_orm_1.eq)(schema_1.courseModules.courseId, courseId))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.courseModules.order));
    }
    // Course Content operations
    async createCourseContent(insertContent) {
        const [content] = await db_1.db
            .insert(schema_1.courseContents)
            .values(insertContent)
            .returning();
        return content;
    }
    async getCourseContents(moduleId) {
        return await db_1.db
            .select()
            .from(schema_1.courseContents)
            .where((0, drizzle_orm_1.eq)(schema_1.courseContents.moduleId, moduleId))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.courseContents.order));
    }
    // Course Enrollment operations
    async createCourseEnrollment(insertEnrollment) {
        const [enrollment] = await db_1.db
            .insert(schema_1.courseEnrollments)
            .values({
            ...insertEnrollment,
            completed: false,
            completedAt: null,
        })
            .returning();
        return enrollment;
    }
    async getUserEnrollments(userId) {
        return await db_1.db.select().from(schema_1.courseEnrollments).where((0, drizzle_orm_1.eq)(schema_1.courseEnrollments.userId, userId));
    }
    async updateCourseEnrollment(id, enrollment) {
        const [updatedEnrollment] = await db_1.db
            .update(schema_1.courseEnrollments)
            .set(enrollment)
            .where((0, drizzle_orm_1.eq)(schema_1.courseEnrollments.id, id))
            .returning();
        return updatedEnrollment || undefined;
    }
    // Quiz operations
    async createQuiz(insertQuiz) {
        const [quiz] = await db_1.db
            .insert(schema_1.quizzes)
            .values(insertQuiz)
            .returning();
        return quiz;
    }
    async getQuiz(id) {
        const [quiz] = await db_1.db.select().from(schema_1.quizzes).where((0, drizzle_orm_1.eq)(schema_1.quizzes.id, id));
        return quiz || undefined;
    }
    async getModuleQuizzes(moduleId) {
        return await db_1.db.select().from(schema_1.quizzes).where((0, drizzle_orm_1.eq)(schema_1.quizzes.moduleId, moduleId));
    }
    // Quiz Question operations
    async createQuizQuestion(insertQuestion) {
        const [question] = await db_1.db
            .insert(schema_1.quizQuestions)
            .values(insertQuestion)
            .returning();
        return question;
    }
    async getQuizQuestions(quizId) {
        return await db_1.db.select().from(schema_1.quizQuestions).where((0, drizzle_orm_1.eq)(schema_1.quizQuestions.quizId, quizId));
    }
    // Quiz Attempt operations
    async createQuizAttempt(insertAttempt) {
        const [attempt] = await db_1.db
            .insert(schema_1.quizAttempts)
            .values(insertAttempt)
            .returning();
        return attempt;
    }
    async getUserQuizAttempts(userId, quizId) {
        return await db_1.db
            .select()
            .from(schema_1.quizAttempts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.quizAttempts.userId, userId), (0, drizzle_orm_1.eq)(schema_1.quizAttempts.quizId, quizId)));
    }
    // Certificate operations
    async createCertificate(insertCertificate) {
        const [certificate] = await db_1.db
            .insert(schema_1.certificates)
            .values(insertCertificate)
            .returning();
        return certificate;
    }
    async getUserCertificates(userId) {
        return await db_1.db.select().from(schema_1.certificates).where((0, drizzle_orm_1.eq)(schema_1.certificates.userId, userId));
    }
    async verifyCertificate(certificateNumber) {
        const [certificate] = await db_1.db
            .select()
            .from(schema_1.certificates)
            .where((0, drizzle_orm_1.eq)(schema_1.certificates.certificateNumber, certificateNumber));
        return certificate || undefined;
    }
    // Partner Store operations
    async getPartnerByStoreCode(storeCode) {
        try {
            const [store] = await db_1.db
                .select()
                .from(schema_1.partnerStores)
                .where((0, drizzle_orm_1.eq)(schema_1.partnerStores.storeCode, storeCode));
            if (!store)
                return undefined;
            // Obtener información adicional del dueño
            const [owner] = await db_1.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, store.ownerId));
            return {
                id: store.id,
                businessName: store.name,
                address: store.address,
                storeCode: store.storeCode,
                ownerName: owner?.fullName || 'Dueño',
                commissionRate: store.commissionRate,
                active: store.active,
                createdAt: store.createdAt
            };
        }
        catch (error) {
            console.error('Error al buscar tienda por código:', error);
            return undefined;
        }
    }
    async updatePartnerStoreLastLogin(storeId) {
        await db_1.db
            .update(schema_1.partnerStores)
            .set({ lastLoginAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.partnerStores.id, storeId));
    }
}
exports.DatabaseStorage = DatabaseStorage;
// Switch from memory storage to database storage
exports.storage = new DatabaseStorage();
