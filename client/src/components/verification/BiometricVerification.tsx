/**
 * Componente de Verificación Biométrica
 * 
 * Este componente implementa la verificación de identidad mediante:
 * 1. Captura de selfie con la cámara web
 * 2. Captura de documento de identidad con la cámara
 * 3. Verificación biométrica utilizando OpenAI
 */
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { CameraIcon, Camera, User, FileText, CheckCircle, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';

// Tipos de datos
export interface BiometricVerificationResult {
  status: 'idle' | 'processing' | 'completed' | 'error';
  documentInfo?: {
    documentType: string;
    documentNumber: string;
    fullName: string;
    birthDate: string;
    expiryDate: string;
    nationality: string;
    isValid: boolean;
  };
  documentAuthenticityResult?: {
    isAuthentic: boolean;
    score: number;
    confidence: string;
    securityFeatures: string[];
    manipulationSigns: string[];
  };
  facialSimilarityResult?: {
    score: number;
    match: boolean;
    confidence: string;
  };
  overallResult?: {
    verified: boolean;
    confidenceScore: number;
    details: string;
  };
  error?: string;
}

interface BiometricVerificationProps {
  onVerificationComplete?: (result: BiometricVerificationResult) => void;
  initialStep?: 'selfie' | 'document' | 'verification';
}

const BiometricVerification: React.FC<BiometricVerificationProps> = ({
  onVerificationComplete,
  initialStep = 'selfie',
}) => {
  // Estado para el paso actual del proceso
  const [currentStep, setCurrentStep] = useState<'selfie' | 'document' | 'verification' | 'result'>(initialStep);
  
  // Estados para las imágenes capturadas
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  
  // Estado para el resultado de la verificación
  const [verificationResult, setVerificationResult] = useState<BiometricVerificationResult>({
    status: 'idle'
  });
  
  // Estado para el acceso a la cámara
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Estado para el progreso de verificación
  const [verificationProgress, setVerificationProgress] = useState<number>(0);
  
  // Referencias para los elementos de video
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Hooks
  const { toast } = useToast();
  
  // Efecto para activación y limpieza de la cámara
  useEffect(() => {
    return () => {
      // Limpiar cualquier transmisión de cámara al desmontar
      stopCamera();
    };
  }, []);
  
  // Efecto para simular progreso durante la verificación
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (verificationResult.status === 'processing' && verificationProgress < 95) {
      interval = setInterval(() => {
        setVerificationProgress(prev => Math.min(prev + 5, 95));
      }, 500);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [verificationResult.status, verificationProgress]);
  
  // Función para iniciar la cámara
  const startCamera = async () => {
    try {
      setCameraError(null);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Su navegador no soporta acceso a la cámara");
      }
      
      const constraints: MediaStreamConstraints = {
        video: { 
          facingMode: currentStep === 'selfie' ? 'user' : 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        await videoRef.current.play();
      }
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
      setCameraError(`Error al acceder a la cámara: ${error.message}`);
      setCameraActive(false);
      
      toast({
        title: "Error de cámara",
        description: `No se pudo acceder a la cámara: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  // Función para detener la cámara
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => {
        track.stop();
      });
      
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };
  
  // Función para cambiar la cámara
  const switchCamera = async () => {
    // Detener cámara actual
    stopCamera();
    
    // Iniciar nueva cámara
    await startCamera();
  };
  
  // Función para capturar imagen
  const captureImage = () => {
    if (!cameraActive || !videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Ajustar dimensiones del canvas al video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dibujar frame actual en el canvas
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Obtener datos como URL base64
      const imageData = canvas.toDataURL('image/jpeg');
      
      // Actualizar estado según el paso actual
      if (currentStep === 'selfie') {
        setSelfieImage(imageData);
        toast({
          title: "Selfie capturada",
          description: "Se ha capturado correctamente su selfie"
        });
      } else if (currentStep === 'document') {
        setDocumentImage(imageData);
        toast({
          title: "Documento capturado",
          description: "Se ha capturado correctamente su documento"
        });
      }
      
      // Detener cámara después de capturar
      stopCamera();
    }
  };
  
  // Función para reiniciar captura
  const retakeImage = () => {
    if (currentStep === 'selfie') {
      setSelfieImage(null);
    } else if (currentStep === 'document') {
      setDocumentImage(null);
    }
    
    startCamera();
  };
  
  // Función para proceder al siguiente paso
  const goToNextStep = () => {
    // Detener cámara actual
    stopCamera();
    
    // Determinar siguiente paso
    if (currentStep === 'selfie') {
      setCurrentStep('document');
      // Iniciar cámara para el documento automáticamente
      setTimeout(startCamera, 500);
    } else if (currentStep === 'document') {
      setCurrentStep('verification');
      startVerification();
    }
  };
  
  // Función para volver al paso anterior
  const goToPreviousStep = () => {
    // Detener cámara actual
    stopCamera();
    
    // Determinar paso anterior
    if (currentStep === 'document') {
      setCurrentStep('selfie');
      setSelfieImage(null);
    } else if (currentStep === 'verification' || currentStep === 'result') {
      setCurrentStep('document');
      setDocumentImage(null);
    }
  };
  
  // Función para iniciar verificación biométrica
  const startVerification = async () => {
    if (!selfieImage || !documentImage) {
      toast({
        title: "Error",
        description: "Se requieren imágenes de selfie y documento para la verificación",
        variant: "destructive"
      });
      return;
    }
    
    // Resetear progreso
    setVerificationProgress(0);
    
    // Actualizar estado
    setVerificationResult({
      status: 'processing'
    });
    
    try {
      // Enviar imágenes al servidor para análisis
      const response = await fetch('/api/biometric/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          selfieImage,
          documentImage
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error en la verificación: ${response.status} ${response.statusText}`);
      }
      
      // Procesar respuesta
      const result = await response.json();
      
      // Completar progreso
      setVerificationProgress(100);
      
      // Actualizar estado con resultado
      setVerificationResult({
        status: 'completed',
        documentInfo: result.documentInfo,
        documentAuthenticityResult: result.documentAuthenticityResult,
        facialSimilarityResult: result.facialSimilarityResult,
        overallResult: result.overallResult
      });
      
      // Pasar a pantalla de resultado
      setCurrentStep('result');
      
      // Notificar al componente padre si hay callback
      if (onVerificationComplete) {
        onVerificationComplete({
          status: 'completed',
          documentInfo: result.documentInfo,
          documentAuthenticityResult: result.documentAuthenticityResult,
          facialSimilarityResult: result.facialSimilarityResult,
          overallResult: result.overallResult
        });
      }
      
      // Notificar mediante toast
      toast({
        title: result.overallResult.verified 
          ? "Verificación exitosa" 
          : "Verificación completada con observaciones",
        description: result.overallResult.details,
        variant: result.overallResult.verified ? "default" : "destructive"
      });
    } catch (error) {
      console.error("Error en verificación biométrica:", error);
      
      // Actualizar estado con error
      setVerificationResult({
        status: 'error',
        error: error.message || 'Error desconocido durante la verificación'
      });
      
      // Notificar error
      toast({
        title: "Error en verificación",
        description: error.message || 'Error desconocido durante la verificación',
        variant: "destructive"
      });
    }
  };
  
  // Función para reiniciar el proceso
  const resetVerification = () => {
    // Limpiar estados
    setSelfieImage(null);
    setDocumentImage(null);
    setVerificationResult({
      status: 'idle'
    });
    setVerificationProgress(0);
    
    // Volver al paso inicial
    setCurrentStep('selfie');
    
    // Iniciar cámara
    setTimeout(startCamera, 500);
  };
  
  // Renderizar contenido según paso actual
  const renderStepContent = () => {
    switch (currentStep) {
      case 'selfie':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="bg-primary/10 p-3 rounded-full inline-block mb-2">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Captura de Selfie</h3>
              <p className="text-sm text-muted-foreground">
                Tome una foto frontal de su rostro con buena iluminación
              </p>
            </div>
            
            {cameraError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error de cámara</AlertTitle>
                <AlertDescription>{cameraError}</AlertDescription>
              </Alert>
            )}
            
            {!selfieImage ? (
              <>
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  {!cameraActive ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button 
                        variant="outline"
                        size="lg"
                        className="gap-2"
                        onClick={startCamera}
                      >
                        <CameraIcon className="h-5 w-5" />
                        <span>Activar cámara</span>
                      </Button>
                    </div>
                  ) : null}
                  <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                  {cameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="border-2 border-white rounded-full w-48 h-48 opacity-50"></div>
                    </div>
                  )}
                </div>
                
                {cameraActive && (
                  <div className="flex justify-between gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={switchCamera}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Cambiar cámara
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={captureImage}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Capturar
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <img 
                    src={selfieImage} 
                    alt="Selfie" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex justify-between gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={retakeImage}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Volver a capturar
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={goToNextStep}
                  >
                    Continuar
                  </Button>
                </div>
              </>
            )}
          </div>
        );
        
      case 'document':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="bg-primary/10 p-3 rounded-full inline-block mb-2">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Captura de Documento</h3>
              <p className="text-sm text-muted-foreground">
                Tome una foto clara de su cédula de identidad
              </p>
            </div>
            
            {cameraError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error de cámara</AlertTitle>
                <AlertDescription>{cameraError}</AlertDescription>
              </Alert>
            )}
            
            {!documentImage ? (
              <>
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  {!cameraActive ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button 
                        variant="outline"
                        size="lg"
                        className="gap-2"
                        onClick={startCamera}
                      >
                        <CameraIcon className="h-5 w-5" />
                        <span>Activar cámara</span>
                      </Button>
                    </div>
                  ) : null}
                  <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                  {cameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="border-2 border-white rounded-lg w-[85%] h-48 opacity-50"></div>
                    </div>
                  )}
                </div>
                
                {cameraActive && (
                  <div className="flex justify-between gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={switchCamera}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Cambiar cámara
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={captureImage}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Capturar
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <img 
                    src={documentImage} 
                    alt="Documento" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex justify-between gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={retakeImage}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Volver a capturar
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={goToNextStep}
                  >
                    Continuar
                  </Button>
                </div>
              </>
            )}
            
            <div className="flex justify-center pt-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={goToPreviousStep}
              >
                Volver a selfie
              </Button>
            </div>
          </div>
        );
        
      case 'verification':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="bg-primary/10 p-3 rounded-full inline-block mb-2">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <h3 className="text-lg font-medium">Verificando identidad</h3>
              <p className="text-sm text-muted-foreground">
                Nuestro sistema está procesando y verificando su identidad
              </p>
            </div>
            
            <Progress value={verificationProgress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">{verificationProgress}% completado</p>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Selfie</p>
                <div className="bg-muted rounded-lg overflow-hidden aspect-square">
                  <img 
                    src={selfieImage!} 
                    alt="Selfie" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Documento</p>
                <div className="bg-muted rounded-lg overflow-hidden aspect-square">
                  <img 
                    src={documentImage!} 
                    alt="Documento" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            
            {verificationResult.status === 'error' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error en verificación</AlertTitle>
                <AlertDescription>
                  {verificationResult.error || 'Error desconocido durante la verificación'}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="pt-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={goToPreviousStep}
                disabled={verificationResult.status === 'processing'}
              >
                Cancelar
              </Button>
            </div>
          </div>
        );
        
      case 'result':
        // Verificar que tenemos resultados
        if (verificationResult.status !== 'completed' || !verificationResult.overallResult) {
          return (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Resultado no disponible</h3>
              <p className="text-muted-foreground mb-4">
                No se pudo obtener el resultado de la verificación.
              </p>
              <Button onClick={resetVerification}>
                Reiniciar verificación
              </Button>
            </div>
          );
        }
        
        const {
          overallResult,
          documentInfo,
          documentAuthenticityResult,
          facialSimilarityResult
        } = verificationResult;
        
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className={`p-3 rounded-full inline-block mb-2 ${
                overallResult.verified 
                  ? 'bg-green-100' 
                  : 'bg-amber-100'
              }`}>
                {overallResult.verified ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-amber-600" />
                )}
              </div>
              <h3 className="text-lg font-medium">
                Verificación {overallResult.verified ? 'Exitosa' : 'Completada'}
              </h3>
              <div className="flex justify-center mb-2">
                <Badge variant={overallResult.verified ? 'outline' : 'secondary'}>
                  Confianza: {Math.round(overallResult.confidenceScore * 100)}%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {overallResult.details}
              </p>
            </div>
            
            <Tabs defaultValue="document" className="w-full">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="document">Documento</TabsTrigger>
                <TabsTrigger value="security">Seguridad</TabsTrigger>
                <TabsTrigger value="facial">Facial</TabsTrigger>
              </TabsList>
              
              <TabsContent value="document" className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <h4 className="font-medium text-sm">Datos del documento</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Tipo</p>
                      <p>{documentInfo?.documentType || 'No disponible'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Número</p>
                      <p>{documentInfo?.documentNumber || 'No disponible'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Nombre</p>
                      <p>{documentInfo?.fullName || 'No disponible'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Nacionalidad</p>
                      <p>{documentInfo?.nationality || 'No disponible'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Nacimiento</p>
                      <p>{documentInfo?.birthDate || 'No disponible'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Vencimiento</p>
                      <p>{documentInfo?.expiryDate || 'No disponible'}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="security" className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Autenticidad del documento</h4>
                    <Badge variant={documentAuthenticityResult?.isAuthentic ? 'outline' : 'secondary'}>
                      {documentAuthenticityResult?.isAuthentic ? 'Auténtico' : 'Posibles alteraciones'}
                    </Badge>
                  </div>
                  
                  <div className="mt-2">
                    <div className="text-sm">
                      <p className="text-xs text-muted-foreground">Nivel de confianza</p>
                      <p>{documentAuthenticityResult?.confidence || 'No disponible'} ({Math.round((documentAuthenticityResult?.score || 0) * 100)}%)</p>
                    </div>
                    
                    {documentAuthenticityResult?.securityFeatures && documentAuthenticityResult.securityFeatures.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">Elementos de seguridad detectados</p>
                        <ul className="text-xs list-disc pl-5 mt-1">
                          {documentAuthenticityResult.securityFeatures.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {documentAuthenticityResult?.manipulationSigns && documentAuthenticityResult.manipulationSigns.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">Posibles signos de manipulación</p>
                        <ul className="text-xs list-disc pl-5 mt-1 text-amber-700">
                          {documentAuthenticityResult.manipulationSigns.map((sign, index) => (
                            <li key={index}>{sign}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="facial" className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Verificación facial</h4>
                    <Badge variant={facialSimilarityResult?.match ? 'outline' : 'secondary'}>
                      {facialSimilarityResult?.match ? 'Coincidente' : 'No coincidente'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Selfie</p>
                      <div className="bg-black rounded-lg overflow-hidden aspect-square">
                        <img 
                          src={selfieImage!} 
                          alt="Selfie" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Documento</p>
                      <div className="bg-black rounded-lg overflow-hidden aspect-square">
                        <img 
                          src={documentImage!} 
                          alt="Documento" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm mt-3">
                    <p className="text-xs text-muted-foreground">Similitud facial</p>
                    <p>{Math.round((facialSimilarityResult?.score || 0) * 100)}% (confianza {facialSimilarityResult?.confidence || 'baja'})</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-between gap-2 pt-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={resetVerification}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Nueva verificación
              </Button>
              
              <Button 
                className="flex-1"
                disabled={!overallResult.verified}
              >
                Continuar
              </Button>
            </div>
          </div>
        );
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Verificación Biométrica</CardTitle>
          <div className="flex gap-2">
            <Badge variant={currentStep === 'selfie' ? 'default' : 'outline'}>
              Selfie
            </Badge>
            <Badge variant={currentStep === 'document' ? 'default' : 'outline'}>
              Documento
            </Badge>
            <Badge variant={
              currentStep === 'verification' || currentStep === 'result' 
                ? 'default' 
                : 'outline'
            }>
              Verificación
            </Badge>
          </div>
        </div>
        <CardDescription>
          Verificación biométrica de identidad con cámara
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {renderStepContent()}
        
        {/* Canvas oculto para capturar frames */}
        <canvas ref={canvasRef} className="hidden"></canvas>
      </CardContent>
    </Card>
  );
};

export default BiometricVerification;