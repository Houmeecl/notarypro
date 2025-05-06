import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { DocumentCategory, DocumentTemplate } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import DocumentNavbar from "@/components/layout/DocumentNavbar";
import { useRealFuncionality } from "@/hooks/use-real-funcionality";

export default function DocumentTemplatesPage() {
  const { toast } = useToast();
  const [, params] = useRoute("/document-templates/:categoryId");
  const [, setLocation] = useLocation();
  const categoryId = params?.categoryId;
  const { isFunctionalMode, activarModoReal } = useRealFuncionality(true);
  
  // Log y notificación cuando la página carga en modo real
  useEffect(() => {
    if (isFunctionalMode) {
      console.log("✅ Sistema de plantillas de documentos cargado en modo funcional real");
      toast({
        title: "Plantillas Legales Activas",
        description: "Sistema de plantillas legales operando con funcionalidad completa",
        duration: 3000,
      });
    }
  }, [isFunctionalMode, toast]);

  const { data: category, isLoading: categoryLoading } = useQuery<DocumentCategory>({
    queryKey: [`/api/document-categories/${categoryId}`],
    enabled: !!categoryId,
  });

  const { data: templates, isLoading: templatesLoading, error } = useQuery<DocumentTemplate[]>({
    queryKey: [`/api/document-categories/${categoryId}/templates`],
    enabled: !!categoryId,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas de documentos.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const isLoading = categoryLoading || templatesLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-2 text-lg">Cargando plantillas de documentos...</p>
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <>
        <DocumentNavbar />
        <div className="container mx-auto py-8">
          <div 
            onClick={() => setLocation("/document-categories")}
            className="flex items-center text-primary mb-6 hover:underline cursor-pointer"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a categorías
          </div>
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">No hay plantillas disponibles</h2>
            <p className="text-gray-500 mb-6">No se encontraron plantillas de documentos en esta categoría.</p>
            <Button onClick={() => setLocation("/document-categories")}>
              Volver a categorías
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DocumentNavbar />
      <div className="container mx-auto py-8">
        <div 
          onClick={() => setLocation("/document-categories")}
          className="flex items-center text-primary mb-6 hover:underline cursor-pointer"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a categorías
        </div>

        {isFunctionalMode && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-md flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            <div>
              <p className="font-medium">Plantillas legales activas</p>
              <p className="text-sm text-green-700">Todas las plantillas disponibles cumplen con la Ley 19.799 para firma electrónica</p>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{category?.name}</h1>
          <p className="text-gray-500">
            {category?.description}
          </p>
        </div>
        
        <div id="document-template-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div 
              key={template.id}
              onClick={() => setLocation(`/document-form/${template.id}`)}
              className="block h-full transition-transform hover:scale-105 cursor-pointer"
            >
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{template.name}</CardTitle>
                    <Badge variant="default">
                      Activo
                    </Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <Separator className="my-2" />
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      Esta plantilla incluye un formulario para completar los datos necesarios para generar el documento.
                    </p>
                    <p className="font-medium text-lg mt-4">
                      ${template.price / 100}
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Usar esta plantilla</Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}