import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import vecinosRoutes from "./vecinos/vecinos-routes";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { setupAuth, hashPassword } from "./auth";
import { db } from "./db";
import { users, partners } from "@shared/schema";
import { documentForensicsRouter } from "./document-forensics-routes";
import { identityVerificationRouter } from "./identity-verification-routes";
import { contractRouter } from "./contract-routes";
import { mercadoPagoRouter } from "./mercadopago-routes";
import { ronRouter } from "./ron-routes";
import { tuuPaymentRouter } from "./tuu-payment-routes";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // Configuración de autenticación para la aplicación principal
  setupAuth(app);

  // Rutas específicas para Vecinos
  app.use("/api/vecinos", vecinosRoutes);

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
  
  // Ruta para servir archivos estáticos (como los contratos)
  app.use("/docs", express.static(path.join(process.cwd(), "docs")));

  // Inicializar admins de prueba si no existen
  initializeTestAdmins().catch(error => {
    console.error("Error inicializando admins de prueba:", error);
  });

  // Crea el servidor HTTP
  const httpServer = createServer(app);

  // Configura WebSocket en una ruta específica
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

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