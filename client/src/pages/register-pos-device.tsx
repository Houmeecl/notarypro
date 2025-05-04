import React from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Esquema de validación para el formulario
const deviceFormSchema = z.object({
  deviceCode: z.string()
    .min(3, { message: 'El código debe tener al menos 3 caracteres' })
    .max(20, { message: 'El código no puede exceder 20 caracteres' })
    .regex(/^[A-Za-z0-9\-]+$/, { message: 'Solo se permiten letras, números y guiones' }),
  deviceName: z.string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(100, { message: 'El nombre no puede exceder 100 caracteres' }),
  deviceType: z.string()
    .min(1, { message: 'Seleccione un tipo de dispositivo' }),
  deviceModel: z.string().optional(),
  storeId: z.number().optional(),
  location: z.string().optional(),
  isActive: z.boolean().default(true),
  isDemo: z.boolean().default(false)
});

type DeviceFormValues = z.infer<typeof deviceFormSchema>;

export default function RegisterPOSDevicePage() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Verificar si el usuario tiene permisos para registrar dispositivos
  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    navigate('/pos-menu');
    return null;
  }

  // Configurar el formulario
  const form = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceFormSchema),
    defaultValues: {
      deviceCode: '',
      deviceName: '',
      deviceType: '',
      deviceModel: '',
      location: '',
      isActive: true,
      isDemo: false
    }
  });

  // Mutación para crear un nuevo dispositivo
  const registerDeviceMutation = useMutation({
    mutationFn: async (data: DeviceFormValues) => {
      const response = await apiRequest('POST', '/api/pos-management/devices', data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrar dispositivo');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Dispositivo registrado',
        description: 'El dispositivo ha sido registrado correctamente',
      });
      // Redireccionar al menú de POS
      navigate('/pos-menu');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al registrar dispositivo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handler para envío del formulario
  const onSubmit = (data: DeviceFormValues) => {
    // Si se proporcionó storeId como string, convertir a número
    if (data.storeId && typeof data.storeId === 'string') {
      data.storeId = parseInt(data.storeId as unknown as string);
    }
    
    registerDeviceMutation.mutate(data);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-800">
          Registrar nuevo dispositivo POS
        </h1>
        <Button
          variant="outline"
          onClick={() => navigate('/pos-menu')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto bg-white shadow-md border-indigo-100">
        <CardHeader>
          <CardTitle>Información del dispositivo</CardTitle>
          <CardDescription>
            Completa los detalles para registrar un nuevo dispositivo POS en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="deviceCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código del dispositivo*</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. POS-TUU-001" {...field} />
                      </FormControl>
                      <FormDescription>
                        Código único para identificar el dispositivo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deviceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre*</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Terminal Central" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nombre descriptivo del dispositivo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de dispositivo*</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="tuu">Tuu POS</SelectItem>
                          <SelectItem value="sunmi">Sunmi</SelectItem>
                          <SelectItem value="p2mini">P2Mini</SelectItem>
                          <SelectItem value="android">Android genérico</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deviceModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. V2 Pro" {...field} />
                      </FormControl>
                      <FormDescription>
                        Modelo específico del dispositivo (opcional)
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
                        <Input placeholder="Ej. Tienda Central" {...field} />
                      </FormControl>
                      <FormDescription>
                        Donde se encuentra el dispositivo (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col space-y-4">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Activo</FormLabel>
                          <FormDescription>
                            Dispositivo disponible para uso
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
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Modo demo</FormLabel>
                          <FormDescription>
                            Activar para uso en pruebas
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
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={registerDeviceMutation.isPending}
                >
                  {registerDeviceMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Registrar dispositivo
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}