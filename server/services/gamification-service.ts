import { db } from "../db";
import { 
  verificationChallenges, 
  userChallengeProgress, 
  verificationBadges, 
  userBadges, 
  userGameProfiles, 
  gamificationActivities,
  leaderboardEntries,
  gamificationRewards,
  userClaimedRewards,
  users,
  documents,
  InsertGamificationActivity,
  InsertUserChallengeProgress,
  InsertUserBadge,
  InsertLeaderboardEntry,
  InsertUserGameProfile
} from "@shared/schema";
import { eq, and, gte, lte, sql, desc, count } from "drizzle-orm";

/**
 * Servicio de gamificación para la verificación de documentos
 * Maneja la lógica para desafíos, insignias, puntos, niveles y tabla de clasificación
 */
class GamificationService {
  
  // === Métodos para inicialización y configuración ===
  
  /**
   * Inicializa el perfil de gamificación de un usuario
   * @param userId ID del usuario
   */
  async initializeUserGameProfile(userId: number): Promise<void> {
    const existingProfile = await db
      .select()
      .from(userGameProfiles)
      .where(eq(userGameProfiles.userId, userId));
    
    if (existingProfile.length === 0) {
      // Crear perfil inicial
      await db.insert(userGameProfiles).values({
        userId,
        totalPoints: 0,
        level: 1,
        consecutiveDays: 0,
        verificationStreak: 0,
        totalVerifications: 0,
        rank: "Novato",
        preferences: { notifications: true, publicProfile: true }
      });
      
      // Registrar actividad
      await this.logActivity({
        userId,
        activityType: "perfil_creado",
        description: "Perfil de gamificación creado",
        pointsEarned: 0,
        metadata: { initialLevel: 1 }
      });
    }
  }
  
  /**
   * Inicializa desafíos predeterminados
   */
  async seedDefaultChallenges(): Promise<void> {
    const existingChallenges = await db.select().from(verificationChallenges);
    
    if (existingChallenges.length === 0) {
      await db.insert(verificationChallenges).values([
        {
          title: "Primer Verificador",
          description: "Verifica tu primer documento correctamente",
          points: 50,
          requiredActions: JSON.stringify(["verificar_documento"]),
          completionCriteria: JSON.stringify({ verificaciones_requeridas: 1 }),
          difficultyLevel: 1,
          imageUrl: "/images/badges/first-verification.svg"
        },
        {
          title: "Verificador Experto",
          description: "Verifica 10 documentos correctamente",
          points: 200,
          requiredActions: JSON.stringify(["verificar_documento"]),
          completionCriteria: JSON.stringify({ verificaciones_requeridas: 10 }),
          difficultyLevel: 2,
          imageUrl: "/images/badges/expert-verifier.svg"
        },
        {
          title: "Racha Perfecta",
          description: "Verifica documentos 5 días consecutivos",
          points: 300,
          requiredActions: JSON.stringify(["verificar_documento"]),
          completionCriteria: JSON.stringify({ dias_consecutivos: 5 }),
          difficultyLevel: 3,
          imageUrl: "/images/badges/perfect-streak.svg"
        },
        {
          title: "Detective Digital",
          description: "Desafía a otro usuario a verificar un documento correctamente",
          points: 150,
          requiredActions: JSON.stringify(["invitar_verificacion"]),
          completionCriteria: JSON.stringify({ invitaciones_completadas: 1 }),
          difficultyLevel: 2,
          imageUrl: "/images/badges/digital-detective.svg"
        },
        {
          title: "Maestro Verificador",
          description: "Alcanza el nivel 10 en el sistema de verificación",
          points: 500,
          requiredActions: JSON.stringify(["subir_nivel"]),
          completionCriteria: JSON.stringify({ nivel_requerido: 10 }),
          difficultyLevel: 5,
          imageUrl: "/images/badges/master-verifier.svg"
        }
      ]);
    }
  }
  
