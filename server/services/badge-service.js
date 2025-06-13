"use strict";
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
    getAllBadges() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield db_1.db.select().from(schema_1.verificationBadges);
            }
            catch (error) {
                console.error("Error al obtener las insignias:", error);
                throw new Error("Error al obtener las insignias");
            }
        });
    }
    /**
     * Obtener una insignia por su ID
     */
    getBadgeById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [badge] = yield db_1.db
                    .select()
                    .from(schema_1.verificationBadges)
                    .where((0, drizzle_orm_1.eq)(schema_1.verificationBadges.id, id));
                return badge;
            }
            catch (error) {
                console.error(`Error al obtener la insignia con ID ${id}:`, error);
                throw new Error(`Error al obtener la insignia con ID ${id}`);
            }
        });
    }
    /**
     * Obtener las insignias de un usuario
     */
    getUserBadges(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield db_1.db
                    .select({
                    userBadge: schema_1.userBadges,
                    badge: schema_1.verificationBadges
                })
                    .from(schema_1.userBadges)
                    .innerJoin(schema_1.verificationBadges, (0, drizzle_orm_1.eq)(schema_1.userBadges.badgeId, schema_1.verificationBadges.id))
                    .where((0, drizzle_orm_1.eq)(schema_1.userBadges.userId, userId))
                    .orderBy((0, drizzle_orm_1.desc)(schema_1.userBadges.earnedAt));
                // Transformar los resultados a un formato más conveniente
                return results.map(({ userBadge, badge }) => (Object.assign(Object.assign({}, userBadge), { badge: badge })));
            }
            catch (error) {
                console.error(`Error al obtener las insignias del usuario ${userId}:`, error);
                throw new Error(`Error al obtener las insignias del usuario`);
            }
        });
    }
    /**
     * Obtener una insignia específica de un usuario
     */
    getUserBadge(userId, badgeId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [result] = yield db_1.db
                    .select({
                    userBadge: schema_1.userBadges,
                    badge: schema_1.verificationBadges
                })
                    .from(schema_1.userBadges)
                    .innerJoin(schema_1.verificationBadges, (0, drizzle_orm_1.eq)(schema_1.userBadges.badgeId, schema_1.verificationBadges.id))
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userBadges.userId, userId), (0, drizzle_orm_1.eq)(schema_1.userBadges.badgeId, badgeId)));
                if (!result)
                    return null;
                return Object.assign(Object.assign({}, result.userBadge), { badge: result.badge });
            }
            catch (error) {
                console.error(`Error al obtener la insignia ${badgeId} del usuario ${userId}:`, error);
                throw new Error(`Error al obtener la insignia del usuario`);
            }
        });
    }
    /**
     * Otorgar una insignia a un usuario
     */
    awardBadgeToUser(userId_1, badgeId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, badgeId, metadata = {}) {
            try {
                // Verificar si el usuario ya tiene la insignia
                const existingBadge = yield this.getUserBadge(userId, badgeId);
                if (existingBadge) {
                    return existingBadge;
                }
                // Obtener la insignia para incluir sus detalles en la notificación
                const badge = yield this.getBadgeById(badgeId);
                if (!badge) {
                    throw new Error(`La insignia con ID ${badgeId} no existe`);
                }
                // Crear nueva entrada en userBadges
                const [userBadge] = yield db_1.db
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
                    this.notifyBadgeEarned(userId, Object.assign(Object.assign({}, userBadge), { badge }));
                }
                return Object.assign(Object.assign({}, userBadge), { badge });
            }
            catch (error) {
                console.error(`Error al otorgar la insignia ${badgeId} al usuario ${userId}:`, error);
                throw new Error(`Error al otorgar la insignia al usuario`);
            }
        });
    }
    /**
     * Buscar insignias por tipo
     */
    getBadgesByType(type) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield db_1.db
                    .select()
                    .from(schema_1.verificationBadges)
                    .where((0, drizzle_orm_1.eq)(schema_1.verificationBadges.type, type));
            }
            catch (error) {
                console.error(`Error al obtener las insignias de tipo ${type}:`, error);
                throw new Error(`Error al obtener las insignias de tipo ${type}`);
            }
        });
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
    createOrUpdateBadge(badgeData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (badgeData.id) {
                    // Actualizar insignia existente
                    const [updatedBadge] = yield db_1.db
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
                    const [newBadge] = yield db_1.db
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
        });
    }
    /**
     * Obtener información pública de una insignia (para compartir)
     */
    getPublicBadgeInfo(userBadgeId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [result] = yield db_1.db
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
        });
    }
    /**
     * Registrar compartición social de una insignia
     */
    registerSocialShare(userBadgeId, platform) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [userBadge] = yield db_1.db
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
                const [updatedUserBadge] = yield db_1.db
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
        });
    }
    /**
     * Verificar si un usuario merece insignias sociales basadas en su actividad
     */
    checkForSocialBadges(userId, shareStats) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Insignia de Embajador Digital - 5 comparticiones
                if (shareStats.total >= 5) {
                    const embajadorBadge = yield db_1.db
                        .select()
                        .from(schema_1.verificationBadges)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.verificationBadges.type, 'social'), (0, drizzle_orm_1.eq)(schema_1.verificationBadges.name, 'Embajador Digital')));
                    if (embajadorBadge.length > 0) {
                        yield this.awardBadgeToUser(userId, embajadorBadge[0].id, { shareCount: shareStats.total });
                    }
                }
                // Insignia de Influencer Digital - 20 comparticiones
                if (shareStats.total >= 20) {
                    const influencerBadge = yield db_1.db
                        .select()
                        .from(schema_1.verificationBadges)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.verificationBadges.type, 'social'), (0, drizzle_orm_1.eq)(schema_1.verificationBadges.name, 'Influencer Digital')));
                    if (influencerBadge.length > 0) {
                        yield this.awardBadgeToUser(userId, influencerBadge[0].id, { shareCount: shareStats.total });
                    }
                }
                // Otras insignias específicas por plataforma podrían añadirse aquí
            }
            catch (error) {
                console.error(`Error al verificar insignias sociales para el usuario ${userId}:`, error);
            }
        });
    }
}
exports.BadgeService = BadgeService;
// Exportar una instancia singleton
exports.badgeService = new BadgeService();
