/**
 * Componente para integrar pagos con Tuu en dispositivos móviles/tablets
 * 
 * Este componente permite procesar pagos a través de la API de Tuu Payments
 * para dispositivos móviles o tablets, ofreciendo una experiencia optimizada
 * para estos dispositivos con VecinoXpress.
 */

import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Smartphone,
  Receipt
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface TuuMobilePaymentProps {
  amount: number;
  description?: string;
  clientName?: string;
  clientEmail?: string;
  clientRut?: string;
  clientPhone?: string;
  onPaymentSuccess?: (data: any) => void;
  onPaymentError?: (error: any) => void;
  metadata?: Record<string, any>;
}

export default function TuuMobilePayment({
  amount,
  description = "Pago móvil VecinoXpress",
  clientName,
  clientEmail,
  clientRut,
  clientPhone,
  onPaymentSuccess,
  onPaymentError,
  metadata = {}
}: TuuMobilePaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("credit_card");
  const [cardToken, setCardToken] = useState<string>("");
  const { toast } = useToast();

  // Lista de métodos de pago disponibles
  const paymentMethods = [
    { id: "credit_card", name: "Tarjeta de Crédito" },
    { id: "debit_card", name: "Tarjeta de Débito" },
    { id: "transfer", name: "Transferencia" },
    { id: "webpay", name: "Webpay" },
    { id: "onepay", name: "OnePay" }
  ];

  // Procesar pago móvil
  const handleProcessPayment = async () => {
    setIsLoading(true);
    setPaymentStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/tuu-payment/mobile-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          description,
          paymentMethod,
          cardToken: cardToken || undefined,
          clientName,
          clientEmail,
          clientRut,
          clientPhone,
          metadata: {
            ...metadata,
            sourceComponent: "TuuMobilePayment",
            deviceType: "mobile",
            timestamp: new Date().toISOString()
          }
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Error al procesar el pago móvil");
      }

      // Guardar los datos del pago y actualizar estado
      setPaymentData(data.data);
      setPaymentStatus("success");
      
      if (onPaymentSuccess) {
        onPaymentSuccess(data.data);
      }
      
      toast({
        title: "¡Pago exitoso!",
        description: "Tu pago ha sido procesado correctamente",
        variant: "default",
      });
    } catch (err: any) {
      console.error("Error al procesar pago móvil:", err);
      setError(err.message || "Error al procesar el pago");
      setPaymentStatus("error");
      
      if (onPaymentError) {
        onPaymentError(err);
      }
      
      toast({
        title: "Error de pago",
        description: err.message || "No se pudo procesar el pago",
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
          <Smartphone className="mr-2 h-5 w-5 text-indigo-600" />
          Pago Móvil VecinoXpress
        </CardTitle>
        <CardDescription>
          Procesa pagos de forma segura en tu dispositivo móvil o tablet
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
              <Textarea
                id="description"
                value={description}
                disabled
                className="resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Método de pago</Label>
              <Select
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Selecciona un método de pago" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {(paymentMethod === "credit_card" || paymentMethod === "debit_card") && (
              <div className="space-y-2">
                <Label htmlFor="cardToken">Token de tarjeta (opcional)</Label>
                <Input
                  id="cardToken"
                  value={cardToken}
                  onChange={(e) => setCardToken(e.target.value)}
                  placeholder="Token de tarjeta seguro"
                />
                <p className="text-xs text-gray-500">
                  El token es generado por el procesador de pagos para proteger los datos de la tarjeta
                </p>
              </div>
            )}
            
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
            
            {clientEmail && (
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  value={clientEmail}
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
              Procesando tu pago...
            </p>
          </div>
        )}
        
        {paymentStatus === "success" && (
          <div>
            <Alert className="bg-green-50 border-green-200 mb-4">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">¡Pago exitoso!</AlertTitle>
              <AlertDescription className="text-green-700">
                Tu pago ha sido procesado correctamente.
              </AlertDescription>
            </Alert>
            
            {paymentData && (
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Receipt className="h-4 w-4 mr-1" />
                  Detalles de la transacción
                </h4>
                <div className="space-y-1 text-sm">
                  {paymentData.transaction_id && (
                    <p><span className="font-medium">ID:</span> {paymentData.transaction_id}</p>
                  )}
                  {paymentData.amount && (
                    <p><span className="font-medium">Monto:</span> ${parseInt(paymentData.amount).toLocaleString('es-CL')}</p>
                  )}
                  {paymentData.payment_method && (
                    <p><span className="font-medium">Método:</span> {paymentData.payment_method}</p>
                  )}
                  {paymentData.created_at && (
                    <p><span className="font-medium">Fecha:</span> {new Date(paymentData.created_at).toLocaleString('es-CL')}</p>
                  )}
                </div>
              </div>
            )}
          </div>
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
            onClick={handleProcessPayment}
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
        
        {paymentStatus === "loading" && (
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
            onClick={() => window.location.reload()}
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
              onClick={handleProcessPayment}
              className="w-1/2 bg-indigo-600 hover:bg-indigo-700"
            >
              Reintentar
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}