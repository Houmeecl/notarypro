import React from 'react';
import { useMicroInteractions } from '@/hooks/use-micro-interactions';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MicroInteractionDisplayProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  maxWidth?: number;
}

const positionStyles = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

/**
 * Componente para mostrar micro-interacciones en la interfaz
 */
export const MicroInteractionDisplay: React.FC<MicroInteractionDisplayProps> = ({ 
  position = 'bottom-right',
  maxWidth = 320
}) => {
  const { currentInteraction, isShowingInteraction, dismissCurrentInteraction } = useMicroInteractions();
  
  if (!isShowingInteraction || !currentInteraction) {
    return null;
  }

  // Determinar qué tipo de interacción mostrar
  const renderInteractionContent = () => {
    switch (currentInteraction.type) {
      case 'achievement':
        return (
          <div className="flex items-start p-4">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg">{currentInteraction.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">{currentInteraction.displayMessage}</p>
              {currentInteraction.pointsAwarded && currentInteraction.pointsAwarded > 0 && (
                <Badge variant="outline" className="mt-2 bg-primary/5">
                  +{currentInteraction.pointsAwarded} puntos
                </Badge>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full -mt-1 -mr-1"
              onClick={dismissCurrentInteraction}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
        
      case 'badge':
        return (
          <div className="flex items-center p-4">
            <div className="flex-shrink-0 mr-4">
              {currentInteraction.visualAsset ? (
                <img 
                  src={currentInteraction.visualAsset} 
                  alt={currentInteraction.name} 
                  className="h-16 w-16 object-contain"
                />
              ) : (
                <div className="bg-primary/10 p-3 rounded-full">
                  <Award className="h-10 w-10 text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg">{currentInteraction.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">{currentInteraction.displayMessage}</p>
              {currentInteraction.pointsAwarded && currentInteraction.pointsAwarded > 0 && (
                <Badge variant="outline" className="mt-2 bg-primary/5">
                  +{currentInteraction.pointsAwarded} puntos
                </Badge>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full -mt-1 -mr-1 ml-2"
              onClick={dismissCurrentInteraction}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
        
      case 'animation':
        return (
          <div className="p-4 text-center">
            {currentInteraction.visualAsset ? (
              <img 
                src={currentInteraction.visualAsset} 
                alt={currentInteraction.name} 
                className="max-h-40 mx-auto mb-4"
              />
            ) : (
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="h-12 w-12 text-primary" />
                </div>
              </div>
            )}
            <h4 className="font-semibold text-lg">{currentInteraction.name}</h4>
            <p className="text-sm text-muted-foreground mt-2">{currentInteraction.displayMessage}</p>
            {currentInteraction.pointsAwarded && currentInteraction.pointsAwarded > 0 && (
              <Badge variant="outline" className="mt-3 bg-primary/5 mx-auto">
                +{currentInteraction.pointsAwarded} puntos
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full absolute top-2 right-2"
              onClick={dismissCurrentInteraction}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
        
      default:
        return (
          <div className="p-4">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold">{currentInteraction.name}</h4>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 rounded-full -mt-1 -mr-1"
                onClick={dismissCurrentInteraction}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{currentInteraction.displayMessage}</p>
            {currentInteraction.pointsAwarded && currentInteraction.pointsAwarded > 0 && (
              <Badge variant="outline" className="mt-2 bg-primary/5">
                +{currentInteraction.pointsAwarded} puntos
              </Badge>
            )}
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key={currentInteraction.id}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`fixed ${positionStyles[position]} z-50`}
        style={{ maxWidth, width: '100%' }}
      >
        <div className="bg-background border rounded-lg shadow-lg overflow-hidden">
          {renderInteractionContent()}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};