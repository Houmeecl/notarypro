import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import vecinosRoutes from "./vecinos/vecinos-routes";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { setupAuth } from "./auth";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // Configuración de autenticación para la aplicación principal
  setupAuth(app);

  // Rutas específicas para Vecinos
  app.use("/api/vecinos", vecinosRoutes);

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
      await db.update(users)
        .set({ password: "adminq" })
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
      await db.update(users)
        .set({ password: "admin123" })
        .where(eq(users.username, "Sebadmin"));
      console.log("Contraseña del administrador Sebadmin actualizada.");
    } else {
      await db.insert(users).values({
        username: "Sebadmin",
        password: "admin123",
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
      await db.insert(users).values({
        username: "nfcadmin",
        password: "nfc123",
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
      await db.update(users)
        .set({ password: "vecinos123", platform: "vecinos" })
        .where(eq(users.username, "vecinosadmin"));
      console.log("Contraseña del administrador vecinosadmin actualizada.");
    } else {
      await db.insert(users).values({
        username: "vecinosadmin",
        password: "vecinos123",
        email: "admin@vecinoxpress.cl",
        fullName: "Admin VecinoXpress",
        role: "admin",
        platform: "vecinos",
        createdAt: new Date()
      });
      console.log("Admin VecinoXpress inicializado correctamente");
    }
    
    // Usuario demo partner para VecinoXpress
    const [existingDemoPartner] = await db.select().from(users).where(
      eq(users.username, "demopartner")
    );

    if (existingDemoPartner) {
      console.log("El usuario demopartner ya existe. Actualizando contraseña...");
      await db.update(users)
        .set({ password: "password123", platform: "vecinos", role: "partner" })
        .where(eq(users.username, "demopartner"));
      console.log("Credenciales del usuario demopartner actualizadas.");
    } else {
      // Crear usuario demopartner
      const [newUser] = await db.insert(users).values({
        username: "demopartner",
        password: "password123",
        email: "demo@vecinoxpress.cl",
        fullName: "Demo Partner",
        role: "partner",
        platform: "vecinos",
        createdAt: new Date()
      }).returning();
      
      // Verificar si ya existe el perfil de socio
      const [existingPartner] = await db.select().from(partners).where(
        eq(partners.userId, newUser.id)
      );
      
      // Crear perfil de socio si no existe
      if (!existingPartner) {
        await db.insert(partners).values({
          userId: newUser.id,
          storeName: "Minimarket El Sol",
          managerName: "John Doe",
          region: "Metropolitana",
          commune: "Providencia",
          address: "Av. Providencia 1234, Santiago",
          phone: "+56 9 1234 5678",
          email: "demo@vecinoxpress.cl",
          hasInternet: true,
          hasDevice: true,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      console.log("Usuario demo partner inicializado correctamente");
    }
  } catch (error) {
    console.error("Error inicializando admins:", error);
  }
}