"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserGameProfile = getUserGameProfile;
exports.updateUserVerificationStats = updateUserVerificationStats;
exports.addPointsToUser = addPointsToUser;
exports.verifyDocument = verifyDocument;
exports.updateChallengesProgress = updateChallengesProgress;
exports.checkForNewBadges = checkForNewBadges;
exports.updateLeaderboard = updateLeaderboard;
exports.getLeaderboard = getLeaderboard;
exports.getUserChallenges = getUserChallenges;
exports.getUserBadges = getUserBadges;
exports.getAvailableRewards = getAvailableRewards;
exports.getUserRewards = getUserRewards;
exports.claimReward = claimReward;
exports.getUserLeaderboardPosition = getUserLeaderboardPosition;
exports.getVerificationStats = getVerificationStats;
exports.getUserActivities = getUserActivities;
exports.processDocumentVerification = processDocumentVerification;
exports.getAvailableRewardsForUser = getAvailableRewardsForUser;
exports.seedDefaultChallenges = seedDefaultChallenges;
exports.seedDefaultBadges = seedDefaultBadges;
exports.seedDefaultRewards = seedDefaultRewards;
exports.resetTable = resetTable;
const db_1 = require("../db");
const schema_1 = require("@shared/schema");
const drizzle_orm_1 = require("drizzle-orm");
/**
 * Obtiene el perfil de juego de un usuario, creándolo si no existe
 */
async function getUserGameProfile(userId) {
    const [profile] = await db_1.db
        .select()
        .from(schema_1.userGameProfiles)
        .where((0, drizzle_orm_1.eq)(schema_1.userGameProfiles.userId, userId));
    if (profile) {
        return profile;
    }
    // Crear nuevo perfil si no existe
    const [newProfile] = await db_1.db
        .insert(schema_1.userGameProfiles)
        .values({
        userId,
        totalPoints: 0,
        level: 1,
        consecutiveDays: 0,
        verificationStreak: 0,
        totalVerifications: 0,
        rank: 'Novato',
    })
        .returning();
    return newProfile;
}
/**
 * Actualiza las estadísticas de verificación del usuario y gestiona rachas
 */
async function updateUserVerificationStats(userId) {
    const profile = await getUserGameProfile(userId);
    // Calcular si es una nueva racha (último activo en las últimas 24 horas pero no hoy)
    const now = new Date();
    const lastActive = profile.lastActive;
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutiveDay = lastActive &&
        lastActive.toDateString() === yesterday.toDateString();
    const isSameDay = lastActive &&
        lastActive.toDateString() === now.toDateString();
    let consecutiveDays = profile.consecutiveDays;
    let verificationStreak = profile.verificationStreak;
    // Incrementar racha si es un nuevo día consecutivo
    if (!isSameDay) {
        if (isConsecutiveDay) {
            consecutiveDays += 1;
        }
        else {
            // Reiniciar racha si no es consecutivo
            consecutiveDays = 1;
        }
    }
    // Siempre incrementar la racha de verificaciones
    verificationStreak += 1;
    // Actualizar el perfil
    const [updatedProfile] = await db_1.db
        .update(schema_1.userGameProfiles)
        .set({
        totalVerifications: profile.totalVerifications + 1,
        consecutiveDays,
        verificationStreak,
        lastActive: now,
    })
        .where((0, drizzle_orm_1.eq)(schema_1.userGameProfiles.userId, userId))
        .returning();
    return updatedProfile;
}
/**
 * Añade puntos al perfil del usuario y actualiza su nivel/rango
 */
async function addPointsToUser(userId, points, activityType, description) {
    let profile = await getUserGameProfile(userId);
    // Calcular el nuevo total de puntos
    const newTotal = profile.totalPoints + points;
    // Calcular nuevo nivel basado en puntos (fórmula exponencial simple)
    let newLevel = 1;
    let pointsRequired = 1000; // Puntos para nivel 2
    while (newTotal >= pointsRequired) {
        newLevel++;
        pointsRequired = Math.floor(1000 * Math.pow(1.5, newLevel - 1));
    }
    // Calcular nuevo rango basado en nivel
    let newRank = 'Novato';
    if (newLevel >= 30)
        newRank = 'Maestro Legendario';
    else if (newLevel >= 25)
        newRank = 'Maestro Supremo';
    else if (newLevel >= 20)
        newRank = 'Maestro Verificador';
    else if (newLevel >= 15)
        newRank = 'Verificador Experto';
    else if (newLevel >= 10)
        newRank = 'Verificador Senior';
    else if (newLevel >= 5)
        newRank = 'Verificador Avanzado';
    else if (newLevel >= 2)
        newRank = 'Verificador Principiante';
    // Actualizar perfil con nuevos puntos y nivel
    const [updatedProfile] = await db_1.db
        .update(schema_1.userGameProfiles)
        .set({
        totalPoints: newTotal,
        level: newLevel,
        rank: newRank,
    })
        .where((0, drizzle_orm_1.eq)(schema_1.userGameProfiles.userId, userId))
        .returning();
    // Registrar la actividad
    await db_1.db
        .insert(schema_1.gamificationActivities)
        .values({
        userId,
        activityType,
        description,
        pointsEarned: points,
    });
    return updatedProfile;
}
/**
 * Verifica un documento mediante su código y asigna puntos al usuario
 */
async function verifyDocument(userId, code) {
    // Comprobar si el documento existe y no ha sido verificado
    const [doc] = await db_1.db
        .select({
        id: schema_1.documents.id,
        title: schema_1.documents.title,
        verified: (0, drizzle_orm_1.sql) `EXISTS (
        SELECT 1 FROM document_verifications
        WHERE document_id = ${schema_1.documents.id} AND verified = true
      )`,
    })
        .from(schema_1.documents)
        .where((0, drizzle_orm_1.eq)(schema_1.documents.qrCode, code));
    if (!doc) {
        throw new Error('Código de verificación inválido. El documento no existe.');
    }
    if (doc.verified) {
        throw new Error('Este documento ya ha sido verificado anteriormente.');
    }
    // Registrar la verificación del documento
    const result = await db_1.db.execute((0, drizzle_orm_1.sql) `
    INSERT INTO document_verifications (document_id, user_id, verified, verified_at)
    VALUES (${doc.id}, ${userId}, true, NOW())
    RETURNING id, document_id as "documentId", verified, verified_at as "verifiedAt"
  `);
    // Extraer el registro de verificación del resultado
    const verification = result.rows[0];
    // Actualizar estadísticas de verificación del usuario
    await updateUserVerificationStats(userId);
    // Añadir puntos por la verificación (15 puntos base)
    const pointsEarned = 15;
    await addPointsToUser(userId, pointsEarned, 'verificación', `Verificación del documento: ${doc.title}`);
    // Actualizar progreso en desafíos relacionados
    await updateChallengesProgress(userId, 'verification', { documentId: doc.id });
    // Verificar logros que podrían haberse desbloqueado
    await checkForNewBadges(userId);
    // Actualizar tabla de clasificación
    await updateLeaderboard(userId);
    return {
        id: verification.id,
        code,
        documentId: doc.id,
        documentTitle: doc.title,
        verified: true,
        verifiedAt: verification.verifiedAt,
    };
}
/**
 * Actualiza el progreso de los desafíos del usuario
 */
async function updateChallengesProgress(userId, actionType, metadata = {}) {
    // Obtener desafíos activos que requieren este tipo de acción
    const activeChallenges = await db_1.db
        .select()
        .from(schema_1.verificationChallenges)
        .where((0, drizzle_orm_1.eq)(schema_1.verificationChallenges.isActive, true));
    // Para cada desafío activo, actualizar progreso si aplica
    for (const challenge of activeChallenges) {
        const requiredActions = challenge.requiredActions;
        // Verificar si este desafío requiere el tipo de acción realizada
        if (!requiredActions.includes(actionType)) {
            continue;
        }
        // Buscar progreso actual del usuario en este desafío
        const [progress] = await db_1.db
            .select()
            .from(schema_1.userChallengeProgress)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userChallengeProgress.userId, userId), (0, drizzle_orm_1.eq)(schema_1.userChallengeProgress.challengeId, challenge.id)));
        // Si no hay progreso, crear uno nuevo
        if (!progress) {
            await db_1.db
                .insert(schema_1.userChallengeProgress)
                .values({
                userId,
                challengeId: challenge.id,
                progress: { current: 1 },
                isCompleted: false,
            });
            continue;
        }
        // Si ya está completado, ignorar
        if (progress.isCompleted) {
            continue;
        }
        // Actualizar progreso
        const currentProgress = progress.progress.current || 0;
        const newProgress = currentProgress + 1;
        const completionTarget = challenge.completionCriteria.target || 1;
        // Verificar si se ha completado el desafío
        const isCompleted = newProgress >= completionTarget;
        if (isCompleted) {
            // Desafío completado, otorgar puntos
            await db_1.db
                .update(schema_1.userChallengeProgress)
                .set({
                progress: { current: newProgress },
                isCompleted: true,
                completedAt: new Date(),
                awardedPoints: challenge.points,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.userChallengeProgress.id, progress.id));
            // Añadir puntos por completar el desafío
            await addPointsToUser(userId, challenge.points, 'desafío_completado', `Desafío completado: ${challenge.title}`);
        }
        else {
            // Actualizar progreso
            await db_1.db
                .update(schema_1.userChallengeProgress)
                .set({
                progress: { current: newProgress },
            })
                .where((0, drizzle_orm_1.eq)(schema_1.userChallengeProgress.id, progress.id));
        }
    }
}
/**
 * Verifica si el usuario ha alcanzado los requisitos para nuevas insignias
 */
