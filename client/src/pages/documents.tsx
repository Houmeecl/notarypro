import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Check, 
  Clock, 
  X, 
  Loader2, 
  PenLine 
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DocumentNavbar from "@/components/layout/DocumentNavbar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";

export default function DocumentsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: documents, isLoading } = useQuery({
    queryKey: ['/api/documents'],
  });
  
  // Implementamos filtros para los documentos
  const filteredDocuments = documents?.filter((doc: any) => {
    // Filtro por estado
    const statusMatch = statusFilter === "all" || doc.status === statusFilter;
    
    // Filtro por término de búsqueda (en título)
    const searchMatch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  }) || [];
  
  // Función para renderizar el badge de estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Borrador</Badge>;
      case "pending":
        return <Badge variant="secondary">Pendiente</Badge>;
      case "validated":
        return <Badge className="bg-green-500 hover:bg-green-600">Validado</Badge>;
      case "signed":
        return <Badge variant="default">Firmado</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Función para obtener el icono de estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "signed":
        return <Check className="h-5 w-5 text-green-500" />;
      case "validated":
        return <Check className="h-5 w-5 text-blue-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "rejected":
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Función para formatear la fecha
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM, yyyy", { locale: es });
  };
  
  return (
    <>
      <DocumentNavbar />
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Mis Documentos</h1>
            <p className="text-gray-500 mt-1">Gestiona tus documentos y firmas electrónicas</p>
          </div>
          
          <div className="flex gap-2">
            <Link href="/document-categories">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo documento
              </Button>
            </Link>
            
            <Link href="/document-sign/new">
              <Button variant="outline" className="flex items-center gap-2">
                <PenLine className="h-4 w-4" />
                Subir para firmar
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="Buscar documentos..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filtrar por estado" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="validated">Validado</SelectItem>
                <SelectItem value="signed">Firmado</SelectItem>
                <SelectItem value="rejected">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-gray-50">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay documentos</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== "all" 
                ? "No se encontraron documentos con los filtros actuales." 
                : "Aún no tienes documentos creados."}
            </p>
            <Link href="/document-categories">
              <Button>Crear mi primer documento</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document: any) => (
              <div key={document.id} className="h-full">
                <Link href={`/documents/${document.id}`}>
                  <Card className="h-full hover:border-primary/50 transition-all duration-200 flex flex-col cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mr-3">
                          {getStatusIcon(document.status)}
                        </div>
                        {getStatusBadge(document.status)}
                      </div>
                      <CardTitle className="text-xl mt-3 line-clamp-2">{document.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3 flex-grow">
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Fecha de creación:</span>
                          <span>{formatDate(document.createdAt)}</span>
                        </div>
                        
                        {document.updatedAt && document.updatedAt !== document.createdAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Última actualización:</span>
                            <span>{formatDate(document.updatedAt)}</span>
                          </div>
                        )}
                        
                        <p className="text-gray-600 mt-4">
                          {document.status === 'draft' && "Este documento está en borrador."}
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
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}