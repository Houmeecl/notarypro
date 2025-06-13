import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Calendar, 
  Clock, 
  FileText, 
  Users, 
  Video, 
  Search, 
  Filter, 
  Plus,
  CreditCard,
  Briefcase,
  UserPlus,
  ClipboardCheck,
  BarChart,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import LawyerNavbar from "@/components/layout/LawyerNavbar";
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
import { Progress } from "@/components/ui/progress";

// Estado de documentos y videoconsultas
const statusMap: Record<string, { label: string, color: string }> = {
  "pendiente": { label: "Pendiente", color: "text-yellow-500 bg-yellow-100" },
  "enproceso": { label: "En proceso", color: "text-blue-500 bg-blue-100" },
  "completado": { label: "Completado", color: "text-green-500 bg-green-100" },
  "revisión": { label: "En revisión", color: "text-purple-500 bg-purple-100" },
  "cancelado": { label: "Cancelado", color: "text-red-500 bg-red-100" },
  "agendada": { label: "Agendada", color: "text-indigo-500 bg-indigo-100" },
  "finalizada": { label: "Finalizada", color: "text-green-500 bg-green-100" }
};

// Datos simulados para ilustrar la página
// Datos de muestra para videoconsultas
const mockVideoConsultations = [
  { 
    id: "VC-2025-001", 
    clientName: "Maria Rodríguez", 
    scheduledFor: "2025-04-29T14:30:00", 
    status: "agendada", 
    topic: "Consulta contratos comerciales",
    duration: 30
  },
  { 
    id: "VC-2025-002", 
    clientName: "Juan Pérez", 
    scheduledFor: "2025-04-30T10:00:00", 
    status: "agendada", 
    topic: "Asesoría laboral",
    duration: 60
  },
  { 
    id: "VC-2025-003", 
    clientName: "Laura González", 
    scheduledFor: "2025-04-28T16:15:00", 
    status: "finalizada", 
    topic: "Revisión documentos inmobiliarios",
    duration: 45
  }
];

// Datos de muestra para certificaciones remotas (RON)
const mockRonRequests = [
  {
    id: "RON-2025-001",
    clientName: "Luis Mendoza",
    documentType: "Poder Notarial",
    region: "Santiago",
    status: "pendiente",
    isLocal: true,
    requestedAt: "2025-04-28T09:15:00"
  },
  {
    id: "RON-2025-002",
    clientName: "Carmen Vega",
    documentType: "Declaración Jurada",
    region: "Santiago",
    status: "pendiente",
    isLocal: true,
    requestedAt: "2025-04-28T11:30:00"
  },
  {
    id: "RON-2025-003",
    clientName: "Roberto Torres",
    documentType: "Contrato de Arrendamiento",
    region: "Valparaíso",
    status: "pendiente_asignacion",
    isLocal: false,
    requestedAt: "2025-04-27T16:45:00"
  },
  {
    id: "RON-2025-004",
    clientName: "Elena Paredes",
    documentType: "Testamento",
    region: "Concepción",
    status: "pendiente_asignacion",
    isLocal: false,
    requestedAt: "2025-04-27T14:20:00"
  }
];

// Datos simulados para ejemplos de casos recientes
const mockRecentCases = [
  {
    id: "CASO-2025-045",
    title: "Contrato de Compraventa Internacional",
    client: "Exportadora Chile Sur",
    status: "enproceso",
    lastUpdate: "2025-04-27T08:30:00",
    progress: 65
  },
  {
    id: "CASO-2025-044",
    title: "Reclamación Seguros de Transporte",
    client: "Transportes Andinos",
    status: "revisión",
    lastUpdate: "2025-04-26T14:15:00",
    progress: 80
  },
  {
    id: "CASO-2025-042",
    title: "Constitución Sociedad por Acciones",
    client: "Emprendimientos Tecnológicos",
    status: "completado",
    lastUpdate: "2025-04-25T11:20:00",
    progress: 100
  }
];

