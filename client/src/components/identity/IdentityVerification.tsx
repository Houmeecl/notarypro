import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera, Check, Upload, FileText, User, Scan } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLocation } from 'wouter';

interface IdentityVerificationProps {
  onVerificationComplete: (verificationData: VerificationResult) => void;
  mode?: 'simple' | 'full';
}

export interface VerificationResult {
  verified: boolean;
  fullName: string;
  documentNumber: string;
  documentType: string;
  verificationMethod: 'nfc' | 'document' | 'selfie' | 'simulate';
}

const IdentityVerification: React.FC<IdentityVerificationProps> = ({
  onVerificationComplete,
  mode = 'simple'
}) => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  
  // Estado para el proceso simulado
  const [simStep, setSimStep] = useState(0);
  
  // Función para iniciar verificación NFC
  const startNFCVerification = () => {
    // Redireccionar a la página de verificación NFC
    navigate('/verificacion-nfc-fixed');
  };
  
  // Función para iniciar verificación con foto de documento
  const startDocumentVerification = () => {
    // Redireccionar a la página de verificación de documento
    navigate('/verificacion-selfie');
  };
  
  // Función para simular verificación (para fines de demo)
  const simulateVerification = async () => {
    setIsVerifying(true);
    setVerificationError(null);
    setSimStep(1);
    
    try {
      // Simulamos los pasos de verificación
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSimStep(2);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSimStep(3);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Datos simulados
      const verificationData: VerificationResult = {
        verified: true,
        fullName: 'Juan Carlos Pérez',
        documentNumber: '12.345.678-9',
        documentType: 'Cédula de Identidad',
        verificationMethod: 'simulate'
      };
      
      onVerificationComplete(verificationData);
      
      toast({
        title: 'Verificación completada',
        description: 'Identidad verificada exitosamente',
      });
      
    } catch (error) {
      console.error('Error en la verificación simulada:', error);
      setVerificationError('Error al realizar la verificación');
      
      toast({
        title: 'Error de verificación',
        description: 'No se pudo completar el proceso',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
      setSimStep(0);
    }
  };
  
  // Renderizado de los pasos simulados
  const renderSimulationStep = () => {
    switch (simStep) {
      case 1:
        return (
          <div className="flex flex-col items-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
            <p>Escaneando documento...</p>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col items-center">
            <FileText className="w-8 h-8 text-blue-600 mb-4" />
            <p>Validando información...</p>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col items-center">
            <User className="w-8 h-8 text-blue-600 mb-4" />
            <p>Verificando identidad...</p>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Verificación de Identidad</CardTitle>
      </CardHeader>
      <CardContent>
        {verificationError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{verificationError}</AlertDescription>
          </Alert>
        )}
        
        {isVerifying ? (
          <div className="py-6 text-center">
            {renderSimulationStep()}
          </div>
        ) : (
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={startNFCVerification}
            >
              <Scan className="mr-2 h-4 w-4" />
              Verificar con NFC (Carnet Chip)
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={startDocumentVerification}
            >
              <Camera className="mr-2 h-4 w-4" />
              Verificar con foto del documento
            </Button>
            
            {/* En modo simple ofrecemos opción rápida simulada */}
            {mode === 'simple' && (
              <Button 
                className="w-full justify-start"
                onClick={simulateVerification}
              >
                <Check className="mr-2 h-4 w-4" />
                Verificación rápida (Simulada)
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IdentityVerification;