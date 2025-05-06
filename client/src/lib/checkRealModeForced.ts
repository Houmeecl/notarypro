/**
 * Verificador de Modo Real Forzado
 * 
 * Este módulo proporciona funciones para verificar si el modo real
 * está correctamente forzado en la aplicación.
 */

import { DeviceMode } from './deviceModeDetector';

interface ConfigResult {
  isValid: boolean;
  errors: string[];
  deviceMode: string | null;
  config: any;
}

interface ForceResult {
  success: boolean;
  message: string;
}

/**
 * Verifica si el modo real está correctamente configurado y forzado
 * @returns Objeto con estado y mensajes de verificación
 */
export function verifyRealModeConfig(): ConfigResult {
  const errors: string[] = [];
  let deviceModeConfig = null;
  
  // Verificar que no exista forzado de modo demo
  if (localStorage.getItem('vx_force_demo') === 'true') {
    errors.push('Existe configuración de modo demo en localStorage');
  }
  
  // Verificar configuración guardada
  try {
    const storedConfig = localStorage.getItem('vx_device_mode_config');
    if (storedConfig) {
      deviceModeConfig = JSON.parse(storedConfig);
      
      // Verificar modo
      if (deviceModeConfig.mode !== DeviceMode.REAL) {
        errors.push(`Modo incorrecto: ${deviceModeConfig.mode}`);
      }
      
      // Verificar que no haya dispositivos demo
      if (deviceModeConfig.demoDeviceIds && deviceModeConfig.demoDeviceIds.length > 0) {
        errors.push('Existen IDs de dispositivos demo configurados');
      }
      
      // Verificar que el parámetro forzado de demo esté deshabilitado
      if (deviceModeConfig.forceDemoParameter && deviceModeConfig.forceDemoParameter.length > 0) {
        errors.push('Parámetro de URL para forzar demo está habilitado');
      }
    } else {
      errors.push('No existe configuración de modo en localStorage');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    errors.push(`Error al verificar configuración: ${errorMessage}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    deviceMode: deviceModeConfig?.mode || null,
    config: deviceModeConfig
  };
}

/**
 * Limpia cualquier configuración incorrecta y establece el modo real forzado
 * @returns Resultado de la operación
 */
export function forceRealModeConfig(): ForceResult {
  try {
    // Eliminar cualquier forzado de modo demo
    localStorage.removeItem('vx_force_demo');
    
    // Establecer configuración explícita para modo real
    const deviceModeConfig = {
      mode: DeviceMode.REAL,
      demoDeviceIds: [],
      realDeviceIds: ['*'],
      forceDemoParameter: '',
      forceRealParameter: 'real'
    };

    // Guardar configuración en localStorage
    localStorage.setItem('vx_device_mode_config', JSON.stringify(deviceModeConfig));
    
    return {
      success: true,
      message: 'Modo real forzado configurado correctamente'
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return {
      success: false,
      message: `Error al configurar modo real: ${errorMessage}`
    };
  }
}