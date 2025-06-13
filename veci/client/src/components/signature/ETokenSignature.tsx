import { useState, useEffect } from "react";
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
  FileSignature
} from "lucide-react";
import { 
  Alert,
  AlertTitle,
  AlertDescription
} from "@/components/ui/alert";
import { 
  checkExtensionAvailability,
  listTokenDevices,
  getCertificates,
  signData,
  CertificateInfo 
} from "@/lib/pkcs11-bridge";
import { useToast } from "@/hooks/use-toast";

interface ETokenSignatureProps {
  documentId: number | string;
  documentHash: string;
  onSignComplete: (signatureData: {
    signature: string;
    certificate: string;
    timestamp: string;
    provider: string;
    algorithm: string;
  }) => void;
  onCancel: () => void;
}

export default function ETokenSignature({
  documentId,
  documentHash,
  onSignComplete,
  onCancel
}: ETokenSignatureProps) {
  const [extensionAvailable, setExtensionAvailable] = useState<boolean | null>(null);
  const [devices, setDevices] = useState<string[]>([]);
  const [pin, setPin] = useState("");
  const [certificados, setCertificados] = useState<CertificateInfo[]>([]);
  const [selectedCertSerial, setSelectedCertSerial] = useState<string>("");
  const [isChecking, setIsChecking] = useState(false);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const { toast } = useToast();

  // Verificar si la extensión está disponible
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
      } else {
        setCurrentStep(2);
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
        setCurrentStep(3);
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
      
      const result = await signData(documentHash, selectedCertSerial, pin);
      
      onSignComplete({
        signature: result.signature,
        certificate: result.certificate,
        timestamp: result.timestamp,
        provider: result.provider,
        algorithm: result.algorithm
      });
      
      toast({
        title: "¡Documento firmado!",
        description: "El documento ha sido firmado con éxito utilizando su firma digital avanzada.",
      });
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
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Paso 1: Verificar extensión instalada */}
      <Card className={currentStep !== 1 ? "opacity-60" : ""}>
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
          {currentStep === 1 && extensionAvailable === true && (
            <Button 
              onClick={handleDetectarDispositivos}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Continuar al paso 2
            </Button>
          )}
          {currentStep === 1 && extensionAvailable !== true && (
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
          )}
        </CardFooter>
      </Card>

      {/* Paso 2: Detectar dispositivos */}
      {extensionAvailable && (
        <Card className={currentStep !== 2 ? "opacity-60" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <KeyRound className="h-5 w-5 text-indigo-600" />
              <span>Paso 2: Detectar dispositivos</span>
            </CardTitle>
            <CardDescription>
              Buscar dispositivos criptográficos conectados (tokens, smartcards)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStep === 2 && (
              <div className="space-y-4">
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
                    
                    <div className="space-y-2 mt-4">
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
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-between">
            {currentStep === 2 && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCurrentStep(1);
                    setPin("");
                  }}
                >
                  Regresar
                </Button>
                
                {devices.length === 0 ? (
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
                        <KeyRound className="h-4 w-4 mr-2" />
                        Detectar dispositivos
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleObtenerCertificados}
                    disabled={isChecking || !pin || pin.length < 4}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Continuar
                  </Button>
                )}
              </>
            )}
          </CardFooter>
        </Card>
      )}

      {/* Paso 3: Consultar certificados y firmar */}
      {extensionAvailable && currentStep >= 2 && (
        <Card className={currentStep !== 3 ? "opacity-60" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileSignature className="h-5 w-5 text-indigo-600" />
              <span>Paso 3: Firmar documento</span>
            </CardTitle>
            <CardDescription>
              Firmar el documento con certificado digital
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStep === 3 && (
              <div className="space-y-4">
                {certificados.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700">Certificado seleccionado:</h3>
                    {certificados.map((cert, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 border rounded-md ${
                          selectedCertSerial === cert.serialNumber 
                            ? 'border-indigo-300 bg-indigo-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="ml-2">
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
                
                <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                  <h3 className="text-sm font-medium mb-2">Documento a firmar:</h3>
                  <p className="text-sm text-gray-700">
                    ID: <span className="font-mono">{documentId}</span>
                  </p>
                  <p className="text-sm font-mono mt-2 bg-white p-2 border border-gray-200 rounded text-xs truncate">
                    Hash: {documentHash.substring(0, 40)}...
                  </p>
                </div>
                
                {isChecking ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin h-6 w-6 border-2 border-indigo-600 rounded-full border-t-transparent"></div>
                    <span className="ml-3 text-sm text-gray-600">Firmando documento...</span>
                  </div>
                ) : currentError ? (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800">Error</AlertTitle>
                    <AlertDescription className="text-red-700">
                      {currentError}
                    </AlertDescription>
                  </Alert>
                ) : null}
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-between">
            {currentStep === 3 && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCurrentStep(2);
                    setCertificados([]);
                    setSelectedCertSerial("");
                  }}
                >
                  Regresar
                </Button>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={onCancel}
                    disabled={isChecking}
                  >
                    Cancelar
                  </Button>
                  
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
                        <FileSignature className="h-4 w-4 mr-2" />
                        Firmar documento
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}