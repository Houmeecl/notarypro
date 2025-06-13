import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FolderPlus, 
  Loader2, 
  Palette, 
  FolderArchive, 
  FolderCheck, 
  FolderInput 
} from "lucide-react";

// Schema de validación para categorías
const categorySchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory?: any | null;
  mode: "create" | "edit";
}

export function CategoryDialog({ 
  open, 
  onOpenChange, 
  selectedCategory, 
  mode = "create" 
}: CategoryDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Obtener categorías para seleccionar categoría padre
  const categories = queryClient.getQueryData<any[]>(["/api/document-management/categories"]) || [];
  
  // Configurar formulario
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: selectedCategory?.name || "",
      description: selectedCategory?.description || "",
      color: selectedCategory?.color || "#3E63DD",
      icon: selectedCategory?.icon || "folder",
      parentId: selectedCategory?.parentId?.toString() || "",
    },
  });
  
  // Resetear formulario cuando cambia el modo o la categoría seleccionada
  React.useEffect(() => {
    if (open) {
      form.reset({
        name: selectedCategory?.name || "",
        description: selectedCategory?.description || "",
        color: selectedCategory?.color || "#3E63DD",
        icon: selectedCategory?.icon || "folder",
        parentId: selectedCategory?.parentId?.toString() || "",
      });
    }
  }, [selectedCategory, open, form, mode]);
  
  // Mutación para crear categoría
  const createMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      const response = await apiRequest(
        "POST", 
        "/api/document-management/categories", 
        data
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/document-management/categories"] });
      toast({
        title: "Categoría creada",
        description: "La categoría ha sido creada exitosamente",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear categoría",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutación para actualizar categoría
  const updateMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      const response = await apiRequest(
        "PUT", 
        `/api/document-management/categories/${selectedCategory.id}`, 
        data
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/document-management/categories"] });
      toast({
        title: "Categoría actualizada",
        description: "La categoría ha sido actualizada exitosamente",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar categoría",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutación para eliminar categoría
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "DELETE", 
        `/api/document-management/categories/${selectedCategory.id}`,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/document-management/categories"] });
      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada exitosamente",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar categoría",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: CategoryFormValues) => {
    // Convertir el parentId a número si existe
    if (data.parentId) {
      data.parentId = data.parentId.toString();
    }
    
    if (mode === "create") {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };
  
  const handleDelete = () => {
    if (confirm("¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.")) {
      deleteMutation.mutate();
    }
  };
  
  // Opciones de iconos
  const iconOptions = [
    { value: "folder", label: "Carpeta", icon: <FolderPlus className="h-4 w-4" /> },
    { value: "folder-archive", label: "Archivo", icon: <FolderArchive className="h-4 w-4" /> },
    { value: "folder-check", label: "Certificados", icon: <FolderCheck className="h-4 w-4" /> },
    { value: "folder-input", label: "Documentos", icon: <FolderInput className="h-4 w-4" /> },
  ];
  
  // Obtener icono según valor
  const getIconByValue = (value: string) => {
    const option = iconOptions.find(option => option.value === value);
    return option?.icon || <FolderPlus className="h-4 w-4" />;
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Crear nueva categoría" : "Editar categoría"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Crea una categoría para organizar documentos"
              : "Edita los detalles de la categoría seleccionada"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de la categoría" {...field} />
                  </FormControl>
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
                      placeholder="Descripción breve de la categoría" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center">
                        <Palette className="h-4 w-4 mr-2" />
                        Color
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input type="color" {...field} value={field.value || "#3E63DD"} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icono</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value || "folder"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue 
                            placeholder="Seleccionar icono" 
                            defaultValue="folder"
                          >
                            <div className="flex items-center">
                              {getIconByValue(field.value || "folder")}
                              <span className="ml-2">
                                {iconOptions.find(
                                  option => option.value === (field.value || "folder")
                                )?.label || "Carpeta"}
                              </span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {iconOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center">
                              {option.icon}
                              <span className="ml-2">{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría padre</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || ""} 
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría padre (opcional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Ninguna (categoría principal)</SelectItem>
                      {categories
                        .filter(cat => cat.id !== selectedCategory?.id)
                        .map((category) => (
                        <SelectItem 
                          key={category.id} 
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="flex justify-between">
              {mode === "edit" && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Eliminar
                </Button>
              )}
              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {mode === "create" ? "Crear categoría" : "Actualizar categoría"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}