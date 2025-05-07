import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Users,
  FileText,
  Settings,
  Building,
  ShieldCheck,
  BarChart3,
  Search,
  UserPlus,
  FilePlus,
  PlusCircle,
  MoreHorizontal,
  LogOut,
  ChevronLeft,
  Home,
  Bell,
  Upload,
  Download,
  Trash2,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Panel de administración independiente para Vecinos Express
export default function VecinosAdminStandalone() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('usuarios');
  const [users, setUsers] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    // Verificar si hay usuario autenticado y si es admin
    const storedUser = localStorage.getItem('vecinos_user');
    if (!storedUser) {
      window.location.href = '/vecinos-standalone-login';
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      setUserData(user);

      // Verificar si el usuario es administrador
      if (user.role !== 'admin') {
        toast({
          title: 'Acceso denegado',
          description: 'No tienes permisos para acceder al panel de administración',
          variant: 'destructive'
        });
        window.location.href = '/vecinos-standalone';
        return;
      }

      // Cargar datos de ejemplo
      loadDemoData();

    } catch (error) {
      console.error('Error al procesar datos de usuario:', error);
      window.location.href = '/vecinos-standalone-login';
    }
  }, [toast]);

  const loadDemoData = () => {
    // Datos de usuarios de ejemplo
    setUsers([
      {
        id: 1,
        username: 'juanperez',
        fullName: 'Juan Pérez',
        email: 'juan.perez@example.com',
        role: 'user',
        status: 'active',
        createdAt: '2025-04-15T10:30:00Z'
      },
      {
        id: 2,
        username: 'mariarodriguez',
        fullName: 'María Rodríguez',
        email: 'maria.rodriguez@example.com',
        role: 'certifier',
        status: 'active',
        createdAt: '2025-04-10T14:20:00Z'
      },
      {
        id: 3,
        username: 'carloslopez',
        fullName: 'Carlos López',
        email: 'carlos.lopez@example.com',
        role: 'partner',
        status: 'inactive',
        createdAt: '2025-03-25T09:15:00Z'
      }
    ]);

    // Datos de documentos de ejemplo
    setDocuments([
      {
        id: 101,
        title: 'Contrato de Prestación de Servicios',
        type: 'contract',
        user: 'Juan Pérez',
        status: 'completed',
        createdAt: '2025-05-01T10:20:00Z'
      },
      {
        id: 102,
        title: 'Declaración Jurada Simple',
        type: 'declaration',
        user: 'María Rodríguez',
        status: 'pending',
        createdAt: '2025-04-28T16:45:00Z'
      },
      {
        id: 103,
        title: 'Poder Notarial',
        type: 'power',
        user: 'Carlos López',
        status: 'signing',
        createdAt: '2025-04-25T11:30:00Z'
      }
    ]);

    // Datos de socios de ejemplo
    setPartners([
      {
        id: 201,
        name: 'Estudio Jurídico González',
        type: 'legal',
        contact: 'Pedro González',
        email: 'pedro@gonzalezlegal.com',
        status: 'active',
        joinedAt: '2025-03-15T00:00:00Z'
      },
      {
        id: 202,
        name: 'Notaría Martínez',
        type: 'notary',
        contact: 'Ana Martínez',
        email: 'ana@notariamartinez.cl',
        status: 'active',
        joinedAt: '2025-02-20T00:00:00Z'
      },
      {
        id: 203,
        name: 'Asesorías Silva',
        type: 'advisory',
        contact: 'Roberto Silva',
        email: 'roberto@asesoriassilva.cl',
        status: 'inactive',
        joinedAt: '2025-01-10T00:00:00Z'
      }
    ]);

    setLoading(false);
  };

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
        <p className="ml-2">Cargando panel de administración...</p>
      </div>
    );
  }

  // Función para formatear fechas
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-4"
              onClick={() => navigate('/vecinos-standalone')}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
            <h1 className="font-bold text-xl flex items-center">
              <ShieldCheck className="h-5 w-5 text-blue-600 mr-2" />
              Panel de Administración
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-1">
              <Bell className="h-5 w-5 text-gray-500 cursor-pointer hover:text-blue-600" />
            </div>
            
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2 hidden md:inline">
                {userData?.fullName || userData?.username}
              </span>
              <Badge className="mr-2 bg-blue-100 text-blue-800 hover:bg-blue-200">Admin</Badge>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-gray-200 md:h-[calc(100vh-64px)] md:sticky md:top-16">
          <div className="p-4">
            <div className="mb-6">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search className="h-4 w-4" />
                </span>
                <Input
                  type="search"
                  placeholder="Buscar..."
                  className="h-9 pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <Button 
                variant={activeTab === 'usuarios' ? 'secondary' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => setActiveTab('usuarios')}
              >
                <Users className="h-4 w-4 mr-2" />
                Usuarios
              </Button>
              <Button 
                variant={activeTab === 'documentos' ? 'secondary' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => setActiveTab('documentos')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Documentos
              </Button>
              <Button 
                variant={activeTab === 'partners' ? 'secondary' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => setActiveTab('partners')}
              >
                <Building className="h-4 w-4 mr-2" />
                Socios Comerciales
              </Button>
              <Button 
                variant={activeTab === 'estadisticas' ? 'secondary' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => setActiveTab('estadisticas')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Estadísticas
              </Button>
              <Button 
                variant={activeTab === 'configuracion' ? 'secondary' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => setActiveTab('configuracion')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          {/* Usuarios Tab */}
          {activeTab === 'usuarios' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Gestión de Usuarios</h2>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </div>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Lista de Usuarios</CardTitle>
                  <CardDescription>Administra los usuarios del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">ID</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">Nombre</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">Usuario</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">Email</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">Rol</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">Estado</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">Creado</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 border-b text-sm">{user.id}</td>
                            <td className="py-3 px-4 border-b text-sm font-medium">{user.fullName}</td>
                            <td className="py-3 px-4 border-b text-sm">{user.username}</td>
                            <td className="py-3 px-4 border-b text-sm">{user.email}</td>
                            <td className="py-3 px-4 border-b text-sm">
                              <Badge 
                                className={
                                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                  user.role === 'certifier' ? 'bg-blue-100 text-blue-800' :
                                  user.role === 'partner' ? 'bg-orange-100 text-orange-800' :
                                  'bg-gray-100 text-gray-800'
                                }
                              >
                                {user.role === 'admin' ? 'Administrador' :
                                 user.role === 'certifier' ? 'Certificador' :
                                 user.role === 'partner' ? 'Socio' : 'Usuario'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 border-b text-sm">
                              <Badge 
                                className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                              >
                                {user.status === 'active' ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 border-b text-sm">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="py-3 px-4 border-b text-sm">
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">Editar</Button>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t px-6 py-4">
                  <div className="text-sm text-gray-500">
                    Mostrando {users.length} usuarios
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" disabled>Anterior</Button>
                    <Button variant="outline" size="sm" disabled>Siguiente</Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Documentos Tab */}
          {activeTab === 'documentos' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Gestión de Documentos</h2>
                <Button>
                  <FilePlus className="h-4 w-4 mr-2" />
                  Nuevo Documento
                </Button>
              </div>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Lista de Documentos</CardTitle>
                  <CardDescription>Administra los documentos del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">ID</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">Título</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">Tipo</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">Usuario</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">Estado</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">Fecha</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map(doc => (
                          <tr key={doc.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 border-b text-sm">{doc.id}</td>
                            <td className="py-3 px-4 border-b text-sm font-medium">{doc.title}</td>
                            <td className="py-3 px-4 border-b text-sm">
                              <Badge 
                                className={
                                  doc.type === 'contract' ? 'bg-blue-100 text-blue-800' :
                                  doc.type === 'declaration' ? 'bg-green-100 text-green-800' :
                                  'bg-purple-100 text-purple-800'
                                }
                              >
                                {doc.type === 'contract' ? 'Contrato' :
                                 doc.type === 'declaration' ? 'Declaración' : 'Poder'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 border-b text-sm">{doc.user}</td>
                            <td className="py-3 px-4 border-b text-sm">
                              <Badge 
                                className={
                                  doc.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  doc.status === 'signing' ? 'bg-orange-100 text-orange-800' :
                                  'bg-blue-100 text-blue-800'
                                }
                              >
                                {doc.status === 'completed' ? 'Completado' :
                                 doc.status === 'signing' ? 'En firma' : 'Pendiente'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 border-b text-sm">
                              {formatDate(doc.createdAt)}
                            </td>
                            <td className="py-3 px-4 border-b text-sm">
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">Ver</Button>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t px-6 py-4">
                  <div className="text-sm text-gray-500">
                    Mostrando {documents.length} documentos
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" disabled>Anterior</Button>
                    <Button variant="outline" size="sm" disabled>Siguiente</Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Partners Tab */}
          {activeTab === 'partners' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Socios Comerciales</h2>
                <Button>
                  <Building className="h-4 w-4 mr-2" />
                  Nuevo Socio
                </Button>
              </div>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Lista de Socios</CardTitle>
                  <CardDescription>Administra los socios comerciales</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">ID</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">Nombre</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">Tipo</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">Contacto</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">Email</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">Estado</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">Fecha</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {partners.map(partner => (
                          <tr key={partner.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 border-b text-sm">{partner.id}</td>
                            <td className="py-3 px-4 border-b text-sm font-medium">{partner.name}</td>
                            <td className="py-3 px-4 border-b text-sm">
                              <Badge 
                                className={
                                  partner.type === 'legal' ? 'bg-purple-100 text-purple-800' :
                                  partner.type === 'notary' ? 'bg-blue-100 text-blue-800' :
                                  'bg-green-100 text-green-800'
                                }
                              >
                                {partner.type === 'legal' ? 'Estudio Jurídico' :
                                 partner.type === 'notary' ? 'Notaría' : 'Asesoría'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 border-b text-sm">{partner.contact}</td>
                            <td className="py-3 px-4 border-b text-sm">{partner.email}</td>
                            <td className="py-3 px-4 border-b text-sm">
                              <Badge 
                                className={partner.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                              >
                                {partner.status === 'active' ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 border-b text-sm">
                              {formatDate(partner.joinedAt)}
                            </td>
                            <td className="py-3 px-4 border-b text-sm">
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">Editar</Button>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t px-6 py-4">
                  <div className="text-sm text-gray-500">
                    Mostrando {partners.length} socios
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" disabled>Anterior</Button>
                    <Button variant="outline" size="sm" disabled>Siguiente</Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Estadísticas Tab */}
          {activeTab === 'estadisticas' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Estadísticas del Sistema</h2>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Datos
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Usuarios</p>
                        <h3 className="text-2xl font-bold mt-1">{users.length}</h3>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Documentos</p>
                        <h3 className="text-2xl font-bold mt-1">{documents.length}</h3>
                      </div>
                      <div className="bg-green-100 p-3 rounded-full">
                        <FileText className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Socios</p>
                        <h3 className="text-2xl font-bold mt-1">{partners.length}</h3>
                      </div>
                      <div className="bg-purple-100 p-3 rounded-full">
                        <Building className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>Últimas acciones en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 pb-4 border-b border-gray-100">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <UserPlus className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Nuevo usuario registrado</p>
                        <p className="text-sm text-gray-600">Se ha registrado un nuevo usuario en el sistema</p>
                        <p className="text-xs text-gray-500 mt-1">Hace 2 horas</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 pb-4 border-b border-gray-100">
                      <div className="bg-green-100 p-2 rounded-full">
                        <FileText className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Documento actualizado</p>
                        <p className="text-sm text-gray-600">Se ha actualizado un documento en el sistema</p>
                        <p className="text-xs text-gray-500 mt-1">Hace 5 horas</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="bg-orange-100 p-2 rounded-full">
                        <Clock className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Documento vencido</p>
                        <p className="text-sm text-gray-600">Un documento ha vencido sin ser procesado</p>
                        <p className="text-xs text-gray-500 mt-1">Hace 1 día</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Rendimiento del Sistema</CardTitle>
                  <CardDescription>Resumen de rendimiento de los últimos 30 días</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">El gráfico de estadísticas se mostrará aquí</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Configuración Tab */}
          {activeTab === 'configuracion' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Configuración del Sistema</h2>
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
              
              <Tabs defaultValue="general">
                <TabsList className="mb-6">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="security">Seguridad</TabsTrigger>
                  <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
                  <TabsTrigger value="backup">Respaldos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuración General</CardTitle>
                      <CardDescription>Configura los parámetros generales del sistema</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company-name">Nombre de la Empresa</Label>
                          <Input id="company-name" defaultValue="VecinoExpress" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="timezone">Zona Horaria</Label>
                          <Input id="timezone" defaultValue="America/Santiago" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="language">Idioma</Label>
                          <Input id="language" defaultValue="Español (Chile)" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dateformat">Formato de Fecha</Label>
                          <Input id="dateformat" defaultValue="DD/MM/YYYY" />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                      <Button>Guardar Configuración</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuración de Seguridad</CardTitle>
                      <CardDescription>Configura los parámetros de seguridad del sistema</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="password-policy">Política de Contraseñas</Label>
                          <Input id="password-policy" defaultValue="Fuerte" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="session-timeout">Tiempo de Sesión (minutos)</Label>
                          <Input type="number" id="session-timeout" defaultValue="30" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="auth-method">Método de Autenticación</Label>
                          <Input id="auth-method" defaultValue="Usuario y Contraseña" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ip-restriction">Restricción de IP</Label>
                          <Input id="ip-restriction" defaultValue="Desactivado" />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                      <Button>Guardar Configuración</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuración de Notificaciones</CardTitle>
                      <CardDescription>Configura las notificaciones del sistema</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email-notifications">Notificaciones por Email</Label>
                          <Input id="email-notifications" defaultValue="Activado" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sms-notifications">Notificaciones por SMS</Label>
                          <Input id="sms-notifications" defaultValue="Desactivado" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="app-notifications">Notificaciones en la App</Label>
                          <Input id="app-notifications" defaultValue="Activado" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notification-frequency">Frecuencia de Notificaciones</Label>
                          <Input id="notification-frequency" defaultValue="Inmediata" />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                      <Button>Guardar Configuración</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="backup">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuración de Respaldos</CardTitle>
                      <CardDescription>Configura los respaldos del sistema</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="backup-frequency">Frecuencia de Respaldo</Label>
                          <Input id="backup-frequency" defaultValue="Diario" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="backup-time">Hora de Respaldo</Label>
                          <Input id="backup-time" defaultValue="03:00 AM" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="backup-retention">Retención de Respaldos (días)</Label>
                          <Input type="number" id="backup-retention" defaultValue="30" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="backup-location">Ubicación de Respaldos</Label>
                          <Input id="backup-location" defaultValue="Servidor Local" />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4">
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Descargar Respaldo
                        </Button>
                        <Button>
                          <Upload className="h-4 w-4 mr-2" />
                          Crear Respaldo Ahora
                        </Button>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                      <Button>Guardar Configuración</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}