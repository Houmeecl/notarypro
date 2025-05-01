import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Fingerprint, ShieldCheck, AlertCircle, Key, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  checkExtensionAvailability, 
  listTokenDevices, 
  getCertificates, 
  signData, 
  getTimestamp,
  CertificateInfo,
  TokenProvider
} from "@/lib/pkcs11-bridge";

interface ETokenSignatureProps {
  documentId: number;
  documentHash: string;
  onSignComplete: (signatureData: any) => void;
  onCancel: () => void;
}

export function ETokenSignature({ 
  documentId, 
  documentHash,
  onSignComplete,
  onCancel
}: ETokenSignatureProps) {
  const [step, setStep] = useState<'extension' | 'device' | 'certificate' | 'pin' | 'process'>('extension');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extensionAvailable, setExtensionAvailable] = useState(false);
  const [devices, setDevices] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [certificates, setCertificates] = useState<CertificateInfo[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<string>('');
  const { toast } = useToast();

  // Paso 1: Verificar extensión instalada
  const checkExtension = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const available = await checkExtensionAvailability();
      setExtensionAvailable(available);
      
      if (available) {
        setStep('device');
        // En una aplicación real, este es el momento de verificar 
        // si se tiene instalado el middleware adecuado
        await detectDevices();
      } else {
        setError("No se detectó la extensión necesaria para firmar con eToken");
      }
    } catch (err: any) {
      setError("Error al verificar la extensión: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 2: Detectar dispositivos
  const detectDevices = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const detectedDevices = await listTokenDevices();
      setDevices(detectedDevices);
      
      if (detectedDevices.length > 0) {
        setSelectedDevice(detectedDevices[0]);
        setStep('certificate');
        await loadCertificates();
      } else {
        setError("No se detectaron dispositivos criptográficos conectados");
      }
    } catch (err: any) {
      setError("Error al detectar dispositivos: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 3: Cargar certificados
  const loadCertificates = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Para cargar certificados sin PIN, enviamos un string vacío
      // En un caso real, algunas implementaciones requieren PIN para este paso
      const certs = await getCertificates("");
      setCertificates(certs);
      
      if (certs.length > 0) {
        setSelectedCertificate(certs[0].serialNumber);
        setStep('pin');
      } else {
        setError("No se encontraron certificados válidos en el dispositivo");
      }
    } catch (err: any) {
      setError("Error al cargar certificados: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 4: Firmar con PIN
  const handleSignWithPin = async () => {
    if (!pin || pin.length < 4) {
      setError("El PIN debe tener al menos 4 dígitos");
      return;
    }

    setError(null);
    setIsLoading(true);
    setStep('process');

    try {
      // Firmar datos con el token
      const signatureResult = await signData(
        documentHash,
        selectedCertificate,
        pin
      );
      
      // Obtener sello de tiempo
      const timestampToken = await getTimestamp(signatureResult);
      
      // Encontrar información del certificado seleccionado
      const certInfo = certificates.find(c => c.serialNumber === selectedCertificate);
      
      // Preparar datos de firma para el backend
      const signatureData = {
        tokenSignature: signatureResult.signature,
        certificate: signatureResult.certificate,
        timestamp: signatureResult.timestamp,
        timestampToken,
        tokenInfo: {
          certificateAuthor: certInfo?.issuer || "Unknown Issuer",
          certificateId: selectedCertificate,
          provider: certInfo?.provider || TokenProvider.UNKNOWN,
          algorithm: signatureResult.algorithm
        }
      };

      // Enviar al callback de firma completa
      onSignComplete(signatureData);
      
    } catch (err: any) {
      setError(err.message || "Error al firmar con eToken. Inténtelo nuevamente.");
      setStep('pin');
      setIsLoading(false);
    }
  };

  // Formatea fecha para display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Traduce el proveedor a nombre legible
  const getProviderName = (provider: TokenProvider): string => {
    const names: Record<TokenProvider, string> = {
      [TokenProvider.ECERT]: 'E-Cert Chile',
      [TokenProvider.ESIGN]: 'E-Sign',
      [TokenProvider.TOC]: 'TOC (Transbank)',
      [TokenProvider.ACEPTA]: 'Acepta',
      [TokenProvider.CERTINET]: 'Certinet (BCI)',
      [TokenProvider.UNKNOWN]: 'Desconocido'
    };
    return names[provider];
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="text-primary h-5 w-5" />
          Firma con eToken
        </CardTitle>
        <CardDescription>
          Use su dispositivo criptográfico para firmar el documento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Paso 1: Verificar extensión instalada */}
        {step === 'extension' && (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Verificación de extensión</AlertTitle>
              <AlertDescription className="text-blue-700">
                Para poder firmar con su dispositivo criptográfico, necesitamos verificar si tiene la extensión necesaria instalada.
              </AlertDescription>
            </Alert>
            
            <div className="border rounded-md p-4 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Preparación:</h3>
              <ol className="space-y-1.5 text-sm text-gray-600 ml-5 list-decimal">
                <li>Asegúrese que tenga instalada la extensión "Firma Digital Chile"</li>
                <li>Verifique que su dispositivo eToken esté conectado a un puerto USB</li>
                <li>Confirme que los drivers del dispositivo estén instalados</li>
                <li>Tenga a mano su PIN de acceso al dispositivo</li>
              </ol>
            </div>
          </div>
        )}

        {/* Paso 2: Detectar dispositivos */}
        {step === 'device' && (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Extensión detectada</AlertTitle>
              <AlertDescription className="text-green-700">
                La extensión para firmas digitales está disponible. Conecte su dispositivo criptográfico si aún no lo ha hecho.
              </AlertDescription>
            </Alert>
            
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-3">Dispositivos detectados:</h3>
              {devices.length > 0 ? (
                <div className="space-y-3">
                  <Select 
                    value={selectedDevice} 
                    onValueChange={setSelectedDevice}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un dispositivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {devices.map((device, index) => (
                        <SelectItem key={index} value={device}>
                          {device}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Buscando dispositivos conectados...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Paso 3: Seleccionar certificado */}
        {step === 'certificate' && (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Dispositivo detectado</AlertTitle>
              <AlertDescription className="text-green-700">
                {selectedDevice}
              </AlertDescription>
            </Alert>
            
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-3">Certificados disponibles:</h3>
              {certificates.length > 0 ? (
                <div className="space-y-3">
                  <Select 
                    value={selectedCertificate} 
                    onValueChange={setSelectedCertificate}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un certificado" />
                    </SelectTrigger>
                    <SelectContent>
                      {certificates.map((cert, index) => (
                        <SelectItem key={index} value={cert.serialNumber}>
                          {cert.subject} ({getProviderName(cert.provider)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedCertificate && (
                    <div className="text-xs space-y-1 mt-2 bg-gray-50 p-2 rounded-md">
                      {certificates
                        .filter(cert => cert.serialNumber === selectedCertificate)
                        .map((cert, index) => (
                          <div key={index}>
                            <p><span className="font-semibold">Emisor:</span> {cert.issuer}</p>
                            <p><span className="font-semibold">Válido hasta:</span> {formatDate(cert.validTo)}</p>
                            <p><span className="font-semibold">Entidad:</span> {getProviderName(cert.provider)}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  No se encontraron certificados en el dispositivo.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Paso 4: Ingresar PIN */}
        {step === 'pin' && (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Certificado seleccionado</AlertTitle>
              <AlertDescription className="text-green-700">
                {certificates.find(c => c.serialNumber === selectedCertificate)?.subject}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <Label htmlFor="token-pin">
                <div className="flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-gray-700" />
                  <span>PIN de acceso</span>
                </div>
              </Label>
              <Input 
                id="token-pin"
                type="password" 
                placeholder="Ingrese su PIN" 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="font-mono tracking-widest"
              />
              <p className="text-xs text-gray-500">
                El PIN no se almacena en nuestros servidores y solo se utiliza para
                autorizar la operación de firma en su dispositivo.
              </p>
            </div>
          </div>
        )}

        {/* Paso 5: Procesando firma */}
        {step === 'process' && (
          <div className="py-6 text-center">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Firmando documento</h3>
            <p className="text-gray-600 mb-4">
              El documento está siendo firmado con su certificado digital.
              Por favor, no desconecte su dispositivo.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        
        {step === 'extension' && (
          <Button 
            onClick={checkExtension} 
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <Fingerprint className="mr-2 h-4 w-4" />
                Verificar extensión
              </>
            )}
          </Button>
        )}
        
        {step === 'device' && (
          <Button 
            onClick={detectDevices}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            <Fingerprint className="mr-2 h-4 w-4" />
            Detectar dispositivos
          </Button>
        )}
        
        {step === 'certificate' && (
          <Button 
            onClick={loadCertificates}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Cargar certificados
          </Button>
        )}
        
        {step === 'pin' && (
          <Button 
            onClick={handleSignWithPin} 
            disabled={!pin || isLoading || pin.length < 4}
            className="bg-primary hover:bg-primary/90"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Firmar documento
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}