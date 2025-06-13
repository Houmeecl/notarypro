import React, { useState, useEffect } from 'react';
// Importar correctamente la biblioteca en la versión 4.2.0
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRVerificationProps {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  demoMode?: boolean;
  sessionId?: string;
}

const QRVerification: React.FC<QRVerificationProps> = ({
  onSuccess,
  onError,
  demoMode = false,
  sessionId
}) => {
  const [qrData, setQrData] = useState<string>('');
  type VerificationStatusType = 'waiting' | 'processing' | 'completed' | 'error';
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatusType>('waiting');
  const [statusMessage, setStatusMessage] = useState<string>('Esperando escaneo del código QR');
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();
  
  // Generar un ID único para la sesión de verificación si no se proporciona uno
  useEffect(() => {
    // Usar el sessionId proporcionado o generar uno nuevo
    const verificationId = sessionId || generateUniqueId();
    
    // Construir URL completa para el código QR
    const baseUrl = window.location.origin;
    const verificationUrl = `${baseUrl}/verificacion-nfc?session=${verificationId}`;
    
    setQrData(verificationUrl);
    
    // Si estamos en modo demo, simulamos el proceso completo
    if (demoMode) {
      simulateVerificationProcess();
    } else {
      // En modo real, configuramos polling para verificar el estado
      startStatusPolling(verificationId);
    }
    
    // Limpieza
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [sessionId, demoMode]);
  
  // Generar un ID único para cada QR
  const generateUniqueId = (): string => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };
  
  // Iniciar polling para verificar el estado de la verificación
  const startStatusPolling = (verificationId: string) => {
    // Limpiar intervalo existente si hay uno
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    // Configurar nuevo intervalo
    const interval = setInterval(async () => {
      try {
        // Aquí harías una llamada a tu API para verificar el estado
        // Por ahora solo simulamos
        const status = await checkVerificationStatus(verificationId);
        
        if (status === 'completed') {
          clearInterval(interval);
          setVerificationStatus('completed');
          setStatusMessage('Verificación completada con éxito');
          
          if (onSuccess) {
            onSuccess({ verificationId });
          }
          
          toast({
            title: 'Verificación completada',
            description: 'La identidad ha sido verificada correctamente',
            variant: 'default'
          });
        } else if (status === 'processing') {
          setVerificationStatus('processing');
          setStatusMessage('Verificación en proceso...');
        } else if (status === 'error') {
          clearInterval(interval);
          setVerificationStatus('error');
          setStatusMessage('Error en la verificación');
          setError('No se pudo completar la verificación. Intente nuevamente.');
          
          if (onError) {
            onError('Error en la verificación');
          }
        }
      } catch (error) {
        console.error("Error al verificar estado:", error);
      }
    }, 5000); // Verificar cada 5 segundos
    
    setPollingInterval(interval);
  };
  
  // Función para verificar el estado de una verificación (simulada)
  const checkVerificationStatus = async (verificationId: string): Promise<VerificationStatusType> => {
    // En una implementación real, aquí harías una petición a tu API
    // Por ahora, simulamos una respuesta aleatoria para demostración
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simular probabilidades para los diferentes estados
        const rand = Math.random();
        if (rand < 0.7) {
          resolve('waiting'); // 70% probabilidad de seguir esperando
        } else if (rand < 0.9) {
          resolve('processing'); // 20% probabilidad de estar procesando
        } else {
          resolve('completed'); // 10% probabilidad de completar
        }
      }, 500);
    });
  };
  
  // Función para simular el proceso completo de verificación (para modo demo)
  const simulateVerificationProcess = () => {
    // Primero, estado esperando
    setVerificationStatus('waiting');
    setStatusMessage('Esperando escaneo del código QR');
    
    // Después de 4 segundos, estado procesando
    setTimeout(() => {
      setVerificationStatus('processing');
      setStatusMessage('Verificando identidad...');
    }, 4000);
    
    // Después de 8 segundos, completado
    setTimeout(() => {
      setVerificationStatus('completed');
      setStatusMessage('Verificación completada con éxito');
      
      if (onSuccess) {
        onSuccess({ 
          verificationId: qrData.split('session=')[1],
          method: 'qr',
          timestamp: new Date().toISOString()
        });
      }
      
      toast({
        title: 'Verificación completada',
        description: 'La identidad ha sido verificada correctamente',
        variant: 'default'
      });
    }, 8000);
  };
  
  // Reiniciar proceso de verificación
  const resetVerification = () => {
    // Limpiar estado
    setVerificationStatus('waiting');
    setStatusMessage('Esperando escaneo del código QR');
    setError(null);
    
    // Generar nuevo ID de verificación
    const verificationId = generateUniqueId();
    const baseUrl = window.location.origin;
    const verificationUrl = `${baseUrl}/verificacion-nfc?session=${verificationId}`;
    setQrData(verificationUrl);
    
    // Reiniciar simulación o polling
    if (demoMode) {
      simulateVerificationProcess();
    } else {
      startStatusPolling(verificationId);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#2d219b]">
          Verificación por Código QR
        </CardTitle>
        <CardDescription>
          Escanee este código para iniciar el proceso de verificación
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert className="mb-4 bg-red-50 text-red-800 border border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {verificationStatus === 'completed' ? (
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-green-700 mb-2">Verificación Exitosa</h2>
            <p className="text-gray-600 mb-4">
              La identidad ha sido verificada correctamente mediante código QR.
            </p>
            <Button onClick={resetVerification} variant="outline">
              Iniciar Nueva Verificación
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6">
            {/* Código QR */}
            <div className="p-4 bg-white rounded-md shadow-sm border">
              <QRCodeSVG 
                value={qrData} 
                size={200} 
                level="H" 
                includeMargin={true}
              />
            </div>
            
            {/* Estado de verificación */}
            <div className="text-center w-full">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="font-medium">{statusMessage}</span>
                {verificationStatus === 'processing' && (
                  <RefreshCw className="h-4 w-4 animate-spin text-[#2d219b]" />
                )}
                {verificationStatus === 'completed' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : null}
              </div>
              <p className="text-sm text-gray-500">
                {verificationStatus === 'waiting' && "Utilice su aplicación móvil para escanear este código QR"}
                {verificationStatus === 'processing' && "Por favor espere mientras procesamos la verificación"}
              </p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t bg-gray-50 text-sm text-gray-500 p-4 flex justify-between">
        <span>La verificación expirará en 10 minutos</span>
        {verificationStatus !== 'completed' && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetVerification} 
            className="text-[#2d219b] hover:text-[#1a1574]"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Generar nuevo código
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default QRVerification;