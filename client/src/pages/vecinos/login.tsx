import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Eye, EyeOff, Smartphone, Laptop } from "lucide-react";

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
  const [_, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
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
      const res = await apiRequest("POST", "/api/vecinos/login", credentials);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al iniciar sesión");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      // Guardar token en localStorage si se utiliza JWT
      if (data.token) {
        localStorage.setItem("vecinos_token", data.token);
      }
      
      // Mostrar mensaje de éxito
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido a Vecinos Xpress",
      });
      
      // Redirigir según el dispositivo, pero ir directamente al POS web sin pedir local
      if (activeTab === "mobile") {
        setLocation("/vecinos/pos-app");
      } else {
        // Ir directamente al POS web en lugar del dashboard
        setLocation("/partners/webapp-pos-buttons");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error al iniciar sesión",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Manejar envío del formulario
  const onSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center">
            <CardTitle className="text-2xl font-bold">Vecinos Xpress</CardTitle>
            <span className="ml-2 text-xs bg-blue-600 text-white px-1 py-0.5 rounded-sm">by NotaryPro</span>
          </div>
          <CardDescription>Accede a tu cuenta de socio</CardDescription>
        </CardHeader>

        <Tabs defaultValue="web" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mx-6">
            <TabsTrigger value="web">
              <Laptop className="h-4 w-4 mr-2" />
              Acceso Web
            </TabsTrigger>
            <TabsTrigger value="mobile">
              <Smartphone className="h-4 w-4 mr-2" />
              Acceso App
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
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar sesión"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="mobile">
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
                            className="text-lg h-12"
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
                              className="text-lg h-12"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
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
                    className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-lg"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar sesión"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </TabsContent>
        </Tabs>

        <CardFooter className="flex flex-col space-y-2 text-center text-sm">
          <div>
            <a 
              href="#" 
              className="text-blue-600 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                setLocation("/vecinos/recuperar-password");
              }}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <div>
            ¿No tienes una cuenta?{" "}
            <a 
              href="#" 
              className="text-blue-600 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                setLocation("/partners/registration-form");
              }}
            >
              Regístrate aquí
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}