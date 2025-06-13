import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertCircle,
  ArrowUpDown,
  Calendar,
  CheckCircle,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Filter,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Trash2,
  XCircle
} from "lucide-react";

// Tipos para los documentos
interface Document {
  id: number;
  title: string;
  fileName: string;
  status: "pendiente" | "firmado" | "certificado" | "anulado";
  createdAt: string;
  updatedAt: string;
  userId: number;
  userName: string;
  userEmail: string;
  certifierId?: number;
  certifierName?: string;
  verificationCode?: string;
  documentType: string;
  fileSize: number;
  expiresAt?: string;
}

const AdminDocuments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  // Consulta para obtener documentos
  const { data: documents, isLoading, error } = useQuery({
    queryKey: ["/api/admin/documents", statusFilter, dateFilter, typeFilter],
    queryFn: async () => {
      let url = `/api/admin/documents?`;
      if (statusFilter !== "all") url += `status=${statusFilter}&`;
      if (dateFilter) url += `date=${dateFilter}&`;
      if (typeFilter) url += `type=${typeFilter}&`;
      
      const response = await apiRequest("GET", url);
      if (!response.ok) {
        throw new Error("Error al obtener los documentos");
      }
      return await response.json();
    },
  });

  // Función para cambiar el ordenamiento
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Función para filtrar documentos según criterios
  const filteredDocuments = documents
    ? documents.filter((doc: Document) => {
        // Filtrar por búsqueda
        if (searchQuery && !doc.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !doc.userName.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !doc.verificationCode?.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        return true;
      })
    : [];

  // Función para ordenar documentos
  const sortedDocuments = [...filteredDocuments].sort((a: Document, b: Document) => {
    let aValue: any = a[sortColumn as keyof Document];
    let bValue: any = b[sortColumn as keyof Document];
    
    // Asegurarse de que podemos comparar fechas
    if (sortColumn === "createdAt" || sortColumn === "updatedAt" || sortColumn === "expiresAt") {
      aValue = new Date(aValue || 0).getTime();
      bValue = new Date(bValue || 0).getTime();
    }
    
    // Comparar valores
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Función para formatear fecha
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return format(date, "d MMM yyyy, HH:mm", { locale: es });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Función para formatear tamaño de archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Función para manejar acciones sobre documentos
  const handleDocAction = async (action: string, doc: Document) => {
    try {
      let response;
      
      switch (action) {
        case "view":
          // Redireccionar a vista de documento
          window.open(`/document-view/${doc.id}`, "_blank");
          break;
          
        case "download":
          // Descargar documento
          response = await apiRequest("GET", `/api/admin/documents/${doc.id}/download`);
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = doc.fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            toast({
              title: "Documento descargado",
              description: "El documento se ha descargado correctamente",
            });
          } else {
            throw new Error("Error al descargar el documento");
          }
          break;
          
        case "resend":
          // Reenviar documento
          response = await apiRequest("POST", `/api/admin/documents/${doc.id}/resend`);
          if (response.ok) {
            toast({
              title: "Documento reenviado",
              description: `Documento reenviado a ${doc.userEmail}`,
            });
          } else {
            throw new Error("Error al reenviar el documento");
          }
          break;
          
        case "delete":
          setSelectedDoc(doc);
          setShowDeleteDialog(true);
          break;
          
        case "showQr":
          setSelectedDoc(doc);
          setShowQrDialog(true);
          break;
          
        default:
          break;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al procesar el documento",
        variant: "destructive",
      });
    }
  };

  // Función para confirmar eliminación
  const confirmDelete = async () => {
    if (!selectedDoc) return;
    
    try {
      const response = await apiRequest("DELETE", `/api/admin/documents/${selectedDoc.id}`);
      if (response.ok) {
        toast({
          title: "Documento eliminado",
          description: "El documento ha sido eliminado correctamente",
        });
        
        // Actualizar la lista de documentos
        queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
        setShowDeleteDialog(false);
      } else {
        throw new Error("Error al eliminar el documento");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al eliminar el documento",
        variant: "destructive",
      });
    }
  };

  // Función para obtener el color del estado del documento
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "firmado":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "certificado":
        return "bg-green-100 text-green-800 border-green-200";
      case "anulado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Función para obtener el ícono del estado del documento
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendiente":
        return <AlertCircle className="h-3 w-3" />;
      case "firmado":
        return <CheckCircle className="h-3 w-3" />;
      case "certificado":
        return <CheckCircle className="h-3 w-3" />;
      case "anulado":
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error al cargar los documentos</h2>
          <p className="text-gray-600 mb-4">
            No se pudieron cargar los documentos. Por favor, intente nuevamente.
          </p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Documentos</h1>
          <p className="text-gray-500 mt-1">
            Administre todos los documentos del sistema
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros Avanzados
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Documento
          </Button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar:</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Título, usuario o código..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Estado:</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="firmado">Firmado</SelectItem>
                  <SelectItem value="certificado">Certificado</SelectItem>
                  <SelectItem value="anulado">Anulado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Fecha:</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger id="date">
                  <SelectValue placeholder="Todas las fechas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las fechas</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="yesterday">Ayer</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                  <SelectItem value="year">Este año</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de documento:</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los tipos</SelectItem>
                  <SelectItem value="contract">Contrato</SelectItem>
                  <SelectItem value="legal">Documento legal</SelectItem>
                  <SelectItem value="financial">Documento financiero</SelectItem>
                  <SelectItem value="corporate">Documento corporativo</SelectItem>
                  <SelectItem value="personal">Documento personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            Documentos
          </CardTitle>
          <CardDescription>
            {filteredDocuments.length} documentos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => handleSort("title")} className="cursor-pointer w-1/4">
                    <div className="flex items-center">
                      Título
                      {sortColumn === "title" && (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort("userName")} className="cursor-pointer">
                    <div className="flex items-center">
                      Usuario
                      {sortColumn === "userName" && (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort("status")} className="cursor-pointer">
                    <div className="flex items-center">
                      Estado
                      {sortColumn === "status" && (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort("documentType")} className="cursor-pointer">
                    <div className="flex items-center">
                      Tipo
                      {sortColumn === "documentType" && (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort("createdAt")} className="cursor-pointer">
                    <div className="flex items-center">
                      Fecha Creación
                      {sortColumn === "createdAt" && (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDocuments.length > 0 ? (
                  sortedDocuments.map((doc: Document) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.title}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{doc.userName}</span>
                          <span className="text-gray-500 text-xs">{doc.userEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getStatusColor(doc.status)} flex w-fit items-center gap-1`}>
                          {getStatusIcon(doc.status)}
                          <span className="capitalize">{doc.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{doc.documentType}</span>
                      </TableCell>
                      <TableCell>{formatDate(doc.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDocAction("view", doc)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver documento
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDocAction("download", doc)}>
                              <Download className="h-4 w-4 mr-2" />
                              Descargar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDocAction("showQr", doc)}>
                              <QrCode className="h-4 w-4 mr-2" />
                              Ver código QR
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDocAction("resend", doc)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Reenviar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-amber-600"
                              onClick={() => setSelectedDoc(doc)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDocAction("delete", doc)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-gray-500">No se encontraron documentos con los filtros actuales</p>
                        <Button 
                          variant="link" 
                          onClick={() => {
                            setSearchQuery("");
                            setStatusFilter("all");
                            setDateFilter("");
                            setTypeFilter("");
                          }}
                        >
                          Limpiar filtros
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            Mostrando {sortedDocuments.length} de {documents.length} documentos
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar este documento? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
            <h3 className="font-medium text-red-800">{selectedDoc?.title}</h3>
            <p className="text-sm text-red-600">ID: {selectedDoc?.id}</p>
            <p className="text-sm text-red-600">Usuario: {selectedDoc?.userName}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para mostrar código QR */}
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Código QR de Verificación</DialogTitle>
            <DialogDescription>
              Código QR para el documento: {selectedDoc?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            {selectedDoc?.verificationCode ? (
              <>
                <div className="bg-white p-4 rounded-md border mb-4">
                  <QrCode className="h-40 w-40 mx-auto text-gray-800" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">Código de verificación:</p>
                  <p className="text-lg font-mono bg-gray-100 p-2 rounded-md">{selectedDoc.verificationCode}</p>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-2" />
                <p className="text-amber-800">Este documento no tiene un código de verificación asignado.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowQrDialog(false)}>
              Cerrar
            </Button>
            {selectedDoc?.verificationCode && (
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Descargar QR
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDocuments;