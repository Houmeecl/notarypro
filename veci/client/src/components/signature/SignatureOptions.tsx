import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Pen, Fingerprint, Key } from "lucide-react";
import ETokenSignature from "./ETokenSignature";
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
        documentId={documentId.toString()}
        documentHash={documentHash}
        onSignComplete={handleETokenSignComplete}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="simple" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100">
          <TabsTrigger 
            value="simple" 
            onClick={() => handleMethodSelect("simple")}
            className="text-sm data-[state=active]:bg-slate-900 data-[state=active]:text-white"
          >
            Firma Simple
          </TabsTrigger>
          <TabsTrigger 
            value="advanced" 
            onClick={() => handleMethodSelect("advanced")}
            className="text-sm data-[state=active]:bg-slate-900 data-[state=active]:text-white"
          >
            Firma Avanzada
          </TabsTrigger>
          <TabsTrigger 
            value="etoken" 
            onClick={() => handleMethodSelect("etoken")}
            className="text-sm data-[state=active]:bg-slate-900 data-[state=active]:text-white"
          >
            Firma con eToken
          </TabsTrigger>
        </TabsList>
        
        {/* Firma Simple */}
        <TabsContent value="simple">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pen className="h-5 w-5 text-slate-600 mr-2" />
                Firma Electrónica Simple
              </CardTitle>
              <CardDescription>
                Firma con validez legal básica para documentos de menor relevancia legal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 shadow-sm rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-100 rounded-full">
                    <Pen className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Firma Electrónica Simple</h3>
                    <p className="text-slate-700 mb-4">
                      Este tipo de firma otorga validez legal a su documento según la Ley 19.799, pero con un
                      nivel de seguridad estándar.
                    </p>
                    
                    <div className="mb-4">
                      <ul className="space-y-2 text-slate-700">
                        <li className="flex items-center">
                          <ShieldCheck className="h-5 w-5 text-slate-500 mr-2" />
                          <span className="text-sm">Firma digital con validez legal según Ley 19.799</span>
                        </li>
                        <li className="flex items-center">
                          <Pen className="h-5 w-5 text-slate-500 mr-2" />
                          <span className="text-sm">Proceso simple y rápido para documentos privados</span>
                        </li>
                        <li className="flex items-center">
                          <svg className="h-5 w-5 text-slate-500 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span className="text-sm">Incluye estampado de tiempo y verificación</span>
                        </li>
                      </ul>
                    </div>
                    
                    <Button 
                      onClick={handleSignWithSimple} 
                      disabled={isLoading}
                      className="bg-slate-900 hover:bg-slate-800 text-white"
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
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldCheck className="h-5 w-5 text-slate-600 mr-2" />
                Firma Electrónica Avanzada
              </CardTitle>
              <CardDescription>
                Firma con estampado de tiempo certificado y validez legal plena
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 border border-slate-200 shadow-sm rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-100 rounded-full">
                    <ShieldCheck className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Servicio Premium</h3>
                    <p className="text-slate-700 mb-4">
                      La firma electrónica avanzada está disponible para usuarios con plan premium.
                      Actualice para tener acceso a esta funcionalidad y otras ventajas exclusivas.
                    </p>
                    <Button 
                      onClick={handleSignWithAdvanced}
                      className="bg-slate-900 hover:bg-slate-800 text-white"
                    >
                      Actualizar a Plan Premium
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Firma con eToken */}
        <TabsContent value="etoken">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Fingerprint className="h-5 w-5 text-slate-600 mr-2" />
                Firma Electrónica Avanzada con Token
              </CardTitle>
              <CardDescription>
                Firme con su dispositivo de firma electrónica para obtener validez legal plena
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 shadow-sm rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-100 rounded-full">
                    <Fingerprint className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Firma Avanzada con Dispositivo</h3>
                    <p className="text-slate-700 mb-4">
                      Utilizando su token o dispositivo criptográfico personal, podrá firmar este documento
                      con la máxima validez legal de acuerdo a la Ley 19.799 de Chile.
                    </p>
                    
                    <div className="mb-4">
                      <ul className="space-y-2 text-slate-700">
                        <li className="flex items-center">
                          <ShieldCheck className="h-5 w-5 text-slate-500 mr-2" />
                          <span className="text-sm">Máxima validez legal y probatoria</span>
                        </li>
                        <li className="flex items-center">
                          <Fingerprint className="h-5 w-5 text-slate-500 mr-2" />
                          <span className="text-sm">Utiliza su certificado digital personal</span>
                        </li>
                        <li className="flex items-center">
                          <Key className="h-5 w-5 text-slate-500 mr-2" />
                          <span className="text-sm">Requiere su dispositivo token conectado</span>
                        </li>
                      </ul>
                    </div>
                    
                    <Button 
                      onClick={handleSignWithEToken} 
                      className="bg-slate-900 hover:bg-slate-800 text-white"
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