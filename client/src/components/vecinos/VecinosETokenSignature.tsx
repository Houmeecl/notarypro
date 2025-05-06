import React, { useState, useEffect } from 'react';
import { 
  CERTIFIED_PROVIDERS, 
  TokenCertificate, 
  checkTokenAvailability, 
  getCertificates, 
  signWithToken 
} from '../../lib/etoken-signer';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { CircleAlert, CircleCheck, FileSignature, Key, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface VecinosETokenSignatureProps {
  documentId: number;
  documentName: string;
  onSuccess?: (signature: any) => void;
  onCancel?: () => void;
}

export function VecinosETokenSignature({ 
  documentId, 
  documentName, 
  onSuccess, 
  onCancel 
}: VecinosETokenSignatureProps) {
  const [step, setStep] = useState<'device' | 'certificate' | 'pin'>('device');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [tokenAvailable, setTokenAvailable] = useState<boolean | null>(null);
  const [certificates, setCertificates] = useState<TokenCertificate[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);
  const [pin, setPin] = useState<string>('');
  const { toast } = useToast();

  // Comprobar disponibilidad del token al cargar
  useEffect(() => {
    checkDeviceAvailability();
  }, []);

  const checkDeviceAvailability = async () => {
    setLoading(true);
    setError(null);
    try {
      const available = await checkTokenAvailability();
      setTokenAvailable(available);
      
      if (available) {
        // Cargar certificados
        const certs = await getCertificates();
        setCertificates(certs);
        
        // Avanzar al siguiente paso
        setStep('certificate');
      } else {
        setError('No se detectó ningún dispositivo eToken. Por favor conecte su token y vuelva a intentarlo.');
      }
    } catch (err: any) {
      setError(err.message || 'Error al comprobar dispositivo eToken');
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No se ha podido detectar el dispositivo eToken.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
  };

  const handleCertificateChange = (certificateId: string) => {
    setSelectedCertificate(certificateId);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPin(e.target.value);
  };

  const handleNextStep = () => {
    if (step === 'certificate' && selectedProvider && selectedCertificate) {
      setStep('pin');
    }
  };

  const handlePrevStep = () => {
    if (step === 'pin') {
      setStep('certificate');
    } else if (step === 'certificate') {
      setStep('device');
    }
  };

  const handleSubmit = async () => {
    if (!selectedProvider || !selectedCertificate || !pin) {
      setError('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulamos un hash del documento
      const documentHash = `document-${documentId}-${Date.now()}`;
      
      // Firmar con eToken
      const signatureData = await signWithToken(
        documentHash,
        pin,
        selectedProvider,
        selectedCertificate
      );

      // Ahora debemos enviar la firma al servidor para aplicarla al documento
      const response = await fetch(`/api/vecinos/document-sign/sign-with-etoken/${documentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vecinosToken')}`
        },
        body: JSON.stringify({
          pin,
          providerId: selectedProvider,
          certificateId: selectedCertificate
        })
      });

      if (!response.ok) {
        throw new Error('Error al procesar la firma en el servidor');
      }

      const result = await response.json();
      
      // Mostrar mensaje de éxito
      setSuccess(true);
      toast({
        title: "Firma exitosa",
        description: "El documento ha sido firmado exitosamente.",
      });
      
      // Llamar al callback de éxito
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err: any) {
      setError(err.message || 'Error al firmar documento');
      toast({
        variant: "destructive",
        title: "Error al firmar",
        description: err.message || "Ha ocurrido un error al intentar firmar el documento.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Renderizar mensaje de éxito
  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="bg-green-50 border-b">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CircleCheck className="h-5 w-5" />
            Firma exitosa
          </CardTitle>
          <CardDescription>
            El documento ha sido firmado exitosamente
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-2">
          <Alert className="bg-green-50 border-green-200">
            <ShieldCheck className="h-4 w-4 text-green-700" />
            <AlertTitle className="text-green-700">Documento firmado</AlertTitle>
            <AlertDescription>
              El documento <strong>{documentName}</strong> ha sido firmado electrónicamente de manera exitosa.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button 
            variant="default" 
            onClick={() => {
              if (onSuccess) onSuccess({});
            }}
          >
            Cerrar
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <FileSignature className="h-5 w-5" />
          Firma electrónica avanzada
        </CardTitle>
        <CardDescription>
          Utilice su token criptográfico para firmar el documento {documentName}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 pb-2">
        <Tabs value={step} onValueChange={(value) => setStep(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger 
              value="device" 
              disabled={loading || step !== 'device'}
              className={tokenAvailable ? 'text-green-600' : ''}
            >
              Dispositivo
            </TabsTrigger>
            <TabsTrigger 
              value="certificate" 
              disabled={loading || !tokenAvailable || step === 'device'}
              className={selectedCertificate ? 'text-green-600' : ''}
            >
              Certificado
            </TabsTrigger>
            <TabsTrigger 
              value="pin" 
              disabled={loading || !selectedCertificate || step !== 'pin'}
            >
              PIN
            </TabsTrigger>
          </TabsList>

          <TabsContent value="device" className="pt-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Conecte su dispositivo eToken y haga clic en "Detectar dispositivo".
              </p>
              
              {error && (
                <Alert variant="destructive">
                  <CircleAlert className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-center pt-2">
                <Button 
                  onClick={checkDeviceAvailability} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Comprobando...
                    </>
                  ) : (
                    <>Detectar dispositivo</>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="certificate" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Proveedor de certificación</Label>
                <Select 
                  value={selectedProvider || undefined} 
                  onValueChange={handleProviderChange}
                >
                  <SelectTrigger id="provider">
                    <SelectValue placeholder="Seleccione proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {CERTIFIED_PROVIDERS.map(provider => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificate">Certificado</Label>
                <Select 
                  value={selectedCertificate || undefined} 
                  onValueChange={handleCertificateChange}
                  disabled={!selectedProvider}
                >
                  <SelectTrigger id="certificate">
                    <SelectValue placeholder="Seleccione certificado" />
                  </SelectTrigger>
                  <SelectContent>
                    {certificates.map(cert => (
                      <SelectItem key={cert.id} value={cert.id}>
                        {cert.subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCertificate && (
                <div className="pt-2">
                  <Button onClick={handleNextStep} disabled={!selectedCertificate || loading} className="w-full">
                    Continuar
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pin" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin" className="flex items-center gap-1">
                  <Lock className="h-4 w-4" />
                  PIN de acceso a su token
                </Label>
                <Input 
                  id="pin" 
                  type="password" 
                  value={pin} 
                  onChange={handlePinChange} 
                  placeholder="Ingrese su PIN"
                  autoComplete="one-time-code"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <CircleAlert className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="text-xs text-gray-500">
                El PIN será utilizado únicamente para acceder a su token criptográfico.
                Nunca almacenamos esta información.
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        {step !== 'device' ? (
          <Button 
            variant="outline" 
            onClick={handlePrevStep} 
            disabled={loading || step === 'device'}
          >
            Atrás
          </Button>
        ) : (
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        
        {step === 'pin' && (
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !pin} 
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Firmando...
              </>
            ) : (
              <>Firmar documento</>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}