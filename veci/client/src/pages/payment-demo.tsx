import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MercadoPagoPayment from '@/components/payments/MercadoPagoPayment';

export default function PaymentDemo() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('mercadopago');
  const [productTitle, setProductTitle] = useState<string>('Certificación de documento');
  const [productDescription, setProductDescription] = useState<string>('Servicio de certificación digital de documentos');
  const [productPrice, setProductPrice] = useState<number>(5000);
  const [showPaymentForm, setShowPaymentForm] = useState<boolean>(false);

  const handlePaymentSuccess = (data: any) => {
    console.log('Pago exitoso:', data);
    alert(`Pago exitoso. ID: ${data.paymentId}`);
  };

  const handlePaymentError = (error: Error) => {
    console.error('Error en el pago:', error);
    alert(`Error en el pago: ${error.message}`);
  };

  const handlePaymentPending = () => {
    console.log('Pago pendiente');
    alert('Su pago está pendiente de aprobación');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Demostración de Pagos</h1>
        <Link href="/">
          <Button variant="outline">Volver</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Producto</CardTitle>
              <CardDescription>
                Personalice los detalles del producto para el ejemplo de pago
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título del Producto</Label>
                <Input
                  id="title"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="price">Precio (CLP)</Label>
                <Input
                  id="price"
                  type="number"
                  value={productPrice}
                  onChange={(e) => setProductPrice(parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="payment-method">Método de Pago</Label>
                <Select
                  value={selectedPaymentMethod}
                  onValueChange={(value) => setSelectedPaymentMethod(value)}
                >
                  <SelectTrigger id="payment-method" className="mt-1">
                    <SelectValue placeholder="Seleccione método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mercadopago">MercadoPago</SelectItem>
                    <SelectItem value="other" disabled>Otros (próximamente)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => setShowPaymentForm(true)}
              >
                Probar Pago
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Instrucciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Esta es una demostración de integración de MercadoPago. Para probar, configure los detalles del producto
                  y haga clic en "Probar Pago". Será redirigido al checkout de MercadoPago donde podrá usar tarjetas
                  de prueba:
                </p>
                <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                  <p className="font-semibold mb-2">Tarjeta de prueba:</p>
                  <ul className="space-y-1">
                    <li>Número: 5031 7557 3453 0604</li>
                    <li>Código de seguridad: 123</li>
                    <li>Fecha de expiración: Cualquier fecha futura</li>
                    <li>Nombre: APRO (para aprobación) o OTHE (para rechazar)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {showPaymentForm && (
          <div>
            {selectedPaymentMethod === 'mercadopago' && (
              <MercadoPagoPayment
                productTitle={productTitle}
                productDescription={productDescription}
                productPrice={productPrice}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                onPaymentPending={handlePaymentPending}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}