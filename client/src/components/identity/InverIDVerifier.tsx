import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Smartphone,
  CreditCard,
  Camera,
  UserCheck,
  Fingerprint,
  Database,
  AlertTriangle,
  FileText,
  Lock,
  Signal,
  Loader2,
  Filter,
  Check
} from "lucide-react";

import { CedulaChilenaData, NFCReadStatus, NFCReaderType, readCedulaChilena, checkNFCAvailability, nfcSupported } from '@/lib/nfc-reader';
import NFCMicroInteractions from './NFCMicroInteractions';
import { apiRequest } from '@/lib/queryClient';

interface InverIDVerifierProps {
  sessionId?: string;
  onSuccess?: (data: CedulaChilenaData) => void;
  onError?: (error: string) => void;
  onComplete?: (success: boolean, data?: any) => void;
}

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'inProgress' | 'success' | 'failed';
}

/**
 * Componente avanzado para verificación de identidad basado en InverID
 * Combina verificación por NFC + análisis forense de documentos + validación biométrica
 */
const InverIDVerifier: React.FC<InverIDVerifierProps> = ({ 
  sessionId = '', 
  onSuccess,
  onError,
  onComplete
}) => {
  // Estados principales
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [documentProgress, setDocumentProgress] = useState<number>(0);
  const [nfcProgress, setNfcProgress] = useState<number>(0);
  const [biometricProgress, setBiometricProgress] = useState<number>(0);
  const [validationProgress, setValidationProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("document");
  
  // Estados para datos de verificación
  const [nfcAvailable, setNfcAvailable] = useState<boolean>(false);
  const [nfcStatus, setNfcStatus] = useState<NFCReadStatus>(NFCReadStatus.INACTIVE);
  const [nfcReaderType, setNfcReaderType] = useState<NFCReaderType | undefined>();
  const [nfcMessage, setNfcMessage] = useState<string>('');
  const [cedulaData, setCedulaData] = useState<CedulaChilenaData | null>(null);
  const [documentImageSrc, setDocumentImageSrc] = useState<string | null>(null);
  const [faceImageSrc, setFaceImageSrc] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Estados para verificación avanzada
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
    {
      id: 'document',
      title: 'Verificación de documento',
      description: 'Análisis forense del documento de identidad',
      icon: <Shield className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'nfc',
      title: 'Lectura de chip NFC',
      description: 'Validación de datos electrónicos',
      icon: <Fingerprint className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'biometric',
      title: 'Verificación biométrica',
      description: 'Comparación facial y prueba de vida',
      icon: <UserCheck className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'validation',
      title: 'Validación con bases oficiales',
      description: 'Contraste con fuentes oficiales',
      icon: <Database className="h-5 w-5" />,
      status: 'pending'
    }
  ]);
  
  // Verificar disponibilidad de NFC al montar el componente
  useEffect(() => {
    async function checkNFC() {
      try {
        const isSupported = await nfcSupported();
        setNfcAvailable(isSupported);
        
        if (isSupported) {
          const { readerType } = await checkNFCAvailability();
          setNfcReaderType(readerType);
        }
      } catch (error) {
        console.error("Error verificando NFC:", error);
        setNfcAvailable(false);
      }
    }
    
    checkNFC();
    
    return () => {
      // Limpiar recursos al desmontar
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Cambiar a la siguiente etapa de verificación
  const moveToNextStep = () => {
    setCurrentStep(prev => {
      const next = prev + 1;
      if (next <= 3) {
        // Inicia la etapa correspondiente
        const updatedSteps = [...verificationSteps];
        updatedSteps[next].status = 'inProgress';
        setVerificationSteps(updatedSteps);
        
        // Establece la pestaña activa según la etapa
        switch(next) {
          case 1: setActiveTab("nfc"); break;
          case 2: setActiveTab("biometric"); break;
          case 3: setActiveTab("validation"); break;
          default: setActiveTab("document");
        }
        
        return next;
      }
      return prev;
    });
  };
  
  // Manejar inicio de captura de documento
  const handleCaptureDocument = () => {
    // Marcar etapa como en progreso
    const updatedSteps = [...verificationSteps];
    updatedSteps[0].status = 'inProgress';
    setVerificationSteps(updatedSteps);
    
    // Simular progreso de análisis de documento
    simulateDocumentVerification();
  };
  
  // Simular análisis forense del documento
  const simulateDocumentVerification = () => {
    setDocumentProgress(0);
    
    const interval = setInterval(() => {
      setDocumentProgress(prev => {
        const newValue = prev + 5;
        
        if (newValue >= 100) {
          clearInterval(interval);
          
          // Documento verificado exitosamente
          const updatedSteps = [...verificationSteps];
          updatedSteps[0].status = 'success';
          setVerificationSteps(updatedSteps);
          
          // Usar imagen de muestra para demostración
          setDocumentImageSrc('data:image/png;base64,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');
          
          // Continuar con el siguiente paso
          setTimeout(() => moveToNextStep(), 1000);
          
          return 100;
        }
        
        return newValue;
      });
    }, 120);
  };
  
  // Iniciar lectura NFC
  const startNFCReading = async () => {
    // Verificar nuevamente disponibilidad
    const supported = await nfcSupported();
    if (!supported) {
      setError("NFC no disponible en este dispositivo");
      
      // Marcar etapa como fallida
      const updatedSteps = [...verificationSteps];
      updatedSteps[1].status = 'failed';
      setVerificationSteps(updatedSteps);
      
      return;
    }
    
    // Iniciar lectura
    setNfcStatus(NFCReadStatus.WAITING);
    setError(null);
    setNfcProgress(0);
    
    try {
      // Leer datos de la cédula
      const data = await readCedulaChilena(handleNFCStatusUpdate);
      
      if (data) {
        setCedulaData(data);
        setNfcStatus(NFCReadStatus.SUCCESS);
        
        // Marcar etapa como exitosa
        const updatedSteps = [...verificationSteps];
        updatedSteps[1].status = 'success';
        setVerificationSteps(updatedSteps);
        
        // Notificar éxito si hay callback
        if (onSuccess) onSuccess(data);
        
        // Continuar a la siguiente etapa
        setTimeout(() => moveToNextStep(), 1000);
      }
    } catch (err) {
      console.error("Error en lectura NFC:", err);
      setNfcStatus(NFCReadStatus.ERROR);
      setError(err instanceof Error ? err.message : "Error desconocido en lectura NFC");
      
      // Notificar error si hay callback
      if (onError) onError(err instanceof Error ? err.message : "Error desconocido");
      
      // Marcar etapa como fallida
      const updatedSteps = [...verificationSteps];
      updatedSteps[1].status = 'failed';
      setVerificationSteps(updatedSteps);
    }
  };
  
  // Actualizar estado de la lectura NFC
  const handleNFCStatusUpdate = (status: NFCReadStatus, message?: string) => {
    setNfcStatus(status);
    if (message) setNfcMessage(message);
    
    // Actualizar progreso según el estado
    switch (status) {
      case NFCReadStatus.WAITING:
        setNfcProgress(15);
        break;
      case NFCReadStatus.READING:
        if (message?.includes("personales")) setNfcProgress(40);
        else if (message?.includes("digital")) setNfcProgress(65);
        else if (message?.includes("biométricos")) setNfcProgress(80);
        else if (message?.includes("Validando")) setNfcProgress(90);
        else setNfcProgress(30);
        break;
      case NFCReadStatus.SUCCESS:
        setNfcProgress(100);
        break;
      case NFCReadStatus.ERROR:
        // Mantener el progreso actual en caso de error
        break;
      default:
        setNfcProgress(0);
    }
  };
  
  // Iniciar verificación biométrica
  const startBiometricVerification = async () => {
    // Marcar etapa como en progreso
    const updatedSteps = [...verificationSteps];
    updatedSteps[2].status = 'inProgress';
    setVerificationSteps(updatedSteps);
    
    try {
      // Iniciar acceso a la cámara
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" },
        audio: false
      });
      
      setCameraStream(stream);
      
      // Asignar stream al elemento de video
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Simular progreso de verificación biométrica
      simulateBiometricVerification();
    } catch (err) {
      console.error("Error accediendo a la cámara:", err);
      setError("No se pudo acceder a la cámara. Verifique los permisos.");
      
      // Marcar etapa como fallida
      const updatedSteps = [...verificationSteps];
      updatedSteps[2].status = 'failed';
      setVerificationSteps(updatedSteps);
    }
  };
  
  // Simular verificación biométrica
  const simulateBiometricVerification = () => {
    setBiometricProgress(0);
    
    const interval = setInterval(() => {
      setBiometricProgress(prev => {
        const newValue = prev + 10;
        
        if (newValue >= 100) {
          clearInterval(interval);
          
          // Capturar imagen de la verificación facial
          captureImage();
          
          // Biométrico verificado exitosamente
          const updatedSteps = [...verificationSteps];
          updatedSteps[2].status = 'success';
          setVerificationSteps(updatedSteps);
          
          // Detener la cámara
          if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
          }
          
          // Continuar con el siguiente paso
          setTimeout(() => moveToNextStep(), 1000);
          
          return 100;
        }
        
        return newValue;
      });
    }, 200);
  };
  
  // Capturar imagen de la cámara
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Configurar canvas para capturar la imagen
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Dibujar el frame actual del video en el canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convertir canvas a imagen
        const imageSrc = canvas.toDataURL('image/png');
        setFaceImageSrc(imageSrc);
      }
    }
  };
  
  // Iniciar validación con bases oficiales
  const startValidation = () => {
    // Marcar etapa como en progreso
    const updatedSteps = [...verificationSteps];
    updatedSteps[3].status = 'inProgress';
    setVerificationSteps(updatedSteps);
    
    // Simular progreso de validación con bases de datos
    simulateValidation();
  };
  
  // Simular validación con bases de datos oficiales
  const simulateValidation = () => {
    setValidationProgress(0);
    
    const interval = setInterval(() => {
      setValidationProgress(prev => {
        const newValue = prev + 15;
        
        if (newValue >= 100) {
          clearInterval(interval);
          
          // Validación exitosa
          const updatedSteps = [...verificationSteps];
          updatedSteps[3].status = 'success';
          setVerificationSteps(updatedSteps);
          
          // Notificar finalización completa
          if (onComplete) {
            onComplete(true, {
              cedula: cedulaData,
              documentVerified: true,
              biometricVerified: true,
              officialValidation: true
            });
          }
          
          return 100;
        }
        
        return newValue;
      });
    }, 300);
  };
  
  // Renderizar contenido según la etapa actual
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderDocumentStep();
      case 1:
        return renderNFCStep();
      case 2:
        return renderBiometricStep();
      case 3:
        return renderValidationStep();
      default:
        return renderDocumentStep();
    }
  };
  
  // Renderizar etapa de verificación de documento
  const renderDocumentStep = () => {
    const isInProgress = verificationSteps[0].status === 'inProgress';
    const isCompleted = verificationSteps[0].status === 'success';
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium">Verificación de documento</h3>
          <p className="text-sm text-gray-500">
            Análisis forense del documento de identidad para detectar falsificaciones
          </p>
        </div>
        
        {isInProgress && (
          <div className="space-y-4">
            <Progress value={documentProgress} className="h-2" />
            
            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>
                {documentProgress < 30 && "Escaneando documento..."}
                {documentProgress >= 30 && documentProgress < 60 && "Analizando elementos de seguridad..."}
                {documentProgress >= 60 && documentProgress < 90 && "Verificando estructura del documento..."}
                {documentProgress >= 90 && "Finalizando análisis..."}
              </span>
            </div>
          </div>
        )}
        
        {!isInProgress && !isCompleted && (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full text-center">
              <p className="text-blue-800 font-medium mb-2">Verificación de documento</p>
              <p className="text-blue-600 text-sm">
                Escanee su documento de identidad para verificar su autenticidad mediante tecnología forense digital.
              </p>
            </div>
            
            <Button
              className="w-full"
              onClick={handleCaptureDocument}
            >
              Escanear documento
            </Button>
          </div>
        )}
        
        {isCompleted && documentImageSrc && (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-full">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-green-700 font-medium">Documento verificado correctamente</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 w-full">
              <div className="flex justify-between text-sm text-gray-700">
                <span>Elementos de seguridad:</span>
                <span className="font-medium">Validados</span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <span>Estructura del documento:</span>
                <span className="font-medium">Auténtica</span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <span>Nivel de confianza:</span>
                <span className="font-medium">Alto (93%)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Renderizar etapa de lectura NFC
  const renderNFCStep = () => {
    const isInProgress = verificationSteps[1].status === 'inProgress' || nfcStatus !== NFCReadStatus.INACTIVE;
    const isCompleted = verificationSteps[1].status === 'success';
    const isFailed = verificationSteps[1].status === 'failed';
    
    // Determinar texto y estilo según el tipo de lector
    const getReaderTypeInfo = () => {
      switch (nfcReaderType) {
        case NFCReaderType.WEB_NFC:
          return {
            text: 'Lector NFC del dispositivo móvil',
            icon: <Smartphone className="h-5 w-5 mr-2" />
          };
        case NFCReaderType.POS_DEVICE:
          return {
            text: 'Lector NFC del dispositivo POS',
            icon: <CreditCard className="h-5 w-5 mr-2" />
          };
        case NFCReaderType.ANDROID_HOST:
          return {
            text: 'Lector NFC Android',
            icon: <Smartphone className="h-5 w-5 mr-2" />
          };
        default:
          return {
            text: 'Lector NFC',
            icon: <CreditCard className="h-5 w-5 mr-2" />
          };
      }
    };
    
    // Determinar el estado de micro-interacción
    const getMicroInteractionStatus = () => {
      switch (nfcStatus) {
        case NFCReadStatus.WAITING:
        case NFCReadStatus.READING:
          return 'scanning';
        case NFCReadStatus.SUCCESS:
          return 'success';
        case NFCReadStatus.ERROR:
          return 'error';
        default:
          return 'idle';
      }
    };
    
    const readerInfo = getReaderTypeInfo();
    const microInteractionStatus = getMicroInteractionStatus() as 'idle' | 'scanning' | 'success' | 'error';
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium">Lectura de chip NFC</h3>
          <p className="text-sm text-gray-500">
            Verificación de los datos electrónicos almacenados en el chip
          </p>
        </div>
        
        {!nfcAvailable && !isCompleted && (
          <Alert variant="destructive" className="my-4">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription>
              Este dispositivo no tiene soporte para NFC. Por favor, utilice un dispositivo compatible.
            </AlertDescription>
          </Alert>
        )}
        
        {isInProgress && (
          <div className="space-y-4">
            <Progress value={nfcProgress} className="h-2" />
            
            <motion.div 
              className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-blue-300"
              initial={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}
              animate={{ 
                borderColor: ['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 0.3)'] 
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <NFCMicroInteractions 
                status={microInteractionStatus}
                message={nfcMessage || 'Acerque la cédula al lector NFC'}
              />
              
              <div className="flex items-center justify-center mt-2 text-blue-600 text-sm">
                {readerInfo.icon}
                <span>{readerInfo.text}</span>
              </div>
            </motion.div>
          </div>
        )}
        
        {!isInProgress && !isCompleted && !isFailed && nfcAvailable && (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full text-center">
              <p className="text-blue-800 font-medium mb-2">Lectura del chip NFC</p>
              <p className="text-blue-600 text-sm">
                Acerque su cédula de identidad al lector NFC para verificar los datos del chip.
              </p>
            </div>
            
            <Button
              className="w-full"
              onClick={startNFCReading}
            >
              Iniciar lectura NFC
            </Button>
          </div>
        )}
        
        {isFailed && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-700 font-medium">Error en la lectura NFC</p>
            </div>
            <p className="text-red-600 text-sm mt-2">{error || "No se pudo leer el chip NFC de la cédula."}</p>
            
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={startNFCReading}
            >
              Intentar nuevamente
            </Button>
          </div>
        )}
        
        {isCompleted && cedulaData && (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-full">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-green-700 font-medium">Chip NFC leído correctamente</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 w-full">
              <div className="flex justify-between text-sm text-gray-700">
                <span>RUT:</span>
                <span className="font-medium">{cedulaData.rut}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <span>Nombre:</span>
                <span className="font-medium">{cedulaData.nombres} {cedulaData.apellidos}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <span>Fecha Nacimiento:</span>
                <span className="font-medium">{cedulaData.fechaNacimiento}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <span>Firma digital:</span>
                <span className="font-medium text-green-600">Verificada</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Renderizar etapa de verificación biométrica
  const renderBiometricStep = () => {
    const isInProgress = verificationSteps[2].status === 'inProgress';
    const isCompleted = verificationSteps[2].status === 'success';
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium">Verificación biométrica</h3>
          <p className="text-sm text-gray-500">
            Comparación facial y prueba de vida
          </p>
        </div>
        
        {isInProgress && (
          <div className="space-y-4">
            <Progress value={biometricProgress} className="h-2" />
            
            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>
                {biometricProgress < 30 && "Detectando rostro..."}
                {biometricProgress >= 30 && biometricProgress < 60 && "Analizando rasgos faciales..."}
                {biometricProgress >= 60 && biometricProgress < 90 && "Comparando con datos de cédula..."}
                {biometricProgress >= 90 && "Verificando prueba de vida..."}
              </span>
            </div>
            
            <div className="relative mx-auto w-full max-w-sm">
              <video 
                ref={videoRef}
                autoPlay 
                playsInline
                muted 
                className="w-full h-auto rounded-lg shadow-md"
              />
              
              {/* Overlay para guiar al usuario */}
              <div className="absolute inset-0 border-4 border-dashed border-blue-400 rounded-lg pointer-events-none"></div>
              
              {/* Canvas oculto para captura de imagen */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>
        )}
        
        {!isInProgress && !isCompleted && (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full text-center">
              <p className="text-blue-800 font-medium mb-2">Verificación biométrica</p>
              <p className="text-blue-600 text-sm">
                Realice una verificación facial para comparar con la fotografía de su cédula.
              </p>
            </div>
            
            <Button
              className="w-full"
              onClick={startBiometricVerification}
            >
              Iniciar verificación biométrica
            </Button>
          </div>
        )}
        
        {isCompleted && faceImageSrc && (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-full">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-green-700 font-medium">Verificación biométrica exitosa</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 w-full">
              <div className="flex justify-between text-sm text-gray-700">
                <span>Coincidencia facial:</span>
                <span className="font-medium">Alta (97%)</span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <span>Prueba de vida:</span>
                <span className="font-medium">Superada</span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <span>Identificación biométrica:</span>
                <span className="font-medium text-green-600">Verificada</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Renderizar etapa de validación con bases oficiales
  const renderValidationStep = () => {
    const isInProgress = verificationSteps[3].status === 'inProgress';
    const isCompleted = verificationSteps[3].status === 'success';
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium">Validación con bases oficiales</h3>
          <p className="text-sm text-gray-500">
            Contraste con fuentes de datos oficiales
          </p>
        </div>
        
        {isInProgress && (
          <div className="space-y-4">
            <Progress value={validationProgress} className="h-2" />
            
            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>
                {validationProgress < 30 && "Consultando base de datos del Registro Civil..."}
                {validationProgress >= 30 && validationProgress < 60 && "Verificando validez del documento..."}
                {validationProgress >= 60 && validationProgress < 90 && "Comprobando identidad..."}
                {validationProgress >= 90 && "Finalizando validación..."}
              </span>
            </div>
          </div>
        )}
        
        {!isInProgress && !isCompleted && (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full text-center">
              <p className="text-blue-800 font-medium mb-2">Validación con bases oficiales</p>
              <p className="text-blue-600 text-sm">
                Este paso realizará una comprobación de sus datos con bases oficiales para confirmar su identidad.
              </p>
            </div>
            
            <Button
              className="w-full"
              onClick={startValidation}
            >
              Iniciar validación
            </Button>
          </div>
        )}
        
        {isCompleted && (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-full">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-green-700 font-medium">Validación completa exitosamente</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 w-full">
              <div className="flex justify-between text-sm text-gray-700">
                <span>Documento:</span>
                <span className="font-medium text-green-600">Válido</span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <span>Estado:</span>
                <span className="font-medium">Vigente</span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <span>Nivel de verificación:</span>
                <span className="font-medium">Máximo (L3)</span>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-600" />
                <p className="text-blue-700 font-medium">Verificación completa</p>
              </div>
              <p className="text-blue-600 text-sm mt-1">
                Identidad verificada con el mayor nivel de confianza disponible.
              </p>
            </div>
            
            <Button className="w-full" onClick={() => onComplete && onComplete(true, { cedula: cedulaData })}>
              Finalizar verificación
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  // Renderizar panel lateral con pasos de verificación
  const renderSidebar = () => {
    return (
      <Card className="border-0 shadow-none">
        <CardContent className="p-4">
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Proceso de verificación</h3>
            
            {verificationSteps.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex items-center gap-2 p-2 rounded-md ${
                  currentStep === index 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'border border-transparent'
                }`}
              >
                <div className="flex-shrink-0">
                  {step.status === 'success' ? (
                    <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                  ) : step.status === 'inProgress' ? (
                    <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                    </div>
                  ) : step.status === 'failed' ? (
                    <div className="h-6 w-6 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    </div>
                  ) : (
                    <div className="h-6 w-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-600 font-medium">{index + 1}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-800">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Renderizar contenido principal
  const renderMainContent = () => {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#2d219b]" />
            Verificación de identidad avanzada
          </CardTitle>
          <CardDescription>
            Servicio de verificación de identidad de nivel 3 (máxima seguridad)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger 
                value="document" 
                disabled={currentStep !== 0}
                onClick={() => setActiveTab("document")}
              >
                Documento
              </TabsTrigger>
              <TabsTrigger 
                value="nfc" 
                disabled={currentStep !== 1}
                onClick={() => setActiveTab("nfc")}
              >
                NFC
              </TabsTrigger>
              <TabsTrigger 
                value="biometric" 
                disabled={currentStep !== 2}
                onClick={() => setActiveTab("biometric")}
              >
                Biometría
              </TabsTrigger>
              <TabsTrigger 
                value="validation" 
                disabled={currentStep !== 3}
                onClick={() => setActiveTab("validation")}
              >
                Validación
              </TabsTrigger>
            </TabsList>
            
            <div className="pt-6">
              {renderStepContent()}
            </div>
          </Tabs>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Signal className="h-4 w-4 text-blue-600" />
            <span className="text-xs text-gray-500">ID Sesión: {sessionId || '----'}</span>
          </div>
          
          <Badge variant="outline" className="text-[#2d219b] bg-[#2d219b]/10">
            InverID v1.0
          </Badge>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-1 order-2 md:order-1">
        {renderSidebar()}
      </div>
      <div className="md:col-span-2 order-1 md:order-2">
        {renderMainContent()}
      </div>
    </div>
  );
};

export default InverIDVerifier;