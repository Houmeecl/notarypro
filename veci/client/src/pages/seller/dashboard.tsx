import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Target, 
  Store, 
  Calendar, 
  ChevronRight,
  Check,
  Clock,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  BellRing,
  BarChart,
  Trophy,
  CalendarCheck,
  User2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import SellerLayout from "@/components/seller/SellerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SellerDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [newLead, setNewLead] = useState({
    businessName: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  // Obtener información del vendedor
  const { data: sellerInfo, isLoading: isLoadingSeller } = useQuery({
    queryKey: ['/api/seller/profile'],
  });

  // Obtener leads asignados
  const { data: leads, isLoading: isLoadingLeads } = useQuery({
    queryKey: ['/api/seller/leads'],
  });

  // Obtener socios gestionados
  const { data: partners, isLoading: isLoadingPartners } = useQuery({
    queryKey: ['/api/seller/partners'],
  });

  // Obtener visitas programadas
  const { data: visits, isLoading: isLoadingVisits } = useQuery({
    queryKey: ['/api/seller/visits'],
  });

  // Manejar envío de nuevo lead
  const handleSubmitLead = () => {
    // Aquí se enviaría a la API
    toast({
      title: "Lead registrado",
      description: "El nuevo prospecto ha sido registrado exitosamente",
    });
    setShowLeadDialog(false);
    setNewLead({
      businessName: '',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      notes: ''
    });
  };

  return (
    <SellerLayout title="Panel de Vendedor">
      <div className="container mx-auto py-6">
        {/* Información del vendedor */}
        <div className="bg-white border border-gray-100 rounded-md shadow-sm p-5 mb-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                ¡Bienvenido, {sellerInfo?.fullName || user?.username}!
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Zona asignada: <span className="font-medium text-gray-700">{sellerInfo?.zone || 'Zona Norte'}</span>
                <span className="mx-2">•</span>
                Supervisor: <span className="font-medium text-gray-700">{sellerInfo?.supervisorName || 'Alex Morales'}</span>
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowLeadDialog(true)}
              >
                <Target className="h-4 w-4 mr-2" />
                Registrar nuevo lead
              </Button>
            </div>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-gray-800 font-medium flex items-center">
                <Target className="mr-2 h-5 w-5 text-green-500" />
                Leads Activos
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-semibold text-gray-900">{leads?.active || 8}</div>
              <p className="text-sm text-gray-500 mt-1">
                {leads?.new || 3} nuevos este mes
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-gray-800 font-medium flex items-center">
                <Store className="mr-2 h-5 w-5 text-blue-500" />
                Socios Activos
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-semibold text-gray-900">{partners?.active || 12}</div>
              <p className="text-sm text-gray-500 mt-1">
                {partners?.new || 2} incorporaciones recientes
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-gray-800 font-medium flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-purple-500" />
                Visitas Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-semibold text-gray-900">{visits?.pending || 5}</div>
              <p className="text-sm text-gray-500 mt-1">
                {visits?.today || 2} programadas para hoy
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-gray-800 font-medium flex items-center">
                <BarChart className="mr-2 h-5 w-5 text-orange-500" />
                Meta Mensual
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-semibold text-gray-900">{sellerInfo?.quota?.achieved || 65}%</div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-orange-500 h-2.5 rounded-full" 
                  style={{ width: `${sellerInfo?.quota?.achieved || 65}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Próximas visitas */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Próximas Visitas</h2>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 text-sm"
              onClick={() => setLocation("/seller/visits")}
            >
              Ver agenda <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-100 rounded-md p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <CalendarCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Farmacia Vida</h3>
                    <p className="text-xs text-gray-500">Visita de seguimiento</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-0 font-normal text-xs">Hoy</Badge>
              </div>
              <div className="pl-13 ml-0">
                <div className="flex items-center text-sm text-gray-600 mb-1.5">
                  <Clock className="h-3.5 w-3.5 mr-2 text-gray-400" />
                  <span>14:30 - 15:30</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-1.5">
                  <MapPin className="h-3.5 w-3.5 mr-2 text-gray-400" />
                  <span>Av. Providencia 1243, Providencia</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <User2 className="h-3.5 w-3.5 mr-2 text-gray-400" />
                  <span>Contacto: María Jiménez</span>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" className="h-8 text-xs mr-2">
                  <Phone className="h-3.5 w-3.5 mr-1.5" />
                  Llamar
                </Button>
                <Button size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700">
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Completar visita
                </Button>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-md p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                    <CalendarCheck className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Librería Central</h3>
                    <p className="text-xs text-gray-500">Presentación de servicios</p>
                  </div>
                </div>
                <Badge className="bg-purple-100 text-purple-700 border-0 font-normal text-xs">Mañana</Badge>
              </div>
              <div className="pl-13 ml-0">
                <div className="flex items-center text-sm text-gray-600 mb-1.5">
                  <Clock className="h-3.5 w-3.5 mr-2 text-gray-400" />
                  <span>10:00 - 11:00</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-1.5">
                  <MapPin className="h-3.5 w-3.5 mr-2 text-gray-400" />
                  <span>Paseo las Palmas 2520, Las Condes</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <User2 className="h-3.5 w-3.5 mr-2 text-gray-400" />
                  <span>Contacto: Carlos Rojas</span>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" className="h-8 text-xs mr-2">
                  <Phone className="h-3.5 w-3.5 mr-1.5" />
                  Llamar
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Mail className="h-3.5 w-3.5 mr-1.5" />
                  Email
                </Button>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-md p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <CalendarCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Mini Market El Sol</h3>
                    <p className="text-xs text-gray-500">Capacitación equipo</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-0 font-normal text-xs">23/05</Badge>
              </div>
              <div className="pl-13 ml-0">
                <div className="flex items-center text-sm text-gray-600 mb-1.5">
                  <Clock className="h-3.5 w-3.5 mr-2 text-gray-400" />
                  <span>16:00 - 17:30</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-1.5">
                  <MapPin className="h-3.5 w-3.5 mr-2 text-gray-400" />
                  <span>San Pablo 8756, Pudahuel</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <User2 className="h-3.5 w-3.5 mr-2 text-gray-400" />
                  <span>Contacto: Javier Mendoza</span>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" className="h-8 text-xs mr-2">
                  <Phone className="h-3.5 w-3.5 mr-1.5" />
                  Llamar
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <BellRing className="h-3.5 w-3.5 mr-1.5" />
                  Recordatorio
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Leads recientes */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Leads Recientes</h2>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 text-sm"
              onClick={() => setLocation("/seller/leads")}
            >
              Ver todos <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="bg-white border border-gray-100 rounded-md shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-48">Negocio</TableHead>
                    <TableHead className="text-xs">Contacto</TableHead>
                    <TableHead className="text-xs">Teléfono</TableHead>
                    <TableHead className="text-xs">Estado</TableHead>
                    <TableHead className="text-xs">Fecha</TableHead>
                    <TableHead className="text-xs w-20">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="text-sm">
                    <TableCell className="font-medium">Café Internet Express</TableCell>
                    <TableCell>Ana Martínez</TableCell>
                    <TableCell>+56 9 8765 4321</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700 text-xs font-normal">
                        Contacto inicial
                      </Badge>
                    </TableCell>
                    <TableCell>15/05/2025</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => setLocation(`/seller/leads/1`)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow className="text-sm">
                    <TableCell className="font-medium">Papelería Modelo</TableCell>
                    <TableCell>Roberto Gómez</TableCell>
                    <TableCell>+56 9 1234 5678</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 text-xs font-normal">
                        Reunión agendada
                      </Badge>
                    </TableCell>
                    <TableCell>12/05/2025</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => setLocation(`/seller/leads/2`)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow className="text-sm">
                    <TableCell className="font-medium">Kiosco La Esquina</TableCell>
                    <TableCell>Patricia Lagos</TableCell>
                    <TableCell>+56 9 5555 6789</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 text-xs font-normal">
                        Propuesta enviada
                      </Badge>
                    </TableCell>
                    <TableCell>08/05/2025</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => setLocation(`/seller/leads/3`)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Progreso y reconocimientos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-gray-800 font-medium">
                <BarChart className="mr-2 h-5 w-5 text-blue-500" />
                Cumplimiento de Metas
              </CardTitle>
              <CardDescription>
                Progreso mensual y objetivos asignados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="text-sm font-medium">Captación de Socios</div>
                    <div className="text-sm font-medium">4 / 6</div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full w-[66%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="text-sm font-medium">Nuevos Leads</div>
                    <div className="text-sm font-medium">12 / 15</div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full w-[80%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="text-sm font-medium">Visitas Realizadas</div>
                    <div className="text-sm font-medium">18 / 25</div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-purple-500 h-2.5 rounded-full w-[72%]"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-gray-800 font-medium">
                <Trophy className="mr-2 h-5 w-5 text-amber-500" />
                Logros y Reconocimientos
              </CardTitle>
              <CardDescription>
                Tus logros más recientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start border-l-2 border-amber-300 pl-3 py-1">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Vendedor del Mes - Abril 2025</p>
                    <p className="text-xs text-gray-500">Mayor número de socios incorporados</p>
                  </div>
                </div>
                <div className="flex items-start border-l-2 border-blue-300 pl-3 py-1">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Meta de Leads Superada</p>
                    <p className="text-xs text-gray-500">110% de cumplimiento en el último trimestre</p>
                  </div>
                </div>
                <div className="flex items-start border-l-2 border-green-300 pl-3 py-1">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Certificación Avanzada</p>
                    <p className="text-xs text-gray-500">Completaste la capacitación en servicios NotaryPro</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog para nuevo lead */}
      <Dialog open={showLeadDialog} onOpenChange={setShowLeadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Lead</DialogTitle>
            <DialogDescription>
              Ingrese la información del nuevo prospecto de negocio.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">Nombre del Negocio</Label>
                <Input 
                  id="businessName" 
                  value={newLead.businessName}
                  onChange={(e) => setNewLead({...newLead, businessName: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contactName">Persona de Contacto</Label>
                <Input 
                  id="contactName" 
                  value={newLead.contactName}
                  onChange={(e) => setNewLead({...newLead, contactName: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input 
                  id="phone" 
                  value={newLead.phone}
                  onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input 
                id="address" 
                value={newLead.address}
                onChange={(e) => setNewLead({...newLead, address: e.target.value})}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea 
                id="notes" 
                value={newLead.notes}
                onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeadDialog(false)}>Cancelar</Button>
            <Button onClick={handleSubmitLead} className="bg-green-600 hover:bg-green-700">Guardar Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SellerLayout>
  );
}