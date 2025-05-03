/**
 * Componente para integrar la pasarela web de Tuu Payments
 * 
 * Este componente permite procesar pagos a través de la pasarela web de Tuu Payments,
 * lo que permite aceptar pagos con múltiples métodos (tarjetas, transferencias, etc.)
 * directamente desde la aplicación web.
 */

import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface TuuWebPaymentProps {
  amount: number;
  description?: string;
  clientName?: string;
  clientEmail?: string;
  clientRut?: string;
  successUrl?: string;
  cancelUrl?: string;
  onPaymentSuccess?: (data: any) => void;
  onPaymentCancel?: (data: any) => void;
  metadata?: Record<string, any>;
}

export default function TuuWebPayment({
  amount,
  description = "Pago VecinoXpress",
  clientName,
  clientEmail,
  clientRut,
  successUrl,
  cancelUrl,
  onPaymentSuccess,
  onPaymentCancel,
  metadata = {}
}: TuuWebPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "loading" | "success" | "error" | "redirecting">("idle");
  const [paymentSession, setPaymentSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Crear una sesión de pago y redirigir a la pasarela de Tuu
  const handleCreatePayment = async () => {
    setIsLoading(true);
    setPaymentStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/tuu-payment/create-web-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          description,
          clientName,
          clientEmail,
          clientRut,
          successUrl,
          cancelUrl,
          metadata: {
            ...metadata,
            sourceComponent: "TuuWebPayment",
            timestamp: new Date().toISOString()
          }
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Error al crear la sesión de pago");
      }

      // Guardar la sesión y cambiar el estado
      setPaymentSession(data.data);
      setPaymentStatus("redirecting");

      // Redirigir a la pasarela de pago
      setTimeout(() => {
        window.location.href = data.data.checkout_url;
      }, 1000);
    } catch (err: any) {
      console.error("Error al crear sesión de pago:", err);
      setError(err.message || "Error al procesar el pago");
      setPaymentStatus("error");
      
      toast({
        title: "Error de pago",
        description: err.message || "No se pudo iniciar el proceso de pago",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar el estado de una sesión de pago existente
  const checkPaymentStatus = async (sessionId: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/tuu-payment/checkout-session/${sessionId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Error al verificar el estado del pago");
      }

      setPaymentSession(data.data);
      
      // Actualizar estado según la respuesta
      if (data.data.status === "completed" || data.data.status === "succeeded") {
        setPaymentStatus("success");
        if (onPaymentSuccess) onPaymentSuccess(data.data);
        
        toast({
          title: "¡Pago exitoso!",
          description: "Tu pago ha sido procesado correctamente",
          variant: "default",
        });
      } else if (data.data.status === "cancelled" || data.data.status === "failed") {
        setPaymentStatus("error");
        if (onPaymentCancel) onPaymentCancel(data.data);
        
        toast({
          title: "Pago no completado",
          description: "El proceso de pago ha sido cancelado o ha fallado",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Error al verificar estado de pago:", err);
      setError(err.message || "Error al verificar el estado del pago");
      setPaymentStatus("error");
      
      toast({
        title: "Error de verificación",
        description: err.message || "No se pudo verificar el estado del pago",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5 text-indigo-600" />
          Pago online
        </CardTitle>
        <CardDescription>
          Paga de forma segura utilizando nuestra pasarela de pagos
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {paymentStatus === "idle" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto a pagar</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <Input
                  id="amount"
                  value={amount.toLocaleString('es-CL')}
                  className="pl-7"
                  disabled
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={description}
                disabled
              />
            </div>
            
            {clientName && (
              <div className="space-y-2">
                <Label htmlFor="clientName">Nombre</Label>
                <Input
                  id="clientName"
                  value={clientName}
                  disabled
                />
              </div>
            )}
          </div>
        )}
        
        {paymentStatus === "loading" && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-center text-gray-600">
              Preparando tu sesión de pago...
            </p>
          </div>
        )}
        
        {paymentStatus === "redirecting" && (
          <div className="flex flex-col items-center justify-center py-8">
            <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-center text-gray-600">
              Redirigiendo a la pasarela de pagos...
            </p>
          </div>
        )}
        
        {paymentStatus === "success" && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">¡Pago exitoso!</AlertTitle>
            <AlertDescription className="text-green-700">
              Tu pago ha sido procesado correctamente.
              {paymentSession?.transaction_id && (
                <p className="mt-2 text-sm">
                  ID de transacción: {paymentSession.transaction_id}
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {paymentStatus === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error en el pago</AlertTitle>
            <AlertDescription>
              {error || "Ha ocurrido un error al procesar tu pago. Por favor, intenta nuevamente."}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center">
        {paymentStatus === "idle" && (
          <Button 
            onClick={handleCreatePayment}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pagar ${amount.toLocaleString('es-CL')}
              </>
            )}
          </Button>
        )}
        
        {(paymentStatus === "redirecting" || paymentStatus === "loading") && (
          <Button 
            disabled 
            className="w-full"
          >
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando pago...
          </Button>
        )}
        
        {paymentStatus === "success" && (
          <Button 
            onClick={() => window.location.href = successUrl || "/"}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Continuar
          </Button>
        )}
        
        {paymentStatus === "error" && (
          <div className="flex w-full gap-2">
            <Button 
              onClick={() => setPaymentStatus("idle")}
              variant="outline"
              className="w-1/2"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreatePayment}
              className="w-1/2 bg-indigo-600 hover:bg-indigo-700"
            >
              Reintentar
            </Button>
          </div>
        )}
        
        {paymentSession?.id && ["loading", "redirecting"].includes(paymentStatus) && (
          <Button
            variant="link"
            className="mt-2 text-indigo-600"
            onClick={() => window.open(paymentSession.checkout_url, "_blank")}
          >
            <ExternalLink className="mr-1 h-4 w-4" />
            Abrir en nueva ventana
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}