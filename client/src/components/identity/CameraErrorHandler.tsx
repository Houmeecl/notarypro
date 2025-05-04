/**
 * Componente de manejo de errores de cámara para VecinoXpress POS
 * 
 * Este componente gestiona errores relacionados con la cámara en dispositivos POS,
 * proporciona soluciones para problemas comunes y genera informes detallados.
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, HelpCircle, FileInput, Camera } from "lucide-react";
import { 
  reportCameraError, 
  ErrorSeverity, 
  errorReporter 
} from "@/lib/errorReporting";
import { useRemoteConfig } from "@/lib/remoteConfig";

interface CameraErrorHandlerProps {
  error: any;
  onRetry: () => void;
  onSwitchCamera?: () => void;
  onUseFileUpload?: () => void;
  deviceType?: string;
  errorContext?: Record<string, any>;
}

export default function CameraErrorHandler({
  error,
  onRetry,
  onSwitchCamera,
  onUseFileUpload,
  deviceType = 'unknown',
  errorContext = {}
}: CameraErrorHandlerProps) {
  const [errorId, setErrorId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showAdvancedInfo, setShowAdvancedInfo] = useState(false);
  const { config } = useRemoteConfig();
  
  // Determinar el tipo de error de cámara
  const errorType = determineCameraErrorType(error);
  const errorTitle = getCameraErrorTitle(errorType);
  const errorDescription = getCameraErrorDescription(errorType, deviceType);
  const errorSolution = getCameraErrorSolution(errorType, deviceType);
  const isCritical = errorType === 'hardware_failure' || errorType === 'browser_unsupported';
  
  // Registrar el error cuando se monta el componente
  useEffect(() => {
    const reportError = async () => {
      const severity = isCritical ? ErrorSeverity.CRITICAL : ErrorSeverity.ERROR;
      const id = await reportCameraError(
        errorTitle,
        {
          errorType,
          errorMessage: error?.message || 'Unknown error',
          deviceType,
          retryCount,
          ...errorContext
        }
      );
      setErrorId(id);
    };
    
    reportError();
  }, [error, errorType, isCritical, deviceType, retryCount, errorContext]);
  
  // Manejar reintento
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    
    // Registrar la acción del usuario
    if (errorId) {
      errorReporter.recordUserAction(errorId, 'retry_camera');
    }
    
    onRetry();
  };
  
  // Manejar cambio de cámara
  const handleSwitchCamera = () => {
    // Registrar la acción del usuario
    if (errorId) {
      errorReporter.recordUserAction(errorId, 'switch_camera');
    }
    
    if (onSwitchCamera) {
      onSwitchCamera();
    }
  };
  
  // Manejar subida de archivo
  const handleFileUpload = () => {
    // Registrar la acción del usuario
    if (errorId) {
      errorReporter.recordUserAction(errorId, 'use_file_upload');
    }
    
    if (onUseFileUpload) {
      onUseFileUpload();
    }
  };
  
  // Renderizar información avanzada
  const renderAdvancedInfo = () => {
    if (!showAdvancedInfo) return null;
    
    return (
      <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs font-mono">
        <p className="font-semibold mb-1">Error ID: {errorId || 'Sin ID'}</p>
        <p className="mb-1">Tipo: {errorType}</p>
        <p className="mb-1">Dispositivo: {deviceType}</p>
        <p className="mb-1">Mensaje: {error?.message || 'Sin mensaje'}</p>
        {error?.stack && (
          <p className="whitespace-pre-wrap overflow-auto max-h-24">
            Stack: {error.stack}
          </p>
        )}
      </div>
    );
  };
  
  return (
    <Card className="w-full border-red-200 shadow-sm">
      <CardHeader className="bg-red-50 border-b border-red-100 pb-3">
        <CardTitle className="flex items-center text-red-700 text-lg">
          <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
          {errorTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="mb-4">
          <p className="mb-2">{errorDescription}</p>
          <div className="p-3 bg-blue-50 rounded-md border border-blue-100 text-blue-700 text-sm">
            <p className="font-medium mb-1">Solución recomendada:</p>
            <p>{errorSolution}</p>
          </div>
        </div>
        
        {/* Información de diagnóstico avanzada */}
        {renderAdvancedInfo()}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 pt-0">
        <Button 
          className="w-full bg-[#2d219b] hover:bg-[#2d219b]/90" 
          onClick={handleRetry}
          disabled={isCritical && retryCount >= 3}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Reintentar acceso a cámara
        </Button>
        
        {onSwitchCamera && (
          <Button 
            variant="outline" 
            className="w-full border-[#2d219b]/30 text-[#2d219b]"
            onClick={handleSwitchCamera}
          >
            <Camera className="mr-2 h-4 w-4" />
            Cambiar cámara
          </Button>
        )}
        
        {onUseFileUpload && (
          <Button 
            variant="outline" 
            className="w-full border-[#2d219b]/30 text-[#2d219b]"
            onClick={handleFileUpload}
          >
            <FileInput className="mr-2 h-4 w-4" />
            Subir archivo en su lugar
          </Button>
        )}
        
        <Button 
          variant="ghost"
          className="w-full text-xs text-gray-500"
          onClick={() => setShowAdvancedInfo(!showAdvancedInfo)}
        >
          <HelpCircle className="mr-1 h-3 w-3" />
          {showAdvancedInfo ? 'Ocultar diagnóstico' : 'Mostrar diagnóstico'}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Funciones auxiliares para manejar tipos de errores de cámara

