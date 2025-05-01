import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "./db";
import { 
  partners, documents, partnerTransactions, 
  withdrawalRequests, partnerNotifications,
  type Partner, type Document, type PartnerTransaction
} from "@shared/vecinos-schema";
import { and, eq, like, desc } from "drizzle-orm";
import { z } from "zod";

// Crear router para rutas de Vecinos Xpress
export const vecinosRouter = Router();

// Tipo para los datos en el token JWT
interface VecinosTokenPayload {
  id: number;
  username: string;
  storeName: string;
  role: string;
}

// Extender Express.Request para tener el tipo correcto
declare module "express-serve-static-core" {
  interface Request {
    vecinosUser?: VecinosTokenPayload;
  }
}

// Middleware para verificar autenticación de socio
export function isPartnerAuthenticated(req: Request, res: Response, next: any) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      // También verificar token en cookies para apps móviles
      const cookieToken = req.cookies?.vecinos_token;
      if (!cookieToken) {
        return res.status(401).json({ message: "No se proporcionó token de autenticación" });
      }
      
      const decoded = jwt.verify(cookieToken, process.env.JWT_SECRET || "vecinos-xpress-secret") as VecinosTokenPayload;
      req.vecinosUser = decoded;
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "vecinos-xpress-secret") as VecinosTokenPayload;
    req.vecinosUser = decoded;
    next();
  } catch (error) {
    console.error("Error en verificación de token:", error);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}

// Esquema para validación de login
const loginSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

// Ruta de inicio de sesión para socios
vecinosRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { username, password } = validatedData;
    
    // Buscar el socio en la base de datos
    const [partner] = await db.select().from(partners).where(eq(partners.username, username));
    
    if (!partner) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }
    
    // Verificar contraseña (aquí deberías usar bcrypt en producción)
    if (partner.password !== password) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { 
        id: partner.id, 
        username: partner.username,
        storeName: partner.storeName,
        role: "partner"
      },
      process.env.JWT_SECRET || "vecinos-xpress-secret",
      { expiresIn: "7d" }
    );
    
    // Establecer cookie para aplicaciones móviles
    res.cookie("vecinos_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });
    
    // Actualizar fecha de último login
    await db.update(partners)
      .set({ lastLoginAt: new Date() })
      .where(eq(partners.id, partner.id));
    
    // Devolver información del socio y token
    return res.status(200).json({
      id: partner.id,
      username: partner.username,
      storeName: partner.storeName,
      email: partner.email,
      token
    });
  } catch (error) {
    console.error("Error en login de socio:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Datos de inicio de sesión inválidos", errors: error.errors });
    }
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Esquema para validación de registro
const registrationSchema = z.object({
  storeName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  businessType: z.string().min(1, "Selecciona un tipo de negocio"),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  city: z.string().min(2, "La ciudad es requerida"),
  phone: z.string().min(8, "El teléfono debe tener al menos 8 dígitos"),
  email: z.string().email("Correo electrónico inválido"),
  ownerName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  ownerRut: z.string().min(8, "RUT inválido"),
  ownerPhone: z.string().min(8, "El teléfono debe tener al menos 8 dígitos"),
  bankName: z.string().optional(),
  accountType: z.string().optional(),
  accountNumber: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "Debes aceptar los términos y condiciones",
  }),
});

