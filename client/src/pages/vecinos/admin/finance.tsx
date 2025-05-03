import React, { useState } from "react";
import { VecinosAdminLayout } from "@/components/vecinos/VecinosAdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  CreditCard,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Landmark,
  BarChart3,
  CalendarIcon,
  TrendingUp,
  Receipt,
  ReceiptText,
  BadgeDollarSign,
  Calculator,
  LineChart,
  Building,
  Users,
  WalletCards,
  Share,
  FilePlus,
  Filter
} from "lucide-react";
import { Link } from "wouter";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const FinancePage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Datos financieros simulados
  const financialData = {
    totalRevenue: 14_850_000,
    expenses: 5_320_000,
    profit: 9_530_000,
    commissions: {
      total: 3_240_000,
      paid: 2_760_000,
      pending: 480_000
    },
    transactions: {
      total: 782,
      approved: 745,
      rejected: 37
    },
    partners: {
      total: 45,
      withPositiveBalance: 38,
      withNegativeBalance: 7
    }
  };
  
  // Datos para el gráfico de ingresos
  const revenueChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      {
        label: 'Ingresos Totales',
        data: [980000, 1250000, 1120000, 1450000, 1320000, 1580000, 1280000, 1150000, 1420000, 1680000, 1520000, 1100000],
        borderColor: '#2d219b',
        backgroundColor: 'rgba(45, 33, 155, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Comisiones',
        data: [250000, 320000, 280000, 310000, 290000, 340000, 270000, 240000, 310000, 350000, 330000, 250000],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };
  
  // Datos para el gráfico de distribución de ingresos
  const incomeDistributionData = {
    labels: ['Documentos Básicos', 'Certificaciones', 'Documentos Legales', 'Verificaciones', 'Servicios Premium'],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          '#2d219b', 
          '#3730a3', 
          '#4338ca', 
          '#4f46e5', 
          '#6366f1'
        ],
        borderWidth: 0
      }
    ]
  };
  
  // Datos para el gráfico de transacciones por socio
  const partnerTransactionsData = {
    labels: ['Socio 1', 'Socio 2', 'Socio 3', 'Socio 4', 'Socio 5', 'Otros'],
    datasets: [
      {
        label: 'Transacciones',
        data: [145, 120, 95, 78, 65, 279],
        backgroundColor: '#2d219b',
      }
    ]
  };
  
  // Lista de facturas recientes
  const recentInvoices = [
    { id: 'INV-2025-042', partner: 'Minimarket El Sol', amount: 125000, date: '01/05/2025', status: 'Pagada' },
    { id: 'INV-2025-041', partner: 'Farmacia Vida', amount: 98500, date: '30/04/2025', status: 'Pagada' },
    { id: 'INV-2025-040', partner: 'Librería Central', amount: 75000, date: '27/04/2025', status: 'Pendiente' },
    { id: 'INV-2025-039', partner: 'Café Internet Speed', amount: 45000, date: '25/04/2025', status: 'Pagada' },
    { id: 'INV-2025-038', partner: 'Ferretería Construmax', amount: 112500, date: '22/04/2025', status: 'Pagada' },
  ];
  
  // Lista de pagos de comisiones recientes
  const recentCommissions = [
    { id: 'COM-2025-034', partner: 'Minimarket El Sol', amount: 58000, date: '01/05/2025', documents: 12 },
    { id: 'COM-2025-033', partner: 'Farmacia Vida', amount: 42500, date: '30/04/2025', documents: 9 },
    { id: 'COM-2025-032', partner: 'Librería Central', amount: 34000, date: '27/04/2025', documents: 7 },
    { id: 'COM-2025-031', partner: 'Café Internet Speed', amount: 19500, date: '25/04/2025', documents: 4 },
    { id: 'COM-2025-030', partner: 'Ferretería Construmax', amount: 52000, date: '22/04/2025', documents: 11 },
  ];

  // Opciones de gráfico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <VecinosAdminLayout title="Finanzas y Administración">
      <div className="space-y-8">
        {/* Filtros y controles superiores */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP', { locale: es }) : <span>Seleccionar fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Select defaultValue="month">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="quarter">Este trimestre</SelectItem>
                <SelectItem value="year">Este año</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Más filtros
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button variant="outline" className="gap-2">
              <FilePlus className="h-4 w-4" />
              Generar Reporte
            </Button>
            <Button variant="default" className="gap-2">
              <Share className="h-4 w-4" />
              Compartir
            </Button>
          </div>
        </div>

        {/* Tarjetas de resumen financiero */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <h3 className="text-2xl font-bold mt-1 text-[#2d219b]">
                    ${(financialData.totalRevenue/1000).toLocaleString()}K
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Período actual</p>
                </div>
                <div className="p-2 bg-[#2d219b] bg-opacity-10 rounded-full">
                  <DollarSign className="h-5 w-5 text-[#2d219b]" />
                </div>
              </div>
              <div className="mt-4 text-xs font-medium text-green-600">
                +12.5% vs período anterior
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600">Gastos</p>
                  <h3 className="text-2xl font-bold mt-1 text-[#2d219b]">
                    ${(financialData.expenses/1000).toLocaleString()}K
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Operacionales y variables</p>
                </div>
                <div className="p-2 bg-[#2d219b] bg-opacity-10 rounded-full">
                  <Receipt className="h-5 w-5 text-[#2d219b]" />
                </div>
              </div>
              <div className="mt-4 text-xs font-medium text-amber-600">
                +5.2% vs período anterior
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600">Utilidad</p>
                  <h3 className="text-2xl font-bold mt-1 text-[#2d219b]">
                    ${(financialData.profit/1000).toLocaleString()}K
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Margen: 64.2%</p>
                </div>
                <div className="p-2 bg-[#2d219b] bg-opacity-10 rounded-full">
                  <TrendingUp className="h-5 w-5 text-[#2d219b]" />
                </div>
              </div>
              <div className="mt-4 text-xs font-medium text-green-600">
                +15.8% vs período anterior
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600">Comisiones</p>
                  <h3 className="text-2xl font-bold mt-1 text-[#2d219b]">
                    ${(financialData.commissions.total/1000).toLocaleString()}K
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Generadas para socios</p>
                </div>
                <div className="p-2 bg-[#2d219b] bg-opacity-10 rounded-full">
                  <BadgeDollarSign className="h-5 w-5 text-[#2d219b]" />
                </div>
              </div>
              <div className="mt-4 text-xs font-medium text-green-600">
                +18.2% vs período anterior
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Pestañas de secciones */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="invoices">Facturación</TabsTrigger>
            <TabsTrigger value="commissions">Comisiones</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>
          
          {/* Contenido del Dashboard */}
          <TabsContent value="dashboard" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Gráfico principal de ingresos */}
              <Card className="md:col-span-2 border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Evolución de Ingresos</CardTitle>
                  <CardDescription>
                    Ingresos y comisiones generadas por mes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Line options={chartOptions} data={revenueChartData} />
                  </div>
                </CardContent>
              </Card>
              
              {/* Gráfico de distribución */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Distribución de Ingresos</CardTitle>
                  <CardDescription>
                    Por categoría de documento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Pie data={incomeDistributionData} options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            boxWidth: 12,
                            font: {
                              size: 11
                            }
                          }
                        }
                      }
                    }} />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Estadísticas adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Transacciones por socio */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Transacciones por Socio</CardTitle>
                  <CardDescription>
                    Top 5 socios con mayor número de transacciones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Bar options={chartOptions} data={partnerTransactionsData} />
                  </div>
                </CardContent>
              </Card>
              
              {/* Resumen financiero por socio */}
              <Card className="border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Resumen de Socios</CardTitle>
                    <CardDescription>
                      Estado financiero por socio
                    </CardDescription>
                  </div>
                  <Select defaultValue="balance">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balance">Balance</SelectItem>
                      <SelectItem value="transactions">Transacciones</SelectItem>
                      <SelectItem value="commissions">Comisiones</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 text-xs font-medium text-gray-500 pb-2 border-b">
                      <div>Socio</div>
                      <div className="text-right">Transacciones</div>
                      <div className="text-right">Balance</div>
                    </div>
                    
                    <div className="grid grid-cols-3 items-center">
                      <div className="flex flex-col">
                        <span className="font-medium">Minimarket El Sol</span>
                        <span className="text-xs text-gray-500">Santiago, RM</span>
                      </div>
                      <div className="text-right">58</div>
                      <div className="text-right font-semibold text-green-600">+$154,500</div>
                    </div>
                    
                    <div className="grid grid-cols-3 items-center">
                      <div className="flex flex-col">
                        <span className="font-medium">Farmacia Vida</span>
                        <span className="text-xs text-gray-500">Las Condes, RM</span>
                      </div>
                      <div className="text-right">45</div>
                      <div className="text-right font-semibold text-green-600">+$127,800</div>
                    </div>
                    
                    <div className="grid grid-cols-3 items-center">
                      <div className="flex flex-col">
                        <span className="font-medium">Librería Central</span>
                        <span className="text-xs text-gray-500">Providencia, RM</span>
                      </div>
                      <div className="text-right">32</div>
                      <div className="text-right font-semibold text-green-600">+$84,200</div>
                    </div>
                    
                    <div className="grid grid-cols-3 items-center">
                      <div className="flex flex-col">
                        <span className="font-medium">Café Internet Speed</span>
                        <span className="text-xs text-gray-500">Estación Central, RM</span>
                      </div>
                      <div className="text-right">24</div>
                      <div className="text-right font-semibold text-red-600">-$15,300</div>
                    </div>
                    
                    <div className="grid grid-cols-3 items-center">
                      <div className="flex flex-col">
                        <span className="font-medium">Ferretería Construmax</span>
                        <span className="text-xs text-gray-500">Maipú, RM</span>
                      </div>
                      <div className="text-right">38</div>
                      <div className="text-right font-semibold text-green-600">+$92,600</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Contenido de Facturación */}
          <TabsContent value="invoices" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Facturas Emitidas</p>
                      <h3 className="text-2xl font-bold mt-1 text-[#2d219b]">328</h3>
                      <p className="text-xs text-gray-500 mt-1">En el período actual</p>
                    </div>
                    <div className="p-2 bg-[#2d219b] bg-opacity-10 rounded-full">
                      <FileText className="h-5 w-5 text-[#2d219b]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Facturado</p>
                      <h3 className="text-2xl font-bold mt-1 text-[#2d219b]">$12.3M</h3>
                      <p className="text-xs text-gray-500 mt-1">Sin IVA</p>
                    </div>
                    <div className="p-2 bg-[#2d219b] bg-opacity-10 rounded-full">
                      <ReceiptText className="h-5 w-5 text-[#2d219b]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pendientes de Pago</p>
                      <h3 className="text-2xl font-bold mt-1 text-amber-500">42</h3>
                      <p className="text-xs text-gray-500 mt-1">$2.8M en total</p>
                    </div>
                    <div className="p-2 bg-amber-100 rounded-full">
                      <Receipt className="h-5 w-5 text-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tasa de Pago</p>
                      <h3 className="text-2xl font-bold mt-1 text-green-600">87.2%</h3>
                      <p className="text-xs text-gray-500 mt-1">Promedio en 30 días</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-full">
                      <BadgeDollarSign className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Facturas Recientes</CardTitle>
                <CardDescription>
                  Últimas facturas emitidas a socios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Factura</TableHead>
                      <TableHead>Socio</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead className="text-right">Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.partner}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell className="text-right">${invoice.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Badge className={cn(
                            "text-xs",
                            invoice.status === "Pagada" 
                              ? "bg-green-100 text-green-800 hover:bg-green-100" 
                              : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                          )}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Ver todas las facturas</Button>
                <Button>Generar Nueva Factura</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Contenido de Comisiones */}
          <TabsContent value="commissions" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Comisiones Totales</p>
                      <h3 className="text-2xl font-bold mt-1 text-[#2d219b]">
                        ${(financialData.commissions.total/1000).toLocaleString()}K
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Generadas en período</p>
                    </div>
                    <div className="p-2 bg-[#2d219b] bg-opacity-10 rounded-full">
                      <BadgeDollarSign className="h-5 w-5 text-[#2d219b]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Comisiones Pagadas</p>
                      <h3 className="text-2xl font-bold mt-1 text-green-600">
                        ${(financialData.commissions.paid/1000).toLocaleString()}K
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Liquidadas a socios</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-full">
                      <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Comisiones Pendientes</p>
                      <h3 className="text-2xl font-bold mt-1 text-amber-500">
                        ${(financialData.commissions.pending/1000).toLocaleString()}K
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Por liquidar</p>
                    </div>
                    <div className="p-2 bg-amber-100 rounded-full">
                      <Receipt className="h-5 w-5 text-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tasa de Comisión</p>
                      <h3 className="text-2xl font-bold mt-1 text-[#2d219b]">21.8%</h3>
                      <p className="text-xs text-gray-500 mt-1">Promedio</p>
                    </div>
                    <div className="p-2 bg-[#2d219b] bg-opacity-10 rounded-full">
                      <Calculator className="h-5 w-5 text-[#2d219b]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Comisiones Recientes</CardTitle>
                <CardDescription>
                  Últimos pagos de comisiones a socios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Comisión</TableHead>
                      <TableHead>Socio</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Documentos</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentCommissions.map((commission) => (
                      <TableRow key={commission.id}>
                        <TableCell className="font-medium">{commission.id}</TableCell>
                        <TableCell>{commission.partner}</TableCell>
                        <TableCell>{commission.date}</TableCell>
                        <TableCell className="text-right">{commission.documents}</TableCell>
                        <TableCell className="text-right font-medium text-[#2d219b]">${commission.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Ver todas las comisiones</Button>
                <Button>Liquidar Comisiones</Button>
              </CardFooter>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Socios con Mayor Comisión</CardTitle>
                <CardDescription>
                  Top socios por monto de comisiones generadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 text-xs font-medium text-gray-500 pb-2 border-b">
                    <div>Socio</div>
                    <div className="text-right">Comisiones</div>
                  </div>
                  
                  <div className="grid grid-cols-2 items-center">
                    <div className="flex flex-col">
                      <span className="font-medium">Minimarket El Sol</span>
                      <span className="text-xs text-gray-500">Santiago Centro</span>
                    </div>
                    <div className="text-right text-[#2d219b] font-semibold">$458,200</div>
                  </div>
                  
                  <div className="grid grid-cols-2 items-center">
                    <div className="flex flex-col">
                      <span className="font-medium">Farmacia Vida</span>
                      <span className="text-xs text-gray-500">Las Condes</span>
                    </div>
                    <div className="text-right text-[#2d219b] font-semibold">$387,500</div>
                  </div>
                  
                  <div className="grid grid-cols-2 items-center">
                    <div className="flex flex-col">
                      <span className="font-medium">Librería Central</span>
                      <span className="text-xs text-gray-500">Providencia</span>
                    </div>
                    <div className="text-right text-[#2d219b] font-semibold">$324,800</div>
                  </div>
                  
                  <div className="grid grid-cols-2 items-center">
                    <div className="flex flex-col">
                      <span className="font-medium">Café Internet Speed</span>
                      <span className="text-xs text-gray-500">Estación Central</span>
                    </div>
                    <div className="text-right text-[#2d219b] font-semibold">$256,300</div>
                  </div>
                  
                  <div className="grid grid-cols-2 items-center">
                    <div className="flex flex-col">
                      <span className="font-medium">Ferretería Construmax</span>
                      <span className="text-xs text-gray-500">Maipú</span>
                    </div>
                    <div className="text-right text-[#2d219b] font-semibold">$218,700</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Contenido de Reportes */}
          <TabsContent value="reports" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border border-[#e0deff] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Reporte Financiero</CardTitle>
                    <FileSpreadsheet className="h-5 w-5 text-[#2d219b]" />
                  </div>
                  <CardDescription>
                    Estado financiero completo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Incluye balance general, estado de resultados y flujo de caja para el período seleccionado.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Generar Reporte</Button>
                </CardFooter>
              </Card>
              
              <Card className="border border-[#e0deff] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Reporte de Comisiones</CardTitle>
                    <BadgeDollarSign className="h-5 w-5 text-[#2d219b]" />
                  </div>
                  <CardDescription>
                    Detalle de comisiones a socios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Incluye desglose de comisiones por socio, documentos procesados y fechas de liquidación.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Generar Reporte</Button>
                </CardFooter>
              </Card>
              
              <Card className="border border-[#e0deff] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Reporte de Impuestos</CardTitle>
                    <Landmark className="h-5 w-5 text-[#2d219b]" />
                  </div>
                  <CardDescription>
                    Resumen para declaraciones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Incluye información consolidada para declaraciones de IVA, renta y otros impuestos aplicables.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Generar Reporte</Button>
                </CardFooter>
              </Card>
              
              <Card className="border border-[#e0deff] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Reporte de Socios</CardTitle>
                    <Users className="h-5 w-5 text-[#2d219b]" />
                  </div>
                  <CardDescription>
                    Rendimiento por socio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Análisis del rendimiento financiero de cada socio, incluyendo métricas clave y tendencias.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Generar Reporte</Button>
                </CardFooter>
              </Card>
              
              <Card className="border border-[#e0deff] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Reporte de Transacciones</CardTitle>
                    <WalletCards className="h-5 w-5 text-[#2d219b]" />
                  </div>
                  <CardDescription>
                    Historial de transacciones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Registro detallado de todas las transacciones, pagos y movimientos financieros en el período.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Generar Reporte</Button>
                </CardFooter>
              </Card>
              
              <Card className="border border-[#e0deff] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Reporte de Proyecciones</CardTitle>
                    <LineChart className="h-5 w-5 text-[#2d219b]" />
                  </div>
                  <CardDescription>
                    Proyecciones financieras
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Análisis de tendencias y proyecciones financieras para los próximos períodos basados en datos históricos.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Generar Reporte</Button>
                </CardFooter>
              </Card>
            </div>
            
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Reportes Generados Recientemente</CardTitle>
                <CardDescription>
                  Últimos reportes creados por el equipo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo de Reporte</TableHead>
                      <TableHead>Generado por</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Reporte Financiero</TableCell>
                      <TableCell>Carlos Mendoza</TableCell>
                      <TableCell>01/05/2025</TableCell>
                      <TableCell>Abril 2025</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Reporte de Comisiones</TableCell>
                      <TableCell>Juan Carrasco</TableCell>
                      <TableCell>30/04/2025</TableCell>
                      <TableCell>Abril 2025</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Reporte de Impuestos</TableCell>
                      <TableCell>Ana Silva</TableCell>
                      <TableCell>28/04/2025</TableCell>
                      <TableCell>Q1 2025</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Reporte de Proyecciones</TableCell>
                      <TableCell>Carlos Mendoza</TableCell>
                      <TableCell>25/04/2025</TableCell>
                      <TableCell>Q2 2025</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Ver Todos los Reportes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </VecinosAdminLayout>
  );
};

export default FinancePage;