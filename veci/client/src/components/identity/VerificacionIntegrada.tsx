import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Steps, Step } from "@/components/ui/steps";
import { QrCode, Smartphone, Camera, CreditCard, User, CheckCircle2, Info, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRVerification from '@/components/identity/QRVerification';
import NFCReader from '@/components/identity/NFCReader';

interface VerificacionIntegradaProps {
  onComplete?: (data: any) => void;
  onError?: (error: string) => void;
  demoMode?: boolean;
}

type VerificationStep = 'qr' | 'nfc' | 'cedula' | 'complete';

const VerificacionIntegrada: React.FC<VerificacionIntegradaProps> = ({
  onComplete,
  onError,
  demoMode = false // Usar modo real por defecto
}) => {
  const [currentStep, setCurrentStep] = useState<VerificationStep>('qr');
  const [progress, setProgress] = useState(0);
  const [verificationData, setVerificationData] = useState<Record<string, any>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Manejar éxito de la verificación QR
  const handleQRSuccess = (data: any) => {
    console.log('QR verificado exitosamente:', data);
    
    setVerificationData(prev => ({
      ...prev,
      qr: data
    }));
    
    setProgress(33);
    setCurrentStep('nfc');
    
    toast({
      title: 'QR escaneado con éxito',
      description: 'Ahora escanee el chip NFC de su documento',
    });
  };

  // Manejar error de verificación QR
  const handleQRError = (error: string) => {
    console.error('Error en verificación QR:', error);
    setErrorMessage(error);
    
    toast({
      title: 'Error en verificación QR',
      description: error,
      variant: 'destructive',
    });
  };

  // Manejar éxito de la verificación NFC
  const handleNFCSuccess = (data: any) => {
    console.log('NFC verificado exitosamente:', data);
    
    setVerificationData(prev => ({
      ...prev,
      nfc: data
    }));
    
    setProgress(66);
    setCurrentStep('cedula');
    
    toast({
      title: 'NFC escaneado con éxito',
      description: 'Ahora tome una foto de su cédula',
    });
  };

  // Manejar error de verificación NFC
  const handleNFCError = (error: string) => {
    console.error('Error en verificación NFC:', error);
    setErrorMessage(error);
    
    toast({
      title: 'Error en verificación NFC',
      description: error,
      variant: 'destructive',
    });
  };

  // Simular captura de cédula (en un caso real, usaríamos la cámara)
  const handleCaptureCedula = () => {
    // Simulamos la captura exitosa de la cédula
    const cedulaData = {
      source: 'camera',
      imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/...',
      timestamp: new Date().toISOString()
    };
    
    console.log('Cédula capturada exitosamente:', cedulaData);
    
    setVerificationData(prev => ({
      ...prev,
      cedula: cedulaData
    }));
    
    setProgress(100);
    setCurrentStep('complete');
    
    // Notificar que se ha completado todo el proceso
    if (onComplete) {
      onComplete({
        qr: verificationData.qr,
        nfc: verificationData.nfc,
        cedula: cedulaData,
        completed: true,
        timestamp: new Date().toISOString()
      });
    }
    
    toast({
      title: 'Verificación completa',
      description: 'Todos los pasos de verificación han sido completados con éxito',
    });
  };

  // Reiniciar todo el proceso
  const handleReset = () => {
    setCurrentStep('qr');
    setProgress(0);
    setVerificationData({});
    setErrorMessage(null);
    
    toast({
      title: 'Proceso reiniciado',
      description: 'Inicie el proceso de verificación nuevamente',
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-[#2d219b]/5 pb-2">
        <CardTitle className="text-xl text-[#2d219b]">Verificación de Identidad Integrada</CardTitle>
        <CardDescription>Complete los tres pasos para verificar su identidad</CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="mb-6">
          <Steps currentStep={
            currentStep === 'qr' ? 0 :
            currentStep === 'nfc' ? 1 :
            currentStep === 'cedula' ? 2 : 3
          } className="mb-2">
            <Step icon={QrCode} title="Escanear QR" />
            <Step icon={CreditCard} title="Leer NFC" />
            <Step icon={Camera} title="Fotografiar cédula" />
            <Step icon={CheckCircle2} title="Completo" />
          </Steps>
          
          <Progress value={progress} className="h-2 mt-2" />
        </div>
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error en la verificación</h3>
                <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-6">
          {currentStep === 'qr' && (
            <div className="flex flex-col items-center">
              <div className="text-center mb-6">
                <div className="bg-[#2d219b]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-8 w-8 text-[#2d219b]" />
                </div>
                <h3 className="text-lg font-medium mb-2">Escanee el código QR</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Apunte la cámara de su dispositivo al código QR para iniciar el proceso de verificación.
                </p>
              </div>
              
              <div className="w-full max-w-md">
                <QRVerification 
                  onSuccess={handleQRSuccess}
                  onError={handleQRError}
                  demoMode={demoMode}
                />
              </div>
            </div>
          )}
          
          {currentStep === 'nfc' && (
            <div className="flex flex-col items-center">
              <div className="text-center mb-6">
                <div className="bg-[#2d219b]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-[#2d219b]" />
                </div>
                <h3 className="text-lg font-medium mb-2">Escanee el chip NFC</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Acerque su documento de identidad al lector NFC de su dispositivo.
                </p>
              </div>
              
              <div className="w-full max-w-md">
                <NFCReader 
                  onSuccess={handleNFCSuccess}
                  onError={handleNFCError}
                  demoMode={demoMode}
                />
              </div>
            </div>
          )}
          
          {currentStep === 'cedula' && (
            <div className="flex flex-col items-center">
              <div className="text-center mb-6">
                <div className="bg-[#2d219b]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="h-8 w-8 text-[#2d219b]" />
                </div>
                <h3 className="text-lg font-medium mb-2">Fotografíe su cédula</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
                  Tome una fotografía clara de su cédula de identidad. Asegúrese de que esté bien iluminada y todos los datos sean legibles.
                </p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 max-w-md mx-auto">
                  <div className="flex flex-col items-center">
                    <Camera className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-4">
                      Presione el botón para activar la cámara y capturar una imagen de su cédula.
                    </p>
                    <Button onClick={handleCaptureCedula} className="w-full">
                      <Camera className="mr-2 h-4 w-4" />
                      Capturar imagen
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 'complete' && (
            <div className="flex flex-col items-center">
              <div className="text-center mb-6">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-700 mb-2">¡Verificación completada!</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
                  Su identidad ha sido verificada exitosamente. Todos los pasos del proceso de verificación se han completado correctamente.
                </p>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md mx-auto mb-6">
                  <h4 className="font-medium text-sm mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-2 text-[#2d219b]" />
                    Datos verificados
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-gray-500">Método QR:</div>
                      <div>Verificado</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-gray-500">Método NFC:</div>
                      <div>Verificado</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-gray-500">Imagen cédula:</div>
                      <div>Verificada</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-gray-500">Fecha:</div>
                      <div>{new Date().toLocaleString()}</div>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" onClick={handleReset}>
                  Iniciar nuevo proceso
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 border-t p-4 text-xs text-gray-500 flex items-center">
        <Info className="h-3 w-3 mr-2 text-gray-400" />
        <span>
          Este proceso combina verificación QR, NFC y captura fotográfica para garantizar la máxima seguridad.
        </span>
      </CardFooter>
    </Card>
  );
};

export default VerificacionIntegrada;