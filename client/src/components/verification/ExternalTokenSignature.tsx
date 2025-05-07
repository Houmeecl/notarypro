import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UsbIcon, ShieldAlert, RotateCcw, CheckCircle, Send, AlertTriangle, Key } from 'lucide-react';
import { externalTokenService } from '@/services/external-token-service';
import { Skeleton } from '@/components/ui/skeleton';

// Logo de eCert Chile
import eCertLogo from '@/assets/new/ecert-logo.png';

interface ExternalTokenSignatureProps {
  onSignatureComplete: (signature: string) => void;
  onCancel?: () => void;
  documentId: string;
  documentHash?: string;
  clientName?: string;
}

const ExternalTokenSignature: React.FC<ExternalTokenSignatureProps> = ({
  onSignatureComplete,
  onCancel,
  documentId,
  documentHash = "SHA256-" + Math.random().toString(36).substring(2, 15),
  clientName
}) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const [isCheckingDevice, setIsCheckingDevice] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  
  // Inicializar el servicio al cargar el componente
  useEffect(() => {
    const initializeService = async () => {
      try {
        setIsInitializing(true);
        await externalTokenService.initialize();
        const connected = await externalTokenService.checkDeviceConnected();
        setIsDeviceConnected(connected);
        
        if (connected) {
          const info = externalTokenService.getDeviceInfo();
          setDeviceInfo(info);
        }
      } catch (error) {
        console.error("Error inicializando servicio:", error);
        setError("No se pudo inicializar el servicio de firma externa");
      } finally {
        setIsInitializing(false);
      }
    };
    
    initializeService();
  }, []);
  
  // Solicitar conexión del dispositivo
  const requestDeviceConnection = async () => {
    try {
      setIsCheckingDevice(true);
      setError(null);
      
      const connected = await externalTokenService.requestDeviceConnection();
      setIsDeviceConnected(connected);
      
      if (connected) {
        const info = externalTokenService.getDeviceInfo();
        setDeviceInfo(info);
      } else {
        setError("No se detectó ningún dispositivo de firma");
      }
    } catch (error) {
      console.error("Error solicitando conexión:", error);
      setError("Error al buscar dispositivos de firma");
    } finally {
      setIsCheckingDevice(false);
    }
  };
  
  // Firmar documento
  const signDocument = async () => {
    try {
      setIsSigning(true);
      setError(null);
      
      if (!isDeviceConnected) {
        setError("No hay dispositivo de firma conectado");
        setIsSigning(false);
        return;
      }
      
      const signature = await externalTokenService.signDocument(documentHash, pin);
      
      if (signature) {
        onSignatureComplete(signature);
      } else {
        setError("No se pudo completar la firma");
      }
    } catch (error) {
      console.error("Error firmando documento:", error);
      setError("Error al firmar el documento");
    } finally {
      setIsSigning(false);
    }
  };
  
  // Reintentar conexión
  const retry = () => {
    setError(null);
    requestDeviceConnection();
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UsbIcon className="h-5 w-5 text-[#2d219b]" />
          Firma con Token Externo
        </CardTitle>
        <CardDescription>
          Utilice su dispositivo de firma electrónica para firmar el documento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {clientName && (
          <div className="text-sm font-medium mb-4">
            Firmante: <span className="text-gray-600">{clientName}</span>
          </div>
        )}
        
        {isInitializing ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <div className="flex justify-center py-4">
              <div className="animate-spin w-8 h-8 border-4 border-[#2d219b] border-t-transparent rounded-full"></div>
            </div>
          </div>
        ) : isDeviceConnected ? (
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <img src={eCertLogo} alt="eCert Chile Logo" className="h-12" />
            </div>
            
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Dispositivo de firma SafeNet eCert Chile detectado
              </AlertDescription>
            </Alert>
            
            {deviceInfo && (
              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                <h4 className="font-semibold mb-2">Información del dispositivo:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium">Tipo:</span> {deviceInfo.type}
                  </div>
                  <div>
                    <span className="font-medium">Fabricante:</span> {deviceInfo.manufacturer}
                  </div>
                  <div>
                    <span className="font-medium">Modelo:</span> {deviceInfo.model}
                  </div>
                  <div>
                    <span className="font-medium">S/N:</span> {deviceInfo.serialNumber}
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="token-pin">PIN del dispositivo</Label>
              <Input 
                id="token-pin"
                type="password"
                placeholder="Ingrese el PIN del dispositivo"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                Ingrese el PIN asociado a su dispositivo de firma para autorizar la operación
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-sm">
              <h4 className="font-semibold mb-2">Detalles del documento:</h4>
              <div>
                <span className="font-medium">ID:</span> {documentId}
              </div>
              <div>
                <span className="font-medium">Hash:</span> <span className="font-mono text-xs">{documentHash}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription>
                No se ha detectado ningún dispositivo de firma electrónica
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 p-6 rounded-lg flex flex-col items-center text-center">
              <UsbIcon className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="font-medium text-lg mb-2">Conecte su dispositivo</h3>
              <p className="text-sm text-gray-600 mb-4">
                Por favor, conecte su token de firma electrónica o tarjeta inteligente al puerto USB de su computadora.
              </p>
              <Button 
                variant="outline"
                onClick={requestDeviceConnection}
                disabled={isCheckingDevice}
                className="mb-2"
              >
                {isCheckingDevice ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                    Buscando dispositivo...
                  </>
                ) : (
                  <>
                    <UsbIcon className="h-4 w-4 mr-2" />
                    Detectar dispositivo
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500">
                Asegúrese de que su dispositivo esté correctamente conectado y los controladores instalados
              </p>
            </div>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="text-xs text-gray-500 italic mt-1">
          Al firmar este documento con su dispositivo de firma electrónica, acepta los términos legales y confirma que toda la información proporcionada es correcta.
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {onCancel && (
          <Button 
            variant="ghost" 
            onClick={onCancel}
            disabled={isSigning}
          >
            Cancelar
          </Button>
        )}
        
        <div className="space-x-2 ml-auto">
          {!isDeviceConnected && !isInitializing && (
            <Button 
              variant="outline" 
              onClick={retry}
              disabled={isCheckingDevice}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          )}
          
          <Button 
            className="bg-[#2d219b] hover:bg-[#241a7d] text-white" 
            onClick={signDocument}
            disabled={!isDeviceConnected || isSigning || !pin}
          >
            {isSigning ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                Firmando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Firmar
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ExternalTokenSignature;