import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TokenProvider, signWithCertificate } from "@/lib/pkcs11-bridge";

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
  const [selectedProvider, setSelectedProvider] = useState<TokenProvider | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
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
      // En un entorno real, esto detectaría el token físico
      // Para esta simulación, simulamos la detección
      setTimeout(() => {
        try {
          // Simular detección exitosa
          const provider = TokenProvider.ECERT;
          setSelectedProvider(provider);
          
          // Simular certificados disponibles
          const mockCertificates = [
            {
              serialNumber: "123456789",
              subject: "Juan Pérez - RUT: 12.345.678-9",
              issuer: `${provider.toUpperCase()} Certification Authority`,
              validFrom: new Date(2023, 0, 1),
              validTo: new Date(2025, 0, 1),
              provider
            },
            {
              serialNumber: "987654321",
              subject: "María González - RUT: 98.765.432-1",
              issuer: `${provider.toUpperCase()} Certification Authority`,
              validFrom: new Date(2022, 0, 1),
              validTo: new Date(2024, 0, 1),
              provider
            }
          ];
          
          setCertificates(mockCertificates);
          setStep('select');
        } catch (err: any) {
          setError(err.message || "Error al detectar dispositivo");
        }
        setIsLoading(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Error al detectar dispositivo");
      setIsLoading(false);
    }
  };

  // Función para firmar con certificado
  const doSignDocument = async () => {
    if (!selectedCertificate || !pin || !selectedProvider) {
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
      // En un entorno real, esto enviaría los datos al token para firma
      setTimeout(() => {
        try {
          // Simular firma exitosa (sin llamar a la API real)
          const simulatedSignatureResult = {
            signature: `${documentHash}_${Date.now()}_signed_by_${selectedProvider}`,
            certificate: `CERT_${selectedCertificate}`,
            timestamp: new Date().toISOString(),
            provider: selectedProvider,
            algorithm: "SHA256withRSA"
          };

          // Procesar la firma exitosa
          onSigningComplete({
            signatureData: simulatedSignatureResult.signature,
            certificateData: simulatedSignatureResult.certificate,
            provider: simulatedSignatureResult.provider,
            timestamp: simulatedSignatureResult.timestamp
          });
          
          setStep('complete');
        } catch (error: any) {
          setError(error.message || "Error al firmar el documento");
          setStep('select');
        }
        setIsLoading(false);
      }, 2000);
    } catch (err: any) {
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
              <Label htmlFor="certificate">Seleccione un certificado</Label>
              <Select 
                value={selectedCertificate || ''} 
                onValueChange={setSelectedCertificate}
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
                Certificado emitido por: {selectedProvider}
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
                    Autoridad: {selectedProvider}
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
            disabled={!selectedCertificate || !pin || isLoading}
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