export default function LawyerDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [showCreateConsultDialog, setShowCreateConsultDialog] = useState(false);
  const [consultationData, setConsultationData] = useState({
    clientName: "",
    email: "",
    phone: "",
    topic: "",
    date: "",
    time: "",
    duration: "30"
  });

  // Consulta para obtener los datos del abogado (estadísticas)
  const { data: lawyerStats } = useQuery({
    queryKey: ['/api/lawyer/stats'],
  });

  // Consulta para obtener las videoconsultas
  const { data: videoConsultations, isLoading } = useQuery({
    queryKey: ['/api/video-consultations'],
  });

  // Consulta para obtener los clientes
  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
  });

  // Mutación para crear una nueva videoconsulta
  const createConsultationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/video-consultations", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Videoconsulta creada",
        description: "La videoconsulta ha sido programada correctamente.",
      });
      setShowCreateConsultDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/video-consultations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la videoconsulta.",
        variant: "destructive",
      });
    }
  });

  // Manejador para crear una videoconsulta
  const handleCreateConsultation = () => {
    const { clientName, email, phone, topic, date, time, duration } = consultationData;
    
    if (!clientName || !email || !topic || !date || !time) {
      toast({
        title: "Datos incompletos",
        description: "Por favor complete todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }
    
    createConsultationMutation.mutate({
      clientName,
      email,
      phone,
      topic,
      scheduledFor: `${date}T${time}:00`,
      duration: parseInt(duration),
      lawyerId: user?.id
    });
  };

  // Filtrar videoconsultas según los criterios
  const filteredConsultations = videoConsultations || mockVideoConsultations;

  return (
    <>
      <LawyerNavbar />
      <div className="container mx-auto py-6">
        <header className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Panel de Abogado</h1>
              <p className="text-muted-foreground">
                Gestione sus videoconsultas y documentos legales
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

        {/* KPIs superiores */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl">
                <Video className="mr-2 h-5 w-5 text-blue-500" />
                Consultas Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-3xl font-bold">
                {videoConsultations?.filter((c: any) => c.status === "agendada").length || 2}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                <Clock className="inline h-3 w-3 mr-1" />
                Próxima: {new Date("2025-04-29T14:30:00").toLocaleDateString()} - 14:30
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl">
                <Briefcase className="mr-2 h-5 w-5 text-green-500" />
                Casos Activos
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-3xl font-bold">
                {lawyerStats?.activeCases || 12}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                <ClipboardCheck className="inline h-3 w-3 mr-1" />
                {lawyerStats?.completedCasesMonth || 4} casos completados este mes
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
                {lawyerStats?.activeClients || 17}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                <UserPlus className="inline h-3 w-3 mr-1" />
                {lawyerStats?.newClientsMonth || 3} nuevos clientes este mes
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl">
                <CreditCard className="mr-2 h-5 w-5 text-indigo-500" />
                Ingresos Mes
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-3xl font-bold">
                {lawyerStats?.monthlyRevenue?.toLocaleString() || "$ 2.450.000"}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                <BarChart className="inline h-3 w-3 mr-1" />
                {lawyerStats?.revenueGrowth || "+12%"} respecto al mes anterior
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel izquierdo - Videoconsultas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Videoconsultas</CardTitle>
                  <Dialog open={showCreateConsultDialog} onOpenChange={setShowCreateConsultDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-1" /> Nueva Consulta
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Programar Nueva Videoconsulta</DialogTitle>
                        <DialogDescription>
                          Complete los datos para agendar una nueva consulta con un cliente.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Nombre del cliente</label>
                            <Input 
                              value={consultationData.clientName}
                              onChange={(e) => setConsultationData({...consultationData, clientName: e.target.value})}
                              placeholder="Nombre completo"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input 
                              type="email"
                              value={consultationData.email}
                              onChange={(e) => setConsultationData({...consultationData, email: e.target.value})}
                              placeholder="correo@ejemplo.com"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Teléfono (opcional)</label>
                          <Input 
                            value={consultationData.phone}
                            onChange={(e) => setConsultationData({...consultationData, phone: e.target.value})}
                            placeholder="+56 9 xxxx xxxx"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Tema de consulta</label>
                          <Input 
                            value={consultationData.topic}
                            onChange={(e) => setConsultationData({...consultationData, topic: e.target.value})}
                            placeholder="Ej: Revisión de contrato"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Fecha</label>
                            <Input 
                              type="date"
                              min={new Date().toISOString().split('T')[0]}
                              value={consultationData.date}
                              onChange={(e) => setConsultationData({...consultationData, date: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Hora</label>
                            <Input 
                              type="time"
                              value={consultationData.time}
                              onChange={(e) => setConsultationData({...consultationData, time: e.target.value})}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Duración</label>
                          <Select 
                            value={consultationData.duration}
                            onValueChange={(value) => setConsultationData({...consultationData, duration: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar duración" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 minutos</SelectItem>
                              <SelectItem value="30">30 minutos</SelectItem>
                              <SelectItem value="45">45 minutos</SelectItem>
                              <SelectItem value="60">1 hora</SelectItem>
                              <SelectItem value="90">1 hora 30 minutos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateConsultDialog(false)}>
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleCreateConsultation}
                          disabled={createConsultationMutation.isPending}
                        >
                          {createConsultationMutation.isPending ? "Creando..." : "Crear Consulta"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <CardDescription>
                  Gestione sus videoconsultas programadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
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
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="agendada">Agendadas</SelectItem>
                      <SelectItem value="finalizada">Finalizadas</SelectItem>
                      <SelectItem value="cancelada">Canceladas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Fecha y Hora</TableHead>
                        <TableHead>Duración</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredConsultations.map((consult: any) => (
                        <TableRow key={consult.id}>
                          <TableCell className="font-medium">{consult.id}</TableCell>
                          <TableCell>{consult.clientName}</TableCell>
                          <TableCell>
                            {new Date(consult.scheduledFor).toLocaleDateString()} - {new Date(consult.scheduledFor).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </TableCell>
                          <TableCell>{consult.duration} min</TableCell>
                          <TableCell>
                            <Badge className={statusMap[consult.status]?.color || ""}>
                              {statusMap[consult.status]?.label || consult.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {consult.status === "agendada" && (
                              <Button size="sm" className="h-8">
                                <Link href={`/video-consultation/${consult.id}`}>
                                  <span className="flex items-center">
                                    <Video className="h-3.5 w-3.5 mr-1" /> Iniciar
                                  </span>
                                </Link>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm">
                  <Link href="/video-consultations">
                    <span className="flex items-center">
                      Ver todas
                    </span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            {/* Sección de RON con priorización regional */}
            <Card className="mt-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Video className="h-5 w-5 mr-2 text-primary" />
                    Certificación Remota en Línea (RON)
                  </CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Nueva Solicitud RON
                  </Button>
                </div>
                <CardDescription>Solicitudes de certificación remota priorizadas por región</CardDescription>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="local" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="local">Mi Región</TabsTrigger>
                    <TabsTrigger value="other">Otras Regiones</TabsTrigger>
                  </TabsList>

                  <TabsContent value="local">
                    {mockRonRequests.filter(req => req.isLocal).length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Cliente</TableHead>
                              <TableHead>Documento</TableHead>
                              <TableHead>Solicitado</TableHead>
                              <TableHead>Estado</TableHead>
                              <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mockRonRequests
                              .filter(req => req.isLocal)
                              .map(request => (
                                <TableRow key={request.id}>
                                  <TableCell className="font-medium">{request.clientName}</TableCell>
                                  <TableCell>{request.documentType}</TableCell>
                                  <TableCell>{new Date(request.requestedAt).toLocaleString(undefined, {
                                    dateStyle: 'short',
                                    timeStyle: 'short'
                                  })}</TableCell>
                                  <TableCell>
                                    <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                      Pendiente
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button size="sm" variant="default">
                                      <Video className="h-4 w-4 mr-2" />
                                      Ver detalles
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <Video className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">Sin solicitudes en su región</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          No hay solicitudes pendientes de certificación remota en su región.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="other">
                    {mockRonRequests.filter(req => !req.isLocal).length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Cliente</TableHead>
                              <TableHead>Documento</TableHead>
                              <TableHead>Región</TableHead>
                              <TableHead>Solicitado</TableHead>
                              <TableHead>Estado</TableHead>
                              <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mockRonRequests
                              .filter(req => !req.isLocal)
                              .map(request => (
                                <TableRow key={request.id}>
                                  <TableCell className="font-medium">{request.clientName}</TableCell>
                                  <TableCell>{request.documentType}</TableCell>
                                  <TableCell>
                                    <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                                      {request.region}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{new Date(request.requestedAt).toLocaleString(undefined, {
                                    dateStyle: 'short',
                                    timeStyle: 'short'
                                  })}</TableCell>
                                  <TableCell>
                                    <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                                      Sin certificador local
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button size="sm" variant="outline">
                                      <Video className="h-4 w-4 mr-2" />
                                      Ver detalles
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <Video className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">Sin solicitudes de otras regiones</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          No hay solicitudes pendientes de certificación remota de otras regiones.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Información sobre la priorización regional */}
                <Card className="bg-muted/40 border-dashed mt-4">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Info className="h-5 w-5 text-blue-700" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Sistema de priorización regional</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Para brindar un mejor servicio, la plataforma prioriza que los documentos sean certificados por profesionales de la misma región del cliente. Esto reduce tiempos de espera y mejora la calidad del servicio.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Las solicitudes de otras regiones solo serán asignadas a certificadores externos cuando no hay disponibilidad local.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
            
            {/* Casos recientes */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Casos Recientes</CardTitle>
                <CardDescription>
                  Los casos más recientes en los que está trabajando
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentCases.map((caseItem) => (
                    <div key={caseItem.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{caseItem.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {caseItem.client} - {caseItem.id}
                          </p>
                        </div>
                        <Badge className={statusMap[caseItem.status]?.color || ""}>
                          {statusMap[caseItem.status]?.label || caseItem.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progreso:</span>
                          <span>{caseItem.progress}%</span>
                        </div>
                        <Progress value={caseItem.progress} className="h-2" />
                      </div>
                      <div className="flex justify-between mt-3">
                        <span className="text-xs text-muted-foreground">
                          Actualizado: {new Date(caseItem.lastUpdate).toLocaleDateString()}
                        </span>
                        <Button variant="outline" size="sm">
                          <Link href={`/casos/${caseItem.id}`}>
                            <span className="flex items-center">
                              <FileText className="h-3.5 w-3.5 mr-1" /> Ver detalles
                            </span>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm">
                  <Link href="/casos">
                    <span className="flex items-center">
                      Ver todos los casos
                    </span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Panel derecho */}
          <div className="space-y-6">
            {/* Calendario rápido */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                  Calendario de Hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredConsultations.filter((c: any) => 
                  new Date(c.scheduledFor).toDateString() === new Date().toDateString()
                ).length === 0 ? (
                  <div className="text-center py-6">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-2" />
                    <h3 className="text-lg font-medium mb-1">No hay eventos hoy</h3>
                    <p className="text-muted-foreground text-sm">
                      Su agenda para hoy está vacía
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredConsultations
                      .filter((c: any) => new Date(c.scheduledFor).toDateString() === new Date().toDateString())
                      .map((consult: any) => (
                        <div key={consult.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{new Date(consult.scheduledFor).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            <p className="text-sm text-muted-foreground">{consult.clientName}</p>
                            <p className="text-xs mt-1">{consult.topic}</p>
                          </div>
                          <Badge variant="outline" className="flex items-center">
                            <Video className="h-3 w-3 mr-1" /> {consult.duration} min
                          </Badge>
                        </div>
                      ))
                    }
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Link href="/calendar">
                    <span className="flex items-center justify-center w-full">
                      <Calendar className="h-4 w-4 mr-2" /> Ver calendario completo
                    </span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            {/* Panel de enlaces rápidos */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <Button variant="outline" className="justify-start">
                    <Link href="/crear-documento">
                      <span className="flex items-center w-full">
                        <FileText className="h-4 w-4 mr-2" /> Crear nuevo documento
                      </span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Link href="/clientes/nuevo">
                      <span className="flex items-center w-full">
                        <UserPlus className="h-4 w-4 mr-2" /> Registrar nuevo cliente
                      </span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Link href="/calendario/nueva-cita">
                      <span className="flex items-center w-full">
                        <Calendar className="h-4 w-4 mr-2" /> Programar cita
                      </span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Link href="/facturacion/nueva">
                      <span className="flex items-center w-full">
                        <CreditCard className="h-4 w-4 mr-2" /> Crear factura
                      </span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Estadísticas */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas Mensuales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Horas facturadas</span>
                      <span className="font-medium">{lawyerStats?.billedHours || 32} / 160</span>
                    </div>
                    <Progress value={lawyerStats?.billedHours ? (lawyerStats.billedHours / 160) * 100 : 20} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tasa de éxito en casos</span>
                      <span className="font-medium">{lawyerStats?.successRate || 92}%</span>
                    </div>
                    <Progress value={lawyerStats?.successRate || 92} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Satisfacción de clientes</span>
                      <span className="font-medium">{lawyerStats?.clientSatisfaction || 4.8}/5</span>
                    </div>
                    <Progress value={(lawyerStats?.clientSatisfaction || 4.8) * 20} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}