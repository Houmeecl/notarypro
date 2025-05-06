import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import vecinosRoutes from "./vecinos/vecinos-routes";
import documentSignRoutes from "./vecinos/document-sign-routes";
import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { setupAuth, hashPassword } from "./auth";
import { db } from "./db";
import { users, partners } from "@shared/schema";
import { auditLogs } from "./db";
import { documentForensicsRouter } from "./document-forensics-routes";
import { identityVerificationRouter } from "./identity-verification-routes";
import { contractRouter } from "./contract-routes";
import { mercadoPagoRouter } from "./mercadopago-routes";
import { ronRouter } from "./ron-routes";
import { tuuPaymentRouter } from "./tuu-payment-routes";
import { eq } from "drizzle-orm";
import { documentManagementRouter } from "./document-management-routes";
import { notaryDocumentRouter } from "./notary-document-routes";
import { posManagementRouter } from "./pos-management-routes";
import { documentSignaturesRouter } from "./routes/document-signatures";
import { secureDocumentRouter } from "./routes/secure-document-routes";
import { qrSignatureRouter } from "./vecinos/qr-signature-routes";

// Middleware de autenticación
function isAuthenticated(req: Request, res: Response, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "No autorizado" });
}

export function registerRoutes(app: Express): Server {
  // Configuración de autenticación para la aplicación principal
  setupAuth(app);

  // Rutas específicas para Vecinos
  app.use("/api/vecinos", vecinosRoutes);
  
  // Rutas para firma de documentos de Vecinos con Zoho Sign
  app.use("/api/vecinos/document-sign", documentSignRoutes);

  // Rutas para análisis forense de documentos
  app.use("/api/document-forensics", documentForensicsRouter);

  // Rutas para verificación de identidad
  app.use("/api/identity", identityVerificationRouter);
  
  // Rutas para gestión de contratos
  app.use("/api/contracts", contractRouter);
  
  // Rutas para pagos con MercadoPago
  app.use("/api/payments", mercadoPagoRouter);
  
  // Rutas para plataforma RON
  app.use("/api/ron", ronRouter);
  
  // Rutas para pagos con Tuu Payments (POS)
  app.use("/api/tuu-payment", tuuPaymentRouter);
  
  // Sistema de Gestión Documental Unificado
  app.use("/api/document-management", documentManagementRouter);
  
  // Sistema de Documentos Notariales
  app.use("/api/notary-documents", notaryDocumentRouter);
  
  // Sistema de Gestión de Dispositivos POS
  app.use("/api/pos-management", posManagementRouter);
  
  // Sistema de firmas de documentos
  app.use("/api/documents", documentSignaturesRouter);
  
  // Ruta para el sistema de seguridad de documentos (nueva)
  app.use("/api/secure-documents", secureDocumentRouter);
  
  // Ruta para el sistema de firma con QR
  app.use("/api/qr-signature", qrSignatureRouter);
  
  // Ruta para servir archivos estáticos (documentos y contratos)
  app.use("/docs", express.static(path.join(process.cwd(), "docs")));
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Inicializar admins de prueba si no existen
  initializeTestAdmins().catch(error => {
    console.error("Error inicializando admins de prueba:", error);
  });

// Endpoint para validar códigos QA
app.post('/api/qa/validate-code', isAuthenticated, async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un código QA válido'
      });
    }
    
    // Validar el formato básico (QA-XXXXXX-XXXXXX)
    const codePattern = /^QA-[A-Z0-9]{6}-\d{6}$/;
    
    if (!codePattern.test(code)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de código QA inválido'
      });
    }
    
    // Obtener timestamp del código
    const timestamp = parseInt(code.split('-')[2]);
    const currentTime = Date.now() % 1000000; // últimos 6 dígitos
    
    // En un sistema real, aquí verificaríamos contra la base de datos
    // Para demo/QA, simplemente hacemos una validación básica
    const isValid = true;
    
    // Registrar uso del código QA (para auditoría)
    await db.execute(`
      INSERT INTO audit_logs (user_id, action_type, details, timestamp)
      VALUES ($1, $2, $3, $4)
    `, [
      req.user?.id, 
      'qa_code_used', 
      JSON.stringify({
        code,
        userAgent: req.headers['user-agent'],
        ip: req.ip
      }),
      new Date()
    ]);
    
    res.json({
      success: true,
      isValid,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
      permissions: {
        skipIdentityVerification: false, // Forzar validaciones en modo real
        skipSignatureValidation: false, // Forzar validaciones en modo real
        skipNfcValidation: false, // Forzar validaciones en modo real
        allowAllFunctionality: true,
        forceRealMode: true // Forzar modo real
      }
    });
    
  } catch (error) {
    console.error('Error al validar código QA:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud'
    });
  }
});


  // Crea el servidor HTTP
  const httpServer = createServer(app);

  // Configura WebSocket en una ruta específica
  // Usar una ruta diferente para evitar conflictos con HMR de Vite
  const wss = new WebSocketServer({ server: httpServer, path: '/api/websocket' });

  wss.on('connection', (ws) => {
    console.log('Nueva conexión WebSocket establecida');

    // Manejar mensajes recibidos
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Mensaje recibido:', data);

        // Responder con un eco
        ws.send(JSON.stringify({
          type: 'echo',
          data: data,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Error al procesar mensaje WebSocket:', error);
      }
    });

    // Manejar cierre de conexión
    ws.on('close', () => {
      console.log('Conexión WebSocket cerrada');
    });

    // Manejar errores
    ws.on('error', (error) => {
      console.error('Error en conexión WebSocket:', error);
    });

    // Enviar mensaje de bienvenida
    ws.send(JSON.stringify({
      type: 'welcome',
      message: 'Conexión establecida con el servidor de NotaryPro',
      timestamp: new Date().toISOString()
    }));
  });

  return httpServer;
}

