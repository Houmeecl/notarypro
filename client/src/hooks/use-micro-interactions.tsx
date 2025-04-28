import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './use-auth';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from './use-toast';
import ReactConfetti from 'react-confetti';
import { useMutation } from '@tanstack/react-query';

// Lista de eventos predefinidos que pueden activar micro-interacciones
export type MicroInteractionEvent = 
  | 'document_view'           // Ver un documento
  | 'document_sign'           // Firmar un documento
  | 'video_call_start'        // Iniciar videollamada
  | 'video_call_end'          // Finalizar videollamada
  | 'profile_update'          // Actualizar perfil
  | 'consecutive_login'       // Login consecutivo
  | 'first_verification'      // Primera verificación
  | 'level_up'                // Subir de nivel
  | 'achievement_unlock'      // Desbloquear logro
  | 'document_share'          // Compartir documento
  | 'feedback_submitted'      // Enviar feedback
  | 'challenge_complete'      // Completar desafío
  | 'purchase'                // Realizar compra
  | 'course_complete'         // Completar curso
  | 'streak_milestone';       // Hito de días consecutivos

// Tipos de micro-interacciones
export type MicroInteractionType = 
  | 'confetti'               // Lluvia de confeti
  | 'achievement'            // Notificación de logro
  | 'toast'                  // Notificación toast
  | 'animation'              // Animación especial
  | 'sound'                  // Sonido
  | 'badge';                 // Insignia

interface MicroInteraction {
  id: number;
  name: string;
  type: MicroInteractionType;
  triggerEvent: string;
  displayMessage: string;
  animationData?: any;
  soundUrl?: string;
  visualAsset?: string;
  duration?: number;
  pointsAwarded?: number;
}

interface MicroInteractionContextType {
  triggerInteraction: (eventType: MicroInteractionEvent, context?: any) => void;
  currentInteraction: MicroInteraction | null;
  isShowingInteraction: boolean;
  interactionHistory: any[];
  isLoadingHistory: boolean;
  achievements: any[];
  isLoadingAchievements: boolean;
  dismissCurrentInteraction: () => void;
}

const MicroInteractionContext = createContext<MicroInteractionContextType | null>(null);

export const MicroInteractionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentInteraction, setCurrentInteraction] = useState<MicroInteraction | null>(null);
  const [isShowingInteraction, setIsShowingInteraction] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [interactionHistory, setInteractionHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(false);

  // Cargar historial de interacciones
  useEffect(() => {
    if (user) {
      setIsLoadingHistory(true);
      apiRequest('GET', '/api/micro-interactions/user/interaction-history')
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Error loading interaction history');
        })
        .then(data => {
          setInteractionHistory(data);
        })
        .catch(error => {
          console.error('Failed to load interaction history:', error);
        })
        .finally(() => {
          setIsLoadingHistory(false);
        });
    }
  }, [user]);

  // Cargar logros del usuario
  useEffect(() => {
    if (user) {
      setIsLoadingAchievements(true);
      apiRequest('GET', '/api/micro-interactions/user/achievements')
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Error loading achievements');
        })
        .then(data => {
          setAchievements(data);
        })
        .catch(error => {
          console.error('Failed to load achievements:', error);
        })
        .finally(() => {
          setIsLoadingAchievements(false);
        });
    }
  }, [user]);

  // Mutación para activar interacciones
  const triggerInteractionMutation = useMutation({
    mutationFn: async ({ eventType, context }: { eventType: string; context?: any }) => {
      if (!user) return null;
      const response = await apiRequest('POST', '/api/micro-interactions/trigger-interaction', {
        eventType,
        context: context || {}
      });
      
      if (!response.ok) {
        throw new Error('Error triggering interaction');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (!data) return;
      
      // Procesar interacciones activadas
      if (data.triggered && data.triggered.length > 0) {
        // Tomar la primera interacción para mostrar
        const interaction = data.triggered[0];
        setCurrentInteraction(interaction);
        setIsShowingInteraction(true);
        
        // Mostrar efectos según el tipo de interacción
        switch(interaction.type) {
          case 'confetti':
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), interaction.duration || 3000);
            break;
          case 'toast':
            toast({
              title: interaction.name,
              description: interaction.displayMessage,
              duration: interaction.duration || 5000,
            });
            break;
          case 'sound':
            if (interaction.soundUrl) {
              const audio = new Audio(interaction.soundUrl);
              audio.play().catch(e => console.error('Error playing sound:', e));
            }
            break;
          // Otros tipos se manejan automáticamente por el componente de visualización
        }
        
        // Temporizador para cerrar la interacción después de la duración especificada
        if (interaction.type !== 'toast') {
          setTimeout(() => {
            setIsShowingInteraction(false);
            setCurrentInteraction(null);
          }, interaction.duration || 5000);
        }
      }
      
      // Procesar logros desbloqueados
      if (data.unlockedAchievements && data.unlockedAchievements.length > 0) {
        // Actualizar la lista de logros
        setAchievements(prev => {
          const updatedAchievements = [...prev];
          data.unlockedAchievements.forEach((achievement: any) => {
            const index = updatedAchievements.findIndex(a => a.id === achievement.id);
            if (index >= 0) {
              updatedAchievements[index] = {
                ...updatedAchievements[index],
                unlocked: true,
                unlockedAt: new Date().toISOString()
              };
            } else {
              updatedAchievements.push({
                ...achievement,
                unlocked: true,
                unlockedAt: new Date().toISOString()
              });
            }
          });
          return updatedAchievements;
        });
        
        // Mostrar notificación para cada logro desbloqueado
        data.unlockedAchievements.forEach((achievement: any) => {
          toast({
            title: '¡Nuevo logro desbloqueado!',
            description: achievement.name,
            duration: 5000,
          });
        });
      }
      
      // Actualizar el historial de interacciones
      queryClient.invalidateQueries({ queryKey: ['/api/micro-interactions/user/interaction-history'] });
    },
    onError: (error) => {
      console.error('Error triggering interaction:', error);
    }
  });

  // Función para activar una interacción
  const triggerInteraction = (eventType: MicroInteractionEvent, context?: any) => {
    if (!user) return;
    triggerInteractionMutation.mutate({ eventType, context });
  };
  
  // Función para descartar manualmente la interacción actual
  const dismissCurrentInteraction = () => {
    setIsShowingInteraction(false);
    setCurrentInteraction(null);
    setShowConfetti(false);
  };

  return (
    <MicroInteractionContext.Provider
      value={{
        triggerInteraction,
        currentInteraction,
        isShowingInteraction,
        interactionHistory,
        isLoadingHistory,
        achievements,
        isLoadingAchievements,
        dismissCurrentInteraction
      }}
    >
      {showConfetti && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, pointerEvents: 'none' }}>
          <ReactConfetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={200}
            gravity={0.3}
          />
        </div>
      )}
      {children}
    </MicroInteractionContext.Provider>
  );
};

export const useMicroInteractions = () => {
  const context = useContext(MicroInteractionContext);
  if (context === null) {
    throw new Error('useMicroInteractions must be used within a MicroInteractionProvider');
  }
  return context;
};