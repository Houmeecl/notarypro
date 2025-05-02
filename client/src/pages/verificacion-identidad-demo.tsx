import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Info, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

const VerificacionIdentidadDemo: React.FC = () => {
  const [demoType, setDemoType] = useState<string>('basic');
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Helmet>
        <title>Demostración Validación de Identidad - NotaryPro</title>
      </Helmet>
      
      <div className="flex flex-col gap-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Demostración de Validación de Identidad</h1>
          <p className="text-lg text-gray-700">
            Esta página muestra el funcionamiento de la verificación de identidad integrada con GetAPI.cl
          </p>
          
          <Alert variant="info" className="bg-blue-50 border-blue-200">
            <Info className="h-5 w-5 text-blue-500" />
            <AlertTitle className="text-blue-700">Información</AlertTitle>
            <AlertDescription className="text-blue-600">
              Para utilizar las funciones de verificación de identidad en su propia aplicación, necesita una clave API válida de GetAPI.cl.
            </AlertDescription>
          </Alert>
        </div>
        
        <Separator />
        
        <div>
          <Tabs defaultValue="basic" onValueChange={setDemoType} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Verificación Básica</TabsTrigger>
              <TabsTrigger value="document">Verificación con Documento</TabsTrigger>
              <TabsTrigger value="advanced">Verificación Avanzada</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Verificación Básica de Identidad</CardTitle>
                  <CardDescription>
                    Comprueba la identidad mediante validación de RUT y nombre contra registros oficiales.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BasicVerification />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="document" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Verificación con Documento</CardTitle>
                  <CardDescription>
                    Validación mediante cédula de identidad o pasaporte con captura de cámara.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">La verificación con documento permite validar la identidad mediante la captura de la cédula o pasaporte.</p>
                  <Alert variant="warning" className="mb-6">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle>Importante</AlertTitle>
                    <AlertDescription>
                      Esta funcionalidad requiere acceso a la cámara del dispositivo.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex justify-center">
                    <Button size="lg" className="mt-4">
                      En desarrollo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="advanced" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Verificación Avanzada</CardTitle>
                  <CardDescription>
                    Validación biométrica facial con prueba de vida y verificación de documento.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">La verificación avanzada combina la validación del documento con reconocimiento facial y prueba de vida.</p>
                  <Alert variant="warning" className="mb-6">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle>Importante</AlertTitle>
                    <AlertDescription>
                      Esta funcionalidad requiere acceso a la cámara del dispositivo y puede tomar más tiempo en completarse.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex justify-center">
                    <Button size="lg" className="mt-4">
                      En desarrollo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <Separator />
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Información técnica</h2>
          <p className="mb-4">
            Esta demostración utiliza los siguientes componentes de la integración con GetAPI.cl:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Componente <code>IdentityVerificationForm</code> para la interfaz de usuario</li>
            <li>Biblioteca <code>getapi-validator.ts</code> para la comunicación con la API</li>
            <li>Endpoints <code>/api/identity/*</code> en el servidor para manejar las solicitudes</li>
          </ul>
          <div className="mt-4">
            <a 
              href="https://developers.tuu.cl/docs/identity-verification" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:underline"
            >
              <span>Documentación de integración</span>
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const BasicVerification: React.FC = () => {
  const [loading, setLoading] = useState(false);
  
  return (
    <div>
      <p className="mb-6">
        Esta demostración te permite validar la identidad de una persona chilena mediante su RUT y nombre contra registros oficiales.
      </p>
      
      <Alert variant="default" className="mb-6">
        <Info className="h-5 w-5" />
        <AlertTitle>Demo</AlertTitle>
        <AlertDescription>
          Por favor complete el formulario con un RUT válido (ej: 11.111.111-1) y un nombre para probar la validación.
        </AlertDescription>
      </Alert>
      
      <form className="space-y-4">
        <div>
          <label htmlFor="rut" className="block text-sm font-medium mb-1">RUT</label>
          <input 
            type="text" 
            id="rut"
            placeholder="12.345.678-9"
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium mb-1">Nombre</label>
          <input 
            type="text" 
            id="nombre"
            placeholder="Juan Pérez"
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <Button 
          type="button" 
          className="w-full"
          disabled={loading}
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              alert("Funcionalidad en desarrollo. Se agregarán APIs de verificación pronto.");
            }, 1500);
          }}
        >
          {loading ? (
            <>
              <span className="mr-2">Verificando...</span>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                  fill="none"
                ></circle>
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </>
          ) : "Verificar Identidad"}
        </Button>
      </form>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Nota: En una implementación real, esta información sería validada contra bases de datos oficiales usando la API de GetAPI.cl.</p>
      </div>
    </div>
  );
};

export default VerificacionIdentidadDemo;