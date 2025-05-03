import React, { useState } from 'react';
import VerificacionIntegrada from '@/components/identity/VerificacionIntegrada';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { InfoIcon, ShieldCheck, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const VerificacionIntegradaPage: React.FC = () => {
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const { toast } = useToast();
  
  // Manejar verificación exitosa
  const handleVerificationComplete = (data: any) => {
    setVerificationComplete(true);
    setVerificationData(data);
    
    console.log('Verificación integrada completada con éxito:', data);
    
    toast({
      title: 'Verificación completada',
      description: 'Su identidad ha sido verificada exitosamente',
    });
  };
  
  // Manejar error de verificación
  const handleVerificationError = (error: string) => {
    console.error('Error en la verificación integrada:', error);
    
    toast({
      title: 'Error en la verificación',
      description: error,
      variant: 'destructive',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2d219b] mb-2">
            Verificación de Identidad Integrada
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Sistema de verificación que combina QR, NFC y fotografía de documentos para una validación de identidad segura
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <VerificacionIntegrada 
              onComplete={handleVerificationComplete}
              onError={handleVerificationError}
              demoMode={true} // Modo demostración para testing
            />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <InfoIcon className="h-5 w-5 mr-2 text-[#2d219b]" />
                  Proceso de verificación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">1. Escaneo QR</h3>
                  <p className="text-sm text-gray-600">
                    Escanee el código QR para vincular su dispositivo al proceso de verificación.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">2. Lectura NFC</h3>
                  <p className="text-sm text-gray-600">
                    Acerque su documento al lector NFC para extraer los datos del chip.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">3. Captura de cédula</h3>
                  <p className="text-sm text-gray-600">
                    Tome una fotografía clara de su cédula de identidad para verificación.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShieldCheck className="h-5 w-5 mr-2 text-[#2d219b]" />
                  Seguridad avanzada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  La verificación integrada proporciona:
                </p>
                <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
                  <li>Triple verificación para mayor seguridad</li>
                  <li>Cruce de datos entre chip NFC y documento físico</li>
                  <li>Protección contra suplantación de identidad</li>
                  <li>Validación criptográfica de documentos oficiales</li>
                  <li>Proceso conforme a la Ley 19.799 de firma electrónica</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="h-5 w-5 mr-2 text-[#2d219b]" />
                  Requisitos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Para utilizar la verificación integrada, necesita:
                </p>
                <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
                  <li>Un dispositivo con cámara y lector NFC</li>
                  <li>Cédula de identidad chilena con chip (posterior a 2013)</li>
                  <li>Navegador Chrome o Samsung Internet en Android</li>
                  <li>En iOS, descargar la aplicación VecinoXpress</li>
                  <li>Buena iluminación para la captura de cédula</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificacionIntegradaPage;