"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.badgeService = exports.BadgeService = void 0;
const db_1 = require("../db");
const schema_1 = require("@shared/schema");
const drizzle_orm_1 = require("drizzle-orm");
/**
 * Servicio para gestionar las insignias de verificación y compartición social
 */
class BadgeService {
    constructor(wss) {
        this.wss = null;
        this.wss = wss || null;
    }
    /**
     * Establecer el servidor WebSocket
     */
    setWebSocketServer(wss) {
        this.wss = wss;
    }
    /**
     * Obtener todas las insignias de verificación
     */
    async getAllBadges() {
        try {
            return await db_1.db.select().from(schema_1.verificationBadges);
        }
        catch (error) {
            console.error("Error al obtener las insignias:", error);
            throw new Error("Error al obtener las insignias");
        }
    }
    /**
     * Obtener una insignia por su ID
     */
    async getBadgeById(id) {
        try {
            const [badge] = await db_1.db
                .select()
                .from(schema_1.verificationBadges)
                .where((0, drizzle_orm_1.eq)(schema_1.verificationBadges.id, id));
            return badge;
        }
        catch (error) {
            console.error(`Error al obtener la insignia con ID ${id}:`, error);
            throw new Error(`Error al obtener la insignia con ID ${id}`);
        }
    }
    /**
     * Obtener las insignias de un usuario
     */
    async getUserBadges(userId) {
        try {
            const results = await db_1.db
                .select({
                userBadge: schema_1.userBadges,
                badge: schema_1.verificationBadges
            })
                .from(schema_1.userBadges)
                .innerJoin(schema_1.verificationBadges, (0, drizzle_orm_1.eq)(schema_1.userBadges.badgeId, schema_1.verificationBadges.id))
                .where((0, drizzle_orm_1.eq)(schema_1.userBadges.userId, userId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.userBadges.earnedAt));
            // Transformar los resultados a un formato más conveniente
            return results.map(({ userBadge, badge }) => ({
                ...userBadge,
                badge: badge
            }));
        }
        catch (error) {
            console.error(`Error al obtener las insignias del usuario ${userId}:`, error);
            throw new Error(`Error al obtener las insignias del usuario`);
        }
    }
    /**
     * Obtener una insignia específica de un usuario
     */
    async getUserBadge(userId, badgeId) {
        try {
            const [result] = await db_1.db
                .select({
                userBadge: schema_1.userBadges,
                badge: schema_1.verificationBadges
            })
                .from(schema_1.userBadges)
                .innerJoin(schema_1.verificationBadges, (0, drizzle_orm_1.eq)(schema_1.userBadges.badgeId, schema_1.verificationBadges.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userBadges.userId, userId), (0, drizzle_orm_1.eq)(schema_1.userBadges.badgeId, badgeId)));
            if (!result)
                return null;
            return {
                ...result.userBadge,
                badge: result.badge
            };
        }
        catch (error) {
            console.error(`Error al obtener la insignia ${badgeId} del usuario ${userId}:`, error);
            throw new Error(`Error al obtener la insignia del usuario`);
        }
    }
    /**
     * Otorgar una insignia a un usuario
     */
    async awardBadgeToUser(userId, badgeId, metadata = {}) {
        try {
            // Verificar si el usuario ya tiene la insignia
            const existingBadge = await this.getUserBadge(userId, badgeId);
            if (existingBadge) {
                return existingBadge;
            }
            // Obtener la insignia para incluir sus detalles en la notificación
            const badge = await this.getBadgeById(badgeId);
            if (!badge) {
                throw new Error(`La insignia con ID ${badgeId} no existe`);
            }
            // Crear nueva entrada en userBadges
            const [userBadge] = await db_1.db
                .insert(schema_1.userBadges)
                .values({
                userId,
                badgeId,
                earnedAt: new Date(),
                metadata: metadata
            })
                .returning();
            // Notificar por WebSocket si está disponible
            if (this.wss) {
                this.notifyBadgeEarned(userId, {
                    ...userBadge,
                    badge
                });
            }
            return {
                ...userBadge,
                badge
            };
        }
        catch (error) {
            console.error(`Error al otorgar la insignia ${badgeId} al usuario ${userId}:`, error);
            throw new Error(`Error al otorgar la insignia al usuario`);
        }
    }
    /**
     * Buscar insignias por tipo
     */
    async getBadgesByType(type) {
        try {
            return await db_1.db
                .select()
                .from(schema_1.verificationBadges)
                .where((0, drizzle_orm_1.eq)(schema_1.verificationBadges.type, type));
        }
        catch (error) {
            console.error(`Error al obtener las insignias de tipo ${type}:`, error);
            throw new Error(`Error al obtener las insignias de tipo ${type}`);
        }
    }
    /**
     * Notificar a un usuario que ha ganado una insignia mediante WebSocket
     */
    notifyBadgeEarned(userId, badgeData) {
        if (!this.wss)
            return;
        console.log(`Notificando al usuario ${userId} sobre nueva insignia`);
        this.wss.clients.forEach((client) => {
            // Solo enviar a los clientes autenticados como este usuario
            if (client.userId === userId && client.readyState === 1) { // 1 = WebSocket.OPEN
                client.send(JSON.stringify({
                    type: 'badge_earned',
                    message: '¡Has ganado una nueva insignia!',
                    data: badgeData
                }));
            }
        });
    }
    /**
     * Crear o actualizar una insignia de verificación
     */
    async createOrUpdateBadge(badgeData) {
        try {
            if (badgeData.id) {
                // Actualizar insignia existente
                const [updatedBadge] = await db_1.db
                    .update(schema_1.verificationBadges)
                    .set({
                    name: badgeData.name,
                    description: badgeData.description,
                    type: badgeData.type,
                    level: badgeData.level,
                    points: badgeData.points,
                    badgeImage: badgeData.badgeImage,
                    metadata: badgeData.metadata
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.verificationBadges.id, badgeData.id))
                    .returning();
                return updatedBadge;
            }
            else {
                // Crear nueva insignia
                const [newBadge] = await db_1.db
                    .insert(schema_1.verificationBadges)
                    .values({
                    name: badgeData.name,
                    description: badgeData.description,
                    type: badgeData.type,
                    level: badgeData.level,
                    points: badgeData.points,
                    badgeImage: badgeData.badgeImage,
                    metadata: badgeData.metadata
                })
                    .returning();
                return newBadge;
            }
        }
        catch (error) {
            console.error(`Error al crear/actualizar la insignia:`, error);
            throw new Error(`Error al crear/actualizar la insignia`);
        }
    }
    /**
     * Obtener información pública de una insignia (para compartir)
     */
    async getPublicBadgeInfo(userBadgeId) {
        try {
            const [result] = await db_1.db
                .select({
                userBadge: schema_1.userBadges,
                badge: schema_1.verificationBadges,
                user: {
                    username: schema_1.users.username,
                }
            })
                .from(schema_1.userBadges)
                .innerJoin(schema_1.verificationBadges, (0, drizzle_orm_1.eq)(schema_1.userBadges.badgeId, schema_1.verificationBadges.id))
                .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.userBadges.userId, schema_1.users.id))
                .where((0, drizzle_orm_1.eq)(schema_1.userBadges.id, userBadgeId));
            if (!result)
                return null;
            // Formatear para uso público, omitiendo información sensible
            return {
                id: result.userBadge.id,
                earnedAt: result.userBadge.earnedAt,
                metadata: result.userBadge.metadata,
                badge: {
                    id: result.badge.id,
                    name: result.badge.name,
                    description: result.badge.description,
                    type: result.badge.type,
                    level: result.badge.level,
                    badgeImage: result.badge.badgeImage,
                },
                user: {
                    username: result.user.username,
                }
            };
        }
        catch (error) {
            console.error(`Error al obtener información pública de la insignia ${userBadgeId}:`, error);
            throw new Error(`Error al obtener información pública de la insignia`);
        }
    }
    /**
     * Registrar compartición social de una insignia
     */
    async registerSocialShare(userBadgeId, platform) {
        try {
            const [userBadge] = await db_1.db
                .select()
                .from(schema_1.userBadges)
                .where((0, drizzle_orm_1.eq)(schema_1.userBadges.id, userBadgeId));
            if (!userBadge) {
                throw new Error(`La insignia del usuario con ID ${userBadgeId} no existe`);
            }
            // Actualizar metadatos para incluir información de compartición
            const metadata = userBadge.metadata || {};
            if (!metadata.shares) {
                metadata.shares = {
                    total: 0,
                    platforms: {}
                };
            }
            // Incrementar contadores
            metadata.shares.total = (metadata.shares.total || 0) + 1;
            metadata.shares.platforms[platform] = (metadata.shares.platforms[platform] || 0) + 1;
            // Actualizar metadatos
            const [updatedUserBadge] = await db_1.db
                .update(schema_1.userBadges)
                .set({
                metadata: metadata
            })
                .where((0, drizzle_orm_1.eq)(schema_1.userBadges.id, userBadgeId))
                .returning();
            // Verificar si el usuario merece una insignia social
            this.checkForSocialBadges(userBadge.userId, metadata.shares);
            return updatedUserBadge;
        }
        catch (error) {
            console.error(`Error al registrar compartición de la insignia ${userBadgeId}:`, error);
            throw new Error(`Error al registrar compartición de la insignia`);
        }
    }
    /**
     * Verificar si un usuario merece insignias sociales basadas en su actividad
     */
    async checkForSocialBadges(userId, shareStats) {
        try {
            // Insignia de Embajador Digital - 5 comparticiones
            if (shareStats.total >= 5) {
                const embajadorBadge = await db_1.db
                    .select()
                    .from(schema_1.verificationBadges)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.verificationBadges.type, 'social'), (0, drizzle_orm_1.eq)(schema_1.verificationBadges.name, 'Embajador Digital')));
                if (embajadorBadge.length > 0) {
                    await this.awardBadgeToUser(userId, embajadorBadge[0].id, { shareCount: shareStats.total });
                }
            }
            // Insignia de Influencer Digital - 20 comparticiones
            if (shareStats.total >= 20) {
                const influencerBadge = await db_1.db
                    .select()
                    .from(schema_1.verificationBadges)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.verificationBadges.type, 'social'), (0, drizzle_orm_1.eq)(schema_1.verificationBadges.name, 'Influencer Digital')));
                if (influencerBadge.length > 0) {
                    await this.awardBadgeToUser(userId, influencerBadge[0].id, { shareCount: shareStats.total });
                }
            }
            // Otras insignias específicas por plataforma podrían añadirse aquí
        }
        catch (error) {
            console.error(`Error al verificar insignias sociales para el usuario ${userId}:`, error);
        }
    }
}
exports.BadgeService = BadgeService;
// Exportar una instancia singleton
exports.badgeService = new BadgeService();
