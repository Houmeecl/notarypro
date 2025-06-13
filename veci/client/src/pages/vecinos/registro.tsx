import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Store, User, MapPin, Phone, Mail, 
  CreditCard, CheckCircle2, ChevronRight, ArrowLeft,
  Download
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

// Esquema de validación para el formulario
const registrationSchema = z.object({
  // Información del negocio
  storeName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  businessType: z.string({ required_error: "Selecciona un tipo de negocio" }),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  city: z.string().min(2, "La ciudad es requerida"),
  phone: z.string().min(8, "El teléfono debe tener al menos 8 dígitos"),
  email: z.string().email("Correo electrónico inválido"),
  
  // Información del propietario
  ownerName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  ownerRut: z.string().min(8, "RUT inválido"),
  ownerPhone: z.string().min(8, "El teléfono debe tener al menos 8 dígitos"),
  
  // Información bancaria (opcional)
  bankName: z.string().optional(),
  accountType: z.string().optional(),
  accountNumber: z.string().optional(),
  
  // Términos y condiciones
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "Debes aceptar los términos y condiciones",
  }),
});

// Tipo para los datos del formulario
type RegistrationData = z.infer<typeof registrationSchema>;

export default function VecinosRegistro() {
  const [_, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [submittedData, setSubmittedData] = useState<RegistrationData | null>(null);
  
  // Configurar formulario con React Hook Form
  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      storeName: "",
      businessType: "",
      address: "",
      city: "",
      phone: "",
      email: "",
      ownerName: "",
      ownerRut: "",
      ownerPhone: "",
      bankName: "",
      accountType: "",
      accountNumber: "",
      termsAccepted: false,
    },
  });

  // Mutación para el registro
  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      const res = await apiRequest("POST", "/api/vecinos/register", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al registrar el negocio");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      setSubmittedData(form.getValues());
      setCurrentStep(4);
      toast({
        title: "Registro exitoso",
        description: "Tu solicitud ha sido recibida y está siendo procesada.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error en el registro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Manejar envío del formulario
  const onSubmit = (data: RegistrationData) => {
    registerMutation.mutate(data);
  };

  // Avanzar al siguiente paso
  const nextStep = () => {
    // Validar campos del paso actual antes de avanzar
    if (currentStep === 1) {
      const businessFields = ["storeName", "businessType", "address", "city", "phone", "email"];
      const isValid = businessFields.every(field => form.getFieldState(field as any).invalid === false);
      
      if (!isValid) {
        // Trigger validation for all fields in this step
        businessFields.forEach(field => form.trigger(field as any));
        return;
      }
    } else if (currentStep === 2) {
      const ownerFields = ["ownerName", "ownerRut", "ownerPhone"];
      const isValid = ownerFields.every(field => form.getFieldState(field as any).invalid === false);
      
      if (!isValid) {
        // Trigger validation for all fields in this step
        ownerFields.forEach(field => form.trigger(field as any));
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
  };

  // Retroceder al paso anterior
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Renderizar paso 1: Información del negocio
  const renderStep1 = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="storeName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre del negocio</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ej. Almacén Don Pedro" 
                {...field} 
                disabled={registerMutation.isPending}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="businessType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de negocio</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
              disabled={registerMutation.isPending}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de negocio" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="almacen">Almacén</SelectItem>
                <SelectItem value="farmacia">Farmacia</SelectItem>
                <SelectItem value="cibercafe">Cibercafé</SelectItem>
                <SelectItem value="botilleria">Botillería</SelectItem>
                <SelectItem value="libreria">Librería</SelectItem>
                <SelectItem value="otros">Otros</SelectItem>
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
              <Input 
                placeholder="Ej. Av. Principal 123" 
                {...field} 
                disabled={registerMutation.isPending}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ciudad</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ej. Santiago" 
                {...field} 
                disabled={registerMutation.isPending}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ej. 912345678" 
                  {...field} 
                  disabled={registerMutation.isPending}
                />
              </FormControl>
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
                <Input 
                  placeholder="ejemplo@correo.com" 
                  {...field} 
                  disabled={registerMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  // Renderizar paso 2: Información del propietario
  const renderStep2 = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="ownerName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre completo del propietario</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ej. Juan Pérez González" 
                {...field} 
                disabled={registerMutation.isPending}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="ownerRut"
        render={({ field }) => (
          <FormItem>
            <FormLabel>RUT del propietario</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ej. 12345678-9" 
                {...field} 
                disabled={registerMutation.isPending}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="ownerPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Teléfono del propietario</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ej. 912345678" 
                {...field} 
                disabled={registerMutation.isPending}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  // Renderizar paso 3: Información bancaria (opcional) y términos
  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Información bancaria (opcional)</h3>
        <p className="text-sm text-gray-500 mb-4">
          Esta información se utilizará para realizar transferencias de tus comisiones.
        </p>
      </div>

      <FormField
        control={form.control}
        name="bankName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Banco</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value || ""}
              disabled={registerMutation.isPending}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu banco" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="banco_estado">Banco Estado</SelectItem>
                <SelectItem value="banco_santander">Banco Santander</SelectItem>
                <SelectItem value="banco_chile">Banco de Chile</SelectItem>
                <SelectItem value="banco_bci">Banco BCI</SelectItem>
                <SelectItem value="banco_scotiabank">Scotiabank</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>Puedes agregar esta información más tarde</FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="accountType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de cuenta</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value || ""}
              disabled={registerMutation.isPending}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de cuenta" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="cuenta_corriente">Cuenta Corriente</SelectItem>
                <SelectItem value="cuenta_vista">Cuenta Vista / RUT</SelectItem>
                <SelectItem value="cuenta_ahorro">Cuenta de Ahorro</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="accountNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de cuenta</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ingresa el número de cuenta" 
                {...field} 
                disabled={registerMutation.isPending}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <Separator className="my-6" />

      <FormField
        control={form.control}
        name="termsAccepted"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={registerMutation.isPending}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Acepto los <a href="#" className="text-blue-600 hover:underline">términos y condiciones</a> y la <a href="#" className="text-blue-600 hover:underline">política de privacidad</a>
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </div>
  );

  // Renderizar paso 4: Confirmación y siguientes pasos
  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircle2 className="h-20 w-20 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold">¡Solicitud enviada con éxito!</h3>
        <p className="text-gray-600 mt-2">
          Gracias por registrarte como socio de Vecinos Xpress.
        </p>
      </div>
      
      <div className="bg-blue-50 p-6 rounded-lg text-left">
        <h4 className="font-bold mb-3">Próximos pasos:</h4>
        <ol className="space-y-2 list-decimal list-inside">
          <li>Recibirás un correo de confirmación a <span className="font-semibold">{submittedData?.email}</span></li>
          <li>Nuestro equipo validará tu información en un plazo de 24-48 horas</li>
          <li>Recibirás tus credenciales de acceso al sistema</li>
          <li>Podrás descargar la aplicación de Vecinos Xpress e iniciar sesión</li>
        </ol>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
        <Button 
          onClick={() => setLocation("/vecinos")}
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Button>
        <Button 
          onClick={() => setLocation("/vecinos/login")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Ir al login
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
        <div className="mt-4 flex justify-center">
          <Button 
            variant="link"
            onClick={() => setLocation("/partners/descargar-apk")}
            className="text-blue-600"
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar aplicación móvil
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-3xl font-bold mr-2">Vecinos Xpress</h1>
            <span className="text-xs bg-blue-600 text-white px-1 py-0.5 rounded-sm">by NotaryPro</span>
          </div>
          <p className="text-gray-600">
            Registro de nuevo socio
          </p>
        </div>

        {/* Indicador de pasos */}
        {currentStep < 4 && (
          <div className="flex justify-between items-center mb-8 px-2">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                <Store className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm font-medium hidden sm:block">Negocio</span>
            </div>
            
            <div className={`flex-grow border-t mx-2 ${currentStep >= 2 ? 'border-blue-600' : 'border-gray-300'}`} />
            
            <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 2 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                <User className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm font-medium hidden sm:block">Propietario</span>
            </div>
            
            <div className={`flex-grow border-t mx-2 ${currentStep >= 3 ? 'border-blue-600' : 'border-gray-300'}`} />
            
            <div className={`flex items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 3 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                <CreditCard className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm font-medium hidden sm:block">Pagos</span>
            </div>
          </div>
        )}

        {/* Tarjeta principal */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Información del negocio"}
              {currentStep === 2 && "Información del propietario"}
              {currentStep === 3 && "Información de pagos"}
              {currentStep === 4 && "Registro completo"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Ingresa los datos de tu negocio"}
              {currentStep === 2 && "Ingresa los datos del propietario del negocio"}
              {currentStep === 3 && "Configura cómo quieres recibir tus comisiones"}
              {currentStep === 4 && "Tu solicitud ha sido recibida"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
                
                {currentStep < 4 && (
                  <div className="flex justify-between mt-8">
                    {currentStep > 1 ? (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={prevStep}
                        disabled={registerMutation.isPending}
                      >
                        Anterior
                      </Button>
                    ) : (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setLocation("/vecinos")}
                        disabled={registerMutation.isPending}
                      >
                        Cancelar
                      </Button>
                    )}
                    
                    {currentStep < 3 ? (
                      <Button 
                        type="button" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={nextStep}
                        disabled={registerMutation.isPending}
                      >
                        Siguiente
                      </Button>
                    ) : (
                      <Button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Enviando..." : "Enviar solicitud"}
                      </Button>
                    )}
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* Información adicional */}
        {currentStep < 4 && (
          <div className="mt-8 text-center text-gray-600 text-sm">
            <p>¿Tienes dudas? <a href="#" className="text-blue-600 hover:underline">Contáctanos</a></p>
          </div>
        )}
      </div>
    </div>
  );
}