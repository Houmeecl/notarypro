import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Check, 
  ChevronRight, 
  CircleAlert, 
  CreditCard, 
  Smartphone, 
  Camera, 
  Lock, 
  Shield, 
  Info, 
  CheckCircle2, 
  RefreshCw, 
  XCircle,
  ChevronDown,
  ChevronUp,
  User,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { nfcSupported, readNFCChipData, stopNFCReading, CedulaChilenaData, validarRut, formatearRut } from "@/lib/nfc-reader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

// Estados del proceso de verificación
export type VerificationStep = 
  | 'welcome' 
  | 'instructions' 
  | 'scanning' 
  | 'processing'
  | 'photo_comparison'
  | 'additional_check'
  | 'result_success'
  | 'result_failure';

interface ReadIDVerificationFlowProps {
  onComplete?: (success: boolean, data?: any) => void;
  onCancel?: () => void;
}

export default function ReadIDVerificationFlow({ onComplete, onCancel }: ReadIDVerificationFlowProps) {
  const [currentStep, setCurrentStep] = useState<VerificationStep>('welcome');
  const [nfcAvailable, setNfcAvailable] = useState<boolean | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [cardData, setCardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selfieBase64, setSelfieBase64] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);
  const webcamRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  
  // Verificar disponibilidad de NFC
  useEffect(() => {
    const checkNFC = async () => {
      try {
        const supported = await nfcSupported();
        setNfcAvailable(supported);
      } catch (err) {
        console.error("Error al verificar soporte NFC:", err);
        setNfcAvailable(false);
      }
    };
    
    checkNFC();
  }, []);

  // Efecto para el progreso simulado durante el escaneo
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentStep === 'scanning') {
      // Iniciar el progreso a 0 y aumentar gradualmente
      setScanProgress(0);
      interval = setInterval(() => {
        setScanProgress(prev => {
          // Aumentar más lentamente cuando se acerca al final
          const increment = prev < 70 ? 5 : prev < 90 ? 2 : 0.5;
          const newProgress = Math.min(prev + increment, 95);
          return newProgress;
        });
      }, 300);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentStep]);
  
  // Manejar el inicio del escaneo NFC
  const handleStartScan = async () => {
    setCurrentStep('scanning');
    setError(null);
    
    try {
      console.log("Iniciando verificación NFC real");
      const data = await readNFCChipData();
      
      // Simular un pequeño retraso para el procesamiento
      setCurrentStep('processing');
      setTimeout(() => {
        if (data) {
          setCardData(data);
          // Mostrar toast de éxito
          toast({
            title: "Lectura exitosa",
            description: "Información del chip NFC leída correctamente",
            variant: "default",
          });
          // Activar confetti para celebrar el éxito
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          // Pasar a la siguiente etapa
          setCurrentStep('photo_comparison');
          setScanProgress(100);
        } else {
          handleError("No se pudo leer información del chip NFC");
        }
      }, 1500);
    } catch (err: any) {
      console.error("Error al leer NFC:", err);
      handleError(err.message || "Error al leer el chip NFC");
    }
  };
  
  // Manejar errores durante el proceso
  const handleError = (message: string) => {
    setError(message);
    setScanProgress(0);
    stopNFCReading();
    setCurrentStep('result_failure');
    toast({
      title: "Error de verificación",
      description: message,
      variant: "destructive",
    });
  };
  
  // Reiniciar el proceso
  const handleRetry = () => {
    setCurrentStep('welcome');
    setError(null);
    setScanProgress(0);
    setCardData(null);
  };
  
  // Completar el proceso con éxito
  const handleSuccess = () => {
    setCurrentStep('result_success');
    if (onComplete) {
      onComplete(true, cardData);
    }
  };
  
  // Cancelar el proceso
  const handleCancel = () => {
    stopNFCReading();
    stopCamera();
    if (onCancel) {
      onCancel();
    }
  };
  
  // Iniciar la cámara para la captura de selfie
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error al iniciar la cámara:", err);
      toast({
        title: "Error de cámara",
        description: "No se pudo acceder a la cámara. Por favor, conceda permisos de cámara.",
        variant: "destructive",
      });
    }
  };
  
  // Detener la cámara
  const stopCamera = () => {
    if (webcamRef.current && webcamRef.current.srcObject) {
      const stream = webcamRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      webcamRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };
  
  // Capturar foto de la webcam
  const capturePhoto = () => {
    if (!webcamRef.current) return;
    
    try {
      const video = webcamRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      
      if (ctx && video.videoWidth > 0) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setSelfieBase64(dataUrl.split(',')[1]);
        stopCamera();
        
        // Simular verificación facial con un puntaje aleatorio entre 70 y 95
        const score = Math.floor(Math.random() * 25) + 70;
        setSimilarityScore(score);
        
        setTimeout(() => {
          setCurrentStep('additional_check');
        }, 1000);
      }
    } catch (err) {
      console.error("Error al capturar foto:", err);
      toast({
        title: "Error en la captura",
        description: "No se pudo tomar la foto. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Barra de progreso del proceso completo
  const getOverallProgress = () => {
    const stepValues: Record<VerificationStep, number> = {
      welcome: 0,
      instructions: 20,
      scanning: 40,
      processing: 60,
      photo_comparison: 80,
      additional_check: 90,
      result_success: 100,
      result_failure: 100
    };
    
    return stepValues[currentStep] || 0;
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg max-w-md mx-auto">
      {/* Barra de progreso general */}
      <div className="px-4 pt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Verificación de identidad</span>
          <span>{getOverallProgress()}%</span>
        </div>
        <Progress value={getOverallProgress()} className="h-1.5" />
      </div>
      
      {/* Encabezado */}
      <div className="px-6 py-4 flex items-center border-b border-gray-100">
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center mr-3">
          <Shield className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">ReadID Express</h2>
          <p className="text-sm text-gray-500">
            Verificación segura de documentos de identidad
          </p>
        </div>
      </div>
      
      {/* Contenido principal - cambia según el paso actual */}
      <div className="px-6 py-5">
        {currentStep === 'welcome' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Verificación de identidad</h3>
            <p className="text-gray-600 mb-6">
              Utilizamos tecnología NFC para verificar la autenticidad de su documento de identidad de forma rápida y segura.
            </p>
            
            {nfcAvailable === false && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4 text-left">
                <div className="flex items-start">
                  <CircleAlert className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Dispositivo no compatible</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Su dispositivo no parece soportar NFC. Por favor, utilice un dispositivo compatible o continúe con el proceso de verificación alternativo.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={() => setCurrentStep('instructions')}
                disabled={nfcAvailable === false}
              >
                Comenzar verificación
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
              
              {nfcAvailable === false && (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setCurrentStep('photo_comparison')}
                >
                  Usar verificación alternativa
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                className="w-full text-gray-500" 
                onClick={handleCancel}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
        
        {currentStep === 'instructions' && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Instrucciones</h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-blue-600 font-medium">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Prepare su cédula de identidad</p>
                  <p className="text-sm text-gray-600">Asegúrese de que su cédula de identidad esté limpia y en buen estado.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-blue-600 font-medium">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Ubique el chip NFC</p>
                  <p className="text-sm text-gray-600">El chip NFC se encuentra en la parte posterior de su cédula de identidad.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-blue-600 font-medium">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Coloque la cédula sobre su dispositivo</p>
                  <p className="text-sm text-gray-600">Acerque su cédula a la parte posterior de su teléfono y manténgala quieta durante el escaneo.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-6">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Si el escaneo no funciona, pruebe a mover la cédula lentamente sobre diferentes zonas de su dispositivo hasta que se detecte el chip.
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={handleStartScan}
              >
                Comenzar escaneo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full text-gray-500" 
                onClick={() => setCurrentStep('welcome')}
              >
                Volver
              </Button>
            </div>
          </div>
        )}
        
        {currentStep === 'scanning' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center relative">
                <Smartphone className="h-10 w-10 text-blue-600" />
                <div className="absolute inset-0 rounded-full border-2 border-blue-400 border-dashed animate-spin" style={{ animationDuration: '3s' }}></div>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-2">
              Escaneando documento
            </h3>
            <p className="text-gray-600 mb-6">
              Mantenga su cédula quieta sobre la parte trasera de su dispositivo. 
              No retire la cédula hasta que el proceso haya finalizado.
            </p>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-1.5">
                <span>Progreso de lectura</span>
                <span>{Math.round(scanProgress)}%</span>
              </div>
              <Progress value={scanProgress} className="h-2" />
              
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {scanProgress >= 25 && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Check className="h-3 w-3 mr-1" />
                    Documento detectado
                  </Badge>
                )}
                
                {scanProgress >= 50 && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Check className="h-3 w-3 mr-1" />
                    Leyendo chip NFC
                  </Badge>
                )}
                
                {scanProgress >= 75 && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Check className="h-3 w-3 mr-1" />
                    Verificando datos
                  </Badge>
                )}
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full text-gray-500" 
              onClick={() => {
                stopNFCReading();
                setCurrentStep('welcome');
              }}
            >
              Cancelar
            </Button>
          </div>
        )}
        
        {currentStep === 'processing' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                <RefreshCw className="h-10 w-10 text-blue-600 animate-spin" />
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-2">
              Procesando información
            </h3>
            <p className="text-gray-600 mb-6">
              Estamos verificando los datos del documento.
              Este proceso tomará unos segundos.
            </p>
            
            <Progress value={scanProgress} className="h-2 mb-6" />
          </div>
        )}
        
        {currentStep === 'photo_comparison' && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Verificación facial</h3>
            <p className="text-gray-600 mb-4">
              Para completar la verificación, necesitamos comparar su rostro con la foto del documento.
            </p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-md p-2 shadow-sm">
                  <p className="text-xs text-gray-500 mb-1 text-center">Foto del documento</p>
                  <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                    {cardData?.photoBase64 ? (
                      <img 
                        src={`data:image/jpeg;base64,${cardData.photoBase64}`} 
                        alt="ID Photo" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-gray-300" />
                    )}
                  </div>
                </div>
                
                <div className="bg-white rounded-md p-2 shadow-sm">
                  <p className="text-xs text-gray-500 mb-1 text-center">Su foto actual</p>
                  <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                    <Camera className="h-12 w-12 text-gray-300" />
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                <Camera className="h-4 w-4 mr-2" />
                Tomar foto
              </Button>
            </div>
            
            {cardData && (
              <Card className="mb-6">
                <CardHeader className="py-3 px-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Información leída</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 p-0"
                      onClick={() => setShowDetails(!showDetails)}
                    >
                      {showDetails ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                
                {showDetails && (
                  <CardContent className="pb-3 px-4 pt-0">
                    <div className="text-sm space-y-2">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <p className="text-gray-500 text-xs">Nombre completo</p>
                          <p className="font-medium">{cardData.nombres} {cardData.apellidos}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">RUN</p>
                          <p className="font-medium">{cardData.run}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Fecha de nacimiento</p>
                          <p className="font-medium">{cardData.fechaNacimiento}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Fecha de vencimiento</p>
                          <p className="font-medium">{cardData.fechaExpiracion}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Nacionalidad</p>
                          <p className="font-medium">{cardData.nacionalidad}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Sexo</p>
                          <p className="font-medium">{cardData.sexo}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}
            
            <div className="space-y-3">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={handleSuccess}
              >
                Completar verificación
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full text-gray-500" 
                onClick={handleCancel}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
        
        {currentStep === 'result_success' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-2">¡Verificación exitosa!</h3>
            <p className="text-gray-600 mb-6">
              Su documento ha sido verificado correctamente. Puede continuar con el proceso.
            </p>
            
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 mb-3" 
              onClick={() => {
                if (onComplete) onComplete(true, cardData);
              }}
            >
              Continuar
            </Button>
          </div>
        )}
        
        {currentStep === 'result_failure' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Verificación fallida</h3>
            <p className="text-gray-600 mb-2">
              No pudimos verificar su documento. Por favor, intente nuevamente.
            </p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-6 text-left">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            <div className="space-y-3">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={handleRetry}
              >
                Intentar nuevamente
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full text-gray-500" 
                onClick={handleCancel}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Pie de página con información de seguridad */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-center">
          <Lock className="h-4 w-4 text-gray-400 mr-2" />
          <p className="text-xs text-gray-500">
            Sus datos son procesados de forma segura y no se almacenan en nuestros servidores.
          </p>
        </div>
      </div>
    </div>
  );
}