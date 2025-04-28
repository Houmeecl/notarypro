import { Router, Request, Response } from "express";
import * as gamificationService from "./services/gamification-service";
import { z } from "zod";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { 
  insertVerificationChallengeSchema, 
  insertVerificationBadgeSchema, 
  insertGamificationRewardSchema,
  verificationChallenges,
  verificationBadges,
  gamificationRewards
} from "@shared/schema";

export const gamificationRouter = Router();

// Middleware para asegurar que el usuario está autenticado
function isAuthenticated(req: Request, res: Response, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Debe iniciar sesión para acceder a esta funcionalidad" });
  }
  next();
}

// Middleware para asegurar que el usuario es administrador
function isAdmin(req: Request, res: Response, next: any) {
  if (!req.isAuthenticated() || req.user.role !== "admin") {
    return res.status(403).json({ error: "Acceso denegado. Se requiere rol de administrador." });
  }
  next();
}

// === Rutas para inicialización ===

// Inicializar datos de gamificación
gamificationRouter.post("/init", isAdmin, async (req, res) => {
  try {
    await gamificationService.seedDefaultChallenges();
    await gamificationService.seedDefaultBadges();
    await gamificationService.seedDefaultRewards();
    
    res.status(200).json({ 
      message: "Datos de gamificación inicializados correctamente",
      success: true
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: "Error al inicializar datos de gamificación",
      message: error.message 
    });
  }
});

// === Rutas públicas ===

