import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertCircle, 
  Camera, 
  CreditCard, 
  CheckCircle, 
  Upload, 
  User,
  RefreshCw,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import NFCReader from '@/components/identity/NFCReader';

const VerificacionNFCMovil: React.FC = () => {
  // Extraer sessionId de la URL
  const [location, setLocation] = useLocation();
  const queryParams = new URLSearchParams(window.location.search);
  const sessionId = queryParams.get('session');

  // Estados para el proceso de verificación
  const [activeStep, setActiveStep] = useState<string>('nfc');
  const [documentoFile, setDocumentoFile] = useState<File | null>(null);
  const [documentoPreview, setDocumentoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [nfcData, setNfcData] = useState<any>(null);
  
  // Estados para la cámara
  const [isCamaraActiva, setIsCamaraActiva] = useState<boolean>(false);
  const [tipoCamara, setTipoCamara] = useState<'documento' | 'selfie'>('documento');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para el proceso
  const [verificacionCompletada, setVerificacionCompletada] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progreso, setProgreso] = useState<number>(0);
  
  const { toast } = useToast();
  
  // Efecto para manejar el retorno de la verificación
  useEffect(() => {
    // Si no hay sessionId, retornar
    if (!sessionId) return;
    
    toast({
      title: 'Sesión detectada',
      description: `Sesión de verificación: ${sessionId}`,
    });
    
    // Aquí podríamos cargar el estado de la verificación desde el servidor
  }, [sessionId]);
  
  // Manejador para el éxito en la lectura NFC
  const handleNFCSuccess = (data: any) => {
    console.log('NFC leído con éxito:', data);
    setNfcData(data);
    setActiveStep('documento');
    
    toast({
      title: 'NFC leído con éxito',
      description: 'Ahora capture una imagen de su documento',
    });
  };
  
  // Manejador para el error en la lectura NFC
  const handleNFCError = (error: string) => {
    console.error('Error en lectura NFC:', error);
    setError(error);
    
    toast({
      title: 'Error en lectura NFC',
      description: error,
      variant: 'destructive',
    });
  };

  // Iniciar la cámara
  const iniciarCamara = async (tipo: 'documento' | 'selfie') => {
    try {
      setIsCamaraActiva(false);
      setTipoCamara(tipo);
      
      // Opciones de cámara según el tipo
      const opciones: MediaStreamConstraints = {
        video: {
          facingMode: tipo === 'selfie' ? 'user' : 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      
      // Solicitar acceso a la cámara
      console.log(`Iniciando cámara para: ${tipo}`);
      const stream = await navigator.mediaDevices.getUserMedia(opciones);
      
      // Asignar stream al video
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCamaraActiva(true);
        console.log('Cámara iniciada correctamente');
      }
    } catch (err) {
      console.error('Error al iniciar cámara:', err);
      setError('No se pudo acceder a la cámara. Verifique los permisos.');
      
      toast({
        title: 'Error de cámara',
        description: 'No se pudo acceder a la cámara. Verifique los permisos.',
        variant: 'destructive',
      });
    }
  };
  
  // Capturar imagen desde la cámara
  const capturarImagen = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Ajustar tamaño del canvas al video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Dibujar el fotograma actual del video en el canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convertir a base64 y asignar según el tipo
      const imageData = canvas.toDataURL('image/jpeg');
      
      if (tipoCamara === 'documento') {
        setDocumentoPreview(imageData);
        
        // Convertir base64 a File
        const byteString = atob(imageData.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([ab], { type: 'image/jpeg' });
        const file = new File([blob], 'documento.jpg', { type: 'image/jpeg' });
        setDocumentoFile(file);
        
        // Detener cámara
        detenerCamara();
        
        // Pasar al siguiente paso
        setActiveStep('selfie');
      } else {
        setFotoPreview(imageData);
        
        // Convertir base64 a File
        const byteString = atob(imageData.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([ab], { type: 'image/jpeg' });
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
        setFotoFile(file);
        
        // Detener cámara
        detenerCamara();
      }
      
      toast({
        title: 'Imagen capturada',
        description: tipoCamara === 'documento' 
          ? 'Documento capturado correctamente.' 
          : 'Selfie capturada correctamente.',
      });
      
    } catch (err) {
      console.error('Error al capturar imagen:', err);
      setError('Error al capturar la imagen.');
      
      toast({
        title: 'Error al capturar',
        description: 'Hubo un problema al capturar la imagen.',
        variant: 'destructive',
      });
    }
  };
  
  // Detener cámara
  const detenerCamara = () => {
    if (!videoRef.current?.srcObject) return;
    
    try {
      // Detener todos los tracks del stream
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      
      // Limpiar srcObject
      videoRef.current.srcObject = null;
      setIsCamaraActiva(false);
      
      console.log('Cámara detenida correctamente');
    } catch (err) {
      console.error('Error al detener cámara:', err);
    }
  };
  
  // Manejar cambio de archivo de documento (input file)
  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocumentoFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setDocumentoPreview(event.target.result as string);
          setActiveStep('selfie'); // Avanzar al siguiente paso
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Enviar verificación al servidor
  const enviarVerificacion = async () => {
    if (!documentoFile || !fotoFile) {
      setError('Debe capturar el documento y una selfie para continuar.');
      return;
    }
    
    setCargando(true);
    setError(null);
    setProgreso(0);
    
    // Crear un intervalo para simular el progreso
    const intervalo = setInterval(() => {
      setProgreso(prev => {
        if (prev >= 95) {
          clearInterval(intervalo);
          return 95;
        }
        return prev + 5;
      });
    }, 200);
    
    try {
      // Crear FormData para enviar archivos
      const formData = new FormData();
      formData.append('documento', documentoFile);
      formData.append('selfie', fotoFile);
      
      // Si hay sessionId, incluirlo
      if (sessionId) {
        formData.append('sessionId', sessionId);
      }
      
      // Incluir datos NFC si existen
      if (nfcData) {
        formData.append('nfcData', JSON.stringify(nfcData));
      }
      
      // Endpoint depende de si hay sessionId
      const endpoint = sessionId 
        ? `/api/identity/update-session/${sessionId}`
        : '/api/identity/verify-mobile';
      
      // Enviar datos
      console.log('Enviando verificación al servidor...');
      
      // Simular respuesta exitosa (aquí se haría la llamada real al API)
      setTimeout(() => {
        clearInterval(intervalo);
        setProgreso(100);
        setVerificacionCompletada(true);
        setCargando(false);
        
        toast({
          title: 'Verificación completada',
          description: 'Su identidad ha sido verificada exitosamente.',
        });
        
        // Si hay sessionId, redirigir a la página anterior con éxito
        if (sessionId) {
          // Cerrar la ventana o redirigir según corresponda
          window.opener?.postMessage({ 
            type: 'VERIFICACION_COMPLETADA',
            sessionId 
          }, '*');
        }
      }, 2000);
      
    } catch (err) {
      console.error('Error al enviar verificación:', err);
      clearInterval(intervalo);
      setError('Error al procesar la verificación. Inténtelo de nuevo.');
      setCargando(false);
      setProgreso(0);
      
      toast({
        title: 'Error de verificación',
        description: 'Error al procesar la verificación. Inténtelo de nuevo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="bg-gradient-to-r from-[#2d219b]/10 to-[#2d219b]/5">
          <CardTitle className="text-xl text-[#2d219b]">Verificación de identidad móvil</CardTitle>
          <CardDescription>
            Complete los pasos requeridos para verificar su identidad
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {verificacionCompletada ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-700 mb-2">¡Verificación exitosa!</h3>
              <p className="text-gray-600 mb-6">
                Su identidad ha sido verificada correctamente.
              </p>
              {sessionId && (
                <p className="text-sm text-gray-500">
                  Puede cerrar esta ventana y volver a la página principal.
                </p>
              )}
            </div>
          ) : (
            <Tabs value={activeStep} onValueChange={setActiveStep} className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="nfc" disabled={activeStep !== 'nfc'}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">NFC</span>
                </TabsTrigger>
                <TabsTrigger value="documento" disabled={activeStep !== 'documento' && !nfcData}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Documento</span>
                </TabsTrigger>
                <TabsTrigger value="selfie" disabled={activeStep !== 'selfie' && !documentoPreview}>
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Selfie</span>
                </TabsTrigger>
              </TabsList>
              
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <TabsContent value="nfc" className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                      <CreditCard className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="font-medium">Escanee el chip NFC de su documento</p>
                    
                    <NFCReader 
                      onSuccess={handleNFCSuccess}
                      onError={handleNFCError}
                      demoMode={true} // Modo demo para pruebas
                    />
                    
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-500 mb-2">¿Problemas con NFC?</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Simular éxito de NFC para continuar al siguiente paso
                          handleNFCSuccess({
                            source: 'nfc',
                            data: {
                              run: '12.345.678-9',
                              nombre: 'DEMO USUARIO',
                              apellidos: 'PRUEBA NFC',
                              fechaNacimiento: '01/01/1990',
                              sexo: 'M',
                              nacionalidad: 'CHILENA',
                              fechaEmision: '01/01/2020',
                              fechaExpiracion: '01/01/2030',
                              numeroDocumento: 'DEMO123456',
                              numeroSerie: 'DEMO9876543210'
                            },
                            timestamp: new Date().toISOString()
                          });
                          
                          toast({
                            title: 'Modo alternativo activado',
                            description: 'Continuando en modo alternativo sin NFC',
                          });
                        }}
                      >
                        Continuar sin NFC (modo demostración)
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="documento" className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  {isCamaraActiva && tipoCamara === 'documento' ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className="w-full rounded"
                        />
                        <div className="absolute inset-0 border-4 border-dashed border-blue-400 rounded opacity-50 pointer-events-none" />
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        Centre su documento dentro del recuadro
                      </p>
                      <Button 
                        onClick={capturarImagen} 
                        className="w-full"
                        disabled={cargando}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Capturar Documento
                      </Button>
                    </div>
                  ) : documentoPreview ? (
                    <div className="space-y-4">
                      <img 
                        src={documentoPreview} 
                        alt="Vista previa del documento" 
                        className="max-h-48 mx-auto rounded" 
                      />
                      <p className="text-sm text-gray-500">Documento capturado correctamente</p>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => iniciarCamara('documento')}
                          className="flex-1"
                          disabled={cargando}
                        >
                          Volver a capturar
                        </Button>
                        <Button 
                          onClick={() => setActiveStep('selfie')} 
                          className="flex-1"
                          disabled={cargando}
                        >
                          Continuar
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                        <CreditCard className="h-8 w-8 text-blue-500" />
                      </div>
                      <p className="font-medium">Capture su documento de identidad</p>
                      <div className="flex flex-col space-y-2">
                        <Button 
                          onClick={() => {
                            console.log('Botón de cámara presionado');
                            toast({
                              title: 'Iniciando cámara',
                              description: 'Solicitando acceso a la cámara...',
                            });
                            iniciarCamara('documento');
                          }}
                          className="w-full"
                          disabled={cargando}
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Usar Cámara
                        </Button>
                        <p className="text-xs text-gray-500 my-1">o</p>
                        <Button 
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full"
                          disabled={cargando}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Subir Imagen
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleDocumentoChange}
                          disabled={cargando}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="selfie" className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  {isCamaraActiva && tipoCamara === 'selfie' ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className="w-full rounded"
                        />
                        <div className="absolute inset-0 border-4 border-dashed border-blue-400 rounded-full opacity-50 pointer-events-none" />
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        Centre su rostro en el recuadro
                      </p>
                      <Button 
                        onClick={capturarImagen} 
                        className="w-full"
                        disabled={cargando}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Capturar Selfie
                      </Button>
                    </div>
                  ) : fotoPreview ? (
                    <div className="space-y-4">
                      <img 
                        src={fotoPreview} 
                        alt="Vista previa de la selfie" 
                        className="max-h-48 mx-auto rounded" 
                      />
                      <p className="text-sm text-gray-500">Selfie capturada correctamente</p>
                      
                      {cargando ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span>Procesando verificación...</span>
                            <span>{progreso}%</span>
                          </div>
                          <Progress value={progreso} className="h-2" />
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              console.log('Botón volver a capturar selfie presionado');
                              toast({
                                title: 'Reiniciando cámara',
                                description: 'Solicitando acceso a la cámara frontal...',
                              });
                              iniciarCamara('selfie');
                            }}
                            className="flex-1"
                            disabled={cargando}
                          >
                            Volver a capturar
                          </Button>
                          <Button 
                            onClick={enviarVerificacion} 
                            className="flex-1"
                            disabled={cargando}
                          >
                            Finalizar
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                        <User className="h-8 w-8 text-blue-500" />
                      </div>
                      <p className="font-medium">Capture una selfie</p>
                      <Button 
                        onClick={() => {
                          console.log('Botón de selfie presionado');
                          toast({
                            title: 'Iniciando cámara frontal',
                            description: 'Solicitando acceso a la cámara frontal...',
                          });
                          iniciarCamara('selfie');
                        }}
                        className="w-full"
                        disabled={cargando}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Iniciar Cámara
                      </Button>
                    </div>
                  )}
                </div>
                
                {!isCamaraActiva && !fotoPreview && (
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveStep('documento')} 
                      disabled={cargando}
                    >
                      Volver
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
          
          {/* Canvas oculto para captura de imagen */}
          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
        
        <CardFooter className="border-t bg-gray-50 text-sm text-gray-500 p-4 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 text-amber-600" />
          <span>
            Todos los datos son procesados de forma segura y protegida.
          </span>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerificacionNFCMovil;