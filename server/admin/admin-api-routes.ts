/**
 * Rutas de API para la gestión de integraciones de API externas
 */

import { Express, Request, Response } from 'express';
import {
  getIntegrationsStatus,
  saveIntegrationConfig,
  testIntegrationConnection,
  toggleIntegration,
  getIntegrationConfig
} from '../services/api-integration-service';

/**
 * Verificar si el usuario es administrador
 */
function isAdmin(req: Request, res: Response, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'No autenticado' });
  }
  
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado: se requiere rol de administrador' });
  }
  
  next();
}

export function registerAdminApiRoutes(app: Express) {
  // Obtener estado de todas las integraciones
  app.get('/api/admin/integrations/status', isAdmin, async (req, res) => {
    try {
      const status = await getIntegrationsStatus();
      res.json({ status });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Obtener configuración de una integración
  app.get('/api/admin/integrations/:apiId/config', isAdmin, async (req, res) => {
    try {
      const { apiId } = req.params;
      const config = await getIntegrationConfig(apiId);
      res.json(config);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  });
  
  // Guardar configuración de una integración
  app.post('/api/admin/integrations/:apiId/config', isAdmin, async (req, res) => {
    try {
      const { apiId } = req.params;
      const config = req.body;
      
      const updatedIntegration = await saveIntegrationConfig(apiId, config);
      res.json(updatedIntegration);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Probar conexión con una integración
  app.post('/api/admin/integrations/:apiId/test', isAdmin, async (req, res) => {
    try {
      const { apiId } = req.params;
      const status = await testIntegrationConnection(apiId);
      res.json({ status });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Activar/desactivar una integración
  app.post('/api/admin/integrations/:apiId/toggle', isAdmin, async (req, res) => {
    try {
      const { apiId } = req.params;
      const { enabled } = req.body;
      
      if (typeof enabled !== 'boolean') {
        return res.status(400).json({ message: 'Se requiere el parámetro "enabled" (booleano)' });
      }
      
      const status = await toggleIntegration(apiId, enabled);
      res.json({ status });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
}