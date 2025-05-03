import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import VideoSession from "@/components/ron/VideoSession";
import { Loader2, Video, Camera, Lock, Shield, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RonSessionNativePage() {
  const [, params] = useRoute("/ron-session-native/:sessionId");
  const sessionId = params?.sessionId || "SESSION-NEW";
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCertifier, setIsCertifier] = useState(true);
  
  // Estado para controlar si el usuario ha aceptado iniciar la sesión con video
  const [sessionAccepted, setSessionAccepted] = useState(false);
  
  useEffect(() => {
    // Simular carga de datos de sesión
    const loadSession = async () => {
      try {
        // En una implementación real, aquí se cargarían los datos de la sesión
        // y se verificaría si el usuario actual es certificador
        
        // Mostrar notificación para solicitar permisos
        toast({
          title: "Sesión RON preparada",
          description: "La sesión está lista para comenzar. Se solicitarán permisos para acceder a la cámara y micrófono.",
        });
        
        setLoading(false);
        
        // Determinar si el usuario es certificador basado en la URL o el estado de la app
        // Por ahora usamos un valor de ejemplo
        setIsCertifier(sessionId.includes('certifier'));
        
      } catch (err) {
        console.error("Error al cargar la sesión:", err);
        setError("No se pudo cargar la sesión. Verifique su conexión e intente nuevamente.");
        setLoading(false);
        
        toast({
          title: "Error al cargar la sesión",
          description: "No se pudo cargar la sesión de certificación remota.",
          variant: "destructive",
        });
      }
    };
    
    loadSession();
  }, [sessionId, toast]);
  
  const handleSessionEnd = () => {
    toast({
      title: "Sesión finalizada",
      description: "La sesión de certificación ha sido finalizada correctamente.",
    });
    
    // Redirigir a la página principal de RON
    window.location.href = "/ron-platform";
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium text-white">Preparando sesión RON...</h2>
        <p className="text-slate-400 mt-2">Configurando conexión segura</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="max-w-md text-center p-8">
          <h2 className="text-xl font-medium mb-4">Error de conexión</h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <button 
            className="px-4 py-2 bg-primary text-white rounded-md"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }
  
  // Pantalla para iniciar la sesión con aceptación explícita
  if (!sessionAccepted) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white p-4">
        <Card className="max-w-md w-full bg-slate-800 border-slate-700">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="flex items-center text-xl">
              <Video className="h-5 w-5 mr-2 text-primary" />
              Iniciar Sesión RON
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-lg p-4 text-center">
                <Camera className="h-12 w-12 mx-auto mb-3 text-primary" />
                <h3 className="font-medium mb-2">Se requiere cámara y micrófono</h3>
                <p className="text-sm text-slate-300">Para continuar, autoriza el acceso a estos dispositivos cuando se te solicite.</p>
              </div>
              
              <div className="space-y-3">
                <Badge variant="outline" className="w-full justify-start bg-slate-900 py-2 px-3 h-auto">
                  <Lock className="h-4 w-4 mr-2 text-green-400" />
                  <span>Sesión encriptada de extremo a extremo</span>
                </Badge>
                
                <Badge variant="outline" className="w-full justify-start bg-slate-900 py-2 px-3 h-auto">
                  <Shield className="h-4 w-4 mr-2 text-blue-400" />
                  <span>Cumple con Ley 19.799 para certificaciones electrónicas</span>
                </Badge>
                
                <Badge variant="outline" className="w-full justify-start bg-slate-900 py-2 px-3 h-auto">
                  <Info className="h-4 w-4 mr-2 text-yellow-400" />
                  <span>La sesión será grabada con fines de validación legal</span>
                </Badge>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex-col space-y-2 pt-2 pb-4">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => setSessionAccepted(true)}
            >
              <Camera className="h-4 w-4 mr-2" />
              Iniciar videollamada
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => window.location.href = "/ron-platform"}
            >
              Cancelar
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Parámetros configurables
  const maxSessionDuration = 45; // 45 minutos de tiempo máximo por defecto para sesiones RON
  
  return (
    <div className="h-screen w-full overflow-hidden">
      <VideoSession 
        sessionId={sessionId}
        isCertifier={isCertifier}
        onSessionEnd={handleSessionEnd}
        maxDurationMinutes={maxSessionDuration}
      />
    </div>
  );
}