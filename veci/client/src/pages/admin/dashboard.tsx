import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  AlertCircle,
  ArrowRight,
  BarChart2,
  ChevronRight,
  Clock,
  Download,
  FileText,
  LineChart as LineChartIcon,
  Mail,
  PieChart as PieChartIcon,
  Plus,
  RefreshCw,
  Server,
  Settings,
  Users,
  Wallet,
  Database,
  QrCode,
  Cpu
} from "lucide-react";

interface SystemStatus {
  server: 'online' | 'offline' | 'issues';
  database: 'online' | 'offline' | 'issues';
  qrGenerator: 'online' | 'offline' | 'issues';
  aiService: 'online' | 'offline' | 'issues';
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [location, setLocation] = useLocation();
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    server: 'online',
    database: 'online',
    qrGenerator: 'online',
    aiService: 'online'
  });

  // Obtener datos del dashboard
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["/api/admin/dashboard"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/dashboard");
      if (!response.ok) {
        throw new Error("Error fetching dashboard data");
      }
      return await response.json();
    },
  });

  // Verificar estado del sistema cada 5 minutos
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/system-status");
        if (response.ok) {
          const data = await response.json();
          setSystemStatus(data);
        }
      } catch (error) {
        console.error("Error checking system status:", error);
      }
    };

    // Verificar estado inicial
    checkSystemStatus();

    // Configurar intervalo para verificaciones periódicas
    const interval = setInterval(checkSystemStatus, 300000); // 5 minutos

    return () => clearInterval(interval);
  }, []);

  // Datos de gráfico de documentos por estado (simulados)
  const documentsByStatusData = [
    { name: "Pendientes", value: dashboardData?.documentsByStatus?.pending || 0 },
    { name: "Firmados", value: dashboardData?.documentsByStatus?.signed || 0 },
    { name: "Certificados", value: dashboardData?.documentsByStatus?.certified || 0 },
    { name: "Anulados", value: dashboardData?.documentsByStatus?.canceled || 0 },
  ];

  // Colores para gráfico de pie
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // Datos de gráfico de tendencia de ingresos (simulados)
  const revenueData = dashboardData?.revenueChart || [
    { name: "Lun", value: 1500 },
    { name: "Mar", value: 2500 },
    { name: "Mié", value: 1800 },
    { name: "Jue", value: 3200 },
    { name: "Vie", value: 2800 },
    { name: "Sáb", value: 1900 },
    { name: "Dom", value: 1200 },
  ];

  // Datos de gráfico de usuarios nuevos (simulados)
  const newUsersData = dashboardData?.newUsersChart || [
    { name: "Lun", value: 15 },
    { name: "Mar", value: 22 },
    { name: "Mié", value: 18 },
    { name: "Jue", value: 25 },
    { name: "Vie", value: 27 },
    { name: "Sáb", value: 12 },
    { name: "Dom", value: 8 },
  ];

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d 'de' MMMM, yyyy", { locale: es });
    } catch (error) {
      return "Fecha no disponible";
    }
  };

  // Función para formatear valores a moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(value);
  };

  // Función para obtener clase CSS según estado del sistema
  const getStatusClass = (status: 'online' | 'offline' | 'issues') => {
    switch(status) {
      case 'online': return 'bg-green-100 text-green-800 border-green-200';
      case 'offline': return 'bg-red-100 text-red-800 border-red-200';
      case 'issues': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error al cargar el dashboard</h2>
          <p className="text-gray-600 mb-4">
            No se pudieron cargar los datos del panel de administración. Por favor, intente nuevamente.
          </p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-500 mt-1">
            Gestión completa del sistema NotaryPro
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Datos
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Informe
          </Button>
        </div>
      </div>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid grid-cols-4 w-full max-w-3xl">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="sales">Ventas y Pagos</TabsTrigger>
          <TabsTrigger value="reports">Informes</TabsTrigger>
          <TabsTrigger value="ai">Análisis IA</TabsTrigger>
        </TabsList>

        {/* Contenido de Vista General */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPIs principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Documentos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.totalDocuments || 0}</div>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="text-green-500">↑ {dashboardData?.documentsGrowth || 0}%</span> respecto al mes anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.totalUsers || 0}</div>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="text-green-500">↑ {dashboardData?.usersGrowth || 0}%</span> respecto al mes anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(dashboardData?.totalRevenue || 0)}</div>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="text-green-500">↑ {dashboardData?.revenueGrowth || 0}%</span> respecto al mes anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Conversión de Ventas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.conversionRate || 0}%</div>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="text-green-500">↑ {dashboardData?.conversionGrowth || 0}%</span> respecto al mes anterior
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Estado del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Server className="h-5 w-5 mr-2" />
                Estado del Sistema
              </CardTitle>
              <CardDescription>
                Estado actual de los componentes principales del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`flex items-center p-3 rounded-md border ${getStatusClass(systemStatus.server)}`}>
                  <Server className="h-5 w-5 mr-2" />
                  <div>
                    <p className="text-sm font-medium">Servidor</p>
                    <p className="text-xs capitalize">{systemStatus.server}</p>
                  </div>
                </div>
                
                <div className={`flex items-center p-3 rounded-md border ${getStatusClass(systemStatus.database)}`}>
                  <Database className="h-5 w-5 mr-2" />
                  <div>
                    <p className="text-sm font-medium">Base de Datos</p>
                    <p className="text-xs capitalize">{systemStatus.database}</p>
                  </div>
                </div>
                
                <div className={`flex items-center p-3 rounded-md border ${getStatusClass(systemStatus.qrGenerator)}`}>
                  <QrCode className="h-5 w-5 mr-2" />
                  <div>
                    <p className="text-sm font-medium">Generador QR</p>
                    <p className="text-xs capitalize">{systemStatus.qrGenerator}</p>
                  </div>
                </div>
                
                <div className={`flex items-center p-3 rounded-md border ${getStatusClass(systemStatus.aiService)}`}>
                  <Cpu className="h-5 w-5 mr-2" />
                  <div>
                    <p className="text-sm font-medium">Servicio IA</p>
                    <p className="text-xs capitalize">{systemStatus.aiService}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alertas y documentos pendientes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alertas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                  Alertas del Sistema
                </CardTitle>
                <CardDescription>
                  Notificaciones que requieren atención
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.alerts && dashboardData.alerts.length > 0 ? (
                    dashboardData.alerts.map((alert: any, index: number) => (
                      <div key={index} className="flex items-start p-3 bg-amber-50 rounded-md border border-amber-200">
                        <AlertCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-sm text-amber-800">{alert.title}</h4>
                          <p className="text-xs text-amber-700 mt-1">{alert.description}</p>
                          <div className="flex items-center mt-2">
                            <Clock className="h-3 w-3 text-amber-600 mr-1" />
                            <span className="text-xs text-amber-600">{alert.time}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No hay alertas activas</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <Button variant="ghost" size="sm">
                  Ver historial de alertas
                </Button>
                <Button variant="outline" size="sm">
                  Configurar alertas
                </Button>
              </CardFooter>
            </Card>

            {/* Documentos pendientes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Documentos Pendientes
                </CardTitle>
                <CardDescription>
                  Documentos que requieren acción
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.pendingDocuments && dashboardData.pendingDocuments.length > 0 ? (
                    dashboardData.pendingDocuments.map((doc: any, index: number) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md border hover:bg-gray-100 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{doc.title}</h4>
                            <div className="flex items-center mt-1">
                              <Badge variant="outline" className="mr-2 text-xs">
                                {doc.status}
                              </Badge>
                              <span className="text-xs text-gray-500">ID: {doc.id}</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No hay documentos pendientes</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button 
                  variant="link" 
                  className="ml-auto" 
                  onClick={() => setLocation("/admin/documents")}
                >
                  Ver todos los documentos
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de documentos por estado */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2 text-primary" />
                  Documentos por Estado
                </CardTitle>
                <CardDescription>
                  Distribución actual de documentos
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={documentsByStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      labelLine={false}
                      label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        percent,
                        index,
                      }) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                        return (
                          <text
                            x={x}
                            y={y}
                            fill="#333"
                            textAnchor={x > cx ? "start" : "end"}
                            dominantBaseline="central"
                            fontSize={12}
                          >
                            {documentsByStatusData[index].name} ({`${(percent * 100).toFixed(0)}%`})
                          </text>
                        );
                      }}
                    >
                      {documentsByStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de ingresos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <LineChartIcon className="h-5 w-5 mr-2 text-primary" />
                  Tendencia de Ingresos
                </CardTitle>
                <CardDescription>
                  Ingresos de los últimos 7 días
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Ingresos"
                      stroke="#0070f3"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Usuarios nuevos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Nuevos Usuarios
              </CardTitle>
              <CardDescription>
                Crecimiento de usuarios en los últimos 7 días
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={newUsersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="value"
                    name="Nuevos Usuarios"
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between text-sm text-gray-500">
              <div>Usuarios activos: {dashboardData?.activeUsers || 0}</div>
              <div>Total registrados: {dashboardData?.totalUsers || 0}</div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Contenido de Ventas y Pagos */}
        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Wallet className="h-5 w-5 mr-2 text-primary" />
                Resumen de Ventas y Pagos
              </CardTitle>
              <CardDescription>
                Información financiera y transacciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(dashboardData?.revenueThisMonth || 0)}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="text-green-500">↑ {dashboardData?.monthlyRevenueGrowth || 0}%</span> respecto al mes anterior
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Promedio por Transacción</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(dashboardData?.averageTransactionValue || 0)}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="text-green-500">↑ {dashboardData?.averageTransactionGrowth || 0}%</span> respecto al mes anterior
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Transacciones del Mes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.transactionsThisMonth || 0}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="text-green-500">↑ {dashboardData?.transactionsGrowth || 0}%</span> respecto al mes anterior
                    </p>
                  </CardContent>
                </Card>
              </div>

              <h3 className="text-base font-medium mb-4">Ventas por Método de Pago</h3>
              <div className="space-y-3">
                {dashboardData?.paymentMethods?.map((method: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <span className="text-xs font-semibold text-primary">{method.name.substring(0, 2).toUpperCase()}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{method.name}</h4>
                        <p className="text-xs text-gray-500">Total transacciones: {method.transactions}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{formatCurrency(method.amount)}</p>
                      <p className="text-xs text-gray-500">{method.percentage}% del total</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button 
                variant="link" 
                className="ml-auto" 
                onClick={() => setLocation("/admin/finances")}
              >
                Ver reportes financieros completos
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Contenido de Informes */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                Informes Automatizados
              </CardTitle>
              <CardDescription>
                Informes generados y programados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-200">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Informe Diario Ejecutivo</h4>
                      <p className="text-xs text-gray-600">Enviado automáticamente cada día a las 8:00 AM</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-md border border-purple-200">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <Mail className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Informe Semanal de Tendencias</h4>
                      <p className="text-xs text-gray-600">Enviado automáticamente cada lunes a las 9:00 AM</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-md border border-green-200">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <Mail className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Informe Mensual de Planificación</h4>
                      <p className="text-xs text-gray-600">Enviado automáticamente el primer día de cada mes</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Crear nuevo informe
              </Button>
              <Button>
                Configuración de informes
                <Settings className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                Historial de Informes
              </CardTitle>
              <CardDescription>
                Últimos informes generados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData?.recentReports?.map((report: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <FileText className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{report.title}</h4>
                        <p className="text-xs text-gray-500">Generado: {report.date}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contenido de Análisis IA */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Cpu className="h-5 w-5 mr-2 text-primary" />
                Agente IA Estratégico
              </CardTitle>
              <CardDescription>
                Análisis y recomendaciones generadas por IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-md border border-primary/20">
                  <h3 className="font-semibold mb-2 text-primary">Resumen Ejecutivo IA</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Basado en el análisis de los datos de las últimas 4 semanas, el sistema ha identificado
                    patrones y oportunidades clave para el crecimiento del negocio.
                  </p>
                  
                  <div className="space-y-3 mt-4">
                    <div className="flex items-start">
                      <div className="bg-green-100 p-1 rounded-full mr-2 mt-0.5">
                        <svg className="h-3 w-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Crecimiento sostenido:</span> Se detecta un aumento del 28% en documentos verificados comparado con el mismo período del año anterior.
                      </p>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-green-100 p-1 rounded-full mr-2 mt-0.5">
                        <svg className="h-3 w-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Optimización de costos:</span> La implementación del nuevo sistema de verificación ha reducido el tiempo promedio de procesamiento en un 45%.
                      </p>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-amber-100 p-1 rounded-full mr-2 mt-0.5">
                        <svg className="h-3 w-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                      </div>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Área de atención:</span> Se detecta un aumento en el tiempo de respuesta para validaciones en horario nocturno. Recomendado revisar la cobertura de soporte.
                      </p>
                    </div>
                  </div>
                </div>
                
                <h3 className="font-semibold text-sm mt-6 mb-2">Recomendaciones Estratégicas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-md p-3">
                    <h4 className="text-sm font-medium flex items-center text-blue-700">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                      </svg>
                      Expansión de Mercado
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Basado en el análisis de la demanda, se recomienda expandir los servicios a las comunas de Maipú, Puente Alto y La Florida, donde se detecta un alto volumen de búsquedas.
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-3">
                    <h4 className="text-sm font-medium flex items-center text-purple-700">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                      </svg>
                      Optimización de Precios
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      El análisis de elasticidad de precios sugiere un incremento del 10% en servicios premium sin impacto significativo en la demanda, generando un aumento en ingresos estimado del 8%.
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-3">
                    <h4 className="text-sm font-medium flex items-center text-green-700">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      Alianzas Estratégicas
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Se identifican 15 posibles alianzas con estudios legales de alto volumen que podrían aumentar las transacciones en un 20% en los próximos 6 meses.
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-3">
                    <h4 className="text-sm font-medium flex items-center text-amber-700">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Automatización de Procesos
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      La implementación de verificación automática para documentos estándar reduciría los tiempos de procesamiento en un 65% y los costos operativos en un 30%.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <h3 className="font-semibold text-sm">Predicción de Demanda (Próximos 30 días)</h3>
                
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={dashboardData?.demandForecast || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      name="Demanda Estimada"
                      stroke="#0070f3"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      name="Demanda Real"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Descargar análisis completo
              </Button>
              <Button>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar análisis IA
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;