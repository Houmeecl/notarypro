import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

interface StoreData {
  id: number;
  storeName: string;
  address: string;
  ownerName?: string;
  commissionRate: number;
  joinedAt: string;
}

const WebAppPOS = () => {
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingDocTypes, setLoadingDocTypes] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Verificar si hay datos de la tienda en localStorage
    const storedData = localStorage.getItem('webapp_store');
    
    if (!storedData) {
      toast({
        title: 'Sesión no iniciada',
        description: 'Debes iniciar sesión para acceder',
        variant: 'destructive',
      });
      navigate('/partners/webapp-login');
      return;
    }
    
    setStoreData(JSON.parse(storedData));
    setLoading(false);
    
    // Cargar los tipos de documentos disponibles
    loadDocumentTypes();
    
    // Cargar el historial de transacciones
    loadTransactions();
  }, []);
  
  const loadDocumentTypes = async () => {
    setLoadingDocTypes(true);
    try {
      const res = await apiRequest('GET', '/api/partners/webapp/document-types');
      if (!res.ok) throw new Error('Error al cargar tipos de documentos');
      
      const data = await res.json();
      setDocumentTypes(data);
    } catch (error) {
      console.error('Error cargando tipos de documentos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los tipos de documentos',
        variant: 'destructive',
      });
    } finally {
      setLoadingDocTypes(false);
    }
  };
  
  const loadTransactions = async () => {
    if (!storeData) return;
    
    setLoadingTransactions(true);
    try {
      const res = await apiRequest('GET', `/api/partners/webapp/transactions/${storeData.id}`);
      if (!res.ok) throw new Error('Error al cargar transacciones');
      
      const data = await res.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error cargando transacciones:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las transacciones',
        variant: 'destructive',
      });
    } finally {
      setLoadingTransactions(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('webapp_store');
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente',
    });
    navigate('/partners/webapp-login');
  };
  
  const handleProcessDocument = () => {
    navigate('/real-pos');
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
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
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{storeData?.storeName}</h1>
          <p className="text-muted-foreground">{storeData?.address}</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>Cerrar sesión</Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información del local</CardTitle>
          <CardDescription>Datos generales del punto de servicio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Propietario</p>
              <p>{storeData?.ownerName || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Comisión</p>
              <p>{(storeData?.commissionRate || 0) * 100}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Afiliado desde</p>
              <p>{formatDate(storeData?.joinedAt || '')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="transactions">
        <TabsList className="mb-4">
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Historial de transacciones</CardTitle>
              <CardDescription>Listado de las últimas transacciones realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : transactions.length > 0 ? (
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-3.5 text-left text-sm font-semibold">Código</th>
                        <th className="px-4 py-3.5 text-left text-sm font-semibold">Cliente</th>
                        <th className="px-4 py-3.5 text-left text-sm font-semibold">Monto</th>
                        <th className="px-4 py-3.5 text-left text-sm font-semibold">Comisión</th>
                        <th className="px-4 py-3.5 text-left text-sm font-semibold">Estado</th>
                        <th className="px-4 py-3.5 text-left text-sm font-semibold">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-background">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm">{transaction.processingCode}</td>
                          <td className="px-4 py-3 text-sm">{transaction.clientName}</td>
                          <td className="px-4 py-3 text-sm">{formatCurrency(transaction.amount)}</td>
                          <td className="px-4 py-3 text-sm">{formatCurrency(transaction.commission)}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {transaction.status === 'completed' ? 'Completado' :
                               transaction.status === 'pending' ? 'Pendiente' : 
                               transaction.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">{formatDate(transaction.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay transacciones registradas
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => loadTransactions()} disabled={loadingTransactions}>
                {loadingTransactions ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documentos disponibles</CardTitle>
              <CardDescription>Tipos de documentos que puedes procesar</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDocTypes ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : documentTypes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documentTypes.map((docType) => (
                    <Card key={docType.id} className="flex flex-col h-full">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{docType.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2 flex-grow">
                        <p className="text-muted-foreground text-sm mb-4">
                          Categoría: {docType.categoryId}
                        </p>
                        <p className="font-medium">
                          {formatCurrency(docType.price || 0)}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={handleProcessDocument}
                        >
                          Procesar documento
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay tipos de documentos disponibles
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => loadDocumentTypes()} disabled={loadingDocTypes}>
                {loadingDocTypes ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebAppPOS;