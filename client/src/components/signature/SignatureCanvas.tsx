/**
 * COMPONENTE DE CANVAS PARA FIRMAS DIGITALES
 * Permite capturar firmas manuscritas en pantalla
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Pen, 
  RotateCcw, 
  Save, 
  Trash2, 
  Download,
  Check,
  X,
  Palette
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SignatureCanvasProps {
  onSignatureCapture?: (signatureData: string) => void;
  onSignatureComplete?: (signatureData: string) => void;
  onSignatureClear?: () => void;
  width?: number;
  height?: number;
  strokeWidth?: number;
  strokeColor?: string;
  backgroundColor?: string;
  disabled?: boolean;
  showControls?: boolean;
  signerName?: string;
  documentTitle?: string;
  className?: string;
}

interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export default function SignatureCanvas({
  onSignatureCapture,
  onSignatureComplete,
  onSignatureClear,
  width = 500,
  height = 200,
  strokeWidth = 2,
  strokeColor = '#1e3a8a',
  backgroundColor = '#ffffff',
  disabled = false,
  showControls = true,
  signerName,
  documentTitle,
  className = ''
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(strokeWidth);
  const [currentStrokeColor, setCurrentStrokeColor] = useState(strokeColor);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const [signatureData, setSignatureData] = useState<string>('');
  const { toast } = useToast();

  // Configurar canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas
    canvas.width = width;
    canvas.height = height;
    
    // Configurar contexto
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentStrokeColor;
    ctx.lineWidth = currentStrokeWidth;

    // Agregar línea de firma
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(50, height - 30);
    ctx.lineTo(width - 50, height - 30);
    ctx.stroke();
    ctx.setLineDash([]);

    // Texto de instrucción
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Firme aquí', width / 2, height - 10);

    // Restaurar configuración de dibujo
    ctx.strokeStyle = currentStrokeColor;
    ctx.lineWidth = currentStrokeWidth;

  }, [width, height, backgroundColor, currentStrokeColor, currentStrokeWidth]);

  // Obtener posición del mouse/touch relativa al canvas
  const getRelativePosition = useCallback((event: MouseEvent | TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in event) {
      const touch = event.touches[0] || event.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
        pressure: 'force' in touch ? touch.force : 0.5
      };
    } else {
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
        pressure: 0.5
      };
    }
  }, []);

  // Iniciar dibujo
  const startDrawing = useCallback((event: MouseEvent | TouchEvent) => {
    if (disabled) return;

    event.preventDefault();
    const point = getRelativePosition(event);
    
    setIsDrawing(true);
    setLastPoint(point);
    setHasSignature(true);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }, [disabled, getRelativePosition]);

  // Continuar dibujo
  const continueDrawing = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isDrawing || disabled || !lastPoint) return;

    event.preventDefault();
    const point = getRelativePosition(event);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    // Dibujar línea suave
    ctx.strokeStyle = currentStrokeColor;
    ctx.lineWidth = currentStrokeWidth * (point.pressure || 0.5);
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    setLastPoint(point);
  }, [isDrawing, disabled, lastPoint, getRelativePosition, currentStrokeColor, currentStrokeWidth]);

  // Terminar dibujo
  const stopDrawing = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isDrawing) return;

    event.preventDefault();
    setIsDrawing(false);
    setLastPoint(null);

    // Capturar firma
    const canvas = canvasRef.current;
    if (canvas && hasSignature) {
      const dataUrl = canvas.toDataURL('image/png');
      setSignatureData(dataUrl);
      onSignatureCapture?.(dataUrl);
    }
  }, [isDrawing, hasSignature, onSignatureCapture]);

  // Event listeners para mouse
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => startDrawing(e);
    const handleMouseMove = (e: MouseEvent) => continueDrawing(e);
    const handleMouseUp = (e: MouseEvent) => stopDrawing(e);
    const handleMouseLeave = (e: MouseEvent) => stopDrawing(e);

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [startDrawing, continueDrawing, stopDrawing]);

  // Event listeners para touch
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => startDrawing(e);
    const handleTouchMove = (e: TouchEvent) => continueDrawing(e);
    const handleTouchEnd = (e: TouchEvent) => stopDrawing(e);

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startDrawing, continueDrawing, stopDrawing]);

  // Limpiar canvas
  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Redibujar línea de firma
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(50, height - 30);
    ctx.lineTo(width - 50, height - 30);
    ctx.stroke();
    ctx.setLineDash([]);

    // Texto de instrucción
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Firme aquí', width / 2, height - 10);

    // Restaurar configuración
    ctx.strokeStyle = currentStrokeColor;
    ctx.lineWidth = currentStrokeWidth;

    setHasSignature(false);
    setSignatureData('');
    onSignatureClear?.();

    toast({
      title: "Firma borrada",
      description: "El canvas ha sido limpiado"
    });
  }, [backgroundColor, width, height, currentStrokeColor, currentStrokeWidth, onSignatureClear, toast]);

  // Guardar firma
  const saveSignature = useCallback(() => {
    if (!hasSignature || !signatureData) {
      toast({
        title: "Sin firma",
        description: "Por favor, firme antes de guardar",
        variant: "destructive"
      });
      return;
    }

    onSignatureComplete?.(signatureData);
    toast({
      title: "Firma guardada",
      description: "Su firma ha sido capturada exitosamente"
    });
  }, [hasSignature, signatureData, onSignatureComplete, toast]);

  // Descargar firma
  const downloadSignature = useCallback(() => {
    if (!hasSignature || !signatureData) {
      toast({
        title: "Sin firma",
        description: "No hay firma para descargar",
        variant: "destructive"
      });
      return;
    }

    const link = document.createElement('a');
    link.download = `firma-${signerName || 'usuario'}-${Date.now()}.png`;
    link.href = signatureData;
    link.click();

    toast({
      title: "Firma descargada",
      description: "La imagen de la firma se ha descargado"
    });
  }, [hasSignature, signatureData, signerName, toast]);

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Pen className="mr-2 h-5 w-5" />
          Firma Digital
        </CardTitle>
        <CardDescription>
          {signerName && (
            <span>Firmante: <strong>{signerName}</strong></span>
          )}
          {documentTitle && (
            <span className="ml-4">Documento: <strong>{documentTitle}</strong></span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Canvas de firma */}
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4">
          <canvas
            ref={canvasRef}
            className={`border border-gray-200 rounded cursor-crosshair ${
              disabled ? 'cursor-not-allowed opacity-50' : ''
            }`}
            style={{
              touchAction: 'none',
              width: '100%',
              maxWidth: `${width}px`,
              height: 'auto',
              aspectRatio: `${width}/${height}`
            }}
          />
          
          {disabled && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center rounded">
              <span className="text-gray-500 font-medium">Firma deshabilitada</span>
            </div>
          )}
        </div>

        {/* Controles */}
        {showControls && (
          <div className="space-y-4">
            {/* Controles de dibujo */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Grosor:</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentStrokeWidth}
                  onChange={(e) => setCurrentStrokeWidth(Number(e.target.value))}
                  disabled={disabled}
                  className="w-20"
                />
                <span className="text-xs text-gray-500">{currentStrokeWidth}px</span>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Color:</label>
                <div className="flex space-x-1">
                  {['#1e3a8a', '#000000', '#1f2937', '#7c3aed'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setCurrentStrokeColor(color)}
                      disabled={disabled}
                      className={`w-6 h-6 rounded border-2 ${
                        currentStrokeColor === color ? 'border-gray-400' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearSignature}
                disabled={disabled || !hasSignature}
              >
                <RotateCcw className="mr-1 h-4 w-4" />
                Limpiar
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={downloadSignature}
                disabled={disabled || !hasSignature}
              >
                <Download className="mr-1 h-4 w-4" />
                Descargar
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={saveSignature}
                disabled={disabled || !hasSignature}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-1 h-4 w-4" />
                Confirmar Firma
              </Button>
            </div>

            {/* Estado de la firma */}
            <div className="flex items-center space-x-2 text-sm">
              {hasSignature ? (
                <div className="flex items-center text-green-600">
                  <Check className="mr-1 h-4 w-4" />
                  Firma capturada
                </div>
              ) : (
                <div className="flex items-center text-gray-500">
                  <X className="mr-1 h-4 w-4" />
                  Sin firma
                </div>
              )}
              
              {signatureData && (
                <span className="text-xs text-gray-400">
                  Tamaño: {Math.round(signatureData.length / 1024)}KB
                </span>
              )}
            </div>
          </div>
        )}

        {/* Información legal */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">i</span>
              </div>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-900">
                Información Legal
              </h4>
              <div className="text-xs text-blue-800 mt-1 space-y-1">
                <p>• Su firma digital tiene validez legal equivalente a una firma manuscrita</p>
                <p>• La firma será registrada con timestamp y datos de verificación</p>
                <p>• Este proceso cumple con la Ley 19.799 sobre Documentos Electrónicos</p>
                <p>• La sesión está siendo grabada para fines de auditoría</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instrucciones de uso */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Instrucciones de Uso
          </h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>• Use el mouse o toque la pantalla para firmar</p>
            <p>• Puede ajustar el grosor y color del trazo</p>
            <p>• Use "Limpiar" para borrar y empezar de nuevo</p>
            <p>• Confirme su firma cuando esté satisfecho con el resultado</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}