import { useState, useEffect } from "react";
import { SearchIcon, CheckCircle, XCircle, ArrowRight, FileSearch } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useParams } from "wouter";

interface VerificationResult {
  verified: boolean;
  message?: string;
  documentInfo?: {
    title: string;
    signatureTimestamp: string;
    signerName: string;
  };
}

export default function VerificarDocumento() {
  const params = useParams();
  const [verificationCode, setVerificationCode] = useState(params.code || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const { toast } = useToast();
  
  // Verificar automáticamente si hay un código en la URL
  const verifyDocument = async (code: string) => {
    setIsVerifying(true);
    try {
      const response = await apiRequest("GET", `/api/verificar-documento/${code}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      toast({
        title: "Error de verificación",
        description: "Ocurrió un error al verificar el documento. Por favor intente nuevamente.",
        variant: "destructive",
      });
      setResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (params.code) {
      verifyDocument(params.code);
    }
  }, [params.code]);

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Código requerido",
        description: "Por favor ingrese un código de verificación.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await apiRequest("GET", `/api/verificar-documento/${verificationCode}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      toast({
        title: "Error de verificación",
        description: "Ocurrió un error al verificar el documento. Por favor intente nuevamente.",
        variant: "destructive",
      });
      setResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
    } catch (error) {
      return "Fecha no disponible";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Verificación de Documentos</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Compruebe la autenticidad de los documentos firmados en nuestra plataforma
            ingresando el código de verificación proporcionado en el documento.
          </p>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileSearch className="h-5 w-5 text-primary mr-2" />
              Verificar Autenticidad
            </CardTitle>
            <CardDescription>
              Introduzca el código de verificación que aparece en el documento o que obtuvo al escanear el código QR.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Ej. DOC-ABC123XYZ"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleVerify} disabled={isVerifying}>
                {isVerifying ? (
                  <>
                    <span className="animate-spin mr-2">
                      <SearchIcon className="h-4 w-4" />
                    </span>
                    Verificando...
                  </>
                ) : (
                  <>
                    <SearchIcon className="h-4 w-4 mr-2" />
                    Verificar
                  </>
                )}
              </Button>
            </div>

            {result && (
              <div className="mt-6">
                {result.verified ? (
                  <div className="space-y-4">
                    <Alert variant="default" className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">Documento Verificado</AlertTitle>
                      <AlertDescription className="text-green-700">
                        El documento es auténtico y ha sido validado correctamente.
                      </AlertDescription>
                    </Alert>

                    <div className="bg-gray-50 p-4 rounded-md border">
                      <h3 className="font-medium mb-3">Información del Documento</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <span className="font-medium w-28">Título:</span>
                          <span className="flex-1">{result.documentInfo?.title}</span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-medium w-28">Firmado por:</span>
                          <span className="flex-1">{result.documentInfo?.signerName}</span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-medium w-28">Fecha de firma:</span>
                          <span className="flex-1">
                            {result.documentInfo?.signatureTimestamp 
                              ? formatDate(result.documentInfo.signatureTimestamp)
                              : "No disponible"}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Documento No Verificado</AlertTitle>
                    <AlertDescription>
                      {result.message || "No se pudo verificar la autenticidad del documento."}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-between text-xs text-gray-500 border-t pt-4">
            <div>
              La verificación confirma que el documento fue firmado en nuestra plataforma.
            </div>
            <Button variant="link" className="text-xs" onClick={() => window.location.href = "/"}>
              Volver al inicio
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}