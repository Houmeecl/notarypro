/**
 * Sistema de configuración remota para VecinoXpress POS
 * 
 * Este módulo permite actualizar la configuración de la aplicación de forma remota,
 * lo que permite corregir errores o ajustar el comportamiento sin necesidad de
 * actualizar la APK completa.
 */

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

// Tipos de configuración
export interface RemoteConfig {
  // Configuración del modo de pago
  payment: {
    // Habilitar/deshabilitar el modo de demostración por defecto
    demoModeEnabled: boolean;
    // Número de reintentos automáticos para transacciones
    maxRetries: number;
    // Tiempo de espera para reintentos (ms)
    retryTimeout: number;
    // URL alternativa para API de pagos (si la principal falla)
    fallbackApiUrl?: string;
  };
  
  // Configuración de NFC
  nfc: {
    // Habilitar/deshabilitar la lectura de NFC
    enabled: boolean;
    // Tiempo máximo para lectura (segundos)
    timeout: number;
    // Reintentos máximos para lectura NFC fallida
    maxRetries: number;
    // Utilizar API NFC alternativa si la principal falla
    useFallbackApi: boolean;
  };
  
  // Configuración de cámara
  camera: {
    // Resolución preferida (baja, media, alta)
    preferredResolution: 'low' | 'medium' | 'high';
    // Habilitar flash por defecto
    enableFlash: boolean;
    // Usar cámara trasera por defecto
    useBackCamera: boolean;
    // Tiempo máximo de escaneo (segundos)
    scanTimeout: number;
  };
  
  // Configuración de red
  network: {
    // Tiempo máximo para solicitudes HTTP (ms)
    requestTimeout: number;
    // Número de reintentos automáticos
    maxRetries: number;
    // Intervalo entre reintentos (ms)
    retryInterval: number;
    // Almacenar en caché solicitudes fallidas para reintento posterior
    cacheFailedRequests: boolean;
  };
  
  // Configuración de diagnóstico y registro
  debugging: {
    // Nivel de registro: 0 (ninguno), 1 (solo errores), 2 (advertencias), 3 (todo)
    logLevel: 0 | 1 | 2 | 3;
    // Enviar registros automáticamente
    autoSendLogs: boolean;
    // Intervalo para envío de registros (ms)
    logSendInterval: number;
    // Mostrar herramientas de diagnóstico en la interfaz
    showDebugTools: boolean;
  };
  
  // Actualizaciones
  updates: {
    // Buscar actualizaciones automáticamente
    checkAutomatically: boolean;
    // Intervalo de comprobación (ms)
    checkInterval: number;
    // Descargar actualizaciones automáticamente
    downloadAutomatically: boolean;
    // URL del servidor de actualizaciones
    updateServerUrl?: string;
  };
  
  // Configuración específica por región
  regional: {
    // Código de región (CL, PE, CO, etc.)
    regionCode: string;
    // Formato de fecha preferido
    dateFormat: string;
    // Formato de moneda
    currencyFormat: string;
  };
}

// Configuración predeterminada
const defaultConfig: RemoteConfig = {
  payment: {
    demoModeEnabled: false, // Modo real activado
    maxRetries: 3,
    retryTimeout: 5000
  },
  nfc: {
    enabled: true,
    timeout: 30,
    maxRetries: 3,
    useFallbackApi: false
  },
  camera: {
    preferredResolution: 'medium',
    enableFlash: false,
    useBackCamera: true,
    scanTimeout: 60
  },
  network: {
    requestTimeout: 10000,
    maxRetries: 3,
    retryInterval: 2000,
    cacheFailedRequests: true
  },
  debugging: {
    logLevel: 1,
    autoSendLogs: true,
    logSendInterval: 3600000, // 1 hora
    showDebugTools: false
  },
  updates: {
    checkAutomatically: true,
    checkInterval: 86400000, // 24 horas
    downloadAutomatically: false
  },
  regional: {
    regionCode: 'CL',
    dateFormat: 'DD/MM/YYYY',
    currencyFormat: '$ #.###'
  }
};

