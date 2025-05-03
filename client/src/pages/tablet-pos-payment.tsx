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
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { POS_CONSTANTS } from '@/lib/pos-config';
import PayPalButton from '../components/PayPalButton';
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

// Componente principal
const TabletPOSPayment: React.FC = () => {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  
  // Estados para el POS
  const [activeTab, setActiveTab] = useState('services');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    email: '',
    document: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'paypal' | 'cash'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isIdentityVerified, setIsIdentityVerified] = useState(false);
  const [verificationData, setVerificationData] = useState<VerificationResult | null>(null);
  
  // Cálculos de totales
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * POS_CONSTANTS.TAX_RATE;
  const total = subtotal + tax;
  
  // Verificar parámetros de URL para pagos de MercadoPago
  useEffect(() => {
    // Obtener parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const reference = params.get('reference');
    
    // Si hay parámetros de pago de MercadoPago, procesarlos
    if (status && reference && reference.startsWith('TX-TABLET-')) {
      // Guardar ID de transacción
      setTransactionId(reference);
      
      // Recuperar los datos del cliente si no están disponibles
      if (!customer.name || !customer.email) {
        try {
          const savedCustomer = localStorage.getItem(`tx_customer_${reference}`);
          if (savedCustomer) {
            setCustomer(JSON.parse(savedCustomer));
          }
        } catch (e) {
          console.error('Error recuperando datos del cliente:', e);
        }
      }
      
      // Recuperar los items del carrito si está vacío
      if (cartItems.length === 0) {
        try {
          const savedCart = localStorage.getItem(`tx_cart_${reference}`);
          if (savedCart) {
            setCartItems(JSON.parse(savedCart));
          }
        } catch (e) {
          console.error('Error recuperando items del carrito:', e);
        }
      }
      
      // Procesar según el estado
      if (status === 'success' || status === 'approved') {
        setIsCompleted(true);
        toast({
          title: 'Pago completado',
          description: `Transacción ${reference} procesada exitosamente`,
        });
      } else if (status === 'pending') {
        setActiveTab('payment');
        setErrorMessage(
          'Tu pago está en proceso de verificación. Una vez confirmado, ' +
          'actualizaremos el estado de tu transacción. No es necesario realizar el pago nuevamente.'
        );
        toast({
          title: 'Pago pendiente',
          description: 'El pago está en proceso de verificación',
          variant: 'default',
        });
      } else {
        setActiveTab('payment');
        setErrorMessage('El pago no pudo ser procesado. Por favor intente nuevamente o elija otro método de pago.');
        toast({
          title: 'Pago fallido',
          description: 'No se pudo completar la transacción',
          variant: 'destructive',
        });
      }
      
      // Limpiar parámetros de URL para evitar procesamiento duplicado
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);
  const formattedSubtotal = subtotal.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
  const formattedTax = tax.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
  const formattedTotal = total.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
  
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
  
  // Procesar pago
  const processPayment = async () => {
    if (cartItems.length === 0) {
      setErrorMessage('No hay items en el carrito');
      return;
    }
    
    if (!customer.name || !customer.email) {
      setErrorMessage('Por favor complete la información del cliente');
      setActiveTab('customer');
      return;
    }
    
    setIsProcessing(true);
    setErrorMessage(null);
    
    try {
      // Si el método de pago es MercadoPago, usar la API
      if (paymentMethod === 'mercadopago') {
        // Preparar los items para MercadoPago
        const mercadoPagoItems = cartItems.map(item => ({
          title: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          currency_id: 'CLP'
        }));
        
        // Generar identificador único para la transacción
        const externalReference = `TX-TABLET-${Date.now().toString()}`;
        
        // Guardar datos del cliente en localStorage para recuperación post-redirección
        try {
          localStorage.setItem(`tx_customer_${externalReference}`, JSON.stringify(customer));
          localStorage.setItem(`tx_cart_${externalReference}`, JSON.stringify(cartItems));
        } catch (e) {
          console.error('Error guardando datos del cliente:', e);
        }
        
        // URLs de retorno para procesamiento de pago
        const backUrls = {
          success: `${window.location.origin}/tablet-pos-payment?status=success&reference=${externalReference}`,
          failure: `${window.location.origin}/tablet-pos-payment?status=failure&reference=${externalReference}`,
          pending: `${window.location.origin}/tablet-pos-payment?status=pending&reference=${externalReference}`
        };
        
        // Crear la preferencia de pago
        const response = await fetch('/api/payments/create-preference', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            items: mercadoPagoItems,
            backUrls,
            externalReference,
            identification: {
              type: 'RUT',
              number: customer.document
            }
          })
        });
        
        if (!response.ok) {
          throw new Error('Error al crear preferencia de pago');
        }
        
        const preference = await response.json();
        
        // Guardar la referencia de la transacción
        setTransactionId(externalReference);
        
        // Redirigir al usuario al checkout de MercadoPago
        if (preference.init_point) {
          window.location.href = preference.init_point;
          return; // Terminar ejecución aquí ya que estamos redirigiendo
        } else {
          throw new Error('No se recibió URL de pago');
        }
      } else {
        // Para otros métodos de pago, usar la simulación existente
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generar un ID de transacción
        const txId = 'TX-' + Date.now().toString().slice(-6);
        setTransactionId(txId);
        setIsCompleted(true);
        
        toast({
          title: 'Pago completado',
          description: `Transacción ${txId} procesada exitosamente`,
        });
      }
    } catch (error) {
      console.error('Error procesando el pago:', error);
      setErrorMessage('Error al procesar el pago. Intente nuevamente.');
      
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
    setPaymentMethod('cash');
    setIsCompleted(false);
    setTransactionId(null);
    setErrorMessage(null);
    setIsIdentityVerified(false);
    setVerificationData(null);
    setActiveTab('services');
  };
  
  // Renderizar el recibo
  const renderReceipt = () => {
    return (
      <div className="bg-white p-6 rounded-lg border">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold">Recibo de Pago</h3>
          <p className="text-gray-500">VecinoXpress</p>
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
            <p className="text-green-600 font-medium">Pago Completado</p>
          </div>
          <p className="text-sm text-gray-500">Gracias por utilizar VecinoXpress</p>
        </div>
      </div>
    );
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
            <h1 className="text-2xl font-bold text-[#2d219b]">VecinoXpress Tablet POS</h1>
          </div>
          <div className="text-sm bg-[#2d219b] text-white px-3 py-1 rounded-full">
            Versión Tablet (Web)
          </div>
        </div>
        
        {isCompleted ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow text-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-green-700 mb-2">
                ¡Transacción Completada!
              </h2>
              <p className="text-gray-600 mb-6">
                La transacción #{transactionId} ha sido procesada exitosamente.
              </p>
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
                      title: 'Imprimir recibo',
                      description: 'Funcionalidad en desarrollo',
                    });
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Imprimir recibo
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => {
                    // Aquí iría la lógica para enviar por correo
                    toast({
                      title: 'Enviar por correo',
                      description: 'Funcionalidad en desarrollo',
                    });
                  }}
                >
                  <User className="w-4 h-4 mr-2" />
                  Enviar por correo
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
                  <CardTitle>Terminal de Servicios</CardTitle>
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
                      <h3 className="font-medium mb-4">Método de pago</h3>
                      
                      <div className="space-y-4">
                        <div 
                          className={`border rounded-lg p-4 cursor-pointer ${
                            paymentMethod === 'cash' ? 'border-[#2d219b] bg-[#2d219b]/5' : ''
                          }`}
                          onClick={() => setPaymentMethod('cash')}
                        >
                          <div className="flex items-center">
                            <DollarSign className="w-5 h-5 mr-3 text-gray-600" />
                            <div>
                              <p className="font-medium">Efectivo</p>
                              <p className="text-sm text-gray-500">Pago en efectivo</p>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className={`border rounded-lg p-4 cursor-pointer ${
                            paymentMethod === 'mercadopago' ? 'border-[#2d219b] bg-[#2d219b]/5' : ''
                          }`}
                          onClick={() => setPaymentMethod('mercadopago')}
                        >
                          <div className="flex items-center">
                            <CreditCard className="w-5 h-5 mr-3 text-blue-500" />
                            <div>
                              <p className="font-medium">MercadoPago</p>
                              <p className="text-sm text-gray-500">Pago con tarjeta, transferencia o QR</p>
                            </div>
                          </div>
                          <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                            Método recomendado - Acepta todos los medios de pago
                          </div>
                        </div>
                        
                        <div 
                          className={`border rounded-lg p-4 cursor-pointer ${
                            paymentMethod === 'paypal' ? 'border-[#2d219b] bg-[#2d219b]/5' : ''
                          }`}
                          onClick={() => setPaymentMethod('paypal')}
                        >
                          <div className="flex items-center">
                            <CreditCard className="w-5 h-5 mr-3 text-blue-700" />
                            <div>
                              <p className="font-medium">PayPal</p>
                              <p className="text-sm text-gray-500">Pago con PayPal o tarjeta</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {paymentMethod === 'mercadopago' && (
                        <div className="mt-4 p-4 border rounded-lg bg-blue-50 border-blue-200">
                          <div className="flex items-center mb-3">
                            <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
                            <h4 className="font-medium text-blue-700">Pago con MercadoPago</h4>
                          </div>
                          <div className="space-y-2 mb-4">
                            <p className="text-sm text-blue-600">
                              Al continuar serás redirigido a la plataforma segura de MercadoPago donde podrás:
                            </p>
                            <ul className="text-sm text-blue-600 list-disc pl-5 space-y-1">
                              <li>Pagar con tarjeta de crédito o débito</li>
                              <li>Transferencia bancaria</li>
                              <li>Pagar con QR desde tu aplicación móvil</li>
                              <li>Usar el saldo de tu cuenta MercadoPago</li>
                            </ul>
                          </div>
                          <p className="text-xs text-blue-500">
                            Serás retornado automáticamente a esta pantalla cuando completes el pago
                          </p>
                        </div>
                      )}
                      
                      {paymentMethod === 'paypal' && (
                        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                          <div className="flex justify-center mb-4">
                            <PayPalButton
                              amount={(total / 800).toFixed(2)}
                              currency="USD"
                              intent="capture"
                            />
                          </div>
                          <p className="text-sm text-gray-500 text-center">
                            Conversión aproximada: 1 USD = 800 CLP
                          </p>
                        </div>
                      )}
                      
                      {errorMessage && (
                        <Alert variant="destructive" className="mt-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="mt-6 flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('customer')}
                        >
                          Atrás
                        </Button>
                        
                        {paymentMethod !== 'paypal' && (
                          <Button
                            onClick={processPayment}
                            disabled={isProcessing}
                          >
                            {isProcessing ? 'Procesando...' : 'Completar pago'}
                          </Button>
                        )}
                      </div>
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

export default TabletPOSPayment;