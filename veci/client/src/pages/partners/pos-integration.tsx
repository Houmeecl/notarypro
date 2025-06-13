import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { PersonalizedOnboarding } from '@/components/onboarding/PersonalizedOnboarding';
import { 
  Loader2,
  RefreshCw,
  BarChart3,
  CalendarIcon,
  DollarSign,
  ShoppingBag
} from 'lucide-react';

// Función para formatear moneda chilena
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(amount);
};

const PosIntegrationPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    posProvider: ''
  });

  // Verificar si el usuario es un socio antes de mostrar contenido
  if (!user || user.role !== 'partner') {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Acceso restringido</CardTitle>
            <CardDescription>
              Esta sección está disponible solo para socios del programa Vecinos NotaryPro Express.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Por favor, inicie sesión con una cuenta de socio para acceder a esta sección.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Función para construir la URL de consulta con filtros
  const getTransactionsQueryKey = () => {
    const params = new URLSearchParams();
    if (filter.startDate) params.append('startDate', filter.startDate);
    if (filter.endDate) params.append('endDate', filter.endDate);
    if (filter.posProvider) params.append('posProvider', filter.posProvider);
    
    const base = `/api/partner/pos/transactions`;
    const queryString = params.toString();
    return queryString ? `${base}?${queryString}` : base;
  };

  const getSummaryQueryKey = () => {
    const params = new URLSearchParams();
    if (filter.startDate) params.append('startDate', filter.startDate);
    if (filter.endDate) params.append('endDate', filter.endDate);
    
    const base = `/api/partner/pos/summary`;
    const queryString = params.toString();
    return queryString ? `${base}?${queryString}` : base;
  };

  // Consultar transacciones
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: [getTransactionsQueryKey()],
    queryFn: async () => {
      const url = getTransactionsQueryKey();
      const res = await apiRequest("GET", url);
      return await res.json();
    },
    enabled: !!user && user.role === "partner",
  });

  // Consultar resumen
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: [getSummaryQueryKey()],
    queryFn: async () => {
      const url = getSummaryQueryKey();
      const res = await apiRequest("GET", url);
      return await res.json();
    },
    enabled: !!user && user.role === "partner",
  });

  // Consultar proveedores POS disponibles
  const { data: posProviders, isLoading: providersLoading } = useQuery({
    queryKey: ['/api/partner/pos/providers'],
    queryFn: async () => {
      const res = await apiRequest("GET", '/api/partner/pos/providers');
      return await res.json();
    },
    enabled: !!user && user.role === "partner",
  });

  // Mutación para sincronizar transacciones
  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/partner/pos/sync`);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sincronización exitosa",
        description: data.message || "Transacciones sincronizadas correctamente.",
        variant: "default",
      });
      // Invalidar consultas para recargar datos
      queryClient.invalidateQueries({ queryKey: [getTransactionsQueryKey()] });
      queryClient.invalidateQueries({ queryKey: [getSummaryQueryKey()] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error de sincronización",
        description: error.message || "No se pudieron sincronizar las transacciones.",
        variant: "destructive",
      });
    },
  });

  // Configurar preferencias de POS
  const configMutation = useMutation({
    mutationFn: async (data: { posProvider: string }) => {
      const res = await apiRequest("POST", "/api/partner/pos/settings", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Configuración guardada",
        description: "Su configuración de POS ha sido actualizada.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    },
  });

  // Manejar cambios en filtros
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value
    });
  };

  // Manejar cambio de proveedor POS
  const handleProviderChange = (value: string) => {
    setFilter({
      ...filter,
      posProvider: value
    });
  };

  // Guardar configuración de POS
  const saveSettings = () => {
    if (filter.posProvider) {
      configMutation.mutate({ posProvider: filter.posProvider });
    }
  };

  // Calcular estadísticas
  const totalTransactions = summary?.totalTransactions || 0;
  const totalSales = summary?.totalAmount || 0;
  const totalCommission = summary?.totalCommission || 0;

  return (
    <div className="container py-8">
      <PersonalizedOnboarding showTutorialButton={true} />
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Integración POS</h1>
          <p className="text-muted-foreground">
            Gestione sus ventas y comisiones a través de su sistema de punto de venta
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => syncMutation.mutate()} 
            disabled={syncMutation.isPending}
            className="flex"
          >
            {syncMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Sincronizar ventas
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">Panel principal</TabsTrigger>
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        {/* PANEL PRINCIPAL */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Tarjetas de estadísticas */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Transacciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <ShoppingBag className="h-5 w-5 text-muted-foreground mr-2" />
                  <div className="text-2xl font-bold">
                    {summaryLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      totalTransactions
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total de ventas registradas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ventas totales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
                  <div className="text-2xl font-bold">
                    {summaryLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      formatCurrency(totalSales)
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Monto total de ventas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Comisiones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-muted-foreground mr-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {summaryLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      formatCurrency(totalCommission)
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Comisiones generadas (15%)
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumen de actividad</CardTitle>
              <CardDescription>
                Visualice sus ventas y comisiones en un periodo seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex flex-col">
                  <Label htmlFor="startDate" className="text-sm mb-1">Fecha inicio</Label>
                  <div className="relative">
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={filter.startDate}
                      onChange={handleFilterChange}
                      className="w-40"
                    />
                    <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="endDate" className="text-sm mb-1">Fecha fin</Label>
                  <div className="relative">
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={filter.endDate}
                      onChange={handleFilterChange}
                      className="w-40"
                    />
                    <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setFilter({ ...filter, startDate: "", endDate: "" })}
                  >
                    Limpiar
                  </Button>
                </div>
              </div>

              {summary?.transactionsByDay?.length > 0 ? (
                <div className="space-y-6">
                  <h3 className="font-medium">Desglose por día</h3>
                  <Table>
                    <TableCaption>Resumen de transacciones por día</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-center">Transacciones</TableHead>
                        <TableHead className="text-right">Monto ventas</TableHead>
                        <TableHead className="text-right">Comisión</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.transactionsByDay.map((day: any) => (
                        <TableRow key={day.date}>
                          <TableCell>
                            {format(new Date(day.date), "dd 'de' MMMM, yyyy", { locale: es })}
                          </TableCell>
                          <TableCell className="text-center">{day.count}</TableCell>
                          <TableCell className="text-right">{formatCurrency(day.amount)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(day.commission)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No hay datos para el periodo seleccionado.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => syncMutation.mutate()} 
                    disabled={syncMutation.isPending}
                    className="mt-4"
                  >
                    {syncMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Sincronizar ventas
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TRANSACCIONES */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transacciones POS</CardTitle>
              <CardDescription>
                Visualice todas las transacciones procesadas en su punto de venta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex flex-col">
                  <Label htmlFor="txStartDate" className="text-sm mb-1">Fecha inicio</Label>
                  <Input
                    id="txStartDate"
                    name="startDate"
                    type="date"
                    value={filter.startDate}
                    onChange={handleFilterChange}
                    className="w-40"
                  />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="txEndDate" className="text-sm mb-1">Fecha fin</Label>
                  <Input
                    id="txEndDate"
                    name="endDate"
                    type="date"
                    value={filter.endDate}
                    onChange={handleFilterChange}
                    className="w-40"
                  />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="posProvider" className="text-sm mb-1">Proveedor POS</Label>
                  <Select
                    value={filter.posProvider}
                    onValueChange={handleProviderChange}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      {posProviders?.map((provider: any) => (
                        <SelectItem key={provider.id} value={provider.id.toString()}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setFilter({ startDate: "", endDate: "", posProvider: "" })}
                  >
                    Limpiar
                  </Button>
                </div>
              </div>

              {transactionsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : transactions?.length > 0 ? (
                <Table>
                  <TableCaption>Lista de transacciones</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>ID Transacción</TableHead>
                      <TableHead>Proveedor POS</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead className="text-right">Comisión</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {format(new Date(item.transactionDate), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          {item.transactionId || item.posReference || "N/A"}
                        </TableCell>
                        <TableCell>
                          {item.posProvider?.name || "Desconocido"}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.commissionAmount || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No hay transacciones para el período seleccionado.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONFIGURACIÓN */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del POS</CardTitle>
              <CardDescription>
                Configure su integración con sistemas de punto de venta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="posProviderSetting" className="mb-2 block">
                    Proveedor de POS preferido
                  </Label>
                  <Select
                    value={filter.posProvider}
                    onValueChange={handleProviderChange}
                  >
                    <SelectTrigger id="posProviderSetting">
                      <SelectValue placeholder="Seleccione un proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {providersLoading ? (
                        <div className="flex justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        posProviders?.map((provider: any) => (
                          <SelectItem key={provider.id} value={provider.id.toString()}>
                            {provider.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-2">
                    Seleccione el proveedor de POS que utiliza en su negocio.
                  </p>
                </div>
                
                <div>
                  <Label className="mb-2 block">Comisión actual</Label>
                  <div className="text-2xl font-bold">15%</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Porcentaje de comisión por cada venta procesada. 
                    Este valor es fijo para todos los socios.
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="bg-primary/10 p-4 rounded-md">
                <h3 className="font-medium mb-2">Sobre la integración POS</h3>
                <p className="text-sm">
                  Esta integración le permite conectar su sistema de punto de venta (POS) 
                  con la plataforma NotaryPro, lo que facilita el seguimiento de transacciones
                  y el cálculo automático de comisiones.
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-2">
                    <div className="bg-primary/20 rounded-full p-1">
                      <RefreshCw className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Sincronización automática</h4>
                      <p className="text-xs text-muted-foreground">
                        Las transacciones se sincronizan automáticamente cada 24 horas.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="bg-primary/20 rounded-full p-1">
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Cálculo de comisiones</h4>
                      <p className="text-xs text-muted-foreground">
                        Las comisiones se calculan automáticamente sobre el monto total.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setFilter({ ...filter, posProvider: '' })}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={saveSettings}
                  disabled={configMutation.isPending}
                >
                  {configMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar configuración'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PosIntegrationPage;