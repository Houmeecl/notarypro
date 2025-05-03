import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { users, userPlatformEnum } from "@shared/schema-separation";
import { vecinosRouter } from "./vecinos/vecinos-routes";
import { notaryproRouter } from "./notarypro/notarypro-routes";
import { identityApiRouter } from "./identity-api-routes";
import { ronRouter } from "./ron-routes";
import { getApiRouter } from "./getapi-routes";
import { mercadoPagoRouter } from "./mercadopago-routes";
import { WebSocketServer } from "ws";
import { setupAuth } from "./auth";

// Middlewares de verificación de plataforma
function checkVecinosPlatform(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (req.user.platform !== "vecinos") {
    return res.status(403).json({ message: "Forbidden: This endpoint is only for Vecinos platform" });
  }
  
  next();
}

function checkNotaryProPlatform(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (req.user.platform !== "notarypro") {
    return res.status(403).json({ message: "Forbidden: This endpoint is only for NotaryPro platform" });
  }
  
  next();
}

// Función principal que registra las rutas separadas por plataforma
export async function registerRoutes(app: Express): Promise<Server> {
  // Configuración de autenticación compartida
  setupAuth(app);
  
  // Rutas específicas para Vecinos
  app.use("/api/vecinos", vecinosRouter);
  
  // Rutas específicas para NotaryPro
  app.use("/api/notarypro", notaryproRouter);
  
  // Rutas compartidas (con verificación de plataforma cuando sea necesario)
  app.use("/api/identity", identityApiRouter);
  app.use("/api/ron", ronRouter);
  app.use("/api/identity-verification", getApiRouter);
  app.use("/api/payments", mercadoPagoRouter);
  
  // Endpoint para verificar el estado de la plataforma
  app.get("/api/platform-status", (req, res) => {
    const platformInfo = {
      vecinos: {
        status: "active",
        version: "1.3.1"
      },
      notarypro: {
        status: "active",
        version: "2.0.5"
      }
    };
    
    res.json(platformInfo);
  });
  
  // Creación del servidor HTTP
  const httpServer = createServer(app);
  
  // Configuración de WebSocket para comunicación en tiempo real
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('Nueva conexión WebSocket establecida');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Aquí se puede manejar mensajes específicos por plataforma
        if (data.platform === 'vecinos') {
          // Lógica para mensajes de Vecinos
        } else if (data.platform === 'notarypro') {
          // Lógica para mensajes de NotaryPro
        }
      } catch (err) {
        console.error('Error al procesar mensaje WebSocket:', err);
      }
    });
    
    ws.on('close', () => {
      console.log('Conexión WebSocket cerrada');
    });
  });
  
  return httpServer;
}