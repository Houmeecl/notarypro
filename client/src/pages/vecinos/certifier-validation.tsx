import React, { useState } from "react";
import { VecinosAdminLayout } from "@/components/vecinos/VecinosAdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Search, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar, 
  Eye, 
  ThumbsUp, 
  ThumbsDown,
  Download 
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

// Datos de ejemplo para la demostración
const documentsData = [
  {
    id: "DOC-001-2025",
    title: "Contrato de Arriendo",
    status: "pending", // pending, in_review, approved, rejected
    submittedBy: "Minimarket El Sol",
    clientName: "Juan Pérez González",
    clientRut: "12.345.678-9",
    date: "2025-05-01",
    notes: "",
    hasNfc: true,
    partner: {
      name: "Minimarket El Sol",
      id: 1,
      location: "Santiago, RM"
    }
  },
  {
    id: "DOC-002-2025",
    title: "Declaración Jurada",
    status: "pending",
    submittedBy: "Farmacia Vida",
    clientName: "María López Silva",
    clientRut: "11.222.333-4",
    date: "2025-05-01",
    notes: "",
    hasNfc: true,
    partner: {
      name: "Farmacia Vida",
      id: 2,
      location: "Las Condes, RM"
    }
  },
  {
    id: "DOC-003-2025",
    title: "Poder Notarial Simple",
    status: "in_review",
    submittedBy: "Minimarket El Sol",
    clientName: "Carlos Rodríguez Muñoz",
    clientRut: "9.876.543-2",
    date: "2025-04-30",
    notes: "El cliente solicita urgencia en la validación",
    hasNfc: true,
    partner: {
      name: "Minimarket El Sol",
      id: 1,
      location: "Santiago, RM"
    }
  },
  {
    id: "DOC-004-2025",
    title: "Finiquito Laboral",
    status: "approved",
    submittedBy: "Librería Central",
    clientName: "Ana Martínez Pérez",
    clientRut: "14.789.632-5",
    date: "2025-04-29",
    notes: "Documentación completa y verificada",
    hasNfc: true,
    partner: {
      name: "Librería Central",
      id: 3,
      location: "Providencia, RM"
    }
  },
  {
    id: "DOC-005-2025",
    title: "Mandato",
    status: "rejected",
    submittedBy: "Farmacia Vida",
    clientName: "Pedro Sánchez Rojas",
    clientRut: "16.987.456-2",
    date: "2025-04-28",
    notes: "Documentación incompleta, falta firma del mandante",
    hasNfc: false,
    partner: {
      name: "Farmacia Vida",
      id: 2,
      location: "Las Condes, RM"
    }
  },
];

