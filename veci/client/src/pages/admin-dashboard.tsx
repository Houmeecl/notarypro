import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { StatCard } from "@/components/dashboard/StatCard";
import { DocumentStats } from "@/components/dashboard/charts/DocumentStats";
import { ActivityTimeline } from "@/components/dashboard/charts/ActivityTimeline";
import { RevenueTrend } from "@/components/dashboard/charts/RevenueTrend";
import { PerformanceMetrics } from "@/components/dashboard/charts/PerformanceMetrics";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { 
  Users, 
  FileText, 
  GraduationCap, 
  Search, 
  UserPlus, 
  Shield, 
  BarChart3, 
  Clock, 
  FileCheck, 
  Download, 
  Pencil, 
  UserCheck,
  DollarSign,
  CreditCard,
  Activity,
  TrendingUp,
  Calendar,
  Plug,
  Video,
  Database,
  Bell,
  BellRing,
  Brain,
  Sparkles,
  XCircle,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { User, Document, Course } from "@shared/schema";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  // Mutation for updating course price
  const updateCoursePriceMutation = useMutation({
    mutationFn: async ({ courseId, price }: { courseId: number, price: number }) => {
      const res = await apiRequest("PATCH", `/api/courses/${courseId}`, { price });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Precio actualizado",
        description: `El precio del curso ha sido actualizado a $${data.price / 100}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar precio",
        description: "No se pudo actualizar el precio del curso. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    },
  });
  
  // Mutation for updating user role
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number, role: string }) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}`, { role });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Rol actualizado",
        description: `El usuario ha sido actualizado a ${data.role === 'certifier' ? 'Certificador' : data.role}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar rol",
        description: "No se pudo actualizar el rol del usuario. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    },
  });
  
  // Mutation for updating user details
  const updateUserDetailsMutation = useMutation({
    mutationFn: async ({ userId, userData }: { userId: number, userData: Partial<User> }) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}`, userData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario han sido actualizados correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar usuario",
        description: "No se pudo actualizar los datos del usuario. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    },
  });

  // Fetch users
  const { data: users, isLoading: isUsersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Fetch certifiers
  const { data: certifiers, isLoading: isCertifiersLoading } = useQuery<User[]>({
    queryKey: ["/api/users", { role: "certifier" }],
  });

  // Fetch documents
  const { data: documents, isLoading: isDocumentsLoading } = useQuery<Document[]>({
    queryKey: ["/api/certifier/documents"],
  });

  // Fetch courses
  const { data: courses, isLoading: isCoursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  // Format date helper
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Filter users by search term
  const filteredUsers = users?.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch analytics data
  const { data: userActivityStats, isLoading: isUserActivityLoading } = useQuery({
    queryKey: ["/api/analytics/user-activity"],
  });

  const { data: documentStats, isLoading: isDocumentStatsLoading } = useQuery({
    queryKey: ["/api/analytics/document-stats"],
  });

  const { data: revenueStats, isLoading: isRevenueStatsLoading } = useQuery({
    queryKey: ["/api/analytics/revenue-stats"],
  });

  const { data: dailyEventCounts, isLoading: isDailyEventsLoading } = useQuery({
    queryKey: ["/api/analytics/daily-events", {
      startDate: dateRange.from.toISOString(),
      endDate: dateRange.to.toISOString()
    }],
  });

  // Dashboard statistics
  const stats = {
    totalUsers: userActivityStats?.totalUsers || users?.length || 0,
    totalCertifiers: certifiers?.length || 0,
    totalDocuments: documentStats?.totalDocuments || documents?.length || 0,
    totalCourses: courses?.length || 0,
    pendingDocuments: documentStats?.documentsByStatus?.pending || documents?.filter(d => d.status === "pending").length || 0,
    signedDocuments: documentStats?.documentsByStatus?.signed || documents?.filter(d => d.status === "signed").length || 0,
    newUsersToday: userActivityStats?.newUsersToday || 0,
    newUsersThisWeek: userActivityStats?.newUsersThisWeek || 0,
    newUsersThisMonth: userActivityStats?.newUsersThisMonth || 0,
    revenueToday: revenueStats?.revenueToday || 0,
    revenueThisWeek: revenueStats?.revenueThisWeek || 0,
    revenueThisMonth: revenueStats?.revenueThisMonth || 0,
    totalRevenue: revenueStats?.totalRevenue || 0,
    documentRevenue: revenueStats?.documentRevenue || 0,
    courseRevenue: revenueStats?.courseRevenue || 0,
    videoCallRevenue: revenueStats?.videoCallRevenue || 0,
  };

  // Para gráfico de tendencia de ingresos
  const revenueData = [
    { name: "Ene", ingresos: 25000, gastos: 18000, target: 27000 },
    { name: "Feb", ingresos: 30000, gastos: 19500, target: 30000 },
    { name: "Mar", ingresos: 35000, gastos: 20000, target: 32000 },
    { name: "Abr", ingresos: 40000, gastos: 21000, target: 35000 },
    { name: "May", ingresos: 45000, gastos: 22000, target: 38000 },
    { name: "Jun", ingresos: stats.totalRevenue || 50000, gastos: 23000, target: 45000 },
  ];

  // Notificaciones del sistema
  const systemNotifications = [
    {
      id: 1,
      type: "warning" as const,
      title: "API keys pendientes",
      description: "Hay 4 servicios de integración que requieren configuración (CRM, VideoX, WhatsApp, Dialogflow).",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      link: "/admin/api-integrations"
    },
    {
      id: 2,
      type: "success" as const,
      title: "Nuevo usuario registrado",
      description: `Se registró un nuevo usuario (${stats.newUsersToday} hoy, ${stats.newUsersThisWeek} esta semana).`,
      date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      isRead: true
    },
    {
      id: 3,
      type: "info" as const,
      title: "Actualización del sistema",
      description: "Nueva versión del sistema disponible: Dashboards mejorados con visualización interactiva.",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isRead: false
    }
  ];

  // Estado para mensaje de bienvenida
  const [showWelcome, setShowWelcome] = useState(true);
  const { status: wsStatus } = useWebSocket();

  // Ocultar mensaje de bienvenida después de 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      
      <div className="md:pl-64 p-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-gray-900">Panel Maestro</h1>
                  <Badge variant={wsStatus === 'connected' ? 'outline' : 'destructive'} className="font-normal">
                    {wsStatus === 'connected' ? (
                      <>
                        <span className="inline-block h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                        Conectado
                      </>
                    ) : (
                      <>
                        <span className="inline-block h-2 w-2 bg-red-500 rounded-full mr-1"></span>
                        Desconectado
                      </>
                    )}
                  </Badge>
                </div>
                <p className="text-gray-500 mt-1">
                  Bienvenido{user?.fullName ? `, ${user.fullName}` : ''}. Administra todos los aspectos de la plataforma.
                </p>
              </div>
              <div className="flex gap-2">
                <Link href="/template-admin">
                  <Button variant="outline" size="sm" className="gap-1">
                    <FileText className="h-4 w-4" />
                    Plantillas
                  </Button>
                </Link>
                <Link href="/admin/api-integrations">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Plug className="h-4 w-4" />
                    Integraciones
                  </Button>
                </Link>
              </div>
            </div>
          </header>
          
          {showWelcome && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 flex items-center gap-3"
            >
              <div className="bg-primary/20 p-2 rounded-full">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">¡Dashboards mejorados con visualización interactiva!</h3>
                <p className="text-sm text-gray-600">Panel Maestro renovado con analítica avanzada y gráficos interactivos para optimizar la gestión de la plataforma.</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowWelcome(false)}
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
          
          <Tabs 
            defaultValue="dashboard" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid grid-cols-4 w-full max-w-xl">
              <TabsTrigger value="dashboard" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <Activity className="h-4 w-4" />
                <span>Analítica</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                <span>Usuarios</span>
              </TabsTrigger>
              <TabsTrigger value="courses" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                <span>Cursos</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Dashboard Tab */}
            <TabsContent value="dashboard">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                <div className="lg:col-span-9">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard 
                      title="Usuarios Totales"
                      value={stats.totalUsers}
                      icon={<Users className="h-5 w-5 text-blue-500" />}
                      trend={stats.newUsersThisMonth ? { value: Math.round(stats.newUsersThisMonth / (stats.totalUsers - stats.newUsersThisMonth) * 100), isPositive: true } : undefined}
                    />
                    
                    <StatCard 
                      title="Certificadores"
                      value={stats.totalCertifiers}
                      icon={<Shield className="h-5 w-5 text-purple-500" />}
                      iconBgColor="bg-purple-100"
                    />
                    
                    <StatCard 
                      title="Documentos Procesados"
                      value={stats.totalDocuments}
                      icon={<FileText className="h-5 w-5 text-green-500" />}
                      iconBgColor="bg-green-100"
                      description={`${stats.pendingDocuments} pendientes, ${stats.signedDocuments} firmados`}
                    />
                    
                    <StatCard 
                      title="Ingresos Totales"
                      value={stats.totalRevenue.toLocaleString('es-CL')}
                      valueUnit="CLP"
                      icon={<DollarSign className="h-5 w-5 text-emerald-500" />}
                      iconBgColor="bg-emerald-100"
                      trend={stats.revenueThisMonth ? { value: Math.round(stats.revenueThisMonth / stats.totalRevenue * 100), isPositive: true } : undefined}
                    />
                  </div>
                </div>
                
                <div className="lg:col-span-3">
                  <NotificationCenter 
                    notifications={systemNotifications}
                    maxHeight={200}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <DocumentStats 
                  title="Distribución de Documentos"
                  description="Estado actual de documentos en la plataforma"
                  documents={documents} 
                />
                
                <RevenueTrend 
                  title="Tendencia de Ingresos"
                  description="Evolución mensual de ingresos"
                  data={revenueData}
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                <div className="lg:col-span-7">
                  <ActivityTimeline 
                    title="Actividad Reciente"
                    description="Registro diario de documentos procesados"
                    data={documents}
                    period="daily"
                  />
                </div>
                
                <div className="lg:col-span-5">
                  <PerformanceMetrics 
                    title="Métricas de Rendimiento"
                    description="Análisis comparativo vs. período anterior"
                    data={[
                      {
                        nombre: 'Actual',
                        documentos: stats.totalDocuments,
                        valoracion: 4.7,
                        tiempo: 87,
                        certificaciones: stats.signedDocuments || 0,
                        completitud: 92
                      },
                      {
                        nombre: 'Período Anterior',
                        documentos: stats.totalDocuments * 0.8,
                        valoracion: 4.2,
                        tiempo: 65,
                        certificaciones: (stats.signedDocuments || 0) * 0.7,
                        completitud: 78
                      }
                    ]}
                  />
                </div>
              </div>
              
              {/* Configuración y accesos rápidos */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Configuración y servicios</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Link href="/admin/api-integrations">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Integraciones API</CardTitle>
                          <Plug className="h-5 w-5 text-purple-500" />
                        </div>
                        <CardDescription>
                          Configure las conexiones con servicios externos
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                          <span className="text-xs">4 servicios no configurados</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/videocall-interface-demo">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">VideoConferencia</CardTitle>
                          <Video className="h-5 w-5 text-red-500" />
                        </div>
                        <CardDescription>
                          Sistema de videoconferencia para certificaciones
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-xs">Demo disponible</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/admin/pos-management">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Gestión POS</CardTitle>
                          <BarChart3 className="h-5 w-5 text-blue-500" />
                        </div>
                        <CardDescription>
                          Ventas y comisiones de puntos Vecinos
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-xs">Sistema activo</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/admin/document-templates-manager">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-100 bg-green-50">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Plantillas de Documentos</CardTitle>
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <CardDescription>
                          Administre las plantillas del sistema
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-xs">Gestor de plantillas</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/admin/test-document-generator">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-red-100 bg-red-50">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Generador de Documentos</CardTitle>
                          <FileText className="h-5 w-5 text-red-500" />
                        </div>
                        <CardDescription>
                          Cree y firme documentos para pruebas (código 7723)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-red-500"></div>
                          <span className="text-xs font-medium text-red-700">Herramienta de administrador</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  

                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <Card>
                  <CardHeader>
                    <CardTitle>Usuarios Recientes</CardTitle>
                    <CardDescription>
                      Últimos usuarios registrados en la plataforma
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isUsersLoading ? (
                      <div className="flex justify-center py-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {users?.slice(0, 5).map((user) => (
                          <div key={user.id} className="flex items-center justify-between py-2">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium mr-3">
                                {user.fullName.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium">{user.fullName}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {user.role === "admin" ? "Admin" : 
                               user.role === "certifier" ? "Certificador" : "Usuario"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab("users")}
                    >
                      Ver todos los usuarios
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Document Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Estado de Documentos</CardTitle>
                    <CardDescription>
                      Resumen de documentos en la plataforma
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                            <span className="text-sm font-medium">Pendientes</span>
                          </div>
                          <p className="text-2xl font-bold">{stats.pendingDocuments}</p>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <FileCheck className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-sm font-medium">Firmados</span>
                          </div>
                          <p className="text-2xl font-bold">{stats.signedDocuments}</p>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h4 className="text-sm font-medium mb-3">Distribución de Documentos</h4>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${stats.signedDocuments / (stats.totalDocuments || 1) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                          <span>Firmados ({Math.round(stats.signedDocuments / (stats.totalDocuments || 1) * 100)}%)</span>
                          <span>Pendientes ({Math.round(stats.pendingDocuments / (stats.totalDocuments || 1) * 100)}%)</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar Reporte
                    </Button>
                    <Button>Ver Detalles</Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Panel Analítico IA</h2>
                    <p className="text-muted-foreground">Análisis avanzado con inteligencia artificial</p>
                  </div>
                  <DateRangePicker 
                    dateRange={dateRange}
                    onChange={setDateRange}
                    className="w-full md:w-80"
                  />
                </div>
                
                {/* IA Insights Card */}
                <Card className="border-primary/20 bg-primary/5 mb-8">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Insights de Negocio</CardTitle>
                      <CardDescription>
                        Recomendaciones generadas por IA basadas en analítica avanzada
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 pl-4">
                      <div className="flex gap-3">
                        <div className="bg-amber-100 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Oportunidad de crecimiento detectada</h4>
                          <p className="text-sm text-gray-600">El segmento de documentos comerciales muestra un crecimiento del 23% vs. el mes anterior. Considere crear más plantillas en esta categoría.</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="bg-blue-100 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Métrica destacada</h4>
                          <p className="text-sm text-gray-600">Los ingresos por video consultas han aumentado un 18%. Recomendamos ampliar la capacidad de certificadores especialistas en contratos internacionales.</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="bg-green-100 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Users className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Retención de usuarios</h4>
                          <p className="text-sm text-gray-600">La gamificación ha mejorado la retención en un 12%. Recomendamos ampliar el sistema de insignias para documentos comerciales.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Link href="/admin/ai-insights">
                      <Button variant="outline" className="gap-2">
                        <Brain className="h-4 w-4" />
                        <span>Ver análisis completo de IA</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
                
                {/* Revenue Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Ingresos Totales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <DollarSign className="h-8 w-8 text-green-500 mr-3" />
                        <div className="text-3xl font-bold">
                          ${stats.totalRevenue.toLocaleString('es-CL')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Ingresos de Hoy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <CreditCard className="h-8 w-8 text-blue-500 mr-3" />
                        <div className="text-3xl font-bold">
                          ${stats.revenueToday.toLocaleString('es-CL')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Ingresos Semanales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <Calendar className="h-8 w-8 text-purple-500 mr-3" />
                        <div className="text-3xl font-bold">
                          ${stats.revenueThisWeek.toLocaleString('es-CL')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Ingresos Mensuales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-orange-500 mr-3" />
                        <div className="text-3xl font-bold">
                          ${stats.revenueThisMonth.toLocaleString('es-CL')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Activity Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Actividad de Usuarios</CardTitle>
                      <CardDescription>
                        Registro de nuevos usuarios por día
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        {isDailyEventsLoading ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                          </div>
                        ) : dailyEventCounts && dailyEventCounts.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyEventCounts}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="date" 
                                tickFormatter={(value) => {
                                  const date = new Date(value);
                                  return `${date.getDate()}/${date.getMonth() + 1}`;
                                }}
                              />
                              <YAxis />
                              <Tooltip 
                                formatter={(value: number) => [value, 'Eventos']}
                                labelFormatter={(label) => {
                                  const date = new Date(label);
                                  return date.toLocaleDateString('es-ES');
                                }}
                              />
                              <Bar dataKey="count" fill="#4f46e5" />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <p>No hay datos disponibles para el rango seleccionado</p>
                            <p className="mt-2 text-sm">Seleccione un rango de fechas diferente</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Revenue Distribution Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribución de Ingresos</CardTitle>
                      <CardDescription>
                        División de ingresos por tipo de servicio
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        {isRevenueStatsLoading ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Documentos', value: stats.documentRevenue },
                                  { name: 'Cursos', value: stats.courseRevenue },
                                  { name: 'Videollamadas', value: stats.videoCallRevenue }
                                ]}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                <Cell fill="#4f46e5" />
                                <Cell fill="#22c55e" />
                                <Cell fill="#f97316" />
                              </Pie>
                              <Legend />
                              <Tooltip formatter={(value) => [`$${value.toLocaleString('es-CL')}`, 'Ingreso']} />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* User Activity Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Estadísticas de Actividad de Usuarios</CardTitle>
                    <CardDescription>
                      Detalle de registro de usuarios en diferentes períodos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <UserCheck className="h-5 w-5 text-blue-500 mr-2" />
                          <span className="text-sm font-medium">Usuarios Nuevos Hoy</span>
                        </div>
                        <p className="text-2xl font-bold">{stats.newUsersToday}</p>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <UserCheck className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-sm font-medium">Usuarios Nuevos esta Semana</span>
                        </div>
                        <p className="text-2xl font-bold">{stats.newUsersThisWeek}</p>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <UserCheck className="h-5 w-5 text-purple-500 mr-2" />
                          <span className="text-sm font-medium">Usuarios Nuevos este Mes</span>
                        </div>
                        <p className="text-2xl font-bold">{stats.newUsersThisMonth}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>Gestión de Usuarios</CardTitle>
                      <CardDescription>
                        Administra usuarios, certifiers y administradores
                      </CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Buscar usuarios..."
                          className="pl-8"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Añadir Usuario
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isUsersLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Creado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers?.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium">
                                    {user.fullName.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-medium">{user.fullName}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    user.role === "admin"
                                      ? "bg-purple-100 border-purple-200 text-purple-800"
                                      : user.role === "certifier"
                                      ? "bg-blue-100 border-blue-200 text-blue-800"
                                      : "bg-gray-100 border-gray-200 text-gray-800"
                                  }
                                >
                                  {user.role === "admin" ? "Administrador" :
                                   user.role === "certifier" ? "Certificador" : "Usuario"}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(user.createdAt)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      // Obtener datos actuales y pedir información actualizada
                                      const newFullName = prompt(
                                        `Editar usuario: ${user.fullName}\n\nNombre completo actual: ${user.fullName}\nNuevo nombre completo:`, 
                                        user.fullName
                                      );
                                      
                                      if (newFullName) {
                                        const newEmail = prompt(
                                          `Editar usuario: ${user.fullName}\n\nEmail actual: ${user.email}\nNuevo email:`, 
                                          user.email
                                        );
                                        
                                        if (newEmail) {
                                          updateUserDetailsMutation.mutate({
                                            userId: user.id,
                                            userData: {
                                              fullName: newFullName,
                                              email: newEmail
                                            }
                                          });
                                        }
                                      }
                                    }}
                                  >
                                    <Pencil className="h-4 w-4 mr-1" />
                                    Editar
                                  </Button>
                                  {user.role !== "certifier" && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => {
                                        if (window.confirm(`¿Está seguro que desea convertir a ${user.fullName} en certificador?`)) {
                                          updateUserRoleMutation.mutate({
                                            userId: user.id,
                                            role: "certifier"
                                          });
                                        }
                                      }}
                                    >
                                      <Shield className="h-4 w-4 mr-1" />
                                      Hacer Certificador
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Courses Tab */}
            <TabsContent value="courses">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>Gestión de Cursos</CardTitle>
                      <CardDescription>
                        Administra los cursos y certificaciones
                      </CardDescription>
                    </div>
                    <Button>
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Crear Nuevo Curso
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isCoursesLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                    </div>
                  ) : courses && courses.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Curso</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Estudiantes</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {courses.map((course) => (
                            <TableRow key={course.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 bg-orange-100 rounded-md flex items-center justify-center text-orange-500">
                                    <GraduationCap className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <div className="font-medium">{course.title}</div>
                                    <div className="text-sm text-gray-500 line-clamp-1">
                                      {course.description.substring(0, 40)}...
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                ${course.price / 100}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <UserCheck className="h-4 w-4 text-gray-400 mr-1.5" />
                                  <span>34 estudiantes</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      const price = prompt(`Actualizar precio para: ${course.title}\nPrecio actual: $${course.price / 100}\n\nIngrese el nuevo precio en pesos chilenos:`, (course.price / 100).toString());
                                      if (price && !isNaN(Number(price))) {
                                        updateCoursePriceMutation.mutate({ 
                                          courseId: course.id, 
                                          price: Math.round(Number(price) * 100) 
                                        });
                                      }
                                    }}
                                  >
                                    <Pencil className="h-4 w-4 mr-1" />
                                    Editar Precio
                                  </Button>
                                  <Button size="sm">
                                    Ver Contenido
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-lg">
                      <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No hay cursos</h3>
                      <p className="text-gray-500 mb-4">Aún no has creado ningún curso</p>
                      <Button>
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Crear mi primer curso
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
