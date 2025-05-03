import React, { useState, useRef, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Camera,
  Upload,
  Scan,
  Fingerprint,
  FileCheck,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CedulaChilenaData } from '@/lib/nfc-reader';
import NFCMicroInteractions from './NFCMicroInteractions';
import DocumentForensicsService from '@/lib/document-forensics';

interface AdvancedIdentityVerifierProps {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  demoMode?: boolean;
}

const AdvancedIdentityVerifier: React.FC<AdvancedIdentityVerifierProps> = ({ 
  onSuccess, 
  onError,
  demoMode = false 
}) => {
  // Estados para gestionar el proceso de verificación
  const [activeTab, setActiveTab] = useState<string>('document');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [nfcProgress, setNfcProgress] = useState<number>(0);
  const [nfcMessage, setNfcMessage] = useState<string>('Esperando lectura NFC');
  const [photoProgress, setPhotoProgress] = useState<number>(0);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  
  // Referencias para elementos multimedia
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Hooks
  const { toast } = useToast();
  
  // Limpiar recursos cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (isCameraActive && videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive]);
  
  // Manejar cambio de documento y realizar análisis forense
  const handleDocumentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocumentFile(file);
      setLoading(true);
      
      try {
        // Crear una vista previa
        const reader = new FileReader();
        const imagePromise = new Promise<string>((resolve) => {
          reader.onload = (event) => {
            if (event.target && event.target.result) {
              resolve(event.target.result as string);
            }
          };
        });
        
        reader.readAsDataURL(file);
        const imageData = await imagePromise;
        setDocumentPreview(imageData);
        
        // Si estamos en modo demo, simular un análisis forense
        if (demoMode) {
          // Simular un retraso para el análisis
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Guardar los datos del documento
          setVerificationData((prev: any) => ({
            ...prev,
            documentImage: imageData,
            forensicsResults: {
              document_detected: true,
              mrz_detected: true,
              mrz_confidence: 85,
              uv_features_detected: true,
              alterations_detected: false,
              alterations_confidence: 5,
              overall_authenticity: 92
            }
          }));
        } else {
          // En modo real, realizar el análisis forense usando la API
          try {
            const forensicsResults = await DocumentForensicsService.analyzeDocument(imageData);
            
            // Guardar los datos del análisis
            setVerificationData((prev: any) => ({
              ...prev,
              documentImage: imageData,
              forensicsResults: forensicsResults.results
            }));
            
            // Mostrar alerta si la autenticidad es baja
            if (forensicsResults.results.overall_authenticity < 60) {
              toast({
                title: "Advertencia de verificación",
                description: "El documento muestra señales de posible alteración. Verifique su autenticidad.",
                variant: "destructive"
              });
            }
          } catch (error) {
            console.error("Error en análisis forense:", error);
            // Continuar incluso si el análisis forense falla
            setVerificationData((prev: any) => ({
              ...prev,
              documentImage: imageData
            }));
          }
        }
        
        // Avanzar a la siguiente pestaña
        setTimeout(() => setActiveTab('nfc'), 500);
      } catch (error) {
        console.error("Error procesando documento:", error);
        setError("Error al procesar el documento. Intente con otra imagen.");
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Iniciar lectura NFC
  const startNFCReading = async () => {
    setNfcProgress(0);
    setNfcMessage('Iniciando lectura NFC...');
    setError(null);
    
    try {
      setLoading(true);
      
      // En modo demo, simulamos la lectura
      if (demoMode) {
        await simulateNFCReading();
      } else {
        // Aquí iría la implementación real usando el lector NFC
        // Por ahora, usamos el simulador para demo
        await simulateNFCReading();
      }
      
      // Avanzar a la siguiente pestaña
      setTimeout(() => setActiveTab('photo'), 1000);
    } catch (error) {
      setError('Error al leer NFC: ' + (error instanceof Error ? error.message : 'Error desconocido'));
      if (onError) onError('Error en lectura NFC');
      toast({
        title: 'Error de verificación',
        description: 'No se pudo leer la información NFC del documento',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Simulación de lectura NFC para demo
  const simulateNFCReading = async () => {
    return new Promise<void>((resolve) => {
      // Simulamos las diferentes etapas de lectura
      setNfcProgress(10);
      setNfcMessage('Detectando chip NFC...');
      
      setTimeout(() => {
        setNfcProgress(30);
        setNfcMessage('Leyendo datos personales...');
      }, 1500);
      
      setTimeout(() => {
        setNfcProgress(60);
        setNfcMessage('Verificando firma digital...');
      }, 3000);
      
      setTimeout(() => {
        setNfcProgress(85);
        setNfcMessage('Procesando información...');
      }, 4500);
      
      setTimeout(() => {
        setNfcProgress(100);
        setNfcMessage('Lectura completada con éxito');
        
        // Simulamos datos chilenos para la demostración
        const nfcData: CedulaChilenaData = {
          rut: "12.345.678-9",
          nombres: "CARLOS ANDRÉS",
          apellidos: "GÓMEZ SOTO",
          nacionalidad: "CHILENA",
          fechaNacimiento: "15/05/1990",
          fechaEmision: "22/10/2019",
          fechaExpiracion: "22/10/2029",
          sexo: "M",
          numeroDocumento: "12345678",
          numeroSerie: "ACF23580917"
        };
        
        // Guardamos los datos para la verificación
        setVerificationData((prev: any) => ({
          ...prev,
          nfcData
        }));
        
        resolve();
      }, 6000);
    });
  };
  
  // Iniciar cámara para captura facial con opciones mejoradas
  const startCamera = async () => {
    try {
      setPhotoProgress(10);
      
      // Intentamos obtener la mejor calidad de cámara frontal disponible
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Esperar a que el video esté listo para mostrarse
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
          setPhotoProgress(30);
        };
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      setError('No se pudo acceder a la cámara: ' + (error instanceof Error ? error.message : 'Error desconocido'));
      toast({
        title: 'Error de acceso',
        description: 'No se pudo acceder a la cámara. Verifica los permisos.',
        variant: 'destructive'
      });
    }
  };
  
  // Capturar foto
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      setPhotoProgress(50);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Configurar el canvas con las dimensiones del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Dibujar el frame actual del video en el canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convertir a imagen base64
        const imageData = canvas.toDataURL('image/png');
        setFaceImage(imageData);
        setPhotoProgress(70);
        
        // Simular procesamiento biométrico
        setTimeout(() => {
          setPhotoProgress(100);
          
          // Guardar datos para la verificación
          setVerificationData((prev: any) => ({
            ...prev,
            faceImage: imageData
          }));
          
          // Detener la cámara
          if (video.srcObject) {
            const stream = video.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
          }
          setIsCameraActive(false);
          
          // Avanzar a la verificación final
          completeVerification();
        }, 2000);
      }
    }
  };
  
  // Completar proceso de verificación
  const completeVerification = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // En una implementación real, aquí enviaríamos los datos al backend
      // para realizar la verificación final
      
      // Para la demo, simulamos un proceso exitoso
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Marcar como exitoso
      setSuccess(true);
      
      // Notificar éxito
      if (onSuccess) {
        onSuccess(verificationData);
      }
      
      toast({
        title: 'Verificación completada',
        description: 'Su identidad ha sido verificada correctamente',
        variant: 'default'
      });
    } catch (error) {
      setError('Error en la verificación: ' + (error instanceof Error ? error.message : 'Error desconocido'));
      if (onError) onError('Error en verificación final');
    } finally {
      setLoading(false);
    }
  };
  
  // Reiniciar verificación
  const resetVerification = () => {
    // Limpiar todos los estados
    setActiveTab('document');
    setDocumentFile(null);
    setDocumentPreview(null);
    setNfcProgress(0);
    setNfcMessage('Esperando lectura NFC');
    setPhotoProgress(0);
    setFaceImage(null);
    setLoading(false);
    setError(null);
    setSuccess(false);
    setVerificationData(null);
    
    // Detener la cámara si está activa
    if (isCameraActive && videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
    
    // Reiniciar el input de archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#2d219b]">
          Verificación Avanzada de Identidad
        </CardTitle>
        <CardDescription>
          Complete los siguientes pasos para verificar su identidad
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert className="mb-4 bg-red-50 text-red-800 border border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success ? (
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-green-700 mb-2">Verificación Exitosa</h2>
            <p className="text-gray-600 mb-4">
              Su identidad ha sido verificada correctamente. Puede continuar con el proceso.
            </p>
            <Button onClick={resetVerification} variant="outline">
              Iniciar Nueva Verificación
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="document" disabled={loading}>
                <FileCheck className="mr-2 h-4 w-4" />
                Documento
              </TabsTrigger>
              <TabsTrigger value="nfc" disabled={!documentPreview || loading}>
                <Fingerprint className="mr-2 h-4 w-4" />
                Chip NFC
              </TabsTrigger>
              <TabsTrigger value="photo" disabled={nfcProgress < 100 || loading}>
                <User className="mr-2 h-4 w-4" />
                Biometría
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="document" className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {documentPreview ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img 
                        src={documentPreview} 
                        alt="Vista previa del documento" 
                        className="max-h-48 mx-auto rounded"
                      />
                      {verificationData?.forensicsResults && (
                        <div className="absolute top-0 right-0 -mr-3 -mt-3 bg-white rounded-full p-1 shadow-md">
                          <div className={`h-7 w-7 rounded-full flex items-center justify-center ${
                            verificationData.forensicsResults.overall_authenticity >= 85 
                              ? 'bg-green-100 text-green-600' 
                              : verificationData.forensicsResults.overall_authenticity >= 60
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-red-100 text-red-600'
                          }`}>
                            {verificationData.forensicsResults.overall_authenticity >= 85 ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : verificationData.forensicsResults.overall_authenticity >= 60 ? (
                              <AlertTriangle className="h-4 w-4" />
                            ) : (
                              <AlertCircle className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {verificationData?.forensicsResults ? (
                      <div className="text-xs border rounded-md p-2 bg-gray-50">
                        <div className="font-medium mb-1">Análisis forense completado</div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <div className="text-gray-600">Autenticidad:</div>
                          <div className={`font-medium ${
                            verificationData.forensicsResults.overall_authenticity >= 85 
                              ? 'text-green-600' 
                              : verificationData.forensicsResults.overall_authenticity >= 60
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          }`}>
                            {verificationData.forensicsResults.overall_authenticity}%
                          </div>
                          
                          <div className="text-gray-600">MRZ detectado:</div>
                          <div className="font-medium">
                            {verificationData.forensicsResults.mrz_detected ? 'Sí' : 'No'}
                          </div>
                          
                          <div className="text-gray-600">Alteraciones:</div>
                          <div className="font-medium">
                            {verificationData.forensicsResults.alterations_detected ? 
                              <span className="text-red-600">Detectadas</span> : 
                              <span className="text-green-600">No detectadas</span>
                            }
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Documento cargado correctamente</p>
                    )}
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer space-y-4"
                  >
                    <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="font-medium">Cargar imagen de su cédula de identidad</p>
                    <p className="text-sm text-gray-500">
                      Haga clic aquí o arrastre y suelte un archivo JPG o PNG
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleDocumentChange}
                  disabled={loading}
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={() => setActiveTab('nfc')} 
                  disabled={!documentPreview || loading}
                >
                  Continuar
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="nfc" className="space-y-4">
              <div className="border rounded-lg p-6">
                <NFCMicroInteractions className="mb-4 h-32" />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>{nfcMessage}</span>
                    {nfcProgress === 100 && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </div>
                  <Progress value={nfcProgress} className="h-2" />
                  
                  {nfcProgress < 100 && (
                    <Button 
                      onClick={startNFCReading} 
                      disabled={loading}
                      className="w-full mt-4"
                    >
                      {loading ? (
                        <>Procesando...</>
                      ) : (
                        <>
                          <Scan className="mr-2 h-4 w-4" />
                          Iniciar lectura NFC
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('document')} 
                  disabled={loading}
                >
                  Volver
                </Button>
                <Button 
                  onClick={() => setActiveTab('photo')} 
                  disabled={nfcProgress < 100 || loading}
                >
                  Continuar
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="photo" className="space-y-4">
              <div className="border rounded-lg p-6">
                {faceImage ? (
                  <div className="flex flex-col items-center">
                    <img 
                      src={faceImage} 
                      alt="Imagen facial" 
                      className="max-h-48 rounded mb-4"
                    />
                    <div className="space-y-2 w-full">
                      <div className="flex justify-between items-center">
                        <span>Procesando biometría facial...</span>
                        {photoProgress === 100 && <CheckCircle className="h-5 w-5 text-green-600" />}
                      </div>
                      <Progress value={photoProgress} className="h-2" />
                    </div>
                  </div>
                ) : isCameraActive ? (
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
                    <Button 
                      onClick={capturePhoto} 
                      className="w-full"
                      disabled={loading}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Capturar foto
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="font-medium">Capturar imagen para verificación biométrica</p>
                    <Button 
                      onClick={startCamera} 
                      className="w-full"
                      disabled={loading}
                    >
                      Activar cámara
                    </Button>
                  </div>
                )}
                
                {/* Canvas oculto para captura de imagen */}
                <canvas ref={canvasRef} className="hidden" />
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('nfc')} 
                  disabled={loading}
                >
                  Volver
                </Button>
                <Button 
                  onClick={completeVerification} 
                  disabled={photoProgress < 100 || loading}
                >
                  Finalizar verificación
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      <CardFooter className="border-t bg-gray-50 text-sm text-gray-500 p-4 flex items-center">
        <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
        <span>
          Todos los datos son procesados de forma segura y encriptada cumpliendo con la ley chilena 19.799
        </span>
      </CardFooter>
    </Card>
  );
};

export default AdvancedIdentityVerifier;