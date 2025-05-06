import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera, Scan } from 'lucide-react';
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
  verificationMethod: 'nfc' | 'document' | 'selfie';
}

const IdentityVerification: React.FC<IdentityVerificationProps> = ({
  onVerificationComplete,
  mode = 'simple'
}) => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  
  // Función para iniciar verificación NFC
  const startNFCVerification = () => {
    // Redireccionar a la página de verificación NFC
    setLocation('/verificacion-nfc');
  };
  
  // Función para iniciar verificación con foto de documento
  const startDocumentVerification = () => {
    // Redireccionar a la página de verificación de documento
    setLocation('/verificacion-selfie');
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
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
            <p>Verificando...</p>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IdentityVerification;