import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw, Plus, Edit, ArrowUpDown } from "lucide-react";

// Define schema for new POS provider
const providerSchema = z.object({
  name: z.string().min(1, "El nombre técnico es obligatorio"),
  displayName: z.string().min(1, "El nombre de visualización es obligatorio"),
  apiBaseUrl: z.string().url("Debe ser una URL válida"),
  apiDocumentationUrl: z.string().url("Debe ser una URL válida").optional(),
  logoUrl: z.string().url("Debe ser una URL válida").optional(),
  requiredFields: z.record(z.string(), z.string()).optional(),
  isActive: z.boolean().default(true),
});

// Filter schema for transactions
const filterSchema = z.object({
  partnerId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const PosManagementPage = () => {
  const [activeTab, setActiveTab] = useState("providers");
  const [addProviderOpen, setAddProviderOpen] = useState(false);
  const [editProvider, setEditProvider] = useState<any>(null);
  const [filter, setFilter] = useState<z.infer<typeof filterSchema>>({
    partnerId: "",
    startDate: "",
    endDate: "",
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect if not logged in or not an admin
  useEffect(() => {
    if (!user) {
      setLocation("/auth");
    } else if (user.role !== "admin") {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Form for adding a new POS provider
  const providerForm = useForm<z.infer<typeof providerSchema>>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      name: "",
      displayName: "",
      apiBaseUrl: "",
      apiDocumentationUrl: "",
      logoUrl: "",
      requiredFields: { apiKey: "API Key", storeId: "ID de tienda" },
      isActive: true,
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!addProviderOpen && !editProvider) {
      providerForm.reset();
    }
  }, [addProviderOpen, editProvider, providerForm]);

  // Set form values when editing a provider
  useEffect(() => {
    if (editProvider) {
      providerForm.reset({
        name: editProvider.name,
        displayName: editProvider.displayName,
        apiBaseUrl: editProvider.apiBaseUrl,
        apiDocumentationUrl: editProvider.apiDocumentationUrl || "",
        logoUrl: editProvider.logoUrl || "",
        requiredFields: editProvider.requiredFields || {},
        isActive: editProvider.isActive,
      });
    }
  }, [editProvider, providerForm]);

  // Get all providers (admin route)
  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ["/api/admin/pos/providers"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/pos/providers");
      return await res.json();
    },
    enabled: !!user && user.role === "admin",
  });

  // Get all partners for filter
  const { data: partners, isLoading: partnersLoading } = useQuery({
    queryKey: ["/api/admin/partners"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/partners");
      return await res.json();
    },
    enabled: !!user && user.role === "admin",
  });

  // Get transactions based on filters
  const getTransactionsQueryKey = () => {
    const base = "/api/admin/pos/transactions";
    const params = new URLSearchParams();
    
    if (filter.partnerId) params.append("partnerId", filter.partnerId);
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
    enabled: !!user && user.role === "admin",
  });

  // Get summary based on filters
  const getSummaryQueryKey = () => {
    const base = "/api/admin/pos/summary";
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
    enabled: !!user && user.role === "admin",
  });

  // Add provider mutation
  const addProviderMutation = useMutation({
    mutationFn: async (data: z.infer<typeof providerSchema>) => {
      const res = await apiRequest("POST", "/api/admin/pos/providers", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Proveedor agregado",
        description: "El proveedor POS ha sido agregado exitosamente.",
        variant: "default",
      });
      setAddProviderOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pos/providers"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar el proveedor POS.",
        variant: "destructive",
      });
    },
  });

  // Update provider mutation
  const updateProviderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof providerSchema> }) => {
      const res = await apiRequest("PUT", `/api/admin/pos/providers/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Proveedor actualizado",
        description: "El proveedor POS ha sido actualizado exitosamente.",
        variant: "default",
      });
      setEditProvider(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pos/providers"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el proveedor POS.",
        variant: "destructive",
      });
    },
  });

  // Sync transactions for a partner
  const syncMutation = useMutation({
    mutationFn: async (partnerId: number) => {
      const res = await apiRequest("POST", `/api/admin/pos/partners/${partnerId}/sync`);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sincronización exitosa",
        description: data.message || "Transacciones sincronizadas correctamente.",
        variant: "default",
      });
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

  // Seed initial providers
  const seedProvidersMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/pos/seed-providers");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Proveedores inicializados",
        description: "Se han inicializado los proveedores POS predeterminados.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pos/providers"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudieron inicializar los proveedores POS.",
        variant: "destructive",
      });
    },
  });

  const onSubmitProvider = (data: z.infer<typeof providerSchema>) => {
    if (editProvider) {
      updateProviderMutation.mutate({ id: editProvider.id, data });
    } else {
      addProviderMutation.mutate(data);
    }
  };

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de POS</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="providers">Proveedores</TabsTrigger>
          <TabsTrigger value="partners">Socios y Ventas</TabsTrigger>
          <TabsTrigger value="summary">Resumen</TabsTrigger>
        </TabsList>

        <TabsContent value="providers">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Proveedores POS</CardTitle>
                  <CardDescription>
                    Gestione los proveedores de sistemas de ventas disponibles para los socios.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => seedProvidersMutation.mutate()}
                    disabled={seedProvidersMutation.isPending || (providers && providers.length > 0)}
                  >
                    {seedProvidersMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Inicializar proveedores
                  </Button>
                  <Dialog open={addProviderOpen} onOpenChange={setAddProviderOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo proveedor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Agregar nuevo proveedor POS</DialogTitle>
                        <DialogDescription>
                          Complete la información del proveedor de sistema de ventas.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...providerForm}>
                        <form onSubmit={providerForm.handleSubmit(onSubmitProvider)} className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={providerForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nombre técnico</FormLabel>
                                  <FormControl>
                                    <Input placeholder="transbank" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Identificador único (sin espacios ni caracteres especiales).
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={providerForm.control}
                              name="displayName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nombre de visualización</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Transbank" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Nombre que verán los socios.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={providerForm.control}
                            name="apiBaseUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>URL base de API</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://api.proveedor.com/v1" {...field} />
                                </FormControl>
                                <FormDescription>
                                  URL base para las llamadas a la API.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={providerForm.control}
                              name="apiDocumentationUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>URL de documentación (opcional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://docs.proveedor.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={providerForm.control}
                              name="logoUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>URL del logo (opcional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://proveedor.com/logo.png" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={providerForm.control}
                            name="isActive"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>Activo</FormLabel>
                                  <FormDescription>
                                    Determina si este proveedor está disponible para los socios.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <DialogFooter>
                            <Button 
                              type="submit" 
                              disabled={addProviderMutation.isPending || updateProviderMutation.isPending}
                            >
                              {(addProviderMutation.isPending || updateProviderMutation.isPending) && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              {editProvider ? "Actualizar proveedor" : "Agregar proveedor"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>

                  {editProvider && (
                    <Dialog open={!!editProvider} onOpenChange={(open) => !open && setEditProvider(null)}>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Editar proveedor POS</DialogTitle>
                          <DialogDescription>
                            Modifique la información del proveedor de sistema de ventas.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...providerForm}>
                          <form onSubmit={providerForm.handleSubmit(onSubmitProvider)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={providerForm.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nombre técnico</FormLabel>
                                    <FormControl>
                                      <Input placeholder="transbank" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                      Identificador único (sin espacios ni caracteres especiales).
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={providerForm.control}
                                name="displayName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nombre de visualización</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Transbank" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                      Nombre que verán los socios.
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={providerForm.control}
                              name="apiBaseUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>URL base de API</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://api.proveedor.com/v1" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    URL base para las llamadas a la API.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={providerForm.control}
                                name="apiDocumentationUrl"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>URL de documentación (opcional)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="https://docs.proveedor.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={providerForm.control}
                                name="logoUrl"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>URL del logo (opcional)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="https://proveedor.com/logo.png" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={providerForm.control}
                              name="isActive"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                  <div className="space-y-0.5">
                                    <FormLabel>Activo</FormLabel>
                                    <FormDescription>
                                      Determina si este proveedor está disponible para los socios.
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <DialogFooter>
                              <Button 
                                type="submit" 
                                disabled={updateProviderMutation.isPending}
                              >
                                {updateProviderMutation.isPending && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Actualizar proveedor
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {providersLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : providers?.length > 0 ? (
                <Table>
                  <TableCaption>Lista de proveedores POS configurados</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre técnico</TableHead>
                      <TableHead>Nombre para mostrar</TableHead>
                      <TableHead>URL de API</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {providers.map((provider: any) => (
                      <TableRow key={provider.id}>
                        <TableCell className="font-medium">{provider.name}</TableCell>
                        <TableCell>{provider.displayName}</TableCell>
                        <TableCell className="max-w-xs truncate">{provider.apiBaseUrl}</TableCell>
                        <TableCell>
                          <Badge variant={provider.isActive ? "default" : "secondary"}>
                            {provider.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditProvider(provider)}
                          >
                            <Edit className="h-4 w-4 mr-1" /> Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No hay proveedores POS configurados.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => seedProvidersMutation.mutate()}
                    disabled={seedProvidersMutation.isPending}
                  >
                    {seedProvidersMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Inicializar proveedores predeterminados
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners">
          <Card>
            <CardHeader>
              <CardTitle>Socios y Ventas</CardTitle>
              <CardDescription>
                Visualice y gestione las ventas de los socios a través de sus sistemas POS.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex flex-col">
                  <label htmlFor="partnerId" className="text-sm mb-1">Socio</label>
                  <Select
                    value={filter.partnerId}
                    onValueChange={(value) => setFilter({ ...filter, partnerId: value })}
                  >
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Todos los socios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los socios</SelectItem>
                      {partnersLoading ? (
                        <SelectItem value="loading" disabled>Cargando socios...</SelectItem>
                      ) : partners?.length > 0 ? (
                        partners.map((partner: any) => (
                          <SelectItem key={partner.id} value={partner.id.toString()}>
                            {partner.storeName}
                          </SelectItem>
                        ))
                      ) : null}
                    </SelectContent>
                  </Select>
                </div>
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
                    onClick={() => setFilter({ partnerId: "", startDate: "", endDate: "" })}
                  >
                    Limpiar
                  </Button>
                </div>
              </div>

              {filter.partnerId && filter.partnerId !== "" && (
                <div className="mb-4">
                  <Button
                    variant="outline"
                    onClick={() => syncMutation.mutate(parseInt(filter.partnerId as string))}
                    disabled={syncMutation.isPending}
                  >
                    {syncMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Sincronizar ventas del socio
                  </Button>
                </div>
              )}

              {transactionsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : transactions?.length > 0 ? (
                <Table>
                  <TableCaption>Lista de transacciones POS de socios</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Socio</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>ID Transacción</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead className="text-right">Comisión</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((item: any) => (
                      <TableRow key={item.transaction.id}>
                        <TableCell>{item.partner.storeName || item.partner.name || 'Sin nombre'}</TableCell>
                        <TableCell>
                          {format(new Date(item.transaction.transactionDate), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          {item.transaction.transactionId || item.transaction.posReference || "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.transaction.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.transaction.commissionAmount || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No hay transacciones para el período o socio seleccionado.</p>
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
                Visualice el resumen de ventas y comisiones por socio.
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
                    onClick={() => setFilter({ ...filter, startDate: "", endDate: "" })}
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
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Socios activos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{summary.overall.totalPartners}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Monto total ventas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary.overall.totalAmount)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Comisión total</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary.overall.totalCommission)}</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Desglose por socio</h3>
                    <Table>
                      <TableCaption>Resumen de ventas por socio</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Socio</TableHead>
                          <TableHead className="text-center">Transacciones</TableHead>
                          <TableHead className="text-right">Monto ventas</TableHead>
                          <TableHead className="text-right">Comisión</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summary.partners.map((partner: any) => (
                          <TableRow key={partner.partnerId}>
                            <TableCell className="font-medium">{partner.partnerName}</TableCell>
                            <TableCell className="text-center">{partner.totalTransactions}</TableCell>
                            <TableCell className="text-right">{formatCurrency(partner.totalAmount)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(partner.totalCommission)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No hay datos disponibles para el período seleccionado.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PosManagementPage;