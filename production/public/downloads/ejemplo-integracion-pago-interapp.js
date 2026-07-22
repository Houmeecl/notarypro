/**
 * ================================================================
 * EJEMPLO DE INTEGRACIÓN DE PAGO INTER-APP CON VECINOS SDK v1.3.1
 * ================================================================
 * 
 * Este ejemplo muestra cómo implementar la integración con
 * aplicaciones de pago externas en el SDK Vecinos NotaryPro v1.3.1
 * 
 * Para más información, consulta la documentación oficial:
 * https://developers.tuu.cl/docs/integración-de-aplicaciones-de-pago-inter-app
 */

// Inicializa el punto de servicio con la API key
const pos = new VecinosPOS({
  id: "LOCAL-XP123",
  nombre: "Mi Tienda Vecinos",
  direccion: "Av. Principal 123",
  region: "Metropolitana",
  comuna: "Santiago",
  apiKey: "J7GwlMX4gMhqXDfkugL4VmDRnazq5hzo1n3FTuRakdZeqT8I45gxgMhItyXUKZvuInFU1YPtiAG4qL4RUoyz6WqunW2iBMDikimIJrIa6hlEpYqxPWh3ZRGdvH2Iru"
});

/**
 * Función para procesar un pago con integración inter-app
 * @param {number} monto - Monto a cobrar
 * @param {string} concepto - Descripción del pago
 * @returns {Promise<Object>} Resultado del pago
 */
