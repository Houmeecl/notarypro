import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { 
  Smartphone, CheckCircle, AlertCircle, 
  Camera, User, FileCheck, ThumbsUp, ThumbsDown,
  UserCheck, Copy, ChevronRight
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CedulaChilenaData, 
  NFCReadStatus
} from '@/lib/nfc-reader';
import Confetti from 'react-confetti';
import READIDVerifier from '@/components/identity/READIDVerifier';

// Componente para mostrar los datos extraídos de la cédula
const CedulaDataDisplay = ({ data }: { data: CedulaChilenaData | null }) => {
  if (!data) return null;
  
  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-1">
        <div className="text-gray-500">Nombre completo:</div>
        <div className="font-medium text-right">{data.nombres} {data.apellidos}</div>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <div className="text-gray-500">RUT:</div>
        <div className="font-medium text-right">{data.rut}</div>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <div className="text-gray-500">Fecha de nacimiento:</div>
        <div className="font-medium text-right">{data.fechaNacimiento}</div>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <div className="text-gray-500">Sexo:</div>
        <div className="font-medium text-right">{data.sexo}</div>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <div className="text-gray-500">Nacionalidad:</div>
        <div className="font-medium text-right">{data.nacionalidad}</div>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <div className="text-gray-500">Fecha emisión:</div>
        <div className="font-medium text-right">{data.fechaEmision}</div>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <div className="text-gray-500">Fecha vencimiento:</div>
        <div className="font-medium text-right">{data.fechaVencimiento}</div>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <div className="text-gray-500">N° Documento:</div>
        <div className="font-medium text-right">{data.numeroDocumento}</div>
      </div>
    </div>
  );
};

// Componente para comparación facial con cámara
const FaceComparison = ({ 
  cedulaData, 
  onComparisonComplete 
}: { 
  cedulaData: CedulaChilenaData | null,
  onComparisonComplete: (success: boolean) => void 
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Iniciar cámara
  const startCamera = useCallback(async () => {
    if (!videoRef.current) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      
      videoRef.current.srcObject = stream;
      setCameraActive(true);
      setShowInstructions(false);
    } catch (error) {
      console.error('Error accediendo a la cámara:', error);
    }
  }, []);
  
  // Capturar foto
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Establecer dimensiones del canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dibujar el video en el canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convertir a base64
    const imageData = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageData);
    
    // Detener la cámara
    const stream = video.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    video.srcObject = null;
    setCameraActive(false);
  }, []);
  
  // Limpiar recursos cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  if (!cedulaData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Datos no disponibles</AlertTitle>
        <AlertDescription>
          Primero debe leer los datos de la cédula con NFC.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      {showInstructions ? (
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <UserCheck className="h-10 w-10 text-blue-500 mx-auto mb-2" />
          <h3 className="font-medium mb-2">Comparación facial requerida</h3>
          <p className="text-sm text-gray-600 mb-4">
            Para completar la verificación, necesitamos comparar la foto del documento con la persona.
          </p>
          <Button onClick={startCamera} className="gap-2">
            <Camera className="h-4 w-4" /> Iniciar cámara
          </Button>
        </div>
      ) : null}
      
      {cameraActive ? (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden bg-gray-200 aspect-square max-w-xs mx-auto border-2 border-blue-300">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
            {/* Guía visual */}
            <div className="absolute inset-0 border-2 border-dashed border-primary border-opacity-60 m-8 rounded-full"></div>
          </div>
          
          <div className="flex justify-center">
            <Button onClick={capturePhoto} variant="default" className="gap-2">
              <Camera className="h-4 w-4" /> Capturar foto
            </Button>
          </div>
        </div>
      ) : null}
      
      {capturedImage ? (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-medium mb-2">Foto capturada</h3>
            <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square max-w-xs mx-auto border-2 border-green-300">
              <img 
                src={capturedImage} 
                alt="Foto capturada" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => {
                setCapturedImage(null);
                startCamera();
              }} 
              variant="outline"
              className="gap-2"
            >
              <Camera className="h-4 w-4" /> Nueva foto
            </Button>
            <Button 
              onClick={() => onComparisonComplete(true)} 
              variant="default"
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" /> Confirmar identidad
            </Button>
          </div>
        </div>
      ) : null}
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

