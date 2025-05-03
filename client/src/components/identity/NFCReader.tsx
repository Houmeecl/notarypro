import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertTriangle, CheckCircle, Smartphone, RotateCcw, AlertCircle, RefreshCw } from 'lucide-react';
import { useMicroInteractions } from '@/hooks/use-micro-interactions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface NFCReaderProps {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

type NFCStatus = 'idle' | 'waiting' | 'reading' | 'success' | 'error';

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
  onError
}) => {
  const [message, setMessage] = useState('Listo para escanear NFC');
  const [hasNFC, setHasNFC] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [documentData, setDocumentData] = useState<any>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const { triggerInteraction } = useMicroInteractions();
  const [status, setStatus] = useState<NFCStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [nfcAvailable, setNfcAvailable] = useState<boolean | null>(null);
  const [nfcResult, setNfcResult] = useState<any>(null);

  const { toast } = useToast();

  useEffect(() => {
    // Check if browser supports NFC
    checkNfcAvailability();

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);


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
      setError('Este dispositivo o navegador no tiene NFC disponible. Intente usar un dispositivo Android compatible con NFC.');
    }
  };

  const simulateProgress = () => {
    // Reset progress
    setScanProgress(0);

    // Start progress animation
    progressInterval.current = setInterval(() => {
      setScanProgress(prev => {
        const newProgress = prev + Math.random() * 2;

        // Slow down as we approach 90%
        if (newProgress >= 90) {
          clearInterval(progressInterval.current!);
          return 90; // Hold at 90% until actual completion
        }
        return newProgress;
      });
    }, 100);
  };

  const startScan = async () => {
    if (!nfcAvailable) {
      setMessage('NFC no soportado en este dispositivo/navegador');
      return;
    }

    // Reset states
    setIsScanning(true);
    setScanResult(null);
    setDocumentData(null);
    setMessage('Escaneando... acerca tu cédula o documento');

    // Start progress simulation
    simulateProgress();

    try {
      // @ts-ignore - TypeScript might not have NDEFReader types
      const ndef = new window.NDEFReader();

      await ndef.scan();

      ndef.onreading = (event: any) => {
        console.log("NFC Tag leído:", event);
        const decoder = new TextDecoder();
        let dataFound = false;

        // Process the tag
        if (event.message) {
          for (const record of event.message.records) {
            if (record.recordType === "text") {
              const textContent = decoder.decode(record.data);

              // Parse the actual NFC data
              try {
                // Parse the data from the NFC chip
                const nfcData = JSON.parse(textContent);
                
                // Extract document data from NFC
                const documentData = {
                  documentType: nfcData.documentType || "CÉDULA DE IDENTIDAD",
                  documentNumber: nfcData.documentNumber,
                  names: nfcData.names,
                  surnames: nfcData.surnames,
                  nationality: nfcData.nationality,
                  birthdate: nfcData.birthdate,
                  expiryDate: nfcData.expiryDate,
                  issueDate: nfcData.issueDate,
                  issuePlace: nfcData.issuePlace
                };

                setDocumentData(documentData);
                setScanProgress(100);
                setScanResult('success');
                setMessage(`Documento verificado correctamente`);
                dataFound = true;

                // Trigger gamification interaction
                triggerInteraction('document_view', { 
                  method: 'nfc', 
                  verified: true,
                  documentType: documentData.documentType
                });
                
                // Automatically request camera access for the next step
                if (onSuccess) {
                  // Pass the document data to the parent component
                  onSuccess(documentData);
                  
                  // Request camera access
                  try {
                    navigator.mediaDevices.getUserMedia({ video: true })
                      .then(stream => {
                        // Camera permission granted
                        console.log("Cámara activada automáticamente después de verificación NFC");
                        stream.getTracks().forEach(track => track.stop()); // Stop the stream since we just needed permission
                      })
                      .catch(err => {
                        console.error("Error al solicitar acceso a la cámara:", err);
                      });
                  } catch (err) {
                    console.error("Error al solicitar permisos de cámara:", err);
                  }
                }

                break;
              } catch (e) {
                console.error("Error parsing NFC data:", e);
              }
            }
          }
        }

        if (!dataFound) {
          setScanResult('error');
          setMessage('Formato de documento no reconocido');
          setScanProgress(100);
        }

        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }

        setIsScanning(false);
      };

      ndef.onreadingerror = () => {
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
        setScanProgress(100);
        setScanResult('error');
        setMessage('Error al leer el tag NFC');
        setIsScanning(false);
      };

    } catch (error) {
      console.error("Error al escanear NFC:", error);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      setScanProgress(100);
      setScanResult('error');
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    setScanResult(null);
    setDocumentData(null);
    setScanProgress(0);
    setMessage('Listo para escanear NFC');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#2d219b]">
          Verificación NFC
        </CardTitle>
        <CardDescription>
          Verificación mediante lectura de chip NFC
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Message */}
      <div className={`mb-6 p-4 rounded-lg ${
        scanResult === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
        scanResult === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 
        'bg-blue-50 text-blue-700 border border-blue-200'
      }`}>
        <div className="flex items-center">
          {scanResult === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
          ) : scanResult === 'error' ? (
            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
          ) : (
            <Smartphone className="h-5 w-5 mr-2 text-blue-600" />
          )}
          <p>{message}</p>
        </div>
      </div>

      {/* Progress Bar */}
      {(isScanning || scanProgress > 0) && (
        <div className="mb-6">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${
                scanResult === 'error' ? 'bg-red-500' : 
                scanResult === 'success' ? 'bg-green-500' : 'bg-blue-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${scanProgress}%` }}
              transition={{ ease: "easeInOut" }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">{Math.round(scanProgress)}%</p>
        </div>
      )}

      {/* Document Data Results */}
      <AnimatePresence>
        {documentData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <h3 className="font-medium text-gray-800 mb-3">Información del documento:</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Tipo:</p>
                <p className="font-medium">{documentData.documentType}</p>
              </div>
              <div>
                <p className="text-gray-500">Número:</p>
                <p className="font-medium">{documentData.documentNumber}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Nombres:</p>
                <p className="font-medium">{documentData.names}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Apellidos:</p>
                <p className="font-medium">{documentData.surnames}</p>
              </div>
              <div>
                <p className="text-gray-500">Nacionalidad:</p>
                <p className="font-medium">{documentData.nationality}</p>
              </div>
              <div>
                <p className="text-gray-500">Fecha Nacimiento:</p>
                <p className="font-medium">{documentData.birthdate}</p>
              </div>
              <div>
                <p className="text-gray-500">Fecha Emisión:</p>
                <p className="font-medium">{documentData.issueDate}</p>
              </div>
              <div>
                <p className="text-gray-500">Vencimiento:</p>
                <p className="font-medium">{documentData.expiryDate}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      {scanResult ? (
        <button
          onClick={resetScan}
          className="w-full p-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium flex items-center justify-center"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Escanear otro documento
        </button>
      ) : (
        <Button 
          onClick={startScan} 
          className="w-full" 
          disabled={!nfcAvailable}
        >
          {nfcAvailable ? 'Iniciar Escaneo NFC' : 'NFC no disponible'}
        </Button>
      )}

      {!nfcAvailable && (
        <p className="mt-3 text-sm text-red-500 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-1 flex-shrink-0" />
          Tu dispositivo o navegador no soporta NFC. Intenta con Chrome en Android.
        </p>
      )}

      {nfcAvailable && !isScanning && !scanResult && (
        <p className="mt-3 text-xs text-gray-500 text-center">
          Asegúrate de tener NFC activado en tu dispositivo y acerca tu cédula de identidad a la parte posterior del teléfono.
        </p>
      )}
      </CardContent>

      <CardFooter className="border-t bg-gray-50 text-xs text-gray-500 p-4">
        <div className="w-full space-y-1">
          <p className="flex items-center">
            <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
            Asegúrese de que su documento tenga chip NFC
          </p>
          <p>La lectura NFC requiere un dispositivo compatible y un navegador actualizado.</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default NFCReader;