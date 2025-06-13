import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  CreditCard,
  DollarSign,
  CheckCircle,
  User,
  FileText,
  List,
  ShoppingCart,
  X,
  Plus,
  ChevronRight,
  ArrowLeft,
  Terminal,
  Wifi,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { POS_CONSTANTS, testPOSConfig } from '@/lib/pos-config';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import IdentityVerification, { VerificationResult } from '@/components/identity/IdentityVerification';

// Tipo para los items del carrito
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Tipo para el cliente
interface Customer {
  name: string;
  email: string;
  document: string;
}

// Código de tienda (store code)
const storeCode = 'TEST-XP001';

// Componente principal
const TestPOSPayment: React.FC = () => {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  
  // Estados para el POS
  const [activeTab, setActiveTab] = useState('services');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    email: '',
    document: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'connecting' | 'waiting' | 'processing' | 'success' | 'failure'>('idle');
  const [terminalStatus, setTerminalStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [isIdentityVerified, setIsIdentityVerified] = useState(false);
  const [verificationData, setVerificationData] = useState<VerificationResult | null>(null);
  
  // Obtener configuración POS
  const posConfig = testPOSConfig;
  
  // Cálculos de totales
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * POS_CONSTANTS.TAX_RATE;
  const total = subtotal + tax;
  const formattedSubtotal = subtotal.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
  const formattedTax = tax.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
  const formattedTotal = total.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
  
  // Comprobar estado del terminal al cargar
  useEffect(() => {
    // Simulamos la conexión al terminal
    const checkTerminalStatus = () => {
      // Primero actualizamos a desconectado, para mostrar el progreso
      setTerminalStatus('disconnected');
      
      setTimeout(() => {
        // En un entorno real, comprobaríamos la conexión real con el terminal
        setTerminalStatus('connected');
        
        toast({
          title: 'Terminal conectado',
          description: 'Terminal de prueba listo para usar',
        });
      }, 2000);
    };
    
    checkTerminalStatus();
    
    // Configuramos un intervalo para verificar la conexión
    const interval = setInterval(checkTerminalStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Agregar item al carrito
  const addToCart = (service: { id: string, name: string, price: number }) => {
    const existingItem = cartItems.find(item => item.id === service.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === service.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, { ...service, quantity: 1 }]);
    }
    
    toast({
      title: 'Servicio agregado',
      description: `${service.name} agregado al carrito`,
    });
  };
  
  // Remover item del carrito
  const removeFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };
  
  // Actualizar cantidad
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };
  
  // Procesar pago con dispositivo simulado
  const processPaymentWithTerminal = async () => {
    if (cartItems.length === 0) {
      setErrorMessage('No hay items en el carrito');
      return;
    }
    
    if (!customer.name || !customer.email) {
      setErrorMessage('Por favor complete la información del cliente');
      setActiveTab('customer');
      return;
    }
    
    if (terminalStatus !== 'connected') {
      setErrorMessage('Terminal de pago no disponible');
      return;
    }
    
    setIsProcessing(true);
    setErrorMessage(null);
    setPaymentStatus('connecting');
    
    try {
      // Simulamos la comunicación con el terminal
      setTimeout(() => setPaymentStatus('waiting'), 1000);
      setTimeout(() => setPaymentStatus('processing'), 3000);
      
      // Simulamos el procesamiento
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Generar un ID de transacción
      const txId = 'TX-TEST-' + Date.now().toString().slice(-6);
      setTransactionId(txId);
      setPaymentStatus('success');
      setIsCompleted(true);
      
      toast({
        title: 'Pago completado (PRUEBA)',
        description: `Transacción ${txId} procesada exitosamente`,
      });
      
      // Registrar la transacción (en producción, aquí se enviaría a la API)
      console.log('Transacción simulada registrada:', {
        id: txId,
        storeCode,
        items: cartItems,
        customer,
        total,
        subtotal,
        tax,
        operatorId: user?.id || 'unknown',
        timestamp: new Date().toISOString(),
        testMode: true
      });
      
    } catch (error) {
      console.error('Error procesando el pago:', error);
      setErrorMessage('Error al procesar el pago. Intente nuevamente.');
      setPaymentStatus('failure');
      
      toast({
        title: 'Error',
        description: 'No se pudo completar la transacción',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Iniciar nueva transacción
  const startNewTransaction = () => {
    setCartItems([]);
    setCustomer({
      name: '',
      email: '',
      document: ''
    });
    setIsCompleted(false);
    setTransactionId(null);
    setErrorMessage(null);
    setPaymentStatus('idle');
    setActiveTab('services');
  };
  
  // Renderizar el recibo
  const renderReceipt = () => {
    return (
      <div className="bg-white p-6 rounded-lg border">
        <div className="text-center mb-6">
          <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs inline-block mb-2">
            MODO PRUEBA
          </div>
          <h3 className="text-xl font-bold">Recibo de Pago</h3>
          <p className="text-gray-500">VecinoXpress</p>
          <p className="text-sm text-gray-400">Tienda: {storeCode}</p>
          <p className="text-sm text-gray-400">Transacción #{transactionId}</p>
          <p className="text-sm text-gray-400">{new Date().toLocaleString()}</p>
        </div>
        
        <div className="mb-4">
          <h4 className="font-medium mb-2">Cliente</h4>
          <p>{customer.name}</p>
          <p className="text-sm text-gray-500">{customer.email}</p>
          {customer.document && <p className="text-sm text-gray-500">RUT: {customer.document}</p>}
        </div>
        
        <div className="mb-4">
          <h4 className="font-medium mb-2">Items</h4>
          {cartItems.map(item => (
            <div key={item.id} className="flex justify-between py-1 text-sm">
              <span>{item.quantity} x {item.name}</span>
              <span>{(item.price * item.quantity).toLocaleString('es-CL', { 
                style: 'currency', 
                currency: 'CLP' 
              })}</span>
            </div>
          ))}
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formattedSubtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>IVA (19%)</span>
            <span>{formattedTax}</span>
          </div>
          <div className="flex justify-between font-bold mt-2">
            <span>Total</span>
            <span>{formattedTotal}</span>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t text-center">
          <div className="flex flex-col items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
            <p className="text-green-600 font-medium">Pago Completado (Simulación)</p>
          </div>
          <p className="text-sm text-gray-500">Gracias por utilizar VecinoXpress</p>
        </div>
      </div>
    );
  };
  
  // Renderizar estados del terminal
  const renderTerminalStatus = () => {
    switch (terminalStatus) {
      case 'connected':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Wifi className="w-3 h-3 mr-1" />
            Terminal simulado conectado
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <Wifi className="w-3 h-3 mr-1" />
            Terminal desconectado
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error en terminal
          </Badge>
        );
      default:
        return null;
    }
  };
  
  // Renderizar interfaz de pago
  const renderPaymentInterface = () => {
    switch (paymentStatus) {
      case 'connecting':
        return (
          <div className="text-center py-6">
            <div className="animate-spin w-10 h-10 border-4 border-[#2d219b] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Conectando con terminal de prueba...</p>
          </div>
        );
      case 'waiting':
        return (
          <div className="text-center py-6">
            <Terminal className="w-10 h-10 mx-auto mb-4 text-[#2d219b]" />
            <p className="text-gray-600 font-medium mb-2">Esperando pago en terminal simulado</p>
            <p className="text-sm text-gray-500">
              Este es un terminal simulado para pruebas
            </p>
          </div>
        );
      case 'processing':
        return (
          <div className="text-center py-6">
            <div className="animate-spin w-10 h-10 border-4 border-[#2d219b] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">Procesando pago (simulación)</p>
            <p className="text-sm text-gray-500">Por favor espere mientras se completa la transacción</p>
          </div>
        );
      case 'failure':
        return (
          <div className="text-center py-6">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-red-600 font-medium mb-2">Error en la transacción</p>
            <p className="text-sm text-gray-500">
              No se pudo completar el pago. Por favor intente nuevamente.
            </p>
            <Button 
              onClick={() => setPaymentStatus('idle')}
              className="mt-4"
            >
              Intentar de nuevo
            </Button>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <Alert variant="default" className="bg-yellow-50 border-yellow-200">
              <Info className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700">
                Este es un entorno de prueba. No se realizarán cargos reales.
              </AlertDescription>
            </Alert>
            
            <div className="bg-[#2d219b]/5 p-4 rounded-lg border border-[#2d219b]/10">
              <h3 className="font-medium text-[#2d219b] mb-2">Terminal de pago simulado</h3>
              <p className="text-sm text-gray-600 mb-3">
                Este modo simula un terminal de pagos para probar el sistema:
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Tarjeta de prueba</Badge>
                <Badge variant="outline">Sin cargos reales</Badge>
                <Badge variant="outline">Simulación de QR</Badge>
                <Badge variant="outline">Probar flujo completo</Badge>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold mb-2">{formattedTotal}</p>
              <p className="text-sm text-gray-500 mb-4">Total a pagar (simulado)</p>
              
              <Button
                size="lg"
                className="w-full"
                onClick={processPaymentWithTerminal}
                disabled={isProcessing || terminalStatus !== 'connected'}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Simular pago con terminal
              </Button>
              
              {terminalStatus !== 'connected' && (
                <p className="text-sm text-red-500 mt-2">
                  El terminal simulado no está disponible
                </p>
              )}
            </div>
          </div>
        );
    }
  };
  
  // Renderizado principal
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto mb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')}
              className="mr-4 flex items-center justify-center w-10 h-10 rounded-full bg-white shadow hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-[#2d219b]">VecinoXpress POS</h1>
          </div>
          <div className="flex gap-2">
            {renderTerminalStatus()}
            <div className="text-sm bg-yellow-500 text-white px-3 py-1 rounded-full">
              Modo PRUEBA
            </div>
          </div>
        </div>
        
        {isCompleted ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow text-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-green-700 mb-2">
                ¡Transacción de Prueba Completada!
              </h2>
              <div className="text-gray-600 mb-6">
                <p>La transacción #{transactionId} ha sido procesada exitosamente.</p>
                <p className="text-sm mt-2"><em>Nota: Esta es una transacción de prueba. No se han realizado cargos reales.</em></p>
              </div>
              <Button onClick={startNewTransaction}>
                Nueva Transacción
              </Button>
            </div>
            
            <div className="col-span-1">
              {renderReceipt()}
            </div>
            
            <div className="col-span-1 bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">¿Qué desea hacer ahora?</h3>
              
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left"
                  onClick={() => {
                    // Aquí iría la lógica para imprimir
                    toast({
                      title: 'Imprimir recibo (simulado)',
                      description: 'Simulación de impresión completada',
                    });
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Imprimir recibo (simulado)
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => {
                    // Aquí iría la lógica para enviar por correo
                    toast({
                      title: 'Enviar por correo (simulado)',
                      description: `Simulación de envío a ${customer.email}`,
                    });
                  }}
                >
                  <User className="w-4 h-4 mr-2" />
                  Enviar por correo (simulado)
                </Button>
                
                <Button
                  className="w-full justify-start text-left"
                  onClick={startNewTransaction}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Nueva venta
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="shadow">
                <CardHeader className="bg-gradient-to-r from-[#2d219b]/10 to-[#2d219b]/5">
                  <CardTitle className="flex justify-between items-center">
                    <span>Terminal de Servicios (PRUEBA)</span>
                    <Badge variant="outline" className="bg-white">
                      Tienda: {storeCode}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-0">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full grid grid-cols-3">
                      <TabsTrigger value="services">
                        <List className="w-4 h-4 mr-2" />
                        Servicios
                      </TabsTrigger>
                      <TabsTrigger value="customer">
                        <User className="w-4 h-4 mr-2" />
                        Cliente
                      </TabsTrigger>
                      <TabsTrigger value="payment" disabled={cartItems.length === 0}>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pago
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="services" className="p-6">
                      <h3 className="font-medium mb-4">Seleccione los servicios</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {POS_CONSTANTS.AVAILABLE_SERVICES.map(service => (
                          <div 
                            key={service.id}
                            className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => addToCart(service)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{service.name}</p>
                                <p className="text-sm text-gray-500">
                                  {service.price.toLocaleString('es-CL', { 
                                    style: 'currency', 
                                    currency: 'CLP' 
                                  })}
                                </p>
                              </div>
                              <Button size="sm" variant="ghost">
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <Button
                          disabled={cartItems.length === 0}
                          onClick={() => setActiveTab('customer')}
                        >
                          Siguiente
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="customer" className="p-6">
                      <h3 className="font-medium mb-4">Información del cliente</h3>
                      
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Nombre completo</Label>
                          <Input
                            id="name"
                            value={customer.name}
                            onChange={e => setCustomer({...customer, name: e.target.value})}
                            placeholder="Nombre del cliente"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="email">Correo electrónico</Label>
                          <Input
                            id="email"
                            type="email"
                            value={customer.email}
                            onChange={e => setCustomer({...customer, email: e.target.value})}
                            placeholder="correo@ejemplo.com"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="document">RUT (opcional)</Label>
                          <Input
                            id="document"
                            value={customer.document}
                            onChange={e => setCustomer({...customer, document: e.target.value})}
                            placeholder="12.345.678-9"
                          />
                        </div>
                      </div>
                      
                      {/* Verificación de identidad */}
                      <div className="mt-6 pt-4 border-t">
                        <h3 className="text-lg font-medium mb-4">Verificación de Identidad</h3>
                        
                        {isIdentityVerified ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                            <CheckCircle className="text-green-600 w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-green-800">Identidad Verificada</p>
                              {verificationData && (
                                <div className="mt-2 text-sm text-green-700">
                                  <p>Nombre: {verificationData.fullName}</p>
                                  <p>Documento: {verificationData.documentNumber}</p>
                                  <p>Método: {verificationData.verificationMethod === 'simulate' ? 'Simulado' : 
                                             verificationData.verificationMethod === 'nfc' ? 'NFC' :
                                             verificationData.verificationMethod === 'document' ? 'Documento' : 
                                             'Selfie'}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <IdentityVerification 
                            onVerificationComplete={(data) => {
                              setIsIdentityVerified(true);
                              setVerificationData(data);
                              setCustomer({
                                ...customer,
                                name: data.fullName,
                                document: data.documentNumber
                              });
                              toast({
                                title: "Identidad verificada",
                                description: "La información ha sido verificada exitosamente."
                              });
                            }}
                            mode="simple"
                          />
                        )}
                      </div>
                      
                      <div className="mt-6 flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('services')}
                        >
                          Atrás
                        </Button>
                        <Button
                          onClick={() => setActiveTab('payment')}
                          disabled={!customer.name || !customer.email}
                        >
                          Siguiente
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="payment" className="p-6">
                      <h3 className="font-medium mb-4">Pago con terminal simulado</h3>
                      
                      {renderPaymentInterface()}
                      
                      {errorMessage && (
                        <Alert variant="destructive" className="mt-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                      )}
                      
                      {paymentStatus === 'idle' && (
                        <div className="mt-6 flex justify-between">
                          <Button
                            variant="outline"
                            onClick={() => setActiveTab('customer')}
                          >
                            Atrás
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <div className="col-span-1">
              <Card className="shadow">
                <CardHeader className="bg-gradient-to-r from-[#2d219b]/10 to-[#2d219b]/5 pb-4">
                  <CardTitle className="flex justify-between items-center">
                    <span>Carrito</span>
                    <span className="text-sm bg-[#2d219b] text-white px-2 py-1 rounded">
                      {cartItems.length} ítems
                    </span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    <div className="p-4">
                      {cartItems.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-20" />
                          <p>El carrito está vacío</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {cartItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center border-b pb-2">
                              <div className="flex-1">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-500">
                                  {item.price.toLocaleString('es-CL', { 
                                    style: 'currency', 
                                    currency: 'CLP' 
                                  })}
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 w-7 p-0"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  >
                                    -
                                  </Button>
                                  <span className="w-5 text-center">{item.quantity}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 w-7 p-0"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  >
                                    +
                                  </Button>
                                </div>
                                
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-gray-400"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  
                  <div className="p-4 border-t bg-gray-50">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span>{formattedSubtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">IVA (19%)</span>
                        <span>{formattedTax}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>{formattedTotal}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="border-t p-4">
                  <Button 
                    className="w-full"
                    disabled={cartItems.length === 0 || isProcessing}
                    onClick={() => setActiveTab('payment')}
                  >
                    {cartItems.length === 0 ? 'Agregue servicios' : 'Proceder al pago'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPOSPayment;