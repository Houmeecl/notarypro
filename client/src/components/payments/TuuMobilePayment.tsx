/**
 * Componente para integrar pagos con Tuu en dispositivos móviles/tablets
 * 
 * Este componente permite procesar pagos a través de la API de Tuu Payments
 * para dispositivos móviles o tablets, ofreciendo una experiencia optimizada
 * para estos dispositivos con VecinoXpress.
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Smartphone, CreditCard, QrCode } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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
  description = "Pago VecinoXpress Móvil",
  clientName,
  clientEmail,
  clientRut,
  clientPhone,
  onPaymentSuccess,
  onPaymentError,
  metadata = {}
}: TuuMobilePaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<"waiting" | "processing" | "completed" | "error">("waiting");

  // Iniciar un pago móvil
  const handleMobilePayment = async () => {
    setIsLoading(true);
    setError(null);
    setPaymentStatus("processing");

    try {
      // Validar monto
      if (!amount || amount <= 0) {
        throw new Error("El monto debe ser mayor a 0");
      }

      // Generar un ID de transacción único
      const transactionId = `vecinoxpress-mobile-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Datos de la transacción
      const paymentRequestData = {
        transactionId,
        amount,
        description,
        clientName,
        clientEmail,
        clientRut,
        clientPhone,
        metadata: {
          ...metadata,
          paymentMethod: "mobile",
          platform: "vecinoxpress"
        }
      };

      // Llamar al endpoint para procesar pagos móviles
      const response = await apiRequest(
        "POST",
        "/api/tuu-payment/mobile-payment",
        paymentRequestData
      );

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al procesar el pago móvil");
        } catch (jsonError) {
          // Si hay un error al parsear la respuesta, es probable que sea un error de conexión
          throw new Error("No se pudo conectar con el servicio de pagos móviles. Por favor, intente más tarde.");
        }
      }

      const data = await response.json();
      setPaymentData(data);

      // Verificar el estado de la transacción
      if (data.status === "success" || data.status === "completed") {
        setPaymentStatus("completed");
        if (onPaymentSuccess) {
          onPaymentSuccess(data);
        }
      } else {
        // Si tenemos un paymentUrl, lo ofrecemos para continuar el proceso
        if (data.paymentUrl) {
          setPaymentData(data);
        } else {
          throw new Error("No se recibió información de pago correctamente");
        }
      }

    } catch (error: any) {
      console.error("Error al procesar pago móvil:", error);
      setError(error.message || "Error al procesar el pago");
      setPaymentStatus("error");
      if (onPaymentError) {
        onPaymentError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Redireccionar a la URL de pago (si es que hay una)
  const handleRedirectToPayment = () => {
    if (paymentData && paymentData.paymentUrl) {
      // Agregar un parámetro adicional para identificar la redirección desde Tuu
      const paymentUrl = new URL(paymentData.paymentUrl);
      // Si la URL es interna, añadimos tuu=true para que el controlador de redirección sepa de dónde viene
      if (paymentUrl.origin === window.location.origin) {
        paymentUrl.searchParams.append('tuu', 'true');
      }
      window.location.href = paymentUrl.toString();
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}
      
      {!paymentData ? (
        <div>
          <div className="mb-4">
            <p className="text-gray-600 text-sm mb-2">
              Optimizado para procesar pagos en dispositivos móviles y tablets con la plataforma de pago Tuu.
              Este método ofrece una experiencia fluida y sencilla para aceptar pagos con tarjetas.
            </p>
            
            <Card className="border border-indigo-100 bg-indigo-50/50 p-2 mb-4">
              <CardContent className="p-3 grid grid-cols-2 gap-2">
                <div className="flex flex-col items-center text-center p-2">
                  <Smartphone className="h-6 w-6 mb-1.5 text-indigo-600" />
                  <span className="text-xs text-indigo-700">Optimizado para Móviles</span>
                </div>
                <div className="flex flex-col items-center text-center p-2">
                  <CreditCard className="h-6 w-6 mb-1.5 text-indigo-600" />
                  <span className="text-xs text-indigo-700">Pago con Tarjetas</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Button 
            onClick={handleMobilePayment}
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
                <Smartphone className="mr-2 h-4 w-4" />
                Pagar ${amount.toLocaleString("es-CL")}
              </>
            )}
          </Button>
        </div>
      ) : paymentStatus === "completed" ? (
        <div className="py-3 px-4 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="font-medium">¡Pago completado exitosamente!</p>
          <p className="mt-1">El pago ha sido procesado correctamente.</p>
        </div>
      ) : (
        <div className="text-center">
          {paymentData.paymentUrl && (
            <>
              <p className="text-sm text-gray-600 mb-3">
                Se ha generado un enlace de pago para completar la transacción. 
                Haz clic en el botón a continuación para continuar con el proceso.
              </p>
              <Card className="border border-indigo-100 bg-indigo-50/30 p-4 mb-4">
                <QrCode className="h-12 w-12 mx-auto mb-3 text-indigo-600" />
                <p className="text-sm text-indigo-700 font-medium">
                  ID de Transacción: {paymentData.transactionId || "N/A"}
                </p>
                <p className="text-xs text-indigo-600 mt-2">
                  Monto: ${amount.toLocaleString("es-CL")}
                </p>
              </Card>
              <Button
                onClick={handleRedirectToPayment}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Continuar con el pago
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}