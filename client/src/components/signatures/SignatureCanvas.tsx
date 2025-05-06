import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

interface SignatureCanvasProps {
  onSignatureComplete?: (data: string) => void;
  onBeginDrawing?: () => void;
  signatureType: 'client' | 'certifier';
}

const SignatureCanvas = forwardRef<HTMLCanvasElement, SignatureCanvasProps>(
  ({ onSignatureComplete, onBeginDrawing, signatureType }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const isDrawingRef = useRef(false);
    const lastPosRef = useRef({ x: 0, y: 0 });

    // Exponer el canvas al componente padre
    useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);
    
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Configurar canvas para mejor calidad
      const devicePixelRatio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;
      
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2;
      ctx.strokeStyle = signatureType === 'certifier' ? '#16a34a' : '#2d219b';
      
      // Clear canvas initially
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Add a subtle hint/guide in the canvas
      ctx.save();
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      const guideY = rect.height * 0.7;
      ctx.moveTo(20, guideY);
      ctx.lineTo(rect.width - 20, guideY);
      ctx.stroke();
      ctx.restore();
      
      // Prepare text
      ctx.save();
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('Firme aquí', rect.width / 2, rect.height * 0.85);
      ctx.restore();
      
    }, [signatureType]);
    
    // Comenzar a dibujar
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      isDrawingRef.current = true;
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Limpiar el canvas cuando el usuario comienza a dibujar
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Obtener la posición
      const pos = getPosition(e, canvas);
      lastPosRef.current = pos;
      
      // Notificar que se comenzó a dibujar
      if (onBeginDrawing) {
        onBeginDrawing();
      }
    };
    
    // Continuar dibujando
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Obtener la posición actual
      const currentPos = getPosition(e, canvas);
      
      // Dibujar la línea
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
      
      lastPosRef.current = currentPos;
    };
    
    // Terminar de dibujar
    const handleMouseUp = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      
      // Si hay una función de callback, enviar los datos de la firma
      if (onSignatureComplete && canvasRef.current) {
        onSignatureComplete(canvasRef.current.toDataURL('image/png'));
      }
    };
    
    // Función auxiliar para obtener la posición del mouse/touch con correcto escalado
    const getPosition = (
      e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
      canvas: HTMLCanvasElement
    ) => {
      const rect = canvas.getBoundingClientRect();
      
      // Obtener coordenadas correctas según el tipo de evento
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
      
      return {
        x: (clientX - rect.left),
        y: (clientY - rect.top)
      };
    };
    
    return (
      <canvas
        ref={canvasRef}
        className="w-full h-40 bg-white cursor-crosshair touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      />
    );
  }
);

SignatureCanvas.displayName = 'SignatureCanvas';

export default SignatureCanvas;