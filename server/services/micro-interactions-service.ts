import { db } from '../db';
import { eq, and, gte, lt, sql } from 'drizzle-orm';
import { 
  MicroInteraction, 
  InsertMicroInteraction,
  UserInteractionHistory,
  InsertUserInteractionHistory,
  QuickAchievement,
  UserAchievementProgress,
  InsertUserAchievementProgress,
  microInteractions,
  userInteractionHistory,
  quickAchievements,
  userAchievementProgress,
  userGameProfiles,
  gamificationActivities
} from '@shared/schema';

/**
 * Servicio para gestionar las micro-interacciones del sistema
 * 
 * Este servicio maneja:
 * - Creación y gestión de micro-interacciones
 * - Activación de micro-interacciones basadas en eventos
 * - Registro de interacciones de usuario
 * - Gestión de logros rápidos
 */
export class MicroInteractionsService {
  /**
   * Crea una nueva micro-interacción en el sistema
   */
  async createMicroInteraction(interaction: InsertMicroInteraction): Promise<MicroInteraction> {
    const [newInteraction] = await db
      .insert(microInteractions)
      .values(interaction)
      .returning();
    
    return newInteraction;
  }
  
  /**
   * Obtiene todas las micro-interacciones
   */
  async getAllMicroInteractions(): Promise<MicroInteraction[]> {
    return await db.select().from(microInteractions);
  }
  
  /**
   * Obtiene micro-interacciones para un tipo de evento específico
   */
  async getMicroInteractionsByEvent(triggerEvent: string): Promise<MicroInteraction[]> {
    return await db
      .select()
      .from(microInteractions)
      .where(and(
        eq(microInteractions.triggerEvent, triggerEvent),
        eq(microInteractions.isActive, true)
      ));
  }
  
  /**
   * Detecta y activa micro-interacciones basadas en un evento
   * Registra la interacción en el historial del usuario si es necesario
   * Retorna las interacciones activadas para ser mostradas al usuario
   */
  async triggerInteractions(userId: number, eventType: string, context: any = {}): Promise<MicroInteraction[]> {
    // 1. Obtener todas las micro-interacciones aplicables a este evento
    const availableInteractions = await this.getMicroInteractionsByEvent(eventType);
    
    if (!availableInteractions.length) {
      return [];
    }
    
    // 2. Filtrar interacciones según nivel de usuario y frecuencia
    const userProfile = await this.getUserGameProfile(userId);
    const userLevel = userProfile?.level || 1;
    
    // 3. Obtener historial reciente para verificar cooldowns
    const recentHistory = await db
      .select()
      .from(userInteractionHistory)
      .where(eq(userInteractionHistory.userId, userId))
      .orderBy(sql`${userInteractionHistory.triggeredAt} DESC`)
      .limit(50);
    
    // Identificar interacciones específicas que ya se han activado
    const recentInteractionIds = recentHistory.map(h => h.interactionId);
    
    // 4. Filtrar interacciones elegibles según reglas (nivel, frecuencia, cooldown)
    const eligibleInteractions = availableInteractions.filter(interaction => {
      // Verificar nivel requerido
      if (userLevel < interaction.requiredLevel) {
        return false;
      }
      
      // Verificar frecuencia
      if (interaction.frequency === 'once') {
        // Si ya se ha activado alguna vez, no activar de nuevo
        if (recentInteractionIds.includes(interaction.id)) {
          return false;
        }
      } else if (interaction.frequency === 'daily' || interaction.frequency === 'weekly') {
        // Verificar si ya se activó en el período actual
        const cooldownPeriod = interaction.frequency === 'daily' ? 24 * 60 * 60 : 7 * 24 * 60 * 60;
        const coolingInteraction = recentHistory.find(h => 
          h.interactionId === interaction.id && 
          (Date.now() - new Date(h.triggeredAt).getTime()) / 1000 < cooldownPeriod
        );
        
        if (coolingInteraction) {
          return false;
        }
      }
      
      // Verificar cooldown específico
      if (interaction.cooldownSeconds > 0) {
        const coolingInteraction = recentHistory.find(h => 
          h.interactionId === interaction.id && 
          (Date.now() - new Date(h.triggeredAt).getTime()) / 1000 < interaction.cooldownSeconds
        );
        
        if (coolingInteraction) {
          return false;
        }
      }
      
      return true;
    });
    
    // 5. Registrar interacciones activadas en el historial
    for (const interaction of eligibleInteractions) {
      await this.recordInteractionHistory(userId, interaction.id, interaction.pointsAwarded, context);
      
      // Si otorga puntos, actualizar el perfil del usuario
      if (interaction.pointsAwarded > 0) {
        await this.awardPoints(userId, interaction.pointsAwarded, `Micro-interacción: ${interaction.name}`);
      }
    }
    
    return eligibleInteractions;
  }
  
  /**
   * Registra una interacción en el historial del usuario
   */
  async recordInteractionHistory(
    userId: number, 
    interactionId: number, 
    pointsAwarded: number = 0,
    context: any = {}
  ): Promise<UserInteractionHistory> {
    const [record] = await db
      .insert(userInteractionHistory)
      .values({
        userId,
        interactionId,
        pointsAwarded,
        context,
        viewed: true
      })
      .returning();
    
    return record;
  }
  
  /**
   * Obtiene el historial de interacciones de un usuario
   */
  async getUserInteractionHistory(userId: number, limit: number = 50): Promise<any[]> {
    // Obtener historial con detalles de cada interacción
    const history = await db
      .select({
        id: userInteractionHistory.id,
        userId: userInteractionHistory.userId,
        interactionId: userInteractionHistory.interactionId,
        triggeredAt: userInteractionHistory.triggeredAt,
        pointsAwarded: userInteractionHistory.pointsAwarded,
        context: userInteractionHistory.context,
        viewed: userInteractionHistory.viewed,
        interactionName: microInteractions.name,
        interactionType: microInteractions.type,
        displayMessage: microInteractions.displayMessage,
        visualAsset: microInteractions.visualAsset
      })
      .from(userInteractionHistory)
      .innerJoin(
        microInteractions,
        eq(userInteractionHistory.interactionId, microInteractions.id)
      )
      .where(
        and(
          eq(userInteractionHistory.userId, userId),
          eq(microInteractions.showInHistory, true)
        )
      )
      .orderBy(sql`${userInteractionHistory.triggeredAt} DESC`)
      .limit(limit);
    
    return history;
  }
  
  /**
   * Crea un nuevo logro rápido
   */
  async createQuickAchievement(achievement: any): Promise<QuickAchievement> {
    const [newAchievement] = await db
      .insert(quickAchievements)
      .values(achievement)
      .returning();
    
    return newAchievement;
  }
  
  /**
   * Verifica y actualiza los logros rápidos del usuario
   * Retorna los logros que se han desbloqueado en esta actualización
   */
  async checkAndUpdateAchievements(userId: number): Promise<QuickAchievement[]> {
    // 1. Obtener todos los logros activos
    const allAchievements = await db
      .select()
      .from(quickAchievements)
      .where(eq(quickAchievements.isActive, true));
    
    // 2. Obtener el progreso actual del usuario
    const userProgress = await db
      .select()
      .from(userAchievementProgress)
      .where(eq(userAchievementProgress.userId, userId));
    
    // Mapear progreso para acceso rápido
    const progressMap = new Map();
    userProgress.forEach(progress => {
      progressMap.set(progress.achievementId, progress);
    });
    
    // 3. Obtener el perfil de juego del usuario
    const userProfile = await this.getUserGameProfile(userId);
    if (!userProfile) {
      return [];
    }
    
    // 4. Verificar cada logro
    const newlyUnlockedAchievements: QuickAchievement[] = [];
    const achievementsToUpdate: InsertUserAchievementProgress[] = [];
    
    for (const achievement of allAchievements) {
      // Verificar si ya está registrado en el progreso
      let currentProgress = progressMap.get(achievement.id);
      
      // Si no hay progreso, crear uno nuevo
      if (!currentProgress) {
        currentProgress = {
          userId,
          achievementId: achievement.id,
          currentValue: 0,
          unlocked: false
        };
      }
      
      // Omitir si ya está desbloqueado
      if (currentProgress.unlocked) {
        continue;
      }
      
      // Determinar el valor actual según el tipo de métrica
      let newValue = currentProgress.currentValue;
      
      switch (achievement.metricType) {
        case 'consecutive_days':
          newValue = userProfile.consecutiveDays;
          break;
        case 'verifications':
          newValue = userProfile.totalVerifications;
          break;
        case 'total_points':
          newValue = userProfile.totalPoints;
          break;
        case 'level':
          newValue = userProfile.level;
          break;
        // Añadir más métricas según sea necesario
      }
      
      // Actualizar el valor actual
      currentProgress.currentValue = newValue;
      
      // Verificar si se ha alcanzado el umbral
      if (newValue >= achievement.threshold) {
        currentProgress.unlocked = true;
        currentProgress.unlockedAt = new Date();
        
        // Agregar a la lista de logros desbloqueados
        newlyUnlockedAchievements.push(achievement);
        
        // Otorgar puntos por desbloquear el logro
        if (achievement.rewardPoints > 0) {
          await this.awardPoints(
            userId, 
            achievement.rewardPoints, 
            `Logro desbloqueado: ${achievement.name}`
          );
        }
      }
      
      // Agregar a la lista para actualizar
      achievementsToUpdate.push(currentProgress);
    }
    
    // 5. Actualizar el progreso en la base de datos
    for (const progress of achievementsToUpdate) {
      if (progressMap.has(progress.achievementId)) {
        // Actualizar existente
        await db
          .update(userAchievementProgress)
          .set({
            currentValue: progress.currentValue,
            unlocked: progress.unlocked,
            unlockedAt: progress.unlockedAt,
            lastUpdated: new Date()
          })
          .where(
            and(
              eq(userAchievementProgress.userId, userId),
              eq(userAchievementProgress.achievementId, progress.achievementId)
            )
          );
      } else {
        // Insertar nuevo
        await db
          .insert(userAchievementProgress)
          .values({
            ...progress,
            lastUpdated: new Date()
          });
      }
    }
    
    return newlyUnlockedAchievements;
  }
  
