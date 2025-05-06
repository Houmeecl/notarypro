import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { VecinosETokenSignature } from '../components/vecinos/VecinosETokenSignature';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileIcon, FileText, FilePlus, PenTool, ArrowLeft } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

export default function VecinosSignDocumentPage() {
  const [, navigate] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<any>(null);
  const [signingMethod, setSigningMethod] = useState<'etoken' | 'zoho'>('etoken');
  const [showSignatureComponent, setShowSignatureComponent] = useState(false);

  // ID del documento a firmar
  const documentId = params.documentId || '1'; // Valor predeterminado para pruebas

  // Al cargar la página, obtenemos la información del documento
  useEffect(() => {
    // Para pruebas, vamos a simular un documento
    const mockDocument = {
      id: parseInt(documentId),
      title: "Contrato de Prestación de Servicios",
      type: "contract",
      status: "pending",
      clientName: "Juan Pérez González",
      clientRut: "12.345.678-9",
      clientPhone: "+56 9 1234 5678",
      clientEmail: "juan.perez@ejemplo.cl",
      verificationCode: "ABC12345",
      createdAt: new Date().toISOString(),
      fileName: "contrato-prestacion-servicios.pdf"
    };

    // Simular carga
    setTimeout(() => {
      setDocument(mockDocument);
      setLoading(false);
    }, 1000);

    // En una implementación real, haríamos una llamada a la API
    /* 
    fetch(`/api/vecinos/document-sign/documents/${documentId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('vecinosToken')}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al cargar el documento');
        }
        return response.json();
      })
      .then(data => {
        setDocument(data.document);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message || 'Error al cargar documento');
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la información del documento.",
        });
      });
    */
  }, [documentId, toast]);

  const handleGoBack = () => {
    navigate('/vecinos-express');
  };

  const handleSuccess = (signatureData: any) => {
    toast({
      title: "Documento firmado",
      description: "El documento ha sido firmado exitosamente.",
    });
    
    // En una aplicación real, aquí redirigimos a la página de documentos
    setTimeout(() => {
      navigate('/vecinos-express');
    }, 2000);
  };

  const startSigningProcess = () => {
    setShowSignatureComponent(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto mt-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center">
              <FileIcon className="h-6 w-6 text-blue-500 animate-pulse" />
            </div>
            <div className="mt-4 h-4 bg-blue-200 rounded w-48"></div>
            <div className="mt-2 h-4 bg-blue-100 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto mt-8 px-4">
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={handleGoBack} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>
    );
  }

  if (showSignatureComponent) {
    return (
      <div className="container mx-auto mt-8 px-4 max-w-2xl">
        <Button onClick={() => setShowSignatureComponent(false)} variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        
        <VecinosETokenSignature 
          documentId={document.id} 
          documentName={document.title}
          onSuccess={handleSuccess}
          onCancel={() => setShowSignatureComponent(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="flex items-center mb-6">
        <Button onClick={handleGoBack} variant="outline" size="sm" className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Firma Electrónica de Documento</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="bg-indigo-50">
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <FileText className="h-5 w-5" />
                Información del documento
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-500 block">Título</Label>
                  <p className="font-medium">{document.title}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 block">Cliente</Label>
                  <p className="font-medium">{document.clientName}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 block">RUT</Label>
                  <p>{document.clientRut}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 block">Tipo de documento</Label>
                  <p className="capitalize">{document.type}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 block">Fecha de creación</Label>
                  <p>{new Date(document.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 block">Código de verificación</Label>
                  <p className="font-mono">{document.verificationCode}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Firma Electrónica Avanzada</CardTitle>
              <CardDescription>
                Seleccione el método de firma para el documento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs 
                defaultValue="etoken" 
                value={signingMethod}
                onValueChange={(v) => setSigningMethod(v as 'etoken' | 'zoho')}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="etoken">eToken (local)</TabsTrigger>
                  <TabsTrigger value="zoho">Zoho Sign (remoto)</TabsTrigger>
                </TabsList>
                <TabsContent value="etoken" className="space-y-4 pt-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="font-medium flex items-center gap-2 text-blue-800">
                      <PenTool className="h-4 w-4" />
                      Firma con eToken
                    </h3>
                    <p className="text-sm mt-2 text-blue-600">
                      Utilice su token criptográfico físico (eToken) para firmar el documento con firma electrónica avanzada según la Ley 19.799.
                    </p>
                    <div className="mt-4">
                      <Button onClick={startSigningProcess}>
                        Iniciar proceso de firma
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="zoho" className="space-y-4 pt-4">
                  <div className="bg-green-50 p-4 rounded-md">
                    <h3 className="font-medium flex items-center gap-2 text-green-800">
                      <FilePlus className="h-4 w-4" />
                      Firma con Zoho Sign
                    </h3>
                    <p className="text-sm mt-2 text-green-600">
                      Envíe el documento para ser firmado de forma remota a través de la plataforma Zoho Sign. El cliente recibirá un correo electrónico con instrucciones.
                    </p>
                    <div className="mt-4">
                      <Button variant="outline" className="bg-white">
                        Iniciar proceso remoto
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={handleGoBack}>Cancelar</Button>
              <Button disabled={true}>Finalizar</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}