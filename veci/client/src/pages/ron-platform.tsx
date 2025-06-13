import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  Calendar, 
  Clock, 
  FileText, 
  User, 
  Users, 
  Video, 
  ChevronRight, 
  Search, 
  Filter, 
  Download,
  Plus,
  CalendarClock,
  LogOut,
  BarChart2,
  Settings,
  HelpCircle,
  Check,
  X,
  Clipboard,
  ClipboardList,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

// Datos ficticios para mostrar la interfaz
const mockStatusColors: Record<string, string> = {
  "pendiente": "text-yellow-500 bg-yellow-100",
  "programada": "text-blue-500 bg-blue-100",
  "completada": "text-green-500 bg-green-100",
  "cancelada": "text-red-500 bg-red-100",
  "en_curso": "text-purple-500 bg-purple-100",
  "en_espera": "text-orange-500 bg-orange-100",
};

// Datos de muestra para historial de sesiones RON
const mockSessions = [
  {
    id: "RON-2025-001",
    client: "Carlos Mendoza",
    documentType: "Poder Notarial",
    scheduledFor: "2025-04-29T15:00:00",
    status: "programada",
    region: "Santiago",
    paymentCode: "PAY-8527419"
  },
  {
    id: "RON-2025-002",
    client: "María González",
    documentType: "Declaración Jurada",
    scheduledFor: "2025-04-28T10:30:00",
    status: "en_espera",
    region: "Santiago",
    paymentCode: "PAY-3698521"
  },
  {
    id: "RON-2025-003",
    client: "Fernando Pérez",
    documentType: "Contrato de Arriendo",
    scheduledFor: "2025-04-27T16:15:00",
    status: "completada",
    region: "Santiago",
    paymentCode: "PAY-1472583"
  },
  {
    id: "RON-2025-004",
    client: "Alejandra Torres",
    documentType: "Contrato de Compraventa",
    scheduledFor: "2025-04-26T14:45:00",
    status: "completada",
    region: "Santiago",
    paymentCode: "PAY-7891234"
  }
];

// Ficha de atención para sesión completada
const mockCompletedSession = {
  id: "RON-2025-003",
  client: {
    name: "Fernando Pérez Soto",
    id: "12.345.678-9",
    email: "fernando.perez@ejemplo.cl",
    phone: "+56 9 1234 5678",
    address: "Av. Providencia 1234, Santiago"
  },
  professional: {
    name: "Ana López Mendoza",
    role: "Certificador",
    license: "CEF-159753"
  },
  document: {
    type: "Contrato de Arriendo",
    title: "Contrato de Arrendamiento Propiedad Avenida Las Condes",
    pages: 8,
    attachments: ["Inventario.pdf", "Comprobante_pago.pdf"]
  },
  session: {
    scheduledFor: "2025-04-27T16:15:00",
    startedAt: "2025-04-27T16:17:32",
    endedAt: "2025-04-27T16:42:15",
    duration: "24:43",
    recordingUrl: "https://cerfidoc.net/recordings/RON-2025-003",
    verificationMethods: ["Cédula", "Biométrico facial", "Preguntas de seguridad"],
    status: "completada",
    observations: "Cliente presentó documentación adicional respecto al inventario del inmueble. Se anexó al documento principal."
  },
  payment: {
    code: "PAY-1472583",
    amount: 35000,
    method: "Tarjeta de crédito",
    date: "2025-04-26T10:05:32"
  }
};

export default function RonPlatform() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todas");
  const [showCreateSessionDialog, setShowCreateSessionDialog] = useState(false);
  const [showSessionDetailsDialog, setShowSessionDetailsDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  
  // Consulta para obtener los datos del usuario profesional
  const { data: ronUser } = useQuery({
    queryKey: ['/api/ron/user'],
  });
  
  // Consulta para obtener las sesiones de RON
  const { data: ronSessions, isLoading } = useQuery({
    queryKey: ['/api/ron/sessions'],
  });
  
  // Mutación para cerrar sesión
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ron/logout", {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/ron/user'], null);
      navigate("/ron-login");
    }
  });
  
  // Mutación para crear una nueva sesión RON
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      const response = await apiRequest("POST", "/api/ron/sessions", sessionData);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sesión creada",
        description: `Se ha creado la sesión RON con ID: ${data.id}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ron/sessions'] });
      setShowCreateSessionDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear sesión",
        description: error.message || "No se pudo crear la sesión. Intente nuevamente.",
        variant: "destructive",
      });
    }
  });
  
  // Filtrar sesiones según los criterios
  const filteredSessions = ronSessions || mockSessions;
  
  // Manejador para ver detalles de sesión
  const handleViewSessionDetails = (session: any) => {
    setSelectedSession(session);
    setShowSessionDetailsDialog(true);
  };
  
  // Cerrar sesión
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto py-3 px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Video className="h-6 w-6 text-primary mr-2" />
                <h1 className="text-xl font-bold">Plataforma RON</h1>
              </div>
              <Badge variant="outline" className="ml-2 font-normal">
                {ronUser?.role || "Certificador"}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {ronUser?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || "CP"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-6 px-4">
        <div className="flex flex-col space-y-8">
          {/* Encabezado y estadísticas */}
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">Panel de Certificación Remota</h2>
                <p className="text-muted-foreground">
                  Gestione sus sesiones RON y registre fichas de atención
                </p>
              </div>
              <div className="flex space-x-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="default" size="sm">
                      <Video className="h-4 w-4 mr-2" />
                      Reunión interna
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear reunión interna</DialogTitle>
                      <DialogDescription>
                        Organice una videollamada con otros profesionales del equipo
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Título de la reunión</label>
                        <Input placeholder="Ej: Coordinación semanal del equipo" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Fecha</label>
                          <Input 
                            type="date" 
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Hora</label>
                          <Input type="time" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Duración estimada</label>
                        <Select defaultValue="30">
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione duración" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutos</SelectItem>
                            <SelectItem value="30">30 minutos</SelectItem>
                            <SelectItem value="45">45 minutos</SelectItem>
                            <SelectItem value="60">1 hora</SelectItem>
                            <SelectItem value="90">1 hora 30 minutos</SelectItem>
                            <SelectItem value="120">2 horas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Participantes</label>
                        <div className="border rounded-md p-3 bg-muted/20">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge className="flex items-center gap-1 bg-primary/20 hover:bg-primary/30 text-primary">
                              Ana López <X className="h-3 w-3" />
                            </Badge>
                            <Badge className="flex items-center gap-1 bg-primary/20 hover:bg-primary/30 text-primary">
                              Carlos Mendoza <X className="h-3 w-3" />
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Input placeholder="Agregar participante..." className="flex-1" />
                            <Button type="button" size="sm" variant="outline">
                              Agregar
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Descripción o agenda (opcional)</label>
                        <Textarea placeholder="Detalles de la reunión..." />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline">Cancelar</Button>
                      <Button>Crear reunión</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Salir
                </Button>
                <Button size="sm" onClick={() => navigate("/ron-help")}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Ayuda
                </Button>
              </div>
            </div>
            
            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Sesiones Hoy</p>
                    <p className="text-2xl font-bold">
                      {filteredSessions.filter(s => 
                        new Date(s.scheduledFor).toDateString() === new Date().toDateString()
                      ).length}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-primary opacity-80" />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">En Espera</p>
                    <p className="text-2xl font-bold">
                      {filteredSessions.filter(s => s.status === "en_espera").length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500 opacity-80" />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completadas</p>
                    <p className="text-2xl font-bold">
                      {filteredSessions.filter(s => s.status === "completada").length}
                    </p>
                  </div>
                  <Check className="h-8 w-8 text-green-500 opacity-80" />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tasa Éxito</p>
                    <p className="text-2xl font-bold">
                      {Math.round(filteredSessions.filter(s => s.status === "completada").length / filteredSessions.length * 100)}%
                    </p>
                  </div>
                  <BarChart2 className="h-8 w-8 text-blue-500 opacity-80" />
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Acciones rápidas */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Acciones rápidas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="hover:bg-slate-50 transition cursor-pointer border-indigo-100 hover:border-indigo-300">
                <Link href="/ron-session-option" className="block">
                  <CardContent className="p-4 flex items-center space-x-3">
                    <div className="bg-indigo-100 rounded-full p-2">
                      <Video className="h-5 w-5 text-indigo-700" />
                    </div>
                    <div>
                      <p className="font-medium">Sesión RON</p>
                      <p className="text-sm text-muted-foreground">Estándar</p>
                    </div>
                  </CardContent>
                </Link>
              </Card>
              
              <Card className="hover:bg-slate-50 transition cursor-pointer border-indigo-100 hover:border-indigo-300">
                <Link href="/ron-client" className="block">
                  <CardContent className="p-4 flex items-center space-x-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <Video className="h-5 w-5 text-green-700" />
                    </div>
                    <div>
                      <p className="font-medium">Cliente RON</p>
                      <p className="text-sm text-muted-foreground">Mejorado</p>
                    </div>
                  </CardContent>
                </Link>
              </Card>
              
              <Card className="hover:bg-slate-50 transition cursor-pointer border-indigo-100 hover:border-indigo-300">
                <Link href="/ron-agora-kit-test" className="block">
                  <CardContent className="p-4 flex items-center space-x-3">
                    <div className="bg-purple-100 rounded-full p-2">
                      <Users className="h-5 w-5 text-purple-700" />
                    </div>
                    <div>
                      <p className="font-medium">RON UI Kit</p>
                      <p className="text-sm text-muted-foreground">Nueva versión</p>
                    </div>
                  </CardContent>
                </Link>
              </Card>
              
              <Card className="hover:bg-slate-50 transition cursor-pointer border-indigo-100 hover:border-indigo-300">
                <Link href="/integraciones-demo" className="block">
                  <CardContent className="p-4 flex items-center space-x-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <ClipboardList className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="font-medium">Integraciones</p>
                      <p className="text-sm text-muted-foreground">API y SDK</p>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </div>
          </div>
          
          {/* Contenido principal */}
          <Tabs defaultValue="all-sessions" className="w-full">
            <TabsList className="w-full bg-muted mb-6">
              <TabsTrigger value="all-sessions" className="flex-1">Todas las Sesiones</TabsTrigger>
              <TabsTrigger value="waiting-room" className="flex-1">Sala de Espera</TabsTrigger>
              <TabsTrigger value="internal-meetings" className="flex-1">Reuniones Internas</TabsTrigger>
              <TabsTrigger value="history" className="flex-1">Historial</TabsTrigger>
            </TabsList>
            
            {/* Pestaña de todas las sesiones */}
            <TabsContent value="all-sessions">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:items-center">
                  <div className="flex flex-1 space-x-4">
                    <div className="relative flex-1 max-w-md">
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
                        <SelectItem value="programada">Programadas</SelectItem>
                        <SelectItem value="en_espera">En espera</SelectItem>
                        <SelectItem value="en_curso">En curso</SelectItem>
                        <SelectItem value="completada">Completadas</SelectItem>
                        <SelectItem value="cancelada">Canceladas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button onClick={() => setShowCreateSessionDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Sesión RON
                  </Button>
                </div>
                
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Documento</TableHead>
                          <TableHead>Fecha y Hora</TableHead>
                          <TableHead>Región</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              <div className="flex justify-center items-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">Cargando sesiones...</p>
                            </TableCell>
                          </TableRow>
                        ) : filteredSessions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              <div className="flex flex-col items-center justify-center">
                                <ClipboardList className="h-12 w-12 text-muted-foreground opacity-30" />
                                <p className="mt-2 text-muted-foreground">No hay sesiones disponibles</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredSessions.map((session) => (
                            <TableRow key={session.id}>
                              <TableCell className="font-medium">{session.id}</TableCell>
                              <TableCell>{session.client}</TableCell>
                              <TableCell>{session.documentType}</TableCell>
                              <TableCell>
                                {new Date(session.scheduledFor).toLocaleDateString('es-CL')} {new Date(session.scheduledFor).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="rounded-full">
                                  {session.region}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={mockStatusColors[session.status] || ""}>
                                  {session.status.replace("_", " ")}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
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
                                      <DropdownMenuItem>
                                        <Link href={`/ron-session/${session.id}`}>
                                          <span className="flex items-center w-full">
                                            <Video className="mr-2 h-4 w-4" /> Iniciar sesión
                                          </span>
                                        </Link>
                                      </DropdownMenuItem>
                                    )}
                                    
                                    {session.status === "en_espera" && (
                                      <DropdownMenuItem>
                                        <Link href={`/ron-session/${session.id}`}>
                                          <span className="flex items-center w-full">
                                            <Video className="mr-2 h-4 w-4" /> Admitir a sala
                                          </span>
                                        </Link>
                                      </DropdownMenuItem>
                                    )}
                                    
                                    {session.status === "completada" && (
                                      <>
                                        <DropdownMenuItem>
                                          <span className="flex items-center">
                                            <Download className="mr-2 h-4 w-4" /> Descargar acta
                                          </span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <span className="flex items-center">
                                            <FileText className="mr-2 h-4 w-4" /> Ver ficha completa
                                          </span>
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    
                                    <DropdownMenuItem onClick={() => handleViewSessionDetails(session)}>
                                      <span className="flex items-center">
                                        <ClipboardList className="mr-2 h-4 w-4" /> Detalles de sesión
                                      </span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Pestaña de sala de espera */}
            <TabsContent value="waiting-room">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Clientes en sala de espera</CardTitle>
                    <CardDescription>
                      Participantes que están listos para iniciar su sesión de certificación remota
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filteredSessions.filter(s => s.status === "en_espera").length === 0 ? (
                      <div className="text-center py-8">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <Clock className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">No hay clientes en espera</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Actualmente no hay clientes esperando para una sesión de certificación.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredSessions
                          .filter(s => s.status === "en_espera")
                          .map(session => (
                            <Card key={session.id} className="overflow-hidden">
                              <div className="p-4 flex space-x-4 items-center">
                                <div className="bg-primary/10 p-3 rounded-full">
                                  <User className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between">
                                    <div>
                                      <h4 className="font-medium">{session.client}</h4>
                                      <p className="text-sm text-muted-foreground">{session.documentType}</p>
                                    </div>
                                    <Badge className="bg-orange-50 text-orange-700 border-orange-200">
                                      En espera ({Math.floor(Math.random() * 10) + 1} min)
                                    </Badge>
                                  </div>
                                  <div className="mt-2 text-sm flex justify-between">
                                    <div className="flex items-center">
                                      <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                      <span className="text-muted-foreground">{new Date(session.scheduledFor).toLocaleDateString('es-CL')}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                      <span className="text-muted-foreground">{new Date(session.scheduledFor).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <Link href={`/ron-session/${session.id}`}>
                                    <Button>
                                      <Video className="h-4 w-4 mr-2" />
                                      Iniciar ahora
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </Card>
                          ))
                        }
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Pestaña de historial */}
            {/* Pestaña de reuniones internas */}
            <TabsContent value="internal-meetings">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:items-center">
                  <div className="flex flex-1 space-x-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar reunión..."
                        className="pl-8"
                      />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="upcoming">Próximas</SelectItem>
                        <SelectItem value="past">Pasadas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva reunión interna
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crear reunión interna</DialogTitle>
                        <DialogDescription>
                          Organice una videollamada con otros profesionales del equipo
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Título de la reunión</label>
                          <Input placeholder="Ej: Coordinación semanal del equipo" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Fecha</label>
                            <Input 
                              type="date" 
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Hora</label>
                            <Input type="time" />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Duración estimada</label>
                          <Select defaultValue="30">
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione duración" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 minutos</SelectItem>
                              <SelectItem value="30">30 minutos</SelectItem>
                              <SelectItem value="45">45 minutos</SelectItem>
                              <SelectItem value="60">1 hora</SelectItem>
                              <SelectItem value="90">1 hora 30 minutos</SelectItem>
                              <SelectItem value="120">2 horas</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Participantes</label>
                          <div className="border rounded-md p-3 bg-muted/20">
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge className="flex items-center gap-1 bg-primary/20 hover:bg-primary/30 text-primary">
                                Ana López <X className="h-3 w-3" />
                              </Badge>
                              <Badge className="flex items-center gap-1 bg-primary/20 hover:bg-primary/30 text-primary">
                                Carlos Mendoza <X className="h-3 w-3" />
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Input placeholder="Agregar participante..." className="flex-1" />
                              <Button type="button" size="sm" variant="outline">
                                Agregar
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Descripción o agenda (opcional)</label>
                          <Textarea placeholder="Detalles de la reunión..." />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline">Cancelar</Button>
                        <Button>Crear reunión</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Próximas reuniones</h3>
                  <div className="space-y-4">
                    <Card>
                      <div className="p-4 flex gap-4">
                        <div className="bg-primary/10 rounded-md p-3 flex items-center justify-center h-16 w-16">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div>
                              <h4 className="font-medium">Reunión de coordinación semanal</h4>
                              <p className="text-sm text-muted-foreground">Lunes, 29 de abril • 10:00 - 11:00</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Calendar className="h-4 w-4 mr-2" />
                                Agendar
                              </Button>
                              <Button size="sm">
                                <Video className="h-4 w-4 mr-2" />
                                Unirse
                              </Button>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1">
                            <div className="flex -space-x-2">
                              <Avatar className="border-2 border-background h-7 w-7">
                                <AvatarFallback className="bg-primary/20 text-xs">AL</AvatarFallback>
                              </Avatar>
                              <Avatar className="border-2 border-background h-7 w-7">
                                <AvatarFallback className="bg-green-100 text-green-800 text-xs">CM</AvatarFallback>
                              </Avatar>
                              <Avatar className="border-2 border-background h-7 w-7">
                                <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">FS</AvatarFallback>
                              </Avatar>
                              <div className="flex items-center justify-center border-2 border-background bg-muted h-7 w-7 rounded-full">
                                <span className="text-xs font-medium">+2</span>
                              </div>
                            </div>
                            <div className="flex-1"></div>
                            <Badge variant="outline" className="ml-auto">Reunión interna</Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                    
                    <Card>
                      <div className="p-4 flex gap-4">
                        <div className="bg-orange-100 rounded-md p-3 flex items-center justify-center h-16 w-16">
                          <Users className="h-6 w-6 text-orange-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div>
                              <h4 className="font-medium">Capacitación: Nuevos procesos de certificación</h4>
                              <p className="text-sm text-muted-foreground">Martes, 30 de abril • 15:30 - 17:00</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Calendar className="h-4 w-4 mr-2" />
                                Agendar
                              </Button>
                              <Button variant="secondary" size="sm">
                                <Video className="h-4 w-4 mr-2" />
                                Unirse (en 2 días)
                              </Button>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1">
                            <div className="flex -space-x-2">
                              <Avatar className="border-2 border-background h-7 w-7">
                                <AvatarFallback className="bg-primary/20 text-xs">AL</AvatarFallback>
                              </Avatar>
                              <div className="flex items-center justify-center border-2 border-background bg-muted h-7 w-7 rounded-full">
                                <span className="text-xs font-medium">+8</span>
                              </div>
                            </div>
                            <div className="flex-1"></div>
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Capacitación</Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Reuniones recientes</h3>
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Título</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Participantes</TableHead>
                            <TableHead>Duración</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Reunión de planificación mensual</TableCell>
                            <TableCell>25/04/2025</TableCell>
                            <TableCell>6 participantes</TableCell>
                            <TableCell>45 minutos</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Descargar grabación
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Actualización de procedimientos</TableCell>
                            <TableCell>18/04/2025</TableCell>
                            <TableCell>4 participantes</TableCell>
                            <TableCell>32 minutos</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Descargar grabación
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Revisión de casos especiales</TableCell>
                            <TableCell>15/04/2025</TableCell>
                            <TableCell>3 participantes</TableCell>
                            <TableCell>28 minutos</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Descargar grabación
                              </Button>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:items-center">
                  <div className="flex flex-1 space-x-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar en historial..."
                        className="pl-8"
                      />
                    </div>
                    <Select defaultValue="month">
                      <SelectTrigger className="w-[180px]">
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">Última semana</SelectItem>
                        <SelectItem value="month">Último mes</SelectItem>
                        <SelectItem value="quarter">Último trimestre</SelectItem>
                        <SelectItem value="year">Último año</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar informe
                  </Button>
                </div>
                
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Documento</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Código de pago</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSessions
                          .filter(s => ["completada", "cancelada"].includes(s.status))
                          .map(session => (
                            <TableRow key={session.id}>
                              <TableCell className="font-medium">{session.id}</TableCell>
                              <TableCell>{session.client}</TableCell>
                              <TableCell>{session.documentType}</TableCell>
                              <TableCell>
                                {new Date(session.scheduledFor).toLocaleDateString('es-CL')}
                              </TableCell>
                              <TableCell>
                                <Badge className={mockStatusColors[session.status] || ""}>
                                  {session.status.replace("_", " ")}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className="font-mono text-xs">{session.paymentCode}</span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleViewSessionDetails(session)}
                                >
                                  <ClipboardList className="h-4 w-4 mr-2" />
                                  Ficha
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        }
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Diálogo de detalles de sesión */}
      <Dialog open={showSessionDetailsDialog} onOpenChange={setShowSessionDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Ficha de Atención RON</DialogTitle>
            <DialogDescription>
              Detalles completos de la sesión de certificación remota
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">ID: {selectedSession.id}</h3>
                  <p className="text-sm text-muted-foreground">
                    Documento: {selectedSession.documentType}
                  </p>
                </div>
                <Badge className={mockStatusColors[selectedSession.status] || ""}>
                  {selectedSession.status.replace("_", " ")}
                </Badge>
              </div>
              
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="summary">Resumen</TabsTrigger>
                  <TabsTrigger value="details">Ficha completa</TabsTrigger>
                  <TabsTrigger value="documents">Documentos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary">
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center">
                            <User className="h-4 w-4 mr-2 text-primary" />
                            Datos del cliente
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-1 text-sm">
                            <p><strong>Nombre:</strong> {mockCompletedSession.client.name}</p>
                            <p><strong>RUT:</strong> {mockCompletedSession.client.id}</p>
                            <p><strong>Email:</strong> {mockCompletedSession.client.email}</p>
                            <p><strong>Teléfono:</strong> {mockCompletedSession.client.phone}</p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-primary" />
                            Datos del documento
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-1 text-sm">
                            <p><strong>Tipo:</strong> {mockCompletedSession.document.type}</p>
                            <p><strong>Título:</strong> {mockCompletedSession.document.title}</p>
                            <p><strong>Páginas:</strong> {mockCompletedSession.document.pages}</p>
                            <p><strong>Anexos:</strong> {mockCompletedSession.document.attachments.join(', ')}</p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center">
                            <Video className="h-4 w-4 mr-2 text-primary" />
                            Detalles de sesión
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-1 text-sm">
                            <p><strong>Programada:</strong> {new Date(mockCompletedSession.session.scheduledFor).toLocaleString('es-CL')}</p>
                            <p><strong>Iniciada:</strong> {new Date(mockCompletedSession.session.startedAt).toLocaleString('es-CL')}</p>
                            <p><strong>Finalizada:</strong> {new Date(mockCompletedSession.session.endedAt).toLocaleString('es-CL')}</p>
                            <p><strong>Duración:</strong> {mockCompletedSession.session.duration}</p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                            Observaciones
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-1 text-sm">
                            <p>{mockCompletedSession.session.observations}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="flex justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        <p>Profesional certificador: {mockCompletedSession.professional.name}</p>
                        <p>Licencia: {mockCompletedSession.professional.license}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar PDF
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="details">
                  <div className="space-y-6 pt-2">
                    <div className="border rounded-md p-4 space-y-4">
                      <h3 className="font-medium">Métodos de verificación utilizados</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {mockCompletedSession.session.verificationMethods.map((method, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>{method}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4 space-y-4">
                      <h3 className="font-medium">Cronología de la sesión</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between border-b pb-2">
                          <span>Código de pago generado</span>
                          <span className="text-muted-foreground">{new Date(mockCompletedSession.payment.date).toLocaleString('es-CL')}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span>Sesión programada</span>
                          <span className="text-muted-foreground">{new Date(mockCompletedSession.session.scheduledFor).toLocaleString('es-CL')}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span>Cliente ingresó a sala de espera</span>
                          <span className="text-muted-foreground">{new Date(new Date(mockCompletedSession.session.startedAt).getTime() - 3*60000).toLocaleString('es-CL')}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span>Inicio de verificación de identidad</span>
                          <span className="text-muted-foreground">{new Date(mockCompletedSession.session.startedAt).toLocaleString('es-CL')}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span>Verificación completada exitosamente</span>
                          <span className="text-muted-foreground">{new Date(new Date(mockCompletedSession.session.startedAt).getTime() + 5*60000).toLocaleString('es-CL')}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span>Inicio de revisión de documentos</span>
                          <span className="text-muted-foreground">{new Date(new Date(mockCompletedSession.session.startedAt).getTime() + 7*60000).toLocaleString('es-CL')}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span>Certificación completada</span>
                          <span className="text-muted-foreground">{new Date(mockCompletedSession.session.endedAt).toLocaleString('es-CL')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4 space-y-4">
                      <h3 className="font-medium">Datos de pago</h3>
                      <div className="space-y-1 text-sm">
                        <p><strong>Código:</strong> {mockCompletedSession.payment.code}</p>
                        <p><strong>Monto:</strong> ${mockCompletedSession.payment.amount.toLocaleString('es-CL')}</p>
                        <p><strong>Método:</strong> {mockCompletedSession.payment.method}</p>
                        <p><strong>Fecha:</strong> {new Date(mockCompletedSession.payment.date).toLocaleString('es-CL')}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="documents">
                  <div className="space-y-4 pt-2">
                    <div className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Documento principal</h3>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Descargar
                        </Button>
                      </div>
                      <div className="bg-muted/30 rounded-md p-4 flex items-center">
                        <FileText className="h-12 w-12 text-primary/70 mr-4" />
                        <div>
                          <h4 className="font-medium">{mockCompletedSession.document.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Documento certificado • {mockCompletedSession.document.pages} páginas • PDF
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-4">Documentos anexos</h3>
                      <div className="space-y-3">
                        {mockCompletedSession.document.attachments.map((attachment, index) => (
                          <div key={index} className="bg-muted/30 rounded-md p-3 flex items-center justify-between">
                            <div className="flex items-center">
                              <FileText className="h-8 w-8 text-muted-foreground mr-3" />
                              <div>
                                <h4 className="text-sm font-medium">{attachment}</h4>
                                <p className="text-xs text-muted-foreground">Anexo {index + 1} • PDF</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Grabación de sesión</h3>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Descargar
                        </Button>
                      </div>
                      <div className="bg-muted/30 rounded-md p-4 flex items-center">
                        <Video className="h-12 w-12 text-primary/70 mr-4" />
                        <div>
                          <h4 className="font-medium">Grabación de sesión RON</h4>
                          <p className="text-sm text-muted-foreground">
                            Sesión {selectedSession.id} • Duración: {mockCompletedSession.session.duration} • MP4
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          <DialogFooter className="flex justify-between items-center pt-2">
            <Button variant="outline" onClick={() => setShowSessionDetailsDialog(false)}>
              Cerrar
            </Button>
            <div className="flex space-x-2">
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Descargar ficha completa
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para crear una nueva sesión RON */}
      <Dialog open={showCreateSessionDialog} onOpenChange={setShowCreateSessionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nueva sesión RON</DialogTitle>
            <DialogDescription>
              Ingrese los detalles para programar una nueva sesión de certificación remota
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre del cliente</label>
                  <Input placeholder="Nombre completo" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">RUT/ID</label>
                  <Input placeholder="12.345.678-9" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email del cliente</label>
              <Input type="email" placeholder="cliente@ejemplo.com" />
              <p className="text-xs text-muted-foreground">El código de acceso será enviado a este email</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de documento</label>
              <Select defaultValue="poder">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poder">Poder Notarial</SelectItem>
                  <SelectItem value="declaracion">Declaración Jurada</SelectItem>
                  <SelectItem value="contrato_arriendo">Contrato de Arriendo</SelectItem>
                  <SelectItem value="compraventa">Contrato de Compraventa</SelectItem>
                  <SelectItem value="otros">Otros Documentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha</label>
                <Input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hora</label>
                <Input type="time" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Observaciones (opcional)</label>
              <Textarea placeholder="Comentarios o instrucciones adicionales" />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateSessionDialog(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}