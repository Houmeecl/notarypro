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
import NFCMicroInteractions from '@/components/micro-interactions/NFCMicroInteractions';
import { motion } from 'framer-motion';

interface NFCIdentityReaderProps {
  onSuccess: (data: CedulaChilenaData) => void;
  onCancel: () => void;
  onError?: (error: any) => void;
}

const NFCIdentityReader: React.FC<NFCIdentityReaderProps> = ({ 
  onSuccess, 
  onCancel,
  onError 
}) => {
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
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setStatusMessage(`Error: ${errorMessage}`);
      setIsReading(false);
      
      // Llamar al callback de error si existe
      if (onError) {
        onError(error);
      }
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

  // Mapear el estado de NFCReadStatus a los estados de micro-interacciones
  const getMicroInteractionStatus = () => {
    if (isReading) {
      return 'scanning';
    }
    
    switch (status) {
      case NFCReadStatus.SUCCESS:
        return 'success';
      case NFCReadStatus.ERROR:
        return 'error';
      default:
        return 'idle';
    }
  };
  
  // Contenido según el estado de la lectura
  const renderContent = () => {
    const readerInfo = getReaderTypeInfo();
    const microInteractionStatus = getMicroInteractionStatus() as 'idle' | 'scanning' | 'success' | 'error';
    
    if (isReading) {
      return (
        <>
          <motion.div 
            className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-blue-300"
            initial={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}
            animate={{ 
              borderColor: ['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 0.3)'] 
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <NFCMicroInteractions 
              status={microInteractionStatus}
              message={statusMessage || 'Acerque la cédula al lector NFC'}
            />
            
            <div className="flex items-center justify-center mt-2 text-blue-600 text-sm">
              {readerInfo.icon}
              <span>{readerInfo.text}</span>
            </div>
          </motion.div>
          
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
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: [0, -10, 10, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <NFCMicroInteractions 
              status="error"
              message={statusMessage || 'Se produjo un error al leer la cédula'}
            />
          </motion.div>
          
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
              Intentar nuevamente
            </Button>
          </div>
        </>
      );
    }
    
    if (status === NFCReadStatus.SUCCESS && cedulaData) {
      return (
        <>
          <NFCMicroInteractions 
            status="success"
            message="Cédula verificada correctamente"
            onComplete={() => console.log("Animación de éxito completada")}
          />
          
          <motion.div 
            className="space-y-4 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="bg-white p-4 rounded-lg border border-green-100 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <p className="text-sm font-medium text-gray-500">RUT</p>
                  <p className="text-base font-semibold">{formatearRut(cedulaData.rut)}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <p className="text-sm font-medium text-gray-500">Nombres</p>
                  <p className="text-base font-semibold">{cedulaData.nombres}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <p className="text-sm font-medium text-gray-500">Apellidos</p>
                  <p className="text-base font-semibold">{cedulaData.apellidos}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                >
                  <p className="text-sm font-medium text-gray-500">Fecha de nacimiento</p>
                  <p className="text-base font-semibold">{cedulaData.fechaNacimiento}</p>
                </motion.div>
              </div>
            </div>
            
            <motion.div 
              className="flex justify-between mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
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
            </motion.div>
          </motion.div>
        </>
      );
    }
    
    // Estado inicial o inactivo
    if (!nfcAvailable) {
      return (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertTitle>NFC no disponible</AlertTitle>
              <AlertDescription>
                Este dispositivo no cuenta con capacidad NFC o no está habilitada.
                Por favor, utilice otro método de verificación de identidad.
              </AlertDescription>
            </Alert>
          </motion.div>
          
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
        <motion.div 
          className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <Shield className="h-12 w-12 text-blue-500 mb-4" />
          </motion.div>
          
          <motion.h3 
            className="text-lg font-medium text-gray-900 mb-2"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Verificación mediante NFC
          </motion.h3>
          
          <motion.p 
            className="text-sm text-gray-600 text-center mb-4"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Lea los datos de la cédula de identidad utilizando el chip NFC incorporado
          </motion.p>
          
          <motion.div 
            className="flex items-center justify-center mt-2 text-blue-600 text-sm"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {readerInfo.icon}
            <span>{readerInfo.text} disponible</span>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="flex justify-between mt-4"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button 
            variant="outline" 
            onClick={cancelReading}
          >
            Cancelar
          </Button>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={startReading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Iniciar lectura
            </Button>
          </motion.div>
        </motion.div>
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