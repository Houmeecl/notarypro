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
const db_1 = require("../db");
const schema_1 = require("@shared/schema");
/**
 * Este script crea un logro de verificación de prueba
 * y lo marca como desbloqueado para el usuario 2 (admin)
 */
function createTestAchievement() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Creando logro de prueba para verificación de documentos...');
            // Crear el logro
            const [achievement] = yield db_1.db.insert(schema_1.quickAchievements)
                .values({
                name: 'Verificador Principiante',
                description: 'Has verificado tu primer documento',
                icon: 'shield',
                metricType: 'count',
                threshold: 1,
                category: 'document_verification',
                rewardPoints: 100,
                level: 1,
                isActive: true
            })
                .returning();
            console.log(`Logro creado con ID: ${achievement.id}`);
            // Marcar como desbloqueado para el usuario admin (ID 2)
            yield db_1.db.insert(schema_1.userAchievementProgress)
                .values({
                userId: 2,
                achievementId: achievement.id,
                currentValue: 1,
                unlocked: true,
                unlockedAt: new Date(),
                metadata: {
                    documentTitle: 'Contrato de Prestación de Servicios',
                    documentCode: 'DC-1234-AB',
                    verificationCount: 5
                }
            });
            console.log('Logro desbloqueado para el usuario admin (ID 2)');
            console.log('Proceso completado exitosamente');
        }
        catch (error) {
            console.error('Error creando el logro de prueba:', error);
        }
    });
}
// Ejecutar la función
createTestAchievement();
