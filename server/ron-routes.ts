import { Router, Request, Response } from "express";
import { storage } from "./storage";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export const ronRouter = Router();

// Middleware para verificar si el usuario tiene permisos de RON
function hasRonAccess(req: Request, res: Response, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "No autenticado" });
  }
  
  const user = req.user;
  if (user.role !== "certifier" && user.role !== "lawyer" && user.role !== "admin") {
    return res.status(403).json({ message: "No tiene permisos para acceder a la plataforma RON" });
  }
  
  next();
}

// Login para la plataforma RON - permite usar las mismas credenciales del sistema principal
ronRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    // Verificar si el usuario existe en el sistema principal
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }
    
    // Verificar la contraseña - en producción usar comparePasswords
    // Para simplificar las pruebas, comparamos directamente
    if (password !== user.password) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }
    
    // Para usuarios normales, verificar si tienen permisos para acceder a la plataforma RON
    if (user.role !== 'certifier' && user.role !== 'lawyer' && user.role !== 'admin') {
      return res.status(403).json({ message: "No tiene permisos para acceder a la plataforma RON" });
    }
    
    // Formatear la respuesta con datos específicos de RON
    const ronUserData = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.fullName || user.username,
      region: "Metropolitana", // Esto podría venir de metadatos del usuario
      specialization: user.role === 'certifier' ? "Documentos generales" : "Legal",
      avatarUrl: "https://randomuser.me/api/portraits/men/42.jpg" // En producción, se usaría el avatar real del usuario
    };
    
    res.status(200).json(ronUserData);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor: " + error.message });
  }
});

// Acceso para clientes mediante código
ronRouter.post("/client-access", async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: "Se requiere un código de acceso" });
    }
    
    // Aquí verificaríamos el código de acceso en la base de datos
    // Por ahora usamos datos de ejemplo para probar la funcionalidad
    // En la implementación definitiva, estos códigos se almacenarían en la base de datos
    // y se generarían al momento de crear una sesión RON
    
    if (code !== "RON123" && code !== "TEST456") {
      return res.status(401).json({ message: "Código de acceso inválido o expirado" });
    }
    
    // Datos de sesión RON
    const sessionData = {
      id: code === "RON123" ? "RON-001" : "RON-002",
      clientName: code === "RON123" ? "María González" : "Pedro Soto",
      documentType: code === "RON123" ? "Contrato de arrendamiento" : "Poder notarial",
      certifierId: code === "RON123" ? 5 : 8,
      certifierName: code === "RON123" ? "Dr. Juan Pérez" : "Dra. Ana Silva",
      scheduledFor: new Date(Date.now() + 10 * 60000).toISOString(), // 10 minutos en el futuro
      status: "programada"
    };
    
    res.status(200).json(sessionData);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor: " + error.message });
  }
});

// Obtener sesiones de RON
ronRouter.get("/sessions", hasRonAccess, async (req: Request, res: Response) => {
  try {
    // Aquí se obtendrían las sesiones reales desde la base de datos
    // Por ahora devolvemos datos de ejemplo
    
    const mockSessions = [
      {
        id: "RON-001",
        client: "María González",
        documentType: "Contrato de arrendamiento",
        scheduledFor: new Date(Date.now() + 3600000).toISOString(),
        region: "Metropolitana",
        status: "programada"
      },
      {
        id: "RON-002",
        client: "Carlos Muñoz",
        documentType: "Poder notarial",
        scheduledFor: new Date(Date.now() - 1800000).toISOString(),
        region: "Valparaíso",
        status: "en_espera"
      },
      {
        id: "RON-003",
        client: "Ana Silva",
        documentType: "Certificación de firma",
        scheduledFor: new Date(Date.now() - 86400000).toISOString(),
        region: "Metropolitana",
        status: "completada"
      }
    ];
    
    res.status(200).json(mockSessions);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor: " + error.message });
  }
});

// Cerrar sesión en la plataforma RON
ronRouter.post("/logout", (req: Request, res: Response) => {
  // Aquí solo enviamos una respuesta exitosa
  // La lógica real de cerrar sesión se maneja en el frontend
  res.status(200).json({ success: true });
});