"use strict";
/**
 * Rutas de API para la gestión de integraciones de API externas
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAdminApiRoutes = registerAdminApiRoutes;
const api_integration_service_1 = require("../services/api-integration-service");
/**
 * Verificar si el usuario es administrador
 */
function isAdmin(req, res, next) {
    var _a;
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'No autenticado' });
    }
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado: se requiere rol de administrador' });
    }
    next();
}
function registerAdminApiRoutes(app) {
    // Obtener estado de todas las integraciones
    app.get('/api/admin/integrations/status', isAdmin, (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const status = yield (0, api_integration_service_1.getIntegrationsStatus)();
            res.json({ status });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }));
    // Obtener configuración de una integración
    app.get('/api/admin/integrations/:apiId/config', isAdmin, (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { apiId } = req.params;
            const config = yield (0, api_integration_service_1.getIntegrationConfig)(apiId);
            res.json(config);
        }
        catch (error) {
            res.status(404).json({ message: error.message });
        }
    }));
    // Guardar configuración de una integración
    app.post('/api/admin/integrations/:apiId/config', isAdmin, (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { apiId } = req.params;
            const config = req.body;
            const updatedIntegration = yield (0, api_integration_service_1.saveIntegrationConfig)(apiId, config);
            res.json(updatedIntegration);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }));
    // Probar conexión con una integración
    app.post('/api/admin/integrations/:apiId/test', isAdmin, (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { apiId } = req.params;
            const status = yield (0, api_integration_service_1.testIntegrationConnection)(apiId);
            res.json({ status });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }));
    // Activar/desactivar una integración
    app.post('/api/admin/integrations/:apiId/toggle', isAdmin, (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { apiId } = req.params;
            const { enabled } = req.body;
            if (typeof enabled !== 'boolean') {
                return res.status(400).json({ message: 'Se requiere el parámetro "enabled" (booleano)' });
            }
            const status = yield (0, api_integration_service_1.toggleIntegration)(apiId, enabled);
            res.json({ status });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }));
}
