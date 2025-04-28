import { useEffect, useState, useRef } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Loader2, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  MessageSquare, 
  FileText, 
  Clock, 
  Share2,
  FileUp,
  CreditCard,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function VideoConsultationPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, params] = useRoute("/video-consultation/:consultationId");
  const consultationId = params?.consultationId;
  
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [chatMessages, setChatMessages] = useState<{sender: string, text: string, timestamp: Date}[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [consultationNotes, setConsultationNotes] = useState("");
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Consulta de la sesión de videoconsulta
  const { data: consultation, isLoading, error } = useQuery({
    queryKey: ['/api/video-consultations', consultationId],
    enabled: !!consultationId,
  });

  // Simulación para cargar datos de documentos compartidos
  const { data: sharedDocuments } = useQuery({
    queryKey: ['/api/video-consultations', consultationId, 'documents'],
    enabled: !!consultationId,
  });

  // Efecto para inicializar la videollamada
  useEffect(() => {
    if (!consultationId) return;
    
    // Inicialización del acceso a la cámara y micrófono del usuario
    const initVideoCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Aquí se conectaría con el servicio de videollamada
        toast({
          title: "Videoconsulta iniciada",
          description: "Conectando con el servidor de videollamadas...",
        });
        
        // Inicia el temporizador
        startTimer();
        
        // Simulación de conexión del cliente (remota)
        setTimeout(() => {
          // En un caso real, esta sería la transmisión del cliente
          if (remoteVideoRef.current) {
            // Para simulación, usamos el mismo stream
            remoteVideoRef.current.srcObject = stream;
            
            toast({
              title: "Cliente conectado",
              description: "El cliente se ha unido a la videoconsulta.",
            });
            
            // Inicia la "grabación" de la sesión
            setIsRecording(true);
          }
        }, 3000);
        
      } catch (err) {
        toast({
          title: "Error de acceso",
          description: "No se pudo acceder a la cámara o micrófono.",
          variant: "destructive",
        });
      }
    };
    
    initVideoCall();
    
    // Limpieza al desmontar
    return () => {
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      stopTimer();
    };
  }, [consultationId, toast]);

  // Función para iniciar el temporizador
  const startTimer = () => {
    if (timerRef.current) return;
    
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  // Función para detener el temporizador
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Formatear el tiempo
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Simulación del envío de mensajes de chat
  const sendChatMessage = () => {
    if (!messageInput.trim()) return;
    
    const newMessage = {
      sender: user?.username || "Abogado",
      text: messageInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setMessageInput("");
    
    // Simular respuesta después de un breve retraso
    if (user?.role === "lawyer") {
      setTimeout(() => {
        const responseMessage = {
          sender: consultation?.clientName || "Cliente",
          text: "Entendido, gracias por la explicación.",
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, responseMessage]);
      }, 2000);
    }
  };

  // Mutación para finalizar la videoconsulta
  const endConsultationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/video-consultations/${consultationId}/end`, {
        notes: consultationNotes,
        duration: timer
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Consulta finalizada",
        description: "La videoconsulta ha sido finalizada correctamente.",
      });
      // Redireccionar al dashboard
      setTimeout(() => {
        window.location.href = "/lawyer-dashboard";
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo finalizar la consulta.",
        variant: "destructive",
      });
    }
  });

  // Manejador para toggle de video
  const toggleVideo = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  // Manejador para toggle de micrófono
  const toggleMic = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMicOn(!isMicOn);
    }
  };

  // Manejador para colgar la llamada
  const handleEndCall = () => {
    setShowEndDialog(true);
  };

  // Manejador para finalizar la consulta
  const handleEndConsultation = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    stopTimer();
    endConsultationMutation.mutate();
  };

  // Simulación del manejador para compartir un documento
  const handleShareDocument = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx';
    fileInput.click();
    
    fileInput.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        toast({
          title: "Documento compartido",
          description: `El documento ${file.name} ha sido compartido con el cliente.`,
        });
        
        // Aquí se haría la subida real del archivo
      }
    };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-2 text-lg">Cargando videoconsulta...</p>
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Error al cargar la videoconsulta</h2>
        <p className="text-gray-500 mb-6">No se pudo cargar la sesión de consulta.</p>
        <Button onClick={() => window.history.back()}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Barra superior con información de la consulta */}
      <div className="bg-white dark:bg-gray-800 shadow-sm py-3 px-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Videoconsulta Legal</h1>
          <div className="flex items-center mt-1">
            <span className="text-sm text-muted-foreground mr-2">
              ID: {consultationId} - {consultation.clientName}
            </span>
            <Badge variant="outline">{consultation.topic || "Consulta general"}</Badge>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{formatTime(timer)}</span>
          </div>
          {isRecording && (
            <span className="flex items-center text-sm text-red-500">
              <span className="h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
              Grabando
            </span>
          )}
        </div>
      </div>
      
      {/* Contenido principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Área de video principal (izquierda) */}
        <div className="flex-1 flex flex-col p-4">
          <div className="flex-1 relative bg-black rounded-lg overflow-hidden">
            {/* Video remoto (grande) */}
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            
            {/* Video local (pequeño, esquina) */}
            <div className="absolute bottom-4 right-4 w-1/4 max-w-[200px] rounded-lg overflow-hidden border-2 border-white shadow-lg">
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Controles superpuestos */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
              <Button 
                variant="default" 
                size="icon" 
                className={`rounded-full ${!isVideoOn ? 'bg-red-500 hover:bg-red-600' : ''}`} 
                onClick={toggleVideo}
              >
                {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
              <Button 
                variant="default" 
                size="icon" 
                className={`rounded-full ${!isMicOn ? 'bg-red-500 hover:bg-red-600' : ''}`} 
                onClick={toggleMic}
              >
                {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
              <Button 
                variant="destructive" 
                size="icon" 
                className="rounded-full" 
                onClick={handleEndCall}
              >
                <Phone className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Acciones adicionales */}
          <div className="mt-4 flex justify-center space-x-2">
            <Button variant="outline" onClick={handleShareDocument}>
              <Share2 className="mr-2 h-4 w-4" />
              Compartir documento
            </Button>
            <Button variant="outline">
              <FileUp className="mr-2 h-4 w-4" />
              Subir archivo
            </Button>
            <Button variant="outline">
              <CreditCard className="mr-2 h-4 w-4" />
              Enviar factura
            </Button>
          </div>
        </div>
        
        {/* Panel lateral (derecha) */}
        <div className="w-96 bg-white dark:bg-gray-800 border-l overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-3 p-0 rounded-none">
              <TabsTrigger value="chat" className="rounded-none">
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="notas" className="rounded-none">
                <FileText className="mr-2 h-4 w-4" />
                Notas
              </TabsTrigger>
              <TabsTrigger value="documentos" className="rounded-none">
                <FileText className="mr-2 h-4 w-4" />
                Documentos
              </TabsTrigger>
            </TabsList>
            
            {/* Contenido de la pestaña Chat */}
            <TabsContent value="chat" className="flex-1 p-0 m-0 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {chatMessages.length > 0 ? (
                    chatMessages.map((msg, index) => (
                      <div 
                        key={index}
                        className={`flex ${msg.sender === user?.username ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] px-4 py-2 rounded-lg ${
                            msg.sender === user?.username 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}
                        >
                          <div className="font-semibold text-xs mb-1">{msg.sender}</div>
                          <p>{msg.text}</p>
                          <div className="text-xs opacity-70 mt-1 text-right">
                            {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground opacity-20 mb-2" />
                      <p className="text-muted-foreground">No hay mensajes aún</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        La conversación quedará registrada en el historial
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Escribe un mensaje..." 
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendChatMessage();
                      }
                    }}
                  />
                  <Button onClick={sendChatMessage}>
                    Enviar
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* Contenido de la pestaña Notas */}
            <TabsContent value="notas" className="flex-1 p-0 m-0 overflow-hidden flex flex-col">
              <div className="p-4">
                <h3 className="font-medium mb-2">Notas de la consulta</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Estas notas se guardarán cuando finalice la consulta y estarán disponibles en el historial.
                </p>
              </div>
              <div className="px-4 flex-1">
                <Textarea 
                  placeholder="Escribe tus notas aquí..." 
                  className="min-h-[200px]"
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                />
              </div>
              <div className="p-4 border-t mt-auto">
                <Button variant="outline" className="w-full">
                  Guardar notas
                </Button>
              </div>
            </TabsContent>
            
            {/* Contenido de la pestaña Documentos */}
            <TabsContent value="documentos" className="flex-1 p-0 m-0 overflow-hidden flex flex-col">
              <div className="p-4">
                <h3 className="font-medium mb-2">Documentos compartidos</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Documentos compartidos durante esta sesión
                </p>
              </div>
              
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-3">
                  {(!sharedDocuments || sharedDocuments.length === 0) ? (
                    <div className="text-center py-8">
                      <FileText className="h-10 w-10 mx-auto text-muted-foreground opacity-20 mb-2" />
                      <p className="text-muted-foreground">No hay documentos compartidos</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Comparta documentos usando los botones de abajo
                      </p>
                    </div>
                  ) : (
                    (sharedDocuments || []).map((doc: any) => (
                      <Card key={doc.id}>
                        <CardHeader className="py-3">
                          <CardTitle className="text-base">{doc.name}</CardTitle>
                          <CardDescription>
                            Compartido: {new Date(doc.sharedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="py-2">
                          <Button variant="outline" size="sm" className="ml-auto">
                            <Download className="mr-2 h-4 w-4" />
                            Descargar
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t mt-auto">
                <Button onClick={handleShareDocument} className="w-full">
                  <FileUp className="mr-2 h-4 w-4" />
                  Compartir documento
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Diálogo para finalizar la consulta */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar consulta</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea finalizar esta videoconsulta? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Notas finales (opcional)</label>
              <Textarea 
                placeholder="Agregue notas sobre esta consulta..."
                value={consultationNotes}
                onChange={(e) => setConsultationNotes(e.target.value)}
              />
            </div>
            
            <div className="rounded-md bg-amber-50 p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-amber-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">Duración de la consulta</h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>Duración actual: {formatTime(timer)}</p>
                    <p>Duración programada: {consultation.duration} minutos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleEndConsultation}
              disabled={endConsultationMutation.isPending}
            >
              {endConsultationMutation.isPending ? "Finalizando..." : "Finalizar consulta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}