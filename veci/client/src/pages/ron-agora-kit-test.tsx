/**
 * Componente de prueba para integración de Agora React UI Kit en RON
 * 
 * Este componente implementa una versión real del cliente RON
 * usando la biblioteca agora-react-uikit para videollamadas y
 * RealIdentityVerification para la verificación real con cámara.
 */
import React, { useState, useEffect, useRef, createContext } from 'react';
import AgoraUIKit, { layout, PropsInterface } from 'agora-react-uikit';

// Crear un contexto de props para Agora UI Kit
const PropsContext = createContext<PropsInterface>({
  rtcProps: { appId: '', channel: '' },
  callbacks: {}
});
import 'agora-react-uikit/dist/index.css';
import { useLocation, useRoute } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  CameraOff, Camera, Mic, MicOff, Phone, Users, 
  FileText, Shield, AlertCircle, CheckCircle, 
  RefreshCw, Loader2, PenLine, UserCheck, 
  X, AlignJustify, Video, MonitorStop, RotateCcw 
} from 'lucide-react';
import RealIdentityVerification from '@/components/ron/RealIdentityVerification';
import ForcedModeNotification from '@/components/ron/ForcedModeNotification';

// Interfaz para los tokens de Agora
interface AgoraTokens {
  appId: string;
  channelName: string;
  token: string;
  certifierToken?: string;
  isNotarial?: boolean;
}

// Interfaz para la información de la sesión
interface SessionInfo {
  id: string;
  client: string;
  documentType: string;
  scheduledFor: string;
  region: string;
  status: string;
  certifierName: string;
  purpose: string;
}

// Interfaz para la verificación de identidad
interface VerificationData {
  documentType: string;
  documentNumber: string;
  fullName: string;
  expiryDate: string;
  documentImage: string | null;
  faceImage: string | null;
  verificationTime: string;
  verificationResult: string;
  score: number;
}

interface SignatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: (data: string) => void;
}

