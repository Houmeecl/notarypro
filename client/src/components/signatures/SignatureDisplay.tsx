import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Shield, Clock, CheckCircle } from 'lucide-react';

interface SignatureDisplayProps {
  signatureData: string;
  signatureType: 'client' | 'certifier';
  signerName?: string;
  timestamp?: string;
  verificationInfo?: {
    verifiedAt?: string;
    verifiedBy?: string;
    verificationMethod?: string;
  };
}

const SignatureDisplay: React.FC<SignatureDisplayProps> = ({
  signatureData,
  signatureType,
  signerName,
  timestamp,
  verificationInfo
}) => {
  const config = {
    client: {
      title: 'Firma electrónica simple',
      icon: <User className="h-4 w-4 mr-2 text-[#2d219b]" />,
      bgColor: 'bg-[#2d219b]/5',
      borderColor: 'border-[#2d219b]/20',
      textColor: 'text-[#2d219b]'
    },
    certifier: {
      title: 'Firma electrónica avanzada',
      icon: <Shield className="h-4 w-4 mr-2 text-green-600" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600'
    }
  };

  const selectedConfig = config[signatureType];

  return (
    <Card className={`shadow-sm border ${selectedConfig.borderColor}`}>
      <CardHeader className={`${selectedConfig.bgColor} py-3`}>
        <CardTitle className="text-sm flex items-center">
          {selectedConfig.icon}
          {selectedConfig.title}
        </CardTitle>
        {signerName && (
          <div className="text-xs text-gray-600">
            Firmado por: {signerName}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-3">
        <div className={`border rounded-md p-1 ${selectedConfig.borderColor}`}>
          <img 
            src={signatureData} 
            alt="Firma" 
            className="w-full h-auto max-h-24 object-contain" 
          />
        </div>
      </CardContent>
      <CardFooter className={`flex flex-col items-start px-3 py-2 bg-gray-50 border-t text-xs space-y-1`}>
        {timestamp && (
          <div className="flex items-center text-gray-600">
            <Clock className="h-3 w-3 mr-1" />
            Firma realizada: {timestamp}
          </div>
        )}
        {verificationInfo && verificationInfo.verifiedAt && (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verificada: {verificationInfo.verifiedAt}
            {verificationInfo.verifiedBy && ` por ${verificationInfo.verifiedBy}`}
          </div>
        )}
        {verificationInfo && verificationInfo.verificationMethod && (
          <div className="text-gray-500">
            Método: {verificationInfo.verificationMethod}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default SignatureDisplay;