// Componente principal
const VerificacionIdentidadReadid: React.FC = () => {
  // Estado para controlar el flujo de verificación
  const [step, setStep] = useState<'nfc' | 'comparison' | 'complete'>('nfc');
  const [cedulaData, setCedulaData] = useState<CedulaChilenaData | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [points, setPoints] = useState(0);

  // Extraer el ID de sesión de la URL
  const [, params] = useLocation();
  const queryParams = new URLSearchParams(window.location.search);
  const sessionId = queryParams.get('session') || '';
  
  // Manejar la lectura exitosa de NFC
  const handleNFCSuccess = (data: CedulaChilenaData) => {
    setCedulaData(data);
    setStep('comparison');
  };
  
  // Manejar el error en la lectura NFC
  const handleNFCError = (error: string) => {
    console.error('Error en lectura NFC:', error);
  };
  
  // Manejar la comparación facial
  const handleComparisonComplete = (success: boolean) => {
    if (success) {
      setVerificationSuccess(true);
      setShowConfetti(true);
      
      // Otorgar puntos adicionales por verificación completa
      const pointsEarned = 50; // Puntos adicionales por verificación facial
      setPoints(pointsEarned);
      
      // Registrar interacción (puntos adicionales por verificación facial)
      fetch('/api/micro-interactions/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: "facial_verification",
          points: pointsEarned,
          metadata: { description: "Verificación facial completada exitosamente" }
        })
      }).catch(err => console.error("Error al registrar interacción:", err));
      
      // Ocultar confeti después de 5 segundos
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    }
    
    setStep('complete');
  };
  
  return (
    <div className="container mx-auto px-4 py-6 relative">
      <Helmet>
        <title>READID - Verificación Avanzada</title>
      </Helmet>
      
      {/* Confeti para celebrar la verificación exitosa */}
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />}
      
      {step === 'nfc' && (
        <READIDVerifier 
          sessionId={sessionId}
          onSuccess={handleNFCSuccess}
          onError={handleNFCError}
        />
      )}
      
      {step === 'comparison' && (
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Comparación de identidad</h1>
            <p className="text-gray-600">Verificación facial adicional</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Verificar identidad</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="photo" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="data">Datos NFC</TabsTrigger>
                  <TabsTrigger value="photo">Capturar foto</TabsTrigger>
                </TabsList>
                <TabsContent value="data" className="pt-4">
                  <CedulaDataDisplay data={cedulaData} />
                </TabsContent>
                <TabsContent value="photo" className="pt-4">
                  <FaceComparison 
                    cedulaData={cedulaData} 
                    onComparisonComplete={handleComparisonComplete} 
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
      
      {step === 'complete' && (
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {verificationSuccess ? '¡Verificación Completa!' : 'Verificación Rechazada'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className={`w-20 h-20 ${verificationSuccess ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                {verificationSuccess ? (
                  <CheckCircle className="h-10 w-10 text-green-600" />
                ) : (
                  <AlertCircle className="h-10 w-10 text-red-600" />
                )}
              </div>
              
              <h3 className="text-xl font-semibold mb-2">
                {verificationSuccess ? '¡Verificación exitosa!' : 'No se pudo verificar la identidad'}
              </h3>
              
              {verificationSuccess && (
                <>
                  <p className="text-gray-600 mb-6">
                    La identidad ha sido verificada correctamente mediante NFC y comparación facial.
                  </p>
                  
                  <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6">
                    <p className="text-sm">
                      <span className="font-semibold">¡Felicidades!</span> Has obtenido {points} puntos adicionales por 
                      completar la verificación facial.
                    </p>
                  </div>
                </>
              )}
              
              {!verificationSuccess && (
                <p className="text-gray-600 mb-6">
                  La verificación facial no pudo ser completada. Por favor, intente nuevamente o 
                  utilice un método alternativo de verificación.
                </p>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => window.close()} 
                  variant="outline"
                >
                  Cerrar
                </Button>
                <Button 
                  onClick={() => {
                    setCedulaData(null);
                    setVerificationSuccess(false);
                    setStep('nfc');
                  }}
                >
                  Nueva verificación
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VerificacionIdentidadReadid;