  /**
   * Inicializa insignias predeterminadas
   */
  async seedDefaultBadges(): Promise<void> {
    const existingBadges = await db.select().from(verificationBadges);
    
    if (existingBadges.length === 0) {
      await db.insert(verificationBadges).values([
        {
          name: "Iniciado",
          description: "Completaste tu primera verificación",
          imageUrl: "/images/badges/bronze-badge.svg",
          requiredPoints: 50,
          tier: "bronce",
          isRare: false
        },
        {
          name: "Verificador Frecuente",
          description: "Has verificado más de 25 documentos",
          imageUrl: "/images/badges/silver-badge.svg",
          requiredPoints: 500,
          tier: "plata",
          isRare: false
        },
        {
          name: "Verificador Experto",
          description: "Has alcanzado el nivel 15 en verificaciones",
          imageUrl: "/images/badges/gold-badge.svg",
          requiredPoints: 2000,
          tier: "oro",
          isRare: false
        },
        {
          name: "Leyenda de la Verificación",
          description: "Has verificado más de 100 documentos",
          imageUrl: "/images/badges/platinum-badge.svg",
          requiredPoints: 5000,
          tier: "platino",
          isRare: true
        },
        {
          name: "Guardián de la Autenticidad",
          description: "Has mantenido una racha de verificación de 30 días",
          imageUrl: "/images/badges/diamond-badge.svg",
          requiredPoints: 10000,
          tier: "diamante",
          isRare: true
        }
      ]);
    }
  }
  
  /**
   * Inicializa recompensas predeterminadas
   */
  async seedDefaultRewards(): Promise<void> {
    const existingRewards = await db.select().from(gamificationRewards);
    
    if (existingRewards.length === 0) {
      await db.insert(gamificationRewards).values([
        {
          name: "Descuento 10%",
          description: "10% de descuento en tu próximo documento",
          rewardType: "descuento",
          value: 10,
          requiredPoints: 1000,
          isActive: true
        },
        {
          name: "Verificación Gratuita",
          description: "Una verificación de documento gratuita",
          rewardType: "credito",
          value: 1,
          requiredPoints: 2500,
          isActive: true
        },
        {
          name: "Descuento Premium",
          description: "25% de descuento en servicios premium",
          rewardType: "descuento",
          value: 25,
          requiredPoints: 5000,
          isActive: true
        },
        {
          name: "Membresía VIP",
          description: "Acceso a características exclusivas por 1 mes",
          rewardType: "virtual",
          requiredPoints: 10000,
          isActive: true
        }
      ]);
    }
  }
  
  // === Métodos para verificación de documentos ===
  
  /**
   * Procesa los puntos y desafíos cuando un usuario verifica un documento
   * @param userId ID del usuario
   * @param verificationCode Código de verificación
   * @returns Información sobre puntos ganados y desafíos completados
   */
  async processDocumentVerification(userId: number, verificationCode: string): Promise<{
    pointsEarned: number;
    completedChallenges: any[];
    newBadges: any[];
    levelUp: boolean;
    newLevel?: number;
  }> {
    // Inicializar resultados
    const result = {
      pointsEarned: 25, // Puntos base por verificar un documento
      completedChallenges: [],
      newBadges: [],
      levelUp: false
    };
    
    // Obtener o crear perfil de gamificación
    await this.initializeUserGameProfile(userId);
    
    // Obtener perfil actual
    const [profile] = await db
      .select()
      .from(userGameProfiles)
      .where(eq(userGameProfiles.userId, userId));
    
    // 1. Actualizar estadísticas básicas
    const updatedProfile = await this.updateUserStats(userId, "verificacion");
    
    // 2. Verificar y actualizar racha diaria
    await this.updateDailyStreak(userId);
    
    // 3. Comprobar desafíos completados
    const completedChallenges = await this.checkCompletedChallenges(userId);
    result.completedChallenges = completedChallenges;
    
    // Sumar puntos de desafíos completados
    completedChallenges.forEach(challenge => {
      result.pointsEarned += challenge.points;
    });
    
    // 4. Comprobar nuevas insignias
    const newBadges = await this.checkNewBadges(userId);
    result.newBadges = newBadges;
    
    // 5. Comprobar subida de nivel
    if (updatedProfile.level > profile.level) {
      result.levelUp = true;
      result.newLevel = updatedProfile.level;
      
      // Registrar actividad de subida de nivel
      await this.logActivity({
        userId,
        activityType: "nivel_subido",
        description: `¡Has subido al nivel ${updatedProfile.level}!`,
        pointsEarned: 100, // Bonus por subir de nivel
        metadata: { 
          oldLevel: profile.level,
          newLevel: updatedProfile.level
        }
      });
      
      // Añadir puntos adicionales por subir de nivel
      result.pointsEarned += 100;
    }
    
    // 6. Registrar actividad de verificación
    await this.logActivity({
      userId,
      activityType: "verificacion",
      description: "Documento verificado correctamente",
      pointsEarned: result.pointsEarned,
      metadata: { 
        verificationCode,
        challengesCompleted: completedChallenges.length,
        badgesEarned: newBadges.length
      }
    });
    
    // 7. Actualizar tabla de clasificación
    await this.updateLeaderboard(userId, result.pointsEarned);
    
    return result;
  }
  