async function checkForNewBadges(userId) {
    // Obtener perfil del usuario
    const profile = await getUserGameProfile(userId);
    // Obtener todas las insignias disponibles
    const availableBadges = await db_1.db
        .select()
        .from(schema_1.verificationBadges);
    // Obtener las insignias que ya tiene el usuario
    const existingUserBadges = await db_1.db
        .select()
        .from(schema_1.userBadges)
        .where((0, drizzle_orm_1.eq)(schema_1.userBadges.userId, userId));
    const existingBadgeIds = existingUserBadges.map(ub => ub.badgeId);
    // Verificar cada insignia no obtenida aún
    for (const badge of availableBadges) {
        // Saltar si ya tiene esta insignia
        if (existingBadgeIds.includes(badge.id)) {
            continue;
        }
        // Verificar si cumple requisitos (puntos)
        if (profile.totalPoints >= badge.requiredPoints) {
            // Otorgar la insignia
            await db_1.db
                .insert(schema_1.userBadges)
                .values({
                userId,
                badgeId: badge.id,
            });
            // Registrar la actividad
            await addPointsToUser(userId, 50, // Bonus por ganar insignia
            'insignia_ganada', `Insignia desbloqueada: ${badge.name}`);
        }
    }
}
/**
 * Actualiza la tabla de clasificación para el usuario
 */
async function updateLeaderboard(userId) {
    // Obtener perfil del usuario
    const profile = await getUserGameProfile(userId);
    // Obtener fecha actual y calcular períodos
    const now = new Date();
    // Período diario (hoy)
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    // Período semanal (esta semana)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    // Período mensual (este mes)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    // Actualizar o crear entrada para período diario
    await updatePeriodLeaderboard(userId, 'diario', startOfDay, endOfDay);
    // Actualizar o crear entrada para período semanal
    await updatePeriodLeaderboard(userId, 'semanal', startOfWeek, endOfWeek);
    // Actualizar o crear entrada para período mensual
    await updatePeriodLeaderboard(userId, 'mensual', startOfMonth, endOfMonth);
    // Actualizar o crear entrada para puntuación total
    await updateTotalLeaderboard(userId);
}
/**
 * Actualiza la entrada de tabla de clasificación para un período específico
 */
async function updatePeriodLeaderboard(userId, period, startDate, endDate) {
    // Calcular puntuación para el período
    const periodActivities = await db_1.db
        .select({
        totalPoints: (0, drizzle_orm_1.sql) `SUM(points_earned)`,
    })
        .from(schema_1.gamificationActivities)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.gamificationActivities.userId, userId), (0, drizzle_orm_1.between)(schema_1.gamificationActivities.createdAt, startDate, endDate)));
    const score = periodActivities[0]?.totalPoints || 0;
    // Buscar entrada existente
    const [existingEntry] = await db_1.db
        .select()
        .from(schema_1.leaderboardEntries)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.leaderboardEntries.userId, userId), (0, drizzle_orm_1.eq)(schema_1.leaderboardEntries.period, period), (0, drizzle_orm_1.between)(schema_1.leaderboardEntries.periodStart, startDate, endDate)));
    if (existingEntry) {
        // Actualizar entrada existente
        await db_1.db
            .update(schema_1.leaderboardEntries)
            .set({
            score,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.leaderboardEntries.id, existingEntry.id));
    }
    else {
        // Crear nueva entrada
        await db_1.db
            .insert(schema_1.leaderboardEntries)
            .values({
            userId,
            period,
            periodStart: startDate,
            periodEnd: endDate,
            score,
            rank: 0, // Se calculará después
        });
    }
    // Recalcular rankings para este período
    await recalculatePeriodRankings(period, startDate, endDate);
}
/**
 * Actualiza la entrada de tabla de clasificación para puntuación total
 */
async function updateTotalLeaderboard(userId) {
    // Obtener perfil del usuario
    const profile = await getUserGameProfile(userId);
    // Buscar entrada existente
    const [existingEntry] = await db_1.db
        .select()
        .from(schema_1.leaderboardEntries)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.leaderboardEntries.userId, userId), (0, drizzle_orm_1.eq)(schema_1.leaderboardEntries.period, 'total')));
    // Calcular fechas para período total (desde el inicio de los tiempos hasta el final de los tiempos)
    const startDate = new Date(2020, 0, 1);
    const endDate = new Date(2100, 11, 31);
    if (existingEntry) {
        // Actualizar entrada existente
        await db_1.db
            .update(schema_1.leaderboardEntries)
            .set({
            score: profile.totalPoints,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.leaderboardEntries.id, existingEntry.id));
    }
    else {
        // Crear nueva entrada
        await db_1.db
            .insert(schema_1.leaderboardEntries)
            .values({
            userId,
            period: 'total',
            periodStart: startDate,
            periodEnd: endDate,
            score: profile.totalPoints,
            rank: 0, // Se calculará después
        });
    }
    // Recalcular rankings para puntuación total
    await recalculatePeriodRankings('total', startDate, endDate);
}
/**
 * Recalcula los rankings para un período específico
 */
