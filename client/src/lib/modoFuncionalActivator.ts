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
 * Activa el modo funcional REAL para sistemas de notarización
 * Este modo conecta con sistemas reales siguiendo Ley 19.799
 */
export function activarModoFuncional(): boolean {
  try {
    // Configuración explícita para modo funcional real
    const deviceModeConfig: DeviceModeConfig = {
      mode: 'real',
      demoDeviceIds: [],
      realDeviceIds: ['*'],
      forceDemoParameter: '',
      forceRealParameter: 'real',
      skipVerification: false, // No saltamos verificación en modo real
      qaMode: false, // No es modo QA sino producción
      functionalMode: true  // Modo funcional pero con verificaciones reales
    };

    // Configuración para RON real con validaciones legales
    const ronConfig: RonConfig = {
      enabled: true,
      functionalMode: true,
      skipIdentityCheck: false, // Verificaciones reales de identidad
      skipDocumentCheck: false, // Verificaciones reales de documentos
      skipSecurityQuestions: false, // Preguntas de seguridad habilitadas
      allowAllOperations: true
    };

    // Eliminar cualquier forzado de modo demo
    localStorage.removeItem('vx_force_demo');

    // Guardar configuraciones en localStorage
    localStorage.setItem('vx_device_mode_config', JSON.stringify(deviceModeConfig));
    localStorage.setItem('vx_ron_config', JSON.stringify(ronConfig));
    localStorage.setItem('vx_production_mode', 'real');
    localStorage.setItem('vx_skip_verification', 'false');
    localStorage.setItem('vx_verification_mode', 'real');
    localStorage.setItem('vx_nfc_mode', 'real');

    // Actualizar configuración remota para modo real
    const remoteConfig = localStorage.getItem('remote_config');
    if (remoteConfig) {
      try {
        const parsedConfig = JSON.parse(remoteConfig);
        if (parsedConfig.payment) {
          parsedConfig.payment.demoModeEnabled = false;
          parsedConfig.payment.functionalMode = true;
        }
        if (parsedConfig.verification) {
          parsedConfig.verification.skipVerification = false; // Verificación real
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

    console.log('✅ Modo FUNCIONAL REAL activado correctamente');
    console.log('🔒 Verificaciones y validaciones legales habilitadas según Ley 19.799');
    
    return true;
  } catch (error) {
    console.error('Error al activar modo funcional real:', error);
    return false;
  }
}

/**
 * Verifica si el modo funcional está activo
 */
export function esModoFuncionalActivo(): boolean {
  const modoProduccion = localStorage.getItem('vx_production_mode');
  // En el modo real, verificamos que sea modo real, no si se salta la verificación
  return modoProduccion === 'real' || modoProduccion === 'functional';
}

/**
 * Añade parámetros de modo real funcional a una URL
 * Añade los parámetros necesarios para que la URL funcione con sistemas reales
 */
export function obtenerUrlModoFuncional(url: string): string {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('functional', 'true');
    urlObj.searchParams.set('real', 'true');
    urlObj.searchParams.set('qa', 'false'); // No en modo de pruebas
    urlObj.searchParams.set('production', 'true'); // En producción real
    urlObj.searchParams.set('skip_verification', 'false'); // No saltar verificaciones
    urlObj.searchParams.set('verify_identity', 'true'); // Verificar identidad
    urlObj.searchParams.set('enforce_legal', 'true'); // Cumplir requisitos legales
    return urlObj.toString();
  } catch (error) {
    console.error('Error al generar URL de modo funcional real:', error);
    return url;
  }
}

// Activar modo funcional automáticamente al importar el módulo
activarModoFuncional();