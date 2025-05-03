import React, { useState, useEffect } from 'react';
import QRVerification from '@/components/identity/QRVerification';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { InfoIcon, PhoneIcon } from 'lucide-react';

const VerificacionIdentidadQR: React.FC = () => {
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  
  // Manejar verificación exitosa
  const handleVerificationSuccess = (data: any) => {
    setVerificationComplete(true);
    setVerificationData(data);
    
    // Si estuviéramos en un entorno real, podríamos enviar esta información al servidor
    console.log('Verificación completada con los datos:', data);
  };
  
  // Manejar error de verificación
  const handleVerificationError = (error: string) => {
    console.error('Error en la verificación:', error);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2d219b] mb-2">
            Verificación de Identidad QR
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            La forma más rápida y segura de validar identidad entre dispositivos. Escanee el código QR con su dispositivo móvil para iniciar el proceso.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <QRVerification 
              onSuccess={handleVerificationSuccess}
              onError={handleVerificationError}
              demoMode={true} // Activar modo demo para pruebas
            />
            
            {verificationComplete && verificationData && (
              <Card className="mt-6 bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-700">Verificación Exitosa</CardTitle>
                  <CardDescription>
                    La verificación de identidad se ha completado correctamente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-white p-4 rounded-md text-sm overflow-auto">
                    {JSON.stringify(verificationData, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
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
                  <h3 className="font-semibold">1. Generar código QR</h3>
                  <p className="text-sm text-gray-600">
                    El sistema genera un código QR único vinculado a esta sesión de verificación.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">2. Escanear con dispositivo móvil</h3>
                  <p className="text-sm text-gray-600">
                    El usuario escanea el código QR con su dispositivo móvil, vinculando ambos dispositivos.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">3. Tomar fotografías</h3>
                  <p className="text-sm text-gray-600">
                    En el móvil, se toman fotografías del documento de identidad y del rostro para verificación.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">4. Verificación automática</h3>
                  <p className="text-sm text-gray-600">
                    El sistema verifica la autenticidad del documento y realiza una comparación biométrica.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">5. Confirmación</h3>
                  <p className="text-sm text-gray-600">
                    Una vez completada la verificación, el sistema notifica al dispositivo original.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PhoneIcon className="h-5 w-5 mr-2 text-[#2d219b]" />
                  Soporte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  ¿Necesita ayuda con el proceso de verificación? Contáctenos a través de cualquiera de las siguientes vías:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="font-semibold w-20">Email:</span>
                    <span className="text-[#2d219b]">soporte@vecinoxpress.cl</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold w-20">Teléfono:</span>
                    <span className="text-[#2d219b]">+56 2 2123 4567</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold w-20">Horario:</span>
                    <span>Lun-Vie 9:00 - 18:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificacionIdentidadQR;