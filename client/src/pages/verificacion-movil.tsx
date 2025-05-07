import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { 
  AlertCircle, CameraIcon, Camera, FileCheck, Upload, 
  Shield, CheckCircle, ArrowLeft, Loader2, Smartphone, User
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

import vecinoLogo from '@/assets/new/vecino-xpress-logo-nuevo.png';

export default function VerificacionMovil() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params?.sessionId;
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [activeStep, setActiveStep] = useState<'instructions' | 'document' | 'selfie' | 'processing' | 'completed'>('instructions');
  const [capturedDocument, setCapturedDocument] = useState<string | null>(null);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [verificationResult, setVerificationResult] = useState<{ 
    success: boolean; 
    message: string; 
    score?: number; 
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Verificar si tenemos un ID de sesión válido
    if (!sessionId) {
      toast({
        title: "Error de sesión",
        description: "No se proporcionó un ID de sesión válido",
        variant: "destructive",
      });
      return;
    }

    // Aquí se podría verificar en el servidor si la sesión es válida
    console.log("Iniciando sesión de verificación:", sessionId);

    // Limpiar al desmontar
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [sessionId, toast]);

  const startCamera = async (frontFacing = false) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: frontFacing ? "user" : "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      toast({
        title: "Error de cámara",
        description: "No se pudo acceder a la cámara. Verifique los permisos.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Configurar canvas para capturar imagen
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.95);
    }
    
    return null;
  };

  const captureDocument = () => {
    const imageData = captureImage();
    if (imageData) {
      setCapturedDocument(imageData);
      stopCamera();
      
      // Automáticamente avanzar a la siguiente etapa
      setActiveStep('selfie');
    }
  };

  const captureSelfie = () => {
    const imageData = captureImage();
    if (imageData) {
      setCapturedSelfie(imageData);
      stopCamera();
      
      // Automáticamente avanzar a la etapa de procesamiento
      setActiveStep('processing');
      processVerification();
    }
  };

  const processVerification = async () => {
    if (!capturedDocument || !capturedSelfie) {
      toast({
        title: "Error",
        description: "Se requieren imágenes de documento y selfie para la verificación",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setProcessingProgress(0);

    try {
      // Simular progreso para la demo
      const interval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      // En producción, aquí enviaríamos las imágenes al servidor
      // para su procesamiento con GetAPI.cl
      
      // Simulación de llamada a API para la demo
      // Esto se reemplazaría con una llamada real a la API
      setTimeout(() => {
        clearInterval(interval);
        setProcessingProgress(100);
        
        setVerificationResult({
          success: true,
          message: "Verificación completada correctamente",
          score: 0.95
        });
        
        setActiveStep('completed');
        
        // En producción, notificaríamos al servidor que el proceso está completo
        console.log("Verificación completada para sesión:", sessionId);
      }, 5000);
    } catch (error) {
      console.error('Error al procesar verificación:', error);
      
      setVerificationResult({
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido en la verificación",
      });
      
      toast({
        title: "Error de verificación",
        description: "No se pudo completar el proceso de verificación",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const retakeDocument = () => {
    setCapturedDocument(null);
    setActiveStep('document');
    startCamera(false); // Iniciar cámara trasera para documento
  };

  const retakeSelfie = () => {
    setCapturedSelfie(null);
    setActiveStep('selfie');
    startCamera(true); // Iniciar cámara frontal para selfie
  };

  const goToDocumentCapture = () => {
    setActiveStep('document');
    startCamera(false); // Iniciar cámara trasera para documento
  };

  const goToSelfieCapture = () => {
    setActiveStep('selfie');
    startCamera(true); // Iniciar cámara frontal para selfie
  };

  const renderInstructions = () => (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Importante</AlertTitle>
        <AlertDescription>
          Para completar la verificación de identidad, necesitará:
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Su cédula de identidad o pasaporte</li>
            <li>Buena iluminación</li>
            <li>Cámara de su dispositivo móvil</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="bg-[#4863f7] text-white rounded-full h-6 w-6 flex items-center justify-center shrink-0 mt-0.5">
            1
          </div>
          <div>
            <h3 className="font-medium mb-1">Capture su documento de identidad</h3>
            <p className="text-sm text-gray-600">
              Tome una foto clara de su cédula de identidad o pasaporte. Asegúrese de que toda la información sea legible.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="bg-[#4863f7] text-white rounded-full h-6 w-6 flex items-center justify-center shrink-0 mt-0.5">
            2
          </div>
          <div>
            <h3 className="font-medium mb-1">Tome una selfie</h3>
            <p className="text-sm text-gray-600">
              Capture una imagen clara de su rostro mirando directamente a la cámara.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="bg-[#4863f7] text-white rounded-full h-6 w-6 flex items-center justify-center shrink-0 mt-0.5">
            3
          </div>
          <div>
            <h3 className="font-medium mb-1">Verificación automática</h3>
            <p className="text-sm text-gray-600">
              El sistema verificará automáticamente su identidad comparando su selfie con su documento.
            </p>
          </div>
        </div>
      </div>

      <Button 
        className="w-full bg-[#2d219b] hover:bg-[#241a7d] text-white" 
        onClick={goToDocumentCapture}
      >
        Comenzar Verificación
      </Button>
    </div>
  );

  const renderDocumentCapture = () => (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <CameraIcon className="h-4 w-4 text-blue-700" />
        <AlertTitle>Captura de Documento</AlertTitle>
        <AlertDescription>
          Posicione su cédula de identidad o pasaporte en el recuadro y tome una foto clara.
        </AlertDescription>
      </Alert>

      <div className="relative">
        {capturedDocument ? (
          <div className="rounded-lg overflow-hidden border">
            <img 
              src={capturedDocument} 
              alt="Documento capturado" 
              className="w-full h-auto"
            />
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden bg-black aspect-video relative">
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover"
              playsInline
              autoPlay
            ></video>
            
            <div className="absolute inset-0 border-2 border-white border-opacity-70 rounded m-4 pointer-events-none"></div>
            
            <div className="absolute bottom-4 right-4">
              <Button 
                size="sm" 
                variant="secondary"
                className="bg-white/80 hover:bg-white"
                onClick={() => startCamera(!streamRef.current?.getVideoTracks()[0].getSettings().facingMode?.includes('user'))}
              >
                <Camera className="h-4 w-4 mr-1" />
                Cambiar
              </Button>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden"></canvas>

      {capturedDocument ? (
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={retakeDocument}
          >
            Volver a Capturar
          </Button>
          <Button 
            className="flex-1 bg-[#2d219b] hover:bg-[#241a7d] text-white"
            onClick={goToSelfieCapture}
          >
            Continuar
          </Button>
        </div>
      ) : (
        <Button 
          className="w-full bg-[#2d219b] hover:bg-[#241a7d] text-white" 
          onClick={captureDocument}
        >
          Capturar Documento
        </Button>
      )}
    </div>
  );

  const renderSelfieCapture = () => (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <User className="h-4 w-4 text-blue-700" />
        <AlertTitle>Captura de Selfie</AlertTitle>
        <AlertDescription>
          Centre su rostro en el recuadro, asegurándose de tener buena iluminación.
        </AlertDescription>
      </Alert>

      <div className="relative">
        {capturedSelfie ? (
          <div className="rounded-lg overflow-hidden border">
            <img 
              src={capturedSelfie} 
              alt="Selfie capturada" 
              className="w-full h-auto"
            />
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden bg-black aspect-video relative">
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover"
              playsInline
              autoPlay
            ></video>
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-2 border-white border-opacity-70 rounded-full w-64 h-64 max-w-full"></div>
            </div>
          </div>
        )}
      </div>

      {capturedSelfie ? (
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={retakeSelfie}
          >
            Volver a Capturar
          </Button>
          <Button 
            className="flex-1 bg-[#2d219b] hover:bg-[#241a7d] text-white"
            onClick={() => {
              setActiveStep('processing');
              processVerification();
            }}
          >
            Verificar Identidad
          </Button>
        </div>
      ) : (
        <Button 
          className="w-full bg-[#2d219b] hover:bg-[#241a7d] text-white" 
          onClick={captureSelfie}
        >
          Capturar Selfie
        </Button>
      )}
    </div>
  );

  const renderProcessing = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center py-8">
        {processing ? (
          <>
            <div className="mb-6">
              <Loader2 className="h-16 w-16 text-[#2d219b] animate-spin" />
            </div>
            <h3 className="text-xl font-medium text-center mb-2">Procesando Verificación</h3>
            <p className="text-center text-gray-600 mb-6 max-w-xs">
              Estamos verificando su identidad. Esto puede tomar un momento.
            </p>
            <div className="w-full max-w-md">
              <Progress value={processingProgress} className="h-2" />
              <p className="text-xs text-center mt-2 text-gray-500">
                {processingProgress}% Completado
              </p>
            </div>
          </>
        ) : verificationResult ? (
          verificationResult.success ? (
            <>
              <div className="bg-green-50 border border-green-200 rounded-full p-6 mb-6">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <h3 className="text-xl font-medium text-center mb-2">Verificación Exitosa</h3>
              <p className="text-center text-gray-600 mb-6 max-w-xs">
                Su identidad ha sido verificada correctamente.
              </p>
              {verificationResult.score !== undefined && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">
                    Score de verificación: {Math.round(verificationResult.score * 100)}%
                  </span>
                </div>
              )}
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setActiveStep('completed')}
              >
                Continuar
              </Button>
            </>
          ) : (
            <>
              <div className="bg-red-50 border border-red-200 rounded-full p-6 mb-6">
                <AlertCircle className="h-16 w-16 text-red-600" />
              </div>
              <h3 className="text-xl font-medium text-center mb-2">Verificación Fallida</h3>
              <p className="text-center text-red-600 mb-6 max-w-xs">
                {verificationResult.message}
              </p>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={retakeDocument}
                >
                  Reintentar
                </Button>
              </div>
            </>
          )
        ) : null}
      </div>
    </div>
  );

  const renderCompleted = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center py-8">
        <div className="bg-green-50 border border-green-100 rounded-full p-6 mb-6">
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>
        
        <h3 className="text-xl font-medium text-center mb-2">¡Proceso Completado!</h3>
        <p className="text-center text-gray-600 mb-8 max-w-xs">
          Su identidad ha sido verificada correctamente. Puede regresar a la aplicación principal.
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg w-full max-w-xs mb-6 text-center">
          <p className="text-gray-500 text-sm mb-1">ID de verificación</p>
          <p className="font-mono text-xs bg-gray-100 p-2 rounded">{sessionId}</p>
        </div>
        
        <Alert className="bg-blue-50 border-blue-200">
          <Smartphone className="h-4 w-4 text-blue-700" />
          <AlertTitle>¿Qué sigue?</AlertTitle>
          <AlertDescription>
            Ya puede cerrar esta ventana y continuar con su trámite en la aplicación principal.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );

  const renderActiveStep = () => {
    switch (activeStep) {
      case 'instructions':
        return renderInstructions();
      case 'document':
        return renderDocumentCapture();
      case 'selfie':
        return renderSelfieCapture();
      case 'processing':
        return renderProcessing();
      case 'completed':
        return renderCompleted();
      default:
        return renderInstructions();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-center items-center">
            <img src={vecinoLogo} alt="VecinoXpress Logo" className="h-10" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Verificación de Identidad</CardTitle>
              <CardDescription>
                Complete los siguientes pasos para verificar su identidad
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderActiveStep()}
            </CardContent>
            {activeStep !== 'instructions' && activeStep !== 'processing' && activeStep !== 'completed' && (
              <CardFooter>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-500"
                  onClick={() => {
                    if (activeStep === 'document') {
                      setActiveStep('instructions');
                    } else if (activeStep === 'selfie') {
                      setActiveStep('document');
                    }
                    stopCamera();
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Volver
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} VecinoXpress - Todos los derechos reservados
        </div>
      </footer>
    </div>
  );
}