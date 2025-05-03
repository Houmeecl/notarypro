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
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const VerificacionMovil: React.FC = () => {
  // Extraer sessionId de la URL
  const [location] = useLocation();
  const queryParams = new URLSearchParams(window.location.search);
  const sessionId = queryParams.get('session');

  // Estados para el proceso de verificación
  const [activeStep, setActiveStep] = useState<string>('documento');
  const [documentoFile, setDocumentoFile] = useState<File | null>(null);
  const [documentoPreview, setDocumentoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  
  // Estados para la cámara
  const [isCamaraActiva, setIsCamaraActiva] = useState<boolean>(false);
  const [tipoCamara, setTipoCamara] = useState<'documento' | 'selfie'>('documento');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Estados para el proceso
  const [verificacionCompletada, setVerificacionCompletada] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progreso, setProgreso] = useState<number>(0);
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Efectos para limpiar recursos de cámara
  useEffect(() => {
    return () => {
      if (isCamaraActiva && videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCamaraActiva]);
  
  // Inicializar
  useEffect(() => {
    if (!sessionId) {
      setError("No se encontró un ID de sesión válido. Por favor, escanee el código QR nuevamente.");
    }
  }, [sessionId]);
  
  // Manejar carga de documento desde archivo
  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocumentoFile(file);
      
      // Mostrar vista previa
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setDocumentoPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Iniciar la cámara
  const iniciarCamara = async (tipo: 'documento' | 'selfie') => {
    try {
      // Asegurarse de detener cualquier stream anterior
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      
      setTipoCamara(tipo);
      setIsCamaraActiva(false); // Reiniciar estado
      
      // Configurar opciones de cámara según el tipo
      const opciones = {
        video: { 
          facingMode: tipo === 'documento' ? 'environment' : 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      console.log('Solicitando acceso a la cámara...');
      const stream = await navigator.mediaDevices.getUserMedia(opciones);
      console.log('Acceso a cámara concedido', stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded, playing...');
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                console.log('Reproducción de video iniciada');
                setIsCamaraActiva(true);
              })
              .catch(err => {
                console.error('Error al reproducir video:', err);
              });
          }
        };
      } else {
        console.error('Referencia de video no disponible');
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      setError('No se pudo acceder a la cámara. Verifique los permisos de su navegador.');
      toast({
        title: 'Error de cámara',
        description: 'No se pudo acceder a la cámara de su dispositivo. ' + (error instanceof Error ? error.message : ''),
        variant: 'destructive',
      });
    }
  };
  
  // Capturar imagen
  const capturarImagen = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Configurar el canvas con las dimensiones del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Dibujar la imagen actual del video en el canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convertir a imagen base64
        const imageData = canvas.toDataURL('image/png');
        
        // Actualizar el estado correspondiente
        if (tipoCamara === 'documento') {
          setDocumentoPreview(imageData);
          
          // Convertir a archivo
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], "documento.png", { type: "image/png" });
              setDocumentoFile(file);
            }
          });
        } else {
          setFotoPreview(imageData);
          
          // Convertir a archivo
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], "selfie.png", { type: "image/png" });
              setFotoFile(file);
            }
          });
        }
        
        // Detener la cámara
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
        setIsCamaraActiva(false);
        
        // Si estamos en el paso de documento, avanzar al siguiente paso
        if (tipoCamara === 'documento') {
          setTimeout(() => setActiveStep('selfie'), 500);
        }
      }
    }
  };
  
  // Enviar verificación al servidor
  const enviarVerificacion = async () => {
    if (!sessionId || !documentoPreview || !fotoPreview) {
      setError("Falta información requerida para completar la verificación");
      return;
    }
    
    setCargando(true);
    setProgreso(0);
    setError(null);
    
    try {
      // Simulamos progreso
      const intervalId = setInterval(() => {
        setProgreso(prev => {
          if (prev >= 90) {
            clearInterval(intervalId);
            return 90;
          }
          return prev + 10;
        });
      }, 500);
      
      // Crear FormData para enviar las imágenes
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      
      if (documentoFile) {
        formData.append('documentoImage', documentoFile);
      } else if (documentoPreview) {
        // Convertir base64 a blob
        const blob = await fetch(documentoPreview).then(r => r.blob());
        formData.append('documentoImage', blob, 'documento.png');
      }
      
      if (fotoFile) {
        formData.append('selfieImage', fotoFile);
      } else if (fotoPreview) {
        // Convertir base64 a blob
        const blob = await fetch(fotoPreview).then(r => r.blob());
        formData.append('selfieImage', blob, 'selfie.png');
      }
      
      // Enviar al servidor
      // En una implementación real, esta llamada enviaría los datos al backend
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular retraso de red
      
      /*
      // Esto sería en una implementación real
      const response = await apiRequest(
        "POST", 
        "/api/identity-api/verify-mobile", 
        formData,
        { isFormData: true }
      );
      
      if (!response.ok) {
        throw new Error("Error en la verificación");
      }
      */
      
      // Completar progreso
      clearInterval(intervalId);
      setProgreso(100);
      
      // Marcar como completada
      setTimeout(() => {
        setVerificacionCompletada(true);
        toast({
          title: 'Verificación completada',
          description: 'Su identidad ha sido verificada con éxito',
          variant: 'default',
        });
      }, 1000);
      
    } catch (error) {
      console.error("Error en verificación:", error);
      setError("No se pudo completar la verificación. Intente nuevamente.");
      toast({
        title: 'Error de verificación',
        description: 'No se pudo completar el proceso de verificación',
        variant: 'destructive',
      });
    } finally {
      setCargando(false);
    }
  };
  
  // Reiniciar el proceso
  const reiniciarProceso = () => {
    // Reiniciar todos los estados
    setActiveStep('documento');
    setDocumentoFile(null);
    setDocumentoPreview(null);
    setFotoFile(null);
    setFotoPreview(null);
    setIsCamaraActiva(false);
    setVerificacionCompletada(false);
    setCargando(false);
    setError(null);
    setProgreso(0);
    
    // Reiniciar input de archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#2d219b]">
            Verificación de Identidad
          </CardTitle>
          <CardDescription>
            Siga los pasos para verificar su identidad
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert className="mb-4 bg-red-50 text-red-800 border border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {verificacionCompletada ? (
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-green-700 mb-2">¡Verificación Exitosa!</h2>
              <p className="text-gray-600 mb-6">
                Su identidad ha sido verificada correctamente. Puede cerrar esta ventana y continuar el proceso en su dispositivo original.
              </p>
              <Button 
                onClick={reiniciarProceso} 
                variant="outline"
                className="mx-auto"
              >
                Iniciar Nueva Verificación
              </Button>
            </div>
          ) : (
            <Tabs value={activeStep} onValueChange={setActiveStep} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="documento" disabled={cargando}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Documento
                </TabsTrigger>
                <TabsTrigger value="selfie" disabled={!documentoPreview || cargando}>
                  <User className="mr-2 h-4 w-4" />
                  Selfie
                </TabsTrigger>
              </TabsList>
              
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
                        Centre su documento en el recuadro
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

export default VerificacionMovil;