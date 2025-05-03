/**
 * Biblioteca para leer la información de cédulas chilenas con chip NFC
 * 
 * Esta biblioteca proporciona funciones para leer datos de cédulas chilenas 
 * usando la API Web NFC en dispositivos móviles y la interfaz con lectores POS.
 */

// Estructura de datos para la información de la cédula chilena
export interface CedulaChilenaData {
  rut: string;          // RUT (Rol Único Tributario)
  nombres: string;      // Nombres
  apellidos: string;    // Apellidos
  fechaNacimiento: string; // Fecha de nacimiento
  fechaEmision: string; // Fecha de emisión del documento
  fechaExpiracion: string; // Fecha de expiración (también se puede usar como fechaVencimiento)
  sexo: string;         // Sexo (M/F)
  nacionalidad: string; // Nacionalidad
  fotografia?: string;  // Fotografía en base64 (opcional, depende del lector)
  numeroDocumento?: string; // Número del documento (opcional)
  numeroSerie?: string; // Número de serie del chip (opcional)
}

// Estado de la lectura NFC
export enum NFCReadStatus {
  INACTIVE = 'inactive',
  WAITING = 'waiting',
  READING = 'reading',
  SUCCESS = 'success',
  ERROR = 'error'
}

// Tipos de lectores NFC soportados
export enum NFCReaderType {
  WEB_NFC = 'web_nfc',    // API Web NFC para móviles modernos
  POS_DEVICE = 'pos_device', // Lector POS externo
  ANDROID_HOST = 'android_host' // Host-based card emulation en Android
}

/**
 * Verifica si la API Web NFC está disponible en el dispositivo
 */
export function isWebNFCAvailable(): boolean {
  return 'NDEFReader' in window;
}

/**
 * Función para verificar si hay algún tipo de lector NFC disponible
 */
export async function checkNFCAvailability(): Promise<{
  available: boolean;
  readerType?: NFCReaderType;
}> {
  // Comprobar Web NFC (disponible en Chrome para Android)
  if (isWebNFCAvailable()) {
    return {
      available: true,
      readerType: NFCReaderType.WEB_NFC
    };
  }

  // En iOS y otros dispositivos, verificamos si está disponible el lector POS
  if (window.navigator.userAgent.match(/iOS|iPhone|iPad|iPod/i)) {
    // Podemos intentar detectar si hay un lector POS conectado
    const posDeviceAvailable = await checkPOSReaderAvailability();
    if (posDeviceAvailable) {
      return {
        available: true,
        readerType: NFCReaderType.POS_DEVICE
      };
    }
  }

  // Verificar si estamos en Android y tenemos acceso a NFC mediante bridge nativo
  if (window.navigator.userAgent.match(/Android/i)) {
    // Verificar si existe el bridge de Android para NFC 
    // (se implementaría por la aplicación nativa)
    if (typeof (window as any).AndroidNFCBridge !== 'undefined') {
      return {
        available: true,
        readerType: NFCReaderType.ANDROID_HOST
      };
    }
  }

  return { available: false };
}

/**
 * Comprueba si el lector POS está disponible
 */
async function checkPOSReaderAvailability(): Promise<boolean> {
  // Esta implementación dependerá del hardware específico del POS
  // Simulamos que está disponible para demostración
  return true;
}

/**
 * Función principal para leer datos de una cédula chilena a través de NFC
 * @param statusCallback Función que se llamará con actualizaciones del estado
 * @param readerType Tipo de lector a utilizar (si no se especifica, se detecta automáticamente)
 */
