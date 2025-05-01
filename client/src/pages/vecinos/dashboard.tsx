import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  FileText, User, CreditCard, Clock, Calendar, 
  ChevronRight, Download, LogOut, BarChart3,
  HelpCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

// Tipos de datos
interface Document {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  type: string;
  clientName: string;
  commission: number;
}

interface Transaction {
  id: string;
  date: string;
  documentTitle: string;
  amount: number;
  status: string;
}

interface PartnerInfo {
  storeName: string;
  ownerName: string;
  address: string;
  phone: string;
  email: string;
  plan: string;
  commissionRate: number;
  balance: number;
  avatarUrl?: string;
}

export default function VecinosDashboard() {
  const [_, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Comprobar autenticación
  useEffect(() => {
    const token = localStorage.getItem("vecinos_token");
    if (!token) {
      setLocation("/vecinos/login");
      toast({
        title: "Sesión no válida",
        description: "Por favor inicia sesión para acceder a tu dashboard",
        variant: "destructive",
      });
    }
  }, [setLocation]);

  // Obtener datos del socio
  const { data: partnerInfo, isLoading: partnerLoading } = useQuery<PartnerInfo>({
    queryKey: ["/api/vecinos/partner-info"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/vecinos/partner-info");
        return await res.json();
      } catch (error) {
        console.error("Error fetching partner info:", error);
        return null;
      }
    },
  });

  // Obtener documentos
  const { data: documents, isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: ["/api/vecinos/documents"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/vecinos/documents");
        return await res.json();
      } catch (error) {
        console.error("Error fetching documents:", error);
        return [];
      }
    },
  });

  // Obtener transacciones
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/vecinos/transactions"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/vecinos/transactions");
        return await res.json();
      } catch (error) {
        console.error("Error fetching transactions:", error);
        return [];
      }
    },
  });

  // Filtrar documentos por búsqueda
  const filteredDocuments = documents?.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("vecinos_token");
    setLocation("/vecinos/login");
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Obtener color de estado
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completado':
      case 'pagado':
        return "bg-green-100 text-green-800";
      case 'pendiente':
        return "bg-yellow-100 text-yellow-800";
      case 'rechazado':
      case 'error':
        return "bg-red-100 text-red-800";
      case 'en proceso':
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Encabezado */}
      <header className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold mr-2">Vecinos Xpress</h1>
            <span className="text-xs bg-white text-blue-600 px-1 py-0.5 rounded-sm">by NotaryPro</span>
          </div>
          <Button 
            variant="ghost" 
            className="text-white hover:bg-blue-700" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Menú de navegación */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto py-3 space-x-4">
            <Button 
              variant="ghost" 
              className="text-blue-600 hover:bg-blue-50"
              onClick={() => setLocation("/vecinos/dashboard")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button 
              variant="ghost" 
              className="text-gray-600 hover:bg-gray-50"
              onClick={() => setLocation("/vecinos/pos-app")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Procesar Documentos
            </Button>
            <Button 
              variant="ghost" 
              className="text-gray-600 hover:bg-gray-50"
              onClick={() => setLocation("/vecinos/retiros")}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Retiros
            </Button>
            <Button 
              variant="ghost" 
              className="text-gray-600 hover:bg-gray-50"
              onClick={() => setLocation("/vecinos/cuenta")}
            >
              <User className="h-4 w-4 mr-2" />
              Mi Cuenta
            </Button>
            <Button 
              variant="ghost" 
              className="text-gray-600 hover:bg-gray-50"
              onClick={() => setLocation("/vecinos/soporte")}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Soporte
            </Button>
          </div>
        </div>
      </nav>
      
      {/* Información del socio */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          {partnerLoading ? (
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          ) : partnerInfo ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={partnerInfo.avatarUrl} alt={partnerInfo.storeName} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {partnerInfo.storeName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{partnerInfo.storeName}</h2>
                  <p className="text-gray-600">{partnerInfo.ownerName}</p>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="mr-2">
                      Plan {partnerInfo.plan}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      {partnerInfo.commissionRate}% comisión
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Balance disponible</p>
                  <p className="font-bold text-lg">${partnerInfo.balance.toLocaleString('es-CL')}</p>
                </div>
                <Button 
                  size="sm" 
                  className="ml-4 bg-blue-600 hover:bg-blue-700"
                  onClick={() => setLocation("/vecinos/retiros")}
                >
                  Retirar
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-red-600">Error al cargar información</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setLocation("/vecinos/login")}
              >
                Volver a iniciar sesión
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="documents">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="documents" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Documentos
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Transacciones
              </TabsTrigger>
            </TabsList>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="documents" className="space-y-4">
            {documentsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredDocuments.length > 0 ? (
              <div className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{doc.title}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <User className="h-3 w-3 mr-1" />
                            {doc.clientName}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(doc.createdAt)}
                        </div>
                        <div>
                          Comisión: <span className="font-semibold text-blue-600">${doc.commission.toLocaleString('es-CL')}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-gray-50 flex justify-between py-2">
                      <Badge variant="outline" className="bg-transparent">
                        {doc.type}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:bg-blue-50"
                        onClick={() => setLocation(`/documents/${doc.id}`)}
                      >
                        Ver detalles
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No hay documentos</CardTitle>
                  <CardDescription>
                    No se encontraron documentos con los criterios de búsqueda actuales.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-500">
                    Intenta con una búsqueda diferente o procesa un nuevo documento.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button 
                    onClick={() => setLocation("/document-processor")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Procesar nuevo documento
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            {transactionsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-5 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Historial de transacciones</CardTitle>
                  <CardDescription>
                    Registro de tus comisiones por documentos procesados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center border-b pb-3">
                        <div>
                          <p className="font-medium">{transaction.documentTitle}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(transaction.date)}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">
                            ${transaction.amount.toLocaleString('es-CL')}
                          </p>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button variant="outline">
                    Descargar historial completo
                    <Download className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No hay transacciones</CardTitle>
                  <CardDescription>
                    Aún no se han registrado transacciones en tu cuenta.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-500">
                    Las transacciones aparecerán aquí una vez que proceses documentos.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button 
                    onClick={() => setLocation("/document-processor")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Procesar nuevo documento
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Pie de página */}
      <footer className="mt-auto bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center justify-center md:justify-start">
                <span className="text-lg font-bold">Vecinos Xpress</span>
                <span className="ml-2 text-xs bg-white text-gray-800 px-1 py-0.5 rounded-sm">by NotaryPro</span>
              </div>
              <p className="text-sm text-gray-400">© 2025 NotaryPro. Todos los derechos reservados.</p>
            </div>
            <div className="flex gap-4">
              <Button 
                variant="link" 
                className="text-white p-0 h-auto"
                onClick={() => setLocation("/vecinos/soporte")}
              >
                Soporte
              </Button>
              <Separator orientation="vertical" className="h-4 bg-gray-600" />
              <Button 
                variant="link" 
                className="text-white p-0 h-auto"
                onClick={() => setLocation("/vecinos/faq")}
              >
                Preguntas frecuentes
              </Button>
              <Separator orientation="vertical" className="h-4 bg-gray-600" />
              <Button 
                variant="link" 
                className="text-white p-0 h-auto"
                onClick={() => setLocation("/aviso-legal")}
              >
                Términos y condiciones
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}