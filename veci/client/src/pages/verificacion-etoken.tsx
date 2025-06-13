import { useState, useEffect } from "react";
import { 
  checkExtensionAvailability,
  listTokenDevices,
  getCertificates,
  signData,
  CertificateInfo 
} from "@/lib/pkcs11-bridge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  KeyRound, 
  Shield, 
  AlertCircle,
  LucideHardDrive
} from "lucide-react";
import { 
  Alert,
  AlertTitle,
  AlertDescription
} from "@/components/ui/alert";

export default function VerificacionEToken() {
  const [extensionAvailable, setExtensionAvailable] = useState<boolean | null>(null);
  const [devices, setDevices] = useState<string[]>([]);
  const [pin, setPin] = useState("");
  const [certificados, setCertificados] = useState<CertificateInfo[]>([]);
  const [selectedCertSerial, setSelectedCertSerial] = useState<string>("");
  const [signatureResult, setSignatureResult] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [dataToSign] = useState("DOCUMENTO DE PRUEBA 12345");

  // Verificar disponibilidad de la extensión al cargar
  useEffect(() => {
    const checkExtension = async () => {
      try {
        setIsChecking(true);
        setCurrentError(null);
        const isAvailable = await checkExtensionAvailability();
        setExtensionAvailable(isAvailable);
      } catch (error: any) {
        setCurrentError(`Error al verificar la extensión: ${error.message}`);
        setExtensionAvailable(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkExtension();
  }, []);

  // Detectar dispositivos
  const handleDetectarDispositivos = async () => {
    try {
      setIsChecking(true);
      setCurrentError(null);
      setDevices([]);
      
      const detectedDevices = await listTokenDevices();
      setDevices(detectedDevices);
      
      if (detectedDevices.length === 0) {
        setCurrentError("No se detectaron dispositivos criptográficos conectados");
      }
    } catch (error: any) {
      setCurrentError(`Error al detectar dispositivos: ${error.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  // Obtener certificados
  const handleObtenerCertificados = async () => {
    if (!pin) {
      setCurrentError("Debe ingresar un PIN válido");
      return;
    }

    try {
      setIsChecking(true);
      setCurrentError(null);
      setCertificados([]);
      
      const certs = await getCertificates(pin);
      setCertificados(certs);
      
      if (certs.length > 0) {
        setSelectedCertSerial(certs[0].serialNumber);
      } else {
        setCurrentError("No se encontraron certificados válidos en el dispositivo");
      }
    } catch (error: any) {
      setCurrentError(`Error al obtener certificados: ${error.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  // Firmar datos
  const handleFirmar = async () => {
    if (!selectedCertSerial) {
      setCurrentError("Debe seleccionar un certificado para firmar");
      return;
    }

    if (!pin) {
      setCurrentError("Debe ingresar un PIN válido");
      return;
    }

    try {
      setIsChecking(true);
      setCurrentError(null);
      setSignatureResult(null);
      
      const result = await signData(dataToSign, selectedCertSerial, pin);
      
      // Crear representación del resultado como JSON formateado
      const resultJson = JSON.stringify({
        signature: result.signature.substring(0, 32) + "...",
        certificate: result.certificate.substring(0, 32) + "...",
        timestamp: result.timestamp,
        provider: result.provider,
        algorithm: result.algorithm
      }, null, 2);
      
      setSignatureResult(resultJson);
    } catch (error: any) {
      setCurrentError(`Error al firmar datos: ${error.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  // Formatear fecha del certificado 
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Verificación de eToken Real
      </h1>
      <p className="text-gray-600 mb-6">
        Esta página permite verificar la integración real con dispositivos eToken físicos.
      </p>

      {/* Paso 1: Verificar extensión instalada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            <span>Paso 1: Verificar extensión</span>
          </CardTitle>
          <CardDescription>
            Verificando si la extensión de firma electrónica está instalada
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isChecking && extensionAvailable === null ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin h-6 w-6 border-2 border-indigo-600 rounded-full border-t-transparent"></div>
              <span className="ml-3 text-sm text-gray-600">Verificando extensión...</span>
            </div>
          ) : extensionAvailable === true ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Extensión detectada</AlertTitle>
              <AlertDescription className="text-green-700">
                La extensión de firma electrónica está correctamente instalada y lista para usar.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-red-50 border-red-200">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Extensión no detectada</AlertTitle>
              <AlertDescription className="text-red-700">
                No se detectó la extensión necesaria para firmar con eToken. Por favor instálela y recargue la página.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <Button 
            variant="outline"
            onClick={() => {
              setExtensionAvailable(null);
              setCurrentError(null);
              setIsChecking(true);
              checkExtensionAvailability().then(available => {
                setExtensionAvailable(available);
                setIsChecking(false);
              }).catch(err => {
                setCurrentError(`Error al verificar la extensión: ${err.message}`);
                setExtensionAvailable(false);
                setIsChecking(false);
              });
            }}
            disabled={isChecking}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Verificar de nuevo
          </Button>
        </CardFooter>
      </Card>

      {/* Paso 2: Detectar dispositivos */}
      {extensionAvailable && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LucideHardDrive className="h-5 w-5 text-indigo-600" />
              <span>Paso 2: Detectar dispositivos</span>
            </CardTitle>
            <CardDescription>
              Buscar dispositivos criptográficos conectados (tokens, smartcards)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isChecking && devices.length === 0 ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin h-6 w-6 border-2 border-indigo-600 rounded-full border-t-transparent"></div>
                <span className="ml-3 text-sm text-gray-600">Buscando dispositivos...</span>
              </div>
            ) : devices.length > 0 ? (
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
            ) : currentError ? (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Error al detectar dispositivos</AlertTitle>
                <AlertDescription className="text-red-700">
                  {currentError}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Dispositivos no detectados</AlertTitle>
                <AlertDescription className="text-blue-700">
                  No se han detectado dispositivos aún. Haga clic en "Detectar dispositivos".
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="justify-end">
            <Button 
              onClick={handleDetectarDispositivos}
              disabled={isChecking}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isChecking ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                  Buscando...
                </>
              ) : (
                <>
                  <LucideHardDrive className="h-4 w-4 mr-2" />
                  Detectar dispositivos
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Paso 3: Consultar certificados */}
      {extensionAvailable && devices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <KeyRound className="h-5 w-5 text-indigo-600" />
              <span>Paso 3: Consultar certificados</span>
            </CardTitle>
            <CardDescription>
              Obtenga los certificados disponibles en su eToken
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pin">PIN de acceso</Label>
                <Input 
                  id="pin" 
                  type="password" 
                  placeholder="Ingrese su PIN" 
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Su PIN no se almacena y solo se utiliza para acceder al token.
                </p>
              </div>
              
              {certificados.length > 0 && (
                <div className="space-y-3 mt-4">
                  <h3 className="text-sm font-medium text-gray-700">Certificados disponibles:</h3>
                  {certificados.map((cert, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedCertSerial === cert.serialNumber 
                          ? 'border-indigo-300 bg-indigo-50' 
                          : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50'
                      }`}
                      onClick={() => setSelectedCertSerial(cert.serialNumber)}
                    >
                      <div className="flex items-start gap-2">
                        {selectedCertSerial === cert.serialNumber && (
                          <div className="mt-0.5">
                            <div className="h-4 w-4 rounded-full bg-indigo-100 flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
                            </div>
                          </div>
                        )}
                        <div className={selectedCertSerial === cert.serialNumber ? "" : "ml-6"}>
                          <p className="text-sm font-medium text-gray-800">{cert.subject}</p>
                          <p className="text-xs text-gray-600 mt-1">Emisor: {cert.issuer}</p>
                          <p className="text-xs text-gray-600">
                            Válido hasta: {formatDate(cert.validTo)}
                          </p>
                          <p className="text-xs font-mono text-gray-500 mt-1.5">
                            Serial: {cert.serialNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {isChecking && certificados.length === 0 ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin h-6 w-6 border-2 border-indigo-600 rounded-full border-t-transparent"></div>
                  <span className="ml-3 text-sm text-gray-600">Consultando certificados...</span>
                </div>
              ) : currentError && certificados.length === 0 ? (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-800">Error</AlertTitle>
                  <AlertDescription className="text-red-700">
                    {currentError}
                  </AlertDescription>
                </Alert>
              ) : null}
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              variant="outline" 
              className="mr-2"
              onClick={() => {
                setCertificados([]);
                setSelectedCertSerial("");
                setPin("");
                setCurrentError(null);
              }}
              disabled={isChecking || certificados.length === 0}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
            <Button 
              onClick={handleObtenerCertificados}
              disabled={isChecking || !pin || pin.length < 4}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isChecking ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                  Consultando...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4 mr-2" />
                  Consultar certificados
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Paso 4: Firmar datos */}
      {extensionAvailable && devices.length > 0 && certificados.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              <span>Paso 4: Firmar datos</span>
            </CardTitle>
            <CardDescription>
              Firmar datos de prueba con el certificado seleccionado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
              <h3 className="text-sm font-medium mb-2">Datos a firmar:</h3>
              <p className="text-sm font-mono bg-white p-2 border border-gray-200 rounded">
                {dataToSign}
              </p>
            </div>
            
            {signatureResult && (
              <div className="space-y-2 mt-4">
                <h3 className="text-sm font-medium text-gray-700">Resultado de la firma:</h3>
                <pre className="text-xs bg-black text-green-400 p-3 rounded-md overflow-x-auto">
                  {signatureResult}
                </pre>
              </div>
            )}
            
            {isChecking && !signatureResult ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin h-6 w-6 border-2 border-indigo-600 rounded-full border-t-transparent"></div>
                <span className="ml-3 text-sm text-gray-600">Firmando datos...</span>
              </div>
            ) : currentError && !signatureResult ? (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription className="text-red-700">
                  {currentError}
                </AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
          <CardFooter className="justify-end">
            <Button 
              onClick={handleFirmar}
              disabled={isChecking || !selectedCertSerial || !pin}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isChecking ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                  Firmando...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Firmar datos
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}