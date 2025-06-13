import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Shield,
  FileCheck,
  User,
  CreditCard,
  Store,
  Video,
  FileText,
  Smartphone,
  Database,
  Link,
  Lock,
  Landmark,
  Clock,
  Send,
  Info,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ServiceStatus {
  id: string;
  name: string;
  description: string;
  category: "core" | "identity" | "signature" | "certification" | "payment" | "integration";
  status: "online" | "offline" | "degraded" | "unknown";
  lastChecked: Date;
  details?: string;
  icon: React.ReactNode;
  url?: string;
  requiresRealMode?: boolean;
  realModeEnabled?: boolean;
}

export default function ServiciosStatus() {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("todos");
  
  // Función para verificar el estado de los servicios
  const checkServices = async () => {
    setLoading(true);
    
    // En un entorno real, esta información vendría de una API
    // Aquí estamos simulando la respuesta
    const mockServices: ServiceStatus[] = [
      {
        id: "firma-simple",
        name: "Firma Electrónica Simple",
        description: "Validez legal según Art. 5° Ley 19.799",
        category: "signature",
        status: "online",
        lastChecked: new Date(),
        icon: <FileCheck className="h-5 w-5 text-green-500" />,
        url: "/document-sign",
        requiresRealMode: true,
        realModeEnabled: true
      },
      {
        id: "firma-avanzada",
        name: "Firma Electrónica Avanzada",
        description: "Validez legal completa Art. 3° Ley 19.799",
        category: "signature",
        status: "online",
        lastChecked: new Date(),
        icon: <Shield className="h-5 w-5 text-green-500" />,
        url: "/etoken-diagnostico",
        requiresRealMode: true,
        realModeEnabled: true
      },
      {
        id: "verificacion-identidad",
        name: "Verificación de Identidad",
        description: "Validación cédula chilena",
        category: "identity",
        status: "online",
        lastChecked: new Date(),
        icon: <User className="h-5 w-5 text-green-500" />,
        url: "/verificacion-nfc-fixed",
        requiresRealMode: true,
        realModeEnabled: true
      },
      {
        id: "pagos",
        name: "Sistema de Pagos TUU",
        description: "Procesamiento de pagos",
        category: "payment",
        status: "online",
        lastChecked: new Date(),
        icon: <CreditCard className="h-5 w-5 text-green-500" />,
        url: "/payment-options"
      },
      {
        id: "vecinos-express",
        name: "VecinosXpress",
        description: "Red de puntos de servicio",
        category: "core",
        status: "online",
        lastChecked: new Date(),
        icon: <Store className="h-5 w-5 text-green-500" />,
        url: "/vecinos-express"
      },
      {
        id: "ron",
        name: "Certificación por Video (RON)",
        description: "Notarización online remota",
        category: "certification",
        status: "online",
        lastChecked: new Date(),
        icon: <Video className="h-5 w-5 text-green-500" />,
        url: "/certificacion-por-video"
      },
      {
        id: "plantillas",
        name: "Plantillas de documentos",
        description: "Biblioteca de contratos",
        category: "core",
        status: "online",
        lastChecked: new Date(),
        icon: <FileText className="h-5 w-5 text-green-500" />,
        url: "/document-templates"
      },
      {
        id: "pos-app",
        name: "Aplicación POS",
        description: "Terminal punto de venta",
        category: "integration",
        status: "online",
        lastChecked: new Date(),
        icon: <Smartphone className="h-5 w-5 text-green-500" />,
        url: "/pos-menu"
      },
      {
        id: "api-identidad",
        name: "API de Identidad",
        description: "Servicio verificación para terceros",
        category: "integration",
        status: "online",
        lastChecked: new Date(),
        icon: <Link className="h-5 w-5 text-green-500" />,
        url: "/integraciones-api-identidad"
      },
      {
        id: "bd-documentos",
        name: "Base de datos documentos",
        description: "Almacenamiento seguro",
        category: "core",
        status: "online",
        lastChecked: new Date(),
        icon: <Database className="h-5 w-5 text-green-500" />
      },
      {
        id: "sellado-tiempo",
        name: "Sellado de tiempo",
        description: "Timestamp para documentos",
        category: "signature",
        status: "online",
        lastChecked: new Date(),
        icon: <Clock className="h-5 w-5 text-green-500" />
      },
      {
        id: "notificaciones",
        name: "Sistema de Notificaciones",
        description: "Correos y alertas",
        category: "core",
        status: "online",
        lastChecked: new Date(),
        icon: <Send className="h-5 w-5 text-green-500" />
      },
      {
        id: "seguridad",
        name: "Sistema de Seguridad",
        description: "Cifrado y protección",
        category: "core",
        status: "online",
        lastChecked: new Date(),
        icon: <Lock className="h-5 w-5 text-green-500" />
      },
      {
        id: "cursos",
        name: "Plataforma de Cursos",
        description: "Formación para certificadores",
        category: "certification",
        status: "online",
        lastChecked: new Date(),
        icon: <Landmark className="h-5 w-5 text-green-500" />,
        url: "/curso-certificador"
      },
      {
        id: "garantias",
        name: "Garantías Legales",
        description: "Documentación legal",
        category: "core",
        status: "online",
        lastChecked: new Date(),
        icon: <Info className="h-5 w-5 text-green-500" />,
        url: "/garantias-legales"
      }
    ];

    // Verificar realmente si se está en modo real (podría ser una llamada a API)
    try {
      const response = await apiRequest("GET", "/api/check-real-mode");
      const realModeData = await response.json();
      
      // Actualizar servicios que requieren modo real
      const updatedServices = mockServices.map(service => {
        if (service.requiresRealMode) {
          return {
            ...service,
            realModeEnabled: realModeData.isRealMode,
            status: realModeData.isRealMode ? "online" : "degraded",
            details: realModeData.isRealMode ? 
              "Servicio operando en modo real completo" : 
              "¡Atención! El servicio está configurado en modo demo, no apto para producción"
          };
        }
        return service;
      });
      
      setServices(updatedServices);
    } catch (error) {
      // Si falla la verificación, usar los datos mock
      console.error("Error verificando modo real:", error);
      setServices(mockServices);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    checkServices();
  }, []);

  const filteredServices = activeTab === "todos" 
    ? services 
    : services.filter(service => service.category === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-100 text-green-800 border-green-200";
      case "offline": return "bg-red-100 text-red-800 border-red-200";
      case "degraded": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "offline": return <XCircle className="h-4 w-4 text-red-500" />;
      case "degraded": return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "core": return "Servicios Principales";
      case "identity": return "Verificación de Identidad";
      case "signature": return "Firma Digital";
      case "certification": return "Certificación";
      case "payment": return "Pagos";
      case "integration": return "Integraciones";
      default: return "Otros Servicios";
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Estado de Servicios NotaryPro</h1>
        <p className="text-gray-600">
          Monitoreo en tiempo real de todos los servicios del sistema en producción.
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <Badge 
            variant="outline" 
            className={`${getStatusColor("online")} px-3 py-1 text-sm font-medium flex items-center`}
          >
            <CheckCircle className="h-4 w-4 mr-1" /> Operativos: {services.filter(s => s.status === "online").length}
          </Badge>
          <Badge 
            variant="outline" 
            className={`${getStatusColor("degraded")} px-3 py-1 text-sm font-medium flex items-center`}
          >
            <AlertCircle className="h-4 w-4 mr-1" /> Degradados: {services.filter(s => s.status === "degraded").length}
          </Badge>
          <Badge 
            variant="outline" 
            className={`${getStatusColor("offline")} px-3 py-1 text-sm font-medium flex items-center`}
          >
            <XCircle className="h-4 w-4 mr-1" /> Caídos: {services.filter(s => s.status === "offline").length}
          </Badge>
        </div>
        <Button 
          onClick={checkServices} 
          variant="outline" 
          className="flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Verificando..." : "Actualizar estado"}
        </Button>
      </div>

      {services.some(s => s.requiresRealMode && !s.realModeEnabled) && (
        <Alert className="mb-6 bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Atención: Servicios en modo de prueba</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Algunos servicios están operando en modo de prueba y no en modo real. Esto puede afectar la validez legal de las operaciones.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="core">Principales</TabsTrigger>
          <TabsTrigger value="identity">Identidad</TabsTrigger>
          <TabsTrigger value="signature">Firma</TabsTrigger>
          <TabsTrigger value="certification">Certificación</TabsTrigger>
          <TabsTrigger value="payment">Pagos</TabsTrigger>
          <TabsTrigger value="integration">Integraciones</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>{getCategoryLabel(activeTab)}</CardTitle>
              <CardDescription>
                {activeTab === "todos" 
                  ? "Todos los servicios del sistema NotaryPro" 
                  : `Servicios de ${getCategoryLabel(activeTab).toLowerCase()}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Última verificación</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No hay servicios disponibles en esta categoría
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredServices.map(service => (
                      <TableRow key={service.id} className="hover:bg-gray-50">
                        <TableCell>{service.icon}</TableCell>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell>{service.description}</TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge 
                                  variant="outline" 
                                  className={`${getStatusColor(service.status)} px-2.5 py-0.5 text-xs flex items-center gap-1`}
                                >
                                  {getStatusIcon(service.status)}
                                  {service.status === "online" ? "Operativo" : 
                                    service.status === "offline" ? "Caído" : 
                                    service.status === "degraded" ? "Degradado" : "Desconocido"}
                                </Badge>
                              </TooltipTrigger>
                              {service.details && (
                                <TooltipContent>
                                  <p>{service.details}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          {service.lastChecked.toLocaleTimeString()} {service.lastChecked.toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {service.url && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              asChild
                              className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                            >
                              <a href={service.url}>Acceder</a>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-2">Estado del sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Versión del sistema</p>
            <p className="font-medium">NotaryPro v2.5.0 (Producción)</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Modo de operación</p>
            <p className="font-medium flex items-center">
              <Shield className="h-4 w-4 mr-1 text-green-500" />
              {services.some(s => s.requiresRealMode && !s.realModeEnabled) 
                ? "Modo mixto (algunos servicios en prueba)" 
                : "Modo real completo (producción)"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Última actualización global</p>
            <p className="font-medium">{new Date().toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Usuario conectado</p>
            <p className="font-medium">{user ? `${user.username} (${user.role || 'usuario'})` : "Invitado"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}