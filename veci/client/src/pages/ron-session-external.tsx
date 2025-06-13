import React from 'react';
import { useParams, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { ExternalVideoService } from '@/components/ron/ExternalVideoService';

export default function RonSessionExternal() {
  const params = useParams();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  // Obtener los datos de la sesión (en una implementación real)
  const sessionId = params.id || 'SESSION-001';
  
  const handleSessionEnd = () => {
    toast({
      title: "Sesión finalizada",
      description: "La sesión RON ha sido finalizada correctamente.",
    });
    
    navigate("/ron-platform");
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      <ExternalVideoService 
        sessionId={sessionId}
        onSessionEnd={handleSessionEnd}
      />
    </div>
  );
}