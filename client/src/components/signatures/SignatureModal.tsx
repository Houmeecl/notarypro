import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import SignatureCanvas from './SignatureCanvas';
import { Save, X } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signatureData: string) => void;
  title?: string;
  description?: string;
  signatureType?: 'client' | 'certifier';
}

const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Firma electrónica",
  description = "Firme el documento utilizando el recuadro a continuación.",
  signatureType = 'client',
}) => {
  const [signatureData, setSignatureData] = useState<string | null>(null);

  const handleSignatureComplete = (data: string) => {
    setSignatureData(data);
  };

  const handleConfirm = () => {
    if (signatureData) {
      onConfirm(signatureData);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <SignatureCanvas
            onSignatureComplete={handleSignatureComplete}
            signatureType={signatureType}
            width={550}
            height={200}
          />
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={onClose}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!signatureData}
            className={signatureType === 'certifier' ? 'bg-green-600 hover:bg-green-700' : 'bg-[#2d219b] hover:bg-[#221a7c]'}
          >
            <Save className="h-4 w-4 mr-2" />
            Confirmar firma
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignatureModal;