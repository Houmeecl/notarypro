import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  ShieldCheck, 
  Key, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  FileDigit,
  Clock,
  Info,
  Fingerprint
} from "lucide-react";
import { eTokenSigner, type CertificateInfo, type TokenStatus } from "@/lib/etoken-signer";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("not_detected");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [certificates, setCertificates] = useState<CertificateInfo[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);
  const [signatureComplete, setSignatureComplete] = useState(false);
  const [signatureData, setSignatureData] = useState<any>(null);
  const [step, setStep] = useState<"detect" | "pin" | "select" | "sign" | "complete">("detect");
  const { toast } = useToast();

  // Detectar token al iniciar
  useEffect(() => {
    if (step === "detect") {
      detectToken();
    }
  }, [step]);

  const detectToken = async () => {
    setIsLoading(true);
    try {
      const detected = await eTokenSigner.detectTokens();
      setTokenStatus(eTokenSigner.getStatus());
      
      if (detected) {
        setStep("pin");
      }
    } catch (error) {
      console.error("Error detectando eToken:", error);
      toast({
        title: "Error de detección",
        description: "No se pudo detectar el dispositivo de firma electrónica. Verifique la conexión e intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeToken = async () => {
    if (!pin) {
      toast({
        title: "PIN requerido",
        description: "Por favor ingrese el PIN de su dispositivo de firma.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const initialized = await eTokenSigner.initializeToken(pin);
      setTokenStatus(eTokenSigner.getStatus());
      
      if (initialized) {
        const certs = eTokenSigner.getCertificates();
        setCertificates(certs);
        
        if (certs.length > 0) {
          setStep("select");
        } else {
          toast({
            title: "Sin certificados",
            description: "No se encontraron certificados válidos en el dispositivo.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "PIN incorrecto",
          description: "El PIN ingresado no es válido. Intente nuevamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error inicializando eToken:", error);
      toast({
        title: "Error de inicialización",
        description: "No se pudo inicializar el dispositivo de firma. Verifique su PIN e intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCertificateSelect = (certificateSerial: string) => {
    setSelectedCertificate(certificateSerial);
    const selected = eTokenSigner.selectCertificate(certificateSerial);
    
    if (selected) {
      setStep("sign");
    } else {
      toast({
        title: "Error de selección",
        description: "No se pudo seleccionar el certificado. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const signWithEToken = async () => {
    setIsLoading(true);
    try {
      const signatureResult = await eTokenSigner.signDocument(documentHash);
      
      if (signatureResult) {
        setSignatureData(signatureResult);
        setSignatureComplete(true);
        setStep("complete");
        
        // Notificar que la firma está completa
        onSignComplete({
          tokenSignature: signatureResult.signature,
          tokenCertificate: signatureResult.certificate.serialNumber,
          tokenTimestamp: signatureResult.timestamp,
          tokenAlgorithm: signatureResult.algorithm,
          signatureType: "advanced_token",
          signatureMethod: "etoken",
          documentId
        });
      } else {
        toast({
          title: "Error de firma",
          description: "No se pudo completar el proceso de firma. Intente nuevamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error firmando con eToken:", error);
      toast({
        title: "Error de firma",
        description: "Ocurrió un error durante el proceso de firma. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatusIcon = () => {
    switch (tokenStatus) {
      case "not_detected":
        return <Shield className="h-6 w-6 text-gray-400" />;
      case "detected":
        return <Shield className="h-6 w-6 text-amber-500" />;
      case "ready":
        return <ShieldCheck className="h-6 w-6 text-green-500" />;
      case "pin_required":
        return <Key className="h-6 w-6 text-amber-500" />;
      case "error":
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case "not_supported":
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
      default:
        return <Shield className="h-6 w-6 text-gray-400" />;
    }
  };

  const renderDetectStep = () => (
    <>
      <CardContent className="space-y-4 pt-4">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="bg-gray-50 p-6 rounded-full mb-4">
            {renderStatusIcon()}
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Detectar dispositivo de firma</h3>
          <p className="text-gray-600 text-center max-w-md mb-4">
            Conecte su eToken o dispositivo de firma electrónica a su computadora y haga clic en "Detectar dispositivo".
          </p>
        </div>
        
        <Alert className="bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Información</AlertTitle>
          <AlertDescription className="text-blue-700">
            Para firmar con eToken necesita tener instalados los drivers del dispositivo y un certificado digital válido.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={detectToken} 
          disabled={isLoading || tokenStatus === "not_supported"}
          className="bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Detectando...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Detectar dispositivo
            </>
          )}
        </Button>
      </CardFooter>
    </>
  );

  const renderPinStep = () => (
    <>
      <CardContent className="space-y-4 pt-4">
        <div className="flex flex-col items-center justify-center py-4">
          <div className="bg-gray-50 p-6 rounded-full mb-4">
            <Key className="h-6 w-6 text-amber-500" />
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Ingrese su PIN</h3>
          <p className="text-gray-600 text-center max-w-md mb-4">
            Ingrese el PIN de su dispositivo de firma electrónica para acceder a sus certificados digitales.
          </p>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="pin">PIN del dispositivo</Label>
          <Input
            id="pin"
            type="password"
            placeholder="Ingrese su PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            autoComplete="off"
          />
        </div>
        
        <Alert className="bg-amber-50">
          <Lock className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Importante</AlertTitle>
          <AlertDescription className="text-amber-700">
            Su PIN es personal y no se almacena en ningún momento. 
            El PIN se utiliza únicamente para acceder a su certificado de firma electrónica.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => setStep("detect")}>
          Atrás
        </Button>
        <Button 
          onClick={initializeToken} 
          disabled={isLoading || !pin}
          className="bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Continuar
            </>
          )}
        </Button>
      </CardFooter>
    </>
  );

  const renderSelectStep = () => (
    <>
      <CardContent className="space-y-4 pt-4">
        <div className="flex flex-col items-center justify-center py-4">
          <div className="bg-gray-50 p-6 rounded-full mb-4">
            <FileDigit className="h-6 w-6 text-green-500" />
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Seleccione certificado</h3>
          <p className="text-gray-600 text-center max-w-md mb-4">
            Seleccione el certificado digital que desea utilizar para firmar el documento.
          </p>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="certificate">Certificado digital</Label>
          <Select 
            onValueChange={handleCertificateSelect}
            value={selectedCertificate || undefined}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un certificado" />
            </SelectTrigger>
            <SelectContent>
              {certificates.map((cert) => (
                <SelectItem 
                  key={cert.serialNumber} 
                  value={cert.serialNumber}
                  className="py-2"
                >
                  <div>
                    <p className="font-medium">{cert.subject}</p>
                    <p className="text-xs text-gray-500">
                      Válido hasta: {format(cert.validTo, "dd/MM/yyyy", { locale: es })}
                    </p>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {certificates.length > 0 && selectedCertificate && (
          <div className="bg-gray-50 border rounded p-3 text-sm">
            <p className="font-medium mb-1 text-gray-700">Detalles del certificado</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-gray-500">Emitido por</p>
                <p className="text-gray-700">
                  {certificates.find(c => c.serialNumber === selectedCertificate)?.issuer.split(',')[0].replace('CN=', '')}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Válido desde</p>
                <p className="text-gray-700">
                  {format(
                    certificates.find(c => c.serialNumber === selectedCertificate)?.validFrom || new Date(), 
                    "dd/MM/yyyy", 
                    { locale: es }
                  )}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Válido hasta</p>
                <p className="text-gray-700">
                  {format(
                    certificates.find(c => c.serialNumber === selectedCertificate)?.validTo || new Date(), 
                    "dd/MM/yyyy", 
                    { locale: es }
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => setStep("pin")}>
          Atrás
        </Button>
        <Button 
          onClick={signWithEToken} 
          disabled={isLoading || !selectedCertificate}
          className="bg-primary hover:bg-primary/90"
        >
          <Fingerprint className="mr-2 h-4 w-4" />
          Firmar documento
        </Button>
      </CardFooter>
    </>
  );

  const renderSignStep = () => (
    <>
      <CardContent className="space-y-4 pt-4">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="bg-gray-50 p-6 rounded-full mb-4">
            <Fingerprint className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Firmando documento</h3>
          <p className="text-gray-600 text-center max-w-md mb-4">
            El proceso de firma está en curso. Por favor, no desconecte su dispositivo.
          </p>
          <div className="w-16 h-16 flex items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
        </div>
      </CardContent>
    </>
  );

  const renderCompleteStep = () => (
    <>
      <CardContent className="space-y-4 pt-4">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="bg-green-50 p-6 rounded-full mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">¡Firma completada!</h3>
          <p className="text-gray-600 text-center max-w-md mb-4">
            El documento ha sido firmado exitosamente con su certificado digital.
          </p>
        </div>
        
        <Alert className="bg-green-50 border-green-200">
          <Clock className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Documento firmado con estampa de tiempo</AlertTitle>
          <AlertDescription className="text-green-700">
            El documento ha sido firmado electrónicamente con validez legal según la Ley 19.799.
            La firma incluye una estampa de tiempo certificada.
          </AlertDescription>
        </Alert>
        
        <div className="bg-gray-50 border rounded p-3">
          <p className="font-medium mb-2 text-gray-700">Detalles de la firma</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-start">
              <span className="font-medium w-1/3 text-gray-500">Firmante:</span>
              <span className="flex-1 text-gray-700">
                {signatureData?.certificate.subject.split(',')[0].replace('CN=', '')}
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-medium w-1/3 text-gray-500">Fecha y hora:</span>
              <span className="flex-1 text-gray-700">
                {signatureData?.timestamp ? new Date(signatureData.timestamp).toLocaleString('es-CL') : ''}
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-medium w-1/3 text-gray-500">Certificadora:</span>
              <span className="flex-1 text-gray-700">
                {signatureData?.certificate.issuer.split(',')[0].replace('CN=', '')}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end pt-2">
        <Button onClick={onCancel} className="bg-primary hover:bg-primary/90">
          Finalizar
        </Button>
      </CardFooter>
    </>
  );

  const renderContent = () => {
    switch (step) {
      case "detect":
        return renderDetectStep();
      case "pin":
        return renderPinStep();
      case "select":
        return renderSelectStep();
      case "sign":
        return renderSignStep();
      case "complete":
        return renderCompleteStep();
      default:
        return renderDetectStep();
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex items-center">
          <div className="mr-2 flex-shrink-0">
            {renderStatusIcon()}
          </div>
          <div>
            <CardTitle>Firma Electrónica Avanzada con eToken</CardTitle>
            <CardDescription>
              Firma con su dispositivo criptográfico para máxima seguridad y valor legal.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      {renderContent()}
    </Card>
  );
}