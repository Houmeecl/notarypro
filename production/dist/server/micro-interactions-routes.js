"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.microInteractionsRouter = void 0;
const express_1 = require("express");
const micro_interactions_service_1 = require("./services/micro-interactions-service");
const zod_1 = require("zod");
const schema_1 = require("@shared/schema");
exports.microInteractionsRouter = (0, express_1.Router)();
// Middleware para verificar autenticación
function isAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'No autenticado' });
    }
    next();
}
// Middleware para verificar rol de administrador
function isAdmin(req, res, next) {
    if (!req.isAuthenticated() || req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
}
// ==== RUTAS PARA GESTIÓN DE MICRO-INTERACCIONES (ADMIN) ====
// Obtener todas las micro-interacciones
exports.microInteractionsRouter.get('/micro-interactions', isAdmin, async (req, res) => {
    try {
        const interactions = await micro_interactions_service_1.microInteractionsService.getAllMicroInteractions();
        res.status(200).json(interactions);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Crear una nueva micro-interacción
exports.microInteractionsRouter.post('/micro-interactions', isAdmin, async (req, res) => {
    try {
        const validatedData = schema_1.insertMicroInteractionSchema.parse(req.body);
        const newInteraction = await micro_interactions_service_1.microInteractionsService.createMicroInteraction(validatedData);
        res.status(201).json(newInteraction);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: error.message });
    }
});
// Actualizar estado de una micro-interacción
exports.microInteractionsRouter.patch('/micro-interactions/:id/toggle', isAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { isActive } = req.body;
        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ error: 'isActive debe ser un valor booleano' });
        }
        // Obtener la interacción actual
        const interactions = await micro_interactions_service_1.microInteractionsService.getAllMicroInteractions();
        const interaction = interactions.find(i => i.id === id);
        if (!interaction) {
            return res.status(404).json({ error: 'Micro-interacción no encontrada' });
        }
        // Actualizar el estado (implementar este método en el servicio)
        // Por ahora, simulamos la respuesta
        res.status(200).json({
            ...interaction,
            isActive
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ==== RUTAS PARA LOGROS RÁPIDOS (ADMIN) ====
// Obtener todos los logros rápidos
exports.microInteractionsRouter.get('/achievements', isAdmin, async (req, res) => {
    try {
        // Implementar método en servicio
        res.status(200).json({ message: "Función no implementada aún" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Crear un nuevo logro rápido
exports.microInteractionsRouter.post('/achievements', isAdmin, async (req, res) => {
    try {
        const validatedData = schema_1.insertQuickAchievementSchema.parse(req.body);
        const newAchievement = await micro_interactions_service_1.microInteractionsService.createQuickAchievement(validatedData);
        res.status(201).json(newAchievement);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: error.message });
    }
});
// ==== RUTAS PARA USUARIOS ====
// Obtener historial de interacciones del usuario
exports.microInteractionsRouter.get('/user/interaction-history', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const history = await micro_interactions_service_1.microInteractionsService.getUserInteractionHistory(userId);
        res.status(200).json(history);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Obtener logros del usuario
exports.microInteractionsRouter.get('/user/achievements', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const achievements = await micro_interactions_service_1.microInteractionsService.getUserAchievements(userId);
        res.status(200).json(achievements);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Activar manualmente una interacción (solo para pruebas)
exports.microInteractionsRouter.post('/trigger-interaction', isAuthenticated, async (req, res) => {
    try {
        const { eventType, context } = req.body;
        if (!eventType) {
            return res.status(400).json({ error: 'El tipo de evento es requerido' });
        }
        const userId = req.user.id;
        const triggeredInteractions = await micro_interactions_service_1.microInteractionsService.triggerInteractions(userId, eventType, context || {});
        // Verificar y actualizar logros
        const unlockedAchievements = await micro_interactions_service_1.microInteractionsService.checkAndUpdateAchievements(userId);
        res.status(200).json({
            triggered: triggeredInteractions,
            unlockedAchievements
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Obtener información pública de un logro (para compartir)
exports.microInteractionsRouter.get('/public/achievements/:id', async (req, res) => {
    try {
        const achievementId = parseInt(req.params.id);
        if (isNaN(achievementId)) {
            return res.status(400).json({ error: 'ID de logro inválido' });
        }
        // Acceder a información pública del logro 
        const achievement = await micro_interactions_service_1.microInteractionsService.getPublicAchievementInfo(achievementId);
        if (!achievement) {
            return res.status(404).json({ error: 'Logro no encontrado' });
        }
        res.status(200).json(achievement);
    }
    catch (error) {
        console.error('Error obteniendo información pública del logro:', error);
        res.status(500).json({ error: error.message });
    }
});
