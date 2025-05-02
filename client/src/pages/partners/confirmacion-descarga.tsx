import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, CheckCircle } from 'lucide-react';
import { useLocation } from 'wouter';

const ConfirmacionDescarga = () => {
  const [, setLocation] = useLocation();
  const [contador, setContador] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setContador(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-20 w-20 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">¡Descarga iniciada!</h1>
        
        <div className="mb-8 p-6 border border-green-200 bg-green-50 rounded-md">
          <p className="mb-2 text-lg">
            Su archivo está siendo descargado. Por favor, revise la carpeta de descargas de su dispositivo.
          </p>
          
          <p className="text-sm text-gray-600 mb-2">
            Si la descarga no inició automáticamente, puede hacer clic en el botón a continuación para intentar nuevamente.
          </p>
          
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-amber-700">
              <strong>¡Importante!</strong> Esta versión solo acepta pagos con tarjeta. 
              <a 
                href="/downloads/actualizacion-v1.3.1.txt" 
                target="_blank" 
                className="text-blue-600 hover:underline ml-1"
              >
                Ver notas de actualización
              </a>
            </p>
          </div>
          
          <Button 
            size="lg" 
            className="w-full"
            onClick={() => {
              const link = document.createElement('a');
              link.href = "/downloads/vecinos-notarypro-pos-v1.3.1.apk";
              link.download = "vecinos-notarypro-pos-v1.3.1.apk";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <Download className="mr-2 h-5 w-5" />
            Descargar nuevamente
          </Button>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Pasos de instalación:</h2>
          <div className="p-4 border rounded-md text-left">
            <ol className="list-decimal pl-5 space-y-3">
              <li>
                <p className="font-medium">Localizar el archivo en Descargas</p>
                <p className="text-sm text-gray-700">Abra la aplicación "Archivos" o "Administrador de archivos" en su dispositivo y busque el archivo <code className="bg-gray-100 px-1 py-0.5 rounded">vecinos-notarypro-pos-v1.3.1.apk</code> en la carpeta "Descargas".</p>
              </li>
              <li>
                <p className="font-medium">Habilitar instalación de fuentes desconocidas</p>
                <p className="text-sm text-gray-700">Si es la primera vez que instala una aplicación desde fuera de Google Play, se le pedirá activar esta opción en Configuración &gt; Seguridad.</p>
              </li>
              <li>
                <p className="font-medium">Instalar la aplicación</p>
                <p className="text-sm text-gray-700">Toque el archivo APK y siga las instrucciones en pantalla para completar la instalación.</p>
              </li>
              <li>
                <p className="font-medium">Iniciar la aplicación</p>
                <p className="text-sm text-gray-700">Una vez instalada, busque el ícono "Vecinos POS" en su pantalla de inicio o cajón de aplicaciones.</p>
              </li>
            </ol>
          </div>
          
          <div className="mt-8">
            <p className="text-sm text-gray-500 mb-2">
              Será redirigido a la página del SDK en {contador} {contador === 1 ? 'segundo' : 'segundos'}...
            </p>
            <Button variant="outline" onClick={() => setLocation('/partners/sdk-demo')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver ahora a la página del SDK
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionDescarga;