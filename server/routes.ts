import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { createAnalyticsEvent } from "./db";
import { handleChatbotQuery, analyzeSentiment, getLegalResponse, analyzeDocument } from "./services/chatbot";
import { generateVideoToken, registerSessionParticipant, getSessionParticipants, endSession } from "./services/video-call";
import { createContact, updateContact, createDeal, findContactByEmail, logDocumentActivity } from "./services/crm";
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
  insertAnalyticsEventSchema,
  insertCertificateSchema,
  insertPartnerSchema,
  insertPartnerBankDetailsSchema,
  insertPartnerSaleSchema,
  insertPartnerPaymentSchema,
  insertWhatsappMessageSchema,
  insertDialogflowSessionSchema,
  insertCrmLeadSchema,
  insertMessageTemplateSchema,
  insertAutomationRuleSchema
} from "@shared/schema";
import { generateVerificationCode, generateQRCodeSVG, generateSignatureData } from "@shared/utils/document-utils";
import adminRouter from "./admin/admin-routes";
import integrationRouter from "./admin/integration-routes";
import { adminPosRouter } from "./admin/admin-pos-routes";
import { partnerPosRouter } from "./partners/partner-pos-routes";
import { registerAdminApiRoutes } from "./admin/admin-api-routes";
import { automationService } from "./services/automation-service";
import { whatsappService } from "./services/whatsapp-service";
import { dialogflowService } from "./services/dialogflow-service";
import { posService } from "./services/pos-service";
import { WebSocketServer } from "ws";
import { createSuperAdmin, createSebaAdmin } from "./admin/seed-admin";
import { gamificationRouter } from "./gamification-routes";
import { microInteractionsRouter } from "./micro-interactions-routes";
import { verifyDocument } from "./services/gamification-service";
import { ronRouter } from "./ron-routes";
import { webappRouter } from "./partners/webapp-routes";
import { mobileApiRouter } from "./partners/mobile-api";
import { translationRouter } from "./translation-routes";
import mercadoPagoRouter from "./mercadopago-routes";

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

