import React, { useState } from "react";
import { VecinosAdminLayout } from "@/components/vecinos/VecinosAdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  User, 
  Store, 
  FileEdit,
  FileText,
  ArrowUpCircle,
  CalendarDays,
  CheckCircle, 
  XCircle,
  Clock 
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Esquema de validación para el formulario
const formSchema = z.object({
  storeName: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  businessType: z.string().min(1, { message: "Seleccione un tipo de negocio" }),
  address: z.string().min(5, { message: "Dirección demasiado corta" }),
  region: z.string().min(1, { message: "Seleccione una región" }),
  comuna: z.string().min(1, { message: "Seleccione una comuna" }),
  phone: z.string().min(9, { message: "Teléfono inválido" }),
  email: z.string().email({ message: "Email inválido" }),
  ownerName: z.string().min(3, { message: "Nombre demasiado corto" }),
  ownerRut: z.string().min(8, { message: "RUT inválido" }),
  ownerPhone: z.string().min(9, { message: "Teléfono inválido" }),
  hasInternet: z.boolean().default(false),
  notes: z.string().optional(),
});

// Datos simulados para las solicitudes pendientes
const pendingApplications = [
  {
    id: 1,
    storeName: "Verdulería Doña Rosa",
    businessType: "verduleria",
    address: "Pasaje Los Naranjos 123, Santiago",
    region: "Metropolitana",
    comuna: "Santiago",
    ownerName: "Rosa Pérez",
    ownerRut: "15987654-3",
    createdAt: "2025-04-28",
    status: "draft",
    seller: "Carlos Mendoza",
    notes: "Cliente interesado, falta verificación de documentos",
  },
  {
    id: 2,
    storeName: "Bazar Todo Barato",
    businessType: "bazar",
    address: "Av. Independencia 456, Santiago",
    region: "Metropolitana",
    comuna: "Independencia",
    ownerName: "Luis García",
    ownerRut: "11456789-2",
    createdAt: "2025-04-25",
    status: "pending",
    seller: "Carlos Mendoza",
    notes: "Documentos verificados, pendiente de revisión por certificador",
  },
  {
    id: 3,
    storeName: "Kiosco El Rincón",
    businessType: "kiosco",
    address: "Calle San Diego 789, Santiago",
    region: "Metropolitana",
    comuna: "Santiago Centro",
    ownerName: "María González",
    ownerRut: "12345678-1",
    createdAt: "2025-04-20",
    status: "pending_docs",
    seller: "Carlos Mendoza",
    notes: "Faltan documentos de identidad y patente comercial",
  }
];

// Datos para selectores
const businessTypes = [
  { value: "tienda", label: "Tienda/Minimarket" },
  { value: "farmacia", label: "Farmacia" },
  { value: "libreria", label: "Librería/Papelería" },
  { value: "cafe", label: "Café Internet" },
  { value: "ferreteria", label: "Ferretería" },
  { value: "verduleria", label: "Verdulería" },
  { value: "bazar", label: "Bazar" },
  { value: "kiosco", label: "Kiosco" },
  { value: "otro", label: "Otro" },
];

const regiones = [
  { value: "metropolitana", label: "Región Metropolitana" },
  { value: "valparaiso", label: "Región de Valparaíso" },
  { value: "biobio", label: "Región del Biobío" },
  { value: "araucania", label: "Región de La Araucanía" },
  { value: "coquimbo", label: "Región de Coquimbo" },
];

const comunasMetropolitana = [
  { value: "santiago", label: "Santiago" },
  { value: "providencia", label: "Providencia" },
  { value: "nunoa", label: "Ñuñoa" },
  { value: "lascondes", label: "Las Condes" },
  { value: "maipu", label: "Maipú" },
  { value: "independencia", label: "Independencia" },
  { value: "santiagoCentro", label: "Santiago Centro" },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "draft":
      return <Badge className="bg-blue-500">Borrador</Badge>;
    case "pending":
      return <Badge className="bg-amber-500">Pendiente</Badge>;
    case "pending_docs":
      return <Badge className="bg-purple-500">Docs. Pendientes</Badge>;
    case "approved":
      return <Badge className="bg-green-500">Aprobado</Badge>;
    case "rejected":
      return <Badge className="bg-red-500">Rechazado</Badge>;
    default:
      return <Badge className="bg-gray-500">Desconocido</Badge>;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "draft":
      return <FileEdit className="h-9 w-9 text-blue-600" />;
    case "pending":
      return <Clock className="h-9 w-9 text-amber-600" />;
    case "pending_docs":
      return <FileText className="h-9 w-9 text-purple-600" />;
    case "approved":
      return <CheckCircle className="h-9 w-9 text-green-600" />;
    case "rejected":
      return <XCircle className="h-9 w-9 text-red-600" />;
    default:
      return <FileText className="h-9 w-9 text-gray-600" />;
  }
};

