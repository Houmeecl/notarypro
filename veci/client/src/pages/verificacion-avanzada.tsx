/**
 * Página de Verificación Avanzada
 * 
 * Esta página implementa la verificación integrada con:
 * - Biometría facial en tiempo real
 * - Verificación de cédula de identidad
 * - Validación de NFC mediante código QR
 */
import React, { useState, useEffect } from 'react';
import { Fingerprint, Shield, AlertCircle, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import BiometricNfcVerification, { VerificationResult } from '@/components/ron/BiometricNfcVerification';

const VerificacionAvanzada: React.FC = () => {
  // Estado
  const [verificationStep, setVerificationStep] = useState<
    'initial' | 'biometric' | 'complete' | 'error'
  >('initial');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Hooks
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  // Manejar la verificación completada
  const handleVerificationComplete = (result: VerificationResult) => {
    setVerificationResult(result);
    setVerificationStep('complete');
    
    // Notificar al usuario
    if (result.status === 'completed') {
      toast({
        title: 'Verificación exitosa',
        description: `Puntuación de verificación: ${Math.round(result.verificationScore * 100)}%`,
      });
    } else {
      toast({
        title: 'Verificación fallida',
        description: 'No se pudo completar la verificación. Por favor, intente nuevamente.',
        variant: 'destructive'
      });
    }
  };
  
  // Manejar cancelación
  const handleVerificationCancel = () => {
    setVerificationStep('initial');
  };
  
  // Iniciar proceso de verificación
  const startVerification = () => {
    setIsLoading(true);
    
    // Verificar compatibilidad
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Su navegador no soporta acceso a la cámara, necesario para la verificación.');
      setVerificationStep('error');
      setIsLoading(false);
      return;
    }
    
    // Verificar si estamos en un contexto seguro (HTTPS)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && !window.location.hostname.includes('replit')) {
      setErrorMessage('La verificación biométrica requiere una conexión segura (HTTPS).');
      setVerificationStep('error');
      setIsLoading(false);
      return;
    }
    
    // Comprobar los permisos de cámara
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        // Detener el stream de inmediato - solo estamos probando si funciona
        stream.getTracks().forEach(track => track.stop());
        
        // Avanzar al paso de verificación biométrica
        setVerificationStep('biometric');
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error al verificar permisos de cámara:', error);
        setErrorMessage('No se pudo acceder a la cámara. Por favor, permita el acceso para continuar.');
        setVerificationStep('error');
        setIsLoading(false);
      });
  };
  
  // Volver a la página anterior
  const goBack = () => {
    navigate('/');
  };
  
  // Reiniciar el proceso
  const resetProcess = () => {
    setVerificationStep('initial');
    setVerificationResult(null);
    setErrorMessage(null);
  };
  
  // Renderizar el contenido según el paso actual
  const renderStepContent = () => {
    switch (verificationStep) {
      case 'initial':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <CardTitle>Verificación Avanzada</CardTitle>
              </div>
              <CardDescription>
                Sistema integrado de validación de identidad con datos biométricos, cédula y NFC
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-center p-4 rounded-lg bg-muted">
                <Fingerprint className="h-12 w-12 mx-auto mb-2 text-primary" />
                <h2 className="text-lg font-medium mb-1">Verificación completa</h2>
                <p className="text-sm text-muted-foreground">
                  Este proceso verificará su identidad mediante tecnología biométrica, 
                  validación de cédula y lectura del chip NFC.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Reconocimiento facial</h3>
                    <p className="text-xs text-muted-foreground">
                      Captura y análisis biométrico en tiempo real
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Validación de cédula</h3>
                    <p className="text-xs text-muted-foreground">
                      Captura y verificación de su documento de identidad
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Verificación de NFC</h3>
                    <p className="text-xs text-muted-foreground">
                      Lectura del chip NFC mediante código QR
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex-col gap-2">
              <Button 
                className="w-full" 
                onClick={startVerification}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparando verificación...
                  </>
                ) : (
                  <>Iniciar verificación avanzada</>
                )}
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
        
      case 'biometric':
        return (
          <div className="w-full max-w-xl mx-auto">
            <BiometricNfcVerification 
              onVerified={handleVerificationComplete}
              onCancel={handleVerificationCancel}
              userType="client"
            />
          </div>
        );
        
      case 'complete':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <CardTitle>Resultado de verificación</CardTitle>
                </div>
                <Badge 
                  variant={verificationResult?.status === 'completed' ? 'outline' : 'destructive'} 
                  className={verificationResult?.status === 'completed' ? 'bg-green-50 text-green-700' : ''}
                >
                  {verificationResult?.status === 'completed' ? 'VERIFICADO' : 'NO VERIFICADO'}
                </Badge>
              </div>
              <CardDescription>
                {verificationResult?.status === 'completed' 
                  ? 'Su identidad ha sido verificada correctamente' 
                  : 'No se pudo completar la verificación de identidad'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {verificationResult?.status === 'completed' ? (
                <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-500" />
                  <h2 className="text-lg font-medium text-green-700">Verificación exitosa</h2>
                  <p className="text-sm text-green-600">
                    Se ha verificado correctamente su identidad mediante el sistema integrado.
                  </p>
                  <div className="mt-2 text-sm">
                    <p className="font-medium">
                      Puntuación: {Math.round((verificationResult?.verificationScore || 0) * 100)}%
                    </p>
                    <p className="text-xs">
                      Tiempo: {new Date(verificationResult?.timestamp || '').toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Verificación fallida</AlertTitle>
                  <AlertDescription>
                    No se pudo completar el proceso de verificación. Por favor, 
                    intente nuevamente o contacte al soporte técnico.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2 mt-4">
                <h3 className="text-sm font-medium">Detalles de verificación:</h3>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 rounded bg-muted">
                    <p className="font-medium">Biometría facial</p>
                    <p className={verificationResult?.biometricData ? 'text-green-600' : 'text-red-600'}>
                      {verificationResult?.biometricData ? 'Verificado' : 'No verificado'}
                    </p>
                  </div>
                  
                  <div className="p-2 rounded bg-muted">
                    <p className="font-medium">Cédula de identidad</p>
                    <p className={verificationResult?.idCardData ? 'text-green-600' : 'text-red-600'}>
                      {verificationResult?.idCardData ? 'Verificado' : 'No verificado'}
                    </p>
                  </div>
                  
                  <div className="p-2 rounded bg-muted">
                    <p className="font-medium">Chip NFC</p>
                    <p className={verificationResult?.nfcData ? 'text-green-600' : 'text-red-600'}>
                      {verificationResult?.nfcData ? 'Verificado' : 'No verificado'}
                    </p>
                  </div>
                  
                  <div className="p-2 rounded bg-muted">
                    <p className="font-medium">Verificación cruzada</p>
                    <p className={verificationResult?.verificationScore > 0.8 ? 'text-green-600' : 'text-amber-600'}>
                      {verificationResult?.verificationScore > 0.8 ? 'Aprobada' : 'No aprobada'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex-col gap-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={resetProcess}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Nueva verificación
              </Button>
              
              <Button 
                className="w-full"
                onClick={goBack}
              >
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
                No se pudo iniciar el proceso de verificación
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {errorMessage || 'Se produjo un error inesperado. Por favor, intente nuevamente.'}
                </AlertDescription>
              </Alert>
            </CardContent>
            
            <CardFooter className="flex-col gap-2">
              <Button 
                className="w-full"
                onClick={resetProcess}
              >
                Reintentar
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

export default VerificacionAvanzada;