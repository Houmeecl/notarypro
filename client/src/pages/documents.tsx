import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, FileText, Plus, Search, Filter } from "lucide-react";
import { Document } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import DocumentNavbar from "@/components/layout/DocumentNavbar";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "draft":
      return <Badge variant="outline">Borrador</Badge>;
    case "pending":
      return <Badge variant="secondary">Pendiente</Badge>;
    case "validated":
      return <Badge variant="success">Validado</Badge>;
    case "signed":
      return <Badge variant="default">Firmado</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rechazado</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function DocumentsPage() {
  const { toast } = useToast();
  const { data: documents, isLoading, error } = useQuery<Document[]>({ 
    queryKey: ['/api/documents'] 
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los documentos.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-2 text-lg">Cargando documentos...</p>
      </div>
    );
  }

  return (
    <>
      <DocumentNavbar />
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mis Documentos</h1>
            <p className="text-gray-500">
              Gestiona tus documentos y ve su estado actual.
            </p>
          </div>
          <Link href="/document-categories">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo documento
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar documento..."
              className="pl-8"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        {!documents || documents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">No hay documentos</h3>
              <p className="text-gray-500 text-center mt-2 mb-6">
                Todavía no has creado ningún documento. Comienza creando uno nuevo.
              </p>
              <Link href="/document-categories">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear documento
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((document) => (
              <Link key={document.id} href={`/documents/${document.id}`}>
                <a className="block h-full transition-transform hover:scale-105">
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{document.title}</CardTitle>
                        {getStatusBadge(document.status)}
                      </div>
                      <CardDescription>
                        Creado el {new Date(document.createdAt || '').toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <Separator className="my-2" />
                      <div className="mt-4">
                        <p className="text-sm text-gray-500">
                          {document.status === 'draft' && "Este documento está en estado borrador."}
                          {document.status === 'pending' && "Este documento está pendiente de validación."}
                          {document.status === 'validated' && "Este documento ha sido validado."}
                          {document.status === 'signed' && "Este documento ha sido firmado."}
                          {document.status === 'rejected' && "Este documento ha sido rechazado."}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">Ver documento</Button>
                    </CardFooter>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}