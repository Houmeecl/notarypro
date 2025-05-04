/**
 * Script para activar el modo real en VecinoXpress
 * 
 * Este script limpia todas las claves de localStorage que puedan estar
 * forzando el modo demo y establece explícitamente el modo real.
 */

// Eliminar cualquier forzado de modo demo
localStorage.removeItem('vx_force_demo');

// Establecer configuración explícita para modo real
const deviceModeConfig = {
  mode: 'real', // DeviceMode.REAL
  demoDeviceIds: ['demo-pos-', 'demo-tablet-', 'demo-device-'],
  realDeviceIds: ['pos-real-', 'pos-', 'nPOS-', 'P2mini-8766wb', 'p2mini', 'sunmi', 'v2pro', 'v2', 'sunmiv2pro', 'tuu', 'TUU-POS', 'TUUPOS'],
  forceDemoParameter: 'demo',
  forceRealParameter: 'real'
};

// Guardar configuración en localStorage
localStorage.setItem('vx_device_mode_config', JSON.stringify(deviceModeConfig));

// Actualizar configuración remota para deshabilitar el modo demo
const remoteConfig = localStorage.getItem('remote_config');
if (remoteConfig) {
  try {
    const parsedConfig = JSON.parse(remoteConfig);
    if (parsedConfig.payment) {
      parsedConfig.payment.demoModeEnabled = false;
    }
    localStorage.setItem('remote_config', JSON.stringify(parsedConfig));
  } catch (e) {
    console.error('Error al actualizar la configuración remota:', e);
  }
}

// Añadir parámetro 'real' a la URL si no está presente
if (!window.location.href.includes('real=true')) {
  const url = new URL(window.location.href);
  url.searchParams.set('real', 'true');
  window.location.href = url.toString();
} else {
  console.log('✅ Modo real activado correctamente');
  
  // Esta alerta ayuda a confirmar que el script ha funcionado
  alert('¡Modo real activado! La aplicación ahora utilizará APIs y funcionalidades reales.');
}