// Componente de firma simple
const SignatureDialog: React.FC<SignatureDialogProps> = ({ isOpen, onClose, onSign }) => {
  const [signature, setSignature] = useState<string>('');
  
  const handleSign = () => {
    onSign(signature);
    setSignature('');
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Firmar documento</DialogTitle>
          <DialogDescription>
            Ingrese su firma para el documento
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Label htmlFor="signature">Firma (nombre completo)</Label>
          <Input 
            id="signature" 
            value={signature} 
            onChange={(e) => setSignature(e.target.value)} 
            placeholder="Juan Pedro Pérez"
          />
          <p className="text-sm text-slate-500">
            Esta es una firma simple para fines de demostración. Una implementación real
            utilizaría firmas digitales avanzadas o calificadas.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button 
            onClick={handleSign} 
            disabled={!signature.trim()} 
            className="ml-2"
          >
            <PenLine className="h-4 w-4 mr-2" />
            Firmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Componente principal para la prueba de Agora UI Kit
const AgoraUIKitTest: React.FC = () => {
  // Estado para la conexión de Agora
  const [videoCall, setVideoCall] = useState<boolean>(false);
  const [isPinned, setPinned] = useState<boolean>(false);
  const [tokens, setTokens] = useState<AgoraTokens | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [sessionCode, setSessionCode] = useState<string>('RON-2025-001');
  const [userType, setUserType] = useState<'certifier' | 'client'>('client');
  
  // Estados para la firma de documentos
  const [isSignatureOpen, setIsSignatureOpen] = useState<boolean>(false);
  const [documents, setDocuments] = useState<any[]>([{
    id: 'doc-001',
    title: 'Contrato de ejemplo',
    status: 'pendiente'
  }]);
  
  // Estados para verificación de identidad
  const [verified, setVerified] = useState<boolean>(false);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [showVerification, setShowVerification] = useState<boolean>(false);
  
  // Estados de la videoconferencia
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCameraOff, setIsCameraOff] = useState<boolean>(false);
  
  // Estados para la interfaz de usuario
  const [currentTab, setCurrentTab] = useState<string>('video');
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [localUserUid, setLocalUserUid] = useState<number>(0);
  
  // Referencias para mantener estado con los callbacks
  const rtcPropsRef = useRef<any>(null);
  const modeRef = useRef<'forced' | 'production' | 'development'>('forced');
  
  // Hooks
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [match, params] = useRoute('/ron-test/:role?/:session?');
  
  // Actualizar parámetros de URL y obtener datos de la sesión
  useEffect(() => {
    if (match && params) {
      const role = params.role as 'certifier' | 'client';
      const sessionId = params.session;
      if (role && (role === 'certifier' || role === 'client')) {
        setUserType(role);
      }
      if (sessionId) {
        setSessionCode(sessionId);
      }
    }
    
    async function getSessionData() {
      if (sessionCode) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/ron/public/session/${sessionCode}`);
          const data = await response.json();
          
          if (data.success) {
            setSessionInfo(data);
          } else {
            setError(data.error || 'No se pudo obtener información de la sesión');
            toast({
              title: 'Error',
              description: data.error || 'No se pudo obtener información de la sesión',
              variant: 'destructive'
            });
          }
        } catch (err) {
          setError('Error de conexión al servidor');
          toast({
            title: 'Error de conexión',
            description: 'No se pudo conectar con el servidor',
            variant: 'destructive'
          });
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    getSessionData();
  }, [sessionCode, match, params]);
  
  // Conectar con Agora
  const connectToAgora = async () => {
    if (!sessionCode) {
      setError('Ingrese un código de sesión válido');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/ron/public/session/${sessionCode}/tokens`);
      const data = await response.json();
      
      if (data.success) {
        console.log("Tokens obtenidos correctamente:", data);
        
        // Guardar tokens
        setTokens({
          appId: data.appId,
          channelName: data.channelName,
          token: userType === 'certifier' ? data.certifierToken : data.token,
          certifierToken: data.certifierToken,
          isNotarial: data.isNotarial
        });
        
        // Conectar a videollamada
        setVideoCall(true);
        setLocalUserUid(userType === 'certifier' ? 1 : 2);
        
        toast({
          title: 'Conectado',
          description: 'Conectado exitosamente a la sesión RON',
        });
      } else {
        setError(data.error || 'No se pudieron obtener los tokens');
        toast({
          title: 'Error',
          description: data.error || 'No se pudieron obtener los tokens',
          variant: 'destructive'
        });
      }
    } catch (err) {
      setError('Error de conexión al servidor');
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Desconectar Agora
  const disconnectAgora = () => {
    setVideoCall(false);
    setPinned(false);
    setVerified(false);
    setVerificationData(null);
    setShowVerification(false);
    setCurrentTab('video');
    setIsReconnecting(false);
    
    toast({
      title: 'Desconectado',
      description: 'Se ha desconectado de la videollamada',
    });
  };
  
  // Reconectar a la videollamada
  const handleReconnect = async () => {
    setIsReconnecting(true);
    
    // Primero cerrar la videollamada actual
    setVideoCall(false);
    
    // Esperar un momento para asegurar que se haya cerrado completamente
    setTimeout(async () => {
      try {
        // Solicitar nuevos tokens
        const response = await fetch(`/api/ron/public/session/${sessionCode}/tokens`);
        const data = await response.json();
        
        if (data.success) {
          // Actualizar tokens
          setTokens({
            appId: data.appId,
            channelName: data.channelName,
            token: userType === 'certifier' ? data.certifierToken : data.token,
            certifierToken: data.certifierToken,
            isNotarial: data.isNotarial
          });
          
          // Reconectar
          setVideoCall(true);
          
          toast({
            title: 'Reconectado',
            description: 'Se ha reconectado a la videollamada',
          });
        } else {
          setError(data.error || 'No se pudieron obtener los tokens para reconexión');
          toast({
            title: 'Error',
            description: data.error || 'No se pudieron obtener los tokens para reconexión',
            variant: 'destructive'
          });
        }
      } catch (err) {
        setError('Error de conexión al reconectar');
        toast({
          title: 'Error de reconexión',
          description: 'No se pudo reconectar con el servidor',
          variant: 'destructive'
        });
      } finally {
        setIsReconnecting(false);
      }
    }, 1000);
  };
  
  // Manejar resultado de verificación de identidad
  const handleVerified = (data: VerificationData) => {
    setVerificationData(data);
    setVerified(true);
    setShowVerification(false);
    
    console.log("Verificación completada:", data);
    
    toast({
      title: 'Verificación completada',
      description: 'Su identidad ha sido verificada correctamente',
      variant: 'default'
    });
    
    // Si estamos en modo certificador o el usuario es un cliente, mostrar mensaje
    if (userType === 'certifier') {
      toast({
        title: 'Cliente verificado',
        description: `El cliente ${data.fullName} ha sido verificado correctamente`,
      });
    }
  };
  
  // Manejar firma de documento
  const handleSignDocument = (signatureText: string) => {
    // Actualizar estado del documento
    setDocuments(docs => docs.map(doc => ({
      ...doc,
      status: 'firmado',
      signature: signatureText,
      signedAt: new Date().toISOString()
    })));
    
    toast({
      title: 'Documento firmado',
      description: `El documento ha sido firmado como "${signatureText}"`,
    });
  };
  
  // Configuración de Agora React UI Kit
  const rtcProps: PropsInterface['rtcProps'] = {
    appId: tokens?.appId || '',
    channel: tokens?.channelName || '',
    token: tokens?.token || null,
    layout: isPinned ? layout.pin : layout.grid,
    uid: localUserUid,
    enableScreensharing: userType === 'certifier', // Solo certificador puede compartir pantalla
    disableRtm: false, // Habilitar RTM para mensajería
  };
  
  // Callbacks para la interfaz de Agora
  const callbacks: PropsInterface['callbacks'] = {
    EndCall: () => disconnectAgora(),
    'user-joined': (uid: any) => {
      console.log('Usuario unido:', uid);
      toast({
        title: `${userType === 'certifier' ? 'Cliente' : 'Certificador'} conectado`,
        description: `Se ha conectado a la videollamada`,
      });
    },
    'user-left': (uid: any) => {
      console.log('Usuario desconectado:', uid);
      toast({
        title: `${userType === 'certifier' ? 'Cliente' : 'Certificador'} desconectado`,
        description: `Se ha desconectado de la videollamada`,
      });
    }
  };
  
  // Guardar referencia a rtcProps para usar en callbacks
  rtcPropsRef.current = rtcProps;
  
  return (
    <div className="container mt-4 mb-8 px-2 sm:px-4">
      {/* Notificación de modo forzado */}
      <ForcedModeNotification 
        mode={modeRef.current}
        sessionId={sessionCode} 
      />
      
      {/* Contenedor principal */}
      <div className="mb-4 flex flex-col lg:flex-row items-start gap-4">
        {/* Información de la sesión */}
        <Card className="w-full lg:w-1/3 mb-4 lg:mb-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">
              {sessionInfo ? 'Información de la sesión' : 'Ingresar a sesión RON'}
            </CardTitle>
            <CardDescription>
              {sessionInfo 
                ? `Sesión ${sessionInfo.id} - ${sessionInfo.documentType}`
                : 'Ingrese el código de la sesión RON para conectarse'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!sessionInfo ? (
              // Formulario de conexión
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionCode">Código de sesión</Label>
                  <Input
                    id="sessionCode"
                    placeholder="Ej: RON-2025-001"
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userType">Conectarse como</Label>
                  <div className="flex space-x-2">
                    <Button 
                      variant={userType === 'client' ? 'default' : 'outline'}
                      onClick={() => setUserType('client')}
                      className="flex-1"
                    >
                      Cliente
                    </Button>
                    <Button 
                      variant={userType === 'certifier' ? 'default' : 'outline'}
                      onClick={() => setUserType('certifier')}
                      className="flex-1"
                    >
                      Certificador
                    </Button>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate(`/ron-test/${userType}/${sessionCode}`)}
                  disabled={!sessionCode}
                  className="w-full"
                >
                  Actualizar URL
                </Button>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              // Información de la sesión
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Tipo de documento:</div>
                  <div>{sessionInfo.documentType}</div>
                  
                  <div className="font-medium">Cliente:</div>
                  <div>{sessionInfo.client}</div>
                  
                  <div className="font-medium">Certificador:</div>
                  <div>{sessionInfo.certifierName}</div>
                  
                  <div className="font-medium">Región:</div>
                  <div>{sessionInfo.region}</div>
                  
                  <div className="font-medium">Propósito:</div>
                  <div>{sessionInfo.purpose}</div>
                  
                  <div className="font-medium">Programada para:</div>
                  <div>{new Date(sessionInfo.scheduledFor).toLocaleString()}</div>
                  
                  <div className="font-medium">Estado:</div>
                  <div>
                    <Badge variant={
                      sessionInfo.status === 'programada' ? 'default' :
                      sessionInfo.status === 'en_espera' ? 'secondary' :
                      sessionInfo.status === 'en_proceso' ? 'outline' :
                      sessionInfo.status === 'completada' ? 'success' : 'outline'
                    }>
                      {sessionInfo.status === 'programada' ? 'Programada' :
                       sessionInfo.status === 'en_espera' ? 'En espera' :
                       sessionInfo.status === 'en_proceso' ? 'En proceso' :
                       sessionInfo.status === 'completada' ? 'Completada' : 
                       sessionInfo.status}
                    </Badge>
                  </div>
                  
                  <div className="font-medium">Conectado como:</div>
                  <div>
                    <Badge variant="outline">
                      {userType === 'certifier' ? 'Certificador' : 'Cliente'}
                    </Badge>
                  </div>
                </div>
                
                <div className="pt-2">
                  {!videoCall ? (
                    <Button 
                      onClick={connectToAgora}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Conectando...
                        </>
                      ) : (
                        <>
                          <Video className="mr-2 h-4 w-4" />
                          Iniciar videollamada
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      onClick={disconnectAgora}
                      variant="destructive"
                      className="w-full"
                    >
                      <Phone className="mr-2 h-4 w-4 rotate-135" />
                      Finalizar videollamada
                    </Button>
                  )}
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Panel principal con videollamada y controles */}
        <div className="w-full lg:w-2/3">
          {videoCall ? (
            <Card>
              <CardHeader className="pb-0">
                <Tabs value={currentTab} onValueChange={setCurrentTab}>
                  <div className="flex justify-between items-center">
                    <TabsList>
                      <TabsTrigger value="video" className="flex items-center">
                        <Video className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Videollamada</span>
                      </TabsTrigger>
                      <TabsTrigger value="documents" className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Documentos</span>
                      </TabsTrigger>
                      <TabsTrigger value="verification" className="flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Verificación</span>
                      </TabsTrigger>
                    </TabsList>
                    
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReconnect}
                        disabled={isReconnecting}
                      >
                        {isReconnecting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPinned(!isPinned)}
                      >
                        <AlignJustify className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Tabs>
              </CardHeader>
              
              <CardContent className="p-0 pt-2">
                <TabsContent value="video" className="m-0">
                  <div className="relative">
                    <div className="agoraApp" style={{ height: '500px', position: 'relative' }}>
                      <PropsContext.Provider value={{ rtcProps, callbacks }}>
                        <AgoraUIKit />
                      </PropsContext.Provider>
                    </div>
                    
                    {/* Controles personalizados */}
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2 z-10">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsMuted(!isMuted)}
                        className="bg-slate-800 hover:bg-slate-700"
                      >
                        {isMuted ? (
                          <MicOff className="h-4 w-4 text-red-500" />
                        ) : (
                          <Mic className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCameraOff(!isCameraOff)}
                        className="bg-slate-800 hover:bg-slate-700"
                      >
                        {isCameraOff ? (
                          <CameraOff className="h-4 w-4 text-red-500" />
                        ) : (
                          <Camera className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={disconnectAgora}
                        className="bg-red-700 hover:bg-red-800"
                      >
                        <Phone className="h-4 w-4 rotate-135 text-white" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="documents" className="m-0">
                  <div className="p-4 space-y-4 min-h-[500px]">
                    <h2 className="text-lg font-semibold">Documentos para esta sesión</h2>
                    
                    {documents.length === 0 ? (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Sin documentos</AlertTitle>
                        <AlertDescription>
                          No hay documentos disponibles para esta sesión.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-4">
                        {documents.map((doc) => (
                          <Card key={doc.id} className="overflow-hidden">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">{doc.title}</CardTitle>
                              <CardDescription>
                                ID: {doc.id}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="font-medium">Estado:</div>
                                <div>
                                  <Badge variant={doc.status === 'pendiente' ? 'outline' : doc.status === 'firmado' ? 'success' : 'secondary'}>
                                    {doc.status === 'pendiente' ? 'Pendiente' : 
                                     doc.status === 'firmado' ? 'Firmado' : doc.status}
                                  </Badge>
                                </div>
                                
                                {doc.signature && (
                                  <>
                                    <div className="font-medium">Firmado por:</div>
                                    <div>{doc.signature}</div>
                                    
                                    <div className="font-medium">Fecha de firma:</div>
                                    <div>{new Date(doc.signedAt).toLocaleString()}</div>
                                  </>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter className="pb-4">
                              {doc.status === 'pendiente' ? (
                                <Button
                                  onClick={() => setIsSignatureOpen(true)}
                                  className="w-full sm:w-auto"
                                >
                                  <PenLine className="h-4 w-4 mr-2" />
                                  Firmar documento
                                </Button>
                              ) : (
                                <Button variant="outline" disabled className="w-full sm:w-auto">
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                  Documento firmado
                                </Button>
                              )}
                            </CardFooter>
                          </Card>
                        ))}
                        
                        {/* Diálogo de firma */}
                        <SignatureDialog
                          isOpen={isSignatureOpen}
                          onClose={() => setIsSignatureOpen(false)}
                          onSign={handleSignDocument}
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="verification" className="m-0">
                  <div className="p-4 min-h-[500px]">
                    {showVerification ? (
                      <RealIdentityVerification 
                        onVerified={handleVerified}
                        userType={userType}
                      />
                    ) : verified ? (
                      <div className="space-y-6">
                        <div className="flex justify-center">
                          <div className="bg-green-50 dark:bg-green-900 p-5 rounded-full">
                            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <h2 className="text-xl font-bold mb-2">Verificación completada</h2>
                          <p className="text-slate-600 dark:text-slate-400">
                            {userType === 'client' 
                              ? 'Su identidad ha sido verificada correctamente'
                              : 'La identidad del cliente ha sido verificada correctamente'}
                          </p>
                        </div>
                        
                        {verificationData && (
                          <Card>
                            <CardHeader>
                              <CardTitle>Detalles de verificación</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 gap-y-2 text-sm">
                                <div className="font-medium">Tipo de documento:</div>
                                <div>{verificationData.documentType}</div>
                                
                                <div className="font-medium">Número de documento:</div>
                                <div>{verificationData.documentNumber}</div>
                                
                                <div className="font-medium">Nombre completo:</div>
                                <div>{verificationData.fullName}</div>
                                
                                <div className="font-medium">Fecha de expiración:</div>
                                <div>{verificationData.expiryDate}</div>
                                
                                <div className="font-medium">Fecha de verificación:</div>
                                <div>{new Date(verificationData.verificationTime).toLocaleString()}</div>
                                
                                <div className="font-medium">Resultado:</div>
                                <div>
                                  <Badge variant="success">
                                    Verificado exitosamente
                                  </Badge>
                                </div>
                                
                                <div className="font-medium">Puntuación:</div>
                                <div>
                                  {Math.round(verificationData.score * 100)}% de coincidencia
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        
                        <div className="flex justify-center">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setVerified(false);
                              setVerificationData(null);
                              setShowVerification(true);
                            }}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Realizar nueva verificación
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-8">
                        <div className="space-y-2">
                          <h2 className="text-xl font-bold">Verificación de identidad</h2>
                          <p className="text-slate-600 dark:text-slate-400">
                            {userType === 'client' 
                              ? 'Verifique su identidad para continuar con la sesión'
                              : 'Solicite al cliente que verifique su identidad'}
                          </p>
                        </div>
                        
                        <div className="flex justify-center">
                          <div className="bg-indigo-50 dark:bg-indigo-900 p-8 rounded-full">
                            <Shield className="h-16 w-16 text-indigo-600 dark:text-indigo-400" />
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => setShowVerification(true)}
                          className="px-8"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          {userType === 'client' 
                            ? 'Verificar mi identidad' 
                            : 'Iniciar verificación del cliente'}
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          ) : (
            <Card className="min-h-[500px] flex flex-col justify-center items-center p-4">
              <div className="text-center space-y-6 max-w-md">
                <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-full inline-block mx-auto">
                  <Video className="h-16 w-16 text-slate-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Videollamada RON</h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {!sessionInfo
                      ? 'Ingrese el código de la sesión para conectarse'
                      : 'Presione el botón "Iniciar videollamada" para comenzar'}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgoraUIKitTest;