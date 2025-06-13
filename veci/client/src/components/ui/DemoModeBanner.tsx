/**
 * Banner de modo de demostración para VecinoXpress POS
 * 
 * Este componente muestra un banner claro cuando la aplicación se está ejecutando
 * en modo de demostración, lo que permite a los usuarios distinguir fácilmente
 * entre el POS real y el de demostración.
 */

import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDeviceMode } from '@/lib/deviceModeDetector';

interface DemoModeBannerProps {
  className?: string;
  theme?: 'light' | 'dark';
  position?: 'top' | 'bottom';
  dismissible?: boolean;
  variant?: 'subtle' | 'standard' | 'prominent';
}

export default function DemoModeBanner({
  className,
  theme = 'light',
  position = 'top',
  dismissible = true,
  variant = 'standard'
}: DemoModeBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const { isDemo, deviceId, setRealMode } = useDeviceMode();
  
  // Modo demo desactivado permanentemente, nunca mostrar el banner
  return null;
  
  // Determinar estilos según tema y variante
  const baseStyles = "flex items-center justify-between px-4 py-2 text-sm font-medium z-50";
  const positionStyles = position === 'top' 
    ? "fixed top-0 left-0 right-0" 
    : "fixed bottom-0 left-0 right-0";
  
  // Estilos de color según tema y variante
  let variantStyles = "";
  if (theme === 'light') {
    if (variant === 'subtle') {
      variantStyles = "bg-amber-50 text-amber-700 border-b border-amber-200";
    } else if (variant === 'prominent') {
      variantStyles = "bg-amber-500 text-white";
    } else {
      variantStyles = "bg-amber-100 text-amber-800 border-b border-amber-300";
    }
  } else {
    if (variant === 'subtle') {
      variantStyles = "bg-amber-900/30 text-amber-300 border-b border-amber-800";
    } else if (variant === 'prominent') {
      variantStyles = "bg-amber-700 text-white";
    } else {
      variantStyles = "bg-amber-800 text-amber-100 border-b border-amber-700";
    }
  }
  
  // Construir mensaje según variante
  let message = "Modo de demostración activo";
  if (variant === 'prominent') {
    message = "¡ATENCIÓN! Esta es una versión de demostración. Los datos no son reales.";
  }
  
  return (
    <div className={cn(baseStyles, positionStyles, variantStyles, className)}>
      <div className="flex items-center">
        <AlertCircle className="h-4 w-4 mr-2" />
        <span>{message}</span>
      </div>
      
      <div className="flex items-center">
        {/* Solo mostrar en versiones prominent */}
        {variant === 'prominent' && (
          <button 
            onClick={setRealMode}
            className="mr-4 text-xs font-semibold px-2 py-1 rounded bg-white/20 hover:bg-white/30"
          >
            Cambiar a modo real
          </button>
        )}
        
        {dismissible && (
          <button 
            onClick={() => setDismissed(true)}
            className="ml-2 p-1 rounded-full hover:bg-black/10"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Ocultar</span>
          </button>
        )}
      </div>
    </div>
  );
}