// Función para inicializar admins de prueba
async function initializeTestAdmins() {
  // Admin principal (Edward)
  try {
    const [existingEdwardAdmin] = await db.select().from(users).where(
      eq(users.username, "Edwardadmin")
    );

    if (existingEdwardAdmin) {
      console.log("El administrador Edwardadmin ya existe. Actualizando contraseña...");
      // Hash la contraseña usando la función del módulo de autenticación
      const hashedPassword = await hashPassword("adminq");
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.username, "Edwardadmin"));
      console.log("Contraseña del administrador Edwardadmin actualizada.");
    } else {
      await db.insert(users).values({
        username: "Edwardadmin",
        password: "adminq",
        email: "admin@notarypro.cl",
        fullName: "Admin Principal",
        role: "admin",
        createdAt: new Date()
      });
      console.log("Super admin inicializado correctamente");
    }

    // Admin secundario (Seba)
    const [existingSebAdmin] = await db.select().from(users).where(
      eq(users.username, "Sebadmin")
    );

    if (existingSebAdmin) {
      console.log("El administrador Sebadmin ya existe. Actualizando contraseña...");
      const hashedPassword = await hashPassword("admin123");
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.username, "Sebadmin"));
      console.log("Contraseña del administrador Sebadmin actualizada.");
    } else {
      const hashedPassword = await hashPassword("admin123");
      await db.insert(users).values({
        username: "Sebadmin",
        password: hashedPassword,
        email: "sebadmin@notarypro.cl",
        fullName: "Admin Secundario",
        role: "admin",
        createdAt: new Date()
      });
      console.log("Admin Sebadmin inicializado correctamente");
    }

    // Admin NFC (para pruebas de NFC)
    const [existingNfcAdmin] = await db.select().from(users).where(
      eq(users.username, "nfcadmin")
    );

    if (!existingNfcAdmin) {
      const hashedPassword = await hashPassword("nfc123");
      await db.insert(users).values({
        username: "nfcadmin",
        password: hashedPassword,
        email: "nfc@notarypro.cl",
        fullName: "Admin NFC",
        role: "admin",
        createdAt: new Date()
      });
      console.log("Admin NFC inicializado correctamente");
    }

    // Admin para VecinoXpress
    const [existingVecinosAdmin] = await db.select().from(users).where(
      eq(users.username, "vecinosadmin")
    );

    if (existingVecinosAdmin) {
      console.log("El administrador vecinosadmin ya existe. Actualizando contraseña...");
      const hashedPassword = await hashPassword("vecinos123");
      await db.update(users)
        .set({ password: hashedPassword, platform: "vecinos" })
        .where(eq(users.username, "vecinosadmin"));
      console.log("Contraseña del administrador vecinosadmin actualizada.");
    } else {
      const hashedPassword = await hashPassword("vecinos123");
      await db.insert(users).values({
        username: "vecinosadmin",
        password: hashedPassword,
        email: "admin@vecinoxpress.cl",
        fullName: "Admin VecinoXpress",
        role: "admin",
        platform: "vecinos",
        createdAt: new Date()
      });
      console.log("Admin VecinoXpress inicializado correctamente");
    }
    
    // Nuevo administrador personalizado
    const [existingCustomAdmin] = await db.select().from(users).where(
      eq(users.username, "miadmin")
    );

    if (existingCustomAdmin) {
      console.log("El administrador miadmin ya existe. Actualizando contraseña...");
      const hashedPassword = await hashPassword("miadmin123");
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.username, "miadmin"));
      console.log("Contraseña del administrador miadmin actualizada.");
    } else {
      const hashedPassword = await hashPassword("miadmin123");
      await db.insert(users).values({
        username: "miadmin",
        password: hashedPassword,
        email: "miadmin@notarypro.cl",
        fullName: "Mi Administrador",
        role: "admin",
        createdAt: new Date()
      });
      console.log("Administrador miadmin inicializado correctamente");
    }
    
    // Crear usuario evenegas (administrador principal con acceso completo)
    const [existingEvenegas] = await db.select().from(users).where(
      eq(users.username, "evenegas")
    );
    
    if (existingEvenegas) {
      console.log("El usuario evenegas ya existe. Actualizando contraseña...");
      // Problema: hashPassword devuelve una promesa, no un string directo
      const evenegasPassword = "77239800"; // Contraseña en texto plano
      const evenegasHashedPassword = await hashPassword(evenegasPassword);
      
      console.log("Actualizando usuario evenegas con hash:", evenegasHashedPassword);
      
      await db.update(users)
        .set({ 
          password: evenegasHashedPassword, 
          role: "admin", 
          fullName: "CEO NotaryPro",
          email: "evenegas@notarypro.cl"
        })
        .where(eq(users.username, "evenegas"));
      console.log("Credenciales del usuario evenegas actualizadas.");
    } else {
      const evenegasPassword = "77239800"; // Contraseña en texto plano
      const evenegasHashedPassword = await hashPassword(evenegasPassword);
      
      console.log("Creando usuario evenegas con hash:", evenegasHashedPassword);
      
      await db.insert(users).values({
        username: "evenegas",
        password: evenegasHashedPassword,
        email: "evenegas@notarypro.cl",
        fullName: "CEO NotaryPro",
        role: "admin",
        createdAt: new Date()
      });
      console.log("Usuario evenegas (CEO) creado correctamente.");
    }
    
    // Usuario demo partner para VecinoXpress
    const [existingDemoPartner] = await db.select().from(users).where(
      eq(users.username, "demopartner")
    );

    if (existingDemoPartner) {
      console.log("El usuario demopartner ya existe. Actualizando contraseña...");
      const hashedPassword = await hashPassword("password123");
      await db.update(users)
        .set({ password: hashedPassword, platform: "vecinos", role: "partner" })
        .where(eq(users.username, "demopartner"));
      console.log("Credenciales del usuario demopartner actualizadas.");
    } else {
      // Crear usuario demopartner
      const hashedPassword = await hashPassword("password123");
      const [newUser] = await db.insert(users).values({
        username: "demopartner",
        password: hashedPassword,
        email: "demo@vecinoxpress.cl",
        fullName: "Demo Partner",
        role: "partner",
        platform: "vecinos",
        createdAt: new Date()
      }).returning();
      
      // Vamos a actualizar esta parte para enfocarnos en las credenciales primero
      console.log("Usuario partner creado, ahora puedes iniciar sesión con demopartner/password123");
      
      console.log("Usuario demo partner inicializado correctamente");
    }
  } catch (error) {
    console.error("Error inicializando admins:", error);
  }
}