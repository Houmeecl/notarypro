import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Eye, Search, FileCheck, FileClock } from "lucide-react";
import { Document } from "@shared/schema";
import { Link } from "wouter";

export default function PendingDocuments() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const itemsPerPage = 10;

  const { data: allDocuments, isLoading, error } = useQuery<Document[]>({
    queryKey: ["/api/certifier/documents"],
  });

  // Filter documents by search term and status
  const filteredDocuments = allDocuments?.filter(doc => {
    const matchesSearch = searchTerm 
      ? doc.title.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    const matchesStatus = statusFilter 
      ? doc.status === statusFilter 
      : true;
    
    return matchesSearch && matchesStatus;
  }) || [];
  
  // Paginate documents
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format date
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 border-yellow-200 text-yellow-800">Pendiente</Badge>;
      case "validated":
        return <Badge variant="outline" className="bg-green-100 border-green-200 text-green-800">Validado</Badge>;
      case "signed":
        return <Badge variant="outline" className="bg-blue-100 border-blue-200 text-blue-800">Firmado</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 border-red-200 text-red-800">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileClock className="h-5 w-5" />
          Documentos Pendientes de Validación
        </CardTitle>
        <CardDescription>
          Revisa y valida la identidad de los usuarios para documentos con firma electrónica avanzada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por título..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
          </div>
          <Select 
            value={statusFilter || ""} 
            onValueChange={(value) => {
              setStatusFilter(value || null);
              setCurrentPage(1); // Reset to first page on filter change
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="validated">Validados</SelectItem>
              <SelectItem value="rejected">Rechazados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            <p className="mt-2 text-gray-500">Cargando documentos...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-10">
            <FileCheck className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-500">Error al cargar los documentos</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredDocuments.length === 0 && (
          <div className="text-center py-10 border rounded-lg">
            <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 mb-1">No hay documentos pendientes</p>
            <p className="text-sm text-gray-400">Todos los documentos han sido procesados</p>
          </div>
        )}

        {/* Documents table */}
        {!isLoading && !error && filteredDocuments.length > 0 && (
          <>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDocuments.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell className="font-medium">{document.title}</TableCell>
                      <TableCell>{formatDate(document.createdAt)}</TableCell>
                      <TableCell>{getStatusBadge(document.status)}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/validator/${document.id}`}>
                          <Button size="sm" variant="outline" className="ml-2">
                            <Eye className="h-4 w-4 mr-1" />
                            Validar
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {/* First page */}
                  {currentPage > 2 && (
                    <PaginationItem>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(1);
                        }}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  {/* Ellipsis */}
                  {currentPage > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  {/* Previous page */}
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(currentPage - 1);
                        }}
                      >
                        {currentPage - 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  {/* Current page */}
                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      {currentPage}
                    </PaginationLink>
                  </PaginationItem>
                  
                  {/* Next page */}
                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(currentPage + 1);
                        }}
                      >
                        {currentPage + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  {/* Ellipsis */}
                  {currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  {/* Last page */}
                  {currentPage < totalPages - 1 && (
                    <PaginationItem>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(totalPages);
                        }}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
