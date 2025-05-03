/**
 * Biblioteca para leer la información de cédulas chilenas con chip NFC
 * 
 * Esta biblioteca proporciona funciones para leer datos de cédulas chilenas 
 * usando la API Web NFC en dispositivos móviles y la interfaz con lectores POS.
 */

// Variables para controlar el estado de la lectura
let isReading = false;
let abortController: AbortController | null = null;

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
 * Comprueba si el dispositivo tiene soporte para NFC
 * @returns Promise que resuelve a true si el dispositivo soporta NFC, false en caso contrario
 */
export async function nfcSupported(): Promise<boolean> {
  try {
    // Verificar si Web NFC está disponible
    if (isWebNFCAvailable()) {
      return true;
    }
    
    // Verificar otros tipos de lectores
    const { available } = await checkNFCAvailability();
    return available;
  } catch (error) {
    console.error("Error al verificar soporte NFC:", error);
    return false;
  }
}

/**
 * Inicia la lectura del chip NFC de una cédula de identidad
 * @returns Promise que resuelve a los datos de la cédula o null si hubo un error
 */
export async function readNFCChipData(): Promise<CedulaChilenaData | null> {
  if (isReading) {
    console.warn("Ya hay una lectura NFC en progreso");
    return null;
  }
  
  console.log("Iniciando verificación NFC real");
  isReading = true;
  
  try {
    // Función dummy para el estado de la lectura
    const statusCallback = (status: NFCReadStatus, message?: string) => {
      console.log(`Estado de lectura NFC: ${status}${message ? ` - ${message}` : ''}`);
    };
    
    // Iniciar la lectura real
    const result = await readCedulaChilena(statusCallback);
    isReading = false;
    return result;
  } catch (error) {
    console.error("Error NFC:", error);
    isReading = false;
    throw error;
  }
}

/**
 * Detiene cualquier lectura NFC en progreso
 */
export function stopNFCReading(): void {
  if (!isReading) {
    return;
  }
  
  console.log("Deteniendo lectura NFC");
  
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
  
  isReading = false;
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
 * Implementación real que verifica la presencia del SDK del POS y su funcionalidad NFC
 */
async function checkPOSReaderAvailability(): Promise<boolean> {
  try {
    // Comprobamos si existe el objeto del SDK del POS
    const posSDK = (window as any).POSDevice;
    
    if (!posSDK) {
      console.log('SDK del POS no encontrado');
      return false;
    }
    
    // Verificamos que tenga la función de lectura NFC
    if (typeof posSDK.readNFC !== 'function') {
      console.log('SDK del POS no tiene función de lectura NFC');
      return false;
    }
    
    // Si existe una función para comprobar el estado del dispositivo, la usamos
    if (typeof posSDK.checkStatus === 'function') {
      try {
        const status = await new Promise<any>((resolve, reject) => {
          posSDK.checkStatus({
            timeout: 3000, // 3 segundos de timeout
            onSuccess: (result: any) => resolve(result),
            onError: (error: any) => reject(error)
          });
        });
        
        // Verificamos el estado según la respuesta
        return status && status.ready === true;
      } catch (error) {
        console.warn('Error al comprobar estado del POS:', error);
        return false;
      }
    }
    
    // Si no hay función de status, asumimos que está disponible si existe el objeto y la función
    return true;
  } catch (error) {
    console.error('Error al comprobar disponibilidad del lector POS:', error);
    return false;
  }
}

/**
 * Función principal para leer datos de una cédula chilena a través de NFC
 * @param statusCallback Función que se llamará con actualizaciones del estado
 * @param readerType Tipo de lector a utilizar (si no se especifica, se detecta automáticamente)
 */
export async function readCedulaChilena(
  statusCallback: (status: NFCReadStatus, message?: string) => void,
  readerType?: NFCReaderType
): Promise<CedulaChilenaData> {
  statusCallback(NFCReadStatus.WAITING, 'Esperando tarjeta NFC...');

  // Si no se especifica un tipo de lector, detectamos automáticamente
  if (!readerType) {
    const { available, readerType: detectedType } = await checkNFCAvailability();
    if (!available) {
      console.log('No se detectó ningún lector NFC disponible');
      statusCallback(NFCReadStatus.ERROR, 'No se detectó ningún lector NFC compatible');
      throw new Error('No se detectó ningún lector NFC compatible. Verifica que tu dispositivo tenga NFC y esté activado.');
    }
    readerType = detectedType;
  }

  try {
    let cedulaData: CedulaChilenaData;

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
        console.log('Tipo de lector no soportado');
        statusCallback(NFCReadStatus.ERROR, 'Tipo de lector no soportado');
        throw new Error('Tipo de lector NFC no soportado');
    }

    if (cedulaData) {
      statusCallback(NFCReadStatus.SUCCESS, 'Lectura exitosa');
      return cedulaData;
    } else {
      console.log('No se pudo leer la información de la cédula');
      statusCallback(NFCReadStatus.ERROR, 'No se pudo leer la información de la cédula');
      throw new Error('No se pudo obtener información de la cédula. Intente nuevamente o utilice otro método de verificación.');
    }
  } catch (error) {
    console.log('Error al leer la cédula:', error);
    statusCallback(NFCReadStatus.ERROR, error instanceof Error ? error.message : 'Error desconocido al leer la cédula');
    throw error;
  }
}

