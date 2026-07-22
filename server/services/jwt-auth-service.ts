/**
 * Servicio de Autenticación JWT - Sistema Unificado
 * Manejo completo de tokens JWT para todos los usuarios y roles
 */

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users } from '../db';
import { eq } from 'drizzle-orm';
import { hashPassword, comparePassword } from '../auth';

// Configuración JWT
const JWT_SECRET = process.env.JWT_SECRET || 'notary-vecino-super-secret-2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

// Interfaces
export interface JWTPayload {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  platform: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    role: string;
    platform: string;
  };
}

// Extender Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Generar tokens JWT (access + refresh)
 */
export const generateTokens = (user: any): AuthTokens => {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    platform: user.platform || 'notarypro'
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });

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

/**
 * Verificar token JWT
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

/**
 * Middleware de autenticación JWT
 */
export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
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

    const payload = verifyToken(finalToken);
    
    // Verificar que el usuario aún existe
    const [user] = await db.select().from(users).where(eq(users.id, payload.userId));
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    req.user = payload;
    next();
  } catch (error) {
    console.error('Error en autenticación JWT:', error);
    return res.status(401).json({
      success: false,
      error: 'Token inválido o expirado'
    });
  }
};

/**
 * Middleware para verificar roles específicos
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
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

/**
 * Middleware específicos por rol
 */
export const requireAdmin = requireRole(['admin']);
export const requireCertifier = requireRole(['certifier', 'admin']);
export const requireNotary = requireRole(['notary', 'admin']);
export const requireLawyer = requireRole(['lawyer', 'admin']);
export const requirePartner = requireRole(['partner', 'admin']);
export const requirePosUser = requireRole(['pos-user', 'operator', 'admin']);

/**
 * Middleware para plataforma específica
 */
export const requirePlatform = (platform: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
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

/**
 * Login con JWT
 */
export const loginWithJWT = async (username: string, password: string): Promise<AuthTokens> => {
  try {
    // Buscar usuario
    const [user] = await db.select().from(users).where(eq(users.username, username));
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar contraseña
    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      throw new Error('Contraseña incorrecta');
    }

    // Generar tokens
    return generateTokens(user);
  } catch (error) {
    console.error('Error en login JWT:', error);
    throw error;
  }
};

/**
 * Registrar usuario con JWT
 */
export const registerWithJWT = async (userData: {
  username: string;
  password: string;
  email: string;
  fullName: string;
  role?: string;
  platform?: string;
}): Promise<AuthTokens> => {
  try {
    const hashedPassword = await hashPassword(userData.password);
    
    const [newUser] = await db.insert(users).values({
      username: userData.username,
      password: hashedPassword,
      email: userData.email,
      fullName: userData.fullName,
      role: userData.role || 'user',
      platform: userData.platform || 'notarypro',
      createdAt: new Date()
    }).returning();

    return generateTokens(newUser);
  } catch (error) {
    console.error('Error en registro JWT:', error);
    throw error;
  }
};

/**
 * Refresh token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET) as { userId: number };
    
    const [user] = await db.select().from(users).where(eq(users.id, payload.userId));
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const newTokens = generateTokens(user);
    return { accessToken: newTokens.accessToken };
  } catch (error) {
    console.error('Error al renovar token:', error);
    throw new Error('Refresh token inválido');
  }
};

/**
 * Obtener información del usuario desde token
 */
export const getUserFromToken = async (token: string): Promise<JWTPayload | null> => {
  try {
    const payload = verifyToken(token);
    
    // Verificar que el usuario aún existe
    const [user] = await db.select().from(users).where(eq(users.id, payload.userId));
    
    if (!user) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
};

/**
 * Validar permisos para recurso específico
 */
export const hasPermission = (userRole: string, requiredPermissions: string[]): boolean => {
  const rolePermissions: Record<string, string[]> = {
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

export default {
  generateTokens,
  verifyToken,
  authenticateJWT,
  requireRole,
  requireAdmin,
  requireCertifier,
  requireNotary,
  requireLawyer,
  requirePartner,
  requirePosUser,
  requirePlatform,
  loginWithJWT,
  registerWithJWT,
  refreshAccessToken,
  getUserFromToken,
  hasPermission
};