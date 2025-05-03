import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, RefreshCw, Smartphone } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface NFCReaderProps {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  demoMode?: boolean;
}

type NFCStatus = 'idle' | 'waiting' | 'reading' | 'success' | 'error';

// Datos de ejemplo para el modo demo (cédula chilena)
interface CedulaChilenaData {
  run: string;
  nombre: string;
  apellidos: string;
  fechaNacimiento: string;
  sexo: string;
  nacionalidad: string;
  fechaEmision: string;
  fechaExpiracion: string;
  numeroDocumento: string;
  numeroSerie: string;
}

const NFCReader: React.FC<NFCReaderProps> = ({
  onSuccess,
  onError,
  demoMode = false
}) => {
  const [status, setStatus] = useState<NFCStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [nfcAvailable, setNfcAvailable] = useState<boolean | null>(null);
  const [nfcResult, setNfcResult] = useState<any>(null);
  
  const { toast } = useToast();

  // Verificar disponibilidad de NFC al montar el componente
  useEffect(() => {
    checkNfcAvailability();
  }, []);

  // Comprobar si NFC está disponible en el dispositivo
  const checkNfcAvailability = () => {
    // Primero verificar la Web NFC API estándar
    if ('NDEFReader' in window) {
      setNfcAvailable(true);
      console.log('NFC API Web (NDEFReader) está disponible');
    } 
    // Verificar API alternativa para navegadores Android
    else if ('nfc' in navigator && 'reading' in navigator.nfc) {
      setNfcAvailable(true);
      console.log('NFC API alternativa está disponible');
    }
    // Verificar API específica para Chrome en Android
    else if ('NfcAdapter' in window) {
      setNfcAvailable(true);
      console.log('NFC API Android (NfcAdapter) está disponible');
    }
    // Verificar API específica para Android WebView
    else if (window.androidInterface && typeof window.androidInterface.readNFC === 'function') {
      setNfcAvailable(true);
      console.log('Android WebView NFC API está disponible');
    }
    // No hay NFC disponible
    else {
      setNfcAvailable(false);
      console.log('NFC API no está disponible en este dispositivo/navegador');
      
      // En modo demo no mostrar error
      if (!demoMode) {
        setError('Este dispositivo o navegador no tiene NFC disponible. Intente usar un dispositivo Android compatible con NFC.');
      }
    }
  };

  // Iniciar escaneo NFC real
  const startNfcScan = async () => {
    if (!nfcAvailable) {
      setError('NFC no está disponible en este dispositivo');
      return;
    }

    try {
      setStatus('waiting');
      setError(null);
      setProgress(0);
      
      // Incrementar progreso simulado
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 200);

      if (demoMode) {
        // En modo demo, simular lectura NFC
        simulateNfcRead(progressInterval);
      } else {
        // En modo real, usar Web NFC API
        await realNfcScan(progressInterval);
      }
    } catch (err) {
      handleNfcError(err);
    }
  };

  // Simulación de lectura NFC para demostración
  const simulateNfcRead = (progressInterval: NodeJS.Timeout) => {
    console.log('Simulando lectura NFC en modo demo');
    setStatus('reading');
    
    // Simular tiempo de lectura
    setTimeout(() => {
      clearInterval(progressInterval);
      
      // Datos de cédula chilena simulados
      const mockCedulaData: CedulaChilenaData = {
        run: '12.345.678-9',
        nombre: 'JUAN PEDRO',
        apellidos: 'GONZÁLEZ SOTO',
        fechaNacimiento: '15/04/1985',
        sexo: 'M',
        nacionalidad: 'CHILENA',
        fechaEmision: '20/06/2018',
        fechaExpiracion: '20/06/2028',
        numeroDocumento: 'A123456789',
        numeroSerie: 'ID9876543210'
      };
      
      setNfcResult(mockCedulaData);
      setProgress(100);
      setStatus('success');
      
      if (onSuccess) {
        onSuccess({
          source: 'nfc',
          data: mockCedulaData,
          timestamp: new Date().toISOString()
        });
      }
      
      toast({
        title: 'Lectura NFC exitosa',
        description: 'Documento leído correctamente',
        variant: 'default'
      });
    }, 3000);
  };

  // Implementación real de escaneo NFC
  const realNfcScan = async (progressInterval: NodeJS.Timeout) => {
    try {
      console.log('Iniciando escaneo NFC real');
      setStatus('reading');
      
      // @ts-ignore - NDEFReader no está en los tipos de TypeScript estándar todavía
      const ndef = new window.NDEFReader();
      
      await ndef.scan();
      console.log('Escaneo NFC iniciado. Acerque su documento al dispositivo.');
      
      // Manejar lectura de NFC
      ndef.addEventListener("reading", (event: any) => {
        console.log("NFC leído:", event);
        
        try {
          // Procesar datos según el formato del documento chileno
          // Esta es una implementación simplificada - en un escenario real
          // se necesitaría un parser específico para el formato NDEF de la cédula chilena
          
          let cedulaData = parseCedulaChilena(event);
          
          clearInterval(progressInterval);
          setNfcResult(cedulaData);
          setProgress(100);
          setStatus('success');
          
          if (onSuccess) {
            onSuccess({
              source: 'nfc',
              data: cedulaData,
              timestamp: new Date().toISOString()
            });
          }
          
          toast({
            title: 'Lectura NFC exitosa',
            description: 'Documento leído correctamente',
            variant: 'default'
          });
        } catch (error) {
          handleNfcError(error);
        }
      });
      
      ndef.addEventListener("error", (error: any) => {
        handleNfcError(error);
      });
      
    } catch (error) {
      handleNfcError(error);
    }
  };

  // Parsear datos de cédula chilena (implementación simulada)
  const parseCedulaChilena = (ndefEvent: any): CedulaChilenaData => {
    // Esta es una función placeholder - la implementación real dependería
    // del formato específico de los datos NFC en la cédula chilena
    console.log("Parseando datos de cédula chilena de NDEF:", ndefEvent);
    
    // En la implementación real, aquí extraeríamos los datos de los records NDEF
    // Por ahora, devolvemos datos simulados
    return {
      run: '12.345.678-9',
      nombre: 'JUAN PEDRO',
      apellidos: 'GONZÁLEZ SOTO',
      fechaNacimiento: '15/04/1985',
      sexo: 'M',
      nacionalidad: 'CHILENA',
      fechaEmision: '20/06/2018',
      fechaExpiracion: '20/06/2028',
      numeroDocumento: 'A123456789',
      numeroSerie: 'ID9876543210'
    };
  };

  // Manejar errores NFC
  const handleNfcError = (err: any) => {
    console.error('Error en lectura NFC:', err);
    clearInterval(progress);
    setStatus('error');
    setError(err instanceof Error ? err.message : 'Error desconocido al leer NFC');
    
    if (onError) {
      onError(err instanceof Error ? err.message : 'Error desconocido al leer NFC');
    }
    
    toast({
      title: 'Error NFC',
      description: err instanceof Error ? err.message : 'Error desconocido al leer NFC',
      variant: 'destructive'
    });
  };

  // Reiniciar el proceso
  const resetProcess = () => {
    setStatus('idle');
    setError(null);
    setProgress(0);
    setNfcResult(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#2d219b]">
          Lector NFC
        </CardTitle>
        <CardDescription>
          Verificación mediante lectura de chip NFC
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert className="mb-4 bg-red-50 text-red-800 border border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {status === 'success' ? (
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-green-700 mb-2">Lectura Exitosa</h2>
            <p className="text-gray-600 mb-4">
              La información del documento ha sido leída correctamente.
            </p>
            
            {nfcResult && (
              <div className="bg-gray-50 p-4 rounded-md text-left mb-4">
                <h3 className="font-medium mb-2">Datos del documento:</h3>
                <ul className="space-y-1 text-sm">
                  <li><span className="font-medium">RUN:</span> {nfcResult.run}</li>
                  <li><span className="font-medium">Nombre:</span> {nfcResult.nombre}</li>
                  <li><span className="font-medium">Apellidos:</span> {nfcResult.apellidos}</li>
                  <li><span className="font-medium">Fecha Nacimiento:</span> {nfcResult.fechaNacimiento}</li>
                  <li><span className="font-medium">Sexo:</span> {nfcResult.sexo}</li>
                  <li><span className="font-medium">Nacionalidad:</span> {nfcResult.nacionalidad}</li>
                  <li><span className="font-medium">Emisión:</span> {nfcResult.fechaEmision}</li>
                  <li><span className="font-medium">Expiración:</span> {nfcResult.fechaExpiracion}</li>
                </ul>
              </div>
            )}
            
            <Button onClick={resetProcess} variant="outline">
              Iniciar Nueva Lectura
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {(status === 'waiting' || status === 'reading') && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                    <Smartphone className="h-8 w-8 text-[#2d219b]" />
                  </div>
                  <h2 className="text-lg font-medium mb-1">
                    {status === 'waiting' ? 'Esperando documento...' : 'Leyendo documento...'}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    {status === 'waiting' 
                      ? 'Acerque su documento al lector NFC de su dispositivo' 
                      : 'Mantenga el documento cerca del lector hasta que se complete la lectura'}
                  </p>
                </div>
                
                <Progress value={progress} className="h-2" />
                
                <div className="flex justify-center">
                  <Button variant="outline" onClick={resetProcess} size="sm">
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
            
            {status === 'idle' && (
              <>
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                    <Smartphone className="h-8 w-8 text-[#2d219b]" />
                  </div>
                  <h2 className="text-lg font-medium mb-1">Lectura de documento NFC</h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Utilice el lector NFC de su dispositivo para escanear el chip de su documento de identidad
                  </p>
                </div>
                
                <Button 
                  onClick={startNfcScan} 
                  className="w-full" 
                  disabled={!nfcAvailable && !demoMode}
                >
                  {nfcAvailable || demoMode ? 'Iniciar Escaneo NFC' : 'NFC no disponible'}
                </Button>
                
                {!nfcAvailable && !demoMode && (
                  <p className="text-xs text-center text-amber-600">
                    Su dispositivo no soporta NFC o el navegador no tiene habilitado el acceso a NFC
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t bg-gray-50 text-xs text-gray-500 p-4">
        <div className="w-full space-y-1">
          <p className="flex items-center">
            <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
            {demoMode 
              ? 'Modo de demostración - Los datos son simulados' 
              : 'Asegúrese de que su documento tenga chip NFC'}
          </p>
          <p>La lectura NFC requiere un dispositivo compatible y un navegador actualizado.</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default NFCReader;