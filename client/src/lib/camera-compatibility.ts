/**
 * Utilidad para mejorar la compatibilidad de la cámara con diferentes navegadores
 * 
 * Este módulo ayuda a solucionar problemas comunes de acceso a cámara en diferentes 
 * navegadores y dispositivos, especialmente en el contexto de sesiones RON.
 */

export interface CameraConfig {
  video?: boolean | MediaTrackConstraints;
  audio?: boolean | MediaTrackConstraints;
  preferredCameraId?: string;
  preferredMicrophoneId?: string;
  timeout?: number; // En milisegundos
  retries?: number;
}

export interface DeviceInfo {
  videoDevices: MediaDeviceInfo[];
  audioDevices: MediaDeviceInfo[];
  hasCamera: boolean;
  hasMicrophone: boolean;
  browserSupport: 'full' | 'partial' | 'none';
}

/**
 * Detecta dispositivos disponibles y su compatibilidad
 */
export async function detectDevices(): Promise<DeviceInfo> {
  try {
    // Verificar soporte para API de MediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return {
        videoDevices: [],
        audioDevices: [],
        hasCamera: false,
        hasMicrophone: false,
        browserSupport: 'none'
      };
    }

    // Primero solicitamos permisos temporales para enumerar correctamente
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    } catch (err) {
      console.log("Permiso parcial o denegado para enumerar dispositivos");
    }

    // Obtenemos la lista de dispositivos
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    const audioDevices = devices.filter(device => device.kind === 'audioinput');
    
    return {
      videoDevices,
      audioDevices,
      hasCamera: videoDevices.length > 0,
      hasMicrophone: audioDevices.length > 0,
      browserSupport: 'full'
    };
  } catch (error) {
    console.error("Error al detectar dispositivos:", error);
    return {
      videoDevices: [],
      audioDevices: [],
      hasCamera: false,
      hasMicrophone: false,
      browserSupport: 'none'
    };
  }
}

/**
 * Intenta acceder a la cámara con múltiples estrategias para aumentar compatibilidad
 */
export async function accessCamera(config: CameraConfig = {}): Promise<MediaStream> {
  const timeout = config.timeout || 10000; // 10 segundos por defecto
  const maxRetries = config.retries || 3;
  
  let error = null;
  let retryCount = 0;
  
  // Lista de configuraciones a intentar, en orden de preferencia
  const strategies = [
    // 1. Intento con configuración exacta solicitada
    { video: config.video || true, audio: config.audio || false },
    
    // 2. Intento solo con video básico (sin restricciones)
    { video: true, audio: config.audio || false },
    
    // 3. Intento con configuración de menor calidad
    { 
      video: { 
        width: { ideal: 640 }, 
        height: { ideal: 480 },
        frameRate: { max: 15 } 
      }, 
      audio: config.audio || false 
    },
    
    // 4. Intento con cámara frontal explícita (para móviles)
    { 
      video: { facingMode: "user" }, 
      audio: config.audio || false 
    },
    
    // 5. Último intento con configuración mínima
    { 
      video: { 
        width: { ideal: 320 }, 
        height: { ideal: 240 } 
      }, 
      audio: config.audio || false 
    }
  ];
  
  while (retryCount < maxRetries) {
    // Determinar qué estrategia usar basado en el intento actual
    const strategyIndex = Math.min(retryCount, strategies.length - 1);
    const currentStrategy = strategies[strategyIndex];
    
    try {
      console.log(`Intento ${retryCount + 1}/${maxRetries} con configuración:`, currentStrategy);
      
      // Crear una promesa con timeout
      const mediaStreamPromise = navigator.mediaDevices.getUserMedia(currentStrategy);
      const timeoutPromise = new Promise<MediaStream>((_, reject) => {
        setTimeout(() => reject(new Error("Timeout al acceder a la cámara")), timeout);
      });
      
      // Competir entre la obtención del stream y el timeout
      const stream = await Promise.race([mediaStreamPromise, timeoutPromise]);
      
      // Si llegamos aquí, el stream se obtuvo correctamente
      console.log("Cámara inicializada correctamente con configuración:", currentStrategy);
      return stream;
    } catch (err) {
      // Guardar el error para reportarlo si todos los intentos fallan
      error = err;
      console.error(`Error en intento ${retryCount + 1}:`, err);
      retryCount++;
    }
  }
  
  // Si llegamos aquí, todos los intentos fallaron
  throw new Error(`No se pudo acceder a la cámara después de ${maxRetries} intentos: ${error?.message || 'Error desconocido'}`);
}