// Componente principal
const VecinosCertifierValidation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();

  // Filtrar documentos según pestaña y búsqueda
  const getFilteredDocuments = () => {
    let filtered = documentsData;
    
    // Filtrar por estado
    if (activeTab !== "all") {
      filtered = filtered.filter(doc => doc.status === activeTab);
    }
    
    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        doc => 
          doc.title.toLowerCase().includes(term) ||
          doc.id.toLowerCase().includes(term) ||
          doc.clientName.toLowerCase().includes(term) ||
          doc.clientRut.toLowerCase().includes(term) ||
          doc.submittedBy.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  };

  // Manejar selección de documentos
  const toggleDocumentSelection = (id: string) => {
    if (selectedDocuments.includes(id)) {
      setSelectedDocuments(selectedDocuments.filter(docId => docId !== id));
    } else {
      setSelectedDocuments([...selectedDocuments, id]);
    }
  };

  // Seleccionar/deseleccionar todos los documentos
  const toggleSelectAll = () => {
    const visibleDocIds = getFilteredDocuments().map(doc => doc.id);
    if (selectedDocuments.length === visibleDocIds.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(visibleDocIds);
    }
  };

  // Manejar aprobación de documento
  const handleApproveDocument = () => {
    if (!selectedDocument) return;
    
    // Aquí iría la lógica real para aprobar el documento
    toast({
      title: "Documento aprobado",
      description: `El documento ${selectedDocument.id} ha sido aprobado y enviado al cliente.`,
      variant: "default",
    });
    
    setIsApprovalOpen(false);
    setApprovalNotes("");
  };

  // Manejar rechazo de documento
  const handleRejectDocument = () => {
    if (!selectedDocument) return;
    
    // Aquí iría la lógica real para rechazar el documento
    toast({
      title: "Documento rechazado",
      description: `El documento ${selectedDocument.id} ha sido rechazado. Se ha notificado al socio.`,
      variant: "destructive",
    });
    
    setIsApprovalOpen(false);
    setRejectionReason("");
  };

  // Ver detalles de un documento
  const handleViewDetails = (doc: any) => {
    setSelectedDocument(doc);
    setIsDetailsOpen(true);
  };

  // Abrir diálogo de aprobación/rechazo
  const handleOpenApproval = (doc: any) => {
    setSelectedDocument(doc);
    setIsApprovalOpen(true);
  };

  // Obtener color de badge para el estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-500">Pendiente</Badge>;
      case "in_review":
        return <Badge className="bg-blue-500">En revisión</Badge>;
      case "approved":
        return <Badge className="bg-green-500">Aprobado</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rechazado</Badge>;
      default:
        return <Badge className="bg-gray-500">Desconocido</Badge>;
    }
  };

  return (
    <VecinosAdminLayout title="Certificación de Documentos">
      <div className="space-y-6">
        {/* Resumen de certificaciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-1">
                <span className="text-3xl font-bold text-amber-600">
                  {documentsData.filter(doc => doc.status === "pending").length}
                </span>
                <span className="text-sm text-gray-500">Pendientes</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-1">
                <span className="text-3xl font-bold text-blue-600">
                  {documentsData.filter(doc => doc.status === "in_review").length}
                </span>
                <span className="text-sm text-gray-500">En revisión</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-1">
                <span className="text-3xl font-bold text-green-600">
                  {documentsData.filter(doc => doc.status === "approved").length}
                </span>
                <span className="text-sm text-gray-500">Aprobados</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-1">
                <span className="text-3xl font-bold text-red-600">
                  {documentsData.filter(doc => doc.status === "rejected").length}
                </span>
                <span className="text-sm text-gray-500">Rechazados</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabla de documentos */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <CardTitle>Documentos para certificación</CardTitle>
                <CardDescription>
                  Revise y valide los documentos enviados por los socios
                </CardDescription>
              </div>
              
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Buscar documento..."
                    className="pl-9 w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <Tabs 
              defaultValue="all" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="border-b">
                <TabsList className="bg-transparent -mb-px mx-6">
                  <TabsTrigger 
                    value="all" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:shadow-none rounded-none"
                  >
                    Todos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pending" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:shadow-none rounded-none"
                  >
                    Pendientes
                  </TabsTrigger>
                  <TabsTrigger 
                    value="in_review" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:shadow-none rounded-none"
                  >
                    En revisión
                  </TabsTrigger>
                  <TabsTrigger 
                    value="approved" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:shadow-none rounded-none"
                  >
                    Aprobados
                  </TabsTrigger>
                  <TabsTrigger 
                    value="rejected" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:shadow-none rounded-none"
                  >
                    Rechazados
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value={activeTab} className="pt-0 pb-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox 
                            checked={
                              getFilteredDocuments().length > 0 && 
                              getFilteredDocuments().every(doc => 
                                selectedDocuments.includes(doc.id)
                              )
                            } 
                            onCheckedChange={toggleSelectAll}
                            aria-label="Seleccionar todos"
                          />
                        </TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Documento</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Socio</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredDocuments().map(doc => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedDocuments.includes(doc.id)} 
                              onCheckedChange={() => toggleDocumentSelection(doc.id)}
                              aria-label={`Seleccionar documento ${doc.id}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium text-sm">{doc.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span>{doc.title}</span>
                              {doc.hasNfc && (
                                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">NFC</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{doc.clientName}</div>
                              <div className="text-xs text-gray-500">{doc.clientRut}</div>
                            </div>
                          </TableCell>
                          <TableCell>{doc.submittedBy}</TableCell>
                          <TableCell className="text-sm">
                            {new Date(doc.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(doc.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleViewDetails(doc)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              {doc.status === "pending" && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleOpenApproval(doc)}
                                >
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {getFilteredDocuments().length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="h-32 text-center">
                            No se encontraron documentos
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="border-t bg-gray-50 p-3 px-6">
            <div className="flex justify-between items-center w-full">
              <div className="text-sm text-gray-500">
                {selectedDocuments.length} documento(s) seleccionado(s)
              </div>
              
              <div className="flex space-x-2">
                {selectedDocuments.length > 0 && (
                  <>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar seleccionados
                    </Button>
                    
                    {activeTab === "pending" && (
                      <Button size="sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Revisar seleccionados
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Modal de detalles del documento */}
      {selectedDocument && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalle del documento</DialogTitle>
              <DialogDescription>
                {selectedDocument.id} - {selectedDocument.title}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-4 flex items-center justify-center h-64">
                    <FileText className="h-16 w-16 text-gray-400" />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar documento
                  </Button>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-gray-500">Información del documento</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Estado:</span>
                      <span>{getStatusBadge(selectedDocument.status)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Tipo:</span>
                      <span className="text-sm">{selectedDocument.title}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Fecha:</span>
                      <span className="text-sm">
                        {new Date(selectedDocument.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">ID:</span>
                      <span className="text-sm">{selectedDocument.id}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-gray-500">Cliente</h3>
                  
                  <div className="flex items-center space-x-3">
                    <User className="h-8 w-8 text-gray-400 bg-gray-100 p-1.5 rounded-full" />
                    <div>
                      <p className="font-medium">{selectedDocument.clientName}</p>
                      <p className="text-xs text-gray-500">{selectedDocument.clientRut}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-gray-500">Socio</h3>
                  
                  <div className="space-y-1">
                    <p className="font-medium">{selectedDocument.submittedBy}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        {new Date(selectedDocument.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <FileText className="h-3 w-3 mr-1" />
                      <span>ID: {selectedDocument.id}</span>
                    </div>
                  </div>
                </div>
                
                {selectedDocument.notes && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-gray-500">Notas</h3>
                    <p className="text-sm p-3 bg-gray-50 rounded-md">
                      {selectedDocument.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter className="gap-2 flex-wrap">
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Cerrar
              </Button>
              
              {selectedDocument.status === "pending" && (
                <>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      setIsDetailsOpen(false);
                      setSelectedDocument(selectedDocument);
                      setIsApprovalOpen(true);
                    }}
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsDetailsOpen(false);
                      setSelectedDocument(selectedDocument);
                      setIsApprovalOpen(true);
                    }}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Aprobar
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Modal de aprobación/rechazo */}
      {selectedDocument && (
        <Dialog open={isApprovalOpen} onOpenChange={setIsApprovalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Validación de documento</DialogTitle>
              <DialogDescription>
                {selectedDocument.id} - {selectedDocument.title}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex justify-center space-x-6">
                <div className="flex flex-col items-center space-y-2">
                  <button 
                    className="p-3 rounded-full hover:bg-red-50 transition-colors"
                    onClick={() => document.getElementById("rejection-notes")?.focus()}
                  >
                    <ThumbsDown className="h-12 w-12 text-red-500" />
                  </button>
                  <span className="text-sm">Rechazar</span>
                </div>
                
                <div className="flex flex-col items-center space-y-2">
                  <button 
                    className="p-3 rounded-full hover:bg-green-50 transition-colors"
                    onClick={() => document.getElementById("approval-notes")?.focus()}
                  >
                    <ThumbsUp className="h-12 w-12 text-green-500" />
                  </button>
                  <span className="text-sm">Aprobar</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Notas de aprobación</label>
                <textarea
                  id="approval-notes"
                  className="w-full p-2 border rounded-md min-h-[100px]"
                  placeholder="Ingrese notas adicionales para la aprobación..."
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Motivo de rechazo</label>
                <textarea
                  id="rejection-notes"
                  className="w-full p-2 border rounded-md min-h-[100px]"
                  placeholder="Ingrese el motivo del rechazo..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setIsApprovalOpen(false)}>
                Cancelar
              </Button>
              
              <div className="space-x-2">
                <Button 
                  variant="destructive"
                  onClick={handleRejectDocument}
                  disabled={!rejectionReason.trim()}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rechazar documento
                </Button>
                
                <Button 
                  onClick={handleApproveDocument}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprobar documento
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
    </VecinosAdminLayout>
  );
};

export default VecinosCertifierValidation;