import React, { useRef, useEffect, useState } from 'react';
import SignaturePad from 'signature_pad';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DownloadIcon, RotateCcw, CheckCircle, Send, AlertTriangle } from 'lucide-react';

interface SignaturePadProps {
  onSignatureCapture: (signatureData: string) => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  clientName?: string;
}

const SignaturePadComponent: React.FC<SignaturePadProps> = ({
  onSignatureCapture,
  onCancel,
  title = "Firma Electrónica",
  description = "Firme en el recuadro inferior usando su dedo o mouse",
  clientName
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const [isSigned, setIsSigned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Ajustar tamaño del canvas
    const canvas = canvasRef.current;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d")?.scale(ratio, ratio);
    
    // Inicializar SignaturePad
    signaturePadRef.current = new SignaturePad(canvas, {
      minWidth: 1,
      maxWidth: 2.5,
      backgroundColor: "rgba(255, 255, 255, 0)",
      penColor: "rgb(0, 0, 128)",
    });
    
    // Detectar cuando se comienza a firmar
    canvas.addEventListener('mousedown', checkIfSigned);
    canvas.addEventListener('touchstart', checkIfSigned);
    
    return () => {
      if (canvas) {
        canvas.removeEventListener('mousedown', checkIfSigned);
        canvas.removeEventListener('touchstart', checkIfSigned);
      }
      signaturePadRef.current = null;
    };
  }, []);
  
  // Función para verificar si hay firma
  const checkIfSigned = () => {
    setError(null);
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      setIsSigned(true);
    }
  };
  
  // Función para limpiar la firma
  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setIsSigned(false);
      setError(null);
    }
  };
  
  // Función para capturar y enviar la firma
  const captureSignature = async () => {
    if (!signaturePadRef.current) return;
    
    if (signaturePadRef.current.isEmpty()) {
      setError("Por favor, firme antes de continuar");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Obtener imagen en formato base64
      const signatureData = signaturePadRef.current.toDataURL('image/png');
      
      // Crear una solución temporal para validar la firma mediante una API gratuita
      // Simulamos una verificación usando un temporizador
      setTimeout(() => {
        // En producción, aquí se llamaría a una API de verificación de firma
        const validateSignature = async (signatureData: string) => {
          try {
            // Aquí se implementaría la llamada a la API externa
            // Por ahora, simulamos una respuesta exitosa
            return {
              valid: true,
              score: 0.92,
              signatureId: `sig-${Date.now()}`
            };
          } catch (error) {
            console.error("Error validating signature:", error);
            throw new Error("No se pudo validar la firma");
          }
        };
        
        validateSignature(signatureData)
          .then((result) => {
            if (result.valid) {
              // Si la firma es válida, la pasamos al componente padre
              onSignatureCapture(signatureData);
            } else {
              setError("La firma no pudo ser validada. Por favor, intente nuevamente.");
            }
          })
          .catch((error) => {
            setError(error.message || "Error al procesar la firma");
          })
          .finally(() => {
            setIsSubmitting(false);
          });
      }, 1500);
    } catch (error) {
      console.error("Error capturando firma:", error);
      setError("Ocurrió un error al capturar la firma");
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-[#2d219b]" />
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {clientName && (
          <div className="text-sm font-medium">
            Firmante: <span className="text-gray-600">{clientName}</span>
          </div>
        )}
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-1 bg-white">
          <canvas 
            ref={canvasRef} 
            className="w-full h-60 touch-none cursor-crosshair border border-gray-200 rounded"
          />
        </div>
        
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="text-xs text-gray-500 italic mt-1">
          Al firmar este documento, confirma que toda la información proporcionada es correcta y acepta los términos y condiciones.
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={clearSignature}
          disabled={isSubmitting}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Limpiar
        </Button>
        
        <div className="space-x-2">
          {onCancel && (
            <Button 
              variant="ghost" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
          
          <Button 
            className="bg-[#2d219b] hover:bg-[#241a7d] text-white" 
            onClick={captureSignature}
            disabled={!isSigned || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Firmar
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SignaturePadComponent;