  /**
   * Obtiene los logros rápidos desbloqueados por un usuario
   */
  async getUserAchievements(userId: number): Promise<any[]> {
    const achievements = await db
      .select({
        id: quickAchievements.id,
        name: quickAchievements.name,
        description: quickAchievements.description,
        icon: quickAchievements.icon,
        threshold: quickAchievements.threshold,
        metricType: quickAchievements.metricType,
        rewardPoints: quickAchievements.rewardPoints,
        level: quickAchievements.level,
        currentValue: userAchievementProgress.currentValue,
        unlocked: userAchievementProgress.unlocked,
        unlockedAt: userAchievementProgress.unlockedAt,
        progress: sql`(${userAchievementProgress.currentValue} * 100.0 / ${quickAchievements.threshold})`.as('progress')
      })
      .from(quickAchievements)
      .leftJoin(
        userAchievementProgress,
        and(
          eq(userAchievementProgress.achievementId, quickAchievements.id),
          eq(userAchievementProgress.userId, userId)
        )
      )
      .where(eq(quickAchievements.isActive, true))
      .orderBy(quickAchievements.level);
    
    return achievements;
  }
  
  /**
   * Obtiene información pública de un logro para compartir
   * Solo retorna información que puede ser vista públicamente
   */
  async getPublicAchievementInfo(achievementId: number): Promise<any> {
    try {
      // Obtener el logro y el usuario que lo ha desbloqueado
      const [achievementInfo] = await db
        .select({
          id: quickAchievements.id,
          name: quickAchievements.name,
          description: quickAchievements.description,
          level: quickAchievements.level,
          rewardPoints: quickAchievements.rewardPoints,
          userId: userAchievementProgress.userId,
          unlockedAt: userAchievementProgress.unlockedAt
        })
        .from(quickAchievements)
        .innerJoin(
          userAchievementProgress,
          and(
            eq(userAchievementProgress.achievementId, quickAchievements.id),
            eq(userAchievementProgress.unlocked, true)
          )
        )
        .where(
          and(
            eq(quickAchievements.id, achievementId),
            eq(quickAchievements.isActive, true)
          )
        );
      
      if (!achievementInfo) {
        return null;
      }
      
      // Obtener información básica del usuario (solo nombre de usuario)
      const result = await db
        .execute(sql`
          SELECT username FROM users WHERE id = ${achievementInfo.userId}
        `);
      
      const userInfo = Array.isArray(result) && result.length > 0 ? result[0] : null;
      
      // Construir objeto de respuesta con información limitada
      const publicInfo = {
        id: achievementInfo.id,
        name: achievementInfo.name,
        description: achievementInfo.description,
        level: achievementInfo.level,
        rewardPoints: achievementInfo.rewardPoints,
        unlockedAt: achievementInfo.unlockedAt,
        userName: userInfo?.username || 'Usuario Cerfidoc',
        // Generar URL de la insignia basada en el ID del logro
        badgeImageUrl: `/api/micro-interactions/badges/${achievementInfo.id}.png`
      };
      
      return publicInfo;
    } catch (error) {
      console.error('Error obteniendo información pública del logro:', error);
      return null;
    }
  }
  
  /**
   * Obtiene el perfil de juego de un usuario
   */
  private async getUserGameProfile(userId: number) {
    const [profile] = await db
      .select()
      .from(userGameProfiles)
      .where(eq(userGameProfiles.userId, userId));
    
    return profile;
  }
  
  /**
   * Otorga puntos a un usuario y registra la actividad
   */
  private async awardPoints(userId: number, points: number, description: string) {
    // 1. Actualizar el perfil de juego
    await db
      .update(userGameProfiles)
      .set({
        totalPoints: sql`${userGameProfiles.totalPoints} + ${points}`,
        updatedAt: new Date()
      })
      .where(eq(userGameProfiles.userId, userId));
    
    // 2. Registrar la actividad
    await db
      .insert(gamificationActivities)
      .values({
        userId,
        activityType: 'micro_interaction',
        description,
        pointsEarned: points
      });
  }
}

export const microInteractionsService = new MicroInteractionsService();