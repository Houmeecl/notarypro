import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Plus, CheckCircle2, Database, Edit, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { seedAllTemplates } from "@/lib/document-template-data";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";

export default function DocumentTemplatesManager() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [editPriceOpen, setEditPriceOpen] = useState(false);
  const [priceValue, setPriceValue] = useState<string>("");
  const [savingPrice, setSavingPrice] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Obtener plantillas existentes al cargar
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/document-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      } else {
        throw new Error('Error al obtener plantillas');
      }
    } catch (error) {
      console.error('Error al cargar plantillas:', error);
      setError("No se pudieron cargar las plantillas existentes");
    }
  };

  const handleSeedTemplates = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const result = await seedAllTemplates();
      setSuccess(true);
      toast({
        title: "Operación exitosa",
        description: result.message,
      });
      
      // Recargar plantillas
      fetchTemplates();
    } catch (error) {
      console.error('Error:', error);
      setError("Ocurrió un error al agregar las plantillas. Verifica la consola para más detalles.");
      toast({
        title: "Error",
        description: "No se pudieron agregar las plantillas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToAdmin = () => {
    setLocation('/admin-dashboard');
  };

  const handleAddTemplate = () => {
    // En futuras versiones: Navegar a un formulario para crear plantillas
    setLocation('/admin/test-document-generator');
  };
  
  const handleOpenEditPrice = (template: any) => {
    setSelectedTemplate(template);
    setPriceValue(template.price.toString());
    setEditPriceOpen(true);
  };
  
  const handleSavePrice = async () => {
    if (!selectedTemplate) return;
    
    setSavingPrice(true);
    try {
      const newPrice = parseInt(priceValue);
      if (isNaN(newPrice) || newPrice < 0) {
        throw new Error('El precio debe ser un número válido mayor o igual a 0');
      }
      
      const response = await apiRequest('PATCH', `/api/document-templates/${selectedTemplate.id}`, {
        price: newPrice
      });
      
      if (response.ok) {
        toast({
          title: "Precio actualizado",
          description: `El precio de ${selectedTemplate.name} ha sido actualizado correctamente.`,
        });
        
        // Actualizar la lista de plantillas
        fetchTemplates();
        setEditPriceOpen(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el precio');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingPrice(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Administrador de Plantillas de Documentos</h1>
        <Button variant="outline" onClick={handleBackToAdmin}>
          Volver al Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Plantillas Predefinidas
            </CardTitle>
            <CardDescription>
              Agrega las plantillas predefinidas del sistema para las categorías principales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Esta opción agregará plantillas profesionales para contratos comerciales, documentos corporativos y más. 
              Solo se agregarán plantillas que no existan actualmente.
            </p>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Éxito</AlertTitle>
                <AlertDescription>Las plantillas fueron agregadas correctamente</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSeedTemplates} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Agregando plantillas...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Agregar Plantillas Predefinidas
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Crear Nueva Plantilla
            </CardTitle>
            <CardDescription>
              Crea una plantilla personalizada desde cero
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Esta opción te permite crear una plantilla completamente personalizada, 
              definiendo tu propio esquema de formulario y HTML para la generación del documento.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleAddTemplate}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear Nueva Plantilla
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Plantillas Existentes ({templates.length})</h2>
        
        {templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay plantillas disponibles. Añade plantillas predefinidas o crea nuevas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>
                    {template.description || "Sin descripción"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Categoría:</div>
                    <div>{template.categoryId}</div>
                    <div className="text-muted-foreground">Precio:</div>
                    <div className="flex items-center">
                      ${template.price}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 ml-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditPrice(template);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-muted-foreground">Estado:</div>
                    <div>{template.active ? "Activo" : "Inactivo"}</div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setLocation(`/admin/test-document-generator?templateId=${template.id}`)}
                  >
                    Usar plantilla
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Modal de edición de precio */}
      <Dialog open={editPriceOpen} onOpenChange={setEditPriceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Precio</DialogTitle>
            <DialogDescription>
              Actualizar el precio para la plantilla {selectedTemplate?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label htmlFor="price" className="text-sm font-medium mb-2 block">
              Precio (en pesos chilenos)
            </label>
            <Input
              id="price"
              type="number"
              min="0"
              value={priceValue}
              onChange={(e) => setPriceValue(e.target.value)}
              placeholder="Ej: 10000"
              className="mb-2"
            />
            <p className="text-sm text-muted-foreground">
              El precio debe ser un número entero y sin decimales.
            </p>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditPriceOpen(false)}
              disabled={savingPrice}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSavePrice}
              disabled={savingPrice}
            >
              {savingPrice ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}