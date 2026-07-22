"use strict";
/**
 * Servicio de Autenticación JWT - Sistema Unificado
 * Manejo completo de tokens JWT para todos los usuarios y roles
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPermission = exports.getUserFromToken = exports.refreshAccessToken = exports.registerWithJWT = exports.loginWithJWT = exports.requirePlatform = exports.requirePosUser = exports.requirePartner = exports.requireLawyer = exports.requireNotary = exports.requireCertifier = exports.requireAdmin = exports.requireRole = exports.authenticateJWT = exports.verifyToken = exports.generateTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const db_2 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../auth");
// Configuración JWT
const JWT_SECRET = process.env.JWT_SECRET || 'notary-vecino-super-secret-2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';
/**
 * Generar tokens JWT (access + refresh)
 */
const generateTokens = (user) => {
    const payload = {
        userId: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        platform: user.platform || 'notarypro'
    };
    const accessToken = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            platform: user.platform || 'notarypro'
        }
    };
};
exports.generateTokens = generateTokens;
/**
 * Verificar token JWT
 */
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        throw new Error('Token inválido o expirado');
    }
};
exports.verifyToken = verifyToken;
/**
 * Middleware de autenticación JWT
 */
const authenticateJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
        // También verificar en cookies para compatibilidad
        const cookieToken = req.cookies?.access_token;
        const finalToken = token || cookieToken;
        if (!finalToken) {
            return res.status(401).json({
                success: false,
                error: 'Token de acceso requerido'
            });
        }
        const payload = (0, exports.verifyToken)(finalToken);
        // Verificar que el usuario aún existe
        const [user] = await db_1.db.select().from(db_2.users).where((0, drizzle_orm_1.eq)(db_2.users.id, payload.userId));
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }
        req.user = payload;
        next();
    }
    catch (error) {
        console.error('Error en autenticación JWT:', error);
        return res.status(401).json({
            success: false,
            error: 'Token inválido o expirado'
        });
    }
};
exports.authenticateJWT = authenticateJWT;
/**
 * Middleware para verificar roles específicos
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}`
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
/**
 * Middleware específicos por rol
 */
exports.requireAdmin = (0, exports.requireRole)(['admin']);
exports.requireCertifier = (0, exports.requireRole)(['certifier', 'admin']);
exports.requireNotary = (0, exports.requireRole)(['notary', 'admin']);
exports.requireLawyer = (0, exports.requireRole)(['lawyer', 'admin']);
exports.requirePartner = (0, exports.requireRole)(['partner', 'admin']);
exports.requirePosUser = (0, exports.requireRole)(['pos-user', 'operator', 'admin']);
/**
 * Middleware para plataforma específica
 */
const requirePlatform = (platform) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        if (req.user.platform !== platform && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: `Acceso denegado. Plataforma requerida: ${platform}`
            });
        }
        next();
    };
};
exports.requirePlatform = requirePlatform;
/**
 * Login con JWT
 */
const loginWithJWT = async (username, password) => {
    try {
        // Buscar usuario
        const [user] = await db_1.db.select().from(db_2.users).where((0, drizzle_orm_1.eq)(db_2.users.username, username));
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        // Verificar contraseña
        const validPassword = await (0, auth_1.comparePassword)(password, user.password);
        if (!validPassword) {
            throw new Error('Contraseña incorrecta');
        }
        // Generar tokens
        return (0, exports.generateTokens)(user);
    }
    catch (error) {
        console.error('Error en login JWT:', error);
        throw error;
    }
};
exports.loginWithJWT = loginWithJWT;
/**
 * Registrar usuario con JWT
 */
const registerWithJWT = async (userData) => {
    try {
        const hashedPassword = await (0, auth_1.hashPassword)(userData.password);
        const [newUser] = await db_1.db.insert(db_2.users).values({
            username: userData.username,
            password: hashedPassword,
            email: userData.email,
            fullName: userData.fullName,
            role: userData.role || 'user',
            platform: userData.platform || 'notarypro',
            createdAt: new Date()
        }).returning();
        return (0, exports.generateTokens)(newUser);
    }
    catch (error) {
        console.error('Error en registro JWT:', error);
        throw error;
    }
};
exports.registerWithJWT = registerWithJWT;
/**
 * Refresh token
 */
const refreshAccessToken = async (refreshToken) => {
    try {
        const payload = jsonwebtoken_1.default.verify(refreshToken, JWT_SECRET);
        const [user] = await db_1.db.select().from(db_2.users).where((0, drizzle_orm_1.eq)(db_2.users.id, payload.userId));
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        const newTokens = (0, exports.generateTokens)(user);
        return { accessToken: newTokens.accessToken };
    }
    catch (error) {
        console.error('Error al renovar token:', error);
        throw new Error('Refresh token inválido');
    }
};
exports.refreshAccessToken = refreshAccessToken;
/**
 * Obtener información del usuario desde token
 */
const getUserFromToken = async (token) => {
    try {
        const payload = (0, exports.verifyToken)(token);
        // Verificar que el usuario aún existe
        const [user] = await db_1.db.select().from(db_2.users).where((0, drizzle_orm_1.eq)(db_2.users.id, payload.userId));
        if (!user) {
            return null;
        }
        return payload;
    }
    catch (error) {
        return null;
    }
};
exports.getUserFromToken = getUserFromToken;
/**
 * Validar permisos para recurso específico
 */
const hasPermission = (userRole, requiredPermissions) => {
    const rolePermissions = {
        'admin': ['*'], // Admin tiene todos los permisos
        'certifier': ['certify', 'view_documents', 'manage_sessions'],
        'notary': ['notarize', 'view_documents', 'manage_sessions'],
        'lawyer': ['review_contracts', 'view_documents', 'legal_advice'],
        'partner': ['manage_store', 'view_transactions', 'pos_operations'],
        'pos-user': ['pos_operations', 'process_payments'],
        'operator': ['pos_operations', 'process_payments', 'manage_terminal'],
        'user': ['view_own_documents', 'create_documents']
    };
    const permissions = rolePermissions[userRole] || [];
    // Admin tiene acceso a todo
    if (permissions.includes('*')) {
        return true;
    }
    // Verificar si tiene alguno de los permisos requeridos
    return requiredPermissions.some(permission => permissions.includes(permission));
};
exports.hasPermission = hasPermission;
exports.default = {
    generateTokens: exports.generateTokens,
    verifyToken: exports.verifyToken,
    authenticateJWT: exports.authenticateJWT,
    requireRole: exports.requireRole,
    requireAdmin: exports.requireAdmin,
    requireCertifier: exports.requireCertifier,
    requireNotary: exports.requireNotary,
    requireLawyer: exports.requireLawyer,
    requirePartner: exports.requirePartner,
    requirePosUser: exports.requirePosUser,
    requirePlatform: exports.requirePlatform,
    loginWithJWT: exports.loginWithJWT,
    registerWithJWT: exports.registerWithJWT,
    refreshAccessToken: exports.refreshAccessToken,
    getUserFromToken: exports.getUserFromToken,
    hasPermission: exports.hasPermission
};