// Obtener tabla de clasificación
gamificationRouter.get("/leaderboard/:period", async (req, res) => {
  try {
    const period = req.params.period;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    // Validar el periodo
    if (!["diario", "semanal", "mensual", "total"].includes(period)) {
      return res.status(400).json({ error: "Periodo no válido" });
    }
    
    const leaderboard = await gamificationService.getLeaderboard(period, limit);
    res.status(200).json(leaderboard);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// === Rutas para usuarios autenticados ===

// Obtener perfil de gamificación del usuario
gamificationRouter.get("/profile", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const profile = await gamificationService.getUserGameProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }
    
    res.status(200).json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener posición del usuario en la tabla de clasificación
gamificationRouter.get("/my-rank/:period", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener historial de actividades del usuario
// Obtener estadísticas de verificación
gamificationRouter.get("/verification-stats", isAuthenticated, async (req, res) => {
  try {
    // Si es admin, puede obtener estadísticas globales
    if (req.user && req.user.role === 'admin' && req.query.global === 'true') {
      const stats = await gamificationService.getVerificationStats();
      return res.status(200).json(stats);
    }
    
    // Para usuarios normales, solo sus propias estadísticas
    // Usando non-null assertion (!) ya que isAuthenticated garantiza que req.user existe
    const stats = await gamificationService.getVerificationStats(req.user!.id);
    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({ 
      error: "Error al obtener estadísticas de verificación",
      message: error.message 
    });
  }
});

gamificationRouter.get("/activities", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    
    const activities = await gamificationService.getUserActivities(userId, limit);
    res.status(200).json(activities);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Procesar verificación de documento con gamificación
gamificationRouter.post("/process-verification", isAuthenticated, async (req, res) => {
  try {
    const schema = z.object({
      verificationCode: z.string().min(1)
    });
    
    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: "Código de verificación requerido" });
    }
    
    const { verificationCode } = validationResult.data;
    const userId = req.user!.id;
    
    const result = await gamificationService.processDocumentVerification(userId, verificationCode);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint alternativo de verificación para compatibilidad con el frontend
gamificationRouter.post("/verify-document", isAuthenticated, async (req, res) => {
  try {
    const schema = z.object({
      code: z.string().min(1)
    });
    
    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: "Código de verificación requerido" });
    }
    
    const { code } = validationResult.data;
    const userId = req.user!.id;
    
    const result = await gamificationService.processDocumentVerification(userId, code);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener recompensas disponibles
gamificationRouter.get("/rewards", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const rewards = await gamificationService.getAvailableRewardsForUser(userId);
    res.status(200).json(rewards);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reclamar una recompensa
gamificationRouter.post("/claim-reward", isAuthenticated, async (req, res) => {
  try {
    const schema = z.object({
      rewardId: z.number().int().positive()
    });
    
    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: "ID de recompensa inválido" });
    }
    
    const { rewardId } = validationResult.data;
    const userId = req.user!.id;
    
    const result = await gamificationService.claimReward(userId, rewardId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// === Rutas para administradores ===

// Administrar desafíos

// Crear desafío
gamificationRouter.post("/challenges", isAdmin, async (req, res) => {
  try {
    const validationResult = insertVerificationChallengeSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: "Datos de desafío inválidos" });
    }
    
    const challenge = await db.insert(verificationChallenges)
      .values(validationResult.data)
      .returning();
    
    res.status(201).json(challenge[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los desafíos
gamificationRouter.get("/challenges", isAdmin, async (req, res) => {
  try {
    const challenges = await db.select().from(verificationChallenges);
    res.status(200).json(challenges);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar desafío
gamificationRouter.put("/challenges/:id", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validationResult = insertVerificationChallengeSchema.partial().safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: "Datos de desafío inválidos" });
    }
    
    const challenge = await db.update(verificationChallenges)
      .set(validationResult.data)
      .where(eq(verificationChallenges.id, id))
      .returning();
    
    if (challenge.length === 0) {
      return res.status(404).json({ error: "Desafío no encontrado" });
    }
    
    res.status(200).json(challenge[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar desafío
gamificationRouter.delete("/challenges/:id", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const result = await db.delete(verificationChallenges)
      .where(eq(verificationChallenges.id, id))
      .returning();
    
    if (result.length === 0) {
      return res.status(404).json({ error: "Desafío no encontrado" });
    }
    
    res.status(200).json({ message: "Desafío eliminado correctamente" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Administrar insignias

// Crear insignia
gamificationRouter.post("/badges", isAdmin, async (req, res) => {
  try {
    const validationResult = insertVerificationBadgeSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: "Datos de insignia inválidos" });
    }
    
    const badge = await db.insert(verificationBadges)
      .values(validationResult.data)
      .returning();
    
    res.status(201).json(badge[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todas las insignias
gamificationRouter.get("/badges", isAdmin, async (req, res) => {
  try {
    const badges = await db.select().from(verificationBadges);
    res.status(200).json(badges);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar insignia
gamificationRouter.put("/badges/:id", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validationResult = insertVerificationBadgeSchema.partial().safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: "Datos de insignia inválidos" });
    }
    
    const badge = await db.update(verificationBadges)
      .set(validationResult.data)
      .where(eq(verificationBadges.id, id))
      .returning();
    
    if (badge.length === 0) {
      return res.status(404).json({ error: "Insignia no encontrada" });
    }
    
    res.status(200).json(badge[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar insignia
gamificationRouter.delete("/badges/:id", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const result = await db.delete(verificationBadges)
      .where(eq(verificationBadges.id, id))
      .returning();
    
    if (result.length === 0) {
      return res.status(404).json({ error: "Insignia no encontrada" });
    }
    
    res.status(200).json({ message: "Insignia eliminada correctamente" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Administrar recompensas

// Crear recompensa
gamificationRouter.post("/rewards", isAdmin, async (req, res) => {
  try {
    const validationResult = insertGamificationRewardSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: "Datos de recompensa inválidos" });
    }
    
    const reward = await db.insert(gamificationRewards)
      .values(validationResult.data)
      .returning();
    
    res.status(201).json(reward[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todas las recompensas
gamificationRouter.get("/rewards-admin", isAdmin, async (req, res) => {
  try {
    const rewards = await db.select().from(gamificationRewards);
    res.status(200).json(rewards);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar recompensa
gamificationRouter.put("/rewards/:id", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validationResult = insertGamificationRewardSchema.partial().safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: "Datos de recompensa inválidos" });
    }
    
    const reward = await db.update(gamificationRewards)
      .set(validationResult.data)
      .where(eq(gamificationRewards.id, id))
      .returning();
    
    if (reward.length === 0) {
      return res.status(404).json({ error: "Recompensa no encontrada" });
    }
    
    res.status(200).json(reward[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar recompensa
gamificationRouter.delete("/rewards/:id", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const result = await db.delete(gamificationRewards)
      .where(eq(gamificationRewards.id, id))
      .returning();
    
    if (result.length === 0) {
      return res.status(404).json({ error: "Recompensa no encontrada" });
    }
    
    res.status(200).json({ message: "Recompensa eliminada correctamente" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});