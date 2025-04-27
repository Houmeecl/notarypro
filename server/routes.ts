import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import multer from "multer";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";
import { 
  insertDocumentSchema, 
  insertDocumentCategorySchema,
  insertDocumentTemplateSchema,
  insertIdentityVerificationSchema,
  insertCourseSchema,
  insertCourseModuleSchema,
  insertCourseContentSchema,
  insertCourseEnrollmentSchema,
  insertQuizSchema,
  insertQuizQuestionSchema,
  insertQuizAttemptSchema,
  insertCertificateSchema
} from "@shared/schema";
import { generateVerificationCode, generateQRCodeSVG, generateSignatureData } from "@shared/utils/verification-code";

// Ensure these directories exist
const uploadsDir = path.join(process.cwd(), "uploads");
const docsDir = path.join(uploadsDir, "documents");
const idVerificationDir = path.join(uploadsDir, "id-verification");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}
if (!fs.existsSync(idVerificationDir)) {
  fs.mkdirSync(idVerificationDir, { recursive: true });
}

// Configure multer for file uploads
const storage_disk = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "document") {
      cb(null, docsDir);
    } else if (file.fieldname === "idPhoto" || file.fieldname === "selfie") {
      cb(null, idVerificationDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueId = nanoid();
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueId}${extension}`);
  }
});

const upload = multer({ storage: storage_disk });

// Authentication middleware
function isAuthenticated(req: Request, res: Response, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

function isCertifier(req: Request, res: Response, next: any) {
  if (req.isAuthenticated() && (req.user.role === "certifier" || req.user.role === "admin")) {
    return next();
  }
  return res.status(403).json({ message: "Forbidden" });
}

function isAdmin(req: Request, res: Response, next: any) {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Forbidden" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // setup authentication routes
  setupAuth(app);

  // Document routes
  app.post("/api/documents", isAuthenticated, upload.single("document"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No document file provided" });
      }

      const validatedData = insertDocumentSchema.parse({
        title: req.body.title,
        userId: req.user.id,
        filePath: req.file.path,
      });

      const document = await storage.createDocument(validatedData);
      res.status(201).json(document);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/documents", isAuthenticated, async (req, res) => {
    try {
      const documents = await storage.getUserDocuments(req.user.id);
      res.status(200).json(documents);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Only the document owner, certifiers, or admins can access the document
      if (document.userId !== req.user.id && req.user.role !== "certifier" && req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.status(200).json(document);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Only the document owner, certifiers, or admins can update the document
      if (document.userId !== req.user.id && req.user.role !== "certifier" && req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedDocument = await storage.updateDocument(documentId, req.body);
      res.status(200).json(updatedDocument);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Identity verification routes
  app.post("/api/identity-verification", isAuthenticated, upload.fields([
    { name: "idPhoto", maxCount: 1 },
    { name: "selfie", maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files.idPhoto || !files.selfie) {
        return res.status(400).json({ message: "Both ID photo and selfie are required" });
      }

      const documentId = parseInt(req.body.documentId);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Only the document owner can upload verification
      if (document.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const validatedData = insertIdentityVerificationSchema.parse({
        userId: req.user.id,
        documentId,
        idPhotoPath: files.idPhoto[0].path,
        selfiePath: files.selfie[0].path,
      });

      const verification = await storage.createIdentityVerification(validatedData);
      res.status(201).json(verification);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/identity-verification/:documentId", isAuthenticated, async (req, res) => {
    try {
      const documentId = parseInt(req.params.documentId);
      const verification = await storage.getIdentityVerificationByDocument(documentId);
      
      if (!verification) {
        return res.status(404).json({ message: "Identity verification not found" });
      }
      
      // Only the document owner, certifiers, or admins can access the verification
      const document = await storage.getDocument(documentId);
      if (!document || (document.userId !== req.user.id && req.user.role !== "certifier" && req.user.role !== "admin")) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.status(200).json(verification);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/identity-verification/:id", isCertifier, async (req, res) => {
    try {
      const verificationId = parseInt(req.params.id);
      const verification = await storage.getIdentityVerification(verificationId);
      
      if (!verification) {
        return res.status(404).json({ message: "Identity verification not found" });
      }
      
      const updatedVerification = await storage.updateIdentityVerification(verificationId, {
        ...req.body,
        certifierId: req.user.id
      });
      
      // If verification is approved or rejected, update the document status
      if (req.body.status === "approved" || req.body.status === "rejected") {
        await storage.updateDocument(verification.documentId, {
          status: req.body.status === "approved" ? "validated" : "rejected",
          certifierId: req.user.id
        });
      }
      
      res.status(200).json(updatedVerification);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Document categories routes
  app.post("/api/document-categories", isAdmin, async (req, res) => {
    try {
      const validatedData = insertDocumentCategorySchema.parse(req.body);
      const category = await storage.createDocumentCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/document-categories", async (req, res) => {
    try {
      const categories = await storage.getAllDocumentCategories();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/document-categories/:id", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.getDocumentCategory(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: "Document category not found" });
      }
      
      res.status(200).json(category);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/document-categories/:id", isAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.getDocumentCategory(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: "Document category not found" });
      }
      
      const updatedCategory = await storage.updateDocumentCategory(categoryId, req.body);
      res.status(200).json(updatedCategory);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/document-categories/:id", isAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.getDocumentCategory(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: "Document category not found" });
      }
      
      const deleted = await storage.deleteDocumentCategory(categoryId);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete category" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Document templates routes
  app.post("/api/document-templates", isAdmin, async (req, res) => {
    try {
      const validatedData = insertDocumentTemplateSchema.parse(req.body);
      const template = await storage.createDocumentTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/document-templates", async (req, res) => {
    try {
      const templates = await storage.getAllDocumentTemplates();
      res.status(200).json(templates);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/document-templates/:id", async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const template = await storage.getDocumentTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Document template not found" });
      }
      
      res.status(200).json(template);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/document-categories/:categoryId/templates", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const templates = await storage.getDocumentTemplatesByCategory(categoryId);
      res.status(200).json(templates);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/document-templates/:id", isAdmin, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const template = await storage.getDocumentTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Document template not found" });
      }
      
      const updatedTemplate = await storage.updateDocumentTemplate(templateId, req.body);
      res.status(200).json(updatedTemplate);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/document-templates/:id", isAdmin, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const template = await storage.getDocumentTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Document template not found" });
      }
      
      const deleted = await storage.deleteDocumentTemplate(templateId);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete template" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Certifier routes
  app.get("/api/certifier/documents", isCertifier, async (req, res) => {
    try {
      const pendingDocuments = await storage.getPendingDocuments();
      res.status(200).json(pendingDocuments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/certifier/my-documents", isCertifier, async (req, res) => {
    try {
      const documents = await storage.getCertifierDocuments(req.user.id);
      res.status(200).json(documents);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Signature routes
  app.post("/api/documents/:id/sign", isAuthenticated, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Only the document owner can sign or the certifier if it's a certified document
      if (document.userId !== req.user.id && document.certifierId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // For advanced signatures, the document must be validated
      if (req.body.type === "advanced" && document.status !== "validated") {
        return res.status(400).json({ message: "Document must be validated for advanced signatures" });
      }
      
      // Generar código de verificación único
      const verificationCode = generateVerificationCode(documentId, document.title);
      
      // Generar SVG del código QR para la verificación
      const qrCodeSvg = generateQRCodeSVG(verificationCode);
      
      // Generar datos de firma con el código de verificación
      const signatureData = generateSignatureData(req.user.id, documentId, verificationCode);
      
      // Actualizar el documento con el código de verificación y datos de firma
      const updatedDocument = await storage.updateDocument(documentId, {
        signatureData,
        status: "signed",
        qrCode: verificationCode,
        signatureTimestamp: new Date()
      });
      
      res.status(200).json(updatedDocument);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Verificación de documentos por código
  app.get("/api/verificar-documento/:code", async (req, res) => {
    try {
      const code = req.params.code;
      
      // Buscar documento por código de verificación
      const document = await storage.getDocumentByVerificationCode(code);
      
      if (!document) {
        return res.status(404).json({ 
          verified: false,
          message: "Documento no encontrado. El código de verificación puede ser inválido o el documento ya no existe."
        });
      }
      
      // Obtener datos del firmante
      const user = await storage.getUser(document.userId);
      
      // Responder con los datos de verificación
      res.status(200).json({
        verified: true,
        documentInfo: {
          title: document.title,
          signatureTimestamp: document.signatureTimestamp,
          signerName: user?.fullName || "Usuario desconocido"
        }
      });
    } catch (error) {
      res.status(500).json({ 
        verified: false,
        message: "Error en la verificación. Por favor, intente nuevamente."
      });
    }
  });

  // Course routes
  app.post("/api/courses", isAdmin, async (req, res) => {
    try {
      const validatedData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(validatedData);
      res.status(201).json(course);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.status(200).json(courses);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      res.status(200).json(course);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Course modules routes
  app.post("/api/courses/:courseId/modules", isAdmin, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      const validatedData = insertCourseModuleSchema.parse({
        ...req.body,
        courseId
      });
      
      const module = await storage.createCourseModule(validatedData);
      res.status(201).json(module);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/courses/:courseId/modules", async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const modules = await storage.getCourseModules(courseId);
      res.status(200).json(modules);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Course content routes
  app.post("/api/modules/:moduleId/contents", isAdmin, async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const validatedData = insertCourseContentSchema.parse({
        ...req.body,
        moduleId
      });
      
      const content = await storage.createCourseContent(validatedData);
      res.status(201).json(content);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/modules/:moduleId/contents", async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const contents = await storage.getCourseContents(moduleId);
      res.status(200).json(contents);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Course enrollment routes
  app.post("/api/courses/:courseId/enroll", isAuthenticated, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      const validatedData = insertCourseEnrollmentSchema.parse({
        userId: req.user.id,
        courseId
      });
      
      const enrollment = await storage.createCourseEnrollment(validatedData);
      res.status(201).json(enrollment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/user/enrollments", isAuthenticated, async (req, res) => {
    try {
      const enrollments = await storage.getUserEnrollments(req.user.id);
      res.status(200).json(enrollments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Quiz routes
  app.post("/api/modules/:moduleId/quizzes", isAdmin, async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const validatedData = insertQuizSchema.parse({
        ...req.body,
        moduleId
      });
      
      const quiz = await storage.createQuiz(validatedData);
      res.status(201).json(quiz);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/modules/:moduleId/quizzes", async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const quizzes = await storage.getModuleQuizzes(moduleId);
      res.status(200).json(quizzes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Quiz questions routes
  app.post("/api/quizzes/:quizId/questions", isAdmin, async (req, res) => {
    try {
      const quizId = parseInt(req.params.quizId);
      const validatedData = insertQuizQuestionSchema.parse({
        ...req.body,
        quizId
      });
      
      const question = await storage.createQuizQuestion(validatedData);
      res.status(201).json(question);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/quizzes/:quizId/questions", async (req, res) => {
    try {
      const quizId = parseInt(req.params.quizId);
      const questions = await storage.getQuizQuestions(quizId);
      res.status(200).json(questions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Quiz attempt routes
  app.post("/api/quizzes/:quizId/attempts", isAuthenticated, async (req, res) => {
    try {
      const quizId = parseInt(req.params.quizId);
      const quiz = await storage.getQuiz(quizId);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      const { score, passed } = req.body;
      
      const validatedData = insertQuizAttemptSchema.parse({
        userId: req.user.id,
        quizId,
        score,
        passed
      });
      
      const attempt = await storage.createQuizAttempt(validatedData);
      res.status(201).json(attempt);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Certificate routes
  app.post("/api/courses/:courseId/certificate", isAuthenticated, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Check if the user has completed the course
      const enrollments = await storage.getUserEnrollments(req.user.id);
      const enrollment = enrollments.find(e => e.courseId === courseId && e.completed);
      
      if (!enrollment) {
        return res.status(400).json({ message: "You have not completed this course" });
      }
      
      // Generate certificate number
      const certificateNumber = `CERT-${nanoid(10)}`;
      
      const validatedData = insertCertificateSchema.parse({
        userId: req.user.id,
        courseId,
        certificateNumber
      });
      
      const certificate = await storage.createCertificate(validatedData);
      res.status(201).json(certificate);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/user/certificates", isAuthenticated, async (req, res) => {
    try {
      const certificates = await storage.getUserCertificates(req.user.id);
      res.status(200).json(certificates);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/verify-certificate/:certificateNumber", async (req, res) => {
    try {
      const { certificateNumber } = req.params;
      const certificate = await storage.verifyCertificate(certificateNumber);
      
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      
      res.status(200).json({ valid: true, certificate });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // User management routes for admin
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const role = req.query.role as string;
      let users;
      
      if (role) {
        users = await storage.getUsersByRole(role);
      } else {
        // In a real implementation with a database, we would have a getAllUsers method
        // For memory storage, we'll simulate by fetching users for each role
        const normalUsers = await storage.getUsersByRole("user");
        const certifiers = await storage.getUsersByRole("certifier");
        const admins = await storage.getUsersByRole("admin");
        users = [...normalUsers, ...certifiers, ...admins];
      }
      
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
