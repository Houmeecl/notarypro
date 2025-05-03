import React, { useState } from 'react';
import { Helmet } from "react-helmet";
import { 
  ArrowLeft, 
  Info,
  Shield,
  CheckCircle2,
  FileText,
  Fingerprint
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AdvancedIdentityVerifier from '@/components/identity/AdvancedIdentityVerifier';

const VerificacionAvanzada: React.FC = () => {
  const { toast } = useToast();
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [demoMode, setDemoMode] = useState(true); // Por defecto, activamos el modo demostración
  
  // Manejar éxito en la verificación
  const handleSuccess = (data: any) => {
    console.log('Verificación exitosa:', data);
    setVerificationData(data);
    setVerificationComplete(true);
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
  
  // Reiniciar la verificación
  const resetVerification = () => {
    setVerificationComplete(false);
    setVerificationData(null);
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <Helmet>
        <title>Verificación Avanzada de Identidad | VecinoXpress</title>
      </Helmet>
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <a href="/">
                <ArrowLeft className="h-5 w-5" />
              </a>
            </Button>
            <h1 className="text-2xl font-bold text-[#2d219b]">Verificación Avanzada</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="demo-mode" className="text-sm font-medium">
              Modo demostración
            </Label>
            <Switch
              id="demo-mode"
              checked={demoMode}
              onCheckedChange={setDemoMode}
            />
          </div>
        </div>
        
        {demoMode && (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Modo demostración activo. Los datos y verificaciones son simulados.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AdvancedIdentityVerifier 
              onSuccess={handleSuccess}
              onError={handleError}
              demoMode={demoMode}
            />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Beneficios de nuestra verificación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-green-100 p-1.5 rounded-full">
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Verificación de 3 factores</h3>
                    <p className="text-sm text-gray-600">
                      Análisis de documento + chip NFC + biometría facial
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-100 p-1.5 rounded-full">
                    <Fingerprint className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Lectura segura del chip</h3>
                    <p className="text-sm text-gray-600">
                      Extracción de datos oficiales directamente del chip de la cédula
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-purple-100 p-1.5 rounded-full">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Análisis forense de documento</h3>
                    <p className="text-sm text-gray-600">
                      Detección de alteraciones, MRZ y elementos de seguridad
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-indigo-100 p-1.5 rounded-full">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Cumplimiento normativo</h3>
                    <p className="text-sm text-gray-600">
                      Conforme a ley chilena 19.799 sobre firma electrónica avanzada
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Documentos aceptados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">•</span> Cédula de identidad chilena con chip NFC
                </p>
                <p className="text-sm">
                  <span className="font-medium">•</span> Pasaporte chileno electrónico
                </p>
                <p className="text-sm">
                  <span className="font-medium">•</span> Licencia de conducir chilena digital
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Nota: Documentos sin chip NFC tendrán un nivel de verificación menor.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificacionAvanzada;