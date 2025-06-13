/**
 * Componente de manejo de errores NFC para VecinoXpress POS
 * 
 * Este componente gestiona errores relacionados con NFC en dispositivos POS,
 * proporciona soluciones alternativas y genera informes detallados.
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, HelpCircle, Smartphone } from "lucide-react";
import { 
  reportNfcError, 
  ErrorSeverity, 
  errorReporter 
} from "@/lib/errorReporting";
import { useRemoteConfig } from "@/lib/remoteConfig";

interface NfcErrorHandlerProps {
  error: any;
  onRetry: () => void;
  onFallback?: () => void;
  deviceType?: string;
  errorContext?: Record<string, any>;
}

export default function NfcErrorHandler({
  error,
  onRetry,
  onFallback,
  deviceType = 'unknown',
  errorContext = {}
}: NfcErrorHandlerProps) {
  const [errorId, setErrorId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showAdvancedInfo, setShowAdvancedInfo] = useState(false);
  const { config } = useRemoteConfig();
  
  // Determinar el tipo de error NFC
  const errorType = determineNfcErrorType(error);
  const errorTitle = getNfcErrorTitle(errorType);
  const errorDescription = getNfcErrorDescription(errorType, deviceType);
  const errorSolution = getNfcErrorSolution(errorType, deviceType);
  const isCritical = errorType === 'hardware_failure' || errorType === 'security_failure';
  
  // Registrar el error cuando se monta el componente
  useEffect(() => {
    const reportError = async () => {
      const severity = isCritical ? ErrorSeverity.CRITICAL : ErrorSeverity.ERROR;
      const id = await reportNfcError(
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
      
      // Capturar pantalla automáticamente para errores críticos
      if (isCritical) {
        captureScreenshot(id);
      }
    };
    
    reportError();
  }, [error, errorType, isCritical, deviceType, retryCount, errorContext]);
  
  // Capturar una captura de pantalla para el error
  const captureScreenshot = async (id: string) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Capturar HTML como imagen
        const data = canvas.toDataURL('image/png');
        
        // Adjuntar al error
        await errorReporter.attachScreenshotToLatestError(data);
      }
    } catch (e) {
      console.error('Error al capturar pantalla:', e);
    }
  };
  
  // Manejar reintento
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    
    // Registrar la acción del usuario
    if (errorId) {
      errorReporter.recordUserAction(errorId, 'retry_nfc_read');
    }
    
    onRetry();
  };
  
  // Manejar alternativa
  const handleFallback = () => {
    // Registrar la acción del usuario
    if (errorId) {
      errorReporter.recordUserAction(errorId, 'switch_to_fallback');
    }
    
    if (onFallback) {
      onFallback();
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
    <Card className="w-full border-orange-200 shadow-sm">
      <CardHeader className="bg-orange-50 border-b border-orange-100 pb-3">
        <CardTitle className="flex items-center text-orange-700 text-lg">
          <AlertCircle className="mr-2 h-5 w-5 text-orange-500" />
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
          disabled={isCritical && retryCount >= (config.nfc?.maxRetries || 3)}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Reintentar lectura NFC
        </Button>
        
        {onFallback && (
          <Button 
            variant="outline" 
            className="w-full border-[#2d219b]/30 text-[#2d219b]"
            onClick={handleFallback}
          >
            <Smartphone className="mr-2 h-4 w-4" />
            Usar método alternativo
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

// Funciones auxiliares para manejar tipos de errores NFC

// Determina el tipo de error basado en el mensaje y propiedades
function determineNfcErrorType(error: any): string {
  if (!error) return 'unknown';
  
  const errorMessage = error.message?.toLowerCase() || '';
  
  if (errorMessage.includes('timeout') || errorMessage.includes('tiempo')) {
    return 'timeout';
  }
  
  if (errorMessage.includes('permission') || errorMessage.includes('permiso')) {
    return 'permission_denied';
  }
  
  if (errorMessage.includes('not supported') || errorMessage.includes('no soportado')) {
    return 'not_supported';
  }
  
  if (errorMessage.includes('not enabled') || errorMessage.includes('desactivado')) {
    return 'not_enabled';
  }
  
  if (errorMessage.includes('security') || errorMessage.includes('seguridad')) {
    return 'security_failure';
  }
  
  if (errorMessage.includes('hardware') || errorMessage.includes('dispositivo')) {
    return 'hardware_failure';
  }
  
  if (errorMessage.includes('tag') || errorMessage.includes('tarjeta')) {
    return 'tag_error';
  }
  
  if (errorMessage.includes('read') || errorMessage.includes('lectura')) {
    return 'read_error';
  }
  
  if (errorMessage.includes('invalid') || errorMessage.includes('inválido')) {
    return 'invalid_data';
  }
  
  return 'unknown';
}

// Obtiene un título descriptivo para cada tipo de error
function getNfcErrorTitle(errorType: string): string {
  switch (errorType) {
    case 'timeout':
      return 'Tiempo de espera agotado';
    case 'permission_denied':
      return 'Permiso NFC denegado';
    case 'not_supported':
      return 'NFC no soportado';
    case 'not_enabled':
      return 'NFC desactivado';
    case 'security_failure':
      return 'Error de seguridad NFC';
    case 'hardware_failure':
      return 'Problema con hardware NFC';
    case 'tag_error':
      return 'Error en tarjeta/chip NFC';
    case 'read_error':
      return 'Error de lectura NFC';
    case 'invalid_data':
      return 'Datos NFC inválidos';
    default:
      return 'Error de NFC desconocido';
  }
}

// Obtiene una descripción detallada para cada tipo de error
function getNfcErrorDescription(errorType: string, deviceType: string): string {
  switch (errorType) {
    case 'timeout':
      return 'La lectura NFC ha tomado demasiado tiempo. Esto puede ocurrir si la tarjeta no se mantiene cerca del lector el tiempo suficiente.';
    case 'permission_denied':
      return 'La aplicación no tiene permiso para acceder al lector NFC. Esto puede requerir cambiar la configuración del dispositivo.';
    case 'not_supported':
      return `El ${deviceType} no tiene soporte para NFC o la funcionalidad no está disponible en este navegador.`;
    case 'not_enabled':
      return 'La función NFC está desactivada en este dispositivo. Es necesario activarla en la configuración.';
    case 'security_failure':
      return 'Ha ocurrido un problema de seguridad al intentar leer el chip NFC.';
    case 'hardware_failure':
      return `Ha ocurrido un problema con el hardware NFC del ${deviceType}. Es posible que el lector NFC no esté funcionando correctamente.`;
    case 'tag_error':
      return 'No se pudo leer correctamente la tarjeta o chip NFC. La tarjeta puede estar dañada o no ser compatible.';
    case 'read_error':
      return 'Error al leer los datos del chip NFC. Puede deberse a una mala conexión o a que la tarjeta se movió durante la lectura.';
    case 'invalid_data':
      return 'Los datos leídos del chip NFC no son válidos o no tienen el formato esperado.';
    default:
      return 'Se ha producido un error desconocido al intentar utilizar la funcionalidad NFC.';
  }
}

// Obtiene una solución recomendada para cada tipo de error
function getNfcErrorSolution(errorType: string, deviceType: string): string {
  switch (errorType) {
    case 'timeout':
      return 'Mantenga la tarjeta o documento cerca del lector NFC sin moverla hasta que se complete la lectura. Intente nuevamente.';
    case 'permission_denied':
      return 'Vaya a la configuración del dispositivo y asegúrese de que la aplicación tenga permiso para usar NFC. Luego intente nuevamente.';
    case 'not_supported':
      return `Este ${deviceType} no es compatible con NFC. Utilice otro dispositivo o el método alternativo de verificación.`;
    case 'not_enabled':
      return 'Active NFC en la configuración del dispositivo y luego intente nuevamente.';
    case 'security_failure':
      return 'Reinicie la aplicación e intente nuevamente. Si el problema persiste, contacte a soporte técnico.';
    case 'hardware_failure':
      return `Es posible que el lector NFC del ${deviceType} no esté funcionando correctamente. Reinicie el dispositivo e intente nuevamente. Si el problema persiste, utilice el método alternativo.`;
    case 'tag_error':
      return 'Verifique que la tarjeta o documento esté en buen estado, e intente acercarla nuevamente al lector NFC. Si el problema persiste, utilice el método alternativo.';
    case 'read_error':
      return 'Mantenga la tarjeta o documento inmóvil cerca del lector NFC. Asegúrese de que no haya otras tarjetas NFC cerca que puedan interferir.';
    case 'invalid_data':
      return 'La tarjeta o documento puede no ser compatible o estar dañado. Intente con otro documento o utilice el método alternativo.';
    default:
      return 'Reinicie la aplicación e intente nuevamente. Si el problema persiste, utilice el método alternativo o contacte a soporte técnico.';
  }
}