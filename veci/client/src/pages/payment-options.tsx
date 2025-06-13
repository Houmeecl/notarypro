/**
 * Página de demostración de opciones de pago con Tuu
 * 
 * Esta página muestra las diferentes opciones de pago integradas
 * con Tuu Payments: POS físico, pasarela web online y pagos móviles.
 */

import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Terminal, Globe, Smartphone, CheckCircle, XCircle } from "lucide-react";

// Componentes de pago
import TuuPOSPayment from "@/components/payments/TuuPOSPayment";
import TuuWebPayment from "@/components/payments/TuuWebPayment";
import TuuMobilePayment from "@/components/payments/TuuMobilePayment";

export default function PaymentOptions() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [amount, setAmount] = useState<number>(1000);
  const [clientName, setClientName] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [clientRut, setClientRut] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<string>("web");
  const [paymentStatus, setPaymentStatus] = useState<
    "none" | "success" | "canceled" | "error"
  >("none");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Obtener el estado de la URL si existe
  useEffect(() => {
    try {
      // Comprobar si hay parámetros de consulta para el estado del pago
      const urlParams = new URLSearchParams(window.location.search);
      const status = urlParams.get("status");

      if (status === "success") {
        setPaymentStatus("success");
        toast({
          title: "Pago exitoso",
          description: "El pago ha sido completado con éxito",
        });
      } else if (status === "canceled" || status === "cancelled") {
        setPaymentStatus("canceled");
        toast({
          title: "Pago cancelado",
          description: "El pago ha sido cancelado",
          variant: "destructive",
        });
      } else if (status === "error" || status === "failed") {
        setPaymentStatus("error");
        toast({
          title: "Error en el pago",
          description: "Ocurrió un error al procesar el pago",
          variant: "destructive",
        });
      }

      // Limpiar los parámetros de la URL
      if (status) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    } catch (error) {
      console.error("Error al procesar parámetros de URL:", error);
    }
  }, [toast]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setAmount(value);
    }
  };

  const handlePaymentSuccess = (data: any) => {
    console.log("Pago completado exitosamente:", data);
    setPaymentStatus("success");
    setIsProcessing(false);
    toast({
      title: "Pago exitoso",
      description: "El pago ha sido completado con éxito",
    });
  };

  const handlePaymentError = (error: any) => {
    console.error("Error en el pago:", error);
    setPaymentStatus("error");
    setIsProcessing(false);
    toast({
      title: "Error en el pago",
      description: error.message || "Ocurrió un error al procesar el pago",
      variant: "destructive",
    });
  };

  const handlePaymentCancel = () => {
    console.log("Pago cancelado");
    setPaymentStatus("canceled");
    setIsProcessing(false);
    toast({
      title: "Pago cancelado",
      description: "El pago ha sido cancelado",
      variant: "destructive",
    });
  };

  const handleResetPayment = () => {
    setPaymentStatus("none");
    setIsProcessing(false);
  };

  // Renderizar un banner de estado si hay un estado de pago
  const renderStatusBanner = () => {
    if (paymentStatus === "none") return null;

    if (paymentStatus === "success") {
      return (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 flex items-center">
          <CheckCircle className="text-green-500 mr-3 h-5 w-5" />
          <div>
            <p className="text-green-800 font-medium">¡Pago exitoso!</p>
            <p className="text-green-700 text-sm">El pago ha sido completado correctamente.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto border-green-300 text-green-700 hover:bg-green-50"
            onClick={handleResetPayment}
          >
            Nuevo Pago
          </Button>
        </div>
      );
    } else if (paymentStatus === "canceled") {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6 flex items-center">
          <XCircle className="text-amber-500 mr-3 h-5 w-5" />
          <div>
            <p className="text-amber-800 font-medium">Pago cancelado</p>
            <p className="text-amber-700 text-sm">
              La transacción ha sido cancelada.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto border-amber-300 text-amber-700 hover:bg-amber-50"
            onClick={handleResetPayment}
          >
            Intentar de nuevo
          </Button>
        </div>
      );
    } else if (paymentStatus === "error") {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-center">
          <XCircle className="text-red-500 mr-3 h-5 w-5" />
          <div>
            <p className="text-red-800 font-medium">Error en el pago</p>
            <p className="text-red-700 text-sm">
              Ocurrió un error al procesar el pago.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto border-red-300 text-red-700 hover:bg-red-50"
            onClick={handleResetPayment}
          >
            Intentar de nuevo
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Toaster />
      <h1 className="text-3xl font-bold text-center mb-2 text-[#2d219b]">
        Opciones de Pago - VecinoXpress
      </h1>
      <p className="text-gray-600 text-center mb-8">
        Demostración de integración con Tuu Payments
      </p>

      {renderStatusBanner()}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-[#2d219b]/20 shadow-sm">
          <CardHeader className="bg-[#2d219b]/5 border-b border-[#2d219b]/10">
            <CardTitle className="text-[#2d219b] flex items-center">
              <Terminal className="mr-2 h-5 w-5" />
              Terminal POS
            </CardTitle>
            <CardDescription>
              Para puntos de venta físicos con terminal
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-600 mb-3">
              Procesa pagos con tarjetas de crédito/débito usando un terminal POS
              físico de Tuu Payments.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-[#2d219b] hover:bg-[#2d219b]/90"
              onClick={() => setSelectedTab("pos")}
            >
              <Terminal className="mr-2 h-4 w-4" />
              Pagar con Terminal
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-[#2d219b]/20 shadow-sm">
          <CardHeader className="bg-[#2d219b]/5 border-b border-[#2d219b]/10">
            <CardTitle className="text-[#2d219b] flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Pasarela Web
            </CardTitle>
            <CardDescription>Pagos online con múltiples métodos</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-600 mb-3">
              Redirecciona a una pasarela de pago web con múltiples opciones:
              tarjetas, transferencias, y más.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-[#2d219b] hover:bg-[#2d219b]/90"
              onClick={() => setSelectedTab("web")}
            >
              <Globe className="mr-2 h-4 w-4" />
              Pagar en Línea
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-[#2d219b]/20 shadow-sm">
          <CardHeader className="bg-[#2d219b]/5 border-b border-[#2d219b]/10">
            <CardTitle className="text-[#2d219b] flex items-center">
              <Smartphone className="mr-2 h-5 w-5" />
              Pago Móvil
            </CardTitle>
            <CardDescription>
              Optimizado para dispositivos móviles
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-600 mb-3">
              Versión optimizada para procesamiento de pagos en dispositivos
              móviles y tablets.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-[#2d219b] hover:bg-[#2d219b]/90"
              onClick={() => setSelectedTab("mobile")}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Pagar desde Móvil
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold mb-2">Configuración del Pago</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Monto (CLP)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Monto a pagar"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="clientRut">RUT (opcional)</Label>
              <Input
                id="clientRut"
                value={clientRut}
                onChange={(e) => setClientRut(e.target.value)}
                placeholder="Ej: 12.345.678-9"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="clientName">Nombre (opcional)</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nombre del cliente"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="clientEmail">Email (opcional)</Label>
              <Input
                id="clientEmail"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="email@ejemplo.com"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <TabsList className="grid grid-cols-3 w-full">
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
          </div>

          <div className="p-6">
            <TabsContent value="pos" className="mt-0">
              <TuuPOSPayment
                amount={amount}
                description={`Pago VecinoXpress - Demo ${amount} CLP`}
                clientRut={clientRut}
                onPaymentComplete={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </TabsContent>

            <TabsContent value="web" className="mt-0">
              <TuuWebPayment
                amount={amount}
                description={`Pago VecinoXpress - Demo ${amount} CLP`}
                clientName={clientName}
                clientEmail={clientEmail}
                clientRut={clientRut}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentCancel={handlePaymentCancel}
              />
            </TabsContent>

            <TabsContent value="mobile" className="mt-0">
              <TuuMobilePayment
                amount={amount}
                description={`Pago VecinoXpress Móvil - Demo ${amount} CLP`}
                clientName={clientName}
                clientEmail={clientEmail}
                clientRut={clientRut}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <div className="mt-8 bg-[#2d219b]/5 rounded-lg p-6 border border-[#2d219b]/20">
        <h3 className="text-lg font-medium text-[#2d219b] mb-3">
          Información sobre los métodos de pago
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium mb-1 flex items-center">
              <Terminal className="mr-2 h-4 w-4 text-[#2d219b]" /> Terminal POS
            </h4>
            <p>
              Ideal para tiendas físicas donde se requiere que el cliente pague con
              tarjeta usando un terminal POS. Requiere un terminal Tuu
              compatible.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1 flex items-center">
              <Globe className="mr-2 h-4 w-4 text-[#2d219b]" /> Pasarela Web
            </h4>
            <p>
              Perfecta para pagos en línea, redirige al cliente a una página de pago
              segura donde puede elegir entre diferentes métodos de pago.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1 flex items-center">
              <Smartphone className="mr-2 h-4 w-4 text-[#2d219b]" /> Pago Móvil
            </h4>
            <p>
              Optimizado para tablets y dispositivos móviles, ofrece una
              experiencia de pago fluida para pagos con tarjeta en entornos móviles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}