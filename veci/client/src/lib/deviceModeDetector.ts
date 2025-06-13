/**
 * Detector de modo de dispositivo para VecinoXpress POS
 * 
 * Este módulo permite detectar si la aplicación está ejecutándose en modo real
 * o en modo demo, y proporciona funciones para cambiar entre modos.
 */

import { useEffect, useState } from 'react';

// Tipos de modo de dispositivo - MODO DEMO DESHABILITADO COMPLETAMENTE
export enum DeviceMode {
  REAL = 'real',
  DEMO = 'demo', // Mantenido solo para compatibilidad, pero nunca se usa
  REAL_ONLY = 'real_only', // Modo real forzado
  AUTO = 'auto' // Se comportará como real al detectarse
}

// Interfaz para la configuración del modo
export interface DeviceModeConfig {
  mode: DeviceMode;
  demoDeviceIds: string[];
  realDeviceIds: string[];
  forceDemoParameter: string;
  forceRealParameter: string;
}

// Configuración por defecto - SIEMPRE MODO REAL
const DEFAULT_CONFIG: DeviceModeConfig = {
  mode: DeviceMode.REAL, // Forzar modo real para toda la aplicación
  demoDeviceIds: [], // No hay dispositivos en modo demo
  realDeviceIds: ['*'], // Todos los dispositivos son reales
  forceDemoParameter: '', // Parámetro deshabilitado para modo demo
  forceRealParameter: 'real'
};

// Clave para almacenar la configuración en localStorage
const STORAGE_KEY = 'vx_device_mode_config';

/**
 * Hook para detectar y gestionar el modo del dispositivo
 */
export function useDeviceMode() {
  const [isDemo, setIsDemo] = useState<boolean | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<DeviceModeConfig>(DEFAULT_CONFIG);
  
  // Cargar configuración y determinar modo al montar
  useEffect(() => {
    const loadConfig = () => {
      try {
        // Crear configuración que fuerza modo real
        const realModeConfig: DeviceModeConfig = {
          mode: DeviceMode.REAL,
          demoDeviceIds: [], 
          realDeviceIds: ['*'], 
          forceDemoParameter: '',
          forceRealParameter: 'real'
        };
        
        // Guardar la configuración en localStorage para persistencia
        localStorage.setItem(STORAGE_KEY, JSON.stringify(realModeConfig));
        setConfig(realModeConfig);
        
        // Eliminar cualquier forzado de modo demo
        localStorage.removeItem('vx_force_demo');
        
        console.log('🔒 VecinoXpress configurado en modo real exclusivo (notarial)');
      } catch (e) {
        console.error('Error al establecer configuración de modo real:', e);
      }
    };
    
    const detectDeviceId = () => {
      // Obtener o generar ID de dispositivo
      let id = localStorage.getItem('vx_device_id');
      if (!id) {
        id = `pos_real_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
        localStorage.setItem('vx_device_id', id);
      }
      setDeviceId(id);
      return id;
    };
    
    // Forzar siempre modo real
    const forceRealMode = () => {
      localStorage.removeItem('vx_force_demo');
      setIsDemo(false); // Esto fuerza el modo real (isDemoMode = false)
    };
    
    // Ejecutar la secuencia completa
    loadConfig();
    detectDeviceId();
    forceRealMode();
    setIsLoading(false);
    
  }, []);
  
  // Función para forzar modo demo - DESHABILITADA, siempre devuelve modo real
  const setDemoMode = () => {
    console.warn('Intento de activar modo demo rechazado. Sistema configurado para operar solo en modo real.');
    localStorage.removeItem('vx_force_demo');
    setIsDemo(false);
  };
  
  // Función para forzar modo real
  const setRealMode = () => {
    localStorage.removeItem('vx_force_demo');
    setIsDemo(false);
  };
  
  // Función para restablecer al modo automático - FORZADO A REAL
  const resetToAutoMode = () => {
    console.log('Restableciendo a modo real (automático deshabilitado)');
    localStorage.removeItem('vx_force_demo');
    setIsDemo(false); // Siempre modo real
  };
  
  // Actualizar configuración - SIEMPRE SE MANTIENE MODO REAL
  const updateConfig = (newConfig: Partial<DeviceModeConfig>) => {
    // Forzar modo real independientemente de la configuración solicitada
    const forceRealConfig: Partial<DeviceModeConfig> = {
      ...newConfig,
      mode: DeviceMode.REAL // Asegurarse que siempre sea REAL
    };
    
    // Si alguien intenta configurar modo DEMO, mostrar advertencia
    if (newConfig.mode === DeviceMode.DEMO) {
      console.warn('⚠️ Intento de configurar modo DEMO rechazado. Sistema operando exclusivamente en modo REAL.');
    }
    
    const updatedConfig = { ...config, ...forceRealConfig };
    setConfig(updatedConfig);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
      localStorage.removeItem('vx_force_demo'); // Siempre eliminar este flag
    } catch (e) {
      console.error('Error al guardar configuración de modo:', e);
    }
    
    // En todos los casos, forzar modo real
    setIsDemo(false);
  };
  
  return {
    isDemo,
    isLoading,
    deviceId,
    config,
    setDemoMode,
    setRealMode,
    resetToAutoMode,
    updateConfig
  };
}

/**
 * Función sincrónica para verificar rápidamente si estamos en modo demo
 * Útil para componentes que no pueden usar hooks
 * 
 * NOTA: Esta función ha sido modificada para forzar el modo real en toda la aplicación.
 * Independientemente de las verificaciones, siempre devolverá false (modo real).
 */
export function checkIsDemoMode(): boolean {
  // Limpiar cualquier configuración de modo demo que pudiera existir
  if (localStorage.getItem('vx_force_demo') === 'true') {
    console.warn('Se detectó configuración de modo demo. Eliminando y forzando modo real.');
    localStorage.removeItem('vx_force_demo');
  }
  
  // Siempre devolver false para forzar modo real en toda la aplicación
  return false;
}