// Ruta para registro de nuevos socios
vecinosRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const validatedData = registrationSchema.parse(req.body);
    
    // Verificar si ya existe un socio con ese email
    const [existingPartner] = await db.select().from(partners).where(eq(partners.email, validatedData.email));
    
    if (existingPartner) {
      return res.status(400).json({ message: "Ya existe un socio registrado con ese email" });
    }
    
    // Generar nombre de usuario basado en el nombre del negocio
    const baseUsername = validatedData.storeName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") // Eliminar caracteres especiales
      .substring(0, 10); // Limitar longitud
    
    // Verificar si el nombre de usuario base ya existe
    const [userWithSameUsername] = await db.select()
      .from(partners)
      .where(like(partners.username, `${baseUsername}%`));
    
    // Si existe, agregar un número aleatorio
    const username = userWithSameUsername 
      ? `${baseUsername}${Math.floor(Math.random() * 1000)}`
      : baseUsername;
    
    // Generar contraseña aleatoria temporal
    const tempPassword = Math.random().toString(36).substring(2, 10);
    
    // Registrar el nuevo socio (pendiente de aprobación)
    const [newPartner] = await db.insert(partners).values({
      username,
      password: tempPassword, // En producción, esto debería estar hasheado con bcrypt
      storeName: validatedData.storeName,
      businessType: validatedData.businessType,
      address: validatedData.address,
      city: validatedData.city,
      phone: validatedData.phone,
      email: validatedData.email,
      ownerName: validatedData.ownerName,
      ownerRut: validatedData.ownerRut,
      ownerPhone: validatedData.ownerPhone,
      bankName: validatedData.bankName || null,
      accountType: validatedData.accountType || null,
      accountNumber: validatedData.accountNumber || null,
      commissionRate: 20, // Tasa de comisión por defecto (20%)
      status: "pending", // Pendiente de aprobación
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    // Aquí en producción deberías enviar un email con las credenciales
    
    return res.status(201).json({
      message: "Solicitud de registro recibida correctamente",
      partnerId: newPartner.id,
      username,
      // No enviamos la contraseña en la respuesta por seguridad
    });
  } catch (error) {
    console.error("Error en registro de socio:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Datos de registro inválidos", errors: error.errors });
    }
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Ruta para obtener información del socio autenticado
vecinosRouter.get("/partner-info", isPartnerAuthenticated, async (req: Request, res: Response) => {
  try {
    const partnerId = req.vecinosUser!.id;
    
    // Buscar el socio en la base de datos
    const [partner] = await db.select().from(partners).where(eq(partners.id, partnerId));
    
    if (!partner) {
      return res.status(404).json({ message: "Socio no encontrado" });
    }
    
    // Devolver información del socio (sin la contraseña)
    return res.status(200).json({
      id: partner.id,
      storeName: partner.storeName,
      ownerName: partner.ownerName,
      address: partner.address,
      phone: partner.phone,
      email: partner.email,
      plan: partner.businessType,
      commissionRate: partner.commissionRate,
      balance: partner.balance,
      avatarUrl: partner.avatarUrl
    });
  } catch (error) {
    console.error("Error al obtener información del socio:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Ruta para obtener documentos del socio
vecinosRouter.get("/documents", isPartnerAuthenticated, async (req: Request, res: Response) => {
  try {
    const partnerId = req.vecinosUser!.id;
    
    // Buscar documentos del socio ordenados por fecha de creación (más recientes primero)
    const partnerDocuments = await db.select()
      .from(documents)
      .where(eq(documents.partnerId, partnerId))
      .orderBy(desc(documents.createdAt));
    
    return res.status(200).json(partnerDocuments);
  } catch (error) {
    console.error("Error al obtener documentos del socio:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Ruta para obtener transacciones del socio
vecinosRouter.get("/transactions", isPartnerAuthenticated, async (req: Request, res: Response) => {
  try {
    const partnerId = req.vecinosUser!.id;
    
    // Buscar transacciones del socio ordenadas por fecha (más recientes primero)
    const partnerTransactionsList = await db.select()
      .from(partnerTransactions)
      .where(eq(partnerTransactions.partnerId, partnerId))
      .orderBy(desc(partnerTransactions.createdAt));
    
    return res.status(200).json(partnerTransactionsList);
  } catch (error) {
    console.error("Error al obtener transacciones del socio:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Esquema para validación de procesamiento de documento
const processDocumentSchema = z.object({
  documentType: z.string().min(1, "El tipo de documento es requerido"),
  clientInfo: z.object({
    name: z.string().min(3, "El nombre del cliente es requerido"),
    rut: z.string().min(8, "RUT del cliente inválido"),
    phone: z.string().min(8, "Teléfono del cliente inválido"),
    email: z.string().email("Email inválido").optional(),
  })
});

// Ruta para procesar un nuevo documento
vecinosRouter.post("/process-document", isPartnerAuthenticated, async (req: Request, res: Response) => {
  try {
    const partnerId = req.vecinosUser!.id;
    const data = processDocumentSchema.parse(req.body);
    
    // Obtener información del socio
    const [partner] = await db.select().from(partners).where(eq(partners.id, partnerId));
    
    if (!partner) {
      return res.status(404).json({ message: "Socio no encontrado" });
    }
    
    // Definir precios según el tipo de documento (ejemplo)
    const documentPrices: { [key: string]: number } = {
      "contrato-arriendo": 4900,
      "contrato-trabajo": 3900,
      "autorizacion-viaje": 5900,
      "finiquito": 4500,
      "certificado-residencia": 3500,
      "declaracion-jurada": 3900,
      "poder-simple": 3800,
      "certificado-nacimiento": 3200,
    };
    
    // Obtener nombre y precio del documento
    const documentPrice = documentPrices[data.documentType] || 3500; // Precio por defecto
    let documentTitle = "Documento";
    
    switch (data.documentType) {
      case "contrato-arriendo": documentTitle = "Contrato de Arriendo"; break;
      case "contrato-trabajo": documentTitle = "Contrato de Trabajo"; break;
      case "autorizacion-viaje": documentTitle = "Autorización de Viaje"; break;
      case "finiquito": documentTitle = "Finiquito"; break;
      case "certificado-residencia": documentTitle = "Certificado de Residencia"; break;
      case "declaracion-jurada": documentTitle = "Declaración Jurada"; break;
      case "poder-simple": documentTitle = "Poder Simple"; break;
      case "certificado-nacimiento": documentTitle = "Certificado de Nacimiento"; break;
      default: documentTitle = "Documento General";
    }
    
    // Generar código de verificación único
    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Calcular comisión del socio
    const commissionRate = partner.commissionRate || 20; // Porcentaje de comisión (por defecto 20%)
    const commissionAmount = Math.round(documentPrice * (commissionRate / 100));
    
    // Registrar el documento
    const [newDocument] = await db.insert(documents).values({
      title: documentTitle,
      type: data.documentType,
      price: documentPrice,
      status: "completed",
      partnerId: partnerId,
      clientName: data.clientInfo.name,
      clientRut: data.clientInfo.rut,
      clientPhone: data.clientInfo.phone,
      clientEmail: data.clientInfo.email || null,
      verificationCode: verificationCode,
      commissionRate: commissionRate,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    // Registrar la transacción (comisión del socio)
    const [newTransaction] = await db.insert(partnerTransactions).values({
      partnerId: partnerId,
      documentId: newDocument.id,
      amount: commissionAmount,
      type: "commission",
      status: "completed",
      description: `Comisión por ${documentTitle}`,
      createdAt: new Date(),
    }).returning();
    
    // Actualizar el balance del socio
    await db
      .update(partners)
      .set({ 
        balance: partner.balance + commissionAmount,
        updatedAt: new Date()
      })
      .where(eq(partners.id, partnerId));
    
    // Crear notificación para el socio
    await db.insert(partnerNotifications).values({
      partnerId: partnerId,
      title: "Nuevo documento procesado",
      message: `Has procesado un ${documentTitle} con éxito. Comisión: $${commissionAmount}`,
      type: "success",
      createdAt: new Date(),
    });
    
    // Devolver resultado del proceso
    return res.status(200).json({
      success: true,
      documentId: newDocument.id,
      verificationCode: verificationCode,
      clientName: data.clientInfo.name,
      timestamp: new Date().toISOString(),
      commission: commissionAmount
    });
  } catch (error) {
    console.error("Error al procesar documento:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Datos inválidos", errors: error.errors });
    }
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Esquema para validación de solicitud de retiro
const withdrawalRequestSchema = z.object({
  amount: z.number().min(5000, "El monto mínimo de retiro es $5.000"),
  bankName: z.string().min(1, "El banco es requerido"),
  accountType: z.string().min(1, "El tipo de cuenta es requerido"),
  accountNumber: z.string().min(5, "El número de cuenta es requerido"),
});

// Ruta para solicitar un retiro de comisiones
vecinosRouter.post("/withdrawal-request", isPartnerAuthenticated, async (req: Request, res: Response) => {
  try {
    const partnerId = req.vecinosUser!.id;
    const data = withdrawalRequestSchema.parse(req.body);
    
    // Obtener información del socio
    const [partner] = await db.select().from(partners).where(eq(partners.id, partnerId));
    
    if (!partner) {
      return res.status(404).json({ message: "Socio no encontrado" });
    }
    
    // Verificar que tenga saldo suficiente
    if (partner.balance < data.amount) {
      return res.status(400).json({ 
        message: "Saldo insuficiente", 
        balance: partner.balance 
      });
    }
    
    // Registrar la solicitud de retiro
    const [newWithdrawal] = await db.insert(withdrawalRequests).values({
      partnerId: partnerId,
      amount: data.amount,
      bankName: data.bankName,
      accountType: data.accountType,
      accountNumber: data.accountNumber,
      status: "pending",
      createdAt: new Date(),
    }).returning();
    
    // Crear notificación para el socio
    await db.insert(partnerNotifications).values({
      partnerId: partnerId,
      title: "Solicitud de retiro recibida",
      message: `Tu solicitud de retiro por $${data.amount.toLocaleString('es-CL')} ha sido recibida y está siendo procesada.`,
      type: "info",
      createdAt: new Date(),
    });
    
    return res.status(201).json({
      message: "Solicitud de retiro recibida correctamente",
      withdrawalId: newWithdrawal.id,
      amount: data.amount,
      status: "pending"
    });
  } catch (error) {
    console.error("Error al solicitar retiro:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Datos inválidos", errors: error.errors });
    }
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Ruta para obtener notificaciones del socio
vecinosRouter.get("/notifications", isPartnerAuthenticated, async (req: Request, res: Response) => {
  try {
    const partnerId = req.vecinosUser!.id;
    
    // Buscar notificaciones del socio ordenadas por fecha (más recientes primero)
    const notifications = await db.select()
      .from(partnerNotifications)
      .where(eq(partnerNotifications.partnerId, partnerId))
      .orderBy(desc(partnerNotifications.createdAt));
    
    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Ruta para marcar notificaciones como leídas
vecinosRouter.post("/notifications/:id/read", isPartnerAuthenticated, async (req: Request, res: Response) => {
  try {
    const partnerId = req.vecinosUser!.id;
    const notificationId = parseInt(req.params.id);
    
    // Buscar la notificación
    const [notification] = await db.select()
      .from(partnerNotifications)
      .where(and(
        eq(partnerNotifications.id, notificationId),
        eq(partnerNotifications.partnerId, partnerId)
      ));
    
    if (!notification) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }
    
    // Marcar como leída
    await db.update(partnerNotifications)
      .set({ 
        read: true,
        readAt: new Date() 
      })
      .where(eq(partnerNotifications.id, notificationId));
    
    return res.status(200).json({ message: "Notificación marcada como leída" });
  } catch (error) {
    console.error("Error al marcar notificación como leída:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Ruta para cerrar sesión
vecinosRouter.post("/logout", isPartnerAuthenticated, (_req: Request, res: Response) => {
  // Eliminar cookie de sesión
  res.clearCookie("vecinos_token");
  return res.status(200).json({ message: "Sesión cerrada correctamente" });
});