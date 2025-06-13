import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/dashboard/Sidebar";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { 
  Step, 
  StepDescription, 
  StepLabel,
  Stepper 
} from "@/components/ui/stepper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Download, 
  FileText, 
  Printer, 
  Stamp, 
  User 
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Formulario para datos del cliente
const clientFormSchema = z.object({
  fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  documentType: z.string().min(1, "Seleccione un tipo de documento"),
  rut: z.string().min(9, "Ingrese un RUT válido").regex(/^\d{1,2}\.\d{3}\.\d{3}[-][0-9kK]{1}$/, "Formato inválido (ej: 12.345.678-9)"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().optional(),
});

// Formulario para datos del documento
const documentFormSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  paymentMethod: z.string().min(1, "Seleccione un método de pago"),
  paymentAmount: z.number().min(1000, "El monto mínimo es $1.000 CLP"),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;
type DocumentFormValues = z.infer<typeof documentFormSchema>;

export default function DocumentProcessor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [clientData, setClientData] = useState<ClientFormValues | null>(null);
  const [documentData, setDocumentData] = useState<DocumentFormValues | null>(null);
  const [documentId, setDocumentId] = useState<number | null>(null);
  
  // Formulario para datos del cliente
  const clientForm = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      fullName: "",
      documentType: "",
      rut: "",
      email: "",
      phone: "",
    },
  });
  
  // Formulario para datos del documento
  const documentForm = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      paymentMethod: "",
      paymentAmount: 3000,
    },
  });
  
  // Consulta de tipos de documentos disponibles
  const { data: documentTypes } = useQuery({
    queryKey: ["/api/document-templates"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/document-templates");
      return await res.json();
    },
  });
  
  // Mutación para registrar un cliente
  const registerClientMutation = useMutation({
    mutationFn: async (data: ClientFormValues) => {
      const res = await apiRequest("POST", "/api/pos/register-client", data);
      return await res.json();
    },
    onSuccess: (data) => {
      setClientData(clientForm.getValues());
      setActiveStep(1);
      toast({
        title: "Cliente registrado",
        description: "Los datos del cliente han sido registrados correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al registrar cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutación para registrar un documento
  const registerDocumentMutation = useMutation({
    mutationFn: async (data: DocumentFormValues & { clientId: number }) => {
      const res = await apiRequest("POST", "/api/pos/register-document", data);
      return await res.json();
    },
    onSuccess: (data) => {
      setDocumentData(documentForm.getValues());
      setDocumentId(data.id);
      setActiveStep(2);
      toast({
        title: "Documento registrado",
        description: "El documento ha sido registrado correctamente.",
      });
      
      // Invalidar consultas para actualizar datos
      queryClient.invalidateQueries({ queryKey: ["/api/pos/documents"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al registrar documento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Manejador para enviar el formulario del cliente
  const onClientSubmit = (data: ClientFormValues) => {
    registerClientMutation.mutate(data);
  };
  
  // Manejador para enviar el formulario del documento
  const onDocumentSubmit = (data: DocumentFormValues) => {
    if (!clientData) {
      toast({
        title: "Error",
        description: "Primero debe registrar los datos del cliente.",
        variant: "destructive",
      });
      return;
    }
    
    // Obtener clientId del resultado anterior
    registerDocumentMutation.mutate({
      ...data,
      clientId: 1, // Este valor se reemplazará con el ID real del cliente
    });
  };
  
  // Buscar cliente por RUT
  const searchClientByRut = async (rut: string) => {
    try {
      const res = await apiRequest("GET", `/api/pos/clients/search?rut=${encodeURIComponent(rut)}`);
      const client = await res.json();
      
      if (client) {
        clientForm.setValue("fullName", client.fullName);
        clientForm.setValue("email", client.email);
        if (client.phone) clientForm.setValue("phone", client.phone);
        
        toast({
          title: "Cliente encontrado",
          description: "Los datos del cliente han sido cargados.",
        });
      }
    } catch (error) {
      // Cliente no encontrado, se creará uno nuevo
    }
  };
  
  // Efecto para buscar cliente cuando se completa el RUT
  useEffect(() => {
    const subscription = clientForm.watch((value, { name }) => {
      if (name === "rut" && value.rut && value.rut.length >= 11) {
        searchClientByRut(value.rut);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [clientForm.watch]);
  
  // Función para formatear un RUT (ej: 12345678-9 -> 12.345.678-9)
  const formatRut = (rut: string) => {
    // Eliminar puntos y guiones
    let valor = rut.replace(/\./g, "").replace(/-/g, "");
    
    // Validar que solo tenga números y k
    valor = valor.replace(/[^0-9kK]/g, "");
    
    // Obtener dígito verificador
    const dv = valor.slice(-1);
    
    // Obtener cuerpo del RUT
    let rutCuerpo = valor.slice(0, -1);
    
    // Formatear RUT
    let rutFormateado = "";
    
    // Agregar puntos
    for (let i = rutCuerpo.length; i > 0; i -= 3) {
      const inicio = Math.max(0, i - 3);
      rutFormateado = "." + rutCuerpo.substring(inicio, i) + rutFormateado;
    }
    
    return rutFormateado.substring(1) + "-" + dv;
  };
  
  // Manejador para formatear RUT mientras se escribe
  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rut = e.target.value;
    
    // Si está borrando, permitirlo sin formatear
    if (clientForm.getValues("rut")?.length > rut.length) {
      clientForm.setValue("rut", rut);
      return;
    }
    
    // Si está escribiendo, formatear
    if (rut.length > 0) {
      rut = formatRut(rut);
      clientForm.setValue("rut", rut);
    }
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      
      <div className="md:pl-64 p-6">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/user-dashboard">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Volver al dashboard
                </Button>
              </Link>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900">
              Procesador de Documentos
            </h1>
            <p className="text-gray-500 mt-2">
              Complete los pasos para procesar un documento como en el sistema POS
            </p>
          </header>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Proceso de Documentación</CardTitle>
              <CardDescription>
                Siga los pasos para completar el proceso de documentación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Stepper activeStep={activeStep} orientation="horizontal">
                <Step id="client-step">
                  <StepLabel>Datos del Cliente</StepLabel>
                  <StepDescription>Registro de información personal</StepDescription>
                </Step>
                <Step id="document-step">
                  <StepLabel>Detalles del Documento</StepLabel>
                  <StepDescription>Información y pago del documento</StepDescription>
                </Step>
                <Step id="receipt-step">
                  <StepLabel>Recibo</StepLabel>
                  <StepDescription>Generación del comprobante</StepDescription>
                </Step>
              </Stepper>
            </CardContent>
          </Card>
          
          <Card id="document-processor-form">
            <CardContent className="p-6">
              <Tabs value={`step-${activeStep}`} className="mt-4">
                {/* Paso 1: Datos del Cliente */}
                <TabsContent value="step-0">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-1">Registro de Cliente</h2>
                    <p className="text-gray-500">Ingrese los datos del cliente para procesar el documento</p>
                  </div>
                  
                  <Form {...clientForm}>
                    <form onSubmit={clientForm.handleSubmit(onClientSubmit)}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={clientForm.control}
                          name="rut"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>RUT</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="12.345.678-9"
                                  onChange={handleRutChange}
                                  maxLength={12}
                                  id="rut-input"
                                />
                              </FormControl>
                              <FormDescription>
                                Ingrese el RUT del cliente con formato XX.XXX.XXX-X
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={clientForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre Completo</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Nombre y apellidos" id="fullname-input" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={clientForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Correo Electrónico</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="ejemplo@correo.cl" type="email" id="email-input" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={clientForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Teléfono (opcional)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="+56912345678" type="tel" id="phone-input" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={clientForm.control}
                          name="documentType"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Tipo de Documento</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione tipo de documento" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="declaration">Declaración Jurada</SelectItem>
                                  <SelectItem value="power">Poder Simple</SelectItem>
                                  <SelectItem value="certificate">Certificado</SelectItem>
                                  <SelectItem value="contract">Contrato</SelectItem>
                                  <SelectItem value="other">Otro</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="mt-8 flex justify-end">
                        <Button 
                          type="submit"
                          disabled={registerClientMutation.isPending}
                          className="gap-2"
                        >
                          {registerClientMutation.isPending ? (
                            <>Procesando...</>
                          ) : (
                            <>
                              Continuar
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
                
                {/* Paso 2: Detalles del Documento */}
                <TabsContent value="step-1">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-1">Detalles del Documento</h2>
                    <p className="text-gray-500">Ingrese la información del documento y datos de pago</p>
                  </div>
                  
                  {clientData && (
                    <div className="bg-gray-100 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <h3 className="font-medium">Datos del Cliente</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Nombre:</span> {clientData.fullName}
                        </div>
                        <div>
                          <span className="text-gray-500">RUT:</span> {clientData.rut}
                        </div>
                        <div>
                          <span className="text-gray-500">Email:</span> {clientData.email}
                        </div>
                        <div>
                          <span className="text-gray-500">Tipo:</span> {clientData.documentType}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Form {...documentForm}>
                    <form onSubmit={documentForm.handleSubmit(onDocumentSubmit)}>
                      <div className="grid grid-cols-1 gap-6">
                        <FormField
                          control={documentForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Título del Documento</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Ej: Declaración jurada para trámite municipal" id="title-input" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={documentForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descripción (opcional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Detalles adicionales sobre el documento"
                                  className="resize-none"
                                  rows={3}
                                  id="description-input"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={documentForm.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Método de Pago</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccione método de pago" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent id="payment-method-selector">
                                    <SelectItem value="cash">Efectivo</SelectItem>
                                    <SelectItem value="card">Tarjeta</SelectItem>
                                    <SelectItem value="transfer">Transferencia</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={documentForm.control}
                            name="paymentAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Monto (CLP)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    min="1000"
                                    step="500"
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    id="amount-input"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Comisión: ${(field.value || 0) * 0.15} CLP (15%)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-8 flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveStep(0)}
                          className="gap-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Volver
                        </Button>
                        
                        <Button
                          type="submit"
                          disabled={registerDocumentMutation.isPending}
                          className="gap-2"
                        >
                          {registerDocumentMutation.isPending ? (
                            <>Procesando...</>
                          ) : (
                            <>
                              Procesar Documento
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
                
                {/* Paso 3: Recibo */}
                <TabsContent value="step-2">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-1">Recibo de Documentación</h2>
                    <p className="text-gray-500">El documento ha sido procesado correctamente</p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-100 rounded-lg p-6 text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-green-900 mb-2">¡Documento Procesado con Éxito!</h3>
                    <p className="text-green-700 mb-6">
                      El documento ha sido registrado y está listo para su procesamiento.
                    </p>
                    
                    {clientData && documentData && (
                      <div className="bg-white border border-green-100 rounded-lg p-4 mb-6 text-left">
                        <h4 className="font-medium text-gray-900 mb-3">Detalles de la Transacción</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                          <div>
                            <span className="text-gray-500">Cliente:</span> {clientData.fullName}
                          </div>
                          <div>
                            <span className="text-gray-500">RUT:</span> {clientData.rut}
                          </div>
                          <div>
                            <span className="text-gray-500">Documento:</span> {documentData.title}
                          </div>
                          <div>
                            <span className="text-gray-500">Tipo:</span> {clientData.documentType}
                          </div>
                          <div>
                            <span className="text-gray-500">Monto:</span> ${documentData.paymentAmount} CLP
                          </div>
                          <div>
                            <span className="text-gray-500">Método:</span> {
                              documentData.paymentMethod === "cash" ? "Efectivo" :
                              documentData.paymentMethod === "card" ? "Tarjeta" :
                              "Transferencia"
                            }
                          </div>
                          <div>
                            <span className="text-gray-500">Comisión (15%):</span> ${documentData.paymentAmount * 0.15} CLP
                          </div>
                          <div>
                            <span className="text-gray-500">Código:</span> #{documentId || "000000"}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-center gap-4">
                      <Button className="gap-2">
                        <Printer className="h-4 w-4" />
                        Imprimir Recibo
                      </Button>
                      <Button className="gap-2" variant="outline">
                        <Download className="h-4 w-4" />
                        Descargar PDF
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-blue-100 p-2 flex-shrink-0">
                        <Stamp className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-900 mb-2">Verificación del Documento</h3>
                        <p className="text-blue-700 mb-4">
                          El cliente podrá verificar la autenticidad de este documento utilizando este código QR o
                          ingresando el código #{documentId || "000000"} en nuestra página web.
                        </p>
                        
                        <div className="bg-white border border-blue-100 rounded-lg p-4 max-w-xs mx-auto">
                          <div className="bg-gray-200 w-32 h-32 mx-auto mb-3 flex items-center justify-center">
                            <FileText className="h-10 w-10 text-gray-500" />
                            <span className="sr-only">Código QR de verificación</span>
                          </div>
                          <p className="text-xs text-center text-gray-500">
                            Escanee para verificar en cerfidoc.cl/verificar
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setActiveStep(1)}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Volver
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setLocation("/user-dashboard");
                        toast({
                          title: "Proceso completado",
                          description: "El documento ha sido procesado correctamente.",
                        });
                      }}
                    >
                      Finalizar y Volver al Dashboard
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}