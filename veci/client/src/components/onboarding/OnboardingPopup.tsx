import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, X, PlayCircle } from 'lucide-react';
import { useOnboarding } from '@/hooks/use-onboarding';
import { cn } from '@/lib/utils';

export const OnboardingPopup = () => {
  const {
    currentTour,
    currentStepIndex,
    isActive,
    nextStep,
    prevStep,
    skipTour,
    endTour,
  } = useOnboarding();

  const [position, setPosition] = useState<{
    top: number;
    left: number;
    transformOrigin: string;
  }>({
    top: 0,
    left: 0,
    transformOrigin: 'center center',
  });

  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayStyles, setOverlayStyles] = useState<any>({});
  const popupRef = useRef<HTMLDivElement>(null);

  // Para calcular el progreso del tour
  const progress = currentTour
    ? ((currentStepIndex + 1) / currentTour.steps.length) * 100
    : 0;

  // Posicionar el popup y crear overlay si es necesario
  useEffect(() => {
    if (!isActive || !currentTour) return;

    const currentStep = currentTour.steps[currentStepIndex];
    const targetElement =
      currentStep.element !== 'body'
        ? document.querySelector(currentStep.element)
        : document.body;

    if (!targetElement) {
      // Si el elemento no existe, centrar en la pantalla
      setPosition({
        top: window.innerHeight / 2 - 150,
        left: window.innerWidth / 2 - 200,
        transformOrigin: 'center center',
      });
      setShowOverlay(false);
      return;
    }

    // Si es el elemento body, centrar en la pantalla
    if (currentStep.element === 'body') {
      setPosition({
        top: window.innerHeight / 2 - 150,
        left: window.innerWidth / 2 - 200,
        transformOrigin: 'center center',
      });
      setShowOverlay(false);
      return;
    }

    // Sino, posicionar cerca del elemento
    const rect = targetElement.getBoundingClientRect();
    
    // Calcular posición según la dirección especificada
    let top = 0;
    let left = 0;
    let transformOrigin = '';
    
    switch (currentStep.position) {
      case 'top':
        top = rect.top - (popupRef.current?.offsetHeight || 0) - 10;
        left = rect.left + rect.width / 2 - (popupRef.current?.offsetWidth || 0) / 2;
        transformOrigin = 'bottom center';
        break;
      case 'right':
        top = rect.top + rect.height / 2 - (popupRef.current?.offsetHeight || 0) / 2;
        left = rect.right + 10;
        transformOrigin = 'left center';
        break;
      case 'bottom':
        top = rect.bottom + 10;
        left = rect.left + rect.width / 2 - (popupRef.current?.offsetWidth || 0) / 2;
        transformOrigin = 'top center';
        break;
      case 'left':
        top = rect.top + rect.height / 2 - (popupRef.current?.offsetHeight || 0) / 2;
        left = rect.left - (popupRef.current?.offsetWidth || 0) - 10;
        transformOrigin = 'right center';
        break;
      default:
        // center
        top = rect.top + rect.height / 2 - (popupRef.current?.offsetHeight || 0) / 2;
        left = rect.left + rect.width / 2 - (popupRef.current?.offsetWidth || 0) / 2;
        transformOrigin = 'center center';
    }

    // Asegurar que el popup no se salga de la pantalla
    if (left < 10) left = 10;
    if (left + (popupRef.current?.offsetWidth || 0) > window.innerWidth - 10) {
      left = window.innerWidth - (popupRef.current?.offsetWidth || 0) - 10;
    }
    if (top < 10) top = 10;
    if (top + (popupRef.current?.offsetHeight || 0) > window.innerHeight - 10) {
      top = window.innerHeight - (popupRef.current?.offsetHeight || 0) - 10;
    }

    setPosition({
      top,
      left,
      transformOrigin,
    });

    // Si se debe resaltar el elemento, crear un overlay con un "agujero"
    if (currentStep.highlightElement) {
      setShowOverlay(true);
      setOverlayStyles({
        position: 'fixed',
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
        borderRadius: '4px',
        zIndex: 49,
        pointerEvents: 'none',
      });
    } else {
      setShowOverlay(false);
    }
  }, [isActive, currentTour, currentStepIndex]);

  // Si no hay un tour activo, no mostrar nada
  if (!isActive || !currentTour) return null;

  const currentStep = currentTour.steps[currentStepIndex];

  return (
    <>
      {/* Overlay para resaltar elementos */}
      {showOverlay && <div style={overlayStyles} />}

      {/* Popup del tutorial */}
      <div
        ref={popupRef}
        className="fixed z-50 animate-fade-in shadow-lg"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transformOrigin: position.transformOrigin,
          width: '400px',
          maxWidth: '90vw',
        }}
      >
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <PlayCircle className="h-5 w-5 text-primary mr-2" />
                {currentStep.title}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={skipTour}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              {currentTour.showProgressBar && (
                <div className="mt-1 mb-3">
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs mt-1">
                    <span>
                      Paso {currentStepIndex + 1} de {currentTour.steps.length}
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            {currentStep.description}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              {currentTour.showPreviousButton && currentStepIndex > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevStep}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {currentTour.allowSkip && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={skipTour}
                >
                  Omitir
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                onClick={
                  currentStepIndex < currentTour.steps.length - 1 ? nextStep : endTour
                }
                className="gap-1"
              >
                {currentStepIndex < currentTour.steps.length - 1 ? (
                  <>
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </>
                ) : (
                  'Finalizar'
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default OnboardingPopup;