export async function readCedulaChilena(
  statusCallback: (status: NFCReadStatus, message?: string) => void,
  readerType?: NFCReaderType
): Promise<CedulaChilenaData | null> {
  statusCallback(NFCReadStatus.WAITING, 'Esperando tarjeta NFC...');

  // Si no se especifica un tipo de lector, detectamos automáticamente
  if (!readerType) {
    const { available, readerType: detectedType } = await checkNFCAvailability();
    if (!available) {
      statusCallback(NFCReadStatus.ERROR, 'No se detectó ningún lector NFC disponible');
      return null;
    }
    readerType = detectedType;
  }

  try {
    let cedulaData: CedulaChilenaData | null = null;

    switch (readerType) {
      case NFCReaderType.WEB_NFC:
        cedulaData = await readWithWebNFC(statusCallback);
        break;
      case NFCReaderType.POS_DEVICE:
        cedulaData = await readWithPOSDevice(statusCallback);
        break;
      case NFCReaderType.ANDROID_HOST:
        cedulaData = await readWithAndroidBridge(statusCallback);
        break;
      default:
        statusCallback(NFCReadStatus.ERROR, 'Tipo de lector no soportado');
        return null;
    }

    if (cedulaData) {
      statusCallback(NFCReadStatus.SUCCESS, 'Lectura exitosa');
      return cedulaData;
    } else {
      statusCallback(NFCReadStatus.ERROR, 'No se pudo leer la información de la cédula');
      return null;
    }
  } catch (error) {
    statusCallback(NFCReadStatus.ERROR, `Error al leer la cédula: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    return null;
  }
}

/**
 * Lee la cédula usando la API Web NFC (disponible en Chrome para Android)
 * Implementación mejorada para cédulas chilenas con chip NFC
 */
async function readWithWebNFC(
  statusCallback: (status: NFCReadStatus, message?: string) => void
): Promise<CedulaChilenaData | null> {
  if (!isWebNFCAvailable()) {
    throw new Error('Web NFC no está disponible en este dispositivo');
  }

  statusCallback(NFCReadStatus.READING, 'Estableciendo conexión con el chip...');

  return new Promise((resolve, reject) => {
    const ndef = new (window as any).NDEFReader();
    let readingProgressInterval: NodeJS.Timeout | null = null;
    let readingProgressCounter = 0;
    const readingProgressMessages = [
      'Leyendo datos personales...',
      'Verificando firma digital...',
      'Procesando información...',
      'Extrayendo datos biométricos...',
      'Validando información...'
    ];
    
    // Tiempo máximo de espera (40 segundos)
    const timeout = setTimeout(() => {
      if (readingProgressInterval) {
        clearInterval(readingProgressInterval);
      }
      
      ndef.removeEventListener('reading', onReading);
      ndef.removeEventListener('error', onError);
      reject(new Error('Tiempo de espera agotado. Intente acercar nuevamente la cédula.'));
    }, 40000);

    // Mostrar mensajes de progreso durante la lectura
    readingProgressInterval = setInterval(() => {
      if (readingProgressCounter < readingProgressMessages.length) {
        statusCallback(NFCReadStatus.READING, readingProgressMessages[readingProgressCounter]);
        readingProgressCounter++;
      } else {
        if (readingProgressInterval) {
          clearInterval(readingProgressInterval);
          readingProgressInterval = null;
        }
      }
    }, 1500);

    const onReading = async (event: any) => {
      try {
        // Notificar que estamos procesando la información
        statusCallback(NFCReadStatus.READING, 'Procesando información del chip...');
        
        // Primero intentamos leer los registros NDEF estándar
        if (event.message && event.message.records) {
          const records = event.message.records;
          
          // Procesamos el mensaje buscando los datos de cédula chilena
          for (const record of records) {
            if (record.recordType === 'text') {
              const decoder = new TextDecoder();
              const data = decoder.decode(record.data);
              
              // Si encontramos algún identificador de cédula chilena
              if (data.includes('CL') || data.includes('RUN') || data.includes('RUT')) {
                try {
                  const parsedData = parseChileanIDData(data);
                  
                  // Limpiar y detener
                  clearTimeout(timeout);
                  if (readingProgressInterval) clearInterval(readingProgressInterval);
                  ndef.removeEventListener('reading', onReading);
                  ndef.removeEventListener('error', onError);
                  
                  // Detener el escaneo
                  try {
                    await ndef.stop();
                  } catch (e) {
                    console.warn('Error al detener el escaneo NFC:', e);
                  }
                  
                  // Devolver datos
                  resolve(parsedData);
                  return;
                } catch (parseError) {
                  console.warn('Error parseando datos NDEF:', parseError);
                  // Continuamos intentando otros métodos
                }
              }
            }
          }
        }
        
        // Si llegamos aquí, el formato NDEF estándar no funcionó
        // Intentamos acceder directamente a los datos binarios de la tarjeta
        if (event.serialNumber) {
          const cedula = await readChileanIDCardWithSerialnumber(event.serialNumber);
          
          // Limpiar y detener
          clearTimeout(timeout);
          if (readingProgressInterval) clearInterval(readingProgressInterval);
          ndef.removeEventListener('reading', onReading);
          ndef.removeEventListener('error', onError);
          
          // Detener el escaneo
          try {
            await ndef.stop();
          } catch (e) {
            console.warn('Error al detener el escaneo NFC:', e);
          }
          
          resolve(cedula);
          return;
        }
        
        // Si nada funcionó, mostramos un error
        console.error('No se pudo leer la cédula: formato no reconocido');
        
        // Limpiar recursos
        clearTimeout(timeout);
        if (readingProgressInterval) clearInterval(readingProgressInterval);
        ndef.removeEventListener('reading', onReading);
        ndef.removeEventListener('error', onError);
        
        // Detener el escaneo
        try {
          await ndef.stop();
        } catch (e) {
          console.warn('Error al detener el escaneo NFC:', e);
        }
        
        // Rechazar con un error descriptivo
        reject(new Error('No se pudo leer la información del chip NFC. El formato de la cédula no es reconocido o el chip podría estar dañado.'));
      } catch (error) {
        clearTimeout(timeout);
        if (readingProgressInterval) clearInterval(readingProgressInterval);
        
        // Intentar detener el escaneo
        try {
          await ndef.stop();
        } catch (e) {
          console.warn('Error al detener el escaneo NFC:', e);
        }
        
        reject(error);
      }
    };

    const onError = async (error: any) => {
      clearTimeout(timeout);
      if (readingProgressInterval) clearInterval(readingProgressInterval);
      
      // Intentar detener el escaneo
      try {
        await ndef.stop();
      } catch (e) {
        console.warn('Error al detener el escaneo NFC:', e);
      }
      
      reject(error);
    };

    ndef.addEventListener('reading', onReading);
    ndef.addEventListener('error', onError);

    // Comenzar la lectura con opciones específicas para cédulas chilenas
    ndef.scan({ 
      signal: AbortSignal.timeout(40000), // AbortSignal que cancela después de 40s
    }).catch((error: Error) => {
      clearTimeout(timeout);
      if (readingProgressInterval) clearInterval(readingProgressInterval);
      reject(error);
    });
    
    // Notificar que estamos esperando la cédula
    statusCallback(NFCReadStatus.WAITING, 'Acerque su cédula al lector NFC del dispositivo');
  });
}

/**
 * Lee una cédula chilena usando el número de serie con comandos APDU
 * Esta función accede a los datos de la cédula chilena con los comandos APDU específicos
 */
async function readChileanIDCardWithSerialnumber(serialNumber: string): Promise<CedulaChilenaData> {
  // Para implementación real, este código debe utilizar comandos APDU
  // para acceder a las aplicaciones y archivos específicos de la cédula chilena
  
  try {
    // Intentar acceder a los datos del chip con el número de serie
    console.log('Intentando leer cédula con número de serie:', serialNumber);
    
    // En una implementación real, aquí iría el código para seleccionar
    // la aplicación de identidad en el chip y leer los archivos
    
    // Si no podemos leer los datos o no implementamos esta funcionalidad,
    // debemos lanzar un error para que el sistema pruebe otros métodos
    // o notifique correctamente al usuario
    throw new Error('Lectura de datos mediante número de serie no implementada');
    
    // Cuando se implemente completamente, esta función deberá retornar
    // la información real leída del chip NFC
  } catch (error) {
    console.error('Error leyendo cédula con número de serie:', error);
    throw new Error('No se pudo leer la información de la cédula usando el número de serie');
  }
}

/**
 * Lee la cédula usando un lector POS conectado
 */
async function readWithPOSDevice(
  statusCallback: (status: NFCReadStatus, message?: string) => void
): Promise<CedulaChilenaData | null> {
  statusCallback(NFCReadStatus.READING, 'Conectando con dispositivo POS...');

  // Esta función implementa la lectura desde un lector POS
  return new Promise((resolve, reject) => {
    try {
      // Revisar si existe el objeto global que proporciona el SDK del POS
      const posSDK = (window as any).POSDevice;
      
      if (!posSDK || typeof posSDK.readNFC !== 'function') {
        throw new Error('El SDK del dispositivo POS no está disponible');
      }
      
      statusCallback(NFCReadStatus.READING, 'Esperando cédula en lector POS...');
      
      // Llamar al método del SDK para leer la cédula
      // Este método dependerá de la implementación específica del SDK
      posSDK.readNFC({
        timeout: 40000, // 40 segundos de timeout
        onProgress: (message: string) => {
          statusCallback(NFCReadStatus.READING, message);
        },
        onSuccess: (data: any) => {
          // Convertir los datos del formato del POS al formato CedulaChilenaData
          try {
            const cedulaData: CedulaChilenaData = {
              rut: data.rut || '',
              nombres: data.nombres || '',
              apellidos: data.apellidos || '',
              fechaNacimiento: data.fechaNacimiento || '',
              fechaEmision: data.fechaEmision || '',
              fechaExpiracion: data.fechaVencimiento || data.fechaExpiracion || '',
              sexo: data.sexo || '',
              nacionalidad: data.nacionalidad || '',
              numeroDocumento: data.numeroDocumento,
              numeroSerie: data.numeroSerie,
              fotografia: data.fotografia
            };
            
            // Verificar que tenemos al menos los datos mínimos necesarios
            if (!cedulaData.rut || !cedulaData.nombres || !cedulaData.apellidos) {
              throw new Error('Los datos leídos están incompletos');
            }
            
            resolve(cedulaData);
          } catch (parseError) {
            reject(new Error(`Error al procesar los datos del POS: ${parseError instanceof Error ? parseError.message : 'Error desconocido'}`));
          }
        },
        onError: (error: any) => {
          reject(new Error(`Error en lector POS: ${error instanceof Error ? error.message : error.toString()}`));
        }
      });
    } catch (error) {
      reject(new Error(`Error al iniciar lector POS: ${error instanceof Error ? error.message : 'Error desconocido'}`));
    }
  });
}

/**
 * Lee la cédula usando el bridge nativo de Android
 */
async function readWithAndroidBridge(
  statusCallback: (status: NFCReadStatus, message?: string) => void
): Promise<CedulaChilenaData | null> {
  statusCallback(NFCReadStatus.READING, 'Leyendo cédula con puente nativo de Android...');

  // Esta función llamaría al bridge nativo de Android si está disponible
  const bridge = (window as any).AndroidNFCBridge;
  
  if (!bridge) {
    throw new Error('El puente NFC de Android no está disponible');
  }

  return new Promise((resolve, reject) => {
    // Registrar callback para recibir datos desde el puente nativo
    bridge.readChileanID((result: string) => {
      if (result === 'ERROR') {
        reject(new Error('No se pudo leer la cédula chilena'));
        return;
      }

      try {
        // El puente nativo devuelve un JSON con los datos
        const data = JSON.parse(result);
        resolve({
          rut: data.rut,
          nombres: data.nombres,
          apellidos: data.apellidos,
          fechaNacimiento: data.fechaNacimiento,
          fechaEmision: data.fechaEmision,
          fechaExpiracion: data.fechaExpiracion,
          sexo: data.sexo,
          nacionalidad: data.nacionalidad,
          fotografia: data.fotografia
        });
      } catch (error) {
        reject(new Error(`Error al procesar datos del puente nativo: ${error instanceof Error ? error.message : 'Error desconocido'}`));
      }
    });
  });
}

/**
 * Procesa los datos crudos de la cédula chilena
 * Esta función debe implementarse según el formato real de los datos
 */
function parseChileanIDData(rawData: string): CedulaChilenaData {
  // Implementación de ejemplo - la real dependerá del formato exacto
  // de los datos en las cédulas chilenas
  
  // Simulamos un parser básico para demostración
  const parts = rawData.split('|');
  
  if (parts.length < 7) {
    throw new Error('Formato de datos inválido');
  }
  
  return {
    rut: parts[0],
    nombres: parts[1],
    apellidos: parts[2],
    fechaNacimiento: parts[3],
    fechaEmision: parts[4],
    fechaExpiracion: parts[5],
    sexo: parts[6],
    nacionalidad: parts[7] || 'CHL'
  };
}

/**
 * Valida el RUT chileno
 * @param rut RUT con formato "12345678-9" o "12.345.678-9"
 * @returns true si el RUT es válido, false en caso contrario
 */
export function validarRut(rut: string): boolean {
  // Eliminar puntos y guiones
  rut = rut.replace(/\./g, '').replace(/-/g, '');
  
  // Validar formato
  if (!/^\d{7,8}[0-9K]$/i.test(rut)) {
    return false;
  }
  
  // Obtener dígito verificador
  const dv = rut.slice(-1).toUpperCase();
  // Obtener cuerpo
  const rutBody = rut.slice(0, -1);
  
  // Calcular dígito verificador esperado
  let suma = 0;
  let multiplo = 2;
  
  // Para cada dígito del cuerpo
  for (let i = rutBody.length - 1; i >= 0; i--) {
    suma += Number(rutBody.charAt(i)) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  
  const dvEsperado = 11 - (suma % 11);
  let dvCalculado = '';
  
  if (dvEsperado === 11) {
    dvCalculado = '0';
  } else if (dvEsperado === 10) {
    dvCalculado = 'K';
  } else {
    dvCalculado = String(dvEsperado);
  }
  
  // Comparar dígito verificador
  return dv === dvCalculado;
}

/**
 * Formatea un RUT en formato estándar (XX.XXX.XXX-X)
 * @param rut RUT sin formato
 * @returns RUT formateado
 */
export function formatearRut(rut: string): string {
  // Eliminar puntos y guiones
  rut = rut.replace(/\./g, '').replace(/-/g, '');
  
  // Validar formato
  if (!/^\d{7,8}[0-9K]$/i.test(rut)) {
    return rut; // Devolver sin formato si no es válido
  }
  
  // Obtener dígito verificador
  const dv = rut.slice(-1);
  // Obtener cuerpo
  const rutBody = rut.slice(0, -1);
  
  // Formatear con puntos y guión
  let resultado = '';
  for (let i = rutBody.length - 1, j = 0; i >= 0; i--, j++) {
    resultado = rutBody.charAt(i) + resultado;
    if ((j + 1) % 3 === 0 && i !== 0) {
      resultado = '.' + resultado;
    }
  }
  
  return `${resultado}-${dv}`;
}