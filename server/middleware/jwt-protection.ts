/**
 * Middleware de Protección JWT
 * Aplicar autenticación JWT a rutas existentes
 */

import { Request, Response, NextFunction } from 'express';
import { 
  authenticateJWT,
  requireAdmin,
  requireCertifier,
  requireNotary,
  requireLawyer,
  requirePartner,
  requirePosUser
} from '../services/jwt-auth-service';

/**
 * Middleware híbrido - Soporta tanto JWT como sesión tradicional
 */
export const hybridAuth = async (req: Request, res: Response, next: NextFunction) => {
  // Verificar si hay JWT token
  const authHeader = req.headers.authorization;
  const jwtToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : req.cookies?.access_token;

  if (jwtToken) {
    // Usar autenticación JWT
    return authenticateJWT(req, res, next);
  }

  // Fallback a autenticación por sesión
  if (req.isAuthenticated && req.isAuthenticated()) {
    // Convertir usuario de sesión a formato JWT para compatibilidad
    const sessionUser = req.user as any;
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

/**
 * Middleware específico para administradores (híbrido)
 */
export const hybridRequireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  hybridAuth(req, res, () => {
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

/**
 * Middleware específico para certificadores (híbrido)
 */
export const hybridRequireCertifier = async (req: Request, res: Response, next: NextFunction) => {
  hybridAuth(req, res, () => {
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

/**
 * Middleware específico para POS (híbrido)
 */
export const hybridRequirePosUser = async (req: Request, res: Response, next: NextFunction) => {
  hybridAuth(req, res, () => {
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

/**
 * Middleware para verificar plataforma (híbrido)
 */
export const hybridRequirePlatform = (platform: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    hybridAuth(req, res, () => {
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

export default {
  hybridAuth,
  hybridRequireAdmin,
  hybridRequireCertifier,
  hybridRequirePosUser,
  hybridRequirePlatform,
  // Exportar también los middlewares JWT puros
  authenticateJWT,
  requireAdmin,
  requireCertifier,
  requireNotary,
  requireLawyer,
  requirePartner,
  requirePosUser
};