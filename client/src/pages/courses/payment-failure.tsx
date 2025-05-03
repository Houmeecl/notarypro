import { useEffect } from 'react';
import { Link } from 'wouter';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CorporateLogo, CertifierBadge } from '@/components/ui/logo/CorporateLogo';

export default function PaymentFailurePage() {
  // Obtener parámetros de la URL
  const params = new URLSearchParams(window.location.search);
  const paymentId = params.get('payment_id');
  const status = params.get('status');
  const externalReference = params.get('external_reference');

  // Extraer ID de curso de la referencia externa
  const courseId = externalReference?.split('-')[1] || '';
  
  // Log para depuración
  useEffect(() => {
    console.log('Payment failed:', {
      paymentId,
      status,
      externalReference,
      courseId
    });
  }, [paymentId, status, externalReference, courseId]);

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
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          
          <CardTitle className="text-2xl">Error en el pago</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-gray-700">
              Lo sentimos, no se pudo completar el pago. El intento de pago ha sido rechazado o cancelado.
            </p>
            
            <div className="border rounded-md p-4 bg-gray-50 my-4">
              <h3 className="font-medium text-gray-900 mb-2">Motivos comunes:</h3>
              <ul className="text-sm text-gray-600 space-y-1 text-left list-disc pl-5">
                <li>Fondos insuficientes en la cuenta o tarjeta</li>
                <li>La entidad financiera ha rechazado la transacción</li>
                <li>Datos de la tarjeta incorrectos</li>
                <li>Problemas temporales con el servicio de pago</li>
              </ul>
            </div>
            
            <p className="text-sm text-gray-500">
              Si considera que esto es un error, por favor contacte a nuestro soporte
              proporcionando el ID de referencia: <span className="font-medium">{externalReference || 'No disponible'}</span>
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/curso-certificador`}>
            <Button variant="outline" className="w-full sm:w-auto">
              Volver al curso
            </Button>
          </Link>
          
          <Link href={`/curso-certificador?retry=true`}>
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              Intentar nuevamente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}