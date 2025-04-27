import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Components
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle, XCircle, RefreshCw, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

// Define schema for POS configuration form
const posConfigSchema = z.object({
  posProvider: z.string({ required_error: "Seleccione un proveedor POS" }),
  posApiKey: z.string().min(1, "La API Key es obligatoria"),
  posStoreId: z.string().min(1, "El ID de la tienda es obligatorio"),
});

// Date filter schema 
const dateFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const PosIntegrationPage = () => {
  const [activeTab, setActiveTab] = useState("config");
  const { toast } = useToast();
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [filter, setFilter] = useState({ startDate: "", endDate: "" });

  // Redirect if not logged in or not a partner
  useEffect(() => {
    if (!user) {
      setLocation("/auth");
    } else if (user.role !== "partner") {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Get POS integration status
  const { data: posStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/partners/pos/status"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/partners/pos/status");
      return await res.json();
    },
    enabled: !!user && user.role === "partner",
  });

  // Get available POS providers
  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ["/api/partners/pos/providers"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/partners/pos/providers");
      return await res.json();
    },
    enabled: !!user && user.role === "partner",
  });

  // Configure POS mutation
  const configureMutation = useMutation({
    mutationFn: async (data: z.infer<typeof posConfigSchema>) => {
      const res = await apiRequest("POST", "/api/partners/pos/configure", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuración exitosa",
        description: "La integración con el POS ha sido configurada correctamente.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/partners/pos/status"] });
      setActiveTab("transactions");
    },
    onError: (error: Error) => {
      toast({
        title: "Error de configuración",
        description: error.message || "No se pudo configurar la integración con el POS.",
        variant: "destructive",
      });
    },
  });

  // Sync transactions mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/partners/pos/sync");
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sincronización exitosa",
        description: data.message || "Transacciones sincronizadas correctamente.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/partners/pos/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/partners/pos/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/partners/pos/status"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error de sincronización",
        description: error.message || "No se pudieron sincronizar las transacciones.",
        variant: "destructive",
      });
    },
  });

  // Get transactions with filter
  const getTransactionsQueryKey = () => {
    const base = "/api/partners/pos/transactions";
    const params = new URLSearchParams();
    
    if (filter.startDate) params.append("startDate", filter.startDate);
    if (filter.endDate) params.append("endDate", filter.endDate);
    
    const queryString = params.toString();
    return queryString ? `${base}?${queryString}` : base;
  };

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: [getTransactionsQueryKey()],
    queryFn: async () => {
      const url = getTransactionsQueryKey();
      const res = await apiRequest("GET", url);
      return await res.json();
    },
    enabled: !!user && user.role === "partner" && posStatus?.posIntegrated === true,
  });

  // Get summary with filter
  const getSummaryQueryKey = () => {
    const base = "/api/partners/pos/summary";
    const params = new URLSearchParams();
    
    if (filter.startDate) params.append("startDate", filter.startDate);
    if (filter.endDate) params.append("endDate", filter.endDate);
    
    const queryString = params.toString();
    return queryString ? `${base}?${queryString}` : base;
  };

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: [getSummaryQueryKey()],
    queryFn: async () => {
      const url = getSummaryQueryKey();
      const res = await apiRequest("GET", url);
      return await res.json();
    },
    enabled: !!user && user.role === "partner" && posStatus?.posIntegrated === true,
  });

  // Form for POS configuration
  const configForm = useForm<z.infer<typeof posConfigSchema>>({
    resolver: zodResolver(posConfigSchema),
    defaultValues: {
      posProvider: posStatus?.posProvider || "",
      posApiKey: "",
      posStoreId: posStatus?.posStoreId || "",
    },
  });

  // Update form values when status is loaded
  useEffect(() => {
    if (posStatus) {
      configForm.reset({
        posProvider: posStatus.posProvider || "",
        posApiKey: "", // For security reasons, we don't display the existing API key
        posStoreId: posStatus.posStoreId || "",
      });
    }
  }, [posStatus, configForm]);

  const onSubmitConfig = (data: z.infer<typeof posConfigSchema>) => {
    configureMutation.mutate(data);
  };

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount / 100); // Convert cents to CLP
  };

  // Render loading state
  if (statusLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Integración con Sistema de Ventas (POS)</h1>
        {posStatus?.posIntegrated && (
          <Button 
            variant="outline" 
            onClick={() => syncMutation.mutate()} 
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Sincronizar ventas
          </Button>
        )}
      </div>

      {posStatus?.posIntegrated ? (
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Integración configurada</AlertTitle>
          <AlertDescription>
            Su sistema de ventas está integrado con la plataforma. Proveedor: {posStatus.posProvider}
            {posStatus.lastSyncedAt && (
              <span className="block mt-1 text-sm">
                Última sincronización: {format(new Date(posStatus.lastSyncedAt), "dd/MM/yyyy HH:mm")}
              </span>
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Integración no configurada</AlertTitle>
          <AlertDescription>
            Configure su sistema de ventas (POS) para poder rastrear automáticamente las ventas y calcular comisiones.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">Configuración</TabsTrigger>
          <TabsTrigger value="transactions" disabled={!posStatus?.posIntegrated}>Transacciones</TabsTrigger>
          <TabsTrigger value="summary" disabled={!posStatus?.posIntegrated}>Resumen</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configurar integración con POS</CardTitle>
              <CardDescription>
                Complete los detalles de su sistema de ventas para habilitar la integración.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...configForm}>
                <form onSubmit={configForm.handleSubmit(onSubmitConfig)} className="space-y-6">
                  <FormField
                    control={configForm.control}
                    name="posProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proveedor POS</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={providersLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un proveedor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {providersLoading ? (
                              <SelectItem value="loading" disabled>Cargando proveedores...</SelectItem>
                            ) : providers?.length > 0 ? (
                              providers.map((provider: any) => (
                                <SelectItem key={provider.id} value={provider.name}>
                                  {provider.displayName}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>No hay proveedores disponibles</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          El sistema de ventas que utiliza en su negocio.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={configForm.control}
                    name="posApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Ingrese su API Key" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          {posStatus?.posIntegrated 
                            ? "Dejar en blanco para mantener la clave existente." 
                            : "Clave de autenticación proporcionada por su proveedor POS."}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={configForm.control}
                    name="posStoreId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID de Tienda</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ingrese el ID de su tienda" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Identificador único de su tienda en el sistema POS.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={configureMutation.isPending}
                  >
                    {configureMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {posStatus?.posIntegrated ? "Actualizar configuración" : "Configurar integración"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transacciones</CardTitle>
              <CardDescription>
                Lista de transacciones registradas desde su sistema de ventas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex flex-col">
                  <label htmlFor="startDate" className="text-sm mb-1">Fecha inicio</label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={filter.startDate}
                    onChange={handleFilterChange}
                    className="w-40"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="endDate" className="text-sm mb-1">Fecha fin</label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={filter.endDate}
                    onChange={handleFilterChange}
                    className="w-40"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setFilter({ startDate: "", endDate: "" })}
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
                  <TableCaption>Lista de transacciones del POS</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>ID Transacción</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead className="text-right">Comisión</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction: any) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {format(new Date(transaction.transactionDate), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell>{transaction.transactionId || transaction.posReference || "N/A"}</TableCell>
                        <TableCell className="text-right">{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(transaction.commissionAmount || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10">
                  <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <p>No hay transacciones para el período seleccionado.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de ventas</CardTitle>
              <CardDescription>
                Resumen de sus ventas y comisiones del período seleccionado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex flex-col">
                  <label htmlFor="summaryStartDate" className="text-sm mb-1">Fecha inicio</label>
                  <Input
                    id="summaryStartDate"
                    name="startDate"
                    type="date"
                    value={filter.startDate}
                    onChange={handleFilterChange}
                    className="w-40"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="summaryEndDate" className="text-sm mb-1">Fecha fin</label>
                  <Input
                    id="summaryEndDate"
                    name="endDate"
                    type="date"
                    value={filter.endDate}
                    onChange={handleFilterChange}
                    className="w-40"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setFilter({ startDate: "", endDate: "" })}
                  >
                    Limpiar
                  </Button>
                </div>
              </div>

              {summaryLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : summary ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total transacciones</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{summary.totalTransactions}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Monto total</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary.totalAmount)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Comisión total</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary.totalCommission)}</div>
                      </CardContent>
                    </Card>
                  </div>

                  {summary.firstTransactionDate && summary.lastTransactionDate && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Período de transacciones</h3>
                      <p>
                        Desde: {format(new Date(summary.firstTransactionDate), "dd/MM/yyyy")} - 
                        Hasta: {format(new Date(summary.lastTransactionDate), "dd/MM/yyyy")}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10">
                  <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <p>No hay datos disponibles para el período seleccionado.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PosIntegrationPage;