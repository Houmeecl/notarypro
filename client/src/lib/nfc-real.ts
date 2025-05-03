/**
 * Biblioteca de soporte para la lectura de cédulas de identidad chilenas con NFC
 * Esta implementación permite la lectura usando las APIs Web NFC y alternativas nativas
 * 
 * Basado en especificaciones oficiales: https://www.chileatiende.gob.cl/
 */

// Tipos de documentos reconocidos
export enum DocumentType {
  CI_CHL = "CI-CHL",       // Cédula de identidad chilena
  CI_FOREIGN = "CI-EXT",   // Cédula extranjera
  PASSPORT = "PASS",       // Pasaporte
  UNKNOWN = "UNKNOWN"      // Documento no reconocido
}

// Estructura de datos extraídos del NFC
export interface NFCDocumentData {
  // Información del documento
  documentType: DocumentType;
  documentNumber: string;
  issueDate?: string;
  expiryDate?: string;
  issuingCountry?: string;
  
  // Información del titular
  names: string;
  surnames: string;
  fullName?: string;
  nationality?: string;
  birthDate?: string;
  gender?: string;
  personalNumber?: string;
  
  // Datos técnicos
  chipId?: string;
  faceImage?: boolean;
  fingerprints?: boolean;
  
  // Estado de la lectura
  success: boolean;
  error?: string;
}

// Leer documento con Web NFC API (Chrome en Android)
export async function readWithWebNFC(): Promise<NFCDocumentData> {
  return new Promise(async (resolve, reject) => {
    try {
      // Verificar disponibilidad de la API
      if (!('NDEFReader' in window)) {
        return reject(new Error('Web NFC API no disponible en este navegador'));
      }
      
      const ndef = new (window as any).NDEFReader();
      
      // Establecer un timeout para la lectura
      const timeout = setTimeout(() => {
        reject(new Error('Tiempo de espera agotado. Acerque su documento al dispositivo.'));
      }, 20000); // 20 segundos máximo de espera
      
      // Iniciar escaneo NFC
      await ndef.scan();
      
      // Escuchar eventos de lectura
      ndef.addEventListener("reading", ({ message, serialNumber }: any) => {
        clearTimeout(timeout);
        
        // Procesar mensaje NDEF
        const records = Array.from(message.records);
        const textDecoder = new TextDecoder();
        
        // Inicializar datos del documento
        let nfcData: NFCDocumentData = {
          documentType: DocumentType.UNKNOWN,
          documentNumber: "",
          names: "",
          surnames: "",
          success: true,
          chipId: serialNumber
        };
        
        // Procesar los registros del mensaje
        records.forEach((record: any) => {
          if (record.recordType === "text") {
            const text = textDecoder.decode(record.data);
            try {
              // Intentar analizar como JSON
              const parsedData = JSON.parse(text);
              if (parsedData.documentNumber) {
                // Determinar tipo de documento
                if (parsedData.documentNumber.match(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/)) {
                  nfcData.documentType = DocumentType.CI_CHL;
                } else if (parsedData.documentNumber.match(/^[A-Z]{1,2}\d{6,7}$/)) {
                  nfcData.documentType = DocumentType.PASSPORT;
                }
                
                // Combinar datos
                nfcData = { ...nfcData, ...parsedData };
              }
            } catch (e) {
              // Si no es un JSON válido, analizar el texto plano
              processPlainTextData(text, nfcData);
            }
          } else if (record.recordType === "url") {
            // Los documentos pueden contener URLs con datos
            const url = textDecoder.decode(record.data);
            if (url.includes("datos=")) {
              // Extraer datos de la URL
              const params = new URLSearchParams(url.split("?")[1]);
              const encodedData = params.get("datos");
              if (encodedData) {
                try {
                  const decodedData = JSON.parse(atob(encodedData));
                  nfcData = { ...nfcData, ...decodedData };
                } catch (e) {
                  console.warn("Error decodificando datos de URL:", e);
                }
              }
            }
          }
        });
        
        // Si después de procesar aún no se ha identificado el tipo de documento
        // intentar determinarlo por el formato del número
        if (nfcData.documentType === DocumentType.UNKNOWN && nfcData.documentNumber) {
          if (nfcData.documentNumber.match(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/)) {
            nfcData.documentType = DocumentType.CI_CHL;
          } else if (nfcData.documentNumber.match(/^[A-Z]{1,2}\d{6,7}$/)) {
            nfcData.documentType = DocumentType.PASSPORT;
          }
        }
        
        // Actualizar el estado de éxito
        nfcData.success = true;
        
        resolve(nfcData);
      });
      
      // Manejar errores durante la lectura
      ndef.addEventListener("error", (error: any) => {
        clearTimeout(timeout);
        reject(new Error(`Error en la lectura NFC: ${error.message}`));
      });
      
    } catch (error: any) {
      reject(new Error(`Error al iniciar el escaneo NFC: ${error.message}`));
    }
  });
}

// Leer documento con API alternativa (para navegadores o dispositivos no compatibles con Web NFC)
export async function readWithAlternativeNFC(): Promise<NFCDocumentData> {
  return new Promise(async (resolve, reject) => {
    try {
      // Verificar disponibilidad de la API alternativa
      if (!('nfc' in navigator) || !('reading' in (navigator as any).nfc)) {
        return reject(new Error('API NFC alternativa no disponible'));
      }
      
      const timeout = setTimeout(() => {
        reject(new Error('Tiempo de espera agotado. Acerque su documento al dispositivo.'));
      }, 20000);
      
      // Comenzar lectura
      (navigator as any).nfc.reading({
        // Configuración específica de lectura para documentos
        tech: ["NDEF", "IsoDep"],
        options: {
          timeoutMillis: 20000,
          aidFilter: ["A0000002471001"] // AID para documentos de identidad
        }
      }).then((tag: any) => {
        clearTimeout(timeout);
        
        // Extraer datos del tag
        const nfcData: NFCDocumentData = {
          documentType: DocumentType.UNKNOWN,
          documentNumber: "",
          names: "",
          surnames: "",
          success: true,
          chipId: tag.id
        };
        
        // Procesar mensajes NDEF
        if (tag.ndefMessages && tag.ndefMessages.length > 0) {
          const textDecoder = new TextDecoder();
          tag.ndefMessages.forEach((message: any) => {
            message.records.forEach((record: any) => {
              if (record.recordType === "text") {
                const text = textDecoder.decode(record.data);
                try {
                  const parsedData = JSON.parse(text);
                  if (parsedData.documentNumber) {
                    // Actualizar tipo de documento
                    if (parsedData.documentNumber.match(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/)) {
                      nfcData.documentType = DocumentType.CI_CHL;
                    }
                    // Combinar datos
                    Object.assign(nfcData, parsedData);
                  }
                } catch (e) {
                  // Procesar como texto plano
                  processPlainTextData(text, nfcData);
                }
              }
            });
          });
        }
        
        resolve(nfcData);
        
      }).catch((error: any) => {
        clearTimeout(timeout);
        reject(new Error(`Error en la lectura alternativa: ${error.message || "Error desconocido"}`));
      });
      
    } catch (error: any) {
      reject(new Error(`Error al iniciar la lectura alternativa: ${error.message}`));
    }
  });
}

