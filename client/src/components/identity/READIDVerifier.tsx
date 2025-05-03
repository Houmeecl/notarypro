import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  Shield,
  Fingerprint,
  RefreshCw,
  AlertCircle,
  RotateCw
} from 'lucide-react';
import { NFCReadStatus, readCedulaChilena, checkNFCAvailability } from '@/lib/nfc-reader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface READIDVerifierProps {
  onSuccess: (cedulaData: any) => void;
  onError: (error: Error) => void;
  onCancel: () => void;
}

const READIDVerifier: React.FC<READIDVerifierProps> = ({ 
  onSuccess, 
  onError,
  onCancel
}) => {
  const [readStatus, setReadStatus] = useState<NFCReadStatus>(NFCReadStatus.INACTIVE);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [readingSteps, setReadingSteps] = useState<string[]>([]);
  const [nfcAvailable, setNfcAvailable] = useState<boolean>(false);
  const { toast } = useToast();

  // Detector de proximidad simulado
  const [proximityLevel, setProximityLevel] = useState<number>(0);
  
  // Efecto de verificación de NFC
  useEffect(() => {
    const checkNFC = async () => {
      try {
        const result = await checkNFCAvailability();
        setNfcAvailable(result.available);
      } catch (error) {
        setNfcAvailable(false);
        console.error('Error al verificar NFC:', error);
      }
    };
    
    checkNFC();
    
    // Escuchar eventos de proximidad NFC
    const handleProximityChange = (event: CustomEvent) => {
      setProximityLevel(event.detail.level);
    };
    
    window.addEventListener('nfc-proximity-change', handleProximityChange as EventListener);
    
    return () => {
      window.removeEventListener('nfc-proximity-change', handleProximityChange as EventListener);
    };
  }, []);

  // Iniciar la verificación
  const startVerification = async () => {
    if (!nfcAvailable) {
      toast({
        title: "NFC no disponible",
        description: "Su dispositivo no tiene NFC o no está habilitado",
        variant: "destructive",
      });
      return;
    }
    
    // Resetear el estado
    setReadStatus(NFCReadStatus.INACTIVE);
    setStatusMessage('');
    setProgress(0);
    setReadingSteps([]);
    
    // Intentar hacer vibrar el dispositivo para señalar inicio
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    
    try {
      // Simulación de proceso de verificación tipo READID
      setReadStatus(NFCReadStatus.WAITING);
      setStatusMessage('Preparando lector NFC...');
      setReadingSteps([
        'Iniciando proceso de verificación',
        'Configurando parámetros de lectura'
      ]);
      
      // Simular progreso de inicio
      await simulateProgress(0, 20);
      
      // Comenzar a escuchar NFC
      setStatusMessage('Esperando cédula chilena...');
      setReadingSteps(prev => [...prev, 'Esperando acercar documento']);
      
      // Simulación de detección
      await simulateProgress(20, 30);
      
      // Iniciar lectura real
      const cedulaData = await readCedulaChilena(
        (status, message) => {
          setReadStatus(status);
          if (message) setStatusMessage(message);
          
          // Actualizar pasos según el estado
          if (status === NFCReadStatus.READING) {
            setReadingSteps(prev => [...prev, 'Detectando chip NFC']);
            setReadingSteps(prev => [...prev, 'Leyendo información personal']);
          } else if (status === NFCReadStatus.SUCCESS) {
            setReadingSteps(prev => [...prev, 'Validando firma digital']);
            setReadingSteps(prev => [...prev, 'Verificación exitosa']);
          }
        }
      );
      
      if (cedulaData) {
        // Simulación final exitosa
        setProgress(100);
        setReadStatus(NFCReadStatus.SUCCESS);
        setStatusMessage('Verificación exitosa. Datos leídos correctamente.');
        
        // Simular verificación de datos
        setTimeout(() => {
          onSuccess(cedulaData);
        }, 1500);
      } else {
        throw new Error('No se pudieron leer datos de la cédula');
      }
    } catch (error) {
      console.error('Error en la lectura NFC:', error);
      setReadStatus(NFCReadStatus.ERROR);
      setStatusMessage(error instanceof Error ? error.message : 'Error desconocido');
      setProgress(0);
      
      // Notificar el error
      onError(error instanceof Error ? error : new Error('Error desconocido'));
    }
  };
  
  // Simulación de progreso para la UI
  const simulateProgress = (from: number, to: number): Promise<void> => {
    return new Promise(resolve => {
      const duration = 1000; // 1 segundo
      const steps = 10;
      const increment = (to - from) / steps;
      let current = from;
      let step = 0;
      
      const interval = setInterval(() => {
        current += increment;
        setProgress(Math.min(current, to));
        step++;
        
        if (step >= steps) {
          clearInterval(interval);
          resolve();
        }
      }, duration / steps);
    });
  };

  return (
    <div className="border rounded-xl p-6 bg-white shadow-lg max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className={`absolute inset-0 rounded-full ${
            readStatus === NFCReadStatus.WAITING || readStatus === NFCReadStatus.READING 
              ? 'bg-blue-100 animate-pulse' 
              : readStatus === NFCReadStatus.SUCCESS 
                ? 'bg-green-100' 
                : readStatus === NFCReadStatus.ERROR 
                  ? 'bg-red-100' 
                  : 'bg-gray-100'
          }`} />
          <div className="absolute inset-0 flex items-center justify-center">
            {readStatus === NFCReadStatus.INACTIVE && (
              <Fingerprint className="h-10 w-10 text-gray-600" />
            )}
            {(readStatus === NFCReadStatus.WAITING || readStatus === NFCReadStatus.READING) && (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <RotateCw className="h-10 w-10 text-blue-600" />
              </motion.div>
            )}
            {readStatus === NFCReadStatus.SUCCESS && (
              <CheckCircle className="h-10 w-10 text-green-600" />
            )}
            {readStatus === NFCReadStatus.ERROR && (
              <XCircle className="h-10 w-10 text-red-600" />
            )}
          </div>
        </div>
        
        <h2 className="text-xl font-bold mb-1">
          {readStatus === NFCReadStatus.INACTIVE && 'Verificación de identidad'}
          {readStatus === NFCReadStatus.WAITING && 'Esperando cédula'}
          {readStatus === NFCReadStatus.READING && 'Leyendo cédula'}
          {readStatus === NFCReadStatus.SUCCESS && '¡Verificación exitosa!'}
          {readStatus === NFCReadStatus.ERROR && 'Error de verificación'}
        </h2>
        
        <p className="text-gray-500 text-sm mb-4">{statusMessage || 'Utilice su cédula chilena con chip NFC para verificar su identidad'}</p>
      </div>
      
      {/* Indicador de progreso */}
      {readStatus !== NFCReadStatus.INACTIVE && (
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-right text-gray-500 mt-1">{Math.round(progress)}% completado</p>
        </div>
      )}
      
      {/* Indicador de proximidad */}
      {(readStatus === NFCReadStatus.WAITING || readStatus === NFCReadStatus.READING) && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Intensidad de señal</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              {proximityLevel === 0 && 'Sin señal'}
              {proximityLevel === 1 && 'Débil'}
              {proximityLevel === 2 && 'Media'}
              {proximityLevel === 3 && 'Fuerte'}
            </span>
          </div>
          
          <div className="flex gap-1 h-3">
            <div className={`flex-1 rounded ${proximityLevel >= 1 ? 'bg-blue-400' : 'bg-gray-200'}`}></div>
            <div className={`flex-1 rounded ${proximityLevel >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex-1 rounded ${proximityLevel >= 3 ? 'bg-blue-800' : 'bg-gray-200'}`}></div>
          </div>
          
          <p className="text-xs text-center text-blue-500 mt-2">
            {proximityLevel === 0 && 'Acerque la cédula al dispositivo'}
            {proximityLevel === 1 && 'Señal detectada, mantenga la cédula estable'}
            {proximityLevel === 2 && 'Buena señal, no mueva la cédula'}
            {proximityLevel === 3 && 'Señal óptima, leyendo datos...'}
          </p>
        </div>
      )}
      
      {/* Pasos de lectura */}
      {readingSteps.length > 0 && (
        <div className="mb-6 border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2">Pasos de verificación</h3>
          <ul className="space-y-2">
            {readingSteps.map((step, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-2 text-sm"
              >
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{step}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Consejos de lectura */}
      {readStatus === NFCReadStatus.WAITING && (
        <div className="mb-6 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-700">Consejos para mejor lectura</h3>
              <ul className="text-xs text-yellow-600 mt-1 space-y-1 list-disc pl-4">
                <li>Mantenga la cédula sobre la parte trasera del teléfono</li>
                <li>No mueva la cédula durante la lectura</li>
                <li>Retire la cédula de su billetera o funda</li>
                <li>Si usa funda en su teléfono, puede quitarla para mejor recepción</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Botones de acción */}
      <div className="flex gap-2">
        {readStatus === NFCReadStatus.INACTIVE && (
          <Button 
            onClick={startVerification} 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Iniciar verificación
          </Button>
        )}
        
        {(readStatus === NFCReadStatus.WAITING || readStatus === NFCReadStatus.READING) && (
          <Button 
            onClick={onCancel} 
            variant="outline" 
            className="flex-1"
          >
            Cancelar
          </Button>
        )}
        
        {(readStatus === NFCReadStatus.SUCCESS || readStatus === NFCReadStatus.ERROR) && (
          <>
            <Button 
              onClick={startVerification} 
              variant="outline" 
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
            
            <Button 
              onClick={onCancel} 
              variant="ghost" 
              className="flex-1"
            >
              Cerrar
            </Button>
          </>
        )}
      </div>
      
      {/* Pie de página con indicadores */}
      <div className="mt-6 pt-4 border-t text-center">
        <div className="flex justify-center items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center">
            <Shield className="h-3 w-3 mr-1 text-gray-400" />
            <span>Verificación segura</span>
          </div>
          <div className="flex items-center">
            <Smartphone className="h-3 w-3 mr-1 text-gray-400" />
            <span>Compatible READID</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default READIDVerifier;