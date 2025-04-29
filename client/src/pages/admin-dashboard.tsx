import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { DateRangePicker } from "@/components/ui/date-range-picker";
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
  Video
} from "lucide-react";
import { User, Document, Course } from "@shared/schema";

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

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      
      <div className="md:pl-64 p-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Administración</h1>
            <p className="text-gray-500 mt-1">
              Bienvenido, {user?.fullName}. Administra usuarios, documentos y cursos.
            </p>
          </header>
          
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Usuarios Totales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-blue-500 mr-3" />
                      <div className="text-3xl font-bold">{stats.totalUsers}</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Certificadores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Shield className="h-8 w-8 text-purple-500 mr-3" />
                      <div className="text-3xl font-bold">{stats.totalCertifiers}</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Documentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-green-500 mr-3" />
                      <div className="text-3xl font-bold">{stats.totalDocuments}</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Cursos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <GraduationCap className="h-8 w-8 text-orange-500 mr-3" />
                      <div className="text-3xl font-bold">{stats.totalCourses}</div>
                    </div>
                  </CardContent>
                </Card>
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
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Análisis de Plataforma</h2>
                  <DateRangePicker 
                    dateRange={dateRange}
                    onChange={setDateRange}
                    className="w-80"
                  />
                </div>
                
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
                                  <Button size="sm" variant="outline">
                                    <Pencil className="h-4 w-4 mr-1" />
                                    Editar
                                  </Button>
                                  {user.role !== "certifier" && (
                                    <Button size="sm" variant="outline">
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
