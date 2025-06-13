import { useState, useEffect } from 'react';
import { esFuncionalidadRealActiva, activarFuncionalidadReal } from '@/lib/funcionalidad-real';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook personalizado para gestionar la funcionalidad real en componentes.
 * 
 * Este hook permite acceder al estado de funcionalidad real y activarla si es necesario.
 * También proporciona un mensaje de alerta si la funcionalidad real no está activada.
 * 
 * @param {boolean} activarAlInicio - Si es true, activa automáticamente la funcionalidad real al montar el componente
 * @param {boolean} mostrarAlerta - Si es true, muestra una alerta cuando la funcionalidad real no está activada
 * @returns {Object} - Objeto con propiedades y métodos para gestionar la funcionalidad real
 */
export function useRealFuncionality(
  activarAlInicio: boolean = false, 
  mostrarAlerta: boolean = true
) {
  const { toast } = useToast();
  const [isFunctionalMode, setIsFunctionalMode] = useState(esFuncionalidadRealActiva());

  useEffect(() => {
    // Verificar estado inicial
    const estadoActual = esFuncionalidadRealActiva();
    setIsFunctionalMode(estadoActual);

    // Si se debe activar al inicio y no está activo
    if (activarAlInicio && !estadoActual) {
      const resultado = activarFuncionalidadReal();
      setIsFunctionalMode(resultado);

      if (resultado) {
        toast({
          title: "Modo real activado",
          description: "La funcionalidad real ha sido activada. Todas las verificaciones y procesos son reales.",
          duration: 3000,
        });
      }
    } 
    // Mostrar alerta si está desactivado y se debe mostrar
    else if (!estadoActual && mostrarAlerta) {
      toast({
        title: "⚠️ Modo simulación",
        description: "El sistema está en modo simulación. Algunas funciones no tendrán validez legal.",
        duration: 5000,
        variant: "destructive"
      });
    }
  }, [activarAlInicio, mostrarAlerta, toast]);

  // Función para activar la funcionalidad real desde el componente
  const activarModoReal = () => {
    const resultado = activarFuncionalidadReal();
    setIsFunctionalMode(resultado);
    
    if (resultado) {
      toast({
        title: "Modo real activado",
        description: "La funcionalidad real ha sido activada correctamente.",
        duration: 3000,
      });
      return true;
    } else {
      toast({
        title: "Error de activación",
        description: "No se pudo activar la funcionalidad real.",
        duration: 3000,
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    isFunctionalMode,   // Estado de la funcionalidad real
    activarModoReal,    // Función para activar la funcionalidad real
  };
}