// Hook para acceder a la configuración remota
export function useRemoteConfig() {
  const [config, setConfig] = useState<RemoteConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchConfig = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Intentar cargar configuración desde localStorage primero
      const cachedConfig = localStorage.getItem('remote_config');
      const cachedTimestamp = localStorage.getItem('remote_config_timestamp');
      
      // Usar configuración en caché si existe y no es demasiado antigua (menos de 1 hora)
      if (cachedConfig && cachedTimestamp) {
        const timestamp = new Date(cachedTimestamp);
        const now = new Date();
        const hoursSinceUpdate = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceUpdate < 1) {
          const parsedConfig = JSON.parse(cachedConfig);
          setConfig(parsedConfig);
          setLastUpdated(timestamp);
          setIsLoading(false);
          
          // Actualizar en segundo plano
          fetchFromServer();
          return;
        }
      }
      
      // Si no hay caché o está desactualizada, cargar desde el servidor
      await fetchFromServer();
    } catch (err: any) {
      console.error('Error al cargar configuración remota:', err);
      
      // Si hay un error, intentar usar caché sin importar su edad
      const cachedConfig = localStorage.getItem('remote_config');
      if (cachedConfig) {
        try {
          const parsedConfig = JSON.parse(cachedConfig);
          setConfig(parsedConfig);
          const cachedTimestamp = localStorage.getItem('remote_config_timestamp');
          setLastUpdated(cachedTimestamp ? new Date(cachedTimestamp) : null);
        } catch (cacheError) {
          // Si no se puede usar la caché, usar valores predeterminados
          setConfig(defaultConfig);
          setError(new Error(`Error de configuración: ${err.message}`));
        }
      } else {
        // Si no hay caché, usar valores predeterminados
        setConfig(defaultConfig);
        setError(new Error(`Error de configuración: ${err.message}`));
      }
      
      setIsLoading(false);
    }
  };
  
  const fetchFromServer = async () => {
    try {
      const response = await apiRequest('GET', '/api/pos-config');
      
      if (!response.ok) {
        throw new Error('Error al obtener configuración del servidor');
      }
      
      const data = await response.json();
      
      // Combinar con valores predeterminados para asegurar que todos los campos existan
      const mergedConfig = {
        ...defaultConfig,
        ...data
      };
      
      // Actualizar estado
      setConfig(mergedConfig);
      const now = new Date();
      setLastUpdated(now);
      
      // Guardar en localStorage
      localStorage.setItem('remote_config', JSON.stringify(mergedConfig));
      localStorage.setItem('remote_config_timestamp', now.toISOString());
      
      setIsLoading(false);
    } catch (err: any) {
      // El error se maneja en la función padre (fetchConfig)
      throw err;
    }
  };
  
  // Cargar configuración al montar el componente
  useEffect(() => {
    fetchConfig();
    
    // Actualizar cada hora
    const interval = setInterval(() => {
      fetchConfig();
    }, 3600000); // 1 hora
    
    return () => clearInterval(interval);
  }, []);
  
  return {
    config,
    isLoading,
    error,
    lastUpdated,
    refresh: fetchConfig
  };
}

// Función para obtener un valor específico de la configuración (para uso fuera de componentes React)
let cachedConfig: RemoteConfig | null = null;

export async function getRemoteConfigValue<T>(path: string): Promise<T> {
  // Cargar de caché primero
  if (!cachedConfig) {
    const stored = localStorage.getItem('remote_config');
    if (stored) {
      try {
        cachedConfig = JSON.parse(stored);
      } catch (e) {
        cachedConfig = defaultConfig;
      }
    } else {
      cachedConfig = defaultConfig;
    }
  }
  
  // Navegar por el path para obtener el valor específico
  const parts = path.split('.');
  let value: any = cachedConfig;
  
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      // Si no existe la propiedad, intentar obtener del valor predeterminado
      value = getDefaultValue(path);
      break;
    }
  }
  
  return value as T;
}

// Obtener valor predeterminado por path
function getDefaultValue(path: string): any {
  const parts = path.split('.');
  let value: any = defaultConfig;
  
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return undefined;
    }
  }
  
  return value;
}

// Exportar la configuración predeterminada para referencia
export { defaultConfig };