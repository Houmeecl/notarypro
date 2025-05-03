import React, { useState } from 'react';
import NFCReader from '@/components/identity/NFCReader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { InfoIcon, ShieldIcon, SmartphoneIcon } from 'lucide-react';

const VerificacionIdentidadNFC: React.FC = () => {
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  
  // Manejar verificación exitosa
  const handleVerificationSuccess = (data: any) => {
    setVerificationComplete(true);
    setVerificationData(data);
    
    // Si estuviéramos en un entorno real, podríamos enviar esta información al servidor
    console.log('Verificación NFC completada con los datos:', data);
  };
  
  // Manejar error de verificación
  const handleVerificationError = (error: string) => {
    console.error('Error en la verificación NFC:', error);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2d219b] mb-2">
            Verificación de Identidad NFC
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Verificación segura y rápida mediante la lectura NFC de documentos de identidad chilenos
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <NFCReader 
              onSuccess={handleVerificationSuccess}
              onError={handleVerificationError}
              demoMode={true} // Activar modo demo para pruebas
            />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <InfoIcon className="h-5 w-5 mr-2 text-[#2d219b]" />
                  Cómo funciona
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">1. Preparar documento</h3>
                  <p className="text-sm text-gray-600">
                    Asegúrese de que su cédula de identidad o pasaporte tenga chip NFC.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">2. Iniciar escaneo</h3>
                  <p className="text-sm text-gray-600">
                    Presione el botón "Iniciar Escaneo NFC" para activar el lector NFC de su dispositivo.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">3. Acercar documento</h3>
                  <p className="text-sm text-gray-600">
                    Coloque su documento cerca del lector NFC de su dispositivo móvil (generalmente en la parte trasera).
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">4. Mantener documento</h3>
                  <p className="text-sm text-gray-600">
                    No mueva el documento hasta que se complete la lectura. El proceso toma unos segundos.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">5. Verificación</h3>
                  <p className="text-sm text-gray-600">
                    El sistema verificará automáticamente la autenticidad del documento y sus datos.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShieldIcon className="h-5 w-5 mr-2 text-[#2d219b]" />
                  Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  La verificación NFC ofrece el máximo nivel de seguridad:
                </p>
                <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
                  <li>Accede a datos criptográficamente protegidos en el chip</li>
                  <li>Verifica la autenticidad del documento mediante firma digital</li>
                  <li>Imposible de falsificar, a diferencia de métodos visuales</li>
                  <li>Sus datos personales nunca salen de su dispositivo sin su permiso</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SmartphoneIcon className="h-5 w-5 mr-2 text-[#2d219b]" />
                  Compatibilidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Para utilizar la verificación NFC, necesita:
                </p>
                <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
                  <li>Un smartphone o tablet con lector NFC</li>
                  <li>Navegador Chrome o Edge en Android</li>
                  <li>En iOS 14 o superior, usar la app oficial</li>
                  <li>Cédula de identidad o pasaporte chileno con chip NFC (posteriores a 2013)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificacionIdentidadNFC;