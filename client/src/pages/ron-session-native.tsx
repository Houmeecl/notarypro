import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import VideoSession from "@/components/ron/VideoSession";
import { Loader2 } from "lucide-react";

export default function RonSessionNativePage() {
  const [, params] = useRoute("/ron-session-native/:sessionId");
  const sessionId = params?.sessionId || "SESSION-NEW";
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCertifier, setIsCertifier] = useState(true);
  
  useEffect(() => {
    // Simular carga de datos de sesión
    const loadSession = async () => {
      try {
        // En una implementación real, aquí se cargarían los datos de la sesión
        // y se verificaría si el usuario actual es certificador
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
  
  return (
    <div className="h-screen w-full overflow-hidden">
      <VideoSession 
        sessionId={sessionId}
        isCertifier={isCertifier}
        onSessionEnd={handleSessionEnd}
      />
    </div>
  );
}