  /**
   * Actualiza las estadísticas del usuario
   * @param userId ID del usuario
   * @param activityType Tipo de actividad
   */
  private async updateUserStats(userId: number, activityType: string): Promise<any> {
    const [profile] = await db
      .select()
      .from(userGameProfiles)
      .where(eq(userGameProfiles.userId, userId));
    
    if (!profile) {
      throw new Error("Perfil de usuario no encontrado");
    }
    
    // Calcular nuevos valores
    const pointsToAdd = activityType === "verificacion" ? 25 : 0;
    const totalPoints = profile.totalPoints + pointsToAdd;
    const totalVerifications = activityType === "verificacion" 
      ? profile.totalVerifications + 1 
      : profile.totalVerifications;
    
    // Calcular nuevo nivel (1 nivel cada 500 puntos)
    const newLevel = Math.floor(totalPoints / 500) + 1;
    
    // Determinar rango basado en nivel
    let newRank = profile.rank;
    if (newLevel >= 20) newRank = "Leyenda";
    else if (newLevel >= 15) newRank = "Maestro";
    else if (newLevel >= 10) newRank = "Experto";
    else if (newLevel >= 5) newRank = "Avanzado";
    else if (newLevel >= 2) newRank = "Aprendiz";
    
    // Actualizar perfil
    const [updatedProfile] = await db
      .update(userGameProfiles)
      .set({ 
        totalPoints,
        level: newLevel,
        totalVerifications,
        rank: newRank,
        lastActive: new Date(),
      })
      .where(eq(userGameProfiles.userId, userId))
      .returning();
    
    return updatedProfile;
  }
  
