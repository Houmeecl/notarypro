import { Router, Request, Response } from 'express';
import { microInteractionsService } from './services/micro-interactions-service';
import { z } from 'zod';
import { insertMicroInteractionSchema, insertQuickAchievementSchema } from '@shared/schema';

export const microInteractionsRouter = Router();

// Middleware para verificar autenticación
function isAuthenticated(req: Request, res: Response, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  next();
}

// Middleware para verificar rol de administrador
function isAdmin(req: Request, res: Response, next: any) {
  if (!req.isAuthenticated() || req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  next();
}

// ==== RUTAS PARA GESTIÓN DE MICRO-INTERACCIONES (ADMIN) ====

// Obtener todas las micro-interacciones
microInteractionsRouter.get('/micro-interactions', isAdmin, async (req, res) => {
  try {
    const interactions = await microInteractionsService.getAllMicroInteractions();
    res.status(200).json(interactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Crear una nueva micro-interacción
microInteractionsRouter.post('/micro-interactions', isAdmin, async (req, res) => {
  try {
    const validatedData = insertMicroInteractionSchema.parse(req.body);
    const newInteraction = await microInteractionsService.createMicroInteraction(validatedData);
    res.status(201).json(newInteraction);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Actualizar estado de una micro-interacción
microInteractionsRouter.patch('/micro-interactions/:id/toggle', isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive debe ser un valor booleano' });
    }
    
    // Obtener la interacción actual
    const interactions = await microInteractionsService.getAllMicroInteractions();
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==== RUTAS PARA LOGROS RÁPIDOS (ADMIN) ====

// Obtener todos los logros rápidos
microInteractionsRouter.get('/achievements', isAdmin, async (req, res) => {
  try {
    // Implementar método en servicio
    res.status(200).json({ message: "Función no implementada aún" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo logro rápido
microInteractionsRouter.post('/achievements', isAdmin, async (req, res) => {
  try {
    const validatedData = insertQuickAchievementSchema.parse(req.body);
    const newAchievement = await microInteractionsService.createQuickAchievement(validatedData);
    res.status(201).json(newAchievement);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// ==== RUTAS PARA USUARIOS ====

// Obtener historial de interacciones del usuario
microInteractionsRouter.get('/user/interaction-history', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const history = await microInteractionsService.getUserInteractionHistory(userId);
    res.status(200).json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener logros del usuario
microInteractionsRouter.get('/user/achievements', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const achievements = await microInteractionsService.getUserAchievements(userId);
    res.status(200).json(achievements);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Activar manualmente una interacción (solo para pruebas)
microInteractionsRouter.post('/trigger-interaction', isAuthenticated, async (req, res) => {
  try {
    const { eventType, context } = req.body;
    
    if (!eventType) {
      return res.status(400).json({ error: 'El tipo de evento es requerido' });
    }
    
    const userId = req.user!.id;
    const triggeredInteractions = await microInteractionsService.triggerInteractions(
      userId,
      eventType,
      context || {}
    );
    
    // Verificar y actualizar logros
    const unlockedAchievements = await microInteractionsService.checkAndUpdateAchievements(userId);
    
    res.status(200).json({
      triggered: triggeredInteractions,
      unlockedAchievements
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener información pública de un logro (para compartir)
microInteractionsRouter.get('/public/achievements/:id', async (req, res) => {
  try {
    const achievementId = parseInt(req.params.id);
    
    if (isNaN(achievementId)) {
      return res.status(400).json({ error: 'ID de logro inválido' });
    }
    
    // Acceder a información pública del logro 
    const achievement = await microInteractionsService.getPublicAchievementInfo(achievementId);
    
    if (!achievement) {
      return res.status(404).json({ error: 'Logro no encontrado' });
    }
    
    res.status(200).json(achievement);
  } catch (error: any) {
    console.error('Error obteniendo información pública del logro:', error);
    res.status(500).json({ error: error.message });
  }
});