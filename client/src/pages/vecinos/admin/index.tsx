import React from "react";
import { VecinosAdminLayout } from "@/components/vecinos/VecinosAdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  FileText,
  CreditCard,
  TrendingUp,
  Store,
  AlertCircle,
} from "lucide-react";

// Datos simulados para gráficos (en producción, estos datos vendrían de la API)
const transactionData = [
  { name: "Ene", valor: 8400 },
  { name: "Feb", valor: 9200 },
  { name: "Mar", valor: 7800 },
  { name: "Abr", valor: 9600 },
  { name: "May", valor: 12000 },
  { name: "Jun", valor: 10800 },
  { name: "Jul", valor: 14500 },
];

const documentData = [
  { name: "Lun", documentos: 12 },
  { name: "Mar", documentos: 18 },
  { name: "Mié", documentos: 14 },
  { name: "Jue", documentos: 22 },
  { name: "Vie", documentos: 26 },
  { name: "Sáb", documentos: 16 },
  { name: "Dom", documentos: 7 },
];

const StatsCard = ({
  title,
  value,
  description,
  icon,
  trend,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: { value: string; positive: boolean };
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-gray-500 mt-1">
        {trend && (
          <span
            className={`inline-flex items-center mr-1 ${
              trend.positive ? "text-green-500" : "text-red-500"
            }`}
          >
            {trend.positive ? (
              <TrendingUp size={12} className="mr-1" />
            ) : (
              <TrendingUp size={12} className="mr-1 transform rotate-180" />
            )}
            {trend.value}
          </span>
        )}
        {description}
      </p>
    </CardContent>
  </Card>
);

const VecinosAdminDashboard = () => {
  return (
    <VecinosAdminLayout title="Dashboard Administrativo">
      <div className="grid gap-6">
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Socios Activos"
            value="126"
            description="desde el mes pasado"
            trend={{ value: "12%", positive: true }}
            icon={<Store size={18} className="text-green-600" />}
          />
          <StatsCard
            title="Documentos Procesados"
            value="2,856"
            description="en el último mes"
            trend={{ value: "8%", positive: true }}
            icon={<FileText size={18} className="text-blue-600" />}
          />
          <StatsCard
            title="Ingresos Totales"
            value="$348,925"
            description="para el año actual"
            trend={{ value: "18%", positive: true }}
            icon={<CreditCard size={18} className="text-purple-600" />}
          />
          <StatsCard
            title="Usuarios Registrados"
            value="1,245"
            description="en la plataforma"
            trend={{ value: "5%", positive: true }}
            icon={<Users size={18} className="text-orange-600" />}
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Transacciones Mensuales</CardTitle>
              <CardDescription>
                Valor total de transacciones por mes (CLP)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={transactionData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`$${value.toLocaleString()}`, "Valor"]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="valor"
                      stroke="#16a34a"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Documentos por día</CardTitle>
              <CardDescription>
                Número de documentos procesados en la última semana
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={documentData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="documentos" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pestañas de actividad reciente y alertas */}
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-auto">
            <TabsTrigger value="activity">Actividad Reciente</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
          </TabsList>
          <TabsContent value="activity" className="border rounded-md">
            <Card className="border-0 shadow-none">
              <CardContent className="p-6">
                <div className="space-y-5">
                  {/* Actividades recientes */}
                  <div className="flex items-start gap-4">
                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Store size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Nuevo socio registrado
                      </p>
                      <p className="text-sm text-gray-500">
                        Farmacia Central - Santiago
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Hace 2 horas
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Certificación completada
                      </p>
                      <p className="text-sm text-gray-500">
                        Contrato de arrendamiento - ID #8745
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Hace 3 horas
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Users size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Nuevo vendedor asignado
                      </p>
                      <p className="text-sm text-gray-500">
                        Carlos Mendoza - Zona Norte
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Hace 5 horas
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <CreditCard size={16} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Transacción completada
                      </p>
                      <p className="text-sm text-gray-500">
                        $12,500 - Mercado San José
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Hace 6 horas
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="alerts" className="border rounded-md">
            <Card className="border-0 shadow-none">
              <CardContent className="p-6">
                <div className="space-y-5">
                  {/* Alertas */}
                  <div className="flex items-start gap-4">
                    <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <AlertCircle size={16} className="text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Documento pendiente de revisión
                      </p>
                      <p className="text-sm text-gray-500">
                        ID #9932 - Esperando más de 48 horas
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Hace 2 días
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <AlertCircle size={16} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Socio sin actividad
                      </p>
                      <p className="text-sm text-gray-500">
                        Minimarket El Sol - Sin transacciones por 14 días
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Hace 5 días
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <AlertCircle size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Actualización de sistema pendiente
                      </p>
                      <p className="text-sm text-gray-500">
                        Nueva versión de POS disponible
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Hace 1 semana
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </VecinosAdminLayout>
  );
};

export default VecinosAdminDashboard;