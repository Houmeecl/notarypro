import React, { useState } from "react";
import { VecinosAdminLayout } from "@/components/vecinos/VecinosAdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  FilePlus, 
  Download, 
  Search, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader,
  ExternalLink,
  FileText,
  Trash,
  Send,
  ArrowRight,
  Bell
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Datos simulados para el dashboard
const documentData = [
  {
    id: "12345",
    name: "Compraventa casa",
    date: "12/11/2023",
    status: "pending", // pending, in_progress, approved, rejected
    task: "Firmar",
    clientName: "Carolina Martínez",
    clientRut: "15.456.789-8",
  },
  {
    id: "23457",
    name: "Finiquito laboral",
    date: "11/11/2023",
    status: "pending",
    task: "Firmar",
    clientName: "Roberto Sánchez",
    clientRut: "12.345.678-9",
  },
  {
    id: "34567",
    name: "Contrato de arriendo",
    date: "10/11/2023",
    status: "in_progress",
    task: "Revisión",
    clientName: "Javier López",
    clientRut: "18.765.432-1",
  },
  {
    id: "45678",
    name: "Poder notarial",
    date: "08/11/2023",
    status: "approved",
    task: "Completado",
    clientName: "María González",
    clientRut: "9.876.543-2",
  },
  {
    id: "56789",
    name: "Declaración jurada",
    date: "05/11/2023",
    status: "rejected",
    task: "Rechazado",
    clientName: "Pedro Rodríguez",
    clientRut: "14.285.763-K",
  }
];

// Opciones para el filtro de trámites
const documentOptions = [
  { value: "all", label: "Todos los trámites" },
  { value: "compraventa", label: "Compraventa" },
  { value: "finiquito", label: "Finiquito" },
  { value: "arriendo", label: "Contrato de arriendo" },
  { value: "poder", label: "Poder notarial" },
  { value: "declaracion", label: "Declaración jurada" },
];

// Funciones auxiliares para el dashboard
const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge className="bg-amber-500">Pendiente</Badge>;
    case "in_progress":
      return <Badge className="bg-blue-500">En curso</Badge>;
    case "approved":
      return <Badge className="bg-green-500">Finalizado</Badge>;
    case "rejected":
      return <Badge className="bg-red-500">Rechazado</Badge>;
    default:
      return <Badge className="bg-gray-500">Desconocido</Badge>;
  }
};

