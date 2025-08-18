"use strict";
/**
 * Middleware de Protección JWT
 * Aplicar autenticación JWT a rutas existentes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.hybridRequirePlatform = exports.hybridRequirePosUser = exports.hybridRequireCertifier = exports.hybridRequireAdmin = exports.hybridAuth = void 0;
const jwt_auth_service_1 = require("../services/jwt-auth-service");
/**
 * Middleware híbrido - Soporta tanto JWT como sesión tradicional
 */
const hybridAuth = async (req, res, next) => {
    // Verificar si hay JWT token
    const authHeader = req.headers.authorization;
    const jwtToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : req.cookies?.access_token;
    if (jwtToken) {
        // Usar autenticación JWT
        return (0, jwt_auth_service_1.authenticateJWT)(req, res, next);
    }
    // Fallback a autenticación por sesión
    if (req.isAuthenticated && req.isAuthenticated()) {
        // Convertir usuario de sesión a formato JWT para compatibilidad
        const sessionUser = req.user;
        req.user = {
            userId: sessionUser.id,
            username: sessionUser.username,
            email: sessionUser.email,
            fullName: sessionUser.fullName,
            role: sessionUser.role,
            platform: sessionUser.platform || 'notarypro'
        };
        return next();
    }
    // No autenticado
    return res.status(401).json({
        success: false,
        error: 'Autenticación requerida'
    });
};
exports.hybridAuth = hybridAuth;
/**
 * Middleware específico para administradores (híbrido)
 */
const hybridRequireAdmin = async (req, res, next) => {
    (0, exports.hybridAuth)(req, res, () => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Acceso restringido a administradores'
            });
        }
        next();
    });
};
exports.hybridRequireAdmin = hybridRequireAdmin;
/**
 * Middleware específico para certificadores (híbrido)
 */
const hybridRequireCertifier = async (req, res, next) => {
    (0, exports.hybridAuth)(req, res, () => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        if (!['certifier', 'admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Acceso restringido a certificadores'
            });
        }
        next();
    });
};
exports.hybridRequireCertifier = hybridRequireCertifier;
/**
 * Middleware específico para POS (híbrido)
 */
const hybridRequirePosUser = async (req, res, next) => {
    (0, exports.hybridAuth)(req, res, () => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        if (!['pos-user', 'operator', 'admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Acceso restringido a operadores POS'
            });
        }
        next();
    });
};
exports.hybridRequirePosUser = hybridRequirePosUser;
/**
 * Middleware para verificar plataforma (híbrido)
 */
const hybridRequirePlatform = (platform) => {
    return async (req, res, next) => {
        (0, exports.hybridAuth)(req, res, () => {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Usuario no autenticado'
                });
            }
            if (req.user.platform !== platform && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: `Acceso restringido a plataforma ${platform}`
                });
            }
            next();
        });
    };
};
exports.hybridRequirePlatform = hybridRequirePlatform;
exports.default = {
    hybridAuth: exports.hybridAuth,
    hybridRequireAdmin: exports.hybridRequireAdmin,
    hybridRequireCertifier: exports.hybridRequireCertifier,
    hybridRequirePosUser: exports.hybridRequirePosUser,
    hybridRequirePlatform: exports.hybridRequirePlatform,
    // Exportar también los middlewares JWT puros
    authenticateJWT: jwt_auth_service_1.authenticateJWT,
    requireAdmin: jwt_auth_service_1.requireAdmin,
    requireCertifier: jwt_auth_service_1.requireCertifier,
    requireNotary: jwt_auth_service_1.requireNotary,
    requireLawyer: jwt_auth_service_1.requireLawyer,
    requirePartner: jwt_auth_service_1.requirePartner,
    requirePosUser: jwt_auth_service_1.requirePosUser
};
