import React, { useState, useEffect } from 'react';
import QRVerification from '@/components/identity/QRVerification';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { InfoIcon, PhoneIcon, ScanIcon, SmartphoneIcon, TabletIcon, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

const VerificacionIdentidadQR: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('qr-mobil');
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [posCode, setPosCode] = useState('');
  
  // Verificar parámetros de URL que puedan indicar un flujo específico
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const code = params.get('pos');
    
    if (mode === 'pos' && code) {
      setActiveTab('qr-pos');
      setPosCode(code);
      toast({
        title: 'Modo POS activado',
        description: `Conectado al terminal POS: ${code}`,
      });
    }
  }, []);
  
  // Manejar verificación exitosa
  const handleVerificationSuccess = (data: any) => {
    setVerificationComplete(true);
    setVerificationData(data);
    
    // Si estuviéramos en un entorno real, podríamos enviar esta información al servidor
    console.log('Verificación completada con los datos:', data);
    
    toast({
      title: 'Verificación exitosa',
      description: 'La identidad ha sido verificada correctamente',
      variant: 'default',
    });
  };
  
  // Manejar error de verificación
  const handleVerificationError = (error: string) => {
    console.error('Error en la verificación:', error);
    
    toast({
      title: 'Error en la verificación',
      description: error,
      variant: 'destructive',
    });
  };

  // Iniciar verificación en el celular
  const iniciarVerificacionMovil = () => {
    setLocation('/verificacion-movil');
  };

  // Generar QR para POS
  const generarQrPOS = () => {
    // Aquí generaríamos un código aleatorio para el POS
    const randomCode = 'POS-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setPosCode(randomCode);
    
    toast({
      title: 'Código POS generado',
      description: `Utilice este código en el terminal: ${randomCode}`,
    });
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
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 max-w-md mx-auto mb-4">
            <TabsTrigger value="qr-mobil" className="flex items-center">
              <SmartphoneIcon className="h-4 w-4 mr-2" />
              Móvil
            </TabsTrigger>
            <TabsTrigger value="qr-pos" className="flex items-center">
              <TabletIcon className="h-4 w-4 mr-2" />
              Terminal POS
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="qr-mobil">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-[#2d219b]/5">
                    <CardTitle className="flex items-center text-[#2d219b]">
                      <SmartphoneIcon className="h-5 w-5 mr-2" />
                      Verificación mediante dispositivo móvil
                    </CardTitle>
                    <CardDescription>
                      Escanee el código QR con su dispositivo móvil para iniciar la verificación
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="flex flex-col justify-center items-center space-y-4">
                        <QRVerification 
                          onSuccess={handleVerificationSuccess}
                          onError={handleVerificationError}
                          demoMode={true} // Activar modo demo para pruebas
                        />
                        
                        {verificationComplete && verificationData && (
                          <Card className="mt-6 w-full bg-green-50 border-green-200">
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
                      
                      <div className="flex flex-col justify-center space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                          <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                            <InfoIcon className="h-4 w-4 mr-2" />
                            Instrucciones
                          </h3>
                          <ol className="space-y-3 pl-4 text-sm text-blue-700">
                            <li>Escanee el código QR con su smartphone</li>
                            <li>Siga las instrucciones en su teléfono</li>
                            <li>Capture las imágenes solicitadas</li>
                            <li>Espere la verificación automática</li>
                          </ol>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-500 mb-3">¿Está usando este dispositivo para verificarse?</p>
                          <Button 
                            variant="default" 
                            className="w-full" 
                            onClick={iniciarVerificacionMovil}
                          >
                            <SmartphoneIcon className="h-4 w-4 mr-2" />
                            Verificarme en este dispositivo
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
          </TabsContent>
          
          <TabsContent value="qr-pos">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-[#2d219b]/5">
                    <CardTitle className="flex items-center text-[#2d219b]">
                      <TabletIcon className="h-5 w-5 mr-2" />
                      Verificación mediante terminal POS
                    </CardTitle>
                    <CardDescription>
                      Conecte con un terminal POS para la verificación de identidad
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="flex flex-col justify-center items-center space-y-6">
                        {posCode ? (
                          <div className="text-center">
                            <div className="bg-gray-100 p-6 rounded-lg mb-4 flex flex-col items-center justify-center">
                              <QrCode className="h-24 w-24 text-[#2d219b] mb-4" />
                              <p className="font-bold text-2xl">{posCode}</p>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                              Ingrese este código en su terminal POS para iniciar la verificación
                            </p>
                            <Button 
                              variant="outline" 
                              onClick={generarQrPOS}
                              className="w-full"
                            >
                              Generar nuevo código
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center space-y-6">
                            <div className="bg-gray-100 p-10 rounded-lg mb-2 flex items-center justify-center">
                              <QrCode className="h-32 w-32 text-gray-300" />
                            </div>
                            <Button 
                              onClick={generarQrPOS}
                              className="w-full"
                            >
                              Generar código POS
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col justify-center space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                          <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                            <InfoIcon className="h-4 w-4 mr-2" />
                            Instrucciones
                          </h3>
                          <ol className="space-y-3 pl-4 text-sm text-blue-700">
                            <li>Genere un código de verificación</li>
                            <li>Ingrese el código en el terminal POS</li>
                            <li>Siga las instrucciones en el terminal</li>
                            <li>La verificación se mostrará automáticamente</li>
                          </ol>
                        </div>
                        
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                          <h3 className="font-medium text-amber-800 mb-2 flex items-center">
                            <InfoIcon className="h-4 w-4 mr-2" />
                            Importante
                          </h3>
                          <p className="text-sm text-amber-700">
                            Esta función requiere un terminal POS compatible con el sistema VecinoXpress. Asegúrese de que su terminal esté actualizado y configurado correctamente.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TabletIcon className="h-5 w-5 mr-2 text-[#2d219b]" />
                      Verificación por POS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                      La verificación mediante terminal POS permite:
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
                      <li>Validación de identidad para comercios</li>
                      <li>Integración con sistemas de pago existentes</li>
                      <li>Mayor seguridad en transacciones comerciales</li>
                      <li>Verificación sin necesidad de teléfonos adicionales</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ScanIcon className="h-5 w-5 mr-2 text-[#2d219b]" />
                      Terminales compatibles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
                      <li>Terminales VecinoXpress (todos los modelos)</li>
                      <li>PAX A80, S90, D180, D210</li>
                      <li>Verifone V240, T650, P400</li>
                      <li>Ingenico AXIUM DX8000</li>
                      <li>Cualquier terminal Android con la app VecinoXpress</li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-2">
                      Para más información sobre compatibilidad, contacte a soporte.
                    </p>
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
                      ¿Necesita ayuda con terminales POS? Contáctenos:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="font-semibold w-20">Email:</span>
                        <span className="text-[#2d219b]">pos@vecinoxpress.cl</span>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VerificacionIdentidadQR;