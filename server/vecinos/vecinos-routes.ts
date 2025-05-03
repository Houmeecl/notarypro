import { Router, Request, Response } from "express";
import { db } from "../db";
import { eq, and } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { users, partnerProfiles, documents, transactions } from "@shared/schema-separation";

export const vecinosRouter = Router();
const scryptAsync = promisify(scrypt);

// Middleware de autenticación específico para socios Vecinos
function isAuthenticated(req: Request, res: Response, next: any) {
  const token = req.headers.authorization?.split(" ")[1] || 
                req.cookies?.vecinos_token;
  
  if (!token) {
    return res.status(401).json({ message: "No se proporcionó token de autenticación" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vecinos_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}

// Middleware para verificar permisos de socio
function isPartner(req: Request, res: Response, next: any) {
  if (req.user.role !== 'partner') {
    return res.status(403).json({ message: "Acceso denegado, se requiere rol de socio" });
  }
  next();
}

// Login para socios Vecinos
vecinosRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    console.log("Intento de login con:", { username, password });
    
    if (!username || !password) {
      return res.status(400).json({ message: "Se requiere nombre de usuario y contraseña" });
    }
    
    // Buscar usuario con rol de socio y plataforma vecinos
    const partner = await db.query.users.findFirst({
      where: and(
        eq(users.username, username),
        eq(users.role, 'partner'),
        eq(users.platform, 'vecinos')
      )
    });
    
    console.log("Socio encontrado:", partner?.username, ", verificando contraseña");
    
    if (!partner) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }
    
    // Verificar contraseña
    const [hashedPassword, salt] = partner.password.split('.');
    const hashedBuffer = Buffer.from(hashedPassword, 'hex');
    const suppliedBuffer = await scryptAsync(password, salt, 64) as Buffer;
    
    const passwordMatch = timingSafeEqual(hashedBuffer, suppliedBuffer);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }
    
    console.log("Contraseña correcta, generando token para:", partner.username);
    
    // Obtener detalles del perfil del socio
    const partnerProfile = await db.query.partnerProfiles.findFirst({
      where: eq(partnerProfiles.userId, partner.id)
    });
    
    if (!partnerProfile) {
      return res.status(404).json({ message: "Perfil de socio no encontrado" });
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { 
        id: partner.id, 
        username: partner.username, 
        role: partner.role,
        platform: partner.platform 
      }, 
      process.env.JWT_SECRET || 'vecinos_secret_key',
      { expiresIn: '24h' }
    );
    
    console.log("Login exitoso para:", partner.username);
    
    // Combinar datos del usuario y perfil
    const userData = {
      id: partner.id,
      username: partner.username,
      storeName: partnerProfile.storeName,
      storeAddress: partnerProfile.storeAddress,
      storeCode: partnerProfile.storeCode,
      balance: partnerProfile.balance,
      token
    };
    
    // Establecer cookie para el navegador
    res.cookie('vecinos_token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.status(200).json(userData);
  } catch (error: any) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Obtener información del socio
vecinosRouter.get("/partner-info", isAuthenticated, isPartner, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    // Buscar perfil de socio
    const partnerProfile = await db.query.partnerProfiles.findFirst({
      where: eq(partnerProfiles.userId, userId)
    });
    
    if (!partnerProfile) {
      return res.status(404).json({ message: "Perfil de socio no encontrado" });
    }
    
    // Contar documentos gestionados por el socio
    const partnerDocuments = await db.query.documents.findMany({
      where: eq(documents.partnerId, userId)
    });
    
    const totalDocuments = partnerDocuments.length;
    const pendingDocuments = partnerDocuments.filter(doc => 
      doc.status === 'pending' || doc.status === 'processing'
    ).length;
    
    // Buscar información de usuario
    const partnerUser = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    
    if (!partnerUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    // Devolver información combinada
    const partnerInfo = {
      id: partnerUser.id,
      username: partnerUser.username,
      storeName: partnerProfile.storeName,
      storeAddress: partnerProfile.storeAddress,
      storeCode: partnerProfile.storeCode,
      balance: partnerProfile.balance,
      totalDocuments,
      pendingDocuments,
      lastLogin: partnerUser.updatedAt || partnerUser.createdAt
    };
    
    res.status(200).json(partnerInfo);
  } catch (error: any) {
    console.error("Error al obtener info del socio:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Registrar nueva transacción
vecinosRouter.post("/transactions", isAuthenticated, isPartner, async (req: Request, res: Response) => {
  try {
    const { amount, type, documentId, paymentMethod } = req.body;
    const partnerId = req.user.id;
    
    // Validar datos
    if (!amount || !type) {
      return res.status(400).json({ message: "Se requiere monto y tipo de transacción" });
    }
    
    // Calcular comisión (ejemplo: 5%)
    const commissionRate = 5;
    const platformFee = Math.round((amount * commissionRate) / 100);
    const partnerAmount = amount - platformFee;
    
    // Crear nueva transacción
    const newTransaction = await db.insert(transactions).values({
      amount,
      type,
      partnerId,
      documentId,
      platformFee,
      commissionAmount: partnerAmount,
      status: 'completed',
      paymentMethod,
    }).returning();
    
    // Actualizar balance del socio
    if (type === 'payment') {
      await db.update(partnerProfiles)
        .set({ 
          balance: db.sql`${partnerProfiles.balance} + ${partnerAmount}`
        })
        .where(eq(partnerProfiles.userId, partnerId));
    }
    
    res.status(201).json(newTransaction[0]);
  } catch (error: any) {
    console.error("Error al registrar transacción:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Cerrar sesión
vecinosRouter.post("/logout", (req: Request, res: Response) => {
  res.clearCookie('vecinos_token');
  res.status(200).json({ message: "Sesión cerrada correctamente" });
});

// Otras rutas específicas para Vecinos...

export default vecinosRouter;