async function recalculatePeriodRankings(period, startDate, endDate) {
    // Obtener todas las entradas para este período ordenadas por puntuación
    const entries = await db_1.db
        .select()
        .from(schema_1.leaderboardEntries)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.leaderboardEntries.period, period), (0, drizzle_orm_1.between)(schema_1.leaderboardEntries.periodStart, startDate, endDate)))
        .orderBy((0, drizzle_orm_1.desc)(schema_1.leaderboardEntries.score));
    // Actualizar el ranking de cada entrada
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const rank = i + 1;
        await db_1.db
            .update(schema_1.leaderboardEntries)
            .set({
            rank,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.leaderboardEntries.id, entry.id));
    }
}
/**
 * Obtiene la tabla de clasificación con información de usuario
 */
async function getLeaderboard(period = 'mensual', limit = 10) {
    // Obtener fecha actual y calcular período
    const now = new Date();
    let startDate, endDate;
    switch (period) {
        case 'diario':
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'semanal':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - now.getDay());
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'mensual':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            break;
        case 'total':
        default:
            startDate = new Date(2020, 0, 1);
            endDate = new Date(2100, 11, 31);
            period = 'total';
            break;
    }
    // Obtener tabla de clasificación con información de usuario
    const leaderboard = await db_1.db
        .select({
        id: schema_1.leaderboardEntries.id,
        userId: schema_1.leaderboardEntries.userId,
        period: schema_1.leaderboardEntries.period,
        score: schema_1.leaderboardEntries.score,
        rank: schema_1.leaderboardEntries.rank,
        username: schema_1.users.username,
        fullName: schema_1.users.fullName,
    })
        .from(schema_1.leaderboardEntries)
        .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.leaderboardEntries.userId, schema_1.users.id))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.leaderboardEntries.period, period), (0, drizzle_orm_1.between)(schema_1.leaderboardEntries.periodStart, startDate, endDate)))
        .orderBy((0, drizzle_orm_1.desc)(schema_1.leaderboardEntries.score))
        .limit(limit);
    return leaderboard;
}
/**
 * Obtiene los desafíos y su progreso para un usuario
 */
async function getUserChallenges(userId) {
    // Primero comprobamos que el usuario tenga un perfil de juego
    await getUserGameProfile(userId);
    // Obtener todos los desafíos activos
    const activeChallenges = await db_1.db
        .select()
        .from(schema_1.verificationChallenges)
        .where((0, drizzle_orm_1.eq)(schema_1.verificationChallenges.isActive, true));
    // Obtener progreso del usuario en todos los desafíos
    const userProgress = await db_1.db
        .select()
        .from(schema_1.userChallengeProgress)
        .where((0, drizzle_orm_1.eq)(schema_1.userChallengeProgress.userId, userId));
    // Mapear progreso a desafíos
    const challengesWithProgress = [];
    for (const challenge of activeChallenges) {
        // Buscar progreso para este desafío
        const progress = userProgress.find(p => p.challengeId === challenge.id);
        // Si no hay progreso, crear uno con valores por defecto
        if (!progress) {
            const newProgress = {
                id: 0, // Id temporal, se asignará al guardar
                userId,
                challengeId: challenge.id,
                progress: { current: 0 },
                isCompleted: false,
                completedAt: null,
                awardedPoints: null,
                challenge,
            };
            challengesWithProgress.push(newProgress);
            // Crear el progreso en la base de datos para futuras referencias
            const [createdProgress] = await db_1.db
                .insert(schema_1.userChallengeProgress)
                .values({
                userId,
                challengeId: challenge.id,
                progress: { current: 0 },
                isCompleted: false,
            })
                .returning();
            // Actualizar el id con el real
            newProgress.id = createdProgress.id;
        }
        else {
            // Añadir al resultado con el desafío completo
            challengesWithProgress.push({
                ...progress,
                challenge,
            });
        }
    }
    return challengesWithProgress;
}
/**
 * Obtiene las insignias conseguidas por un usuario
 */
