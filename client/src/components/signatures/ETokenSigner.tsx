import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, Loader2, ShieldCheck, HardDrive, Key, FileDigit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ETokenSignerProps {
  isOpen: boolean;
  onClose: () => void;
  onSignatureComplete: (signatureData: string) => void;
  documentId: string;
}

export default function ETokenSigner({
  isOpen,
  onClose,
  onSignatureComplete,
  documentId
}: ETokenSignerProps) {
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState<'connect' | 'verify' | 'sign' | 'complete'>('connect');
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [deviceVerified, setDeviceVerified] = useState(false);
  const [signInProgress, setSignInProgress] = useState(false);
  const [signCompleted, setSignCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [driverStatus, setDriverStatus] = useState<'unknown' | 'missing' | 'installed'>('unknown');
  const [deviceInfo, setDeviceInfo] = useState<{
    model: string;
    serialNumber: string;
    firmware: string;
    certificates: { name: string; expiry: string }[];
  } | null>(null);
  const [progress, setProgress] = useState(0);

  // Verificar estado de drivers y dispositivo al abrir el componente
  useEffect(() => {
    if (isOpen) {
      checkDriverStatus();
    }
  }, [isOpen]);

  // Verificar el estado del controlador eToken
  const checkDriverStatus = () => {
    // En una implementación real, esto verificaría los controladores del sistema
    // a través de una API o biblioteca nativa para la integración con eToken
    
    // Simulación para desarrollo (en producción sería real)
    setTimeout(() => {
      // Simula que los controladores están instalados
      setDriverStatus('installed');
      
      // Intentar conectar automáticamente
      detectDevice();
    }, 1500);
  };

  // Detectar dispositivo eToken conectado
  const detectDevice = () => {
    setDeviceConnected(false);
    setError(null);
    
    // Implementación real: usar Web USB, extensiones, o API nativa para interactuar con eToken
    // La implementación dependerá del fabricante específico de eToken y sus APIs
    
    // Simulación de detección del dispositivo - en producción, esta función accederá 
    // al dispositivo físico real conectado vía USB o a través de un middleware instalado
    setTimeout(() => {
      try {
        // En producción, esto obtendría datos reales del dispositivo eToken
        const connected = true; // Resultado de verificación real en producción
        
        if (connected) {
          setDeviceConnected(true);
          setDeviceInfo({
            model: 'eToken 5110 CC',
            serialNumber: 'ET00192348576',
            firmware: 'v4.2.3',
            certificates: [
              { name: 'Certificado de Firma Digital eCert Chile', expiry: '23/10/2026' },
              { name: 'Certificado Raíz PKI', expiry: '01/12/2030' }
            ]
          });
          
          // Avanzar al siguiente paso
          setActiveStep('verify');
        } else {
          setError('No se pudo detectar el dispositivo eToken. Verifique que esté conectado correctamente y que los controladores estén instalados.');
        }
      } catch (err) {
        setError('Error al detectar el dispositivo: ' + (err instanceof Error ? err.message : String(err)));
      }
    }, 2000);
  };

  // Verificar credenciales y certificados del dispositivo
  const verifyDevice = () => {
    setDeviceVerified(false);
    setError(null);
    
    // Implementación real: verificar firma y certificados con la PKI correspondiente
    
    // Simulamos el proceso de verificación
    setProgress(0);
    const verifyInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(verifyInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    // Simulación de verificación del dispositivo
    setTimeout(() => {
      clearInterval(verifyInterval);
      setProgress(100);
      
      try {
        setDeviceVerified(true);
        
        // Avanzar al siguiente paso
        setActiveStep('sign');
      } catch (err) {
        setError('Error al verificar el dispositivo: ' + (err instanceof Error ? err.message : String(err)));
      }
    }, 3500);
  };

  // Firmar el documento con el eToken
  const signDocument = () => {
    setSignInProgress(true);
    setError(null);
    
    // Implementación real: usar el eToken físico para firmar el hash del documento
    
    // Simulación del proceso de firma
    setProgress(0);
    const signInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(signInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
    
    // Simulación de firma del documento
    setTimeout(() => {
      clearInterval(signInterval);
      setProgress(100);
      
      try {
        // Este sería el resultado de la firma real con el dispositivo físico
        const signatureResult = {
          timestamp: new Date().toISOString(),
          documentId: documentId,
          signatureFormat: 'PKCS#7/CAdES',
          signatureAlgorithm: 'RSA-SHA256',
          certificateInfo: {
            subject: 'CN=Pedro Notario,O=eCert Chile,C=CL',
            issuer: 'CN=Certification Authority,O=eCert Chile,C=CL',
            serialNumber: '01:02:03:04:05:06:07:08:09',
            validFrom: '2023-01-01T00:00:00Z',
            validTo: '2026-01-01T00:00:00Z'
          },
          signatureValue: 'MIIEpAIBAD...base64EncodedSignature'
        };
        
        // Convertir a formato de datos para el almacenamiento
        setSignatureData(JSON.stringify(signatureResult));
        setSignCompleted(true);
        setSignInProgress(false);
        
        // Avanzar al último paso
        setActiveStep('complete');
      } catch (err) {
        setSignInProgress(false);
        setError('Error durante el proceso de firma: ' + (err instanceof Error ? err.message : String(err)));
      }
    }, 5000);
  };

  // Completar el proceso y enviar la firma
  const completeProcess = () => {
    if (signatureData) {
      onSignatureComplete(signatureData);
    }
  };

  // Reiniciar el proceso en caso de error
  const resetProcess = () => {
    setDeviceConnected(false);
    setDeviceVerified(false);
    setSignInProgress(false);
    setSignCompleted(false);
    setError(null);
    setSignatureData(null);
    setDeviceInfo(null);
    setActiveStep('connect');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShieldCheck className="h-5 w-5 mr-2 text-green-600" />
            Firma Electrónica Avanzada con eToken
          </DialogTitle>
          <DialogDescription>
            Utilice su dispositivo físico eToken para realizar una firma electrónica avanzada segura y legalmente válida.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeStep} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="connect" disabled>
              Conexión
            </TabsTrigger>
            <TabsTrigger value="verify" disabled>
              Verificación
            </TabsTrigger>
            <TabsTrigger value="sign" disabled>
              Firma
            </TabsTrigger>
            <TabsTrigger value="complete" disabled>
              Completado
            </TabsTrigger>
          </TabsList>

          {/* Paso 1: Conexión del dispositivo */}
          <TabsContent value="connect" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <HardDrive className="h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Conecte su dispositivo eToken</h3>
                  
                  {driverStatus === 'unknown' && (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verificando controladores...
                    </div>
                  )}
                  
                  {driverStatus === 'missing' && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Controladores no encontrados</AlertTitle>
                      <AlertDescription>
                        Los controladores de eToken no están instalados en su sistema. 
                        Por favor descargue e instale los controladores desde el sitio web oficial.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {driverStatus === 'installed' && (
                    <>
                      <p className="text-sm text-center text-muted-foreground">
                        Inserte su dispositivo eToken en un puerto USB y haga clic en "Detectar dispositivo". 
                        Asegúrese de que los controladores estén instalados.
                      </p>
                      
                      {deviceConnected ? (
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <AlertTitle>Dispositivo conectado correctamente</AlertTitle>
                          <AlertDescription>
                            Se ha detectado un dispositivo eToken compatible.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Button 
                          onClick={detectDevice} 
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled={deviceConnected}
                        >
                          {deviceConnected ? (
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                          ) : (
                            <HardDrive className="h-4 w-4 mr-2" />
                          )}
                          Detectar dispositivo
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={() => setActiveStep('verify')} 
                disabled={!deviceConnected}
                className="bg-[#2d219b] hover:bg-[#221a7c]"
              >
                Continuar
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Paso 2: Verificación del dispositivo */}
          <TabsContent value="verify" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex flex-col items-center mb-4">
                    <Key className="h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-medium mt-2">Verificación del dispositivo</h3>
                  </div>
                  
                  {deviceInfo && (
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-3 gap-2 border-b pb-2">
                        <div className="font-medium">Modelo:</div>
                        <div className="col-span-2">{deviceInfo.model}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 border-b pb-2">
                        <div className="font-medium">Número de serie:</div>
                        <div className="col-span-2">{deviceInfo.serialNumber}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 border-b pb-2">
                        <div className="font-medium">Firmware:</div>
                        <div className="col-span-2">{deviceInfo.firmware}</div>
                      </div>
                      <div className="mt-3">
                        <div className="font-medium mb-2">Certificados disponibles:</div>
                        <ul className="list-disc pl-5 space-y-1">
                          {deviceInfo.certificates.map((cert, idx) => (
                            <li key={idx}>
                              {cert.name} <span className="text-xs text-muted-foreground">(Válido hasta: {cert.expiry})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    {!deviceVerified ? (
                      <>
                        <div className="mb-2 flex justify-between text-sm">
                          <span>Verificando certificados...</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <Button 
                          onClick={verifyDevice} 
                          className="w-full mt-4 bg-green-600 hover:bg-green-700"
                          disabled={progress > 0 && progress < 100}
                        >
                          {progress > 0 && progress < 100 ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Key className="h-4 w-4 mr-2" />
                          )}
                          Verificar certificados
                        </Button>
                      </>
                    ) : (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle>Verificación completada</AlertTitle>
                        <AlertDescription>
                          Los certificados del dispositivo han sido verificados correctamente.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setActiveStep('connect')}>
                Atrás
              </Button>
              <Button 
                onClick={() => setActiveStep('sign')} 
                disabled={!deviceVerified}
                className="bg-[#2d219b] hover:bg-[#221a7c]"
              >
                Continuar
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Paso 3: Firma del documento */}
          <TabsContent value="sign" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex flex-col items-center mb-4">
                    <FileDigit className="h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-medium mt-2">Firma digital del documento</h3>
                  </div>
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Información del documento</AlertTitle>
                    <AlertDescription>
                      ID del documento: {documentId}<br />
                      Este proceso creará una firma digital avanzada para el documento seleccionado.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="mt-4">
                    {!signCompleted ? (
                      <>
                        <div className="mb-2 flex justify-between text-sm">
                          <span>Firmando documento...</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <Button 
                          onClick={signDocument} 
                          className="w-full mt-4 bg-green-600 hover:bg-green-700"
                          disabled={signInProgress}
                        >
                          {signInProgress ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <ShieldCheck className="h-4 w-4 mr-2" />
                          )}
                          {signInProgress ? 'Firmando...' : 'Firmar con eToken'}
                        </Button>
                        
                        <p className="text-xs text-center mt-2 text-muted-foreground">
                          Al hacer clic en "Firmar", deberá ingresar su PIN en el diálogo que aparecerá.
                          <br />Este proceso es seguro y no envía su PIN a ningún servidor.
                        </p>
                      </>
                    ) : (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle>Firma completada</AlertTitle>
                        <AlertDescription>
                          El documento ha sido firmado digitalmente con éxito.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setActiveStep('verify')}>
                Atrás
              </Button>
              <Button 
                onClick={() => setActiveStep('complete')} 
                disabled={!signCompleted}
                className="bg-[#2d219b] hover:bg-[#221a7c]"
              >
                Continuar
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Paso 4: Proceso completado */}
          <TabsContent value="complete" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <CheckCircle2 className="h-16 w-16 text-green-600" />
                  <h3 className="text-xl font-medium">¡Firma completada con éxito!</h3>
                  <p className="text-center text-muted-foreground">
                    El documento ha sido firmado digitalmente con su eToken. 
                    Esta firma tiene validez legal según la Ley 19.799 sobre documentos electrónicos.
                  </p>
                  
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle>Detalles de la firma</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-4 space-y-1 text-sm">
                        <li>Documento: {documentId}</li>
                        <li>Sello de tiempo: {new Date().toLocaleString()}</li>
                        <li>Formato: PKCS#7/CAdES</li>
                        <li>Algoritmo: RSA-SHA256</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
            
            <DialogFooter>
              <Button variant="outline" onClick={resetProcess}>
                Nueva firma
              </Button>
              <Button 
                onClick={completeProcess}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Completar proceso
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}