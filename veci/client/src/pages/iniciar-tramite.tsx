import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { QRCodeSVG } from 'qrcode.react';

/**
 * Página para iniciar un nuevo trámite con generación de código QR
 * Esta página permite seleccionar el tipo de documento y generar un código QR
 * para iniciar el proceso de verificación
 */
export default function IniciarTramitePage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrData, setQrData] = useState("");
  const [tramiteId, setTramiteId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentType) {
      toast({
        title: "Error",
        description: "Por favor selecciona un tipo de documento",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Generar un ID único para el trámite
      const uniqueId = Math.random().toString(36).substring(2, 15);
      
      // En una implementación real, aquí se haría una llamada a la API
      // para registrar el trámite en la base de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // URL para verificación (en producción sería la URL completa del dominio)
      const verificationUrl = window.location.origin + "/verificar/" + uniqueId;
      
      setQrData(verificationUrl);
      setTramiteId(uniqueId);
      setQrGenerated(true);
      
      toast({
        title: "Éxito",
        description: "Trámite iniciado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al iniciar el trámite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-indigo-900 text-white rounded-t-lg">
          <CardTitle className="text-xl">Iniciar Trámite</CardTitle>
          <CardDescription className="text-gray-200">
            Seleccione el tipo de documento para generar un código QR
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {!qrGenerated ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <FormLabel htmlFor="document-type">Tipo de Documento:</FormLabel>
                <Select 
                  value={documentType} 
                  onValueChange={setDocumentType}
                >
                  <SelectTrigger id="document-type" className="w-full">
                    <SelectValue placeholder="Seleccione un tipo de documento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compraventa">Contrato de Compraventa</SelectItem>
                    <SelectItem value="trabajo">Contrato de Trabajo</SelectItem>
                    <SelectItem value="poder">Poder Bancario</SelectItem>
                    <SelectItem value="mandato">Mandato General</SelectItem>
                    <SelectItem value="finiquito">Finiquito Laboral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center space-y-4 py-6">
              <h3 className="text-lg font-semibold text-gray-900">Escanea este código QR con tu móvil:</h3>
              <div className="border-2 border-indigo-900 p-4 rounded-lg bg-white">
                <QRCodeSVG 
                  value={qrData} 
                  size={200} 
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="text-center mt-4">
                <p className="text-sm text-gray-500 mb-1">ID del trámite:</p>
                <p className="font-mono text-indigo-900 font-bold">{tramiteId}</p>
              </div>
              <p className="text-sm text-gray-600 text-center max-w-xs">
                Una vez escaneado, se iniciará el proceso de verificación en tu dispositivo móvil.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => {
              if (qrGenerated) {
                setQrGenerated(false);
                setQrData("");
                setTramiteId("");
              } else {
                navigate("/");
              }
            }}
          >
            {qrGenerated ? "Iniciar Otro Trámite" : "Cancelar"}
          </Button>
          {!qrGenerated && (
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !documentType}
              className="bg-indigo-900 hover:bg-indigo-800"
            >
              {loading ? "Procesando..." : "Iniciar Trámite"}
            </Button>
          )}
          {qrGenerated && (
            <Button 
              onClick={() => {
                // Simular compartir el código QR
                toast({
                  title: "Compartido",
                  description: "Enlace de verificación copiado al portapapeles"
                });
                navigator.clipboard.writeText(qrData);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Compartir QR
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}