const VecinosSellerFormsPage = () => {
  const [isNewFormOpen, setIsNewFormOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>("metropolitana");
  
  // Configuración del formulario con React Hook Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storeName: "",
      businessType: "",
      address: "",
      region: "metropolitana",
      comuna: "",
      phone: "",
      email: "",
      ownerName: "",
      ownerRut: "",
      ownerPhone: "",
      hasInternet: false,
      notes: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    setIsNewFormOpen(false);
    // Aquí iría la lógica para guardar el nuevo formulario
    // Por ahora solo cerramos el modal
  };

  const handleViewApplication = (application: any) => {
    setSelectedApplication(application);
    setIsViewOpen(true);
  };

  return (
    <VecinosAdminLayout title="Captación de Socios">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold">Solicitudes de nuevos socios</h2>
            <p className="text-sm text-gray-500">Formularios de captación y seguimiento</p>
          </div>
          
          <Button onClick={() => setIsNewFormOpen(true)}>
            Nuevo Formulario
          </Button>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:w-auto">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="draft">Borradores</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="pending_docs">Docs. Pendientes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingApplications.map(application => (
                <Card key={application.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{application.storeName}</CardTitle>
                      {getStatusBadge(application.status)}
                    </div>
                    <CardDescription>
                      {application.ownerName} · {application.ownerRut}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{application.address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Creado: {new Date(application.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>Vendedor: {application.seller}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end pt-0">
                    <Button
                      variant="ghost"
                      onClick={() => handleViewApplication(application)}
                    >
                      Ver detalles
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="draft" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingApplications
                .filter(app => app.status === "draft")
                .map(application => (
                  <Card key={application.id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{application.storeName}</CardTitle>
                        {getStatusBadge(application.status)}
                      </div>
                      <CardDescription>
                        {application.ownerName} · {application.ownerRut}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{application.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>Creado: {new Date(application.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>Vendedor: {application.seller}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end pt-0">
                      <Button
                        variant="ghost"
                        onClick={() => handleViewApplication(application)}
                      >
                        Ver detalles
                      </Button>
                    </CardFooter>
                  </Card>
              ))}
              
              {pendingApplications.filter(app => app.status === "draft").length === 0 && (
                <div className="col-span-3 py-10 text-center text-gray-500">
                  No hay borradores de solicitudes
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingApplications
                .filter(app => app.status === "pending")
                .map(application => (
                  <Card key={application.id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{application.storeName}</CardTitle>
                        {getStatusBadge(application.status)}
                      </div>
                      <CardDescription>
                        {application.ownerName} · {application.ownerRut}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{application.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>Creado: {new Date(application.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>Vendedor: {application.seller}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end pt-0">
                      <Button
                        variant="ghost"
                        onClick={() => handleViewApplication(application)}
                      >
                        Ver detalles
                      </Button>
                    </CardFooter>
                  </Card>
              ))}
              
              {pendingApplications.filter(app => app.status === "pending").length === 0 && (
                <div className="col-span-3 py-10 text-center text-gray-500">
                  No hay solicitudes pendientes
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="pending_docs" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingApplications
                .filter(app => app.status === "pending_docs")
                .map(application => (
                  <Card key={application.id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{application.storeName}</CardTitle>
                        {getStatusBadge(application.status)}
                      </div>
                      <CardDescription>
                        {application.ownerName} · {application.ownerRut}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{application.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>Creado: {new Date(application.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>Vendedor: {application.seller}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end pt-0">
                      <Button
                        variant="ghost"
                        onClick={() => handleViewApplication(application)}
                      >
                        Ver detalles
                      </Button>
                    </CardFooter>
                  </Card>
              ))}
              
              {pendingApplications.filter(app => app.status === "pending_docs").length === 0 && (
                <div className="col-span-3 py-10 text-center text-gray-500">
                  No hay solicitudes con documentos pendientes
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Formulario para nuevos socios */}
      <Dialog open={isNewFormOpen} onOpenChange={setIsNewFormOpen}>
        <DialogContent className="sm:max-w-[725px]">
          <DialogHeader>
            <DialogTitle>Nuevo formulario de captación</DialogTitle>
            <DialogDescription>
              Complete los datos del nuevo socio potencial para Vecinos Xpress
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Datos del negocio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="storeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del negocio</FormLabel>
                        <FormControl>
                          <Input placeholder="Minimarket El Sol" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de negocio</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {businessTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
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
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input placeholder="Av. Principal 123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Región</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedRegion(value);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar región" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {regiones.map(region => (
                              <SelectItem key={region.value} value={region.value}>
                                {region.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="comuna"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comuna</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar comuna" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectedRegion === "metropolitana" && comunasMetropolitana.map(comuna => (
                              <SelectItem key={comuna.value} value={comuna.value}>
                                {comuna.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono del negocio</FormLabel>
                        <FormControl>
                          <Input placeholder="+56 9 1234 5678" {...field} />
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
                        <FormLabel>Email del negocio</FormLabel>
                        <FormControl>
                          <Input placeholder="negocio@ejemplo.cl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Datos del propietario</h3>
                <FormField
                  control={form.control}
                  name="ownerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ownerRut"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RUT</FormLabel>
                        <FormControl>
                          <Input placeholder="12.345.678-9" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="ownerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono personal</FormLabel>
                        <FormControl>
                          <Input placeholder="+56 9 8765 4321" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Información adicional</h3>
                <FormField
                  control={form.control}
                  name="hasInternet"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>¿Cuenta con Internet?</FormLabel>
                        <FormDescription>
                          Conexión WiFi o fija en el local
                        </FormDescription>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-600"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observaciones o comentarios adicionales"
                          className="h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsNewFormOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar formulario</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Vista detallada de solicitud */}
      {selectedApplication && (
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedApplication.storeName}
                <span>{getStatusBadge(selectedApplication.status)}</span>
              </DialogTitle>
              <DialogDescription>
                Solicitud creada el {new Date(selectedApplication.createdAt).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Información del negocio</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">Nombre:</div>
                    <div>{selectedApplication.storeName}</div>
                    
                    <div className="font-medium">Tipo:</div>
                    <div>{selectedApplication.businessType}</div>
                    
                    <div className="font-medium">Dirección:</div>
                    <div>{selectedApplication.address}</div>
                    
                    <div className="font-medium">Región:</div>
                    <div>{selectedApplication.region}</div>
                    
                    <div className="font-medium">Comuna:</div>
                    <div>{selectedApplication.comuna}</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Información del propietario</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">Nombre:</div>
                    <div>{selectedApplication.ownerName}</div>
                    
                    <div className="font-medium">RUT:</div>
                    <div>{selectedApplication.ownerRut}</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Notas y observaciones</h3>
                  <div className="text-sm p-3 bg-gray-50 rounded-md">
                    {selectedApplication.notes || "Sin notas adicionales"}
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-md">
                  {getStatusIcon(selectedApplication.status)}
                  <h3 className="mt-2 font-medium">
                    {selectedApplication.status === "draft" ? "Borrador" :
                     selectedApplication.status === "pending" ? "Pendiente de revisión" :
                     selectedApplication.status === "pending_docs" ? "Documentos pendientes" : 
                     selectedApplication.status === "approved" ? "Aprobado" : "Rechazado"}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedApplication.status === "draft" ? "Complete la información" :
                     selectedApplication.status === "pending" ? "En espera de certificador" :
                     selectedApplication.status === "pending_docs" ? "Faltan documentos" : 
                     selectedApplication.status === "approved" ? "Socio activado" : "Solicitud rechazada"}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Estado del proceso</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Formulario creado</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {(selectedApplication.status !== "draft") ? 
                        <CheckCircle className="h-5 w-5 text-green-500" /> : 
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />}
                      <span className="text-sm">Documentación completa</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {(selectedApplication.status === "pending" || selectedApplication.status === "approved") ? 
                        <CheckCircle className="h-5 w-5 text-green-500" /> : 
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />}
                      <span className="text-sm">Enviado a revisión</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {(selectedApplication.status === "approved") ? 
                        <CheckCircle className="h-5 w-5 text-green-500" /> : 
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />}
                      <span className="text-sm">Aprobado por certificador</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              {selectedApplication.status === "draft" && (
                <Button>Editar formulario</Button>
              )}
              {selectedApplication.status === "pending_docs" && (
                <Button>Subir documentos</Button>
              )}
              {selectedApplication.status === "draft" && (
                <Button>Enviar a revisión</Button>
              )}
              <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
    </VecinosAdminLayout>
  );
};

export default VecinosSellerFormsPage;