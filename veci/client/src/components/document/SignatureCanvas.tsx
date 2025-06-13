import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, PenTool, CreditCard } from "lucide-react";
import ETokenSupport, { TokenInfo } from "./ETokenSupport";

// @ts-ignore - No hay tipos incluidos para esta librería
import SignaturePad from "react-signature-canvas";

interface SignatureCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (signatureDataUrl: string, metadata?: { type: string; tokenInfo?: TokenInfo }) => void;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  isOpen,
  onClose = () => {},
  onComplete,
}) => {
  const signaturePadRef = useRef<any>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("manual");
  const [showETokenSupport, setShowETokenSupport] = useState(false);

  const handleClear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setIsEmpty(true);
    }
  };

  const handleSave = () => {
    if (signaturePadRef.current && !isEmpty) {
      // Obtener la firma como una imagen en base64
      const signatureDataUrl = signaturePadRef.current.toDataURL("image/png");
      onComplete(signatureDataUrl, { type: "manual" });
    }
  };

  const handleBegin = () => {
    setIsEmpty(false);
  };

  const handleTokenSelected = (tokenInfo: TokenInfo) => {
    // En un entorno real, aquí se manejaría la firma con el token seleccionado
    // Para esta implementación, simulamos la firma con un token
    const signatureDataUrl = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSIxMCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iYmxhY2siPkZpcm1hZG8gZGlnaXRhbG1lbnRlIGNvbjogJHt0b2tlbkluZm8ubmFtZX08L3RleHQ+PHRleHQgeD0iMTAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9ImJsYWNrIj5Owr5gJHt0b2tlbkluZm8uc2VyaWFsTnVtYmVyfSAtIEVtaXRpZG8gcG9yOiAke3Rva2VuSW5mby5pc3N1ZXJ9PC90ZXh0Pjwvc3ZnPg==`;
    onComplete(signatureDataUrl, { type: "etoken", tokenInfo });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "etoken") {
      setShowETokenSupport(true);
    } else {
      setShowETokenSupport(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Firmar documento</DialogTitle>
          <DialogDescription>
            Elija su método de firma preferido para este documento
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="manual" className="flex items-center">
              <PenTool className="h-4 w-4 mr-2" />
              <span>Firma manual</span>
            </TabsTrigger>
            <TabsTrigger value="etoken" className="flex items-center">
              <ShieldCheck className="h-4 w-4 mr-2" />
              <span>E-Token</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div 
                className={cn(
                  "border-2 border-gray-300 rounded-md w-full h-60 bg-white", 
                  !isEmpty && "border-primary"
                )}
              >
                <SignaturePad
                  ref={signaturePadRef}
                  penColor="black"
                  canvasProps={{
                    className: "w-full h-full",
                  }}
                  onBegin={handleBegin}
                />
              </div>
              <p className="text-sm text-gray-500">
                Dibuje su firma dentro del área y luego haga clic en "Completar firma"
              </p>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 pt-4">
              <Button variant="outline" type="button" onClick={handleClear}>
                Limpiar
              </Button>
              <Button 
                type="button" 
                onClick={handleSave}
                disabled={isEmpty}
              >
                Completar firma
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="etoken">
            {showETokenSupport && (
              <ETokenSupport 
                onTokenSelected={handleTokenSelected}
                onCancel={onClose}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SignatureCanvas;