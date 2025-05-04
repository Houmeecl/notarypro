/**
 * Componente para integrar la pasarela web de Tuu Payments
 * 
 * Este componente permite procesar pagos a través de la pasarela web de Tuu Payments,
 * lo que permite aceptar pagos con múltiples métodos (tarjetas, transferencias, etc.)
 * directamente desde la aplicación web.
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Globe, CreditCard, QrCode } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Crear una sesión de pago web y redirigir
  const handleCreateWebPayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validar monto
      if (!amount || amount <= 0) {
        throw new Error("El monto debe ser mayor a 0");
      }

      // Generar un ID de transacción único
      const transactionId = `vecinoxpress-web-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Datos de la transacción
      const paymentData = {
        transactionId,
        amount,
        description,
        clientName,
        clientEmail,
        clientRut,
        successUrl: successUrl || window.location.origin + "/payment-success?tuu=true",
        cancelUrl: cancelUrl || window.location.origin + "/payment-cancel?tuu=true",
        metadata: {
          ...metadata,
          paymentMethod: "web",
          platform: "vecinoxpress"
        }
      };

      // Llamar al endpoint de creación de pasarela web
      const response = await apiRequest(
        "POST",
        "/api/tuu-payment/create-web-payment",
        paymentData
      );

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al crear la sesión de pago");
        } catch (jsonError) {
          // Si hay un error al parsear la respuesta, es probable que sea un error de conexión
          throw new Error("No se pudo conectar con el servicio de pagos. Por favor, intente más tarde.");
        }
      }

      const responseData = await response.json();

      // Verificar si tenemos una URL de redirección
      if (responseData.redirectUrl) {
        // Redireccionar a la pasarela de pago
        window.location.href = responseData.redirectUrl;
      } else {
        throw new Error("No se recibió una URL de redirección válida");
      }

    } catch (error: any) {
      console.error("Error al crear pasarela de pago web:", error);
      setError(error.message || "Error al procesar el pago");
      if (onPaymentCancel) {
        onPaymentCancel({ error: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <p className="text-gray-600 text-sm mb-2">
          Al hacer clic en "Pagar" serás redireccionado a la pasarela de pago segura de Tuu Payments 
          donde podrás completar tu transacción utilizando diversos métodos de pago.
        </p>
        
        <Card className="border border-indigo-100 bg-indigo-50/50 p-2 mb-4">
          <CardContent className="p-3 grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center text-center p-2">
              <CreditCard className="h-6 w-6 mb-1.5 text-indigo-600" />
              <span className="text-xs text-indigo-700">Tarjetas de Crédito/Débito</span>
            </div>
            <div className="flex flex-col items-center text-center p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-indigo-700">Transferencia Bancaria</span>
            </div>
            <div className="flex flex-col items-center text-center p-2">
              <QrCode className="h-6 w-6 mb-1.5 text-indigo-600" />
              <span className="text-xs text-indigo-700">Pago QR Códigos</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Button 
        onClick={handleCreateWebPayment}
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <Globe className="mr-2 h-4 w-4" />
            Pagar ${amount.toLocaleString("es-CL")}
          </>
        )}
      </Button>
    </div>
  );
}