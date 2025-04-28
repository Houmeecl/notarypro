import { db } from '../db';
import { quickAchievements, userAchievementProgress } from '@shared/schema';

/**
 * Este script crea un logro de verificación de prueba
 * y lo marca como desbloqueado para el usuario 2 (admin)
 */
async function createTestAchievement() {
  try {
    console.log('Creando logro de prueba para verificación de documentos...');
    
    // Crear el logro
    const [achievement] = await db.insert(quickAchievements)
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
    await db.insert(userAchievementProgress)
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
    
  } catch (error) {
    console.error('Error creando el logro de prueba:', error);
  }
}

// Ejecutar la función
createTestAchievement();