import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pen, RotateCcw, Check, FileText, Download } from "lucide-react";
import { Document } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DocumentSignatureCanvasProps {
  document: Document;
  onSignatureComplete: () => void;
}

export default function DocumentSignatureCanvas({ 
  document, 
  onSignatureComplete 
}: DocumentSignatureCanvasProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  
  // Context para dibujar
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Configurar el canvas cuando el componente se monta
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    canvas.style.width = `${canvas.offsetWidth}px`;
    canvas.style.height = `${canvas.offsetHeight}px`;
    
    const context = canvas.getContext("2d");
    if (context) {
      context.scale(2, 2);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "#333333";
      context.lineWidth = 2;
      contextRef.current = context;
    }
    
    clearCanvas();
  }, []);
  
  const signDocumentMutation = useMutation({
    mutationFn: async (signatureData: string) => {
      const response = await apiRequest("POST", `/api/documents/${document.id}/sign`, {
        signatureData,
        type: "simple"
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Documento firmado",
        description: "El documento ha sido firmado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${document.id}`] });
      onSignatureComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo firmar el documento.",
        variant: "destructive",
      });
    }
  });
  
  const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!contextRef.current || !canvasRef.current) return;
    
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    setHasSignature(true);
  };
  
  const finishDrawing = () => {
    if (!contextRef.current) return;
    
    contextRef.current.closePath();
    setIsDrawing(false);

    // Guardar la firma actual como imagen
    if (canvasRef.current) {
      setSignatureDataUrl(canvasRef.current.toDataURL("image/png"));
    }
  };
  
  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current) return;
    
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };
  
  const clearCanvas = () => {
    if (!contextRef.current || !canvasRef.current) return;
    
    contextRef.current.clearRect(
      0, 
      0, 
      canvasRef.current.width, 
      canvasRef.current.height
    );
    
    setHasSignature(false);
    setSignatureDataUrl(null);
  };
  
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!contextRef.current || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;
    
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    setHasSignature(true);
    
    e.preventDefault(); // Prevenir comportamiento por defecto (scroll, zoom)
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;
    
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    
    e.preventDefault(); // Prevenir comportamiento por defecto
  };
  
  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!contextRef.current) return;
    
    contextRef.current.closePath();
    setIsDrawing(false);
    
    // Guardar la firma actual como imagen
    if (canvasRef.current) {
      setSignatureDataUrl(canvasRef.current.toDataURL("image/png"));
    }
    
    e.preventDefault(); // Prevenir comportamiento por defecto
  };
  
  const handleCompleteSignature = () => {
    if (!signatureDataUrl) return;
    
    signDocumentMutation.mutate(signatureDataUrl);
  };

  // Formatea la fecha con formato español
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: es });
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Firmar Documento</CardTitle>
        <CardDescription>
          Dibuje su firma para completar el documento "{document.title}"
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">
                  Información del documento
                </h3>
                <div className="mt-2 space-y-1 text-sm text-blue-800">
                  <p>
                    <span className="font-medium">Título:</span> {document.title}
                  </p>
                  <p>
                    <span className="font-medium">Fecha de creación:</span> {formatDate(document.createdAt)}
                  </p>
                  <p>
                    <span className="font-medium">Estado:</span> Validado - Listo para firmar
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Dibuje su firma a continuación</h3>
            <div className="border-2 border-gray-300 rounded-md overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                className="cursor-crosshair"
                width={500}
                height={200}
                style={{ width: "100%", height: "200px", touchAction: "none" }}
                onMouseDown={startDrawing}
                onMouseUp={finishDrawing}
                onMouseOut={finishDrawing}
                onMouseMove={draw}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
            </div>
            <div className="mt-2 text-center text-sm text-gray-500">
              Dibuje su firma en el área de arriba
            </div>

            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={clearCanvas}
                className="flex items-center gap-1"
              >
                <RotateCcw className="h-4 w-4" />
                Limpiar firma
              </Button>
              
              <Button
                type="button"
                onClick={handleCompleteSignature}
                disabled={!hasSignature || signDocumentMutation.isPending}
                className="flex items-center gap-1"
              >
                {signDocumentMutation.isPending ? (
                  <>Procesando...</>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Firmar documento
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-sm">
            <p className="text-yellow-800">
              <span className="font-medium">Nota:</span> Al firmar este documento, usted confirma que ha leído, comprende y acepta todos los términos y condiciones establecidos en él.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <a href={`/api/documents/${document.id}/download-draft`} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="mr-2">
            <Download className="h-4 w-4 mr-2" />
            Descargar borrador
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}