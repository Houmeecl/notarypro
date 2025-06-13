import { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { CorporateLogo, CertifierBadge } from '@/components/ui/logo/CorporateLogo';

export default function PaymentSuccessPage() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Obtener parámetros de la URL
  const params = new URLSearchParams(window.location.search);
  const paymentId = params.get('payment_id');
  const status = params.get('status');
  const externalReference = params.get('external_reference');

  // Extraer ID de curso de la referencia externa
  const courseId = externalReference?.split('-')[1] || '';

  useEffect(() => {
    // Verificar el estado del pago con el servidor
    const verifyPayment = async () => {
      if (!paymentId) {
        setError('ID de pago no encontrado en la URL.');
        setIsVerifying(false);
        return;
      }

      try {
        const response = await apiRequest('GET', `/api/mercadopago/payment/${paymentId}`, null);
        const data = await response.json();
        
        setPaymentDetails(data);
        
        // Actualizar la inscripción al curso si todo está correcto
        if (data.status === 'approved' && courseId) {
          try {
            // Llamada a la API para registrar la inscripción al curso
            await apiRequest('POST', `/api/courses/${courseId}/enroll`, {
              paymentId: paymentId,
              paymentAmount: data.transaction_amount
            });
            
            toast({
              title: 'Inscripción completada',
              description: 'Se ha registrado correctamente en el curso.',
            });
          } catch (enrollError) {
            console.error('Error al registrar la inscripción:', enrollError);
            setError('Error al procesar la inscripción al curso.');
          }
        } else if (data.status !== 'approved') {
          setError(`El pago no ha sido aprobado. Estado: ${data.status}`);
        }
      } catch (error) {
        console.error('Error al verificar el pago:', error);
        setError('No se pudo verificar el estado del pago con el servidor.');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [paymentId, courseId, toast]);

  // Calcular tiempo de redireccionamiento
  useEffect(() => {
    if (!isVerifying && !error) {
      const redirectTimer = setTimeout(() => {
        navigate(`/courses/${courseId}`);
      }, 5000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isVerifying, error, navigate, courseId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="flex justify-center mb-6">
        <CorporateLogo size="lg" />
      </div>
      
      <div className="flex justify-center mb-8">
        <CertifierBadge size="lg" />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            {isVerifying ? (
              <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
            ) : error ? (
              <div className="h-8 w-8 text-amber-600">❗</div>
            ) : (
              <CheckCircle className="h-8 w-8 text-green-600" />
            )}
          </div>
          
          <CardTitle className="text-2xl">
            {isVerifying ? 'Verificando pago...' : 
             error ? 'Error de verificación' : 
             '¡Pago exitoso!'}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {isVerifying ? (
            <p className="text-center text-gray-600">
              Estamos verificando el estado de su pago. Esto tomará solo unos momentos...
            </p>
          ) : error ? (
            <div className="text-center space-y-2">
              <p className="text-amber-700">{error}</p>
              <p className="text-gray-600">
                Por favor contacte a soporte con el siguiente ID de pago: {paymentId || 'No disponible'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-gray-600 mb-4">
                Su pago ha sido procesado correctamente y ya tiene acceso al curso.
                Será redirigido automáticamente en unos segundos.
              </p>
              
              {paymentDetails && (
                <div className="border rounded-md p-4 bg-gray-50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ID de transacción:</span>
                    <span className="font-medium">{paymentId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Monto:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0
                      }).format(paymentDetails.transaction_amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Estado:</span>
                    <span className="font-medium text-green-600">Aprobado</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fecha:</span>
                    <span className="font-medium">
                      {new Date(paymentDetails.date_approved).toLocaleDateString('es-CL')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          {error ? (
            <Link href={`/curso-certificador`}>
              <Button variant="outline">
                Volver al curso
              </Button>
            </Link>
          ) : (
            <Link href={`/courses/${courseId}`}>
              <Button className="bg-primary hover:bg-primary/90">
                Ir al curso ahora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}