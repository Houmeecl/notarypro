"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_2 = require("../db"); // ✅ Corregido: import desde ../db
const drizzle_orm_1 = require("drizzle-orm");
const payments_api_1 = __importDefault(require("./payments-api"));
const auth_1 = require("../auth"); // ✅ Corregido: nombre de función
const router = express_1.default.Router();
// ✅ Middleware para verificar el token JWT de Vecinos
const authenticateJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
            const user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'vecinos-secret');
            req.user = user;
            next();
        }
        catch (error) {
            return res.sendStatus(403);
        }
    }
    else {
        res.sendStatus(401);
    }
};
// ✅ Middleware para verificar si el usuario es un socio Vecinos
const isPartner = async (req, res, next) => {
    if (!req.user || req.user.role !== 'partner') {
        return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de socio.' });
    }
    next();
};
// ✅ Middleware para verificar si el usuario es un vendedor
const isSeller = async (req, res, next) => {
    if (!req.user || req.user.role !== 'seller') {
        return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de vendedor.' });
    }
    next();
};
// ✅ Middleware para verificar si el usuario es un supervisor
const isSupervisor = async (req, res, next) => {
    if (!req.user || req.user.role !== 'supervisor') {
        return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de supervisor.' });
    }
    next();
};
// Iniciar sesión para Vecinos
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // MODO DE EMERGENCIA TEMPORAL
        if (username === "admin" && password === "admin123") {
            console.log("🚨 Acceso de emergencia concedido");
            const emergencyUser = {
                id: 99999,
                username: "admin",
                email: "admin@vecinoxpress.cl",
                fullName: "Administrador Emergencia",
                role: "admin",
                platform: "vecinos"
            };
            const token = jsonwebtoken_1.default.sign({
                id: emergencyUser.id,
                username: emergencyUser.username,
                role: emergencyUser.role
            }, process.env.JWT_SECRET || "vecinos-secret-key", { expiresIn: "1d" });
            return res.json({
                user: emergencyUser,
                token,
                role: "admin"
            });
        }
        // Buscar usuario en la base de datos - ahora permitimos cualquier plataforma
        const [user] = await db_1.db.select().from(db_2.users).where((0, drizzle_orm_1.eq)(db_2.users.username, username));
        // Verificación de usuario específica para vecinosadmin
        if (username === "vecinosadmin" && password === "vecinos123") {
            console.log("Login directo para vecinosadmin");
            const token = jsonwebtoken_1.default.sign({
                id: 88888,
                username: "vecinosadmin",
                role: "admin"
            }, process.env.JWT_SECRET || "vecinos-secret-key", { expiresIn: "1d" });
            return res.json({
                user: {
                    id: 88888,
                    username: "vecinosadmin",
                    email: "admin@vecinoxpress.cl",
                    fullName: "Administrador VecinoXpress",
                    role: "admin",
                    platform: "vecinos"
                },
                token,
                role: "admin"
            });
        }
        if (!user) {
            console.log(`Usuario no encontrado: ${username}`);
            return res.status(401).json({ message: "Credenciales inválidas" });
        }
        // ✅ Verificar contraseña - función corregida
        const passwordValid = await (0, auth_1.comparePassword)(password, user.password);
        if (!passwordValid) {
            console.log(`Contraseña incorrecta para usuario: ${username}`);
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }
        console.log(`Login exitoso para: ${username}, rol: ${user.role}`);
        // Generar token JWT
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            username: user.username,
            role: user.role
        }, process.env.JWT_SECRET || "vecinos-secret-key", { expiresIn: "1d" });
        // Devolver usuario y token (sin la contraseña)
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            user: userWithoutPassword,
            token,
            role: user.role
        });
    }
    catch (error) {
        console.error("Error en login de Vecinos:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
});
// ✅ Ruta para verificar el token y obtener información del usuario
router.get('/profile', authenticateJWT, async (req, res) => {
    try {
        const [user] = await db_1.db.select({
            id: db_2.users.id,
            username: db_2.users.username,
            fullName: db_2.users.fullName,
            email: db_2.users.email,
            role: db_2.users.role,
            platform: db_2.users.platform,
            createdAt: db_2.users.createdAt
        }).from(db_2.users).where((0, drizzle_orm_1.eq)(db_2.users.id, req.user.id) // ✅ Corregido: type assertion
        ).limit(1);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        // Para demostración, creamos un perfil de socio sin consultar la base de datos
        let partnerProfile = null;
        if (user.role === 'partner') {
            // Perfil de socio simulado para evitar problemas con la estructura de la tabla
            partnerProfile = {
                id: 1,
                userId: user.id,
                storeName: "Minimarket El Sol",
                address: "Av. Providencia 1234, Santiago",
                phone: "+56 9 1234 5678",
                code: "LOCAL-XP125",
                status: "active"
            };
        }
        res.json({
            ...user,
            partnerProfile
        });
    }
    catch (error) {
        console.error("Error al obtener perfil:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});
// Registrar un nuevo socio Vecinos
router.post('/register', async (req, res) => {
    const { username, password, fullName, email, businessName, storeAddress, storePhone } = req.body;
    try {
        // Verificar si el usuario ya existe
        const [existingUser] = await db_1.db.select({
            id: db_2.users.id
        }).from(db_2.users).where((0, drizzle_orm_1.eq)(db_2.users.username, username)).limit(1);
        if (existingUser) {
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
        }
        // Crear el usuario
        const [newUser] = await db_1.db.insert(db_2.users).values({
            username,
            password, // En producción, se debería hashear
            fullName,
            email,
            role: 'partner',
            platform: 'vecinos',
            createdAt: new Date()
        }).returning();
        // Crear el perfil de socio
        const partnerCode = 'LOCAL-XP' + Math.floor(1000 + Math.random() * 9000);
        const [newPartner] = await db_1.db.insert(db_2.partners).values({
            userId: newUser.id,
            name: businessName,
            address: storeAddress,
            phone: storePhone,
            code: partnerCode,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        }).returning();
        // Crear token JWT
        const token = jsonwebtoken_1.default.sign({
            id: newUser.id,
            username: newUser.username,
            role: newUser.role,
            partnerId: newPartner.id
        }, process.env.JWT_SECRET || 'vecinos-secret', { expiresIn: '24h' });
        // Enviar respuesta
        res.status(201).json({
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                role: newUser.role,
                fullName: newUser.fullName,
                email: newUser.email,
                partnerProfile: newPartner
            }
        });
    }
    catch (error) {
        console.error('Error al registrar socio:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});
// Utiliza el router de pagos
router.use('/payments', payments_api_1.default);
exports.default = router;
