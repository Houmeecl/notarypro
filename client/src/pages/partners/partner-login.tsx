import { useState } from 'react';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
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
import { ChevronLeft, LogIn, ShieldAlert } from 'lucide-react';

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email({
    message: "Por favor ingrese un correo electrónico válido.",
  }),
  apiKey: z.string().min(1, {
    message: "La clave API es requerida.",
  }),
});

export default function PartnerLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Initialize form
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      apiKey: "",
    },
  });
  
  // Mutation for login
  const loginMutation = useMutation({
    mutationFn: async (data: z.infer<typeof loginSchema>) => {
      const response = await apiRequest("POST", "/api/partners/login", data);
      if (!response.ok) {
        throw new Error("Error al iniciar sesión");
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Store partner info and token in local storage
      localStorage.setItem('partnerToken', data.token);
      localStorage.setItem('partnerId', data.partner.id);
      localStorage.setItem('partnerName', data.partner.storeName);
      
      // Redirect to partner dashboard
      setLocation("/partners/partner-dashboard");
      
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido de vuelta, ${data.partner.storeName}`,
      });
    },
    onError: (error) => {
      setLoginError("Credenciales inválidas. Por favor verifique su correo y clave API.");
      toast({
        title: "Error al iniciar sesión",
        description: "No pudimos verificar sus credenciales. Por favor intente nuevamente.",
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  function onSubmit(data: z.infer<typeof loginSchema>) {
    setLoginError(null);
    loginMutation.mutate(data);
  }

  function handleResetCredentials() {
    setLocation("/partners/reset-credentials");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container mx-auto px-4 py-12 flex-grow flex items-center justify-center">
        <div className="w-full max-w-md">
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
              Acceso para Partners
            </h1>
            <p className="text-gray-600 mt-2">
              Ingrese a su panel de Vecinos NotaryPro Express
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Iniciar sesión</CardTitle>
              <CardDescription>
                Ingrese sus credenciales de punto de servicio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
                  <ShieldAlert className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Error de autenticación</p>
                    <p className="text-sm">{loginError}</p>
                  </div>
                </div>
              )}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo electrónico</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="ejemplo@tienda.cl" 
                            type="email"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clave API</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Su clave API" 
                            type="password"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Clave proporcionada al momento de su activación
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#EC1C24] hover:bg-[#d91920]"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <span className="flex items-center">
                        <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                        Iniciando sesión...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <LogIn className="h-4 w-4 mr-2" />
                        Iniciar sesión
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between flex-col sm:flex-row space-y-2 sm:space-y-0">
              <Button 
                variant="link" 
                className="text-[#EC1C24]"
                onClick={handleResetCredentials}
              >
                ¿Olvidó sus credenciales?
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation("/partners/registration-form")}
              >
                Registrarse
              </Button>
            </CardFooter>
          </Card>
          
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>
              ¿Necesita ayuda? Contacte a nuestro soporte:
              <a href="mailto:partners@cerfidoc.cl" className="text-[#EC1C24] ml-1 hover:underline">
                partners@cerfidoc.cl
              </a>
            </p>
          </div>
        </div>
      </div>
      
      <footer className="bg-gray-100 py-4 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} CerfiDoc. Vecinos NotaryPro Express.</p>
        </div>
      </footer>
    </div>
  );
}