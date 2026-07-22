"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vecinosRouter = void 0;
exports.isPartnerAuthenticated = isPartnerAuthenticated;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./db");
const vecinos_schema_1 = require("@shared/vecinos-schema");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
const vecinos_memory_store_1 = require("./vecinos-memory-store");
// Crear router para rutas de Vecinos Xpress
exports.vecinosRouter = (0, express_1.Router)();
// Middleware para verificar autenticación de socio
function isPartnerAuthenticated(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            // También verificar token en cookies para apps móviles
            const cookieToken = req.cookies?.vecinos_token;
            if (!cookieToken) {
                return res.status(401).json({ message: "No se proporcionó token de autenticación" });
            }
            const decoded = jsonwebtoken_1.default.verify(cookieToken, process.env.JWT_SECRET || "vecinos-xpress-secret");
            req.vecinosUser = decoded;
            return next();
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "vecinos-xpress-secret");
        req.vecinosUser = decoded;
        next();
    }
    catch (error) {
        console.error("Error en verificación de token:", error);
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
}
// Esquema para validación de login
const loginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, "El nombre de usuario es requerido"),
    password: zod_1.z.string().min(1, "La contraseña es requerida"),
});
// Ruta de inicio de sesión para socios
exports.vecinosRouter.post("/login", async (req, res) => {
    try {
        console.log("Intento de login con:", req.body);
        const validatedData = loginSchema.parse(req.body);
        const { username, password } = validatedData;
        console.log(`Login validado para usuario: ${username}`);
        // Buscar el socio en el almacenamiento en memoria
        const partner = vecinos_memory_store_1.vecinosStore.getPartnerByUsername(username);
        if (!partner) {
            console.log(`Socio no encontrado: ${username}`);
            return res.status(401).json({ message: "Credenciales inválidas" });
        }
        console.log(`Socio encontrado: ${partner.username}, verificando contraseña`);
        // Verificar contraseña (aquí deberías usar bcrypt en producción)
        if (partner.password !== password) {
            console.log(`Contraseña incorrecta para usuario: ${username}`);
            return res.status(401).json({ message: "Credenciales inválidas" });
        }
        console.log(`Contraseña correcta, generando token para: ${username}`);
        // Generar token JWT
        const token = jsonwebtoken_1.default.sign({
            id: partner.id,
            username: partner.username,
            storeName: partner.storeName,
            role: "partner"
        }, process.env.JWT_SECRET || "vecinos-xpress-secret", { expiresIn: "7d" });
        // Establecer cookie para aplicaciones móviles
        res.cookie("vecinos_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
        });
        // Actualizar fecha de último login
        vecinos_memory_store_1.vecinosStore.updateLastLogin(partner.id);
        console.log(`Login exitoso para: ${username}`);
        // Devolver información del socio y token
        return res.status(200).json({
            id: partner.id,
            username: partner.username,
            storeName: partner.storeName,
            email: partner.email,
            token
        });
    }
    catch (error) {
        console.error("Error en login de socio:", error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: "Datos de inicio de sesión inválidos", errors: error.errors });
        }
        return res.status(500).json({ message: "Error en el servidor" });
    }
});
// Esquema para validación de registro
const registrationSchema = zod_1.z.object({
    storeName: zod_1.z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    businessType: zod_1.z.string().min(1, "Selecciona un tipo de negocio"),
    address: zod_1.z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
    city: zod_1.z.string().min(2, "La ciudad es requerida"),
    phone: zod_1.z.string().min(8, "El teléfono debe tener al menos 8 dígitos"),
    email: zod_1.z.string().email("Correo electrónico inválido"),
    ownerName: zod_1.z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    ownerRut: zod_1.z.string().min(8, "RUT inválido"),
    ownerPhone: zod_1.z.string().min(8, "El teléfono debe tener al menos 8 dígitos"),
    bankName: zod_1.z.string().optional(),
    accountType: zod_1.z.string().optional(),
    accountNumber: zod_1.z.string().optional(),
    termsAccepted: zod_1.z.boolean().refine(val => val === true, {
        message: "Debes aceptar los términos y condiciones",
    }),
});
// Ruta para registro de nuevos socios
exports.vecinosRouter.post("/register", async (req, res) => {
    try {
        const validatedData = registrationSchema.parse(req.body);
        // Verificar si ya existe un socio con ese email
        const [existingPartner] = await db_1.db.select().from(vecinos_schema_1.partners).where((0, drizzle_orm_1.eq)(vecinos_schema_1.partners.email, validatedData.email));
        if (existingPartner) {
            return res.status(400).json({ message: "Ya existe un socio registrado con ese email" });
        }
        // Generar nombre de usuario basado en el nombre del negocio
        const baseUsername = validatedData.storeName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "") // Eliminar caracteres especiales
            .substring(0, 10); // Limitar longitud
        // Verificar si el nombre de usuario base ya existe
        const [userWithSameUsername] = await db_1.db.select()
            .from(vecinos_schema_1.partners)
            .where((0, drizzle_orm_1.like)(vecinos_schema_1.partners.username, `${baseUsername}%`));
        // Si existe, agregar un número aleatorio
        const username = userWithSameUsername
            ? `${baseUsername}${Math.floor(Math.random() * 1000)}`
            : baseUsername;
        // Generar contraseña aleatoria temporal
        const tempPassword = Math.random().toString(36).substring(2, 10);
        // Registrar el nuevo socio (pendiente de aprobación)
        const [newPartner] = await db_1.db.insert(vecinos_schema_1.partners).values({
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
    }
    catch (error) {
        console.error("Error en registro de socio:", error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: "Datos de registro inválidos", errors: error.errors });
        }
        return res.status(500).json({ message: "Error en el servidor" });
    }
});
// Ruta para obtener información del socio autenticado
exports.vecinosRouter.get("/partner-info", isPartnerAuthenticated, async (req, res) => {
    try {
        const partnerId = req.vecinosUser.id;
        // Buscar el socio en el almacenamiento en memoria
        const partner = vecinos_memory_store_1.vecinosStore.getPartnerById(partnerId);
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
    }
    catch (error) {
        console.error("Error al obtener información del socio:", error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
});
// Ruta para obtener documentos del socio
exports.vecinosRouter.get("/documents", isPartnerAuthenticated, async (req, res) => {
    try {
        const partnerId = req.vecinosUser.id;
        // Obtener documentos del socio usando el almacenamiento en memoria
        const partnerDocuments = vecinos_memory_store_1.vecinosStore.getPartnerDocuments(partnerId);
        return res.status(200).json(partnerDocuments);
    }
    catch (error) {
        console.error("Error al obtener documentos del socio:", error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
});
// Ruta para obtener transacciones del socio
exports.vecinosRouter.get("/transactions", isPartnerAuthenticated, async (req, res) => {
    try {
        const partnerId = req.vecinosUser.id;
        // Obtener transacciones del socio usando el almacenamiento en memoria
        const partnerTransactionsList = vecinos_memory_store_1.vecinosStore.getPartnerTransactions(partnerId);
        return res.status(200).json(partnerTransactionsList);
    }
    catch (error) {
        console.error("Error al obtener transacciones del socio:", error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
});
// Esquema para validación de procesamiento de documento
const processDocumentSchema = zod_1.z.object({
    documentType: zod_1.z.string().min(1, "El tipo de documento es requerido"),
    clientInfo: zod_1.z.object({
        name: zod_1.z.string().min(3, "El nombre del cliente es requerido"),
        rut: zod_1.z.string().min(8, "RUT del cliente inválido"),
        phone: zod_1.z.string().min(8, "Teléfono del cliente inválido"),
        email: zod_1.z.string().email("Email inválido").optional(),
    })
});
// Ruta para procesar un nuevo documento
exports.vecinosRouter.post("/process-document", isPartnerAuthenticated, async (req, res) => {
    try {
        const partnerId = req.vecinosUser.id;
        const data = processDocumentSchema.parse(req.body);
        // Procesar el documento usando el almacenamiento en memoria
        const result = vecinos_memory_store_1.vecinosStore.processDocument(partnerId, data);
        // Devolver resultado del proceso
        return res.status(200).json({
            success: true,
            documentId: result.document.id,
            verificationCode: result.document.verificationCode,
            clientName: result.document.clientName,
            timestamp: result.document.createdAt.toISOString(),
            commission: result.transaction.amount
        });
    }
    catch (error) {
        console.error("Error al procesar documento:", error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: "Datos inválidos", errors: error.errors });
        }
        return res.status(500).json({ message: "Error en el servidor" });
    }
});
// Esquema para validación de solicitud de retiro
const withdrawalRequestSchema = zod_1.z.object({
    amount: zod_1.z.number().min(5000, "El monto mínimo de retiro es $5.000"),
    bankName: zod_1.z.string().min(1, "El banco es requerido"),
    accountType: zod_1.z.string().min(1, "El tipo de cuenta es requerido"),
    accountNumber: zod_1.z.string().min(5, "El número de cuenta es requerido"),
});
// Ruta para solicitar un retiro de comisiones
exports.vecinosRouter.post("/withdrawal-request", isPartnerAuthenticated, async (req, res) => {
    try {
        const partnerId = req.vecinosUser.id;
        const data = withdrawalRequestSchema.parse(req.body);
        // Obtener información del socio
        const [partner] = await db_1.db.select().from(vecinos_schema_1.partners).where((0, drizzle_orm_1.eq)(vecinos_schema_1.partners.id, partnerId));
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
        const [newWithdrawal] = await db_1.db.insert(vecinos_schema_1.withdrawalRequests).values({
            partnerId: partnerId,
            amount: data.amount,
            bankName: data.bankName,
            accountType: data.accountType,
            accountNumber: data.accountNumber,
            status: "pending",
            createdAt: new Date(),
        }).returning();
        // Crear notificación para el socio
        await db_1.db.insert(vecinos_schema_1.partnerNotifications).values({
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
    }
    catch (error) {
        console.error("Error al solicitar retiro:", error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: "Datos inválidos", errors: error.errors });
        }
        return res.status(500).json({ message: "Error en el servidor" });
    }
});
// Ruta para obtener notificaciones del socio
exports.vecinosRouter.get("/notifications", isPartnerAuthenticated, async (req, res) => {
    try {
        const partnerId = req.vecinosUser.id;
        // Obtener notificaciones del socio usando el almacenamiento en memoria
        const notifications = vecinos_memory_store_1.vecinosStore.getPartnerNotifications(partnerId);
        return res.status(200).json(notifications);
    }
    catch (error) {
        console.error("Error al obtener notificaciones:", error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
});
// Ruta para marcar notificaciones como leídas
exports.vecinosRouter.post("/notifications/:id/read", isPartnerAuthenticated, async (req, res) => {
    try {
        const partnerId = req.vecinosUser.id;
        const notificationId = parseInt(req.params.id);
        // Marcar notificación como leída usando el almacenamiento en memoria
        const success = vecinos_memory_store_1.vecinosStore.markNotificationAsRead(notificationId, partnerId);
        if (!success) {
            return res.status(404).json({ message: "Notificación no encontrada" });
        }
        return res.status(200).json({ message: "Notificación marcada como leída" });
    }
    catch (error) {
        console.error("Error al marcar notificación como leída:", error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
});
// Ruta para cerrar sesión
exports.vecinosRouter.post("/logout", isPartnerAuthenticated, (_req, res) => {
    // Eliminar cookie de sesión
    res.clearCookie("vecinos_token");
    return res.status(200).json({ message: "Sesión cerrada correctamente" });
});
