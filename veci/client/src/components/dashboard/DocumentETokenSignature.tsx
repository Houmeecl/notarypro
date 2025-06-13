import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignatureOptions } from "@/components/signature/SignatureOptions";
import { useToast } from "@/hooks/use-toast";
import { Fingerprint, FileText, Check, Download } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface DocumentETokenSignatureProps {
  documentId: number;
  documentTitle: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

export function DocumentETokenSignature({
  documentId,
  documentTitle,
  onComplete,
  onCancel
}: DocumentETokenSignatureProps) {
  const [isSigningMode, setIsSigningMode] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSignStart = () => {
    setIsSigningMode(true);
  };

  const handleSignComplete = async (signatureData: any) => {
    try {
      setIsLoading(true);
      
      // Enviar datos de firma al servidor
      const response = await apiRequest("POST", `/api/documents/${documentId}/sign`, {
        ...signatureData
      });
      
      const data = await response.json();
      
      // Actualizar URL del PDF firmado
      if (data.pdfPath) {
        setPdfUrl(data.pdfPath);
      }
      
      // Marcar como completado
      setIsComplete(true);
      setIsSigningMode(false);
      
      // Invalidar consultas para refrescar datos
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      
      toast({
        title: "Documento firmado exitosamente",
        description: "El documento ha sido firmado con su certificado digital.",
      });
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error completando firma:", error);
      toast({
        title: "Error en firma",
        description: "No se pudo completar el proceso de firma. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isSigningMode) {
      setIsSigningMode(false);
      return;
    }
    
    if (onCancel) {
      onCancel();
    }
  };

  const handleDownloadPdf = async () => {
    try {
      if (!pdfUrl) {
        // Si no tenemos URL, intentar obtener el documento
        const response = await apiRequest("GET", `/api/documents/${documentId}`);
        const data = await response.json();
        
        if (data.pdfPath) {
          window.open(data.pdfPath, "_blank");
        } else {
          toast({
            title: "PDF no disponible",
            description: "El documento PDF no está disponible para descarga.",
            variant: "destructive",
          });
        }
      } else {
        // Abrir el PDF en una nueva pestaña
        window.open(pdfUrl, "_blank");
      }
    } catch (error) {
      console.error("Error descargando PDF:", error);
      toast({
        title: "Error de descarga",
        description: "No se pudo descargar el documento. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Mostrar el componente de firma si estamos en modo firma
  if (isSigningMode) {
    return (
      <SignatureOptions
        documentId={documentId}
        documentTitle={documentTitle}
        onSignComplete={handleSignComplete}
        onCancel={handleCancel}
      />
    );
  }

  // Mostrar la pantalla de completado si terminamos
  if (isComplete) {
    return (
      <Card className="w-full max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Check className="h-6 w-6" />
            Firma completada
          </CardTitle>
          <CardDescription>
            El documento ha sido firmado exitosamente con su certificado digital
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-100 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-green-900 mb-2">¡Documento firmado con éxito!</h3>
            <p className="text-green-700 mb-6">
              Su documento ha sido firmado exitosamente con su certificado digital y
              está listo para ser descargado o compartido.
            </p>
            <Button 
              onClick={handleDownloadPdf}
              className="bg-green-600 hover:bg-green-700 relative overflow-hidden group"
            >
              <div className="absolute inset-0 w-3 bg-green-700 transform -skew-x-[20deg] -translate-x-full group-hover:animate-shine" />
              <Download className="mr-2 h-4 w-4" />
              Descargar documento firmado
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button 
            variant="outline" 
            onClick={onComplete}
          >
            Continuar
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Mostrar la pantalla de inicio
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Firma digital: {documentTitle}
        </CardTitle>
        <CardDescription>
          Firme este documento con su certificado digital para darle validez legal completa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Fingerprint className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">Firma de documentos con validez legal</h3>
              <p className="text-blue-700 mb-4">
                Esta opción le permite firmar el documento "{documentTitle}" utilizando un dispositivo
                de firma electrónica (eToken), otorgándole la máxima validez legal según
                la Ley 19.799 de Chile.
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-1 rounded-full mr-2 mt-0.5">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  </div>
                  <span className="text-sm text-blue-800">
                    Compatible con certificados de E-Cert, E-Sign, TOC, Acepta y Certinet
                  </span>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 p-1 rounded-full mr-2 mt-0.5">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  </div>
                  <span className="text-sm text-blue-800">
                    Incluye estampado de tiempo certificado y firma digital avanzada
                  </span>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 p-1 rounded-full mr-2 mt-0.5">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  </div>
                  <span className="text-sm text-blue-800">
                    Requiere su dispositivo criptográfico conectado y su PIN de acceso
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        
        <Button 
          onClick={handleSignStart} 
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90"
        >
          <Fingerprint className="mr-2 h-4 w-4" />
          Iniciar proceso de firma
        </Button>
      </CardFooter>
    </Card>
  );
}