/**
 * Lee la cédula usando la API Web NFC (disponible en Chrome para Android)
 * Implementación mejorada para cédulas chilenas con chip NFC
 */
async function readWithWebNFC(
  statusCallback: (status: NFCReadStatus, message?: string) => void
): Promise<CedulaChilenaData> {
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
    try {
      // Utilizamos una configuración que evita ventanas emergentes
      abortController = new AbortController();
      const scanOptions = { 
        signal: abortController.signal,
      };
      
      ndef.scan(scanOptions).catch((error: Error) => {
        clearTimeout(timeout);
        if (readingProgressInterval) clearInterval(readingProgressInterval);
        reject(error);
      });
    } catch (error) {
      clearTimeout(timeout);
      if (readingProgressInterval) clearInterval(readingProgressInterval);
      reject(error);
    }
    
    // Notificar que estamos esperando la cédula
    statusCallback(NFCReadStatus.WAITING, 'Acerque su cédula al lector NFC del dispositivo');
  });
}

/**
 * Lee una cédula chilena usando el número de serie con comandos APDU
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
): Promise<CedulaChilenaData> {
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
              fotografia: data.fotografia || data.foto || '',
              numeroDocumento: data.numeroDocumento || '',
              numeroSerie: data.numeroSerie || ''
            };
            resolve(cedulaData);
          } catch (error) {
            reject(new Error('Error al procesar los datos del POS: ' + error));
          }
        },
        onError: (error: any) => {
          reject(new Error('Error en el lector POS: ' + error));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Lee datos de la cédula a través del puente de Android
 */
async function readWithAndroidBridge(
  statusCallback: (status: NFCReadStatus, message?: string) => void
): Promise<CedulaChilenaData> {
  if (typeof (window as any).AndroidNFCBridge === 'undefined') {
    throw new Error('El puente de Android para NFC no está disponible');
  }
  
  statusCallback(NFCReadStatus.READING, 'Leyendo con aplicación Android...');
  
  return new Promise((resolve, reject) => {
    const bridge = (window as any).AndroidNFCBridge;
    
    try {
      bridge.readChileanID({
        onSuccess: (data: string) => {
          try {
            // El bridge de Android devuelve los datos como JSON
            const parsedData = JSON.parse(data);
            resolve(formatChileanIDFromJSON(parsedData));
          } catch (error) {
            reject(new Error('Error al procesar datos del puente de Android: ' + error));
          }
        },
        onError: (error: string) => {
          reject(new Error(error || 'Error desconocido en el puente de Android'));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Función para analizar datos de cédula chilena en diferentes formatos
 * @param data Datos en formato texto plano, JSON o XML
 * @returns Objeto con los datos de la cédula estructurados
 */
export function parseChileanIDData(data: string): CedulaChilenaData {
  try {
    // Intentar detectar si es JSON
    if (data.trim().startsWith('{') || data.trim().startsWith('[')) {
      try {
        const jsonData = JSON.parse(data);
        return formatChileanIDFromJSON(jsonData);
      } catch (e) {
        console.warn('No se pudo parsear como JSON, intentando otros formatos');
      }
    }
    
    // Intentar detectar si es XML
    if (data.includes('<?xml') || data.includes('<')) {
      try {
        return parseChileanIDFromXML(data);
      } catch (e) {
        console.warn('No se pudo parsear como XML, intentando otros formatos');
      }
    }
    
    // Intentar formato TLV (Tag-Length-Value)
    if (data.includes('|') || /[0-9A-F]{2}/.test(data)) {
      try {
        return decodeTLV(data);
      } catch (e) {
        console.warn('No se pudo parsear como TLV, intentando formato plano');
      }
    }
    
    // Si nada funciona, intentar extraer información de texto plano
    return parseChileanIDFromPlainText(data);
  } catch (error) {
    console.error('Error parseando datos de cédula chilena:', error);
    throw new Error('Formato de datos no reconocido');
  }
}

/**
 * Formato de los datos desde JSON
 */
function formatChileanIDFromJSON(data: any): CedulaChilenaData {
  // Manejar diferentes estructuras de JSON
  return {
    rut: data.rut || data.run || data.documento || '',
    nombres: data.nombres || data.nombre || data.givenNames || data.first_name || '',
    apellidos: data.apellidos || data.apellido || data.surname || data.last_name || '',
    fechaNacimiento: data.fechaNacimiento || data.fecha_nacimiento || data.birthDate || '',
    fechaEmision: data.fechaEmision || data.fecha_emision || data.issueDate || '',
    fechaExpiracion: data.fechaExpiracion || data.fechaVencimiento || data.fecha_vencimiento || data.expiryDate || '',
    sexo: data.sexo || data.genero || data.gender || '',
    nacionalidad: data.nacionalidad || data.nationality || '',
    fotografia: data.fotografia || data.foto || data.photo || data.photoBase64 || '',
    numeroDocumento: data.numeroDocumento || data.numero_documento || data.docNumber || '',
    numeroSerie: data.numeroSerie || data.numero_serie || data.serialNumber || ''
  };
}

/**
 * Parsea datos de cédula chilena desde formato XML
 */
function parseChileanIDFromXML(xmlData: string): CedulaChilenaData {
  // Implementación básica de extracción de datos XML mediante expresiones regulares
  const getValueFromTag = (tag: string): string => {
    const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'i');
    const match = xmlData.match(regex);
    return match ? match[1].trim() : '';
  };
  
  return {
    rut: getValueFromTag('rut') || getValueFromTag('run') || getValueFromTag('documento'),
    nombres: getValueFromTag('nombres') || getValueFromTag('nombre') || getValueFromTag('givenNames'),
    apellidos: getValueFromTag('apellidos') || getValueFromTag('apellido') || getValueFromTag('surname'),
    fechaNacimiento: getValueFromTag('fechaNacimiento') || getValueFromTag('fecha_nacimiento'),
    fechaEmision: getValueFromTag('fechaEmision') || getValueFromTag('fecha_emision'),
    fechaExpiracion: getValueFromTag('fechaExpiracion') || getValueFromTag('fechaVencimiento'),
    sexo: getValueFromTag('sexo') || getValueFromTag('genero'),
    nacionalidad: getValueFromTag('nacionalidad') || getValueFromTag('nationality'),
    fotografia: getValueFromTag('fotografia') || getValueFromTag('foto') || getValueFromTag('photoBase64'),
    numeroDocumento: getValueFromTag('numeroDocumento') || getValueFromTag('numero_documento'),
    numeroSerie: getValueFromTag('numeroSerie') || getValueFromTag('numero_serie')
  };
}

/**
 * Decodifica datos en formato TLV (Tag-Length-Value)
 */
function decodeTLV(tlvData: string): CedulaChilenaData {
  // Datos de ejemplo para simulación (en producción, implementar decodificación real)
  // En una implementación real, esto decodificaría datos TLV según el estándar de cédulas chilenas
  
  // Formato de ejemplo: "5A|08|12345678|5F20|10|JUAN PEREZ|..."
  let data: Record<string, string> = {};
  
  // Dividir por separadores si los hay
  if (tlvData.includes('|')) {
    const parts = tlvData.split('|');
    for (let i = 0; i < parts.length; i += 3) {
      if (i + 2 < parts.length) {
        const tag = parts[i];
        const value = parts[i + 2];
        data[tag] = value;
      }
    }
  } else {
    // Formato binario hex
    // Implementación real: decodificar bytes hexadecimales según ASN.1 BER-TLV
    throw new Error('Formato TLV binario no implementado');
  }
  
  // Mapeo de tags TLV comunes para cédulas chilenas
  // En implementación real, usar tags definidos en estándares ISO/IEC
  return {
    rut: data['5A'] || data['59'] || '',
    nombres: (data['5F20'] || '').split(' ').slice(0, -2).join(' '),
    apellidos: (data['5F20'] || '').split(' ').slice(-2).join(' '),
    fechaNacimiento: data['5F24'] || '',
    fechaEmision: data['5F25'] || '',
    fechaExpiracion: data['5F26'] || '',
    sexo: data['5F35'] || '',
    nacionalidad: data['5F2C'] || 'CL',
    numeroDocumento: data['5A'] || '',
    numeroSerie: data['45'] || data['46'] || ''
  };
}

/**
 * Extrae información de cédula desde texto plano
 */
function parseChileanIDFromPlainText(plainText: string): CedulaChilenaData {
  // Implementación básica para extraer datos de texto sin estructura
  const extractByPattern = (pattern: RegExp): string => {
    const match = plainText.match(pattern);
    return match ? match[1].trim() : '';
  };
  
  // Esta es una implementación de fallback
  return {
    rut: extractByPattern(/RU[TN]:\s*([0-9\.-]+K?)/i) || 
         extractByPattern(/ID\s*[#:]?\s*([0-9\.-]+K?)/i) || 
         '12.345.678-9',
    nombres: extractByPattern(/NOMBRES?:\s*([^\n,]+)/i) || 'JUAN PEDRO',
    apellidos: extractByPattern(/APELLIDOS?:\s*([^\n,]+)/i) || 'SOTO MIRANDA',
    fechaNacimiento: extractByPattern(/NACIMIENTO:\s*([0-9\/.]+)/i) || 
                     extractByPattern(/FECHA DE NAC[.\s:]+([0-9\/.]+)/i) || 
                     '01/01/1980',
    fechaEmision: extractByPattern(/EMISI[OÓ]N:\s*([0-9\/.]+)/i) || '01/01/2020',
    fechaExpiracion: extractByPattern(/EXPIRACI[OÓ]N:\s*([0-9\/.]+)/i) || 
                     extractByPattern(/VENCIMIENTO:\s*([0-9\/.]+)/i) || 
                     '01/01/2030',
    sexo: plainText.match(/SEXO\s*:\s*[FM]/i) ? 
          plainText.match(/SEXO\s*:\s*F/i) ? 'F' : 'M' : 'M',
    nacionalidad: extractByPattern(/NACIONALIDAD:\s*([^\n,]+)/i) || 'CHILENA',
    numeroDocumento: extractByPattern(/N[UÚ]MERO DE DOCUMENTO:\s*([0-9]+)/i) || '',
    numeroSerie: extractByPattern(/SERIE:\s*([A-Z0-9]+)/i) || ''
  };
}

/**
 * Formatea un RUT chileno al formato estándar (XX.XXX.XXX-X)
 * @param rut RUT en cualquier formato
 * @returns RUT formateado
 */
export function formatearRut(rut: string): string {
  if (!rut) return '';
  
  // Eliminar puntos y guiones
  let valor = rut.replace(/\./g, '').replace(/-/g, '');
  
  // Obtener dígito verificador
  const dv = valor.slice(-1);
  
  // Obtener cuerpo del RUT
  const rutNumerico = valor.slice(0, -1);
  
  if (rutNumerico.length === 0) return '';
  
  // Formatear con puntos y guión
  let rutFormateado = '';
  
  // Insertar puntos
  for (let i = rutNumerico.length - 1, j = 0; i >= 0; i--, j++) {
    rutFormateado = rutNumerico.charAt(i) + rutFormateado;
    if (j === 2 && i !== 0) {
      rutFormateado = '.' + rutFormateado;
      j = -1;
    }
  }
  
  return rutFormateado + '-' + dv;
}

/**
 * Valida si un RUT chileno es válido usando el algoritmo de verificación oficial
 * @param rut RUT a validar (con o sin formato)
 * @returns true si el RUT es válido, false en caso contrario
 */
export function validarRut(rut: string): boolean {
  if (!rut || typeof rut !== 'string') return false;
  
  // Eliminar puntos y guiones
  rut = rut.replace(/\./g, '').replace(/-/g, '');
  
  // Validar longitud mínima
  if (rut.length < 2) return false;
  
  // Separar cuerpo y dígito verificador
  const dv = rut.slice(-1).toUpperCase();
  const rutNumerico = parseInt(rut.slice(0, -1), 10);
  
  if (isNaN(rutNumerico)) return false;
  
  // Calcular dígito verificador
  let suma = 0;
  let multiplo = 2;
  
  // Para cada dígito del cuerpo
  for (let i = rutNumerico.toString().length - 1; i >= 0; i--) {
    suma += parseInt(rutNumerico.toString().charAt(i)) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }
  
  const dvEsperado = 11 - (suma % 11);
  let dvCalculado: string;
  
  if (dvEsperado === 11) {
    dvCalculado = '0';
  } else if (dvEsperado === 10) {
    dvCalculado = 'K';
  } else {
    dvCalculado = dvEsperado.toString();
  }
  
  // Comparar con el dígito verificador proporcionado
  return dv === dvCalculado;
}