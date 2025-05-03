/**
 * Formulario de subida de documentos al sistema unificado
 * 
 * Este componente permite a los usuarios subir nuevos documentos al sistema centralizado
 * de gestión documental, ya sea para documentos generales o notariales.
 */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Loader2, 
  Upload, 
  FileText, 
  FilePlus, 
  AlertCircle,
  ArrowLeft,
  Shield, 
  User, 
  FileCheck,
  BadgeDollarSign
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Esquema de validación para documentos generales
const documentSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Debe seleccionar una categoría"),
  file: z.any()
    .refine(file => file && file.length > 0, "Debe seleccionar un archivo")
    .refine(
      file => file && file[0] && file[0].size <= 10 * 1024 * 1024, 
      "El archivo debe ser menor a 10MB"
    )
    .refine(
      file => {
        if (!file || !file[0]) return true;
        const acceptedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];
        return acceptedTypes.includes(file[0].type);
      },
      "El formato de archivo no es soportado. Use PDF o documentos de Office"
    ),
  tags: z.string().optional()
});

// Esquema de validación para documentos notariales
const notaryDocumentSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  documentType: z.enum(["declaracion_jurada", "poder_simple", "autorizacion", "certificado", "otro"], {
    required_error: "Debe seleccionar un tipo de documento"
  }),
  urgency: z.enum(["low", "normal", "high", "urgent"], {
    required_error: "Debe seleccionar un nivel de urgencia"
  }).default("normal"),
  file: z.any()
    .refine(file => file && file.length > 0, "Debe seleccionar un archivo")
    .refine(
      file => file && file[0] && file[0].size <= 15 * 1024 * 1024, 
      "El archivo debe ser menor a 15MB"
    )
    .refine(
      file => {
        if (!file || !file[0]) return true;
        const acceptedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png'
        ];
        return acceptedTypes.includes(file[0].type);
      },
      "El formato de archivo no es soportado. Use PDF, Word o imágenes"
    ),
  requireCertification: z.boolean().default(true)
});

// Obtener el icono correcto según el tipo de documento
const getDocumentTypeIcon = (documentType: string) => {
  switch (documentType) {
    case "declaracion_jurada":
      return <Shield className="h-4 w-4" />;
    case "poder_simple":
      return <User className="h-4 w-4" />;
    case "autorizacion":
      return <FileCheck className="h-4 w-4" />;
    case "certificado":
      return <BadgeDollarSign className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

export default function DocumentUpload() {
  const [selectedTab, setSelectedTab] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Consultar categorías de documentos
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ["/api/document-management/categories"],
    queryFn: async () => {
      const res = await fetch("/api/document-management/categories");
      if (!res.ok) throw new Error("Error al cargar categorías");
      return res.json();
    }
  });
  
  // Formulario para documentos generales
  const generalForm = useForm<z.infer<typeof documentSchema>>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      tags: ""
    }
  });
  
  // Formulario para documentos notariales
  const notaryForm = useForm<z.infer<typeof notaryDocumentSchema>>({
    resolver: zodResolver(notaryDocumentSchema),
    defaultValues: {
      title: "",
      description: "",
      documentType: "declaracion_jurada",
      urgency: "normal",
      requireCertification: true
    }
  });
  
  // Mutación para subir documento general
  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/document-management/documents", {
        method: "POST",
        body: data
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al subir documento");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/document-management/documents"] });
      toast({
        title: "Documento subido exitosamente",
        description: "Tu documento ha sido almacenado en el sistema",
        variant: "default",
      });
      setLocation("/document-explorer");
    },
    onError: (error: Error) => {
      toast({
        title: "Error al subir documento",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });
  
  // Mutación para subir documento notarial
  const uploadNotaryDocumentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/notary-documents/upload", {
        method: "POST",
        body: data
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al subir documento notarial");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notary-documents/my-documents"] });
      toast({
        title: "Documento notarial enviado exitosamente",
        description: "Tu documento ha sido enviado para certificación",
        variant: "default",
      });
      setLocation("/document-explorer");
    },
    onError: (error: Error) => {
      toast({
        title: "Error al subir documento notarial",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });
  
  // Manejar envío de formulario general
  const onSubmitGeneral = (values: z.infer<typeof documentSchema>) => {
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("categoryId", values.categoryId);
    
    if (values.description) {
      formData.append("description", values.description);
    }
    
    if (values.tags) {
      formData.append("tags", values.tags);
    }
    
    if (values.file && values.file.length > 0) {
      formData.append("file", values.file[0]);
    }
    
    uploadDocumentMutation.mutate(formData);
  };
  
  // Manejar envío de formulario notarial
  const onSubmitNotarial = (values: z.infer<typeof notaryDocumentSchema>) => {
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("documentType", values.documentType);
    formData.append("urgency", values.urgency);
    
    if (values.description) {
      formData.append("description", values.description);
    }
    
    formData.append("requireCertification", values.requireCertification ? "true" : "false");
    
    if (values.file && values.file.length > 0) {
      formData.append("file", values.file[0]);
    }
    
    uploadNotaryDocumentMutation.mutate(formData);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/document-explorer">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al explorador
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-indigo-900">
          Subir Nuevo Documento
        </h1>
        <p className="text-gray-500">
          Añade un nuevo documento al sistema centralizado de gestión documental
        </p>
      </div>
      
      <Tabs 
        value={selectedTab} 
        onValueChange={setSelectedTab}
        className="w-full max-w-3xl mx-auto"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general" disabled={isSubmitting}>
            <FileText className="mr-2 h-4 w-4" />
            Documento General
          </TabsTrigger>
          <TabsTrigger value="notarial" disabled={isSubmitting}>
            <FilePlus className="mr-2 h-4 w-4" />
            Documento Notarial
          </TabsTrigger>
        </TabsList>
        
        {/* Formulario de documento general */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Subir Documento General</CardTitle>
              <CardDescription>
                Sube un documento general al sistema central de documentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form onSubmit={generalForm.handleSubmit(onSubmitGeneral)} className="space-y-6">
                  <FormField
                    control={generalForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del documento</FormLabel>
                        <FormControl>
                          <Input placeholder="Ingrese un título descriptivo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={generalForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción (opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ingrese una descripción breve del documento"
                            className="resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={generalForm.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione una categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loadingCategories ? (
                              <div className="flex items-center justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="ml-2">Cargando categorías...</span>
                              </div>
                            ) : categories && categories.length > 0 ? (
                              categories.map((category: any) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-gray-500">No hay categorías disponibles</div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={generalForm.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Etiquetas (opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Separadas por comas, ej: contrato, comercial, 2025"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Añade etiquetas para facilitar la búsqueda posteriormente
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={generalForm.control}
                    name="file"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Archivo</FormLabel>
                        <FormControl>
                          <Input
                            {...fieldProps}
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                            onChange={(e) => onChange(e.target.files)}
                          />
                        </FormControl>
                        <FormDescription>
                          Formatos aceptados: PDF, Word, Excel, PowerPoint (máx. 10MB)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <CardFooter className="flex justify-end gap-4 px-0">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setLocation("/document-explorer")}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Subir Documento
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Formulario de documento notarial */}
        <TabsContent value="notarial">
          <Card>
            <CardHeader>
              <CardTitle>Subir Documento Notarial</CardTitle>
              <CardDescription>
                Sube un documento para certificación notarial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Importante</AlertTitle>
                <AlertDescription>
                  Los documentos notariales son enviados para certificación y requieren revisión
                  por un certificador autorizado. El proceso puede tomar hasta 24 horas hábiles.
                </AlertDescription>
              </Alert>
              
              <Form {...notaryForm}>
                <form onSubmit={notaryForm.handleSubmit(onSubmitNotarial)} className="space-y-6">
                  <FormField
                    control={notaryForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del documento</FormLabel>
                        <FormControl>
                          <Input placeholder="Ingrese un título descriptivo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notaryForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción (opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ingrese una descripción breve del documento"
                            className="resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={notaryForm.control}
                      name="documentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de documento</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="declaracion_jurada">
                                <div className="flex items-center">
                                  <Shield className="mr-2 h-4 w-4 text-indigo-600" />
                                  Declaración Jurada
                                </div>
                              </SelectItem>
                              <SelectItem value="poder_simple">
                                <div className="flex items-center">
                                  <User className="mr-2 h-4 w-4 text-indigo-600" />
                                  Poder Simple
                                </div>
                              </SelectItem>
                              <SelectItem value="autorizacion">
                                <div className="flex items-center">
                                  <FileCheck className="mr-2 h-4 w-4 text-indigo-600" />
                                  Autorización
                                </div>
                              </SelectItem>
                              <SelectItem value="certificado">
                                <div className="flex items-center">
                                  <BadgeDollarSign className="mr-2 h-4 w-4 text-indigo-600" />
                                  Certificado
                                </div>
                              </SelectItem>
                              <SelectItem value="otro">
                                <div className="flex items-center">
                                  <FileText className="mr-2 h-4 w-4 text-indigo-600" />
                                  Otro tipo
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notaryForm.control}
                      name="urgency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nivel de urgencia</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione la urgencia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Baja</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">Alta</SelectItem>
                              <SelectItem value="urgent">Urgente</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Mayor urgencia puede implicar costos adicionales
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={notaryForm.control}
                    name="file"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Archivo</FormLabel>
                        <FormControl>
                          <Input
                            {...fieldProps}
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => onChange(e.target.files)}
                          />
                        </FormControl>
                        <FormDescription>
                          Formatos aceptados: PDF, Word, JPG, PNG (máx. 15MB)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notaryForm.control}
                    name="requireCertification"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Requiere certificación</FormLabel>
                          <FormDescription>
                            Marque esta opción si desea que el documento sea certificado por un funcionario autorizado
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <CardFooter className="flex justify-end gap-4 px-0">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setLocation("/document-explorer")}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Enviar para certificación
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}