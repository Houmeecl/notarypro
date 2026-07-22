"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const http_1 = require("http");
const ws_1 = require("ws");
const vecinos_routes_1 = __importDefault(require("./vecinos/vecinos-routes"));
const document_sign_routes_1 = __importDefault(require("./vecinos/document-sign-routes"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const auth_1 = require("./auth");
const db_1 = require("./db");
const db_2 = require("./db"); // ✅ Arreglado
// import { auditLogs } from "./db"; // ✅ Comentado temporalmente
const identity_verification_routes_1 = require("./identity-verification-routes");
const contract_routes_1 = require("./contract-routes");
const mercadopago_routes_1 = require("./mercadopago-routes");
const ron_routes_1 = require("./ron-routes");
const tuu_payment_routes_1 = require("./tuu-payment-routes");
const drizzle_orm_1 = require("drizzle-orm");
const document_management_routes_1 = require("./document-management-routes");
const notary_document_routes_1 = require("./notary-document-routes");
const pos_management_routes_1 = require("./pos-management-routes");
const document_signatures_1 = require("./routes/document-signatures");
const secure_document_routes_1 = require("./routes/secure-document-routes");
const qr_signature_routes_1 = require("./vecinos/qr-signature-routes");
const admin_routes_1 = require("./admin/admin-routes");
const admin_pos_routes_1 = require("./admin/admin-pos-routes");
const integration_routes_1 = require("./admin/integration-routes");
const real_data_routes_1 = require("./admin/real-data-routes");
const gamification_routes_1 = require("./gamification-routes");
const getapi_routes_1 = require("./getapi-routes");
const translation_routes_1 = require("./translation-routes");
const auth_jwt_routes_1 = require("./auth-jwt-routes");
// Middleware de autenticación
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ error: "No autorizado" });
}
function registerRoutes(app) {
    // Configuración de autenticación para la aplicación principal
    (0, auth_1.setupAuth)(app);
    // Rutas específicas para Vecinos
    app.use("/api/vecinos", vecinos_routes_1.default);
    // Rutas para firma de documentos de Vecinos con Zoho Sign
    app.use("/api/vecinos/document-sign", document_sign_routes_1.default);
    // Rutas para verificación de identidad
    app.use("/api/identity", identity_verification_routes_1.identityVerificationRouter);
    // Rutas para gestión de contratos
    app.use("/api/contracts", contract_routes_1.contractRouter);
    // Rutas para pagos con MercadoPago
    app.use("/api/payments", mercadopago_routes_1.mercadoPagoRouter);
    // Rutas para plataforma RON
    app.use("/api/ron", ron_routes_1.ronRouter);
    // Rutas para pagos con Tuu Payments (POS)
    app.use("/api/tuu-payment", tuu_payment_routes_1.tuuPaymentRouter);
    // Sistema de Gestión Documental Unificado
    app.use("/api/document-management", document_management_routes_1.documentManagementRouter);
    // Sistema de Documentos Notariales
    app.use("/api/notary-documents", notary_document_routes_1.notaryDocumentRouter);
    // Sistema de Gestión de Dispositivos POS
    app.use("/api/pos-management", pos_management_routes_1.posManagementRouter);
    // Sistema de firmas de documentos
    app.use("/api/documents", document_signatures_1.documentSignaturesRouter);
    // Ruta para el sistema de seguridad de documentos (nueva)
    app.use("/api/secure-documents", secure_document_routes_1.secureDocumentRouter);
    // Ruta para el sistema de firma con QR
    app.use("/api/qr-signature", qr_signature_routes_1.qrSignatureRouter);
    // Rutas de administración
    app.use("/api/admin", admin_routes_1.adminRouter);
    app.use("/api/admin/pos", admin_pos_routes_1.adminPosRouter);
    app.use("/api/admin/integrations", integration_routes_1.integrationRouter);
    app.use("/api/admin/real-data", real_data_routes_1.realDataRouter);
    // Sistema de gamificación
    app.use("/api/gamification", gamification_routes_1.gamificationRouter);
    // API de GetAPI para verificación de identidad
    app.use("/api/getapi", getapi_routes_1.getApiRouter);
    // Servicio de traducción
    app.use("/api/translation", translation_routes_1.translationRouter);
    // Sistema de autenticación JWT
    app.use("/api/auth", auth_jwt_routes_1.authJwtRouter);
    // Ruta para servir archivos estáticos (documentos y contratos)
    app.use("/docs", express_1.default.static(path_1.default.join(process.cwd(), "docs")));
    app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
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
            // ✅ Registrar uso del código QA (temporalmente con console.log)
            console.log('QA Code used:', {
                userId: req.user?.id,
                code,
                userAgent: req.headers['user-agent'],
                ip: req.ip,
                timestamp: new Date()
            });
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
        }
        catch (error) {
            console.error('Error al validar código QA:', error);
            res.status(500).json({
                success: false,
                message: 'Error al procesar la solicitud'
            });
        }
    });
    // Crea el servidor HTTP
    const httpServer = (0, http_1.createServer)(app);
    // Configura WebSocket en una ruta específica
    // Usar una ruta diferente para evitar conflictos con HMR de Vite
    const wss = new ws_1.WebSocketServer({ server: httpServer, path: '/api/websocket' });
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
            }
            catch (error) {
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
        const [existingEdwardAdmin] = await db_1.db.select().from(db_2.users).where((0, drizzle_orm_1.eq)(db_2.users.username, "Edwardadmin"));
        if (existingEdwardAdmin) {
            console.log("El administrador Edwardadmin ya existe. Actualizando contraseña...");
            // Hash la contraseña usando la función del módulo de autenticación
            const hashedPassword = await (0, auth_1.hashPassword)("adminq");
            await db_1.db.update(db_2.users)
                .set({ password: hashedPassword })
                .where((0, drizzle_orm_1.eq)(db_2.users.username, "Edwardadmin"));
            console.log("Contraseña del administrador Edwardadmin actualizada.");
        }
        else {
            // ✅ Arreglado: usar hashPassword
            const hashedPassword = await (0, auth_1.hashPassword)("adminq");
            await db_1.db.insert(db_2.users).values({
                username: "Edwardadmin",
                password: hashedPassword,
                email: "admin@notarypro.cl",
                fullName: "Admin Principal",
                role: "admin",
                createdAt: new Date()
            });
            console.log("Super admin inicializado correctamente");
        }
        // Admin secundario (Seba)
        const [existingSebAdmin] = await db_1.db.select().from(db_2.users).where((0, drizzle_orm_1.eq)(db_2.users.username, "Sebadmin"));
        if (existingSebAdmin) {
            console.log("El administrador Sebadmin ya existe. Actualizando contraseña...");
            const hashedPassword = await (0, auth_1.hashPassword)("admin123");
            await db_1.db.update(db_2.users)
                .set({ password: hashedPassword })
                .where((0, drizzle_orm_1.eq)(db_2.users.username, "Sebadmin"));
            console.log("Contraseña del administrador Sebadmin actualizada.");
        }
        else {
            const hashedPassword = await (0, auth_1.hashPassword)("admin123");
            await db_1.db.insert(db_2.users).values({
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
        const [existingNfcAdmin] = await db_1.db.select().from(db_2.users).where((0, drizzle_orm_1.eq)(db_2.users.username, "nfcadmin"));
        if (!existingNfcAdmin) {
            const hashedPassword = await (0, auth_1.hashPassword)("nfc123");
            await db_1.db.insert(db_2.users).values({
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
        const [existingVecinosAdmin] = await db_1.db.select().from(db_2.users).where((0, drizzle_orm_1.eq)(db_2.users.username, "vecinosadmin"));
        if (existingVecinosAdmin) {
            console.log("El administrador vecinosadmin ya existe. Actualizando contraseña...");
            const hashedPassword = await (0, auth_1.hashPassword)("vecinos123");
            await db_1.db.update(db_2.users)
                .set({ password: hashedPassword, platform: "vecinos" })
                .where((0, drizzle_orm_1.eq)(db_2.users.username, "vecinosadmin"));
            console.log("Contraseña del administrador vecinosadmin actualizada.");
        }
        else {
            const hashedPassword = await (0, auth_1.hashPassword)("vecinos123");
            await db_1.db.insert(db_2.users).values({
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
        const [existingCustomAdmin] = await db_1.db.select().from(db_2.users).where((0, drizzle_orm_1.eq)(db_2.users.username, "miadmin"));
        if (existingCustomAdmin) {
            console.log("El administrador miadmin ya existe. Actualizando contraseña...");
            const hashedPassword = await (0, auth_1.hashPassword)("miadmin123");
            await db_1.db.update(db_2.users)
                .set({ password: hashedPassword })
                .where((0, drizzle_orm_1.eq)(db_2.users.username, "miadmin"));
            console.log("Contraseña del administrador miadmin actualizada.");
        }
        else {
            const hashedPassword = await (0, auth_1.hashPassword)("miadmin123");
            await db_1.db.insert(db_2.users).values({
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
        const [existingEvenegas] = await db_1.db.select().from(db_2.users).where((0, drizzle_orm_1.eq)(db_2.users.username, "evenegas"));
        if (existingEvenegas) {
            console.log("El usuario evenegas ya existe. Actualizando contraseña...");
            const evenegasPassword = "77239800"; // Contraseña en texto plano
            const evenegasHashedPassword = await (0, auth_1.hashPassword)(evenegasPassword);
            console.log("Actualizando usuario evenegas con hash:", evenegasHashedPassword);
            await db_1.db.update(db_2.users)
                .set({
                password: evenegasHashedPassword,
                role: "admin",
                fullName: "CEO NotaryPro",
                email: "evenegas@notarypro.cl"
            })
                .where((0, drizzle_orm_1.eq)(db_2.users.username, "evenegas"));
            console.log("Credenciales del usuario evenegas actualizadas.");
        }
        else {
            const evenegasPassword = "77239800"; // Contraseña en texto plano
            const evenegasHashedPassword = await (0, auth_1.hashPassword)(evenegasPassword);
            console.log("Creando usuario evenegas con hash:", evenegasHashedPassword);
            await db_1.db.insert(db_2.users).values({
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
        const [existingDemoPartner] = await db_1.db.select().from(db_2.users).where((0, drizzle_orm_1.eq)(db_2.users.username, "demopartner"));
        if (existingDemoPartner) {
            console.log("El usuario demopartner ya existe. Actualizando contraseña...");
            const hashedPassword = await (0, auth_1.hashPassword)("password123");
            await db_1.db.update(db_2.users)
                .set({ password: hashedPassword, platform: "vecinos", role: "partner" })
                .where((0, drizzle_orm_1.eq)(db_2.users.username, "demopartner"));
            console.log("Credenciales del usuario demopartner actualizadas.");
        }
        else {
            // Crear usuario demopartner
            const hashedPassword = await (0, auth_1.hashPassword)("password123");
            const [newUser] = await db_1.db.insert(db_2.users).values({
                username: "demopartner",
                password: hashedPassword,
                email: "demo@vecinoxpress.cl",
                fullName: "Demo Partner",
                role: "partner",
                platform: "vecinos",
                createdAt: new Date()
            }).returning();
            console.log("Usuario partner creado, ahora puedes iniciar sesión con demopartner/password123");
            console.log("Usuario demo partner inicializado correctamente");
        }
        // Usuario POS/Operador Demo 1
        const [existingPosUser1] = await db_1.db.select().from(db_2.users).where((0, drizzle_orm_1.eq)(db_2.users.username, "posoperator1"));
        if (existingPosUser1) {
            console.log("El usuario posoperator1 ya existe. Actualizando contraseña...");
            const hashedPassword = await (0, auth_1.hashPassword)("pos123");
            await db_1.db.update(db_2.users)
                .set({ password: hashedPassword, role: "pos-user" })
                .where((0, drizzle_orm_1.eq)(db_2.users.username, "posoperator1"));
            console.log("Credenciales del usuario posoperator1 actualizadas.");
        }
        else {
            const hashedPassword = await (0, auth_1.hashPassword)("pos123");
            await db_1.db.insert(db_2.users).values({
                username: "posoperator1",
                password: hashedPassword,
                email: "pos1@notarypro.cl",
                fullName: "Operador POS 1",
                role: "pos-user",
                platform: "notarypro",
                createdAt: new Date()
            });
            console.log("Usuario POS Operador 1 creado correctamente");
        }
        // Usuario Operador Demo 2
        const [existingOperator2] = await db_1.db.select().from(db_2.users).where((0, drizzle_orm_1.eq)(db_2.users.username, "operator2"));
        if (existingOperator2) {
            console.log("El usuario operator2 ya existe. Actualizando contraseña...");
            const hashedPassword = await (0, auth_1.hashPassword)("operator123");
            await db_1.db.update(db_2.users)
                .set({ password: hashedPassword, role: "operator" })
                .where((0, drizzle_orm_1.eq)(db_2.users.username, "operator2"));
            console.log("Credenciales del usuario operator2 actualizadas.");
        }
        else {
            const hashedPassword = await (0, auth_1.hashPassword)("operator123");
            await db_1.db.insert(db_2.users).values({
                username: "operator2",
                password: hashedPassword,
                email: "operator2@notarypro.cl",
                fullName: "Operador Terminal 2",
                role: "operator",
                platform: "notarypro",
                createdAt: new Date()
            });
            console.log("Usuario Operador 2 creado correctamente");
        }
        // Usuario POS para VecinoXpress
        const [existingVecinosPOS] = await db_1.db.select().from(db_2.users).where((0, drizzle_orm_1.eq)(db_2.users.username, "vecinospos"));
        if (existingVecinosPOS) {
            console.log("El usuario vecinospos ya existe. Actualizando contraseña...");
            const hashedPassword = await (0, auth_1.hashPassword)("vecinos123pos");
            await db_1.db.update(db_2.users)
                .set({ password: hashedPassword, role: "pos-user", platform: "vecinos" })
                .where((0, drizzle_orm_1.eq)(db_2.users.username, "vecinospos"));
            console.log("Credenciales del usuario vecinospos actualizadas.");
        }
        else {
            const hashedPassword = await (0, auth_1.hashPassword)("vecinos123pos");
            await db_1.db.insert(db_2.users).values({
                username: "vecinospos",
                password: hashedPassword,
                email: "pos@vecinoxpress.cl",
                fullName: "Operador POS Vecinos",
                role: "pos-user",
                platform: "vecinos",
                businessName: "Terminal VecinoXpress",
                createdAt: new Date()
            });
            console.log("Usuario POS VecinoXpress creado correctamente");
        }
    }
    catch (error) {
        console.error("Error inicializando admins:", error);
    }
}
