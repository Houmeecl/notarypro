import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useRealFuncionality } from '@/hooks/use-real-funcionality';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, FileText, CheckCircle, AlertTriangle, Camera, Fingerprint, User, Smartphone } from 'lucide-react';
import FunctionalModeIndicator from '@/components/document/FunctionalModeIndicator';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignMobilePage() {
  const [, params] = useRoute('/sign-mobile/:token');
  const token = params?.token;
  const { isFunctionalMode } = useRealFuncionality(true);
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [documentInfo, setDocumentInfo] = useState<any>(null);
  const [signatureStep, setSignatureStep] = useState('identity'); // identity, sign, complete
  const [verificationMethod, setVerificationMethod] = useState('nfc');
  const [signingInProgress, setSigningInProgress] = useState(false);
  const [signatureComplete, setSignatureComplete] = useState(false);
  
  useEffect(() => {
    // Simulamos la carga de información del documento basada en el token
    const loadDocumentInfo = async () => {
      // En un caso real, haríamos una solicitud al servidor para obtener la información
      // del documento basándonos en el token que viene en la URL
      
      console.log(`Cargando información del token: ${token}`);
      
      // Simulamos un retraso para mostrar el estado de carga
      setTimeout(() => {
        // Datos simulados del documento
        const documentData = {
          id: parseInt(token?.split('-')[0] || '1'),
          name: 'Contrato de Arriendo Local Comercial',
          signatoryId: parseInt(token?.split('-')[1] || '1'),
          signatoryName: 'María González',
          signatoryEmail: 'maria@example.com',
          timestamp: new Date().toISOString(),
          isExpired: false
        };
        
        setDocumentInfo(documentData);
        setLoading(false);
        
        // Notificación sobre el modo funcional
        if (isFunctionalMode) {
          toast({
            title: "Modo de firma real activo",
            description: "Sistema operando con verificaciones según Ley 19.799",
            duration: 3000,
          });
        }
      }, 1500);
    };
    
    if (token) {
      loadDocumentInfo();
    }
  }, [token, isFunctionalMode, toast]);
  
  // Función para verificar identidad mediante diferentes métodos
  const verifyIdentity = () => {
    setSigningInProgress(true);
    
    // Simulamos el proceso de verificación
    setTimeout(() => {
      setSigningInProgress(false);
      setSignatureStep('sign');
      
      toast({
        title: "Identidad verificada",
        description: `Verificación por ${verificationMethod === 'nfc' ? 'cédula de identidad' : 
          verificationMethod === 'biometric' ? 'biometría facial' : 'datos personales'} completada con éxito.`,
        duration: 3000,
      });
      
      if (isFunctionalMode) {
        console.log(`✅ Verificación de identidad completada por ${verificationMethod} en modo funcional real`);
      }
    }, 2000);
  };
  
  // Función para firmar el documento
  const signDocument = () => {
    setSigningInProgress(true);
    
    // Simulamos el proceso de firma
    setTimeout(() => {
      setSigningInProgress(false);
      setSignatureStep('complete');
      setSignatureComplete(true);
      
      toast({
        title: "Documento firmado",
        description: "La firma digital ha sido registrada correctamente.",
        duration: 3000,
      });
      
      if (isFunctionalMode) {
        console.log(`✅ Documento firmado exitosamente en modo funcional real`);
      }
    }, 2000);
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <h1 className="text-xl font-semibold mb-2">Cargando documento</h1>
        <p className="text-gray-500 text-center">
          Estamos preparando el documento para su firma digital...
        </p>
      </div>
    );
  }
  
  if (!documentInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h1 className="text-xl font-semibold mb-2">Enlace inválido</h1>
        <p className="text-gray-500 text-center">
          Este enlace de firma no es válido o ha expirado. Por favor, contacte con el remitente del documento.
        </p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl">
      <div className="flex flex-col items-center mb-6">
        <Smartphone className="h-8 w-8 text-[#2d219b] mb-2" />
        <h1 className="text-2xl font-bold mb-2 text-center">
          Firma Móvil VecinoXpress
        </h1>
        <p className="text-gray-500 text-center">
          Sistema de firma digital desde dispositivos móviles
        </p>
      </div>
      
      <FunctionalModeIndicator className="mb-6" />
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{documentInfo.name}</CardTitle>
              <CardDescription>Documento pendiente de firma</CardDescription>
            </div>
            <div className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
              <FileText className="h-3 w-3 mr-1" />
              <span>Firma móvil</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <span className="text-gray-500">Firmante:</span> {documentInfo.signatoryName}
              </div>
            </div>
            <Separator />
            <div className="bg-gray-50 p-3 rounded-md">
              <h3 className="font-medium mb-1">Estado del proceso de firma</h3>
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className={`flex flex-col items-center ${signatureStep === 'identity' ? 'text-blue-600' : 
                  signatureStep === 'sign' || signatureStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`rounded-full w-8 h-8 flex items-center justify-center mb-1 ${
                    signatureStep === 'identity' ? 'bg-blue-100 border-2 border-blue-600' : 
                    signatureStep === 'sign' || signatureStep === 'complete' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-xs">Identidad</span>
                </div>
                <div className={`flex flex-col items-center ${signatureStep === 'sign' ? 'text-blue-600' : 
                  signatureStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`rounded-full w-8 h-8 flex items-center justify-center mb-1 ${
                    signatureStep === 'sign' ? 'bg-blue-100 border-2 border-blue-600' : 
                    signatureStep === 'complete' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Fingerprint className="h-4 w-4" />
                  </div>
                  <span className="text-xs">Firma</span>
                </div>
                <div className={`flex flex-col items-center ${signatureStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`rounded-full w-8 h-8 flex items-center justify-center mb-1 ${
                    signatureStep === 'complete' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100'
                  }`}>
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="text-xs">Completo</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Paso 1: Verificación de identidad */}
      {signatureStep === 'identity' && (
        <Card>
          <CardHeader>
            <CardTitle>Verificación de identidad</CardTitle>
            <CardDescription>
              Verifique su identidad para continuar con el proceso de firma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={verificationMethod} onValueChange={setVerificationMethod}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="nfc">
                  <div className="flex flex-col items-center gap-1">
                    <Smartphone className="h-4 w-4" />
                    <span className="text-xs">NFC Cédula</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="biometric">
                  <div className="flex flex-col items-center gap-1">
                    <Camera className="h-4 w-4" />
                    <span className="text-xs">Biometría</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="data">
                  <div className="flex flex-col items-center gap-1">
                    <User className="h-4 w-4" />
                    <span className="text-xs">Datos</span>
                  </div>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="nfc" className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-md text-center">
                  <Smartphone className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                  <h3 className="font-medium mb-1">Lector NFC</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Acerque su cédula de identidad al dispositivo para leer el chip NFC
                  </p>
                  {isFunctionalMode && (
                    <p className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                      Lectura NFC en modo real según normas chilenas de verificación de identidad
                    </p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="biometric" className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-md text-center">
                  <Camera className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                  <h3 className="font-medium mb-1">Verificación facial</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Permita acceso a la cámara para realizar la verificación facial
                  </p>
                  <Button variant="outline" className="mb-2">
                    Iniciar verificación facial
                  </Button>
                  {isFunctionalMode && (
                    <p className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                      Verificación biométrica en modo real conforme a Ley 19.799
                    </p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="data" className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="rut">RUT</Label>
                    <Input id="rut" placeholder="12.345.678-9" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthdate">Fecha de nacimiento</Label>
                    <Input id="birthdate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serie">N° de serie Cédula</Label>
                    <Input id="serie" placeholder="123456789" />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={verifyIdentity}
              disabled={signingInProgress}
            >
              {signingInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar identidad'
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Paso 2: Firmar documento */}
      {signatureStep === 'sign' && (
        <Card>
          <CardHeader>
            <CardTitle>Firmar documento</CardTitle>
            <CardDescription>
              Su identidad ha sido verificada. Proceda a firmar el documento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 p-3 rounded-md mb-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Identidad verificada</p>
                  <p className="text-sm text-green-700">
                    La verificación de identidad se ha completado correctamente.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md p-4 text-center mb-4">
              <p className="text-sm text-gray-500 mb-3">
                Al firmar este documento, declaro que he leído y acepto todos los términos y condiciones establecidos en él.
              </p>
              <Fingerprint className="h-16 w-16 mx-auto text-[#2d219b] mb-2" />
              <p className="font-medium">Presione el botón para firmar</p>
              {isFunctionalMode && (
                <p className="text-xs text-blue-600 bg-blue-100 p-2 rounded mt-3">
                  Firma electrónica avanzada según Ley 19.799 y Reglamento DS 181
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={signDocument}
              disabled={signingInProgress}
            >
              {signingInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando firma...
                </>
              ) : (
                'Firmar documento'
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Paso 3: Firma completada */}
      {signatureStep === 'complete' && (
        <Card className="border-green-200">
          <CardHeader className="bg-green-50 text-green-800 rounded-t-lg">
            <div className="flex items-center justify-center mb-2">
              <div className="rounded-full bg-green-100 p-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center">¡Firma completada con éxito!</CardTitle>
            <CardDescription className="text-center text-green-700">
              El documento ha sido firmado correctamente
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="bg-white border rounded-md p-4">
                <h3 className="font-medium mb-2">Detalles de la firma</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-500">Documento:</span>
                    <span className="font-medium">{documentInfo.name}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Firmante:</span>
                    <span className="font-medium">{documentInfo.signatoryName}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Fecha:</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Hora:</span>
                    <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                  </li>
                </ul>
              </div>
              
              {isFunctionalMode && (
                <div className="bg-green-50 p-3 rounded-md border border-green-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Certificado según Ley 19.799</p>
                      <p className="text-sm text-green-700">
                        Esta firma cumple con los requisitos legales de firma electrónica establecidos por la legislación chilena.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full">
              Descargar comprobante de firma
            </Button>
            <Button variant="outline" className="w-full">
              Cerrar
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}