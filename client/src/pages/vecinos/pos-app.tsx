import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Smartphone, Download, ArrowRight, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function POSAppPage() {
  const [, setLocation] = useLocation();

  // Efecto para recuperar token y luego redireccionar
  useEffect(() => {
    // Si hay token, lo mantenemos almacenado
    const token = localStorage.getItem('vecinos_token');
    if (!token) {
      setLocation('/vecinos/login');
    }
  }, []);

  // Función para manejar la descarga de la app
  const handleDownloadApp = () => {
    window.location.href = '/downloads/vecinos-notarypro-pos-v1.3.1.apk';
  };

  // Función para mostrar el código QR de descarga
  const showQRCode = () => {
    alert('Escanea este código QR para descargar la app móvil Vecinos NotaryPro POS');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center">
            <CardTitle className="text-2xl font-bold">Vecinos Xpress</CardTitle>
            <span className="ml-2 text-xs bg-blue-600 text-white px-1 py-0.5 rounded-sm">by NotaryPro</span>
          </div>
          <CardDescription>Descarga la aplicación para tu dispositivo móvil</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <Smartphone className="h-24 w-24 text-blue-600" />
          </div>

          <div className="text-center space-y-2">
            <h3 className="font-semibold">Versión 1.3.1 disponible</h3>
            <p className="text-sm text-gray-600">
              La aplicación POS para socios de Vecinos Xpress te permite gestionar documentos, 
              firmas y pagos desde tu dispositivo Android.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 h-12"
              onClick={handleDownloadApp}
            >
              <Download className="mr-2 h-5 w-5" />
              Descargar APK (Android)
            </Button>

            <Button 
              variant="outline" 
              className="w-full h-12"
              onClick={showQRCode}
            >
              <QrCode className="mr-2 h-5 w-5" />
              Mostrar QR para descargar
            </Button>
          </div>

          <div className="pt-4 border-t text-center">
            <Button
              variant="link"
              onClick={() => setLocation('/vecinos/dashboard')}
              className="text-blue-600"
            >
              Ir al dashboard del socio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-center text-gray-500 mt-6">
            <p>NotaryPro © 2025. Todos los derechos reservados.</p>
            <p>Vecinos Xpress es una marca registrada de NotaryPro SpA.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}