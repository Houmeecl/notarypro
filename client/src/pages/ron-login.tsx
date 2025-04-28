import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  User, 
  Lock, 
  FileText, 
  Video, 
  CheckCircle, 
  Info,
  ChevronLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

export default function RonLoginPage() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [loginType, setLoginType] = useState<"professional" | "client">("professional");
  
  // Datos para profesionales
  const [professionalCredentials, setProfessionalCredentials] = useState({
    username: "",
    password: ""
  });
  
  // Datos para clientes
  const [accessCode, setAccessCode] = useState("");
  
  // Mutación para login de profesionales
  const professionalLoginMutation = useMutation({
    mutationFn: async (credentials: typeof professionalCredentials) => {
      const response = await apiRequest("POST", "/api/ron/login", credentials);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Acceso correcto",
        description: "Bienvenido/a a la plataforma RON de certificación remota.",
      });
      queryClient.setQueryData(['/api/ron/user'], data);
      navigate("/ron-platform");
    },
    onError: (error: any) => {
      toast({
        title: "Error de acceso",
        description: error.message || "Credenciales incorrectas. Intente nuevamente.",
        variant: "destructive",
      });
    }
  });
  
  // Mutación para acceso de clientes con código
  const clientAccessMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/ron/client-access", { code });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Acceso verificado",
        description: "Bienvenido/a a la sesión de certificación remota.",
      });
      queryClient.setQueryData(['/api/ron/session'], data);
      navigate("/ron-session");
    },
    onError: (error: any) => {
      toast({
        title: "Código inválido",
        description: error.message || "El código ingresado no es válido o ha expirado.",
        variant: "destructive",
      });
    }
  });
  
  // Manejador para login de profesionales
  const handleProfessionalLogin = () => {
    if (!professionalCredentials.username || !professionalCredentials.password) {
      toast({
        title: "Campos requeridos",
        description: "Por favor ingrese su nombre de usuario y contraseña.",
        variant: "destructive",
      });
      return;
    }
    
    professionalLoginMutation.mutate(professionalCredentials);
  };
  
  // Manejador para acceso de clientes
  const handleClientAccess = () => {
    if (!accessCode) {
      toast({
        title: "Código requerido",
        description: "Por favor ingrese el código de acceso proporcionado.",
        variant: "destructive",
      });
      return;
    }
    
    clientAccessMutation.mutate(accessCode);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <ChevronLeft className="h-5 w-5" />
              <span>Volver a la página principal</span>
            </div>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Plataforma RON</h1>
              <p className="mt-2 text-gray-600">
                Sistema de certificación remota en línea conforme a la Ley 19.799
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Video className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Certificación remota segura</h3>
                  <p className="text-sm text-muted-foreground">
                    Verificación de identidad mediante video en tiempo real con validación biométrica
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Registro digital completo</h3>
                  <p className="text-sm text-muted-foreground">
                    Ficha de atención detallada con grabación completa y trazabilidad
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Validez legal garantizada</h3>
                  <p className="text-sm text-muted-foreground">
                    Cumplimiento total de normativas para certificaciones a distancia
                  </p>
                </div>
              </div>
            </div>
            
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Info className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Requisitos técnicos</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Cámara web de alta resolución</li>
                      <li>• Micrófono funcional</li>
                      <li>• Documento de identidad con foto (Cédula/Pasaporte)</li>
                      <li>• Conexión a internet estable</li>
                      <li>• Navegador actualizado (Chrome, Firefox, Edge)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Acceso a la plataforma RON</CardTitle>
                <CardDescription>
                  Elija su tipo de acceso para continuar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs 
                  defaultValue="professional" 
                  className="w-full"
                  onValueChange={(value) => setLoginType(value as "professional" | "client")}
                >
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="professional">Profesionales</TabsTrigger>
                    <TabsTrigger value="client">Clientes</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="professional">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Nombre de usuario</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="username"
                            placeholder="Ingrese su nombre de usuario"
                            className="pl-9"
                            value={professionalCredentials.username}
                            onChange={(e) => setProfessionalCredentials({
                              ...professionalCredentials,
                              username: e.target.value
                            })}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="Ingrese su contraseña"
                            className="pl-9"
                            value={professionalCredentials.password}
                            onChange={(e) => setProfessionalCredentials({
                              ...professionalCredentials,
                              password: e.target.value
                            })}
                          />
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full mt-2" 
                        onClick={handleProfessionalLogin}
                        disabled={professionalLoginMutation.isPending}
                      >
                        {professionalLoginMutation.isPending ? "Verificando..." : "Ingresar"}
                      </Button>
                      
                      <div className="text-sm text-center mt-2">
                        <Link href="/forgot-password" className="text-primary hover:underline">
                          ¿Olvidó su contraseña?
                        </Link>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="client">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="accessCode">Código de acceso</Label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="accessCode"
                            placeholder="Ingrese el código recibido"
                            className="pl-9 text-center tracking-widest text-lg font-mono"
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          El código fue enviado por correo electrónico después de su pago
                        </p>
                      </div>
                      
                      <Button 
                        className="w-full mt-4" 
                        onClick={handleClientAccess}
                        disabled={clientAccessMutation.isPending}
                      >
                        {clientAccessMutation.isPending ? "Verificando..." : "Acceder a la sesión"}
                      </Button>
                      
                      <div className="text-sm text-center mt-2">
                        <Link href="/contact-support" className="text-primary hover:underline">
                          ¿Problemas con su código? Contacte con soporte
                        </Link>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex flex-col items-center justify-center border-t pt-6">
                <p className="text-sm text-muted-foreground">
                  Sistema de certificación remota respaldado por Cerfidoc
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Las sesiones son grabadas para garantizar su validez legal
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}