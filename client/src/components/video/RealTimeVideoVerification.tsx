import React, { useEffect, useRef, useState } from 'react';
import { 
  Camera,
  CameraOff,
  CircleCheck,
  Cog,
  User,
  AlertTriangle,
  FileCheck,
  Loader2,
  Repeat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  requestUserMedia, 
  getMediaDevices, 
  stopMediaStream, 
  attachStreamToVideo, 
  switchMediaDevice,
  captureImageFromVideo,
  validateFacialImage,
  MediaDeviceInfo
} from '@/lib/camera-access';

export interface VerificationResult {
  success: boolean;
  verificationId?: string;
  imageData?: string;
  confidence?: number;
  liveness?: boolean;
  message?: string;
}

interface RealTimeVideoVerificationProps {
  onVerificationComplete?: (result: VerificationResult) => void;
  onCancel?: () => void;
  showControls?: boolean;
  autoStart?: boolean;
  apiEndpoint?: string;
  verificationMode?: 'identity' | 'document' | 'both';
  documentType?: string;
  sessionId?: string;
}

/**
 * Componente para verificación de identidad en tiempo real mediante cámara web
 * Soporta verificación facial y captura de documentos
 */
export function RealTimeVideoVerification({
  onVerificationComplete,
  onCancel,
  showControls = true,
  autoStart = false,
  apiEndpoint = '/api/identity/verify-face',
  verificationMode = 'identity',
  documentType = 'cedula_cl',
  sessionId
}: RealTimeVideoVerificationProps) {
  // Referencias a elementos DOM
  const videoRef = useRef<HTMLVideoElement>(null);
  const verificationTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Estado del componente
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [verificationStage, setVerificationStage] = useState<'idle' | 'preparing' | 'capturing' | 'processing' | 'complete' | 'failed'>('idle');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  
  const { toast } = useToast();

  // Inicialización del componente
  useEffect(() => {
    if (autoStart) {
      initializeCamera();
    }
    
    return () => {
      // Limpieza al desmontar
      if (stream) stopMediaStream(stream);
      if (verificationTimeout.current) clearTimeout(verificationTimeout.current);
    };
  }, [autoStart]);

  // Inicializa la cámara y solicita permisos
  const initializeCamera = async () => {
    try {
      setVerificationStage('preparing');
      setError(null);
      
      // Obtener lista de dispositivos
      const mediaDevices = await getMediaDevices();
      setDevices(mediaDevices);
      
      // Seleccionar la primera cámara si no hay una seleccionada
      const cameras = mediaDevices.filter(d => d.kind === 'videoinput');
      if (cameras.length > 0 && !selectedCamera) {
        setSelectedCamera(cameras[0].deviceId);
      }
      
      // Solicitar acceso a la cámara
      const videoConstraints = selectedCamera
        ? { deviceId: { exact: selectedCamera } }
        : true;
      
      const mediaStream = await requestUserMedia({ video: videoConstraints, audio: false });
      setStream(mediaStream);
      
      // Adjuntar stream al elemento de video
      if (videoRef.current) {
        attachStreamToVideo(mediaStream, videoRef.current);
      }
      
      setCameraEnabled(true);
      setIsInitialized(true);
      setVerificationStage('idle');
      
      toast({
        title: "Cámara iniciada",
        description: "Su cámara se ha inicializado correctamente.",
      });
    } catch (err: any) {
      console.error("Error al inicializar cámara:", err);
      setError(err.message || "No se pudo acceder a la cámara");
      setVerificationStage('failed');
      
      toast({
        title: "Error de cámara",
        description: err.message || "No se pudo acceder a la cámara",
        variant: "destructive",
      });
    }
  };

  // Cambiar la cámara seleccionada
  const handleCameraChange = async (deviceId: string) => {
    try {
      setSelectedCamera(deviceId);
      
      // Detener stream actual y solicitar nuevo stream con la cámara seleccionada
      const newStream = await switchMediaDevice(stream, deviceId);
      setStream(newStream);
      
      // Adjuntar nuevo stream al elemento de video
      if (videoRef.current) {
        attachStreamToVideo(newStream, videoRef.current);
      }
      
      toast({
        title: "Cámara cambiada",
        description: "Se ha cambiado la cámara correctamente.",
      });
    } catch (err: any) {
      console.error("Error al cambiar de cámara:", err);
      setError(err.message || "No se pudo cambiar la cámara");
      
      toast({
        title: "Error al cambiar cámara",
        description: err.message || "No se pudo cambiar la cámara",
        variant: "destructive",
      });
    }
  };

  // Capturar imagen desde la cámara
  const captureImage = () => {
    if (!videoRef.current || !cameraEnabled) return null;
    
    try {
      const imageData = captureImageFromVideo(videoRef.current);
      const validation = validateFacialImage(imageData);
      
      if (!validation.isValid) {
        setError(validation.message || "La imagen no cumple con los requisitos mínimos");
        return null;
      }
      
      setCapturedImage(imageData);
      return imageData;
    } catch (err: any) {
      console.error("Error al capturar imagen:", err);
      setError(err.message || "No se pudo capturar la imagen");
      return null;
    }
  };

  // Inicia el proceso de verificación
  const startVerification = async () => {
    try {
      if (!cameraEnabled || !videoRef.current) {
        throw new Error("La cámara no está habilitada");
      }
      
      setVerificationStage('capturing');
      setIsVerifying(true);
      setVerificationProgress(10);
      setError(null);
      
      // Simular progreso inicial
      let progress = 10;
      const progressInterval = setInterval(() => {
        progress += 5;
        if (progress > 90) {
          clearInterval(progressInterval);
        }
        setVerificationProgress(progress);
      }, 200);
      
      // Capturar imagen para verificación
      const imageData = captureImage();
      if (!imageData) {
        clearInterval(progressInterval);
        throw new Error("No se pudo capturar una imagen adecuada");
      }
      
      setVerificationStage('processing');
      setVerificationProgress(40);
      
      // Preparar datos para envío a la API
      const formData = new FormData();
      
      // Convertir la imagen base64 a Blob
      const imageBlob = await fetch(imageData).then(res => res.blob());
      formData.append('image', imageBlob, 'verification.jpg');
      
      // Añadir parámetros adicionales según el modo de verificación
      formData.append('verificationType', verificationMode);
      
      if (documentType) {
        formData.append('documentType', documentType);
      }
      
      if (sessionId) {
        formData.append('sessionId', sessionId);
      }
      
      // Enviar a la API para verificación
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el proceso de verificación');
      }
      
      const result = await response.json();
      
      setVerificationProgress(100);
      
      // Procesar resultado de la verificación
      if (result.success) {
        setVerificationStage('complete');
        setVerificationResult({
          success: true,
          verificationId: result.verificationId,
          imageData: imageData,
          confidence: result.confidence,
          liveness: result.liveness,
          message: result.message || "Verificación completada con éxito"
        });
        
        toast({
          title: "Verificación exitosa",
          description: result.message || "Su identidad ha sido verificada correctamente.",
        });
        
        // Notificar resultado al componente padre
        if (onVerificationComplete) {
          onVerificationComplete({
            success: true,
            verificationId: result.verificationId,
            imageData: imageData,
            confidence: result.confidence,
            liveness: result.liveness,
            message: result.message
          });
        }
      } else {
        throw new Error(result.message || "La verificación ha fallado");
      }
    } catch (err: any) {
      console.error("Error en verificación:", err);
      setVerificationStage('failed');
      setError(err.message || "Error en el proceso de verificación");
      setVerificationProgress(0);
      
      setVerificationResult({
        success: false,
        message: err.message || "Error en el proceso de verificación"
      });
      
      toast({
        title: "Error de verificación",
        description: err.message || "No se pudo completar la verificación",
        variant: "destructive",
      });
      
      // Notificar error al componente padre
      if (onVerificationComplete) {
        onVerificationComplete({
          success: false,
          message: err.message || "Error en el proceso de verificación"
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Reiniciar el proceso de verificación
  const resetVerification = () => {
    setCapturedImage(null);
    setVerificationStage('idle');
    setVerificationProgress(0);
    setVerificationResult(null);
    setError(null);
  };

  // Renderizado del componente
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            {verificationMode === 'identity' && (
              <>
                <User className="h-5 w-5 mr-2 text-primary" />
                Verificación de Identidad
              </>
            )}
            {verificationMode === 'document' && (
              <>
                <FileCheck className="h-5 w-5 mr-2 text-primary" />
                Verificación de Documento
              </>
            )}
            {verificationMode === 'both' && (
              <>
                <User className="h-5 w-5 mr-2 text-primary" />
                Verificación Completa
              </>
            )}
          </CardTitle>
          <CardDescription>
            {verificationMode === 'identity' && "Posicione su rostro frente a la cámara para verificar su identidad"}
            {verificationMode === 'document' && "Muestre su documento hacia la cámara para su verificación"}
            {verificationMode === 'both' && "Complete la verificación de documento e identidad"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Área de visualización de video */}
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {cameraEnabled ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white">
                <CameraOff className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Cámara no inicializada</p>
                <p className="text-sm opacity-70">Haga clic en el botón de iniciar para comenzar</p>
              </div>
            )}
            
            {/* Overlay de verificación */}
            {verificationStage === 'capturing' && (
              <div className="absolute inset-0 border-4 border-primary animate-pulse rounded-lg" />
            )}
            
            {verificationStage === 'processing' && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                <Loader2 className="h-12 w-12 animate-spin mb-4" />
                <p className="text-lg font-medium">Procesando verificación...</p>
              </div>
            )}
            
            {verificationStage === 'complete' && capturedImage && (
              <div className="absolute inset-0 bg-green-950/80 flex flex-col items-center justify-center text-white">
                <CircleCheck className="h-16 w-16 text-green-400 mb-4" />
                <p className="text-lg font-medium">Verificación Exitosa</p>
                <p className="text-sm max-w-xs text-center mt-2 text-green-300">
                  {verificationResult?.message || "Su identidad ha sido verificada correctamente"}
                </p>
              </div>
            )}
            
            {verificationStage === 'failed' && (
              <div className="absolute inset-0 bg-red-950/80 flex flex-col items-center justify-center text-white">
                <AlertTriangle className="h-16 w-16 text-red-400 mb-4" />
                <p className="text-lg font-medium">Verificación Fallida</p>
                <p className="text-sm max-w-xs text-center mt-2 text-red-300">
                  {error || "No se pudo completar la verificación"}
                </p>
              </div>
            )}
          </div>
          
          {/* Barra de progreso */}
          {isVerifying && (
            <div className="space-y-2">
              <Progress value={verificationProgress} className="h-2" />
              <p className="text-sm text-gray-500 text-center">
                {verificationStage === 'capturing' && "Capturando imagen..."}
                {verificationStage === 'processing' && "Procesando verificación..."}
              </p>
            </div>
          )}
          
          {/* Mensajes de error */}
          {error && !isVerifying && verificationStage !== 'failed' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Consejos de verificación */}
          {!error && verificationStage === 'idle' && cameraEnabled && (
            <Alert variant="default" className="bg-primary/10 border-primary/20">
              <AlertTitle className="text-primary font-medium">Consejos para la verificación</AlertTitle>
              <AlertDescription className="text-gray-700">
                <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                  {verificationMode === 'identity' || verificationMode === 'both' ? (
                    <>
                      <li>Asegúrese de tener buena iluminación en su rostro</li>
                      <li>Mire directamente a la cámara</li>
                      <li>No use lentes oscuros o elementos que cubran su rostro</li>
                    </>
                  ) : null}
                  
                  {verificationMode === 'document' || verificationMode === 'both' ? (
                    <>
                      <li>Coloque su documento en una superficie plana</li>
                      <li>Asegúrese que todo el documento sea visible en la imagen</li>
                      <li>Evite reflejos o sombras sobre el documento</li>
                    </>
                  ) : null}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {/* Botones de control */}
          <div className="flex items-center gap-2">
            {!cameraEnabled ? (
              <Button onClick={initializeCamera} disabled={isVerifying}>
                <Camera className="h-4 w-4 mr-2" />
                Iniciar cámara
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setShowDeviceSettings(true)} disabled={isVerifying}>
                <Cog className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button variant="outline" onClick={onCancel} disabled={isVerifying}>
                Cancelar
              </Button>
            )}
            
            {verificationStage === 'complete' || verificationStage === 'failed' ? (
              <Button onClick={resetVerification} disabled={isVerifying}>
                <Repeat className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            ) : (
              <Button 
                onClick={startVerification} 
                disabled={!cameraEnabled || isVerifying} 
                className={isVerifying ? "opacity-80" : ""}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <CircleCheck className="h-4 w-4 mr-2" />
                    Verificar {verificationMode === 'identity' ? 'identidad' : verificationMode === 'document' ? 'documento' : 'ahora'}
                  </>
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
      
      {/* Diálogo de configuración de dispositivos */}
      <Dialog open={showDeviceSettings} onOpenChange={setShowDeviceSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuración de cámara</DialogTitle>
            <DialogDescription>
              Seleccione el dispositivo de cámara que desea utilizar para la verificación.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Seleccionar cámara</h4>
              <Select 
                value={selectedCamera} 
                onValueChange={handleCameraChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una cámara" />
                </SelectTrigger>
                <SelectContent>
                  {devices
                    .filter(device => device.kind === 'videoinput')
                    .map(camera => (
                      <SelectItem 
                        key={camera.deviceId} 
                        value={camera.deviceId}
                      >
                        {camera.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {cameraEnabled ? (
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                  ref={videoRef}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                  <CameraOff className="h-10 w-10 opacity-50" />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => setShowDeviceSettings(false)}>
              Listo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}