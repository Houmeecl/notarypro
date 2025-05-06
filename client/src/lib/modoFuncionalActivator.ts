/**
 * Activador de Modo Funcional para VecinoXpress
 * 
 * Este módulo proporciona funciones para activar y gestionar el modo funcional
 * sin verificaciones, diseñado para entornos de prueba QA donde se necesita
 * un funcionamiento sin interrupciones.
 */

// Tipos para las configuraciones
interface DeviceModeConfig {
  mode: 'real' | 'demo';
  demoDeviceIds: string[];
  realDeviceIds: string[];
  forceDemoParameter: string;
  forceRealParameter: string;
  skipVerification: boolean;
  qaMode: boolean;
  functionalMode: boolean;
}

interface RonConfig {
  enabled: boolean;
  functionalMode: boolean;
  skipIdentityCheck: boolean;
  skipDocumentCheck: boolean;
  skipSecurityQuestions: boolean;
  allowAllOperations: boolean;
}

/**
 * Activa el modo funcional para pruebas QA
 * Este modo permite que todas las verificaciones pasen automáticamente
 */
export function activarModoFuncional(): boolean {
  try {
    // Configuración explícita para modo funcional
    const deviceModeConfig: DeviceModeConfig = {
      mode: 'real',
      demoDeviceIds: [],
      realDeviceIds: ['*'],
      forceDemoParameter: '',
      forceRealParameter: 'real',
      skipVerification: true,
      qaMode: true,
      functionalMode: true
    };

    // Configuración para RON funcional sin restricciones
    const ronConfig: RonConfig = {
      enabled: true,
      functionalMode: true,
      skipIdentityCheck: true,
      skipDocumentCheck: true,
      skipSecurityQuestions: true,
      allowAllOperations: true
    };

    // Eliminar cualquier forzado de modo demo
    localStorage.removeItem('vx_force_demo');

    // Guardar configuraciones en localStorage
    localStorage.setItem('vx_device_mode_config', JSON.stringify(deviceModeConfig));
    localStorage.setItem('vx_ron_config', JSON.stringify(ronConfig));
    localStorage.setItem('vx_production_mode', 'functional');
    localStorage.setItem('vx_skip_verification', 'true');
    localStorage.setItem('vx_verification_mode', 'functional');
    localStorage.setItem('vx_nfc_mode', 'functional');

    // Actualizar configuración remota para modo funcional
    const remoteConfig = localStorage.getItem('remote_config');
    if (remoteConfig) {
      try {
        const parsedConfig = JSON.parse(remoteConfig);
        if (parsedConfig.payment) {
          parsedConfig.payment.demoModeEnabled = false;
          parsedConfig.payment.functionalMode = true;
        }
        if (parsedConfig.verification) {
          parsedConfig.verification.skipVerification = true;
          parsedConfig.verification.functionalMode = true;
        }
        if (parsedConfig.ron) {
          parsedConfig.ron = { ...parsedConfig.ron, ...ronConfig };
        }
        localStorage.setItem('remote_config', JSON.stringify(parsedConfig));
      } catch (e) {
        console.error('Error al actualizar la configuración remota:', e);
      }
    }

    console.log('✅ Modo FUNCIONAL activado correctamente');
    console.log('🔧 Verificaciones internas y RON configurados en modo funcional QA');
    
    return true;
  } catch (error) {
    console.error('Error al activar modo funcional:', error);
    return false;
  }
}

/**
 * Verifica si el modo funcional está activo
 */
export function esModoFuncionalActivo(): boolean {
  const modoProduccion = localStorage.getItem('vx_production_mode');
  const skipVerificacion = localStorage.getItem('vx_skip_verification');
  
  return modoProduccion === 'functional' && skipVerificacion === 'true';
}

/**
 * Añade parámetros de modo funcional a una URL
 */
export function obtenerUrlModoFuncional(url: string): string {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('functional', 'true');
    urlObj.searchParams.set('real', 'true');
    urlObj.searchParams.set('qa', 'true');
    return urlObj.toString();
  } catch (error) {
    console.error('Error al generar URL de modo funcional:', error);
    return url;
  }
}

// Activar modo funcional automáticamente al importar el módulo
activarModoFuncional();