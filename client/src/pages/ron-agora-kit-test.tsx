/**
 * Componente de prueba para integración de Agora React UI Kit en RON
 * 
 * Este componente implementa una versión alternativa del cliente RON
 * usando la biblioteca agora-react-uikit para simplificar la interfaz
 * de videollamadas y añadir funcionalidades de verificación.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Info, 
  AlertCircle,
  Camera,
  Shield,
  Save,
  FileCheck,
  Download,
  Video
} from 'lucide-react';
import AgoraUIKit from 'agora-react-uikit';
import 'agora-react-uikit/dist/index.css';
import ForcedModeNotification from '@/components/ron/ForcedModeNotification';

// Componente de verificación de identidad para RON
const IdentityVerification = ({ 
  onVerified, 
  userType = 'client' 
}: { 
  onVerified: (data: any) => void,
  userType?: 'client' | 'certifier'
}) => {
  const [step, setStep] = useState<number>(1);
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [documentData, setDocumentData] = useState({
    documentType: 'Cédula de Identidad',
    documentNumber: '',
    fullName: '',
    expiryDate: '',
  });
  
  // Capturar imagen del documento
  const captureDocument = () => {
    // En una implementación real, aquí usaríamos la cámara para capturar
    // Para este demo, usamos un placeholder
    setDocumentImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    setDocumentData({
      documentType: 'Cédula de Identidad',
      documentNumber: '12.345.678-9',
      fullName: userType === 'client' ? 'Cliente Demo' : 'Certificador Demo',
      expiryDate: '2028-01-01',
    });
    setStep(2);
  };
  
  // Capturar selfie
  const captureFace = () => {
    // En una implementación real, aquí usaríamos la cámara para capturar
    // Para este demo, usamos un placeholder
    setFaceImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    setStep(3);
  };
  
  // Completar verificación
  const completeVerification = () => {
    const verificationData = {
      documentType: documentData.documentType,
      documentNumber: documentData.documentNumber,
      fullName: documentData.fullName,
      expiryDate: documentData.expiryDate,
      documentImage: documentImage,
      faceImage: faceImage,
      verificationTime: new Date().toISOString(),
      verificationResult: 'success',
      score: 0.95,
    };
    
    onVerified(verificationData);
  };
  
  // Renderizar paso actual
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center space-y-4">
            <div className="bg-indigo-50 dark:bg-indigo-900 p-5 rounded-lg inline-block mb-4">
              <FileCheck className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold">Verificación de documento</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Coloque su documento de identidad frente a la cámara
            </p>
            <Button 
              onClick={captureDocument}
              className="mt-2"
            >
              <Camera className="h-4 w-4 mr-2" />
              Capturar documento
            </Button>
          </div>
        );
        
      case 2:
        return (
          <div className="text-center space-y-4">
            <div className="bg-indigo-50 dark:bg-indigo-900 p-5 rounded-lg inline-block mb-4">
              <Users className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold">Verificación facial</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Mire directamente a la cámara para la verificación facial
            </p>
            <Button 
              onClick={captureFace}
              className="mt-2"
            >
              <Camera className="h-4 w-4 mr-2" />
              Capturar selfie
            </Button>
          </div>
        );
        
      case 3:
        return (
          <div className="text-center space-y-4">
            <div className="bg-green-50 dark:bg-green-900 p-5 rounded-lg inline-block mb-4">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold">Verificación completada</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Los datos se han verificado correctamente
            </p>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md text-left mt-4">
              <h4 className="text-sm font-semibold mb-2">Información del documento:</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Tipo:</span> {documentData.documentType}</p>
                <p><span className="font-medium">Número:</span> {documentData.documentNumber}</p>
                <p><span className="font-medium">Nombre:</span> {documentData.fullName}</p>
                <p><span className="font-medium">Validez:</span> {documentData.expiryDate}</p>
              </div>
            </div>
            <Button 
              onClick={completeVerification}
              className="mt-4 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar y continuar
            </Button>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Card className="border shadow-md">
      <CardHeader className="bg-slate-50 dark:bg-slate-800">
        <CardTitle className="text-center flex justify-center items-center">
          <Shield className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
          Verificación de identidad
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pb-6">
        {renderStep()}
      </CardContent>
    </Card>
  );
};

// Componente para manejar la firma digital
const SignatureDialog = ({ 
  isOpen, 
  onClose, 
  onSign 
}: { 
  isOpen: boolean;
  onClose: () => void;
  onSign: (signatureData: string) => void;
}) => {
  const [signaturePoints, setSignaturePoints] = useState<Array<{x: number, y: number}>>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedDocument, setSelectedDocument] = useState("Contrato de Arriendo");
  
  // Función para limpiar el canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignaturePoints([]);
      }
    }
  };
  
  // Inicializar canvas
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = canvas.offsetWidth;
          canvas.height = 150;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#4f46e5';
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        }
      }, 100);
    }
  }, [isOpen]);
  
  // Manejar eventos de mouse/touch
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setSignaturePoints([...signaturePoints, {x, y}]);
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setSignaturePoints([...signaturePoints, {x, y}]);
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };
  
  const handleMouseUp = () => {
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.closePath();
      }
    }
  };
  
  // Finalizar firma
  const handleSignDocument = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      if (signaturePoints.length < 10) {
        alert('Por favor dibuje una firma válida');
        return;
      }
      const signatureData = canvas.toDataURL('image/png');
      onSign(signatureData);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Save className="h-5 w-5 mr-2 text-primary" />
            Firma digital
          </DialogTitle>
          <DialogDescription>
            Firme el documento electrónicamente para completar el proceso de certificación.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Documento a firmar</label>
            <Select
              value={selectedDocument}
              onValueChange={setSelectedDocument}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar documento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Contrato de Arriendo">Contrato de Arriendo</SelectItem>
                <SelectItem value="Poder Notarial">Poder Notarial</SelectItem>
                <SelectItem value="Declaración Jurada">Declaración Jurada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Card className="overflow-hidden">
              <CardHeader className="bg-primary/5 py-2 px-4">
                <CardTitle className="text-sm font-medium text-primary">Vista previa del documento</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="bg-gray-100 rounded border p-3 text-sm text-gray-800 h-32 overflow-auto">
                  <p className="font-semibold mb-2">{selectedDocument}</p>
                  <p>
                    En Santiago de Chile, a {new Date().toLocaleDateString('es-CL')}, comparece Don/Doña 
                    <span className="font-semibold"> Cliente Demo</span>, quien certifica haber leído 
                    y aceptado el contenido completo de este documento, y en señal de conformidad, 
                    procede a firmar electrónicamente según la Ley N° 19.799.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <label className="text-sm font-medium">Dibuje su firma a continuación</label>
            <div className="mt-2 border rounded-md overflow-hidden">
              <canvas 
                ref={canvasRef}
                className="w-full touch-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={clearCanvas}
            >
              Borrar y dibujar de nuevo
            </Button>
          </div>
        </div>
        
        <DialogFooter>
          <div className="flex space-x-2 justify-between w-full">
            <div className="text-xs text-muted-foreground">
              La firma electrónica tiene validez legal según Ley 19.799
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSignDocument}>
                <FileCheck className="h-4 w-4 mr-2" />
                Firmar documento
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Componente principal que integra Agora UI Kit
const RonAgoraKitTest = () => {
  const [, navigate] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  
  // Estados
  const [accessCode, setAccessCode] = useState<string>(params.code || '');
  const [sessionStarted, setSessionStarted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [videoCall, setVideoCall] = useState<boolean>(false);
  const [agoraConfig, setAgoraConfig] = useState<any>(null);
  const [showVerification, setShowVerification] = useState<boolean>(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState<boolean>(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [documentSigned, setDocumentSigned] = useState<boolean>(false);
  
  // Unirse a la sesión con el código proporcionado
  const startSession = async () => {
    if (!accessCode) {
      toast({
        title: 'Código requerido',
        description: 'Por favor ingresa un código de sesión RON',
        variant: 'destructive'
      });
      return;
    }

    // Validar formato del código RON
    const ronCodeRegex = /^RON-\d{4}-\d{3,}$/;
    if (!ronCodeRegex.test(accessCode)) {
      toast({
        title: 'Formato inválido',
        description: 'El código debe tener el formato RON-YYYY-NNN (ej: RON-2025-001)',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    console.log('Verificando código RON:', accessCode);
    
    try {
      // Primero intentar con la API pública
      const response = await fetch(`/api/ron/public/session/${accessCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Código RON inválido o sesión no encontrada');
      }
      
      const sessionData = await response.json();
      
      if (!sessionData.success) {
        throw new Error(sessionData.error || 'Error al verificar el código de sesión');
      }
      
      console.log('Sesión RON encontrada:', sessionData);
      setSessionDetails(sessionData);
      setSessionStarted(true);
      
      // Configurar Agora
      try {
        const tokenResponse = await fetch(`/api/ron/public/session/${accessCode}/tokens`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          
          setAgoraConfig({
            appId: tokenData.appId,
            channel: tokenData.channelName,
            token: tokenData.token,
            uid: 2, // Cliente = 2
            rtmUid: '2', // Debe ser string para RTM
            // Configuraciones adicionales
            enabledButtons: [
              'camera', 'mic', 'screenshare', 'fullscreen', 'exit', 'settings'
            ],
            buttonStyles: {
              buttonBackgroundColor: '#4f46e5',
              buttonBorderColor: '#4338ca',
              maxButtonCount: 5
            },
            styleProps: {
              localBtnContainer: { backgroundColor: 'rgba(79, 70, 229, 0.1)' },
              UIKitContainer: { borderRadius: '8px', overflow: 'hidden' } 
            }
          });
          
          setVideoCall(true);
        } else {
          // Si falla la API pública, intentar obtener el AppID directamente
          try {
            const appIdResponse = await fetch('/api/ron/public/app-id');
            if (appIdResponse.ok) {
              const appIdData = await appIdResponse.json();
              
              // Configuración de respaldo para modo forzado usando el AppID real
              setAgoraConfig({
                appId: appIdData.appId,
                channel: `ron-session-${accessCode.replace('RON-', '')}`,
                token: null, // En modo forzado/prueba sin token
                uid: 2, // Cliente = 2
                rtmUid: '2', // Debe ser string para RTM
                enabledButtons: ['camera', 'mic', 'fullscreen', 'exit'],
              });
            } else {
              throw new Error("No se pudo obtener el AppID de Agora");
            }
          } catch (appIdError) {
            console.error("Error al obtener AppID de Agora:", appIdError);
            toast({
              title: 'Advertencia',
              description: 'Funcionando en modo limitado sin videollamada',
              variant: 'destructive'
            });
          }
          
          setVideoCall(true);
        }
      } catch (error) {
        console.error('Error al obtener tokens de Agora:', error);
        
        // Intentar obtener al menos el AppID para modo forzado
        try {
          const appIdResponse = await fetch('/api/ron/public/app-id');
          if (appIdResponse.ok) {
            const appIdData = await appIdResponse.json();
            
            setAgoraConfig({
              appId: appIdData.appId,
              channel: `ron-session-${accessCode.replace('RON-', '')}`,
              token: null,
              uid: 2,
              rtmUid: '2',
            });
            
            setVideoCall(true);
          } else {
            toast({
              title: 'Error de configuración',
              description: 'No se pudo iniciar la videollamada',
              variant: 'destructive'
            });
          }
        } catch (appIdError) {
          console.error("No se pudo obtener configuración de Agora:", appIdError);
          toast({
            title: 'Error de conexión',
            description: 'Funcionando en modo limitado sin videollamada',
            variant: 'destructive'
          });
        }
      }
      
      // Mostrar notificación de éxito
      toast({
        title: 'Sesión verificada',
        description: 'Conectando a la sesión RON...',
      });
      
      // Actualizar la URL para reflejar el código de sesión
      navigate(`/ron-agora-kit-test/${accessCode}`, { replace: true });
      
    } catch (error) {
      console.error('Error al verificar sesión RON:', error);
      toast({
        title: 'Error al verificar sesión',
        description: (error as Error).message || 'No se pudo verificar el código de sesión',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Si tenemos código en los parámetros y aún no hemos iniciado, verificamos automáticamente
  useEffect(() => {
    if (params.code && !sessionStarted && !loading) {
      console.log('Código RON detectado en URL:', params.code);
      setAccessCode(params.code);
      startSession();
    }
  }, [params.code, sessionStarted, loading]);
  
  // Función para manejar el fin de la sesión
  const handleSessionEnd = () => {
    setSessionStarted(false);
    setSessionDetails(null);
    setVideoCall(false);
    navigate('/ron-platform', { replace: true });
    
    toast({
      title: 'Sesión finalizada',
      description: 'Has salido de la sesión RON',
    });
  };
  
  // Manejar la verificación completada
  const handleVerificationComplete = (verificationData: any) => {
    console.log('Verificación completada:', verificationData);
    setShowVerification(false);
    
    toast({
      title: 'Verificación exitosa',
      description: `Identidad verificada: ${verificationData.fullName}`,
    });
    
    // Aquí se enviaría la información al servidor en una implementación real
  };
  
  // Renderizar la llamada de Agora
  const renderAgoraCall = () => {
    if (!videoCall || !agoraConfig) return null;
    
    return (
      <div className="h-[500px] w-full">
        <AgoraUIKit
          rtcProps={agoraConfig}
          callbacks={{
            EndCall: handleSessionEnd,
          }}
        />
      </div>
    );
  };
  
  // Si la sesión está activa, mostramos la interfaz RON
  if (sessionStarted && sessionDetails) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        <header className="bg-white dark:bg-slate-800 shadow-sm py-4 px-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                Sesión RON: {accessCode}
              </h1>
              <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Activa
              </span>
            </div>
          </div>
        </header>
        
        <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
          <div className="grid grid-cols-1 gap-6">
            {/* Notificación de Modo Forzado */}
            <ForcedModeNotification mode="forced" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="border-0 shadow-lg overflow-hidden h-full">
                  <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4">
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Sesión de Certificación Remota
                    </CardTitle>
                    <CardDescription className="text-indigo-100">
                      Verificación de identidad y firma electrónica en línea
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-0">
                    {/* Video call usando Agora UI Kit */}
                    {renderAgoraCall()}
                  </CardContent>
                  
                  <CardFooter className="bg-slate-50 dark:bg-slate-800 p-4 flex justify-between">
                    <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1 text-indigo-500" />
                      Sesión en curso
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setShowVerification(!showVerification)}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        {showVerification ? 'Ocultar verificación' : 'Verificar identidad'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setShowSignatureDialog(true);
                        }}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Firmar documento
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="flex flex-col gap-4">
                {/* Panel de información */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-base">
                      <Info className="h-5 w-5 mr-2 text-indigo-600" />
                      Información de la sesión
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-1 text-sm">
                        <div className="font-medium">Código:</div>
                        <div>{accessCode}</div>
                        
                        <div className="font-medium">Certificador:</div>
                        <div>{sessionDetails.certifierName || 'Certificador asignado'}</div>
                        
                        <div className="font-medium">Propósito:</div>
                        <div>{sessionDetails.purpose || 'Firma de documentos'}</div>
                        
                        <div className="font-medium">Estado:</div>
                        <div className="text-green-600 font-medium">Activo</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Panel de verificación */}
                {showVerification && (
                  <IdentityVerification 
                    onVerified={handleVerificationComplete} 
                    userType="client"
                  />
                )}
                
                {/* Panel de documento firmado */}
                {documentSigned && (
                  <Card>
                    <CardHeader className="bg-green-50 dark:bg-green-900/20">
                      <CardTitle className="flex items-center text-base">
                        <FileCheck className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                        Documento firmado electrónicamente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <p className="font-medium text-sm">Contrato de Arriendo</p>
                            <p className="text-xs text-slate-500">
                              Firmado el {new Date().toLocaleDateString('es-CL')} a las {new Date().toLocaleTimeString('es-CL')}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verificado
                          </Badge>
                        </div>
                        
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-md p-3 border">
                          <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                            Firma del cliente:
                          </p>
                          {signatureData && (
                            <div className="border p-2 bg-white dark:bg-slate-800 rounded">
                              <img 
                                src={signatureData} 
                                alt="Firma digital" 
                                className="h-20 object-contain"
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 pt-2 border-t flex justify-between items-center">
                          <div className="text-xs text-slate-500">
                            <span className="flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                              Documento firmado y verificado
                            </span>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Descargar copia
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
          
          {/* Componente de diálogo de firma */}
          <SignatureDialog
            isOpen={showSignatureDialog}
            onClose={() => setShowSignatureDialog(false)}
            onSign={(data) => {
              setSignatureData(data);
              setDocumentSigned(true);
              setShowSignatureDialog(false);
              toast({
                title: "Documento firmado",
                description: "El documento ha sido firmado con éxito",
              });
            }}
          />
        </main>
      </div>
    );
  }
  
  // Pantalla de inicio de sesión
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardTitle className="flex items-center justify-center">
            <Users className="h-6 w-6 mr-2" />
            Demo Agora UI Kit - Sesión RON
          </CardTitle>
          <CardDescription className="text-center text-indigo-100">
            Verificación de identidad y firma electrónica en línea
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Notificación de Modo Forzado */}
          <ForcedModeNotification mode="forced" />
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label 
                htmlFor="accessCode" 
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Código de acceso RON
              </label>
              <Input
                id="accessCode"
                type="text"
                placeholder="Formato: RON-2025-001"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ingresa el código proporcionado por tu certificador notarial
              </p>
            </div>
            
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              onClick={startSession}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Verificando...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Ingresar a la sesión
                </>
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t bg-slate-50 dark:bg-slate-800/50">
          <div className="text-xs text-center text-slate-500 dark:text-slate-400 max-w-xs">
            Esta plataforma cumple con la Ley 19.799 sobre documentos electrónicos y firma electrónica en Chile.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RonAgoraKitTest;