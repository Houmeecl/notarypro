import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Mode = 'forced' | 'production' | 'development';

interface ForcedModeNotificationProps {
  mode: Mode;
  sessionId?: string;
}

/**
 * Componente para mostrar una notificación sobre el modo forzado
 */
const ForcedModeNotification: React.FC<ForcedModeNotificationProps> = ({ mode, sessionId }) => {
  if (mode !== 'forced') return null;

  return (
    <Alert className="mb-4 bg-amber-50 text-amber-900 border-amber-500">
      <ShieldAlert className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Modo Forzado Activo</AlertTitle>
      <AlertDescription className="text-amber-700">
        Esta es una implementación de verificación real utilizando la API de Agora para la videollamada
        {sessionId && ` (Sesión: ${sessionId})`}
      </AlertDescription>
    </Alert>
  );
};

export default ForcedModeNotification;