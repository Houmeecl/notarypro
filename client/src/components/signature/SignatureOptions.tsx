import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Pen, Fingerprint } from "lucide-react";
import { ETokenSignature } from "./ETokenSignature";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  const [showETokenFlow, setShowETokenFlow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Hash del documento (en producción, esto vendría del backend)
  const documentHash = `doc-${documentId}-hash`;

  const handleMethodSelect = (method: SignatureMethod) => {
    setSelectedMethod(method);
  };

  const handleSignWithSimple = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", `/api/documents/${documentId}/sign`, {
        type: "simple"
      });
      
      // Invalidar consultas de documentos para refrescar UI
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      
      toast({
        title: "Documento firmado",
        description: `El documento "${documentTitle}" ha sido firmado exitosamente con firma simple.`,
      });

      if (onSignComplete) {
        onSignComplete({ type: "simple" });
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

  const handleSignWithAdvanced = async () => {
    // Esta funcionalidad estará disponible en una versión futura
    toast({
      title: "Función en desarrollo",
      description: "La firma avanzada estará disponible próximamente para usuarios premium.",
    });
  };

  const handleSignWithEToken = () => {
    setShowETokenFlow(true);
  };

  const handleETokenSignComplete = async (signatureData: any) => {
    try {
      setIsLoading(true);
      // Enviar datos de firma con eToken al servidor
      const response = await apiRequest("POST", `/api/documents/${documentId}/sign`, {
        ...signatureData,
        type: "advanced_token",
      });

      // Invalidar consultas de documentos para refrescar UI
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      
      toast({
        title: "Documento firmado con token",
        description: `El documento "${documentTitle}" ha sido firmado exitosamente con su certificado digital.`,
      });

      if (onSignComplete) {
        onSignComplete({ ...signatureData, type: "advanced_token" });
      }
    } catch (error) {
      console.error("Error enviando firma eToken:", error);
      toast({
        title: "Error de firma",
        description: "No se pudo completar el proceso de firma. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowETokenFlow(false);
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
        documentId={documentId}
        documentHash={documentHash}
        onSignComplete={handleETokenSignComplete}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="simple" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value="simple" 
            onClick={() => handleMethodSelect("simple")}
            className="text-sm"
          >
            Firma Simple
          </TabsTrigger>
          <TabsTrigger 
            value="advanced" 
            onClick={() => handleMethodSelect("advanced")}
            className="text-sm"
          >
            Firma Avanzada
          </TabsTrigger>
          <TabsTrigger 
            value="etoken" 
            onClick={() => handleMethodSelect("etoken")}
            className="text-sm"
          >
            Firma con eToken
          </TabsTrigger>
        </TabsList>
        
        {/* Firma Simple */}
        <TabsContent value="simple">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pen className="h-5 w-5 text-gray-600 mr-2" />
                Firma Electrónica Simple
              </CardTitle>
              <CardDescription>
                Firma con validez legal básica para documentos de menor relevancia legal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <Pen className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Firma Electrónica Simple</h3>
                    <p className="text-gray-700 mb-4">
                      Este tipo de firma otorga validez legal a su documento según la Ley 19.799, pero con un
                      nivel de seguridad estándar.
                    </p>
                    
                    <div className="space-y-1 mb-4">
                      <div className="flex items-start">
                        <span className="text-sm text-gray-700 border-l-2 border-gray-300 pl-2">
                          Validez legal para documentos privados
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-sm text-gray-700 border-l-2 border-gray-300 pl-2">
                          Incluye estampado de tiempo y código de verificación
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-sm text-gray-700 border-l-2 border-gray-300 pl-2">
                          Proceso seguro y eficiente
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleSignWithSimple} 
                      disabled={isLoading}
                      className="bg-gray-800 hover:bg-gray-700 text-white"
                    >
                      <Pen className="mr-2 h-4 w-4" />
                      Firmar documento
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Firma Avanzada */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldCheck className="h-5 w-5 text-gray-600 mr-2" />
                Firma Electrónica Avanzada
              </CardTitle>
              <CardDescription>
                Firma con estampado de tiempo certificado y validez legal plena
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <div className="p-3 bg-gray-100 rounded-full mx-auto mb-3 w-fit">
                  <ShieldCheck className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-gray-700 mb-4">
                  La firma avanzada está disponible para usuarios con plan premium.
                </p>
                <Button 
                  onClick={handleSignWithAdvanced}
                  className="bg-gray-800 hover:bg-gray-700 text-white"
                >
                  Actualizar a Plan Premium
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Firma con eToken */}
        <TabsContent value="etoken">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Fingerprint className="h-5 w-5 text-gray-600 mr-2" />
                Firma Electrónica Avanzada con Token
              </CardTitle>
              <CardDescription>
                Firme con su dispositivo de firma electrónica para obtener validez legal plena
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <Fingerprint className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Firma Avanzada con Dispositivo</h3>
                    <p className="text-gray-700 mb-4">
                      Utilizando su token o dispositivo criptográfico personal, podrá firmar este documento
                      con la máxima validez legal de acuerdo a la Ley 19.799 de Chile.
                    </p>
                    
                    <div className="space-y-1 mb-4">
                      <div className="flex items-start">
                        <span className="text-sm text-gray-700 border-l-2 border-gray-300 pl-2">
                          Máxima validez legal y probatoria
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-sm text-gray-700 border-l-2 border-gray-300 pl-2">
                          Utiliza su certificado digital personal
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-sm text-gray-700 border-l-2 border-gray-300 pl-2">
                          Requiere su dispositivo token conectado
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleSignWithEToken} 
                      className="bg-gray-800 hover:bg-gray-700 text-white"
                    >
                      <Fingerprint className="mr-2 h-4 w-4" />
                      Firmar documento
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}