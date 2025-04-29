import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";
import { DocumentCategory } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import DocumentNavbar from "@/components/layout/DocumentNavbar";

export default function DocumentCategoriesPage() {
  const { toast } = useToast();
  const { data: categories, isLoading, error } = useQuery<DocumentCategory[]>({ 
    queryKey: ['/api/document-categories'] 
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías de documentos.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-2 text-lg">Cargando categorías de documentos...</p>
      </div>
    );
  }

  return (
    <>
      <DocumentNavbar />
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Categorías de Documentos</h1>
          <p className="text-gray-500">
            Seleccione una categoría para ver las plantillas de documentos disponibles.
          </p>
        </div>
        
        <div id="document-category-section" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((category) => (
            <Link key={category.id} href={`/document-templates/${category.id}`} className="block h-full transition-transform hover:scale-105">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl">{category.name}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <Separator className="my-2" />
                  <p className="text-sm text-gray-500 mt-2">
                    Explore las plantillas disponibles en esta categoría.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Ver Plantillas</Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}