
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, CreditCard, FileText, TrendingUp, Users } from "lucide-react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface AnalyticsProps {
  partnerId: string;
}

const PartnerAnalytics: React.FC<AnalyticsProps> = ({ partnerId }) => {
  // Example data - would be fetched from API in real implementation
  const transactionData = [
    { month: 'Ene', earnings: 45000, documents: 18 },
    { month: 'Feb', earnings: 38000, documents: 15 },
    { month: 'Mar', earnings: 62000, documents: 24 },
    { month: 'Abr', earnings: 57000, documents: 21 },
    { month: 'May', earnings: 75000, documents: 29 },
    { month: 'Jun', earnings: 68000, documents: 26 },
  ];

  const customerData = [
    { day: 'Lun', newCustomers: 3, returningCustomers: 5 },
    { day: 'Mar', newCustomers: 4, returningCustomers: 7 },
    { day: 'Mié', newCustomers: 2, returningCustomers: 6 },
    { day: 'Jue', newCustomers: 5, returningCustomers: 4 },
    { day: 'Vie', newCustomers: 7, returningCustomers: 8 },
    { day: 'Sáb', newCustomers: 6, returningCustomers: 3 },
    { day: 'Dom', newCustomers: 1, returningCustomers: 2 },
  ];

  const documentTypeData = [
    { name: 'Contratos', value: 42 },
    { name: 'Certificaciones', value: 28 },
    { name: 'Poderes', value: 16 },
    { name: 'Escrituras', value: 14 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Análisis de Desempeño</h2>

      <Tabs defaultValue="earnings" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="earnings">Ingresos</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Ingresos Mensuales
              </CardTitle>
              <CardDescription>
                Historial de ingresos y documentos procesados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer className="h-80" config={{ 
                earnings: { theme: { light: '#2d219b', dark: '#4e41c2' } },
                documents: { theme: { light: '#10b981', dark: '#34d399' } }
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={transactionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" stroke="#2d219b" />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar yAxisId="left" dataKey="earnings" fill="var(--color-earnings)" name="Ingresos" />
                    <Bar yAxisId="right" dataKey="documents" fill="var(--color-documents)" name="Documentos" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                  <CreditCard className="h-4 w-4 text-gray-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#2d219b]">$345,000</div>
                <p className="text-xs text-gray-500 mt-1">+12.5% respecto al mes anterior</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Documentos Procesados</CardTitle>
                  <FileText className="h-4 w-4 text-gray-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#2d219b]">133</div>
                <p className="text-xs text-gray-500 mt-1">+8.2% respecto al mes anterior</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Clientes Atendidos</CardTitle>
                  <Users className="h-4 w-4 text-gray-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#2d219b]">87</div>
                <p className="text-xs text-gray-500 mt-1">+15.3% respecto al mes anterior</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                Afluencia de Clientes
              </CardTitle>
              <CardDescription>
                Nuevos clientes vs clientes recurrentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer className="h-80" config={{ 
                newCustomers: { theme: { light: '#8b5cf6', dark: '#a78bfa' } },
                returningCustomers: { theme: { light: '#f59e0b', dark: '#fbbf24' } }
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={customerData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="newCustomers" stackId="a" fill="var(--color-newCustomers)" name="Nuevos Clientes" />
                    <Bar dataKey="returningCustomers" stackId="a" fill="var(--color-returningCustomers)" name="Clientes Recurrentes" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-600" />
                Tipos de Documentos
              </CardTitle>
              <CardDescription>
                Distribución por categoría de documento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer className="h-80" config={{
                Contratos: { theme: { light: '#2d219b', dark: '#4e41c2' } },
                Certificaciones: { theme: { light: '#10b981', dark: '#34d399' } },
                Poderes: { theme: { light: '#f59e0b', dark: '#fbbf24' } },
                Escrituras: { theme: { light: '#8b5cf6', dark: '#a78bfa' } }
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={documentTypeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" name="Cantidad" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
            Calendario de Actividad
          </CardTitle>
          <CardDescription>
            Días con mayor afluencia de clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Visualización de calendario próximamente</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerAnalytics;
