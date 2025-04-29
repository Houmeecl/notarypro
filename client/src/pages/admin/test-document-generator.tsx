import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, FileText, ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function TestDocumentGenerator() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [formSchema, setFormSchema] = useState<any | null>(null);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Verificar que el usuario sea administrador
  useEffect(() => {
    if (!user) {
      toast({
        title: "Sesión requerida",
        description: "Debe iniciar sesión como administrador para acceder a esta página.",
        variant: "destructive",
      });
      setLocation("/auth");
      return;
    }
    
    if (user.role !== "admin") {
      toast({
        title: "Acceso denegado",
        description: "Solo los administradores pueden acceder a esta página.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, setLocation, toast]);

  // Traer categorías de documentos
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/document-categories'],
  });

  // Traer plantillas de documentos
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/document-templates'],
  });

  // Filtrar plantillas activas
  const activeTemplates = templates?.filter((template: any) => template.active) || [];

  // Schema base para el formulario principal
  const formBaseSchema = z.object({
    templateId: z.string().min(1, "Debe seleccionar una plantilla"),
    title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
    testCode: z.string().min(1, "El código de prueba es requerido"),
  });

  // Formulario principal para seleccionar plantilla
  const form = useForm<z.infer<typeof formBaseSchema>>({
    resolver: zodResolver(formBaseSchema),
    defaultValues: {
      templateId: "",
      title: "",
      testCode: "7723", // Código de prueba predefinido
    },
    mode: "onChange", // Validación en tiempo real
  });

  // Formulario dinámico para los campos de la plantilla
  const dynamicSchema = formSchema ? z.object(formSchema.properties) : z.object({});
  
  const dynamicForm = useForm<z.infer<typeof dynamicSchema>>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {},
  });

  // Cuando se selecciona una plantilla
  useEffect(() => {
    if (selectedTemplateId && templates) {
      const template = templates.find((t: any) => t.id.toString() === selectedTemplateId);
      setSelectedTemplate(template);
      
      if (template && template.formSchema) {
        setFormSchema(template.formSchema);
        
        // Reiniciar el formulario dinámico
        dynamicForm.reset({});
        
        // Actualizar el título con un valor predeterminado
        form.setValue("title", `${template.name} - Prueba Admin`);
      }
    }
  }, [selectedTemplateId, templates, dynamicForm, form]);

  // Escuchar cambios en el campo templateId
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "templateId" && value.templateId) {
        setSelectedTemplateId(value.templateId);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Mutación para crear y firmar documento
  const createDocumentMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!selectedTemplate) throw new Error("Plantilla no disponible");
      if (!user) throw new Error("Debe iniciar sesión para realizar esta acción");
      
      const documentData = {
        templateId: parseInt(data.templateId),
        title: data.title,
        formData: data.formData,
        testCode: data.testCode || "7723" // Asegurar que el código siempre esté presente
      };
      
      // Log para diagnóstico
      console.log("Enviando solicitud de creación de documento:", documentData);
      
      try {
        const response = await apiRequest("POST", "/api/admin/documents/create-from-template", documentData);
        const result = await response.json();
        console.log("Respuesta de creación:", result);
        return result;
      } catch (error) {
        console.error("Error en la solicitud:", error);
        // Verificar si es un error de autenticación
        if (error.message && error.message.includes("401")) {
          throw new Error("La sesión ha expirado. Por favor, inicie sesión nuevamente.");
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Documento creado",
        description: "El documento ha sido creado y firmado correctamente.",
      });
      
      // Mostrar el código de verificación
      setVerificationCode(data.verificationCode);
      setIsSuccess(true);
      
      // Actualizar la caché de documentos
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el documento.",
        variant: "destructive",
      });
      
      // Si es un error de autenticación, redirigir al login
      if (error.message && error.message.includes("sesión")) {
        setLocation("/auth");
      }
    }
  });

  // Manejar envío del formulario
  const onSubmit = (baseData: z.infer<typeof formBaseSchema>) => {
    // Asegurarse de que el código de prueba está presente
    if (!baseData.testCode) {
      baseData.testCode = "7723";
    }
    
    // Validar el formulario dinámico
    dynamicForm.handleSubmit((dynamicData) => {
      // Combinar datos de ambos formularios
      const completeData = {
        ...baseData,
        formData: dynamicData
      };
      
      console.log("Datos completos a enviar:", completeData);
      
      // Verificar que tenemos un usuario autenticado
      if (!user) {
        toast({
          title: "No se puede crear el documento",
          description: "Su sesión ha expirado. Por favor, inicie sesión nuevamente.",
          variant: "destructive",
        });
        setLocation("/auth");
        return;
      }
      
      // Crear el documento
      createDocumentMutation.mutate(completeData);
    })();
  };

  if (user?.role !== "admin") {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Acceso denegado</AlertTitle>
          <AlertDescription>
            Solo los administradores pueden acceder a esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (categoriesLoading || templatesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-2 text-lg">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/admin-dashboard")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al dashboard
        </Button>
        <h1 className="text-3xl font-bold">Generador de Documentos de Prueba</h1>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-500">
          Esta herramienta permite a los administradores generar documentos de prueba con firma avanzada sin costo usando el código 7723.
        </p>
        <Badge variant="outline" className="mt-2 bg-yellow-50">Código de Prueba: 7723</Badge>
      </div>

      {isSuccess && verificationCode ? (
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center">
              <CheckCircle2 className="h-6 w-6 text-green-500 mr-2" />
              <CardTitle>Documento generado exitosamente</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>El documento ha sido creado y firmado correctamente con firma avanzada.</p>
              
              <div className="bg-white p-4 rounded-md border border-green-200">
                <p className="font-semibold mb-2">Código de verificación:</p>
                <p className="text-xl font-mono">{verificationCode}</p>
              </div>
              
              <p className="text-sm text-green-700">
                Este código puede ser usado para verificar la autenticidad del documento en la plataforma.
              </p>
              
              <div className="flex space-x-4 mt-4">
                <Button 
                  onClick={() => setLocation(`/document-view/${selectedTemplate?.id}`)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Ver documento
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsSuccess(false);
                    setVerificationCode(null);
                    form.reset({
                      templateId: "",
                      title: "",
                      testCode: "7723",
                    });
                    dynamicForm.reset();
                    setSelectedTemplateId(null);
                    setSelectedTemplate(null);
                  }}
                >
                  Generar otro documento
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Selección de plantilla</CardTitle>
                <CardDescription>Seleccione una plantilla para generar un documento de prueba</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="templateId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plantilla de documento</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione una plantilla" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category: any) => (
                                <div key={category.id}>
                                  <h4 className="font-semibold px-2 py-1.5 text-sm text-gray-500">
                                    {category.name}
                                  </h4>
                                  {activeTemplates
                                    .filter((template: any) => template.categoryId === category.id)
                                    .map((template: any) => (
                                      <SelectItem key={template.id} value={template.id.toString()}>
                                        {template.name}
                                      </SelectItem>
                                    ))}
                                </div>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título del documento</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Un título descriptivo para el documento.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="testCode"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-2">
                            <FormLabel>Código de prueba</FormLabel>
                            {field.value === "7723" && (
                              <Badge variant="outline" className="bg-green-50 text-green-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Válido
                              </Badge>
                            )}
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} value="7723" readOnly />
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Código especial predefinido que permite crear y firmar documentos sin costo.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {selectedTemplate && formSchema && (
                      <>
                        <Separator className="my-6" />
                        <div>
                          <h3 className="text-lg font-medium mb-4">Datos del documento</h3>
                          
                          <Form {...dynamicForm}>
                            <div className="space-y-4">
                              {Object.entries(formSchema.properties).map(([key, prop]: [string, any]) => (
                                <FormField
                                  key={key}
                                  control={dynamicForm.control}
                                  name={key}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{prop.title || key}</FormLabel>
                                      <FormControl>
                                        {prop.type === "string" && prop.format === "date" ? (
                                          <Input {...field} type="date" />
                                        ) : prop.type === "string" && prop.maxLength && prop.maxLength > 80 ? (
                                          <Textarea {...field} />
                                        ) : prop.enum ? (
                                          <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                          >
                                            <FormControl>
                                              <SelectTrigger>
                                                <SelectValue placeholder={`Seleccione ${prop.title || key}`} />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              {prop.enum.map((option: string) => (
                                                <SelectItem key={option} value={option}>
                                                  {option}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        ) : (
                                          <Input {...field} type={prop.type === "number" ? "number" : "text"} />
                                        )}
                                      </FormControl>
                                      {prop.description && (
                                        <FormDescription>{prop.description}</FormDescription>
                                      )}
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                          </Form>
                        </div>
                      </>
                    )}
                    
                    <div className="pt-6">
                      <Button 
                        type="submit" 
                        disabled={!selectedTemplate || createDocumentMutation.isPending}
                        className="w-full"
                      >
                        {createDocumentMutation.isPending ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando documento...</>
                        ) : (
                          <><FileText className="mr-2 h-4 w-4" /> Generar y firmar documento</>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Información de la plantilla</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTemplate ? (
                  <>
                    <h3 className="font-semibold text-lg">{selectedTemplate.name}</h3>
                    <p className="text-sm text-gray-500 mt-2">{selectedTemplate.description}</p>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex items-center mt-4">
                      <FileText className="h-5 w-5 mr-2 text-primary" />
                      <p className="text-sm">Este documento será generado y firmado automáticamente.</p>
                    </div>
                    
                    <div className="mt-6">
                      <p className="font-semibold">Precio normal</p>
                      <p className="text-2xl font-bold">${selectedTemplate.price / 100}</p>
                      <Badge className="mt-2 bg-red-50 text-red-600">
                        GRATIS (Código 7723)
                      </Badge>
                    </div>
                    
                    <div className="mt-6 bg-blue-50 p-4 rounded-md">
                      <h4 className="font-medium text-blue-700">Información importante</h4>
                      <p className="text-sm text-blue-600 mt-2">
                        Esta herramienta es solo para administradores. Los documentos generados
                        tendrán validez legal completa pero están marcados como generados por un 
                        administrador con el código de prueba 7723.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Seleccione una plantilla para ver su información</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}