"use strict";
/**
 * Rutas de Autenticación JWT - Sistema Unificado
 * APIs completas para login, registro, refresh token y gestión de usuarios
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authJwtRouter = void 0;
const express_1 = __importDefault(require("express"));
const jwt_auth_service_1 = require("./services/jwt-auth-service");
const db_1 = require("./db");
const db_2 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
const authJwtRouter = express_1.default.Router();
exports.authJwtRouter = authJwtRouter;
/**
 * POST /api/auth/login
 * Login con JWT - Retorna access token y refresh token
 */
authJwtRouter.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username y password son requeridos'
            });
        }
        const tokens = await (0, jwt_auth_service_1.loginWithJWT)(username, password);
        // Configurar cookies para el frontend
        res.cookie('access_token', tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 horas
        });
        res.cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
        });
        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user: tokens.user
            }
        });
    }
    catch (error) {
        console.error('Error en login JWT:', error);
        res.status(401).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error de autenticación'
        });
    }
});
/**
 * POST /api/auth/register
 * Registro de usuario con JWT
 */
authJwtRouter.post('/register', async (req, res) => {
    try {
        const { username, password, email, fullName, role, platform } = req.body;
        if (!username || !password || !email || !fullName) {
            return res.status(400).json({
                success: false,
                error: 'Todos los campos son requeridos: username, password, email, fullName'
            });
        }
        // Verificar si el usuario ya existe
        const [existingUser] = await db_1.db.select().from(db_2.users).where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(db_2.users.username, username), (0, drizzle_orm_1.eq)(db_2.users.email, email)));
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'Usuario o email ya existe'
            });
        }
        const tokens = await (0, jwt_auth_service_1.registerWithJWT)({
            username,
            password,
            email,
            fullName,
            role: role || 'user',
            platform: platform || 'notarypro'
        });
        // Configurar cookies
        res.cookie('access_token', tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });
        res.cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user: tokens.user
            }
        });
    }
    catch (error) {
        console.error('Error en registro JWT:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error en el registro'
        });
    }
});
/**
 * POST /api/auth/refresh
 * Renovar access token usando refresh token
 */
authJwtRouter.post('/refresh', async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken || req.cookies?.refresh_token;
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token requerido'
            });
        }
        const { accessToken } = await (0, jwt_auth_service_1.refreshAccessToken)(refreshToken);
        // Actualizar cookie
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });
        res.json({
            success: true,
            message: 'Token renovado exitosamente',
            data: {
                accessToken
            }
        });
    }
    catch (error) {
        console.error('Error al renovar token:', error);
        res.status(401).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error al renovar token'
        });
    }
});
/**
 * POST /api/auth/logout
 * Cerrar sesión - Limpiar cookies
 */
authJwtRouter.post('/logout', (req, res) => {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
    });
});
/**
 * GET /api/auth/me
 * Obtener información del usuario actual
 */
authJwtRouter.get('/me', jwt_auth_service_1.authenticateJWT, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        // Obtener información actualizada del usuario
        const [user] = await db_1.db.select({
            id: db_2.users.id,
            username: db_2.users.username,
            email: db_2.users.email,
            fullName: db_2.users.fullName,
            role: db_2.users.role,
            platform: db_2.users.platform,
            createdAt: db_2.users.createdAt
        }).from(db_2.users).where((0, drizzle_orm_1.eq)(db_2.users.id, req.user.userId));
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }
        res.json({
            success: true,
            data: {
                user
            }
        });
    }
    catch (error) {
        console.error('Error al obtener información del usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener información del usuario'
        });
    }
});
/**
 * GET /api/auth/verify-token
 * Verificar si un token es válido
 */
authJwtRouter.get('/verify-token', async (req, res) => {
    try {
        const token = req.headers.authorization?.substring(7) || req.cookies?.access_token;
        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Token requerido'
            });
        }
        const userPayload = await (0, jwt_auth_service_1.getUserFromToken)(token);
        if (!userPayload) {
            return res.status(401).json({
                success: false,
                error: 'Token inválido'
            });
        }
        res.json({
            success: true,
            valid: true,
            data: {
                user: userPayload
            }
        });
    }
    catch (error) {
        console.error('Error al verificar token:', error);
        res.status(401).json({
            success: false,
            valid: false,
            error: 'Token inválido'
        });
    }
});
/**
 * GET /api/auth/permissions
 * Obtener permisos del usuario actual
 */
authJwtRouter.get('/permissions', jwt_auth_service_1.authenticateJWT, (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        const rolePermissions = {
            'admin': [
                'manage_users', 'manage_system', 'view_all_documents',
                'manage_pos', 'manage_integrations', 'view_analytics'
            ],
            'certifier': [
                'certify_documents', 'view_documents', 'manage_sessions',
                'ron_sessions', 'identity_verification'
            ],
            'notary': [
                'notarize_documents', 'view_documents', 'manage_sessions',
                'ron_sessions', 'legal_documents'
            ],
            'lawyer': [
                'review_contracts', 'view_documents', 'legal_advice',
                'manage_legal_documents'
            ],
            'partner': [
                'manage_store', 'view_transactions', 'pos_operations',
                'partner_dashboard', 'vecinos_services'
            ],
            'pos-user': [
                'pos_operations', 'process_payments', 'view_transactions'
            ],
            'operator': [
                'pos_operations', 'process_payments', 'manage_terminal',
                'view_transactions'
            ],
            'user': [
                'view_own_documents', 'create_documents', 'upload_documents'
            ]
        };
        const permissions = rolePermissions[req.user.role] || [];
        res.json({
            success: true,
            data: {
                role: req.user.role,
                permissions,
                platform: req.user.platform
            }
        });
    }
    catch (error) {
        console.error('Error al obtener permisos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener permisos'
        });
    }
});
/**
 * PUT /api/auth/change-password
 * Cambiar contraseña del usuario actual
 */
authJwtRouter.put('/change-password', jwt_auth_service_1.authenticateJWT, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Contraseña actual y nueva contraseña son requeridas'
            });
        }
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        // Obtener usuario actual
        const [user] = await db_1.db.select().from(db_2.users).where((0, drizzle_orm_1.eq)(db_2.users.id, req.user.userId));
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }
        // Verificar contraseña actual
        const { comparePassword, hashPassword } = await Promise.resolve().then(() => __importStar(require('./auth')));
        const validPassword = await comparePassword(currentPassword, user.password);
        if (!validPassword) {
            return res.status(400).json({
                success: false,
                error: 'Contraseña actual incorrecta'
            });
        }
        // Hashear nueva contraseña
        const hashedNewPassword = await hashPassword(newPassword);
        // Actualizar contraseña
        await db_1.db.update(db_2.users)
            .set({ password: hashedNewPassword })
            .where((0, drizzle_orm_1.eq)(db_2.users.id, req.user.userId));
        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
    }
    catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cambiar contraseña'
        });
    }
});
