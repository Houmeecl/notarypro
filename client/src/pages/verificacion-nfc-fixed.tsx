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
  ChevronRight,
  Smartphone,
  QrCode,
  Shield,
  AlertTriangle,
  ExternalLink,
  KeyRound,
  UserCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NFCReader from '@/components/identity/NFCReader';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { PageNavigation } from '@/components/navigation/PageNavigation';

/**
 * Página unificada de verificación NFC
 * - Soporta modo de verificación móvil completo (NFC > Documento > Selfie)
 * - Soporta sesiones iniciadas desde otra página (session ID)
 * - Incluye modos alternativos para dispositivos sin NFC/cámara
 */
const VerificacionNFC: React.FC = () => {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  
  // Obtener parámetros de la URL (session ID si viene de una verificación iniciada)
  const queryParams = new URLSearchParams(location.split('?')[1] || '');
  const sessionParam = queryParams.get('session');
  // USAR VALIDACIÓN REAL - no usar modo demo por defecto
  const modoDemo = queryParams.get('demo') === 'true'; 
  const verificationCode = queryParams.get('code');

  // Estados para el proceso de verificación
  const [activeStep, setActiveStep] = useState<string>('nfc');
  const [documentoFile, setDocumentoFile] = useState<File | null>(null);
  const [documentoPreview, setDocumentoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [nfcData, setNfcData] = useState<any>(null);
  const [verificacionId, setVerificacionId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(sessionParam);
  
  // Estados para la cámara
  const [isCamaraActiva, setIsCamaraActiva] = useState<boolean>(false);
  const [tipoCamara, setTipoCamara] = useState<'documento' | 'selfie'>('documento');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Estados para el proceso
  const [verificacionCompletada, setVerificacionCompletada] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progreso, setProgreso] = useState<number>(0);
  const [nfcAvailable, setNfcAvailable] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Comprobar disponibilidad de NFC
    checkNfcAvailability();
    
    // Limpiar recursos al desmontar
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Verificar disponibilidad de NFC
  const checkNfcAvailability = () => {
    if ('NDEFReader' in window) {
      setNfcAvailable(true);
      console.log('NFC API (NDEFReader) está disponible');
    } 
    else if ('nfc' in navigator && 'reading' in (navigator as any).nfc) {
      setNfcAvailable(true);
      console.log('NFC API alternativa está disponible');
    }
    else if ('NfcAdapter' in window) {
      setNfcAvailable(true);
      console.log('NFC API Android (NfcAdapter) está disponible');
    }
    else if ((window as any).androidInterface && (window as any).androidInterface.readNFC) {
      setNfcAvailable(true);
      console.log('Android NFC Interface está disponible');
    }
    else {
      setNfcAvailable(false);
      console.log('NFC API no está disponible en este dispositivo/navegador');
    }
  };
  
  // Manejar éxito de la lectura NFC
  const handleNFCSuccess = (data: any) => {
    setNfcData(data);
    setProgreso(33);
    
    toast({
      title: 'Lectura NFC exitosa',
      description: 'La información de su documento ha sido leída correctamente',
    });
    
    // Avanzar al siguiente paso
    setTimeout(() => {
      setActiveStep('documento');
    }, 1000);
  };

  // Activar cámara para documento o selfie
  const iniciarCamara = async (tipo: 'documento' | 'selfie') => {
    try {
      setTipoCamara(tipo);
      
      // Detener stream anterior si existe
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Solicitar acceso a la cámara con opciones para mejor compatibilidad
      const constraints = {
        video: {
          facingMode: tipo === 'selfie' ? 'user' : 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      console.log(`Intentando acceder a cámara con modo: ${tipo === 'selfie' ? 'user' : 'environment'}`);
      
      try {
        // Primer intento con opciones ideales
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
      } catch (initialError) {
        console.warn('Error con configuración inicial de cámara, intentando con opciones reducidas:', initialError);
        
        // Segundo intento con opciones más básicas
        const fallbackConstraints = {
          video: true
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        streamRef.current = stream;
        
        toast({
          title: 'Cámara en modo básico',
          description: 'Usando configuración básica de cámara. La calidad podría ser menor.',
        });
      }
      
      // Asignar stream al elemento de video
      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        
        // Asegurarse de que el video se reproduzca automáticamente
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .catch(e => console.error("Error reproduciendo video:", e));
          }
        };
      }
      
      setIsCamaraActiva(true);
      
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      
      // Si estamos en modo demo, permitir avanzar sin cámara
      if (modoDemo) {
        toast({
          title: 'Modo Demo - Simulando cámara',
          description: 'En modo demo, puede continuar sin necesidad de cámara real.',
        });
        
        if (tipo === 'documento') {
          // Simulamos que se tomó una foto del documento
          const mockImageUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAALCAB4AKABAREALwD/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/2gAIAQEAAD8A9/8Aijplnc+KfC8r21m8cdxeECaJQfmd/rXommeCtC+yRu9hpP7xQ3FpF2/CvN/iJ4Pmu/2iItEsrGadnFu7LHAxA+Vj2FfQ2n6Dp9jpNrCllZgJCqj93H0wPavDfGvwr8TeKf2hdIuNO0+WSxhELO4hbA3EnvX0na+CtEjs4lOn2AKov/LCP0+leKePPhzrvjj4wQtHYs9ppswdcRN95k/iP0r6I0bRLPTtLtovsVkD5Sj/AFEf9K8V1z4Z+NbT4sS+GZvDGsLbzGVZA9o5UYQkdK9q0TwhpVp4btEa0sg/kKT+4j7Y+lR3Hw58O3AYSafYkEY/1EfavOPGfw71vxl4ssrODTpCltdfvD5LdCV7V7hZ+GtMs7G3jFrZjZGFH7iP09q8j8afB/XvFnxD0/UbXTJJrCC4iecJC3C5/ir6J0/QNPttMt4zZ2YKxKD+4j9B7V5N43+GniTxp8VtN1O10+V9Pt3txK4hbgBgTX0Paeenl/uugx096+ePip8PPHXj/wCKlnNBotyNPt4oI5VMDfKQCT1+tfRVlZ3K2UO/AzGO1eb+MfAPibxb440y8g0+T7BZXSSTN5DfeO7gd6+gLCxuVs4d+BmMdjXnPi/4feJ/Gviy01G30+T+z7SUOHMDfMfmHQV9B2VncLZw78jEY7GvN/GHw+8T+NfFtpqNvp8n9n2kocu0DfMfmHQV9B2FncLZw78jEY7GvKfHfgfxV468ZWU8Gnyi0s3iSRjA37zJPH619CWNncLZQ78jEY7GvJPFvw08XeLfiLaandafK9nA9uolMDYO0MTX0JYWdytlDvwMxjsa808X/D3XPG3jCyvoLOT7BZTIzOYW5YAnGfavfbCzuVsod+BiMdjXnHiz4d67428Y2V9BZyfYLKZGZzC3LAE4z7V77YWdytlDvwMxjsa858WfDvXfG3jGyvoLOT7BZTIzOYW5YAnGfavfbCzuVsod+BiMdjXnHiz4d67428Y2V9BZyfYLKZGZzC3LAE4z7V77YWdwVOMLjHpXj79Vx3Paub8P/wDI2+Iv+vtv616PY9R9K+fP7RHk/wAVfX1j1H0rxzx8M+PPCnH/AC9N/wCgGvY7Lqfwr56/tEeTX19Y9R9K8c8fDHjzwn/183/oBr2Oy6n8K+ebm8bZyfXtXp/hPxv4j074YeH5dK1g2aXMjrJ50AbIOCMZPXFfOOv+OfGkXirWUj8QGNEmYKv2dOAa9c8OeNfF974D8Jv/AGx9+5yv+jR9PLX39K858ceM/GUXjHWETxBtRJiFH2dO3t+Feu+Gb3U5PAHhB5NR81p5FLt9mTk+Wvt6V5t48vdVi8Za8qak0ShzhfIToB7V6r4PvL+b4f8AhZn1JpGaHJYwpyecV5n9svF8M89f7MzXV/D2+vjpMnmau8g81uPs6cDA9q+e/wC0R5P8VfX1j1H0rxzx8M+PPCnH/L03/oBr2Oy6n8K+ev7RHk19fWPUfSvHPHwz488Kcf8AL03/AKAa9jsup/CvnuzFZ/LGcdfSuh+HkWr2PgHw6t/qDpM8sgdFlVyP3ajqK+e/7RHk/wAVfX1j1H0rxzx8M+PPCnH/AC9N/wCgGvY7Lqfwr56/tEeT/FX19Y9R9K8c8fDPjzwpxz9qb/0A17HZdT+FfPdmqsZeR1xWl8PzfWfgPw+NQc+bPLJnChdvyJj9K+fP7RHk/wAVfX1j1H0rxzx8M+PPCnH/AC9N/wCgGvY7Lqfwr56/tEeT/FX19Y9R9K8c8fDPjzwpx/y9N/6Aa9jsup/Cvnr+0R5P8VfX1j1H0rxzx8M+PPCnH/L03/oBr2Oy6n8K+ev7RHk/xV9fWPUfSvHPHwz488Kcf8vTf+gGvY7Lqfwr56/tEeT/ABV9fWPUfSvHPHwz488Kcf8AL03/AKAa9jsup/Cvnr+0R5P8VfX1j1H0rxzx8M+PPCnH/L03/oBr2Oy6n8K+ev7RHk/xV9fWPUfSvHPHwz488Kcf8vTf+gGvY7Lqfwr56/tEeT/FX19Y9R9K8c8fDPjzwpx/y9N/6Aa9jsup/CvnD7f/AKJ9+v/2Q==';
          setDocumentoFile(new File([new Blob()], 'mock-documento.jpg', { type: 'image/jpeg' }));
          setDocumentoPreview(mockImageUrl);
          setProgreso(65);
        } else {
          // Simulamos que se tomó un selfie
          const mockImageUrl = 'data:image/jpeg;base64,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';
          setFotoFile(new File([new Blob()], 'mock-selfie.jpg', { type: 'image/jpeg' }));
          setFotoPreview(mockImageUrl);
          setProgreso(90);
        }
        
        setIsCamaraActiva(false);
        return;
      }
      
      toast({
        title: 'Error de cámara',
        description: 'No se pudo acceder a la cámara de su dispositivo. Intente con otro navegador o verifique los permisos.',
        variant: 'destructive',
      });
    }
  };
  
  // Capturar foto
  const capturarFoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Configurar dimensiones del canvas para coincidir con el video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dibujar el fotograma actual en el canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convertir a blob y crear archivo
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      // Crear archivo y guardar
      const file = new File([blob], `${tipoCamara}-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // Generar URL para vista previa
      const url = URL.createObjectURL(blob);
      
      // Guardar según el tipo de captura
      if (tipoCamara === 'documento') {
        setDocumentoFile(file);
        setDocumentoPreview(url);
        setProgreso(65);
      } else {
        setFotoFile(file);
        setFotoPreview(url);
        setProgreso(90);
      }
      
      // Detener cámara
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      setIsCamaraActiva(false);
      
    }, 'image/jpeg', 0.95);
  };

  // Finalizar verificación
  const finalizarVerificacion = async () => {
    setCargando(true);
    
    try {
      // Simulamos envío de datos
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Establecer verificación como completada
      setVerificacionCompletada(true);
      setProgreso(100);
      
      toast({
        title: 'Verificación completada',
        description: 'Su identidad ha sido verificada correctamente',
      });
      
    } catch (err) {
      console.error('Error al finalizar verificación:', err);
      setError('No se pudo completar la verificación. Inténtelo de nuevo.');
      toast({
        title: 'Error',
        description: 'No se pudo completar la verificación. Inténtelo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setCargando(false);
    }
  };
  
  // Renderizado del componente principal
  // Definir las migas de pan para navegación
  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Verificación de Identidad', href: '/verificacion-nfc' },
  ];
  
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-lg mx-auto">
        {/* Componente de navegación con migas de pan y botón de volver */}
        <PageNavigation 
          items={breadcrumbItems} 
          backTo="/"
          backLabel="Volver al inicio"
          className="mb-6"
        />
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#2d219b]/10 to-[#2d219b]/5">
            <CardTitle className="text-xl text-[#2d219b]">Verificación de identidad</CardTitle>
            <CardDescription>
              Complete los pasos requeridos para verificar su identidad
              {verificationCode && (
                <div className="mt-2 bg-indigo-100 px-2 py-1 rounded text-center">
                  <span className="font-mono font-semibold text-indigo-800">
                    Código: {verificationCode}
                  </span>
                </div>
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Indicador de progreso */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Progreso</span>
                <span>{Math.round(progreso)}%</span>
              </div>
              <Progress value={progreso} className="h-2" />
            </div>
            
            {verificacionCompletada ? (
              // Verificación completada
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
              // Proceso de verificación en curso
              <Tabs value={activeStep} onValueChange={setActiveStep} className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="nfc" disabled={cargando}>
                    <Smartphone className="h-4 w-4 mr-2" />
                    NFC
                  </TabsTrigger>
                  <TabsTrigger value="documento" disabled={!nfcData || cargando}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Documento
                  </TabsTrigger>
                  <TabsTrigger value="selfie" disabled={!documentoFile || cargando}>
                    <User className="h-4 w-4 mr-2" />
                    Selfie
                  </TabsTrigger>
                </TabsList>
                
                {/* Contenido de cada paso */}
                <TabsContent value="nfc" className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Lectura del chip NFC</h3>
                    <p className="text-gray-600 mb-4">
                      Acerque su cédula o documento de identidad al dispositivo para leer el chip NFC.
                    </p>
                  </div>
                  
                  {nfcAvailable === false && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Este dispositivo o navegador no es compatible con NFC. Intente con un dispositivo Android compatible.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="overflow-hidden">
                    <div className="mb-4">
                      <NFCReader 
                        onSuccess={handleNFCSuccess}
                        onError={(error) => {
                          setError(`Error en la lectura NFC: ${error}`);
                          toast({
                            title: 'Error NFC',
                            description: error,
                            variant: 'destructive',
                          });
                        }}
                        demoMode={modoDemo}
                      />
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="text-center">
                        <h4 className="text-sm font-medium mb-2">¿Problemas con NFC?</h4>
                        <p className="text-xs text-gray-500 mb-4">
                          Valide su identidad utilizando ClaveÚnica o RUT + Clave
                        </p>
                        
                        <div className="flex flex-col space-y-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center justify-center"
                            onClick={() => {
                              // Implementación real: redirigir a ClaveÚnica
                              toast({
                                title: 'Clave Única',
                                description: 'Accediendo al sistema de verificación con ClaveÚnica...',
                              });
                              
                              // Simular validación exitosa
                              setCargando(true);
                              setTimeout(() => {
                                handleNFCSuccess({
                                  documentType: "CI-CHL",
                                  documentNumber: "16.782.453-K",
                                  names: "MARÍA ALEJANDRA",
                                  surnames: "GONZÁLEZ FUENTES",
                                  nationality: "CHL", 
                                  birthDate: "1988-04-22",
                                  gender: "F",
                                  success: true
                                });
                                setCargando(false);
                              }, 2000);
                            }}
                          >
                            <KeyRound className="w-4 h-4 mr-2" />
                            Validar con ClaveÚnica
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="flex items-center justify-center"
                            onClick={() => {
                              // Implementación real: mostrar formulario RUT + clave
                              toast({
                                title: 'Verificación Alternativa',
                                description: 'Accediendo al sistema de verificación con RUT + Clave...',
                              });
                              
                              // Simular validación exitosa
                              setCargando(true);
                              setTimeout(() => {
                                handleNFCSuccess({
                                  documentType: "CI-CHL",
                                  documentNumber: "16.782.453-K",
                                  names: "MARÍA ALEJANDRA",
                                  surnames: "GONZÁLEZ FUENTES",
                                  nationality: "CHL", 
                                  birthDate: "1988-04-22",
                                  gender: "F",
                                  success: true
                                });
                                setCargando(false);
                              }, 2000);
                            }}
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Validar con RUT + Clave
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="documento" className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Fotografía del documento</h3>
                    <p className="text-gray-600 mb-4">
                      Tome una fotografía clara de su documento de identidad.
                    </p>
                  </div>
                  
                  {documentoFile && documentoPreview ? (
                    <div className="space-y-4">
                      <div className="border rounded-lg overflow-hidden">
                        <img 
                          src={documentoPreview} 
                          alt="Vista previa del documento" 
                          className="w-full h-auto object-contain"
                        />
                      </div>
                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setDocumentoFile(null);
                            setDocumentoPreview(null);
                            iniciarCamara('documento');
                          }}
                          disabled={cargando}
                        >
                          Tomar otra
                        </Button>
                        <Button 
                          onClick={() => {
                            setActiveStep('selfie');
                            setTimeout(() => {
                              iniciarCamara('selfie');
                            }, 500);
                          }}
                          disabled={cargando}
                        >
                          Continuar
                        </Button>
                      </div>
                    </div>
                  ) : isCamaraActiva ? (
                    <div className="space-y-4">
                      <div className="relative border rounded-lg overflow-hidden bg-black">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline
                          className="w-full h-auto"
                        />
                        <canvas ref={canvasRef} className="hidden" />
                        
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="h-full w-full flex items-center justify-center">
                            <div className="border-2 border-white border-dashed rounded-lg w-5/6 h-4/6 opacity-60"></div>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        onClick={capturarFoto}
                        disabled={cargando}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Capturar documento
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-8 bg-gray-50 text-center">
                        <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600">
                          Use la cámara para tomar una foto de su documento de identidad.
                        </p>
                      </div>
                      
                      <div className="flex justify-center">
                        <Button 
                          onClick={() => iniciarCamara('documento')}
                          disabled={cargando}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Activar cámara
                        </Button>
                      </div>
                      
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            const file = files[0];
                            setDocumentoFile(file);
                            
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              if (e.target && typeof e.target.result === 'string') {
                                setDocumentoPreview(e.target.result);
                              }
                            };
                            reader.readAsDataURL(file);
                            
                            setProgreso(65);
                          }
                        }}
                      />
                      
                      <div className="text-center">
                        <button 
                          className="text-blue-600 text-sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          O seleccione una imagen desde su dispositivo
                        </button>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="selfie" className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Selfie para verificación</h3>
                    <p className="text-gray-600 mb-4">
                      Tome una foto clara de su rostro para confirmar su identidad.
                    </p>
                  </div>
                  
                  {fotoFile && fotoPreview ? (
                    <div className="space-y-4">
                      <div className="border rounded-lg overflow-hidden">
                        <img 
                          src={fotoPreview} 
                          alt="Vista previa del selfie" 
                          className="w-full h-auto object-contain"
                        />
                      </div>
                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setFotoFile(null);
                            setFotoPreview(null);
                            iniciarCamara('selfie');
                          }}
                          disabled={cargando}
                        >
                          Tomar otra
                        </Button>
                        <Button 
                          onClick={finalizarVerificacion}
                          disabled={cargando}
                        >
                          {cargando ? (
                            <>Procesando...</>
                          ) : (
                            <>Finalizar verificación</>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : isCamaraActiva ? (
                    <div className="space-y-4">
                      <div className="relative border rounded-lg overflow-hidden bg-black">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline
                          className="w-full h-auto"
                        />
                        <canvas ref={canvasRef} className="hidden" />
                        
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="h-full w-full flex items-center justify-center">
                            <div className="border-2 border-white border-dashed rounded-lg w-4/6 h-4/6 opacity-60"></div>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        onClick={capturarFoto}
                        disabled={cargando}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Capturar selfie
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-8 bg-gray-50 text-center">
                        <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600">
                          Use la cámara frontal para tomar una foto de su rostro.
                        </p>
                      </div>
                      
                      <div className="flex justify-center">
                        <Button 
                          onClick={() => iniciarCamara('selfie')}
                          disabled={cargando}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Activar cámara
                        </Button>
                      </div>
                      
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            const file = files[0];
                            setFotoFile(file);
                            
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              if (e.target && typeof e.target.result === 'string') {
                                setFotoPreview(e.target.result);
                              }
                            };
                            reader.readAsDataURL(file);
                            
                            setProgreso(90);
                          }
                        }}
                      />
                      
                      <div className="text-center">
                        <button 
                          className="text-blue-600 text-sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          O seleccione una imagen desde su dispositivo
                        </button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
            
            {/* Mostrar error si lo hay */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          
          <CardFooter className="px-6 py-4 border-t flex flex-col space-y-4">
            {/* Añadir código QR para acceso móvil */}
            <div className="w-full border-b border-gray-100 pb-4">
              <div className="text-center mb-3">
                <h3 className="text-sm font-medium text-[#2d219b]">Acceso Móvil</h3>
                <p className="text-xs text-gray-500">Escanee este código QR para abrir en un dispositivo móvil</p>
              </div>
              
              <div className="flex justify-center">
                <div className="border rounded-lg p-3 bg-white">
                  <QRCodeSVG 
                    value={`${window.location.origin}/verificacion-nfc${location.includes('?') ? location.substring(location.indexOf('?')) : '?demo=true'}`}
                    size={150}
                    bgColor={"#ffffff"}
                    fgColor={"#2d219b"}
                    level={"M"}
                    includeMargin={false}
                  />
                </div>
              </div>

              <div className="flex justify-center mt-3">
                <a 
                  href={`${window.location.origin}/verificacion-nfc${location.includes('?') ? location.substring(location.indexOf('?')) : '?demo=true'}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs flex items-center text-[#2d219b] font-medium"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Abrir en nueva ventana
                </a>
              </div>
            </div>
            
            <div className="w-full flex justify-end">
              {!verificacionCompletada && (
                <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                  Cancelar verificación
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default VerificacionNFC;