async function procesarPagoInterApp(monto, concepto) {
  try {
    // 1. Preparamos la información del pago
    const datosPago = {
      monto: monto,
      concepto: concepto,
      terminal_id: pos.config.id,
      comercio: pos.config.nombre,
      timestamp: new Date().toISOString(),
      api_key: pos.config.apiKey
    };

    // 2. Generamos un ID único para la transacción
    const transaccionId = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // 3. Almacenamos temporalmente la información de la transacción
    localStorage.setItem(`pago_${transaccionId}`, JSON.stringify(datosPago));
    
    // 4. Preparamos la URL para la aplicación de pago externa
    // Formato: tuupay://procesar-pago?tx_id=XXXX&monto=XXXX&comercio=XXXX
    const urlApp = `tuupay://procesar-pago?tx_id=${transaccionId}&monto=${monto}&comercio=${encodeURIComponent(pos.config.nombre)}`;
    
    // 5. Verificamos si la aplicación está instalada o redirigimos a la web
    if (verificarAppInstalada('tuupay')) {
      // 5.1 Abrimos la aplicación de pago
      window.location.href = urlApp;
    } else {
      // 5.2 Redirigimos a la versión web
      window.open(`https://pago.tuu.cl/webpay?tx_id=${transaccionId}&monto=${monto}&comercio=${encodeURIComponent(pos.config.nombre)}`, '_blank');
    }
    
    // 6. Configuramos el listener para recibir la respuesta
    window.addEventListener('message', procesarRespuestaPago);
    
    // 7. Devolvemos el ID de transacción para seguimiento
    return {
      transaccionId,
      estado: 'iniciado',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error al procesar pago inter-app:', error);
    return {
      estado: 'error',
      mensaje: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Función para verificar si una aplicación está instalada
 * @param {string} appId - Identificador de la aplicación
 * @returns {boolean} true si la app está instalada, false en caso contrario
 */
function verificarAppInstalada(appId) {
  // En un entorno real, esto dependerá del sistema operativo
  // y del soporte del navegador para detectar aplicaciones.
  
  // Para Android, podemos intentar abrir la URL y capturar si falla
  try {
    // Método simplificado para el ejemplo
    // En una implementación real, esto sería más complejo
    const estaInstalada = localStorage.getItem(`app_${appId}_instalada`);
    
    // Si no tenemos información, asumimos que está instalada
    // y actualizaremos esta información cuando el usuario intente abrir la app
    if (estaInstalada === null) {
      return true;
    }
    
    return estaInstalada === 'true';
  } catch (error) {
    console.error('Error al verificar app instalada:', error);
    return false;
  }
}

/**
 * Procesa la respuesta del pago desde la app externa
 * @param {Event} event - Evento de mensaje
 */
function procesarRespuestaPago(event) {
  // Verificamos el origen del mensaje
  if (event.origin !== 'https://pago.tuu.cl' && 
      event.origin !== 'tuupay://') {
    return; // Ignoramos mensajes de orígenes no confiables
  }
  
  const respuesta = event.data;
  
  // Verificamos que es una respuesta de pago válida
  if (!respuesta || !respuesta.transaccionId || !respuesta.estado) {
    console.error('Respuesta de pago inválida');
    return;
  }
  
  // Recuperamos la información de la transacción
  const datosPagoGuardados = localStorage.getItem(`pago_${respuesta.transaccionId}`);
  if (!datosPagoGuardados) {
    console.error('Transacción no encontrada:', respuesta.transaccionId);
    return;
  }
  
  const datosPago = JSON.parse(datosPagoGuardados);
  
  // Completamos la transacción según el estado
  if (respuesta.estado === 'aprobado') {
    // Notificamos éxito al servidor
    notificarPagoCompletado(respuesta.transaccionId, datosPago, respuesta);
  } else {
    // Manejo de error o rechazo
    console.error('Pago rechazado o cancelado:', respuesta.mensaje || 'Sin detalles');
    
    // Notificamos al usuario
    mostrarNotificacion('Pago no completado', respuesta.mensaje || 'El pago no pudo ser procesado');
  }
  
  // Eliminamos el listener para evitar duplicados
  window.removeEventListener('message', procesarRespuestaPago);
}

/**
 * Notifica al servidor sobre un pago completado
 * @param {string} transaccionId - ID de la transacción
 * @param {Object} datosPago - Datos originales del pago
 * @param {Object} respuesta - Respuesta de la app de pago
 */
async function notificarPagoCompletado(transaccionId, datosPago, respuesta) {
  try {
    // Enviamos la información completa al servidor
    const respuestaServidor = await fetch(`${pos.apiUrl}/api/pagos/confirmar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': pos.config.apiKey
      },
      body: JSON.stringify({
        transaccionId: transaccionId,
        comercio: datosPago.comercio,
        terminal_id: datosPago.terminal_id,
        monto: datosPago.monto,
        concepto: datosPago.concepto,
        timestamp_inicio: datosPago.timestamp,
        timestamp_fin: new Date().toISOString(),
        respuesta_pago: {
          autorizacion: respuesta.autorizacion,
          estado: respuesta.estado,
          medio_pago: respuesta.medioPago,
          ultimos_digitos: respuesta.ultimosDigitos
        }
      })
    });
    
    if (respuestaServidor.ok) {
      console.log('✅ Pago notificado correctamente al servidor');
      mostrarNotificacion('Pago completado', 
        `Pago de $${datosPago.monto.toLocaleString('es-CL')} procesado correctamente`);
    } else {
      console.error('Error al notificar pago al servidor:', await respuestaServidor.text());
    }
    
    // Limpiamos los datos temporales
    localStorage.removeItem(`pago_${transaccionId}`);
    
  } catch (error) {
    console.error('Error al notificar pago completado:', error);
    mostrarNotificacion('Error en el proceso', 
      'El pago se procesó correctamente, pero hubo un error al registrarlo. Por favor, contacte a soporte.');
  }
}

/**
 * Muestra una notificación al usuario
 * @param {string} titulo - Título de la notificación
 * @param {string} mensaje - Mensaje a mostrar
 */
function mostrarNotificacion(titulo, mensaje) {
  // Implementación básica - en una app real esto mostraría un modal o alerta nativa
  console.log(`📣 ${titulo}: ${mensaje}`);
  
  // Si estamos en un entorno que soporta notificaciones del navegador
  if ('Notification' in window) {
    // Solicitamos permiso
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(titulo, { body: mensaje });
      }
    });
  }
  
  // Alternativa para entornos sin soporte de notificaciones
  alert(`${titulo}\n${mensaje}`);
}

// Ejemplo de uso:
// procesarPagoInterApp(15000, 'Certificación de documento')
//   .then(resultado => console.log('Transacción iniciada:', resultado))
//   .catch(error => console.error('Error al iniciar transacción:', error));