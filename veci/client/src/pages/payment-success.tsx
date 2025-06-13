/**
 * Página de éxito para pagos con Tuu Payments
 * 
 * Esta página se muestra cuando un pago ha sido completado exitosamente
 * y redirige al usuario de vuelta a la página de opciones de pago.
 */

import React, { useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function PaymentSuccess() {
  useEffect(() => {
    // Obtener parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const course = urlParams.get('course');
    const email = urlParams.get('email');
    
    // Redirigir automáticamente después de 3 segundos
    const timer = setTimeout(() => {
      // Redirigir basado en el tipo de pago completado
      if (course === 'certifier') {
        // Si es un pago del curso de certificador, redirigir al dashboard con email como parámetro
        window.location.href = `/certification-dashboard?registered=true${email ? `&email=${email}` : ''}`;
      } else {
        // Para otros tipos de pagos, usar la redirección estándar
        window.location.href = "/payment-options?status=success";
      }
    }, 3000);
    
    // Limpieza del temporizador si el componente se desmonta
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full p-6 shadow-md">
        <div className="flex flex-col items-center text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-green-700 mb-2">
            ¡Pago Exitoso!
          </h1>
          <p className="text-gray-600 mb-6">
            Su pago ha sido procesado correctamente. Gracias por su compra.
          </p>
          <div className="bg-green-50 w-full p-4 rounded-md border border-green-100 mb-4">
            <p className="text-sm text-green-800">
              Será redirigido automáticamente en unos segundos...
            </p>
          </div>
          <button
            onClick={() => {
              const urlParams = new URLSearchParams(window.location.search);
              const course = urlParams.get('course');
              const email = urlParams.get('email');
              
              if (course === 'certifier') {
                window.location.href = `/certification-dashboard?registered=true${email ? `&email=${email}` : ''}`;
              } else {
                window.location.href = "/payment-options";
              }
            }}
            className="px-4 py-2 bg-[#2d219b] text-white rounded-md hover:bg-[#2d219b]/90 transition-colors"
          >
            {new URLSearchParams(window.location.search).get('course') === 'certifier' 
              ? "Ir al Panel de Certificador" 
              : "Volver a Opciones de Pago"}
          </button>
        </div>
      </Card>
    </div>
  );
}