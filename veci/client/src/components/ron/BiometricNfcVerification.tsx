/**
 * Componente de verificación biométrica y NFC
 * 
 * Este componente implementa la verificación avanzada de identidad integrando:
 * 1. Lectura de datos biométricos
 * 2. Verificación de cédula mediante escaneo
 * 3. Validación NFC mediante código QR
 */
import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Fingerprint, CreditCard, Scan, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// Interfaces para los datos de verificación
interface BiometricData {
  faceScore: number;
  fingerprint: boolean;
  livenessCheck: boolean;
  timestamp: string;
}

interface NFCData {
  serialNumber: string;
  documentNumber: string;
  fullName: string;
  birthDate: string;
  expiryDate: string;
  issuingAuthority: string;
  verified: boolean;
}

interface IDCardData {
  documentNumber: string;
  fullName: string;
  birthDate: string;
  nationality: string;
  expiryDate: string;
  documentType: string;
  issueDate: string;
  address: string | null;
  photo: string | null;
}

export interface VerificationResult {
  status: 'pending' | 'completed' | 'failed';
  biometricData: BiometricData | null;
  nfcData: NFCData | null;
  idCardData: IDCardData | null;
  verificationScore: number;
  timestamp: string;
}

interface BiometricNfcVerificationProps {
  onVerified: (result: VerificationResult) => void;
  onCancel: () => void;
  userType: 'client' | 'certifier';
}

