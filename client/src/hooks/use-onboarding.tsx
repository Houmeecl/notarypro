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
    
    // Auto-show onboarding for new users
    if (onboardingStatus === null) {
      // Wait a bit to allow the app to load first
      const timer = setTimeout(() => {
        setShowOnboardingWizard(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
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