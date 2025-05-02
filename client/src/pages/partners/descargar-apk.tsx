import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { useLocation } from 'wouter';

const DescargarApk = () => {
  const [, setLocation] = useLocation();

  const descargarArchivo = () => {
    try {
      const link = document.createElement('a');
      link.href = "/downloads/vecinos-notarypro-pos-v1.3.1.apk";
      link.download = "vecinos-notarypro-pos-v1.3.1.apk";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
      alert("Hubo un error al descargar el archivo. Intente nuevamente.");
    }
  };

  useEffect(() => {
    // Intentamos descargar automáticamente cuando la página carga
    setTimeout(() => {
      descargarArchivo();
    }, 1000);
  }, []);

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">Descarga de la App Vecinos POS v1.3.1</h1>
        
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="font-semibold text-amber-800">Nueva versión disponible</h3>
          <p className="text-amber-700">
            Esta versión incluye una actualización importante: ahora solo se aceptan pagos con tarjeta.
            Asegúrese de actualizar su aplicación para mantener la compatibilidad con los servicios.
          </p>
        </div>
        
        <div className="mb-8 p-4 border border-primary/20 bg-primary/5 rounded-md">
          <p className="mb-4">
            Si la descarga no comienza automáticamente, haga clic en el botón "Descargar APK" a continuación.
          </p>
          
          <Button 
            size="lg" 
            className="w-full"
            onClick={descargarArchivo}
          >
            <Download className="mr-2 h-5 w-5" />
            Descargar APK v1.3.1
          </Button>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Instrucciones de instalación:</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Después de descargar el archivo APK, búsquelo en su carpeta de Descargas.</li>
            <li>Toque el archivo APK para iniciar la instalación.</li>
            <li>Si es necesario, habilite "Instalar aplicaciones desconocidas" en la configuración de su dispositivo.</li>
            <li>Siga las instrucciones en pantalla para completar la instalación.</li>
            <li>Una vez instalada, abra la aplicación "Vecinos POS" desde su pantalla de inicio.</li>
          </ol>
          
          <div className="mt-8">
            <Button variant="outline" onClick={() => setLocation('/partners/sdk-demo')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la página del SDK
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DescargarApk;