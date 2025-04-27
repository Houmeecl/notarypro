import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { InsertDocumentTemplate, DocumentTemplate } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// Define esquema de formulario para el JSON Schema
const formSchemaPropertySchema = z.object({
  type: z.enum(["string", "number", "boolean", "date"]),
  title: z.string().min(1, "Título es requerido"),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  multiline: z.boolean().default(false),
  order: z.number().min(0).default(0),
  format: z.string().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  minimum: z.number().optional(),
  maximum: z.number().optional(),
});

type FormSchemaProperty = z.infer<typeof formSchemaPropertySchema>;

// Schema para la plantilla completa
const templateFormSchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Categoría es requerida"),
  price: z.number().min(0, "El precio no puede ser negativo"),
  htmlTemplate: z.string().min(1, "Plantilla HTML es requerida"),
  active: z.boolean().default(true),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

interface TemplateEditorProps {
  template?: DocumentTemplate;
  categories: { id: number; name: string }[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TemplateEditor({ template, categories, onSuccess, onCancel }: TemplateEditorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [properties, setProperties] = useState<Record<string, FormSchemaProperty>>({});
  const [newFieldOpen, setNewFieldOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [editingPropertyKey, setEditingPropertyKey] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");

  // Formulario principal para la plantilla
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: template
      ? {
          name: template.name,
          description: template.description || "",
          categoryId: template.categoryId.toString(),
          price: template.price / 100, // Convertir de centavos a pesos
          htmlTemplate: template.htmlTemplate,
          active: template.active,
        }
      : {
          name: "",
          description: "",
          categoryId: "",
          price: 0,
          htmlTemplate: defaultHtmlTemplate,
          active: true,
        },
  });

  // Formulario para agregar/editar propiedades
  const propertyForm = useForm<FormSchemaProperty>({
    resolver: zodResolver(formSchemaPropertySchema),
    defaultValues: {
      type: "string",
      title: "",
      description: "",
      placeholder: "",
      required: false,
      multiline: false,
      order: Object.keys(properties).length,
      format: "",
      minLength: undefined,
      maxLength: undefined,
      minimum: undefined,
      maximum: undefined,
    },
  });

  // Al cargar el componente, inicializamos las propiedades desde el template
  useEffect(() => {
    if (template?.formSchema) {
      const schema = template.formSchema as any;
      const props: Record<string, FormSchemaProperty> = {};
      
      // Convertir el JSON Schema a nuestro formato de propiedades
      Object.entries(schema.properties || {}).forEach(([key, value]: [string, any]) => {
        const isRequired = schema.required && schema.required.includes(key);
        props[key] = {
          type: value.type || "string",
          title: value.title || key,
          description: value.description || "",
          placeholder: value.placeholder || "",
          required: isRequired,
          multiline: value.multiline || false,
          order: value.order || 0,
          format: value.format || "",
          minLength: value.minLength,
          maxLength: value.maxLength,
          minimum: value.minimum,
          maximum: value.maximum,
        };
      });
      
      setProperties(props);
    }
  }, [template]);

  // Actualizar la vista previa cuando cambia el html
  useEffect(() => {
    const html = form.watch("htmlTemplate");
    let preview = html;
    
    // Reemplazar los marcadores con ejemplos
    Object.entries(properties).forEach(([key, prop]) => {
      const placeholder = `{${key}}`;
      let example = "";
      
      switch (prop.type) {
        case "string":
          example = prop.title;
          break;
        case "number":
          example = "123";
          break;
        case "boolean":
          example = "Sí";
          break;
        case "date":
          example = "01/01/2024";
          break;
        default:
          example = prop.title;
      }
      
      preview = preview.replace(new RegExp(placeholder, "g"), `<span class="text-blue-500">${example}</span>`);
    });
    
    setPreviewHtml(preview);
  }, [form.watch("htmlTemplate"), properties]);

  // Crear una nueva plantilla o actualizar una existente
  const saveTemplateMutation = useMutation({
    mutationFn: async (data: TemplateFormValues) => {
      // Crear el JSON Schema a partir de las propiedades
      const formSchema = {
        type: "object",
        properties: {},
        required: [],
      };
      
      // Ordenar las propiedades por su orden
      const sortedProperties = Object.entries(properties).sort((a, b) => a[1].order - b[1].order);
      
      sortedProperties.forEach(([key, prop]) => {
        (formSchema.properties as any)[key] = {
          type: prop.type,
          title: prop.title,
          description: prop.description,
          placeholder: prop.placeholder,
          multiline: prop.multiline,
          order: prop.order,
        };
        
        if (prop.type === "string") {
          if (prop.format) {
            (formSchema.properties as any)[key].format = prop.format;
          }
          if (prop.minLength !== undefined) {
            (formSchema.properties as any)[key].minLength = prop.minLength;
          }
          if (prop.maxLength !== undefined) {
            (formSchema.properties as any)[key].maxLength = prop.maxLength;
          }
        } else if (prop.type === "number") {
          if (prop.minimum !== undefined) {
            (formSchema.properties as any)[key].minimum = prop.minimum;
          }
          if (prop.maximum !== undefined) {
            (formSchema.properties as any)[key].maximum = prop.maximum;
          }
        }
        
        if (prop.required) {
          (formSchema.required as string[]).push(key);
        }
      });
      
      // Convertir el precio de pesos a centavos
      const priceInCents = Math.round(data.price * 100);
      
      const templateData: Partial<InsertDocumentTemplate> = {
        name: data.name,
        description: data.description,
        categoryId: parseInt(data.categoryId),
        price: priceInCents,
        htmlTemplate: data.htmlTemplate,
        formSchema,
        active: data.active,
      };
      
      if (template) {
        // Actualizar plantilla existente
        const response = await apiRequest("PATCH", `/api/document-templates/${template.id}`, templateData);
        return await response.json();
      } else {
        // Crear nueva plantilla
        const response = await apiRequest("POST", "/api/document-templates", templateData);
        return await response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: template ? "Plantilla actualizada" : "Plantilla creada",
        description: template 
          ? "La plantilla ha sido actualizada correctamente." 
          : "La plantilla ha sido creada correctamente.",
      });
      
      // Invalidar la caché para actualizar las listas
      queryClient.invalidateQueries({ queryKey: ['/api/document-templates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/document-categories'] });
      
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al guardar la plantilla.",
        variant: "destructive",
      });
    },
  });

  // Agregar una nueva propiedad
  const addProperty = (data: FormSchemaProperty) => {
    // Generar una clave para la propiedad basada en su título
    const key = generatePropertyKey(data.title);
    
    if (editingPropertyKey && editingPropertyKey !== key) {
      // Estamos renombrando la propiedad, eliminar la anterior
      const newProperties = { ...properties };
      newProperties[key] = data;
      delete newProperties[editingPropertyKey];
      setProperties(newProperties);
    } else {
      // Actualizar o agregar la propiedad
      setProperties({
        ...properties,
        [key]: data,
      });
    }
    
    setNewFieldOpen(false);
    setEditingPropertyKey(null);
    propertyForm.reset();
  };

  // Editar una propiedad existente
  const editProperty = (key: string) => {
    const property = properties[key];
    
    if (property) {
      propertyForm.reset(property);
      setEditingPropertyKey(key);
      setSelectedProperty(key);
      setNewFieldOpen(true);
    }
  };

  // Eliminar una propiedad
  const deleteProperty = (key: string) => {
    const newProperties = { ...properties };
    delete newProperties[key];
    setProperties(newProperties);
    
    if (selectedProperty === key) {
      setSelectedProperty(null);
    }
  };

  // Generar una clave para la propiedad a partir de su título
  const generatePropertyKey = (title: string): string => {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
      
    // Si estamos editando, mantener la misma clave
    if (editingPropertyKey && editingPropertyKey !== base) {
      return editingPropertyKey;
    }
    
    // Verificar si ya existe esta clave
    if (properties[base] && !editingPropertyKey) {
      // Buscar la siguiente clave disponible
      let i = 1;
      while (properties[`${base}_${i}`]) {
        i++;
      }
      return `${base}_${i}`;
    }
    
    return base;
  };

  // Guardar la plantilla
  const onSubmit = (data: TemplateFormValues) => {
    if (Object.keys(properties).length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un campo al formulario.",
        variant: "destructive",
      });
      setActiveTab("schema");
      return;
    }
    
    saveTemplateMutation.mutate(data);
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="details">Detalles de la plantilla</TabsTrigger>
          <TabsTrigger value="schema">Formulario</TabsTrigger>
          <TabsTrigger value="template">Plantilla HTML</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Detalles de la plantilla</CardTitle>
                  <CardDescription>
                    Información básica sobre la plantilla de documento.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ej. Contrato de arrendamiento" />
                        </FormControl>
                        <FormDescription>
                          Nombre descriptivo para la plantilla.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Ej. Plantilla para generar contratos de arrendamiento estándar." 
                          />
                        </FormControl>
                        <FormDescription>
                          Breve descripción del propósito de esta plantilla.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select 
                          defaultValue={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Categoría a la que pertenece esta plantilla.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio (CLP)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            step="0.01"
                            min="0"
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Precio en pesos chilenos para el uso de esta plantilla.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Activa</FormLabel>
                          <FormDescription>
                            Determina si esta plantilla está disponible para los usuarios.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="schema">
              <Card>
                <CardHeader>
                  <CardTitle>Formulario de datos</CardTitle>
                  <CardDescription>
                    Define los campos que los usuarios deberán completar para generar el documento.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Campos del formulario</h3>
                      <Dialog open={newFieldOpen} onOpenChange={setNewFieldOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            onClick={() => {
                              propertyForm.reset({
                                type: "string",
                                title: "",
                                description: "",
                                placeholder: "",
                                required: false,
                                multiline: false,
                                order: Object.keys(properties).length,
                                format: "",
                                minLength: undefined,
                                maxLength: undefined,
                                minimum: undefined,
                                maximum: undefined,
                              });
                              setEditingPropertyKey(null);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar campo
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle>
                              {editingPropertyKey ? "Editar campo" : "Agregar nuevo campo"}
                            </DialogTitle>
                            <DialogDescription>
                              Define las propiedades del campo que se mostrará en el formulario.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <Form {...propertyForm}>
                            <form className="space-y-4" onSubmit={propertyForm.handleSubmit(addProperty)}>
                              <FormField
                                control={propertyForm.control}
                                name="title"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="Ej. Nombre completo" />
                                    </FormControl>
                                    <FormDescription>
                                      Título que verá el usuario para este campo.
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={propertyForm.control}
                                name="type"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Tipo de dato</FormLabel>
                                    <Select 
                                      defaultValue={field.value} 
                                      onValueChange={field.onChange}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Seleccionar tipo" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="string">Texto</SelectItem>
                                        <SelectItem value="number">Número</SelectItem>
                                        <SelectItem value="date">Fecha</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={propertyForm.control}
                                name="description"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="Ej. Ingrese su nombre completo según aparece en su documento de identidad" />
                                    </FormControl>
                                    <FormDescription>
                                      Instrucciones adicionales para el usuario.
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={propertyForm.control}
                                name="placeholder"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Placeholder</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="Ej. Juan Pérez González" />
                                    </FormControl>
                                    <FormDescription>
                                      Texto de ejemplo que se mostrará en el campo.
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              {propertyForm.watch("type") === "string" && (
                                <>
                                  <FormField
                                    control={propertyForm.control}
                                    name="multiline"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                          <FormLabel className="text-base">Multilinea</FormLabel>
                                          <FormDescription>
                                            Habilita un área de texto para ingresar múltiples líneas.
                                          </FormDescription>
                                        </div>
                                        <FormControl>
                                          <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={propertyForm.control}
                                    name="format"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Formato</FormLabel>
                                        <Select 
                                          defaultValue={field.value} 
                                          onValueChange={field.onChange}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Seleccionar formato (opcional)" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="">Ninguno</SelectItem>
                                            <SelectItem value="email">Email</SelectItem>
                                            <SelectItem value="date">Fecha</SelectItem>
                                            <SelectItem value="time">Hora</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormDescription>
                                          Formato especial para el campo.
                                        </FormDescription>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                      control={propertyForm.control}
                                      name="minLength"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Longitud mínima</FormLabel>
                                          <FormControl>
                                            <Input 
                                              type="number" 
                                              min="0"
                                              value={field.value || ""}
                                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={propertyForm.control}
                                      name="maxLength"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Longitud máxima</FormLabel>
                                          <FormControl>
                                            <Input 
                                              type="number" 
                                              min="0"
                                              value={field.value || ""}
                                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </>
                              )}
                              
                              {propertyForm.watch("type") === "number" && (
                                <div className="grid grid-cols-2 gap-4">
                                  <FormField
                                    control={propertyForm.control}
                                    name="minimum"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Valor mínimo</FormLabel>
                                        <FormControl>
                                          <Input 
                                            type="number"
                                            value={field.value || ""}
                                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={propertyForm.control}
                                    name="maximum"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Valor máximo</FormLabel>
                                        <FormControl>
                                          <Input 
                                            type="number"
                                            value={field.value || ""}
                                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              )}
                              
                              <FormField
                                control={propertyForm.control}
                                name="required"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">Requerido</FormLabel>
                                      <FormDescription>
                                        El usuario deberá completar este campo.
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setNewFieldOpen(false)}>
                                  Cancelar
                                </Button>
                                <Button type="submit">
                                  {editingPropertyKey ? "Actualizar campo" : "Agregar campo"}
                                </Button>
                              </DialogFooter>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    {Object.keys(properties).length === 0 ? (
                      <div className="rounded-lg border border-dashed p-6 text-center">
                        <p className="text-gray-500">
                          No hay campos definidos. Haga clic en "Agregar campo" para comenzar.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(properties)
                          .sort(([, a], [, b]) => a.order - b.order)
                          .map(([key, property]) => (
                            <div 
                              key={key} 
                              className={`rounded-lg border p-4 ${selectedProperty === key ? "border-primary" : "border-gray-200"}`}
                              onClick={() => setSelectedProperty(key)}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium">{property.title}</h4>
                                  <p className="text-sm text-gray-500">{key}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline">
                                    {property.type === "string" ? "Texto" : 
                                     property.type === "number" ? "Número" : 
                                     property.type === "boolean" ? "Booleano" : 
                                     property.type === "date" ? "Fecha" : property.type}
                                  </Badge>
                                  {property.required && (
                                    <Badge>Requerido</Badge>
                                  )}
                                  {property.multiline && (
                                    <Badge variant="secondary">Multilinea</Badge>
                                  )}
                                </div>
                              </div>
                              
                              {property.description && (
                                <p className="text-sm text-gray-600 mb-2">{property.description}</p>
                              )}
                              
                              <div className="flex justify-end space-x-2 mt-2">
                                <Button size="sm" variant="ghost" onClick={() => editProperty(key)}>
                                  Editar
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => deleteProperty(key)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">En tu plantilla HTML, usa marcadores así:</h4>
                      <div className="rounded-lg bg-secondary/10 p-4">
                        <code className="text-sm">
                          {Object.keys(properties).map((key) => (
                            <div key={key} className="mb-1">
                              <span className="text-primary">{`{${key}}`}</span> - {properties[key].title}
                            </div>
                          ))}
                        </code>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="template">
              <Card>
                <CardHeader>
                  <CardTitle>Plantilla HTML</CardTitle>
                  <CardDescription>
                    Defina el formato y contenido del documento generado usando marcadores para los campos dinámicos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="htmlTemplate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código HTML</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              className="font-mono h-80"
                            />
                          </FormControl>
                          <FormDescription>
                            Use marcadores como <code className="text-primary">{"{nombre_campo}"}</code> para insertar campos dinámicos.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Vista previa</h3>
                      <div className="border rounded-lg p-4 bg-white">
                        <div dangerouslySetInnerHTML={{ __html: previewHtml }} className="prose max-w-none" />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saveTemplateMutation.isPending}>
                    {saveTemplateMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
                    ) : (
                      <><Save className="mr-2 h-4 w-4" /> Guardar plantilla</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}

// Plantilla HTML por defecto
const defaultHtmlTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Documento</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 40px;
      color: #333;
    }
    h1, h2 {
      color: #EC1C24;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 20px;
    }
    .content {
      margin-bottom: 40px;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 0.8em;
      color: #666;
      border-top: 1px solid #ddd;
      padding-top: 20px;
    }
    .signature-area {
      margin-top: 80px;
      display: flex;
      justify-content: space-between;
    }
    .signature-line {
      width: 45%;
      border-top: 1px solid #000;
      padding-top: 10px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>DOCUMENTO OFICIAL</h1>
    <p>Generado por NotaryPro Chile</p>
  </div>
  
  <div class="content">
    <h2>DECLARACIÓN</h2>
    
    <p>En Santiago de Chile, a <strong>[fecha actual]</strong>, comparece:</p>
    
    <p><strong>{nombre_completo}</strong>, de nacionalidad {nacionalidad}, cédula de identidad número {rut}, con domicilio en {domicilio}, quien declara lo siguiente:</p>
    
    <p>{declaracion}</p>
    
    <p>Para constancia firma:</p>
    
    <div class="signature-area">
      <div class="signature-line">
        {nombre_completo}<br>
        C.I. {rut}
      </div>
      
      <div class="signature-line">
        NotaryPro Chile<br>
        Certificación Digital
      </div>
    </div>
  </div>
  
  <div class="footer">
    <p>Este documento ha sido generado electrónicamente y cuenta con validez legal según la Ley 19.799 sobre Documentos Electrónicos y Firma Electrónica.</p>
    <p>Puede verificar la autenticidad de este documento en www.notarypro.cl/verificar</p>
  </div>
</body>
</html>`;