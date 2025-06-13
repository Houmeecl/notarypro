import { useEffect } from 'react';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useAuth } from '@/hooks/use-auth';
import { FeatureHighlight } from '@/components/onboarding/FeatureHighlight';
import { WelcomeTour } from '@/components/onboarding/WelcomeTour';
import { 
  FileText,
  Video,
  Search,
  Bell,
  Info,
  Upload
} from 'lucide-react';

// This component centralizes all onboarding elements for the user dashboard
export function UserDashboardOnboarding() {
  const { user } = useAuth();
  const { isOnboardingCompleted } = useOnboarding();
  
  // Define tour steps for the user dashboard
  const dashboardTourSteps = [
    {
      id: 'dashboard-welcome',
      title: 'Bienvenido a su panel',
      description: 'Este es su panel principal donde puede ver su actividad reciente, documentos y acciones rápidas.',
      selector: '#dashboard-overview',
      position: 'bottom'
    },
    {
      id: 'quick-actions',
      title: 'Acciones rápidas',
      description: 'Desde aquí puede crear documentos, solicitar certificaciones por video, y acceder a otras funciones frecuentes.',
      selector: '#quick-actions',
      position: 'bottom'
    },
    {
      id: 'recent-documents',
      title: 'Documentos recientes',
      description: 'Aquí verá sus documentos más recientes y podrá acceder rápidamente a ellos.',
      selector: '#recent-documents',
      position: 'top'
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      description: 'Revise sus notificaciones sobre documentos pendientes, certificaciones y otras actualizaciones.',
      selector: '#notifications-panel',
      position: 'left'
    },
    {
      id: 'help-center',
      title: 'Centro de ayuda',
      description: 'Si necesita asistencia, puede acceder al centro de ayuda desde aquí.',
      selector: '#help-button',
      position: 'left'
    }
  ];
  
  // Check if this is the first login for the user
  const isFirstLogin = user && localStorage.getItem(`user_first_login_${user.id}`) !== 'false';
  
  // When user first logs in, mark it in local storage
  useEffect(() => {
    if (user && isFirstLogin) {
      localStorage.setItem(`user_first_login_${user.id}`, 'false');
    }
  }, [user, isFirstLogin]);
  
  // Don't render anything if onboarding is already completed
  if (isOnboardingCompleted && !isFirstLogin) {
    return null;
  }
  
  return (
    <>
      {/* Welcome tour */}
      <WelcomeTour
        tourId="user-dashboard-tour"
        steps={dashboardTourSteps}
        showOnce={true}
        autoStart={isFirstLogin}
        delayStart={1500}
      />
      
      {/* Feature highlights for different parts of the dashboard */}
      <FeatureHighlight
        featureId="create-document"
        title="Crear un documento"
        description="Comience a crear un nuevo documento desde plantillas predefinidas."
        position="bottom"
        onboardingStep="documents"
        icon={<FileText className="h-5 w-5 text-blue-600" />}
        delay={3000}
      >
        <div id="create-document-button" />
      </FeatureHighlight>
      
      <FeatureHighlight
        featureId="video-certification"
        title="Certificación por video"
        description="Certifique documentos de forma remota a través de una videollamada."
        position="bottom"
        onboardingStep="video-certification"
        icon={<Video className="h-5 w-5 text-purple-600" />}
        delay={6000}
      >
        <div id="video-certification-button" />
      </FeatureHighlight>
      
      <FeatureHighlight
        featureId="document-search"
        title="Buscar documentos"
        description="Encuentre rápidamente cualquier documento que haya creado o firmado."
        position="bottom"
        icon={<Search className="h-5 w-5 text-green-600" />}
        delay={9000}
      >
        <div id="document-search" />
      </FeatureHighlight>
      
      <FeatureHighlight
        featureId="notification-center"
        title="Centro de notificaciones"
        description="Manténgase al día con actualizaciones sobre sus documentos y certificaciones."
        position="left"
        icon={<Bell className="h-5 w-5 text-amber-600" />}
        delay={12000}
      >
        <div id="notification-button" />
      </FeatureHighlight>
      
      <FeatureHighlight
        featureId="help-center"
        title="Centro de ayuda"
        description="Si necesita asistencia, aquí encontrará guías y soporte."
        position="left"
        icon={<Info className="h-5 w-5 text-indigo-600" />}
        delay={15000}
      >
        <div id="help-button" />
      </FeatureHighlight>
    </>
  );
}