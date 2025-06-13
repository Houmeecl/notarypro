import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Search, 
  ArrowUpDown,
  Download,
  Eye,
  Filter,
  User,
  Calendar,
  AlarmClock,
  ShieldCheck,
  BookOpen,
  Stamp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import CertifierLayout from "@/components/certifier/CertifierLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VecinosIllustrations from "@/components/vecinos/VecinosIllustrations";

// Tipos de estado de documentos con sus colores
const documentStatusMap: Record<string, { label: string, color: string }> = {
  "pending": { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  "approved": { label: "Aprobado", color: "bg-green-100 text-green-800" },
  "rejected": { label: "Rechazado", color: "bg-red-100 text-red-800" },
  "in_review": { label: "En revisión", color: "bg-blue-100 text-blue-800" }
};

export default function CertificationDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Verificar si el usuario viene de realizar un pago exitoso
  const [showRegisteredMessage, setShowRegisteredMessage] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  // Consulta para obtener los documentos pendientes de certificación
  const { data: pendingDocuments, isLoading } = useQuery({
    queryKey: ['/api/documents/pending-certification'],
    queryFn: () => fetch('/api/documents/pending-certification').then(res => res.json())
  });

  // Mutación para aprobar un documento
  const approveDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await apiRequest("POST", `/api/documents/${documentId}/approve`, {});
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Documento aprobado",
        description: "El documento ha sido certificado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents/pending-certification'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo certificar el documento.",
        variant: "destructive",
      });
    }
  });

  // Mutación para rechazar un documento
  const rejectDocumentMutation = useMutation({
    mutationFn: async ({ documentId, reason }: { documentId: string, reason: string }) => {
      const response = await apiRequest("POST", `/api/documents/${documentId}/reject`, { reason });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Documento rechazado",
        description: "El documento ha sido rechazado correctamente.",
      });
      setRejectReason("");
      setShowRejectDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/documents/pending-certification'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo rechazar el documento.",
        variant: "destructive",
      });
    }
  });

  // Verificar parámetros de URL al cargar el componente
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const registered = searchParams.get('registered');
    const email = searchParams.get('email');
    
    if (registered === 'true') {
      setShowRegisteredMessage(true);
      if (email) {
        setRegisteredEmail(email);
      }
      
      // Mostrar notificación de bienvenida
      toast({
        title: "¡Bienvenido al Panel de Certificador!",
        description: "Su pago ha sido procesado correctamente. Ya puede comenzar a certificar documentos.",
        variant: "default",
      });
      
      // Limpiar la URL para que al refrescar no muestre el mensaje de nuevo
      window.history.replaceState({}, document.title, "/certification-dashboard");
    }
  }, [toast]);
  
  // Si hay datos simulados, úsalos para pruebas en desarrollo
  const documents = pendingDocuments || [];

  // Filtrar documentos según los criterios
  const filteredDocuments = documents.filter((doc: any) => {
    const matchesSearch = 
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      doc.client?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDocuments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);

  // Manejador para aprobar documento
  const handleApproveDocument = (documentId: string) => {
    approveDocumentMutation.mutate(documentId);
  };

  // Manejador para rechazar documento
  const handleRejectDocument = (documentId: string) => {
    if (rejectReason.trim() === "") {
      toast({
        title: "Error",
        description: "Debe proporcionar un motivo para rechazar el documento.",
        variant: "destructive",
      });
      return;
    }
    
    rejectDocumentMutation.mutate({ documentId, reason: rejectReason });
  };

  // Manejador para mostrar el diálogo de rechazo
  const showRejectDialogFor = (document: any) => {
    setSelectedDocument(document);
    setRejectReason("");
    setShowRejectDialog(true);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r bg-white">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">NotaryPro</h2>
          <p className="text-sm text-gray-500">Panel de Certificación</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button 
            className="w-full flex items-center px-4 py-3 bg-gray-100 rounded-md text-gray-900 font-medium"
            onClick={() => setLocation("/certification-dashboard")}
          >
            <FileText className="mr-3 h-5 w-5" />
            Documentos
          </button>
          
          <button 
            className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-md"
            onClick={() => setLocation("/certification-calendar")}
          >
            <Calendar className="mr-3 h-5 w-5" />
            Calendario
          </button>
          
          <button 
            className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-md"
            onClick={() => setLocation("/certification-clients")}
          >
            <User className="mr-3 h-5 w-5" />
            Clientes
          </button>
          
          <button 
            className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-md"
            onClick={() => setLocation("/certification-reports")}
          >
            <FileText className="mr-3 h-5 w-5" />
            Reportes
          </button>
        </nav>
        
        <div className="p-4 border-t">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">{user?.fullName}</p>
              <p className="text-xs text-gray-500">Certificador</p>
            </div>
          </div>
          
          <button 
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
            onClick={() => setLocation("/logout")}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 bg-white border-b flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Certificación de Documentos</h1>
            <p className="text-sm text-gray-500">Gestione y verifique documentos pendientes</p>
          </div>
          
          <div className="flex space-x-2">
            <div className="relative">
              <Input
                placeholder="Buscar documento..."
                className="w-72 pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            
            <Select 
              value={filterStatus} 
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="in_review">En revisión</SelectItem>
                <SelectItem value="approved">Aprobados</SelectItem>
                <SelectItem value="rejected">Rechazados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          {/* Mensaje de bienvenida después del pago */}
          {showRegisteredMessage && (
            <div className="mb-6 p-4 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    ¡Bienvenido al Panel de Certificador!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Su pago ha sido procesado correctamente y ahora tiene acceso completo a las funcionalidades de certificación.
                      {registeredEmail && (
                        <span> Se ha registrado con el correo: <strong>{registeredEmail}</strong>.</span>
                      )}
                    </p>
                  </div>
                  <div className="mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-700 bg-green-100 hover:bg-green-200 border-green-300"
                      onClick={() => setShowRegisteredMessage(false)}
                    >
                      Entendido
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="max-w-full mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300"></div>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 text-center">
                <div className="rounded-full bg-gray-100 p-3 mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No hay documentos disponibles</h3>
                <p className="text-gray-500 max-w-md">
                  No se encontraron documentos que coincidan con tus criterios de búsqueda. Intenta cambiar los filtros o vuelve más tarde.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-[50px]">ID</TableHead>
                        <TableHead>Documento</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentItems.map((doc: any) => (
                        <TableRow key={doc.id} className="hover:bg-gray-50">
                          <TableCell className="font-mono text-xs text-gray-500">{doc.id}</TableCell>
                          <TableCell className="font-medium">{doc.title}</TableCell>
                          <TableCell>{doc.client}</TableCell>
                          <TableCell>
                            <span className="flex items-center">
                              <Clock className="mr-1 h-3 w-3 text-gray-400" />
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={documentStatusMap[doc.status]?.color || "bg-gray-100 text-gray-800"}>
                              {documentStatusMap[doc.status]?.label || doc.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setLocation(`/documents/${doc.id}`)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Aprobar
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar aprobación</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      ¿Estás seguro de que deseas aprobar este documento? Esta acción certificará el documento y no se puede deshacer.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleApproveDocument(doc.id)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Aprobar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => showRejectDialogFor(doc)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rechazar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
                    <div className="flex-1 flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            className="min-w-[40px]"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Upcoming sessions card */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlarmClock className="mr-2 h-5 w-5 text-primary" />
                  Próximas Sesiones
                </CardTitle>
                <CardDescription>
                  Sesiones programadas para hoy
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <div className="space-y-3">
                  <div className="px-6 py-2 border-l-4 border-blue-500 bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">Juan Pérez</p>
                        <p className="text-xs text-gray-500">Contrato de Arriendo</p>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3 text-gray-400" />
                        <span className="text-sm">15:30</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 py-2 border-l-4 border-green-500 bg-green-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">María González</p>
                        <p className="text-xs text-gray-500">Poder Simple</p>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3 text-gray-400" />
                        <span className="text-sm">16:45</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 py-2 border-l-4 border-purple-500 bg-purple-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">Carlos Ruiz</p>
                        <p className="text-xs text-gray-500">Declaración Jurada</p>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3 text-gray-400" />
                        <span className="text-sm">17:30</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" onClick={() => setLocation("/certification-calendar")}>
                  Ver todas las sesiones
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  Documentos Recientes
                </CardTitle>
                <CardDescription>
                  Certificados en las últimas 24 horas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-green-100 p-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Contrato de Compraventa</p>
                      <p className="text-xs text-gray-500">Ana Martínez - Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-green-100 p-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Declaración Jurada</p>
                      <p className="text-xs text-gray-500">Pedro Gómez - Hace 3 horas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-green-100 p-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Mandato Judicial</p>
                      <p className="text-xs text-gray-500">Laura Torres - Hace 5 horas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" onClick={() => setLocation("/certification-history")}>
                  Ver historial completo
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-primary" />
                  Resumen de Actividad
                </CardTitle>
                <CardDescription>
                  Últimos 7 días
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Documentos certificados</span>
                    <span className="font-semibold">24</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "85%" }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-600">Documentos rechazados</span>
                    <span className="font-semibold">3</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: "15%" }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-600">Sesiones realizadas</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" onClick={() => setLocation("/certification-stats")}>
                  Ver estadísticas completas
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
      
      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Documento</DialogTitle>
            <DialogDescription>
              Por favor, proporciona un motivo para rechazar este documento. Esta información será visible para el usuario.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Escribe el motivo del rechazo aquí..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedDocument && handleRejectDocument(selectedDocument.id)}
              disabled={rejectReason.trim() === ""}
            >
              Rechazar Documento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}