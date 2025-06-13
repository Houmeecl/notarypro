import { useState, useEffect, ReactNode } from 'react';
import { 
  X, 
  ChevronRight, 
  HelpCircle, 
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/hooks/use-onboarding';

interface FeatureHighlightProps {
  featureId: string;
  title: string;
  description: string;
  position?: 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  children: ReactNode;
  onboardingStep?: string;
  showOnce?: boolean;
  width?: string;
  icon?: ReactNode;
  delay?: number;
}

/**
 * Feature Highlight Component
 * 
 * Wraps any component with a tooltip-style highlight that points out features to new users.
 * Can be configured to show only once, or to link to a specific onboarding step.
 * 
 * Usage:
 * ```jsx
 * <FeatureHighlight
 *   featureId="document-upload"
 *   title="Suba sus documentos"
 *   description="Haga clic aquí para subir documentos que necesite certificar"
 *   position="bottom"
 *   onboardingStep="documents"
 * >
 *   <Button>Subir Documento</Button>
 * </FeatureHighlight>
 * ```
 */
export function FeatureHighlight({ 
  featureId,
  title,
  description,
  position = 'bottom',
  children,
  onboardingStep,
  showOnce = true,
  width = "300px",
  icon = <Lightbulb className="h-5 w-5 text-amber-500" />,
  delay = 500
}: FeatureHighlightProps) {
  const [showHighlight, setShowHighlight] = useState(false);
  const { showOnboarding } = useOnboarding();
  
  useEffect(() => {
    // Check if this feature highlight has been dismissed before
    const isHighlightDismissed = localStorage.getItem(`feature_highlight_${featureId}_dismissed`) === 'true';
    
    if (showOnce && isHighlightDismissed) {
      return;
    }
    
    // Show the highlight after a delay 
    const timer = setTimeout(() => {
      setShowHighlight(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [featureId, showOnce, delay]);
  
  const handleDismiss = () => {
    setShowHighlight(false);
    
    if (showOnce) {
      localStorage.setItem(`feature_highlight_${featureId}_dismissed`, 'true');
    }
  };
  
  const handleLearnMore = () => {
    if (onboardingStep) {
      showOnboarding(onboardingStep);
    }
    
    handleDismiss();
  };
  
  // Calculate the position class based on the position prop
  let positionClass = '';
  
  switch (position) {
    case 'top':
      positionClass = 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      break;
    case 'right':
      positionClass = 'left-full top-1/2 -translate-y-1/2 ml-2';
      break;
    case 'bottom':
      positionClass = 'top-full left-1/2 -translate-x-1/2 mt-2';
      break;
    case 'left':
      positionClass = 'right-full top-1/2 -translate-y-1/2 mr-2';
      break;
    case 'top-left':
      positionClass = 'bottom-full right-0 mb-2';
      break;
    case 'top-right':
      positionClass = 'bottom-full left-0 mb-2';
      break;
    case 'bottom-left':
      positionClass = 'top-full right-0 mt-2';
      break;
    case 'bottom-right':
      positionClass = 'top-full left-0 mt-2';
      break;
    default:
      positionClass = 'top-full left-1/2 -translate-x-1/2 mt-2';
  }
  
  // Add an arrow based on position
  const arrowClass = (() => {
    switch (position) {
      case 'top':
        return 'bottom-[-8px] left-1/2 -translate-x-1/2 border-t-primary-foreground border-l-transparent border-r-transparent border-b-transparent';
      case 'right':
        return 'left-[-8px] top-1/2 -translate-y-1/2 border-r-primary-foreground border-t-transparent border-b-transparent border-l-transparent';
      case 'bottom':
        return 'top-[-8px] left-1/2 -translate-x-1/2 border-b-primary-foreground border-l-transparent border-r-transparent border-t-transparent';
      case 'left':
        return 'right-[-8px] top-1/2 -translate-y-1/2 border-l-primary-foreground border-t-transparent border-b-transparent border-r-transparent';
      case 'top-left':
        return 'bottom-[-8px] right-4 border-t-primary-foreground border-l-transparent border-r-transparent border-b-transparent';
      case 'top-right':
        return 'bottom-[-8px] left-4 border-t-primary-foreground border-l-transparent border-r-transparent border-b-transparent';
      case 'bottom-left':
        return 'top-[-8px] right-4 border-b-primary-foreground border-l-transparent border-r-transparent border-t-transparent';
      case 'bottom-right':
        return 'top-[-8px] left-4 border-b-primary-foreground border-l-transparent border-r-transparent border-t-transparent';
      default:
        return 'top-[-8px] left-1/2 -translate-x-1/2 border-b-primary-foreground border-l-transparent border-r-transparent border-t-transparent';
    }
  })();

  return (
    <div className="relative group">
      {children}
      
      {showHighlight && (
        <div 
          className={`absolute z-50 ${positionClass}`}
          style={{ width }}
        >
          <div className="bg-white border rounded-lg shadow-lg">
            {/* Arrow */}
            <div className={`absolute w-0 h-0 border-8 ${arrowClass}`}></div>
            
            {/* Content */}
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  {icon}
                </div>
                <div className="flex-grow">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium text-gray-900">{title}</h4>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 -mt-1 -mr-1"
                      onClick={handleDismiss}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
              </div>
              
              {onboardingStep && (
                <div className="mt-3 pt-3 border-t flex justify-end">
                  <Button 
                    variant="outline"
                    size="sm" 
                    className="text-xs"
                    onClick={handleLearnMore}
                  >
                    Aprender más
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}