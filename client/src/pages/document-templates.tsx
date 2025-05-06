import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Loader2, ArrowLeft } from "lucide-react";
import { DocumentCategory, DocumentTemplate } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import DocumentNavbar from "@/components/layout/DocumentNavbar";
import { useRealFuncionality } from "@/hooks/use-real-funcionality";
import FunctionalModeIndicator from "@/components/document/FunctionalModeIndicator";
import FunctionalTemplateCard from "@/components/document/FunctionalTemplateCard";

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

        <FunctionalModeIndicator className="mb-4" />

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{category?.name}</h1>
          <p className="text-gray-500">
            {category?.description}
          </p>
        </div>
        
        <div id="document-template-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <FunctionalTemplateCard 
              key={template.id}
              id={template.id}
              name={template.name}
              description={template.description}
              price={template.price}
              onClick={() => setLocation(`/document-form/${template.id}`)}
            />
          ))}
        </div>
      </div>
    </>
  );
}