// Componente principal
const VecinosExpressDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  // Filtrar documentos según la pestaña seleccionada
  const getFilteredDocuments = () => {
    let filtered = documentData;
    
    // Filtro por estado (tab)
    if (selectedTab === "pending") {
      filtered = filtered.filter(doc => doc.status === "pending");
    } else if (selectedTab === "in_progress") {
      filtered = filtered.filter(doc => doc.status === "in_progress");
    } else if (selectedTab === "approved") {
      filtered = filtered.filter(doc => doc.status === "approved");
    } else if (selectedTab === "rejected") {
      filtered = filtered.filter(doc => doc.status === "rejected");
    }
    
    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        doc => 
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.id.includes(searchTerm) ||
          doc.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.clientRut.includes(searchTerm)
      );
    }
    
    return filtered;
  };

  // Gestionar selección de documentos
  const toggleDocumentSelection = (id: string) => {
    if (selectedDocuments.includes(id)) {
      setSelectedDocuments(selectedDocuments.filter(docId => docId !== id));
    } else {
      setSelectedDocuments([...selectedDocuments, id]);
    }
  };

  // Seleccionar todos los documentos visibles
  const toggleSelectAll = () => {
    const visibleDocIds = getFilteredDocuments().map(doc => doc.id);
    if (selectedDocuments.length === visibleDocIds.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(visibleDocIds);
    }
  };

  return (
    <VecinosAdminLayout title="Dashboard Exprés">
      <div className="space-y-6">
        {/* Sección de bienvenida */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-none">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-amber-900">Hola, Vecino Express</h2>
                <p className="text-amber-800">Comienza a gestionar tus documentos con Vecinos Xpress</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" className="bg-white">
                  <Bell className="h-4 w-4 mr-2" />
                  Notificaciones
                </Button>
                <Button>
                  <FilePlus className="h-4 w-4 mr-2" />
                  Nuevo trámite
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección de estadísticas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Operaciones del mes</CardTitle>
            <CardDescription>
              Del 1 al {new Date().getDate()} de {new Date().toLocaleString('default', { month: 'long' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4 text-center">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-amber-600">5</span>
                <span className="text-sm text-gray-500">Trámites creados</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-blue-600">3</span>
                <span className="text-sm text-gray-500">Pendientes</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-purple-600">2</span>
                <span className="text-sm text-gray-500">En curso</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-red-600">1</span>
                <span className="text-sm text-gray-500">Rechazados</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-green-600">1</span>
                <span className="text-sm text-gray-500">Finalizados</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección de documentos */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-medium">Documentos</CardTitle>
              <Button variant="outline" className="h-8">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {/* Filtros */}
            <div className="px-6 pb-4 flex justify-between items-center">
              <div className="flex space-x-4 items-center">
                <div className="relative w-72">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Buscar por nombre, RUT o ID..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Input
                    type="date"
                    className="w-44"
                  />
                </div>
              </div>
              
              {selectedDocuments.length > 0 && (
                <div className="relative">
                  <Popover open={isActionsOpen} onOpenChange={setIsActionsOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        Acciones masivas ({selectedDocuments.length})
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-0">
                      <div className="px-1 py-1">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-left font-normal px-2 py-1.5 h-auto"
                          onClick={() => setIsActionsOpen(false)}
                        >
                          <Send className="mr-2 h-4 w-4 text-amber-500" />
                          <span>Enviar a notaría ({selectedDocuments.length})</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-left font-normal px-2 py-1.5 h-auto"
                          onClick={() => setIsActionsOpen(false)}
                        >
                          <Trash className="mr-2 h-4 w-4 text-red-500" />
                          <span>Anular ({selectedDocuments.length})</span>
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
            
            {/* Pestañas */}
            <Tabs 
              defaultValue="all" 
              value={selectedTab}
              onValueChange={setSelectedTab}
              className="w-full"
            >
              <div className="border-b px-6">
                <TabsList className="bg-transparent -mb-px">
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
                    value="in_progress" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:shadow-none rounded-none"
                  >
                    En curso
                  </TabsTrigger>
                  <TabsTrigger 
                    value="approved" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:shadow-none rounded-none"
                  >
                    Finalizados
                  </TabsTrigger>
                  <TabsTrigger 
                    value="rejected" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:shadow-none rounded-none"
                  >
                    Rechazados
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Contenido de pestañas */}
              <TabsContent value={selectedTab} className="pt-0 px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30px]">
                        <Checkbox 
                          checked={
                            getFilteredDocuments().length > 0 && 
                            getFilteredDocuments().every(doc => selectedDocuments.includes(doc.id))
                          } 
                          onCheckedChange={toggleSelectAll}
                          aria-label="Seleccionar todos"
                        />
                      </TableHead>
                      <TableHead className="w-[100px]">ID trámite</TableHead>
                      <TableHead>Nombre del trámite</TableHead>
                      <TableHead>Fecha creación</TableHead>
                      <TableHead>Tarea</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Estado trámite</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredDocuments().map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedDocuments.includes(doc.id)} 
                            onCheckedChange={() => toggleDocumentSelection(doc.id)}
                            aria-label={`Seleccionar documento ${doc.id}`}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">{doc.id}</TableCell>
                        <TableCell>{doc.name}</TableCell>
                        <TableCell>{doc.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {doc.status === "pending" && (
                              <FileText size={16} className="text-amber-500" />
                            )}
                            {doc.status === "in_progress" && (
                              <Loader size={16} className="text-blue-500" />
                            )}
                            {doc.status === "approved" && (
                              <CheckCircle size={16} className="text-green-500" />
                            )}
                            {doc.status === "rejected" && (
                              <XCircle size={16} className="text-red-500" />
                            )}
                            <span>{doc.task}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{doc.clientName}</div>
                            <div className="text-sm text-gray-500">{doc.clientRut}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <ExternalLink size={16} className="mr-1" />
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {getFilteredDocuments().length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No se encontraron documentos
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Sección de evidencias */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Evidencias</CardTitle>
            <CardDescription>
              Documentos requeridos para los trámites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="font-medium">Cédula identidad anverso</div>
                  <div className="text-sm text-gray-500">Sube una imagen clara del anverso de tu cédula</div>
                </div>
                <Button variant="ghost" className="ml-auto">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="font-medium">Cédula identidad reverso</div>
                  <div className="text-sm text-gray-500">Sube una imagen clara del reverso de tu cédula</div>
                </div>
                <Button variant="ghost" className="ml-auto">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="font-medium">Documentación adicional</div>
                  <div className="text-sm text-gray-500">Otros documentos necesarios para el trámite</div>
                </div>
                <Button variant="ghost" className="ml-auto">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VecinosAdminLayout>
  );
};

export default VecinosExpressDashboard;