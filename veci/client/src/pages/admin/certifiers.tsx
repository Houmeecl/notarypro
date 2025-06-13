import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  AlertCircle,
  ArrowUpDown,
  BarChart2,
  CheckCircle,
  ChevronDown,
  Download,
  Edit,
  FileText,
  Filter,
  Lock,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  XCircle
} from "lucide-react";

// Tipos para los certificadores
interface Certifier {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "suspended";
  documentsProcessed: number;
  commission: number;
  createdAt: string;
  lastActivity?: string;
  certificationLevel: "basic" | "advanced" | "expert";
  regions: string[];
  specializations: string[];
  profilePicture?: string;
  commissionRate: number;
  pendingPayment: number;
}

// Esquema para validación del formulario de certificador
const certifierFormSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Correo electrónico inválido" }),
  phone: z.string().min(8, { message: "Número de teléfono inválido" }),
  certificationLevel: z.enum(["basic", "advanced", "expert"]),
  regions: z.array(z.string()).min(1, { message: "Seleccione al menos una región" }),
  specializations: z.array(z.string()).min(1, { message: "Seleccione al menos una especialización" }),
  commissionRate: z.number().min(0).max(100),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
});

const AdminCertifiers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedCertifier, setSelectedCertifier] = useState<Certifier | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const { toast } = useToast();

  // Formulario para añadir/editar certificador
  const form = useForm<z.infer<typeof certifierFormSchema>>({
    resolver: zodResolver(certifierFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      certificationLevel: "basic",
      regions: [],
      specializations: [],
      commissionRate: 5,
      notes: "",
      isActive: true,
    },
  });

  // Consulta para obtener certificadores
  const { data: certifiers, isLoading, error } = useQuery({
    queryKey: ["/api/admin/certifiers", statusFilter, regionFilter],
    queryFn: async () => {
      let url = `/api/admin/certifiers?`;
      if (statusFilter !== "all") url += `status=${statusFilter}&`;
      if (regionFilter) url += `region=${regionFilter}&`;
      
      const response = await apiRequest("GET", url);
      if (!response.ok) {
        throw new Error("Error al obtener los certificadores");
      }
      return await response.json();
    },
  });

  // Función para cambiar el ordenamiento
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Función para filtrar certificadores según criterios
  const filteredCertifiers = certifiers
    ? certifiers.filter((certifier: Certifier) => {
        // Filtrar por búsqueda
        if (searchQuery && !certifier.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !certifier.email.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        return true;
      })
    : [];

  // Función para ordenar certificadores
  const sortedCertifiers = [...filteredCertifiers].sort((a: Certifier, b: Certifier) => {
    let aValue: any = a[sortColumn as keyof Certifier];
    let bValue: any = b[sortColumn as keyof Certifier];
    
    // Asegurarse de que podemos comparar fechas
    if (sortColumn === "createdAt" || sortColumn === "lastActivity") {
      aValue = new Date(aValue || 0).getTime();
      bValue = new Date(bValue || 0).getTime();
    }
    
    // Comparar valores
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Función para formatear fecha
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return format(date, "d MMM yyyy, HH:mm", { locale: es });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP"
    }).format(amount);
  };

  // Función para manejar acciones sobre certificadores
  const handleCertifierAction = (action: string, certifier: Certifier) => {
    setSelectedCertifier(certifier);
    
    switch (action) {
      case "edit":
        setIsEditing(true);
        // Rellenar el formulario con los datos del certificador
        form.reset({
          name: certifier.name,
          email: certifier.email,
          phone: certifier.phone,
          certificationLevel: certifier.certificationLevel,
          regions: certifier.regions,
          specializations: certifier.specializations,
          commissionRate: certifier.commissionRate,
          notes: "",
          isActive: certifier.status === "active",
        });
        setShowAddEditDialog(true);
        break;
        
      case "delete":
        setShowDeleteDialog(true);
        break;
        
      case "activate":
        updateCertifierStatus(certifier.id, "active");
        break;
        
      case "suspend":
        updateCertifierStatus(certifier.id, "suspended");
        break;
        
      default:
        break;
    }
  };

  // Función para actualizar el estado de un certificador
  const updateCertifierStatus = async (id: number, status: string) => {
    try {
      const response = await apiRequest("PATCH", `/api/admin/certifiers/${id}`, { status });
      if (response.ok) {
        toast({
          title: "Estado actualizado",
          description: `El certificador ha sido ${status === 'active' ? 'activado' : 'suspendido'} correctamente`,
        });
        
        // Actualizar la lista de certificadores
        queryClient.invalidateQueries({ queryKey: ["/api/admin/certifiers"] });
      } else {
        throw new Error("Error al actualizar el estado del certificador");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al actualizar el estado",
        variant: "destructive",
      });
    }
  };

  // Función para confirmar eliminación
  const confirmDelete = async () => {
    if (!selectedCertifier) return;
    
    try {
      const response = await apiRequest("DELETE", `/api/admin/certifiers/${selectedCertifier.id}`);
      if (response.ok) {
        toast({
          title: "Certificador eliminado",
          description: "El certificador ha sido eliminado correctamente",
        });
        
        // Actualizar la lista de certificadores
        queryClient.invalidateQueries({ queryKey: ["/api/admin/certifiers"] });
        setShowDeleteDialog(false);
      } else {
        throw new Error("Error al eliminar el certificador");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al eliminar el certificador",
        variant: "destructive",
      });
    }
  };

  // Función para enviar el formulario de certificador
  const onSubmit = async (values: z.infer<typeof certifierFormSchema>) => {
    try {
      let response;
      if (isEditing && selectedCertifier) {
        // Actualizar certificador existente
        response = await apiRequest("PATCH", `/api/admin/certifiers/${selectedCertifier.id}`, values);
      } else {
        // Crear nuevo certificador
        response = await apiRequest("POST", "/api/admin/certifiers", values);
      }
      
      if (response.ok) {
        toast({
          title: isEditing ? "Certificador actualizado" : "Certificador creado",
          description: isEditing 
            ? "Los datos del certificador han sido actualizados correctamente"
            : "El nuevo certificador ha sido creado correctamente",
        });
        
        // Actualizar la lista de certificadores
        queryClient.invalidateQueries({ queryKey: ["/api/admin/certifiers"] });
        
        // Cerrar el diálogo y resetear el formulario
        setShowAddEditDialog(false);
        form.reset();
      } else {
        throw new Error(`Error al ${isEditing ? 'actualizar' : 'crear'} el certificador`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Ocurrió un error al ${isEditing ? 'actualizar' : 'crear'} el certificador`,
        variant: "destructive",
      });
    }
  };

  // Función para obtener el color del estado del certificador
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Función para obtener el ícono del estado del certificador
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-3 w-3" />;
      case "inactive":
        return <XCircle className="h-3 w-3" />;
      case "suspended":
        return <Lock className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Función para obtener las iniciales de un nombre
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Cargando certificadores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error al cargar los certificadores</h2>
          <p className="text-gray-600 mb-4">
            No se pudieron cargar los certificadores. Por favor, intente nuevamente.
          </p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Certificadores</h1>
          <p className="text-gray-500 mt-1">
            Administre los certificadores del sistema
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab(activeTab === "list" ? "stats" : "list")}
          >
            {activeTab === "list" ? (
              <>
                <BarChart2 className="h-4 w-4 mr-2" />
                Ver Estadísticas
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Ver Certificadores
              </>
            )}
          </Button>
          <Button 
            size="sm"
            onClick={() => {
              setIsEditing(false);
              form.reset();
              setShowAddEditDialog(true);
            }}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Certificador
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="hidden">
          <TabsTrigger value="list">Lista de Certificadores</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {/* Filtros y búsqueda */}
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Buscar:</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Nombre o correo electrónico..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Estado:</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="suspended">Suspendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="region">Región:</Label>
                  <Select value={regionFilter} onValueChange={setRegionFilter}>
                    <SelectTrigger id="region">
                      <SelectValue placeholder="Todas las regiones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las regiones</SelectItem>
                      <SelectItem value="RM">Región Metropolitana</SelectItem>
                      <SelectItem value="V">Región de Valparaíso</SelectItem>
                      <SelectItem value="VIII">Región del Biobío</SelectItem>
                      <SelectItem value="IX">Región de la Araucanía</SelectItem>
                      <SelectItem value="X">Región de Los Lagos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de certificadores */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2 text-primary" />
                Certificadores
              </CardTitle>
              <CardDescription>
                {filteredCertifiers.length} certificadores encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                        <div className="flex items-center">
                          Nombre
                          {sortColumn === "name" && (
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead onClick={() => handleSort("email")} className="cursor-pointer">
                        <div className="flex items-center">
                          Correo Electrónico
                          {sortColumn === "email" && (
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead onClick={() => handleSort("status")} className="cursor-pointer">
                        <div className="flex items-center">
                          Estado
                          {sortColumn === "status" && (
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead onClick={() => handleSort("documentsProcessed")} className="cursor-pointer">
                        <div className="flex items-center">
                          Documentos
                          {sortColumn === "documentsProcessed" && (
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead onClick={() => handleSort("pendingPayment")} className="cursor-pointer">
                        <div className="flex items-center">
                          Comisión Pendiente
                          {sortColumn === "pendingPayment" && (
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead onClick={() => handleSort("lastActivity")} className="cursor-pointer">
                        <div className="flex items-center">
                          Última Actividad
                          {sortColumn === "lastActivity" && (
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedCertifiers.length > 0 ? (
                      sortedCertifiers.map((certifier: Certifier) => (
                        <TableRow key={certifier.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar>
                                {certifier.profilePicture ? (
                                  <AvatarImage src={certifier.profilePicture} alt={certifier.name} />
                                ) : null}
                                <AvatarFallback className="bg-primary text-white">
                                  {getInitials(certifier.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{certifier.name}</p>
                                <p className="text-xs text-gray-500">Nivel: {certifier.certificationLevel}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{certifier.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`${getStatusColor(certifier.status)} flex w-fit items-center gap-1`}>
                              {getStatusIcon(certifier.status)}
                              <span className="capitalize">{certifier.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>{certifier.documentsProcessed}</TableCell>
                          <TableCell>{formatCurrency(certifier.pendingPayment)}</TableCell>
                          <TableCell>{formatDate(certifier.lastActivity)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleCertifierAction("edit", certifier)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem disabled={certifier.status === "active"} onClick={() => handleCertifierAction("activate", certifier)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Activar
                                </DropdownMenuItem>
                                <DropdownMenuItem disabled={certifier.status === "suspended"} onClick={() => handleCertifierAction("suspend", certifier)}>
                                  <Lock className="h-4 w-4 mr-2" />
                                  Suspender
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleCertifierAction("delete", certifier)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center">
                            <UserCheck className="h-12 w-12 text-gray-300 mb-2" />
                            <p className="text-gray-500">No se encontraron certificadores con los filtros actuales</p>
                            <Button 
                              variant="link" 
                              onClick={() => {
                                setSearchQuery("");
                                setStatusFilter("all");
                                setRegionFilter("");
                              }}
                            >
                              Limpiar filtros
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-gray-500">
                Mostrando {sortedCertifiers.length} de {certifiers.length} certificadores
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          {/* Estadísticas de Certificadores */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                  Rendimiento por Certificador
                </CardTitle>
                <CardDescription>
                  Documentos procesados y comisiones generadas
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Gráfico de rendimiento se mostrará aquí</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                  Estadísticas por Región
                </CardTitle>
                <CardDescription>
                  Distribución de certificadores y actividad por región
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Gráfico de estadísticas por región se mostrará aquí</p>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                  Comisiones y Pagos
                </CardTitle>
                <CardDescription>
                  Resumen de comisiones y pagos a certificadores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Certificador</TableHead>
                        <TableHead>Documentos Este Mes</TableHead>
                        <TableHead>Comisión Generada</TableHead>
                        <TableHead>Comisión Pagada</TableHead>
                        <TableHead>Pendiente de Pago</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedCertifiers.slice(0, 5).map((certifier: Certifier) => (
                        <TableRow key={`payment-${certifier.id}`}>
                          <TableCell>
                            <div className="font-medium">{certifier.name}</div>
                          </TableCell>
                          <TableCell>{certifier.documentsProcessed}</TableCell>
                          <TableCell>{formatCurrency(certifier.commission)}</TableCell>
                          <TableCell>{formatCurrency(certifier.commission - certifier.pendingPayment)}</TableCell>
                          <TableCell className="font-medium text-primary">{formatCurrency(certifier.pendingPayment)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              Registrar Pago
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="link">
                  Ver todos los pagos
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar este certificador? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
            <h3 className="font-medium text-red-800">{selectedCertifier?.name}</h3>
            <p className="text-sm text-red-600">Correo: {selectedCertifier?.email}</p>
            <p className="text-sm text-red-600">Documentos procesados: {selectedCertifier?.documentsProcessed}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para añadir/editar certificador */}
      <Dialog open={showAddEditDialog} onOpenChange={(open) => {
        setShowAddEditDialog(open);
        if (!open) {
          form.reset();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Certificador' : 'Añadir Certificador'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Actualice la información del certificador en el sistema.'
                : 'Complete el formulario para agregar un nuevo certificador.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del certificador" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input placeholder="correo@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="+56 9 1234 5678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="certificationLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel de certificación</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un nivel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="basic">Básico</SelectItem>
                          <SelectItem value="advanced">Avanzado</SelectItem>
                          <SelectItem value="expert">Experto</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="commissionRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tasa de comisión (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                      <div className="space-y-0.5">
                        <FormLabel>Estado activo</FormLabel>
                        <FormDescription className="text-xs">
                          El certificador podrá iniciar sesión y procesar documentos
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
              </div>
              
              <FormField
                control={form.control}
                name="regions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Regiones de cobertura</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {[
                        { id: "RM", label: "Región Metropolitana" },
                        { id: "V", label: "Región de Valparaíso" },
                        { id: "VIII", label: "Región del Biobío" },
                        { id: "IX", label: "Región de la Araucanía" },
                        { id: "X", label: "Región de Los Lagos" },
                        { id: "XV", label: "Región de Arica y Parinacota" },
                      ].map((region) => (
                        <FormField
                          key={region.id}
                          control={form.control}
                          name="regions"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={region.id}
                                className="flex flex-row items-start space-x-2 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(region.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, region.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== region.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {region.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="specializations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especializaciones</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {[
                        { id: "contracts", label: "Contratos" },
                        { id: "real_estate", label: "Bienes Raíces" },
                        { id: "corporate", label: "Documentos Corporativos" },
                        { id: "financial", label: "Documentos Financieros" },
                        { id: "legal", label: "Documentos Legales" },
                        { id: "personal", label: "Documentos Personales" },
                      ].map((specialization) => (
                        <FormField
                          key={specialization.id}
                          control={form.control}
                          name="specializations"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={specialization.id}
                                className="flex flex-row items-start space-x-2 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(specialization.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, specialization.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== specialization.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {specialization.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas adicionales</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ingrese notas o comentarios adicionales aquí..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Esta información es solo para uso interno y no será visible para el certificador
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddEditDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {isEditing ? 'Actualizar' : 'Crear'} Certificador
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCertifiers;