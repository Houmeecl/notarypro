import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CedulaChilenaData, 
  NFCReadStatus, 
  NFCReaderType,
  checkNFCAvailability,
  readCedulaChilena,
  validarRut,
  formatearRut
} from '@/lib/nfc-reader';
import { Loader2, CreditCard, Shield, CheckCircle, AlertTriangle, Smartphone } from 'lucide-react';

interface NFCIdentityReaderProps {
  onSuccess: (data: CedulaChilenaData) => void;
  onCancel: () => void;
}

const NFCIdentityReader: React.FC<NFCIdentityReaderProps> = ({ onSuccess, onCancel }) => {
  const [isReading, setIsReading] = useState<boolean>(false);
  const [status, setStatus] = useState<NFCReadStatus>(NFCReadStatus.INACTIVE);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [nfcAvailable, setNfcAvailable] = useState<boolean>(false);
  const [readerType, setReaderType] = useState<NFCReaderType | undefined>(undefined);
  const [cedulaData, setCedulaData] = useState<CedulaChilenaData | null>(null);

  // Comprobar disponibilidad de NFC al cargar el componente
  useEffect(() => {
    async function checkAvailability() {
      const { available, readerType } = await checkNFCAvailability();
      setNfcAvailable(available);
      setReaderType(readerType);
    }
    
    checkAvailability();
  }, []);

  // Manejador para el cambio de estado NFC
  const handleNFCStatusChange = useCallback((newStatus: NFCReadStatus, message?: string) => {
    setStatus(newStatus);
    if (message) {
      setStatusMessage(message);
    }
    
    if (newStatus === NFCReadStatus.WAITING || newStatus === NFCReadStatus.READING) {
      setIsReading(true);
    } else {
      setIsReading(false);
    }
  }, []);

  // Iniciar lectura NFC
  const startReading = useCallback(async () => {
    if (!nfcAvailable) {
      setStatus(NFCReadStatus.ERROR);
      setStatusMessage('NFC no disponible en este dispositivo');
      return;
    }
    
    setCedulaData(null);
    setIsReading(true);
    
    try {
      const data = await readCedulaChilena(handleNFCStatusChange, readerType);
      
      if (data) {
        setCedulaData(data);
        // Validar RUT
        if (!validarRut(data.rut)) {
          setStatus(NFCReadStatus.ERROR);
          setStatusMessage('El RUT leído no es válido');
          return;
        }
        
        // Llamar al callback de éxito
        onSuccess(data);
      }
    } catch (error) {
      setStatus(NFCReadStatus.ERROR);
      setStatusMessage(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setIsReading(false);
    }
  }, [nfcAvailable, readerType, handleNFCStatusChange, onSuccess]);

  // Cancelar lectura
  const cancelReading = () => {
    setIsReading(false);
    setStatus(NFCReadStatus.INACTIVE);
    onCancel();
  };

  // Determinar texto y estilo según el tipo de lector
  const getReaderTypeInfo = () => {
    switch (readerType) {
      case NFCReaderType.WEB_NFC:
        return {
          text: 'Lector NFC del dispositivo móvil',
          icon: <Smartphone className="h-5 w-5 mr-2" />
        };
      case NFCReaderType.POS_DEVICE:
        return {
          text: 'Lector NFC del dispositivo POS',
          icon: <CreditCard className="h-5 w-5 mr-2" />
        };
      case NFCReaderType.ANDROID_HOST:
        return {
          text: 'Lector NFC Android',
          icon: <Smartphone className="h-5 w-5 mr-2" />
        };
      default:
        return {
          text: 'Lector NFC',
          icon: <CreditCard className="h-5 w-5 mr-2" />
        };
    }
  };

  // Contenido según el estado de la lectura
  const renderContent = () => {
    const readerInfo = getReaderTypeInfo();
    
    if (isReading) {
      return (
        <>
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Leyendo cédula de identidad
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              {statusMessage || 'Acerque la cédula al lector NFC'}
            </p>
            
            <div className="flex items-center justify-center mt-2 text-blue-600 text-sm">
              {readerInfo.icon}
              <span>{readerInfo.text}</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={cancelReading} 
            className="mt-4 w-full"
          >
            Cancelar
          </Button>
        </>
      );
    }
    
    if (status === NFCReadStatus.ERROR) {
      return (
        <>
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {statusMessage || 'Se produjo un error al leer la cédula'}
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={cancelReading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={startReading}
            >
              Intentar nuevamente
            </Button>
          </div>
        </>
      );
    }
    
    if (status === NFCReadStatus.SUCCESS && cedulaData) {
      return (
        <>
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            <AlertTitle className="text-green-800">Lectura exitosa</AlertTitle>
            <AlertDescription className="text-green-700">
              Se ha leído correctamente la información de la cédula
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">RUT</p>
                <p className="text-base font-semibold">{formatearRut(cedulaData.rut)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Nombres</p>
                <p className="text-base font-semibold">{cedulaData.nombres}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Apellidos</p>
                <p className="text-base font-semibold">{cedulaData.apellidos}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha de nacimiento</p>
                <p className="text-base font-semibold">{cedulaData.fechaNacimiento}</p>
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <Button 
                variant="outline" 
                onClick={cancelReading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => onSuccess(cedulaData)}
              >
                Confirmar identidad
              </Button>
            </div>
          </div>
        </>
      );
    }
    
    // Estado inicial o inactivo
    if (!nfcAvailable) {
      return (
        <>
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertTitle>NFC no disponible</AlertTitle>
            <AlertDescription>
              Este dispositivo no cuenta con capacidad NFC o no está habilitada.
              Por favor, utilice otro método de verificación de identidad.
            </AlertDescription>
          </Alert>
          
          <Button 
            variant="outline" 
            onClick={cancelReading} 
            className="w-full"
          >
            Cancelar
          </Button>
        </>
      );
    }
    
    return (
      <>
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Shield className="h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Verificación mediante NFC
          </h3>
          <p className="text-sm text-gray-600 text-center mb-4">
            Lea los datos de la cédula de identidad utilizando el chip NFC incorporado
          </p>
          
          <div className="flex items-center justify-center mt-2 text-blue-600 text-sm">
            {readerInfo.icon}
            <span>{readerInfo.text} disponible</span>
          </div>
        </div>
        
        <div className="flex justify-between mt-4">
          <Button 
            variant="outline" 
            onClick={cancelReading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={startReading}
          >
            Iniciar lectura
          </Button>
        </div>
      </>
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Lectura de Cédula de Identidad</CardTitle>
        <CardDescription>
          Verificación de identidad mediante chip NFC
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default NFCIdentityReader;