// Leer documento usando la interfaz Android (para aplicaciones web en WebView)
export async function readWithAndroidInterface(): Promise<NFCDocumentData> {
  return new Promise((resolve, reject) => {
    try {
      // Verificar disponibilidad de la interfaz
      if (!(window as any).androidInterface || !(window as any).androidInterface.readNFC) {
        return reject(new Error('Interfaz Android para NFC no disponible'));
      }
      
      // Timeout para la lectura
      const timeout = setTimeout(() => {
        reject(new Error('Tiempo de espera agotado. Acerque su documento al dispositivo.'));
      }, 20000);
      
      // Función para recibir la respuesta desde Android
      const handleNFCResult = (resultJson: string) => {
        clearTimeout(timeout);
        try {
          const result = JSON.parse(resultJson);
          
          if (result.success) {
            // Adaptar la respuesta al formato estándar
            const nfcData: NFCDocumentData = {
              documentType: determineDocumentType(result.documentNumber),
              documentNumber: result.documentNumber || "",
              names: result.names || result.givenNames || "",
              surnames: result.surnames || result.familyNames || "",
              fullName: result.fullName,
              birthDate: result.birthDate,
              nationality: result.nationality,
              gender: result.gender,
              issueDate: result.issueDate,
              expiryDate: result.expiryDate,
              personalNumber: result.personalNumber,
              chipId: result.chipId,
              faceImage: Boolean(result.faceImage),
              fingerprints: Boolean(result.fingerprints),
              success: true
            };
            
            resolve(nfcData);
          } else {
            reject(new Error(result.error || 'Error desconocido en la lectura'));
          }
        } catch (error) {
          reject(new Error(`Error al procesar la respuesta: ${error}`));
        }
      };
      
      // Si la interfaz espera un callback, registrarlo temporalmente en window
      if ((window as any).androidInterface.readNFC.length > 0) {
        const callbackName = `nfcCallback_${Date.now()}`;
        (window as any)[callbackName] = handleNFCResult;
        
        // Llamar a la interfaz Android con el nombre del callback
        (window as any).androidInterface.readNFC(callbackName);
        
        // Limpiar después de un tiempo máximo
        setTimeout(() => {
          delete (window as any)[callbackName];
        }, 25000);
      } else {
        // Si la interfaz devuelve una promesa o un resultado directo
        const result = (window as any).androidInterface.readNFC();
        
        // Si es una promesa
        if (result && typeof result.then === 'function') {
          result
            .then(handleNFCResult)
            .catch((error: any) => {
              clearTimeout(timeout);
              reject(new Error(`Error en la interfaz Android: ${error.message || error}`));
            });
        } 
        // Si es un resultado directo
        else if (typeof result === 'string') {
          handleNFCResult(result);
        } else {
          reject(new Error('Formato de respuesta no reconocido de la interfaz Android'));
        }
      }
      
    } catch (error: any) {
      reject(new Error(`Error al acceder a la interfaz Android: ${error.message}`));
    }
  });
}

// Utilidades para procesar datos y determinar tipos

function processPlainTextData(text: string, nfcData: NFCDocumentData): void {
  // Búsqueda de patrones en texto plano
  // RUT/DNI Chileno: 12.345.678-9
  const rutPattern = /(\d{1,2}\.\d{3}\.\d{3}-[\dkK])/;
  const rutMatch = text.match(rutPattern);
  if (rutMatch) {
    nfcData.documentNumber = rutMatch[1];
    nfcData.documentType = DocumentType.CI_CHL;
  }

  // Nombre
  const nombrePattern = /NOMBRES[:\s]+([^,;\n]+)/i;
  const nombreMatch = text.match(nombrePattern);
  if (nombreMatch) {
    nfcData.names = nombreMatch[1].trim();
  }
  
  // Apellidos
  const apellidosPattern = /APELLIDOS[:\s]+([^,;\n]+)/i;
  const apellidosMatch = text.match(apellidosPattern);
  if (apellidosMatch) {
    nfcData.surnames = apellidosMatch[1].trim();
  }
  
  // Fecha de nacimiento: DD-MM-YYYY o DD/MM/YYYY
  const fechaNacPattern = /NACIMIENTO[:\s]+(\d{2}[-\/]\d{2}[-\/]\d{4})/i;
  const fechaMatch = text.match(fechaNacPattern);
  if (fechaMatch) {
    // Convertir a formato ISO (YYYY-MM-DD)
    const parts = fechaMatch[1].split(/[-\/]/);
    if (parts.length === 3) {
      nfcData.birthDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }
}

function determineDocumentType(documentNumber?: string): DocumentType {
  if (!documentNumber) return DocumentType.UNKNOWN;
  
  // RUT/DNI Chileno: 12.345.678-9 o 12345678-9
  if (documentNumber.match(/^(\d{1,2}\.\d{3}\.\d{3}|\d{7,8})-[\dkK]$/)) {
    return DocumentType.CI_CHL;
  }
  
  // Pasaporte: formato común AA123456 o A1234567
  if (documentNumber.match(/^[A-Z]{1,2}\d{6,7}$/)) {
    return DocumentType.PASSPORT;
  }
  
  // Documentos extranjeros (números con letras y dígitos)
  if (documentNumber.match(/^[A-Z0-9]{5,15}$/)) {
    return DocumentType.CI_FOREIGN;
  }
  
  return DocumentType.UNKNOWN;
}