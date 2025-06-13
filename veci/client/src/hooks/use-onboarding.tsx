import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useLocalStorage } from './use-local-storage';

type OnboardingStep = {
  id: string;
  element: string;
  title: string;
  description: string;
  position: 'top' | 'right' | 'bottom' | 'left' | 'center';
  route?: string;
  action?: () => void;
  highlightElement?: boolean;
};

type OnboardingTour = {
  id: string;
  name: string;
  steps: OnboardingStep[];
  allowSkip: boolean;
  showProgressBar: boolean;
  showPreviousButton: boolean;
};

type OnboardingContextType = {
  currentTour: OnboardingTour | null;
  currentStepIndex: number;
  isActive: boolean;
  completedTours: string[];
  startTour: (tourId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  endTour: () => void;
  resetTours: () => void;
};

const defaultTours: Record<string, OnboardingTour> = {
  'welcome': {
    id: 'welcome',
    name: 'Bienvenido a Cerfidoc',
    steps: [
      {
        id: 'welcome-step-1',
        element: 'body',
        title: '¡Bienvenido a Cerfidoc!',
        description: 'Te guiaremos a través de las principales funciones de la plataforma para que puedas comenzar a utilizar nuestros servicios de manera óptima.',
        position: 'center',
      },
      {
        id: 'welcome-step-2',
        element: '#dashboard-menu',
        title: 'Menú de navegación',
        description: 'Desde aquí podrás acceder a todas las secciones de la plataforma.',
        position: 'right',
        highlightElement: true
      },
      {
        id: 'welcome-step-3',
        element: '#documents-tab',
        title: 'Tus documentos',
        description: 'Aquí encontrarás todos tus documentos. Puedes firmarlos, revisarlos y compartirlos.',
        position: 'bottom',
        highlightElement: true
      },
      {
        id: 'welcome-step-4',
        element: '#achievements-tab',
        title: 'Tus logros',
        description: 'Desbloquea logros a medida que utilizas la plataforma. ¡Compártelos con tus colegas!',
        position: 'bottom',
        highlightElement: true
      }
    ],
    allowSkip: true,
    showProgressBar: true,
    showPreviousButton: true
  },
  'document-creation': {
    id: 'document-creation',
    name: 'Creación de documentos',
    steps: [
      {
        id: 'document-step-1',
        element: 'body',
        title: 'Creación de documentos',
        description: 'Te mostraremos cómo crear y gestionar tus documentos electrónicos.',
        position: 'center',
      },
      {
        id: 'document-step-2',
        element: '#document-category-section',
        title: 'Categorías de documentos',
        description: 'Selecciona la categoría que mejor se adapte al documento que deseas crear.',
        position: 'bottom',
        highlightElement: true
      },
      {
        id: 'document-step-3',
        element: '#document-template-list',
        title: 'Plantillas disponibles',
        description: 'Elige entre nuestras plantillas predefinidas para crear tu documento más rápidamente.',
        position: 'right',
        highlightElement: true
      }
    ],
    allowSkip: true,
    showProgressBar: true,
    showPreviousButton: true
  },
  'certification-process': {
    id: 'certification-process',
    name: 'Proceso de certificación',
    steps: [
      {
        id: 'certification-step-1',
        element: 'body',
        title: 'Proceso de certificación',
        description: 'Aprende cómo funciona nuestro proceso de certificación de documentos.',
        position: 'center',
      },
      {
        id: 'certification-step-2',
        element: '#document-sign-section',
        title: 'Firma electrónica',
        description: 'Aquí podrás firmar electrónicamente tus documentos.',
        position: 'bottom',
        highlightElement: true
      },
      {
        id: 'certification-step-3',
        element: '#certification-options',
        title: 'Opciones de certificación',
        description: 'Elige entre certificación presencial o remota a través de videollamada.',
        position: 'left',
        highlightElement: true
      }
    ],
    allowSkip: true,
    showProgressBar: true,
    showPreviousButton: true
  }
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentTour, setCurrentTour] = useState<OnboardingTour | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [completedTours, setCompletedTours] = useLocalStorage<string[]>('cerfidoc-completed-tours', []);

  // Iniciar un tour específico
  const startTour = (tourId: string) => {
    const tour = defaultTours[tourId];
    if (!tour) {
      console.error(`Tour with id ${tourId} not found`);
      return;
    }

    if (completedTours.includes(tourId)) {
      console.log(`Tour ${tourId} already completed`);
      return;
    }

    setCurrentTour(tour);
    setCurrentStepIndex(0);
    setIsActive(true);

    // Si el paso actual tiene una ruta definida, navegar a ella
    const currentStep = tour.steps[0];
    if (currentStep.route) {
      setLocation(currentStep.route);
    }
  };

  // Avanzar al siguiente paso
  const nextStep = () => {
    if (!currentTour) return;

    if (currentStepIndex < currentTour.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);

      // Si el paso siguiente tiene una ruta definida, navegar a ella
      const nextStepObj = currentTour.steps[nextIndex];
      if (nextStepObj.route) {
        setLocation(nextStepObj.route);
      }

      // Si el paso actual tiene una acción definida, ejecutarla
      if (nextStepObj.action) {
        nextStepObj.action();
      }
    } else {
      // Si es el último paso, finalizar el tour
      endTour();
    }
  };

  // Retroceder al paso anterior
  const prevStep = () => {
    if (!currentTour || currentStepIndex <= 0) return;
    
    const prevIndex = currentStepIndex - 1;
    setCurrentStepIndex(prevIndex);

    // Si el paso anterior tiene una ruta definida, navegar a ella
    const prevStepObj = currentTour.steps[prevIndex];
    if (prevStepObj.route) {
      setLocation(prevStepObj.route);
    }
  };

  // Saltar el tour actual
  const skipTour = () => {
    if (!currentTour) return;
    
    toast({
      title: "Tutorial saltado",
      description: `Puedes volver a verlo en cualquier momento desde la sección de ayuda.`,
      duration: 3000,
    });
    
    // Marcar el tour como completado
    if (!completedTours.includes(currentTour.id)) {
      setCompletedTours([...completedTours, currentTour.id]);
    }
    
    setCurrentTour(null);
    setCurrentStepIndex(0);
    setIsActive(false);
  };

  // Finalizar el tour actual
  const endTour = () => {
    if (!currentTour) return;
    
    toast({
      title: "¡Tutorial completado!",
      description: `Has completado el tutorial de ${currentTour.name}.`,
      duration: 3000,
    });
    
    // Marcar el tour como completado
    if (!completedTours.includes(currentTour.id)) {
      setCompletedTours([...completedTours, currentTour.id]);
    }
    
    setCurrentTour(null);
    setCurrentStepIndex(0);
    setIsActive(false);
  };

  // Reiniciar todos los tours completados
  const resetTours = () => {
    setCompletedTours([]);
    toast({
      title: "Tutoriales reiniciados",
      description: "Todos los tutoriales han sido reiniciados.",
      duration: 3000,
    });
  };

  // Verificar si el usuario es nuevo y mostrar el tour de bienvenida
  useEffect(() => {
    if (user && !completedTours.includes('welcome')) {
      startTour('welcome');
    }
  }, [user]);

  return (
    <OnboardingContext.Provider
      value={{
        currentTour,
        currentStepIndex,
        isActive,
        completedTours,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        endTour,
        resetTours
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

// Removida la implementación duplicada del hook useLocalStorage
// Ahora usamos la implementación desde './use-local-storage'