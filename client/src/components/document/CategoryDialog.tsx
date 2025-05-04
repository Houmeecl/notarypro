import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Folder, FolderEdit, Trash } from "lucide-react";
import { DocumentCategory } from "@shared/document-schema";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory?: DocumentCategory | null;
  mode: "create" | "edit";
}

export function CategoryDialog({ 
  open, 
  onOpenChange, 
  selectedCategory, 
  mode 
}: CategoryDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("#2d219b"); // Color indigo por defecto
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Cargar datos si estamos en modo edición
  useEffect(() => {
    if (mode === "edit" && selectedCategory) {
      setName(selectedCategory.name);
      setDescription(selectedCategory.description || "");
      setIcon(selectedCategory.icon || "");
      setColor(selectedCategory.color || "#2d219b");
    } else {
      // Resetear formulario en modo creación
      setName("");
      setDescription("");
      setIcon("");
      setColor("#2d219b");
    }
  }, [mode, selectedCategory, open]);
  
  // Mutación para crear categoría
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      const response = await fetch("/api/document-management/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la categoría");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Categoría creada",
        description: "La categoría se ha creado exitosamente",
      });
      
      // Cerrar el diálogo y refrescar datos
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["/api/document-management/categories"] });
      
      // Resetear formulario
      setName("");
      setDescription("");
      setIcon("");
      setColor("#2d219b");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutación para actualizar categoría
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, categoryData }: { id: number; categoryData: any }) => {
      const response = await fetch(`/api/document-management/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar la categoría");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Categoría actualizada",
        description: "La categoría se ha actualizado exitosamente",
      });
      
      // Cerrar el diálogo y refrescar datos
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["/api/document-management/categories"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutación para eliminar categoría
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/document-management/categories/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Error al eliminar la categoría");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Categoría eliminada",
        description: "La categoría se ha eliminado exitosamente",
      });
      
      // Cerrar el diálogo y refrescar datos
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["/api/document-management/categories"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const categoryData = {
      name,
      description,
      icon,
      color,
    };
    
    try {
      if (mode === "create") {
        await createCategoryMutation.mutateAsync(categoryData);
      } else if (mode === "edit" && selectedCategory) {
        await updateCategoryMutation.mutateAsync({ 
          id: selectedCategory.id, 
          categoryData 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!selectedCategory) return;
    
    if (window.confirm(`¿Está seguro de eliminar la categoría "${selectedCategory.name}"? Esta acción no se puede deshacer.`)) {
      setIsSubmitting(true);
      try {
        await deleteCategoryMutation.mutateAsync(selectedCategory.id);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "create" ? (
              <>
                <Plus className="h-5 w-5" />
                Crear nueva categoría
              </>
            ) : (
              <>
                <FolderEdit className="h-5 w-5" />
                Editar categoría
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Complete los detalles para crear una nueva categoría de documentos."
              : "Actualice los detalles de la categoría seleccionada."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre de la categoría *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Documentos Legales"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descripción de la categoría"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="icon">Ícono (nombre de Lucide)</Label>
              <Input
                id="icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Ej: file-text, folder, shield"
              />
              <div className="text-xs text-gray-500">
                Ingrese el nombre de un ícono de Lucide-React. Ver lista en <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">lucide.dev</a>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="color">Color (hex)</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#2d219b"
                />
                <div 
                  className="w-10 h-10 rounded-md border" 
                  style={{ backgroundColor: color || "#2d219b" }}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            {mode === "edit" && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash className="h-4 w-4 mr-2" />
                )}
                Eliminar
              </Button>
            )}
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : mode === "create" ? (
                  <Plus className="h-4 w-4 mr-2" />
                ) : (
                  <FolderEdit className="h-4 w-4 mr-2" />
                )}
                {mode === "create" ? "Crear categoría" : "Guardar cambios"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}