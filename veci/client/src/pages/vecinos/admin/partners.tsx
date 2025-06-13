import React, { useState } from "react";
import { VecinosAdminLayout } from "@/components/vecinos/VecinosAdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EyeIcon, PencilIcon, CheckCircle, XCircle, Briefcase, MapPin, Phone, Mail, Calendar, User, Store } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Datos simulados para la demostración
const partnersData = [
  {
    id: 1,
    storeName: "Minimarket El Sol",
    businessType: "tienda",
    address: "Av. Principal 123, Santiago",
    ownerName: "Juan Pérez",
    ownerRut: "12345678-9",
    phone: "912345678",
    email: "demo@vecinos.test",
    status: "approved",
    createdAt: "2025-01-15",
    hasDevice: true,
    hasInternet: true,
    commissionRate: 20,
    balance: 15600,
    documents: 32,
  },
  {
    id: 2,
    storeName: "Farmacia Vida",
    businessType: "farmacia",
    address: "Las Condes 567, Santiago",
    ownerName: "Carlos Rodríguez",
    ownerRut: "11222333-4",
    phone: "987654321",
    email: "partner2@vecinos.test",
    status: "approved",
    createdAt: "2025-02-10",
    hasDevice: true,
    hasInternet: true,
    commissionRate: 10,
    balance: 25400,
    documents: 45,
  },
  {
    id: 3,
    storeName: "Librería Central",
    businessType: "libreria",
    address: "Manuel Montt 890, Providencia",
    ownerName: "Ana Martínez",
    ownerRut: "14789632-5",
    phone: "945678912",
    email: "partner3@vecinos.test",
    status: "pending",
    createdAt: "2025-03-05",
    hasDevice: false,
    hasInternet: true,
    commissionRate: 15,
    balance: 0,
    documents: 0,
  },
  {
    id: 4,
    storeName: "Café Internet Express",
    businessType: "cafe",
    address: "Irarrázaval 1234, Ñuñoa",
    ownerName: "Pedro Sánchez",
    ownerRut: "16987456-2",
    phone: "978912345",
    email: "partner4@vecinos.test",
    status: "rejected",
    createdAt: "2025-03-15",
    hasDevice: false,
    hasInternet: true,
    commissionRate: 0,
    balance: 0,
    documents: 0,
  },
  {
    id: 5,
    storeName: "Ferretería Don José",
    businessType: "ferreteria",
    address: "Av. Libertad 456, Viña del Mar",
    ownerName: "José Gómez",
    ownerRut: "10543876-0",
    phone: "945612378",
    email: "partner5@vecinos.test",
    status: "pending",
    createdAt: "2025-04-02",
    hasDevice: false,
    hasInternet: false,
    commissionRate: 0,
    balance: 0,
    documents: 0,
  },
];

