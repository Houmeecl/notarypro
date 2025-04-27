import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Check, 
  X, 
  ChevronRight, 
  ChevronDown, 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  Building, 
  AlertCircle,
  Calendar
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Datos de muestra para las solicitudes de socios Vecinos
const mockApplications = [
  {
    id: 1,
    businessName: "Minimarket Los Alerces",
    businessType: "Minimarket",
    ownerName: "María Fernández",
    email: "maria@losalercesminimarket.cl",
    phone: "+56 9 8765 4321",
    address: "Av. Los Alerces 123, Providencia",
    city: "Santiago",
    rut: "12.345.678-9",
    bankName: "Banco Estado",
    bankAccount: "12345678901",
    status: "pending",
    createdAt: "2025-04-25T14:30:00Z"
  },
  {
    id: 2,
    businessName: "Librería San Francisco",
    businessType: "Librería",
    ownerName: "Juan Pérez",
    email: "juan@libreriasfco.cl",
    phone: "+56 9 1234 5678",
    address: "San Francisco 789, Santiago",
    city: "Santiago",
    rut: "9.876.543-2",
    bankName: "Banco de Chile",
    bankAccount: "98765432109",
    status: "approved",
    createdAt: "2025-04-23T10:15:00Z",
    approvedAt: "2025-04-24T09:30:00Z",
    supervisorName: "Carmen Silva",
    equipmentDelivered: false,
    deliveryDate: null
  },
  {
    id: 3,
    businessName: "Ferretería Central",
    businessType: "Ferretería",
    ownerName: "Roberto González",
    email: "roberto@ferreteriacentral.cl",
    phone: "+56 9 5555 7777",
    address: "Calle Central 456, Las Condes",
    city: "Santiago",
    rut: "14.785.236-9",
    bankName: "Santander",
    bankAccount: "14785236900",
    status: "rejected",
    createdAt: "2025-04-22T16:45:00Z",
    rejectedAt: "2025-04-23T11:20:00Z",
    rejectionReason: "Ubicación ya cubierta por otro socio en un radio de 500 metros"
  },
  {
    id: 4,
    businessName: "Farmacia Salud Total",
    businessType: "Farmacia",
    ownerName: "Ana Martínez",
    email: "ana@farmaciasaludtotal.cl",
    phone: "+56 9 3333 4444",
    address: "Av. Salud 567, Ñuñoa",
    city: "Santiago",
    rut: "18.765.432-1",
    bankName: "Scotiabank",
    bankAccount: "18765432100",
    status: "approved",
    createdAt: "2025-04-21T09:00:00Z",
    approvedAt: "2025-04-22T14:10:00Z",
    supervisorName: "Carmen Silva",
    equipmentDelivered: true,
    deliveryDate: "2025-04-26T11:00:00Z"
  }
];

export default function PartnerApplications() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [applications, setApplications] = useState(mockApplications);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [rejectionDialog, setRejectionDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [deliveryDialog, setDeliveryDialog] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  // Filtrar aplicaciones según pestaña activa
  const filteredApplications = applications.filter(app => {
    if (activeTab === "all") return true;
    return app.status === activeTab;
  });

  const handleApprove = (applicationId) => {
    setApplications(applications.map(app => 
      app.id === applicationId 
        ? {...app, 
            status: "approved", 
            approvedAt: new Date().toISOString(),
            supervisorName: "Carmen Silva" // Nombre de la supervisora actual
          } 
        : app
    ));
    setApprovalDialog(false);
    
    // Mostrar toast de confirmación
    toast({
      title: "Solicitud aprobada",
      description: "Se ha enviado un correo al socio con sus credenciales de acceso",
      variant: "success"
    });
  };

  const handleReject = (applicationId) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Debe proporcionar un motivo para el rechazo",
        variant: "destructive"
      });
      return;
    }
    
    setApplications(applications.map(app => 
      app.id === applicationId 
        ? {...app, 
            status: "rejected", 
            rejectedAt: new Date().toISOString(),
            rejectionReason
          } 
        : app
    ));
    setRejectionDialog(false);
    setRejectionReason("");
    
    // Mostrar toast de confirmación
    toast({
      title: "Solicitud rechazada",
      description: "Se ha enviado un correo al socio con la notificación",
      variant: "destructive"
    });
  };

  const handleScheduleDelivery = (applicationId) => {
    if (!deliveryDate) {
      toast({
        title: "Error",
        description: "Debe seleccionar una fecha de entrega",
        variant: "destructive"
      });
      return;
    }
    
    setApplications(applications.map(app => 
      app.id === applicationId 
        ? {...app, 
            equipmentDelivered: false,
            deliveryDate: new Date(deliveryDate).toISOString(),
            deliveryNote: deliveryNote
          } 
        : app
    ));
    setDeliveryDialog(false);
    setDeliveryDate("");
    setDeliveryNote("");
    
    // Mostrar toast de confirmación
    toast({
      title: "Entrega programada",
      description: "Se ha notificado al socio sobre la fecha de entrega",
      variant: "success"
    });
  };

  const handleConfirmDelivery = (applicationId) => {
    setApplications(applications.map(app => 
      app.id === applicationId 
        ? {...app, equipmentDelivered: true} 
        : app
    ));
    
    // Mostrar toast de confirmación
    toast({
      title: "Entrega confirmada",
      description: "El socio ahora está completamente activo en el sistema",
      variant: "success"
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Solicitudes de Socios Vecinos</h1>
          <p className="text-gray-500 mt-2">
            Gestione las solicitudes de negocios para unirse al programa Vecinos NotaryPro Express
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pendientes</p>
                  <p className="text-2xl font-bold">{applications.filter(a => a.status === 'pending').length}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Aprobadas</p>
                  <p className="text-2xl font-bold">{applications.filter(a => a.status === 'approved').length}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Equipos entregados</p>
                  <p className="text-2xl font-bold">{applications.filter(a => a.equipmentDelivered).length}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Rechazadas</p>
                  <p className="text-2xl font-bold">{applications.filter(a => a.status === 'rejected').length}</p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pestañas para filtrar solicitudes */}
        <Tabs defaultValue="pending" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="approved">Aprobadas</TabsTrigger>
            <TabsTrigger value="rejected">Rechazadas</TabsTrigger>
            <TabsTrigger value="all">Todas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-6">
            {renderApplicationsList(filteredApplications)}
          </TabsContent>
          
          <TabsContent value="approved" className="mt-6">
            {renderApplicationsList(filteredApplications)}
          </TabsContent>
          
          <TabsContent value="rejected" className="mt-6">
            {renderApplicationsList(filteredApplications)}
          </TabsContent>
          
          <TabsContent value="all" className="mt-6">
            {renderApplicationsList(filteredApplications)}
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogos para gestión de solicitudes */}
      <Dialog open={approvalDialog} onOpenChange={setApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprobar solicitud</DialogTitle>
            <DialogDescription>
              Al aprobar esta solicitud, se enviará automáticamente un correo al socio con sus credenciales de acceso al sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2"><strong>Negocio:</strong> {selectedApplication?.businessName}</p>
            <p className="mb-2"><strong>Propietario:</strong> {selectedApplication?.ownerName}</p>
            <p className="mb-4"><strong>Correo:</strong> {selectedApplication?.email}</p>
            
            <div className="p-3 bg-blue-50 rounded-md text-blue-800 text-sm">
              <AlertCircle className="inline-block h-4 w-4 mr-2" />
              Después de aprobar la solicitud, deberá programar la entrega del equipo.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialog(false)}>Cancelar</Button>
            <Button onClick={() => handleApprove(selectedApplication?.id)} className="bg-primary hover:bg-red-700">
              Aprobar solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectionDialog} onOpenChange={setRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar solicitud</DialogTitle>
            <DialogDescription>
              Por favor, indique el motivo del rechazo. Esta información será enviada al solicitante.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2"><strong>Negocio:</strong> {selectedApplication?.businessName}</p>
            <p className="mb-2"><strong>Propietario:</strong> {selectedApplication?.ownerName}</p>
            <p className="mb-4"><strong>Correo:</strong> {selectedApplication?.email}</p>
            
            <Label htmlFor="rejectionReason">Motivo del rechazo</Label>
            <Textarea 
              id="rejectionReason" 
              value={rejectionReason} 
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explique por qué se rechaza esta solicitud..."
              className="mt-2"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectionDialog(false)}>Cancelar</Button>
            <Button onClick={() => handleReject(selectedApplication?.id)} variant="destructive">
              Rechazar solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deliveryDialog} onOpenChange={setDeliveryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Programar entrega de equipo</DialogTitle>
            <DialogDescription>
              Indique cuándo se realizará la entrega del equipo al socio.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2"><strong>Negocio:</strong> {selectedApplication?.businessName}</p>
            <p className="mb-2"><strong>Propietario:</strong> {selectedApplication?.ownerName}</p>
            <p className="mb-4"><strong>Dirección:</strong> {selectedApplication?.address}, {selectedApplication?.city}</p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="deliveryDate">Fecha y hora de entrega</Label>
                <Input 
                  id="deliveryDate" 
                  type="datetime-local" 
                  value={deliveryDate} 
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="deliveryNote">Notas adicionales (opcional)</Label>
                <Textarea 
                  id="deliveryNote" 
                  value={deliveryNote} 
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="Instrucciones adicionales para la entrega..."
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeliveryDialog(false)}>Cancelar</Button>
            <Button onClick={() => handleScheduleDelivery(selectedApplication?.id)} className="bg-primary hover:bg-red-700">
              Programar entrega
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Función para renderizar la lista de solicitudes
  function renderApplicationsList(applications) {
    if (applications.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay solicitudes en esta categoría</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map(application => (
          <Card key={application.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{application.businessName}</CardTitle>
                  <CardDescription>{application.businessType}</CardDescription>
                </div>
                {renderStatusBadge(application.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="flex items-center text-sm">
                  <Building className="h-4 w-4 mr-2 text-gray-500" />
                  {application.ownerName}
                </p>
                <p className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  {application.email}
                </p>
                <p className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  {application.phone}
                </p>
                <p className="flex items-start text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                  <span>{application.address}, {application.city}</span>
                </p>
                <p className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  {new Date(application.createdAt).toLocaleString('es-CL')}
                </p>
              </div>

              {application.status === 'rejected' && (
                <div className="mt-4 p-3 bg-red-50 rounded-md">
                  <p className="text-sm font-medium text-red-800">Motivo del rechazo:</p>
                  <p className="text-sm text-red-700">{application.rejectionReason}</p>
                </div>
              )}

              {application.status === 'approved' && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium">Estado de equipamiento:</p>
                  <p className="text-sm">
                    {application.equipmentDelivered ? (
                      <span className="text-green-600 flex items-center mt-1">
                        <Check className="h-4 w-4 mr-1" /> Entregado
                      </span>
                    ) : application.deliveryDate ? (
                      <span className="text-blue-600">
                        Entrega programada: {new Date(application.deliveryDate).toLocaleString('es-CL')}
                      </span>
                    ) : (
                      <span className="text-orange-600">Pendiente de programar entrega</span>
                    )}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-gray-50 border-t px-6 py-3">
              {application.status === 'pending' && (
                <div className="flex space-x-2 w-full">
                  <Button 
                    onClick={() => {
                      setSelectedApplication(application);
                      setRejectionDialog(true);
                    }}
                    variant="outline" 
                    className="flex-1"
                  >
                    Rechazar
                  </Button>
                  <Button 
                    onClick={() => {
                      setSelectedApplication(application);
                      setApprovalDialog(true);
                    }}
                    className="flex-1 bg-primary hover:bg-red-700"
                  >
                    Aprobar
                  </Button>
                </div>
              )}

              {application.status === 'approved' && !application.deliveryDate && (
                <Button 
                  onClick={() => {
                    setSelectedApplication(application);
                    setDeliveryDialog(true);
                  }}
                  className="w-full"
                >
                  Programar entrega
                </Button>
              )}

              {application.status === 'approved' && application.deliveryDate && !application.equipmentDelivered && (
                <Button 
                  onClick={() => handleConfirmDelivery(application.id)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Confirmar entrega realizada
                </Button>
              )}

              {application.status === 'approved' && application.equipmentDelivered && (
                <div className="w-full text-center text-green-600 font-medium">
                  Socio completamente activado
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // Función para renderizar el badge de estado
  function renderStatusBadge(status) {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">Pendiente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Aprobada</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Rechazada</Badge>;
      default:
        return null;
    }
  }
}