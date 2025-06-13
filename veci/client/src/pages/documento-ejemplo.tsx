import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useLocation } from 'wouter';
import { FileText, Download, Shield, Check } from 'lucide-react';

export default function DocumentoEjemplo() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Actualizar el título de la página
    document.title = "Documento de Ejemplo Verificable - NotaryPro";
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Documento de Ejemplo Verificable</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-zinc-200">
            <CardHeader className="bg-zinc-50 border-b">
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Contrato de Arriendo (Ejemplo)
              </CardTitle>
              <CardDescription>
                Este es un documento de ejemplo para mostrar el formato y características de seguridad
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <iframe 
                src="/documento-ejemplo-verificacion.html" 
                className="w-full border-none" 
                style={{ height: "800px" }}
                title="Documento de ejemplo verificable"
              />
            </CardContent>
            <CardFooter className="bg-zinc-50 border-t flex justify-between p-4">
              <Button variant="outline" onClick={() => window.open("/documento-ejemplo-verificacion.html", "_blank")}>
                <FileText className="mr-2 h-4 w-4" />
                Ver documento completo
              </Button>
              <Button onClick={() => setLocation("/verificar-documento")}>
                <Shield className="mr-2 h-4 w-4" />
                Verificar autenticidad
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-zinc-200 mb-6">
            <CardHeader className="bg-zinc-50 border-b">
              <CardTitle className="text-lg">Características de seguridad</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Código único de documento (DOC-847295)</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Código QR de verificación</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Firmas digitales de ambas partes</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Sello digital de certificación</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Información de certificación según Ley 19.799</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Elementos de seguridad visual</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-zinc-200">
            <CardHeader className="bg-zinc-50 border-b">
              <CardTitle className="text-lg">Verificación del documento</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-zinc-700 mb-4">
                Este documento es un ejemplo que puede ser verificado utilizando el sistema de verificación de NotaryPro.
              </p>
              <p className="text-sm text-zinc-700 mb-4">
                Para verificar este documento, ingrese el código DOC-847295 en la página de verificación.
              </p>
              <Button 
                className="w-full" 
                onClick={() => setLocation("/verificar-documento")}
              >
                <Shield className="mr-2 h-4 w-4" />
                Ir a verificar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}