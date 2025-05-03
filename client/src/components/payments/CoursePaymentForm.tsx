import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  CreditCard, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface CoursePaymentFormProps {
  courseId: number;
  courseTitle: string;
  coursePrice: number; // Precio en $CLP
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: Error) => void;
}

export const CoursePaymentForm: React.FC<CoursePaymentFormProps> = ({
  courseId,
  courseTitle,
  coursePrice,
  onPaymentSuccess,
  onPaymentError
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Formatear precio a CLP
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Obtener la clave pública de MercadoPago al cargar el componente
  useEffect(() => {
    const getPublicKey = async () => {
      try {
        const response = await apiRequest('GET', '/api/mercadopago/public-key', null);
        const data = await response.json();
        setPublicKey(data.publicKey);
      } catch (error) {
        console.error('Error al obtener la clave pública de MercadoPago:', error);
        setPaymentError('No se pudo conectar con el procesador de pagos. Intente nuevamente más tarde.');
      }
    };

    getPublicKey();
  }, []);

  // Iniciar el proceso de pago
  const handleStartPayment = async () => {
    setIsLoading(true);
    setPaymentError(null);

    try {
      // URL actual como base para redirecciones
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/courses/payment-success`;
      const failureUrl = `${baseUrl}/courses/payment-failure`;
      const pendingUrl = `${baseUrl}/courses/payment-pending`;

      // Crear preferencia de pago
      const response = await apiRequest('POST', '/api/mercadopago/create-preference', {
        items: [
          {
            title: `Curso: ${courseTitle}`,
            quantity: 1,
            unit_price: coursePrice,
            currency_id: 'CLP',
            description: `Inscripción al curso de certificación: ${courseTitle}`
          }
        ],
        backUrls: {
          success: successUrl,
          failure: failureUrl,
          pending: pendingUrl
        },
        externalReference: `course-${courseId}-${Date.now()}`
      });

      const data = await response.json();
      
      if (data.id) {
        setPreferenceId(data.id);
        
        // Redireccionar al checkout de MercadoPago
        const checkoutUrl = data.init_point;
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No se pudo crear la preferencia de pago');
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      setPaymentError('Error al procesar el pago. Por favor, intente nuevamente.');
      onPaymentError?.(error as Error);
      
      toast({
        title: 'Error en el pago',
        description: 'No se pudo procesar el pago. Por favor, intente nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar estado del pago
  const checkPaymentStatus = async (paymentId: string) => {
    try {
      const response = await apiRequest('GET', `/api/mercadopago/payment/${paymentId}`, null);
      const data = await response.json();
      
      if (data.status === 'approved') {
        setIsSuccess(true);
        onPaymentSuccess?.();
        
        toast({
          title: 'Pago realizado con éxito',
          description: 'Su inscripción al curso ha sido procesada correctamente.',
          variant: 'default'
        });
      } else {
        setPaymentError('El pago está pendiente o fue rechazado. Verifique con su entidad bancaria.');
      }
    } catch (error) {
      console.error('Error al verificar el estado del pago:', error);
      setPaymentError('No se pudo verificar el estado del pago.');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Inscripción al curso</CardTitle>
        <CardDescription>
          Complete el pago para acceder al contenido completo del curso
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="font-medium mb-2">Resumen de compra</h3>
            <div className="flex justify-between items-center">
              <span>{courseTitle}</span>
              <span className="font-semibold">{formatPrice(coursePrice)}</span>
            </div>
          </div>
          
          <div className="border-b pb-4">
            <h3 className="font-medium mb-2">Información importante</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Acceso inmediato al contenido del curso</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Certificado oficial al completar el curso</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Soporte técnico durante todo el curso</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Métodos de pago</h3>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <CreditCard className="h-5 w-5 text-primary" />
              <span>Tarjetas de crédito, débito y otros métodos disponibles</span>
            </div>
          </div>
          
          {paymentError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">{paymentError}</div>
            </div>
          )}
          
          {isSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-700">Pago realizado con éxito. Ya puede acceder al curso.</div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex-col space-y-4">
        <div className="w-full">
          <Button 
            onClick={handleStartPayment}
            disabled={isLoading || isSuccess || !publicKey}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                Proceder al pago
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="h-4 w-4" />
          <span>Pago seguro procesado por MercadoPago</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CoursePaymentForm;