async function getUserBadges(userId) {
    // Primero comprobamos que el usuario tenga un perfil de juego
    await getUserGameProfile(userId);
    // Obtener todas las insignias del usuario con detalles
    const badges = await db_1.db
        .select({
        id: schema_1.userBadges.id,
        userId: schema_1.userBadges.userId,
        badgeId: schema_1.userBadges.badgeId,
        earnedAt: schema_1.userBadges.earnedAt,
        showcaseOrder: schema_1.userBadges.showcaseOrder,
        badge: schema_1.verificationBadges,
    })
        .from(schema_1.userBadges)
        .innerJoin(schema_1.verificationBadges, (0, drizzle_orm_1.eq)(schema_1.userBadges.badgeId, schema_1.verificationBadges.id))
        .where((0, drizzle_orm_1.eq)(schema_1.userBadges.userId, userId))
        .orderBy((0, drizzle_orm_1.desc)(schema_1.userBadges.earnedAt));
    return badges;
}
/**
 * Obtiene las recompensas disponibles
 */
async function getAvailableRewards() {
    const rewards = await db_1.db
        .select()
        .from(schema_1.gamificationRewards)
        .where((0, drizzle_orm_1.eq)(schema_1.gamificationRewards.isActive, true))
        .orderBy(schema_1.gamificationRewards.requiredPoints);
    return rewards;
}
/**
 * Obtiene las recompensas reclamadas por un usuario
 */
async function getUserRewards(userId) {
    const userRewards = await db_1.db
        .select({
        id: schema_1.userClaimedRewards.id,
        userId: schema_1.userClaimedRewards.userId,
        rewardId: schema_1.userClaimedRewards.rewardId,
        claimedAt: schema_1.userClaimedRewards.claimedAt,
        status: schema_1.userClaimedRewards.status,
        redemptionCode: schema_1.userClaimedRewards.redemptionCode,
        expiresAt: schema_1.userClaimedRewards.expiresAt,
        reward: schema_1.gamificationRewards,
    })
        .from(schema_1.userClaimedRewards)
        .innerJoin(schema_1.gamificationRewards, (0, drizzle_orm_1.eq)(schema_1.userClaimedRewards.rewardId, schema_1.gamificationRewards.id))
        .where((0, drizzle_orm_1.eq)(schema_1.userClaimedRewards.userId, userId))
        .orderBy((0, drizzle_orm_1.desc)(schema_1.userClaimedRewards.claimedAt));
    return userRewards;
}
/**
 * Permite a un usuario reclamar una recompensa
 */
async function claimReward(userId, rewardId) {
    // Verificar que la recompensa existe y está activa
    const [reward] = await db_1.db
        .select()
        .from(schema_1.gamificationRewards)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.gamificationRewards.id, rewardId), (0, drizzle_orm_1.eq)(schema_1.gamificationRewards.isActive, true)));
    if (!reward) {
        throw new Error('La recompensa solicitada no existe o no está disponible.');
    }
    // Verificar que el usuario tiene suficientes puntos
    const profile = await getUserGameProfile(userId);
    if (profile.totalPoints < reward.requiredPoints) {
        throw new Error(`No tienes suficientes puntos para reclamar esta recompensa. Necesitas ${reward.requiredPoints - profile.totalPoints} puntos más.`);
    }
    // Verificar que el usuario no ha reclamado ya esta recompensa
    const [existingClaim] = await db_1.db
        .select()
        .from(schema_1.userClaimedRewards)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userClaimedRewards.userId, userId), (0, drizzle_orm_1.eq)(schema_1.userClaimedRewards.rewardId, rewardId)));
    if (existingClaim) {
        throw new Error('Ya has reclamado esta recompensa anteriormente.');
    }
    // Generar código de redención para la recompensa
    const redemptionCode = reward.code || generateRedemptionCode(reward.name);
    // Calcular fecha de expiración (3 meses desde ahora)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3);
    // Registrar la recompensa reclamada
    const [claimedReward] = await db_1.db
        .insert(schema_1.userClaimedRewards)
        .values({
        userId,
        rewardId,
        status: 'pending',
        redemptionCode,
        expiresAt,
    })
        .returning();
    // Registrar la actividad
    await addPointsToUser(userId, 0, // No da puntos reclamar recompensas
    'recompensa_reclamada', `Recompensa reclamada: ${reward.name}`);
    return claimedReward;
}
/**
 * Genera un código de redención único para una recompensa
 */
function generateRedemptionCode(rewardName) {
    const prefix = rewardName.slice(0, 3).toUpperCase();
    const randomPart = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${prefix}-${randomPart}`;
}
/**
 * Obtiene la posición de un usuario en la tabla de clasificación
 */
async function getUserLeaderboardPosition(userId, period = 'mensual') {
    // Obtener fecha actual y calcular período
    const now = new Date();
    let startDate, endDate;
    switch (period) {
        case 'diario':
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'semanal':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - now.getDay());
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'mensual':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            break;
        case 'total':
        default:
            startDate = new Date(2020, 0, 1);
            endDate = new Date(2100, 11, 31);
            period = 'total';
            break;
    }
    // Buscar la entrada del usuario en la tabla de clasificación
    const [userEntry] = await db_1.db
        .select({
        id: schema_1.leaderboardEntries.id,
        userId: schema_1.leaderboardEntries.userId,
        period: schema_1.leaderboardEntries.period,
        score: schema_1.leaderboardEntries.score,
        rank: schema_1.leaderboardEntries.rank,
    })
        .from(schema_1.leaderboardEntries)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.leaderboardEntries.userId, userId), (0, drizzle_orm_1.eq)(schema_1.leaderboardEntries.period, period), (0, drizzle_orm_1.between)(schema_1.leaderboardEntries.periodStart, startDate, endDate)));
    if (!userEntry) {
        return null;
    }
    // Obtener total de jugadores en el periodo para calcular percentil
    const totalCount = await db_1.db
        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
        .from(schema_1.leaderboardEntries)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.leaderboardEntries.period, period), (0, drizzle_orm_1.between)(schema_1.leaderboardEntries.periodStart, startDate, endDate)));
    const totalPlayers = totalCount[0]?.count || 0;
    const percentile = totalPlayers > 0 ? Math.round((1 - (userEntry.rank / totalPlayers)) * 100) : 0;
    return {
        ...userEntry,
        totalPlayers,
        percentile,
    };
}
/**
 * Obtiene el historial de actividades de un usuario
 */
/**
 * Obtiene estadísticas de verificación para un usuario específico o globales
 */
async function getVerificationStats(userId) {
    // Variables para almacenar resultados
    let totalVerifications = 0;
    let verificationsByDay = [];
    let mostVerifiedDocuments = [];
    // Consulta para obtener total de verificaciones (con filtro opcional por usuario)
    const totalQuery = userId
        ? db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(schema_1.gamificationActivities)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.gamificationActivities.userId, userId), (0, drizzle_orm_1.eq)(schema_1.gamificationActivities.activityType, 'document_verification')))
        : db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(schema_1.gamificationActivities)
            .where((0, drizzle_orm_1.eq)(schema_1.gamificationActivities.activityType, 'document_verification'));
    // Ejecutar consulta de total
    const [totalResult] = await totalQuery;
    totalVerifications = Number(totalResult?.count || 0);
    // Consulta para obtener verificaciones por día (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const byDayQuery = userId
        ? db_1.db.select({
            date: (0, drizzle_orm_1.sql) `DATE(created_at)`,
            count: (0, drizzle_orm_1.sql) `count(*)`
        })
            .from(schema_1.gamificationActivities)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.gamificationActivities.userId, userId), (0, drizzle_orm_1.eq)(schema_1.gamificationActivities.activityType, 'document_verification'), (0, drizzle_orm_1.gt)(schema_1.gamificationActivities.createdAt, thirtyDaysAgo)))
            .groupBy((0, drizzle_orm_1.sql) `DATE(created_at)`)
            .orderBy((0, drizzle_orm_1.sql) `DATE(created_at)`)
        : db_1.db.select({
            date: (0, drizzle_orm_1.sql) `DATE(created_at)`,
            count: (0, drizzle_orm_1.sql) `count(*)`
        })
            .from(schema_1.gamificationActivities)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.gamificationActivities.activityType, 'document_verification'), (0, drizzle_orm_1.gt)(schema_1.gamificationActivities.createdAt, thirtyDaysAgo)))
            .groupBy((0, drizzle_orm_1.sql) `DATE(created_at)`)
            .orderBy((0, drizzle_orm_1.sql) `DATE(created_at)`);
    // Ejecutar consulta por día
    const byDayResults = await byDayQuery;
    verificationsByDay = byDayResults.map((r) => ({
        date: r.date ? r.date.toString() : new Date().toISOString().split('T')[0],
        count: Number(r.count || 0)
    }));
    // Consulta para obtener los documentos más verificados usando sql directo para evitar problemas de tipado
    const mostVerifiedQuery = db_1.db.execute((0, drizzle_orm_1.sql) `
    SELECT 
      CAST(ga.metadata->>'documentId' AS INTEGER) as "documentId",
      COALESCE(d.title, ga.metadata->>'documentTitle', 'Documento sin título') as "title",
      COUNT(*) as "count"
    FROM gamification_activities ga
    LEFT JOIN documents d ON d.id = CAST(ga.metadata->>'documentId' AS INTEGER)
    WHERE ga.activity_type = 'document_verification'
    ${userId ? (0, drizzle_orm_1.sql) `AND ga.user_id = ${userId}` : (0, drizzle_orm_1.sql) ``}
    GROUP BY CAST(ga.metadata->>'documentId' AS INTEGER), d.title, ga.metadata->>'documentTitle'
    ORDER BY COUNT(*) DESC
    LIMIT 5
  `);
    // Ejecutar consulta de documentos más verificados
    const mostVerifiedResults = await mostVerifiedQuery;
    // Asegurarnos de manejar correctamente el tipo de resultado
    mostVerifiedDocuments = (Array.isArray(mostVerifiedResults) ? mostVerifiedResults : (mostVerifiedResults.rows || [])).map((r) => ({
        documentId: Number(r.documentId || 0),
        title: r.title || 'Documento desconocido',
        count: Number(r.count || 0)
    }));
    return {
        totalVerifications,
        verificationsByDay,
        mostVerifiedDocuments
    };
}
async function getUserActivities(userId, limit = 20) {
    const activities = await db_1.db
        .select()
        .from(schema_1.gamificationActivities)
        .where((0, drizzle_orm_1.eq)(schema_1.gamificationActivities.userId, userId))
        .orderBy((0, drizzle_orm_1.desc)(schema_1.gamificationActivities.createdAt))
        .limit(limit);
    return activities;
}
/**
 * Procesa la verificación de un documento y asigna puntos/recompensas
 */
async function processDocumentVerification(userId, code) {
    return await verifyDocument(userId, code);
}
/**
 * Obtiene las recompensas disponibles para un usuario
 */
async function getAvailableRewardsForUser(userId) {
    const profile = await getUserGameProfile(userId);
    // Obtener todas las recompensas activas
    const rewards = await db_1.db
        .select()
        .from(schema_1.gamificationRewards)
        .where((0, drizzle_orm_1.eq)(schema_1.gamificationRewards.isActive, true))
        .orderBy(schema_1.gamificationRewards.requiredPoints);
    // Añadir información sobre si el usuario puede reclamar cada recompensa
    const rewardsWithAvailability = rewards.map(reward => ({
        ...reward,
        canClaim: profile.totalPoints >= reward.requiredPoints,
        pointsNeeded: Math.max(0, reward.requiredPoints - profile.totalPoints),
    }));
    return rewardsWithAvailability;
}
/**
 * Semillas para inicialización (estas funciones serían llamadas una vez para inicializar datos)
 */
/**
 * Crea desafíos predeterminados en la base de datos
 */
async function seedDefaultChallenges() {
    // Comprobar si ya hay desafíos
    const existingChallenges = await db_1.db
        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
        .from(schema_1.verificationChallenges);
    if (existingChallenges[0]?.count > 0) {
        return { message: "Ya existen desafíos en la base de datos" };
    }
    // Desafíos predeterminados
    const defaultChallenges = [
        {
            title: "Verificador Novato",
            description: "Verifica tu primer documento para comenzar tu camino como verificador.",
            points: 50,
            requiredActions: ["verification"],
            completionCriteria: { target: 1 },
            difficultyLevel: 1,
            imageUrl: "/assets/badges/verificador-novato.png",
            isActive: true,
        },
        {
            title: "Verificador Constante",
            description: "Verifica 5 documentos para demostrar tu compromiso.",
            points: 100,
            requiredActions: ["verification"],
            completionCriteria: { target: 5 },
            difficultyLevel: 2,
            imageUrl: "/assets/badges/verificador-constante.png",
            isActive: true,
        },
        {
            title: "Verificador Experto",
            description: "Verifica 25 documentos y conviértete en un experto.",
            points: 250,
            requiredActions: ["verification"],
            completionCriteria: { target: 25 },
            difficultyLevel: 3,
            imageUrl: "/assets/badges/verificador-experto.png",
            isActive: true,
        },
        {
            title: "Racha Diaria",
            description: "Verifica documentos durante 7 días consecutivos.",
            points: 200,
            requiredActions: ["streak"],
            completionCriteria: { target: 7 },
            difficultyLevel: 3,
            imageUrl: "/assets/badges/racha-diaria.png",
            isActive: true,
        },
        {
            title: "Maestro Verificador",
            description: "Verifica 100 documentos y conviértete en un maestro.",
            points: 500,
            requiredActions: ["verification"],
            completionCriteria: { target: 100 },
            difficultyLevel: 5,
            imageUrl: "/assets/badges/maestro-verificador.png",
            isActive: true,
        },
    ];
    // Insertar los desafíos
    await db_1.db.insert(schema_1.verificationChallenges).values(defaultChallenges);
    return { message: "Desafíos predeterminados creados correctamente", count: defaultChallenges.length };
}
/**
 * Crea insignias predeterminadas en la base de datos
 */
async function seedDefaultBadges() {
    // Comprobar si ya hay insignias
    const existingBadges = await db_1.db
        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
        .from(schema_1.verificationBadges);
    if (existingBadges[0]?.count > 0) {
        return { message: "Ya existen insignias en la base de datos" };
    }
    // Insignias predeterminadas
    const defaultBadges = [
        {
            name: "Verificador Novato",
            description: "Has verificado tu primer documento",
            imageUrl: "/assets/badges/verificador-novato.png",
            requiredPoints: 50,
            tier: "bronce",
            isRare: false,
        },
        {
            name: "Verificador Entusiasta",
            description: "Has alcanzado el nivel 5",
            imageUrl: "/assets/badges/verificador-entusiasta.png",
            requiredPoints: 500,
            tier: "bronce",
            isRare: false,
        },
        {
            name: "Verificador Confiable",
            description: "Has verificado 50 documentos",
            imageUrl: "/assets/badges/verificador-confiable.png",
            requiredPoints: 1000,
            tier: "plata",
            isRare: false,
        },
        {
            name: "Verificador Experto",
            description: "Has alcanzado el nivel 10",
            imageUrl: "/assets/badges/verificador-experto.png",
            requiredPoints: 2500,
            tier: "plata",
            isRare: false,
        },
        {
            name: "Verificador Maestro",
            description: "Has alcanzado el nivel 20",
            imageUrl: "/assets/badges/verificador-maestro.png",
            requiredPoints: 5000,
            tier: "oro",
            isRare: false,
        },
        {
            name: "Leyenda de Verificación",
            description: "Has verificado 500 documentos",
            imageUrl: "/assets/badges/leyenda-verificacion.png",
            requiredPoints: 10000,
            tier: "oro",
            isRare: false,
        },
        {
            name: "Guardián de Documentos",
            description: "Has alcanzado el nivel 30",
            imageUrl: "/assets/badges/guardian-documentos.png",
            requiredPoints: 20000,
            tier: "platino",
            isRare: true,
        },
        {
            name: "Verificador Legendario",
            description: "Has alcanzado el nivel 50",
            imageUrl: "/assets/badges/verificador-legendario.png",
            requiredPoints: 50000,
            tier: "diamante",
            isRare: true,
        },
    ];
    // Insertar las insignias
    await db_1.db.insert(schema_1.verificationBadges).values(defaultBadges);
    return { message: "Insignias predeterminadas creadas correctamente", count: defaultBadges.length };
}
/**
 * Crea recompensas predeterminadas en la base de datos
 */
async function seedDefaultRewards() {
    // Comprobar si ya hay recompensas
    const existingRewards = await db_1.db
        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
        .from(schema_1.gamificationRewards);
    if (existingRewards[0]?.count > 0) {
        return { message: "Ya existen recompensas en la base de datos" };
    }
    // Recompensas predeterminadas
    const defaultRewards = [
        {
            name: "Descuento 10% en documento",
            description: "Obtén un 10% de descuento en tu próximo documento",
            rewardType: "descuento",
            value: 10,
            requiredPoints: 1000,
            code: "DSC-10PORCIENTO",
            isActive: true,
        },
        {
            name: "Documento sin costo",
            description: "Obtén un documento completamente gratis",
            rewardType: "descuento",
            value: 100,
            requiredPoints: 5000,
            code: "DOC-GRATIS",
            isActive: true,
        },
        {
            name: "Certificación prioritaria",
            description: "Tu próximo documento se procesará con prioridad",
            rewardType: "virtual",
            requiredPoints: 2000,
            code: "PRIORIDAD",
            isActive: true,
        },
        {
            name: "Curso básico gratuito",
            description: "Acceso gratuito a un curso básico de la plataforma",
            rewardType: "virtual",
            requiredPoints: 3000,
            code: "CURSO-BASICO",
            isActive: true,
        },
        {
            name: "Taza Cerfidoc",
            description: "Una taza con el logo de Cerfidoc",
            rewardType: "físico",
            requiredPoints: 7500,
            isActive: true,
        },
        {
            name: "Porta documentos premium",
            description: "Elegante porta documentos de cuero sintético",
            rewardType: "físico",
            requiredPoints: 10000,
            isActive: true,
        },
    ];
    // Insertar las recompensas
    await db_1.db.insert(schema_1.gamificationRewards).values(defaultRewards);
    return { message: "Recompensas predeterminadas creadas correctamente", count: defaultRewards.length };
}
/**
 * Reinicia una tabla (para pruebas)
 */
async function resetTable(tableName) {
    if (process.env.NODE_ENV !== 'development') {
        throw new Error('Esta función solo está disponible en entorno de desarrollo');
    }
    await db_1.db.execute((0, drizzle_orm_1.sql) `TRUNCATE TABLE ${drizzle_orm_1.sql.identifier(tableName)} CASCADE`);
    return { success: true, message: `Tabla ${tableName} reiniciada correctamente` };
}