/**
 * Determina la causa raíz de problemas de cámara y sugiere soluciones
 */
export function diagnoseCameraIssue(error: any): string {
  if (!error) return "Error desconocido al acceder a la cámara. Debido a que estamos en MODO FORZADO, puede continuar con la sesión sin cámara.";
  
  console.error("Diagnóstico detallado de error de cámara:", {
    name: error.name,
    message: error.message,
    stack: error.stack,
    error: JSON.stringify(error, Object.getOwnPropertyNames(error))
  });
  
  const errorName = error.name || '';
  const errorMessage = error.message || '';
  
  // Mensajes personalizados para modo forzado
  const modoForzadoMsg = "Debido a que estamos en MODO FORZADO, puede continuar con la sesión sin necesidad de cámara.";
  
  // Analizar mensaje de error
  if (errorName === 'NotFoundError' || errorMessage.includes('not found') || errorMessage.includes('no encontr')) {
    return `No se detectó ninguna cámara. Verifique que su dispositivo tenga una cámara conectada y funcionando correctamente. ${modoForzadoMsg}`;
  }
  
  if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError' || 
      errorMessage.includes('permission') || errorMessage.includes('permiso')) {
    return `Permiso denegado para acceder a la cámara. Por favor, permita el acceso a la cámara cuando el navegador lo solicite. ${modoForzadoMsg}`;
  }
  
  if (errorName === 'NotReadableError' || errorName === 'TrackStartError' ||
      errorMessage.includes('hardware') || errorMessage.includes('in use') || errorMessage.includes('en uso')) {
    return `No se puede acceder a la cámara. Puede que esté siendo utilizada por otra aplicación. Cierre otras aplicaciones que puedan estar usando la cámara e intente nuevamente. ${modoForzadoMsg}`;
  }
  
  if (errorName === 'OverconstrainedError' || errorMessage.includes('constraint') || errorMessage.includes('restricci')) {
    return `Las restricciones de video solicitadas no pueden ser satisfechas por su cámara. Intente con una configuración de menor calidad. ${modoForzadoMsg}`;
  }
  
  if (errorName === 'SecurityError') {
    return `Su navegador ha bloqueado el acceso a la cámara por razones de seguridad. Intente usar HTTPS o un navegador diferente. ${modoForzadoMsg}`;
  }
  
  if (errorName === 'AbortError' || errorMessage.includes('abort') || errorMessage.includes('abort')) {
    return `La operación fue cancelada. Esto puede ocurrir si cambió de pestaña durante el proceso de autorización. ${modoForzadoMsg}`;
  }
  
  if (errorName === 'TypeError' || errorMessage.includes('type')) {
    return `Error de configuración al acceder a la cámara. Intente con un navegador diferente como Chrome o Firefox. ${modoForzadoMsg}`;
  }
  
  if (errorName === '' && errorMessage === '' && !error.name && !error.message) {
    return `No se pudo acceder a la cámara o micrófono. Es posible que no haya concedido permisos o que otro programa esté usando los dispositivos. ${modoForzadoMsg}`;
  }
  
  return `Error al acceder a la cámara: ${errorMessage || errorName || 'Error desconocido'}. ${modoForzadoMsg}`;
}