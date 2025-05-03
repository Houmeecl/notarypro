import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Users,
  User,
  Store,
  FileText,
  ChevronRight,
  Clock,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  CreditCard,
  Search,
  Filter,
  PlusCircle,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  MoreHorizontal,
  MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress"; 

// Supervisor Dashboard para gestionar vendedores y puntos Vecinos
export default function SupervisorDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddSellerDialog, setShowAddSellerDialog] = useState(false);
  const [newSellerData, setNewSellerData] = useState({
    name: "",
    email: "",
    phone: "",
    zone: ""
  });

  // Query para obtener lista de vendedores
  const { data: sellers, isLoading } = useQuery({
    queryKey: ['/api/supervisors/sellers'],
    queryFn: () => fetch('/api/supervisors/sellers').then(res => res.json()),
  });

  // Query para obtener puntos Vecinos 
  const { data: vecinosPoints, isLoading: isLoadingVecinos } = useQuery({
    queryKey: ['/api/supervisors/vecinos-points'],
    queryFn: () => fetch('/api/supervisors/vecinos-points').then(res => res.json()),
  });

  // Query para obtener estadísticas generales
  const { data: stats } = useQuery({
    queryKey: ['/api/supervisors/statistics'],
    queryFn: () => fetch('/api/supervisors/statistics').then(res => res.json()),
  });

  // Mutación para añadir un nuevo vendedor
  const addSellerMutation = useMutation({
    mutationFn: async (sellerData: any) => {
      const response = await apiRequest("POST", "/api/supervisors/sellers", sellerData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Vendedor agregado",
        description: "El nuevo vendedor ha sido agregado correctamente.",
      });
      setShowAddSellerDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/supervisors/sellers'] });

      // Limpiar el formulario
      setNewSellerData({
        name: "",
        email: "",
        phone: "",
        zone: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar al vendedor.",
        variant: "destructive",
      });
    }
  });

  // Filtrar vendedores según búsqueda y filtros
  const filteredSellers = sellers ? sellers.filter((seller: any) => {
    const matchesSearch = 
      seller.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      seller.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.zone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || seller.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  // Filtrar puntos Vecinos según búsqueda
  const filteredVecinosPoints = vecinosPoints ? vecinosPoints.filter((point: any) => {
    return point.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
           point.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           point.code?.toLowerCase().includes(searchTerm.toLowerCase());
  }) : [];

  // Manejador para agregar un nuevo vendedor
  const handleAddSeller = () => {
    // Validación básica
    if (!newSellerData.name || !newSellerData.email || !newSellerData.zone) {
      toast({
        title: "Datos incompletos",
        description: "Por favor complete todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }
    
    addSellerMutation.mutate(newSellerData);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r bg-white">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">NotaryPro</h2>
          <p className="text-sm text-gray-500">Panel de Supervisor</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button 
            className="w-full flex items-center px-4 py-3 bg-gray-100 rounded-md text-gray-900 font-medium"
            onClick={() => setLocation("/supervisor/dashboard")}
          >
            <BarChart3 className="mr-3 h-5 w-5" />
            Dashboard
          </button>
          
          <button 
            className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-md"
            onClick={() => setLocation("/supervisor/sellers")}
          >
            <Users className="mr-3 h-5 w-5" />
            Vendedores
          </button>
          
          <button 
            className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-md"
            onClick={() => setLocation("/supervisor/vecinos-points")}
          >
            <Store className="mr-3 h-5 w-5" />
            Puntos Vecinos
          </button>
          
          <button 
            className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-md"
            onClick={() => setLocation("/supervisor/documents")}
          >
            <FileText className="mr-3 h-5 w-5" />
            Documentos
          </button>
          
          <button 
            className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-md"
            onClick={() => setLocation("/supervisor/payments")}
          >
            <CreditCard className="mr-3 h-5 w-5" />
            Pagos
          </button>
        </nav>
        
        <div className="p-4 border-t">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
              {user?.fullName?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">{user?.fullName}</p>
              <p className="text-xs text-gray-500">Supervisor Zonal</p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <button 
              className="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
              onClick={() => setLocation("/supervisor/settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </button>
            
            <button 
              className="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
              onClick={() => setLocation("/logout")}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 bg-white border-b flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard de Supervisor</h1>
            <p className="text-sm text-gray-500">Gestión de vendedores y puntos Vecinos</p>
          </div>
          
          <div className="flex space-x-2">
            <div className="relative">
              <Input
                placeholder="Buscar..."
                className="w-72 pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
                <SelectItem value="suspended">Suspendidos</SelectItem>
              </SelectContent>
            </Select>
            
            <Dialog open={showAddSellerDialog} onOpenChange={setShowAddSellerDialog}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Agregar Vendedor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Vendedor</DialogTitle>
                  <DialogDescription>
                    Ingrese los datos del nuevo vendedor para su equipo.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm font-medium">Nombre</label>
                    <Input
                      className="col-span-3"
                      placeholder="Nombre completo"
                      value={newSellerData.name}
                      onChange={(e) => setNewSellerData({...newSellerData, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm font-medium">Email</label>
                    <Input
                      className="col-span-3"
                      placeholder="correo@ejemplo.com"
                      type="email"
                      value={newSellerData.email}
                      onChange={(e) => setNewSellerData({...newSellerData, email: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm font-medium">Teléfono</label>
                    <Input
                      className="col-span-3"
                      placeholder="+56 9 1234 5678"
                      value={newSellerData.phone}
                      onChange={(e) => setNewSellerData({...newSellerData, phone: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm font-medium">Zona</label>
                    <Select
                      value={newSellerData.zone}
                      onValueChange={(value) => setNewSellerData({...newSellerData, zone: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar zona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="norte">Zona Norte</SelectItem>
                        <SelectItem value="centro">Zona Centro</SelectItem>
                        <SelectItem value="sur">Zona Sur</SelectItem>
                        <SelectItem value="oriente">Zona Oriente</SelectItem>
                        <SelectItem value="poniente">Zona Poniente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddSellerDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddSeller}>
                    Agregar Vendedor
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-gray-500">Vendedores Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeVendors || 0}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.newVendors || 0} nuevos este mes
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-gray-500">Puntos Vecinos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeVecinosPoints || 0}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.newVecinosPoints || 0} nuevos este mes
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-gray-500">Documentos Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.pendingDocuments || 0}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.todayDocuments || 0} recibidos hoy
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-gray-500">Meta Mensual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <div className="text-2xl font-bold">
                    {stats?.quota?.completed || 0}/{stats?.quota?.total || 0}
                  </div>
                  <div className="text-green-500 text-sm pb-0.5">
                    {Math.round((stats?.quota?.completed || 0) / (stats?.quota?.total || 1) * 100)}%
                  </div>
                </div>
                <Progress
                  value={(stats?.quota?.completed || 0) / (stats?.quota?.total || 1) * 100}
                  className="h-2 mt-2"
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Main content tabs */}
          <Tabs defaultValue="vendors" className="space-y-4">
            <TabsList>
              <TabsTrigger value="vendors" className="text-sm">Vendedores</TabsTrigger>
              <TabsTrigger value="vecinos" className="text-sm">Puntos Vecinos</TabsTrigger>
              <TabsTrigger value="reports" className="text-sm">Reportes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="vendors" className="space-y-4">
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle>Equipo de Vendedores</CardTitle>
                  <CardDescription>
                    Gestione a su equipo de vendedores y asigne zonas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300"></div>
                    </div>
                  ) : filteredSellers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-10 text-center">
                      <div className="rounded-full bg-gray-100 p-3 mb-4">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No hay vendedores</h3>
                      <p className="text-gray-500 max-w-md">
                        No se encontraron vendedores que coincidan con tus criterios de búsqueda.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-gray-50">
                            <TableHead>Nombre</TableHead>
                            <TableHead>Zona</TableHead>
                            <TableHead>Contacto</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Rendimiento</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredSellers.map((seller: any) => (
                            <TableRow key={seller.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                    {seller.name.charAt(0).toUpperCase()}
                                  </div>
                                  {seller.name}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                                  {seller.zone}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-xs text-gray-500">{seller.email}</span>
                                  <span className="text-xs text-gray-500">{seller.phone}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  seller.status === "active" ? "bg-green-100 text-green-800" :
                                  seller.status === "inactive" ? "bg-gray-100 text-gray-800" :
                                  "bg-red-100 text-red-800"
                                }>
                                  {seller.status === "active" ? "Activo" : 
                                   seller.status === "inactive" ? "Inactivo" : "Suspendido"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                  <div 
                                    className={`${
                                      seller.performance > 75 ? "bg-green-500" : 
                                      seller.performance > 50 ? "bg-yellow-500" : "bg-red-500"
                                    } h-2 rounded-full`} 
                                    style={{ width: `${seller.performance}%` }}
                                  ></div>
                                </div>
                                <div className="flex justify-between mt-1">
                                  <span className="text-xs text-gray-500">{seller.performance}%</span>
                                  <span className="text-xs text-gray-500">Meta: {seller.quota}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setLocation(`/supervisor/sellers/${seller.id}`)}>
                                      <User className="h-4 w-4 mr-2" />
                                      Ver Perfil
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setLocation(`/supervisor/sellers/${seller.id}/edit`)}>
                                      <Settings className="h-4 w-4 mr-2" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600" onClick={() => alert("Funcionalidad de suspensión pendiente")}>
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Suspender
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="vecinos" className="space-y-4">
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle>Puntos Vecinos</CardTitle>
                  <CardDescription>
                    Administre los puntos de servicio Vecinos en su zona.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoadingVecinos ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300"></div>
                    </div>
                  ) : filteredVecinosPoints.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-10 text-center">
                      <div className="rounded-full bg-gray-100 p-3 mb-4">
                        <Store className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No hay puntos Vecinos</h3>
                      <p className="text-gray-500 max-w-md">
                        No se encontraron puntos Vecinos que coincidan con tus criterios de búsqueda.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-gray-50">
                            <TableHead>Nombre</TableHead>
                            <TableHead>Código</TableHead>
                            <TableHead>Ubicación</TableHead>
                            <TableHead>Responsable</TableHead>
                            <TableHead>Comisiones</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredVecinosPoints.map((point: any) => (
                            <TableRow key={point.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                                    <Store className="h-4 w-4" />
                                  </div>
                                  {point.name}
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-xs">{point.code}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                                  {point.address}
                                </div>
                              </TableCell>
                              <TableCell>{point.manager}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <CreditCard className="h-4 w-4 text-green-500" />
                                  <span>${point.monthlyCommissions?.toLocaleString('es-CL') || 0}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end">
                                  <Button variant="ghost" size="sm" 
                                    onClick={() => setLocation(`/supervisor/vecinos-points/${point.id}`)}
                                  >
                                    Ver detalles
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reports" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Progreso de Documentos</CardTitle>
                    <CardDescription>
                      Documentos procesados en el último mes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Documentos procesados</span>
                          <span className="font-medium">{stats?.documentProgress?.current || 0}/{stats?.documentProgress?.target || 0}</span>
                        </div>
                        <Progress 
                          value={((stats?.documentProgress?.current || 0) / (stats?.documentProgress?.target || 1)) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Captación de Socios</CardTitle>
                    <CardDescription>
                      Nuevos socios Vecinos en el último mes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Socios captados</span>
                          <span className="font-medium">{stats?.partnerProgress?.current || 0}/{stats?.partnerProgress?.target || 0}</span>
                        </div>
                        <Progress 
                          value={((stats?.partnerProgress?.current || 0) / (stats?.partnerProgress?.target || 1)) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Visitas Realizadas</CardTitle>
                    <CardDescription>
                      Visitas a puntos Vecinos este mes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Visitas completadas</span>
                          <span className="font-medium">{stats?.visitProgress?.current || 0}/{stats?.visitProgress?.target || 0}</span>
                        </div>
                        <Progress 
                          value={((stats?.visitProgress?.current || 0) / (stats?.visitProgress?.target || 1)) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Descargar Reportes</CardTitle>
                  <CardDescription>
                    Acceda a reportes detallados de su zona
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <FileText className="h-6 w-6 mb-2" />
                      <span>Reporte de Ventas</span>
                    </Button>
                    
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <Users className="h-6 w-6 mb-2" />
                      <span>Rendimiento de Vendedores</span>
                    </Button>
                    
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <Store className="h-6 w-6 mb-2" />
                      <span>Actividad de Puntos Vecinos</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}