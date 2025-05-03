import { useState } from "react";
import { useLocation } from "wouter";
import ReadIDVerificationFlow from "@/components/identity/readid-style/ReadIDVerificationFlow";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle, FileCheck, ArrowLeft } from "lucide-react";

export default function ReadIDVerificationPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  
  const handleVerificationComplete = (success: boolean, data?: any) => {
    if (success && data) {
      setVerificationComplete(true);
      setVerificationData(data);
      toast({
        title: "Verificación exitosa",
        description: "Su identidad ha sido verificada correctamente.",
        variant: "default",
      });
    }
  };
  
  const handleContinue = () => {
    // Aquí se puede redirigir al usuario a la siguiente etapa del proceso
    setLocation('/');
    toast({
      title: "Proceso completado",
      description: "Su identidad ha sido verificada y registrada en nuestro sistema.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-0">
      <div className="max-w-md mx-auto mb-6">
        <Button 
          variant="ghost" 
          className="text-gray-600 mb-4"
          onClick={() => setLocation('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Button>
        
        <div className="flex items-center mb-6">
          <Shield className="h-6 w-6 text-red-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">NotaryPro</h1>
        </div>
      </div>
      
      {verificationComplete ? (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verificación exitosa</h2>
            <p className="text-gray-600 mb-6">
              Su documento de identidad ha sido verificado correctamente. Ahora puede continuar 
              con el proceso de certificación.
            </p>
            
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FileCheck className="h-4 w-4 mr-2 text-green-500" />
                Información verificada
              </h3>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Nombre completo</p>
                  <p className="font-medium">{verificationData?.nombres} {verificationData?.apellidos}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">RUN</p>
                  <p className="font-medium">{verificationData?.run}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Documento</p>
                  <p className="font-medium">Cédula de identidad</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Estado</p>
                  <p className="font-medium text-green-600">Válido</p>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full bg-red-600 hover:bg-red-700" 
              onClick={handleContinue}
            >
              Continuar
            </Button>
          </div>
        </div>
      ) : (
        <ReadIDVerificationFlow 
          onComplete={handleVerificationComplete}
          onCancel={() => setLocation('/')}
        />
      )}
      
      <div className="max-w-md mx-auto mt-8 text-center">
        <p className="text-xs text-gray-500">
          © 2025 NotaryPro | Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}