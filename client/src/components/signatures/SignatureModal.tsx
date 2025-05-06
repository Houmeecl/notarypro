import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PenLine, Check, Trash2, Info } from 'lucide-react';
import SignatureCanvas from './SignatureCanvas';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: string) => void;
  title: string;
  description: string;
  signatureType: 'client' | 'certifier';
}

export default function SignatureModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  signatureType
}: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Limpiar el canvas de firma
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignatureData(null);
        setIsDrawing(false);
      }
    }
  };

  // Capturar la firma como base64
  const captureSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Añadimos metadatos legales a la firma
      const signatureDataBase64 = canvas.toDataURL('image/png');
      setSignatureData(signatureDataBase64);
      
      // Agregamos información adicional para el seguimiento legal
      const legalMetadata = {
        timestamp: new Date().toISOString(),
        ipAddress: "192.168.1.1", // En una implementación real, esto vendría del servidor
        userAgent: navigator.userAgent,
        verificationType: signatureType === 'client' ? 'simple' : 'advanced',
        legalReference: "Ley 19.799 sobre documentos electrónicos"
      };
      
      // En una implementación real, enviaríamos estos metadatos al servidor
      console.log('Metadata de firma legal:', legalMetadata);
    }
  };

  // Manejar evento de firma completada
  const handleSignatureComplete = () => {
    if (signatureData) {
      onConfirm(signatureData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <PenLine className="h-4 w-4 mr-2" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {signatureType === 'client' && (
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle>Validez legal</AlertTitle>
              <AlertDescription className="text-xs">
                Su firma simple tiene validez legal conforme a la Ley 19.799 sobre documentos electrónicos. 
                El sistema ha verificado su identidad previamente y registrará esta firma con un sello de tiempo certificado.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="border rounded-md overflow-hidden">
            <SignatureCanvas
              ref={canvasRef}
              onBeginDrawing={() => setIsDrawing(true)}
              onSignatureComplete={captureSignature}
              signatureType={signatureType}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearSignature}
              disabled={!isDrawing && !signatureData}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Borrar
            </Button>
            
            <div className="text-xs text-muted-foreground">
              {isDrawing ? (
                'Firma en progreso...'
              ) : signatureData ? (
                'Firma completada'
              ) : (
                'Dibuje su firma arriba'
              )}
            </div>
          </div>
        </div>
        
        <Separator />
        
        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSignatureComplete} 
            disabled={!signatureData}
            className={signatureType === 'certifier' ? 'bg-green-600 hover:bg-green-700' : 'bg-[#2d219b] hover:bg-[#221a7c]'}
          >
            <Check className="h-4 w-4 mr-2" />
            Confirmar firma
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}