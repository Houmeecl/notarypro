import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DocumentCategory, DocumentTemplate } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Pencil, Trash2, Info, ArrowLeft, Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";
import TemplateEditor from "@/components/document/TemplateEditor";

export default function TemplateAdminPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Traer categorías de documentos
  const { data: categories, isLoading: categoriesLoading } = useQuery<DocumentCategory[]>({
    queryKey: ['/api/document-categories'],
  });

  // Traer plantillas de documentos
  const { data: templates, isLoading: templatesLoading } = useQuery<DocumentTemplate[]>({
    queryKey: ['/api/document-templates'],
  });

  // Mutación para activar/desactivar plantilla
  const toggleTemplateMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const response = await apiRequest("PATCH", `/api/document-templates/${id}`, { active });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/document-templates'] });
      toast({
        title: "Plantilla actualizada",
        description: "El estado de la plantilla ha sido actualizado.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la plantilla.",
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar plantilla
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/document-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/document-templates'] });
      setIsDeleting(false);
      setSelectedTemplate(null);
      toast({
        title: "Plantilla eliminada",
        description: "La plantilla ha sido eliminada correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la plantilla.",
        variant: "destructive",
      });
    },
  });

  // Verificar si el usuario es administrador
  if (user && user.role !== "admin") {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Acceso restringido</AlertTitle>
          <AlertDescription>
            No tienes permisos para acceder a esta sección. Esta página es solo para administradores.
          </AlertDescription>
        </Alert>
        <Link href="/">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>
      </div>
    );
  }

  // Filtrar plantillas según búsqueda y categoría seleccionada
  const filteredTemplates = templates?.filter((template) => {
    const matchesSearch = searchTerm === "" || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === null || template.categoryId.toString() === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Obtener nombre de categoría
  const getCategoryName = (categoryId: number) => {
    const category = categories?.find(c => c.id === categoryId);
    return category ? category.name : "Sin categoría";
  };

  // Formatear precio
  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };

  // Formatear fecha
  const formatDate = (dateString: Date | string | null) => {
    if (!dateString) return "Fecha desconocida";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CL", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Manejar activación/desactivación de plantilla
  const handleToggleActive = (template: DocumentTemplate) => {
    toggleTemplateMutation.mutate({ 
      id: template.id, 
      active: !template.active 
    });
  };

  // Manejar edición de plantilla
  const handleEditTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(true);
  };

  // Manejar eliminación de plantilla
  const handleDeleteTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setIsDeleting(true);
  };

  // Confirmar eliminación de plantilla
  const confirmDelete = () => {
    if (selectedTemplate) {
      deleteTemplateMutation.mutate(selectedTemplate.id);
    }
  };

  // Manejar creación de nueva plantilla
  const handleCreateTemplate = () => {
    setIsCreating(true);
  };

  // Manejar finalización de edición/creación
  const handleEditingDone = () => {
    setIsEditing(false);
    setIsCreating(false);
    setSelectedTemplate(null);
  };

  // UI de carga
  if (categoriesLoading || templatesLoading) {
    return (
      <div className="container mx-auto py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Cargando plantillas...</p>
      </div>
    );
  }

  // UI de edición o creación de plantilla
  if (isEditing || isCreating) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleEditingDone} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Editar plantilla" : "Crear nueva plantilla"}
          </h1>
        </div>

        <TemplateEditor 
          template={isEditing ? selectedTemplate || undefined : undefined}
          categories={categories || []}
          onSuccess={handleEditingDone}
          onCancel={handleEditingDone}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Administración de Plantillas</h1>
          <p className="text-gray-500">
            Gestiona las plantillas de documentos disponibles para los usuarios.
          </p>
        </div>
        <Button onClick={handleCreateTemplate} className="mt-4 md:mt-0">
          <PlusCircle className="h-4 w-4 mr-2" />
          Nueva plantilla
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="md:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar plantillas..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div>
          <select
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value === "" ? null : e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id.toString()}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredTemplates && filteredTemplates.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Plantillas de documentos</CardTitle>
            <CardDescription>
              Total: {filteredTemplates.length} plantilla{filteredTemplates.length !== 1 ? "s" : ""}
              {searchTerm && ` (Filtrado por: "${searchTerm}")`}
              {selectedCategory && ` en categoría: "${getCategoryName(parseInt(selectedCategory))}"`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Actualización</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">
                        <div>
                          {template.name}
                          {template.description && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {template.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryName(template.categoryId)}</TableCell>
                      <TableCell>{formatPrice(template.price)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={template.active}
                            onCheckedChange={() => handleToggleActive(template)}
                            aria-label="Toggle template active state"
                          />
                          <Badge variant={template.active ? "default" : "secondary"}>
                            {template.active ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(template.updatedAt as any)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditTemplate(template)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No se encontraron plantillas</CardTitle>
            <CardDescription>
              {searchTerm || selectedCategory
                ? "No hay plantillas que coincidan con tus criterios de búsqueda."
                : "No hay plantillas disponibles. Crea una nueva plantilla para comenzar."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Button onClick={handleCreateTemplate}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Crear nueva plantilla
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Diálogo de confirmación para eliminar plantilla */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la plantilla <strong>{selectedTemplate?.name}</strong>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteTemplateMutation.isPending}
            >
              {deleteTemplateMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Eliminando...</>
              ) : (
                <>Eliminar</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}