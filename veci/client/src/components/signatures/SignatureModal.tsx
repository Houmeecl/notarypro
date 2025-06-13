
import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'signature_pad';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eraser, Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureDataUrl: string) => void;
  title?: string;
}

export default function SignatureModal({ isOpen, onClose, onSave, title = 'Firma del documento' }: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignatureCanvas | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const { toast } = useToast();

  // Inicializar SignaturePad cuando el componente se monta
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      // Limpiar instancia previa si existe
      if (signaturePadRef.current) {
        signaturePadRef.current.clear();
      }
      
      // Crear nueva instancia de SignaturePad
      signaturePadRef.current = new SignatureCanvas(canvasRef.current, {
        backgroundColor: 'rgba(255, 255, 255, 0)',
        penColor: 'black',
      });
      
      // Establecer el tamaño del canvas
      resizeCanvas();
      
      // Añadir evento de cambio para detectar cuando el usuario firma
      signaturePadRef.current.addEventListener('beginStroke', () => {
        setIsEmpty(false);
      });
      
      // Detectar cambios de tamaño de ventana
      window.addEventListener('resize', resizeCanvas);
      
      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, [isOpen]);
  
  // Ajustar el tamaño del canvas
  const resizeCanvas = () => {
    if (canvasRef.current && signaturePadRef.current) {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const container = canvasRef.current.parentElement;
      
      if (container) {
        // Obtener el tamaño del contenedor
        const width = container.clientWidth;
        // Usar una altura fija para el área de firma
        const height = 200;
        
        // Establecer el tamaño del canvas
        canvasRef.current.width = width * ratio;
        canvasRef.current.height = height * ratio;
        canvasRef.current.style.width = `${width}px`;
        canvasRef.current.style.height = `${height}px`;
        
        // Escalar el contexto del canvas
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.scale(ratio, ratio);
        }
        
        // Limpiar el canvas
        signaturePadRef.current.clear();
        setIsEmpty(true);
      }
    }
  };
  
  // Limpiar la firma
  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setIsEmpty(true);
    }
  };
  
  // Guardar la firma
  const handleSave = () => {
    if (signaturePadRef.current) {
      if (signaturePadRef.current.isEmpty()) {
        toast({
          title: "Firma requerida",
          description: "Por favor, firme en el área designada",
          variant: "destructive",
        });
        return;
      }
      
      // Obtener la firma como imagen
      const signatureDataUrl = signaturePadRef.current.toDataURL('image/png');
      
      // Llamar a la función onSave y pasar la imagen
      onSave(signatureDataUrl);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="border-2 border-dashed border-gray-200 rounded-md p-2 my-4">
          <div className="signature-canvas-container">
            <canvas
              ref={canvasRef}
              className="w-full touch-none"
              style={{ backgroundColor: 'white', borderRadius: '4px' }}
            />
          </div>
        </div>
        
        <div className="flex justify-center space-x-2 mb-4">
          <Button variant="outline" size="sm" onClick={clearSignature}>
            <Eraser className="h-4 w-4 mr-2" />
            Borrar
          </Button>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={isEmpty} onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Guardar firma
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}