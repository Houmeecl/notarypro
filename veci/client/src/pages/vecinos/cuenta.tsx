import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  ArrowLeft, Save, User, Building, Phone, 
  Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

// Esquema para actualización de información general
const generalInfoSchema = z.object({
  storeName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  ownerName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().min(8, "El teléfono debe tener al menos 8 dígitos"),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  city: z.string().min(2, "La ciudad es requerida"),
});

// Esquema para actualización de contraseña
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string().min(1, "Confirma tu nueva contraseña"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// Esquema para configuración de cuenta bancaria
const bankInfoSchema = z.object({
  bankName: z.string().min(1, "Selecciona un banco"),
  accountType: z.string().min(1, "Selecciona un tipo de cuenta"),
  accountNumber: z.string().min(5, "El número de cuenta es requerido"),
  ownerRut: z.string().min(8, "RUT inválido"),
});

export default function VecinosCuenta() {
  const [_, setLocation] = useLocation();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  
  // Comprobar autenticación
  useEffect(() => {
    const token = localStorage.getItem("vecinos_token");
    if (!token) {
      setLocation("/vecinos/login");
      toast({
        title: "Sesión no válida",
        description: "Por favor inicia sesión para acceder",
        variant: "destructive",
      });
    }
  }, [setLocation]);
  
  // Obtener información del socio
  const { data: partnerInfo, isLoading } = useQuery({
    queryKey: ["/api/vecinos/partner-info"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/vecinos/partner-info");
      if (!res.ok) {
        throw new Error("Error al obtener información");
      }
      return await res.json();
    },
  });
  
  // Form para información general
  const generalForm = useForm<z.infer<typeof generalInfoSchema>>({
    resolver: zodResolver(generalInfoSchema),
    defaultValues: {
      storeName: "",
      ownerName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
    },
  });
  
  // Form para contraseña
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Form para información bancaria
  const bankForm = useForm<z.infer<typeof bankInfoSchema>>({
    resolver: zodResolver(bankInfoSchema),
    defaultValues: {
      bankName: "",
      accountType: "",
      accountNumber: "",
      ownerRut: "",
    },
  });
  
  // Actualizar formularios cuando se cargan los datos
  useEffect(() => {
    if (partnerInfo) {
      generalForm.reset({
        storeName: partnerInfo.storeName || "",
        ownerName: partnerInfo.ownerName || "",
        email: partnerInfo.email || "",
        phone: partnerInfo.phone || "",
        address: partnerInfo.address || "",
        city: partnerInfo.city || "",
      });
      
      bankForm.reset({
        bankName: partnerInfo.bankName || "",
        accountType: partnerInfo.accountType || "",
        accountNumber: partnerInfo.accountNumber || "",
        ownerRut: partnerInfo.ownerRut || "",
      });
    }
  }, [partnerInfo]);
  
  // Mutación para actualizar información general
  const updateGeneralInfoMutation = useMutation({
    mutationFn: async (data: z.infer<typeof generalInfoSchema>) => {
      const res = await apiRequest("PATCH", "/api/vecinos/account/general", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al actualizar información");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vecinos/partner-info"] });
      toast({
        title: "Información actualizada",
        description: "Tus datos han sido actualizados correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar información",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutación para actualizar contraseña
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof passwordSchema>) => {
      const res = await apiRequest("PATCH", "/api/vecinos/account/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al actualizar contraseña");
      }
      return await res.json();
    },
    onSuccess: () => {
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar contraseña",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutación para actualizar información bancaria
  const updateBankInfoMutation = useMutation({
    mutationFn: async (data: z.infer<typeof bankInfoSchema>) => {
      const res = await apiRequest("PATCH", "/api/vecinos/account/bank", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al actualizar información bancaria");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vecinos/partner-info"] });
      toast({
        title: "Información bancaria actualizada",
        description: "Tus datos bancarios han sido actualizados correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar información bancaria",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Manejar envío del formulario general
  const onSubmitGeneralInfo = (data: z.infer<typeof generalInfoSchema>) => {
    updateGeneralInfoMutation.mutate(data);
  };
  
  // Manejar envío del formulario de contraseña
  const onSubmitPassword = (data: z.infer<typeof passwordSchema>) => {
    updatePasswordMutation.mutate(data);
  };
  
  // Manejar envío del formulario bancario
  const onSubmitBankInfo = (data: z.infer<typeof bankInfoSchema>) => {
    updateBankInfoMutation.mutate(data);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Encabezado */}
      <header className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-blue-700 mr-2"
              onClick={() => setLocation("/vecinos/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-xl font-bold">Mi Cuenta</h1>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          ) : partnerInfo ? (
            <>
              {/* Información básica */}
              <div className="mb-8 flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24">
                  {partnerInfo.avatarUrl ? (
                    <AvatarImage src={partnerInfo.avatarUrl} alt={partnerInfo.storeName} />
                  ) : (
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                      {partnerInfo.storeName?.substring(0, 2).toUpperCase() || "VX"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{partnerInfo.storeName}</h2>
                  <p className="text-gray-600">{partnerInfo.ownerName}</p>
                  <div className="flex mt-2">
                    <Badge variant="outline" className="mr-2">
                      ID: {partnerInfo.id}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      {partnerInfo.commissionRate}% comisión
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Pestañas de configuración */}
              <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-8">
                  <TabsTrigger value="general">Información general</TabsTrigger>
                  <TabsTrigger value="password">Contraseña</TabsTrigger>
                  <TabsTrigger value="bank">Datos bancarios</TabsTrigger>
                </TabsList>
                
                {/* Formulario de información general */}
                <TabsContent value="general">
                  <Card>
                    <CardHeader>
                      <CardTitle>Información general</CardTitle>
                      <CardDescription>
                        Actualiza la información de tu negocio
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...generalForm}>
                        <form onSubmit={generalForm.handleSubmit(onSubmitGeneralInfo)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={generalForm.control}
                              name="storeName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nombre del negocio</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center">
                                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                                      <Input {...field} />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={generalForm.control}
                              name="ownerName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nombre del propietario</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center">
                                      <User className="h-4 w-4 text-gray-400 mr-2" />
                                      <Input {...field} />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={generalForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Correo electrónico</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center">
                                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                      <Input {...field} />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={generalForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Teléfono</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center">
                                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                      <Input {...field} />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={generalForm.control}
                              name="address"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Dirección</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={generalForm.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Ciudad</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex justify-end">
                            <Button 
                              type="submit" 
                              className="bg-blue-600 hover:bg-blue-700"
                              disabled={updateGeneralInfoMutation.isPending}
                            >
                              <Save className="h-4 w-4 mr-2" />
                              {updateGeneralInfoMutation.isPending ? "Guardando..." : "Guardar cambios"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Formulario de contraseña */}
                <TabsContent value="password">
                  <Card>
                    <CardHeader>
                      <CardTitle>Cambiar contraseña</CardTitle>
                      <CardDescription>
                        Actualiza tu contraseña para mantener tu cuenta segura
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-6">
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contraseña actual</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <div className="flex items-center">
                                      <Lock className="h-4 w-4 text-gray-400 mr-2" />
                                      <Input 
                                        type={showCurrentPassword ? "text" : "password"} 
                                        {...field} 
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                      {showCurrentPassword ? (
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
                          
                          <Separator />
                          
                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nueva contraseña</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <div className="flex items-center">
                                      <Lock className="h-4 w-4 text-gray-400 mr-2" />
                                      <Input 
                                        type={showNewPassword ? "text" : "password"} 
                                        {...field} 
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                                      onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                      {showNewPassword ? (
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
                          
                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirmar nueva contraseña</FormLabel>
                                <FormControl>
                                  <div className="flex items-center">
                                    <Lock className="h-4 w-4 text-gray-400 mr-2" />
                                    <Input 
                                      type={showNewPassword ? "text" : "password"} 
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Alert className="bg-yellow-50 border-yellow-200">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <AlertTitle className="text-yellow-600">Importante</AlertTitle>
                            <AlertDescription>
                              Tu contraseña debe tener al menos 8 caracteres y contener letras y números para mayor seguridad.
                            </AlertDescription>
                          </Alert>
                          
                          <div className="flex justify-end">
                            <Button 
                              type="submit" 
                              className="bg-blue-600 hover:bg-blue-700"
                              disabled={updatePasswordMutation.isPending}
                            >
                              <Save className="h-4 w-4 mr-2" />
                              {updatePasswordMutation.isPending ? "Actualizando..." : "Actualizar contraseña"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Formulario de datos bancarios */}
                <TabsContent value="bank">
                  <Card>
                    <CardHeader>
                      <CardTitle>Datos bancarios</CardTitle>
                      <CardDescription>
                        Esta información se utilizará para transferir tus comisiones
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...bankForm}>
                        <form onSubmit={bankForm.handleSubmit(onSubmitBankInfo)} className="space-y-6">
                          <FormField
                            control={bankForm.control}
                            name="bankName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Banco</FormLabel>
                                <FormControl>
                                  <select 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    {...field}
                                  >
                                    <option value="">Seleccionar banco</option>
                                    <option value="banco_estado">Banco Estado</option>
                                    <option value="banco_santander">Banco Santander</option>
                                    <option value="banco_chile">Banco de Chile</option>
                                    <option value="banco_bci">Banco BCI</option>
                                    <option value="banco_scotiabank">Scotiabank</option>
                                    <option value="otro">Otro</option>
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={bankForm.control}
                            name="accountType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de cuenta</FormLabel>
                                <FormControl>
                                  <select 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    {...field}
                                  >
                                    <option value="">Seleccionar tipo de cuenta</option>
                                    <option value="cuenta_corriente">Cuenta Corriente</option>
                                    <option value="cuenta_vista">Cuenta Vista / RUT</option>
                                    <option value="cuenta_ahorro">Cuenta de Ahorro</option>
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={bankForm.control}
                            name="accountNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número de cuenta</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={bankForm.control}
                            name="ownerRut"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>RUT del titular</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ej. 12345678-9" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Alert className="bg-blue-50 border-blue-200">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                            <AlertTitle className="text-blue-600">Información importante</AlertTitle>
                            <AlertDescription>
                              Los datos bancarios son necesarios para recibir el pago de tus comisiones. Asegúrate de que la información sea correcta.
                            </AlertDescription>
                          </Alert>
                          
                          <div className="flex justify-end">
                            <Button 
                              type="submit" 
                              className="bg-blue-600 hover:bg-blue-700"
                              disabled={updateBankInfoMutation.isPending}
                            >
                              <Save className="h-4 w-4 mr-2" />
                              {updateBankInfoMutation.isPending ? "Guardando..." : "Guardar datos bancarios"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                No se pudo cargar la información de la cuenta. Por favor, intenta nuevamente.
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-red-600 hover:text-red-700 underline"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/vecinos/partner-info"] })}
                >
                  Reintentar
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  );
}

// Componente Badge provisional mientras arreglamos la importación
function Badge({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) {
  const baseClass = "text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap";
  const classes = variant === "outline" 
    ? `${baseClass} border border-gray-300 text-gray-600 ${className || ""}` 
    : `${baseClass} ${className || ""}`;
  
  return <span className={classes}>{children}</span>;
}