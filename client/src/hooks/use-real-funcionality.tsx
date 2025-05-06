import { useEffect, useState } from 'react';
import { activarFuncionalidadReal, esFuncionalidadRealActiva } from '@/lib/funcionalidad-real';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook para asegurar que todos los componentes usen funcionalidad real
 * y no simulaciones
 */
export function useRealFunctionality() {
  const { toast } = useToast();
  const [isRealMode, setIsRealMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Asegurar que estemos en modo real al cargar el componente
    if (!esFuncionalidadRealActiva()) {
      const success = activarFuncionalidadReal();
      
      if (success) {
        setIsRealMode(true);
        console.log('✅ Modo real activado desde hook useRealFunctionality');
        
        toast({
          title: 'Modo Real Activado',
          description: 'El sistema ahora opera en modo real con validez legal según Ley 19.799',
          duration: 3000,
        });
      } else {
        console.error('❌ No se pudo activar el modo real desde hook useRealFunctionality');
        
        toast({
          title: 'Error al Activar Modo Real',
          description: 'No se pudo activar el modo real. Algunas funciones pueden operar en modo simulación.',
          variant: 'destructive',
          duration: 5000,
        });
      }
    } else {
      setIsRealMode(true);
    }
    
    setIsInitialized(true);
  }, [toast]);

  // Verificar periódicamente que seguimos en modo real
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (!esFuncionalidadRealActiva()) {
        activarFuncionalidadReal();
        setIsRealMode(true);
        
        console.log('🔄 Modo real reactivado por intervalo de seguridad');
      }
    }, 30000); // Verificar cada 30 segundos
    
    return () => clearInterval(checkInterval);
  }, []);

  return { isRealMode, isInitialized };
}

export default useRealFunctionality;