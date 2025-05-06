import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Shield, AlertCircle, KeyRound, FileDigit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { checkExtensionAvailability, listTokenDevices, getCertificates, CertificateInfo } from "@/lib/pkcs11-bridge";

export default function TestEtoken() {
  const [extensionReady, setExtensionReady] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [devices, setDevices] = useState<string[]>([]);
  const [pin, setPin] = useState("");
  const [certificates, setCertificates] = useState<CertificateInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Función para formatear fecha del certificado
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Verificar extensión
  const verifyExtension = async () => {
    try {
      setIsChecking(true);
      setError(null);
      
      const available = await checkExtensionAvailability();
      setExtensionReady(available);
      
      if (available) {
        toast({
          title: "Extensión detectada",
          description: "La extensión de firma digital está correctamente instalada",
        });
      } else {
        toast({
          title: "Extensión no detectada",
          description: "La extensión de firma digital no está disponible",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setError(error.message || "Error desconocido al verificar la extensión");
      toast({
        title: "Error",
        description: `Error al verificar la extensión: ${error.message}`,
        variant: "destructive",
      });
      setExtensionReady(false);
    } finally {
      setIsChecking(false);
    }
  };

  // Detectar dispositivos
  const detectDevices = async () => {
    try {
      setIsChecking(true);
      setError(null);
      
      const detectedDevices = await listTokenDevices();
      setDevices(detectedDevices);
      
      if (detectedDevices.length === 0) {
        toast({
          title: "No se detectaron dispositivos",
          description: "No se encontraron dispositivos criptográficos conectados",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Dispositivos detectados",
          description: `Se encontraron ${detectedDevices.length} dispositivo(s)`,
        });
      }
    } catch (error: any) {
      setError(error.message || "Error desconocido al detectar dispositivos");
      toast({
        title: "Error",
        description: `Error al detectar dispositivos: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Listar certificados
  const listCertificates = async () => {
    if (!pin) {
      toast({
        title: "Error",
        description: "Debe ingresar un PIN para acceder a los certificados",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsChecking(true);
      setError(null);
      
      const certs = await getCertificates(pin);
      setCertificates(certs);
      
      if (certs.length === 0) {
        toast({
          title: "No se encontraron certificados",
          description: "El dispositivo no contiene certificados válidos",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Certificados encontrados",
          description: `Se encontraron ${certs.length} certificado(s)`,
        });
      }
    } catch (error: any) {
      setError(error.message || "Error desconocido al obtener certificados");
      toast({
        title: "Error",
        description: `Error al obtener certificados: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Prueba de Dispositivo eToken</h1>
      <p className="text-gray-600">
        Esta herramienta permite comprobar si su dispositivo de firma electrónica está correctamente
        configurado y listo para usarse con el sistema.
      </p>

      <Tabs defaultValue="extension" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="extension">Verificar Extensión</TabsTrigger>
          <TabsTrigger value="devices">Detectar Dispositivos</TabsTrigger>
          <TabsTrigger value="certificates">Listar Certificados</TabsTrigger>
        </TabsList>
        
        {/* Pestaña: Verificar Extensión */}
        <TabsContent value="extension">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 text-indigo-600 mr-2" />
                Verificar Extensión
              </CardTitle>
              <CardDescription>
                Comprueba si la extensión de firma electrónica está instalada en el navegador
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-slate-50">
                <h3 className="font-medium mb-2">¿Qué es la extensión de firma electrónica?</h3>
                <p className="text-sm text-slate-700 mb-2">
                  La extensión es un componente que permite al navegador comunicarse con dispositivos
                  criptográficos físicos como eTokens, tarjetas inteligentes y otros módulos de hardware
                  de seguridad.
                </p>
                <p className="text-sm text-slate-700">
                  Sin esta extensión, no es posible utilizar la firma electrónica avanzada con
                  dispositivos físicos a través del navegador.
                </p>
              </div>
              
              {extensionReady === true && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Extensión detectada</AlertTitle>
                  <AlertDescription className="text-green-700">
                    La extensión de firma electrónica está correctamente instalada y lista para usar.
                  </AlertDescription>
                </Alert>
              )}
              
              {extensionReady === false && (
                <Alert className="bg-red-50 border-red-200">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-800">Extensión no detectada</AlertTitle>
                  <AlertDescription className="text-red-700">
                    No se detectó la extensión de firma electrónica. Por favor, asegúrese de que está instalada
                    y activa en su navegador.
                  </AlertDescription>
                </Alert>
              )}
              
              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-800">Error al verificar</AlertTitle>
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={verifyExtension} 
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={isChecking}
              >
                {isChecking ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                    Verificando...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Verificar extensión
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Pestaña: Detectar Dispositivos */}
        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <KeyRound className="h-5 w-5 text-indigo-600 mr-2" />
                Detectar Dispositivos
              </CardTitle>
              <CardDescription>
                Busca dispositivos de firma electrónica conectados al equipo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-slate-50">
                <h3 className="font-medium mb-2">Dispositivos compatibles</h3>
                <p className="text-sm text-slate-700 mb-2">
                  Los dispositivos compatibles incluyen tokens USB criptográficos (eToken), tarjetas inteligentes
                  con lectores y otros dispositivos PKCS#11 que almacenan certificados digitales.
                </p>
                <p className="text-sm text-slate-700">
                  Asegúrese de que su dispositivo esté correctamente conectado al equipo antes de realizar
                  la detección.
                </p>
              </div>
              
              {devices.length > 0 && (
                <div className="space-y-3">
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Dispositivos detectados</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Se encontraron los siguientes dispositivos:
                    </AlertDescription>
                  </Alert>
                  
                  <div className="ml-2 mt-2">
                    <ul className="list-disc list-inside space-y-1.5 text-sm ml-4">
                      {devices.map((device, idx) => (
                        <li key={idx} className="text-gray-700">{device}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {devices.length === 0 && !isChecking && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">No se han detectado dispositivos</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Haga clic en "Detectar dispositivos" para buscar dispositivos conectados.
                  </AlertDescription>
                </Alert>
              )}
              
              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-800">Error al detectar</AlertTitle>
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={detectDevices} 
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={isChecking}
              >
                {isChecking ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                    Buscando...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Detectar dispositivos
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Pestaña: Listar Certificados */}
        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileDigit className="h-5 w-5 text-indigo-600 mr-2" />
                Listar Certificados
              </CardTitle>
              <CardDescription>
                Muestra los certificados digitales disponibles en el dispositivo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 mb-4">
                <Label htmlFor="pin">PIN de acceso</Label>
                <Input 
                  id="pin" 
                  type="password" 
                  placeholder="Ingrese el PIN de su dispositivo" 
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Su PIN no se almacena y solo se utiliza para acceder al dispositivo localmente.
                </p>
              </div>
              
              {certificates.length > 0 && (
                <div className="space-y-3">
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Certificados encontrados</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Se encontraron {certificates.length} certificado(s) en el dispositivo:
                    </AlertDescription>
                  </Alert>
                  
                  <div className="mt-3 space-y-3">
                    {certificates.map((cert, index) => (
                      <div key={index} className="p-3 border rounded-md bg-white">
                        <p className="text-sm font-medium">{cert.subject}</p>
                        <p className="text-xs text-gray-600 mt-1">Emisor: {cert.issuer}</p>
                        <p className="text-xs text-gray-600">
                          Válido hasta: {formatDate(cert.validTo)}
                        </p>
                        <p className="text-xs font-mono text-gray-500 mt-1.5 break-all">
                          Serial: {cert.serialNumber}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {certificates.length === 0 && !isChecking && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">No se han detectado certificados</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Ingrese su PIN y haga clic en "Listar certificados" para ver los certificados disponibles.
                  </AlertDescription>
                </Alert>
              )}
              
              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-800">Error al listar certificados</AlertTitle>
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={listCertificates} 
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={isChecking || !pin}
              >
                {isChecking ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                    Consultando...
                  </>
                ) : (
                  <>
                    <FileDigit className="mr-2 h-4 w-4" />
                    Listar certificados
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">Solución de problemas</h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-yellow-700">
          <li>Si la extensión no se detecta, asegúrese de haberla instalado desde la tienda de extensiones del navegador</li>
          <li>Algunos navegadores requieren habilitar manualmente la extensión tras la instalación</li>
          <li>Si su dispositivo no se detecta, intente desconectarlo y volver a conectarlo</li>
          <li>Verifique que los controladores del dispositivo estén correctamente instalados en su sistema</li>
          <li>Si aparece un error de PIN incorrecto, asegúrese de estar utilizando el PIN correcto</li>
          <li>En caso de bloqueo del PIN, deberá contactar con el proveedor de su dispositivo</li>
        </ul>
      </div>
    </div>
  );
}