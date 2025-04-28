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
  CalendarClock
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sesiones">Sesiones de Certificación</TabsTrigger>
              <TabsTrigger value="documentos">Documentos Pendientes</TabsTrigger>
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
          </Tabs>
        </div>
      </div>
    </>
  );
}