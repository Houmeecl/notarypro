import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Clock, ShieldCheck, User } from 'lucide-react';

interface VerificationInfo {
  verifiedAt: string;
  verifiedBy: string;
  verificationMethod: string;
  verificationId?: string;
  legalReference?: string;
}

interface SignatureDisplayProps {
  signatureData: string;
  signatureType: 'client' | 'certifier';
  signerName: string;
  timestamp: string;
  verificationInfo?: VerificationInfo;
}

export default function SignatureDisplay({
  signatureData,
  signatureType,
  signerName,
  timestamp,
  verificationInfo
}: SignatureDisplayProps) {
  // Verificar si es un JSON (firma avanzada) o una imagen base64 (firma simple)
  const isAdvancedSignature = signatureType === 'certifier' || signatureData.startsWith('{');
  
  let parsedSignatureData: any = null;
  if (isAdvancedSignature && !signatureData.startsWith('data:image')) {
    try {
      parsedSignatureData = JSON.parse(signatureData);
    } catch (e) {
      console.error('Error parsing signature data:', e);
    }
  }
  
  return (
    <Card className={`overflow-hidden ${signatureType === 'certifier' ? 'border-green-200' : 'border-primary/20'}`}>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          {/* Encabezado de firma */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${signatureType === 'certifier' ? 'bg-green-500' : 'bg-primary'}`}></div>
              <span className="font-medium text-sm">
                {signatureType === 'certifier' ? 'Firma avanzada' : 'Firma simple'}
              </span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>{timestamp}</span>
            </div>
          </div>
          
          {/* Firma */}
          <div className="pt-2 pb-3">
            {isAdvancedSignature && parsedSignatureData ? (
              <div className="text-sm space-y-2">
                <div className="flex items-center">
                  <ShieldCheck className="h-4 w-4 mr-2 text-green-600" />
                  <span className="font-medium">Firma digital certificada</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1 pl-6">
                  <p>Algoritmo: {parsedSignatureData.signatureAlgorithm}</p>
                  <p>Formato: {parsedSignatureData.signatureFormat}</p>
                  <p>Certificado: {parsedSignatureData.certificateInfo.subject}</p>
                </div>
              </div>
            ) : (
              <div className="w-full border border-gray-200 rounded p-1">
                <img 
                  src={signatureData} 
                  alt="Firma" 
                  className="max-h-16 w-auto mx-auto"
                />
              </div>
            )}
          </div>
          
          {/* Info del firmante */}
          <div className="flex items-center text-xs">
            <User className="h-3 w-3 mr-1" />
            <span>{signerName}</span>
          </div>
          
          {/* Datos de verificación */}
          {verificationInfo && (
            <div className={`mt-2 pt-2 border-t text-xs ${signatureType === 'certifier' ? 'border-green-100' : 'border-gray-100'}`}>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className={`h-3 w-3 mt-0.5 ${signatureType === 'certifier' ? 'text-green-600' : 'text-primary'}`} />
                <div className="space-y-1">
                  <p className="font-medium">Verificación realizada:</p>
                  <p className="text-muted-foreground">
                    {verificationInfo.verificationMethod} por {verificationInfo.verifiedBy}
                  </p>
                  <p className="text-muted-foreground">
                    Fecha: {verificationInfo.verifiedAt}
                  </p>
                  {verificationInfo.verificationId && (
                    <p className="text-muted-foreground">
                      ID: {verificationInfo.verificationId}
                    </p>
                  )}
                  {verificationInfo.legalReference && (
                    <p className="text-muted-foreground">
                      Ref. legal: {verificationInfo.legalReference}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}