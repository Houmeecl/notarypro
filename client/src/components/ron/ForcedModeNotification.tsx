/**
 * Componente para mostrar notificaciones de modo forzado en RON
 * 
 * Este componente muestra un mensaje claro para indicar que el sistema
 * está funcionando en modo forzado/producción.
 */

import React from 'react';
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ForcedModeNotificationProps {
  mode: 'production' | 'development' | 'forced';
  showDetails?: boolean;
}

const ForcedModeNotification = ({ 
  mode = 'forced',
  showDetails = true 
}: ForcedModeNotificationProps) => {

  // Determinar estilo y mensaje según el modo
  let icon;
  let title;
  let description;
  let alertClass;

  switch (mode) {
    case 'production':
      icon = <CheckCircle className="h-5 w-5 text-green-600 mr-2" />;
      title = "Sistema en modo PRODUCCIÓN";
      description = "Todas las verificaciones y firmas tienen validez legal según Ley 19.799.";
      alertClass = "bg-green-50 border-green-200 text-green-800";
      break;
    case 'development':
      icon = <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />;
      title = "Sistema en modo PRUEBA";
      description = "Las verificaciones y firmas no tienen validez legal.";
      alertClass = "bg-amber-50 border-amber-200 text-amber-800";
      break;
    case 'forced':
    default:
      icon = <Shield className="h-5 w-5 text-indigo-600 mr-2" />;
      title = "Sistema en MODO FORZADO";
      description = "Modo de producción activado manualmente con validez legal según Ley 19.799.";
      alertClass = "bg-indigo-50 border-indigo-200 text-indigo-800";
  }

  return (
    <Alert className={`mb-4 border ${alertClass}`}>
      <div className="flex items-center">
        {icon}
        <span className="font-semibold">{title}</span>
      </div>
      {showDetails && (
        <AlertDescription className="mt-2 ml-7">
          {description}
        </AlertDescription>
      )}
    </Alert>
  );
};

export default ForcedModeNotification;