// Importar el router de Vecinos Xpress
import { vecinosRouter } from "./vecinos-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // setup authentication routes
  setupAuth(app);
  
  // Rutas para Vecinos Xpress
  app.use("/api/vecinos", vecinosRouter);
  
  // Ruta directa para descargar la APK
  app.get('/descargar-apk-vecinos', (req, res) => {
    const filePath = path.join(process.cwd(), 'public', 'downloads', 'vecinos-notarypro-pos.apk');
    if (fs.existsSync(filePath)) {
      res.download(filePath, 'vecinos_notarypro_pos_v1.2.0.apk');
    } else {
      res.status(404).send('APK no encontrada');
    }
  });
  
  // Registrar rutas de administración
  app.use('/api/admin', adminRouter);
  
  // Registrar rutas de integración
  app.use('/api/integration', integrationRouter);
  
  // Registrar rutas de POS
  app.use('/api/admin/pos', adminPosRouter);
  app.use('/api/partners/pos', partnerPosRouter);

  // Registrar rutas de gamificación
  app.use('/api/gamification', gamificationRouter);
  
  // Registrar rutas de micro-interacciones
  app.use('/api/micro-interactions', microInteractionsRouter);
  
  // Registrar rutas de la plataforma RON
  app.use('/api/ron', ronRouter);
  
  // Registrar rutas de la webapp para socios (alternativa a la app Android)
  app.use('/api/partners', webappRouter);
  
  // Registrar rutas de la API móvil para la APK
  app.use('/api/mobile', mobileApiRouter);
  
  // Registrar rutas de traducción
  app.use('/api/translation', translationRouter);
  
  // Registrar rutas de MercadoPago
  app.use('/api/mercadopago', mercadoPagoRouter);

  // Registrar rutas de APIs de integraciones
  registerAdminApiRoutes(app);
  
  // Inicializar administradores
  // Estas funciones comprueban si ya existen y solo actualizan las contraseñas si es necesario
  try {
    await createSuperAdmin();
    console.log('Super admin inicializado correctamente');
    
    // Crear administrador adicional "Sebadmin"
    await createSebaAdmin();
    console.log('Admin Sebadmin inicializado correctamente');
  } catch (error) {
    console.error('Error al inicializar administradores:', error);
  }

  // Document routes
  app.post("/api/documents", async (req, res) => {
    try {
      // Si el usuario está autenticado, usamos su ID, de lo contrario usamos un ID genérico para invitados
      const userId = req.isAuthenticated() ? req.user.id : 1; // Usuario invitado (guest user id = 1)
      
      const validatedData = insertDocumentSchema.parse({
        ...req.body,
        userId: userId,
      });

      const document = await storage.createDocument(validatedData);
      
      // Generar código de verificación único
      const verificationCode = generateVerificationCode(document.id, document.title);
      
      // Generar SVG del código QR para la verificación
      const qrCodeSvg = generateQRCodeSVG(verificationCode);
      
      // Actualizar el documento con el código QR
      const updatedDocument = await storage.updateDocument(document.id, {
        qrCode: qrCodeSvg
      });
      
      res.status(201).json(updatedDocument);
    } catch (error) {
      console.error("Error al crear documento:", error);
      res.status(400).json({ message: error.message });
    }
  });
  
  // Ruta para procesar pagos de documentos
  app.post("/api/documents/:id/payment", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const { 
        paymentMethod, 
        cardNumber,
        cardHolderName,
        expirationDate,
        cvv,
        signatureType, 
        email, 
        receiveNotifications, 
        sendCopy 
      } = req.body;
      
      // Validar email
      if (!email || !email.includes('@')) {
        return res.status(400).json({ 
          message: "Se requiere un correo electrónico válido" 
        });
      }
      
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Documento no encontrado" });
      }
      
      // Si el usuario está autenticado, verificamos permisos
      if (req.isAuthenticated()) {
        const user = req.user as any;
        // Solo el propietario del documento puede pagar
        if (document.userId !== user.id && user.role !== "admin") {
          return res.status(403).json({ message: "Forbidden" });
        }
      } else {
        // Para invitados, verificamos que el documento pertenezca a un invitado (userId = 1)
        if (document.userId !== 1) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      // Validamos que el documento esté en estado correcto para pago
      if (document.status !== "pending_payment" && document.status !== "draft") {
        return res.status(400).json({ 
          message: "El documento no está pendiente de pago o ya ha sido pagado" 
        });
      }
      
      if (!paymentMethod) {
        return res.status(400).json({ message: "Método de pago es requerido" });
      }
      
      // Determinar monto basado en el tipo de firma
      const isAdvanced = signatureType === "advanced";
      const paymentAmount = isAdvanced ? 5000 : 1500;
      
      // Generar ID de pago único
      const paymentId = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Actualizar el documento con la información de pago y correo
      const updatedDocument = await storage.updateDocument(documentId, {
        status: isAdvanced ? "pending" : "validated", // Si es simple, está listo para firmar, si es avanzada, necesita verificación
        paymentStatus: "completed",
        paymentAmount,
        paymentId,
        paymentMethod,
        paymentTimestamp: new Date(),
        email,
        receiveNotifications: !!receiveNotifications,
        sendCopy: !!sendCopy
      });
      
      // Registrar evento de pago
      await createAnalyticsEvent({
        eventType: "document_payment",
        userId: document.userId,
        documentId: document.id,
        metadata: { 
          paymentAmount, 
          paymentMethod, 
          signatureType,
          email,
          receiveNotifications,
          sendCopy
        }
      });
      
      // Enviar correo de confirmación de pago
      try {
        const { emailService } = await import('./services/email-service');
        
        // Obtener información del usuario si está autenticado
        let userName = "Usuario";
        if (req.isAuthenticated() && (req.user as any).fullName) {
          userName = (req.user as any).fullName;
        }

        // Enviar confirmación de pago
        await emailService.sendPaymentConfirmation(
          email,
          document.title,
          document.id,
          paymentAmount,
          paymentId,
          userName
        );
        
        // Si se solicitó enviar una copia del documento y tiene PDF asociado
        if (sendCopy && document.pdfPath) {
          // En un entorno real, aquí se leería el archivo PDF y se convertiría a base64
          // Por ahora, enviamos el correo con un enlace al documento
          await emailService.sendDocumentCopy(
            email,
            document.title,
            document.id,
            undefined, // pdfBase64
            `https://cerfidoc.cl/document-view/${document.id}`
          );
        }
      } catch (emailError) {
        console.error("Error enviando correo de confirmación:", emailError);
        // No interrumpimos el flujo principal si falla el envío de correo
      }
      
      // Determinar siguiente paso basado en el tipo de firma
      const nextStep = signatureType === "advanced" ? "identity-verification" : "sign";
      
      res.status(200).json({ 
        success: true, 
        paymentId,
        nextStep,
        message: "Pago procesado correctamente" 
      });
    } catch (error) {
      console.error("Error procesando pago:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Error procesando pago" });
    }
  });
  
  // Ruta para que los administradores creen documentos directamente desde plantillas
  app.post("/api/admin/documents/create-from-template", isAdmin, async (req, res) => {
    try {
      const { templateId, title, formData, testCode } = req.body;
      
      // Validación del código de prueba 7723
      if (testCode !== "7723") {
        return res.status(400).json({ message: "Código de prueba inválido" });
      }
      
      // Obtener la plantilla
      const template = await storage.getDocumentTemplate(parseInt(templateId));
      if (!template) {
        return res.status(404).json({ message: "Plantilla no encontrada" });
      }
      
      // Crear el documento
      const document = await storage.createDocument({
        userId: req.user.id,
        templateId: parseInt(templateId),
        title: title || `${template.name} - ${new Date().toLocaleDateString()}`,
        formData
      });
      
      // Generar código de verificación único
      const verificationCode = generateVerificationCode(document.id, document.title);
      
      // Generar SVG del código QR para la verificación
      const qrCodeSvg = generateQRCodeSVG(verificationCode);
      
      // Generar datos de firma con el código de verificación
      const signatureData = generateSignatureData(req.user.id, document.id, verificationCode);
      
      // Actualizar documento con firma avanzada directamente
      const signedDocument = await storage.updateDocument(document.id, {
        signatureData,
        status: "signed",
        qrCode: verificationCode,
        signatureTimestamp: new Date(),
        paymentStatus: "completed", // Marcar como pagado para administradores
        paymentAmount: 0 // Sin costo para administradores
      });
      
      res.status(201).json({
        message: "Documento creado y firmado exitosamente",
        document: signedDocument,
        verificationCode
      });
    } catch (error) {
      console.error("Error creando documento administrativo:", error);
      res.status(500).json({ message: error.message });
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

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Si el usuario está autenticado, aplicamos restricciones de acceso
      if (req.isAuthenticated()) {
        const user = req.user as any; // Esto es necesario por el error de TypeScript
        // Solo el propietario del documento, certificadores o administradores pueden acceder al documento
        if (document.userId !== user.id && user.role !== "certifier" && user.role !== "admin") {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      // Si el usuario no está autenticado, permitimos acceso público al documento
      
      res.status(200).json(document);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Función para generar HTML de documento a partir de plantilla y datos
  function generateDocumentHtml(document, template, formData) {
    // Obtener CSS base para todos los documentos
    const baseStyles = `
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      .document-header {
        text-align: center;
        border-bottom: 2px solid #eee;
        padding-bottom: 15px;
        margin-bottom: 25px;
      }
      .document-title {
        font-size: 24px;
        font-weight: bold;
        color: #333;
        margin-bottom: 5px;
      }
      .document-subtitle {
        font-size: 16px;
        color: #666;
      }
      .document-reference {
        text-align: right;
        margin-bottom: 20px;
        color: #666;
        font-size: 14px;
      }
      .document-content {
        margin: 30px 0;
        background-color: white;
        padding: 20px;
        border: 1px solid #eee;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      }
      .field {
        margin-bottom: 15px;
      }
      .field-label {
        display: block;
        margin-bottom: 5px;
        color: #555;
        font-weight: bold;
      }
      .field-value {
        padding: 8px;
        background-color: #f9f9f9;
        border-radius: 4px;
        border: 1px solid #eee;
      }
      .signature-area {
        margin-top: 40px;
        border-top: 1px solid #eee;
        padding-top: 20px;
        display: flex;
        justify-content: space-between;
      }
      .signature-box {
        border: 1px dashed #ccc;
        width: 200px;
        height: 100px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #888;
      }
      .document-footer {
        margin-top: 40px;
        text-align: center;
        font-size: 12px;
        color: #999;
      }
    `;
    
    // Generar HTML con los datos del formulario
    const formDataHtml = Object.entries(formData)
      .map(([key, value]) => `
        <div class="field">
          <div class="field-label">${key}</div>
          <div class="field-value">${value}</div>
        </div>
      `)
      .join('');
    
    // Crear HTML completo
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${document.title}</title>
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="document-reference">
          <div>Ref: ${document.id}</div>
          <div>Fecha: ${new Date(document.createdAt || '').toLocaleDateString()}</div>
        </div>
        
        <div class="document-header">
          <div class="document-title">${document.title}</div>
          <div class="document-subtitle">${template.name || ''}</div>
        </div>
        
        <div class="document-content">
          ${formDataHtml || '<p>No hay datos disponibles para este documento.</p>'}
        </div>
        
        <div class="signature-area">
          <div>
            <p>Estado: <strong>${document.status}</strong></p>
            ${document.certifierId ? '<p>Certificado por un notario autorizado.</p>' : ''}
          </div>
          
          ${document.signatureData ? `
            <div class="signature-box">
              <p>Documento firmado electrónicamente</p>
              <p>${new Date(document.updatedAt || '').toLocaleDateString()}</p>
            </div>
          ` : `
            <div class="signature-box">
              <p>Zona para firma</p>
            </div>
          `}
        </div>
        
        <div class="document-footer">
          <p>Este documento es una representación digital del original.</p>
          <p>Generado por Vecinos NotaryPro el ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;
    
    return html;
  }
  
  // Obtener vista previa HTML renderizada del documento
  app.get("/api/documents/:id/preview", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Si el usuario está autenticado, verificamos el acceso; si no, permitimos acceso público
      if (req.isAuthenticated()) {
        const user = req.user as any; // Esto es necesario por el error de TypeScript
        // Verificar que el usuario tenga acceso al documento
        if (document.userId !== user.id && user.role !== "admin" && user.role !== "certifier" && document.certifierId !== user.id) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      // Si no está autenticado, permitimos acceso
      
      // Obtener la plantilla del documento
      const template = await storage.getDocumentTemplate(document.templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Obtener los datos del formulario
      let formData = {};
      try {
        formData = document.formData ? 
          (typeof document.formData === 'string' ? JSON.parse(document.formData) : document.formData) : 
          {};
      } catch (e) {
        console.error("Error parsing form data:", e);
      }
      
      // Formatear los datos según el formulario
      let formattedData = {};
      if (template.formSchema) {
        const schema = typeof template.formSchema === 'string' ? 
          JSON.parse(template.formSchema) : template.formSchema;
        
        for (const [key, value] of Object.entries(formData)) {
          const propertySchema = schema.properties?.[key];
          if (propertySchema) {
            formattedData[propertySchema.title || key] = value;
          } else {
            formattedData[key] = value;
          }
        }
      } else {
        formattedData = formData;
      }
      
      // Generar HTML basado en la plantilla y los datos
      const html = generateDocumentHtml(document, template, formattedData);
      
      // Responder con HTML
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error("Error generating document preview:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Descargar borrador del documento
  app.get("/api/documents/:id/download-draft", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Si el documento ya tiene una ruta de PDF, enviar ese archivo
      if (document.pdfPath) {
        res.setHeader('Content-Disposition', `attachment; filename="documento-${document.id}.pdf"`);
        return res.sendFile(document.pdfPath, { root: "." });
      }
      
      // Obtener la plantilla
      const template = await storage.getDocumentTemplate(document.templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Obtener los datos del formulario
      let formData = {};
      try {
        formData = document.formData ? 
          (typeof document.formData === 'string' ? JSON.parse(document.formData) : document.formData) : 
          {};
      } catch (e) {
        console.error("Error parsing form data:", e);
      }
      
      // Formatear los datos según el formulario
      let formattedData = {};
      if (template.formSchema) {
        const schema = typeof template.formSchema === 'string' ? 
          JSON.parse(template.formSchema) : template.formSchema;
        
        for (const [key, value] of Object.entries(formData)) {
          const propertySchema = schema.properties?.[key];
          if (propertySchema) {
            formattedData[propertySchema.title || key] = value;
          } else {
            formattedData[key] = value;
          }
        }
      } else {
        formattedData = formData;
      }
      
      // Generar HTML basado en la plantilla y los datos
      const html = generateDocumentHtml(document, template, formattedData);
      
      // Configurar encabezados para descarga
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="documento-${document.id}-borrador.html"`);
      
      res.send(html);
    } catch (error) {
      console.error("Error al descargar el borrador del documento:", error);
      res.status(500).json({ message: "Error generating document draft" });
    }
  });

  app.patch("/api/documents/:id", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      const updates = req.body;
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Si el usuario está autenticado, verificamos permisos
      if (req.isAuthenticated()) {
        const user = req.user as any; // Necesario por los errores de TypeScript
        // Solo el propietario del documento, certificadores o administradores pueden actualizar el documento
        if (document.userId !== user.id && user.role !== "certifier" && user.role !== "admin") {
          return res.status(403).json({ message: "Forbidden" });
        }
      } else {
        // Para invitados, verificamos que el documento pertenezca a un invitado (userId = 1)
        if (document.userId !== 1) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      const updatedDocument = await storage.updateDocument(documentId, updates);
      
      // Enviar notificación por correo si cambió el estado y tenemos email registrado
      if (updates.status && document.status !== updates.status && document.email && document.receiveNotifications) {
        try {
          const { emailService } = await import('./services/email-service');
          await emailService.sendDocumentStatusUpdate(
            document.email,
            document.title,
            document.id,
            updates.status
          );
          console.log(`Notificación de cambio de estado enviada a ${document.email}`);
        } catch (emailError) {
          console.error("Error enviando notificación de estado:", emailError);
          // No interrumpimos el flujo principal si falla el envío
        }
      }
      
      res.status(200).json(updatedDocument);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Error actualizando documento" });
    }
  });

  // Identity verification routes
  app.post("/api/identity-verification", upload.fields([
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
      
      // Si el usuario está autenticado, verificar que sea el propietario
      let userId = document.userId; // Por defecto, usamos el userId del documento
      
      if (req.isAuthenticated()) {
        const user = req.user as any;
        // Solo el propietario del documento puede subir la verificación
        if (document.userId !== user.id) {
          return res.status(403).json({ message: "Forbidden" });
        }
        userId = user.id;
      }

      const validatedData = insertIdentityVerificationSchema.parse({
        userId,
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

  app.get("/api/identity-verification/:documentId", async (req, res) => {
    try {
      const documentId = parseInt(req.params.documentId);
      const verification = await storage.getIdentityVerificationByDocument(documentId);
      
      if (!verification) {
        return res.status(404).json({ message: "Identity verification not found" });
      }
      
      // Verificar permisos si el usuario está autenticado
      if (req.isAuthenticated()) {
        const user = req.user as any;
        const document = await storage.getDocument(documentId);
        
        if (!document || (document.userId !== user.id && user.role !== "certifier" && user.role !== "admin" && document.certifierId !== user.id)) {
          return res.status(403).json({ message: "Forbidden" });
        }
      } else {
        // Para usuarios no autenticados, solo permitir acceso si están viendo su propio documento
        const document = await storage.getDocument(documentId);
        
        // Los documentos con userId=1 son documentos de invitado y se permiten ver
        if (!document || document.userId !== 1) {
          return res.status(403).json({ message: "Forbidden" });
        }
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
  
  // Special seed route for admin development
  app.post("/api/admin/seed-templates", async (req, res) => {
    // Verificar código secreto para proteger esta ruta sin autenticación
    if (req.body.secretCode !== '7723') {
      return res.status(403).json({ message: "Código incorrecto" });
    }
    
    try {
      // Crear plantillas para documentos
      if (req.body.templates) {
        let createdCount = 0;
        // Obtener plantillas existentes para verificar duplicados
        const existingTemplates = await storage.getAllDocumentTemplates();
        const existingNames = existingTemplates.map(t => t.name);
        
        for (const template of req.body.templates) {
          // Verificar que no exista una plantilla con el mismo nombre
          if (!existingNames.includes(template.name)) {
            const validateResult = insertDocumentTemplateSchema.safeParse(template);
            if (validateResult.success) {
              await storage.createDocumentTemplate(validateResult.data);
              createdCount++;
            }
          }
        }
        
        return res.status(200).json({ 
          message: `Se agregaron ${createdCount} nuevas plantillas` 
        });
      } else {
        return res.status(400).json({ message: "No hay plantillas para agregar" });
      }
    } catch (error) {
      console.error("Error sembrando plantillas:", error);
      res.status(500).json({ message: error.message });
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
  app.post("/api/documents/:id/sign", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Si el usuario está autenticado, verificamos permisos
      let isAdmin = false;
      if (req.isAuthenticated()) {
        const user = req.user as any; // Necesario por los errores de TypeScript
        // Solo el propietario puede firmar o el certificador si es un documento certificado
        if (document.userId !== user.id && document.certifierId !== user.id) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        // Los administradores pueden usar firmas avanzadas sin validación previa y sin pago
        isAdmin = user.role === 'admin';
      } else {
        // Para invitados, verificamos que el documento pertenezca a un invitado (userId = 1)
        if (document.userId !== 1) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      // Para firmas avanzadas, el documento debe estar validado (a menos que sea administrador)
      if (req.body.type === "advanced" && document.status !== "validated" && !isAdmin) {
        return res.status(400).json({ message: "Document must be validated for advanced signatures" });
      }
      
      // Obtener datos de firma del request body o generar si no existen
      let signatureData = req.body.signatureData;
      // Generar código de verificación único
      const verificationCode = generateVerificationCode(documentId, document.title);
      
      // Generar SVG del código QR para la verificación
      const qrCodeSvg = generateQRCodeSVG(verificationCode);
      
      // Si no hay datos de firma en el request body, generarlos
      if (!signatureData) {
        // Si el usuario está autenticado, usamos su ID, si no, usamos el ID de invitado (1)
        const userId = req.isAuthenticated() ? (req.user as any).id : 1;
        signatureData = generateSignatureData(userId, documentId, verificationCode);
      }
      
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
  
  // Document payment routes
  // Esta ruta ya está definida arriba y ha sido mejorada con funcionalidad de correo electrónico
  
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
      
      // Verificar que el documento esté firmado
      if (document.status !== "signed") {
        return res.status(400).json({
          verified: false,
          message: "El documento existe pero aún no ha sido firmado oficialmente."
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
  
  // Get user by ID
  app.get("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      res.status(200).json(user);
    } catch (error) {
      console.error("Error obteniendo usuario:", error);
      res.status(500).json({ message: "Error al obtener usuario" });
    }
  });
  
  // Update user
  app.patch("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const userData = req.body;
      
      // Validar que el usuario existe
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      // Actualizar usuario
      const updatedUser = await storage.updateUser(userId, userData);
      
      // Registrar evento de actualización
      await createAnalyticsEvent({
        eventType: "user_updated",
        userId: req.user.id,
        metadata: { 
          targetUserId: userId,
          updatedFields: Object.keys(userData),
          roleChange: userData.role !== undefined && userData.role !== existingUser.role
        }
      });
      
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      res.status(500).json({ message: "Error al actualizar usuario" });
    }
  });
  
  // Analytics routes
  app.post("/api/analytics/events", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAnalyticsEventSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const event = await storage.createAnalyticsEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.get("/api/analytics/events", isAdmin, async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const eventType = req.query.eventType as string;
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      const events = await storage.getAnalyticsEvents({
        startDate,
        endDate,
        eventType,
        userId
      });
      
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/analytics/daily-counts", isAdmin, async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const eventType = req.query.eventType as string;
      
      const counts = await storage.getDailyEventCounts({
        startDate,
        endDate,
        eventType
      });
      
      res.status(200).json(counts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/analytics/user-stats", async (req, res) => {
    try {
      const stats = await storage.getUserActivityStats();
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/analytics/document-stats", async (req, res) => {
    try {
      const stats = await storage.getDocumentStats();
      res.status(200).json(stats);
    } catch (error: any) {
      console.error("Error en getDocumentStats:", error);
      res.status(500).json({ message: error.message || "Error al obtener estadísticas de documentos" });
    }
  });
  
  app.get("/api/analytics/revenue-stats", async (req, res) => {
    try {
      const stats = await storage.getRevenueStats();
      res.status(200).json(stats);
    } catch (error: any) {
      console.error("Error en getRevenueStats:", error);
      res.status(500).json({ message: error.message || "Error al obtener estadísticas de ingresos" });
    }
  });

  // Partner (Vecinos NotaryPro Express) routes
  // Ruta pública para registro de partners
  app.post("/api/partners/register", async (req, res) => {
    try {
      const validatedData = insertPartnerSchema.parse(req.body);
      
      // Verificar si ya existe un partner con ese email
      const existingPartner = await storage.getPartnerByEmail(validatedData.email);
      if (existingPartner) {
        return res.status(400).json({ message: "Ya existe un partner registrado con ese email" });
      }
      
      const partner = await storage.createPartner(validatedData);
      
      // Crear un evento de analytics
      await storage.createAnalyticsEvent({
        eventType: "partner_registration",
        metadata: {
          partnerId: partner.id,
          region: partner.region,
          commune: partner.commune
        }
      });
      
      res.status(201).json({
        success: true,
        message: "Solicitud de registro enviada con éxito. Revisaremos su información y le contactaremos pronto.",
        partnerId: partner.id
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Obtener todos los partners (solo admin)
  app.get("/api/partners", isAdmin, async (req, res) => {
    try {
      const partners = await storage.getAllPartners();
      res.status(200).json(partners);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Obtener un partner específico
  app.get("/api/partners/:id", isAuthenticated, async (req, res) => {
    try {
      const partnerId = parseInt(req.params.id);
      const partner = await storage.getPartner(partnerId);
      
      if (!partner) {
        return res.status(404).json({ message: "Partner no encontrado" });
      }
      
      // Solo el propio partner, o un admin pueden ver los detalles
      if (partner.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "No tiene permisos para ver estos datos" });
      }
      
      res.status(200).json(partner);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Actualizar estado de un partner (solo admin)
  app.patch("/api/partners/:id", isAdmin, async (req, res) => {
    try {
      const partnerId = parseInt(req.params.id);
      const partner = await storage.getPartner(partnerId);
      
      if (!partner) {
        return res.status(404).json({ message: "Partner no encontrado" });
      }
      
      const updatedPartner = await storage.updatePartner(partnerId, req.body);
      
      // Si se está aprobando el partner, crear evento de analytics
      if (req.body.status === "approved" && partner.status !== "approved") {
        await storage.createAnalyticsEvent({
          eventType: "partner_approved",
          metadata: {
            partnerId: partnerId,
            region: partner.region,
            commune: partner.commune
          }
        });
      }
      
      res.status(200).json(updatedPartner);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Obtener partners filtrados por estado
  app.get("/api/partners/filter/status/:status", isAdmin, async (req, res) => {
    try {
      const partners = await storage.getPartnersByStatus(req.params.status);
      res.status(200).json(partners);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Obtener partners filtrados por región
  app.get("/api/partners/filter/region/:region", isAdmin, async (req, res) => {
    try {
      const partners = await storage.getPartnersByRegion(req.params.region);
      res.status(200).json(partners);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Obtener partners filtrados por comuna
  app.get("/api/partners/filter/commune/:commune", isAdmin, async (req, res) => {
    try {
      const partners = await storage.getPartnersByCommune(req.params.commune);
      res.status(200).json(partners);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Rutas para datos bancarios de los partners
  app.post("/api/partner-bank-details", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPartnerBankDetailsSchema.parse(req.body);
      
      // Verificar que el partner existe y pertenece al usuario
      const partner = await storage.getPartnerByUserId(req.user.id);
      if (!partner) {
        return res.status(403).json({ message: "No tiene permisos para realizar esta acción" });
      }
      
      // Verificar si ya existen detalles bancarios para este partner
      const existingDetails = await storage.getPartnerBankDetails(partner.id);
      if (existingDetails) {
        return res.status(400).json({ message: "Ya existen datos bancarios para este partner" });
      }
      
      // Establecer el partnerId correcto (ignorar el que viene en el body)
      const bankDetails = await storage.createPartnerBankDetails({
        ...validatedData,
        partnerId: partner.id
      });
      
      res.status(201).json(bankDetails);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Obtener los detalles bancarios de un partner
  app.get("/api/partner-bank-details/:partnerId", isAuthenticated, async (req, res) => {
    try {
      const partnerId = parseInt(req.params.partnerId);
      
      // Verificar que el partner existe y pertenece al usuario o es admin
      const partner = await storage.getPartner(partnerId);
      if (!partner) {
        return res.status(404).json({ message: "Partner no encontrado" });
      }
      
      if (partner.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "No tiene permisos para ver estos datos" });
      }
      
      const bankDetails = await storage.getPartnerBankDetails(partnerId);
      if (!bankDetails) {
        return res.status(404).json({ message: "No se encontraron datos bancarios para este partner" });
      }
      
      res.status(200).json(bankDetails);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Actualizar los detalles bancarios de un partner
  app.patch("/api/partner-bank-details/:id", isAuthenticated, async (req, res) => {
    try {
      const detailsId = parseInt(req.params.id);
      const bankDetails = await storage.getPartnerBankDetails(detailsId);
      
      if (!bankDetails) {
        return res.status(404).json({ message: "Datos bancarios no encontrados" });
      }
      
      // Verificar que el partner pertenece al usuario
      const partner = await storage.getPartner(bankDetails.partnerId);
      if (!partner || (partner.userId !== req.user.id && req.user.role !== "admin")) {
        return res.status(403).json({ message: "No tiene permisos para actualizar estos datos" });
      }
      
      const updatedDetails = await storage.updatePartnerBankDetails(detailsId, req.body);
      res.status(200).json(updatedDetails);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Rutas para ventas de partners
  app.post("/api/partner-sales", isAdmin, async (req, res) => {
    try {
      const validatedData = insertPartnerSaleSchema.parse(req.body);
      
      // Verificar que el partner existe
      const partner = await storage.getPartner(validatedData.partnerId);
      if (!partner) {
        return res.status(404).json({ message: "Partner no encontrado" });
      }
      
      // Crear la venta
      const sale = await storage.createPartnerSale(validatedData);
      
      // Crear evento de analytics
      await storage.createAnalyticsEvent({
        eventType: "partner_sale_created",
        metadata: {
          partnerId: validatedData.partnerId,
          documentId: validatedData.documentId,
          amount: validatedData.amount,
          commission: validatedData.commission
        }
      });
      
      res.status(201).json(sale);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Obtener ventas de un partner
  app.get("/api/partner-sales/:partnerId", isAuthenticated, async (req, res) => {
    try {
      const partnerId = parseInt(req.params.partnerId);
      
      // Verificar que el partner existe y pertenece al usuario o es admin
      const partner = await storage.getPartner(partnerId);
      if (!partner) {
        return res.status(404).json({ message: "Partner no encontrado" });
      }
      
      if (partner.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "No tiene permisos para ver estos datos" });
      }
      
      const status = req.query.status as string | undefined;
      const sales = await storage.getPartnerSales(partnerId, { status });
      
      res.status(200).json(sales);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Obtener estadísticas de ventas de un partner
  app.get("/api/partner-sales-stats/:partnerId", isAuthenticated, async (req, res) => {
    try {
      const partnerId = parseInt(req.params.partnerId);
      
      // Verificar que el partner existe y pertenece al usuario o es admin
      const partner = await storage.getPartner(partnerId);
      if (!partner) {
        return res.status(404).json({ message: "Partner no encontrado" });
      }
      
      if (partner.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "No tiene permisos para ver estos datos" });
      }
      
      const stats = await storage.getPartnerSalesStats(partnerId);
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Actualizar estado de una venta (solo admin)
  app.patch("/api/partner-sales/:id", isAdmin, async (req, res) => {
    try {
      const saleId = parseInt(req.params.id);
      const sale = await storage.getPartnerSale(saleId);
      
      if (!sale) {
        return res.status(404).json({ message: "Venta no encontrada" });
      }
      
      const updatedSale = await storage.updatePartnerSale(saleId, req.body);
      
      // Si la venta pasa a disponible, crear evento de analytics
      if (req.body.status === "available" && sale.status !== "available") {
        await storage.createAnalyticsEvent({
          eventType: "partner_commission_available",
          metadata: {
            partnerId: sale.partnerId,
            saleId: sale.id,
            commission: sale.commission
          }
        });
      }
      
      res.status(200).json(updatedSale);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Rutas para pagos a partners
  app.post("/api/partner-payments", isAdmin, async (req, res) => {
    try {
      const validatedData = insertPartnerPaymentSchema.parse(req.body);
      
      // Verificar que el partner existe
      const partner = await storage.getPartner(validatedData.partnerId);
      if (!partner) {
        return res.status(404).json({ message: "Partner no encontrado" });
      }
      
      // Crear el pago
      const payment = await storage.createPartnerPayment(validatedData);
      
      // Crear evento de analytics
      await storage.createAnalyticsEvent({
        eventType: "partner_payment_created",
        metadata: {
          partnerId: validatedData.partnerId,
          amount: validatedData.amount,
          paymentMethod: validatedData.paymentMethod
        }
      });
      
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Obtener pagos de un partner
  app.get("/api/partner-payments/:partnerId", isAuthenticated, async (req, res) => {
    try {
      const partnerId = parseInt(req.params.partnerId);
      
      // Verificar que el partner existe y pertenece al usuario o es admin
      const partner = await storage.getPartner(partnerId);
      if (!partner) {
        return res.status(404).json({ message: "Partner no encontrado" });
      }
      
      if (partner.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "No tiene permisos para ver estos datos" });
      }
      
      const payments = await storage.getPartnerPayments(partnerId);
      res.status(200).json(payments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Ruta pública para buscar puntos de servicio (partners aprobados)
  app.get("/api/service-points", async (req, res) => {
    try {
      // Obtener todos los partners aprobados
      const partners = await storage.getPartnersByStatus("approved");
      
      // Opcional: filtrar por región o comuna si se proporcionan
      const region = req.query.region as string | undefined;
      const commune = req.query.commune as string | undefined;
      
      let filteredPartners = partners;
      
      if (region) {
        filteredPartners = filteredPartners.filter(partner => 
          partner.region.toLowerCase() === region.toLowerCase()
        );
      }
      
      if (commune) {
        filteredPartners = filteredPartners.filter(partner => 
          partner.commune.toLowerCase() === commune.toLowerCase()
        );
      }
      
      // Transformar los datos para devolver solo la información pública
      const servicePoints = filteredPartners.map(partner => ({
        id: partner.id,
        storeName: partner.storeName,
        region: partner.region,
        commune: partner.commune,
        address: partner.address,
        hasInternet: partner.hasInternet,
        hasDevice: partner.hasDevice
      }));
      
      res.status(200).json(servicePoints);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Webhooks para WhatsApp
  app.post("/api/webhooks/whatsapp", async (req, res) => {
    try {
      // Procesar el webhook entrante
      const message = await whatsappService.processWebhook(req.body);
      
      if (message) {
        // Buscar o crear una sesión de Dialogflow
        let session = await storage.getDialogflowSessionByPhone(message.phoneNumber);
        
        if (!session) {
          // Buscar si el usuario existe por número de teléfono
          const user = await storage.getUserByPhone(message.phoneNumber);
          
          // Crear nueva sesión
          const sessionId = await dialogflowService.createSession(null, user?.id);
          
          // Guardar en base de datos
          session = await storage.createDialogflowSession({
            phoneNumber: message.phoneNumber,
            sessionId,
            userId: user?.id || null,
            status: 'active'
          });
        }
        
        // Procesar el mensaje con Dialogflow
        const { responseText } = await dialogflowService.processMessage(message, session);
        
        // Enviar respuesta automática
        await dialogflowService.sendResponse(message.phoneNumber, responseText, session.sessionId);
      }
      
      res.status(200).send('OK');
    } catch (error) {
      console.error('Error processing WhatsApp webhook:', error);
      res.status(500).json({ error: 'Error processing webhook' });
    }
  });
  
  // Añadir ruta directa para verificación de documentos (para compatibilidad)
  app.post('/api/documents/verify', isAuthenticated, async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ error: 'Código de verificación requerido' });
      }
      
      const result = await verifyDocument(req.user!.id, code);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  // === Rutas para videoconsultas y códigos de compra ===
  
  // Validar código de compra
  app.post("/api/validate-purchase-code", async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: "El código de compra es requerido" });
      }
      
      // En un escenario real, esto buscaría en la base de datos
      // Por ahora, aceptamos cualquier código que tenga un formato específico
      const isValidCode = /^CERFI-[A-Z0-9]{8}$/.test(code);
      
      if (!isValidCode) {
        return res.status(400).json({ error: "Código de compra inválido" });
      }
      
      // Simular detalles del servicio asociado al código
      const purchaseDetails = {
        code,
        serviceName: "Videoconsulta Legal",
        serviceType: "videoconsult",
        duration: "60 minutos",
        amount: 45000,
        currency: "CLP",
        isUsed: false,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      res.status(200).json(purchaseDetails);
    } catch (error: any) {
      res.status(500).json({ 
        error: "Error al validar el código de compra",
        message: error.message 
      });
    }
  });
  
  // Activar servicio con código de compra
  app.post("/api/activate-service", async (req, res) => {
    try {
      const { code, userId } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: "El código de compra es requerido" });
      }
      
      // En un escenario real, esto marcaría el código como usado en la base de datos
      // y activaría el servicio correspondiente para el usuario
      
      // Simular activación exitosa
      const activationDetails = {
        success: true,
        message: "Servicio activado correctamente",
        serviceType: "videoconsult",
        activationDate: new Date().toISOString(),
        userId: userId || (req.user ? req.user.id : null)
      };
      
      res.status(200).json(activationDetails);
    } catch (error: any) {
      res.status(500).json({ 
        error: "Error al activar el servicio",
        message: error.message 
      });
    }
  });
  
  // Obtener sesiones de videoconsulta (para abogados)
  app.get("/api/video-consultations", isAuthenticated, async (req, res) => {
    try {
      // En un escenario real, se obtendrían las videoconsultas del abogado desde la base de datos
      
      // Datos simulados
      const consultations = [
        { 
          id: "VC-2025-001", 
          clientName: "Maria Rodríguez", 
          scheduledFor: "2025-04-29T14:30:00", 
          status: "agendada", 
          topic: "Consulta contratos comerciales",
          duration: 30
        },
        { 
          id: "VC-2025-002", 
          clientName: "Juan Pérez", 
          scheduledFor: "2025-04-30T10:00:00", 
          status: "agendada", 
          topic: "Asesoría laboral",
          duration: 60
        },
        { 
          id: "VC-2025-003", 
          clientName: "Laura González", 
          scheduledFor: "2025-04-28T16:15:00", 
          status: "finalizada", 
          topic: "Revisión documentos inmobiliarios",
          duration: 45
        }
      ];
      
      res.status(200).json(consultations);
    } catch (error: any) {
      res.status(500).json({ 
        error: "Error al obtener las videoconsultas",
        message: error.message 
      });
    }
  });
  
  // Obtener detalles de videoconsulta específica
  app.get("/api/video-consultations/:consultationId", isAuthenticated, async (req, res) => {
    try {
      const { consultationId } = req.params;
      
      // En un escenario real, se obtendría la videoconsulta específica de la base de datos
      
      // Datos simulados
      const mockConsultations: Record<string, any> = {
        "VC-2025-001": { 
          id: "VC-2025-001", 
          clientName: "Maria Rodríguez", 
          clientEmail: "maria.rodriguez@example.com",
          clientPhone: "+56 9 1234 5678",
          scheduledFor: "2025-04-29T14:30:00", 
          status: "agendada", 
          topic: "Consulta contratos comerciales",
          duration: 30,
          notes: ""
        },
        "VC-2025-002": { 
          id: "VC-2025-002", 
          clientName: "Juan Pérez", 
          clientEmail: "juan.perez@example.com",
          clientPhone: "+56 9 8765 4321",
          scheduledFor: "2025-04-30T10:00:00", 
          status: "agendada", 
          topic: "Asesoría laboral",
          duration: 60,
          notes: ""
        },
        "VC-2025-003": { 
          id: "VC-2025-003", 
          clientName: "Laura González", 
          clientEmail: "laura.gonzalez@example.com",
          clientPhone: "+56 9 5555 5555",
          scheduledFor: "2025-04-28T16:15:00", 
          status: "finalizada", 
          topic: "Revisión documentos inmobiliarios",
          duration: 45,
          notes: "Cliente satisfecho con el servicio. Requiere seguimiento en 2 semanas."
        }
      };
      
      const consultation = mockConsultations[consultationId];
      
      if (!consultation) {
        return res.status(404).json({ error: "Videoconsulta no encontrada" });
      }
      
      res.status(200).json(consultation);
    } catch (error: any) {
      res.status(500).json({ 
        error: "Error al obtener la videoconsulta",
        message: error.message 
      });
    }
  });
  
  // Finalizar videoconsulta
  app.post("/api/video-consultations/:consultationId/end", isAuthenticated, async (req, res) => {
    try {
      const { consultationId } = req.params;
      const { notes, duration } = req.body;
      
      // En un escenario real, se actualizaría el estado de la videoconsulta en la base de datos
      
      res.status(200).json({
        success: true,
        message: "Videoconsulta finalizada correctamente",
        consultationId,
        duration: duration || 0,
        endedAt: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: "Error al finalizar la videoconsulta",
        message: error.message 
      });
    }
  });
  
  // Crear nueva videoconsulta
  app.post("/api/video-consultations", isAuthenticated, async (req, res) => {
    try {
      const { clientName, email, phone, topic, scheduledFor, duration, lawyerId } = req.body;
      
      if (!clientName || !email || !topic || !scheduledFor || !duration) {
        return res.status(400).json({ error: "Faltan datos requeridos para crear la videoconsulta" });
      }
      
      // En un escenario real, se crearía la videoconsulta en la base de datos
      
      // Generar ID único para la consulta
      const consultationId = `VC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const newConsultation = {
        id: consultationId,
        clientName,
        clientEmail: email,
        clientPhone: phone || "",
        scheduledFor,
        status: "agendada",
        topic,
        duration,
        lawyerId: lawyerId || (req.user ? req.user.id : null),
        createdAt: new Date().toISOString()
      };
      
      res.status(201).json(newConsultation);
    } catch (error: any) {
      res.status(500).json({ 
        error: "Error al crear la videoconsulta",
        message: error.message 
      });
    }
  });
  
  // Obtener documentos compartidos en una videoconsulta
  app.get("/api/video-consultations/:consultationId/documents", isAuthenticated, async (req, res) => {
    try {
      const { consultationId } = req.params;
      
      // En un escenario real, se obtendrían los documentos compartidos en la videoconsulta
      
      // Datos simulados
      const sharedDocuments = [
        {
          id: 1,
          name: "Contrato de Arrendamiento.pdf",
          type: "PDF",
          size: 2540000,
          sharedAt: "2025-04-28T16:30:25",
          sharedBy: "lawyer"
        },
        {
          id: 2,
          name: "Clausulas_Adicionales.docx",
          type: "DOCX",
          size: 1250000,
          sharedAt: "2025-04-28T16:35:12",
          sharedBy: "lawyer"
        }
      ];
      
      res.status(200).json(sharedDocuments);
    } catch (error: any) {
      res.status(500).json({ 
        error: "Error al obtener los documentos compartidos",
        message: error.message 
      });
    }
  });
  
  // Obtener estadísticas del abogado
  app.get("/api/lawyer/stats", isAuthenticated, async (req, res) => {
    try {
      // En un escenario real, se obtendrían las estadísticas del abogado desde la base de datos
      
      // Datos simulados
      const lawyerStats = {
        activeCases: 12,
        completedCasesMonth: 4,
        activeClients: 17,
        newClientsMonth: 3,
        monthlyRevenue: 2450000,
        revenueGrowth: "+12%",
        billedHours: 32,
        successRate: 92,
        clientSatisfaction: 4.8
      };
      
      res.status(200).json(lawyerStats);
    } catch (error: any) {
      res.status(500).json({ 
        error: "Error al obtener las estadísticas del abogado",
        message: error.message 
      });
    }
  });
  
  // === Fin rutas de videoconsultas y códigos de compra ===

  // Configurar WebSocket para comunicación en tiempo real
  const httpServer = createServer(app);
  
  // Configurar WebSocket en ruta específica para no interferir con HMR de Vite
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });
  
  // Gestionar conexiones WebSocket
  wss.on('connection', (ws, req) => {
    console.log('Nueva conexión WebSocket establecida');
    
    // Verificar la sesión - Nota: esto puede estar causando problemas si la sesión no está configurada correctamente
    // Por ahora, aceptamos conexiones sin verificar la sesión para solucionar el problema de pantalla en blanco
    
    // Enviar mensaje de bienvenida
    ws.send(JSON.stringify({ 
      type: 'connection',
      message: 'Conexión establecida con el servidor' 
    }));
    
    // Manejar mensajes entrantes
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Verificar el tipo de mensaje
        if (data.type === 'document_update') {
          // Notificar a todos los clientes sobre la actualización
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'document_update',
                data: data.data
              }));
            }
          });
        } else if (data.type === 'chat_message') {
          // Procesar mensaje de chat
          if (data.dialogflowSessionId) {
            // Obtener la sesión
            const session = await storage.getDialogflowSession(data.dialogflowSessionId);
            
            if (session) {
              // Procesar mensaje con Dialogflow
              const { responseText } = await dialogflowService.processMessage(
                { content: data.message, direction: 'incoming' } as any, 
                session
              );
              
              // Enviar respuesta al cliente
              ws.send(JSON.stringify({
                type: 'chat_response',
                message: responseText,
                sessionId: data.dialogflowSessionId
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error procesando mensaje WebSocket:', error);
        ws.send(JSON.stringify({ 
          type: 'error',
          message: 'Error procesando mensaje' 
        }));
      }
    });
    
    // Manejar desconexiones
    ws.on('close', () => {
      console.log('Conexión WebSocket cerrada');
    });
  });
  
  // =========== NUEVAS INTEGRACIONES ===========
  
  // ===== CHATBOT (OpenAI) =====
  app.post("/api/chatbot/message", async (req, res) => {
    try {
      const { message, documentContext } = req.body;
      const response = await handleChatbotQuery(message, documentContext);
      res.json({ response });
    } catch (error) {
      console.error("Error en el chatbot:", error);
      res.status(500).json({ message: "Error en el servicio de chatbot" });
    }
  });
  
  app.post("/api/chatbot/sentiment", isAuthenticated, async (req, res) => {
    try {
      const { text } = req.body;
      const sentiment = await analyzeSentiment(text);
      res.json(sentiment);
    } catch (error) {
      console.error("Error analizando sentimiento:", error);
      res.status(500).json({ message: "Error analizando sentimiento" });
    }
  });
  
  app.post("/api/chatbot/legal-response", async (req, res) => {
    try {
      const { query, documentContext } = req.body;
      const legalResponse = await getLegalResponse(query, documentContext);
      res.json(legalResponse);
    } catch (error) {
      console.error("Error generando respuesta legal:", error);
      res.status(500).json({ message: "Error generando respuesta legal" });
    }
  });
  
  // Nueva ruta utilizando la API_KEY_NUEVO
  app.post("/api/chatbot/analyze-document", async (req, res) => {
    try {
      const { documentText } = req.body;
      
      if (!documentText) {
        return res.status(400).json({ message: "El texto del documento es requerido" });
      }
      
      const analysis = await analyzeDocument(documentText);
      res.json(analysis);
    } catch (error) {
      console.error("Error analizando documento:", error);
      res.status(500).json({ message: "Error analizando documento" });
    }
  });
  
  // ===== VIDEO LLAMADAS (Agora) =====
  app.post("/api/video-call/token", isAuthenticated, async (req, res) => {
    try {
      const { sessionId } = req.body;
      const userId = req.user.id.toString();
      
      const tokenData = generateVideoToken(
        `session-${sessionId}`,
        userId
      );
      
      // Registrar evento de inicio de sesión de video
      await createAnalyticsEvent({
        eventType: "video_call_started",
        userId: req.user.id,
        videoCallId: parseInt(sessionId)
      });
      
      res.json(tokenData);
    } catch (error) {
      console.error("Error generando token de video:", error);
      res.status(500).json({ message: "Error al iniciar la videollamada" });
    }
  });
  
  app.post("/api/video-call/participant", isAuthenticated, async (req, res) => {
    try {
      const { channelName, userName, role } = req.body;
      
      const result = registerSessionParticipant(channelName, {
        userId: req.user.id,
        userName,
        role,
        joinTime: new Date()
      });
      
      res.status(200).json(result);
    } catch (error) {
      console.error("Error registrando participante:", error);
      res.status(500).json({ message: "Error al registrar participante" });
    }
  });
  
  app.get("/api/video-call/participants/:channelName", isAuthenticated, async (req, res) => {
    try {
      const { channelName } = req.params;
      const participants = getSessionParticipants(channelName);
      res.status(200).json(participants);
    } catch (error) {
      console.error("Error obteniendo participantes:", error);
      res.status(500).json({ message: "Error al obtener participantes" });
    }
  });
  
  app.post("/api/video-call/end-session", isAuthenticated, async (req, res) => {
    try {
      const { channelName } = req.body;
      const result = endSession(channelName);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error finalizando sesión:", error);
      res.status(500).json({ message: "Error al finalizar sesión" });
    }
  });
  
  // ===== CRM (HubSpot) =====
  app.post("/api/crm/contacts", isAdmin, async (req, res) => {
    try {
      const contactData = req.body;
      const contact = await createContact(contactData);
      res.status(201).json(contact);
    } catch (error) {
      console.error("Error CRM:", error);
      res.status(500).json({ message: "Error en integración con CRM" });
    }
  });
  
  app.patch("/api/crm/contacts/:id", isAdmin, async (req, res) => {
    try {
      const hubspotId = req.params.id;
      const contactData = req.body;
      const contact = await updateContact(hubspotId, contactData);
      res.status(200).json(contact);
    } catch (error) {
      console.error("Error CRM:", error);
      res.status(500).json({ message: "Error en integración con CRM" });
    }
  });
  
  app.post("/api/crm/deals", isAdmin, async (req, res) => {
    try {
      const dealData = req.body;
      const deal = await createDeal(dealData);
      res.status(201).json(deal);
    } catch (error) {
      console.error("Error CRM:", error);
      res.status(500).json({ message: "Error en integración con CRM" });
    }
  });
  
  app.post("/api/crm/find-contact", isAdmin, async (req, res) => {
    try {
      const { email } = req.body;
      const contact = await findContactByEmail(email);
      res.status(200).json(contact || { exists: false });
    } catch (error) {
      console.error("Error CRM:", error);
      res.status(500).json({ message: "Error en integración con CRM" });
    }
  });
  
  app.post("/api/crm/document-activity", isAuthenticated, async (req, res) => {
    try {
      const { contactId, documentTitle, action } = req.body;
      const result = await logDocumentActivity(contactId, documentTitle, action);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error CRM:", error);
      res.status(500).json({ message: "Error en integración con CRM" });
    }
  });
  
  return httpServer;
}
