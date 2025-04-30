import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chatbot } from '@/components/shared/Chatbot';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Video, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

export default function IntegracionesDemo() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isVideoCallStarted, setIsVideoCallStarted] = useState(false);
  const [videoToken, setVideoToken] = useState<string | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const [channelName, setChannelName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startVideoCall = async () => {
    if (!user) {
      toast({
        title: "Acceso denegado",
        description: "Debes iniciar sesión para iniciar una videollamada",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const sessionId = Date.now().toString();
      const response = await apiRequest('POST', '/api/video-call/token', {
        sessionId
      });

      const data = await response.json();
      setVideoToken(data.token);
      setAppId(data.appID);
      setChannelName(data.channelName);
      setIsVideoCallStarted(true);

      toast({
        title: "Videollamada iniciada",
        description: "La conexión a la videollamada se ha establecido correctamente"
      });
    } catch (error) {
      console.error('Error al iniciar videollamada:', error);
      toast({
        title: "Error al iniciar videollamada",
        description: "No se pudo generar el token para la videollamada. Por favor, intenta de nuevo más tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const endVideoCall = async () => {
    if (!channelName) return;
    
    try {
      await apiRequest('POST', '/api/video-call/end-session', {
        channelName
      });
      
      setIsVideoCallStarted(false);
      setVideoToken(null);
      setAppId(null);
      setChannelName(null);
      
      toast({
        title: "Videollamada finalizada",
        description: "Has salido de la sesión de videollamada"
      });
    } catch (error) {
      console.error('Error al finalizar videollamada:', error);
    }
  };

  return (
    <div className="container py-10 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Demo de Integraciones</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Prueba las funcionalidades de chatbot con inteligencia artificial y videollamadas en tiempo real integradas en la plataforma Cerfidoc.
        </p>
      </div>

      <Tabs defaultValue="chatbot" className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chatbot">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Chatbot IA</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="videocall">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <span>Videollamada</span>
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chatbot" className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Asistente Legal IA</CardTitle>
                  <CardDescription>
                    Nuestro chatbot usa tecnología de OpenAI (GPT-4o) para responder consultas legales y ayudarte con dudas sobre certificación de documentos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Consulta sobre la Ley 19.799 de Chile</li>
                    <li>Pregunta por procedimientos de certificación</li>
                    <li>Resuelve dudas sobre firma electrónica</li>
                    <li>Solicita información sobre documentos legales</li>
                  </ul>
                  
                  <Alert className="mt-6 border-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Importante</AlertTitle>
                    <AlertDescription>
                      Este asistente proporciona información general y no reemplaza el asesoramiento legal profesional. Consulta siempre con un abogado para casos específicos.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Chatbot />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="videocall" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Plataforma de Videollamadas</CardTitle>
              <CardDescription>
                Nuestro sistema de videollamadas permite realizar certificaciones remotas (RON - Remote Online Notarization) de forma segura y conforme a la ley chilena.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {!isVideoCallStarted ? (
                <div className="text-center py-10 space-y-6">
                  <div className="border border-border rounded-full p-6 mx-auto w-fit">
                    <Video className="h-16 w-16 text-muted-foreground" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Iniciar una videollamada</h3>
                    <p className="text-muted-foreground mb-6">
                      Conecta con certificadores o notarios para verificar tu identidad y certificar documentos remotamente.
                    </p>
                    
                    <Button 
                      size="lg" 
                      onClick={startVideoCall}
                      disabled={isLoading}
                    >
                      {isLoading ? "Iniciando..." : "Iniciar videollamada"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <div className="aspect-video bg-black rounded-md flex items-center justify-center text-white mb-4">
                    {/* Aquí se integraría el componente de videollamada de Agora.io */}
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-4">Videollamada en curso</h3>
                      <p className="mb-4">Token de conexión generado correctamente</p>
                      <p className="text-xs opacity-70 mb-8">Canal: {channelName}</p>
                      <p className="text-sm italic">
                        En una implementación completa, aquí se conectaría con la librería Agora.io
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      variant="destructive"
                      onClick={endVideoCall}
                    >
                      Finalizar videollamada
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}