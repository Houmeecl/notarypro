import React from 'react';
import { useLocation } from 'wouter';
import { Save, ChevronLeft, Loader2, Terminal } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Esquema de validación para el formulario de registro de dispositivo
const deviceFormSchema = z.object({
  deviceCode: z.string()
    .min(3, { message: 'El código debe tener al menos 3 caracteres' })
    .max(20, { message: 'El código no debe exceder 20 caracteres' })
    .regex(/^[A-Z0-9\-]+$/, { 
      message: 'El código debe contener solo letras mayúsculas, números y guiones' 
    }),
  deviceName: z.string()
    .min(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    .max(50, { message: 'El nombre no debe exceder 50 caracteres' }),
  deviceType: z.string()
    .min(1, { message: 'Debe seleccionar un tipo de dispositivo' }),
  deviceModel: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  isDemo: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type DeviceFormValues = z.infer<typeof deviceFormSchema>;

export default function RegisterPOSDevicePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Configurar formulario con validación Zod
  const form = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceFormSchema),
    defaultValues: {
      deviceCode: '',
      deviceName: '',
      deviceType: '',
      deviceModel: '',
      location: '',
      notes: '',
      isDemo: false,
      isActive: true,
    },
  });

  // Mutación para registrar dispositivo
  const registerDeviceMutation = useMutation({
    mutationFn: async (data: DeviceFormValues) => {
      const res = await apiRequest('POST', '/api/pos-management/devices', data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al registrar dispositivo');
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Dispositivo registrado',
        description: 'El dispositivo ha sido registrado exitosamente',
      });
      // Actualizar caché de dispositivos
      queryClient.invalidateQueries({ queryKey: ['/api/pos-management/devices'] });
      // Redirigir a la lista de dispositivos
      setLocation('/pos-menu');
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    },
  });

  // Manejar envío del formulario
  const onSubmit = (values: DeviceFormValues) => {
    registerDeviceMutation.mutate(values);
  };

  // Opciones para el tipo de dispositivo
  const deviceTypeOptions = [
    { value: 'pos', label: 'Terminal POS' },
    { value: 'tablet', label: 'Tablet' },
    { value: 'mobile', label: 'Móvil' },
    { value: 'kiosk', label: 'Quiosco' },
  ];

  // Generar código de dispositivo predeterminado
  const generateDeviceCode = () => {
    const prefix = form.getValues('deviceType')?.toUpperCase() || 'POS';
    const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const suggestedCode = `${prefix}-${randomDigits}`;
    form.setValue('deviceCode', suggestedCode);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-2 p-1"
          onClick={() => setLocation('/pos-menu')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Registrar Nuevo Dispositivo</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Dispositivo</CardTitle>
          <CardDescription>
            Complete los detalles para registrar un nuevo dispositivo en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tipo de dispositivo */}
                <FormField
                  control={form.control}
                  name="deviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Dispositivo*</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Si el código está vacío, sugerir uno
                          if (!form.getValues('deviceCode')) {
                            setTimeout(generateDeviceCode, 100);
                          }
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {deviceTypeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Modelo del dispositivo */}
                <FormField
                  control={form.control}
                  name="deviceModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo</FormLabel>
                      <FormControl>
                        <Input placeholder="P2mini-8766wb, Sunmi V2 Pro, etc." {...field} />
                      </FormControl>
                      <FormDescription>
                        El modelo específico del dispositivo (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Código del dispositivo */}
                <FormField
                  control={form.control}
                  name="deviceCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código del Dispositivo*</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder="POS-001" {...field} />
                        </FormControl>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={generateDeviceCode}
                        >
                          Generar
                        </Button>
                      </div>
                      <FormDescription>
                        Código único para identificar el dispositivo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nombre del dispositivo */}
                <FormField
                  control={form.control}
                  name="deviceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Dispositivo*</FormLabel>
                      <FormControl>
                        <Input placeholder="Terminal Principal" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nombre descriptivo del dispositivo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Ubicación */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input placeholder="Sucursal Centro, Mostrador 1, etc." {...field} />
                    </FormControl>
                    <FormDescription>
                      Ubicación física del dispositivo (opcional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notas */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Información adicional sobre este dispositivo" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="flex flex-col md:flex-row gap-6">
                {/* Modo Demo */}
                <FormField
                  control={form.control}
                  name="isDemo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Modo Demo</FormLabel>
                        <FormDescription>
                          Marque esta opción si el dispositivo es para pruebas
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Activo */}
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Activo</FormLabel>
                        <FormDescription>
                          Marque esta opción si el dispositivo está listo para usarse
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setLocation('/pos-menu')}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={registerDeviceMutation.isPending}
                  className="min-w-[120px]"
                >
                  {registerDeviceMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Registrar Dispositivo
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Sección de ayuda */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Información Adicional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Códigos de Dispositivo</h3>
              <p className="text-sm text-muted-foreground">
                Los códigos de dispositivo deben seguir el formato TIPO-NNN, donde 
                TIPO es el tipo de dispositivo (POS, TABLET, etc.) y NNN es un 
                número secuencial.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Modo Demo</h3>
              <p className="text-sm text-muted-foreground">
                Los dispositivos en modo demo están claramente marcados en la 
                interfaz y las transacciones realizadas con ellos no afectan 
                a los sistemas reales.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}