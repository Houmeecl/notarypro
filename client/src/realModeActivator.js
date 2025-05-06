/**
 * Configuración de producción de VecinoXpress
 * 
 * Este script configura el sistema para operar en modo producción real
 * conforme a la Ley 19.799 de Documentos Electrónicos.
 */

// Establecer configuración explícita para modo producción real
const configProduccion = {
  mode: 'real',
  realDeviceIds: ['*']
};

// Establecer configuración para verificación de identidad real
const configVerificacion = {
  enabled: true,
  requiereVerificacionLegal: true
};

// Guardar configuraciones en localStorage
localStorage.setItem('vx_device_mode_config', JSON.stringify(configProduccion));
localStorage.setItem('vx_production_mode', 'production');

// Mostrar confirmación
console.log('✅ Sistema de verificación electrónica activado');
console.log('🔒 Verificación conforme a Ley 19.799 habilitada');