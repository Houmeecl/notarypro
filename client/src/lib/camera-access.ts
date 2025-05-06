/**
 * Módulo para gestión de acceso a la cámara y micrófono del usuario
 * Facilita la integración con WebRTC y garantiza un acceso seguro a los dispositivos
 */

export interface MediaDeviceInfo {
  deviceId: string;
  label: string;
  kind: 'videoinput' | 'audioinput' | 'audiooutput';
}

export interface StreamConfig {
  video?: boolean | MediaTrackConstraints;
  audio?: boolean | MediaTrackConstraints;
}

/**
 * Solicita permiso para acceder a la cámara y/o micrófono del usuario
 * @param config Configuración de la solicitud de stream (video/audio)
 * @returns Promise con el MediaStream o error
 */
export async function requestUserMedia(config: StreamConfig = { video: true, audio: true }): Promise<MediaStream> {
  try {
    // Verificar si el navegador soporta getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Este navegador no soporta acceso a la cámara o micrófono");
    }

    console.log("Solicitando acceso a cámara/micrófono con config:", config);
    
    // Solicitar acceso a los dispositivos
    const stream = await navigator.mediaDevices.getUserMedia(config);
    console.log("Acceso concedido a cámara/micrófono");
    return stream;
  } catch (error: any) {
    console.error("Error al acceder a la cámara/micrófono:", error);
    
    // Proporcionar mensajes de error más descriptivos
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      throw new Error("Permiso denegado para acceder a la cámara o micrófono. Por favor, habilite los permisos en la configuración de su navegador.");
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      throw new Error("No se encontraron dispositivos de cámara o micrófono en su equipo.");
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      throw new Error("No se pudo acceder a la cámara o micrófono. Es posible que otro programa esté utilizándolos.");
    } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
      throw new Error("No se pudo cumplir con los requisitos solicitados para la cámara o micrófono.");
    }
    
    throw error;
  }
}

/**
 * Obtiene la lista de dispositivos de cámara y micrófono disponibles
 * @returns Promise con un array de dispositivos
 */
export async function getMediaDevices(): Promise<MediaDeviceInfo[]> {
  try {
    // Algunos navegadores requieren permiso para enumerar dispositivos detalladamente
    await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      .catch(() => console.log("Permiso parcial o denegado para enumerar dispositivos"));
    
    // Enumerar dispositivos disponibles
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    // Filtrar y mapear los dispositivos relevantes (cámara y micrófono)
    return devices
      .filter(device => ['videoinput', 'audioinput', 'audiooutput'].includes(device.kind))
      .map(device => ({
        deviceId: device.deviceId,
        label: device.label || `${device.kind} (sin etiqueta)`,
        kind: device.kind as 'videoinput' | 'audioinput' | 'audiooutput'
      }));
  } catch (error) {
    console.error("Error al obtener dispositivos:", error);
    throw error;
  }
}

/**
 * Aplica un stream de video a un elemento de video HTML
 * @param stream MediaStream de la cámara
 * @param videoElement Elemento HTML de video para mostrar el stream
 */
export function attachStreamToVideo(stream: MediaStream, videoElement: HTMLVideoElement): void {
  if (!videoElement) throw new Error("Elemento de video no proporcionado");
  
  videoElement.srcObject = stream;
  videoElement.onloadedmetadata = () => {
    videoElement.play().catch(err => {
      console.error("Error al reproducir video:", err);
    });
  };
}

/**
 * Detiene todos los tracks de un MediaStream
 * @param stream MediaStream a detener
 */
export function stopMediaStream(stream: MediaStream | null): void {
  if (!stream) return;
  
  stream.getTracks().forEach(track => {
    track.stop();
  });
}

/**
 * Cambia la fuente de un stream de video existente
 * @param currentStream Stream actual que se va a detener
 * @param videoDeviceId ID del nuevo dispositivo de video a utilizar
 * @param audioDeviceId ID del nuevo dispositivo de audio a utilizar (opcional)
 * @returns Promise con el nuevo MediaStream
 */
export async function switchMediaDevice(
  currentStream: MediaStream | null, 
  videoDeviceId?: string,
  audioDeviceId?: string
): Promise<MediaStream> {
  // Detener el stream actual si existe
  if (currentStream) {
    stopMediaStream(currentStream);
  }
  
  // Configurar las restricciones para el nuevo stream
  const constraints: MediaStreamConstraints = {
    video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true,
    audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true
  };
  
  // Solicitar el nuevo stream
  return await requestUserMedia(constraints);
}

/**
 * Captura una imagen estática desde un stream de video
 * @param videoElement Elemento HTML de video con el stream activo
 * @returns Imagen en formato base64 (data URL)
 */
export function captureImageFromVideo(videoElement: HTMLVideoElement): string {
  if (!videoElement || !videoElement.videoWidth) {
    throw new Error("El video no está disponible o no ha cargado correctamente");
  }
  
  // Crear un canvas del mismo tamaño que el video
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  // Dibujar el fotograma actual en el canvas
  const context = canvas.getContext('2d');
  if (!context) throw new Error("No se pudo crear el contexto del canvas");
  
  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
  // Convertir el canvas a una imagen base64
  return canvas.toDataURL('image/jpeg', 0.9);
}

/**
 * Comprueba la calidad y adecuación de una imagen para verificación facial
 * @param imageData Imagen en formato base64 (data URL)
 * @returns Objeto con validación y mensaje de error si corresponde
 */
export function validateFacialImage(imageData: string): {isValid: boolean, message?: string} {
  // Verificar que la imagen tenga un tamaño mínimo (aprox > 20KB)
  if (imageData.length < 20000) {
    return {
      isValid: false,
      message: "La imagen es de muy baja calidad para la verificación facial. Asegúrese de tener buena iluminación."
    };
  }
  
  // Aquí se podrían añadir más validaciones como:
  // - Detección preliminar de rostro
  // - Comprobación de iluminación
  // - Verificación de posición frontal
  
  return { isValid: true };
}

/**
 * Comprueba si el navegador soporta captura de pantalla
 * @returns Boolean indicando si el navegador soporta captura de pantalla
 */
export function supportsScreenCapture(): boolean {
  return navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices;
}

/**
 * Solicita permiso para capturar la pantalla
 * @returns Promise con el MediaStream de la pantalla
 */
export async function requestScreenCapture(): Promise<MediaStream> {
  if (!supportsScreenCapture()) {
    throw new Error("Este navegador no soporta compartir pantalla");
  }
  
  try {
    // @ts-ignore - Algunos TypeScript no tienen actualizada esta API
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: "always"
      },
      audio: false
    });
    
    return stream;
  } catch (error: any) {
    console.error("Error al capturar pantalla:", error);
    
    if (error.name === 'NotAllowedError') {
      throw new Error("No se concedió permiso para compartir pantalla");
    }
    
    throw error;
  }
}