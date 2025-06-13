import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, Smartphone, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRVerificationFlowProps {
  documentId: string;
  clientName: string;
  onVerificationComplete?: (verified: boolean) => void;
}

const QRVerificationFlow: React.FC<QRVerificationFlowProps> = ({ 
  documentId, 
  clientName, 
  onVerificationComplete 
}) => {
  const [qrValue, setQrValue] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [status, setStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [statusMessage, setStatusMessage] = useState<string>('Esperando verificación del cliente');
  const { toast } = useToast();

  useEffect(() => {
    // Crear una sesión de verificación QR
    const createVerificationSession = async () => {
      try {
        // En producción, esto haría una llamada a la API para obtener un identificador de sesión
        const tempSessionId = `vs-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Construir la URL que se codificará en el QR
        const verificationUrl = `${window.location.origin}/verificacion-movil/${tempSessionId}`;
        
        setSessionId(tempSessionId);
        setQrValue(verificationUrl);
        
        // Iniciar el polling para verificar el estado
        startPolling(tempSessionId);
      } catch (error) {
        console.error('Error al crear sesión de verificación:', error);
        toast({
          title: 'Error',
          description: 'No se pudo generar el código QR de verificación',
          variant: 'destructive',
        });
      }
    };

    createVerificationSession();
  }, [toast, documentId]);

  const startPolling = (sid: string) => {
    // En una implementación real, esto consultaría una API para verificar
    // si el usuario ya completó el proceso en su dispositivo móvil
    
    // Simulamos el polling con un temporizador para la demo
    const pollInterval = setInterval(() => {
      // En producción: Consultar el estado mediante API
      const checkVerificationStatus = async () => {
        try {
          // Simulación de endpoint: GET /api/verification/session/:sessionId
          console.log(`Verificando estado de sesión ${sid}...`);
          
          // Para la demo, simulamos una verificación exitosa después de 20 segundos
          // En producción, esto se reemplazaría con la consulta real
          if (Date.now() - parseInt(sid.split('-')[1]) > 20000) {
            clearInterval(pollInterval);
            setStatus('completed');
            setStatusMessage('Verificación completada con éxito');
            
            toast({
              title: 'Verificación completada',
              description: 'El cliente ha completado la verificación de identidad',
            });
            
            if (onVerificationComplete) {
              onVerificationComplete(true);
            }
          }
        } catch (error) {
          console.error('Error al verificar estado:', error);
        }
      };
      
      checkVerificationStatus();
    }, 3000); // Verificar cada 3 segundos
    
    // Limpiar intervalo al desmontar
    return () => clearInterval(pollInterval);
  };

  const cancelVerification = () => {
    setStatus('failed');
    setStatusMessage('Verificación cancelada');
    
    if (onVerificationComplete) {
      onVerificationComplete(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-[#2d219b]" />
          Verificación Móvil
        </CardTitle>
        <CardDescription>
          Envíe este código QR al cliente para que complete la verificación en su dispositivo
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center space-y-4">
        {status === 'pending' && qrValue && (
          <div className="p-3 bg-white rounded-lg border-2 border-[#4863f7]">
            <QRCodeSVG value={qrValue} size={200} />
          </div>
        )}
        
        {status === 'processing' && (
          <div className="flex items-center justify-center w-full p-10">
            <Loader2 className="h-12 w-12 animate-spin text-[#2d219b]" />
          </div>
        )}
        
        {status === 'completed' && (
          <div className="flex flex-col items-center justify-center w-full p-10">
            <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
            <p className="text-lg font-medium text-center">Verificación completada con éxito</p>
          </div>
        )}
        
        <Alert className={status === 'failed' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}>
          <AlertTitle className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Estado de verificación
          </AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{statusMessage}</span>
            <Badge 
              className={
                status === 'completed' ? 'bg-green-100 text-green-800' :
                status === 'processing' ? 'bg-blue-100 text-blue-800' :
                status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }
            >
              {status === 'completed' ? 'Completado' :
               status === 'processing' ? 'En proceso' :
               status === 'failed' ? 'Fallido' :
               'Pendiente'}
            </Badge>
          </AlertDescription>
        </Alert>
        
        <div className="text-sm text-center text-gray-500 mt-2">
          <p>Cliente: <span className="font-medium">{clientName}</span></p>
          <p>ID de sesión: <span className="font-mono text-xs">{sessionId}</span></p>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={cancelVerification}
          disabled={status === 'completed' || status === 'failed'}
        >
          Cancelar
        </Button>
        
        <Button 
          className="bg-[#2d219b] hover:bg-[#241a7d] text-white"
          disabled={status !== 'completed'}
          onClick={() => {
            if (onVerificationComplete) onVerificationComplete(true);
          }}
        >
          Continuar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QRVerificationFlow;