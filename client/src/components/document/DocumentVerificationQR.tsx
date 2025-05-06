import React, { useState } from 'react';
import { useRealFuncionality } from '@/hooks/use-real-funcionality';
import { QrCode, ExternalLink, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';

interface DocumentVerificationQRProps {
  documentId: number;
  documentName: string;
  qrImageUrl?: string;
  verificationUrl?: string;
  verificationCode?: string;
  expiryDate?: Date;
  onGenerateQR?: () => void;
}

/**
 * Componente que muestra un código QR para verificación de documento
 * según los requerimientos de la Ley 19.799 de Chile
 */
export function DocumentVerificationQR({
  documentId,
  documentName,
  qrImageUrl,
  verificationUrl,
  verificationCode,
  expiryDate,
  onGenerateQR
}: DocumentVerificationQRProps) {
  const { isFunctionalMode } = useRealFuncionality();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Copiar URL al portapapeles
  const copyToClipboard = () => {
    if (verificationUrl) {
      navigator.clipboard.writeText(verificationUrl)
        .then(() => {
          setCopied(true);
          toast({
            title: "URL copiada",
            description: "URL de verificación copiada al portapapeles",
            duration: 2000,
          });
          
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Error al copiar URL:', err);
          toast({
            title: "Error",
            description: "No se pudo copiar la URL",
            variant: "destructive",
          });
        });
    }
  };
  
  // Si no está en modo funcional y no hay QR, mostrar mensaje informativo
  if (!isFunctionalMode && !qrImageUrl) {
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-1">
            <QrCode className="h-4 w-4" />
            <span>Verificación de documento</span>
          </CardTitle>
          <CardDescription>
            La verificación mediante QR no está disponible en modo de demostración
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <QrCode className="h-24 w-24 text-gray-300 mx-auto" />
          <p className="text-sm text-gray-500 mt-3">
            Active el modo funcional para habilitar verificación QR
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Si hay QR o está en modo funcional
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-1">
          <QrCode className="h-4 w-4" />
          <span>Verificación de documento</span>
        </CardTitle>
        <CardDescription>
          {verificationCode 
            ? 'Este código QR permite verificar la autenticidad del documento'
            : 'Genera un código QR para verificar este documento'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {qrImageUrl || verificationUrl ? (
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg mb-3">
              {verificationUrl ? (
                <QRCodeSVG
                  value={verificationUrl}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              ) : (
                <img 
                  src={qrImageUrl} 
                  alt="Código QR de verificación" 
                  className="w-44 h-44"
                />
              )}
            </div>
            
            <div className="w-full space-y-3">
              {verificationCode && (
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Código de verificación:</p>
                  <p className="font-mono font-medium">{verificationCode}</p>
                </div>
              )}
              
              {expiryDate && (
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Válido hasta:</p>
                  <p className="text-sm">
                    {new Date(expiryDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              {verificationUrl && (
                <div className="flex items-center justify-center mt-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs flex items-center gap-1"
                    onClick={() => window.open(verificationUrl, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Abrir enlace</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs flex items-center gap-1"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-green-600" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copiar enlace</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <QrCode className="h-24 w-24 text-gray-300 mx-auto" />
            <p className="text-sm text-gray-500 mt-3">
              No hay código QR de verificación para este documento
            </p>
          </div>
        )}
      </CardContent>
      
      {!qrImageUrl && !verificationUrl && onGenerateQR && (
        <CardFooter>
          <Button 
            variant="default" 
            className="w-full"
            onClick={onGenerateQR}
          >
            Generar código QR
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default DocumentVerificationQR;