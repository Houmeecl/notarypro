"use strict";
/**
 * Rutas de API para la gestión de integraciones de API externas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAdminApiRoutes = registerAdminApiRoutes;
const api_integration_service_1 = require("../services/api-integration-service");
/**
 * Verificar si el usuario es administrador
 */
function isAdmin(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'No autenticado' });
    }
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado: se requiere rol de administrador' });
    }
    next();
}
function registerAdminApiRoutes(app) {
    // Obtener estado de todas las integraciones
    app.get('/api/admin/integrations/status', isAdmin, async (req, res) => {
        try {
            const status = await (0, api_integration_service_1.getIntegrationsStatus)();
            res.json({ status });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
    // Obtener configuración de una integración
    app.get('/api/admin/integrations/:apiId/config', isAdmin, async (req, res) => {
        try {
            const { apiId } = req.params;
            const config = await (0, api_integration_service_1.getIntegrationConfig)(apiId);
            res.json(config);
        }
        catch (error) {
            res.status(404).json({ message: error.message });
        }
    });
    // Guardar configuración de una integración
    app.post('/api/admin/integrations/:apiId/config', isAdmin, async (req, res) => {
        try {
            const { apiId } = req.params;
            const config = req.body;
            const updatedIntegration = await (0, api_integration_service_1.saveIntegrationConfig)(apiId, config);
            res.json(updatedIntegration);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    });
    // Probar conexión con una integración
    app.post('/api/admin/integrations/:apiId/test', isAdmin, async (req, res) => {
        try {
            const { apiId } = req.params;
            const status = await (0, api_integration_service_1.testIntegrationConnection)(apiId);
            res.json({ status });
        }
        catch (error) {
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
            const status = await (0, api_integration_service_1.toggleIntegration)(apiId, enabled);
            res.json({ status });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    });
}
