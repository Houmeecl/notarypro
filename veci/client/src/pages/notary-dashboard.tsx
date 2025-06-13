import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useLocation, Link } from 'wouter';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  BarChart4,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  Filter,
  Fingerprint,
  History,
  Layers,
  List,
  Loader2,
  MessageSquare,
  PanelLeftClose,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Star,
  Ticket,
  User,
  Users,
  X
} from "lucide-react";

import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusColors = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-slate-100 text-slate-800",
  rejected: "bg-red-100 text-red-800",
  archived: "bg-gray-100 text-gray-800",
  closed: "bg-purple-100 text-purple-800",
  error: "bg-red-100 text-red-800",
};

const mockAppointments = [
  {
    id: 1,
    clientName: "Juan Pérez",
    date: new Date(2025, 3, 28, 10, 30),
    duration: 45,
    service: "Escritura de Compraventa",
    status: "scheduled"
  },
  {
    id: 2,
    clientName: "María González",
    date: new Date(2025, 3, 28, 14, 0),
    duration: 30,
    service: "Poder Notarial",
    status: "scheduled"
  },
  {
    id: 3,
    clientName: "Roberto Sánchez",
    date: new Date(2025, 3, 27, 11, 0),
    duration: 60,
    service: "Testamento",
    status: "completed"
  },
  {
    id: 4,
    clientName: "Carmen Rodríguez",
    date: new Date(2025, 3, 26, 15, 30),
    duration: 30,
    service: "Certificación de Documentos",
    status: "cancelled"
  }
];

const mockProtocolBooks = [
  {
    id: 1,
    bookNumber: 1,
    year: 2025,
    startDate: new Date(2025, 0, 1),
    endDate: null,
    totalDocuments: 87,
    status: "active"
  },
  {
    id: 2,
    bookNumber: 12,
    year: 2024,
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 11, 31),
    totalDocuments: 243,
    status: "closed"
  },
  {
    id: 3,
    bookNumber: 11,
    year: 2023,
    startDate: new Date(2023, 0, 1),
    endDate: new Date(2023, 11, 31),
    totalDocuments: 231,
    status: "archived"
  }
];

const mockRecentDeeds = [
  {
    id: 1,
    deedNumber: "2025-0087",
    type: "Escritura de Compraventa",
    title: "Compraventa Propiedad Calle Los Alamos 1234",
    date: new Date(2025, 3, 27),
    parties: ["Inmobiliaria Los Pinos", "Andrés Gutiérrez"],
    status: "active"
  },
  {
    id: 2,
    deedNumber: "2025-0086",
    type: "Poder Notarial",
    title: "Poder General María Delgado a favor de José Fuentes",
    date: new Date(2025, 3, 26),
    parties: ["María Delgado", "José Fuentes"],
    status: "active"
  },
  {
    id: 3,
    deedNumber: "2025-0085",
    type: "Testamento",
    title: "Testamento de Ricardo Montero",
    date: new Date(2025, 3, 25),
    parties: ["Ricardo Montero"],
    status: "active"
  }
];

const mockStats = {
  revenueThisMonth: 2850000, // In cents (CLP 2.850.000)
  appointmentsToday: 4,
  pendingVerifications: 2,
  documentsThisMonth: 23
};

const StatusBadge = ({ status }) => {
  const colorClass = statusColors[status] || "bg-gray-100 text-gray-800";
  
  const getStatusText = (status) => {
    const statusMap = {
      active: "Activo",
      pending: "Pendiente",
      scheduled: "Programado",
      completed: "Completado",
      cancelled: "Cancelado",
      no_show: "No Asistió",
      rejected: "Rechazado",
      archived: "Archivado",
      closed: "Cerrado",
      error: "Error"
    };
    
    return statusMap[status] || status;
  };
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
      {getStatusText(status)}
    </span>
  );
};

