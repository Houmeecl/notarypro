import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pen, RotateCcw, Check } from "lucide-react";

interface SignatureCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (signatureDataUrl: string) => void;
}

// Exportamos tanto como default como con nombre para mayor compatibilidad
export default function SignatureCanvas({ isOpen, onClose, onComplete }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  
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
  }, [isOpen]);
  
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
    
    e.preventDefault(); // Prevenir comportamiento por defecto
  };
  
  const handleComplete = () => {
    if (!canvasRef.current) return;
    
    const signatureDataUrl = canvasRef.current.toDataURL("image/png");
    onComplete(signatureDataUrl);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Firmar documento</DialogTitle>
          <DialogDescription>
            Dibuje su firma en el área a continuación utilizando el ratón o su dedo en dispositivos táctiles.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
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
        </div>
        
        <DialogFooter className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={clearCanvas}
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              Limpiar
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
          </div>
          
          <Button
            type="button"
            onClick={handleComplete}
            disabled={!hasSignature}
            className="flex items-center gap-1"
          >
            <Check className="h-4 w-4" />
            Completar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}