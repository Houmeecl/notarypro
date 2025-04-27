import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

type OnboardingContextType = {
  showOnboarding: (stepId?: string) => void;
  hideOnboarding: () => void;
  isOnboardingCompleted: boolean;
  resetOnboarding: () => void;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  const [initialStep, setInitialStep] = useState<string | undefined>(undefined);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  
  // Check if onboarding has been completed on initial load
  useEffect(() => {
    const onboardingStatus = localStorage.getItem('onboardingCompleted');
    setIsOnboardingCompleted(onboardingStatus === 'true');
    
    // No mostrar automáticamente el onboarding al iniciar
    // Ahora el usuario deberá activarlo explícitamente desde la interfaz
  }, []);
  
  const showOnboarding = (stepId?: string) => {
    setInitialStep(stepId);
    setShowOnboardingWizard(true);
  };
  
  const hideOnboarding = () => {
    setShowOnboardingWizard(false);
  };
  
  const resetOnboarding = () => {
    localStorage.removeItem('onboardingCompleted');
    setIsOnboardingCompleted(false);
    setInitialStep(undefined);
    setShowOnboardingWizard(true);
  };
  
  const handleOnboardingComplete = () => {
    setIsOnboardingCompleted(true);
    setShowOnboardingWizard(false);
  };
  
  return (
    <OnboardingContext.Provider 
      value={{ 
        showOnboarding, 
        hideOnboarding, 
        isOnboardingCompleted,
        resetOnboarding
      }}
    >
      {children}
      {showOnboardingWizard && (
        <OnboardingWizard 
          initialStep={initialStep}
          onComplete={handleOnboardingComplete}
        />
      )}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  
  return context;
}