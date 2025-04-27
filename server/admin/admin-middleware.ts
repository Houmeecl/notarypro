import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para rutas administrativas
 * Verifica que el usuario esté autenticado y tenga rol de administrador
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Verificar que el usuario está autenticado
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      error: 'No autenticado',
      message: 'Debe iniciar sesión para acceder a esta funcionalidad'
    });
  }

  // Verificar que el usuario tiene rol de administrador
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Acceso denegado',
      message: 'No tiene permisos para acceder a esta funcionalidad'
    });
  }

  // Si todo está bien, continuar
  next();
}

/**
 * Middleware para verificar si el usuario es el super administrador
 * El super administrador es el único que puede realizar ciertas acciones críticas
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  // Verificar que es un administrador
  if (!req.isAuthenticated() || req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Acceso denegado',
      message: 'No tiene permisos para acceder a esta funcionalidad'
    });
  }

  // Verificar que es el super admin (Edwardadmin)
  if (req.user.username !== 'Edwardadmin') {
    return res.status(403).json({ 
      error: 'Acceso denegado',
      message: 'Esta acción solo puede ser realizada por el administrador principal'
    });
  }

  // Si todo está bien, continuar
  next();
}