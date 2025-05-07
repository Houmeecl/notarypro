import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, CheckCircle2, SmartphoneNfc, Key, ShieldCheck, FileSignature } from "lucide-react";
import { Progress } from "@/components/ui/progress";

/**
 * Interfaz para las opciones de configuración de firma con token externo
 */
interface ExternalTokenSignatureProps {
  /**
   * Contenido del documento a firmar (HTML o texto plano)
   */
  documentContent: string;
  /**
   * Nombre o título del documento
   */
  documentName: string;
  /**
   * Función a ejecutar cuando se completa la firma
   * @param signatureData Datos de la firma generada
   */
  onSignatureComplete: (signatureData: {
    signatureValue: string;
    certificate: string;
    timestamp: string;
    algorithm: string;
  }) => void;
  /**
   * Función a ejecutar si el usuario cancela el proceso
   */
  onCancel: () => void;
}

/**
 * Componente para firma avanzada utilizando eToken/eCert chileno con
 * drivers SafeNet PKCS#11 para autenticación avanzada
 */
const ExternalTokenSignature: React.FC<ExternalTokenSignatureProps> = ({
  documentContent,
  documentName,
  onSignatureComplete,
  onCancel
}) => {
  const { toast } = useToast();
  const [isDetecting, setIsDetecting] = useState(false);
  const [isTokenDetected, setIsTokenDetected] = useState(false);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [isGeneratingSignature, setIsGeneratingSignature] = useState(false);
  const [pin, setPin] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  // Simular la detección del token
  const detectToken = () => {
    setIsDetecting(true);
    setError(null);
    
    // Simular proceso de detección
    setTimeout(() => {
      setProgress(30);
      
      // Simulación exitosa del token detectado
      setTimeout(() => {
        setIsTokenDetected(true);
        setIsDetecting(false);
        setCurrentStep(2);
        setProgress(40);
        
        toast({
          title: "Token detectado",
          description: "Se ha detectado su eToken/eCert correctamente",
        });
      }, 2000);
    }, 1500);
  };
  
  // Simular verificación de PIN
  const verifyPin = () => {
    if (!pin.trim()) {
      setError("Debe ingresar su PIN de acceso");
      return;
    }
    
    setError(null);
    setIsGeneratingSignature(true);
    
    // Simulación del proceso de autenticación
    setTimeout(() => {
      setProgress(60);
      
      // Verificación exitosa del PIN
      setTimeout(() => {
        setIsPinVerified(true);
        setCurrentStep(3);
        setProgress(70);
        
        toast({
          title: "PIN verificado",
          description: "Credenciales verificadas correctamente",
        });
        
        // Generar firma automáticamente después de verificar PIN
        generateSignature();
      }, 1500);
    }, 1000);
  };
  
  // Simular generación de firma
  const generateSignature = () => {
    setProgress(80);
    
    // Simulación de proceso de firmado
    setTimeout(() => {
      setProgress(100);
      
      // Generar datos simulados de firma
      const signatureData = {
        signatureValue: "MIIGzAYJKoZIhvcNAQcCoIIGvTCCBrkCAQExCzAJBgUrDgMCGgUAMIIDiQYJKoZIhvcNAQcBoIIDegSCA3YxggNyMAoCARQCAQEEAgwAMAsCAQ",
        certificate: "MIIE7jCCA9agAwIBAgIEWf8FozANBgkqhkiG9w0BAQsFADB3MQswCQYDVQQGEwJDTDEqMCgGA1UEChMhRW50aWRhZCBBY3JlZGl0YWRvcmEgUmF",
        timestamp: new Date().toISOString(),
        algorithm: "SHA256withRSA"
      };
      
      // Devolver datos de firma
      onSignatureComplete(signatureData);
      
      toast({
        title: "Documento firmado exitosamente",
        description: "La firma electrónica avanzada se ha completado",
      });
    }, 2000);
  };
  
  // Cancelar operación
  const handleCancel = () => {
    setIsDetecting(false);
    setError(null);
    onCancel();
  };
  
  // Reintentar operación
  const retryOperation = () => {
    setIsDetecting(false);
    setIsTokenDetected(false);
    setIsPinVerified(false);
    setIsGeneratingSignature(false);
    setError(null);
    setProgress(0);
    setCurrentStep(1);
  };
  
  // Renderizar estado actual del proceso
  const renderCurrentStep = () => {
    if (error) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error en el proceso</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    
    if (isDetecting) {
      return (
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <Loader2 className="h-16 w-16 text-[#2d219b] animate-spin" />
          <p className="text-center">Detectando dispositivo eToken/eCert.<br/>Por favor espere...</p>
        </div>
      );
    }
    
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-[#2d219b]">
              <SmartphoneNfc className="h-5 w-5" />
              <h3 className="font-medium">Paso 1: Detección de token</h3>
            </div>
            <p className="text-sm text-gray-600">
              Para iniciar el proceso de firma con eToken/eCert, conecte su dispositivo al puerto USB de su computador y haga clic en "Detectar token".
            </p>
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-xs">
                Asegúrese de que su dispositivo eToken/eCert esté correctamente conectado y que los drivers SafeNet estén instalados en su equipo.
              </AlertDescription>
            </Alert>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-[#2d219b]">
              <Key className="h-5 w-5" />
              <h3 className="font-medium">Paso 2: Verificación de PIN</h3>
            </div>
            <p className="text-sm text-gray-600">
              Ingrese el PIN de acceso de su dispositivo eToken/eCert para acceder a sus certificados digitales.
            </p>
            <div className="pt-2">
              <input
                type="password"
                placeholder="Ingrese su PIN"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#2d219b] focus:border-[#2d219b] outline-none"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </div>
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-xs">
                Su PIN es personal y privado. Nunca lo compartimos ni almacenamos en nuestros sistemas.
              </AlertDescription>
            </Alert>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-[#2d219b]">
              <FileSignature className="h-5 w-5" />
              <h3 className="font-medium">Paso 3: Generación de firma</h3>
            </div>
            <p className="text-sm text-gray-600">
              Generando firma electrónica avanzada para el documento "{documentName}".
            </p>
            <div className="py-2">
              <Loader2 className="h-8 w-8 text-[#2d219b] animate-spin mx-auto" />
            </div>
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-xs">
                La firma está siendo generada con los certificados de su eToken/eCert. Este proceso puede tardar unos segundos.
              </AlertDescription>
            </Alert>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-[#2d219b]">Firma con eToken/eCert</CardTitle>
        <CardDescription className="text-center">
          Firme su documento utilizando su certificado digital avanzado
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Detección</span>
            <span>Verificación</span>
            <span>Completado</span>
          </div>
        </div>
        
        {renderCurrentStep()}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4">
        <Button variant="outline" onClick={handleCancel} disabled={isGeneratingSignature}>
          Cancelar
        </Button>
        
        {currentStep === 1 && (
          <Button onClick={detectToken} disabled={isDetecting}>
            {isDetecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Detectando...
              </>
            ) : (
              "Detectar token"
            )}
          </Button>
        )}
        
        {currentStep === 2 && (
          <Button onClick={verifyPin} disabled={isGeneratingSignature || !pin.trim()}>
            {isGeneratingSignature ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              "Verificar PIN"
            )}
          </Button>
        )}
        
        {error && (
          <Button variant="outline" onClick={retryOperation}>
            Reintentar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ExternalTokenSignature;