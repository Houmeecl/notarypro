/**
 * Script para activar el modo FUNCIONAL en VecinoXpress
 * 
 * Este script configura el sistema para operar en modo real pero
 * sin verificaciones estrictas, permitiendo pruebas QA funcionales
 * sin restricciones de validación.
 */

// Eliminar cualquier forzado de modo demo
localStorage.removeItem('vx_force_demo');

// Establecer configuración explícita para modo funcional
const deviceModeConfig = {
  mode: 'real', // DeviceMode.REAL
  demoDeviceIds: [],
  realDeviceIds: ['*'], // Todo es real
  forceDemoParameter: '',
  forceRealParameter: 'real',
  skipVerification: true, // Saltar verificaciones en modo funcional
  qaMode: true, // Habilitar modo QA para pruebas
  functionalMode: true // Nuevo modo funcional
};

// Establecer configuración para RON funcional sin restricciones
const ronConfig = {
  enabled: true,
  functionalMode: true,
  skipIdentityCheck: true,
  skipDocumentCheck: true,
  skipSecurityQuestions: true,
  allowAllOperations: true
};

// Guardar configuraciones en localStorage
localStorage.setItem('vx_device_mode_config', JSON.stringify(deviceModeConfig));
localStorage.setItem('vx_ron_config', JSON.stringify(ronConfig));
localStorage.setItem('vx_production_mode', 'functional');
localStorage.setItem('vx_skip_verification', 'true');

// Configuración funcional para verificación interna
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

// Añadir parámetro 'functional' a la URL si no está presente
if (!window.location.href.includes('functional=true')) {
  const url = new URL(window.location.href);
  url.searchParams.set('functional', 'true');
  url.searchParams.set('real', 'true');
  url.searchParams.set('qa', 'true');
  window.location.href = url.toString();
} else {
  console.log('✅ Modo FUNCIONAL activado correctamente');
  console.log('🔧 Verificaciones internas y RON configurados en modo funcional QA');
  
  // Esta alerta ayuda a confirmar que el script ha funcionado
  alert('¡Modo FUNCIONAL activado! La aplicación funcionará sin restricciones de verificación para pruebas QA.');
}