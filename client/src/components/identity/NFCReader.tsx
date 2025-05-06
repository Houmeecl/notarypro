
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

export interface NFCReaderProps {
  onSuccess: (data: any) => void;
  onError: (error: string) => void;
  demoMode?: boolean;
}

const NFCReader: React.FC<NFCReaderProps> = ({ onSuccess, onError, demoMode = false }) => {
  const [isReading, setIsReading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'reading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);
  const [deviceType, setDeviceType] = useState<string>('');
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const aborter = useRef<AbortController | null>(null);

  // Verificar soporte NFC al cargar
  useEffect(() => {
    checkNFCSupport();
    detectDeviceType();
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      if (aborter.current) {
        aborter.current.abort();
      }
    };
  }, []);

  const checkNFCSupport = () => {
    if ('NDEFReader' in window) {
      setNfcSupported(true);
      console.log("✅ Web NFC API soportada en este navegador");
    } else {
      setNfcSupported(false);
      console.log("❌ Web NFC API no soportada en este navegador");
    }
  };

  const detectDeviceType = () => {
    const userAgent = navigator.userAgent;
    if (/Android/i.test(userAgent)) {
      if (/Tablet|SM-T|Lenovo TB/i.test(userAgent)) {
        setDeviceType('tablet');
      } else {
        setDeviceType('android');
      }
    } else if (/iPad|iPhone|iPod/.test(userAgent)) {
      setDeviceType('ios');
    } else {
      setDeviceType('desktop');
    }
  };

  const startNFCReading = async () => {
    if (demoMode) {
      simulateNFCReading();
      return;
    }

    if (!nfcSupported) {
      setErrorMessage("Este dispositivo no soporta NFC o el navegador no es compatible con Web NFC API");
      setStatus('error');
      onError("NFC no soportado en este dispositivo o navegador");
      return;
    }

    try {
      setIsReading(true);
      setStatus('reading');
      setProgress(0);
      setErrorMessage(null);

      // Iniciar animación de progreso
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            return 95; // Mantener en 95% hasta que realmente termine
          }
          return prev + 1;
        });
      }, 100);

      // Crear controlador de aborto para cancelar la lectura si es necesario
      aborter.current = new AbortController();

      if ('NDEFReader' in window) {
        try {
          // @ts-ignore - TypeScript puede no reconocer NDEFReader
          const ndef = new NDEFReader();
          await ndef.scan({ signal: aborter.current.signal });
          
          console.log("✅ Escáner NFC iniciado");
          
          ndef.addEventListener("reading", ({ message, serialNumber }) => {
            console.log("NFC detectado:", serialNumber);
            console.log("Datos recibidos:", message);
            
            let decodedData = { serialNumber };
            
            // Procesar los registros del mensaje NDEF
            if (message && message.records) {
              decodedData = {
                ...decodedData,
                records: message.records.map(record => {
                  if (record.recordType === "text") {
                    const textDecoder = new TextDecoder();
                    return {
                      type: record.recordType,
                      text: textDecoder.decode(record.data)
                    };
                  }
                  return {
                    type: record.recordType,
                    data: record.data
                  };
                })
              };
            }

            // Limpiar intervalo y completar lectura
            if (progressInterval.current) {
              clearInterval(progressInterval.current);
            }
            setProgress(100);
            setStatus('success');
            setIsReading(false);
            
            onSuccess(decodedData);
          });
          
          ndef.addEventListener("error", (error) => {
            console.error("Error de lectura NFC:", error);
            setErrorMessage(`Error al leer NFC: ${error.message || 'Desconocido'}`);
            setStatus('error');
            setIsReading(false);
            if (progressInterval.current) {
              clearInterval(progressInterval.current);
            }
            onError(error.message || 'Error desconocido al leer NFC');
          });
          
        } catch (err: any) {
          console.error("Error al iniciar NFC:", err);
          setErrorMessage(`No se pudo iniciar la lectura NFC: ${err.message || 'Error desconocido'}`);
          setStatus('error');
          setIsReading(false);
          if (progressInterval.current) {
            clearInterval(progressInterval.current);
          }
          onError(err.message || 'Error al iniciar NFC');
        }
      } else {
        setErrorMessage("Web NFC API no disponible en este navegador");
        setStatus('error');
        setIsReading(false);
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
        onError("Web NFC API no disponible");
      }
    } catch (error: any) {
      console.error("Error general en NFC:", error);
      setErrorMessage(`Error general: ${error.message || 'Desconocido'}`);
      setStatus('error');
      setIsReading(false);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      onError(error.message || 'Error general');
    }
  };

  const simulateNFCReading = () => {
    setIsReading(true);
    setStatus('reading');
    setProgress(0);
    setErrorMessage(null);

    // Simular progreso
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (progressInterval.current) {
            clearInterval(progressInterval.current);
          }
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    // Simular lectura exitosa después de ~3 segundos
    setTimeout(() => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      setProgress(100);
      setStatus('success');
      setIsReading(false);
      
      // Datos simulados de una cédula chilena
      const mockData = {
        serialNumber: "ABCDEF123456789",
        records: [
          {
            type: "text",
            text: "RUN:12345678-9"
          },
          {
            type: "text",
            text: "NOMBRES:JUAN PEDRO"
          },
          {
            type: "text",
            text: "APELLIDOS:GONZÁLEZ PÉREZ"
          },
          {
            type: "text",
            text: "NACIONALIDAD:CHILENA"
          },
          {
            type: "text",
            text: "FECHA_NACIMIENTO:01-01-1980"
          }
        ],
        documentType: "CÉDULA DE IDENTIDAD",
        issueDate: "01-01-2020",
        expiryDate: "01-01-2030"
      };
      
      onSuccess(mockData);
    }, 3000);
  };

  const stopReading = () => {
    if (aborter.current) {
      aborter.current.abort();
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    setIsReading(false);
    setStatus('idle');
    setProgress(0);
  };

  const renderStatus = () => {
    switch (status) {
      case 'reading':
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-lg">
              <div className="relative flex items-center justify-center w-24 h-24 mb-4">
                <div className="absolute w-24 h-24 rounded-full bg-blue-100 animate-ping"></div>
                <Smartphone className="relative z-10 w-12 h-12 text-blue-600" />
              </div>
              <p className="text-lg font-medium text-center">Acerque su documento al lector NFC</p>
              <p className="text-sm text-center text-gray-500 mt-2">
                Mantenga el documento inmóvil hasta que se complete la lectura
              </p>
              <Progress className="w-full mt-4" value={progress} />
            </div>
            
            <Button variant="outline" onClick={stopReading} className="w-full">
              Cancelar lectura
            </Button>
          </div>
        );
        
      case 'success':
        return (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800">
              Lectura completada con éxito
            </AlertDescription>
          </Alert>
        );
        
      case 'error':
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>
              {errorMessage || "Error en la lectura NFC"}
            </AlertDescription>
          </Alert>
        );
        
      default:
        return (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Smartphone className="mr-2 h-5 w-5" /> 
                Verificación NFC
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nfcSupported === false && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Este dispositivo o navegador no soporta NFC. Por favor, utilice Chrome en un dispositivo Android compatible.
                  </AlertDescription>
                </Alert>
              )}
              
              {deviceType === 'ios' && (
                <Alert className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Los dispositivos iOS no soportan Web NFC. Por favor utilice un dispositivo Android.
                  </AlertDescription>
                </Alert>
              )}
              
              <p className="text-sm text-gray-600 mb-4">
                Para verificar su identidad, acerque su cédula o documento con chip NFC a la parte trasera del dispositivo.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={startNFCReading} 
                className="w-full"
                disabled={!demoMode && nfcSupported === false}
              >
                {demoMode ? "Iniciar Demo NFC" : "Iniciar Lectura NFC"}
              </Button>
            </CardFooter>
          </Card>
        );
    }
  };

  return (
    <div className="w-full">
      {renderStatus()}
    </div>
  );
};

export default NFCReader;
