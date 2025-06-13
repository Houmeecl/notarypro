import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  ArrowLeft, 
  Video, 
  FileSignature, 
  FileText, 
  Upload, 
  Stamp, 
  Calendar, 
  User, 
  ClipboardCheck, 
  X,
  CheckCircle2
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

// Definición de los pasos del proceso
const steps = [
  { id: 1, name: 'Seleccione el tipo de servicio', icon: <FileText className="w-4 h-4" /> },
  { id: 2, name: 'Sube tu(s) documento(s)', icon: <Upload className="w-4 h-4" /> },
  { id: 3, name: 'Sellos notariales', icon: <Stamp className="w-4 h-4" /> },
  { id: 4, name: 'Opciones de envío y documentos impresos', icon: <FileText className="w-4 h-4" /> },
  { id: 5, name: 'Seleccionar servicio adicional', icon: <ClipboardCheck className="w-4 h-4" /> },
  { id: 6, name: 'Información personal', icon: <User className="w-4 h-4" /> },
  { id: 7, name: 'Seleccione su opción de programación', icon: <Calendar className="w-4 h-4" /> },
  { id: 8, name: 'Términos y condiciones', icon: <ClipboardCheck className="w-4 h-4" /> },
  { id: 9, name: 'Verificar', icon: <CheckCircle2 className="w-4 h-4" /> },
];

// Datos de los servicios
const services = [
  {
    id: 'notary-video',
    title: 'Ver un notario público en línea',
    description: 'Reúnase con un notario a través de una videollamada para encargar de forma remota y firmar digitalmente declaraciones juradas, declaraciones estatutarias, formularios judiciales, cartas de consentimiento de viaje y más.',
    icon: <Video className="h-8 w-8 text-primary" />,
    path: '/notarize-online'
  },
  {
    id: 'create-document',
    title: 'Crear un documento',
    description: 'Encuentre y cree documentos legales personalizados en línea: redáctelos usted mismo o pruebe la redacción de documentos experta con NotaryPro.',
    icon: <FileText className="h-8 w-8 text-primary" />,
    path: '/document-categories'
  },
  {
    id: 'sign-document',
    title: 'Firmar un documento',
    description: 'Firme documentos existentes de forma electrónica con validez legal. Perfecta para contratos, acuerdos y todo tipo de documentación oficial.',
    icon: <FileSignature className="h-8 w-8 text-primary" />,
    path: '/documents'
  }
];

const ServiceSelectionPage = () => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Ir al siguiente paso
  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Ir al paso anterior
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Seleccionar un servicio
  const selectService = (serviceId: string) => {
    setSelectedService(serviceId);
    const service = services.find(s => s.id === serviceId);
    if (service) {
      toast({
        title: "Servicio seleccionado",
        description: `Has seleccionado: ${service.title}`,
      });
      
      // En un caso real, normalmente procederíamos al siguiente paso
      // pero para esta demo, vamos a navegar directamente a la página correspondiente
      setTimeout(() => {
        setLocation(service.path);
      }, 1000);
    }
  };

  // Limpiar selección
  const clearSelection = () => {
    setSelectedService(null);
    toast({
      title: "Selección eliminada",
      description: "Has eliminado tu selección de servicio",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra de navegación de pasos */}
      <div className="flex bg-white shadow-sm border-b">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold">Certificación de Documentos</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Barra lateral de pasos */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <ul className="space-y-1">
                {steps.map((step) => (
                  <li key={step.id} className="relative">
                    <div
                      className={`flex items-center p-3 rounded-md ${
                        currentStep === step.id
                          ? 'bg-primary/10 text-primary font-medium'
                          : currentStep > step.id
                          ? 'text-gray-600'
                          : 'text-gray-400'
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-6 h-6 rounded-full mr-3 ${
                          currentStep === step.id
                            ? 'bg-primary text-white'
                            : currentStep > step.id
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {currentStep > step.id ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <span>{step.name}</span>
                    </div>
                    {step.id < steps.length && (
                      <div className="absolute left-[18px] top-[48px] h-6 w-[2px] bg-gray-200"></div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="col-span-1 lg:col-span-3">
            <Card className="shadow-md border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold">Seleccione el tipo de servicio</h1>
                  {selectedService && (
                    <Button 
                      variant="ghost" 
                      onClick={clearSelection}
                      className="text-destructive hover:text-destructive"
                    >
                      Eliminar selección
                      <X className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
                        selectedService === service.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => selectService(service.id)}
                    >
                      <div className="flex flex-col items-center text-center h-full">
                        <div className="mb-4">{service.icon}</div>
                        <h3 className="text-lg font-medium mb-2">{service.title}</h3>
                        <p className="text-sm text-gray-600 flex-grow">{service.description}</p>
                        <Button 
                          variant={selectedService === service.id ? "default" : "outline"}
                          className="mt-4 w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectService(service.id);
                          }}
                        >
                          Seleccionar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Anterior
                  </Button>
                  <Button 
                    onClick={nextStep}
                    disabled={!selectedService}
                  >
                    Siguiente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelectionPage;