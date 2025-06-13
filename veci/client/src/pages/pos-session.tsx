import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, Clock, DollarSign, Receipt, 
  Loader2, AlignLeft, CircleDollarSign, 
  CheckCircle2, XCircle, ReceiptText, CreditCard,
  FileSpreadsheet 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Esquema para formulario de apertura de sesión
const openSessionSchema = z.object({
  initialAmount: z.coerce.number()
    .min(0, { message: 'El monto inicial no puede ser negativo' }),
  notes: z.string().optional(),
});

// Esquema para formulario de cierre de sesión
const closeSessionSchema = z.object({
  finalAmount: z.coerce.number()
    .min(0, { message: 'El monto final no puede ser negativo' }),
  notes: z.string().optional(),
});

type OpenSessionValues = z.infer<typeof openSessionSchema>;
type CloseSessionValues = z.infer<typeof closeSessionSchema>;

export default function POSSessionPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showConfirmCloseDialog, setShowConfirmCloseDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Consultar detalles del dispositivo
  const { 
    data: device, 
    isLoading: isLoadingDevice,
    isError: isDeviceError,
    refetch: refetchDevice
  } = useQuery({
    queryKey: [`/api/pos-management/devices/${id}`],
    retry: 1,
  });

  // Consultar sesión activa (si existe)
  const {
    data: activeSession,
    isLoading: isLoadingSession,
    isError: isSessionError,
    refetch: refetchSession
  } = useQuery({
    queryKey: [`/api/pos-management/devices/${id}/active-session`],
    retry: 1,
  });

  // Consultar historial de ventas
  const {
    data: sales,
    isLoading: isLoadingSales,
  } = useQuery({
    queryKey: [`/api/pos-management/devices/${id}/sales`],
    retry: 1,
    enabled: !!activeSession,
  });

  // Cálculos y métricas
  const sessionMetrics = React.useMemo(() => {
    if (!activeSession || !sales) {
      return {
        totalSales: 0,
        totalAmount: 0,
        averageSaleAmount: 0,
      };
    }

    const totalAmount = sales.reduce((sum, sale) => sum + (parseFloat(sale.amount) || 0), 0);
    
    return {
      totalSales: sales.length,
      totalAmount,
      averageSaleAmount: sales.length > 0 ? totalAmount / sales.length : 0,
    };
  }, [activeSession, sales]);

  // Formulario para abrir sesión
  const openSessionForm = useForm<OpenSessionValues>({
    resolver: zodResolver(openSessionSchema),
    defaultValues: {
      initialAmount: 0,
      notes: '',
    },
  });

  // Formulario para cerrar sesión
  const closeSessionForm = useForm<CloseSessionValues>({
    resolver: zodResolver(closeSessionSchema),
    defaultValues: {
      finalAmount: sessionMetrics.totalAmount || 0,
      notes: '',
    },
  });

  // Actualizar valor inicial de finalAmount cuando cambian las ventas
  useEffect(() => {
    if (sessionMetrics.totalAmount > 0) {
      closeSessionForm.setValue('finalAmount', sessionMetrics.totalAmount);
    }
  }, [sessionMetrics.totalAmount, closeSessionForm]);

  // Mutación para abrir sesión
  const openSessionMutation = useMutation({
    mutationFn: async (data: OpenSessionValues) => {
      const response = await apiRequest('POST', `/api/pos-management/devices/${id}/sessions`, data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al abrir sesión');
      }
      return await response.json();
    },
    onSuccess: () => {
      setShowOpenDialog(false);
      toast({
        title: 'Sesión abierta',
        description: 'La sesión ha sido abierta correctamente',
        variant: 'success',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/pos-management/devices/${id}/active-session`] });
      refetchSession();
      refetchDevice();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutación para cerrar sesión
  const closeSessionMutation = useMutation({
    mutationFn: async (data: CloseSessionValues) => {
      if (!activeSession?.id) throw new Error('No hay sesión activa');
      
      const response = await apiRequest(
        'POST', 
        `/api/pos-management/sessions/${activeSession.id}/close`, 
        data
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cerrar sesión');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      setShowCloseDialog(false);
      setShowConfirmCloseDialog(false);
      toast({
        title: 'Sesión cerrada',
        description: 'La sesión ha sido cerrada correctamente',
        variant: 'success',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/pos-management/devices/${id}/active-session`] });
      refetchSession();
      refetchDevice();
    },
    onError: (error: Error) => {
      setShowConfirmCloseDialog(false);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Manejar envío de formulario de apertura
  const handleOpenSessionSubmit = (values: OpenSessionValues) => {
    openSessionMutation.mutate(values);
  };

  // Manejar envío de formulario de cierre
  const handleCloseSessionSubmit = (values: CloseSessionValues) => {
    setShowCloseDialog(false);
    setShowConfirmCloseDialog(true);
    closeSessionForm.reset(values);
  };

  // Confirmar cierre de sesión
  const confirmCloseSession = () => {
    closeSessionMutation.mutate(closeSessionForm.getValues());
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Si hay error al cargar el dispositivo
  if (isDeviceError) {
    return (
      <div className="container mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[70vh]">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-center mb-2">Dispositivo no encontrado</h1>
        <p className="text-gray-600 text-center mb-6">
          No se pudo encontrar el dispositivo solicitado o no tienes permisos para acceder a él.
        </p>
        <Button onClick={() => setLocation('/pos-menu')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver a la lista de dispositivos
        </Button>
      </div>
    );
  }

  // Renderizado principal
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setLocation('/pos-menu')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isLoadingDevice ? 'Cargando dispositivo...' : device?.deviceName || 'Sesión POS'}
        </h1>
        {device?.deviceCode && (
          <Badge variant="outline" className="ml-2">
            {device.deviceCode}
          </Badge>
        )}
        {device?.isDemo && (
          <Badge variant="warning">Demo</Badge>
        )}
      </div>

      {/* Información del dispositivo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Información del Dispositivo</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingDevice ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tipo:</span>
                  <span className="text-sm font-medium">
                    {device?.deviceType === 'pos' ? 'Terminal POS' : 
                    device?.deviceType === 'tablet' ? 'Tablet' : 
                    device?.deviceType === 'mobile' ? 'Móvil' : 
                    device?.deviceType === 'kiosk' ? 'Quiosco' : 
                    'Desconocido'}
                  </span>
                </div>
                {device?.deviceModel && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Modelo:</span>
                    <span className="text-sm font-medium">{device.deviceModel}</span>
                  </div>
                )}
                {device?.location && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Ubicación:</span>
                    <span className="text-sm font-medium">{device.location}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Estado:</span>
                  <span className="text-sm font-medium">
                    <Badge variant={device?.isActive ? 'outline' : 'destructive'}>
                      {device?.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Estado de la Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSession ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : activeSession ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Código:</span>
                  <span className="text-sm font-medium">{activeSession.sessionCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Apertura:</span>
                  <span className="text-sm font-medium">
                    {formatDate(activeSession.openedAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monto inicial:</span>
                  <span className="text-sm font-medium">
                    ${activeSession.initialAmount?.toLocaleString('es-CL') || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Estado:</span>
                  <Badge variant="success">Abierta</Badge>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  No hay una sesión activa para este dispositivo
                </p>
                <Button 
                  onClick={() => setShowOpenDialog(true)}
                  disabled={!device?.isActive}
                >
                  Abrir Sesión
                </Button>
                {!device?.isActive && (
                  <p className="text-xs text-muted-foreground mt-2">
                    El dispositivo está inactivo y no puede abrir sesiones
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Métricas de Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSession || isLoadingSales ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : activeSession ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total ventas:</span>
                  <span className="text-sm font-medium">{sessionMetrics.totalSales}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monto total:</span>
                  <span className="text-sm font-medium">
                    ${sessionMetrics.totalAmount.toLocaleString('es-CL')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Promedio:</span>
                  <span className="text-sm font-medium">
                    ${sessionMetrics.averageSaleAmount.toLocaleString('es-CL', { 
                      maximumFractionDigits: 0 
                    })}
                  </span>
                </div>

                <Separator className="my-3" />

                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowCloseDialog(true)}
                  >
                    <Clock className="h-4 w-4 mr-2" /> Cerrar Sesión
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Abre una sesión para ver las métricas de ventas
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs de contenido */}
      {activeSession && (
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="sales">
              Ventas <Badge variant="secondary" className="ml-1">{sales?.length || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de la Sesión</CardTitle>
                <CardDescription>
                  Detalles y estadísticas de la sesión activa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center p-4 bg-primary/5 rounded-lg">
                    <Receipt className="h-8 w-8 text-primary mb-2" />
                    <span className="text-2xl font-bold">{sessionMetrics.totalSales}</span>
                    <span className="text-sm text-muted-foreground">Ventas realizadas</span>
                  </div>
                  
                  <div className="flex flex-col items-center p-4 bg-primary/5 rounded-lg">
                    <DollarSign className="h-8 w-8 text-primary mb-2" />
                    <span className="text-2xl font-bold">
                      ${sessionMetrics.totalAmount.toLocaleString('es-CL')}
                    </span>
                    <span className="text-sm text-muted-foreground">Monto total</span>
                  </div>
                  
                  <div className="flex flex-col items-center p-4 bg-primary/5 rounded-lg">
                    <CircleDollarSign className="h-8 w-8 text-primary mb-2" />
                    <span className="text-2xl font-bold">
                      ${sessionMetrics.averageSaleAmount.toLocaleString('es-CL', { 
                        maximumFractionDigits: 0 
                      })}
                    </span>
                    <span className="text-sm text-muted-foreground">Promedio por venta</span>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Información de la Sesión</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Código de sesión</p>
                      <p className="font-medium">{activeSession.sessionCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Fecha de apertura</p>
                      <p className="font-medium">{formatDate(activeSession.openedAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Monto inicial</p>
                      <p className="font-medium">${activeSession.initialAmount?.toLocaleString('es-CL') || '0'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Operador</p>
                      <p className="font-medium">{activeSession.operatorName || 'No especificado'}</p>
                    </div>
                  </div>
                </div>

                {activeSession.notes && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">Notas</h3>
                    <div className="bg-muted/50 p-3 rounded-md">
                      <p className="text-sm whitespace-pre-line">{activeSession.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="destructive" 
                  className="ml-auto"
                  onClick={() => setShowCloseDialog(true)}
                >
                  <Clock className="h-4 w-4 mr-2" /> Cerrar Sesión
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Registro de Ventas</CardTitle>
                <CardDescription>
                  Ventas realizadas durante esta sesión
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSales ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : sales && sales.length > 0 ? (
                  <div className="space-y-4">
                    {sales.map((sale, index) => (
                      <Card key={sale.id || index} className="shadow-none border">
                        <CardHeader className="py-3 px-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <ReceiptText className="h-5 w-5 text-muted-foreground" />
                              <CardTitle className="text-base">Venta #{sale.receiptNumber || index + 1}</CardTitle>
                            </div>
                            <Badge variant={
                              sale.status === 'completed' ? 'success' : 
                              sale.status === 'cancelled' ? 'destructive' : 
                              'outline'
                            }>
                              {sale.status === 'completed' ? 'Completada' : 
                               sale.status === 'cancelled' ? 'Cancelada' : 
                               sale.status || 'Pendiente'}
                            </Badge>
                          </div>
                          <CardDescription>
                            {formatDate(sale.createdAt)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="py-2 px-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Monto:</span>
                            <span className="font-medium">${parseFloat(sale.amount).toLocaleString('es-CL')}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Método de pago:</span>
                            <div className="flex items-center">
                              <CreditCard className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                              <span className="font-medium">{sale.paymentMethod || 'No especificado'}</span>
                            </div>
                          </div>
                          {sale.description && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              <p>{sale.description}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileSpreadsheet className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No hay ventas registradas</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Las ventas realizadas durante esta sesión aparecerán aquí
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Actividad de la Sesión</CardTitle>
                <CardDescription>
                  Registro de eventos y acciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlignLeft className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Registro de actividad</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                    Aquí se mostrarán los eventos importantes de la sesión, como aperturas, 
                    ventas, anulaciones y cierres.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Diálogo para abrir sesión */}
      <Dialog open={showOpenDialog} onOpenChange={setShowOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir Nueva Sesión</DialogTitle>
            <DialogDescription>
              Complete la información para iniciar una nueva sesión en este dispositivo.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...openSessionForm}>
            <form onSubmit={openSessionForm.handleSubmit(handleOpenSessionSubmit)} className="space-y-6">
              <FormField
                control={openSessionForm.control}
                name="initialAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto Inicial (Caja)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        min="0"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Cantidad de dinero con la que inicia la caja
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={openSessionForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Información adicional sobre esta sesión"
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
                  onClick={() => setShowOpenDialog(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={openSessionMutation.isPending}
                >
                  {openSessionMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Abrir Sesión
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para cerrar sesión */}
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar Sesión</DialogTitle>
            <DialogDescription>
              Complete la información para cerrar la sesión actual.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...closeSessionForm}>
            <form onSubmit={closeSessionForm.handleSubmit(handleCloseSessionSubmit)} className="space-y-6">
              <FormField
                control={closeSessionForm.control}
                name="finalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto Final (Caja)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={sessionMetrics.totalAmount.toString()}
                        min="0"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Cantidad total de dinero al cierre de la caja
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={closeSessionForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas de Cierre (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Información adicional sobre el cierre de sesión"
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
                  onClick={() => setShowCloseDialog(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Continuar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de cierre */}
      <AlertDialog 
        open={showConfirmCloseDialog} 
        onOpenChange={setShowConfirmCloseDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Cierre de Sesión</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea cerrar esta sesión? Esta acción no se puede deshacer.
              Todos los registros y datos de ventas quedarán cerrados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCloseSession}
              disabled={closeSessionMutation.isPending}
            >
              {closeSessionMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Cerrar Sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}