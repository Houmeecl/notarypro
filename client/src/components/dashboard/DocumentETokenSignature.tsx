import { useState } from "react";
import { ETokenSignature } from "@/components/signature/ETokenSignature";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Fingerprint, ShieldCheck, Key } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Document } from "@shared/schema";

interface DocumentETokenSignatureProps {
  document: Document;
  onSignatureComplete: () => void;
  onCancel?: () => void;
}

export default function DocumentETokenSignature({ 
  document, 
  onSignatureComplete,
  onCancel 
}: DocumentETokenSignatureProps) {
  const [showETokenFlow, setShowETokenFlow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Hash del documento (en producción, esto vendría del backend)
  const documentHash = `doc-${document.id}-hash`;

  const handleSignWithEToken = () => {
    setShowETokenFlow(true);
  };

  const handleETokenSignComplete = async (signatureData: any) => {
    try {
      setIsLoading(true);
      // Enviar datos de firma con eToken al servidor
      const response = await apiRequest("POST", `/api/documents/${document.id}/sign`, {
        ...signatureData,
        type: "advanced_token",
      });

      // Invalidar consultas de documentos para refrescar UI
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      
      toast({
        title: "Documento firmado con token",
        description: `El documento "${document.title}" ha sido firmado exitosamente con su certificado digital.`,
      });

      // Notificar que la firma está completa
      onSignatureComplete();
    } catch (error) {
      console.error("Error enviando firma eToken:", error);
      toast({
        title: "Error de firma",
        description: "No se pudo completar el proceso de firma. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (showETokenFlow) {
      setShowETokenFlow(false);
      return;
    }

    if (onCancel) {
      onCancel();
    }
  };

  if (showETokenFlow) {
    return (
      <ETokenSignature 
        documentId={document.id}
        documentHash={documentHash}
        onSignComplete={handleETokenSignComplete}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Fingerprint className="h-5 w-5 text-primary mr-2" />
          Firma Electrónica Avanzada con Token
        </CardTitle>
        <CardDescription>
          Firme con su dispositivo de firma electrónica para obtener validez legal plena
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">Firma Avanzada con Dispositivo</h3>
              <p className="text-blue-700 mb-4">
                Utilizando su token o dispositivo criptográfico personal, podrá firmar este documento
                con la máxima validez legal de acuerdo a la Ley 19.799 de Chile.
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-1 rounded-full mr-2 mt-0.5">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  </div>
                  <span className="text-sm text-blue-800">
                    Máxima validez legal y probatoria
                  </span>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 p-1 rounded-full mr-2 mt-0.5">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  </div>
                  <span className="text-sm text-blue-800">
                    Utiliza su certificado digital personal
                  </span>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 p-1 rounded-full mr-2 mt-0.5">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  </div>
                  <span className="text-sm text-blue-800">
                    Requiere su dispositivo token conectado a la computadora
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm bg-blue-100 p-2 rounded-md">
                <Key className="h-4 w-4 text-blue-700" />
                <span className="text-blue-800">
                  Tendrá que ingresar el PIN de su dispositivo
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Documento a firmar:</h4>
          <p className="text-gray-800 font-medium">
            {document.title}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSignWithEToken} 
          className="bg-primary hover:bg-primary/90"
        >
          <Fingerprint className="mr-2 h-4 w-4" />
          Firmar con eToken
        </Button>
      </CardFooter>
    </Card>
  );
}