import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Pen, CheckCircle, AlertTriangle, Loader2, Clock, FileText, ShieldCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function FirmaMovilPage() {
  // Estado de la página
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentInfo, setDocumentInfo] = useState<any>(null);
  const [signatureComplete, setSignatureComplete] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [step, setStep] = useState<'loading' | 'verificacion' | 'confirmacion' | 'firma' | 'completado' | 'error'>('loading');
  const [signatureData, setSignatureData] = useState<any>(null);
  
  // Parámetros de la URL
  const params = useParams();
  const documentId = params.documentId;
  const verificationCode = params.verificationCode;
  
  const { toast } = useToast();
  
  // Cargar información del documento
  useEffect(() => {
    const loadDocumentInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Verificar que tenemos los parámetros necesarios
        if (!documentId || !verificationCode) {
          throw new Error('Faltan parámetros necesarios para la verificación');
        }
        
        // Llamada a la API para obtener información del documento
        const response = await fetch(`/api/qr-signature/document-info/${documentId}/${verificationCode}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Documento no encontrado o código de verificación inválido');
          } else {
            throw new Error(`Error al cargar información (${response.status}): ${await response.text()}`);
          }
        }
        
        const data = await response.json();
        
        if (!data.success || !data.isValid) {
          throw new Error('Código de verificación inválido o expirado');
        }
        
        // Guardar información del documento
        setDocumentInfo(data.documentInfo);
        setStep('verificacion');
        
      } catch (err: any) {
        console.error('Error al cargar información:', err);
        setError(err.message || 'Error desconocido al cargar información del documento');
        setStep('error');
      } finally {
        setLoading(false);
      }
    };
    
    loadDocumentInfo();
  }, [documentId, verificationCode]);
  
  // Función para confirmar identidad (simulada)
  const confirmarIdentidad = () => {
    setStep('confirmacion');
    toast({
      title: "Identidad confirmada",
      description: "Se ha verificado su identidad correctamente.",
    });
  };
  
  // Función para generar firma (simulada)
  const generarFirma = async () => {
    try {
      setLoading(true);
      
      // Simular tiempo de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // En una aplicación real, aquí generaríamos/registraríamos la firma
      const mockSignatureData = {
        userId: Math.floor(Math.random() * 1000) + 1,
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
        signatureMethod: 'mobile-qr',
      };
      
      setSignatureData(mockSignatureData);
      setStep('firma');
      
    } catch (err: any) {
      console.error('Error al generar firma:', err);
      setError(err.message || 'Error al generar la firma');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para enviar firma
  const enviarFirma = async () => {
    try {
      setLoading(true);
      
      // Llamada a la API para registrar la firma
      const response = await fetch('/api/qr-signature/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentId,
          verificationCode,
          signatureData
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error al enviar firma (${response.status}): ${await response.text()}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Error al procesar la firma');
      }
      
      setSignatureComplete(true);
      setStep('completado');
      
      toast({
        title: "Firma completada",
        description: "El documento ha sido firmado exitosamente.",
      });
      
    } catch (err: any) {
      console.error('Error al enviar firma:', err);
      setError(err.message || 'Error al enviar la firma');
    } finally {
      setLoading(false);
    }
  };
  
  // Renderizar pantalla de carga
  if (step === 'loading') {
    return (
      <div className="container max-w-md mx-auto px-4 py-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Cargando información
            </CardTitle>
            <CardDescription>
              Por favor espere mientras verificamos el documento
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Renderizar pantalla de error
  if (step === 'error') {
    return (
      <div className="container max-w-md mx-auto px-4 py-8">
        <Card>
          <CardHeader className="text-center bg-red-50">
            <CardTitle className="text-xl font-bold text-red-700 flex items-center justify-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              Error de verificación
            </CardTitle>
          </CardHeader>
          <CardContent className="py-6">
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No se pudo verificar el documento</h2>
              <p className="text-gray-600 mb-4">
                {error || 'Ha ocurrido un error al verificar el documento. El código QR puede ser inválido o haber expirado.'}
              </p>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-center">
            <Button variant="outline" onClick={() => window.close()}>
              Cerrar
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Renderizar etapa de verificación
  if (step === 'verificacion') {
    return (
      <div className="container max-w-md mx-auto px-4 py-8">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Verificación de identidad
            </CardTitle>
            <CardDescription>
              Para continuar con la firma del documento
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6 space-y-4">
            {documentInfo && (
              <Alert className="bg-blue-50 border-blue-200">
                <FileText className="h-4 w-4 text-blue-800" />
                <AlertTitle>Información del documento</AlertTitle>
                <AlertDescription>
                  <p><strong>Nombre:</strong> {documentInfo.title}</p>
                  <p><strong>Tipo:</strong> {documentInfo.type}</p>
                  <p><strong>Cliente:</strong> {documentInfo.client.name}</p>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium mb-3">Verificar su identidad mediante:</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={confirmarIdentidad}
                >
                  <div className="mr-2 h-5 w-5 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                    1
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Cédula de identidad</span>
                    <span className="text-xs text-gray-500">Verifique su identidad mediante su cédula</span>
                  </div>
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mt-4">
              <Switch id="aceptar-terminos" checked={aceptaTerminos} onCheckedChange={setAceptaTerminos} />
              <Label htmlFor="aceptar-terminos" className="text-sm text-gray-600">
                Acepto los términos y condiciones de firma electrónica avanzada según Ley N° 19.799
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Renderizar etapa de confirmación
  if (step === 'confirmacion') {
    return (
      <div className="container max-w-md mx-auto px-4 py-8">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Pen className="h-5 w-5" />
              Confirmar firma del documento
            </CardTitle>
            <CardDescription>
              Revise la información antes de firmar
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6 space-y-4">
            {documentInfo && (
              <>
                <Alert className="bg-blue-50 border-blue-200">
                  <FileText className="h-4 w-4 text-blue-800" />
                  <AlertTitle>Documento a firmar</AlertTitle>
                  <AlertDescription>
                    <p><strong>Nombre:</strong> {documentInfo.title}</p>
                    <p><strong>Tipo:</strong> {documentInfo.type}</p>
                    <p><strong>Fecha:</strong> {new Date(documentInfo.createdAt).toLocaleDateString()}</p>
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertTitle>Información importante</AlertTitle>
                  <AlertDescription>
                    <p className="text-sm">
                      Al firmar este documento, usted está utilizando firma electrónica avanzada de acuerdo 
                      con la Ley N° 19.799. Esta firma tiene la misma validez legal que una firma manuscrita.
                    </p>
                  </AlertDescription>
                </Alert>
              </>
            )}
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setStep('verificacion')}>
              Volver
            </Button>
            <Button onClick={generarFirma} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Firmar documento'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Renderizar etapa de firma
  if (step === 'firma') {
    return (
      <div className="container max-w-md mx-auto px-4 py-8">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Pen className="h-5 w-5" />
              Firma en proceso
            </CardTitle>
            <CardDescription>
              Confirme para finalizar el proceso
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6 space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertTitle>Firma generada correctamente</AlertTitle>
              <AlertDescription>
                <p>Se ha generado una firma electrónica avanzada para su documento.</p>
                <p className="mt-2">Haga clic en "Completar firma" para finalizar el proceso.</p>
              </AlertDescription>
            </Alert>
            
            <div className="rounded-lg border p-4 bg-gray-50">
              <h3 className="text-sm font-medium mb-2">Datos de la firma:</h3>
              <div className="text-sm space-y-1">
                <p><strong>ID de documento:</strong> {documentId}</p>
                <p><strong>Fecha y hora:</strong> {new Date().toLocaleString()}</p>
                <p><strong>Método de firma:</strong> Firma móvil QR</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setStep('confirmacion')}>
              Volver
            </Button>
            <Button onClick={enviarFirma} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Completar firma'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Renderizar etapa de completado
  if (step === 'completado') {
    return (
      <div className="container max-w-md mx-auto px-4 py-8">
        <Card>
          <CardHeader className="bg-green-50 border-b">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Firma completada
            </CardTitle>
            <CardDescription>
              El documento ha sido firmado correctamente
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">¡Firma exitosa!</h2>
              <p className="text-gray-600 mb-6">
                El documento ha sido firmado electrónicamente de manera exitosa.
              </p>
              
              <Alert className="mb-4 text-left">
                <AlertTitle>Información de la firma</AlertTitle>
                <AlertDescription>
                  <p>Se ha utilizado firma electrónica avanzada según Ley 19.799.</p>
                  {documentInfo && (
                    <p className="mt-2">Documento firmado: <strong>{documentInfo.title}</strong></p>
                  )}
                  <p className="mt-2">ID de documento: <strong>{documentId}</strong></p>
                  <p className="mt-2">Hora de firma: <strong>{new Date().toLocaleString()}</strong></p>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-center">
            <Button onClick={() => window.close()}>
              Cerrar
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Si llegamos aquí, algo salió mal
  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error inesperado</AlertTitle>
        <AlertDescription>
          Ha ocurrido un error inesperado en la aplicación. Por favor, intente nuevamente más tarde.
        </AlertDescription>
      </Alert>
    </div>
  );
}