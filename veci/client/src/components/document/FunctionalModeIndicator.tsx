import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useRealFuncionality } from '@/hooks/use-real-funcionality';

interface FunctionalModeIndicatorProps {
  compact?: boolean;
  className?: string;
}

/**
 * Componente que muestra un indicador visual del estado del modo funcional real
 * Útil para incorporar en diferentes partes de la aplicación que requieren
 * cumplimiento con la Ley 19.799
 */
export function FunctionalModeIndicator({ compact = false, className = '' }: FunctionalModeIndicatorProps) {
  const { isFunctionalMode } = useRealFuncionality(true);
  
  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {isFunctionalMode ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium text-green-800">Modo real activo</span>
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-medium text-amber-800">Modo simulación</span>
          </>
        )}
      </div>
    );
  }
  
  return (
    <div className={`rounded-md ${isFunctionalMode ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'} px-4 py-3 ${className}`}>
      <div className="flex items-center">
        {isFunctionalMode ? (
          <>
            <CheckCircle className="h-5 w-5 mr-3 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Sistema operando en modo real</p>
              <p className="text-sm text-green-700">Todos los documentos cumplen con los requisitos de la Ley 19.799 de Firma Electrónica</p>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="h-5 w-5 mr-3 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">Sistema en modo simulación</p>
              <p className="text-sm text-amber-700">Las funciones legales están disponibles en modo de prueba</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default FunctionalModeIndicator;