import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useDeviceFeatures } from '@/hooks/use-device-features';
import { 
  ArrowLeft, Loader2, Smartphone, Terminal, 
  Tablet, Settings, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';

// Esquema para el formulario de registro de dispositivo
const deviceFormSchema = z.object({
  deviceName: z.string()
    .min(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    .max(50, { message: 'El nombre no puede exceder los 50 caracteres' }),
  deviceCode: z.string()
    .min(3, { message: 'El código debe tener al menos 3 caracteres' })
    .max(20, { message: 'El código no puede exceder los 20 caracteres' })
    .regex(/^[A-Za-z0-9\-]+$/, { 
      message: 'El código solo puede contener letras, números y guiones' 
    }),
  deviceType: z.enum(['pos', 'tablet', 'mobile', 'kiosk'], {
    required_error: 'Debe seleccionar un tipo de dispositivo',
  }),
  deviceModel: z.string().optional(),
  location: z.string().optional(),
  isActive: z.boolean().default(true),
  isDemo: z.boolean().default(false),
  storeCode: z.string().optional(),
  notes: z.string().optional(),
});

type DeviceFormValues = z.infer<typeof deviceFormSchema>;

export default function RegisterPOSDevicePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { deviceModel, deviceSupportsNFC, isAndroid, isDemoMode } = useDeviceFeatures();
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [newDeviceId, setNewDeviceId] = useState<string | null>(null);

  // Formulario
  const form = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceFormSchema),
    defaultValues: {
      deviceName: '',
      deviceCode: '',
      deviceType: 'pos',
      deviceModel: deviceModel || '',
      location: '',
      isActive: true,
      isDemo: isDemoMode,
      storeCode: '',
      notes: '',
    },
  });

  // Consultar tiendas disponibles
  const { data: stores, isLoading: isLoadingStores } = useQuery({
    queryKey: ['/api/stores'],
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: false, // Solo cargar cuando sea necesario
  });

  // Mutación para registrar dispositivo
  const registerDeviceMutation = useMutation({
    mutationFn: async (data: DeviceFormValues) => {
      const response = await apiRequest('POST', '/api/pos-management/devices', data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar dispositivo');
      }
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Dispositivo registrado',
        description: 'El dispositivo ha sido registrado correctamente',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pos-management/devices'] });
      setRegistrationComplete(true);
      setNewDeviceId(data.id);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Manejar envío del formulario
  const onSubmit = (values: DeviceFormValues) => {
    registerDeviceMutation.mutate(values);
  };

  // Si se completó el registro, mostrar mensaje de éxito
  if (registrationComplete) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <CardTitle>Dispositivo Registrado Exitosamente</CardTitle>
            </div>
            <CardDescription>
              El dispositivo ha sido añadido correctamente al sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Detalles del dispositivo:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Nombre:</strong> {form.getValues('deviceName')}</li>
              <li><strong>Código:</strong> {form.getValues('deviceCode')}</li>
              <li><strong>Tipo:</strong> {form.getValues('deviceType')}</li>
              {form.getValues('location') && (
                <li><strong>Ubicación:</strong> {form.getValues('location')}</li>
              )}
            </ul>
            
            <div className="flex flex-col gap-2 mt-4">
              <p>¿Qué deseas hacer ahora?</p>
              
              <div className="flex gap-3 mt-2">
                {newDeviceId && (
                  <Button 
                    onClick={() => setLocation(`/pos-session/${newDeviceId}`)}
                    className="flex-1"
                  >
                    Abrir Sesión de POS
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={() => setLocation('/pos-menu')}
                  className="flex-1"
                >
                  Ver Todos los Dispositivos
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                onClick={() => {
                  form.reset();
                  setRegistrationComplete(false);
                }}
                className="mt-2"
              >
                Registrar Otro Dispositivo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Renderizado principal del formulario
  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setLocation('/pos-menu')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Registrar Nuevo Dispositivo POS</h1>
      </div>

      {/* Formulario */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>
                Datos principales de identificación del dispositivo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="deviceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Dispositivo*</FormLabel>
                      <FormControl>
                        <Input placeholder="POS Tienda Central" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nombre descriptivo para identificar este dispositivo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deviceCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código del Dispositivo*</FormLabel>
                      <FormControl>
                        <Input placeholder="POS-001" {...field} />
                      </FormControl>
                      <FormDescription>
                        Código único para este dispositivo (ej. POS-123)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="deviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Dispositivo*</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-wrap gap-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="pos" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex items-center gap-1">
                            <Terminal className="h-4 w-4 text-indigo-600" />
                            Terminal POS
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="tablet" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex items-center gap-1">
                            <Tablet className="h-4 w-4 text-blue-500" />
                            Tablet
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="mobile" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex items-center gap-1">
                            <Smartphone className="h-4 w-4 text-green-500" />
                            Móvil
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="kiosk" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex items-center gap-1">
                            <Settings className="h-4 w-4 text-orange-500" />
                            Quiosco
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="deviceModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo del Dispositivo</FormLabel>
                      <FormControl>
                        <Input placeholder="Sunmi V2 Pro" {...field} />
                      </FormControl>
                      <FormDescription>
                        Modelo o especificación del hardware
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación</FormLabel>
                      <FormControl>
                        <Input placeholder="Sucursal Central" {...field} />
                      </FormControl>
                      <FormDescription>
                        Lugar donde se utilizará este dispositivo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="storeCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tienda Asociada</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tienda (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Ninguna (uso general)</SelectItem>
                        {isLoadingStores ? (
                          <SelectItem value="" disabled>
                            Cargando tiendas...
                          </SelectItem>
                        ) : stores && stores.length > 0 ? (
                          stores.map((store: any) => (
                            <SelectItem key={store.code} value={store.code}>
                              {store.name} ({store.code})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            No hay tiendas disponibles
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Tienda o local comercial al que pertenece este dispositivo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración Adicional</CardTitle>
              <CardDescription>
                Opciones y preferencias para este dispositivo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Activar Dispositivo</FormLabel>
                        <FormDescription>
                          Dispositivos inactivos no pueden procesar transacciones
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

                <FormField
                  control={form.control}
                  name="isDemo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <FormLabel className="text-base">Modo Demostración</FormLabel>
                          {isDemoMode && (
                            <Badge variant="outline" className="text-orange-500 border-orange-200 bg-orange-50">
                              Recomendado
                            </Badge>
                          )}
                        </div>
                        <FormDescription>
                          En modo demo, las transacciones son simuladas sin procesar pagos reales
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
              </div>

              <Separator className="my-2" />

              <div className="space-y-2">
                <Label htmlFor="device-capabilities">Capacidades Detectadas</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="outline" className={isAndroid ? "bg-green-50" : ""}>
                    {isAndroid ? "Android" : "No Android"}
                  </Badge>
                  <Badge variant="outline" className={deviceSupportsNFC ? "bg-green-50" : ""}>
                    {deviceSupportsNFC ? "NFC Compatible" : "Sin NFC"}
                  </Badge>
                  {deviceModel && (
                    <Badge variant="outline">
                      Modelo: {deviceModel}
                    </Badge>
                  )}
                  <Badge variant="outline" className={isDemoMode ? "bg-orange-50" : ""}>
                    {isDemoMode ? "Modo Demo" : "Modo Producción"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Capacidades detectadas automáticamente en este dispositivo
                </p>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Información adicional sobre este dispositivo"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Notas internas o información adicional para este dispositivo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => setLocation('/pos-menu')}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={registerDeviceMutation.isPending}
              >
                {registerDeviceMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  'Registrar Dispositivo'
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      {/* Alerta si se detectan problemas */}
      {isDemoMode && (
        <div className="mt-6 p-4 border border-yellow-200 bg-yellow-50 rounded-lg flex gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-700">Modo Demostración Detectado</h3>
            <p className="text-sm text-yellow-600 mt-1">
              Este dispositivo está configurado en modo de demostración. Todas las funciones de pago y verificación 
              serán simuladas. Para usar en producción, desactive el modo demo en la configuración.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}