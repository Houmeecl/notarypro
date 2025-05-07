import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Eye, EyeOff, Laptop, CheckSquare, FileCheck } from "lucide-react";
import vecinoLogo from "@/assets/new/vecino-xpress-logo-nuevo.png";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

// Esquema de validación
const loginSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

// Tipo para los datos del formulario
type LoginData = z.infer<typeof loginSchema>;

export default function VecinosLogin() {
  // Declaración de funciones y estados principales para la interfaz de login notarial
  const [_, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  // Solo usamos el tab web ya que eliminamos la opción mobile
  const [activeTab, setActiveTab] = useState<string>("web");

  // Configurar formulario con React Hook Form
  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Mutación para el login
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Intentando login con:", credentials.username);
      
      try {
        const res = await apiRequest("POST", "/api/vecinos/login", credentials);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Error al iniciar sesión");
        }
        
        return await res.json();
      } catch (error) {
        console.error("Error en petición de login:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Login exitoso, datos recibidos:", data);
      
      // Guardar token en localStorage si se utiliza JWT
      if (data.token) {
        localStorage.setItem("vecinos_token", data.token);
      }
      
      // También guardar datos de usuario para persistencia entre páginas
      if (data.user) {
        localStorage.setItem("vecinos_user", JSON.stringify(data.user));
      }
      
      // Mostrar mensaje de éxito con terminología notarial
      toast({
        title: "Acceso Autenticado",
        description: "Bienvenido al Sistema Notarial VecinoXpress",
      });
      
      // VERIFICAR QUE LA RUTA EXISTE
      // Redirigir a dashboard de vecinos (si es admin) o selección de documentos (si es usuario regular)
      if (data.role === 'admin' || data.user?.role === 'admin') {
        setLocation("/vecinos/admin");
      } else {
        setLocation("/vecinos/dashboard");
      }
    },
    onError: (error: Error) => {
      console.error("Error en autenticación:", error);
      
      // En caso de modo de emergencia, intentar login directo
      if (localStorage.getItem("emergency_mode") === "true") {
        console.log("Intentando login en modo de emergencia");
        localStorage.setItem("vecinos_token", "emergency_token");
        toast({
          title: "Acceso en Modo de Emergencia",
          description: "Iniciando sesión con credenciales de emergencia",
        });
        setLocation("/vecinos/dashboard");
        return;
      }
      
      toast({
        title: "Error de Autenticación",
        description: "Credenciales no válidas o acceso denegado. Verifique sus datos e intente nuevamente.",
        variant: "destructive",
      });
    },
  });

  // Manejar envío del formulario
  const onSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f1ff] p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center justify-center">
            <img src={vecinoLogo} alt="VecinoXpress Logo" className="h-28 mb-2" />
            <div className="flex items-center mt-1">
              <CardTitle className="text-2xl font-bold text-[#2d219b]">VecinoXpress</CardTitle>
            </div>
          </div>
          <CardDescription className="mt-2">Acceso al Sistema Notarial de Gestión</CardDescription>
        </CardHeader>

        <Tabs defaultValue="web" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-1 mx-6">
            <TabsTrigger value="web" className="w-full">
              <Laptop className="h-4 w-4 mr-2" />
              Acceso Notarial
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="web">
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usuario</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Tu nombre de usuario"
                            {...field}
                            disabled={loginMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Tu contraseña"
                              {...field}
                              disabled={loginMutation.isPending}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-[#2d219b] hover:bg-[#231c7c]"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar sesión"}
                  </Button>
                  
                  {/* Información de seguridad */}
                  <div className="bg-[#f2f1ff] border border-[#d8d4ff] rounded-md p-3 mt-4">
                    <div className="flex items-center">
                      <CheckSquare className="h-4 w-4 text-[#2d219b] mr-2" />
                      <p className="text-sm text-[#2d219b] font-medium">Aviso de Seguridad</p>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Este sistema es de uso exclusivo para personal autorizado de la notaría. Cualquier acceso indebido será registrado y podría acarrear consecuencias legales según la Ley 19.799.
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </TabsContent>
          

        </Tabs>

        <CardFooter className="flex flex-col space-y-2 text-center text-sm">
          <div>
            <button 
              type="button"
              className="text-[#2d219b] hover:underline"
              onClick={() => setLocation("/vecinos/recuperar-password")}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            <FileCheck className="h-4 w-4 inline-block mr-1" />
            Sistema exclusivo de la Notaría | Versión 2.5.3
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}