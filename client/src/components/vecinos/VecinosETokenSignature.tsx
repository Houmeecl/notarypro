import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CERTIFIED_PROVIDERS, 
  TokenProvider, 
  TokenCertificate,
  TokenSignatureData,
  checkTokenAvailability,
  signWithToken
} from "@/lib/etoken-signer";

interface VecinosETokenSignatureProps {
  documentId: string;
  documentHash: string;
  onSigningComplete: (signatureData: any) => void;
  onCancel: () => void;
}

export function VecinosETokenSignature({
  documentId,
  documentHash,
  onSigningComplete,
  onCancel
}: VecinosETokenSignatureProps) {
  const [step, setStep] = useState<'detect' | 'select' | 'pin' | 'signing' | 'complete'>('detect');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [selectedCertificate, setSelectedCertificate] = useState<string>("");
  const [certificates, setCertificates] = useState<TokenCertificate[]>([]);
  const [providers, setProviders] = useState<TokenProvider[]>([]);
  const [pin, setPin] = useState("");

  // Detectar token conectado al cargar el componente
  useEffect(() => {
    detectToken();
  }, []);

  // Función para detectar token
  const detectToken = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Verificar disponibilidad del token con la implementación real
      const tokenAvailable = await checkTokenAvailability();
      
      if (tokenAvailable) {
        // Token detectado, mostrar proveedores disponibles
        setProviders(CERTIFIED_PROVIDERS);
        
        // Obtener certificados disponibles (ejemplo)
        const availableCertificates = [
          {
            id: "cert_1",
            subject: "Juan Pérez - RUT: 12.345.678-9",
            issuer: "E-CERT Chile Certification Authority",
            validFrom: "2023-01-01",
            validTo: "2025-01-01",
            serialNumber: "123456789"
          },
          {
            id: "cert_2",
            subject: "María González - RUT: 98.765.432-1",
            issuer: "E-CERT Chile Certification Authority",
            validFrom: "2022-01-01",
            validTo: "2024-01-01",
            serialNumber: "987654321"
          }
        ];
        
        setCertificates(availableCertificates);
        setStep('select');
      } else {
        // Token no detectado
        setError("No se detectó ningún dispositivo eToken. Por favor conecte su token USB y vuelva a intentarlo.");
      }
      
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || "Error al detectar dispositivo");
      setIsLoading(false);
    }
  };

  // Función para firmar con certificado
  const doSignDocument = async () => {
    if (!selectedCertificate || !pin || !selectedProviderId) {
      toast({
        title: "Error",
        description: "Debe seleccionar un certificado e ingresar su PIN",
        variant: "destructive",
      });
      return;
    }

    setStep('signing');
    setIsLoading(true);
    setError(null);

    try {
      // Usar la implementación real de firma con eToken
      const signatureData = await signWithToken(
        documentHash,
        pin,
        selectedProviderId,
        selectedCertificate
      );

      // Procesar la firma exitosa
      onSigningComplete({
        signatureData: signatureData.tokenSignature,
        certificateData: signatureData.tokenInfo.certificateId,
        provider: signatureData.tokenInfo.certificateAuthor,
        timestamp: signatureData.tokenInfo.timestamp
      });
      
      setStep('complete');
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error en firma electrónica:", err);
      setError(err.message || "Error al firmar documento");
      setIsLoading(false);
      setStep('select');
    }
  };

  // Renderizado según el paso actual
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="bg-green-50 border-b">
        <CardTitle className="flex items-center text-green-800">
          <ShieldCheck className="h-6 w-6 mr-2 text-green-600" />
          Firma Avanzada - Vecinos Xpress
        </CardTitle>
        <CardDescription>
          Firma con tu eToken para agregar una firma digital avanzada
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        {step === 'detect' && (
          <div className="text-center py-6">
            <div className="flex justify-center mb-4">
              {isLoading ? (
                <Loader2 className="h-12 w-12 animate-spin text-green-600" />
              ) : error ? (
                <AlertCircle className="h-12 w-12 text-red-500" />
              ) : (
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              )}
            </div>
            
            <h3 className="text-lg font-medium mb-2">
              {isLoading 
                ? "Detectando dispositivo de firma..." 
                : error 
                ? "Error de detección" 
                : "Dispositivo detectado"}
            </h3>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{error}</p>
                    <ul className="list-disc list-inside text-sm mt-2 text-red-700 space-y-1">
                      <li>Verifique que su dispositivo esté correctamente conectado</li>
                      <li>Asegúrese de que los drivers del eToken estén instalados</li>
                      <li>Confirme que la extensión del navegador esté activa</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-gray-600 mb-4">
              {isLoading 
                ? "Por favor asegúrese de que su eToken está conectado al dispositivo." 
                : error 
                ? "Asegúrese de que su dispositivo de firma esté conectado correctamente e intente nuevamente." 
                : "Dispositivo de firma detectado correctamente."}
            </p>
            
            {error && (
              <Button 
                onClick={detectToken} 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reintentar detección
              </Button>
            )}
          </div>
        )}

        {step === 'select' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="provider">Seleccione proveedor de certificación</Label>
              <Select 
                value={selectedProviderId || ''} 
                onValueChange={setSelectedProviderId}
              >
                <SelectTrigger id="provider">
                  <SelectValue placeholder="Seleccionar proveedor..." />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Elija el proveedor de su certificado digital
              </p>
            </div>
            
            <div>
              <Label htmlFor="certificate">Seleccione un certificado</Label>
              <Select 
                value={selectedCertificate || ''} 
                onValueChange={setSelectedCertificate}
                disabled={!selectedProviderId}
              >
                <SelectTrigger id="certificate">
                  <SelectValue placeholder="Seleccionar certificado..." />
                </SelectTrigger>
                <SelectContent>
                  {certificates.map((cert, index) => (
                    <SelectItem key={index} value={cert.serialNumber}>
                      {cert.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Certificado emitido por: {providers.find(p => p.id === selectedProviderId)?.name || 'Entidad Certificadora'}
              </p>
            </div>

            <div>
              <Label htmlFor="pin">PIN de acceso</Label>
              <div className="relative">
                <Input 
                  id="pin" 
                  type="password" 
                  value={pin} 
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Ingrese su PIN"
                  className={pin && pin.length < 4 ? "border-red-300 pr-10" : ""}
                />
                {pin && pin.length < 4 && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                )}
              </div>
              {pin && pin.length < 4 ? (
                <p className="text-xs text-red-500 mt-1">
                  El PIN debe tener al menos 4 caracteres
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  PIN para desbloquear su eToken y realizar la firma
                </p>
              )}
            </div>
          </div>
        )}

        {step === 'signing' && (
          <div className="text-center py-6">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-green-600" />
            <h3 className="text-lg font-medium mb-2">Procesando firma digital</h3>
            <p className="text-gray-600">
              Por favor espere mientras se completa el proceso de firma...
            </p>
          </div>
        )}

        {step === 'complete' && (
          <div className="py-6">
            <div className="text-center mb-6">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-medium mb-2">¡Firma completada!</h3>
              <p className="text-gray-600 mb-4">
                El documento ha sido firmado exitosamente con su certificado digital.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Detalles de la firma</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-green-700">
                    Certificado: {selectedCertificate ? selectedCertificate.substring(0, 8) + '...' : ''}
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-green-700">
                    Fecha: {new Date().toLocaleString('es-CL')}
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-green-700">
                    Autoridad: {providers.find(p => p.id === selectedProviderId)?.name || 'Entidad Certificadora'}
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-green-700">
                    Documento ID: {documentId}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-gray-50 border-t flex justify-between">
        {step !== 'complete' && step !== 'signing' && (
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}
        
        {step === 'select' && (
          <Button 
            onClick={doSignDocument} 
            disabled={!selectedCertificate || !pin || !selectedProviderId || isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Firmar documento
          </Button>
        )}
        
        {step === 'detect' && !error && !isLoading && (
          <Button 
            onClick={() => setStep('select')} 
            className="bg-green-600 hover:bg-green-700"
          >
            Continuar
          </Button>
        )}
        
        {step === 'complete' && (
          <Button 
            onClick={onCancel} 
            className="bg-green-600 hover:bg-green-700 w-full"
          >
            Finalizar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}