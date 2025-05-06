import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FileIcon, FileText, FilePlus, FileCheck, Store, DollarSign, Bell, User, PlusCircle, FileSignature, Video } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export default function VecinosExpressPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeView, setActiveView] = useState('documents');

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      // Datos de documentos de ejemplo
      setDocuments([
        {
          id: 1,
          title: 'Contrato de Prestación de Servicios',
          clientName: 'Juan Pérez González',
          status: 'pending',
          createdAt: '2025-05-02T10:15:00Z',
          type: 'contract',
          verificationCode: 'ABC12345'
        },
        {
          id: 2,
          title: 'Declaración Jurada Simple',
          clientName: 'María Rodríguez Silva',
          status: 'completed',
          createdAt: '2025-05-01T08:30:00Z',
          type: 'declaration',
          verificationCode: 'DEF67890'
        },
        {
          id: 3,
          title: 'Poder Simple',
          clientName: 'Carlos López Muñoz',
          status: 'signing',
          createdAt: '2025-04-30T14:45:00Z',
          type: 'power',
          verificationCode: 'GHI01234'
        }
      ]);

      // Datos de transacciones de ejemplo
      setTransactions([
        {
          id: 1,
          type: 'commission',
          amount: 2500,
          status: 'completed',
          description: 'Comisión por documento ABC12345',
          createdAt: '2025-05-02T10:20:00Z'
        },
        {
          id: 2,
          type: 'commission',
          amount: 3000,
          status: 'completed',
          description: 'Comisión por documento DEF67890',
          createdAt: '2025-05-01T08:35:00Z'
        }
      ]);

      setLoading(false);
    }, 1500);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">Pendiente</Badge>;
      case 'signing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">En firma</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Completado</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const handleSignDocument = (documentId: number) => {
    navigate(`/vecinos-sign-document/${documentId}`);
  };

  const handleCompleteVerification = (documentId: number) => {
    navigate(`/vecinos-complete-verification/${documentId}`);
  };

  const handleCreateDocument = () => {
    toast({
      title: "Próximamente",
      description: "La funcionalidad de creación de documentos estará disponible pronto.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">VecinoXpress</h1>
          <p className="text-gray-600 mt-1">Portal de Socios para Gestión Documental</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button onClick={handleCreateDocument} className="font-medium">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nuevo documento
          </Button>
        </div>
      </div>

      {/* Tarjeta de información del socio */}
      <Card className="mb-8 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-100">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                <Store className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold">Minimarket El Sol</h2>
                <p className="text-gray-600">Av. Providencia 1234, Santiago</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col md:flex-row md:items-center gap-4">
              <div className="border rounded-md p-3 bg-white">
                <p className="text-sm text-gray-500">Código de socio</p>
                <p className="font-bold text-lg">LOCAL-XP125</p>
              </div>
              <div className="border rounded-md p-3 bg-white">
                <p className="text-sm text-gray-500">Balance disponible</p>
                <p className="font-bold text-lg text-green-600">{formatAmount(5500)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenido principal */}
      <Tabs defaultValue="documents" value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="documents" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Documentos</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Transacciones</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Cuenta</span>
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de documentos */}
        <TabsContent value="documents">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Documentos recientes</h2>
              <Link href="/vecinos-documents">
                <Button variant="link" className="font-medium">
                  Ver todos
                </Button>
              </Link>
            </div>

            {loading ? (
              // Estado de carga
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // Lista de documentos
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base font-bold truncate">
                          {doc.title}
                        </CardTitle>
                        {getStatusBadge(doc.status)}
                      </div>
                      <CardDescription>
                        {doc.clientName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm flex items-center gap-1 text-gray-500">
                          <FileIcon className="h-3.5 w-3.5" />
                          <span className="capitalize">{doc.type}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Creado: {formatDate(doc.createdAt)}
                        </p>
                        <p className="text-sm flex items-center gap-1 text-gray-600 font-mono text-xs">
                          <FileCheck className="h-3.5 w-3.5" />
                          {doc.verificationCode}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-gray-50 pt-2 flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCompleteVerification(doc.id)}
                        disabled={doc.status !== 'pending'}
                      >
                        <Video className="h-3.5 w-3.5 mr-1" />
                        Verificar
                      </Button>
                      <Button variant="default" size="sm">Ver</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Pestaña de transacciones */}
        <TabsContent value="transactions">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Transacciones recientes</h2>
              <Link href="/vecinos-transactions">
                <Button variant="link" className="font-medium">
                  Ver todas
                </Button>
              </Link>
            </div>

            {loading ? (
              // Estado de carga
              <Card className="animate-pulse">
                <CardContent className="p-0">
                  <div className="divide-y">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                        </div>
                        <div className="h-4 bg-gray-100 rounded w-1/2 mt-2"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Lista de transacciones
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatAmount(transaction.amount)}</p>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Completado
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 p-4 flex justify-center">
                  <Button variant="outline">Solicitar retiro de comisiones</Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Pestaña de cuenta */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Información de la cuenta</CardTitle>
              <CardDescription>
                Gestione su perfil y configuración de socio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nombre de la tienda</h3>
                    <p className="mt-1">Minimarket El Sol</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Propietario</h3>
                    <p className="mt-1">José Pérez Gómez</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Correo electrónico</h3>
                    <p className="mt-1">minimarket.elsol@gmail.com</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
                    <p className="mt-1">+56 9 1234 5678</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Dirección</h3>
                    <p className="mt-1">Av. Providencia 1234, Santiago</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Tasa de comisión</h3>
                    <p className="mt-1">20%</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Cambiar contraseña</Button>
              <Button>Editar información</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}