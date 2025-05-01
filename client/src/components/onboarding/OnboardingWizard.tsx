import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  FileCheck, 
  FileSignature, 
  Video, 
  CreditCard, 
  ShieldCheck,
  User,
  UserPlus,
  Lightbulb,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

// Types
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface OnboardingWizardProps {
  onComplete?: () => void;
  initialStep?: string;
}

export function OnboardingWizard({ onComplete, initialStep }: OnboardingWizardProps) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  
  // Define the onboarding steps
  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Bienvenido a CerfiDoc',
      description: 'Su plataforma para certificación digital de documentos',
      icon: <User className="h-6 w-6 text-primary" />,
      content: (
        <div className="space-y-4">
          <p>
            ¡Gracias por unirse a CerfiDoc! Esta herramienta le guiará a través de las principales 
            características de nuestra plataforma para ayudarle a comenzar rápidamente.
          </p>
          <div className="bg-primary/10 p-4 rounded-md">
            <h4 className="font-medium flex items-center">
              <UserPlus className="h-5 w-5 mr-2 text-primary" />
              ¡Bienvenido{user?.fullName ? `, ${user.fullName}` : ''}!
            </h4>
            <p className="text-sm mt-1">
              Este asistente le mostrará cómo usar CerfiDoc de manera efectiva. 
              Puede saltarlo en cualquier momento, pero recomendamos seguirlo 
              para una mejor experiencia.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'documents',
      title: 'Gestión de Documentos',
      description: 'Cree y gestione documentos digitales',
      icon: <FileCheck className="h-6 w-6 text-primary" />,
      content: (
        <div className="space-y-4">
          <p>
            En CerfiDoc, puede crear, firmar y gestionar todo tipo de documentos digitales
            que cumplen con la legislación chilena.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-md p-4">
              <h4 className="font-medium mb-2 flex items-center">
                <FileCheck className="h-5 w-5 mr-2 text-green-600" />
                Crear documentos
              </h4>
              <p className="text-sm">
                Use plantillas predefinidas o suba sus propios documentos para certificación.
              </p>
            </div>
            
            <div className="border rounded-md p-4">
              <h4 className="font-medium mb-2 flex items-center">
                <FileSignature className="h-5 w-5 mr-2 text-blue-600" />
                Firmar documentos
              </h4>
              <p className="text-sm">
                Firme digitalmente sus documentos con validez legal completa.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="font-medium flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-blue-600" />
              ¿Sabía que?
            </h4>
            <p className="text-sm mt-1">
              Todos los documentos firmados en CerfiDoc cumplen con la Ley 19.799 sobre documentos
              electrónicos y firmas electrónicas, otorgándoles plena validez legal.
            </p>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setLocation("/documents")}
          >
            Ver mis documentos
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    {
      id: 'signatures',
      title: 'Firmas Electrónicas',
      description: 'Tipos de firmas y su validez legal',
      icon: <FileSignature className="h-6 w-6 text-primary" />,
      content: (
        <div className="space-y-4">
          <p>
            CerfiDoc ofrece diferentes tipos de firmas electrónicas para satisfacer 
            sus necesidades específicas.
          </p>
          
          <div className="space-y-3">
            <div className="border rounded-md p-4">
              <h4 className="font-medium mb-2">Firma Simple</h4>
              <p className="text-sm">
                Ideal para documentos internos y de menor relevancia jurídica.
                Rápida y fácil de usar.
              </p>
            </div>
            
            <div className="border rounded-md p-4 border-primary/30 bg-primary/5">
              <h4 className="font-medium mb-2">Firma Avanzada (Certificada)</h4>
              <p className="text-sm">
                Mayor validez legal, respaldada por certificadores verificados.
                Recomendada para documentos oficiales y contratos importantes.
              </p>
              <div className="flex items-center mt-2 text-xs text-primary">
                <ShieldCheck className="h-4 w-4 mr-1" />
                <span>Validada por certificadores registrados</span>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-md">
            <h4 className="font-medium flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-amber-600" />
              ¿Qué firma debo usar?
            </h4>
            <p className="text-sm mt-1">
              Use la firma simple para documentos cotidianos y la firma avanzada 
              para documentos oficiales que necesiten mayor validez legal. Nuestros
              especialistas pueden orientarle en caso de dudas.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'video-certification',
      title: 'Certificación por Video',
      description: 'Certifique documentos remotamente',
      icon: <Video className="h-6 w-6 text-primary" />,
      content: (
        <div className="space-y-4">
          <p>
            La certificación por video le permite tramitar documentos oficiales 
            sin necesidad de asistir presencialmente a una oficina.
          </p>
          
          <div className="bg-gray-100 p-6 rounded-md">
            <ol className="space-y-4">
              <li className="flex">
                <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full border bg-white text-xs font-semibold">1</div>
                <div>
                  <h4 className="font-medium">Solicite una sesión</h4>
                  <p className="text-sm text-gray-600">
                    Programe una videollamada con uno de nuestros certificadores autorizados.
                  </p>
                </div>
              </li>
              
              <li className="flex">
                <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full border bg-white text-xs font-semibold">2</div>
                <div>
                  <h4 className="font-medium">Verifique su identidad</h4>
                  <p className="text-sm text-gray-600">
                    Presente su documento de identidad durante la videollamada.
                  </p>
                </div>
              </li>
              
              <li className="flex">
                <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full border bg-white text-xs font-semibold">3</div>
                <div>
                  <h4 className="font-medium">Certifique su documento</h4>
                  <p className="text-sm text-gray-600">
                    El certificador validará y firmará sus documentos durante la sesión.
                  </p>
                </div>
              </li>
            </ol>
          </div>
          
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => setLocation("/certificacion-por-video")}
            >
              Solicitar certificación por video
              <Video className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'payment',
      title: 'Pagos y Tarifas',
      description: 'Conozca nuestros planes y precios',
      icon: <CreditCard className="h-6 w-6 text-primary" />,
      content: (
        <div className="space-y-4">
          <p>
            CerfiDoc ofrece diferentes opciones de pago adaptadas a sus necesidades.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-md p-4">
              <h4 className="font-medium mb-2">Pago por uso</h4>
              <p className="text-sm">
                Pague solo por los documentos que procese. Ideal para usuarios ocasionales.
              </p>
              <p className="text-sm font-semibold mt-2">
                Desde $2.000 por documento
              </p>
            </div>
            
            <div className="border rounded-md p-4 border-primary/30 bg-primary/5">
              <h4 className="font-medium mb-2">Plan mensual</h4>
              <p className="text-sm">
                Acceso ilimitado a firmas simples y descuentos en certificaciones.
              </p>
              <p className="text-sm font-semibold mt-2">
                $19.900 mensual
              </p>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-md">
            <h4 className="font-medium flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-green-600" />
              Métodos de pago aceptados
            </h4>
            <p className="text-sm mt-1">
              Tarjetas de crédito/débito, transferencia bancaria y WebPay.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'conclusion',
      title: 'Listo para comenzar',
      description: 'Comience a utilizar CerfiDoc',
      icon: <Check className="h-6 w-6 text-primary" />,
      content: (
        <div className="space-y-4 text-center">
          <div className="mx-auto bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mb-4">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          
          <h3 className="text-xl font-bold">¡Felicidades!</h3>
          
          <p>
            Ha completado el recorrido de orientación y está listo para comenzar
            a usar CerfiDoc. Si necesita ayuda adicional, utilice nuestro centro de soporte.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            <Button 
              variant="outline"
              onClick={() => setLocation("/help-center")}
            >
              Centro de ayuda
              <HelpCircle className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              onClick={handleCompleteOnboarding}
              className="bg-primary hover:bg-primary/90"
            >
              Comenzar a usar CerfiDoc
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )
    }
  ];
  
  // Initialize with specific step if provided
  useEffect(() => {
    if (initialStep) {
      const index = steps.findIndex(step => step.id === initialStep);
      if (index !== -1) {
        setCurrentStepIndex(index);
      }
    }
    
    // Check if user has already completed onboarding
    const hasCompleted = localStorage.getItem('onboardingCompleted');
    if (hasCompleted === 'true') {
      setHasCompletedOnboarding(true);
      // Close wizard if already completed
      if (!initialStep) {
        setIsOpen(false);
      }
    }
  }, [initialStep]);
  
  const currentStep = steps[currentStepIndex];
  const progress = Math.round(((currentStepIndex + 1) / steps.length) * 100);
  
  function handleNext() {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  }
  
  function handlePrevious() {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }
  
  function handleCompleteOnboarding() {
    // Mark onboarding as completed in local storage
    localStorage.setItem('onboardingCompleted', 'true');
    setHasCompletedOnboarding(true);
    
    // Close the wizard
    setIsOpen(false);
    
    // Show success toast
    toast({
      title: "¡Bienvenido a CerfiDoc!",
      description: "Ya puede comenzar a utilizar todas las funciones de la plataforma.",
    });
    
    // Call the onComplete callback if provided
    if (onComplete) {
      onComplete();
    }
    
    // Navigate to dashboard or home
    setLocation("/");
  }
  
  function handleSkip() {
    // Mark onboarding as completed but in a way that allows reopening
    localStorage.setItem('onboardingCompleted', 'skipped');
    setIsOpen(false);
    
    toast({
      title: "Onboarding saltado",
      description: "Puede volver a abrirlo desde el menú de ayuda en cualquier momento.",
    });
  }
  
  function handleClose() {
    setIsOpen(false);
  }
  
  if (!isOpen) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-primary/10 p-2 rounded-full mr-3">
              {currentStep.icon}
            </div>
            <div>
              <h2 className="font-bold text-lg">{currentStep.title}</h2>
              <p className="text-sm text-gray-500">{currentStep.description}</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleClose}
            title="Cerrar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {currentStep.content}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t">
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Paso {currentStepIndex + 1} de {steps.length}</span>
              <span>{progress}% completado</span>
            </div>
          </div>
          
          <div className="flex justify-between">
            <div>
              {currentStepIndex > 0 ? (
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  onClick={handleSkip}
                >
                  Saltar guía
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              {currentStepIndex < steps.length - 1 ? (
                <Button onClick={handleNext}>
                  Siguiente
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleCompleteOnboarding}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Finalizar
                  <Check className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}