import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

import {
  Loader2,
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  MessageSquare,
  FileText,
  Upload,
  Clock,
  X,
  Send,
  Users,
  ChevronLeft,
} from 'lucide-react';

interface Consultation {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  scheduledFor: string;
  status: string;
  topic: string;
  duration: number;
  notes: string;
}

interface ChatMessage {
  sender: string;
  text: string;
  timestamp: Date;
}

interface SharedDocument {
  id: number;
  name: string;
  type: string;
  size: number;
  sharedAt: string;
  sharedBy: string;
}

export default function VideoConsultationPage() {
  const { consultationId } = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Estados para la videollamada
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showEndCallConfirm, setShowEndCallConfirm] = useState(false);
  
  // Estados para el chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Referencias para video
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // Temporizador para llamada
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Simulación de datos de nota para el abogado
  const [notes, setNotes] = useState('');

  // Obtener detalles de la consulta
  const {
    data: consultation,
    isLoading: isLoadingConsultation,
    isError: isErrorConsultation,
    error: consultationError
  } = useQuery<Consultation>({
    queryKey: ['/api/video-consultations', consultationId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/video-consultations/${consultationId}`);
      if (!response.ok) {
        throw new Error('Error al obtener los detalles de la consulta');
      }
      return response.json();
    },
    enabled: !!consultationId
  });

  // Obtener documentos compartidos
  const {
    data: sharedDocuments,
    isLoading: isLoadingDocuments
  } = useQuery<SharedDocument[]>({
    queryKey: ['/api/video-consultations', consultationId, 'documents'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/video-consultations/${consultationId}/documents`);
      if (!response.ok) {
        throw new Error('Error al obtener los documentos compartidos');
      }
      return response.json();
    },
    enabled: !!consultationId && isCallActive
  });

  // Mutación para finalizar la videoconsulta
  const endConsultationMutation = useMutation({
    mutationFn: async ({ notes, duration }: { notes: string; duration: number }) => {
      const response = await apiRequest(
        'POST',
        `/api/video-consultations/${consultationId}/end`,
        { notes, duration }
      );
      if (!response.ok) {
        throw new Error('Error al finalizar la consulta');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Consulta finalizada',
        description: 'La videoconsulta ha sido finalizada correctamente',
      });
      
      // Invalidar cache y redirigir
      queryClient.invalidateQueries({ queryKey: ['/api/video-consultations'] });
      setTimeout(() => {
        setLocation('/lawyer-dashboard');
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Manejar inicio de llamada
  const handleStartCall = async () => {
    try {
      // En una implementación real, aquí iniciaríamos WebRTC o conectaríamos API de videollamada
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setIsCallActive(true);
      
      // Iniciar temporizador
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      // Añadir mensaje de sistema al chat
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'system',
          text: 'La videollamada ha comenzado',
          timestamp: new Date()
        }
      ]);
      
      toast({
        title: 'Llamada iniciada',
        description: 'La conexión de videollamada se ha establecido correctamente',
      });
    } catch (error) {
      console.error('Error al iniciar la videollamada:', error);
      toast({
        title: 'Error de conexión',
        description: 'No se pudo acceder a la cámara o micrófono',
        variant: 'destructive',
      });
    }
  };

  // Manejar fin de llamada
  const handleEndCall = () => {
    // Mostrar confirmación
    setShowEndCallConfirm(true);
  };

  // Confirmar finalización de llamada
  const confirmEndCall = () => {
    // Detener temporizador
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Detener streams
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    
    // Finalizar consulta en backend
    endConsultationMutation.mutate({
      notes,
      duration: elapsedTime
    });
    
    setIsCallActive(false);
    setShowEndCallConfirm(false);
    
    // Añadir mensaje de sistema al chat
    setChatMessages(prev => [
      ...prev,
      {
        sender: 'system',
        text: 'La videollamada ha finalizado',
        timestamp: new Date()
      }
    ]);
  };

  // Manejar envío de mensajes de chat
  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;
    
    const newMessage: ChatMessage = {
      sender: 'me',
      text: currentMessage,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
    
    // Simular respuesta automática (solo para demo)
    if (Math.random() > 0.7) {
      setTimeout(() => {
        const responseMessage: ChatMessage = {
          sender: consultation?.clientName || 'Cliente',
          text: '¿Podría explicarme nuevamente ese punto, por favor?',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, responseMessage]);
      }, 5000);
    }
  };

  // Alternar video
  const toggleVideo = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const videoTrack = (localVideoRef.current.srcObject as MediaStream)
        .getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
      }
    }
    setIsVideoOn(!isVideoOn);
  };

  // Alternar micrófono
  const toggleMic = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const audioTrack = (localVideoRef.current.srcObject as MediaStream)
        .getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioOn;
      }
    }
    setIsMicOn(!isAudioOn);
  };

  // Formatear tiempo transcurrido
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Auto-scroll al recibir nuevos mensajes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Limpiar temporizador al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Asegurar que los tracks se detengan al salir
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Mensajes iniciales de chat (solo para demo)
  useEffect(() => {
    if (consultation) {
      const initialMessages: ChatMessage[] = [
        {
          sender: 'system',
          text: 'Bienvenido a la videoconsulta. La sesión está lista para comenzar.',
          timestamp: new Date()
        }
      ];
      setChatMessages(initialMessages);
    }
  }, [consultation]);

  if (isLoadingConsultation) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              className="mr-2"
              onClick={() => setLocation('/lawyer-dashboard')}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <Skeleton className="h-8 w-96" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-[500px] w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-[500px] w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isErrorConsultation) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              className="mr-2"
              onClick={() => setLocation('/lawyer-dashboard')}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold">Error al cargar la consulta</h1>
          </div>
          
          <Alert variant="destructive">
            <AlertTitle>No se pudo cargar la videoconsulta</AlertTitle>
            <AlertDescription>
              {consultationError instanceof Error ? consultationError.message : 'Error desconocido'}
            </AlertDescription>
          </Alert>
          
          <Button 
            className="mt-4"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/video-consultations', consultationId] })}
          >
            Intentar nuevamente
          </Button>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="mr-2"
              onClick={() => {
                if (isCallActive) {
                  toast({
                    title: "Advertencia",
                    description: "Debes finalizar la videollamada antes de salir",
                    variant: "destructive"
                  });
                  return;
                }
                setLocation('/lawyer-dashboard');
              }}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold">Videoconsulta</h1>
            <Badge 
              variant={consultation.status === "agendada" ? "outline" : "secondary"}
              className="ml-3"
            >
              {consultation.status === "agendada" ? "Pendiente" : "Finalizada"}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            {isCallActive && (
              <div className="flex items-center bg-white rounded-full px-3 py-1 border">
                <Clock className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm font-medium">{formatTime(elapsedTime)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel principal de video */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Sesión con {consultation.clientName}</CardTitle>
                    <CardDescription>
                      {format(parseISO(consultation.scheduledFor), "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es })}
                    </CardDescription>
                  </div>
                  {!isCallActive && (
                    <Button onClick={handleStartCall} disabled={consultation.status !== "agendada"}>
                      <Phone className="mr-2 h-4 w-4" />
                      Iniciar llamada
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="relative w-full bg-black rounded-md overflow-hidden aspect-video flex items-center justify-center">
                  {isCallActive ? (
                    <>
                      {/* Video remoto (cliente) */}
                      <video
                        ref={remoteVideoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                      />
                      
                      {/* Overlay cuando el video está apagado */}
                      {!isVideoOn && (
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                          <Avatar className="h-24 w-24">
                            <AvatarImage src={user?.avatarUrl} alt={user?.username} />
                            <AvatarFallback className="text-2xl">
                              {user?.username?.substring(0, 2).toUpperCase() || "AB"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      
                      {/* Video local (abogado) - PiP */}
                      <div className="absolute bottom-4 right-4 w-48 h-auto border-2 border-white rounded-md overflow-hidden shadow-md">
                        <video
                          ref={localVideoRef}
                          className="w-full h-full object-cover"
                          autoPlay
                          playsInline
                          muted
                        />
                      </div>
                      
                      {/* Controles de llamada */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-gray-900/80 rounded-full px-2 py-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant={isAudioOn ? "outline" : "destructive"} 
                                size="icon" 
                                className="rounded-full h-10 w-10"
                                onClick={toggleMic}
                              >
                                {isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {isAudioOn ? "Silenciar micrófono" : "Activar micrófono"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="destructive" 
                                size="icon" 
                                className="rounded-full h-12 w-12"
                                onClick={handleEndCall}
                              >
                                <PhoneOff className="h-5 w-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Finalizar llamada
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant={isVideoOn ? "outline" : "destructive"} 
                                size="icon" 
                                className="rounded-full h-10 w-10"
                                onClick={toggleVideo}
                              >
                                {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {isVideoOn ? "Apagar cámara" : "Encender cámara"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                      <Users className="h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-xl font-bold text-gray-700">
                        La videollamada aún no ha comenzado
                      </h3>
                      <p className="text-gray-500 max-w-md mt-2">
                        Pulsa "Iniciar llamada" para comenzar la sesión de videoconsulta con {consultation.clientName}
                      </p>
                      
                      <div className="mt-6 bg-gray-100 rounded-lg p-4 w-full max-w-md">
                        <h4 className="font-medium text-gray-700 mb-2">Detalles de la consulta:</h4>
                        <ul className="space-y-2 text-left">
                          <li className="flex">
                            <span className="text-gray-500 w-32">Tema:</span> 
                            <span className="font-medium">{consultation.topic}</span>
                          </li>
                          <li className="flex">
                            <span className="text-gray-500 w-32">Programada:</span> 
                            <span className="font-medium">
                              {format(parseISO(consultation.scheduledFor), "d MMM yyyy, HH:mm", { locale: es })}
                            </span>
                          </li>
                          <li className="flex">
                            <span className="text-gray-500 w-32">Duración:</span> 
                            <span className="font-medium">{consultation.duration} minutos</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Formulario de notas y detalles adicionales */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Notas de la consulta</CardTitle>
                <CardDescription>
                  Registra información importante durante la videoconsulta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Añade notas sobre la consulta aquí..."
                  className="min-h-32"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={!isCallActive && consultation.status !== "agendada"}
                />
              </CardContent>
              <CardFooter className="justify-between flex-wrap gap-2">
                <div className="text-sm text-gray-500">
                  Solo visible para ti
                </div>
                <Button 
                  variant="outline" 
                  disabled={!notes.trim() || (!isCallActive && consultation.status !== "agendada")}
                  onClick={() => {
                    toast({
                      title: "Notas guardadas",
                      description: "Las notas se han guardado temporalmente"
                    });
                  }}
                >
                  Guardar notas
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Panel lateral */}
          <div>
            <Tabs defaultValue="chat">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="mt-2">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Chat con {consultation.clientName}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-[450px] px-4">
                      <div className="space-y-4 pt-2">
                        {chatMessages.map((msg, i) => (
                          <div 
                            key={i} 
                            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} ${msg.sender === 'system' ? 'justify-center' : ''}`}
                          >
                            {msg.sender === 'system' ? (
                              <div className="bg-gray-100 rounded-md py-1 px-3 text-sm text-gray-500 max-w-xs">
                                {msg.text}
                              </div>
                            ) : (
                              <div 
                                className={`max-w-xs rounded-lg py-2 px-3 ${
                                  msg.sender === 'me' 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {msg.sender !== 'me' && (
                                  <p className="text-xs font-medium mb-1">
                                    {msg.sender}
                                  </p>
                                )}
                                <p>{msg.text}</p>
                                <p className="text-xs opacity-70 mt-1 text-right">
                                  {format(msg.timestamp, 'HH:mm')}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <form 
                      className="w-full flex items-center space-x-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                    >
                      <Input
                        placeholder="Escribe un mensaje..."
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        disabled={!isCallActive}
                      />
                      <Button 
                        type="submit" 
                        size="icon" 
                        disabled={!isCallActive || !currentMessage.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="documents" className="mt-2">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Documentos compartidos</CardTitle>
                    <CardDescription>
                      Comparte archivos con tu cliente durante la sesión
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    {isLoadingDocuments ? (
                      <div className="space-y-3">
                        <Skeleton className="h-14 w-full rounded-md" />
                        <Skeleton className="h-14 w-full rounded-md" />
                        <Skeleton className="h-14 w-full rounded-md" />
                      </div>
                    ) : sharedDocuments && sharedDocuments.length > 0 ? (
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-2">
                          {sharedDocuments.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                              <div className="flex items-center space-x-3">
                                <div className="bg-gray-200 p-2 rounded">
                                  <FileText className="h-5 w-5 text-gray-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{doc.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {(doc.size / 1024 / 1024).toFixed(2)} MB • {
                                      format(new Date(doc.sharedAt), 'HH:mm')
                                    }
                                  </p>
                                </div>
                              </div>
                              <Button size="sm" variant="ghost">
                                Descargar
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <FileText className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-700">
                          No hay documentos compartidos
                        </h3>
                        <p className="text-gray-500 text-sm mt-1 max-w-xs">
                          Los documentos compartidos durante la sesión aparecerán aquí
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      disabled={!isCallActive}
                      onClick={() => {
                        toast({
                          title: "Función en desarrollo",
                          description: "La función para compartir documentos estará disponible próximamente"
                        });
                      }}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Compartir documento
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para finalizar llamada */}
      {showEndCallConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>¿Finalizar videoconsulta?</CardTitle>
              <CardDescription>
                Estás a punto de finalizar la videoconsulta con {consultation.clientName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  Una vez finalizada la consulta, no podrás volver a iniciarla. 
                  Las notas tomadas serán guardadas.
                </AlertDescription>
              </Alert>
              
              <div className="mt-4">
                <Label htmlFor="final-notes">Notas finales:</Label>
                <Textarea
                  id="final-notes"
                  className="mt-2"
                  placeholder="Agrega notas finales de la consulta..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              <div className="mt-4">
                <Label>Duración de la consulta:</Label>
                <div className="flex items-center mt-2">
                  <Progress value={(elapsedTime / 60) * 100 / consultation.duration} className="h-2 flex-1" />
                  <span className="ml-2 text-sm font-medium">
                    {formatTime(elapsedTime)} / {consultation.duration}:00
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setShowEndCallConfirm(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmEndCall}
                disabled={endConsultationMutation.isPending}
              >
                {endConsultationMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Finalizar consulta
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}