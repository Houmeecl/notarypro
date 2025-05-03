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
  MapPin,
  Phone,
  Mail,
  Tag,
  DollarSign,
  Layers,
  BarChart
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

// Dashboard para vendedores con gestión de puntos Vecinos y clientes
export default function SellerDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddVecinoDialog, setShowAddVecinoDialog] = useState(false);
  const [newVecinoData, setNewVecinoData] = useState({
    name: "",
    address: "",
    contactName: "",
    phone: "",
    email: ""
  });

  // Query para obtener datos del vendedor
  const { data: sellerData } = useQuery({
    queryKey: ['/api/sellers/profile'],
    queryFn: () => fetch('/api/sellers/profile').then(res => res.json())
  });

  // Query para obtener puntos Vecinos asignados al vendedor
  const { data: assignedVecinos, isLoading } = useQuery({
    queryKey: ['/api/sellers/assigned-vecinos'],
    queryFn: () => fetch('/api/sellers/assigned-vecinos').then(res => res.json())
  });

  // Query para obtener las ventas recientes
  const { data: recentSales, isLoading: isLoadingSales } = useQuery({
    queryKey: ['/api/sellers/recent-sales'],
    queryFn: () => fetch('/api/sellers/recent-sales').then(res => res.json())
  });

  // Query para obtener estadísticas del vendedor
  const { data: stats } = useQuery({
    queryKey: ['/api/sellers/statistics'],
    queryFn: () => fetch('/api/sellers/statistics').then(res => res.json())
  });

  // Mutación para agregar un nuevo punto Vecino
  const addVecinoMutation = useMutation({
    mutationFn: async (vecinoData: any) => {
      const response = await apiRequest("POST", "/api/sellers/vecinos", vecinoData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Punto Vecino registrado",
        description: "El nuevo punto Vecino ha sido registrado correctamente.",
      });
      setShowAddVecinoDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/sellers/assigned-vecinos'] });

      // Limpiar formulario
      setNewVecinoData({
        name: "",
        address: "",
        contactName: "",
        phone: "",
        email: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo registrar el punto Vecino.",
        variant: "destructive",
      });
    }
  });

  // Filtrar puntos Vecinos según búsqueda
  const filteredVecinos = assignedVecinos ? assignedVecinos.filter((vecino: any) => {
    const matchesSearch = 
      vecino.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      vecino.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vecino.contactName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || vecino.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  // Manejador para agregar un nuevo punto Vecino
  const handleAddVecino = () => {
    // Validación básica
    if (!newVecinoData.name || !newVecinoData.address || !newVecinoData.contactName) {
      toast({
        title: "Datos incompletos",
        description: "Por favor complete todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }
    
    addVecinoMutation.mutate(newVecinoData);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r bg-white">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">NotaryPro</h2>
          <p className="text-sm text-gray-500">Panel de Vendedor</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button 
            className="w-full flex items-center px-4 py-3 bg-gray-100 rounded-md text-gray-900 font-medium"
            onClick={() => setLocation("/seller/dashboard")}
          >
            <BarChart className="mr-3 h-5 w-5" />
            Dashboard
          </button>
          
          <button 
            className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-md"
            onClick={() => setLocation("/seller/vecinos")}
          >
            <Store className="mr-3 h-5 w-5" />
            Puntos Vecinos
          </button>
          
          <button 
            className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-md"
            onClick={() => setLocation("/seller/clients")}
          >
            <Users className="mr-3 h-5 w-5" />
            Clientes
          </button>
          
          <button 
            className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-md"
            onClick={() => setLocation("/seller/sales")}
          >
            <DollarSign className="mr-3 h-5 w-5" />
            Ventas
          </button>
          
          <button 
            className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-md"
            onClick={() => setLocation("/seller/visits")}
          >
            <Calendar className="mr-3 h-5 w-5" />
            Visitas
          </button>
        </nav>
        
        <div className="p-4 border-t">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
              {user?.fullName?.charAt(0).toUpperCase() || 'V'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">{user?.fullName}</p>
              <p className="text-xs text-gray-500">Vendedor</p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <button 
              className="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
              onClick={() => setLocation("/seller/settings")}
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
            <h1 className="text-2xl font-bold text-gray-800">Dashboard de Vendedor</h1>
            <p className="text-sm text-gray-500">Gestión de puntos Vecinos y ventas</p>
          </div>
          
          <div className="flex space-x-2">
            <div className="relative">
              <Input
                placeholder="Buscar punto Vecino..."
                className="w-72 pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            
            <Dialog open={showAddVecinoDialog} onOpenChange={setShowAddVecinoDialog}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Registrar Nuevo Vecino
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Punto Vecino</DialogTitle>
                  <DialogDescription>
                    Ingrese los datos del establecimiento para incorporarlo a la red Vecinos.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm font-medium">Nombre Comercial</label>
                    <Input
                      className="col-span-3"
                      placeholder="Nombre del establecimiento"
                      value={newVecinoData.name}
                      onChange={(e) => setNewVecinoData({...newVecinoData, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm font-medium">Dirección</label>
                    <Input
                      className="col-span-3"
                      placeholder="Dirección completa"
                      value={newVecinoData.address}
                      onChange={(e) => setNewVecinoData({...newVecinoData, address: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm font-medium">Persona de Contacto</label>
                    <Input
                      className="col-span-3"
                      placeholder="Nombre del encargado"
                      value={newVecinoData.contactName}
                      onChange={(e) => setNewVecinoData({...newVecinoData, contactName: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm font-medium">Teléfono</label>
                    <Input
                      className="col-span-3"
                      placeholder="+56 9 1234 5678"
                      value={newVecinoData.phone}
                      onChange={(e) => setNewVecinoData({...newVecinoData, phone: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm font-medium">Email</label>
                    <Input
                      className="col-span-3"
                      placeholder="correo@ejemplo.com"
                      type="email"
                      value={newVecinoData.email}
                      onChange={(e) => setNewVecinoData({...newVecinoData, email: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddVecinoDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddVecino}>
                    Registrar Punto Vecino
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          {/* Información del vendedor */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
                  {sellerData?.fullName?.charAt(0).toUpperCase() || 'V'}
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-gray-800">{sellerData?.fullName}</h2>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    Zona: {sellerData?.zone}
                  </div>
                  <div className="text-sm text-gray-500">
                    Supervisor: {sellerData?.supervisorName}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:items-end">
                <div className="flex items-center">
                  <Badge className="bg-green-100 text-green-800 mb-2">Vendedor Activo</Badge>
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {sellerData?.phone}
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {sellerData?.email}
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-gray-500">Puntos Vecinos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.active || 0}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.new || 0} nuevos este mes
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-gray-500">Visitas Realizadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.active || 0}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.new || 0} pendientes para hoy
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-gray-500">Solicitudes Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.pending || 0}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.today || 0} nuevas hoy
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
                    {stats?.quota?.current || 0}/{stats?.quota?.total || 0}
                  </div>
                  <div className="text-green-500 text-sm pb-0.5">
                    {Math.round((stats?.quota?.current || 0) / (stats?.quota?.total || 1) * 100)}%
                  </div>
                </div>
                <Progress
                  value={(stats?.quota?.current || 0) / (stats?.quota?.total || 1) * 100}
                  className="h-2 mt-2"
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Main content tabs */}
          <Tabs defaultValue="vecinos" className="space-y-4">
            <TabsList>
              <TabsTrigger value="vecinos" className="text-sm">Puntos Vecinos</TabsTrigger>
              <TabsTrigger value="sales" className="text-sm">Ventas Recientes</TabsTrigger>
              <TabsTrigger value="visits" className="text-sm">Visitas Programadas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="vecinos" className="space-y-4">
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle>Puntos Vecinos Asignados</CardTitle>
                  <CardDescription>
                    Gestione los puntos Vecinos en su zona de cobertura.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300"></div>
                    </div>
                  ) : filteredVecinos.length === 0 ? (
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
                            <TableHead>Establecimiento</TableHead>
                            <TableHead>Ubicación</TableHead>
                            <TableHead>Contacto</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Última Visita</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredVecinos.map((vecino: any) => (
                            <TableRow key={vecino.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                                    <Store className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <div>{vecino.name}</div>
                                    <div className="text-xs text-gray-500">{vecino.code}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                                  {vecino.address}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{vecino.contactName}</div>
                                <div className="text-xs text-gray-500">{vecino.phone}</div>
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  vecino.status === "active" ? "bg-green-100 text-green-800" :
                                  vecino.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                  vecino.status === "inactive" ? "bg-gray-100 text-gray-800" :
                                  "bg-red-100 text-red-800"
                                }>
                                  {vecino.status === "active" ? "Activo" : 
                                   vecino.status === "pending" ? "Pendiente" :
                                   vecino.status === "inactive" ? "Inactivo" : "Suspendido"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1 text-gray-400" />
                                  {vecino.lastVisit ? new Date(vecino.lastVisit).toLocaleDateString() : "No visitado"}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end">
                                  <Button variant="ghost" size="sm" 
                                    onClick={() => setLocation(`/seller/vecinos/${vecino.id}`)}
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
            
            <TabsContent value="sales" className="space-y-4">
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle>Ventas Recientes</CardTitle>
                  <CardDescription>
                    Transacciones procesadas por sus puntos Vecinos.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoadingSales ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300"></div>
                    </div>
                  ) : !recentSales || recentSales.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-10 text-center">
                      <div className="rounded-full bg-gray-100 p-3 mb-4">
                        <DollarSign className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No hay ventas recientes</h3>
                      <p className="text-gray-500 max-w-md">
                        No se encontraron transacciones recientes para mostrar.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-gray-50">
                            <TableHead>Transacción</TableHead>
                            <TableHead>Punto Vecino</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Servicio</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="text-right">Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentSales.map((sale: any) => (
                            <TableRow key={sale.id} className="hover:bg-gray-50">
                              <TableCell className="font-mono text-xs">
                                {sale.transactionId}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Store className="h-3 w-3 mr-1 text-gray-400" />
                                  {sale.vecinoName}
                                </div>
                              </TableCell>
                              <TableCell>{sale.clientName}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Tag className="h-3 w-3 mr-1 text-gray-400" />
                                  {sale.service}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                ${sale.amount.toLocaleString('es-CL')}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1 text-gray-400" />
                                  {new Date(sale.date).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge className={
                                  sale.status === "completed" ? "bg-green-100 text-green-800" :
                                  sale.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                  "bg-red-100 text-red-800"
                                }>
                                  {sale.status === "completed" ? "Completada" : 
                                   sale.status === "pending" ? "Pendiente" : "Cancelada"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-center py-4">
                  <Button variant="outline" onClick={() => setLocation('/seller/sales')}>
                    Ver todas las ventas
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="visits" className="space-y-4">
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle>Visitas Programadas</CardTitle>
                  <CardDescription>
                    Visitas a puntos Vecinos programadas para los próximos días.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">Minimarket El Sol</h3>
                          <p className="text-sm text-gray-600">Av. Providencia 1234, Providencia</p>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            Hoy, 15:30
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">Hoy</Badge>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <Button size="sm" variant="outline">Reprogramar</Button>
                        <Button size="sm">Iniciar Visita</Button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded-r-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">Farmacia Vida</h3>
                          <p className="text-sm text-gray-600">Calle Moneda 567, Santiago Centro</p>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            Mañana, 11:00
                          </div>
                        </div>
                        <Badge className="bg-gray-100 text-gray-800">Mañana</Badge>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <Button size="sm" variant="outline">Reprogramar</Button>
                        <Button size="sm" variant="outline">Ver Detalles</Button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded-r-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">Librería Central</h3>
                          <p className="text-sm text-gray-600">Irarrázaval 2450, Ñuñoa</p>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            05/05/2025, 14:15
                          </div>
                        </div>
                        <Badge className="bg-gray-100 text-gray-800">Próxima Semana</Badge>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <Button size="sm" variant="outline">Reprogramar</Button>
                        <Button size="sm" variant="outline">Ver Detalles</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center py-4">
                  <Button onClick={() => setLocation('/seller/schedule-visit')}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Programar Nueva Visita
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Proyección de comisiones */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Proyección de Comisiones</CardTitle>
              <CardDescription>
                Estimación de comisiones para el mes actual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-1">Comisiones Acumuladas</span>
                  <span className="text-2xl font-bold">$230.500</span>
                  <span className="text-xs text-green-600 flex items-center mt-1">
                    <ArrowUpDown className="h-3 w-3 mr-1" />
                    15% más que el mes pasado
                  </span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-1">Proyección al Cierre</span>
                  <span className="text-2xl font-bold">$420.000</span>
                  <span className="text-xs text-gray-500 mt-1">
                    Basado en tendencia actual
                  </span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-1">Meta para Bono</span>
                  <span className="text-2xl font-bold">$500.000</span>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "64%" }}></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    64% completado - Faltan $170.000
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}