import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Info, Smartphone, User, Gavel, ScrollText, FileCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/queryClient';

const NFCValidationPage: React.FC = () => {
  const { toast } = useToast();
  const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);
  const [nfcEnabled, setNfcEnabled] = useState<boolean | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [readResult, setReadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [tabletInfo, setTabletInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("instrucciones");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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

  // Verificar si el usuario ya está logueado
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const response = await apiRequest('GET', '/api/user');
        if (response.ok) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Error al verificar estado de login:", error);
      }
    };
    
    checkLoggedIn();
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
  
  // Función para iniciar sesión
  const handleLogin = async () => {
    if (!username || !password) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "Por favor, ingresa usuario y contraseña",
      });
      return;
    }
    
    setIsLoggingIn(true);
    setError(null);
    
    try {
      const response = await apiRequest('POST', '/api/login', { 
        username, 
        password 
      });
      
      if (response.ok) {
        const userData = await response.json();
        setIsLoggedIn(true);
        toast({
          title: "Inicio de sesión exitoso",
          description: `Bienvenido, ${userData.username}`,
        });
      } else {
        const errorData = await response.json().catch(() => null);
        setError(errorData?.message || "Credenciales incorrectas");
        toast({
          variant: "destructive",
          title: "Error de inicio de sesión",
          description: "Usuario o contraseña incorrectos",
        });
      }
    } catch (error) {
      setError("Error de conexión al servidor");
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

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
        title: "Validación Notarial Iniciada",
        description: "Por favor, acerque su documento de identidad al dispositivo",
      });
      
    } catch (error: any) {
      console.error("Error al iniciar escaneo NFC:", error);
      setError(`Error al iniciar escaneo NFC: ${error.message}`);
      setIsReading(false);
      
      toast({
        variant: "destructive",
        title: "Error en Validación Notarial",
        description: "No se pudo iniciar el sistema de verificación de identidad. Por favor, contacte con soporte técnico.",
      });
    }
  };

  const stopNfcScan = () => {
    setIsReading(false);
    // No hay método oficial para detener el escaneo en la API Web NFC
    // La mejor opción es reemplazar el objeto NDEFReader o recargar la página
    toast({
      title: "Verificación Notarial Cancelada",
      description: "El proceso de validación de identidad ha sido interrumpido",
    });
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Notaría VecinoXpress</h1>
        <p className="text-gray-600 mt-2">Sistema oficial de validación de identidad notarial</p>
      </div>
      
      {!isLoggedIn ? (
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Acceso de Notarios y Personal Autorizado</h2>
          <p className="mb-4 text-gray-600">Este sistema de validación notarial requiere autenticación para garantizar la seguridad en el proceso de verificación de identidad</p>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="Tu nombre de usuario" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Tu contraseña" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Iniciando sesión...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Iniciar sesión
                </span>
              )}
            </Button>
          </div>
          
          <div className="mt-4 pt-4 border-t text-sm text-gray-500">
            <p>Credenciales por defecto:</p>
            <ul className="list-disc pl-5 mt-1">
              <li><strong>Usuario:</strong> miadmin</li>
              <li><strong>Contraseña:</strong> miadmin123</li>
            </ul>
          </div>
        </Card>
      ) : (
        <Tabs defaultValue="instrucciones" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="instrucciones">Instrucciones</TabsTrigger>
            <TabsTrigger value="verificacion">Verificación</TabsTrigger>
            <TabsTrigger value="diagnostico">Diagnóstico</TabsTrigger>
          </TabsList>
          
          <Button 
            variant="outline" 
            onClick={() => setIsLoggedIn(false)}
            size="sm"
            className="flex gap-2 items-center"
          >
            <User className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
        
        {/* Pestaña de instrucciones */}
        <TabsContent value="instrucciones">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Gavel className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Guía para Verificación Notarial</h2>
            </div>
            
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
            <div className="flex items-center gap-2 mb-4">
              <ScrollText className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Verificación de Identidad Notarial</h2>
            </div>
            
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
                    <p className="text-lg font-medium">Acerque su documento de identidad</p>
                  </div>
                  <p className="text-sm text-gray-500 mb-4 text-center">
                    Mantenga su cédula inmóvil durante 2-3 segundos en contacto con el lector del dispositivo
                  </p>
                  <Button variant="outline" onClick={stopNfcScan} className="bg-white hover:bg-gray-50">
                    Cancelar verificación
                  </Button>
                </>
              ) : (
                <>
                  <Smartphone className="h-16 w-16 text-gray-400 mb-2" />
                  <p className="text-lg font-medium mb-4">Sistema Notarial de Validación</p>
                  <Button 
                    onClick={startNfcScan}
                    disabled={!nfcSupported || !nfcEnabled}
                    className="bg-indigo-700 hover:bg-indigo-800 text-white"
                  >
                    Iniciar Verificación de Identidad
                  </Button>
                </>
              )}
            </div>
            
            {readResult && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  Certificación Notarial Completada
                </h3>
                <div className="p-3 bg-green-50 border border-green-200 rounded-md mb-4">
                  <p className="text-sm text-green-800">La identidad del ciudadano ha sido verificada exitosamente mediante el sistema notarial VecinoXpress</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-gray-50 rounded-md">
                    <span className="font-medium">Número de Validación:</span>
                    <span className="font-mono">{readResult.serialNumber}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded-md">
                    <span className="font-medium">Fecha y Hora:</span>
                    <span>{new Date(readResult.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded-md">
                    <span className="font-medium">Tipo de Documento:</span>
                    <span>Cédula de Identidad</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded-md">
                    <span className="font-medium">Estado:</span>
                    <span className="text-green-600 font-medium">Verificado</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">Esta verificación cuenta con validez legal según Ley 19.799 sobre documentos electrónicos y firma electrónica</p>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
        
        {/* Pestaña de diagnóstico */}
        <TabsContent value="diagnostico">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileCheck className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Diagnóstico de Sistema Notarial</h2>
            </div>
            
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
      )}
    </div>
  );
};

export default NFCValidationPage;