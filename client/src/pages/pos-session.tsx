import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Calendar, Clock, DollarSign, FileText, Info, Loader2, Receipt, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Esquema de formulario para cerrar sesión
const closeSessionSchema = z.object({
  finalAmount: z.string().min(1, 'Debe ingresar el monto final').transform(val => parseFloat(val)),
  notes: z.string().optional(),
});

type CloseSessionValues = z.infer<typeof closeSessionSchema>;

export default function POSSessionPage() {
  const { deviceCode } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isClosingSession, setIsClosingSession] = useState(false);

  // Obtener detalles del dispositivo
  const { data: device, isLoading: isLoadingDevice, error } = useQuery({
    queryKey: ['/api/pos-management/devices', deviceCode],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', `/api/pos-management/devices/${deviceCode}`);
        return await res.json();
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo obtener información del dispositivo',
        });
        throw error;
      }
    },
  });

  // Obtener sesión activa
  const { data: session, isLoading: isLoadingSession, refetch: refetchSession } = useQuery({
    queryKey: ['/api/pos-management/active-session', deviceCode],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/pos-management/devices/${deviceCode}/active-session`);
      if (res.status === 404) {
        return null;
      }
      return await res.json();
    },
    retry: false,
  });

  // Obtener ventas de la sesión actual
  const { data: sales, isLoading: isLoadingSales, refetch: refetchSales } = useQuery({
    queryKey: ['/api/pos-management/sales', session?.id],
    queryFn: async () => {
      if (!session?.id) return [];
      const res = await apiRequest('GET', `/api/pos-management/sessions/${session.id}/sales`);
      return await res.json();
    },
    enabled: !!session?.id,
  });

  // Formatear fecha y hora
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calcular total de ventas
  const calculateTotal = () => {
    if (!sales || sales.length === 0) return 0;
    const total = sales.reduce((sum, sale) => sum + parseFloat(sale.amount), 0);
    return total.toFixed(2);
  };

  // Mutación para abrir sesión
  const openSessionMutation = useMutation({
    mutationFn: async (data: { deviceCode: string; initialAmount: number; notes?: string }) => {
      const res = await apiRequest('POST', '/api/pos-management/sessions/open', data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Sesión abierta',
        description: `Sesión ${data.sessionCode} iniciada exitosamente`,
      });
      refetchSession();
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `No se pudo abrir la sesión: ${error.message}`,
      });
    },
  });

  // Mutación para cerrar sesión
  const closeSessionMutation = useMutation({
    mutationFn: async (data: { sessionId: number; finalAmount: number; notes?: string }) => {
      const res = await apiRequest('POST', '/api/pos-management/sessions/close', data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        variant: 'success',
        title: 'Sesión cerrada',
        description: `Sesión ${data.sessionCode} cerrada exitosamente`,
      });
      setIsClosingSession(false);
      refetchSession();
      // Recargar datos de sesiones
      queryClient.invalidateQueries({ queryKey: ['/api/pos-management/devices', deviceCode, 'sessions'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `No se pudo cerrar la sesión: ${error.message}`,
      });
    },
  });

  // Formulario para cerrar sesión
  const form = useForm<CloseSessionValues>({
    resolver: zodResolver(closeSessionSchema),
    defaultValues: {
      finalAmount: '',
      notes: '',
    },
  });

  // Manejar envío del formulario de cierre
  const onSubmit = (values: CloseSessionValues) => {
    if (session?.id) {
      closeSessionMutation.mutate({
        sessionId: session.id,
        finalAmount: values.finalAmount,
        notes: values.notes,
      });
    }
  };

  // Manejar apertura de sesión
  const handleOpenSession = () => {
    openSessionMutation.mutate({
      deviceCode: deviceCode || '',
      initialAmount: 0,
    });
  };

  // Cargar si está cargando datos
  if (isLoadingDevice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Cargando información del dispositivo...</p>
      </div>
    );
  }

  // Mostrar error si no se pudo cargar el dispositivo
  if (!device) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTitle>Dispositivo no encontrado</AlertTitle>
              <AlertDescription>
                No se pudo obtener información del dispositivo con código {deviceCode}.
              </AlertDescription>
            </Alert>
            <Button className="mt-4" onClick={() => setLocation('/pos-menu')}>
              Volver al menú
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Dispositivo POS</CardTitle>
              <CardDescription>Información del dispositivo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Código</h3>
                  <p className="font-semibold">{device.deviceCode}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Nombre</h3>
                  <p>{device.deviceName}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Tipo</h3>
                  <p>{device.deviceType}</p>
                </div>
                {device.deviceModel && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Modelo</h3>
                    <p>{device.deviceModel}</p>
                  </div>
                )}
                {device.location && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Ubicación</h3>
                    <p>{device.location}</p>
                  </div>
                )}
                <div className="pt-2">
                  <Badge variant={device.isDemo ? "outline" : "default"}>
                    {device.isDemo ? "Modo Demo" : "Modo Real"}
                  </Badge>
                  {' '}
                  <Badge variant={device.isActive ? "success" : "destructive"}>
                    {device.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => setLocation('/pos-menu')}>
                Volver al menú
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="w-full md:w-2/3">
          {isLoadingSession ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="ml-2">Verificando estado de sesión...</p>
                </div>
              </CardContent>
            </Card>
          ) : session ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl font-bold">Sesión Activa</CardTitle>
                    <CardDescription>
                      Código: {session.sessionCode}
                    </CardDescription>
                  </div>
                  <Badge className="text-sm">Estado: Abierta</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-1" /> Apertura
                    </h3>
                    <p>{formatDateTime(session.openingTime)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" /> Monto Inicial
                    </h3>
                    <p>${parseFloat(session.initialAmount).toLocaleString('es-CL')}</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="mb-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Receipt className="h-4 w-4 mr-1" /> Ventas de la Sesión
                  </h3>
                  
                  {isLoadingSales ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <p className="ml-2">Cargando ventas...</p>
                    </div>
                  ) : sales && sales.length > 0 ? (
                    <ScrollArea className="h-64 w-full rounded-md border">
                      <div className="p-4">
                        {sales.map((sale) => (
                          <div key={sale.id} className="mb-3 pb-3 border-b">
                            <div className="flex justify-between">
                              <div className="font-medium">
                                ${parseFloat(sale.amount).toLocaleString('es-CL')}
                              </div>
                              <Badge variant={
                                sale.status === 'completed' ? 'success' : 
                                sale.status === 'refunded' ? 'destructive' : 'outline'
                              }>
                                {sale.status === 'completed' ? 'Completada' : 
                                 sale.status === 'refunded' ? 'Reembolsada' : 'Pendiente'}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground flex justify-between mt-1">
                              <span>ID: {sale.transactionId || 'N/A'}</span>
                              <span>{new Date(sale.createdAt).toLocaleTimeString('es-CL')}</span>
                            </div>
                            <div className="text-sm">
                              Método: {sale.paymentMethod === 'cash' ? 'Efectivo' : 
                                     sale.paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground border rounded-md">
                      No hay ventas registradas en esta sesión
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center bg-muted p-3 rounded-md">
                  <div>
                    <span className="text-sm text-muted-foreground">Total de ventas:</span>
                    <p className="font-bold text-xl">${calculateTotal()}</p>
                  </div>
                  <Button 
                    variant="default" 
                    onClick={() => setIsClosingSession(true)} 
                    disabled={closeSessionMutation.isPending}
                  >
                    {closeSessionMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Cerrar Sesión
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">Sin Sesión Activa</CardTitle>
                <CardDescription>
                  Este dispositivo no tiene una sesión abierta actualmente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="mb-6">
                    Para comenzar a utilizar este dispositivo, es necesario abrir una sesión.
                    Las sesiones permiten realizar un seguimiento de las ventas y 
                    proporcionar reportes precisos.
                  </p>
                  <Button 
                    onClick={handleOpenSession} 
                    disabled={openSessionMutation.isPending}
                  >
                    {openSessionMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Abrir Nueva Sesión
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Diálogo para cerrar sesión */}
      <Dialog open={isClosingSession} onOpenChange={setIsClosingSession}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar Sesión</DialogTitle>
            <DialogDescription>
              Ingrese el monto final y cualquier nota adicional para cerrar la sesión.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="finalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto Final</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="0.00" 
                        {...field} 
                        type="number" 
                        step="0.01"
                      />
                    </FormControl>
                    <FormDescription>
                      Ingrese el monto total al cierre de la sesión
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas (opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observaciones del cierre de sesión"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsClosingSession(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={closeSessionMutation.isPending}
                >
                  {closeSessionMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Confirmar Cierre
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}