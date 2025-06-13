import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import VecinosLayout from '@/components/vecinos/VecinosLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Store, 
  CreditCard, 
  Smartphone, 
  Newspaper, 
  Book, 
  User, 
  ClipboardList,
  BarChart4,
  FileText,
  Calendar,
  Users,
  HelpCircle,
  LogOut,
  Globe,
  ArrowRight,
  Clock,
  DollarSign
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PartnerInfo {
  id: number;
  username: string;
  storeName: string;
  storeAddress: string;
  storeCode: string;
  balance: number;
  totalDocuments: number;
  pendingDocuments: number;
  lastLogin: string;
}

export default function VecinosDashboard() {
  const [, setLocation] = useLocation();
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirección directa a la aplicación real (POS)
    window.location.href = "/partners/webapp-pos-official";
    return;
    
    // El código a continuación no se ejecutará debido al return
    // Verificar si hay token almacenado
    const token = localStorage.getItem('vecinos_token');
    if (!token) {
      setLocation('/vecinos/login');
      return;
    }

    // Cargar datos del socio
    const fetchPartnerData = async () => {
      try {
        const res = await apiRequest('GET', '/api/vecinos/partner-info');
        if (!res.ok) {
          throw new Error('No se pudo obtener la información del socio');
        }
        const data = await res.json();
        setPartnerInfo(data);
      } catch (error) {
        console.error('Error al cargar datos del socio:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar la información de tu cuenta',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartnerData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vecinos_token');
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente',
    });
    setLocation('/vecinos/login');
  };

  // Renderizar pantalla de carga
  if (isLoading) {
    return (
      <VecinosLayout title="Cargando...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </VecinosLayout>
    );
  }

  return (
    <VecinosLayout title="Panel de Socio" showNavigation>
      {/* Saludo y datos del socio */}
      <div className="mb-6 bg-zinc-100 rounded-lg p-5 shadow-sm">
        <h2 className="text-xl font-bold mb-1">Bienvenido, {partnerInfo?.username}</h2>
        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <div>
            <p className="text-zinc-600">
              <Store className="inline-block mr-2 h-4 w-4" />
              {partnerInfo?.storeName} · {partnerInfo?.storeCode}
            </p>
            <p className="text-zinc-600">
              <Clock className="inline-block mr-2 h-4 w-4" />
              Último acceso: {new Date(partnerInfo?.lastLogin || '').toLocaleString()}
            </p>
          </div>
          <div className="md:text-right">
            <p className="font-semibold text-primary mb-1">
              <DollarSign className="inline-block mr-1 h-4 w-4" />
              Balance disponible
            </p>
            <p className="text-xl font-bold">
              ${partnerInfo?.balance?.toLocaleString('es-CL')}
            </p>
          </div>
        </div>
      </div>

      {/* Accesos principales (POS y App) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">POS Web</CardTitle>
            <CardDescription>
              Accede al punto de venta desde tu navegador
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex justify-center my-4">
              <Globe className="h-16 w-16 text-primary opacity-80" />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => setLocation('/partners/webapp-pos-official')}
            >
              Iniciar POS Web
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">App Móvil</CardTitle>
            <CardDescription>
              Descarga la app para dispositivos Android
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex justify-center my-4">
              <Smartphone className="h-16 w-16 text-primary opacity-80" />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => setLocation('/vecinos/pos-app')}
            >
              Descargar App
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Estadísticas y actividad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Documentos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{partnerInfo?.totalDocuments || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <ClipboardList className="mr-2 h-4 w-4" />
              Documentos Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{partnerInfo?.pendingDocuments || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <BarChart4 className="mr-2 h-4 w-4" />
              Comisiones del Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$--.---</p>
          </CardContent>
        </Card>
      </div>

      {/* Accesos secundarios */}
      <h3 className="text-lg font-semibold mb-3">Gestión de Cuenta</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col items-center justify-center gap-2"
          onClick={() => setLocation('/vecinos/cuenta')}
        >
          <User className="h-5 w-5" />
          <span>Mi Perfil</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col items-center justify-center gap-2"
          onClick={() => setLocation('/vecinos/retiros')}
        >
          <CreditCard className="h-5 w-5" />
          <span>Solicitar Retiro</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col items-center justify-center gap-2"
          onClick={() => setLocation('/vecinos/documentos')}
        >
          <Newspaper className="h-5 w-5" />
          <span>Mis Documentos</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col items-center justify-center gap-2"
          onClick={() => setLocation('/vecinos/soporte')}
        >
          <HelpCircle className="h-5 w-5" />
          <span>Soporte</span>
        </Button>
      </div>

      {/* Recursos */}
      <h3 className="text-lg font-semibold mb-3">Recursos</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col items-center justify-center gap-2"
          onClick={() => setLocation('/vecinos/faq')}
        >
          <Book className="h-5 w-5" />
          <span>Preguntas Frecuentes</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col items-center justify-center gap-2"
          onClick={() => setLocation('/vecinos/capacitacion')}
        >
          <Users className="h-5 w-5" />
          <span>Capacitación</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col items-center justify-center gap-2"
          onClick={() => setLocation('/vecinos/marketing')}
        >
          <Calendar className="h-5 w-5" />
          <span>Kit Marketing</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col items-center justify-center gap-2 text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Cerrar Sesión</span>
        </Button>
      </div>
      
      {/* Pie de página */}
      <div className="text-center text-zinc-500 text-xs mt-8">
        <p>Vecinos NotaryPro Express © 2025</p>
        <p>Versión 1.3.1</p>
      </div>
    </VecinosLayout>
  );
}