  /**
   * Actualiza la racha diaria de verificaciones
   * @param userId ID del usuario
   */
  private async updateDailyStreak(userId: number): Promise<void> {
    const [profile] = await db
      .select()
      .from(userGameProfiles)
      .where(eq(userGameProfiles.userId, userId));
    
    if (!profile) return;
    
    const now = new Date();
    const lastActive = profile.lastActive;
    
    // Calcular diferencia en días
    const diffTime = Math.abs(now.getTime() - lastActive.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let newStreak = profile.consecutiveDays;
    let newVerificationStreak = profile.verificationStreak;
    
    if (diffDays === 0) {
      // Misma fecha, no hacer nada
    } else if (diffDays === 1) {
      // Día consecutivo
      newStreak += 1;
      newVerificationStreak += 1;
    } else {
      // Racha interrumpida
      newStreak = 1;
      newVerificationStreak = 1;
    }
    
    // Actualizar perfil con nueva racha
    await db.update(userGameProfiles)
      .set({ 
        consecutiveDays: newStreak,
        verificationStreak: newVerificationStreak
      })
      .where(eq(userGameProfiles.userId, userId));
    
    // Si la racha alcanza ciertos hitos, otorgar puntos extra
    if (newStreak === 7 || newStreak === 30 || newStreak === 100) {
      const streakPoints = newStreak === 7 ? 100 : newStreak === 30 ? 300 : 1000;
      
      // Registrar logro de racha
      await this.logActivity({
        userId,
        activityType: "racha_lograda",
        description: `¡Has logrado una racha de ${newStreak} días!`,
        pointsEarned: streakPoints,
        metadata: { streakDays: newStreak }
      });
      
      // Actualizar puntos
      await db.update(userGameProfiles)
        .set({ totalPoints: sql`total_points + ${streakPoints}` })
        .where(eq(userGameProfiles.userId, userId));
    }
  }
  
  /**
   * Verifica los desafíos completados por el usuario
   * @param userId ID del usuario
   * @returns Lista de desafíos completados
   */
  private async checkCompletedChallenges(userId: number): Promise<any[]> {
    // Obtener perfil del usuario
    const [profile] = await db
      .select()
      .from(userGameProfiles)
      .where(eq(userGameProfiles.userId, userId));
    
    if (!profile) return [];
    
    // Obtener todos los desafíos activos
    const availableChallenges = await db
      .select()
      .from(verificationChallenges)
      .where(eq(verificationChallenges.isActive, true));
    
    // Obtener progreso actual del usuario
    const userProgress = await db
      .select()
      .from(userChallengeProgress)
      .where(eq(userChallengeProgress.userId, userId));
    
    const completedChallenges = [];
    
    // Verificar cada desafío
    for (const challenge of availableChallenges) {
      // Buscar si ya tiene progreso en este desafío
      const progress = userProgress.find(p => p.challengeId === challenge.id);
      
      // Si ya está completado, pasar al siguiente
      if (progress && progress.isCompleted) continue;
      
      const criteria = challenge.completionCriteria as any;
      let completed = false;
      
      // Lógica para verificar diferentes tipos de desafíos
      if (criteria.verificaciones_requeridas && profile.totalVerifications >= criteria.verificaciones_requeridas) {
        completed = true;
      } else if (criteria.dias_consecutivos && profile.consecutiveDays >= criteria.dias_consecutivos) {
        completed = true;
      } else if (criteria.nivel_requerido && profile.level >= criteria.nivel_requerido) {
        completed = true;
      }
      
      if (completed) {
        // Si es nuevo progreso, crearlo
        if (!progress) {
          await db.insert(userChallengeProgress).values({
            userId,
            challengeId: challenge.id,
            progress: { completed: true },
            isCompleted: true,
            completedAt: new Date(),
            awardedPoints: challenge.points
          });
        } else {
          // Actualizar progreso existente
          await db.update(userChallengeProgress)
            .set({ 
              isCompleted: true,
              completedAt: new Date(),
              awardedPoints: challenge.points,
              progress: { completed: true }
            })
            .where(
              and(
                eq(userChallengeProgress.userId, userId),
                eq(userChallengeProgress.challengeId, challenge.id)
              )
            );
        }
        
        // Añadir puntos
        await db.update(userGameProfiles)
          .set({ totalPoints: sql`total_points + ${challenge.points}` })
          .where(eq(userGameProfiles.userId, userId));
        
        // Registrar actividad
        await this.logActivity({
          userId,
          activityType: "desafio_completado",
          description: `¡Desafío completado: ${challenge.title}!`,
          pointsEarned: challenge.points,
          metadata: { challengeId: challenge.id }
        });
        
        completedChallenges.push(challenge);
      }
    }
    
    return completedChallenges;
  }
  
  /**
   * Verifica nuevas insignias ganadas por el usuario
   * @param userId ID del usuario
   * @returns Lista de nuevas insignias
   */
  private async checkNewBadges(userId: number): Promise<any[]> {
    // Obtener perfil del usuario
    const [profile] = await db
      .select()
      .from(userGameProfiles)
      .where(eq(userGameProfiles.userId, userId));
    
    if (!profile) return [];
    
    // Obtener todas las insignias disponibles
    const availableBadges = await db
      .select()
      .from(verificationBadges);
    
    // Obtener insignias actuales del usuario
    const userBadgesList = await db
      .select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId));
    
    const userBadgeIds = userBadgesList.map(b => b.badgeId);
    const newBadges = [];
    
    // Verificar cada insignia
    for (const badge of availableBadges) {
      // Si ya tiene la insignia, continuar
      if (userBadgeIds.includes(badge.id)) continue;
      
      // Verificar si cumple los requisitos
      if (profile.totalPoints >= badge.requiredPoints) {
        // Otorgar insignia
        await db.insert(userBadges).values({
          userId,
          badgeId: badge.id,
          earnedAt: new Date()
        });
        
        // Registrar actividad
        await this.logActivity({
          userId,
          activityType: "insignia_ganada",
          description: `¡Nueva insignia desbloqueada: ${badge.name}!`,
          pointsEarned: 50, // Puntos por ganar una insignia
          metadata: { badgeId: badge.id }
        });
        
        // Añadir puntos adicionales por la insignia
        await db.update(userGameProfiles)
          .set({ totalPoints: sql`total_points + 50` })
          .where(eq(userGameProfiles.userId, userId));
        
        newBadges.push(badge);
      }
    }
    
