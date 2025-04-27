import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { OnboardingWizard } from './OnboardingWizard';
import { Button } from '@/components/ui/button';
import { Play, BookOpen } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface PersonalizedOnboardingProps {
  showTutorialButton?: boolean;
}

export function PersonalizedOnboarding({ showTutorialButton = true }: PersonalizedOnboardingProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [firstVisit, setFirstVisit] = useState(false);
  const [onboardingType, setOnboardingType] = useState<'general' | 'admin' | 'certifier' | 'partner'>('general');
  const [videoTutorialUrl, setVideoTutorialUrl] = useState<string | null>(null);

  useEffect(() => {
    // Check if this is the user's first visit after login
    const isFirstVisit = !localStorage.getItem(`visited_${user?.id}`);
    setFirstVisit(isFirstVisit);
    
    if (isFirstVisit && user) {
      // Mark as visited
      localStorage.setItem(`visited_${user.id}`, 'true');
      
      // Determine the type of onboarding based on user role
      if (user.role === 'admin') {
        setOnboardingType('admin');
        setVideoTutorialUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
      } else if (user.role === 'certifier') {
        setOnboardingType('certifier');
        setVideoTutorialUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4');
      } else if (user.role === 'partner') {
        setOnboardingType('partner');
        setVideoTutorialUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
      } else {
        setOnboardingType('general');
        setVideoTutorialUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
      }
      
      // Show onboarding automatically on first visit
      setShowOnboarding(true);
    }
  }, [user]);

  // Get a personalized welcome message based on the time of day
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Personalized title based on user role
  const getOnboardingTitle = () => {
    switch (onboardingType) {
      case 'admin':
        return 'Bienvenido al Panel de Administración';
      case 'certifier':
        return 'Bienvenido al Panel de Certificador';
      case 'partner':
        return 'Bienvenido al Programa Vecinos';
      default:
        return 'Bienvenido a CerfiDoc';
    }
  };

  const handleStartTutorial = () => {
    setShowOnboarding(true);
    
    toast({
      title: 'Tutorial iniciado',
      description: 'Siga los pasos para familiarizarse con la plataforma.',
    });
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
  };

  // Only render if we have a user
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Auto-show onboarding on first visit */}
      {showOnboarding && (
        <OnboardingWizard 
          onComplete={handleCloseOnboarding} 
          initialStep={onboardingType === 'general' ? 'welcome' : `${onboardingType}-welcome`}
        />
      )}
      
      {/* Tutorial button */}
      {showTutorialButton && !showOnboarding && (
        <div className="fixed bottom-4 right-4 z-40">
          <Button
            onClick={handleStartTutorial}
            size="sm"
            className="rounded-full shadow-lg bg-primary hover:bg-primary/90"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Tutorial Interactivo
          </Button>
        </div>
      )}
      
      {/* First visit welcome message */}
      {firstVisit && videoTutorialUrl && (
        <Dialog defaultOpen>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">
                {getWelcomeMessage()}, {user.fullName || user.username}!
              </DialogTitle>
              <DialogDescription className="text-center pt-2">
                {getOnboardingTitle()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                {/* Video tutorial */}
                <video 
                  src={videoTutorialUrl} 
                  controls 
                  className="w-full h-full object-cover"
                  poster="/assets/video-thumbnail.png"
                />
              </div>
              
              <p className="text-center text-sm text-gray-500">
                Hemos preparado un tutorial personalizado para ayudarle a sacar el máximo provecho
                de nuestro sistema.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => toast({
                  title: 'Tutorial guardado',
                  description: 'Puede acceder a él en cualquier momento desde el menú de ayuda.',
                })}
              >
                Ver más tarde
              </Button>
              
              <Button 
                className="gap-2"
                onClick={handleStartTutorial}
              >
                <Play className="h-4 w-4" />
                Iniciar recorrido guiado
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}