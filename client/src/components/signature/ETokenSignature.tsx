import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Fingerprint, ShieldCheck, AlertCircle, Key, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  const [step, setStep] = useState<'check' | 'pin' | 'process'>('check');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenConnected, setTokenConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const checkTokenConnection = () => {
    setIsLoading(true);
    setError(null);
    
    // Simulación de detección de token (en un caso real, esto usaría una API)
    setTimeout(() => {
      // Por simplicidad, asumimos que el token está conectado
      setTokenConnected(true);
      setIsLoading(false);
      setStep('pin');
    }, 1500);
  };

  const handleSignWithPin = async () => {
    if (!pin || pin.length < 4) {
      setError("El PIN debe tener al menos 4 dígitos");
      return;
    }

    setError(null);
    setIsLoading(true);
    setStep('process');

    // Simulación de firma con eToken
    try {
      // En un caso real, esto enviaría los datos al token criptográfico
      // y recibiría la firma digital firmada con la clave privada
      setTimeout(() => {
        // Crear datos de firma simulados
        const signatureData = {
          tokenSignature: `${documentHash}_${Date.now()}_signed`,
          tokenInfo: {
            certificateAuthor: "Entidad Certificadora de Chile",
            certificateId: `CERT-${Math.floor(Math.random() * 1000000)}`,
            timestamp: new Date().toISOString()
          }
        };

        onSignComplete(signatureData);
        
      }, 2500);
    } catch (err: any) {
      setError(err.message || "Error al firmar con eToken. Inténtelo nuevamente.");
      setStep('pin');
      setIsLoading(false);
    }
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

        {step === 'check' && (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Verificación de dispositivo</AlertTitle>
              <AlertDescription className="text-blue-700">
                Conecte su token criptográfico y presione "Detectar dispositivo" para continuar.
              </AlertDescription>
            </Alert>
            
            <div className="border rounded-md p-4 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Preparación:</h3>
              <ol className="space-y-1.5 text-sm text-gray-600 ml-5 list-decimal">
                <li>Asegúrese que su dispositivo eToken esté conectado a un puerto USB</li>
                <li>Verifique que el driver del dispositivo esté instalado</li>
                <li>Tenga a mano su PIN de acceso al dispositivo</li>
              </ol>
            </div>
          </div>
        )}

        {step === 'pin' && (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Dispositivo detectado</AlertTitle>
              <AlertDescription className="text-green-700">
                Su dispositivo ha sido detectado. Ingrese su PIN para autorizar la firma.
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
        
        {step === 'check' && (
          <Button 
            onClick={checkTokenConnection} 
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Detectando...
              </>
            ) : (
              <>
                <Fingerprint className="mr-2 h-4 w-4" />
                Detectar dispositivo
              </>
            )}
          </Button>
        )}
        
        {step === 'pin' && (
          <Button 
            onClick={handleSignWithPin} 
            disabled={!pin || isLoading}
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