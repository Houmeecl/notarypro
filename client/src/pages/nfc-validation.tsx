import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Info, Smartphone } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const NFCValidationPage: React.FC = () => {
  const { toast } = useToast();
  const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);
  const [nfcEnabled, setNfcEnabled] = useState<boolean | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [readResult, setReadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [tabletInfo, setTabletInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("instrucciones");

  // Detectar si estamos en una tablet Lenovo
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isLenovo = userAgent.includes("lenovo");
    const isTablet = /tablet|ipad|playbook|silk|android(?!.*mobile)/i.test(userAgent);
    
    const deviceInfo = {
      isLenovo,
      isTablet,
      userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
    };
    
    setTabletInfo(deviceInfo);
  }, []);

  // Detectar soporte NFC
  useEffect(() => {
    const checkNfcSupport = async () => {
      if ("NDEFReader" in window) {
        setNfcSupported(true);
        try {
          const ndef = new (window as any).NDEFReader();
          await ndef.scan();
          setNfcEnabled(true);
        } catch (error) {
          console.error("Error al activar NFC:", error);
          setNfcEnabled(false);
        }
      } else {
        setNfcSupported(false);
      }
    };

    checkNfcSupport();
  }, []);

  const startNfcScan = async () => {
    if (!nfcSupported || !nfcEnabled) {
      setError("NFC no está disponible o activado en este dispositivo");
      return;
    }

    setIsReading(true);
    setError(null);
    setReadResult(null);
    
    try {
      const ndef = new (window as any).NDEFReader();
      
      ndef.addEventListener("reading", ({ message, serialNumber }: any) => {
        console.log("NFC leído:", serialNumber);
        
        // Procesar los registros NDEF
        const records: any[] = [];
        for (const record of message.records) {
          if (record.recordType === "text") {
            const textDecoder = new TextDecoder();
            const text = textDecoder.decode(record.data);
            records.push({ type: "text", value: text });
          } else {
            records.push({ 
              type: record.recordType,
              value: "Datos binarios no mostrados",
              rawData: record.data
            });
          }
        }
        
        setReadResult({
          serialNumber,
          records,
          timestamp: new Date().toISOString()
        });
        
        setIsReading(false);
        
        toast({
          title: "Lectura NFC exitosa",
          description: `ID: ${serialNumber}`,
        });
      });
      
      ndef.addEventListener("error", (error: any) => {
        console.error("Error NFC:", error);
        setError(`Error de lectura NFC: ${error.message}`);
        setIsReading(false);
        
        toast({
          variant: "destructive",
          title: "Error de lectura NFC",
          description: error.message,
        });
      });
      
      await ndef.scan();
      
      toast({
        title: "Escaneo NFC iniciado",
        description: "Acerca tu cédula a la tablet",
      });
      
    } catch (error: any) {
      console.error("Error al iniciar escaneo NFC:", error);
      setError(`Error al iniciar escaneo NFC: ${error.message}`);
      setIsReading(false);
      
      toast({
        variant: "destructive",
        title: "Error al iniciar NFC",
        description: error.message,
      });
    }
  };

  const stopNfcScan = () => {
    setIsReading(false);
    // No hay método oficial para detener el escaneo en la API Web NFC
    // La mejor opción es reemplazar el objeto NDEFReader o recargar la página
    toast({
      title: "Escaneo NFC detenido",
    });
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">Validación NFC para Tablet Lenovo</h1>
      
      <Tabs defaultValue="instrucciones" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="instrucciones">Instrucciones</TabsTrigger>
          <TabsTrigger value="verificacion">Verificación</TabsTrigger>
          <TabsTrigger value="diagnostico">Diagnóstico</TabsTrigger>
        </TabsList>
        
        {/* Pestaña de instrucciones */}
        <TabsContent value="instrucciones">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Guía de uso NFC</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-2">Preparación</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Asegúrate de que NFC esté activado en tu tablet (Configuración &gt; Conexiones &gt; NFC)</li>
                <li>Quita cualquier funda o protector que pueda interferir con la señal</li>
                <li>Asegúrate de que la batería esté por encima del 15%</li>
              </ol>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-2">Posición correcta de la cédula</h3>
              <p className="mb-2">La ubicación de la antena NFC varía según el modelo de tablet:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Tab M8/M10:</strong> Centro de la parte trasera</li>
                <li><strong>Tab P11/P12:</strong> Parte superior trasera, cerca de la cámara</li>
                <li><strong>Yoga Tab:</strong> Cerca del logo Lenovo en la parte trasera</li>
              </ul>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-2">Consejos para mejor lectura</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Mantén la cédula inmóvil durante 2-3 segundos</li>
                <li>Prueba diferentes posiciones si no detecta inicialmente</li>
                <li>Evita superficies metálicas que puedan interferir</li>
                <li>Si Chrome pide permiso para NFC, acepta</li>
              </ul>
            </div>
            
            <Button 
              className="w-full mt-4"
              onClick={() => setActiveTab("verificacion")}
            >
              Continuar a verificación
            </Button>
          </Card>
        </TabsContent>
        
        {/* Pestaña de verificación */}
        <TabsContent value="verificacion">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Verificación NFC</h2>
            
            {nfcSupported === false && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>NFC no compatible</AlertTitle>
                <AlertDescription>
                  Este dispositivo no es compatible con NFC o el navegador no soporta Web NFC.
                  Verifica que estés usando Chrome y que hayas activado Web NFC en chrome://flags.
                </AlertDescription>
              </Alert>
            )}
            
            {nfcSupported && !nfcEnabled && (
              <Alert variant="warning" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>NFC desactivado</AlertTitle>
                <AlertDescription>
                  NFC está desactivado en tu dispositivo. Actívalo desde Configuración &gt; Conexiones &gt; NFC
                  y vuelve a cargar esta página.
                </AlertDescription>
              </Alert>
            )}
            
            {nfcSupported && nfcEnabled && (
              <Alert variant="default" className="mb-4 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>NFC activado y listo</AlertTitle>
                <AlertDescription>
                  Tu dispositivo está listo para leer tarjetas NFC. Presiona el botón para comenzar.
                </AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex flex-col items-center justify-center mb-6 p-6 border-2 border-dashed border-gray-300 rounded-lg">
              {isReading ? (
                <>
                  <div className="animate-pulse flex flex-col items-center mb-4">
                    <Smartphone className="h-16 w-16 text-primary mb-2" />
                    <p className="text-lg font-medium">Acerca la cédula ahora...</p>
                  </div>
                  <p className="text-sm text-gray-500 mb-4 text-center">
                    Mantén la cédula inmóvil durante 2-3 segundos en la parte trasera de la tablet
                  </p>
                  <Button variant="outline" onClick={stopNfcScan}>
                    Cancelar lectura
                  </Button>
                </>
              ) : (
                <>
                  <Smartphone className="h-16 w-16 text-gray-400 mb-2" />
                  <p className="text-lg font-medium mb-4">Listo para leer NFC</p>
                  <Button 
                    onClick={startNfcScan}
                    disabled={!nfcSupported || !nfcEnabled}
                  >
                    Iniciar lectura NFC
                  </Button>
                </>
              )}
            </div>
            
            {readResult && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium mb-2">Resultado de lectura</h3>
                <p className="mb-2"><strong>ID:</strong> {readResult.serialNumber}</p>
                <p className="mb-2"><strong>Hora:</strong> {new Date(readResult.timestamp).toLocaleTimeString()}</p>
                
                {readResult.records.length > 0 ? (
                  <>
                    <p className="mb-2"><strong>Registros ({readResult.records.length}):</strong></p>
                    <ul className="list-disc pl-5">
                      {readResult.records.map((record: any, index: number) => (
                        <li key={index}>
                          <strong>Tipo:</strong> {record.type}, <strong>Valor:</strong> {record.value}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p>No se encontraron registros NDEF.</p>
                )}
              </div>
            )}
          </Card>
        </TabsContent>
        
        {/* Pestaña de diagnóstico */}
        <TabsContent value="diagnostico">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Diagnóstico del dispositivo</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-2">Estado NFC</h3>
              <ul className="list-none space-y-2">
                <li className="flex items-center">
                  <span className={`inline-block w-4 h-4 rounded-full mr-2 ${nfcSupported ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span><strong>Soporte NFC:</strong> {nfcSupported ? 'Soportado' : 'No soportado'}</span>
                </li>
                <li className="flex items-center">
                  <span className={`inline-block w-4 h-4 rounded-full mr-2 ${nfcEnabled ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span><strong>NFC activado:</strong> {nfcEnabled ? 'Sí' : 'No'}</span>
                </li>
              </ul>
            </div>
            
            {tabletInfo && (
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-2">Información del dispositivo</h3>
                <ul className="list-none space-y-2">
                  <li><strong>Dispositivo Lenovo:</strong> {tabletInfo.isLenovo ? 'Sí' : 'No'}</li>
                  <li><strong>Es tablet:</strong> {tabletInfo.isTablet ? 'Sí' : 'No'}</li>
                  <li><strong>Resolución pantalla:</strong> {tabletInfo.screenWidth} x {tabletInfo.screenHeight}</li>
                  <li><strong>Densidad de píxeles:</strong> {tabletInfo.devicePixelRatio}</li>
                </ul>
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-2">Solución de problemas</h3>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">NFC no detectado:</p>
                  <ul className="list-disc pl-5">
                    <li>Verifica que NFC esté activado en Configuración</li>
                    <li>Reinicia la tablet</li>
                    <li>Asegúrate de usar Chrome actualizado</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">Web NFC no disponible:</p>
                  <ul className="list-disc pl-5">
                    <li>Escribe chrome://flags en la barra de direcciones</li>
                    <li>Busca "Web NFC" y actívalo</li>
                    <li>Reinicia Chrome</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">Detección inconsistente:</p>
                  <ul className="list-disc pl-5">
                    <li>Prueba diferentes posiciones en la parte trasera</li>
                    <li>Quita fundas o protectores</li>
                    <li>Evita superficies metálicas</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Consejo</AlertTitle>
              <AlertDescription>
                Si sigues teniendo problemas, descarga la app NFC Tools desde Google Play
                para verificar si el hardware NFC funciona correctamente.
              </AlertDescription>
            </Alert>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NFCValidationPage;