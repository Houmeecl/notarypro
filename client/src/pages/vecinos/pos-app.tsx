import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Download, ArrowRight, QrCode, Store, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

export default function POSAppPage() {
  const [, setLocation] = useLocation();
  const [storeCode, setStoreCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('web');

  // Verificar si hay un token almacenado
  useEffect(() => {
    const token = localStorage.getItem('vecinos_token');
    if (!token) {
      // No hay token, pero permitimos ingresar el código de tienda directamente
      console.log('No se encontró token de autenticación');
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

  // Función para acceder a la versión web del POS
  const accessWebPOS = async () => {
    if (!storeCode.trim()) {
      toast({
        title: "Código requerido",
        description: "Por favor ingrese el código de tienda",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Para fines de demo, aceptamos directamente los códigos de prueba
      const testCodes = ['LOCAL-XP125', 'LOCAL-XP201', 'LOCAL-XP315', 'LOCAL-XP427'];
      
      if (testCodes.includes(storeCode.trim())) {
        // Almacenar el código de la tienda en localStorage
        localStorage.setItem('store_code', storeCode.trim());
        
        // Redirigir a la aplicación POS web
        setLocation('/partners/webapp-pos-official');
        return;
      }
      
      // Intenta verificar el código con el servidor
      const response = await apiRequest('POST', '/api/vecinos/verify-store-code', { storeCode: storeCode.trim() });
      const data = await response.json();
      
      if (data.valid) {
        // Almacenar el código de la tienda en localStorage
        localStorage.setItem('store_code', storeCode.trim());
        
        // Redirigir a la aplicación POS web
        setLocation('/partners/webapp-pos-official');
      } else {
        toast({
          title: "Código inválido",
          description: "El código de tienda ingresado no es válido",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al verificar código:", error);
      
      // Para fines de demo, permitimos el acceso con los códigos de prueba
      const testCodes = ['LOCAL-XP125', 'LOCAL-XP201', 'LOCAL-XP315', 'LOCAL-XP427'];
      
      if (testCodes.includes(storeCode.trim())) {
        // Almacenar el código de la tienda en localStorage
        localStorage.setItem('store_code', storeCode.trim());
        
        // Redirigir a la aplicación POS web
        setLocation('/partners/webapp-pos-official');
      } else {
        toast({
          title: "Error de verificación",
          description: "No se pudo verificar el código de tienda",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-t-lg">
          <div className="flex items-center justify-center">
            <CardTitle className="text-2xl font-bold text-[#2d219b]">Vecinos Xpress</CardTitle>
            <span className="ml-2 text-xs bg-[#2d219b] text-white px-1 py-0.5 rounded-sm">by NotaryPro</span>
          </div>
          <CardDescription>Plataforma POS para socios</CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <Tabs defaultValue="web" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="web">POS Web</TabsTrigger>
              <TabsTrigger value="mobile">App Móvil</TabsTrigger>
            </TabsList>
            
            <TabsContent value="web" className="space-y-4 mt-4">
              <div className="flex justify-center">
                <Store className="h-16 w-16 text-[#2d219b]" />
              </div>
              
              <div className="text-center mb-4">
                <h3 className="font-semibold text-lg">Acceder a POS Web</h3>
                <p className="text-sm text-gray-600">
                  Ingrese el código de su tienda para acceder al sistema POS web
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storeCode">Código de Tienda</Label>
                  <Input
                    id="storeCode"
                    placeholder="Ej: LOCAL-XP125"
                    value={storeCode}
                    onChange={(e) => setStoreCode(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">* El código tiene el formato LOCAL-XP seguido de números</p>
                </div>
                
                <Button 
                  className="w-full bg-[#2d219b] hover:bg-[#231a7c] h-12"
                  onClick={accessWebPOS}
                  disabled={isLoading}
                >
                  {isLoading ? 'Verificando...' : 'Acceder a POS Web'}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mt-4">
                <p className="text-sm text-blue-800 font-medium">Códigos de demostración</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="text-xs p-1 bg-white rounded border border-blue-100">
                    <span className="font-medium">LOCAL-XP125</span>
                    <p className="text-gray-500">Mini Market El Sol</p>
                  </div>
                  <div className="text-xs p-1 bg-white rounded border border-blue-100">
                    <span className="font-medium">LOCAL-XP201</span>
                    <p className="text-gray-500">Farmacia Vida</p>
                  </div>
                  <div className="text-xs p-1 bg-white rounded border border-blue-100">
                    <span className="font-medium">LOCAL-XP315</span>
                    <p className="text-gray-500">Librería Central</p>
                  </div>
                  <div className="text-xs p-1 bg-white rounded border border-blue-100">
                    <span className="font-medium">LOCAL-XP427</span>
                    <p className="text-gray-500">Café Internet Express</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="mobile" className="space-y-4 mt-4">
              <div className="flex justify-center">
                <Smartphone className="h-16 w-16 text-[#2d219b]" />
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">App Android Disponible</h3>
                <p className="text-sm text-gray-600">
                  La aplicación POS para socios de Vecinos Xpress te permite gestionar documentos, 
                  firmas y pagos desde tu dispositivo Android.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  className="w-full bg-[#2d219b] hover:bg-[#231a7c] h-12"
                  onClick={handleDownloadApp}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Descargar APK (Android)
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full h-12 border-[#2d219b] text-[#2d219b]"
                  onClick={showQRCode}
                >
                  <QrCode className="mr-2 h-5 w-5" />
                  Mostrar QR para descargar
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex-col space-y-4">
          <div className="pt-2 border-t w-full text-center">
            <Button
              variant="link"
              onClick={() => setLocation('/vecinos/dashboard')}
              className="text-[#2d219b]"
            >
              Ir al dashboard del socio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-center text-gray-500">
            <p>NotaryPro © 2025. Todos los derechos reservados.</p>
            <p>Vecinos Xpress es una marca registrada de NotaryPro SpA.</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}