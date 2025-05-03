import React, { useState, useEffect } from 'react';
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
// Ya no necesitamos estas importaciones de Form
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
// Eliminamos esta importación temporalmente mientras corregimos errores
import { useAuth } from '@/hooks/use-auth';

/**
 * Página de selección de documentos para firma
 * Esta página permite seleccionar el tipo de documento a firmar
 */
export default function DocumentSelectionPage() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const { user } = useAuth() || { user: null }; // Usar un objeto vacío si useAuth falla
  const [loading, setLoading] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [agreeToCertify, setAgreeToCertify] = useState(false);

  // Verifica autenticación - pero no depende de ella para mostrar la interfaz
  useEffect(() => {
    if (user) {
      console.log("Usuario autenticado:", user.username);
    }
  }, [user]);

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

    if (!agreeToCertify) {
      toast({
        title: "Error",
        description: "Debes aceptar firmar el documento",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // En una implementación real, aquí se haría una llamada a la API
      // para generar el documento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Éxito",
        description: "Documento generado correctamente",
      });
      
      // Redirigir a una página de éxito o visualización del documento
      // Generamos un ID único para el documento
      const documentId = `doc-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      navigate(`/document-view/${documentId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al generar el documento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f1ff] p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="bg-[#2d219b] text-white rounded-t-lg">
          <CardTitle className="text-xl">Seleccione el Documento a Firmar</CardTitle>
          <CardDescription className="text-gray-200">
            Seleccione el tipo de documento que desea generar y firmar
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="document-type" className="text-sm font-medium">Tipo de Documento:</label>
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

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox 
                id="signature" 
                checked={agreeToCertify} 
                onCheckedChange={(checked) => {
                  if (typeof checked === 'boolean') {
                    setAgreeToCertify(checked);
                  }
                }}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="signature"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Firma Electrónica Simple
                </label>
                <p className="text-sm text-gray-500">
                  Al marcar esta casilla, acepto firmar electrónicamente este documento
                </p>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !documentType || !agreeToCertify}
            className="bg-[#2d219b] hover:bg-[#231c7c]"
          >
            {loading ? "Procesando..." : "Generar Documento"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}