const NotaryDashboard = () => {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  
  // Esta función permanecería desactivada ya que el dashboard está inactivo inicialmente
  const handleCreateDeed = () => {
    toast({
      title: "Característica no disponible",
      description: "La creación de escrituras está temporalmente desactivada.",
      variant: "default",
    });
  };
  
  // Igualmente esta función permanece desactivada
  const handleCreateAppointment = () => {
    toast({
      title: "Característica no disponible",
      description: "La programación de citas está temporalmente desactivada.",
      variant: "default",
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount / 100); // Convert cents to pesos
  };
  
  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Datos actualizados",
        description: "Se ha actualizado la información del panel.",
        variant: "default",
      });
    }, 1000);
  };
  
  const getTodayAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return mockAppointments.filter(appt => {
      const apptDate = new Date(appt.date);
      apptDate.setHours(0, 0, 0, 0);
      return apptDate.getTime() === today.getTime();
    });
  };
  
  const getSelectedDateAppointments = () => {
    if (!selectedDate) return [];
    
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    
    return mockAppointments.filter(appt => {
      const apptDate = new Date(appt.date);
      apptDate.setHours(0, 0, 0, 0);
      return apptDate.getTime() === selected.getTime();
    });
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner with Warning */}
      <div className="w-full bg-yellow-100 border-b border-yellow-200">
        <div className="container mx-auto py-2 px-4 flex items-center justify-between">
          <div className="flex items-center text-yellow-800">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span className="text-sm">Funcionalidad en desarrollo - Demo solamente</span>
          </div>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
            Desactivado
          </Badge>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Panel Notarial</h1>
            <p className="text-muted-foreground">
              Gestione escrituras, protocolos y verificaciones biométricas
            </p>
          </div>
          <div className="flex items-center mt-4 md:mt-0 space-x-2">
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center"
              onClick={refreshData}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4 mr-2" />
              )}
              Actualizar
            </Button>
            
            <Button 
              variant="default" 
              size="sm"
              className="flex items-center"
              onClick={() => setIsProfileModalOpen(true)}
            >
              <User className="h-4 w-4 mr-2" />
              Perfil Notarial
            </Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(mockStats.revenueThisMonth)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-500 font-medium">↑ 12%</span> respecto al mes anterior
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Citas de Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.appointmentsToday}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {getTodayAppointments().length} programadas, {mockStats.appointmentsToday - getTodayAppointments().length} completadas
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Verificaciones Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.pendingVerifications}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Requieren validación biométrica
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Documentos del Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.documentsThisMonth}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-500 font-medium">↑ 8%</span> respecto al mes anterior
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid grid-cols-5 w-full mb-4">
            <TabsTrigger value="dashboard">Panel</TabsTrigger>
            <TabsTrigger value="appointments">Agenda</TabsTrigger>
            <TabsTrigger value="protocols">Protocolos</TabsTrigger>
            <TabsTrigger value="documents">Escrituras</TabsTrigger>
            <TabsTrigger value="verifications">Verificaciones</TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <History className="h-5 w-5 mr-2 text-primary" />
                    Actividad Reciente
                  </CardTitle>
                  <CardDescription>Últimas operaciones notariales</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[320px] pr-4">
                    <div className="space-y-4">
                      {mockRecentDeeds.map((deed, index) => (
                        <div key={deed.id} className="flex items-start">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium">{deed.title}</p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <span className="font-medium">{deed.deedNumber}</span>
                              <span className="mx-1">•</span>
                              <span>{format(deed.date, 'dd/MM/yyyy', { locale: es })}</span>
                              <span className="mx-1">•</span>
                              <span>{deed.type}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-start">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                          <Fingerprint className="h-4 w-4 text-blue-700" />
                        </div>
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium">Verificación biométrica completada</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span className="font-medium">ID-20250426-003</span>
                            <span className="mx-1">•</span>
                            <span>26/04/2025</span>
                            <span className="mx-1">•</span>
                            <span>Identificación facial</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100">
                          <CalendarDays className="h-4 w-4 text-green-700" />
                        </div>
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium">Nueva cita programada</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span className="font-medium">Laura Méndez</span>
                            <span className="mx-1">•</span>
                            <span>29/04/2025</span>
                            <span className="mx-1">•</span>
                            <span>Testamento</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              
              {/* Today's Schedule */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    Agenda de Hoy
                  </CardTitle>
                  <CardDescription>
                    {format(new Date(), "EEEE, d 'de' MMMM, yyyy", { locale: es })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {getTodayAppointments().length > 0 ? (
                    <ScrollArea className="h-[320px] pr-4">
                      <div className="space-y-4">
                        {getTodayAppointments().map(appt => (
                          <div key={appt.id} className="flex items-start border-l-2 border-primary pl-3 py-1">
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">{appt.clientName}</p>
                                <StatusBadge status={appt.status} />
                              </div>
                              <p className="text-xs text-muted-foreground">{appt.service}</p>
                              <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>
                                  {format(appt.date, "HH:mm", { locale: es })} - 
                                  {format(
                                    new Date(appt.date.getTime() + appt.duration * 60000),
                                    " HH:mm",
                                    { locale: es }
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[320px] p-4">
                      <CalendarDays className="h-10 w-10 text-muted-foreground/50 mb-2" />
                      <p className="text-center text-muted-foreground">No hay citas programadas para hoy</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={handleCreateAppointment}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agendar Nueva Cita
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>Tareas comunes del notario</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-24 gap-2"
                    onClick={handleCreateDeed}
                  >
                    <FileText className="h-6 w-6 text-primary" />
                    <span>Nueva Escritura</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-24 gap-2"
                    onClick={handleCreateAppointment}
                  >
                    <CalendarDays className="h-6 w-6 text-primary" />
                    <span>Nueva Cita</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-24 gap-2"
                  >
                    <Fingerprint className="h-6 w-6 text-primary" />
                    <span>Verificación Biométrica</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-24 gap-2"
                  >
                    <Layers className="h-6 w-6 text-primary" />
                    <span>Gestión de Protocolos</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Calendario</CardTitle>
                    <CardDescription>Seleccione una fecha para ver las citas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                      locale={es}
                    />
                    
                    <div className="mt-4">
                      <Button 
                        className="w-full"
                        onClick={handleCreateAppointment}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Cita
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        Citas del {selectedDate && format(selectedDate, "dd 'de' MMMM, yyyy", { locale: es })}
                      </CardTitle>
                      <CardDescription>Detalle de las citas programadas</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtrar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Search className="h-4 w-4 mr-2" />
                        Buscar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {getSelectedDateAppointments().length > 0 ? (
                      <div className="space-y-4">
                        {getSelectedDateAppointments().map(appt => (
                          <div key={appt.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{appt.clientName}</p>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{format(appt.date, "HH:mm", { locale: es })}</span>
                                  <span className="mx-1">•</span>
                                  <span>{appt.duration} min</span>
                                  <span className="mx-1">•</span>
                                  <span>{appt.service}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={appt.status} />
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-3" />
                        <p className="text-center text-muted-foreground">No hay citas programadas para esta fecha</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={handleCreateAppointment}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agendar Nueva Cita
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Protocols Tab */}
          <TabsContent value="protocols" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Libros de Protocolo</CardTitle>
                  <CardDescription>Gestión de protocolos notariales</CardDescription>
                </div>
                <Button onClick={() => toast({
                  title: "Función desactivada",
                  description: "La creación de protocolos está temporalmente desactivada.",
                })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Protocolo
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-6 py-3 px-4 font-medium border-b">
                    <div className="col-span-1">Número</div>
                    <div className="col-span-1">Año</div>
                    <div className="col-span-1">Inicio</div>
                    <div className="col-span-1">Fin</div>
                    <div className="col-span-1">Documentos</div>
                    <div className="col-span-1">Estado</div>
                  </div>
                  
                  {mockProtocolBooks.map(book => (
                    <div key={book.id} className="grid grid-cols-6 py-3 px-4 border-b hover:bg-muted/50 transition-colors">
                      <div className="col-span-1 font-medium">{book.bookNumber}</div>
                      <div className="col-span-1">{book.year}</div>
                      <div className="col-span-1">{format(book.startDate, 'dd/MM/yyyy')}</div>
                      <div className="col-span-1">
                        {book.endDate ? format(book.endDate, 'dd/MM/yyyy') : 'Activo'}
                      </div>
                      <div className="col-span-1">{book.totalDocuments}</div>
                      <div className="col-span-1">
                        <StatusBadge status={book.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Estadísticas de Protocolos</CardTitle>
                  <CardDescription>Resumen de actividad protocolaria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total de protocolos activos:</span>
                      <span className="font-bold">1</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Documentos este año:</span>
                      <span className="font-bold">87</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Documentos año anterior:</span>
                      <span className="font-bold">243</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Promedio mensual:</span>
                      <span className="font-bold">21.75</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Acciones</CardTitle>
                  <CardDescription>Gestione sus protocolos notariales</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center h-16"
                      onClick={() => toast({
                        title: "Función desactivada",
                        description: "Esta acción está temporalmente desactivada.",
                      })}
                    >
                      <Layers className="h-5 w-5 mr-2" />
                      <span>Cerrar Protocolo</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center h-16"
                      onClick={() => toast({
                        title: "Función desactivada",
                        description: "Esta acción está temporalmente desactivada.",
                      })}
                    >
                      <BookOpen className="h-5 w-5 mr-2" />
                      <span>Índice Notarial</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center h-16"
                      onClick={() => toast({
                        title: "Función desactivada",
                        description: "Esta acción está temporalmente desactivada.",
                      })}
                    >
                      <BarChart4 className="h-5 w-5 mr-2" />
                      <span>Reportes</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center h-16"
                      onClick={() => toast({
                        title: "Función desactivada",
                        description: "Esta acción está temporalmente desactivada.",
                      })}
                    >
                      <Search className="h-5 w-5 mr-2" />
                      <span>Buscar</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Input 
                  placeholder="Buscar escrituras..."
                  className="w-[250px]"
                />
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
              <Button onClick={handleCreateDeed}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Escritura
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Escrituras y Documentos</CardTitle>
                <CardDescription>Gestione los documentos notariales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 py-3 px-4 font-medium border-b">
                    <div className="col-span-2">Número</div>
                    <div className="col-span-3">Título</div>
                    <div className="col-span-2">Tipo</div>
                    <div className="col-span-2">Fecha</div>
                    <div className="col-span-2">Estado</div>
                    <div className="col-span-1">Acciones</div>
                  </div>
                  
                  {mockRecentDeeds.map(deed => (
                    <div key={deed.id} className="grid grid-cols-12 py-3 px-4 border-b hover:bg-muted/50 transition-colors">
                      <div className="col-span-2 font-medium">{deed.deedNumber}</div>
                      <div className="col-span-3 truncate" title={deed.title}>{deed.title}</div>
                      <div className="col-span-2">{deed.type}</div>
                      <div className="col-span-2">{format(deed.date, 'dd/MM/yyyy')}</div>
                      <div className="col-span-2">
                        <StatusBadge status={deed.status} />
                      </div>
                      <div className="col-span-1 flex items-center">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Algunos documentos adicionales para el ejemplo */}
                  <div className="grid grid-cols-12 py-3 px-4 border-b hover:bg-muted/50 transition-colors">
                    <div className="col-span-2 font-medium">2025-0084</div>
                    <div className="col-span-3 truncate" title="Constitución Sociedad Responsabilidad Limitada">Constitución Sociedad Responsabilidad Limitada</div>
                    <div className="col-span-2">Constitución</div>
                    <div className="col-span-2">24/04/2025</div>
                    <div className="col-span-2">
                      <StatusBadge status="active" />
                    </div>
                    <div className="col-span-1 flex items-center">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-12 py-3 px-4 border-b hover:bg-muted/50 transition-colors">
                    <div className="col-span-2 font-medium">2025-0083</div>
                    <div className="col-span-3 truncate" title="Hipoteca Inmobiliario Av. Principal 567">Hipoteca Inmobiliario Av. Principal 567</div>
                    <div className="col-span-2">Hipoteca</div>
                    <div className="col-span-2">23/04/2025</div>
                    <div className="col-span-2">
                      <StatusBadge status="active" />
                    </div>
                    <div className="col-span-1 flex items-center">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando 6 de 87 documentos
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    Siguiente
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Verifications Tab */}
          <TabsContent value="verifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Verificaciones Biométricas</CardTitle>
                <CardDescription>Gestione las verificaciones de identidad</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Fingerprint className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Sistema de Verificación Biométrica</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    Esta sección permite gestionar la verificación biométrica de identidad mediante reconocimiento facial, huellas digitales y validación de documentos.
                  </p>
                  <Button variant="default" onClick={() => toast({
                    title: "Característica no disponible",
                    description: "El sistema de verificación biométrica está temporalmente desactivado.",
                    variant: "default",
                  })}>
                    <Fingerprint className="h-4 w-4 mr-2" />
                    Iniciar Verificación
                  </Button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="flex flex-col items-center p-4 rounded-lg border bg-muted/50">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                        <Users className="h-6 w-6 text-blue-700" />
                      </div>
                      <h4 className="font-medium mb-1">Verificaciones Pendientes</h4>
                      <p className="text-3xl font-bold">{mockStats.pendingVerifications}</p>
                    </div>
                    
                    <div className="flex flex-col items-center p-4 rounded-lg border bg-muted/50">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                        <Check className="h-6 w-6 text-green-700" />
                      </div>
                      <h4 className="font-medium mb-1">Completadas (Mes)</h4>
                      <p className="text-3xl font-bold">18</p>
                    </div>
                    
                    <div className="flex flex-col items-center p-4 rounded-lg border bg-muted/50">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                        <Star className="h-6 w-6 text-amber-700" />
                      </div>
                      <h4 className="font-medium mb-1">Precisión</h4>
                      <p className="text-3xl font-bold">99.7%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Notary Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Perfil Notarial</DialogTitle>
            <DialogDescription>
              Información del perfil notarial registrado en el sistema
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1">
              <div className="flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarFallback className="text-2xl">
                    {user?.fullName?.substring(0, 2).toUpperCase() || "NT"}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="text-lg font-semibold">{user?.fullName || "Notario Público"}</h3>
                <p className="text-sm text-muted-foreground mb-4">Notario Público</p>
                
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300 mb-2">
                  Perfil Desactivado
                </Badge>
                
                <div className="w-full mt-4">
                  <Button variant="outline" className="w-full">
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="col-span-2">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Información Oficial</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Número de Registro</Label>
                      <Input value="NP-2024-0015" readOnly />
                    </div>
                    <div>
                      <Label>Número de Licencia</Label>
                      <Input value="CLN-15893" readOnly />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Jurisdicción</h4>
                  <Input value="Santiago, Región Metropolitana" readOnly />
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Información de Contacto</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label>Dirección de Oficina</Label>
                      <Input value="Av. Libertador Bernardo O'Higgins 1234, Of. 567, Santiago" readOnly />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Teléfono</Label>
                        <Input value="+56 2 2123 4567" readOnly />
                      </div>
                      <div>
                        <Label>Correo Electrónico</Label>
                        <Input value="notario@ejemplo.cl" readOnly />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Firma Digital</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>ID de Firma Digital</Label>
                      <Input value="DS-2025-6789-ABCD" readOnly />
                    </div>
                    <div>
                      <Label>Fecha de Vencimiento</Label>
                      <Input value="31/12/2025" readOnly />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Especialización</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">Bienes Raíces</Badge>
                    <Badge variant="secondary">Derecho Societario</Badge>
                    <Badge variant="secondary">Testamentos</Badge>
                    <Badge variant="secondary">Poderes</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProfileModalOpen(false)}>
              Cerrar
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotaryDashboard;