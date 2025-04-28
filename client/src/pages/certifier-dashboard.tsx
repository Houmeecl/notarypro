import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
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
import CertifierNavbar from "@/components/layout/CertifierNavbar";
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
    <>
      <CertifierNavbar />
      <div className="container mx-auto py-6">
        <header className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Panel de Certificador</h1>
              <p className="text-muted-foreground">
                Gestione sus sesiones de certificación y documentos pendientes
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="outline" size="sm">
                  Volver al inicio
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl">
                <Calendar className="mr-2 h-5 w-5 text-blue-500" />
                Sesiones Hoy
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-3xl font-bold">
                {certificationSessions?.filter((s: any) => 
                  new Date(s.scheduledFor).toDateString() === new Date().toDateString()
                ).length || 0}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                <Clock className="inline h-3 w-3 mr-1" />
                Próxima: {certificationSessions?.filter((s: any) => 
                  new Date(s.scheduledFor) > new Date()
                ).sort((a: any, b: any) => 
                  new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
                )[0]?.scheduledTime || "No hay sesiones programadas"}
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl">
                <FileText className="mr-2 h-5 w-5 text-green-500" />
                Documentos Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-3xl font-bold">
                {pendingDocuments?.length || 0}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                <CheckCircle className="inline h-3 w-3 mr-1" />
                {pendingDocuments?.filter((d: any) => d.status === "signed").length || 0} documentos firmados pendientes de certificación
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl">
                <Users className="mr-2 h-5 w-5 text-purple-500" />
                Clientes Activos
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-3xl font-bold">
                {clients?.length || 0}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                <Video className="inline h-3 w-3 mr-1" />
                {certificationSessions?.filter((s: any) => s.status === "completada").length || 0} sesiones completadas este mes
              </p>
            </CardFooter>
          </Card>
        </div>

        <div className="mb-6">
          <Tabs defaultValue="sesiones" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sesiones">Sesiones de Certificación</TabsTrigger>
              <TabsTrigger value="documentos">Documentos Pendientes</TabsTrigger>
              <TabsTrigger value="ron">Certificación Remota (RON)</TabsTrigger>
              <TabsTrigger value="ayudalegal">Ayuda Legal</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sesiones" className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex gap-2 flex-1">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por cliente o ID..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select 
                    value={filterStatus} 
                    onValueChange={setFilterStatus}
                  >
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      <SelectItem value="pendiente">Pendientes</SelectItem>
                      <SelectItem value="programada">Programadas</SelectItem>
                      <SelectItem value="enProceso">En Proceso</SelectItem>
                      <SelectItem value="completada">Completadas</SelectItem>
                      <SelectItem value="cancelada">Canceladas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <CalendarClock className="mr-2 h-4 w-4" />
                      Programar Sesión
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Programar Sesión de Certificación</DialogTitle>
                      <DialogDescription>
                        Complete los detalles para programar una nueva sesión de certificación remota.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Cliente</label>
                        <Select 
                          onValueChange={(value) => {
                            const client = clients?.find((c: any) => c.id === value);
                            setSelectedClient(client);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar cliente" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients?.map((client: any) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Fecha</label>
                        <Input 
                          type="date" 
                          min={new Date().toISOString().split('T')[0]}
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Hora</label>
                        <Input 
                          type="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleScheduleSession}
                        disabled={scheduleSessionMutation.isPending}
                      >
                        {scheduleSessionMutation.isPending ? "Programando..." : "Programar"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Sesión</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Fecha y Hora</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">Cargando sesiones...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredSessions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <Calendar className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">No se encontraron sesiones</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSessions.map((session: any) => (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium">{session.id}</TableCell>
                          <TableCell>{session.client}</TableCell>
                          <TableCell>
                            {new Date(session.scheduledFor).toLocaleDateString()} - {session.scheduledTime}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[session.status] || ""}>
                              {session.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {session.type === "videoconference" ? (
                              <span className="flex items-center">
                                <Video className="h-4 w-4 mr-1" /> Video
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1" /> Presencial
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                
                                {session.status === "programada" && (
                                  <>
                                    <DropdownMenuItem>
                                      <Link href={`/ron-videocall/${session.id}`}>
                                        <span className="flex items-center w-full">
                                          <Video className="mr-2 h-4 w-4" /> Iniciar video
                                        </span>
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <span className="flex items-center">
                                        <Clock className="mr-2 h-4 w-4" /> Reprogramar
                                      </span>
                                    </DropdownMenuItem>
                                  </>
                                )}
                                
                                {session.status === "completada" && (
                                  <DropdownMenuItem>
                                    <span className="flex items-center">
                                      <Download className="mr-2 h-4 w-4" /> Descargar acta
                                    </span>
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuItem>
                                  <Link href={`/certification-details/${session.id}`}>
                                    <span className="flex items-center w-full">
                                      <FileText className="mr-2 h-4 w-4" /> Ver detalles
                                    </span>
                                  </Link>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            {/* Nueva pestaña para RON con priorización regional */}
            <TabsContent value="ron">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Video className="h-5 w-5 mr-2 text-primary" />
                    Certificación Remota en Línea (RON)
                  </CardTitle>
                  <CardDescription>
                    Gestione solicitudes de certificación remota priorizadas por ubicación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Sección de solicitudes prioritarias (misma región) */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3 flex items-center">
                        <Badge variant="outline" className="mr-2 bg-green-50 text-green-700 border-green-200">Prioritarias</Badge>
                        Solicitudes en su región: Santiago
                      </h3>
                      
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Cliente</TableHead>
                              <TableHead>Documento</TableHead>
                              <TableHead>Ubicación</TableHead>
                              <TableHead>Solicitado</TableHead>
                              <TableHead>Estado</TableHead>
                              <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">Ana Martínez</TableCell>
                              <TableCell>Poder Notarial</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Santiago (Su región)
                                </Badge>
                              </TableCell>
                              <TableCell>Hace 32 minutos</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                  Pendiente
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button size="sm" className="mr-2">
                                  <Video className="h-4 w-4 mr-2" />
                                  Iniciar RON
                                </Button>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Carlos Rojas</TableCell>
                              <TableCell>Declaración Jurada</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Santiago (Su región)
                                </Badge>
                              </TableCell>
                              <TableCell>Hace 1 hora</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                  Pendiente
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button size="sm" className="mr-2">
                                  <Video className="h-4 w-4 mr-2" />
                                  Iniciar RON
                                </Button>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    
                    {/* Sección de solicitudes de otras regiones */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3 flex items-center">
                        <Badge variant="outline" className="mr-2 bg-blue-50 text-blue-700 border-blue-200">Otras Regiones</Badge>
                        Solicitudes en espera de otras regiones
                      </h3>
                      
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Cliente</TableHead>
                              <TableHead>Documento</TableHead>
                              <TableHead>Ubicación</TableHead>
                              <TableHead>Solicitado</TableHead>
                              <TableHead>Estado</TableHead>
                              <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">Marcela Jiménez</TableCell>
                              <TableCell>Contrato de Arrendamiento</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  Valparaíso
                                </Badge>
                              </TableCell>
                              <TableCell>Hace 2 horas</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  Sin certificador local
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button size="sm" variant="outline" className="mr-2">
                                  <Video className="h-4 w-4 mr-2" />
                                  Aceptar
                                </Button>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Roberto Soto</TableCell>
                              <TableCell>Autorización de Viaje</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  Concepción
                                </Badge>
                              </TableCell>
                              <TableCell>Hace 3 horas</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  Sin certificador local
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button size="sm" variant="outline" className="mr-2">
                                  <Video className="h-4 w-4 mr-2" />
                                  Aceptar
                                </Button>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    
                    {/* Sección de información y política de priorización */}
                    <Card className="bg-muted/40 border-dashed">
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-4">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Info className="h-5 w-5 text-blue-700" />
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Política de priorización regional</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Para brindar un mejor servicio, el sistema prioriza la asignación de certificadores de la misma región del cliente. Cuando no hay disponibilidad regional, se permite que certificadores de otras regiones acepten las solicitudes.
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Las solicitudes de su región aparecen como "Prioritarias" y se recomienda atenderlas primero.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documentos">
              <Card>
                <CardHeader>
                  <CardTitle>Documentos Pendientes de Certificación</CardTitle>
                  <CardDescription>
                    Documentos que requieren su revisión y certificación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingDocuments?.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-2" />
                      <h3 className="text-lg font-medium mb-1">No hay documentos pendientes</h3>
                      <p className="text-muted-foreground text-sm">
                        Todos los documentos han sido procesados.
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {pendingDocuments?.map((doc: any) => (
                          <Card key={doc.id}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle>{doc.title}</CardTitle>
                                  <CardDescription>
                                    Enviado por: {doc.authorName} - {new Date(doc.createdAt).toLocaleDateString()}
                                  </CardDescription>
                                </div>
                                <Badge variant={doc.status === "signed" ? "default" : "outline"}>
                                  {doc.status === "signed" ? "Firmado" : doc.status}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <div className="flex items-center text-sm text-muted-foreground">
                                <FileText className="h-4 w-4 mr-1" />
                                {doc.category} - {doc.type}
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-between gap-2">
                              <Button variant="outline" size="sm" className="flex-1">
                                <Link href={`/documents/${doc.id}`}>
                                  <span className="flex items-center justify-center w-full">
                                    <FileText className="mr-2 h-4 w-4" /> Ver
                                  </span>
                                </Link>
                              </Button>
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={() => acceptDocumentMutation.mutate(doc.id)}
                                disabled={acceptDocumentMutation.isPending}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" /> Aceptar
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleRejectDocument(doc.id)}
                                disabled={rejectDocumentMutation.isPending}
                              >
                                Rechazar
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Nueva pestaña para Ayuda Legal */}
            <TabsContent value="ayudalegal">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                    Consultas sobre Documentos Legales
                  </CardTitle>
                  <CardDescription>
                    Resuelva dudas sobre documentos legales, normativas y certificación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Buscador de preguntas frecuentes */}
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar respuestas o documentación legal..."
                        className="pl-8"
                      />
                    </div>
                    
                    {/* Preguntas frecuentes */}
                    <div className="rounded-md border">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                          <AccordionTrigger className="px-4">
                            ¿Qué documentos requieren certificación presencial obligatoria?
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <p className="text-sm text-muted-foreground">
                              Según la ley vigente, los siguientes documentos requieren certificación presencial:
                            </p>
                            <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground space-y-1">
                              <li>Testamentos y disposiciones de última voluntad</li>
                              <li>Escrituras de compraventa de bienes inmuebles</li>
                              <li>Documentos de constitución de ciertas sociedades mercantiles</li>
                              <li>Poderes generales que incluyen facultades especiales específicas</li>
                            </ul>
                            <p className="text-sm mt-2">
                              <Link href="/guia-documentos" className="text-primary hover:underline flex items-center">
                                <FileText className="h-3.5 w-3.5 mr-1" />
                                Ver guía completa de documentos
                              </Link>
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-2">
                          <AccordionTrigger className="px-4">
                            ¿Cuál es la diferencia entre firma electrónica simple y avanzada?
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <p className="text-sm text-muted-foreground">
                              <strong>Firma electrónica simple:</strong> Permite identificar al firmante pero no garantiza la integridad del documento ni la vinculación exclusiva con el firmante.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>Firma electrónica avanzada:</strong> Cumple con todos los requisitos legales según la Ley 19.799, garantizando:
                            </p>
                            <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground space-y-1">
                              <li>Identificación inequívoca del firmante</li>
                              <li>Vinculación exclusiva con el firmante</li>
                              <li>Control único del firmante sobre los medios de creación</li>
                              <li>Posibilidad de detectar cualquier alteración posterior</li>
                              <li>Certificación por una entidad acreditada</li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-3">
                          <AccordionTrigger className="px-4">
                            ¿Qué hacer si un cliente presenta un documento con irregularidades?
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <p className="text-sm text-muted-foreground">
                              Si detecta irregularidades en un documento presentado para certificación, siga este protocolo:
                            </p>
                            <ol className="list-decimal pl-5 mt-2 text-sm text-muted-foreground space-y-1">
                              <li>Informe al cliente sobre las irregularidades específicas</li>
                              <li>Documente las observaciones en el sistema</li>
                              <li>Rechace formalmente la certificación indicando los motivos</li>
                              <li>Si hay sospechas de ilegalidad, notifique a su supervisor</li>
                              <li>En casos graves, contacte con asesoría legal interna</li>
                            </ol>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-4">
                          <AccordionTrigger className="px-4">
                            ¿Cómo verificar la identidad en certificaciones remotas (RON)?
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <p className="text-sm text-muted-foreground">
                              Para certificaciones remotas, el protocolo de verificación de identidad incluye:
                            </p>
                            <ol className="list-decimal pl-5 mt-2 text-sm text-muted-foreground space-y-1">
                              <li>Verificación de documento de identidad oficial con foto (mostrado en cámara)</li>
                              <li>Contraste con la base de datos del Registro Civil</li>
                              <li>Verificación biométrica facial (comparación con foto oficial)</li>
                              <li>Preguntas de verificación basadas en información personal no pública</li>
                              <li>Registro completo de la sesión de video</li>
                            </ol>
                            <p className="text-sm text-muted-foreground mt-2">
                              Recuerde que todo el proceso debe quedar documentado en la plataforma para futuras auditorías.
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                    
                    {/* Asistente de consultas */}
                    <Card className="bg-muted/30 border-dashed">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-md">Asistente de consultas legales</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col space-y-4">
                          <div className="flex items-start space-x-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <MessageSquare className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">
                                Escriba su consulta sobre documentos, normativas o procedimientos legales:
                              </p>
                              <Textarea className="mt-2" placeholder="Ej: ¿Cómo debo certificar un documento de traspaso de acciones?" />
                              <Button className="mt-2" size="sm">Enviar consulta</Button>
                            </div>
                          </div>
                          
                          <div className="pt-4">
                            <h4 className="text-sm font-medium mb-2">Contactar asesoría legal especializada</h4>
                            <div className="flex flex-wrap gap-2">
                              <Button variant="outline" size="sm">
                                <Phone className="h-3.5 w-3.5 mr-1.5" /> Llamada
                              </Button>
                              <Button variant="outline" size="sm">
                                <Video className="h-3.5 w-3.5 mr-1.5" /> Videollamada
                              </Button>
                              <Button variant="outline" size="sm">
                                <Mail className="h-3.5 w-3.5 mr-1.5" /> Email
                              </Button>
                              <Button variant="outline" size="sm">
                                <MessageCircle className="h-3.5 w-3.5 mr-1.5" /> Chat
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Recursos legales */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">Recursos legales</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/guia-normativa-certificacion" className="block">
                          <Card className="h-full hover:bg-muted/30 transition-colors">
                            <CardContent className="p-4 flex items-center space-x-3">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <BookOpen className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium">Guía Normativa de Certificación</h4>
                                <p className="text-xs text-muted-foreground">Actualizada según Ley 19.799</p>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                        
                        <Link href="/recursos-legales" className="block">
                          <Card className="h-full hover:bg-muted/30 transition-colors">
                            <CardContent className="p-4 flex items-center space-x-3">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <FileText className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium">Formatos y Plantillas</h4>
                                <p className="text-xs text-muted-foreground">Documentos de referencia y modelos</p>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}