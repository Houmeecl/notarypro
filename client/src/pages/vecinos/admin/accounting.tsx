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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CreditCard,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Landmark,
  BarChart3,
  CalendarIcon,
  PlusCircle,
  Receipt,
  ReceiptText,
  BadgeDollarSign,
  Calculator,
  Share,
  FilePlus,
  Filter,
  ChevronRight,
  ExternalLink,
  Eye,
  Edit,
  Trash,
  AlertCircle,
  CheckSquare,
  CircleDollarSign
} from "lucide-react";
import { Link } from "wouter";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const AccountingPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Datos simulados para contabilidad
  const accountingData = {
    assetAccounts: {
      cashAndEquivalents: 12_450_000,
      accountsReceivable: 3_850_000,
      prepaidExpenses: 1_250_000,
      fixedAssets: 8_750_000,
      totalAssets: 26_300_000
    },
    liabilityAccounts: {
      accountsPayable: 2_850_000,
      deferredRevenue: 480_000,
      payroll: 3_120_000,
      loans: 5_200_000,
      totalLiabilities: 11_650_000
    },
    equityAccounts: {
      capital: 10_000_000,
      retainedEarnings: 4_650_000,
      totalEquity: 14_650_000
    },
    profitLoss: {
      revenue: 14_850_000,
      expenses: 5_320_000,
      profit: 9_530_000,
      margin: 64.2
    }
  };
  
  const recentTransactions = [
    { id: "TX-2025-0458", date: "03/05/2025", description: "Pago de comisión a Minimarket El Sol", category: "Comisiones", type: "Egreso", amount: 58000 },
    { id: "TX-2025-0457", date: "03/05/2025", description: "Ingreso por documentación avanzada", category: "Servicios", type: "Ingreso", amount: 125000 },
    { id: "TX-2025-0456", date: "02/05/2025", description: "Pago de comisión a Farmacia Vida", category: "Comisiones", type: "Egreso", amount: 42500 },
    { id: "TX-2025-0455", date: "02/05/2025", description: "Ingreso por verificación de documentos", category: "Servicios", type: "Ingreso", amount: 75000 },
    { id: "TX-2025-0454", date: "01/05/2025", description: "Pago de nómina mensual", category: "Nómina", type: "Egreso", amount: 3120000 },
  ];
  
  const pendingReviews = [
    { id: "REV-2025-032", description: "Reconciliación bancaria - Abril", status: "Pendiente", priority: "Alta", assignedTo: "Carlos Mendoza" },
    { id: "REV-2025-031", description: "Verificación de facturas de proveedores", status: "En proceso", priority: "Media", assignedTo: "Ana Silva" },
    { id: "REV-2025-030", description: "Auditoría de comisiones Q1", status: "Pendiente", priority: "Alta", assignedTo: "Juan Carrasco" },
    { id: "REV-2025-029", description: "Revisión de gastos operativos", status: "En proceso", priority: "Baja", assignedTo: "Carlos Mendoza" },
  ];
  
  const yearMonthOptions = [
    { value: "2025-05", label: "Mayo 2025" },
    { value: "2025-04", label: "Abril 2025" },
    { value: "2025-03", label: "Marzo 2025" },
    { value: "2025-02", label: "Febrero 2025" },
    { value: "2025-01", label: "Enero 2025" },
    { value: "2024-12", label: "Diciembre 2024" }
  ];
  
  // Formulario para nueva transacción
  const transactionFormSchema = z.object({
    description: z.string().min(5, {
      message: "La descripción debe tener al menos 5 caracteres.",
    }),
    amount: z.string().min(1, {
      message: "El monto es requerido.",
    }),
    type: z.string({
      required_error: "Seleccione el tipo de transacción.",
    }),
    category: z.string({
      required_error: "Seleccione una categoría.",
    }),
    date: z.date({
      required_error: "La fecha es requerida.",
    }),
    notes: z.string().optional(),
  });

  const transactionForm = useForm<z.infer<typeof transactionFormSchema>>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      description: "",
      amount: "",
      type: "Ingreso",
      category: "",
      date: new Date(),
      notes: "",
    },
  });

  function onTransactionSubmit(values: z.infer<typeof transactionFormSchema>) {
    console.log(values);
    // Aquí iría la lógica para guardar la transacción
    transactionForm.reset();
  }

  return (
    <VecinosAdminLayout title="Contabilidad y Gerencia Financiera">
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

            <Select defaultValue="2025-05">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                {yearMonthOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Más filtros
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default" className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Nueva Transacción
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Registrar Nueva Transacción</DialogTitle>
                  <DialogDescription>
                    Complete los detalles de la transacción financiera.
                  </DialogDescription>
                </DialogHeader>
                <Form {...transactionForm}>
                  <form onSubmit={transactionForm.handleSubmit(onTransactionSubmit)} className="space-y-6">
                    <FormField
                      control={transactionForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Input placeholder="Ingrese la descripción" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={transactionForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monto</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5">$</span>
                                <Input type="number" className="pl-7" placeholder="0.00" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={transactionForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Ingreso">Ingreso</SelectItem>
                                <SelectItem value="Egreso">Egreso</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={transactionForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoría</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar categoría" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Servicios">Servicios</SelectItem>
                                <SelectItem value="Comisiones">Comisiones</SelectItem>
                                <SelectItem value="Nómina">Nómina</SelectItem>
                                <SelectItem value="Operativos">Gastos Operativos</SelectItem>
                                <SelectItem value="Marketing">Marketing</SelectItem>
                                <SelectItem value="Impuestos">Impuestos</SelectItem>
                                <SelectItem value="Otros">Otros</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={transactionForm.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, 'PPP', { locale: es }) : <span>Seleccionar fecha</span>}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={transactionForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas adicionales</FormLabel>
                          <FormControl>
                            <Input placeholder="Notas opcionales" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">Guardar Transacción</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            
            <Button variant="outline" className="gap-2">
              <FilePlus className="h-4 w-4" />
              Generar Reporte
            </Button>
          </div>
        </div>

        {/* Tabs generales */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="ledger">Libro Mayor</TabsTrigger>
            <TabsTrigger value="reports">Informes Financieros</TabsTrigger>
            <TabsTrigger value="tax">Impuestos</TabsTrigger>
          </TabsList>
          
          {/* Dashboard de contabilidad */}
          <TabsContent value="dashboard" className="space-y-6 pt-4">
            {/* Resumen financiero */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Activos Totales</p>
                      <h3 className="text-2xl font-bold mt-1 text-[#2d219b]">
                        ${(accountingData.assetAccounts.totalAssets/1000000).toFixed(1)}M
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Período actual</p>
                    </div>
                    <div className="p-2 bg-[#2d219b] bg-opacity-10 rounded-full">
                      <CircleDollarSign className="h-5 w-5 text-[#2d219b]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pasivos Totales</p>
                      <h3 className="text-2xl font-bold mt-1 text-[#2d219b]">
                        ${(accountingData.liabilityAccounts.totalLiabilities/1000000).toFixed(1)}M
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Obligaciones actuales</p>
                    </div>
                    <div className="p-2 bg-[#2d219b] bg-opacity-10 rounded-full">
                      <ReceiptText className="h-5 w-5 text-[#2d219b]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Patrimonio</p>
                      <h3 className="text-2xl font-bold mt-1 text-[#2d219b]">
                        ${(accountingData.equityAccounts.totalEquity/1000000).toFixed(1)}M
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Capital + Utilidades</p>
                    </div>
                    <div className="p-2 bg-[#2d219b] bg-opacity-10 rounded-full">
                      <Landmark className="h-5 w-5 text-[#2d219b]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Utilidad</p>
                      <h3 className="text-2xl font-bold mt-1 text-[#2d219b]">
                        ${(accountingData.profitLoss.profit/1000000).toFixed(1)}M
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Margen: {accountingData.profitLoss.margin}%</p>
                    </div>
                    <div className="p-2 bg-[#2d219b] bg-opacity-10 rounded-full">
                      <BarChart3 className="h-5 w-5 text-[#2d219b]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Balance y Estado de Resultados */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Balance General */}
              <Card className="md:col-span-2 border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Balance General</CardTitle>
                  <CardDescription>
                    Resumen de activos, pasivos y patrimonio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex justify-between items-center w-full pr-4">
                          <span>Activos</span>
                          <span className="text-[#2d219b] font-semibold">
                            ${accountingData.assetAccounts.totalAssets.toLocaleString()}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pl-4">
                          <div className="flex justify-between text-sm">
                            <span>Efectivo y Equivalentes</span>
                            <span>${accountingData.assetAccounts.cashAndEquivalents.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Cuentas por Cobrar</span>
                            <span>${accountingData.assetAccounts.accountsReceivable.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Gastos Prepagados</span>
                            <span>${accountingData.assetAccounts.prepaidExpenses.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Activos Fijos</span>
                            <span>${accountingData.assetAccounts.fixedAssets.toLocaleString()}</span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex justify-between items-center w-full pr-4">
                          <span>Pasivos</span>
                          <span className="text-[#2d219b] font-semibold">
                            ${accountingData.liabilityAccounts.totalLiabilities.toLocaleString()}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pl-4">
                          <div className="flex justify-between text-sm">
                            <span>Cuentas por Pagar</span>
                            <span>${accountingData.liabilityAccounts.accountsPayable.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Ingresos Diferidos</span>
                            <span>${accountingData.liabilityAccounts.deferredRevenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Nómina por Pagar</span>
                            <span>${accountingData.liabilityAccounts.payroll.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Préstamos</span>
                            <span>${accountingData.liabilityAccounts.loans.toLocaleString()}</span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex justify-between items-center w-full pr-4">
                          <span>Patrimonio</span>
                          <span className="text-[#2d219b] font-semibold">
                            ${accountingData.equityAccounts.totalEquity.toLocaleString()}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pl-4">
                          <div className="flex justify-between text-sm">
                            <span>Capital</span>
                            <span>${accountingData.equityAccounts.capital.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Utilidades Retenidas</span>
                            <span>${accountingData.equityAccounts.retainedEarnings.toLocaleString()}</span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-gray-500">
                    Actualizado: {date ? format(date, 'PPP', { locale: es }) : '-'}
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="h-4 w-4" />
                    Exportar
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Estado de Resultados */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Estado de Resultados</CardTitle>
                  <CardDescription>
                    Resumen de ingresos y gastos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-b pb-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Ingresos</span>
                        <span className="font-semibold text-green-600">
                          ${accountingData.profitLoss.revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-b pb-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Gastos</span>
                        <span className="font-semibold text-red-600">
                          ${accountingData.profitLoss.expenses.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-[#2d219b]">Utilidad Neta</span>
                        <span className="font-bold text-[#2d219b]">
                          ${accountingData.profitLoss.profit.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-right mt-1 text-gray-500">
                        Margen de utilidad: {accountingData.profitLoss.margin}%
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-gray-500">
                    Período: Mayo 2025
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">
                    <ExternalLink className="h-4 w-4" />
                    Detalles
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Transacciones recientes y revisiones pendientes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Transacciones recientes */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Transacciones Recientes</CardTitle>
                  <CardDescription>
                    Últimos movimientos registrados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-xs text-gray-500">{transaction.date}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn(
                              "text-xs",
                              transaction.type === "Ingreso" 
                                ? "bg-green-100 text-green-800 hover:bg-green-100" 
                                : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                            )}>
                              {transaction.category}
                            </Badge>
                          </TableCell>
                          <TableCell className={cn(
                            "text-right font-medium",
                            transaction.type === "Ingreso" ? "text-green-600" : "text-red-600"
                          )}>
                            {transaction.type === "Ingreso" ? "+" : "-"}${transaction.amount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Ver todas las transacciones</Button>
                </CardFooter>
              </Card>
              
              {/* Revisiones pendientes */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Revisiones Pendientes</CardTitle>
                  <CardDescription>
                    Tareas de revisión contable
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingReviews.map((review) => (
                      <div key={review.id} className="flex items-start justify-between border-b pb-3">
                        <div className="flex gap-3">
                          <div className={cn(
                            "p-1.5 rounded-full h-7 w-7 flex items-center justify-center flex-shrink-0 mt-1",
                            review.priority === "Alta" 
                              ? "bg-red-100" 
                              : review.priority === "Media"
                                ? "bg-amber-100"
                                : "bg-blue-100"
                          )}>
                            <AlertCircle className={cn(
                              "h-4 w-4",
                              review.priority === "Alta" 
                                ? "text-red-600" 
                                : review.priority === "Media"
                                  ? "text-amber-600"
                                  : "text-blue-600"
                            )} />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{review.description}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {review.status}
                              </Badge>
                              <p className="text-xs text-gray-500">
                                Asignado a: {review.assignedTo}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <CheckSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Ver todas las revisiones</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Libro Mayor */}
          <TabsContent value="ledger" className="space-y-6 pt-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Libro Mayor</CardTitle>
                    <CardDescription>
                      Registro de transacciones y cuentas
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filtrar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las cuentas</SelectItem>
                        <SelectItem value="assets">Activos</SelectItem>
                        <SelectItem value="liabilities">Pasivos</SelectItem>
                        <SelectItem value="equity">Patrimonio</SelectItem>
                        <SelectItem value="revenue">Ingresos</SelectItem>
                        <SelectItem value="expenses">Gastos</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Cuenta</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Débito</TableHead>
                      <TableHead className="text-right">Crédito</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">1010</TableCell>
                      <TableCell>Caja y Bancos</TableCell>
                      <TableCell>Activo</TableCell>
                      <TableCell className="text-right">15,480,000</TableCell>
                      <TableCell className="text-right">3,030,000</TableCell>
                      <TableCell className="text-right text-[#2d219b] font-medium">12,450,000</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">1020</TableCell>
                      <TableCell>Cuentas por Cobrar</TableCell>
                      <TableCell>Activo</TableCell>
                      <TableCell className="text-right">5,320,000</TableCell>
                      <TableCell className="text-right">1,470,000</TableCell>
                      <TableCell className="text-right text-[#2d219b] font-medium">3,850,000</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">1030</TableCell>
                      <TableCell>Gastos Prepagados</TableCell>
                      <TableCell>Activo</TableCell>
                      <TableCell className="text-right">1,250,000</TableCell>
                      <TableCell className="text-right">0</TableCell>
                      <TableCell className="text-right text-[#2d219b] font-medium">1,250,000</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">2010</TableCell>
                      <TableCell>Cuentas por Pagar</TableCell>
                      <TableCell>Pasivo</TableCell>
                      <TableCell className="text-right">1,350,000</TableCell>
                      <TableCell className="text-right">4,200,000</TableCell>
                      <TableCell className="text-right text-[#2d219b] font-medium">2,850,000</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">2020</TableCell>
                      <TableCell>Ingresos Diferidos</TableCell>
                      <TableCell>Pasivo</TableCell>
                      <TableCell className="text-right">320,000</TableCell>
                      <TableCell className="text-right">800,000</TableCell>
                      <TableCell className="text-right text-[#2d219b] font-medium">480,000</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">3010</TableCell>
                      <TableCell>Capital Social</TableCell>
                      <TableCell>Patrimonio</TableCell>
                      <TableCell className="text-right">0</TableCell>
                      <TableCell className="text-right">10,000,000</TableCell>
                      <TableCell className="text-right text-[#2d219b] font-medium">10,000,000</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">4010</TableCell>
                      <TableCell>Ingresos por Servicios</TableCell>
                      <TableCell>Ingreso</TableCell>
                      <TableCell className="text-right">0</TableCell>
                      <TableCell className="text-right">14,850,000</TableCell>
                      <TableCell className="text-right text-green-600 font-medium">14,850,000</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">5010</TableCell>
                      <TableCell>Gastos Operativos</TableCell>
                      <TableCell>Gasto</TableCell>
                      <TableCell className="text-right">5,320,000</TableCell>
                      <TableCell className="text-right">0</TableCell>
                      <TableCell className="text-right text-red-600 font-medium">5,320,000</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500">
                  Mostrando 8 de 24 cuentas
                </div>
                <Button variant="outline">Ver todas las cuentas</Button>
              </CardFooter>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Diario de Transacciones</CardTitle>
                    <CardDescription>
                      Transacciones por fecha
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">
                    <PlusCircle className="h-4 w-4" />
                    Nueva Entrada
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Nº Ref.</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Cuenta</TableHead>
                      <TableHead className="text-right">Débito</TableHead>
                      <TableHead className="text-right">Crédito</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>03/05/2025</TableCell>
                      <TableCell>JE-2025-124</TableCell>
                      <TableCell>Pago de comisión a Minimarket El Sol</TableCell>
                      <TableCell>Gastos Operativos</TableCell>
                      <TableCell className="text-right">58,000</TableCell>
                      <TableCell className="text-right">-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell>Caja y Bancos</TableCell>
                      <TableCell className="text-right">-</TableCell>
                      <TableCell className="text-right">58,000</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>03/05/2025</TableCell>
                      <TableCell>JE-2025-123</TableCell>
                      <TableCell>Ingreso por documentación avanzada</TableCell>
                      <TableCell>Caja y Bancos</TableCell>
                      <TableCell className="text-right">125,000</TableCell>
                      <TableCell className="text-right">-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell>Ingresos por Servicios</TableCell>
                      <TableCell className="text-right">-</TableCell>
                      <TableCell className="text-right">125,000</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>02/05/2025</TableCell>
                      <TableCell>JE-2025-122</TableCell>
                      <TableCell>Pago de comisión a Farmacia Vida</TableCell>
                      <TableCell>Gastos Operativos</TableCell>
                      <TableCell className="text-right">42,500</TableCell>
                      <TableCell className="text-right">-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell>Caja y Bancos</TableCell>
                      <TableCell className="text-right">-</TableCell>
                      <TableCell className="text-right">42,500</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Ver todos los asientos</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Informes Financieros */}
          <TabsContent value="reports" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-[#e0deff] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Balance General</CardTitle>
                    <FileSpreadsheet className="h-5 w-5 text-[#2d219b]" />
                  </div>
                  <CardDescription>
                    Estados financieros completos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Visualiza y exporta el balance general, con detalle de activos, pasivos y patrimonio.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Eye className="h-4 w-4" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="h-4 w-4" />
                      Exportar
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <FileText className="h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-[#e0deff] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Estado de Resultados</CardTitle>
                    <BarChart3 className="h-5 w-5 text-[#2d219b]" />
                  </div>
                  <CardDescription>
                    Estado de pérdidas y ganancias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Visualiza y exporta el estado de resultados con detalle de ingresos, gastos y utilidades.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Eye className="h-4 w-4" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="h-4 w-4" />
                      Exportar
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <FileText className="h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-[#e0deff] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Flujo de Efectivo</CardTitle>
                    <CircleDollarSign className="h-5 w-5 text-[#2d219b]" />
                  </div>
                  <CardDescription>
                    Movimientos de efectivo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Visualiza y exporta el estado de flujo de efectivo con detalle de actividades operativas, de inversión y financiamiento.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Eye className="h-4 w-4" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="h-4 w-4" />
                      Exportar
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <FileText className="h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-[#e0deff] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Análisis Financiero</CardTitle>
                    <Calculator className="h-5 w-5 text-[#2d219b]" />
                  </div>
                  <CardDescription>
                    Indicadores y ratios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Análisis detallado de ratios financieros, indicadores de rendimiento y comparativas.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Eye className="h-4 w-4" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="h-4 w-4" />
                      Exportar
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <FileText className="h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Informes Mensuales Generados</CardTitle>
                <CardDescription>
                  Historial de reportes financieros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Informe</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Fecha de Generación</TableHead>
                      <TableHead>Generado por</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Paquete Financiero Mensual</TableCell>
                      <TableCell>Abril 2025</TableCell>
                      <TableCell>01/05/2025</TableCell>
                      <TableCell>Carlos Mendoza</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Share className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Paquete Financiero Mensual</TableCell>
                      <TableCell>Marzo 2025</TableCell>
                      <TableCell>02/04/2025</TableCell>
                      <TableCell>Carlos Mendoza</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Share className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Informe Trimestral</TableCell>
                      <TableCell>Q1 2025</TableCell>
                      <TableCell>05/04/2025</TableCell>
                      <TableCell>Ana Silva</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Share className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Análisis de Rendimiento</TableCell>
                      <TableCell>Q1 2025</TableCell>
                      <TableCell>08/04/2025</TableCell>
                      <TableCell>Juan Carrasco</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Share className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Ver todos los informes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Impuestos */}
          <TabsContent value="tax" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-600">IVA por Pagar</p>
                      <h3 className="text-2xl font-bold mt-1 text-[#2d219b]">$1,824,000</h3>
                      <p className="text-xs text-gray-500 mt-1">Período Mayo 2025</p>
                    </div>
                    <div className="p-2 bg-[#2d219b] bg-opacity-10 rounded-full">
                      <Receipt className="h-5 w-5 text-[#2d219b]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Retenciones</p>
                      <h3 className="text-2xl font-bold mt-1 text-[#2d219b]">$378,500</h3>
                      <p className="text-xs text-gray-500 mt-1">Acumulado mensual</p>
                    </div>
                    <div className="p-2 bg-[#2d219b] bg-opacity-10 rounded-full">
                      <ReceiptText className="h-5 w-5 text-[#2d219b]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Impuesto a la Renta</p>
                      <h3 className="text-2xl font-bold mt-1 text-[#2d219b]">$2,382,500</h3>
                      <p className="text-xs text-gray-500 mt-1">Estimado anual</p>
                    </div>
                    <div className="p-2 bg-[#2d219b] bg-opacity-10 rounded-full">
                      <Landmark className="h-5 w-5 text-[#2d219b]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Próximo Vencimiento</p>
                      <h3 className="text-2xl font-bold mt-1 text-amber-500">12/05/2025</h3>
                      <p className="text-xs text-gray-500 mt-1">Declaración IVA Abril</p>
                    </div>
                    <div className="p-2 bg-amber-100 rounded-full">
                      <CalendarIcon className="h-5 w-5 text-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Calendario Tributario</CardTitle>
                <CardDescription>
                  Próximos vencimientos y obligaciones fiscales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Obligación</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Fecha Límite</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Declaración de IVA</TableCell>
                      <TableCell>Abril 2025</TableCell>
                      <TableCell>12/05/2025</TableCell>
                      <TableCell>
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                          Pendiente
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">$1,685,000</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Retenciones</TableCell>
                      <TableCell>Abril 2025</TableCell>
                      <TableCell>15/05/2025</TableCell>
                      <TableCell>
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                          Pendiente
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">$342,800</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">PPM (Pago Provisional Mensual)</TableCell>
                      <TableCell>Abril 2025</TableCell>
                      <TableCell>12/05/2025</TableCell>
                      <TableCell>
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                          Pendiente
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">$195,000</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Declaración de IVA</TableCell>
                      <TableCell>Marzo 2025</TableCell>
                      <TableCell>12/04/2025</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Completado
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">$1,520,000</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Retenciones</TableCell>
                      <TableCell>Marzo 2025</TableCell>
                      <TableCell>15/04/2025</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Completado
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">$318,500</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500">
                  Próximo vencimiento en 9 días
                </div>
                <Button variant="outline">Ver calendario completo</Button>
              </CardFooter>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Documentos Tributarios</CardTitle>
                  <CardDescription>
                    Declaraciones y certificados fiscales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#2d219b] bg-opacity-10 rounded-full">
                          <FileText className="h-5 w-5 text-[#2d219b]" />
                        </div>
                        <div>
                          <h3 className="font-medium">Declaración IVA Marzo 2025</h3>
                          <p className="text-xs text-gray-500">Presentado: 10/04/2025</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#2d219b] bg-opacity-10 rounded-full">
                          <FileText className="h-5 w-5 text-[#2d219b]" />
                        </div>
                        <div>
                          <h3 className="font-medium">Certificado de Retenciones Q1</h3>
                          <p className="text-xs text-gray-500">Generado: 05/04/2025</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#2d219b] bg-opacity-10 rounded-full">
                          <FileText className="h-5 w-5 text-[#2d219b]" />
                        </div>
                        <div>
                          <h3 className="font-medium">Declaración IVA Febrero 2025</h3>
                          <p className="text-xs text-gray-500">Presentado: 12/03/2025</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#2d219b] bg-opacity-10 rounded-full">
                          <FileText className="h-5 w-5 text-[#2d219b]" />
                        </div>
                        <div>
                          <h3 className="font-medium">Declaración IVA Enero 2025</h3>
                          <p className="text-xs text-gray-500">Presentado: 09/02/2025</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Ver todos los documentos</Button>
                </CardFooter>
              </Card>
              
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Historial de Pagos de Impuestos</CardTitle>
                  <CardDescription>
                    Registros de pagos realizados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Fecha de Pago</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">IVA</TableCell>
                        <TableCell>Marzo 2025</TableCell>
                        <TableCell>10/04/2025</TableCell>
                        <TableCell className="text-right">$1,520,000</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Retenciones</TableCell>
                        <TableCell>Marzo 2025</TableCell>
                        <TableCell>15/04/2025</TableCell>
                        <TableCell className="text-right">$318,500</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">PPM</TableCell>
                        <TableCell>Marzo 2025</TableCell>
                        <TableCell>10/04/2025</TableCell>
                        <TableCell className="text-right">$180,000</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">IVA</TableCell>
                        <TableCell>Febrero 2025</TableCell>
                        <TableCell>12/03/2025</TableCell>
                        <TableCell className="text-right">$1,480,000</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Retenciones</TableCell>
                        <TableCell>Febrero 2025</TableCell>
                        <TableCell>15/03/2025</TableCell>
                        <TableCell className="text-right">$302,800</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Ver historial completo</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </VecinosAdminLayout>
  );
};

export default AccountingPage;