const VecinosPartnersPage = () => {
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Funciones para gestionar la interfaz
  const handleViewDetails = (partner: any) => {
    setSelectedPartner(partner);
    setIsDetailsOpen(true);
  };

  const handleApproval = (partner: any) => {
    setSelectedPartner(partner);
    setIsApprovalOpen(true);
  };

  // Filtrar socios por estado
  const filteredPartners = filterStatus === "all" 
    ? partnersData 
    : partnersData.filter(partner => partner.status === filterStatus);

  // Función para obtener color de badge según estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Aprobado</Badge>;
      case "pending":
        return <Badge className="bg-amber-500">Pendiente</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rechazado</Badge>;
      default:
        return <Badge className="bg-gray-500">Desconocido</Badge>;
    }
  };

  // Visualización de tipo de negocio
  const getBusinessTypeLabel = (type: string) => {
    const types: {[key: string]: string} = {
      "tienda": "Tienda/Minimarket",
      "farmacia": "Farmacia", 
      "libreria": "Librería/Papelería",
      "cafe": "Café Internet",
      "ferreteria": "Ferretería",
    };
    return types[type] || type;
  };

  return (
    <VecinosAdminLayout title="Gestión de Socios">
      <div className="space-y-6">
        {/* Filtros y estadísticas */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">Socios Vecinos Xpress</h2>
            <div className="flex items-center space-x-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="approved">Aprobados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="rejected">Rechazados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-1 bg-green-100 rounded-full px-3 py-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium">
                {partnersData.filter(p => p.status === "approved").length} Aprobados
              </span>
            </div>
            <div className="flex items-center space-x-1 bg-amber-100 rounded-full px-3 py-1">
              <div className="h-2 w-2 rounded-full bg-amber-500"></div>
              <span className="text-xs font-medium">
                {partnersData.filter(p => p.status === "pending").length} Pendientes
              </span>
            </div>
            <div className="flex items-center space-x-1 bg-red-100 rounded-full px-3 py-1">
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              <span className="text-xs font-medium">
                {partnersData.filter(p => p.status === "rejected").length} Rechazados
              </span>
            </div>
          </div>
        </div>

        {/* Tabla de socios */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tienda</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Propietario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-center">Saldo</TableHead>
                  <TableHead className="text-center">Docs.</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPartners.map(partner => (
                  <TableRow key={partner.id}>
                    <TableCell className="font-medium">{partner.storeName}</TableCell>
                    <TableCell>{getBusinessTypeLabel(partner.businessType)}</TableCell>
                    <TableCell>{partner.ownerName}</TableCell>
                    <TableCell>{getStatusBadge(partner.status)}</TableCell>
                    <TableCell className="text-center">
                      ${partner.balance.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">{partner.documents}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(partner.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewDetails(partner)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        {partner.status === "pending" && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleApproval(partner)}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredPartners.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No se encontraron socios con el filtro seleccionado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modal de detalles del socio */}
      {selectedPartner && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalles del Socio</DialogTitle>
              <DialogDescription>
                Información completa de {selectedPartner.storeName}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="services">Servicios</TabsTrigger>
                <TabsTrigger value="financials">Financiero</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Store className="h-8 w-8 text-gray-500" />
                      <div>
                        <h3 className="text-lg font-semibold">{selectedPartner.storeName}</h3>
                        <p className="text-sm text-gray-500">{getBusinessTypeLabel(selectedPartner.businessType)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <span>{selectedPartner.address}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <span>{selectedPartner.phone}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <span>{selectedPartner.email}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <span>Desde {new Date(selectedPartner.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-8 w-8 text-gray-500" />
                      <div>
                        <h3 className="text-lg font-semibold">{selectedPartner.ownerName}</h3>
                        <p className="text-sm text-gray-500">RUT: {selectedPartner.ownerRut}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Briefcase className="h-5 w-5 text-gray-500" />
                      <div>
                        <span className="block">Estado: {getStatusBadge(selectedPartner.status)}</span>
                        <span className="text-sm text-gray-500">
                          {selectedPartner.status === "approved" ? "Socio activo" : 
                           selectedPartner.status === "pending" ? "Esperando aprobación" :
                           "Solicitud rechazada"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-4 border-t border-gray-200">
                      <h4 className="font-medium mb-2">Notas</h4>
                      <p className="text-sm text-gray-600">
                        {selectedPartner.status === "approved" ? 
                          "Socio verificado y activo. Todos los documentos están en orden y ha completado la capacitación inicial." : 
                          selectedPartner.status === "pending" ? 
                          "Pendiente de validación de documentos y capacitación." :
                          "La solicitud fue rechazada debido a documentación incompleta o inconsistente."}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="services" className="py-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Equipamiento</CardTitle>
                        <CardDescription>Dispositivos y conectividad</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="space-y-0.5">
                            <Label htmlFor="hasDevice">POS físico</Label>
                            <div className="text-sm text-gray-500">
                              Dispositivo para NFC y firmas
                            </div>
                          </div>
                          <Switch 
                            id="hasDevice" 
                            checked={selectedPartner.hasDevice}
                            onCheckedChange={() => {}}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="space-y-0.5">
                            <Label htmlFor="hasInternet">Conexión a Internet</Label>
                            <div className="text-sm text-gray-500">
                              WiFi o conexión fija
                            </div>
                          </div>
                          <Switch 
                            id="hasInternet" 
                            checked={selectedPartner.hasInternet}
                            onCheckedChange={() => {}}
                          />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Servicios habilitados</CardTitle>
                        <CardDescription>Funcionalidades disponibles</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="space-y-0.5">
                            <Label htmlFor="signService">Firma de documentos</Label>
                            <div className="text-sm text-gray-500">
                              Certificación y firma digital
                            </div>
                          </div>
                          <Switch 
                            id="signService" 
                            checked={selectedPartner.status === "approved"}
                            onCheckedChange={() => {}}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="space-y-0.5">
                            <Label htmlFor="verifyService">Verificación identidad</Label>
                            <div className="text-sm text-gray-500">
                              NFC y validación biométrica
                            </div>
                          </div>
                          <Switch 
                            id="verifyService" 
                            checked={selectedPartner.hasDevice && selectedPartner.status === "approved"}
                            onCheckedChange={() => {}}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Capacitación y soporte</CardTitle>
                      <CardDescription>Estado de formación y materiales</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          {selectedPartner.status === "approved" ? 
                            <CheckCircle className="h-5 w-5 text-green-500" /> : 
                            <XCircle className="h-5 w-5 text-gray-300" />}
                          <span>Capacitación inicial completada</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {selectedPartner.status === "approved" ? 
                            <CheckCircle className="h-5 w-5 text-green-500" /> : 
                            <XCircle className="h-5 w-5 text-gray-300" />}
                          <span>Material informativo entregado</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {selectedPartner.status === "approved" && selectedPartner.documents > 10 ? 
                            <CheckCircle className="h-5 w-5 text-green-500" /> : 
                            <XCircle className="h-5 w-5 text-gray-300" />}
                          <span>Capacitación avanzada</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="financials" className="py-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                          Saldo actual
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          ${selectedPartner.balance.toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Disponible para retiro
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                          Comisión actual
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {selectedPartner.commissionRate}%
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          De cada transacción
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                          Total documentos
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {selectedPartner.documents}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Procesados a la fecha
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Historial de transacciones</CardTitle>
                      <CardDescription>
                        Últimos movimientos financieros
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedPartner.documents > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Fecha</TableHead>
                              <TableHead>Concepto</TableHead>
                              <TableHead className="text-right">Monto</TableHead>
                              <TableHead className="text-right">Comisión</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedPartner.status === "approved" && (
                              <>
                                <TableRow>
                                  <TableCell>
                                    {new Date("2025-04-25").toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>Contrato arriendo</TableCell>
                                  <TableCell className="text-right">$4,500</TableCell>
                                  <TableCell className="text-right text-green-600">+$900</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>
                                    {new Date("2025-04-20").toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>Declaración jurada</TableCell>
                                  <TableCell className="text-right">$3,900</TableCell>
                                  <TableCell className="text-right text-green-600">+$780</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>
                                    {new Date("2025-04-15").toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>Finiquito</TableCell>
                                  <TableCell className="text-right">$4,900</TableCell>
                                  <TableCell className="text-right text-green-600">+$980</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>
                                    {new Date("2025-04-10").toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>Retiro de saldo</TableCell>
                                  <TableCell className="text-right">-$10,000</TableCell>
                                  <TableCell className="text-right">$0</TableCell>
                                </TableRow>
                              </>
                            )}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="py-6 text-center text-gray-500">
                          No hay transacciones registradas
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Modal de aprobación */}
      {selectedPartner && (
        <Dialog open={isApprovalOpen} onOpenChange={setIsApprovalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aprobación de socio</DialogTitle>
              <DialogDescription>
                Revisar la solicitud de {selectedPartner.storeName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Datos de la tienda</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Nombre:</div>
                  <div>{selectedPartner.storeName}</div>
                  
                  <div className="font-medium">Tipo:</div>
                  <div>{getBusinessTypeLabel(selectedPartner.businessType)}</div>
                  
                  <div className="font-medium">Dirección:</div>
                  <div>{selectedPartner.address}</div>
                  
                  <div className="font-medium">Teléfono:</div>
                  <div>{selectedPartner.phone}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Datos del propietario</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Nombre:</div>
                  <div>{selectedPartner.ownerName}</div>
                  
                  <div className="font-medium">RUT:</div>
                  <div>{selectedPartner.ownerRut}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Configuración</h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="approve-hasDevice">Asignar POS físico</Label>
                  <Switch 
                    id="approve-hasDevice" 
                    onCheckedChange={() => {}}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="approve-commissionRate">Porcentaje de comisión</Label>
                  <Select defaultValue="20">
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="%" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="15">15%</SelectItem>
                      <SelectItem value="20">20%</SelectItem>
                      <SelectItem value="25">25%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="approve-notes">Notas internas</Label>
                <Input
                  id="approve-notes"
                  placeholder="Añade notas sobre esta solicitud (opcional)"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApprovalOpen(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setIsApprovalOpen(false)}
              >
                Rechazar
              </Button>
              <Button onClick={() => setIsApprovalOpen(false)}>
                Aprobar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </VecinosAdminLayout>
  );
};

export default VecinosPartnersPage;