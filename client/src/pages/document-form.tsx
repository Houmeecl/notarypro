import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Loader2, ArrowLeft, FileText, Save, CheckCircle } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DocumentTemplate } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DocumentNavbar from "@/components/layout/DocumentNavbar";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/lib/route-utils";

// Definir tipos para el esquema de formulario
type FormSchemaProperty = {
  type: string;
  title: string;
  format?: string;
  multiline?: boolean;
  placeholder?: string;
  description?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
};

export default function DocumentFormPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/document-form/:templateId");
  const templateId = params?.templateId;
  const [formSchema, setFormSchema] = useState<any>(null);
  
  // Obtener información del usuario si está autenticado, pero no requerirla
  const { user, isLoading: authLoading } = useAuth();
  
  // Si está cargando la autenticación, mostrar loading spinner
  if (authLoading) {
    return <LoadingSpinner />;
  }

  const { data: template, isLoading: templateLoading, error } = useQuery<DocumentTemplate>({
    queryKey: ['/api/document-templates', templateId],
    enabled: !!templateId, // No requerimos que user esté presente
  });

  useEffect(() => {
    if (template?.formSchema) {
      setFormSchema(template.formSchema);
    }
  }, [template]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la plantilla de documento.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Dinámicamente creamos el schema ZOD basado en el formSchema de la plantilla
  const generateZodSchema = () => {
    if (!formSchema) return z.object({});

    // Definir el tipo para el objeto de propiedades del formulario
    type FormSchemaProperty = {
      type: string;
      title: string;
      format?: string;
      multiline?: boolean;
      placeholder?: string;
      description?: string;
      minimum?: number;
      maximum?: number;
      minLength?: number;
      maxLength?: number;
    };

    const schemaObject: Record<string, z.ZodTypeAny> = {};
    
    // Recorrer las propiedades del formSchema con tipado seguro
    if (formSchema.properties && typeof formSchema.properties === 'object') {
      Object.entries(formSchema.properties as Record<string, FormSchemaProperty>).forEach(([key, property]) => {
        // Determinar el tipo de validación según el tipo de propiedad
        let fieldSchema: z.ZodTypeAny = z.string();
        
        if (property.type === "number") {
          fieldSchema = z.number();
          // Si hay mensajes de error personalizados, agregar
          if (property.minimum !== undefined) {
            fieldSchema = fieldSchema.gte(property.minimum, `Debe ser mayor o igual a ${property.minimum}`);
          }
          if (property.maximum !== undefined) {
            fieldSchema = fieldSchema.lte(property.maximum, `Debe ser menor o igual a ${property.maximum}`);
          }
        } else if (property.type === "string") {
          if (property.format === "date") {
            fieldSchema = z.string();
          } else if (property.format === "email") {
            fieldSchema = z.string().email("Correo electrónico inválido");
          } else {
            fieldSchema = z.string();
            if (property.minLength !== undefined) {
              fieldSchema = fieldSchema.min(property.minLength, `Debe tener al menos ${property.minLength} caracteres`);
            }
            if (property.maxLength !== undefined) {
              fieldSchema = fieldSchema.max(property.maxLength, `Debe tener como máximo ${property.maxLength} caracteres`);
            }
          }
        }
        
        // Si el campo es requerido, lo hacemos obligatorio
        const isRequired = formSchema.required && Array.isArray(formSchema.required) && formSchema.required.includes(key);
        schemaObject[key] = isRequired ? fieldSchema : fieldSchema.optional();
      });
    }
    
    return z.object(schemaObject);
  };

  const zodSchema = generateZodSchema();
  
  // Utilizamos tipado genérico para evitar problemas con never
  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: {},
  });

  const createDocumentMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      if (!template || !templateId) throw new Error("Plantilla no disponible");
      
      const documentData = {
        title: `${template.name} - ${new Date().toLocaleDateString()}`,
        templateId: parseInt(templateId),
        formData: data
      };
      
      const response = await apiRequest("POST", "/api/documents", documentData);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Documento creado",
        description: "El documento ha sido creado correctamente.",
      });
      // Redirigir al usuario a la página del documento
      setLocation(`/documents/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el documento.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: z.infer<typeof zodSchema>) => {
    if (!template || !templateId) {
      toast({
        title: "Error",
        description: "No se pudo obtener la información de la plantilla.",
        variant: "destructive",
      });
      return;
    }
    
    createDocumentMutation.mutate(data);
  };

  if (templateLoading || !formSchema) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-2 text-lg">Cargando formulario...</p>
      </div>
    );
  }

  return (
    <>
      <DocumentNavbar />
      <div className="container mx-auto py-8">
        <div 
          onClick={() => setLocation(`/document-templates/${template?.categoryId}`)}
          className="flex items-center text-primary mb-6 hover:underline cursor-pointer"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a plantillas
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Completa la información</CardTitle>
                <CardDescription>
                  Por favor llena los campos solicitados para generar tu documento.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {formSchema && Object.entries(formSchema.properties as Record<string, any>).map(([key, value]) => (
                      <FormField
                        key={key}
                        control={form.control}
                        name={key}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{value.title}</FormLabel>
                            <FormControl>
                              {value.type === "string" && value.format !== "date" && !value.multiline ? (
                                <Input 
                                  {...field} 
                                  placeholder={value.placeholder || `Ingrese ${value.title.toLowerCase()}`} 
                                />
                              ) : value.type === "string" && value.multiline ? (
                                <Textarea 
                                  {...field} 
                                  placeholder={value.placeholder || `Ingrese ${value.title.toLowerCase()}`} 
                                />
                              ) : value.type === "string" && value.format === "date" ? (
                                <Input 
                                  {...field} 
                                  type="date" 
                                />
                              ) : value.type === "number" ? (
                                <Input 
                                  {...field} 
                                  type="number" 
                                  placeholder={value.placeholder || `Ingrese ${value.title.toLowerCase()}`}
                                  onChange={e => field.onChange(parseFloat(e.target.value))}
                                />
                              ) : (
                                <Input {...field} />
                              )}
                            </FormControl>
                            {value.description && (
                              <FormDescription>{value.description}</FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={createDocumentMutation.isPending}
                    >
                      {createDocumentMutation.isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando documento...</>
                      ) : (
                        <><Save className="mr-2 h-4 w-4" /> Generar documento</>
                      )}
                    </Button>
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
                <h3 className="font-semibold text-lg">{template?.name}</h3>
                <p className="text-sm text-gray-500 mt-2">{template?.description}</p>
                
                <Separator className="my-4" />
                
                <div className="flex items-center mt-4">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  <p className="text-sm">Este documento será generado automáticamente.</p>
                </div>
                
                <div className="mt-6">
                  <p className="font-semibold">Precio</p>
                  <p className="text-2xl font-bold text-primary">${template?.price ? template.price / 100 : 0}</p>
                </div>
                
                <div className="mt-6 space-y-2">
                  <p className="font-semibold">Instrucciones:</p>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <p className="text-sm">Complete todos los campos requeridos.</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <p className="text-sm">Verifique que la información sea correcta antes de enviar.</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <p className="text-sm">Después de generar, podrá firmar el documento digitalmente.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}