import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  User,
  FileText,
  BarChart3,
  DollarSign,
  Bell,
  Settings,
  ChevronRight,
  ChevronDown,
  Check,
  Clock,
  Star,
  HelpCircle,
  LogOut,
  UserPlus,
  Building,
  Home
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Dashboard para Vecinos Express Standalone
 * 
 * Dashboard principal para la aplicación independiente de Vecinos Express
 */
export default function VecinosDashboard() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    documentsCount: 0,
    pendingDocuments: 0,
    completedDocuments: 0,
    recentEarnings: 0
  });

  useEffect(() => {
    // Verificar autenticación
    const storedUser = localStorage.getItem('vecinos_user');
    if (!storedUser) {
      window.location.href = '/vecinos-standalone-login';
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);

      // Cargar estadísticas de ejemplo
      setTimeout(() => {
        setStats({
          documentsCount: 12,
          pendingDocuments: 3,
          completedDocuments: 9,
          recentEarnings: 45000
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error al cargar el dashboard:', error);
      window.location.href = '/vecinos-standalone-login';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vecinos_user');
    localStorage.removeItem('vecinos_token');
    
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente.'
    });
    
    window.location.href = '/vecinos-standalone-login';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-2">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              className="font-semibold text-lg"
              onClick={() => navigate('/vecinos-standalone')}
            >
              <Home className="mr-2 h-5 w-5" />
              VecinoExpress
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="hidden md:flex items-center mr-4">
              <Bell className="h-5 w-5 text-gray-500 cursor-pointer hover:text-blue-600" />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>{user?.fullName || user?.username}</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">Bienvenido de nuevo, {user?.fullName || user?.username}</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </Button>
            <Button size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Nuevo Documento
            </Button>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Documentos</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.documentsCount}</h3>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <ChevronRight className="h-3 w-3 mr-1" />
                    <span>Ver todos</span>
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pendientes</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.pendingDocuments}</h3>
                  <p className="text-xs text-orange-600 mt-1 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Requieren atención</span>
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Completados</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.completedDocuments}</h3>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    <span>Documentos finalizados</span>
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Ingresos Recientes</p>
                  <h3 className="text-2xl font-bold mt-1">${stats.recentEarnings.toLocaleString('es-CL')}</h3>
                  <p className="text-xs text-blue-600 mt-1 flex items-center">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    <span>Últimos 30 días</span>
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Dashboard Content */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-2/3">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Actividad Reciente</span>
                  <Button variant="ghost" size="sm">Ver todo</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Activity Items */}
                  <div className="flex items-start space-x-4 border-b border-gray-100 pb-4">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Documento Firmado</p>
                      <p className="text-sm text-gray-600">Contrato de Prestación de Servicios fue firmado exitosamente</p>
                      <p className="text-xs text-gray-500 mt-1">Hace 2 días</p>
                    </div>
                    <Button variant="outline" size="sm">Ver</Button>
                  </div>
                  
                  <div className="flex items-start space-x-4 border-b border-gray-100 pb-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <UserPlus className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Nuevo Cliente</p>
                      <p className="text-sm text-gray-600">Se ha añadido un nuevo cliente al sistema</p>
                      <p className="text-xs text-gray-500 mt-1">Hace 4 días</p>
                    </div>
                    <Button variant="outline" size="sm">Detalles</Button>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Pago Recibido</p>
                      <p className="text-sm text-gray-600">Se recibió un pago por $15,000 por servicios notariales</p>
                      <p className="text-xs text-gray-500 mt-1">Hace 1 semana</p>
                    </div>
                    <Button variant="outline" size="sm">Verificar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Próximos Vencimientos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-orange-100 p-2 rounded-full">
                        <Clock className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">Declaración Jurada</p>
                        <p className="text-xs text-gray-500">Vence en 3 días</p>
                      </div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">Pendiente</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-orange-100 p-2 rounded-full">
                        <Clock className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">Poder Simple</p>
                        <p className="text-xs text-gray-500">Vence en 5 días</p>
                      </div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">Pendiente</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:w-1/3">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Resumen de Cuenta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">Plan Actual</p>
                      <Badge className="bg-blue-100 text-blue-800">Estándar</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Incluye hasta 20 documentos mensuales y soporte prioritario</p>
                    <Button className="w-full" size="sm" variant="outline">
                      Mejorar Plan
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Documentos Usados</p>
                      <p className="text-sm">12/20</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      8 documentos disponibles para este mes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Soporte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <HelpCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Centro de Ayuda</p>
                      <p className="text-xs text-gray-500">Accede a guías y tutoriales</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Star className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Contactar Soporte</p>
                      <p className="text-xs text-gray-500">Tiempo de respuesta: 24h</p>
                    </div>
                    <Button variant="outline" size="sm">Contactar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}