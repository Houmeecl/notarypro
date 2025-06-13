import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileText, 
  Users, 
  Video, 
  ChevronRight, 
  Search, 
  Filter, 
  Download,
  Plus,
  CalendarClock,
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  MessageCircle,
  BookOpen,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import CertifierLayout from "@/components/certifier/CertifierLayout";

const statusColors: Record<string, string> = {
  "pendiente": "text-yellow-500 bg-yellow-100",
  "programada": "text-blue-500 bg-blue-100",
  "completada": "text-green-500 bg-green-100",
  "cancelada": "text-red-500 bg-red-100",
  "enProceso": "text-purple-500 bg-purple-100",
};

export default function CertifierDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todas");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Consulta para obtener las sesiones de certificación
  const { data: certificationSessions, isLoading } = useQuery({
    queryKey: ['/api/certification-sessions'],
  });

  // Consulta para obtener los documentos pendientes
  const { data: pendingDocuments } = useQuery({
    queryKey: ['/api/documents/pending-certification'],
  });

  // Consulta para obtener los clientes disponibles para programar
  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
  });

  // Mutación para aceptar un documento
  const acceptDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await apiRequest("POST", `/api/documents/${documentId}/accept`, {});
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Documento aceptado",
        description: "El documento ha sido aceptado para certificación.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents/pending-certification'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo aceptar el documento.",
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
        description: "El documento ha sido rechazado.",
      });
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

  // Mutación para programar una sesión de certificación
  const scheduleSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      const response = await apiRequest("POST", "/api/certification-sessions/schedule", sessionData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sesión programada",
        description: "La sesión de certificación ha sido programada correctamente.",
      });
      setShowScheduleDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/certification-sessions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo programar la sesión.",
        variant: "destructive",
      });
    }
  });

  // Filtrar sesiones según los criterios
  const filteredSessions = certificationSessions
    ? certificationSessions.filter((session: any) => {
        const matchesSearch = 
          session.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
          session.id.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === "todas" || session.status === filterStatus;
        
        return matchesSearch && matchesStatus;
      })
    : [];

  // Manejador para programar sesión
  const handleScheduleSession = () => {
    if (!selectedClient || !selectedDate || !selectedTime) {
      toast({
        title: "Datos incompletos",
        description: "Por favor complete todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    scheduleSessionMutation.mutate({
      clientId: selectedClient.id,
      scheduledFor: `${selectedDate}T${selectedTime}:00`,
      type: "videoconference"
    });
  };

  // Manejador para rechazar documento con razón
  const handleRejectDocument = (documentId: string) => {
    const reason = prompt("Por favor, ingrese el motivo del rechazo:");
    if (reason) {
      rejectDocumentMutation.mutate({ documentId, reason });
    }
  };

  return (
    <CertifierLayout title="Panel de Certificador">
      <div className="container mx-auto py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg text-gray-800 font-medium">
                <Calendar className="mr-2 h-5 w-5 text-blue-500" />
                Sesiones Hoy
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-3xl font-semibold text-gray-900">
                {certificationSessions?.filter((s: any) => 
                  new Date(s.scheduledFor).toDateString() === new Date().toDateString()
                ).length || 0}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-gray-500">
                <Clock className="inline h-3 w-3 mr-1" />
                Próxima: {certificationSessions?.filter((s: any) => 
                  new Date(s.scheduledFor) > new Date()
                ).sort((a: any, b: any) => 
                  new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
                )[0]?.scheduledTime || "No hay sesiones programadas"}
              </p>
            </CardFooter>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg text-gray-800 font-medium">
                <FileText className="mr-2 h-5 w-5 text-green-500" />
                Documentos Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-3xl font-semibold text-gray-900">
                {pendingDocuments?.length || 0}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-gray-500">
                <CheckCircle className="inline h-3 w-3 mr-1" />
                {pendingDocuments?.filter((d: any) => d.status === "signed").length || 0} documentos firmados pendientes
              </p>
            </CardFooter>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg text-gray-800 font-medium">
                <Users className="mr-2 h-5 w-5 text-purple-500" />
                Clientes Activos
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-3xl font-semibold text-gray-900">
                {clients?.length || 0}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-gray-500">
                <Video className="inline h-3 w-3 mr-1" />
                {certificationSessions?.filter((s: any) => s.status === "completada").length || 0} sesiones completadas este mes
              </p>
            </CardFooter>
          </Card>
        </div>

        <div className="mb-8">
          <Tabs defaultValue="sessions">
            <div className="border-b border-gray-100 mb-6">
              <TabsList className="bg-transparent space-x-6 h-auto p-0">
                <TabsTrigger 
                  value="sessions" 
                  className="text-sm font-normal data-[state=active]:text-red-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-red-600 rounded-none py-3 px-1"
                >
                  Sesiones de Certificación
                </TabsTrigger>
                <TabsTrigger 
                  value="documents" 
                  className="text-sm font-normal data-[state=active]:text-red-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-red-600 rounded-none py-3 px-1"
                >
                  Documentos Pendientes
                </TabsTrigger>
                <TabsTrigger 
                  value="resources" 
                  className="text-sm font-normal data-[state=active]:text-red-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-red-600 rounded-none py-3 px-1"
                >
                  Recursos
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="sessions">
              <div className="bg-white border border-gray-100 rounded-md overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-800">Sesiones de Certificación</h3>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Buscar..." 
                      className="max-w-xs h-9 text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Select 
                      value={filterStatus} 
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="w-[140px] h-9 text-sm">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas</SelectItem>
                        <SelectItem value="pendiente">Pendientes</SelectItem>
                        <SelectItem value="programada">Programadas</SelectItem>
                        <SelectItem value="enProceso">En proceso</SelectItem>
                        <SelectItem value="completada">Completadas</SelectItem>
                        <SelectItem value="cancelada">Canceladas</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-9 text-sm"
                      onClick={() => {
                        setSearchTerm("");
                        setFilterStatus("todas");
                      }}
                    >
                      <Filter className="h-4 w-4 mr-1" />
                      Limpiar
                    </Button>
                    <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="h-9 text-sm bg-red-600 hover:bg-red-700">
                          <Plus className="h-4 w-4 mr-1" />
                          Programar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Programar Sesión de Certificación</DialogTitle>
                          <DialogDescription>
                            Seleccione un cliente y programe una fecha y hora para la sesión.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                          {clients && clients.length > 0 ? (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  Cliente
                                </label>
                                <Select onValueChange={(value) => {
                                  const client = clients.find((c: any) => c.id === value);
                                  setSelectedClient(client);
                                }}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un cliente" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {clients.map((client: any) => (
                                      <SelectItem key={client.id} value={client.id}>
                                        {client.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">
                                    Fecha
                                  </label>
                                  <Input 
                                    type="date" 
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">
                                    Hora
                                  </label>
                                  <Input 
                                    type="time" 
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p>No hay clientes disponibles.</p>
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setShowScheduleDialog(false)}
                          >
                            Cancelar
                          </Button>
                          <Button className="bg-red-600 hover:bg-red-700" onClick={handleScheduleSession}>
                            Programar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin h-8 w-8 border-4 border-t-red-600 border-red-600/30 rounded-full" />
                    </div>
                  ) : filteredSessions.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-gray-500 text-sm">No hay sesiones que coincidan con los criterios de búsqueda.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">ID</TableHead>
                          <TableHead className="text-xs">Cliente</TableHead>
                          <TableHead className="text-xs">Fecha y Hora</TableHead>
                          <TableHead className="text-xs">Estado</TableHead>
                          <TableHead className="text-xs">Tipo</TableHead>
                          <TableHead className="text-xs text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSessions.map((session: any) => (
                          <TableRow key={session.id} className="text-sm">
                            <TableCell className="font-medium">{session.id}</TableCell>
                            <TableCell>{session.client}</TableCell>
                            <TableCell>{session.scheduledTime}</TableCell>
                            <TableCell>
                              <Badge className={`${statusColors[session.status] || ""} font-normal text-xs px-2 py-0.5`}>
                                {session.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{session.type}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" 
                                onClick={() => setLocation(`/certification-session/${session.id}`)}
                                className="h-8 font-normal text-gray-700 hover:text-gray-900"
                              >
                                <span>Ver detalles</span>
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="documents">
              <div className="bg-white border border-gray-100 rounded-md shadow-sm">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-lg font-medium text-gray-800">Documentos Pendientes de Certificación</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Documentos que requieren su revisión y certificación
                  </p>
                </div>
                <div className="p-4">
                  {pendingDocuments?.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-gray-500 text-sm">No hay documentos pendientes de certificación.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingDocuments?.map((doc: any) => (
                        <div key={doc.id} className="border border-gray-100 rounded-md overflow-hidden">
                          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-800">{doc.title}</h4>
                              <p className="text-sm text-gray-500">{doc.documentType}</p>
                            </div>
                            <Badge variant="outline" className={`${doc.status === "signed" ? "text-green-600 bg-green-50 border-green-200" : "text-yellow-600 bg-yellow-50 border-yellow-200"} font-normal text-xs`}>
                              {doc.status === "signed" ? "Firmado" : "Pendiente"}
                            </Badge>
                          </div>
                          <div className="px-4 py-3">
                            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                              <div>
                                <p className="text-gray-500 text-xs">Cliente:</p>
                                <p className="font-medium text-gray-800">{doc.client}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs">Fecha de solicitud:</p>
                                <p className="font-medium text-gray-800">{doc.requestDate}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-100">
                            <Button variant="outline" size="sm" className="h-8 text-sm font-normal"
                              onClick={() => setLocation(`/document/${doc.id}`)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Ver documento
                            </Button>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" className="h-8 text-sm font-normal text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleRejectDocument(doc.id)}>
                                Rechazar
                              </Button>
                              <Button size="sm" className="h-8 text-sm font-normal bg-red-600 hover:bg-red-700" onClick={() => acceptDocumentMutation.mutate(doc.id)}>
                                Aceptar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="resources">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-100 rounded-md shadow-sm">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-medium text-lg text-gray-800 flex items-center">
                      <BookOpen className="mr-2 h-5 w-5 text-blue-500" />
                      Recursos de Formación
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Materiales de formación para certificadores
                    </p>
                  </div>
                  <div className="p-4">
                    <Accordion type="single" collapsible className="border-none">
                      <AccordionItem value="item-1" className="border-b border-gray-100">
                        <AccordionTrigger className="py-3 text-sm font-medium text-gray-800 hover:no-underline">
                          Guía de certificación de documentos
                        </AccordionTrigger>
                        <AccordionContent className="pt-0 text-sm text-gray-600">
                          <p className="mb-2">Guía completa sobre el proceso de certificación de documentos según la legislación vigente.</p>
                          <Button variant="outline" size="sm" className="h-8 text-sm font-normal">
                            <Download className="h-4 w-4 mr-2" />
                            Descargar PDF
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2" className="border-b border-gray-100">
                        <AccordionTrigger className="py-3 text-sm font-medium text-gray-800 hover:no-underline">
                          Manual de uso del sistema
                        </AccordionTrigger>
                        <AccordionContent className="pt-0 text-sm text-gray-600">
                          <p className="mb-2">Tutorial detallado sobre el uso de la plataforma para certificadores.</p>
                          <Button variant="outline" size="sm" className="h-8 text-sm font-normal">
                            <Download className="h-4 w-4 mr-2" />
                            Descargar PDF
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-3" className="border-b border-gray-100">
                        <AccordionTrigger className="py-3 text-sm font-medium text-gray-800 hover:no-underline">
                          Aspectos legales de la certificación
                        </AccordionTrigger>
                        <AccordionContent className="pt-0 text-sm text-gray-600">
                          <p className="mb-2">Documentación sobre los aspectos legales relacionados con la certificación de documentos electrónicos.</p>
                          <Button variant="outline" size="sm" className="h-8 text-sm font-normal">
                            <Download className="h-4 w-4 mr-2" />
                            Descargar PDF
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-100 rounded-md shadow-sm">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-medium text-lg text-gray-800 flex items-center">
                      <HelpCircle className="mr-2 h-5 w-5 text-green-500" />
                      Soporte y Ayuda
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Recursos de ayuda y canales de soporte
                    </p>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start p-3 border border-gray-100 rounded-md">
                        <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-800 text-sm">Chat de soporte</h3>
                          <p className="text-xs text-gray-500 mb-2">Comuníquese con nuestro equipo de soporte en tiempo real.</p>
                          <Button size="sm" className="h-8 text-xs font-normal bg-red-600 hover:bg-red-700">Iniciar chat</Button>
                        </div>
                      </div>
                      
                      <div className="flex items-start p-3 border border-gray-100 rounded-md">
                        <Phone className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-800 text-sm">Soporte telefónico</h3>
                          <p className="text-xs text-gray-500 mb-2">Llame a nuestra línea de soporte dedicada para certificadores.</p>
                          <p className="text-sm font-medium text-gray-800">+56 2 2456 7890</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start p-3 border border-gray-100 rounded-md">
                        <Mail className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-800 text-sm">Correo electrónico</h3>
                          <p className="text-xs text-gray-500 mb-2">Envíe sus consultas por correo electrónico.</p>
                          <p className="text-sm font-medium text-gray-800">soporte.certificadores@cerfidoc.cl</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="bg-blue-50 border border-blue-100 rounded-md p-4 flex items-start">
          <Info className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-800 text-sm">Información importante</h3>
            <p className="text-xs text-blue-700 mt-1">
              Recuerde que todas las certificaciones realizadas a través de esta plataforma están sujetas a la Ley 19.799 sobre Documentos Electrónicos, Firma Electrónica y Servicios de Certificación. Es su responsabilidad verificar cuidadosamente la identidad de los firmantes y la integridad de los documentos antes de certificarlos.
            </p>
          </div>
        </div>
      </div>
    </CertifierLayout>
  );
}