    return newBadges;
  }
  
  // === Métodos para tabla de clasificación ===
  
  /**
   * Actualiza la tabla de clasificación para un usuario
   * @param userId ID del usuario
   * @param pointsEarned Puntos ganados en la actividad actual
   */
  private async updateLeaderboard(userId: number, pointsEarned: number): Promise<void> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Primer día de la semana (domingo)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Estructuras para actualizar leaderboards
    const periods = [
      {
        period: "diario",
        periodStart: today,
        periodEnd: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1), // Fin del día
      },
      {
        period: "semanal",
        periodStart: weekStart,
        periodEnd: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1), // Fin de la semana
      },
      {
        period: "mensual",
        periodStart: monthStart,
        periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59), // Fin del mes
      },
      {
        period: "total",
        periodStart: new Date(2020, 0, 1), // Fecha inicial arbitraria
        periodEnd: new Date(2099, 11, 31), // Fecha final arbitraria
      }
    ];
    
    // Obtener región del usuario
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    const region = user ? user.region : null;
    
    // Actualizar cada periodo
    for (const p of periods) {
      // Buscar entrada existente
      const [entry] = await db
        .select()
        .from(leaderboardEntries)
        .where(
          and(
            eq(leaderboardEntries.userId, userId),
            eq(leaderboardEntries.period, p.period),
            gte(leaderboardEntries.periodEnd, now)
          )
        );
      
      if (entry) {
        // Actualizar entrada existente
        await db.update(leaderboardEntries)
          .set({ score: sql`score + ${pointsEarned}` })
          .where(eq(leaderboardEntries.id, entry.id));
      } else {
        // Crear nueva entrada
        const [profile] = await db
          .select()
          .from(userGameProfiles)
          .where(eq(userGameProfiles.userId, userId));
        
        // Para nuevas entradas en periodos diario/semanal/mensual, usar solo los puntos ganados ahora
        // Para el periodo "total", usar puntos totales del perfil
        const score = p.period === "total" && profile ? profile.totalPoints : pointsEarned;
        
        await db.insert(leaderboardEntries).values({
          userId,
          period: p.period,
          periodStart: p.periodStart,
          periodEnd: p.periodEnd,
          score,
          rank: 0, // Se actualizará después
          region
        });
      }
      
      // Recalcular rangos para este periodo
      await this.recalculateLeaderboardRanks(p.period, p.periodStart, p.periodEnd);
    }
  }
  
  /**
   * Recalcula los rangos en la tabla de clasificación
   * @param period Periodo (diario, semanal, mensual, total)
   * @param periodStart Fecha de inicio del periodo
   * @param periodEnd Fecha de fin del periodo
   */
  private async recalculateLeaderboardRanks(
    period: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<void> {
    // Obtener todas las entradas del periodo, ordenadas por puntuación
    const entries = await db
      .select()
      .from(leaderboardEntries)
      .where(
        and(
          eq(leaderboardEntries.period, period),
          eq(leaderboardEntries.periodStart, periodStart),
          eq(leaderboardEntries.periodEnd, periodEnd)
        )
      )
      .orderBy(desc(leaderboardEntries.score));
    
    // Actualizar rangos
    for (let i = 0; i < entries.length; i++) {
      const rank = i + 1;
      await db.update(leaderboardEntries)
        .set({ rank })
        .where(eq(leaderboardEntries.id, entries[i].id));
    }
  }
  
  /**
   * Obtiene la tabla de clasificación para un periodo
   * @param period Periodo (diario, semanal, mensual, total)
   * @param limit Límite de resultados
   * @param region Región opcional para filtrar
   * @returns Entradas de la tabla de clasificación
   */
  async getLeaderboard(period: string, limit: number = 10, region?: string): Promise<any[]> {
    const now = new Date();
    
    let query = db
      .select({
        entry: leaderboardEntries,
        user: {
          username: users.username,
          fullName: users.fullName
        },
        gameProfile: {
          level: userGameProfiles.level,
          rank: userGameProfiles.rank
        }
      })
      .from(leaderboardEntries)
      .innerJoin(users, eq(leaderboardEntries.userId, users.id))
      .leftJoin(userGameProfiles, eq(leaderboardEntries.userId, userGameProfiles.userId))
      .where(
        and(
          eq(leaderboardEntries.period, period),
          gte(leaderboardEntries.periodEnd, now)
        )
      );
    
    if (region) {
      query = query.where(eq(leaderboardEntries.region, region));
    }
    
    const results = await query
      .orderBy(leaderboardEntries.rank)
      .limit(limit);
    
    return results;
  }
  
  /**
   * Obtiene la posición de un usuario en la tabla de clasificación
   * @param userId ID del usuario
   * @param period Periodo (diario, semanal, mensual, total)
   * @returns Información de clasificación del usuario
   */
  async getUserLeaderboardPosition(userId: number, period: string): Promise<any> {
    const now = new Date();
    
    const [entry] = await db
      .select()
      .from(leaderboardEntries)
      .where(
        and(
          eq(leaderboardEntries.userId, userId),
          eq(leaderboardEntries.period, period),
          gte(leaderboardEntries.periodEnd, now)
        )
      );
    
    if (!entry) {
      return null;
    }
    
    // Obtener total de participantes
    const [result] = await db
      .select({ count: count() })
      .from(leaderboardEntries)
      .where(
        and(
          eq(leaderboardEntries.period, period),
          gte(leaderboardEntries.periodEnd, now)
        )
      );
    
    const totalParticipants = result ? result.count : 0;
    
    return {
      ...entry,
      totalParticipants
    };
  }
  
  // === Métodos para recompensas ===
  
  /**
   * Obtiene las recompensas disponibles para un usuario
   * @param userId ID del usuario
   * @returns Lista de recompensas disponibles
   */
  async getAvailableRewards(userId: number): Promise<any[]> {
    // Obtener perfil del usuario
    const [profile] = await db
      .select()
      .from(userGameProfiles)
      .where(eq(userGameProfiles.userId, userId));
    
    if (!profile) return [];
    
    // Obtener recompensas activas
    const rewards = await db
      .select()
      .from(gamificationRewards)
      .where(eq(gamificationRewards.isActive, true));
    
    // Filtrar por puntos requeridos
    return rewards.filter(reward => profile.totalPoints >= reward.requiredPoints);
  }
  
  /**
   * Reclama una recompensa para un usuario
   * @param userId ID del usuario
   * @param rewardId ID de la recompensa
   * @returns Información sobre la recompensa reclamada
   */
  async claimReward(userId: number, rewardId: number): Promise<any> {
    // Verificar que la recompensa existe y está activa
    const [reward] = await db
      .select()
      .from(gamificationRewards)
      .where(
        and(
          eq(gamificationRewards.id, rewardId),
          eq(gamificationRewards.isActive, true)
        )
      );
    
    if (!reward) {
      throw new Error("Recompensa no encontrada o no disponible");
    }
    
    // Verificar que el usuario tiene puntos suficientes
    const [profile] = await db
      .select()
      .from(userGameProfiles)
      .where(eq(userGameProfiles.userId, userId));
    
    if (!profile || profile.totalPoints < reward.requiredPoints) {
      throw new Error("Puntos insuficientes para reclamar esta recompensa");
    }
    
    // Verificar que no ha reclamado ya esta recompensa
    const existingClaim = await db
      .select()
      .from(userClaimedRewards)
      .where(
        and(
          eq(userClaimedRewards.userId, userId),
          eq(userClaimedRewards.rewardId, rewardId),
          eq(userClaimedRewards.status, "pending")
        )
      );
    
    if (existingClaim.length > 0) {
      throw new Error("Ya has reclamado esta recompensa");
    }
    
    // Generar código de redención único
    const redemptionCode = this.generateRedemptionCode(userId, rewardId);
    
    // Calcular fecha de expiración (30 días)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    // Registrar recompensa reclamada
    const [claimedReward] = await db
      .insert(userClaimedRewards)
      .values({
        userId,
        rewardId,
        status: "pending",
        redemptionCode,
        expiresAt,
      })
      .returning();
    
    // Registrar actividad
    await this.logActivity({
      userId,
      activityType: "recompensa_reclamada",
      description: `Has reclamado la recompensa: ${reward.name}`,
      pointsEarned: 0,
      metadata: { 
        rewardId,
        redemptionCode,
        expiresAt
      }
    });
    
    return {
      ...claimedReward,
      reward
    };
  }
  
  /**
   * Genera un código de redención único
   * @param userId ID del usuario
   * @param rewardId ID de la recompensa
   * @returns Código de redención
   */
  private generateRedemptionCode(userId: number, rewardId: number): string {
    const timestamp = Date.now().toString().slice(-6);
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `REW-${userId}${rewardId}-${timestamp}${randomPart}`;
  }
  
  // === Métodos auxiliares ===
  
  /**
   * Registra una actividad de gamificación
   * @param activity Datos de la actividad
   */
  private async logActivity(activity: InsertGamificationActivity): Promise<void> {
    await db.insert(gamificationActivities).values(activity);
  }
  
  /**
   * Obtiene el historial de actividades de un usuario
   * @param userId ID del usuario
   * @param limit Límite de resultados
   * @returns Lista de actividades
   */
  async getUserActivities(userId: number, limit: number = 20): Promise<any[]> {
    return db
      .select()
      .from(gamificationActivities)
      .where(eq(gamificationActivities.userId, userId))
      .orderBy(desc(gamificationActivities.createdAt))
      .limit(limit);
  }
  
  /**
   * Obtiene el perfil de gamificación de un usuario
   * @param userId ID del usuario
   * @returns Perfil de gamificación completo
   */
  async getUserGameProfile(userId: number): Promise<any> {
    // Inicializar perfil si no existe
    await this.initializeUserGameProfile(userId);
    
    // Obtener perfil básico
    const [profile] = await db
      .select()
      .from(userGameProfiles)
      .where(eq(userGameProfiles.userId, userId));
    
    if (!profile) {
      return null;
    }
    
    // Obtener insignias
    const badges = await db
      .select({
        userBadge: userBadges,
        badge: verificationBadges
      })
      .from(userBadges)
      .innerJoin(verificationBadges, eq(userBadges.badgeId, verificationBadges.id))
      .where(eq(userBadges.userId, userId));
    
    // Obtener desafíos
    const challenges = await db
      .select({
        progress: userChallengeProgress,
        challenge: verificationChallenges
      })
      .from(userChallengeProgress)
      .innerJoin(verificationChallenges, eq(userChallengeProgress.challengeId, verificationChallenges.id))
      .where(eq(userChallengeProgress.userId, userId));
    
    // Obtener estadísticas en la tabla de clasificación
    const leaderboardStats = await Promise.all([
      this.getUserLeaderboardPosition(userId, "diario"),
      this.getUserLeaderboardPosition(userId, "semanal"),
      this.getUserLeaderboardPosition(userId, "mensual"),
      this.getUserLeaderboardPosition(userId, "total")
    ]);
    
    // Actividades recientes
    const recentActivities = await this.getUserActivities(userId, 10);
    
    // Calcular siguiente nivel
    const nextLevelPoints = (profile.level * 500);
    const pointsToNextLevel = nextLevelPoints - profile.totalPoints;
    const progressToNextLevel = ((profile.totalPoints % 500) / 500) * 100;
    
    return {
      profile,
      badges: badges.map(b => ({
        ...b.badge,
        earnedAt: b.userBadge.earnedAt,
        showcaseOrder: b.userBadge.showcaseOrder
      })),
      challenges: challenges.map(c => ({
        ...c.challenge,
        progress: c.progress.progress,
        isCompleted: c.progress.isCompleted,
        completedAt: c.progress.completedAt
      })),
      leaderboard: {
        daily: leaderboardStats[0],
        weekly: leaderboardStats[1],
        monthly: leaderboardStats[2],
        total: leaderboardStats[3]
      },
      recentActivities,
      nextLevel: {
        level: profile.level + 1,
        requiredPoints: nextLevelPoints,
        pointsToNextLevel,
        progressPercent: progressToNextLevel
      }
    };
  }
}

export const gamificationService = new GamificationService();