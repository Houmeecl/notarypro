import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  MapPin, 
  Store, 
  Users, 
  FileText, 
  BarChart3, 
  PieChart, 
  Calendar, 
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Layers,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import SupervisorLayout from "@/components/supervisor/SupervisorLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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

export default function SupervisorDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [selectedRegion, setSelectedRegion] = useState<string>("todas");

  // Obtener información del supervisor
  const { data: supervisorInfo, isLoading: isLoadingSupervisor } = useQuery({
    queryKey: ['/api/supervisor/profile'],
  });

  // Obtener zonas asignadas
  const { data: zones, isLoading: isLoadingZones } = useQuery({
    queryKey: ['/api/supervisor/zones'],
  });

  // Obtener socios en zonas asignadas
  const { data: partners, isLoading: isLoadingPartners } = useQuery({
    queryKey: ['/api/supervisor/partners'],
  });

  // Obtener vendedores asignados
  const { data: sellers, isLoading: isLoadingSellers } = useQuery({
    queryKey: ['/api/supervisor/sellers'],
  });

  // Obtener estadísticas de rendimiento
  const { data: performance, isLoading: isLoadingPerformance } = useQuery({
    queryKey: ['/api/supervisor/performance'],
  });

  // Filtrar socios por región seleccionada
  const filteredPartners = partners ? 
    selectedRegion === "todas" 
      ? partners 
      : partners.filter((partner: any) => partner.region === selectedRegion)
    : [];

  return (
    <SupervisorLayout title="Panel de Control">
      <div className="container mx-auto py-6">
        {/* Tarjetas de KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-gray-800 font-medium flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-blue-500" />
                Zonas Asignadas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-semibold text-gray-900">{zones?.length || 0}</div>
              <p className="text-sm text-gray-500 mt-1">
                {zones?.filter((z: any) => z.status === 'active').length || 0} activas
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-gray-800 font-medium flex items-center">
                <Store className="mr-2 h-5 w-5 text-green-500" />
                Socios
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-semibold text-gray-900">{partners?.length || 0}</div>
              <p className="text-sm text-gray-500 mt-1">
                {partners?.filter((p: any) => p.status === 'active').length || 0} activos
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-gray-800 font-medium flex items-center">
                <Users className="mr-2 h-5 w-5 text-purple-500" />
                Vendedores
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-semibold text-gray-900">{sellers?.length || 0}</div>
              <p className="text-sm text-gray-500 mt-1">
                {sellers?.filter((s: any) => s.status === 'active').length || 0} activos
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-gray-800 font-medium flex items-center">
                <FileText className="mr-2 h-5 w-5 text-red-500" />
                Documentos
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-semibold text-gray-900">
                {performance?.totalDocuments || 0}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                <span className={performance?.percentChange >= 0 ? "text-green-500" : "text-red-500"}>
                  {performance?.percentChange >= 0 ? "+" : ""}{performance?.percentChange || 0}%
                </span> vs. mes anterior
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Indicadores de Alerta */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Alertas y Notificaciones</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Alerta 1 */}
            <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4 flex items-start">
              <AlertTriangle className="text-yellow-500 h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-yellow-800 text-sm">Socios sin actividad</h3>
                <p className="text-yellow-700 text-xs mt-1">
                  3 socios sin transacciones en los últimos 30 días.
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto mt-2 text-yellow-600 text-xs font-normal"
                  onClick={() => setLocation("/supervisor/partners?filter=inactive")}
                >
                  Ver socios inactivos <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
            
            {/* Alerta 2 */}
            <div className="bg-blue-50 border border-blue-100 rounded-md p-4 flex items-start">
              <Clock className="text-blue-500 h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-800 text-sm">Visitas pendientes</h3>
                <p className="text-blue-700 text-xs mt-1">
                  5 locales requieren visita de supervisión este mes.
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto mt-2 text-blue-600 text-xs font-normal"
                  onClick={() => setLocation("/supervisor/visits")}
                >
                  Ver programación <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
            
            {/* Alerta 3 */}
            <div className="bg-green-50 border border-green-100 rounded-md p-4 flex items-start">
              <TrendingUp className="text-green-500 h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-green-800 text-sm">Rendimiento destacado</h3>
                <p className="text-green-700 text-xs mt-1">
                  2 vendedores superaron su meta mensual de captación.
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto mt-2 text-green-600 text-xs font-normal"
                  onClick={() => setLocation("/supervisor/sellers?filter=top")}
                >
                  Ver vendedores <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Socios */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Socios y Establecimientos</h2>
            <div className="flex items-center space-x-2">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-[180px] h-9 text-sm">
                  <SelectValue placeholder="Filtrar por región" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las regiones</SelectItem>
                  <SelectItem value="RM">Región Metropolitana</SelectItem>
                  <SelectItem value="V">Valparaíso</SelectItem>
                  <SelectItem value="VIII">Biobío</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 text-sm"
                onClick={() => setLocation("/supervisor/partners")}
              >
                Ver todos <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-md shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-52">Socio</TableHead>
                    <TableHead className="text-xs">Código</TableHead>
                    <TableHead className="text-xs">Región</TableHead>
                    <TableHead className="text-xs">Documentos</TableHead>
                    <TableHead className="text-xs">Última transacción</TableHead>
                    <TableHead className="text-xs">Estado</TableHead>
                    <TableHead className="text-xs w-20">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-sm text-gray-500">
                        No hay socios que coincidan con el filtro actual.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPartners.slice(0, 5).map((partner: any) => (
                      <TableRow key={partner.id} className="text-sm">
                        <TableCell className="font-medium">{partner.storeName}</TableCell>
                        <TableCell className="font-mono text-xs">{partner.storeCode}</TableCell>
                        <TableCell>{partner.region}</TableCell>
                        <TableCell>{partner.documentCount}</TableCell>
                        <TableCell>{partner.lastTransaction}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={`${
                              partner.status === 'active' 
                                ? 'border-green-200 bg-green-50 text-green-700' 
                                : 'border-gray-200 bg-gray-50 text-gray-700'
                            } text-xs font-normal`}
                          >
                            {partner.status === 'active' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => setLocation(`/supervisor/partners/${partner.id}`)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Rendimiento mensual */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Rendimiento Mensual</h2>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 text-sm"
              onClick={() => setLocation("/supervisor/reports")}
            >
              Ver reportes <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-gray-800 font-medium flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4 text-blue-500" />
                  Cumplimiento de Metas
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mt-2 space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Documentos procesados</span>
                      <span className="text-gray-900 font-medium">{performance?.documentProgress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div 
                        className="bg-blue-500 h-2.5 rounded-full" 
                        style={{ width: `${performance?.documentProgress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Socios activos</span>
                      <span className="text-gray-900 font-medium">{performance?.partnerProgress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div 
                        className="bg-green-500 h-2.5 rounded-full" 
                        style={{ width: `${performance?.partnerProgress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Visitas realizadas</span>
                      <span className="text-gray-900 font-medium">{performance?.visitProgress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div 
                        className="bg-purple-500 h-2.5 rounded-full" 
                        style={{ width: `${performance?.visitProgress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-gray-800 font-medium flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-indigo-500" />
                  Próximas Actividades
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mt-2 space-y-3">
                  <div className="flex items-start border-l-2 border-blue-300 pl-3 py-1">
                    <Calendar className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">Visita a Mini Market El Sol</p>
                      <p className="text-xs text-gray-500">Mañana, 10:00 AM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start border-l-2 border-green-300 pl-3 py-1">
                    <Users className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">Capacitación vendedores zona norte</p>
                      <p className="text-xs text-gray-500">25/05/2025, 15:30 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start border-l-2 border-purple-300 pl-3 py-1">
                    <Store className="h-4 w-4 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">Incorporación nuevo socio - Café Express</p>
                      <p className="text-xs text-gray-500">28/05/2025, 09:00 AM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SupervisorLayout>
  );
}