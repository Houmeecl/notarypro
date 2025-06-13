import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { FileSignature, CheckCircle, AlertTriangle, AlertCircle, ArrowLeft, FileCheck } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { detectEToken, signWithEToken } from '../../lib/etoken-signer';

interface VecinosETokenSignatureProps {
  documentId: number;
  documentName: string;
  onSuccess?: (signatureData: any) => void;
  onCancel?: () => void;
}

export function VecinosETokenSignature({ 
  documentId, 
  documentName, 
  onSuccess, 
  onCancel 
}: VecinosETokenSignatureProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const [detecting, setDetecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenDetected, setTokenDetected] = useState<boolean>(false);
  const [tokenInfo, setTokenInfo] = useState<any | null>(null);
  const [signing, setSigning] = useState<boolean>(false);
  const [signatureComplete, setSignatureComplete] = useState<boolean>(false);

  // Detectar eToken al cargar el componente
  useEffect(() => {
    detectToken();
  }, []);

  // Función para detectar eToken
  const detectToken = async () => {
    try {
      setDetecting(true);
      setError(null);
      
      const result = await detectEToken();
      
      setTokenDetected(result.detected);
      setTokenInfo(result.info);
      
      if (!result.detected) {
        setError('No se detectó ningún token de firma electrónica. Por favor, conecte su eToken y vuelva a intentarlo.');
      } else {
        toast({
          title: "Token detectado",
          description: `Se ha detectado correctamente: ${result.info?.tokenName || 'Token de firma digital'}`,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error al detectar el token de firma');
      setTokenDetected(false);
    } finally {
      setDetecting(false);
    }
  };

  // Función para firmar el documento
  const signDocument = async () => {
    try {
      setSigning(true);
      setError(null);
      
      // Simulamos la firma con eToken
      const signatureResult = await signWithEToken(documentId);
      
      if (signatureResult.success) {
        setSignatureComplete(true);
        toast({
          title: "Documento firmado",
          description: "El documento ha sido firmado correctamente con firma electrónica avanzada",
        });
      } else {
        throw new Error(signatureResult.error || 'Error durante el proceso de firma');
      }
    } catch (err: any) {
      setError(err.message || 'Error al firmar el documento');
      toast({
        variant: "destructive",
        title: "Error de firma",
        description: err.message || "Ha ocurrido un error al firmar el documento",
      });
    } finally {
      setSigning(false);
    }
  };

  // Mostrar pantalla de éxito si la firma se completó
  if (signatureComplete) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="bg-green-50 border-b">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            Firma completada
          </CardTitle>
          <CardDescription>
            El documento ha sido firmado correctamente
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-2">
          <div className="text-center max-w-md mx-auto py-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">¡Firma exitosa!</h2>
            <p className="text-gray-600 mb-6">
              El documento ha sido firmado electrónicamente de manera exitosa.
            </p>
            <Alert className="mb-4 text-left">
              <AlertTitle>Información de la firma</AlertTitle>
              <AlertDescription>
                <p>Se ha utilizado firma electrónica avanzada según Ley 19.799.</p>
                <p className="mt-2">Documento firmado: <strong>{documentName}</strong></p>
                <p className="mt-2">ID de documento: <strong>{documentId}</strong></p>
                <p className="mt-2">Hora de firma: <strong>{new Date().toLocaleString()}</strong></p>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button onClick={() => {
            if (onSuccess) onSuccess({
              documentId,
              signatureType: 'etoken',
              signatureTime: new Date().toISOString()
            });
          }}>
            Continuar
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <FileSignature className="h-5 w-5" />
          Firma con Token Electrónico
        </CardTitle>
        <CardDescription>
          Firma electrónica avanzada para el documento: {documentName}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-6">
          {/* Información del documento */}
          <div className="rounded-lg border p-4 bg-gray-50">
            <h3 className="text-sm font-medium mb-2">Información del documento:</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Nombre:</span>{" "}
                  <span className="font-medium">{documentName}</span>
                </div>
                <div>
                  <span className="text-gray-500">ID del documento:</span>{" "}
                  <span className="font-medium">{documentId}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Estado del token */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Estado del token:</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={detectToken}
                disabled={detecting}
              >
                {detecting ? "Detectando..." : "Volver a detectar"}
              </Button>
            </div>
            
            {detecting ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                <span>Detectando token...</span>
              </div>
            ) : tokenDetected ? (
              <Alert className="bg-green-50 border-green-200">
                <FileCheck className="h-4 w-4 text-green-700" />
                <AlertTitle className="text-green-700">Token detectado</AlertTitle>
                <AlertDescription>
                  <p>Se ha detectado un token de firma electrónica avanzada.</p>
                  {tokenInfo && (
                    <div className="mt-2 text-sm">
                      <p><span className="font-medium">Nombre:</span> {tokenInfo.tokenName}</p>
                      <p><span className="font-medium">Certificado:</span> {tokenInfo.certificateInfo}</p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No se detectó ningún token</AlertTitle>
                <AlertDescription>
                  <p>Por favor, conecte su token de firma electrónica y haga clic en "Volver a detectar".</p>
                  <div className="mt-2 text-sm space-y-1">
                    <p>Recuerde:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Conecte su eToken a un puerto USB de su computador</li>
                      <li>Asegúrese de tener instalados los drivers necesarios</li>
                      <li>El token debe contener un certificado válido</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          {/* Instrucciones */}
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-medium mb-2">Instrucciones:</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>Conecte su token de firma electrónica al equipo.</li>
              <li>Espere a que el sistema detecte el dispositivo.</li>
              <li>Haga clic en "Firmar documento" cuando esté listo.</li>
              <li>Ingrese su PIN cuando el sistema se lo solicite.</li>
            </ol>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 border-t pt-4">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={signing}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        
        <Button 
          onClick={signDocument}
          disabled={!tokenDetected || signing}
          className="flex-1 sm:flex-none"
        >
          {signing ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
              Firmando...
            </>
          ) : (
            <>
              <FileSignature className="mr-2 h-4 w-4" />
              Firmar documento
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}