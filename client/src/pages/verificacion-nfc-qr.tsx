/**
 * Página de Verificación NFC mediante QR
 * 
 * Esta página implementa la verificación del chip NFC de la cédula de identidad
 * chilena a través de un código QR específico.
 */
import React, { useState } from 'react';
import { QrCode, Shield, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import NfcQrScanner, { NFCData } from '@/components/ron/NfcQrScanner';

const VerificacionNfcQr: React.FC = () => {
  // Estados
  const [verificationStep, setVerificationStep] = useState<
    'initial' | 'scanning' | 'complete' | 'error'
  >('initial');
  const [nfcData, setNfcData] = useState<NFCData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Hooks
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  // Manejar el escaneo completado
  const handleScanComplete = (data: NFCData | null, error?: string) => {
    if (data) {
      setNfcData(data);
      setVerificationStep('complete');
      
      toast({
        title: 'Verificación exitosa',
        description: 'Datos del chip NFC validados correctamente.',
      });
    } else {
      setErrorMessage(error || 'No se pudo verificar el chip NFC.');
      setVerificationStep('error');
      
      toast({
        title: 'Error de verificación',
        description: error || 'No se pudo verificar el chip NFC.',
        variant: 'destructive'
      });
    }
  };
  
  // Iniciar escaneo
  const startScanning = () => {
    setVerificationStep('scanning');
  };
  
  // Manejar cancelación
  const handleCancel = () => {
    setVerificationStep('initial');
  };
  
  // Volver a la página anterior
  const goBack = () => {
    navigate('/');
  };
  
  // Renderizar el contenido según el paso actual
  const renderStepContent = () => {
    switch (verificationStep) {
      case 'initial':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-center gap-2">
                <QrCode className="h-6 w-6 text-primary" />
                <CardTitle>Verificación NFC vía QR</CardTitle>
              </div>
              <CardDescription>
                Sistema de validación del chip NFC de la cédula mediante código QR
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-center p-4 rounded-lg bg-muted">
                <Shield className="h-12 w-12 mx-auto mb-2 text-primary" />
                <h2 className="text-lg font-medium mb-1">Validación de seguridad</h2>
                <p className="text-sm text-muted-foreground">
                  Este proceso verificará la autenticidad de su cédula de identidad 
                  mediante la lectura del chip NFC.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Seguridad avanzada</h3>
                    <p className="text-xs text-muted-foreground">
                      Verificación de datos oficiales del Registro Civil
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Proceso simple</h3>
                    <p className="text-xs text-muted-foreground">
                      Solo necesita escanear un código QR con la cámara
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Confidencialidad garantizada</h3>
                    <p className="text-xs text-muted-foreground">
                      Los datos personales no se almacenan permanentemente
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex-col gap-2">
              <Button 
                className="w-full" 
                onClick={startScanning}
              >
                Iniciar verificación NFC
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={goBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </CardFooter>
          </Card>
        );
        
      case 'scanning':
        return (
          <div className="w-full max-w-md mx-auto">
            <NfcQrScanner 
              onScanComplete={handleScanComplete}
              onCancel={handleCancel}
            />
          </div>
        );
        
      case 'complete':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="h-6 w-6 text-primary" />
                  <CardTitle>Verificación completada</CardTitle>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  VERIFICADO
                </Badge>
              </div>
              <CardDescription>
                Los datos del chip NFC han sido validados correctamente
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-500" />
                <h2 className="text-lg font-medium text-green-700">Validación exitosa</h2>
                <p className="text-sm text-green-600">
                  Se ha verificado correctamente la autenticidad de la cédula de identidad
                </p>
              </div>
              
              {nfcData && (
                <div className="space-y-2 mt-4">
                  <h3 className="text-sm font-medium">Datos verificados:</h3>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 rounded bg-muted">
                      <p className="font-medium">Documento</p>
                      <p>{nfcData.documentNumber}</p>
                    </div>
                    
                    <div className="p-2 rounded bg-muted">
                      <p className="font-medium">Nombre</p>
                      <p>{nfcData.fullName}</p>
                    </div>
                    
                    <div className="p-2 rounded bg-muted">
                      <p className="font-medium">Fecha de nacimiento</p>
                      <p>{nfcData.birthDate}</p>
                    </div>
                    
                    <div className="p-2 rounded bg-muted">
                      <p className="font-medium">Fecha de expiración</p>
                      <p>{nfcData.expiryDate}</p>
                    </div>
                    
                    <div className="col-span-2 p-2 rounded bg-muted">
                      <p className="font-medium">Serial NFC</p>
                      <p className="font-mono text-xs">{nfcData.serialNumber}</p>
                    </div>
                    
                    <div className="col-span-2 p-2 rounded bg-muted">
                      <p className="font-medium">Autoridad emisora</p>
                      <p>{nfcData.issuingAuthority}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex-col gap-2">
              <Button 
                className="w-full"
                onClick={() => setVerificationStep('initial')}
              >
                Nueva verificación
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={goBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Finalizar
              </Button>
            </CardFooter>
          </Card>
        );
        
      case 'error':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <CardTitle>Error de verificación</CardTitle>
              </div>
              <CardDescription>
                No se pudo completar la validación del chip NFC
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {errorMessage || 'Se produjo un error inesperado durante la verificación.'}
                </AlertDescription>
              </Alert>
              
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium">Posibles soluciones:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Asegúrese de que el código QR sea válido y corresponda al chip NFC de la cédula</li>
                  <li>Intente escanear con buena iluminación y sin reflejos</li>
                  <li>Verifique que su cámara esté funcionando correctamente</li>
                  <li>Si el problema persiste, contacte al soporte técnico</li>
                </ul>
              </div>
            </CardContent>
            
            <CardFooter className="flex-col gap-2">
              <Button 
                className="w-full"
                onClick={() => setVerificationStep('scanning')}
              >
                Reintentar
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setVerificationStep('initial')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </CardFooter>
          </Card>
        );
    }
  };
  
  return (
    <div className="container py-6 max-w-4xl mx-auto">
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        {renderStepContent()}
      </div>
    </div>
  );
};

export default VerificacionNfcQr;