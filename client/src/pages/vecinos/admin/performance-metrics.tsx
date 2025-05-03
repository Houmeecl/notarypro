
import React from "react";
import { VecinosAdminLayout } from "@/components/vecinos/VecinosAdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Globe,
  MapPin,
  Calendar,
  RefreshCw,
  Download,
  Clock,
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const VecinosAdminPerformanceMetricsPage = () => {
  // Data for charts
  const monthlySales = [
    { name: 'Ene', value: 2500000 },
    { name: 'Feb', value: 3100000 },
    { name: 'Mar', value: 2800000 },
    { name: 'Abr', value: 3400000 },
    { name: 'May', value: 3900000 },
    { name: 'Jun', value: 4200000 },
  ];

  const regionData = [
    { name: 'RM', value: 62 },
    { name: 'Valparaíso', value: 15 },
    { name: 'Biobío', value: 10 },
    { name: 'Maule', value: 8 },
    { name: 'Otros', value: 5 },
  ];

  const documentData = [
    { month: 'Ene', contratos: 125, certificaciones: 95, declaraciones: 45 },
    { month: 'Feb', contratos: 148, certificaciones: 110, declaraciones: 57 },
    { month: 'Mar', contratos: 137, certificaciones: 98, declaraciones: 42 },
    { month: 'Abr', contratos: 162, certificaciones: 120, declaraciones: 63 },
    { month: 'May', contratos: 185, certificaciones: 145, declaraciones: 75 },
    { month: 'Jun', contratos: 205, certificaciones: 155, declaraciones: 82 },
  ];

  const hourlyActivity = [
    { hour: '8-10', documents: 18 },
    { hour: '10-12', documents: 35 },
    { hour: '12-14', documents: 25 },
    { hour: '14-16', documents: 42 },
    { hour: '16-18', documents: 37 },
    { hour: '18-20', documents: 30 },
    { hour: '20-22', documents: 15 },
  ];

  const COLORS = ['#2d219b', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'];

  return (
    <VecinosAdminLayout title="Métricas de Desempeño">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Análisis del Programa Vecinos Xpress</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2d219b]">$19.9M</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.3% respecto al mes anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">Socios Activos</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2d219b]">72</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5% nuevos socios
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">Documentos Procesados</CardTitle>
                <FileText className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2d219b]">5,287</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15.2% más documentos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">Regiones Activas</CardTitle>
                <Globe className="h-4 w-4 text-indigo-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2d219b]">6</div>
              <p className="text-xs text-amber-600 flex items-center mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                85% concentrado en 3 regiones
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="volumen" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="volumen">Volumen de Operaciones</TabsTrigger>
            <TabsTrigger value="regional">Distribución Geográfica</TabsTrigger>
            <TabsTrigger value="documentos">Tipos de Documentos</TabsTrigger>
            <TabsTrigger value="horarios">Horarios de Actividad</TabsTrigger>
          </TabsList>

          <TabsContent value="volumen">
            <Card>
              <CardHeader>
                <CardTitle>Ingresos Mensuales</CardTitle>
                <CardDescription>Evolución de ingresos generados por el programa</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-80" config={{ 
                  value: { theme: { light: '#2d219b', dark: '#4e41c2' } },
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlySales} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `$${value/1000000}M`} />
                      <Tooltip content={<ChartTooltipContent labelFormatter={(label) => `Mes: ${label}`} />} />
                      <Area type="monotone" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.1} name="Ingresos" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regional">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Región</CardTitle>
                <CardDescription>Porcentaje de socios por región</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row items-center justify-center">
                <div className="w-full md:w-1/2 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={regionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {regionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Porcentaje']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 pl-0 md:pl-8 mt-6 md:mt-0">
                  <h3 className="text-lg font-semibold mb-4">Distribución de Socios</h3>
                  <div className="space-y-3">
                    {regionData.map((region, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span>{region.name}</span>
                        </div>
                        <span className="font-medium">{region.value}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      La Región Metropolitana concentra la mayor parte de los socios, seguida por Valparaíso y Biobío.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentos">
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Documentos Procesados</CardTitle>
                <CardDescription>Distribución por categoría de documento</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-80" config={{ 
                  contratos: { theme: { light: '#2d219b', dark: '#4e41c2' } },
                  certificaciones: { theme: { light: '#10b981', dark: '#34d399' } },
                  declaraciones: { theme: { light: '#f59e0b', dark: '#fbbf24' } }
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={documentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="contratos" stackId="a" fill="var(--color-contratos)" name="Contratos" />
                      <Bar dataKey="certificaciones" stackId="a" fill="var(--color-certificaciones)" name="Certificaciones" />
                      <Bar dataKey="declaraciones" stackId="a" fill="var(--color-declaraciones)" name="Declaraciones" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="horarios">
            <Card>
              <CardHeader>
                <CardTitle>Actividad por Horario</CardTitle>
                <CardDescription>Horas de mayor actividad en las sucursales</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-80" config={{ 
                  documents: { theme: { light: '#8b5cf6', dark: '#a78bfa' } },
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyActivity} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="documents" fill="var(--color-documents)" name="Documentos" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
                
                <div className="mt-6 flex items-center justify-center">
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start max-w-md">
                    <Clock className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 mb-1">Horario de mayor actividad</p>
                      <p className="text-sm text-amber-700">
                        Los horarios pico son de 14:00 a 16:00 horas. Considerar estas horas para promociones y refuerzo de personal.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Socios con Mayor Rendimiento</CardTitle>
              <CardDescription>Top 5 socios con mayor número de documentos procesados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Farmacia Vida</h3>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">238 docs</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Minimarket El Sol</h3>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">215 docs</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Botillería Los Andes</h3>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">183 docs</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Ferretería Don José</h3>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">167 docs</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Almacén La Esperanza</h3>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">139 docs</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '55%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Oportunidades de Mejora</CardTitle>
              <CardDescription>Recomendaciones basadas en el análisis de datos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-blue-100 rounded-lg bg-blue-50">
                  <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    Expansión Regional
                  </h3>
                  <p className="text-sm text-blue-700">
                    Existe oportunidad de crecimiento en las regiones del norte y sur del país que representan menos del 5% de socios actualmente.
                  </p>
                </div>

                <div className="p-4 border border-purple-100 rounded-lg bg-purple-50">
                  <h3 className="font-medium text-purple-800 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Nuevos Tipos de Documentos
                  </h3>
                  <p className="text-sm text-purple-700">
                    Los documentos de declaraciones juradas muestran un crecimiento del 18%, potenciar esta categoría podría aumentar significativamente los ingresos.
                  </p>
                </div>

                <div className="p-4 border border-amber-100 rounded-lg bg-amber-50">
                  <h3 className="font-medium text-amber-800 mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Optimización de Horarios
                  </h3>
                  <p className="text-sm text-amber-700">
                    Considerar incentivos para aumentar el flujo en horarios de 8:00 a 10:00 AM y después de las 18:00, períodos con baja actividad.
                  </p>
                </div>

                <div className="p-4 border border-green-100 rounded-lg bg-green-50">
                  <h3 className="font-medium text-green-800 mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Socios Destacados
                  </h3>
                  <p className="text-sm text-green-700">
                    Implementar un programa de reconocimiento para los socios de mayor rendimiento podría motivar a aumentar el volumen de documentos procesados.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </VecinosAdminLayout>
  );
};

export default VecinosAdminPerformanceMetricsPage;
