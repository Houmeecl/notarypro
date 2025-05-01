import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, PenTool, CreditCard, Fingerprint } from "lucide-react";
import { ETokenSignature } from "./ETokenSignature";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface SignatureOptionsProps {
  documentId: number;
  documentTitle: string;
  onSignComplete?: (signatureData: any) => void;
  onCancel?: () => void;
}

type SignatureMethod = "simple" | "advanced" | "etoken";

export function SignatureOptions({ 
  documentId, 
  documentTitle,
  onSignComplete,
  onCancel
}: SignatureOptionsProps) {
  const [selectedMethod, setSelectedMethod] = useState<SignatureMethod>("simple");
  const [isLoading, setIsLoading] = useState(false);
  const [showETokenFlow, setShowETokenFlow] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Hash del documento (en producción, esto vendría del backend)
  const documentHash = `doc-${documentId}-hash`;

  const handleMethodSelect = (method: SignatureMethod) => {
    setSelectedMethod(method);
  };

  const handleSignDocument = async () => {
    if (selectedMethod === "etoken") {
      // Iniciar flujo de firma con eToken
      setShowETokenFlow(true);
      return;
    }

    setIsLoading(true);
    try {
      // Firma simple o avanzada (no eToken)
      const response = await apiRequest("POST", `/api/documents/${documentId}/sign`, {
        type: selectedMethod === "advanced" ? "advanced" : "simple",
        signatureMethod: selectedMethod,
      });

      const data = await response.json();

      // Invalidar consultas de documentos para refrescar UI
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      
      toast({
        title: "Documento firmado",
        description: `El documento "${documentTitle}" ha sido firmado exitosamente.`,
      });

      // Notificar que la firma está completa
      if (onSignComplete) {
        onSignComplete(data);
      } else {
        // Si no hay callback, redireccionar a documentos
        setLocation("/documents");
      }

    } catch (error) {
      console.error("Error firmando documento:", error);
      toast({
        title: "Error de firma",
        description: "No se pudo firmar el documento. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleETokenSignComplete = async (signatureData: any) => {
    try {
      // Enviar datos de firma con eToken al servidor
      const response = await apiRequest("POST", `/api/documents/${documentId}/sign`, {
        ...signatureData,
        type: "advanced_token",
      });

      const data = await response.json();

      // Invalidar consultas de documentos para refrescar UI
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      
      toast({
        title: "Documento firmado con token",
        description: `El documento "${documentTitle}" ha sido firmado exitosamente con su certificado digital.`,
      });

      // Notificar que la firma está completa
      if (onSignComplete) {
        onSignComplete(data);
      } else {
        // Si no hay callback, redireccionar a documentos
        setLocation("/documents");
      }

    } catch (error) {
      console.error("Error enviando firma eToken:", error);
      toast({
        title: "Error de firma",
        description: "No se pudo completar el proceso de firma. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (showETokenFlow) {
      setShowETokenFlow(false);
      return;
    }

    if (onCancel) {
      onCancel();
    } else {
      setLocation("/documents");
    }
  };

  if (showETokenFlow) {
    return (
      <ETokenSignature 
        documentId={documentId}
        documentHash={documentHash}
        onSignComplete={handleETokenSignComplete}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Firma Electrónica</CardTitle>
        <CardDescription>
          Seleccione el método de firma para el documento "{documentTitle}"
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="simple" 
          value={selectedMethod}
          onValueChange={(value) => handleMethodSelect(value as SignatureMethod)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="simple" className="flex flex-col py-3 gap-1">
              <PenTool className="h-4 w-4" />
              <span className="text-xs">Simple</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex flex-col py-3 gap-1">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs">Avanzada</span>
            </TabsTrigger>
            <TabsTrigger value="etoken" className="flex flex-col py-3 gap-1">
              <Fingerprint className="h-4 w-4" />
              <span className="text-xs">eToken</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="simple" className="space-y-4">
            <div className="bg-gray-50 border rounded-md p-4">
              <h3 className="font-medium text-gray-800 flex items-center mb-2">
                <PenTool className="h-4 w-4 mr-2 text-primary" />
                Firma Electrónica Simple
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                Firma el documento con una firma electrónica simple. Este tipo de firma tiene validez legal limitada 
                según la Ley 19.799 de Chile.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                <div className="flex items-start gap-2">
                  <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                  </div>
                  <span className="text-gray-700">Proceso rápido</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                  </div>
                  <span className="text-gray-700">Sin costo adicional</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-red-100 p-1 rounded-full mt-0.5">
                    <div className="w-3 h-3 bg-red-400 rounded-full" />
                  </div>
                  <span className="text-gray-700">Validez legal limitada</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                  </div>
                  <span className="text-gray-700">Para documentos internos</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <div className="bg-gray-50 border rounded-md p-4">
              <h3 className="font-medium text-gray-800 flex items-center mb-2">
                <ShieldCheck className="h-4 w-4 mr-2 text-green-600" />
                Firma Electrónica Avanzada
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                Firma el documento con una firma electrónica avanzada que incluye validez legal completa
                según la Ley 19.799 de Chile, con estampado de tiempo certificado.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                <div className="flex items-start gap-2">
                  <div className="bg-green-100 p-1 rounded-full mt-0.5">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                  <span className="text-gray-700">Validez legal completa</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-green-100 p-1 rounded-full mt-0.5">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                  <span className="text-gray-700">Estampado de tiempo</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-green-100 p-1 rounded-full mt-0.5">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                  <span className="text-gray-700">Máxima seguridad</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-amber-100 p-1 rounded-full mt-0.5">
                    <div className="w-3 h-3 bg-amber-500 rounded-full" />
                  </div>
                  <span className="text-gray-700">Costo adicional</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-4 border-t pt-4">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">Costo: $5.000 CLP</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="etoken" className="space-y-4">
            <div className="bg-gray-50 border rounded-md p-4">
              <h3 className="font-medium text-gray-800 flex items-center mb-2">
                <Fingerprint className="h-4 w-4 mr-2 text-blue-600" />
                Firma con eToken / Token criptográfico
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                Firma el documento con su dispositivo criptográfico personal (eToken), utilizando
                un certificado digital emitido por una entidad certificadora acreditada.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                <div className="flex items-start gap-2">
                  <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  </div>
                  <span className="text-gray-700">Máxima validez legal</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  </div>
                  <span className="text-gray-700">Certificado personal</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  </div>
                  <span className="text-gray-700">Sin costo adicional</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-amber-100 p-1 rounded-full mt-0.5">
                    <div className="w-3 h-3 bg-amber-500 rounded-full" />
                  </div>
                  <span className="text-gray-700">Requiere dispositivo</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-4 border-t pt-4">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-700">Compatible con entidades certificadoras acreditadas</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSignDocument} 
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <span className="flex items-center gap-1">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Firmando...
            </span>
          ) : (
            <span className="flex items-center gap-1">
              {selectedMethod === "simple" && <PenTool className="h-4 w-4 mr-1" />}
              {selectedMethod === "advanced" && <ShieldCheck className="h-4 w-4 mr-1" />}
              {selectedMethod === "etoken" && <Fingerprint className="h-4 w-4 mr-1" />}
              Firmar documento
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}