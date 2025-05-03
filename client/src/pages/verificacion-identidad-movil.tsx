import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Smartphone, CheckCircle, AlertCircle, Wallet, Camera } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  CedulaChilenaData, 
  NFCReadStatus, 
  NFCReaderType,
  checkNFCAvailability,
  readCedulaChilena,
  validarRut,
  formatearRut
} from '@/lib/nfc-reader';

const VerificacionIdentidadMovil: React.FC = () => {
  // Extraer el ID de sesión de la URL
  const [, params] = useLocation();
  const queryParams = new URLSearchParams(window.location.search);
  const sessionId = queryParams.get('session') || '';
  
  const [step, setStep] = useState<number>(0); // 0 = selección método, 1-4 = fotografía, 6-7 = NFC, 5 = completado
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Estados para NFC
  const [nfcAvailable, setNfcAvailable] = useState<boolean>(false);
  const [nfcStatus, setNfcStatus] = useState<NFCReadStatus>(NFCReadStatus.INACTIVE);
  const [nfcMessage, setNfcMessage] = useState<string>('');
  const [cedulaData, setCedulaData] = useState<CedulaChilenaData | null>(null);
  
  // Refs para la cámara
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Inicializar cámara
  const startCamera = async (facingMode: 'user' | 'environment' = 'user') => {
    try {
      if (videoRef.current) {
        // Primero detener cualquier stream activo
        if (videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
        
        // Iniciar nuevo stream
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode },
          audio: false 
        });
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      setError('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
    }
  };
  
  // Detener cámara
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };
  
  // Capturar foto
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        
        // Convertir a base64 para previsualización
        const photoData = canvas.toDataURL('image/jpeg');
        setCapturedImage(photoData);
        
        // En un caso real, aquí enviaríamos la imagen al servidor
        stopCamera();
        setStep(prev => prev + 1);
      }
    }
  };
  
  // Cambiar cámara entre frontal y trasera
  const toggleCamera = () => {
    const currentMode = videoRef.current?.srcObject 
      ? 'user' // Asumimos que empezamos con la cámara frontal
      : 'environment';
    
    startCamera(currentMode === 'user' ? 'environment' : 'user');
  };
  
  // Efecto para iniciar la cámara cuando el componente se monta
  useEffect(() => {
    if (step === 1) {
      startCamera('environment'); // Iniciar con cámara trasera para documento
    } else if (step === 3) {
      startCamera('user'); // Usar cámara frontal para selfie
    }
    
    return () => {
      stopCamera();
    };
  }, [step]);
  
  // Verificar disponibilidad de NFC al montar el componente
  useEffect(() => {
    async function checkNFC() {
      const { available } = await checkNFCAvailability();
      setNfcAvailable(available);
    }
    
    checkNFC();
  }, []);
  
  // Función para manejar la lectura NFC
  const handleNFCStatusChange = (status: NFCReadStatus, message?: string) => {
    setNfcStatus(status);
    if (message) {
      setNfcMessage(message);
    }
  };
  
  // Iniciar lectura con NFC
  const startNFCReading = async () => {
    setLoading(true);
    setCedulaData(null);
    setStep(6); // Paso de lectura NFC
    
    try {
      const data = await readCedulaChilena(handleNFCStatusChange);
      
      if (data) {
        setCedulaData(data);
        setStep(7); // Paso de confirmación NFC
      }
    } catch (error) {
      setError(`Error al leer cédula: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar envío de verificación
  const handleSubmitVerification = () => {
    setLoading(true);
    
    // Simular envío de datos al servidor
    setTimeout(() => {
      setLoading(false);
      setStep(5); // Completado
    }, 2000);
  };
  
  if (!sessionId) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se proporcionó un ID de sesión válido. Por favor, escanee nuevamente el código QR.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Verificación Móvil - NotaryPro</title>
      </Helmet>
      
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Verificación Móvil de Identidad</h1>
          <p className="text-gray-600">Sesión: {sessionId}</p>
        </div>
        
        {/* Indicador de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div 
            className="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>
        
        <Card>
          {/* Paso 0: Selección de método */}
          {step === 0 && (
            <>
              <CardHeader>
                <CardTitle>Método de verificación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Seleccione el método para verificar su identidad:</p>
                
                <div className="grid gap-4">
                  <Button 
                    onClick={() => setStep(1)}
                    className="flex justify-start items-center h-auto py-4 px-5"
                    variant="outline"
                  >
                    <Camera className="h-8 w-8 mr-4 text-blue-500" />
                    <div className="text-left">
                      <div className="font-semibold">Fotografía del documento</div>
                      <div className="text-sm text-gray-600">Capture fotos de su documento de identidad y selfie</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={startNFCReading}
                    className="flex justify-start items-center h-auto py-4 px-5"
                    variant="outline"
                    disabled={!nfcAvailable}
                  >
                    <Wallet className="h-8 w-8 mr-4 text-green-500" />
                    <div className="text-left">
                      <div className="font-semibold">Lectura NFC del chip</div>
                      <div className="text-sm text-gray-600">
                        {nfcAvailable 
                          ? "Acerque su cédula al lector NFC del dispositivo" 
                          : "Su dispositivo no tiene capacidad NFC o está desactivada"}
                      </div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => window.location.href = '/verificacion-identidad-readid'}
                    className="flex justify-start items-center h-auto py-4 px-5"
                    variant="default"
                  >
                    <Smartphone className="h-8 w-8 mr-4 text-white" />
                    <div className="text-left">
                      <div className="font-semibold">Sistema READID</div>
                      <div className="text-sm text-gray-100">Verificación avanzada con sistema READID (recomendado)</div>
                    </div>
                  </Button>
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </>
          )}
        
          {/* Paso 1: Capturar documento */}
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Fotografía del documento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Capture una foto clara de su documento de identidad con la cámara trasera.</p>
                
                <div className="bg-gray-200 rounded-lg overflow-hidden aspect-[3/2]">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={toggleCamera}
                  >
                    Cambiar cámara
                  </Button>
                  <Button onClick={capturePhoto}>
                    Capturar
                  </Button>
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </>
          )}
          
          {/* Paso 2: Confirmar documento */}
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Confirmar documento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Verifique que la imagen capturada sea clara y legible.</p>
                
                {capturedImage && (
                  <div className="border rounded-lg overflow-hidden mb-4">
                    <img 
                      src={capturedImage} 
                      alt="Documento capturado" 
                      className="w-full h-auto"
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setCapturedImage(null);
                      setStep(1);
                    }}
                  >
                    Volver a capturar
                  </Button>
                  <Button onClick={() => setStep(3)}>
                    Continuar
                  </Button>
                </div>
              </CardContent>
            </>
          )}
          
          {/* Paso 3: Capturar selfie */}
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Selfie con rostro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Capture una selfie de su rostro con la cámara frontal.</p>
                
                <div className="bg-gray-200 rounded-lg overflow-hidden aspect-square">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Marco de referencia */}
                  <div className="absolute inset-0 border-2 border-dashed border-blue-500 m-8 rounded-full"></div>
                </div>
                
                <canvas ref={canvasRef} className="hidden" />
                
                <Button 
                  onClick={capturePhoto}
                  className="w-full"
                >
                  Capturar selfie
                </Button>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </>
          )}
          
          {/* Paso 4: Confirmar selfie */}
          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>Confirmar selfie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Verifique que su rostro sea visible y claro en la imagen.</p>
                
                {capturedImage && (
                  <div className="border rounded-lg overflow-hidden mb-4">
                    <img 
                      src={capturedImage} 
                      alt="Selfie capturada" 
                      className="w-full h-auto"
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setCapturedImage(null);
                      setStep(3);
                    }}
                  >
                    Volver a capturar
                  </Button>
                  <Button onClick={handleSubmitVerification} disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar verificación'}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
          
          {/* Paso 5: Verificación completada */}
          {step === 5 && (
            <>
              <CardHeader>
                <CardTitle className="text-center">Verificación Completa</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                
                <h3 className="text-xl font-semibold mb-2">¡Verificación exitosa!</h3>
                <p className="text-gray-600 mb-6">
                  Su identidad ha sido verificada correctamente.
                </p>
                
                <p className="text-sm text-gray-500 mb-4">
                  Puede cerrar esta ventana y continuar en su dispositivo principal.
                </p>
                
                <Button 
                  onClick={() => window.close()} 
                  className="w-full"
                >
                  Cerrar
                </Button>
              </CardContent>
            </>
          )}
          
          {/* Paso 6: Lectura NFC en progreso */}
          {step === 6 && (
            <>
              <CardHeader>
                <CardTitle>Leyendo cédula con NFC</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  {nfcStatus === NFCReadStatus.WAITING || nfcStatus === NFCReadStatus.READING ? (
                    <>
                      <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                        <Wallet className="h-12 w-12 text-blue-500 animate-pulse" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {nfcStatus === NFCReadStatus.WAITING ? 'Esperando cédula' : 'Leyendo chip'}
                      </h3>
                      <p className="text-sm text-gray-600 text-center mb-4">
                        {nfcMessage || 'Acerque su cédula al lector NFC del dispositivo'}
                      </p>
                      
                      {/* Animación */}
                      <div className="relative w-48 h-48 mb-4">
                        <div className="absolute inset-0 border-4 border-dashed border-blue-300 rounded-full animate-spin-slow"></div>
                        <div className="absolute inset-8 border-4 border-blue-400 rounded-full"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-12 w-20 bg-white rounded-lg shadow-md transform translate-y-2">
                            <div className="w-full h-2 bg-gray-200 rounded-t-lg"></div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        No mueva la cédula hasta que se complete la lectura
                      </p>
                    </>
                  ) : nfcStatus === NFCReadStatus.ERROR ? (
                    <>
                      <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-4">
                        <AlertCircle className="h-12 w-12 text-red-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Error de lectura
                      </h3>
                      <p className="text-sm text-gray-600 text-center mb-4">
                        {nfcMessage || 'No se pudo leer la cédula correctamente'}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                        <Wallet className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Lector NFC
                      </h3>
                      <p className="text-sm text-gray-600 text-center">
                        Iniciando lectura...
                      </p>
                    </>
                  )}
                </div>
                
                <Button 
                  onClick={() => setStep(0)} 
                  variant="outline"
                  className="w-full"
                >
                  Cancelar y volver
                </Button>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </>
          )}
          
          {/* Paso 7: Confirmación de datos NFC */}
          {step === 7 && cedulaData && (
            <>
              <CardHeader>
                <CardTitle>Datos de la cédula</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <AlertTitle className="text-green-800">Lectura exitosa</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Se ha leído correctamente la información del chip NFC
                  </AlertDescription>
                </Alert>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">RUT</p>
                      <p className="text-base font-semibold">{formatearRut(cedulaData.rut)}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Nombre completo</p>
                      <p className="text-base font-semibold">{cedulaData.nombres} {cedulaData.apellidos}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Fecha de nacimiento</p>
                        <p className="text-base font-semibold">{cedulaData.fechaNacimiento}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Nacionalidad</p>
                        <p className="text-base font-semibold">{cedulaData.nacionalidad}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Fecha de emisión</p>
                        <p className="text-base font-semibold">{cedulaData.fechaEmision}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Fecha de expiración</p>
                        <p className="text-base font-semibold">{cedulaData.fechaExpiracion}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setCedulaData(null);
                      setStep(0);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSubmitVerification} 
                    disabled={loading}
                  >
                    {loading ? 'Enviando...' : 'Confirmar identidad'}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default VerificacionIdentidadMovil;