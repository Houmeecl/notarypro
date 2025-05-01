import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

// Tipos
interface MercadoPagoPaymentProps {
  productTitle: string;
  productDescription?: string;
  productPrice: number;
  onPaymentSuccess?: (data: any) => void;
  onPaymentError?: (error: Error) => void;
  onPaymentPending?: () => void;
  showSuccessMessage?: boolean;
}

interface PaymentPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

/**
 * Componente para realizar pagos con MercadoPago
 */
export function MercadoPagoPayment({
  productTitle,
  productDescription,
  productPrice,
  onPaymentSuccess,
  onPaymentError,
  onPaymentPending,
  showSuccessMessage = true
}: MercadoPagoPaymentProps) {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string | null>(null);

  // Obtener la clave pública de MercadoPago
  useEffect(() => {
    const getPublicKey = async () => {
      try {
        const response = await apiRequest('GET', '/api/mercadopago/public-key');
        const data = await response.json();
        setPublicKey(data.publicKey);
      } catch (error) {
        console.error('Error al obtener la clave pública:', error);
        setError('No se pudo obtener la clave pública de MercadoPago');
      }
    };

    getPublicKey();
  }, []);

  // Mutation para crear preferencia de pago
  const createPreferenceMutation = useMutation({
    mutationFn: async () => {
      if (!email) {
        setEmailError('El correo electrónico es requerido');
        throw new Error('El correo electrónico es requerido');
      }

      if (!email.includes('@')) {
        setEmailError('Ingrese un correo electrónico válido');
        throw new Error('Ingrese un correo electrónico válido');
      }

      setEmailError(null);

      // Crear preferencia de pago
      const response = await apiRequest('POST', '/api/mercadopago/create-preference', {
        items: [
          {
            title: productTitle,
            description: productDescription || '',
            quantity: 1,
            unit_price: productPrice,
            currency_id: 'CLP'
          }
        ],
        payer: {
          email: email
        },
        backUrls: {
          success: `${window.location.origin}/payment-success`,
          failure: `${window.location.origin}/payment-failure`,
          pending: `${window.location.origin}/payment-pending`
        },
        externalReference: `REF-${Date.now()}`
      });

      return await response.json();
    },
    onSuccess: (data: PaymentPreference) => {
      setPreferenceId(data.id);
      // Usar sandbox_init_point para desarrollo, init_point para producción
      const paymentUrlToUse = process.env.NODE_ENV === 'production' ? data.init_point : data.sandbox_init_point;
      setPaymentUrl(paymentUrlToUse);
    },
    onError: (error: Error) => {
      console.error('Error al crear preferencia de pago:', error);
      setError('No se pudo crear la preferencia de pago');
      if (onPaymentError) onPaymentError(error);
    }
  });

  // Función para procesar el pago directamente (sin redirección)
  const processPayment = async () => {
    try {
      // Esta implementación requeriría la integración con el Checkout API de MercadoPago
      // Para capturar la información de la tarjeta de manera segura
      alert('Funcionalidad no implementada: Se requiere la integración con Checkout API');
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      setError('Error al procesar el pago');
    }
  };

  // Función para redireccionar al checkout de MercadoPago
  const redirectToCheckout = () => {
    if (paymentUrl) {
      window.location.href = paymentUrl;
    }
  };

  // Verificar estado del pago
  useEffect(() => {
    const checkPaymentStatus = async () => {
      // Obtener el ID del pago desde los parámetros de la URL si estamos en una página de retorno
      const urlParams = new URLSearchParams(window.location.search);
      const payment_id = urlParams.get('payment_id');
      const status = urlParams.get('status');

      if (payment_id && status) {
        setPaymentId(payment_id);

        // Verificar el estado del pago
        if (status === 'approved') {
          setSuccess(true);
          if (onPaymentSuccess) onPaymentSuccess({ paymentId: payment_id, status });
        } else if (status === 'pending') {
          if (onPaymentPending) onPaymentPending();
        } else {
          setError(`El pago no fue completado (Estado: ${status})`);
          if (onPaymentError) onPaymentError(new Error(`El pago no fue completado (Estado: ${status})`));
        }
      }
    };

    checkPaymentStatus();
  }, [onPaymentSuccess, onPaymentError, onPaymentPending]);

  // Renderizar mensaje de éxito
  if (success && showSuccessMessage) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <AlertTitle className="text-green-800">¡Pago exitoso!</AlertTitle>
        <AlertDescription className="text-green-700">
          Tu pago ha sido procesado correctamente. ID de Pago: {paymentId}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagar con MercadoPago</CardTitle>
        <CardDescription>
          Complete los datos para procesar su pago de forma segura
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-4">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="Su correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={emailError ? 'border-red-500' : ''}
          />
          {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
        </div>

        <div className="rounded-md bg-muted p-4 mb-4">
          <p className="font-medium">{productTitle}</p>
          {productDescription && <p className="text-sm text-muted-foreground">{productDescription}</p>}
          <p className="font-bold mt-2">Precio: ${productPrice.toLocaleString('es-CL')}</p>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button
          className="w-full bg-[#009ee3] hover:bg-[#007eb5]"
          onClick={() => createPreferenceMutation.mutate()}
          disabled={createPreferenceMutation.isPending}
        >
          {createPreferenceMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            'Continuar al pago'
          )}
        </Button>
        
        {paymentUrl && (
          <Button
            className="w-full mt-2 bg-[#009ee3] hover:bg-[#007eb5]"
            onClick={redirectToCheckout}
          >
            Ir a MercadoPago
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default MercadoPagoPayment;