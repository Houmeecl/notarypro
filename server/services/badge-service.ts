import { db } from "../db";
import { verificationBadges, userBadges, users } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { WebSocketServer } from "ws";

/**
 * Servicio para gestionar las insignias de verificación y compartición social
 */
export class BadgeService {
  private wss: WebSocketServer | null = null;

  constructor(wss?: WebSocketServer) {
    this.wss = wss || null;
  }

  /**
   * Establecer el servidor WebSocket
   */
  setWebSocketServer(wss: WebSocketServer) {
    this.wss = wss;
  }

  /**
   * Obtener todas las insignias de verificación
   */
  async getAllBadges() {
    try {
      return await db.select().from(verificationBadges);
    } catch (error) {
      console.error("Error al obtener las insignias:", error);
      throw new Error("Error al obtener las insignias");
    }
  }

  /**
   * Obtener una insignia por su ID
   */
  async getBadgeById(id: number) {
    try {
      const [badge] = await db
        .select()
        .from(verificationBadges)
        .where(eq(verificationBadges.id, id));

      return badge;
    } catch (error) {
      console.error(`Error al obtener la insignia con ID ${id}:`, error);
      throw new Error(`Error al obtener la insignia con ID ${id}`);
    }
  }

  /**
   * Obtener las insignias de un usuario
   */
  async getUserBadges(userId: number) {
    try {
      const results = await db
        .select({
          userBadge: userBadges,
          badge: verificationBadges
        })
        .from(userBadges)
        .innerJoin(
          verificationBadges,
          eq(userBadges.badgeId, verificationBadges.id)
        )
        .where(eq(userBadges.userId, userId))
        .orderBy(desc(userBadges.earnedAt));

      // Transformar los resultados a un formato más conveniente
      return results.map(({ userBadge, badge }) => ({
        ...userBadge,
        badge: badge
      }));
    } catch (error) {
      console.error(`Error al obtener las insignias del usuario ${userId}:`, error);
      throw new Error(`Error al obtener las insignias del usuario`);
    }
  }

  /**
   * Obtener una insignia específica de un usuario
   */
  async getUserBadge(userId: number, badgeId: number) {
    try {
      const [result] = await db
        .select({
          userBadge: userBadges,
          badge: verificationBadges
        })
        .from(userBadges)
        .innerJoin(
          verificationBadges,
          eq(userBadges.badgeId, verificationBadges.id)
        )
        .where(
          and(
            eq(userBadges.userId, userId),
            eq(userBadges.badgeId, badgeId)
          )
        );

      if (!result) return null;

      return {
        ...result.userBadge,
        badge: result.badge
      };
    } catch (error) {
      console.error(`Error al obtener la insignia ${badgeId} del usuario ${userId}:`, error);
      throw new Error(`Error al obtener la insignia del usuario`);
    }
  }

  /**
   * Otorgar una insignia a un usuario
   */
  async awardBadgeToUser(userId: number, badgeId: number, metadata: any = {}) {
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
      const [userBadge] = await db
        .insert(userBadges)
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
    } catch (error) {
      console.error(`Error al otorgar la insignia ${badgeId} al usuario ${userId}:`, error);
      throw new Error(`Error al otorgar la insignia al usuario`);
    }
  }

  /**
   * Buscar insignias por tipo
   */
  async getBadgesByType(type: string) {
    try {
      return await db
        .select()
        .from(verificationBadges)
        .where(eq(verificationBadges.type, type));
    } catch (error) {
      console.error(`Error al obtener las insignias de tipo ${type}:`, error);
      throw new Error(`Error al obtener las insignias de tipo ${type}`);
    }
  }

  /**
   * Notificar a un usuario que ha ganado una insignia mediante WebSocket
   */
  private notifyBadgeEarned(userId: number, badgeData: any) {
    if (!this.wss) return;

    console.log(`Notificando al usuario ${userId} sobre nueva insignia`);

    this.wss.clients.forEach((client: any) => {
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
  async createOrUpdateBadge(badgeData: any) {
    try {
      if (badgeData.id) {
        // Actualizar insignia existente
        const [updatedBadge] = await db
          .update(verificationBadges)
          .set({
            name: badgeData.name,
            description: badgeData.description,
            type: badgeData.type,
            level: badgeData.level,
            points: badgeData.points,
            badgeImage: badgeData.badgeImage,
            metadata: badgeData.metadata
          })
          .where(eq(verificationBadges.id, badgeData.id))
          .returning();

        return updatedBadge;
      } else {
        // Crear nueva insignia
        const [newBadge] = await db
          .insert(verificationBadges)
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
    } catch (error) {
      console.error(`Error al crear/actualizar la insignia:`, error);
      throw new Error(`Error al crear/actualizar la insignia`);
    }
  }

  /**
   * Obtener información pública de una insignia (para compartir)
   */
  async getPublicBadgeInfo(userBadgeId: number) {
    try {
      const [result] = await db
        .select({
          userBadge: userBadges,
          badge: verificationBadges,
          user: {
            username: users.username,
          }
        })
        .from(userBadges)
        .innerJoin(
          verificationBadges,
          eq(userBadges.badgeId, verificationBadges.id)
        )
        .innerJoin(
          users,
          eq(userBadges.userId, users.id)
        )
        .where(eq(userBadges.id, userBadgeId));

      if (!result) return null;

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
    } catch (error) {
      console.error(`Error al obtener información pública de la insignia ${userBadgeId}:`, error);
      throw new Error(`Error al obtener información pública de la insignia`);
    }
  }

  /**
   * Registrar compartición social de una insignia
   */
  async registerSocialShare(userBadgeId: number, platform: string) {
    try {
      const [userBadge] = await db
        .select()
        .from(userBadges)
        .where(eq(userBadges.id, userBadgeId));

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
      const [updatedUserBadge] = await db
        .update(userBadges)
        .set({
          metadata: metadata
        })
        .where(eq(userBadges.id, userBadgeId))
        .returning();
      
      // Verificar si el usuario merece una insignia social
      this.checkForSocialBadges(userBadge.userId, metadata.shares);

      return updatedUserBadge;
    } catch (error) {
      console.error(`Error al registrar compartición de la insignia ${userBadgeId}:`, error);
      throw new Error(`Error al registrar compartición de la insignia`);
    }
  }

  /**
   * Verificar si un usuario merece insignias sociales basadas en su actividad
   */
  private async checkForSocialBadges(userId: number, shareStats: any) {
    try {
      // Insignia de Embajador Digital - 5 comparticiones
      if (shareStats.total >= 5) {
        const embajadorBadge = await db
          .select()
          .from(verificationBadges)
          .where(
            and(
              eq(verificationBadges.type, 'social'),
              eq(verificationBadges.name, 'Embajador Digital')
            )
          );

        if (embajadorBadge.length > 0) {
          await this.awardBadgeToUser(userId, embajadorBadge[0].id, { shareCount: shareStats.total });
        }
      }

      // Insignia de Influencer Digital - 20 comparticiones
      if (shareStats.total >= 20) {
        const influencerBadge = await db
          .select()
          .from(verificationBadges)
          .where(
            and(
              eq(verificationBadges.type, 'social'),
              eq(verificationBadges.name, 'Influencer Digital')
            )
          );

        if (influencerBadge.length > 0) {
          await this.awardBadgeToUser(userId, influencerBadge[0].id, { shareCount: shareStats.total });
        }
      }

      // Otras insignias específicas por plataforma podrían añadirse aquí
    } catch (error) {
      console.error(`Error al verificar insignias sociales para el usuario ${userId}:`, error);
    }
  }
}

// Exportar una instancia singleton
export const badgeService = new BadgeService();