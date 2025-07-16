"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.microInteractionsService = exports.MicroInteractionsService = void 0;
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("@shared/schema");
/**
 * Servicio para gestionar las micro-interacciones del sistema
 *
 * Este servicio maneja:
 * - Creación y gestión de micro-interacciones
 * - Activación de micro-interacciones basadas en eventos
 * - Registro de interacciones de usuario
 * - Gestión de logros rápidos
 */
class MicroInteractionsService {
    /**
     * Crea una nueva micro-interacción en el sistema
     */
    async createMicroInteraction(interaction) {
        const [newInteraction] = await db_1.db
            .insert(schema_1.microInteractions)
            .values(interaction)
            .returning();
        return newInteraction;
    }
    /**
     * Obtiene todas las micro-interacciones
     */
    async getAllMicroInteractions() {
        return await db_1.db.select().from(schema_1.microInteractions);
    }
    /**
     * Obtiene micro-interacciones para un tipo de evento específico
     */
    async getMicroInteractionsByEvent(triggerEvent) {
        return await db_1.db
            .select()
            .from(schema_1.microInteractions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.microInteractions.triggerEvent, triggerEvent), (0, drizzle_orm_1.eq)(schema_1.microInteractions.isActive, true)));
    }
    /**
     * Detecta y activa micro-interacciones basadas en un evento
     * Registra la interacción en el historial del usuario si es necesario
     * Retorna las interacciones activadas para ser mostradas al usuario
     */
    async triggerInteractions(userId, eventType, context = {}) {
        // 1. Obtener todas las micro-interacciones aplicables a este evento
        const availableInteractions = await this.getMicroInteractionsByEvent(eventType);
        if (!availableInteractions.length) {
            return [];
        }
        // 2. Filtrar interacciones según nivel de usuario y frecuencia
        const userProfile = await this.getUserGameProfile(userId);
        const userLevel = userProfile?.level || 1;
        // 3. Obtener historial reciente para verificar cooldowns
        const recentHistory = await db_1.db
            .select()
            .from(schema_1.userInteractionHistory)
            .where((0, drizzle_orm_1.eq)(schema_1.userInteractionHistory.userId, userId))
            .orderBy((0, drizzle_orm_1.sql) `${schema_1.userInteractionHistory.triggeredAt} DESC`)
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
            }
            else if (interaction.frequency === 'daily' || interaction.frequency === 'weekly') {
                // Verificar si ya se activó en el período actual
                const cooldownPeriod = interaction.frequency === 'daily' ? 24 * 60 * 60 : 7 * 24 * 60 * 60;
                const coolingInteraction = recentHistory.find(h => h.interactionId === interaction.id &&
                    (Date.now() - new Date(h.triggeredAt).getTime()) / 1000 < cooldownPeriod);
                if (coolingInteraction) {
                    return false;
                }
            }
            // Verificar cooldown específico
            if (interaction.cooldownSeconds > 0) {
                const coolingInteraction = recentHistory.find(h => h.interactionId === interaction.id &&
                    (Date.now() - new Date(h.triggeredAt).getTime()) / 1000 < interaction.cooldownSeconds);
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
    async recordInteractionHistory(userId, interactionId, pointsAwarded = 0, context = {}) {
        const [record] = await db_1.db
            .insert(schema_1.userInteractionHistory)
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
    async getUserInteractionHistory(userId, limit = 50) {
        // Obtener historial con detalles de cada interacción
        const history = await db_1.db
            .select({
            id: schema_1.userInteractionHistory.id,
            userId: schema_1.userInteractionHistory.userId,
            interactionId: schema_1.userInteractionHistory.interactionId,
            triggeredAt: schema_1.userInteractionHistory.triggeredAt,
            pointsAwarded: schema_1.userInteractionHistory.pointsAwarded,
            context: schema_1.userInteractionHistory.context,
            viewed: schema_1.userInteractionHistory.viewed,
            interactionName: schema_1.microInteractions.name,
            interactionType: schema_1.microInteractions.type,
            displayMessage: schema_1.microInteractions.displayMessage,
            visualAsset: schema_1.microInteractions.visualAsset
        })
            .from(schema_1.userInteractionHistory)
            .innerJoin(schema_1.microInteractions, (0, drizzle_orm_1.eq)(schema_1.userInteractionHistory.interactionId, schema_1.microInteractions.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userInteractionHistory.userId, userId), (0, drizzle_orm_1.eq)(schema_1.microInteractions.showInHistory, true)))
            .orderBy((0, drizzle_orm_1.sql) `${schema_1.userInteractionHistory.triggeredAt} DESC`)
            .limit(limit);
        return history;
    }
    /**
     * Crea un nuevo logro rápido
     */
    async createQuickAchievement(achievement) {
        const [newAchievement] = await db_1.db
            .insert(schema_1.quickAchievements)
            .values(achievement)
            .returning();
        return newAchievement;
    }
    /**
     * Verifica y actualiza los logros rápidos del usuario
     * Retorna los logros que se han desbloqueado en esta actualización
     */
    async checkAndUpdateAchievements(userId) {
        // 1. Obtener todos los logros activos
        const allAchievements = await db_1.db
            .select()
            .from(schema_1.quickAchievements)
            .where((0, drizzle_orm_1.eq)(schema_1.quickAchievements.isActive, true));
        // 2. Obtener el progreso actual del usuario
        const userProgress = await db_1.db
            .select()
            .from(schema_1.userAchievementProgress)
            .where((0, drizzle_orm_1.eq)(schema_1.userAchievementProgress.userId, userId));
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
        const newlyUnlockedAchievements = [];
        const achievementsToUpdate = [];
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
                    await this.awardPoints(userId, achievement.rewardPoints, `Logro desbloqueado: ${achievement.name}`);
                }
            }
            // Agregar a la lista para actualizar
            achievementsToUpdate.push(currentProgress);
        }
        // 5. Actualizar el progreso en la base de datos
        for (const progress of achievementsToUpdate) {
            if (progressMap.has(progress.achievementId)) {
                // Actualizar existente
                await db_1.db
                    .update(schema_1.userAchievementProgress)
                    .set({
                    currentValue: progress.currentValue,
                    unlocked: progress.unlocked,
                    unlockedAt: progress.unlockedAt,
                    lastUpdated: new Date()
                })
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userAchievementProgress.userId, userId), (0, drizzle_orm_1.eq)(schema_1.userAchievementProgress.achievementId, progress.achievementId)));
            }
            else {
                // Insertar nuevo
                await db_1.db
                    .insert(schema_1.userAchievementProgress)
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
    async getUserAchievements(userId) {
        const achievements = await db_1.db
            .select({
            id: schema_1.quickAchievements.id,
            name: schema_1.quickAchievements.name,
            description: schema_1.quickAchievements.description,
            icon: schema_1.quickAchievements.icon,
            threshold: schema_1.quickAchievements.threshold,
            metricType: schema_1.quickAchievements.metricType,
            rewardPoints: schema_1.quickAchievements.rewardPoints,
            level: schema_1.quickAchievements.level,
            currentValue: schema_1.userAchievementProgress.currentValue,
            unlocked: schema_1.userAchievementProgress.unlocked,
            unlockedAt: schema_1.userAchievementProgress.unlockedAt,
            progress: (0, drizzle_orm_1.sql) `(${schema_1.userAchievementProgress.currentValue} * 100.0 / ${schema_1.quickAchievements.threshold})`.as('progress')
        })
            .from(schema_1.quickAchievements)
            .leftJoin(schema_1.userAchievementProgress, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userAchievementProgress.achievementId, schema_1.quickAchievements.id), (0, drizzle_orm_1.eq)(schema_1.userAchievementProgress.userId, userId)))
            .where((0, drizzle_orm_1.eq)(schema_1.quickAchievements.isActive, true))
            .orderBy(schema_1.quickAchievements.level);
        return achievements;
    }
    /**
     * Obtiene información pública de un logro para compartir
     * Solo retorna información que puede ser vista públicamente
     */
    async getPublicAchievementInfo(achievementId) {
        try {
            // Obtener el logro y el usuario que lo ha desbloqueado
            const [achievementInfo] = await db_1.db
                .select({
                id: schema_1.quickAchievements.id,
                name: schema_1.quickAchievements.name,
                description: schema_1.quickAchievements.description,
                level: schema_1.quickAchievements.level,
                rewardPoints: schema_1.quickAchievements.rewardPoints,
                userId: schema_1.userAchievementProgress.userId,
                unlockedAt: schema_1.userAchievementProgress.unlockedAt
            })
                .from(schema_1.quickAchievements)
                .innerJoin(schema_1.userAchievementProgress, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userAchievementProgress.achievementId, schema_1.quickAchievements.id), (0, drizzle_orm_1.eq)(schema_1.userAchievementProgress.unlocked, true)))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.quickAchievements.id, achievementId), (0, drizzle_orm_1.eq)(schema_1.quickAchievements.isActive, true)));
            if (!achievementInfo) {
                return null;
            }
            // Obtener información básica del usuario (solo nombre de usuario)
            const result = await db_1.db
                .execute((0, drizzle_orm_1.sql) `
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
        }
        catch (error) {
            console.error('Error obteniendo información pública del logro:', error);
            return null;
        }
    }
    /**
     * Obtiene el perfil de juego de un usuario
     */
    async getUserGameProfile(userId) {
        const [profile] = await db_1.db
            .select()
            .from(schema_1.userGameProfiles)
            .where((0, drizzle_orm_1.eq)(schema_1.userGameProfiles.userId, userId));
        return profile;
    }
    /**
     * Otorga puntos a un usuario y registra la actividad
     */
    async awardPoints(userId, points, description) {
        // 1. Actualizar el perfil de juego
        await db_1.db
            .update(schema_1.userGameProfiles)
            .set({
            totalPoints: (0, drizzle_orm_1.sql) `${schema_1.userGameProfiles.totalPoints} + ${points}`,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.userGameProfiles.userId, userId));
        // 2. Registrar la actividad
        await db_1.db
            .insert(schema_1.gamificationActivities)
            .values({
            userId,
            activityType: 'micro_interaction',
            description,
            pointsEarned: points
        });
    }
}
exports.MicroInteractionsService = MicroInteractionsService;
exports.microInteractionsService = new MicroInteractionsService();
