import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, MicOff, Video, VideoOff, UserCheck, Shield, MessagesSquare, Share2, Download, Lock, Upload, Mail, Clipboard, UserPlus, Clock, Timer, Settings, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VideoSessionProps {
  sessionId: string;
  isCertifier?: boolean;
  onSessionEnd?: () => void;
  maxDurationMinutes?: number; // Duración máxima en minutos
}

interface Participant {
  id: string;
  name: string;
  role: string;
  videoEnabled: boolean;
  audioEnabled: boolean;
  isVerified: boolean;
}

interface ChatMessage {
  sender: string;
  text: string;
  timestamp: Date;
  isSystem?: boolean;
}

const VideoSession: React.FC<VideoSessionProps> = ({ 
  sessionId, 
  isCertifier = false,
  onSessionEnd,
  maxDurationMinutes = 30, // 30 minutos por defecto
}) => {
  const { toast } = useToast();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 'local',
      name: 'Yo',
      role: isCertifier ? 'Certificador' : 'Cliente',
      videoEnabled: true,
      audioEnabled: true,
      isVerified: isCertifier ? true : false
    },
    {
      id: 'remote-1',
      name: isCertifier ? 'María González' : 'Ana López (Certificadora)',
      role: isCertifier ? 'Cliente' : 'Certificador',
      videoEnabled: true,
      audioEnabled: true,
      isVerified: !isCertifier
    }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionTimeLimit, setSessionTimeLimit] = useState(maxDurationMinutes * 60); // Inicializar con el valor de la prop
  const [showTimeLimitWarning, setShowTimeLimitWarning] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: 'Sistema',
      text: 'Bienvenido a la sesión de notarización remota. Esta sesión está siendo grabada para fines legales.',
      timestamp: new Date(),
      isSystem: true
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<string>('chat');
  
  // Para el flujo de verificación
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationStep, setVerificationStep] = useState(1);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState('');
  const [identityVerified, setIdentityVerified] = useState(false);
  
  // Controlar si se muestra el diálogo de firma
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  
  // Estado para el diálogo de compartir documentos
  const [showShareDocumentDialog, setShowShareDocumentDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Estado para el diálogo de configuración de tiempo límite
  const [showTimeLimitDialog, setShowTimeLimitDialog] = useState(false);
  const [selectedTimeLimit, setSelectedTimeLimit] = useState(maxDurationMinutes); // En minutos, usando directamente el valor de la prop

  // Simulador de tiempo transcurrido y control de límite de tiempo
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          
          // Mostrar advertencia cuando queden 5 minutos
          if (newTime === sessionTimeLimit - 5 * 60) {
            setShowTimeLimitWarning(true);
            addSystemMessage(`Aviso: Quedan 5 minutos para alcanzar el tiempo máximo de sesión (${sessionTimeLimit / 60} minutos).`);
            
            toast({
              title: "Tiempo de sesión",
              description: `Quedan 5 minutos para alcanzar el límite de tiempo de la sesión.`,
              variant: "destructive",
            });
          }
          
          // Advertencia final cuando queda 1 minuto
          if (newTime === sessionTimeLimit - 60) {
            addSystemMessage('Aviso: Queda 1 minuto para finalizar la sesión por tiempo máximo.');
            
            toast({
              title: "¡Atención!",
              description: "La sesión finalizará automáticamente en 1 minuto. Complete su actividad actual.",
              variant: "destructive",
            });
          }
          
          // Finalizar automáticamente al alcanzar el límite
          if (newTime >= sessionTimeLimit) {
            endSession();
            toast({
              title: "Sesión finalizada",
              description: `Se ha alcanzado el tiempo máximo de sesión (${sessionTimeLimit / 60} minutos).`,
              variant: "default",
            });
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording, sessionTimeLimit]);

  // Estado para solicitar permisos explícitamente
  const [permissionsRequested, setPermissionsRequested] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Solicitar permisos de cámara y audio explícitamente
  const requestMediaPermissions = async () => {
    try {
      // Mostrar un mensaje antes de solicitar permisos
      toast({
        title: 'Solicitando permisos',
        description: 'Autoriza el acceso a tu cámara y micrófono para continuar con la sesión RON.',
      });
      
      // Intentar obtener el stream con un timeout para detectar problemas de permiso
      const permissionTimeout = setTimeout(() => {
        setCameraError('Tiempo de espera excedido. Verifica que has permitido el acceso a la cámara y micrófono.');
      }, 10000); // 10 segundos de timeout
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      clearTimeout(permissionTimeout);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setLocalStream(stream);
      setCameraError(null);
      
      // Iniciar grabación después de 2 segundos
      setTimeout(() => {
        setIsRecording(true);
        addSystemMessage('La grabación ha comenzado.');
      }, 2000);
      
      return true;
    } catch (error: any) {
      console.error('Error accediendo a la cámara:', error);
      const errorMessage = error.name === 'NotAllowedError' 
        ? 'Permiso denegado. Por favor, permite el acceso a tu cámara y micrófono en la configuración del navegador.'
        : error.name === 'NotFoundError'
        ? 'No se encontró ninguna cámara o micrófono en tu dispositivo.'
        : error.name === 'NotReadableError'
        ? 'Tu cámara o micrófono está siendo utilizado por otra aplicación. Cierra otras aplicaciones que puedan estar usando estos dispositivos.'
        : 'No se pudo acceder a tu cámara o micrófono. Verifica los permisos del navegador.';
      
      setCameraError(errorMessage);
      
      toast({
        title: 'Error de acceso a dispositivos',
        description: errorMessage,
        variant: 'destructive'
      });
      
      return false;
    }
  };

  // Iniciar la cámara local al montar el componente
  useEffect(() => {
    // Solo intentar iniciar la cámara automáticamente en la primera carga
    if (!permissionsRequested) {
      setPermissionsRequested(true);
      requestMediaPermissions();
    }
    
    return () => {
      // Limpiar la cámara al desmontar
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Formatea el tiempo transcurrido a formato MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Agregar mensaje del sistema
  const addSystemMessage = (text: string) => {
    setChatMessages(prev => [
      ...prev,
      {
        sender: 'Sistema',
        text,
        timestamp: new Date(),
        isSystem: true
      }
    ]);
  };
  
  // Enviar mensaje de chat
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    setChatMessages(prev => [
      ...prev,
      {
        sender: 'Yo',
        text: newMessage,
        timestamp: new Date()
      }
    ]);
    
    // Simular respuesta después de 2 segundos si no es el certificador
    if (!isCertifier) {
      setTimeout(() => {
        setChatMessages(prev => [
          ...prev,
          {
            sender: 'Ana López (Certificadora)',
            text: 'Entendido. ¿Podría explicar un poco más sobre el documento que está presentando?',
            timestamp: new Date()
          }
        ]);
      }, 2000);
    }
    
    setNewMessage('');
  };
  
  // Alternar cámara
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        const isEnabled = videoTracks[0].enabled;
        videoTracks[0].enabled = !isEnabled;
        
        setParticipants(prev => 
          prev.map(p => 
            p.id === 'local' ? {...p, videoEnabled: !isEnabled} : p
          )
        );
      }
    }
  };
  
  // Alternar micrófono
  const toggleAudio = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        const isEnabled = audioTracks[0].enabled;
        audioTracks[0].enabled = !isEnabled;
        
        setParticipants(prev => 
          prev.map(p => 
            p.id === 'local' ? {...p, audioEnabled: !isEnabled} : p
          )
        );
      }
    }
  };
  
  // Finalizar la sesión
  const endSession = () => {
    setIsRecording(false);
    
    // Detener la cámara
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    // Llamar al callback si existe
    if (onSessionEnd) {
      onSessionEnd();
    }
    
    toast({
      title: 'Sesión finalizada',
      description: 'La grabación ha sido guardada correctamente.',
    });
  };
  
  // Iniciar proceso de verificación de identidad
  const startVerification = () => {
    try {
      setShowVerificationDialog(true);
      setVerificationStep(1);
      console.log("Diálogo de verificación abierto");
    } catch (error) {
      console.error("Error al iniciar verificación:", error);
      toast({
        title: 'Error',
        description: 'No se pudo iniciar el proceso de verificación.',
        variant: 'destructive'
      });
    }
  };
  
  // Avanzar en el proceso de verificación
  const advanceVerification = () => {
    try {
      if (verificationStep < 3) {
        setVerificationStep(prev => prev + 1);
        console.log("Avanzando a paso:", verificationStep + 1);
      } else {
        completeVerification();
      }
    } catch (error) {
      console.error("Error al avanzar verificación:", error);
      toast({
        title: 'Error',
        description: 'Ocurrió un problema al avanzar en la verificación.',
        variant: 'destructive'
      });
    }
  };
  
  // Completar la verificación
  const completeVerification = () => {
    try {
      setIdentityVerified(true);
      setShowVerificationDialog(false);
      
      // Actualizar el estado del participante remoto
      setParticipants(prev => 
        prev.map(p => 
          p.id === 'remote-1' ? {...p, isVerified: true} : p
        )
      );
      
      addSystemMessage('Identidad verificada correctamente.');
      
      toast({
        title: 'Verificación completada',
        description: 'La identidad ha sido verificada correctamente.',
        variant: 'default'
      });
      
      console.log("Verificación completada con éxito");
    } catch (error) {
      console.error("Error al completar verificación:", error);
      toast({
        title: 'Error',
        description: 'No se pudo completar la verificación.',
        variant: 'destructive'
      });
    }
  };
  
  // Manejar subida de documentos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files && e.target.files.length > 0) {
        setSelectedFile(e.target.files[0]);
        console.log("Archivo seleccionado:", e.target.files[0].name);
      }
    } catch (error) {
      console.error("Error al seleccionar archivo:", error);
      toast({
        title: 'Error al seleccionar archivo',
        description: 'No se pudo cargar el archivo seleccionado.',
        variant: 'destructive'
      });
    }
  };
  
  // Compartir documento
  const shareDocument = () => {
    try {
      if (selectedFile) {
        addSystemMessage(`Documento compartido: ${selectedFile.name}`);
        setShowShareDocumentDialog(false);
        setSelectedFile(null);
        
        toast({
          title: 'Documento compartido',
          description: 'El documento ha sido compartido con todos los participantes.',
        });
        
        console.log("Documento compartido exitosamente");
      } else {
        toast({
          title: 'Seleccione un archivo',
          description: 'Debe seleccionar un archivo para compartir.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error("Error al compartir documento:", error);
      toast({
        title: 'Error al compartir',
        description: 'No se pudo compartir el documento.',
        variant: 'destructive'
      });
    }
  };

  // Si hay un error de cámara, mostramos una interfaz de error con opción de reintentar
  if (cameraError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-6">
        <div className="max-w-md text-center bg-slate-800 p-8 rounded-lg shadow-lg border border-slate-700">
          <Camera className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-bold mb-4">Error de acceso a dispositivos</h2>
          <p className="text-slate-300 mb-6">{cameraError}</p>
          <div className="space-y-4">
            <Button 
              variant="default" 
              className="w-full"
              onClick={() => {
                setCameraError(null);
                requestMediaPermissions();
              }}
            >
              <Camera className="h-4 w-4 mr-2" />
              Reintentar acceso a cámara
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                if (onSessionEnd) {
                  onSessionEnd();
                } else {
                  window.location.href = "/ron-platform";
                }
              }}
            >
              Volver al panel
            </Button>
          </div>
          <div className="mt-6 text-slate-400 text-sm">
            <p className="mb-2">Consejos para resolver problemas:</p>
            <ul className="text-left list-disc pl-6 space-y-1">
              <li>Asegúrate de que tu cámara y micrófono no estén siendo utilizados por otra aplicación</li>
              <li>Verifica que has concedido permisos al navegador para acceder a estos dispositivos</li>
              <li>Utiliza un navegador actualizado (Chrome o Firefox recomendados)</li>
              <li>Reinicia tu navegador y vuelve a intentarlo</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 text-white">
      {/* Barra superior con información de la sesión */}
      <div className="bg-slate-800 py-2 px-4 flex justify-between items-center">
        <div className="flex items-center">
          {isRecording ? (
            <VideoOff className="h-5 w-5 mr-2 text-red-500 animate-pulse" />
          ) : (
            <Camera className="h-5 w-5 mr-2 text-blue-400" />
          )}
          <span className="text-sm font-medium">
            {isRecording ? (
              <span className="flex items-center">
                Grabando: {formatTime(elapsedTime)} 
                <span className="mx-2">|</span>
                <Timer className="h-4 w-4 mr-1 text-amber-400" />
                Límite: {formatTime(sessionTimeLimit)}
              </span>
            ) : (
              'Preparando grabación...'
            )}
          </span>
          <Badge variant="outline" className="ml-3 bg-blue-500/20 text-blue-200">
            Sesión: {sessionId}
          </Badge>
          
          {isRecording && (
            <Badge 
              variant="outline" 
              className={`ml-3 ${
                elapsedTime > sessionTimeLimit - 5 * 60 
                ? 'bg-red-500/20 text-red-200 animate-pulse' 
                : 'bg-yellow-500/20 text-yellow-200'
              }`}
            >
              Tiempo restante: {formatTime(Math.max(0, sessionTimeLimit - elapsedTime))}
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-green-500/20 text-green-200">
            Conexión segura
          </Badge>
          
          {isCertifier && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowTimeLimitDialog(true)}
              className={`bg-indigo-900/30 ${
                elapsedTime > sessionTimeLimit - 10 * 60 ? 'animate-pulse border-amber-400' : ''
              }`}
            >
              <Timer className="h-4 w-4 mr-2" />
              Configurar tiempo
            </Button>
          )}
          
          <Button variant="destructive" size="sm" onClick={endSession}>
            Finalizar
          </Button>
        </div>
      </div>
      
      {/* Área principal de video */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Videos */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            {/* Video local */}
            <div className="relative bg-black rounded-lg overflow-hidden shadow-lg border border-slate-700">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded flex items-center">
                <span className="text-xs font-medium">Yo ({participants[0].role})</span>
                {participants[0].isVerified && (
                  <Badge className="ml-2 h-5 bg-green-600">
                    <Shield className="h-3 w-3 mr-1" />
                    Verificado
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Video remoto */}
            <div className="relative bg-black rounded-lg overflow-hidden shadow-lg border border-slate-700">
              <div className="w-full h-full flex items-center justify-center">
                <img 
                  src="https://i.pravatar.cc/300?img=50" 
                  alt="Remote participant"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded flex items-center">
                <span className="text-xs font-medium">{participants[1].name}</span>
                {participants[1].isVerified && (
                  <Badge className="ml-2 h-5 bg-green-600">
                    <Shield className="h-3 w-3 mr-1" />
                    Verificado
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Controles de video */}
          <div className="mt-4 flex flex-wrap justify-center gap-2 py-2">
            <Button
              variant="secondary"
              size="sm"
              className={!participants[0].videoEnabled ? 'bg-red-500/20 text-red-200' : ''}
              onClick={toggleVideo}
            >
              {participants[0].videoEnabled ? (
                <Video className="h-4 w-4 mr-2" />
              ) : (
                <VideoOff className="h-4 w-4 mr-2" />
              )}
              {participants[0].videoEnabled ? 'Cámara ON' : 'Cámara OFF'}
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              className={!participants[0].audioEnabled ? 'bg-red-500/20 text-red-200' : ''}
              onClick={toggleAudio}
            >
              {participants[0].audioEnabled ? (
                <Mic className="h-4 w-4 mr-2" />
              ) : (
                <MicOff className="h-4 w-4 mr-2" />
              )}
              {participants[0].audioEnabled ? 'Micrófono ON' : 'Micrófono OFF'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Detener streams actuales
                if (localStream) {
                  localStream.getTracks().forEach(track => track.stop());
                  setLocalStream(null);
                }
                
                // Solicitar nuevamente permisos
                requestMediaPermissions();
                
                toast({
                  title: 'Reconectando',
                  description: 'Intentando restablecer la conexión con la cámara y el micrófono...',
                });
              }}
            >
              <Camera className="h-4 w-4 mr-2" />
              Reiniciar dispositivos
            </Button>
            
            {isCertifier && !identityVerified && (
              <Button variant="default" size="sm" onClick={startVerification}>
                <UserCheck className="h-4 w-4 mr-2" />
                Verificar identidad
              </Button>
            )}
            
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setShowShareDocumentDialog(true)}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartir documento
            </Button>
            
            {isCertifier && (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setShowSignatureDialog(true)}
              >
                <Clipboard className="h-4 w-4 mr-2" />
                Solicitar firma
              </Button>
            )}
          </div>
        </div>
        
        {/* Panel lateral */}
        <div className="w-full md:w-80 bg-slate-800 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="chat" className="text-xs">
                <MessagesSquare className="h-4 w-4 mr-1" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="docs" className="text-xs">
                <Download className="h-4 w-4 mr-1" />
                Documentos
              </TabsTrigger>
              <TabsTrigger value="info" className="text-xs">
                <UserCheck className="h-4 w-4 mr-1" />
                Identidad
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="flex flex-col h-[calc(100vh-12rem)]">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {chatMessages.map((message, idx) => (
                    <div key={idx} className={`flex flex-col ${message.sender === 'Yo' ? 'items-end' : 'items-start'}`}>
                      <div className={`px-3 py-2 rounded-lg max-w-[80%] ${
                        message.isSystem 
                          ? 'bg-blue-500/20 text-blue-100' 
                          : message.sender === 'Yo'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-slate-700 text-slate-200'
                      }`}>
                        {!message.isSystem && (
                          <p className="text-xs font-medium mb-1">{message.sender}</p>
                        )}
                        <p className="text-sm">{message.text}</p>
                      </div>
                      <span className="text-xs text-slate-400 mt-1">
                        {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t border-slate-700">
                <div className="flex space-x-2">
                  <Textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Escriba su mensaje..."
                    className="resize-none"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button onClick={sendMessage}>Enviar</Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="docs" className="h-[calc(100vh-12rem)] p-4">
              <Card className="bg-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Documentos compartidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-slate-800 p-3 rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <Download className="h-4 w-4 mr-2 text-blue-400" />
                        <span className="text-sm">Contrato de arriendo.pdf</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        Ver
                      </Button>
                    </div>
                    
                    {selectedFile && (
                      <div className="bg-slate-800 p-3 rounded-md flex items-center justify-between">
                        <div className="flex items-center">
                          <Download className="h-4 w-4 mr-2 text-blue-400" />
                          <span className="text-sm">{selectedFile.name}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => setShowShareDocumentDialog(true)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Compartir nuevo documento
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-700 mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Resultado de la sesión</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300 mb-3">
                    Al finalizar la sesión, se generarán los siguientes archivos:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Download className="h-4 w-4 mr-2 text-green-400 mt-0.5" />
                      <span>Documento firmado electrónicamente</span>
                    </li>
                    <li className="flex items-start">
                      <Download className="h-4 w-4 mr-2 text-green-400 mt-0.5" />
                      <span>Certificado de notarización RON</span>
                    </li>
                    <li className="flex items-start">
                      <Download className="h-4 w-4 mr-2 text-green-400 mt-0.5" />
                      <span>Grabación de la sesión (acceso restringido)</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="info" className="h-[calc(100vh-12rem)] p-4">
              <Card className="bg-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Información de participantes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {participants.map((participant, idx) => (
                      <div key={idx} className="bg-slate-800 p-3 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{participant.name}</p>
                            <p className="text-sm text-slate-400">{participant.role}</p>
                          </div>
                          {participant.isVerified ? (
                            <Badge className="bg-green-600">
                              <Shield className="h-3 w-3 mr-1" />
                              Verificado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-200 border-yellow-400">
                              Pendiente
                            </Badge>
                          )}
                        </div>
                        
                        {participant.id === 'remote-1' && participant.isVerified && (
                          <div className="mt-3 space-y-2 text-sm">
                            <p className="text-slate-200">Método de verificación:</p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="bg-blue-500/20 text-blue-200">
                                Cédula de identidad
                              </Badge>
                              <Badge variant="outline" className="bg-blue-500/20 text-blue-200">
                                Biometría facial
                              </Badge>
                              <Badge variant="outline" className="bg-blue-500/20 text-blue-200">
                                Preguntas KBA
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {isCertifier && !identityVerified && (
                      <Button className="w-full" onClick={startVerification}>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Iniciar verificación de identidad
                      </Button>
                    )}
                    
                    {isCertifier && (
                      <Button variant="outline" className="w-full">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invitar participante adicional
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-700 mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Seguridad de la sesión</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-green-400" />
                      <span>Conexión cifrada E2E</span>
                    </div>
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-green-400" />
                      <span>Cumple con estándares Ley 19.799</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-green-400" />
                      <span>Notificaciones electrónicas habilitadas</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Diálogo de verificación de identidad */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Verificación de identidad</DialogTitle>
            <DialogDescription>
              Paso {verificationStep} de 3: {
                verificationStep === 1 ? 'Verificación de documento' :
                verificationStep === 2 ? 'Verificación biométrica' :
                'Preguntas de seguridad'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {verificationStep === 1 && (
              <div className="space-y-4">
                <p className="text-sm">
                  Solicite al participante que muestre su documento de identidad a la cámara.
                </p>
                <div className="border rounded-md p-4 bg-slate-100">
                  <img 
                    src="https://t4.ftcdn.net/jpg/02/59/92/43/360_F_259924337_U76j6Fh9v5BYJN9mrJ9Rk82TYnsTdQBi.jpg" 
                    alt="ID Card" 
                    className="w-full h-40 object-contain mx-auto"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Nombre:</span>
                    <span className="text-sm">María González Fuentes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">RUN:</span>
                    <span className="text-sm">12.345.678-9</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Validez:</span>
                    <span className="text-sm text-green-600">Documento válido</span>
                  </div>
                </div>
              </div>
            )}
            
            {verificationStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm">
                  Verificación biométrica facial en proceso. El sistema está comparando
                  el rostro del participante con su documento de identidad.
                </p>
                <div className="border rounded-md p-4 flex flex-col items-center">
                  <div className="relative w-40 h-40 mb-4">
                    <img 
                      src="https://i.pravatar.cc/300?img=50" 
                      alt="Face" 
                      className="w-full h-full object-cover rounded-md"
                    />
                    <div className="absolute inset-0 border-2 border-green-500 rounded-md animate-pulse"></div>
                  </div>
                  <div className="w-full space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Puntos faciales detectados</span>
                      <span className="text-sm text-green-600">98%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm">Coincidencia con ID</span>
                      <span className="text-sm text-green-600">95%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {verificationStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm">
                  Haga las siguientes preguntas al participante para completar la verificación:
                </p>
                <div className="space-y-3">
                  <div className="bg-slate-100 p-3 rounded-md">
                    <p className="text-sm font-medium">¿Cuál es su dirección actual?</p>
                    <p className="text-xs text-slate-500">Coincide con: Av. Providencia 1234, Santiago</p>
                  </div>
                  <div className="bg-slate-100 p-3 rounded-md">
                    <p className="text-sm font-medium">¿Cuál es su fecha de nacimiento?</p>
                    <p className="text-xs text-slate-500">Coincide con: 15/04/1985</p>
                  </div>
                  <div className="bg-slate-100 p-3 rounded-md">
                    <p className="text-sm font-medium">¿Cuál es el motivo del trámite que está realizando?</p>
                    <p className="text-xs text-slate-500">Verifique respuesta coherente</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerificationDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={advanceVerification}>
              {verificationStep < 3 ? 'Continuar' : 'Completar verificación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para compartir documentos */}
      <Dialog open={showShareDocumentDialog} onOpenChange={setShowShareDocumentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartir documento</DialogTitle>
            <DialogDescription>
              Seleccione un documento para compartir con todos los participantes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Seleccionar archivo</label>
              <Input 
                type="file" 
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
                onChange={handleFileChange}
              />
              <p className="text-xs text-muted-foreground">
                Formatos permitidos: PDF, Word, imágenes (JPG, PNG)
              </p>
            </div>
            
            {selectedFile && (
              <div className="bg-muted/20 p-3 rounded-md">
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDocumentDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={shareDocument} disabled={!selectedFile}>
              Compartir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de firma */}
      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar firma</DialogTitle>
            <DialogDescription>
              Solicite al participante que firme el documento.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Seleccionar documento</label>
              <Select defaultValue="contrato">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contrato">Contrato de arriendo.pdf</SelectItem>
                  {selectedFile && (
                    <SelectItem value="selectedFile">{selectedFile.name}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de firma</label>
              <Select defaultValue="simple">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione tipo de firma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Firma electrónica simple</SelectItem>
                  <SelectItem value="avanzada">Firma electrónica avanzada</SelectItem>
                  <SelectItem value="etoken">Firma con E-Token</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Mensaje (opcional)</label>
              <Textarea placeholder="Mensaje para el firmante..." />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignatureDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              setShowSignatureDialog(false);
              addSystemMessage('Solicitud de firma enviada al participante.');
            }}>
              Enviar solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para configurar tiempo máximo de sesión */}
      <Dialog open={showTimeLimitDialog} onOpenChange={setShowTimeLimitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Timer className="h-5 w-5 mr-2 text-indigo-400" />
              Configurar tiempo máximo de sesión
            </DialogTitle>
            <DialogDescription>
              Establezca el tiempo máximo permitido para esta sesión RON. La sesión finalizará automáticamente cuando se alcance este límite.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="time-limit" className="text-sm font-medium">
                  Duración máxima (en minutos):
                </label>
                <span className="text-sm font-bold bg-indigo-900/30 px-2 py-1 rounded">
                  {selectedTimeLimit} minutos
                </span>
              </div>
              
              <Select
                value={selectedTimeLimit.toString()}
                onValueChange={(value) => setSelectedTimeLimit(parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione duración" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1 hora 30 minutos</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md mt-2">
              <div className="flex items-start">
                <Info className="h-5 w-5 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Información importante:</p>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
                    <li>Los participantes recibirán avisos a los 5 minutos y 1 minuto antes de finalizar.</li>
                    <li>La sesión se cerrará automáticamente al alcanzar el tiempo límite.</li>
                    <li>Todos los documentos compartidos y firmados se guardarán automáticamente.</li>
                    <li>La grabación de la sesión se detendrá al finalizar.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimeLimitDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                // Actualizar el tiempo límite en segundos
                setSessionTimeLimit(selectedTimeLimit * 60);
                
                // Cerrar el diálogo
                setShowTimeLimitDialog(false);
                
                // Mostrar notificación de confirmación
                toast({
                  title: "Tiempo máximo actualizado",
                  description: `El tiempo máximo de sesión se ha actualizado a ${selectedTimeLimit} minutos.`,
                });
                
                // Añadir mensaje al chat
                addSystemMessage(`El tiempo máximo de sesión ha sido actualizado a ${selectedTimeLimit} minutos.`);
              }}
            >
              <Timer className="h-4 w-4 mr-2" />
              Establecer tiempo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoSession;