import { useState } from 'react';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  ArrowRight, 
  Building2,
  UserCheck, 
  MapPin,
  Phone,
  Mail,
  Wifi,
  Tablet
} from 'lucide-react';

// Validation schema for partner registration
const partnerFormSchema = z.object({
  // Business Information
  storeName: z.string().min(3, {
    message: "El nombre del negocio debe tener al menos 3 caracteres.",
  }),
  managerName: z.string().min(3, {
    message: "El nombre del encargado debe tener al menos 3 caracteres.",
  }),
  
  // Location Information
  region: z.string({
    required_error: "Por favor seleccione una región.",
  }),
  commune: z.string({
    required_error: "Por favor seleccione una comuna.",
  }),
  address: z.string().min(5, {
    message: "La dirección debe tener al menos 5 caracteres.",
  }),
  
  // Contact Information
  phone: z.string().min(8, {
    message: "El número de teléfono debe tener al menos 8 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor ingrese un correo electrónico válido.",
  }),
  
  // Technical Requirements
  hasInternet: z.boolean().default(false),
  hasDevice: z.boolean().default(false),
  
  // Terms and conditions
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Debe aceptar los términos y condiciones para continuar.",
  }),
});

// List of Chilean regions
const chileanRegions = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana de Santiago",
  "Libertador General Bernardo O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "La Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén del General Carlos Ibáñez del Campo",
  "Magallanes y de la Antártica Chilena"
];

// Map of communes by region (simplified for this example)
const communesByRegion: Record<string, string[]> = {
  "Metropolitana de Santiago": [
    "Santiago", "Providencia", "Las Condes", "Ñuñoa", "La Florida", 
    "Maipú", "Puente Alto", "Huechuraba", "Vitacura", "Lo Barnechea",
    "Recoleta", "Independencia", "Peñalolén", "La Reina", "Macul",
    "Estación Central", "Quinta Normal", "Cerrillos", "Cerro Navia", "Conchalí"
  ],
  "Valparaíso": [
    "Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana", "Concón",
    "San Antonio", "Quillota", "Los Andes", "San Felipe", "Limache"
  ],
  "Biobío": [
    "Concepción", "Talcahuano", "Chiguayante", "San Pedro de la Paz", "Hualpén",
    "Los Ángeles", "Coronel", "Lota", "Tomé", "Penco"
  ]
};

// Default communes for other regions
const defaultCommunes = ["Comuna 1", "Comuna 2", "Comuna 3", "Comuna 4", "Comuna 5"];

export default function PartnerRegistrationForm() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [registrationCompleted, setRegistrationCompleted] = useState(false);
  
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const emailFromQuery = searchParams.get('email') || '';
  
  // Initialize form with default values
  const form = useForm<z.infer<typeof partnerFormSchema>>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      storeName: "",
      managerName: "",
      region: "",
      commune: "",
      address: "",
      phone: "",
      email: emailFromQuery,
      hasInternet: false,
      hasDevice: false,
      acceptTerms: false,
    },
  });
  
  // Get current selected region
  const selectedRegion = form.watch("region");
  
  // Get list of communes for the selected region
  const communes = selectedRegion ? 
    (communesByRegion[selectedRegion] || defaultCommunes) : [];
  
  // Mutation for submitting the form
  const registerPartnerMutation = useMutation({
    mutationFn: async (data: z.infer<typeof partnerFormSchema>) => {
      const response = await apiRequest("POST", "/api/partners/register", data);
      return response.json();
    },
    onSuccess: () => {
      setRegistrationCompleted(true);
      toast({
        title: "Registro enviado correctamente",
        description: "Hemos recibido su solicitud. Nos contactaremos con usted pronto.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error en el registro",
        description: "No pudimos procesar su solicitud. Por favor intente nuevamente.",
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  function onSubmit(data: z.infer<typeof partnerFormSchema>) {
    registerPartnerMutation.mutate(data);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/partners/public-page")}
              className="mb-4"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            
            <h1 className="text-3xl font-bold text-gray-900">
              {registrationCompleted ? 
                "¡Gracias por registrarse!" : 
                "Registro de Punto de Servicio"}
            </h1>
            <p className="text-gray-600 mt-2">
              {registrationCompleted ? 
                "Su solicitud ha sido recibida y está siendo procesada." : 
                "Complete el formulario para unirse al programa Vecinos NotaryPro Express"}
            </p>
          </div>
          
          {registrationCompleted ? (
            <RegistrationSuccess onBackToHome={() => setLocation("/partners/public-page")} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Formulario de registro</CardTitle>
                <CardDescription>
                  Proporcione la información de su negocio para comenzar el proceso de aprobación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Tabs defaultValue="business" className="w-full">
                      <TabsList className="grid grid-cols-4 mb-8">
                        <TabsTrigger value="business" className="text-xs sm:text-sm">Negocio</TabsTrigger>
                        <TabsTrigger value="location" className="text-xs sm:text-sm">Ubicación</TabsTrigger>
                        <TabsTrigger value="contact" className="text-xs sm:text-sm">Contacto</TabsTrigger>
                        <TabsTrigger value="technical" className="text-xs sm:text-sm">Requisitos</TabsTrigger>
                      </TabsList>
                      
                      {/* Business Information Tab */}
                      <TabsContent value="business" className="space-y-4">
                        <div className="flex items-center mb-6">
                          <Building2 className="h-8 w-8 mr-2 text-[#EC1C24]" />
                          <div>
                            <h2 className="text-xl font-semibold">Información del negocio</h2>
                            <p className="text-gray-500 text-sm">Datos básicos de su establecimiento</p>
                          </div>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="storeName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre del Negocio</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: Minimarket Don Pedro" {...field} />
                              </FormControl>
                              <FormDescription>
                                Nombre oficial o comercial de su establecimiento
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="managerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre del Encargado</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: Pedro Pérez" {...field} />
                              </FormControl>
                              <FormDescription>
                                Persona responsable del establecimiento
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-4 flex justify-end">
                          <Button type="button" onClick={() => form.trigger(['storeName', 'managerName']).then(isValid => {
                            if (isValid) document.querySelector('[data-value="location"]')?.dispatchEvent(new Event('click'));
                          })}>
                            Siguiente
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </TabsContent>
                      
                      {/* Location Information Tab */}
                      <TabsContent value="location" className="space-y-4">
                        <div className="flex items-center mb-6">
                          <MapPin className="h-8 w-8 mr-2 text-[#EC1C24]" />
                          <div>
                            <h2 className="text-xl font-semibold">Ubicación</h2>
                            <p className="text-gray-500 text-sm">Dirección de su establecimiento</p>
                          </div>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="region"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Región</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione una región" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {chileanRegions.map((region) => (
                                    <SelectItem key={region} value={region}>
                                      {region}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="commune"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Comuna</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                disabled={!selectedRegion}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={selectedRegion ? "Seleccione una comuna" : "Primero seleccione una región"} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {communes.map((commune) => (
                                    <SelectItem key={commune} value={commune}>
                                      {commune}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dirección</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: Av. Principal 123" {...field} />
                              </FormControl>
                              <FormDescription>
                                Dirección física completa del establecimiento
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-4 flex justify-between">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => document.querySelector('[data-value="business"]')?.dispatchEvent(new Event('click'))}
                          >
                            Anterior
                          </Button>
                          <Button type="button" onClick={() => form.trigger(['region', 'commune', 'address']).then(isValid => {
                            if (isValid) document.querySelector('[data-value="contact"]')?.dispatchEvent(new Event('click'));
                          })}>
                            Siguiente
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </TabsContent>
                      
                      {/* Contact Information Tab */}
                      <TabsContent value="contact" className="space-y-4">
                        <div className="flex items-center mb-6">
                          <Phone className="h-8 w-8 mr-2 text-[#EC1C24]" />
                          <div>
                            <h2 className="text-xl font-semibold">Información de contacto</h2>
                            <p className="text-gray-500 text-sm">Datos para comunicarnos con usted</p>
                          </div>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Teléfono</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: +56 9 1234 5678" {...field} />
                              </FormControl>
                              <FormDescription>
                                Teléfono de contacto del establecimiento
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Correo electrónico</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: contacto@mitienda.cl" {...field} />
                              </FormControl>
                              <FormDescription>
                                Correo electrónico para notificaciones y comunicaciones
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-4 flex justify-between">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => document.querySelector('[data-value="location"]')?.dispatchEvent(new Event('click'))}
                          >
                            Anterior
                          </Button>
                          <Button type="button" onClick={() => form.trigger(['phone', 'email']).then(isValid => {
                            if (isValid) document.querySelector('[data-value="technical"]')?.dispatchEvent(new Event('click'));
                          })}>
                            Siguiente
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </TabsContent>
                      
                      {/* Technical Requirements Tab */}
                      <TabsContent value="technical" className="space-y-4">
                        <div className="flex items-center mb-6">
                          <Tablet className="h-8 w-8 mr-2 text-[#EC1C24]" />
                          <div>
                            <h2 className="text-xl font-semibold">Requisitos técnicos</h2>
                            <p className="text-gray-500 text-sm">Disponibilidad de equipamiento</p>
                          </div>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="hasInternet"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  <div className="flex items-center">
                                    <Wifi className="h-4 w-4 mr-2 text-gray-500" />
                                    <span>Conexión a Internet</span>
                                  </div>
                                </FormLabel>
                                <FormDescription>
                                  Mi establecimiento cuenta con conexión a internet estable
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="hasDevice"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  <div className="flex items-center">
                                    <Tablet className="h-4 w-4 mr-2 text-gray-500" />
                                    <span>Tablet o dispositivo móvil</span>
                                  </div>
                                </FormLabel>
                                <FormDescription>
                                  Dispongo de una tablet o teléfono con Android para usar la aplicación
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <div className="mt-6 p-4 bg-blue-50 rounded-md text-sm text-blue-800">
                          <p>
                            <strong>Nota:</strong> Si no cuenta con alguno de estos requisitos, 
                            igualmente puede registrarse. Nuestro equipo evaluará su caso y le 
                            ofrecerá alternativas.
                          </p>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <FormField
                          control={form.control}
                          name="acceptTerms"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Acepto los términos y condiciones del programa
                                </FormLabel>
                                <FormDescription>
                                  He leído y acepto los <a href="#" className="text-blue-600 hover:underline">términos y condiciones</a> y la <a href="#" className="text-blue-600 hover:underline">política de privacidad</a>.
                                </FormDescription>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-4 flex justify-between">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => document.querySelector('[data-value="contact"]')?.dispatchEvent(new Event('click'))}
                          >
                            Anterior
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={registerPartnerMutation.isPending}
                            className="bg-[#EC1C24] hover:bg-[#d91920]"
                          >
                            {registerPartnerMutation.isPending ? "Enviando..." : "Enviar solicitud"}
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function RegistrationSuccess({ onBackToHome }: { onBackToHome: () => void }) {
  return (
    <Card className="text-center">
      <CardHeader>
        <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
          <UserCheck className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl">¡Solicitud enviada con éxito!</CardTitle>
        <CardDescription>
          Gracias por su interés en unirse al programa Vecinos NotaryPro Express
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-700">
            Hemos recibido su solicitud y está siendo revisada por nuestro equipo. 
            En los próximos días nos comunicaremos con usted para continuar con el proceso.
          </p>
          
          <div className="p-4 bg-gray-50 rounded-md text-sm text-gray-700 text-left">
            <h3 className="font-semibold mb-2">Próximos pasos:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Revisión de sus datos (1-2 días hábiles)</li>
              <li>Contacto telefónico para coordinar una reunión</li>
              <li>Capacitación y configuración de su punto de servicio</li>
              <li>¡Inicio de operaciones!</li>
            </ol>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          onClick={onBackToHome}
          variant="outline"
          className="mr-4"
        >
          Volver al inicio
        </Button>
        <Button 
          onClick={() => window.location.href = "mailto:partners@cerfidoc.cl"}
          className="bg-[#EC1C24] hover:bg-[#d91920]"
        >
          Contactar soporte
        </Button>
      </CardFooter>
    </Card>
  );
}