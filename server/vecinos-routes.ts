import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "./db";
import { partners, documents, partnerTransactions } from "@shared/schema";
import { and, eq, like } from "drizzle-orm";

// Crear router para rutas de Vecinos Xpress
export const vecinosRouter = Router();

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
      
      const decoded = jwt.verify(cookieToken, process.env.JWT_SECRET || "vecinos-xpress-secret");
      req.user = decoded;
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "vecinos-xpress-secret");
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error en verificación de token:", error);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}

// Ruta de inicio de sesión para socios
vecinosRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Se requieren nombre de usuario y contraseña" });
    }
    
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
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Ruta para registro de nuevos socios
vecinosRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { 
      storeName, businessType, address, city, phone, email,
      ownerName, ownerRut, ownerPhone, 
      bankName, accountType, accountNumber, 
      termsAccepted 
    } = req.body;
    
    // Validaciones básicas
    if (!storeName || !businessType || !address || !city || !phone || !email) {
      return res.status(400).json({ message: "Faltan datos del negocio" });
    }
    
    if (!ownerName || !ownerRut || !ownerPhone) {
      return res.status(400).json({ message: "Faltan datos del propietario" });
    }
    
    if (!termsAccepted) {
      return res.status(400).json({ message: "Debes aceptar los términos y condiciones" });
    }
    
    // Verificar si ya existe un socio con ese email
    const [existingPartner] = await db.select().from(partners).where(eq(partners.email, email));
    
    if (existingPartner) {
      return res.status(400).json({ message: "Ya existe un socio registrado con ese email" });
    }
    
    // Generar nombre de usuario basado en el nombre del negocio
    const baseUsername = storeName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") // Eliminar caracteres especiales
      .substring(0, 10); // Limitar longitud
    
    // Verificar si el nombre de usuario base ya existe
    const [userWithSameUsername] = await db.select().from(partners).where(like(partners.username, `${baseUsername}%`));
    
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
      storeName,
      businessType,
      address,
      city,
      phone,
      email,
      ownerName,
      ownerRut,
      ownerPhone,
      bankName: bankName || null,
      accountType: accountType || null,
      accountNumber: accountNumber || null,
      commissionRate: 20, // Tasa de comisión por defecto (20%)
      status: "pending", // Pendiente de aprobación
      balance: 0,
      createdAt: new Date(),
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
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Ruta para obtener información del socio autenticado
vecinosRouter.get("/partner-info", isPartnerAuthenticated, async (req: Request, res: Response) => {
  try {
    const partnerId = req.user.id;
    
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
    const partnerId = req.user.id;
    
    // Buscar documentos del socio ordenados por fecha de creación (más recientes primero)
    const partnerDocuments = await db.select().from(documents)
      .where(eq(documents.partnerId, partnerId))
      .orderBy(documents.createdAt);
    
    // Transformar los datos para el formato esperado en el frontend
    const formattedDocuments = partnerDocuments.map(doc => ({
      id: doc.id,
      title: doc.title,
      status: doc.status,
      createdAt: doc.createdAt.toISOString(),
      type: doc.type,
      clientName: doc.clientName,
      commission: Math.round(doc.price * (doc.commissionRate / 100)) // Calcular comisión
    }));
    
    return res.status(200).json(formattedDocuments);
  } catch (error) {
    console.error("Error al obtener documentos del socio:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Ruta para obtener transacciones del socio
vecinosRouter.get("/transactions", isPartnerAuthenticated, async (req: Request, res: Response) => {
  try {
    const partnerId = req.user.id;
    
    // Buscar transacciones del socio ordenadas por fecha (más recientes primero)
    const partnerTransactionsList = await db.select().from(partnerTransactions)
      .where(eq(partnerTransactions.partnerId, partnerId))
      .orderBy(partnerTransactions.createdAt);
    
    // Transformar los datos para el formato esperado en el frontend
    const formattedTransactions = partnerTransactionsList.map(transaction => ({
      id: transaction.id,
      date: transaction.createdAt.toISOString(),
      documentTitle: transaction.description,
      amount: transaction.amount,
      status: transaction.status
    }));
    
    return res.status(200).json(formattedTransactions);
  } catch (error) {
    console.error("Error al obtener transacciones del socio:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Ruta para procesar un nuevo documento
vecinosRouter.post("/process-document", isPartnerAuthenticated, async (req: Request, res: Response) => {
  try {
    const partnerId = req.user.id;
    const { documentType, clientInfo } = req.body;
    
    if (!documentType || !clientInfo) {
      return res.status(400).json({ message: "Faltan datos del documento o cliente" });
    }
    
    // Validar información del cliente
    if (!clientInfo.name || !clientInfo.rut || !clientInfo.phone) {
      return res.status(400).json({ message: "Faltan datos obligatorios del cliente" });
    }
    
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
    const documentPrice = documentPrices[documentType] || 3500; // Precio por defecto
    let documentTitle = "Documento";
    
    switch (documentType) {
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
      type: documentType,
      price: documentPrice,
      status: "completed",
      partnerId: partnerId,
      clientName: clientInfo.name,
      clientRut: clientInfo.rut,
      clientPhone: clientInfo.phone,
      clientEmail: clientInfo.email || null,
      verificationCode: verificationCode,
      createdAt: new Date(),
      commissionRate: commissionRate
    }).returning();
    
    // Registrar la transacción (comisión del socio)
    const [newTransaction] = await db.insert(partnerTransactions).values({
      partnerId: partnerId,
      documentId: newDocument.id,
      amount: commissionAmount,
      type: "commission",
      status: "completed",
      description: `Comisión por ${documentTitle}`,
      createdAt: new Date()
    }).returning();
    
    // Actualizar el balance del socio
    await db
      .update(partners)
      .set({ 
        balance: partner.balance + commissionAmount 
      })
      .where(eq(partners.id, partnerId));
    
    // Devolver resultado del proceso
    return res.status(200).json({
      success: true,
      documentId: newDocument.id,
      verificationCode: verificationCode,
      clientName: clientInfo.name,
      timestamp: new Date().toISOString(),
      commission: commissionAmount
    });
  } catch (error) {
    console.error("Error al procesar documento:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Ruta para cerrar sesión
vecinosRouter.post("/logout", isPartnerAuthenticated, (_req: Request, res: Response) => {
  // Eliminar cookie de sesión
  res.clearCookie("vecinos_token");
  return res.status(200).json({ message: "Sesión cerrada correctamente" });
});