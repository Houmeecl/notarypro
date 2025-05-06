/**
 * Página de Verificación Biométrica
 * 
 * Esta página implementa la verificación de identidad mediante el uso de
 * tecnología biométrica utilizando la cámara para capturar selfie y documento.
 */
import React, { useState } from 'react';
import { useLocation } from 'wouter';
import BiometricVerification, { BiometricVerificationResult } from '@/components/verification/BiometricVerification';
import { CheckCircle, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const VerificacionBiometricaPage: React.FC = () => {
  // Estados
  const [verificationComplete, setVerificationComplete] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<BiometricVerificationResult | null>(null);
  
  // Hooks
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  // Función para manejar finalización de verificación
  const handleVerificationComplete = (result: BiometricVerificationResult) => {
    setVerificationResult(result);
    setVerificationComplete(true);
    
    // Notificar resultado mediante toast
    if (result.status === 'completed' && result.overallResult) {
      toast({
        title: result.overallResult.verified 
          ? "Verificación exitosa" 
          : "Verificación completada con observaciones",
        description: result.overallResult.details,
        variant: result.overallResult.verified ? "default" : "destructive"
      });
    } else if (result.status === 'error') {
      toast({
        title: "Error en verificación",
        description: result.error || "Error desconocido durante la verificación",
        variant: "destructive"
      });
    }
  };
  
  // Función para ir a la página anterior
  const goBack = () => {
    navigate('/');
  };
  
  // Función para ir a la siguiente página después de verificación
  const goNext = () => {
    // Aquí puedes agregar lógica específica según tu flujo
    navigate('/verificacion-avanzada');
  };
  
  return (
    <div className="container py-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={goBack}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Verificación Biométrica</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <BiometricVerification onVerificationComplete={handleVerificationComplete} />
        </div>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold mb-3">Acerca de esta verificación</h2>
            <p className="text-sm text-gray-600 mb-4">
              El sistema de verificación biométrica utiliza tecnología avanzada para validar su identidad utilizando:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Reconocimiento facial mediante selfie</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Análisis de documento de identidad</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Validación cruzada entre ambas fuentes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Verificación de elementos de seguridad</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold mb-3">Recomendaciones</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <div className="bg-primary/10 p-1 rounded shrink-0 mt-0.5">
                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                </div>
                <span>Asegúrese de tener buena iluminación para las fotos</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="bg-primary/10 p-1 rounded shrink-0 mt-0.5">
                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                </div>
                <span>Mantenga su documento completamente visible</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="bg-primary/10 p-1 rounded shrink-0 mt-0.5">
                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                </div>
                <span>Evite reflejos en la foto del documento</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="bg-primary/10 p-1 rounded shrink-0 mt-0.5">
                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                </div>
                <span>Para la selfie, mantenga una expresión neutral</span>
              </li>
            </ul>
          </div>
          
          {verificationComplete && verificationResult && verificationResult.status === 'completed' && (
            <div className={`bg-white rounded-lg shadow p-5 border ${
              verificationResult.overallResult?.verified 
                ? 'border-green-200' 
                : 'border-amber-200'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {verificationResult.overallResult?.verified ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
                <h2 className="text-lg font-semibold">
                  {verificationResult.overallResult?.verified 
                    ? "Verificación exitosa" 
                    : "Verificación con observaciones"
                  }
                </h2>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                {verificationResult.overallResult?.details}
              </p>
              
              <div className="flex justify-end">
                <Button
                  onClick={goNext}
                  disabled={!verificationResult.overallResult?.verified}
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificacionBiometricaPage;