import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileIcon, 
  FileText, 
  FilePlus, 
  FileCheck, 
  Store, 
  DollarSign, 
  Bell, 
  User, 
  PlusCircle, 
  FileSignature,
  Home,
  Menu,
  X,
  LogOut,
  Settings,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Importar el servicio independiente para Vecinos Express Standalone
import VecinosStandaloneService from '@/services/vecinos-standalone-service';

// Logo de Vecinos Express
import vecinoLogo from "@/assets/new/vecino-xpress-logo-nuevo.png";

/**
 * Vecinos Express - Aplicación Independiente
 * 
 * Esta versión está diseñada para funcionar como una aplicación independiente
 * con su propia identidad visual, navegación y funcionalidades.
 */
export default function VecinosExpressStandalone() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeView, setActiveView] = useState('documents');
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Crear una función async dentro del useEffect
    const initialize = async () => {
      // Usar el servicio independiente para verificar la autenticación
      if (VecinosStandaloneService.isAuthenticated()) {
        try {
          // Obtener datos del usuario desde el servicio independiente
          const userData = VecinosStandaloneService.getCurrentUser();
          setUser(userData);
          setAuthenticated(true);
          
          // Cargar datos solo si está autenticado (ahora es una función async)
          await loadDemoData();
        } catch (error) {
          console.error('Error obteniendo datos de usuario:', error);
          // Si hay error, redirigir a login independiente
          window.location.href = '/vecinos-standalone-login';
        }
      } else {
        // Si no está autenticado, redirigir a login independiente
        window.location.href = '/vecinos-standalone-login';
      }
    };
    
    // Llamar a la función async
    initialize();
  }, []);

  const loadDemoData = async () => {
    try {
      setLoading(true);
      
      // Usar el servicio independiente para obtener documentos
      const docsResponse = await VecinosStandaloneService.getDocuments();
      setDocuments(docsResponse);
      
      // Usar el servicio independiente para obtener transacciones
      const txResponse = await VecinosStandaloneService.getTransactions();
      setTransactions(txResponse);
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast({
        title: 'Error de carga',
        description: 'No se pudieron cargar los datos. Intente nuevamente más tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Utilizar el servicio independiente para cerrar sesión
    VecinosStandaloneService.logout();
    
    // Mostrar mensaje de cierre de sesión
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente.',
    });
    
    // Redirigir a la página de login independiente
    window.location.href = '/vecinos-standalone-login';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Si no está autenticado o está cargando, mostrar spinner
  if (!authenticated || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="mb-4">
          <img src={vecinoLogo} alt="VecinoXpress Logo" className="h-28" />
        </div>
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Cargando VecinoXpress...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <img src={vecinoLogo} alt="VecinoXpress Logo" className="h-20" />
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="hidden md:flex">
              Versión 2.5.3
            </Badge>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            
            <div className="hidden md:flex items-center space-x-1">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">{user?.fullName || user?.username}</span>
              </Button>
              {user?.role === 'admin' && (
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/vecinos-standalone/admin'}>
                  <Settings className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b shadow-md">
          <div className="container mx-auto px-4 py-2">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{user?.fullName || user?.username}</span>
                </div>
                <Badge>{user?.role === 'admin' ? 'Administrador' : 'Usuario'}</Badge>
              </div>
              
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/vecinos-standalone">
                  <Home className="h-4 w-4 mr-2" />
                  Inicio
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/vecinos-standalone/cuenta">
                  <Settings className="h-4 w-4 mr-2" />
                  Mi Cuenta
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/vecinos-standalone/soporte">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Soporte
                </Link>
              </Button>
              {user?.role === 'admin' && (
                <Button variant="ghost" className="justify-start" asChild>
                  <Link href="/vecinos-standalone/admin">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Panel de Administración
                  </Link>
                </Button>
              )}
              <Button variant="outline" className="justify-start" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Panel de VecinoExpress</h1>
          <p className="text-gray-600">Gestiona tus documentos y servicios notariales</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-t-4 border-[#2d219b] shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <PlusCircle className="h-10 w-10 text-[#2d219b] mb-2" />
              <h3 className="font-medium">Nuevo Documento</h3>
              <p className="text-sm text-gray-500 mb-2">Crea un nuevo documento para firma</p>
              <Button 
                className="mt-2 w-full bg-[#2d219b] hover:bg-[#241a7d] text-white" 
                size="sm"
                onClick={() => setLocation("/vecinos-standalone/documento")}
              >
                Iniciar
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-t-4 border-[#4863f7] shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <FileSignature className="h-10 w-10 text-[#4863f7] mb-2" />
              <h3 className="font-medium">Firmar Documento</h3>
              <p className="text-sm text-gray-500 mb-2">Firma un documento pendiente</p>
              <Button className="mt-2 w-full border-[#4863f7] text-[#4863f7] hover:bg-[#4863f7] hover:text-white" size="sm" variant="outline">Revisar</Button>
            </CardContent>
          </Card>
          
          {/* Tercera tarjeta intencionalmente dejada invisible para mantener el layout de 3 columnas 
          pero ocultando la funcionalidad RON como solicitado */}
          <div className="hidden md:block"></div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="documents" onValueChange={setActiveView}>
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="documents" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex-1">
              <DollarSign className="h-4 w-4 mr-2" />
              Transacciones
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="documents">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Mis Documentos</h2>
                <Button variant="outline" size="sm" className="border-[#2d219b] text-[#2d219b] hover:bg-[#2d219b] hover:text-white">
                  <FilePlus className="h-4 w-4 mr-2" />
                  Nuevo
                </Button>
              </div>
              
              {documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map(doc => (
                    <Card key={doc.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{doc.title}</h3>
                            <p className="text-sm text-gray-600">Cliente: {doc.clientName}</p>
                            <div className="flex items-center mt-1">
                              <p className="text-xs text-gray-500 mr-2">
                                {formatDate(doc.createdAt)}
                              </p>
                              <Badge 
                                className={
                                  doc.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                  doc.status === 'signing' ? 'bg-indigo-100 text-indigo-800' :
                                  'bg-sky-100 text-sky-800'
                                }
                              >
                                {doc.status === 'completed' ? 'Completado' :
                                 doc.status === 'signing' ? 'En firma' :
                                 'Pendiente'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" className="border-[#4863f7] text-[#4863f7] hover:bg-[#4863f7] hover:text-white">Ver</Button>
                            {doc.status !== 'completed' && (
                              <Button size="sm" className="bg-[#2d219b] hover:bg-[#241a7d] text-white">
                                {doc.status === 'signing' ? 'Firmar' : 'Procesar'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                    <FileIcon className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700">No hay documentos</h3>
                    <p className="text-gray-500 mb-6">Aún no tienes documentos creados o asignados</p>
                    <Button>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Crear Documento
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="transactions">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Mis Transacciones</h2>
                <Button variant="outline" size="sm">
                  <Store className="h-4 w-4 mr-2" />
                  Ver Tienda
                </Button>
              </div>
              
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map(tx => (
                    <Card key={tx.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{tx.description}</h3>
                            <div className="flex items-center mt-1">
                              <p className="text-xs text-gray-500 mr-2">
                                {formatDate(tx.date)}
                              </p>
                              <Badge 
                                className={
                                  tx.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                  'bg-indigo-100 text-indigo-800'
                                }
                              >
                                {tx.status === 'completed' ? 'Completado' : 'Pendiente'}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              ${tx.amount.toLocaleString('es-CL')}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {tx.method === 'card' ? 'Tarjeta' : 
                               tx.method === 'transfer' ? 'Transferencia' : 
                               'Pendiente'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                    <DollarSign className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700">No hay transacciones</h3>
                    <p className="text-gray-500 mb-6">Aún no tienes transacciones registradas</p>
                    <Button variant="outline">
                      Ver Servicios Disponibles
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 flex flex-col items-center md:items-start">
              <img src={vecinoLogo} alt="VecinoXpress Logo" className="h-16 mb-2" />
              <p className="text-sm text-gray-600">
                &copy; {new Date().getFullYear()} VecinoXpress - Todos los derechos reservados
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/vecinos-standalone/soporte" className="text-sm text-gray-600 hover:text-blue-600">
                Soporte
              </Link>
              <Link href="/vecinos-standalone/faq" className="text-sm text-gray-600 hover:text-blue-600">
                Preguntas Frecuentes
              </Link>
              <Link href="/aviso-legal" className="text-sm text-gray-600 hover:text-blue-600">
                Términos Legales
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}