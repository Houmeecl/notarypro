import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  Upload, 
  Loader2, 
  FileUp, 
  File, 
  AlertTriangle,
  Tag as TagIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Tipo para categorías de documentos
type DocumentCategory = {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: number;
};

// Schema de validación para documentos
const documentSchema = z.object({
  title: z.string().min(2, "El título debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Debes seleccionar una categoría"),
  status: z.string().optional(),
  tags: z.string().optional(),
});

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentUploadDialog({ open, onOpenChange }: DocumentUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Cargar categorías de documentos
  const { data: categories } = useQuery({
    queryKey: ["/api/document-management/categories"],
    queryFn: async () => {
      const res = await fetch("/api/document-management/categories");
      if (!res.ok) throw new Error("Error al cargar categorías");
      return res.json();
    }
  });
  
  // Configurar formulario
  const form = useForm({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      status: "active",
      tags: "",
    },
  });
  
  // Resetear formulario cuando se cierra el diálogo
  React.useEffect(() => {
    if (!open) {
      form.reset();
      setSelectedFile(null);
      setFilePreview(null);
      setTags([]);
      setNewTag("");
    }
  }, [open, form]);
  
  // Mutación para subir documento
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/document-management/documents", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al subir documento");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/document-management/documents"] });
      toast({
        title: "Documento subido",
        description: "El documento ha sido subido exitosamente",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al subir documento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Manejar cambio de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Generar vista previa para imágenes y PDFs
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else if (file.type === "application/pdf") {
        setFilePreview("/pdf-icon.png"); // Ícono de PDF (crear este archivo en /public)
      } else {
        setFilePreview(null);
      }
    }
  };
  
  // Manejar envío del formulario
  const onSubmit = (data: z.infer<typeof documentSchema>) => {
    if (!selectedFile) {
      toast({
        title: "Error al subir documento",
        description: "Debes seleccionar un archivo",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    formData.append("categoryId", data.categoryId);
    formData.append("status", data.status || "active");
    
    // Agregar etiquetas al FormData
    if (tags.length > 0) {
      formData.append("tags", JSON.stringify(tags));
    }
    
    uploadMutation.mutate(formData);
  };
  
  // Manejar etiquetas
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };
  
  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  // Mostrar formato de archivo y tamaño
  const getFileInfo = () => {
    if (!selectedFile) return null;
    
    const sizeInMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
    const isLargeFile = parseFloat(sizeInMB) > 5; // Advertir si es > 5MB
    
    return (
      <div className="text-sm text-gray-500 mt-1 flex items-center">
        <File className="h-4 w-4 mr-1" />
        {selectedFile.name} ({sizeInMB} MB)
        {isLargeFile && (
          <span className="flex items-center text-amber-600 ml-2">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Archivo grande
          </span>
        )}
      </div>
    );
  };
  
  // Mostrar vista previa de archivo
  const renderFilePreview = () => {
    if (!filePreview) return null;
    
    if (filePreview.startsWith("data:image")) {
      return (
        <div className="mt-2 border rounded-md overflow-hidden">
          <img 
            src={filePreview} 
            alt="Vista previa" 
            className="max-h-48 object-contain mx-auto"
          />
        </div>
      );
    }
    
    return (
      <div className="mt-2 border rounded-md p-4 flex items-center justify-center bg-gray-50">
        <File className="h-12 w-12 text-indigo-600" />
      </div>
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Subir Documento</DialogTitle>
          <DialogDescription>
            Sube un nuevo documento al sistema
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Selección de archivo */}
            <div className="space-y-2">
              <FormLabel>Archivo</FormLabel>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 transition-colors bg-gray-50" onClick={() => document.getElementById("file-upload")?.click()}>
                <div className="flex flex-col items-center justify-center space-y-2">
                  <FileUp className="h-8 w-8 text-gray-400" />
                  <div className="text-sm text-gray-500">
                    <span className="font-semibold text-indigo-600">
                      Haz clic para seleccionar
                    </span> o arrastra y suelta
                  </div>
                  <div className="text-xs text-gray-500">
                    PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (max. 10MB)
                  </div>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
              </div>
              {getFileInfo()}
              {renderFilePreview()}
            </div>
            
            {/* Título */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título del documento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción del documento" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Categoría */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category: DocumentCategory) => (
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
            
            {/* Estado */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Etiquetas */}
            <div className="space-y-2">
              <FormLabel>Etiquetas</FormLabel>
              <div className="flex items-center">
                <Input
                  placeholder="Agregar etiqueta"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addTag}
                  className="ml-2"
                >
                  <TagIcon className="h-4 w-4 mr-1" /> Agregar
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                      {tag}
                      <span 
                        className="ml-1 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      >
                        ×
                      </span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="mr-2"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={uploadMutation.isPending || !selectedFile}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {uploadMutation.isPending ? (
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
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}