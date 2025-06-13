import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useRealFuncionality } from '@/hooks/use-real-funcionality';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, FileText, Download, CheckCircle } from 'lucide-react';
import FunctionalModeIndicator from '@/components/document/FunctionalModeIndicator';
import MultiSignatureControl from '@/components/document/MultiSignatureControl';
import DocumentNavbar from '@/components/layout/DocumentNavbar';

export default function DocumentSignatureFlowPage() {
  const [, params] = useRoute('/document-signature/:documentId');
  const [, setLocation] = useLocation();
  const documentId = parseInt(params?.documentId || '1');
  const { isFunctionalMode } = useRealFuncionality(true);
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [document, setDocument] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('document');
  
  useEffect(() => {
    // En un caso real, se realizaría una solicitud al servidor
    // para obtener los detalles del documento
    
    // Simulamos la carga del documento
    setTimeout(() => {
      const documentData = {
        id: documentId,
        name: 'Contrato de Arriendo Local Comercial',
        type: 'Contrato',
        category: 'legal',
        content: 'Este es el contenido del documento con todos los términos y condiciones...',
        status: 'draft',
        createdAt: new Date().toISOString(),
        price: 5000,
      };
      
      setDocument(documentData);
      setIsLoading(false);
      
      if (isFunctionalMode) {
        console.log("✅ Flujo de firma de documentos cargado en modo funcional real");
        toast({
          title: "Documento Cargado",
          description: "Documento disponible para firma con certificación legal",
          duration: 3000,
        });
      }
    }, 1500);
  }, [documentId, isFunctionalMode, toast]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-2 text-lg">Cargando documento...</p>
      </div>
    );
  }
  
  return (
    <>
      <DocumentNavbar />
      <div className="container mx-auto py-8 px-4">
        <div 
          onClick={() => setLocation("/document-categories")}
          className="flex items-center text-primary mb-6 hover:underline cursor-pointer"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a categorías
        </div>
        
        <FunctionalModeIndicator className="mb-6" />
        
        {/* Encabezado del documento */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{document.name}</h1>
              <p className="text-gray-500 mt-1">
                Documento tipo: {document.type} | Categoría: {document.category}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                <span>Descargar</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Pestañas de documento */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="document">
              <FileText className="h-4 w-4 mr-1" />
              Documento
            </TabsTrigger>
            <TabsTrigger value="sign">
              <CheckCircle className="h-4 w-4 mr-1" />
              Firmas
            </TabsTrigger>
            <TabsTrigger value="details">
              Detalles
            </TabsTrigger>
          </TabsList>
          
          {/* Contenido del documento */}
          <TabsContent value="document">
            <Card>
              <CardHeader>
                <CardTitle>Contrato de Arriendo Local Comercial</CardTitle>
                <CardDescription>
                  Versión para firma electrónica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-6 rounded-md border min-h-[400px]">
                  <h2 className="text-lg font-semibold mb-4">CONTRATO DE ARRENDAMIENTO DE LOCAL COMERCIAL</h2>
                  
                  <p className="mb-4">
                    En [CIUDAD], a [FECHA], entre la sociedad [NOMBRE ARRENDADOR], RUT N° [RUT ARRENDADOR], 
                    representada por [REPRESENTANTE LEGAL], RUT N° [RUT REPRESENTANTE], ambos domiciliados en [DOMICILIO], 
                    en adelante el "Arrendador", y [NOMBRE ARRENDATARIO], RUT N° [RUT ARRENDATARIO], 
                    domiciliado en [DOMICILIO], en adelante el "Arrendatario", se ha convenido el siguiente contrato de arrendamiento:
                  </p>
                  
                  <h3 className="text-md font-semibold mb-2">PRIMERO: Objeto.</h3>
                  <p className="mb-4">
                    El Arrendador da en arrendamiento al Arrendatario, quien acepta para sí, el local comercial ubicado en 
                    [DIRECCIÓN COMPLETA DEL LOCAL], de una superficie aproximada de [SUPERFICIE] metros cuadrados.
                  </p>
                  
                  <h3 className="text-md font-semibold mb-2">SEGUNDO: Plazo.</h3>
                  <p className="mb-4">
                    El presente contrato tendrá una duración de [NÚMERO] años, a contar del [FECHA INICIO], 
                    expirando en consecuencia el día [FECHA TÉRMINO].
                  </p>
                  
                  <h3 className="text-md font-semibold mb-2">TERCERO: Renta.</h3>
                  <p className="mb-4">
                    La renta mensual de arrendamiento será la suma de [MONTO EN NÚMEROS Y PALABRAS], pagadera 
                    dentro de los primeros [NÚMERO] días de cada mes.
                  </p>
                  
                  {/* Más contenido del contrato */}
                  <p className="text-center text-gray-500 mt-4">[Documento continúa...]</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Vista previa PDF</Button>
                <Button 
                  onClick={() => setActiveTab('sign')}
                >
                  Continuar a firmas
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Sección de firmas */}
          <TabsContent value="sign">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Firma de documento</CardTitle>
                <CardDescription>
                  Configure y complete el proceso de firma del documento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-6 text-gray-600">
                  Este documento requiere su firma digital para tener validez legal. 
                  Puede configurar una firma individual o múltiples firmantes utilizando 
                  las opciones a continuación.
                </p>
                
                {isFunctionalMode && (
                  <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-md mb-4 flex gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Certificación de seguridad activa</p>
                      <p className="text-sm">
                        Este documento cumple con los requisitos de la Ley 19.799 sobre Firma Electrónica.
                        Las firmas realizadas en este documento tienen validez legal.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Controles de firma múltiple */}
                <MultiSignatureControl documentId={document.id} documentName={document.name} />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Detalles del documento */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Detalles del documento</CardTitle>
                <CardDescription>
                  Información detallada sobre este documento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nombre del documento</h3>
                    <p className="mt-1">{document.name}</p>
                  </div>
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Tipo de documento</h3>
                    <p className="mt-1">{document.type}</p>
                  </div>
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Categoría</h3>
                    <p className="mt-1">{document.category}</p>
                  </div>
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Fecha de creación</h3>
                    <p className="mt-1">{new Date(document.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                    <p className="mt-1 flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                      Borrador - Pendiente de firma
                    </p>
                  </div>
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Precio</h3>
                    <p className="mt-1">${document.price / 100}</p>
                  </div>
                  
                  {isFunctionalMode && (
                    <>
                      <Separator />
                      <div className="bg-blue-50 p-3 rounded-md">
                        <h3 className="text-sm font-medium text-blue-800">Información técnica</h3>
                        <p className="mt-1 text-sm text-blue-700">
                          Certificado digital: ✓ Válido<br />
                          Método de verificación: Firma Electrónica Avanzada<br />
                          Cumplimiento Ley 19.799: ✓ Conforme<br />
                          Hash del documento: 7f8e9d6c5b4a3210...
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab('sign')}>
                  Volver a firmas
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}