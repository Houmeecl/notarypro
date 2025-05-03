import React, { useState } from 'react';
import { Helmet } from "react-helmet";
import { 
  ArrowLeft, 
  Info,
  ShieldCheck,
  CheckCircle2,
  LucideShieldCheck
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CedulaChilenaData } from '@/lib/nfc-reader';
import InverIDVerifier from '@/components/identity/InverIDVerifier';

const VerificacionInverID: React.FC = () => {
  const { toast } = useToast();
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  
  // Manejar éxito en la verificación
  const handleSuccess = (data: CedulaChilenaData) => {
    console.log('Verificación exitosa:', data);
    toast({
      title: "Verificación exitosa",
      description: "La identidad ha sido verificada correctamente",
      variant: "default"
    });
  };
  
  // Manejar error en la verificación
  const handleError = (error: string) => {
    console.error('Error de verificación:', error);
    toast({
      title: "Error de verificación",
      description: error,
      variant: "destructive"
    });
  };
  
  // Manejar completado del proceso (independientemente del resultado)
  const handleComplete = (success: boolean, data?: any) => {
    setVerificationComplete(success);
    if (data) {
      setVerificationData(data);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Verificación de Identidad InverID | VecinoXpress</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-orange-700 mr-2"
                onClick={() => window.history.back()}
              >
                <ArrowLeft />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">InverID</h1>
                <p className="text-amber-100">Sistema avanzado de verificación de identidad</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Alert className="bg-blue-50 border-blue-200">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <AlertTitle className="text-blue-800">Verificación de alto nivel</AlertTitle>
              <AlertDescription className="text-blue-700">
                Este sistema combina tecnología NFC, análisis forense documental y validación biométrica para asegurar la identidad con el mayor nivel de confianza.
              </AlertDescription>
            </Alert>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b bg-gray-50">
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="text-amber-600" />
                    Verificador InverID
                  </CardTitle>
                  <CardDescription>
                    Siga los pasos indicados para completar la verificación
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <InverIDVerifier 
                    sessionId="demo-session-001"
                    onSuccess={handleSuccess}
                    onError={handleError}
                    onComplete={handleComplete}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="border-0 shadow-md mb-6">
                <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Acerca de InverID
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-sm">
                  <p className="mb-3">
                    InverID es un sistema avanzado de verificación de identidad basado en 3 pilares fundamentales:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Análisis forense de documentos:</strong> Detecta alteraciones, falsificaciones y elementos de seguridad en el documento.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Lectura NFC:</strong> Extrae y verifica los datos del chip integrado en documentos de identidad modernos.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Biometría facial:</strong> Compara la imagen del documento con la persona presente mediante algoritmos avanzados de reconocimiento facial.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    Ventajas de InverID
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-sm">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Seguridad de nivel bancario</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Cumplimiento normativo (KYC/AML)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Validación en tiempo real</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Compatible con Ley 19.799 sobre firma electrónica</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Auditable y con trazabilidad completa</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {verificationComplete && verificationData && (
            <div className="mt-8">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <CheckCircle2 className="text-green-600" />
                    Verificación completada exitosamente
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    La identidad ha sido verificada con éxito en todos los niveles de seguridad
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <h3 className="font-medium text-green-800 mb-2">Resultados de la verificación:</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-gray-600">Documento verificado:</div>
                      <div className="text-sm font-medium">Sí</div>
                      
                      <div className="text-sm text-gray-600">Verificación NFC:</div>
                      <div className="text-sm font-medium">Exitosa</div>
                      
                      <div className="text-sm text-gray-600">Verificación biométrica:</div>
                      <div className="text-sm font-medium">Completada</div>
                      
                      <div className="text-sm text-gray-600">Validación con base de datos:</div>
                      <div className="text-sm font-medium">Exitosa</div>
                      
                      <div className="text-sm text-gray-600">Nombre:</div>
                      <div className="text-sm font-medium">
                        {verificationData.cedula?.nombres} {verificationData.cedula?.apellidos}
                      </div>
                      
                      <div className="text-sm text-gray-600">RUN:</div>
                      <div className="text-sm font-medium">
                        {verificationData.cedula?.run || '17.123.456-7'}
                      </div>
                      
                      <div className="text-sm text-gray-600">Nacionalidad:</div>
                      <div className="text-sm font-medium">
                        {verificationData.cedula?.nacionalidad || 'CHILENA'}
                      </div>
                      
                      <div className="text-sm text-gray-600">Fecha de nacimiento:</div>
                      <div className="text-sm font-medium">
                        {verificationData.cedula?.fechaNacimiento || '15/05/1985'}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t bg-green-50">
                  <Button 
                    variant="outline"
                    className="mr-2 border-green-600 text-green-700 hover:bg-green-100"
                    onClick={() => window.location.reload()}
                  >
                    Nueva verificación
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => window.history.back()}
                  >
                    Continuar
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VerificacionInverID;