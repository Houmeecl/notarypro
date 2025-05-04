/**
 * Detector de modo de dispositivo para VecinoXpress POS
 * 
 * Este módulo permite detectar si la aplicación está ejecutándose en modo real
 * o en modo demo, y proporciona funciones para cambiar entre modos.
 */

import { useEffect, useState } from 'react';

// Tipos de modo de dispositivo
export enum DeviceMode {
  REAL = 'real',
  DEMO = 'demo',
  AUTO = 'auto'
}

// Interfaz para la configuración del modo
export interface DeviceModeConfig {
  mode: DeviceMode;
  demoDeviceIds: string[];
  realDeviceIds: string[];
  forceDemoParameter: string;
  forceRealParameter: string;
}

// Configuración por defecto
const DEFAULT_CONFIG: DeviceModeConfig = {
  mode: DeviceMode.REAL, // Forzar modo real para toda la aplicación
  demoDeviceIds: ['demo-pos-', 'demo-tablet-', 'demo-device-'],
  realDeviceIds: ['pos-real-', 'pos-', 'nPOS-', 'P2mini-8766wb', 'p2mini', 'sunmi', 'v2pro', 'v2', 'sunmiv2pro', 'tuu', 'TUU-POS', 'TUUPOS'],
  forceDemoParameter: 'demo',
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
        const storedConfig = localStorage.getItem(STORAGE_KEY);
        if (storedConfig) {
          const parsedConfig = JSON.parse(storedConfig);
          setConfig(parsedConfig);
        }
      } catch (e) {
        console.error('Error al cargar configuración de modo:', e);
      }
    };
    
    const detectDeviceId = () => {
      // Obtener o generar ID de dispositivo
      let id = localStorage.getItem('vx_device_id');
      if (!id) {
        id = `pos_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
        localStorage.setItem('vx_device_id', id);
      }
      setDeviceId(id);
      return id;
    };
    
    const determineMode = (deviceId: string, config: DeviceModeConfig) => {
      // Verificar parámetros de URL
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has(config.forceDemoParameter)) {
        setIsDemo(true);
        localStorage.setItem('vx_force_demo', 'true');
        return;
      }
      
      if (urlParams.has(config.forceRealParameter)) {
        setIsDemo(false);
        localStorage.removeItem('vx_force_demo');
        return;
      }
      
      // Verificar modo forzado en localStorage
      if (localStorage.getItem('vx_force_demo') === 'true') {
        setIsDemo(true);
        return;
      }
      
      // Si el modo es explícito en la configuración
      if (config.mode !== DeviceMode.AUTO) {
        setIsDemo(config.mode === DeviceMode.DEMO);
        return;
      }
      
      // Verificar User-Agent para modelo específico de POS
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Verificar específicamente si es un P2mini-8766wb o Android 9
      const isP2mini = userAgent.includes('p2mini') || 
                      userAgent.includes('8766wb') || 
                      userAgent.includes('android 9');
                      
      // Verificar específicamente si es un Sunmi V2 Pro
      const isSunmi = userAgent.includes('sunmi') || 
                     userAgent.includes('v2 pro') || 
                     userAgent.includes('v2pro') ||
                     userAgent.includes('sm-');
                     
      // Verificar si es un POS TUU
      const isTuu = userAgent.includes('tuu') ||
                   userAgent.includes('TUU') ||
                   userAgent.includes('t2');
      
      if (isP2mini || isSunmi || isTuu) {
        console.log('Detectado dispositivo POS real:', 
          isP2mini ? 'P2mini' : 
          isSunmi ? 'Sunmi V2 Pro' : 
          'TUU POS');
        setIsDemo(false);  // Este es un dispositivo real
        return;
      }
      
      // Modo AUTO - detectar por ID de dispositivo
      const isDemoDevice = config.demoDeviceIds.some(prefix => deviceId.startsWith(prefix));
      const isRealDevice = config.realDeviceIds.some(prefix => deviceId.startsWith(prefix));
      
      if (isDemoDevice) {
        setIsDemo(true);
      } else if (isRealDevice) {
        setIsDemo(false);
      } else {
        // Si no podemos determinar por ID, verificar si estamos en un emulador/simulador/desktop
        // Esta es una heurística simple, podría mejorarse
        const isEmulator = userAgent.includes('emulator') || 
                          userAgent.includes('android studio') ||
                          userAgent.includes('sdk') ||
                          userAgent.includes('virtual') ||
                          window.innerWidth > 1000; // Probablemente desktop
        
        setIsDemo(isEmulator);
      }
    };
    
    loadConfig();
    const id = detectDeviceId();
    determineMode(id, config);
    setIsLoading(false);
    
  }, []);
  
  // Función para forzar modo demo
  const setDemoMode = () => {
    localStorage.setItem('vx_force_demo', 'true');
    setIsDemo(true);
  };
  
  // Función para forzar modo real
  const setRealMode = () => {
    localStorage.removeItem('vx_force_demo');
    setIsDemo(false);
  };
  
  // Función para restablecer al modo automático
  const resetToAutoMode = () => {
    localStorage.removeItem('vx_force_demo');
    
    // Re-detectar modo basado en ID
    if (deviceId) {
      const isDemoDevice = config.demoDeviceIds.some(prefix => deviceId.startsWith(prefix));
      const isRealDevice = config.realDeviceIds.some(prefix => deviceId.startsWith(prefix));
      
      if (isDemoDevice) {
        setIsDemo(true);
      } else if (isRealDevice) {
        setIsDemo(false);
      } else {
        // Usar heurística simple para desktop/emulador
        const isEmulator = window.innerWidth > 1000;
        setIsDemo(isEmulator);
      }
    }
  };
  
  // Actualizar configuración
  const updateConfig = (newConfig: Partial<DeviceModeConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
    } catch (e) {
      console.error('Error al guardar configuración de modo:', e);
    }
    
    // Re-evaluar modo si es necesario
    if (newConfig.mode !== undefined || newConfig.demoDeviceIds || newConfig.realDeviceIds) {
      if (deviceId) {
        if (updatedConfig.mode !== DeviceMode.AUTO) {
          setIsDemo(updatedConfig.mode === DeviceMode.DEMO);
        } else if (localStorage.getItem('vx_force_demo') !== 'true') {
          // Solo re-detectar si no está forzado
          const isDemoDevice = updatedConfig.demoDeviceIds.some(prefix => deviceId.startsWith(prefix));
          const isRealDevice = updatedConfig.realDeviceIds.some(prefix => deviceId.startsWith(prefix));
          
          if (isDemoDevice) {
            setIsDemo(true);
          } else if (isRealDevice) {
            setIsDemo(false);
          }
        }
      }
    }
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
 */
export function checkIsDemoMode(): boolean {
  // Verificar override en localStorage
  if (localStorage.getItem('vx_force_demo') === 'true') {
    return true;
  }
  
  // Verificar parámetros de URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('demo')) {
    return true;
  }
  
  // Verificar User-Agent para modelo específico de POS
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Verificar específicamente si es un P2mini-8766wb o Android 9
  const isP2mini = userAgent.includes('p2mini') || 
                    userAgent.includes('8766wb') || 
                    userAgent.includes('android 9');
                    
  // Verificar específicamente si es un Sunmi V2 Pro
  const isSunmi = userAgent.includes('sunmi') || 
                 userAgent.includes('v2 pro') || 
                 userAgent.includes('v2pro') ||
                 userAgent.includes('sm-');
                 
  // Verificar si es un POS TUU
  const isTuu = userAgent.includes('tuu') ||
               userAgent.includes('TUU') ||
               userAgent.includes('t2');
                    
  if (isP2mini || isSunmi || isTuu) {
    console.log('Detector sincrónico: Encontrado dispositivo POS real:', 
      isP2mini ? 'P2mini' : 
      isSunmi ? 'Sunmi V2 Pro' : 
      'TUU POS');
    return false;  // Este es un dispositivo real
  }
  
  // Cargar configuración
  let config = DEFAULT_CONFIG;
  try {
    const storedConfig = localStorage.getItem(STORAGE_KEY);
    if (storedConfig) {
      config = JSON.parse(storedConfig);
    }
  } catch (e) {
    // Si hay error, usar configuración por defecto
  }
  
  // Si modo explícito
  if (config.mode !== DeviceMode.AUTO) {
    return config.mode === DeviceMode.DEMO;
  }
  
  // Verificar ID de dispositivo
  const deviceId = localStorage.getItem('vx_device_id');
  if (deviceId) {
    const isDemoDevice = config.demoDeviceIds.some(prefix => deviceId.startsWith(prefix));
    if (isDemoDevice) {
      return true;
    }
    
    const isRealDevice = config.realDeviceIds.some(prefix => deviceId.startsWith(prefix));
    if (isRealDevice) {
      return false;
    }
  }
  
  // Heurística simple como último recurso
  return window.innerWidth > 1000; // Probablemente desktop/emulador
}