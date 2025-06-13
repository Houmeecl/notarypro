import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DemoModeBannerProps {
  variant?: 'default' | 'minimal';
  position?: 'top' | 'bottom';
  className?: string;
}

export function DemoModeBanner({ 
  variant = 'default', 
  position = 'top',
  className 
}: DemoModeBannerProps) {
  // Estilos base para las variantes
  const baseStyles = "w-full flex items-center justify-center";
  
  // Estilos para la posición
  const positionStyles = position === 'top' 
    ? "top-0 border-b"
    : "bottom-0 border-t";
  
  // Estilos específicos según la variante
  const variantStyles = variant === 'default'
    ? "py-3 px-4 bg-amber-50 border-amber-300 text-amber-800"
    : "py-1.5 px-4 bg-amber-50/80 border-amber-200 text-amber-800 text-sm";
  
  return (
    <div className={cn(baseStyles, positionStyles, variantStyles, className)}>
      {variant === 'default' && (
        <div className="flex items-center max-w-5xl mx-auto">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
          <div>
            <span className="font-medium">Modo de demostración</span>
            <span className="hidden sm:inline"> - Esta es una versión de prueba. Los datos y transacciones no se procesarán en sistemas reales.</span>
          </div>
        </div>
      )}
      
      {variant === 'minimal' && (
        <div className="flex items-center">
          <AlertTriangle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
          <span className="text-xs">Modo demo - Las transacciones no son reales</span>
        </div>
      )}
    </div>
  );
}