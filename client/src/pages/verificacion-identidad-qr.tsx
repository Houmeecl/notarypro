import React, { useState } from 'react';
import QRVerification from '@/components/identity/QRVerification';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdvancedIdentityVerifier from '@/components/identity/AdvancedIdentityVerifier';
import { Smartphone, Cpu } from 'lucide-react';

const VerificacionIdentidadQR: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('qr');
  const [verificationData, setVerificationData] = useState<any>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  
  // Generar un ID único para la sesión
  const sessionId = React.useMemo(() => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }, []);
  
  // Manejar éxito en verificación
  const handleVerificationSuccess = (data: any) => {
    console.log("Verificación exitosa:", data);
    setVerificationData(data);
  };
  
  // Manejar error en verificación
  const handleVerificationError = (error: string) => {
    console.error("Error de verificación:", error);
    setVerificationError(error);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#2d219b] mb-2">Verificación de Identidad</h1>
        <p className="text-gray-600 mb-8">
          Elija el método que prefiera para verificar su identidad
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-8 w-full max-w-md mx-auto">
            <TabsTrigger value="qr" className="flex items-center">
              <Smartphone className="mr-2 h-4 w-4" />
              Mediante QR
            </TabsTrigger>
            <TabsTrigger value="directo" className="flex items-center">
              <Cpu className="mr-2 h-4 w-4" />
              Verificación Directa
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="qr" className="mt-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <QRVerification
                  sessionId={sessionId}
                  onSuccess={handleVerificationSuccess}
                  onError={handleVerificationError}
                  demoMode={true}
                />
              </div>
              
              <div className="flex-1 space-y-6">
                <div className="rounded-lg bg-blue-50 p-6 border border-blue-100">
                  <h3 className="font-bold text-lg text-blue-800 mb-3">¿Cómo funciona?</h3>
                  <ol className="space-y-3 text-blue-700 list-decimal list-inside">
                    <li>Escanee el código QR con la cámara de su teléfono móvil</li>
                    <li>Complete los pasos en su dispositivo móvil</li>
                    <li>Capture una foto de su documento de identidad</li>
                    <li>Tome una selfie para verificación biométrica</li>
                    <li>Espere mientras verificamos su identidad</li>
                  </ol>
                </div>
                
                <div className="rounded-lg bg-gray-50 p-6 border border-gray-100">
                  <h3 className="font-bold text-lg text-gray-800 mb-3">Ventajas</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Proceso más rápido y cómodo
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Aprovecha la cámara de mejor calidad de su móvil
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      No requiere instalar software adicional
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Verificación biométrica avanzada
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="directo" className="mt-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <AdvancedIdentityVerifier
                  onSuccess={handleVerificationSuccess}
                  onError={handleVerificationError}
                  demoMode={true}
                />
              </div>
              
              <div className="flex-1 space-y-6">
                <div className="rounded-lg bg-green-50 p-6 border border-green-100">
                  <h3 className="font-bold text-lg text-green-800 mb-3">Verificación Directa</h3>
                  <p className="text-green-700 mb-4">
                    Este método le permite completar todo el proceso de verificación directamente en el dispositivo actual,
                    sin necesidad de utilizar un dispositivo móvil adicional.
                  </p>
                  <ol className="space-y-3 text-green-700 list-decimal list-inside">
                    <li>Subir imagen de su documento de identidad</li>
                    <li>Verificación del chip NFC (si aplica)</li>
                    <li>Captura de foto con la cámara web</li>
                    <li>Verificación biométrica automática</li>
                  </ol>
                </div>
                
                <div className="rounded-lg bg-gray-50 p-6 border border-gray-100">
                  <h3 className="font-bold text-lg text-gray-800 mb-3">Requisitos</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Cámara web funcionando correctamente
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Buena iluminación para captura facial
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Documento de identidad válido y legible
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Permisos de cámara en su navegador
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VerificacionIdentidadQR;