"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.setupAuth = setupAuth;
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const express_session_1 = __importDefault(require("express-session"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("./db");
const db_2 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
// Función para hashear contraseñas
async function hashPassword(password) {
    return bcrypt_1.default.hash(password, 10);
}
// Función para comparar contraseñas
async function comparePassword(password, hashedPassword) {
    return bcrypt_1.default.compare(password, hashedPassword);
}
function setupAuth(app) {
    app.use((0, express_session_1.default)({
        secret: process.env.SESSION_SECRET || 'notary_vecino_super_secret_2025',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false } // cambiar a true si usas HTTPS
    }));
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    passport_1.default.use(new passport_local_1.Strategy(async (username, password, done) => {
        try {
            const [user] = await db_1.db.select().from(db_2.users).where((0, drizzle_orm_1.eq)(db_2.users.username, username));
            if (!user) {
                return done(null, false, { message: "Usuario no encontrado" });
            }
            const valid = await comparePassword(password, user.password);
            if (!valid) {
                return done(null, false, { message: "Contraseña inválida" });
            }
            return done(null, user);
        }
        catch (error) {
            return done(error);
        }
    }));
    passport_1.default.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport_1.default.deserializeUser(async (id, done) => {
        try {
            const [user] = await db_1.db.select().from(db_2.users).where((0, drizzle_orm_1.eq)(db_2.users.id, id));
            done(null, user || false);
        }
        catch (error) {
            done(error);
        }
    });
    // Rutas básicas
    app.post('/api/login', passport_1.default.authenticate('local'), (req, res) => {
        res.json(req.user);
    });
    app.post('/api/logout', (req, res) => {
        req.logout(() => res.json({ message: "Sesión cerrada" }));
    });
    app.get('/api/user', (req, res) => {
        if (!req.user)
            return res.status(401).json({ error: "No autenticado" });
        res.json(req.user);
    });
    app.post('/api/register', async (req, res) => {
        try {
            const { username, password, email, fullName, role = "user" } = req.body;
            const hashedPassword = await hashPassword(password);
            const [user] = await db_1.db.insert(db_2.users).values({
                username,
                password: hashedPassword,
                email,
                fullName,
                role,
                createdAt: new Date()
            }).returning();
            req.login(user, () => {
                res.json(user);
            });
        }
        catch (error) {
            res.status(500).json({ error: "Error al registrar usuario" });
        }
    });
}
