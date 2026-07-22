"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.gamificationRouter = void 0;
const express_1 = require("express");
const gamificationService = __importStar(require("./services/gamification-service"));
const zod_1 = require("zod");
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("@shared/schema");
exports.gamificationRouter = (0, express_1.Router)();
// Middleware para asegurar que el usuario está autenticado
function isAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Debe iniciar sesión para acceder a esta funcionalidad" });
    }
    next();
}
// Middleware para asegurar que el usuario es administrador
function isAdmin(req, res, next) {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ error: "Acceso denegado. Se requiere rol de administrador." });
    }
    next();
}
// === Rutas para inicialización ===
// Inicializar datos de gamificación
exports.gamificationRouter.post("/init", isAdmin, async (req, res) => {
    try {
        await gamificationService.seedDefaultChallenges();
        await gamificationService.seedDefaultBadges();
        await gamificationService.seedDefaultRewards();
        res.status(200).json({
            message: "Datos de gamificación inicializados correctamente",
            success: true
        });
    }
    catch (error) {
        res.status(500).json({
            error: "Error al inicializar datos de gamificación",
            message: error.message
        });
    }
});
// === Rutas públicas ===
// Obtener tabla de clasificación
exports.gamificationRouter.get("/leaderboard/:period", async (req, res) => {
    try {
        const period = req.params.period;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        // Validar el periodo
        if (!["diario", "semanal", "mensual", "total"].includes(period)) {
            return res.status(400).json({ error: "Periodo no válido" });
        }
        const leaderboard = await gamificationService.getLeaderboard(period, limit);
        res.status(200).json(leaderboard);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// === Rutas para usuarios autenticados ===
// Obtener perfil de gamificación del usuario
exports.gamificationRouter.get("/profile", isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await gamificationService.getUserGameProfile(userId);
        if (!profile) {
            return res.status(404).json({ error: "Perfil no encontrado" });
        }
        res.status(200).json(profile);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Obtener posición del usuario en la tabla de clasificación
exports.gamificationRouter.get("/my-rank/:period", isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const period = req.params.period;
        // Validar el periodo
        if (!["diario", "semanal", "mensual", "total"].includes(period)) {
            return res.status(400).json({ error: "Periodo no válido" });
        }
        const ranking = await gamificationService.getUserLeaderboardPosition(userId, period);
        if (!ranking) {
            return res.status(404).json({ error: "No se encontraron datos de clasificación" });
        }
        res.status(200).json(ranking);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Obtener historial de actividades del usuario
// Obtener estadísticas de verificación
exports.gamificationRouter.get("/verification-stats", isAuthenticated, async (req, res) => {
    try {
        // Si es admin, puede obtener estadísticas globales
        if (req.user && req.user.role === 'admin' && req.query.global === 'true') {
            const stats = await gamificationService.getVerificationStats();
            return res.status(200).json(stats);
        }
        // Para usuarios normales, solo sus propias estadísticas
        // Usando non-null assertion (!) ya que isAuthenticated garantiza que req.user existe
        const stats = await gamificationService.getVerificationStats(req.user.id);
        res.status(200).json(stats);
    }
    catch (error) {
        res.status(500).json({
            error: "Error al obtener estadísticas de verificación",
            message: error.message
        });
    }
});
exports.gamificationRouter.get("/activities", isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = req.query.limit ? parseInt(req.query.limit) : 20;
        const activities = await gamificationService.getUserActivities(userId, limit);
        res.status(200).json(activities);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Procesar verificación de documento con gamificación
exports.gamificationRouter.post("/process-verification", isAuthenticated, async (req, res) => {
    try {
        const schema = zod_1.z.object({
            verificationCode: zod_1.z.string().min(1)
        });
        const validationResult = schema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ error: "Código de verificación requerido" });
        }
        const { verificationCode } = validationResult.data;
        const userId = req.user.id;
        const result = await gamificationService.processDocumentVerification(userId, verificationCode);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Endpoint alternativo de verificación para compatibilidad con el frontend
exports.gamificationRouter.post("/verify-document", isAuthenticated, async (req, res) => {
    try {
        const schema = zod_1.z.object({
            code: zod_1.z.string().min(1)
        });
        const validationResult = schema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ error: "Código de verificación requerido" });
        }
        const { code } = validationResult.data;
        const userId = req.user.id;
        const result = await gamificationService.processDocumentVerification(userId, code);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Obtener recompensas disponibles
exports.gamificationRouter.get("/rewards", isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const rewards = await gamificationService.getAvailableRewardsForUser(userId);
        res.status(200).json(rewards);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Reclamar una recompensa
exports.gamificationRouter.post("/claim-reward", isAuthenticated, async (req, res) => {
    try {
        const schema = zod_1.z.object({
            rewardId: zod_1.z.number().int().positive()
        });
        const validationResult = schema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ error: "ID de recompensa inválido" });
        }
        const { rewardId } = validationResult.data;
        const userId = req.user.id;
        const result = await gamificationService.claimReward(userId, rewardId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// === Rutas para administradores ===
// Administrar desafíos
// Crear desafío
exports.gamificationRouter.post("/challenges", isAdmin, async (req, res) => {
    try {
        const validationResult = schema_1.insertVerificationChallengeSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ error: "Datos de desafío inválidos" });
        }
        const challenge = await db_1.db.insert(schema_1.verificationChallenges)
            .values(validationResult.data)
            .returning();
        res.status(201).json(challenge[0]);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Obtener todos los desafíos
exports.gamificationRouter.get("/challenges", isAdmin, async (req, res) => {
    try {
        const challenges = await db_1.db.select().from(schema_1.verificationChallenges);
        res.status(200).json(challenges);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Actualizar desafío
exports.gamificationRouter.put("/challenges/:id", isAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const validationResult = schema_1.insertVerificationChallengeSchema.partial().safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ error: "Datos de desafío inválidos" });
        }
        const challenge = await db_1.db.update(schema_1.verificationChallenges)
            .set(validationResult.data)
            .where((0, drizzle_orm_1.eq)(schema_1.verificationChallenges.id, id))
            .returning();
        if (challenge.length === 0) {
            return res.status(404).json({ error: "Desafío no encontrado" });
        }
        res.status(200).json(challenge[0]);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Eliminar desafío
exports.gamificationRouter.delete("/challenges/:id", isAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await db_1.db.delete(schema_1.verificationChallenges)
            .where((0, drizzle_orm_1.eq)(schema_1.verificationChallenges.id, id))
            .returning();
        if (result.length === 0) {
            return res.status(404).json({ error: "Desafío no encontrado" });
        }
        res.status(200).json({ message: "Desafío eliminado correctamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Administrar insignias
// Crear insignia
exports.gamificationRouter.post("/badges", isAdmin, async (req, res) => {
    try {
        const validationResult = schema_1.insertVerificationBadgeSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ error: "Datos de insignia inválidos" });
        }
        const badge = await db_1.db.insert(schema_1.verificationBadges)
            .values(validationResult.data)
            .returning();
        res.status(201).json(badge[0]);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Obtener todas las insignias
exports.gamificationRouter.get("/badges", isAdmin, async (req, res) => {
    try {
        const badges = await db_1.db.select().from(schema_1.verificationBadges);
        res.status(200).json(badges);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Actualizar insignia
exports.gamificationRouter.put("/badges/:id", isAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const validationResult = schema_1.insertVerificationBadgeSchema.partial().safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ error: "Datos de insignia inválidos" });
        }
        const badge = await db_1.db.update(schema_1.verificationBadges)
            .set(validationResult.data)
            .where((0, drizzle_orm_1.eq)(schema_1.verificationBadges.id, id))
            .returning();
        if (badge.length === 0) {
            return res.status(404).json({ error: "Insignia no encontrada" });
        }
        res.status(200).json(badge[0]);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Eliminar insignia
exports.gamificationRouter.delete("/badges/:id", isAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await db_1.db.delete(schema_1.verificationBadges)
            .where((0, drizzle_orm_1.eq)(schema_1.verificationBadges.id, id))
            .returning();
        if (result.length === 0) {
            return res.status(404).json({ error: "Insignia no encontrada" });
        }
        res.status(200).json({ message: "Insignia eliminada correctamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Administrar recompensas
// Crear recompensa
exports.gamificationRouter.post("/rewards", isAdmin, async (req, res) => {
    try {
        const validationResult = schema_1.insertGamificationRewardSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ error: "Datos de recompensa inválidos" });
        }
        const reward = await db_1.db.insert(schema_1.gamificationRewards)
            .values(validationResult.data)
            .returning();
        res.status(201).json(reward[0]);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Obtener todas las recompensas
exports.gamificationRouter.get("/rewards-admin", isAdmin, async (req, res) => {
    try {
        const rewards = await db_1.db.select().from(schema_1.gamificationRewards);
        res.status(200).json(rewards);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Actualizar recompensa
exports.gamificationRouter.put("/rewards/:id", isAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const validationResult = schema_1.insertGamificationRewardSchema.partial().safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ error: "Datos de recompensa inválidos" });
        }
        const reward = await db_1.db.update(schema_1.gamificationRewards)
            .set(validationResult.data)
            .where((0, drizzle_orm_1.eq)(schema_1.gamificationRewards.id, id))
            .returning();
        if (reward.length === 0) {
            return res.status(404).json({ error: "Recompensa no encontrada" });
        }
        res.status(200).json(reward[0]);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Eliminar recompensa
exports.gamificationRouter.delete("/rewards/:id", isAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await db_1.db.delete(schema_1.gamificationRewards)
            .where((0, drizzle_orm_1.eq)(schema_1.gamificationRewards.id, id))
            .returning();
        if (result.length === 0) {
            return res.status(404).json({ error: "Recompensa no encontrada" });
        }
        res.status(200).json({ message: "Recompensa eliminada correctamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