// Determina el tipo de error basado en el mensaje y propiedades
function determineCameraErrorType(error: any): string {
  if (!error) return 'unknown';
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorName = error.name?.toLowerCase() || '';
  
  if (errorName === 'notfounderror' || errorMessage.includes('could not find') || 
      errorMessage.includes('no encuentra')) {
    return 'not_found';
  }
  
  if (errorName === 'notallowederror' || errorMessage.includes('permission') || 
      errorMessage.includes('denied') || errorMessage.includes('permiso') || 
      errorMessage.includes('denegado')) {
    return 'permission_denied';
  }
  
  if (errorName === 'notsupportederror' || errorMessage.includes('not supported') || 
      errorMessage.includes('no soportado')) {
    return 'not_supported';
  }
  
  if (errorName === 'aborterror' || errorMessage.includes('aborted') || 
      errorMessage.includes('abortado')) {
    return 'aborted';
  }
  
  if (errorName === 'securityerror' || errorMessage.includes('security') || 
      errorMessage.includes('seguridad')) {
    return 'security';
  }
  
  if (errorName === 'overconstrainederror' || errorMessage.includes('constraint') || 
      errorMessage.includes('restriccion')) {
    return 'constraints';
  }
  
  if (errorMessage.includes('hardware') || errorMessage.includes('device') || 
      errorMessage.includes('dispositivo')) {
    return 'hardware_failure';
  }
  
  if (errorMessage.includes('busy') || errorMessage.includes('ocupado') || 
      errorMessage.includes('in use') || errorMessage.includes('en uso')) {
    return 'in_use';
  }
  
  if (errorMessage.includes('browser') || errorMessage.includes('navegador')) {
    return 'browser_unsupported';
  }
  
  return 'unknown';
}

// Obtiene un título descriptivo para cada tipo de error
function getCameraErrorTitle(errorType: string): string {
  switch (errorType) {
    case 'not_found':
      return 'Cámara no encontrada';
    case 'permission_denied':
      return 'Permiso de cámara denegado';
    case 'not_supported':
      return 'Cámara no soportada';
    case 'aborted':
      return 'Acceso a cámara cancelado';
    case 'security':
      return 'Error de seguridad';
    case 'constraints':
      return 'Configuración de cámara incompatible';
    case 'hardware_failure':
      return 'Problema con hardware de cámara';
    case 'in_use':
      return 'Cámara en uso';
    case 'browser_unsupported':
      return 'Navegador no compatible';
    default:
      return 'Error de cámara desconocido';
  }
}

// Obtiene una descripción detallada para cada tipo de error
function getCameraErrorDescription(errorType: string, deviceType: string): string {
  switch (errorType) {
    case 'not_found':
      return `No se ha podido encontrar una cámara en este ${deviceType}. Es posible que el dispositivo no tenga cámara o que esté desconectada.`;
    case 'permission_denied':
      return 'No se ha otorgado permiso para acceder a la cámara. Es necesario permitir el acceso para usar esta función.';
    case 'not_supported':
      return `La función de cámara no está soportada en este ${deviceType} o navegador.`;
    case 'aborted':
      return 'El acceso a la cámara ha sido cancelado antes de completarse.';
    case 'security':
      return 'Error de seguridad al intentar acceder a la cámara. Esto puede deberse a políticas de seguridad del navegador.';
    case 'constraints':
      return 'La configuración solicitada para la cámara no es compatible con el dispositivo. Por ejemplo, la resolución requerida puede no estar disponible.';
    case 'hardware_failure':
      return `Ha ocurrido un problema con el hardware de la cámara en este ${deviceType}.`;
    case 'in_use':
      return 'La cámara está siendo utilizada por otra aplicación. Cierre otras aplicaciones que puedan estar usando la cámara.';
    case 'browser_unsupported':
      return 'Este navegador o entorno no es compatible con las funciones de cámara necesarias.';
    default:
      return 'Se ha producido un error desconocido al intentar acceder a la cámara.';
  }
}

// Obtiene una solución recomendada para cada tipo de error
function getCameraErrorSolution(errorType: string, deviceType: string): string {
  switch (errorType) {
    case 'not_found':
      return `Si este ${deviceType} debería tener una cámara, verifique que no esté desconectada o desactivada en la configuración. Como alternativa, puede subir una imagen manualmente.`;
    case 'permission_denied':
      return 'Verifique la configuración de permisos en su navegador o dispositivo y asegúrese de permitir el acceso a la cámara para esta aplicación. Luego intente nuevamente.';
    case 'not_supported':
      return 'Intente utilizar un navegador diferente como Chrome o Firefox, o utilice la opción para subir una imagen manualmente.';
    case 'aborted':
      return 'Intente acceder a la cámara nuevamente. Si el problema persiste, reinicie el navegador.';
    case 'security':
      return 'Asegúrese de que está usando una conexión segura (HTTPS). Si el problema persiste, intente con otro navegador o utilice la opción para subir una imagen manualmente.';
    case 'constraints':
      return 'Intente cambiar entre cámara frontal y trasera, o use la cámara con una configuración diferente.';
    case 'hardware_failure':
      return `Es posible que la cámara del ${deviceType} no esté funcionando correctamente. Reinicie el dispositivo e intente nuevamente, o utilice la opción para subir una imagen manualmente.`;
    case 'in_use':
      return 'Cierre otras aplicaciones o pestañas del navegador que puedan estar utilizando la cámara y luego intente nuevamente.';
    case 'browser_unsupported':
      return 'Intente acceder desde un navegador moderno como Chrome, Firefox o Safari, o utilice la opción para subir una imagen manualmente.';
    default:
      return 'Reinicie la aplicación e intente nuevamente. Si el problema persiste, utilice la opción para subir una imagen manualmente o contacte a soporte técnico.';
  }
}