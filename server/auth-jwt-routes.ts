/**
 * Rutas de Autenticación JWT - Sistema Unificado
 * APIs completas para login, registro, refresh token y gestión de usuarios
 */

import express, { Request, Response } from 'express';
import { 
  loginWithJWT, 
  registerWithJWT, 
  refreshAccessToken,
  authenticateJWT,
  requireAdmin,
  getUserFromToken,
  hasPermission
} from './services/jwt-auth-service';
import { db } from './db';
import { users } from './db';
import { eq, like, or } from 'drizzle-orm';

const authJwtRouter = express.Router();

/**
 * POST /api/auth/login
 * Login con JWT - Retorna access token y refresh token
 */
authJwtRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username y password son requeridos'
      });
    }

    const tokens = await loginWithJWT(username, password);

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

  } catch (error) {
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
authJwtRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, email, fullName, role, platform } = req.body;

    if (!username || !password || !email || !fullName) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos: username, password, email, fullName'
      });
    }

    // Verificar si el usuario ya existe
    const [existingUser] = await db.select().from(users).where(
      or(
        eq(users.username, username),
        eq(users.email, email)
      )
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Usuario o email ya existe'
      });
    }

    const tokens = await registerWithJWT({
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

  } catch (error) {
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
authJwtRouter.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies?.refresh_token;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token requerido'
      });
    }

    const { accessToken } = await refreshAccessToken(refreshToken);

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

  } catch (error) {
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
authJwtRouter.post('/logout', (req: Request, res: Response) => {
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
authJwtRouter.get('/me', authenticateJWT, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    // Obtener información actualizada del usuario
    const [user] = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      platform: users.platform,
      createdAt: users.createdAt
    }).from(users).where(eq(users.id, req.user.userId));

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

  } catch (error) {
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
authJwtRouter.get('/verify-token', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.substring(7) || req.cookies?.access_token;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token requerido'
      });
    }

    const userPayload = await getUserFromToken(token);

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

  } catch (error) {
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
authJwtRouter.get('/permissions', authenticateJWT, (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    const rolePermissions: Record<string, string[]> = {
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

  } catch (error) {
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
authJwtRouter.put('/change-password', authenticateJWT, async (req: Request, res: Response) => {
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
    const [user] = await db.select().from(users).where(eq(users.id, req.user.userId));

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const { comparePassword, hashPassword } = await import('./auth');
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
    await db.update(users)
      .set({ password: hashedNewPassword })
      .where(eq(users.id, req.user.userId));

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cambiar contraseña'
    });
  }
});

export { authJwtRouter };