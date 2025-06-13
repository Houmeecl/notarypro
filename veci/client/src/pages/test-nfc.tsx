
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Info, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TestNFC = () => {
  const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [deviceInfo, setDeviceInfo] = useState<string>('');
  const { toast } = useToast();
  
  useEffect(() => {
    checkNFC();
    getDeviceInfo();
  }, []);
  
  const checkNFC = () => {
    if ('NDEFReader' in window) {
      setNfcSupported(true);
      toast({
        title: "✅ NFC Soportado",
        description: "Este dispositivo soporta Web NFC API",
      });
    } else {
      setNfcSupported(false);
      toast({
        title: "❌ NFC No Soportado",
        description: "Este dispositivo o navegador no soporta Web NFC API",
        variant: "destructive"
      });
    }
  };
  
  const getDeviceInfo = () => {
    const info = [
      `Navegador: ${navigator.userAgent}`,
      `Plataforma: ${navigator.platform}`,
      `Lenguaje: ${navigator.language}`,
      `Pantalla: ${window.screen.width}x${window.screen.height}`,
      `Tipo de dispositivo: ${/android/i.test(navigator.userAgent) ? 'Android' : 
                            /iPad|iPhone|iPod/.test(navigator.userAgent) ? 'iOS' : 'Escritorio'}`
    ].join('\n');
    
    setDeviceInfo(info);
  };
  
  const startNfcScan = async () => {
    if (!nfcSupported) {
      setScanError("NFC no soportado en este dispositivo");
      return;
    }
    
    try {
      setScanning(true);
      setScanResult(null);
      setScanError(null);
      setProgress(0);
      
      // Animación de progreso mientras escanea
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 1, 95));
      }, 100);
      
      // Crear controlador para poder cancelar
      const abortController = new AbortController();
      
      // @ts-ignore - TypeScript puede no reconocer NDEFReader
      const ndef = new NDEFReader();
      await ndef.scan({ signal: abortController.signal });
      
      toast({
        title: "Escaneando NFC",
        description: "Acerque una tarjeta NFC a la parte trasera del dispositivo",
      });
      
      ndef.addEventListener("reading", ({ message, serialNumber }) => {
        clearInterval(progressInterval);
        setProgress(100);
        setScanning(false);
        
        // Procesar los registros para mostrarlos
        const records = message.records.map((record: any) => {
          let content;
          if (record.recordType === "text") {
            const decoder = new TextDecoder(record.encoding || "utf-8");
            content = decoder.decode(record.data);
          } else if (record.recordType === "url") {
            const decoder = new TextDecoder();
            content = decoder.decode(record.data);
          } else {
            // Para otros tipos, mostrar el tipo y longitud de datos
            content = `[Datos binarios: ${record.data.byteLength} bytes]`;
          }
          
          return {
            type: record.recordType,
            content
          };
        });
        
        const result = {
          serialNumber,
          records
        };
        
        setScanResult(result);
        
        toast({
          title: "✅ Lectura NFC exitosa",
          description: `Serial: ${serialNumber}`,
        });
      });
      
      ndef.addEventListener("error", (error: any) => {
        clearInterval(progressInterval);
        setProgress(0);
        setScanning(false);
        setScanError(error.message || "Error al leer NFC");
        
        toast({
          title: "Error de lectura NFC",
          description: error.message || "Error desconocido",
          variant: "destructive"
        });
      });
      
    } catch (error: any) {
      setScanning(false);
      setProgress(0);
      setScanError(error.message || "Error al inicializar NFC");
      
      toast({
        title: "Error al iniciar NFC",
        description: error.message || "Error desconocido",
        variant: "destructive"
      });
    }
  };
  
  const simulateNfcScan = () => {
    setScanning(true);
    setScanResult(null);
    setScanError(null);
    setProgress(0);
    
    // Animación de progreso mientras escanea
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
    
    // Simular un tiempo de espera
    setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      setScanning(false);
      
      const mockResult = {
        serialNumber: "SIMULADO_" + Math.floor(Math.random() * 10000),
        records: [
          {
            type: "text",
            content: "RUN:12345678-9"
          },
          {
            type: "text",
            content: "NOMBRE:JUAN DEMO"
          },
          {
            type: "text",
            content: "EMISION:01-01-2020"
          }
        ]
      };
      
      setScanResult(mockResult);
      
      toast({
        title: "✅ Simulación NFC completada",
        description: "Esta es una lectura simulada para probar la interfaz",
      });
    }, 3000);
  };
  
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Diagnóstico NFC</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="h-5 w-5 mr-2" />
              Estado NFC
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nfcSupported === null ? (
              <p>Verificando soporte NFC...</p>
            ) : nfcSupported ? (
              <Alert className="bg-green-50 border-green-200 mb-4">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  NFC soportado en este dispositivo
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  NFC no soportado en este dispositivo o navegador
                </AlertDescription>
              </Alert>
            )}
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Información del dispositivo:</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs whitespace-pre-wrap">
                {deviceInfo}
              </pre>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={checkNFC} variant="outline">
              Volver a verificar
            </Button>
            
            <Button onClick={simulateNfcScan} variant="outline">
              Simular NFC
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Prueba de lectura NFC</CardTitle>
          </CardHeader>
          <CardContent>
            {scanning ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-lg">
                  <div className="relative flex items-center justify-center w-16 h-16 mb-4">
                    <div className="absolute w-16 h-16 rounded-full bg-blue-100 animate-ping"></div>
                    <Smartphone className="relative z-10 w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-center">Acerque una tarjeta NFC...</p>
                  <Progress className="w-full mt-4" value={progress} />
                </div>
              </div>
            ) : scanResult ? (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Lectura NFC exitosa
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-semibold w-24">Serial:</span>
                    <span className="font-mono text-sm">{scanResult.serialNumber}</span>
                  </div>
                  
                  <h3 className="font-semibold mt-3">Contenido:</h3>
                  {scanResult.records.map((record: any, index: number) => (
                    <div key={index} className="ml-4 p-2 bg-gray-50 rounded">
                      <div className="text-xs text-gray-500">{record.type}</div>
                      <div className="font-mono text-sm">{record.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : scanError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {scanError}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="text-center p-6">
                <p className="mb-4">
                  Presione el botón para iniciar la prueba NFC
                </p>
                
                <Alert variant="default" className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Acerque cualquier tarjeta o cédula con NFC para realizar la prueba
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={startNfcScan} 
              disabled={scanning || nfcSupported === false}
              className="w-full"
            >
              {scanning ? "Escaneando..." : "Iniciar prueba NFC"}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Solución de problemas NFC</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">1. Activar NFC en el dispositivo</h3>
              <p className="text-sm text-gray-600">
                Vaya a Configuración → Conexiones → NFC y actívelo.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">2. Use Chrome actualizado</h3>
              <p className="text-sm text-gray-600">
                La API Web NFC solo es compatible con Chrome 89 o superior en Android.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">3. Activar funciones experimentales</h3>
              <p className="text-sm text-gray-600">
                Abra chrome://flags en su navegador, busque "Web NFC" y actívelo.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">4. Prueba con aplicación nativa</h3>
              <p className="text-sm text-gray-600">
                Instale la aplicación "NFC Tools" desde Google Play para verificar si el hardware NFC funciona correctamente.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">5. Posición correcta</h3>
              <p className="text-sm text-gray-600">
                En tablets Lenovo, el lector NFC generalmente está en la parte central trasera o cerca de la cámara. Pruebe diferentes posiciones.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestNFC;
