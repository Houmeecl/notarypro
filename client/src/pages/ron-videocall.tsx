import { useEffect, useState, useRef } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Video, VideoOff, Mic, MicOff, Phone, MessageSquare, FileText, UserCheck, Share2, Shield } from "lucide-react";
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

const getStatusBadge = (status: string) => {
  switch (status) {
    case "scheduled":
      return <Badge variant="outline">Agendada</Badge>;
    case "inProgress":
      return <Badge variant="secondary">En Progreso</Badge>;
    case "completed":
      return <Badge variant="success">Completada</Badge>;
    case "cancelled":
      return <Badge variant="destructive">Cancelada</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function RONVideocallPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, params] = useRoute("/ron-videocall/:sessionId");
  const sessionId = params?.sessionId;
  
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [activeTab, setActiveTab] = useState("documentos");
  const [chatMessages, setChatMessages] = useState<{sender: string, text: string, timestamp: Date}[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [showIdentityVerified, setShowIdentityVerified] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Consulta de la sesión RON
  const { data: ronSession, isLoading, error } = useQuery({
    queryKey: ['/api/ron-sessions', sessionId],
    enabled: !!sessionId,
  });

  // Simulación para cargar datos de documentos para esta sesión
  const { data: sessionDocuments } = useQuery({
    queryKey: ['/api/ron-sessions', sessionId, 'documents'],
    enabled: !!sessionId,
  });

  // Efecto para inicializar la videollamada
  useEffect(() => {
    if (!sessionId) return;
    
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
          title: "Videollamada iniciada",
          description: "Conectando con el servidor de videollamadas...",
        });
        
        // Simulación de recepción de video remoto
        setTimeout(() => {
          // En un caso real, esta sería la transmisión del otro participante
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
            
            toast({
              title: "Participante conectado",
              description: "La otra parte se ha unido a la videollamada.",
            });
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
    };
  }, [sessionId, toast]);

  // Simulación del envío de mensajes de chat
  const sendChatMessage = () => {
    if (!messageInput.trim()) return;
    
    const newMessage = {
      sender: user?.username || "Usuario",
      text: messageInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setMessageInput("");
    
    // Simular respuesta después de un breve retraso
    if (user?.role !== "certifier") {
      setTimeout(() => {
        const responseMessage = {
          sender: "Certificador",
          text: "Recibido. Continuemos con el proceso de certificación.",
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, responseMessage]);
      }, 1500);
    }
  };

  // Función para verificar identidad
  const verifyIdentityMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) throw new Error("ID de sesión no disponible");
      
      const response = await apiRequest("POST", `/api/ron-sessions/${sessionId}/verify-identity`, {
        userId: user?.id
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Identidad verificada",
        description: "La verificación de identidad se ha completado con éxito.",
      });
      setShowIdentityVerified(true);
      queryClient.invalidateQueries({ queryKey: ['/api/ron-sessions', sessionId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error de verificación",
        description: error.message || "No se pudo completar la verificación de identidad.",
        variant: "destructive",
      });
    }
  });

  // Función para firmar el documento
  const signDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      if (!sessionId) throw new Error("ID de sesión no disponible");
      
      const response = await apiRequest("POST", `/api/ron-sessions/${sessionId}/sign-document`, {
        documentId,
        userId: user?.id
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Documento firmado",
        description: "El documento ha sido firmado correctamente durante la sesión RON.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ron-sessions', sessionId, 'documents'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al firmar",
        description: error.message || "No se pudo firmar el documento.",
        variant: "destructive",
      });
    }
  });

  // Mutación para finalizar la sesión RON
  const completeSessionMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) throw new Error("ID de sesión no disponible");
      
      const response = await apiRequest("POST", `/api/ron-sessions/${sessionId}/complete`, {});
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sesión completada",
        description: "La sesión de certificación remota ha sido completada con éxito.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ron-sessions', sessionId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al completar",
        description: error.message || "No se pudo completar la sesión.",
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
  const endCall = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Redireccionar o mostrar pantalla de finalización
    toast({
      title: "Llamada finalizada",
      description: "Ha salido de la sesión de certificación remota.",
    });
    
    // Aquí se podría redirigir al usuario
    window.location.href = "/dashboard";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-2 text-lg">Cargando sesión RON...</p>
      </div>
    );
  }

  if (error || !ronSession) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Error al cargar la sesión</h2>
        <p className="text-gray-500 mb-6">No se pudo cargar la sesión de certificación remota.</p>
        <Button onClick={() => window.history.back()}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Barra superior con información de la sesión */}
      <div className="bg-white dark:bg-gray-800 shadow-sm py-3 px-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Sesión de Certificación Remota</h1>
          <div className="flex items-center mt-1">
            <span className="text-sm text-muted-foreground mr-2">ID: {sessionId}</span>
            {getStatusBadge(ronSession.status)}
          </div>
        </div>
        <div className="flex items-center">
          <span className="text-sm mr-4">
            {ronSession.participants?.map((p: any) => p.name).join(", ")}
          </span>
          <span className="flex items-center text-sm text-red-500">
            <span className="h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
            Grabando
          </span>
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
                onClick={endCall}
              >
                <Phone className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Panel de verificación de identidad y firma (para certificadores) */}
          {user?.role === "certifier" && (
            <Card className="mt-4">
              <CardHeader className="py-3">
                <CardTitle className="text-lg">Panel de Certificación</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={() => verifyIdentityMutation.mutate()}
                    disabled={verifyIdentityMutation.isPending || showIdentityVerified}
                  >
                    {verifyIdentityMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...</>
                    ) : showIdentityVerified ? (
                      <><UserCheck className="mr-2 h-4 w-4" /> Identidad Verificada</>
                    ) : (
                      <><UserCheck className="mr-2 h-4 w-4" /> Verificar Identidad</>
                    )}
                  </Button>
                  
                  <Button 
                    disabled={!showIdentityVerified}
                    onClick={() => completeSessionMutation.mutate()}
                  >
                    {completeSessionMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finalizando...</>
                    ) : (
                      <><Shield className="mr-2 h-4 w-4" /> Finalizar y Certificar</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Panel lateral (derecha) */}
        <div className="w-96 bg-white dark:bg-gray-800 border-l overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-2 p-0 rounded-none">
              <TabsTrigger value="documentos" className="rounded-none">
                <FileText className="mr-2 h-4 w-4" />
                Documentos
              </TabsTrigger>
              <TabsTrigger value="chat" className="rounded-none">
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="documentos" className="flex-1 p-0 m-0 overflow-hidden flex flex-col">
              <div className="p-4">
                <h3 className="font-medium mb-2">Documentos para certificar</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Los siguientes documentos están pendientes de firma y certificación.
                </p>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {sessionDocuments ? (
                    sessionDocuments.map((doc: any) => (
                      <Card key={doc.id}>
                        <CardHeader className="py-3">
                          <CardTitle className="text-base">{doc.title}</CardTitle>
                          <CardDescription>{doc.type}</CardDescription>
                        </CardHeader>
                        <CardContent className="py-2">
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span>Estado: {doc.status}</span>
                            <Badge>{doc.pages} páginas</Badge>
                          </div>
                        </CardContent>
                        <CardFooter className="py-2 flex justify-between">
                          <Button variant="outline" size="sm">
                            <FileText className="mr-2 h-4 w-4" />
                            Ver
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => signDocumentMutation.mutate(doc.id)}
                            disabled={signDocumentMutation.isPending}
                          >
                            {signDocumentMutation.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Share2 className="mr-2 h-4 w-4" />
                            )}
                            Firmar
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-10 w-10 mx-auto text-muted-foreground opacity-20 mb-2" />
                      <p className="text-muted-foreground">No hay documentos disponibles</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            
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
                        Los mensajes enviados durante la sesión quedarán registrados
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
          </Tabs>
        </div>
      </div>
    </div>
  );
}