import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  ChevronRight,
  ChevronLeft,
  X,
  PlayCircle,
  Coffee
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  selector: string;
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  spotlightPadding?: number;
  action?: () => void;
}

interface WelcomeTourProps {
  tourId: string;
  steps: TourStep[];
  onComplete?: () => void;
  showOnce?: boolean;
  autoStart?: boolean;
  delayStart?: number;
}

/**
 * Welcome Tour Component
 * 
 * Creates an interactive guided tour that spotlights different UI elements
 * and explains their functionality to new users.
 * 
 * Usage:
 * ```jsx
 * <WelcomeTour
 *   tourId="dashboard-tour"
 *   steps={[
 *     {
 *       id: "step1",
 *       title: "Bienvenido al Dashboard",
 *       description: "Este es su panel principal donde puede ver un resumen de su actividad.",
 *       selector: "#dashboard-overview",
 *       position: "bottom"
 *     },
 *     // More steps...
 *   ]}
 *   showOnce={true}
 *   autoStart={true}
 * />
 * ```
 */
export function WelcomeTour({
  tourId,
  steps,
  onComplete,
  showOnce = true,
  autoStart = true,
  delayStart = 1500
}: WelcomeTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTourComplete, setIsTourComplete] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isPositioningReady, setIsPositioningReady] = useState(false);
  const { toast } = useToast();
  
  const currentStep = steps[currentStepIndex];
  
  const scrollToElement = (selector: string) => {
    try {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    } catch (error) {
      console.error("Error scrolling to element:", error);
    }
  };
  
  const updateHighlightPosition = () => {
    const { selector, spotlightPadding = 10 } = currentStep;
    
    try {
      const element = document.querySelector(selector);
      if (!element) {
        // If element not found, position in center
        setHighlightPosition({
          top: window.innerHeight / 2,
          left: window.innerWidth / 2,
          width: 0,
          height: 0
        });
        return;
      }
      
      const rect = element.getBoundingClientRect();
      setHighlightPosition({
        top: rect.top + window.scrollY - spotlightPadding,
        left: rect.left + window.scrollX - spotlightPadding,
        width: rect.width + (spotlightPadding * 2),
        height: rect.height + (spotlightPadding * 2)
      });
      
      // Scroll the element into view
      scrollToElement(selector);
      
    } catch (error) {
      console.error("Error updating position:", error);
      // Default to center
      setHighlightPosition({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
        width: 0,
        height: 0
      });
    }
    
    setIsPositioningReady(true);
  };
  
  // Initialize tour
  useEffect(() => {
    const isTourSeen = localStorage.getItem(`tour_${tourId}_completed`) === 'true';
    
    if (showOnce && isTourSeen) {
      setIsTourComplete(true);
      return;
    }
    
    if (autoStart) {
      const timer = setTimeout(() => {
        startTour();
      }, delayStart);
      
      return () => clearTimeout(timer);
    }
  }, [tourId, showOnce, autoStart, delayStart]);
  
  // Update position when step changes or window resizes
  useEffect(() => {
    if (!isOpen || !currentStep) return;
    
    updateHighlightPosition();
    
    const handleResize = () => {
      updateHighlightPosition();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, currentStep, currentStepIndex]);
  
  const startTour = () => {
    setIsOpen(true);
    setCurrentStepIndex(0);
    setIsPositioningReady(false);
    updateHighlightPosition();
  };
  
  const handleNext = () => {
    // Execute any action defined for the current step
    if (currentStep.action) {
      currentStep.action();
    }
    
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setIsPositioningReady(false);
    } else {
      handleComplete();
    }
  };
  
  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setIsPositioningReady(false);
    }
  };
  
  const handleSkip = () => {
    setIsOpen(false);
    
    if (showOnce) {
      localStorage.setItem(`tour_${tourId}_completed`, 'true');
      setIsTourComplete(true);
    }
    
    toast({
      title: "Tour saltado",
      description: "Puede reiniciar el tour desde el menú de ayuda.",
    });
  };
  
  const handleComplete = () => {
    setIsOpen(false);
    
    if (showOnce) {
      localStorage.setItem(`tour_${tourId}_completed`, 'true');
      setIsTourComplete(true);
    }
    
    toast({
      title: "¡Tour completado!",
      description: "Ya está listo para usar la plataforma.",
    });
    
    if (onComplete) {
      onComplete();
    }
  };
  
  if (!isOpen || isTourComplete) {
    return (
      <button
        onClick={startTour}
        className="fixed bottom-4 right-4 z-50 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
        title="Iniciar tour de bienvenida"
      >
        <PlayCircle className="h-6 w-6" />
      </button>
    );
  }
  
  // Get position for the tooltip
  const getTooltipPosition = () => {
    const { position = 'bottom' } = currentStep;
    
    if (position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }
    
    // Element based positioning
    const { top, left, width, height } = highlightPosition;
    
    switch (position) {
      case 'top':
        return {
          top: `${top - 20}px`,
          left: `${left + width / 2}px`,
          transform: 'translate(-50%, -100%)'
        };
      case 'right':
        return {
          top: `${top + height / 2}px`,
          left: `${left + width + 20}px`,
          transform: 'translateY(-50%)'
        };
      case 'bottom':
        return {
          top: `${top + height + 20}px`,
          left: `${left + width / 2}px`,
          transform: 'translateX(-50%)'
        };
      case 'left':
        return {
          top: `${top + height / 2}px`,
          left: `${left - 20}px`,
          transform: 'translate(-100%, -50%)'
        };
      default:
        return {
          top: `${top + height + 20}px`,
          left: `${left + width / 2}px`,
          transform: 'translateX(-50%)'
        };
    }
  };
  
  const tooltipPosition = getTooltipPosition();
  
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Overlay with spotlight */}
      <div className="absolute inset-0 bg-black/60 pointer-events-auto">
        {isPositioningReady && (
          <div 
            className="absolute rounded-lg transition-all duration-300 ease-in-out"
            style={{
              top: highlightPosition.top,
              left: highlightPosition.left,
              width: highlightPosition.width,
              height: highlightPosition.height,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
              border: '2px solid white'
            }}
          />
        )}
      </div>
      
      {/* Tooltip */}
      <div
        className="fixed pointer-events-auto bg-white rounded-lg shadow-xl w-80 transition-all duration-300 ease-in-out"
        style={tooltipPosition}
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-xl">{currentStep.title}</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-gray-600 mb-6">{currentStep.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStepIndex ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex space-x-2">
              {currentStepIndex > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
              )}
              
              <Button
                size="sm"
                onClick={handleNext}
              >
                {currentStepIndex < steps.length - 1 ? (
                  <>
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  <>
                    Finalizar
                    <Check className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Coffee break button - offers to pause the tour */}
      <div className="fixed top-4 right-4 pointer-events-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSkip}
          className="bg-white"
        >
          <Coffee className="h-4 w-4 mr-2" />
          Pausar tour
        </Button>
      </div>
    </div>
  );
}