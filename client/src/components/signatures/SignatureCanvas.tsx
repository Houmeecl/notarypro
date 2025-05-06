import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, Download } from 'lucide-react';

interface SignatureCanvasProps {
  onSignatureComplete: (signatureData: string) => void;
  signatureType?: 'client' | 'certifier';
  width?: number;
  height?: number;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  onSignatureComplete,
  signatureType = 'client',
  width = 500,
  height = 200
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [signatureExists, setSignatureExists] = useState(false);

  // Configuración según el tipo de firma
  const borderColor = signatureType === 'certifier' ? 'border-green-600' : 'border-[#2d219b]';
  const strokeStyle = signatureType === 'certifier' ? '#2e7d32' : '#2d219b';
  const strokeWidth = signatureType === 'certifier' ? 2.5 : 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar el canvas
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeStyle;

    // Limpiar el canvas al cargar
    ctx.fillStyle = '#f9f9f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [strokeStyle, strokeWidth]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      // Evento touch
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Evento mouse
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    setLastPosition({ x, y });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      // Evento touch
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault(); // Prevenir scroll en dispositivos táctiles
    } else {
      // Evento mouse
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    setLastPosition({ x, y });
    setSignatureExists(true);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    
    if (signatureExists) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const signatureData = canvas.toDataURL('image/png');
      onSignatureComplete(signatureData);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#f9f9f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    setSignatureExists(false);
  };

  const downloadSignature = () => {
    if (!signatureExists) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'firma-digital.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col items-center space-y-2 w-full">
      <div className={`border-2 ${borderColor} rounded-md bg-gray-50 overflow-hidden`}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
      </div>
      <div className="flex space-x-2 justify-end w-full">
        <Button 
          variant="outline" 
          size="sm"
          onClick={clearCanvas}
          type="button"
        >
          <Eraser className="h-4 w-4 mr-2" />
          Borrar
        </Button>
        {signatureExists && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={downloadSignature}
            type="button"
          >
            <Download className="h-4 w-4 mr-2" />
            Guardar
          </Button>
        )}
      </div>
    </div>
  );
};

export default SignatureCanvas;