import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';

export default function ApkDownload() {
  const descargarApk = () => {
    try {
      const link = document.createElement('a');
      link.href = "/downloads/vecinos-notarypro-pos-v1.3.0.apk";
      link.download = "vecinos-notarypro-pos-v1.3.0.apk";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
      alert("Hubo un error al descargar el archivo. Intente nuevamente.");
    }
  };

  return (
    <section className="py-12 bg-gradient-to-r from-primary/5 to-primary/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              App Vecinos NotaryPro Express
            </h2>
            <p className="text-gray-600 max-w-lg mb-6">
              Descargue nuestra aplicación para convertir su negocio en un punto de servicio autorizado. 
              Obtenga comisiones por cada documento procesado y amplíe su oferta de servicios.
            </p>
            <Button size="lg" onClick={descargarApk} className="gap-2">
              <Download className="h-5 w-5" />
              Descargar APK Vecinos v1.3.0
            </Button>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Smartphone className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Requisitos mínimos</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Android 5.0 o superior
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                2GB de RAM
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                100MB de espacio libre
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Conexión a internet para sincronización
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}