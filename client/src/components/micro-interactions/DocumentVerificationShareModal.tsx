import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import DocumentVerificationBadge from "./DocumentVerificationBadge";

interface DocumentVerificationShareModalProps {
  trigger?: React.ReactNode;
  documentVerification: {
    id: number;
    documentId: number;
    documentTitle: string;
    documentCode: string;
    verifiedAt: string;
  };
  achievement?: {
    id: number;
    name: string;
    description: string;
    level: number;
    badgeImageUrl?: string;
    unlockedAt?: string;
    rewardPoints?: number;
  };
  verificationCount?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Modal para compartir un logro de verificación de documento
 */
const DocumentVerificationShareModal: React.FC<DocumentVerificationShareModalProps> = ({
  trigger,
  documentVerification,
  achievement,
  verificationCount = 1,
  open,
  onOpenChange,
}) => {
  // Si no hay trigger externo, usar un botón por defecto
  const defaultTrigger = (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1 text-primary hover:text-primary/80"
    >
      <Share2 className="h-4 w-4" />
      <span>Compartir</span>
    </Button>
  );

  // Si no hay achievement, crear uno por defecto
  const badgeData = achievement || {
    id: documentVerification.id,
    name: "Verificación Certificada",
    description: "Has verificado la autenticidad de este documento con éxito.",
    level: 1,
    unlockedAt: documentVerification.verifiedAt || new Date().toISOString(),
  };

  // Datos completos para la insignia
  const verificationBadgeData = {
    ...badgeData,
    documentTitle: documentVerification.documentTitle,
    documentCode: documentVerification.documentCode,
    verificationCount: verificationCount,
  };

  // Renderizar el modal
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartir verificación</DialogTitle>
          <DialogDescription>
            Comparte tu logro de verificación del documento "{documentVerification.documentTitle}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <DocumentVerificationBadge achievement={verificationBadgeData} />
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange?.(false)}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentVerificationShareModal;