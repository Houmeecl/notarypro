/**
 * Página de demostración de opciones de pago con Tuu
 * 
 * Esta página muestra las diferentes opciones de pago integradas
 * con Tuu Payments: POS físico, pasarela web online y pagos móviles.
 */

import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Terminal,
  Globe,
  Smartphone,
  CreditCard,
  ArrowLeft,
  BadgeDollarSign,
  Receipt,
  User,
  CheckCircle2
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Importar componentes de pago
import TuuPOSPayment from "@/components/payments/TuuPOSPayment";
import TuuWebPayment from "@/components/payments/TuuWebPayment";
import TuuMobilePayment from "@/components/payments/TuuMobilePayment";

export default function PaymentOptions() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("pos");
  const [amount, setAmount] = useState(10000);
  const [clientName, setClientName] = useState("Cliente Demo");
  const [clientRut, setClientRut] = useState("11111111-1");
  const [clientEmail, setClientEmail] = useState("cliente@demo.cl");
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  
  // Analizar parámetros de URL manualmente
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const status = params.get("status");
    
    if (tab) {
      setSelectedTab(tab);
    }
    
    // Verificar si se vuelve de una redirección de pago
    if (status === "success") {
      setPaymentCompleted(true);
      toast({
        title: "Pago completado",
        description: "El pago se ha procesado exitosamente",
      });
    } else if (status === "cancel") {
      toast({
        title: "Pago cancelado",
        description: "El pago ha sido cancelado o rechazado",
        variant: "destructive",
      });
    }
  }, [location, toast]);

  // Manejar cambio de monto
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value.replace(/\D/g, "") || "0");
    setAmount(value);
  };

  // Manejar pago exitoso
  const handlePaymentSuccess = (data: any) => {
    setPaymentCompleted(true);
    setPaymentResult(data);
    toast({
      title: "Pago exitoso",
      description: "El pago se ha procesado correctamente",
    });
  };

  // Manejar error de pago
  const handlePaymentError = (error: any) => {
    console.error("Error de pago:", error);
    toast({
      title: "Error de pago",
      description: error.message || "Hubo un problema al procesar el pago",
      variant: "destructive",
    });
  };

  // Reiniciar el proceso de pago
  const resetPayment = () => {
    setPaymentCompleted(false);
    setPaymentResult(null);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold tracking-tight text-indigo-900 mb-2">
          Opciones de Pago VecinoXpress
        </h1>
        <p className="text-gray-500 max-w-3xl">
          Demuestra las diferentes opciones de pago integradas con Tuu Payments:
          terminales POS físicos, pasarela web y pagos móviles.
        </p>
      </div>
      
      {!paymentCompleted ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BadgeDollarSign className="mr-2 h-5 w-5 text-indigo-600" />
                Detalles del Pago
              </CardTitle>
              <CardDescription>
                Configura los detalles del pago a procesar
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto a pagar (CLP)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <Input
                    id="amount"
                    value={amount.toLocaleString("es-CL")}
                    onChange={handleAmountChange}
                    className="pl-7"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientName">Nombre del cliente</Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientRut">RUT</Label>
                <Input
                  id="clientRut"
                  value={clientRut}
                  onChange={(e) => setClientRut(e.target.value)}
                  placeholder="Ej: 12345678-9"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="col-span-1 lg:col-span-2">
            <Tabs 
              value={selectedTab} 
              onValueChange={setSelectedTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pos" className="flex items-center">
                  <Terminal className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Terminal POS</span>
                  <span className="sm:hidden">POS</span>
                </TabsTrigger>
                <TabsTrigger value="web" className="flex items-center">
                  <Globe className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Pasarela Web</span>
                  <span className="sm:hidden">Web</span>
                </TabsTrigger>
                <TabsTrigger value="mobile" className="flex items-center">
                  <Smartphone className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Pago Móvil</span>
                  <span className="sm:hidden">Móvil</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pos" className="border rounded-md mt-4 p-0 overflow-hidden">
                <div className="bg-indigo-50 p-4 border-b">
                  <h3 className="text-lg font-medium text-indigo-900 flex items-center">
                    <Terminal className="mr-2 h-5 w-5 text-indigo-700" />
                    Pago con Terminal POS
                  </h3>
                  <p className="text-sm text-indigo-700">
                    Para terminales físicos Sunmi T5810 conectados al sistema
                  </p>
                </div>
                <div className="p-6">
                  <TuuPOSPayment
                    amount={amount}
                    description={`Pago VecinoXpress - ${clientName}`}
                    clientRut={clientRut}
                    onPaymentComplete={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="web" className="border rounded-md mt-4 p-0 overflow-hidden">
                <div className="bg-indigo-50 p-4 border-b">
                  <h3 className="text-lg font-medium text-indigo-900 flex items-center">
                    <Globe className="mr-2 h-5 w-5 text-indigo-700" />
                    Pago con Pasarela Web
                  </h3>
                  <p className="text-sm text-indigo-700">
                    Redirección a pasarela web segura con múltiples medios de pago
                  </p>
                </div>
                <div className="p-6">
                  <TuuWebPayment
                    amount={amount}
                    description={`Pago VecinoXpress - ${clientName}`}
                    clientName={clientName}
                    clientEmail={clientEmail}
                    clientRut={clientRut}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentCancel={handlePaymentError}
                    successUrl={`${window.location.origin}/payment-options?status=success`}
                    cancelUrl={`${window.location.origin}/payment-options?status=cancel`}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="mobile" className="border rounded-md mt-4 p-0 overflow-hidden">
                <div className="bg-indigo-50 p-4 border-b">
                  <h3 className="text-lg font-medium text-indigo-900 flex items-center">
                    <Smartphone className="mr-2 h-5 w-5 text-indigo-700" />
                    Pago Móvil
                  </h3>
                  <p className="text-sm text-indigo-700">
                    Optimizado para dispositivos móviles y tablets
                  </p>
                </div>
                <div className="p-6">
                  <TuuMobilePayment
                    amount={amount}
                    description={`Pago VecinoXpress - ${clientName}`}
                    clientName={clientName}
                    clientEmail={clientEmail}
                    clientRut={clientRut}
                    clientPhone=""
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        <Card className="max-w-2xl mx-auto border-green-200 shadow-md">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <CardTitle className="flex items-center text-green-800">
              <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
              Pago Procesado Exitosamente
            </CardTitle>
            <CardDescription className="text-green-700">
              La transacción ha sido completada correctamente
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="bg-green-50 rounded-md p-4 mb-4 border border-green-100">
              <h3 className="font-medium text-green-800 flex items-center mb-3">
                <Receipt className="mr-2 h-4 w-4 text-green-600" />
                Detalles de la transacción
              </h3>
              
              <div className="space-y-2 text-sm">
                {paymentResult?.id && (
                  <div className="flex justify-between border-b border-green-100 pb-1">
                    <span className="text-gray-600">ID de Transacción:</span>
                    <span className="font-medium">{paymentResult.id}</span>
                  </div>
                )}
                
                <div className="flex justify-between border-b border-green-100 pb-1">
                  <span className="text-gray-600">Monto:</span>
                  <span className="font-medium">${amount.toLocaleString("es-CL")}</span>
                </div>
                
                <div className="flex justify-between border-b border-green-100 pb-1">
                  <span className="text-gray-600">Estado:</span>
                  <span className="font-medium text-green-700">Completado</span>
                </div>
                
                <div className="flex justify-between border-b border-green-100 pb-1">
                  <span className="text-gray-600">Fecha:</span>
                  <span className="font-medium">
                    {new Date().toLocaleString("es-CL")}
                  </span>
                </div>
                
                <div className="flex justify-between border-b border-green-100 pb-1">
                  <span className="text-gray-600">Cliente:</span>
                  <span className="font-medium">{clientName}</span>
                </div>
                
                {paymentResult?.payment_method && (
                  <div className="flex justify-between border-b border-green-100 pb-1">
                    <span className="text-gray-600">Método de pago:</span>
                    <span className="font-medium">{paymentResult.payment_method}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-center py-3 px-4 bg-indigo-50 rounded-md">
              <User className="text-indigo-600 h-5 w-5 mr-2" />
              <span className="text-indigo-700">
                Pago procesado a través de<span className="font-bold"> VecinoXpress + Tuu Payments</span>
              </span>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center gap-4 pt-4 pb-6">
            <Button
              variant="outline"
              onClick={() => window.location.href = "/"}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={resetPayment}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Nuevo Pago
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}