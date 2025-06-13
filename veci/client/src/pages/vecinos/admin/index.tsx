import React from "react";
import { VecinosAdminLayout } from "@/components/vecinos/VecinosAdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Store,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Briefcase,
  UserPlus,
  Building,
  GanttChart,
  RotateCw,
  MapPin
} from "lucide-react";

const VecinosAdminIndexPage = () => {
  // Datos simulados para el dashboard
  const dashboardData = {
    partners: {
      total: 72,
      approved: 45,
      pending: 18,
      rejected: 9,
    },
    applications: {
      total: 26,
      draft: 8,
      pending: 15,
      pendingDocs: 3
    },
    sellers: {
      total: 12,
      active: 10
    },
    supervisors: {
      total: 4,
      active: 4
    },
    transactions: {
      total: 567,
      amount: 2_850_000,
      commissions: 427_500
    },
    documents: {
      total: 852,
      thisMonth: 143,
      pending: 38,
      completed: 782
    }
  };

  return (
    <VecinosAdminLayout title="Panel de Control">
      <div className="space-y-6">
        {/* Primera fila - Estadísticas generales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Socios Activos"
            value={dashboardData.partners.approved}
            description={`${dashboardData.partners.total} socios en total`}
            icon={<Store className="h-5 w-5 text-blue-600" />}
            trend="+12% este mes"
          />
          
          <StatsCard
            title="Solicitudes"
            value={dashboardData.applications.pending}
            description="Pendientes de revisión"
            icon={<FileText className="h-5 w-5 text-amber-600" />}
            trend={`${dashboardData.applications.total} en total`}
          />
          
          <StatsCard
            title="Documentos"
            value={dashboardData.documents.thisMonth}
            description={`${dashboardData.documents.total} documentos totales`}
            icon={<FileText className="h-5 w-5 text-green-600" />}
            trend={`${dashboardData.documents.pending} pendientes`}
          />
          
          <StatsCard
            title="Comisiones"
            value={`$${(dashboardData.transactions.commissions/1000).toLocaleString()}K`}
            description={`$${(dashboardData.transactions.amount/1000).toLocaleString()}K en transacciones`}
            icon={<CreditCard className="h-5 w-5 text-purple-600" />}
            trend="+8% respecto al mes anterior"
          />
        </div>
        
        {/* Segunda fila - Paneles principales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel izquierdo - Socios Vecinos Xpress */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">Socios Vecinos Xpress</CardTitle>
                <Link href="/vecinos/admin/partners">
                  <Button variant="ghost" size="sm" className="h-8 gap-1">
                    Ver todos
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <CardDescription>
                Estado de socios y establecimientos registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <div>
                    <h3 className="font-semibold">{dashboardData.partners.approved}</h3>
                    <p className="text-sm text-gray-500">Aprobados</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-amber-50 p-3 rounded-lg">
                  <Clock className="h-8 w-8 text-amber-500" />
                  <div>
                    <h3 className="font-semibold">{dashboardData.partners.pending}</h3>
                    <p className="text-sm text-gray-500">Pendientes</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <h3 className="font-semibold">{dashboardData.partners.rejected}</h3>
                    <p className="text-sm text-gray-500">Rechazados</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-gray-500 mb-3">Socios destacados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PartnerCard
                    name="Minimarket El Sol"
                    location="Santiago, RM"
                    type="tienda"
                    metrics={{docs: 32, balance: 15600}}
                  />
                  
                  <PartnerCard
                    name="Farmacia Vida"
                    location="Las Condes, RM"
                    type="farmacia"
                    metrics={{docs: 45, balance: 25400}}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex justify-between">
              <div className="flex flex-wrap gap-2">
                <Link href="/vecinos/admin/partners">
                  <Button variant="outline">Gestionar socios</Button>
                </Link>
                <Link href="/vecinos/admin/express-dashboard">
                  <Button>Dashboard Express</Button>
                </Link>
                <Link href="/vecinos/admin/users">
                  <Button variant="outline">Gestión de usuarios</Button>
                </Link>
                <Link href="/vecinos/admin/partner-map">
                  <Button variant="outline" className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Mapa de socios
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
          
          {/* Panel derecho - Solicitudes */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">Solicitudes</CardTitle>
                <Link href="/vecinos/admin/seller-forms">
                  <Button variant="ghost" size="sm" className="h-8 gap-1">
                    Ver todas
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <CardDescription>
                Formularios de captación por vendedores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-full">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Pendientes</h3>
                      <p className="text-2xl font-semibold">{dashboardData.applications.pending}</p>
                    </div>
                  </div>
                  <Link href="/vecinos/admin/seller-forms?tab=pending">
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Borradores</h3>
                      <p className="text-2xl font-semibold">{dashboardData.applications.draft}</p>
                    </div>
                  </div>
                  <Link href="/vecinos/admin/seller-forms?tab=draft">
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <AlertCircle className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Docs. Pendientes</h3>
                      <p className="text-2xl font-semibold">{dashboardData.applications.pendingDocs}</p>
                    </div>
                  </div>
                  <Link href="/vecinos/admin/seller-forms?tab=pending_docs">
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Link href="/vecinos/admin/seller-forms">
                <Button className="w-full">Gestionar solicitudes</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
        
        {/* Tercera fila - Equipo y Actividad */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel izquierdo - Equipo */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Equipo</CardTitle>
              <CardDescription>Supervisores y vendedores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 bg-purple-50 p-3 rounded-lg">
                  <Briefcase className="h-8 w-8 text-purple-500" />
                  <div>
                    <h3 className="font-semibold">{dashboardData.supervisors.active}</h3>
                    <p className="text-sm text-gray-500">Supervisores</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                  <User className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-semibold">{dashboardData.sellers.active}</h3>
                    <p className="text-sm text-gray-500">Vendedores</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-medium text-sm">Miembro</h3>
                  <h3 className="font-medium text-sm">Rol</h3>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-purple-600">JC</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Juan Carrasco</h4>
                      <p className="text-xs text-gray-500">RM Norte</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Supervisor</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">CM</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Carlos Mendoza</h4>
                      <p className="text-xs text-gray-500">Santiago Centro</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Vendedor</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">AS</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Ana Silva</h4>
                      <p className="text-xs text-gray-500">Providencia</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Vendedor</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex justify-between">
              <Link href="/vecinos/admin/supervisors">
                <Button variant="outline">Supervisores</Button>
              </Link>
              <Link href="/vecinos/admin/sellers">
                <Button variant="outline">Vendedores</Button>
              </Link>
              <Button variant="default" className="ml-auto">
                <UserPlus className="h-4 w-4 mr-2" />
                Añadir
              </Button>
            </CardFooter>
          </Card>
          
          {/* Panel derecho - Actividad */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Actividad Reciente</CardTitle>
              <CardDescription>Últimas acciones en la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-1.5 rounded-full h-7 w-7 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Socio aprobado</h4>
                    <p className="text-xs text-gray-500">Carlos aprobó a Farmacia Vida como socio Vecinos Xpress</p>
                    <p className="text-xs text-gray-400 mt-1">Hace 2 horas</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-1.5 rounded-full h-7 w-7 flex items-center justify-center flex-shrink-0 mt-1">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Nueva solicitud</h4>
                    <p className="text-xs text-gray-500">Ana creó una solicitud para Verdulería Doña Rosa</p>
                    <p className="text-xs text-gray-400 mt-1">Hace 5 horas</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-1.5 rounded-full h-7 w-7 flex items-center justify-center flex-shrink-0 mt-1">
                    <Building className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Documentos completados</h4>
                    <p className="text-xs text-gray-500">Minimarket El Sol procesó 5 nuevos documentos</p>
                    <p className="text-xs text-gray-400 mt-1">Hace 1 día</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 p-1.5 rounded-full h-7 w-7 flex items-center justify-center flex-shrink-0 mt-1">
                    <GanttChart className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Informe generado</h4>
                    <p className="text-xs text-gray-500">Informe mensual de comisiones generado automáticamente</p>
                    <p className="text-xs text-gray-400 mt-1">Hace 2 días</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full">
                <RotateCw className="h-4 w-4 mr-2" />
                Cargar más actividad
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </VecinosAdminLayout>
  );
};

// Componente de tarjeta de estadísticas
interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: string;
}

const StatsCard = ({ title, value, description, icon, trend }: StatsCardProps) => {
  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-[#2d219b]">{value}</h3>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div className="p-2 bg-[#2d219b] bg-opacity-10 rounded-full">
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-4 text-xs font-medium text-[#2d219b]">
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente de tarjeta de socio
interface PartnerCardProps {
  name: string;
  location: string;
  type: string;
  metrics: {
    docs: number;
    balance: number;
  };
}

const PartnerCard = ({ name, location, type, metrics }: PartnerCardProps) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "tienda":
        return <Store className="h-4 w-4 text-blue-600" />;
      case "farmacia":
        return <Building className="h-4 w-4 text-green-600" />;
      default:
        return <Building className="h-4 w-4 text-gray-600" />;
    }
  };
  
  const getTypeLabel = (type: string) => {
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
    <div className="border border-[#e0deff] bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-[#2d219b]">{name}</h3>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{location}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            {getTypeIcon(type)}
            <span className="ml-1">{getTypeLabel(type)}</span>
          </div>
        </div>
        <Badge className="bg-[#deffde] text-green-800 hover:bg-[#deffde]">Activo</Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-3 text-center">
        <div className="bg-[#f9f8ff] p-2 rounded">
          <p className="text-xs text-gray-500">Documentos</p>
          <p className="font-semibold text-[#2d219b]">{metrics.docs}</p>
        </div>
        <div className="bg-[#f9f8ff] p-2 rounded">
          <p className="text-xs text-gray-500">Saldo</p>
          <p className="font-semibold text-[#2d219b]">${metrics.balance.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default VecinosAdminIndexPage;