const BiometricNfcVerification: React.FC<BiometricNfcVerificationProps> = ({
  onVerified,
  onCancel,
  userType
}) => {
  // Estados
  const [activeTab, setActiveTab] = useState<string>('instructions');
  const [step, setStep] = useState<'instructions' | 'biometric' | 'idcard' | 'nfc' | 'processing' | 'result' | 'error'>('instructions');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult>({
    status: 'pending',
    biometricData: null,
    nfcData: null,
    idCardData: null,
    verificationScore: 0,
    timestamp: new Date().toISOString()
  });
  const [qrDetected, setQrDetected] = useState<boolean>(false);
  const [nfcDetected, setNfcDetected] = useState<boolean>(false);
  const [biometricCompleted, setBiometricCompleted] = useState<boolean>(false);
  const [idCardCompleted, setIdCardCompleted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // Referencias
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Hooks
  const { toast } = useToast();

  // Efecto para limpiar la cámara al desmontar
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Simular progreso de verificación
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isProcessing && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return newProgress;
        });
      }, 500);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing, progress]);

  // Monitorear cuando el progreso llega al 100%
  useEffect(() => {
    if (progress === 100 && isProcessing && step === 'processing') {
      // Simular que la verificación ha terminado
      setTimeout(() => {
        completeVerification();
      }, 1000);
    }
  }, [progress, isProcessing, step]);

  // Iniciar cámara
  const startCamera = async () => {
    try {
      if (cameraStream) {
        stopCamera();
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setCameraStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        // Iniciar detección de códigos QR si estamos en el paso NFC
        if (step === 'nfc') {
          startQRDetection();
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error al iniciar la cámara:', error);
      setErrorMessage('No se pudo acceder a la cámara. Verifique los permisos del navegador.');
      setStep('error');
      return false;
    }
  };

  // Detener cámara
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Iniciar detección de códigos QR (simulado)
  const startQRDetection = () => {
    // En una implementación real, aquí se utilizaría una biblioteca de escaneo de QR
    // como jsQR o una API nativa
    
    // Simulamos detección después de 3 segundos
    setTimeout(() => {
      if (step === 'nfc') {
        // Simular que se encontró un código QR
        setQrDetected(true);
        
        toast({
          title: '¡Código QR detectado!',
          description: 'Procesando datos del chip NFC...'
        });
        
        // Simular procesamiento NFC
        setTimeout(() => {
          setNfcDetected(true);
          
          // Actualizar datos NFC
          setVerificationResult(prev => ({
            ...prev,
            nfcData: {
              serialNumber: 'CHL123456789',
              documentNumber: '12.345.678-9',
              fullName: 'NOMBRE APELLIDO USUARIO',
              birthDate: '01/01/1980',
              expiryDate: '31/12/2028',
              issuingAuthority: 'REGISTRO CIVIL E IDENTIFICACIÓN',
              verified: true
            }
          }));
          
          toast({
            title: 'Datos NFC verificados',
            description: 'La verificación del chip NFC se ha completado correctamente.'
          });
          
          // Avanzar al siguiente paso
          startProcessing();
        }, 2000);
      }
    }, 3000);
  };

  // Función para realizar verificación biométrica (simulada)
  const performBiometricVerification = async () => {
    setIsProcessing(true);
    
    try {
      // Simular verificación biométrica (rostro)
      setTimeout(() => {
        setVerificationResult(prev => ({
          ...prev,
          biometricData: {
            faceScore: 0.95, // 95% de coincidencia
            fingerprint: true,
            livenessCheck: true,
            timestamp: new Date().toISOString()
          }
        }));
        
        setBiometricCompleted(true);
        setIsProcessing(false);
        
        toast({
          title: 'Verificación biométrica completada',
          description: '95% de coincidencia biométrica detectada.'
        });
        
        // Avanzar al paso de tarjeta de identidad
        setStep('idcard');
      }, 3000);
    } catch (error) {
      console.error('Error en verificación biométrica:', error);
      setIsProcessing(false);
      setErrorMessage('No se pudo completar la verificación biométrica.');
      setStep('error');
    }
  };

  // Función para realizar verificación de cédula (simulada)
  const performIDCardVerification = async () => {
    setIsProcessing(true);
    
    try {
      // Iniciar la cámara para escanear la cédula
      await startCamera();
      
      // Simular detección de cédula
      setTimeout(() => {
        // Capturar imagen de la cédula
        if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL('image/jpeg');
            
            // Simular proceso OCR y extracción de datos
            setVerificationResult(prev => ({
              ...prev,
              idCardData: {
                documentNumber: '12.345.678-9',
                fullName: 'NOMBRE APELLIDO USUARIO',
                birthDate: '01/01/1980',
                nationality: 'CHILENA',
                expiryDate: '31/12/2028',
                documentType: 'CÉDULA DE IDENTIDAD',
                issueDate: '01/01/2018',
                address: 'SANTIAGO, CHILE',
                photo: imageData
              }
            }));
            
            setIdCardCompleted(true);
            stopCamera();
            setIsProcessing(false);
            
            toast({
              title: 'Cédula verificada',
              description: 'Los datos de la cédula se han extraído correctamente.'
            });
            
            // Avanzar al paso NFC
            setStep('nfc');
          }
        }
      }, 3000);
    } catch (error) {
      console.error('Error en verificación de cédula:', error);
      setIsProcessing(false);
      setErrorMessage('No se pudo completar la verificación de la cédula.');
      setStep('error');
    }
  };

  // Iniciar el proceso completo de verificación
  const startVerification = () => {
    setStep('biometric');
    setBiometricCompleted(false);
    setIdCardCompleted(false);
    setQrDetected(false);
    setNfcDetected(false);
    setProgress(0);
    
    // Reiniciar el resultado
    setVerificationResult({
      status: 'pending',
      biometricData: null,
      nfcData: null,
      idCardData: null,
      verificationScore: 0,
      timestamp: new Date().toISOString()
    });
  };

  // Iniciar paso de procesamiento final
  const startProcessing = () => {
    setStep('processing');
    setIsProcessing(true);
    setProgress(0);
  };

  // Completar verificación
  const completeVerification = () => {
    setIsProcessing(false);
    setStep('result');
    
    // Calcular puntuación de verificación global
    const biometricScore = verificationResult.biometricData?.faceScore || 0;
    const nfcScore = verificationResult.nfcData?.verified ? 1 : 0;
    const idCardScore = verificationResult.idCardData ? 1 : 0;
    
    const totalScore = (biometricScore + nfcScore + idCardScore) / 3;
    
    // Actualizar resultado final
    const finalResult: VerificationResult = {
      ...verificationResult,
      status: totalScore > 0.8 ? 'completed' : 'failed',
      verificationScore: totalScore,
      timestamp: new Date().toISOString()
    };
    
    setVerificationResult(finalResult);
    
    // Notificar al componente padre
    onVerified(finalResult);
  };

  // Reiniciar proceso
  const resetProcess = () => {
    stopCamera();
    setStep('instructions');
    setIsProcessing(false);
    setErrorMessage(null);
    setProgress(0);
    setBiometricCompleted(false);
    setIdCardCompleted(false);
    setQrDetected(false);
    setNfcDetected(false);
  };

  // Renderizar el paso actual
  const renderCurrentStep = () => {
    switch (step) {
      case 'instructions':
        return (
          <div className="space-y-6">
            <Tabs defaultValue="instructions" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="instructions">Instrucciones</TabsTrigger>
                <TabsTrigger value="requirements">Requisitos</TabsTrigger>
                <TabsTrigger value="privacy">Privacidad</TabsTrigger>
              </TabsList>
              
              <TabsContent value="instructions" className="space-y-4">
                <div className="text-center">
                  <div className="bg-primary/10 p-4 rounded-full inline-block mb-3">
                    <Fingerprint className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Verificación Avanzada</h2>
                  <p className="text-muted-foreground">
                    Este proceso validará su identidad mediante datos biométricos 
                    y su cédula de identidad, incluyendo el chip NFC.
                  </p>
                </div>
                
                <div className="space-y-3 mt-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Verificación biométrica facial</h3>
                      <p className="text-sm text-muted-foreground">
                        Analizaremos sus rasgos faciales para verificar su identidad
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Escaneo de cédula de identidad</h3>
                      <p className="text-sm text-muted-foreground">
                        Capturaremos y verificaremos los datos de su documento
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Validación de chip NFC</h3>
                      <p className="text-sm text-muted-foreground">
                        Mediante código QR, validaremos el chip NFC de su cédula
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="requirements" className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-bold">Requisitos técnicos:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Cámara web o cámara de dispositivo móvil</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Navegador moderno (Chrome, Firefox, Safari)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Cédula de identidad chilena vigente</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Buena iluminación en el ambiente</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="privacy" className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-bold">Protección de datos:</h3>
                  <p className="text-sm">
                    Sus datos biométricos y personales serán tratados conforme a la Ley 19.628 
                    sobre Protección de la Vida Privada y utilizados exclusivamente para 
                    los fines de verificación de identidad en esta plataforma.
                  </p>
                  <p className="text-sm">
                    Los datos NFC de su cédula serán verificados pero no almacenados permanentemente.
                    Toda la información es transmitida mediante conexiones seguras cifradas.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            
            <Button 
              onClick={startVerification} 
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando verificación...
                </>
              ) : (
                <>Comenzar verificación avanzada</>
              )}
            </Button>
          </div>
        );
        
      case 'biometric':
        return (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <Badge variant="outline" className="mb-2">Paso 1 de 3</Badge>
              <h2 className="text-xl font-bold">Verificación biométrica</h2>
              <p className="text-muted-foreground">
                Realizando análisis biométrico facial
              </p>
            </div>
            
            <div className="relative bg-black rounded-lg overflow-hidden h-[300px] flex items-center justify-center">
              {isProcessing ? (
                <div className="text-center text-white">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-2" />
                  <p>Analizando rasgos faciales...</p>
                </div>
              ) : (
                <div className="text-center text-white">
                  <Fingerprint className="h-16 w-16 mx-auto mb-2" />
                  <p>Presione el botón para iniciar el análisis biométrico</p>
                </div>
              )}
            </div>
            
            <Button 
              onClick={performBiometricVerification} 
              className="w-full"
              disabled={isProcessing || biometricCompleted}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : biometricCompleted ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verificación biométrica completada
                </>
              ) : (
                <>Iniciar verificación biométrica</>
              )}
            </Button>
          </div>
        );
        
      case 'idcard':
        return (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <Badge variant="outline" className="mb-2">Paso 2 de 3</Badge>
              <h2 className="text-xl font-bold">Verificación de cédula</h2>
              <p className="text-muted-foreground">
                Capture el frente de su cédula de identidad
              </p>
            </div>
            
            {!isProcessing && !idCardCompleted ? (
              <>
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Verificación biométrica completada</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Score de coincidencia: {(verificationResult.biometricData?.faceScore || 0) * 100}%
                  </p>
                </div>
                
                <div className="relative bg-black rounded-lg overflow-hidden h-[200px] flex items-center justify-center">
                  <div className="text-center text-white">
                    <CreditCard className="h-12 w-12 mx-auto mb-2" />
                    <p>Presione el botón para escanear su cédula</p>
                  </div>
                </div>
              </>
            ) : !idCardCompleted ? (
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video 
                  ref={videoRef} 
                  className="w-full h-[280px] object-cover"
                  autoPlay 
                  playsInline
                />
                <div className="absolute inset-0 border-2 border-dashed border-primary/50 pointer-events-none rounded-lg"></div>
              </div>
            ) : (
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Cédula verificada correctamente</span>
                </div>
                {verificationResult.idCardData && (
                  <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <div>
                      <p className="font-medium">Número:</p>
                      <p>{verificationResult.idCardData.documentNumber}</p>
                    </div>
                    <div>
                      <p className="font-medium">Nombre:</p>
                      <p>{verificationResult.idCardData.fullName}</p>
                    </div>
                    <div>
                      <p className="font-medium">Fecha de nacimiento:</p>
                      <p>{verificationResult.idCardData.birthDate}</p>
                    </div>
                    <div>
                      <p className="font-medium">Vencimiento:</p>
                      <p>{verificationResult.idCardData.expiryDate}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <Button 
              onClick={performIDCardVerification} 
              className="w-full"
              disabled={isProcessing || idCardCompleted}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Escaneando cédula...
                </>
              ) : idCardCompleted ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Cédula verificada
                </>
              ) : (
                <>Escanear cédula</>
              )}
            </Button>
          </div>
        );
        
      case 'nfc':
        return (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <Badge variant="outline" className="mb-2">Paso 3 de 3</Badge>
              <h2 className="text-xl font-bold">Verificación NFC</h2>
              <p className="text-muted-foreground">
                Escanee el código QR para validar el chip NFC de su cédula
              </p>
            </div>
            
            <div className="bg-muted p-4 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Cédula verificada correctamente</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Procediendo a validar el chip NFC
              </p>
            </div>
            
            {!qrDetected ? (
              <>
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video 
                    ref={videoRef} 
                    className="w-full h-[280px] object-cover"
                    autoPlay 
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[200px] h-[200px] border-2 border-primary rounded-lg"></div>
                  </div>
                </div>
                
                <Button 
                  onClick={startCamera} 
                  className="w-full"
                  disabled={cameraStream !== null}
                >
                  {cameraStream ? (
                    <>Cámara activa - busque el código QR</>
                  ) : (
                    <>Iniciar cámara para QR</>
                  )}
                </Button>
              </>
            ) : !nfcDetected ? (
              <div className="text-center p-6 space-y-4 bg-muted rounded-lg">
                <div className="animate-pulse flex justify-center">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                </div>
                <h3 className="font-medium">Procesando datos NFC</h3>
                <p className="text-sm text-muted-foreground">
                  Por favor, espere mientras verificamos la información del chip NFC...
                </p>
              </div>
            ) : (
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Chip NFC verificado correctamente</span>
                </div>
                {verificationResult.nfcData && (
                  <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <div>
                      <p className="font-medium">Serial NFC:</p>
                      <p>{verificationResult.nfcData.serialNumber}</p>
                    </div>
                    <div>
                      <p className="font-medium">Nombre:</p>
                      <p>{verificationResult.nfcData.fullName}</p>
                    </div>
                    <div>
                      <p className="font-medium">Documento:</p>
                      <p>{verificationResult.nfcData.documentNumber}</p>
                    </div>
                    <div>
                      <p className="font-medium">Vencimiento:</p>
                      <p>{verificationResult.nfcData.expiryDate}</p>
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={startProcessing}
                  className="w-full mt-4"
                >
                  Finalizar verificación
                </Button>
              </div>
            )}
          </div>
        );
        
      case 'processing':
        return (
          <div className="text-center p-6 space-y-6">
            <div className="flex justify-center">
              <Scan className="h-12 w-12 text-primary" />
            </div>
            
            <h2 className="text-xl font-bold">Procesando verificación completa</h2>
            <p className="text-muted-foreground">
              Estamos integrando y validando toda la información recopilada...
            </p>
            
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">{Math.round(progress)}% completado</p>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className={`p-3 rounded-lg ${biometricCompleted ? 'bg-green-50' : 'bg-muted'}`}>
                <Fingerprint className={`h-6 w-6 mx-auto mb-1 ${biometricCompleted ? 'text-green-500' : 'text-muted-foreground'}`} />
                <p className="text-xs font-medium">Biometría</p>
              </div>
              
              <div className={`p-3 rounded-lg ${idCardCompleted ? 'bg-green-50' : 'bg-muted'}`}>
                <CreditCard className={`h-6 w-6 mx-auto mb-1 ${idCardCompleted ? 'text-green-500' : 'text-muted-foreground'}`} />
                <p className="text-xs font-medium">Cédula</p>
              </div>
              
              <div className={`p-3 rounded-lg ${nfcDetected ? 'bg-green-50' : 'bg-muted'}`}>
                <QrCode className={`h-6 w-6 mx-auto mb-1 ${nfcDetected ? 'text-green-500' : 'text-muted-foreground'}`} />
                <p className="text-xs font-medium">NFC</p>
              </div>
            </div>
          </div>
        );
        
      case 'result':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              {verificationResult.status === 'completed' ? (
                <>
                  <div className="bg-green-100 p-4 rounded-full inline-block mb-2">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h2 className="text-xl font-bold text-green-700">Verificación Exitosa</h2>
                </>
              ) : (
                <>
                  <div className="bg-red-100 p-4 rounded-full inline-block mb-2">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  </div>
                  <h2 className="text-xl font-bold text-red-700">Verificación Fallida</h2>
                </>
              )}
              
              <p className="text-muted-foreground">
                Score de verificación: {Math.round(verificationResult.verificationScore * 100)}%
              </p>
            </div>
            
            <div className="space-y-3">
              <div className={`p-3 rounded-lg border ${verificationResult.biometricData ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Verificación biométrica</h3>
                  {verificationResult.biometricData ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      VERIFICADO
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                      NO VERIFICADO
                    </Badge>
                  )}
                </div>
                {verificationResult.biometricData && (
                  <p className="text-sm mt-1">
                    Score facial: {Math.round(verificationResult.biometricData.faceScore * 100)}%
                  </p>
                )}
              </div>
              
              <div className={`p-3 rounded-lg border ${verificationResult.idCardData ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Verificación de cédula</h3>
                  {verificationResult.idCardData ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      VERIFICADO
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                      NO VERIFICADO
                    </Badge>
                  )}
                </div>
                {verificationResult.idCardData && (
                  <p className="text-sm mt-1">
                    Documento: {verificationResult.idCardData.documentNumber}
                  </p>
                )}
              </div>
              
              <div className={`p-3 rounded-lg border ${verificationResult.nfcData ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Verificación NFC</h3>
                  {verificationResult.nfcData ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      VERIFICADO
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                      NO VERIFICADO
                    </Badge>
                  )}
                </div>
                {verificationResult.nfcData && (
                  <p className="text-sm mt-1">
                    Serial: {verificationResult.nfcData.serialNumber}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
        
      case 'error':
        return (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error de verificación</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Se produjo un error durante el proceso de verificación.'}
              </AlertDescription>
            </Alert>
            
            <div className="text-center mt-4">
              <Button 
                variant="outline" 
                onClick={resetProcess}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar verificación
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Verificación Avanzada</CardTitle>
        <CardDescription>
          Sistema integrado de verificación biométrica, cédula y NFC
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {renderCurrentStep()}
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
      
      {(step !== 'instructions' && step !== 'processing' && step !== 'error') && (
        <CardFooter className="border-t pt-4 flex justify-between">
          {step !== 'result' ? (
            <Button 
              variant="ghost" 
              onClick={resetProcess}
            >
              Cancelar
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={resetProcess}
            >
              Nueva verificación
            </Button>
          )}
          
          {step === 'result' && (
            <Button 
              onClick={() => onCancel()}
            >
              Finalizar
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default BiometricNfcVerification;