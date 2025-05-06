/**
 * Módulo pkcs11-bridge.ts
 * 
 * Proporciona un puente entre la aplicación web y los dispositivos PKCS#11 (eTokens, smartcards)
 * a través de una extensión del navegador que implementa los estándares de firma digital.
 * 
 * Este módulo está diseñado exclusivamente para trabajar con dispositivos físicos reales de firma
 * electrónica avanzada siguiendo la normativa chilena (Ley 19.799).
 * 
 * MODO REAL: Este módulo solo funciona con hardware físico y certificados reales.
 */

export enum TokenProvider {
  ECERT = 'ecert',
  ESIGN = 'esign',
  TOC = 'toc',
  ACEPTA = 'acepta',
  CERTINET = 'certinet',
  UNKNOWN = 'unknown'
}

export interface CertificateInfo {
  serialNumber: string;
  subject: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  provider: TokenProvider;
}

export interface SignatureResult {
  signature: string;
  certificate: string;
  timestamp: string;
  provider: TokenProvider;
  algorithm: string;
}

/**
 * Comprueba si la extensión de firma digital está disponible
 * @returns Promise<boolean> true si la extensión está disponible
 */
export async function checkExtensionAvailability(): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    // Verificamos si la extensión está disponible en el objeto window
    if (window.firmaDigitalChile) {
      try {
        window.firmaDigitalChile.isAvailable()
          .then((available: boolean) => resolve(available))
          .catch((error: any) => {
            console.error("Error al verificar disponibilidad de extensión:", error);
            resolve(false);
          });
      } catch (error) {
        console.error("Excepción al verificar extensión:", error);
        resolve(false);
      }
    } else {
      console.warn("La extensión firmaDigitalChile no se encuentra en window");
      resolve(false);
    }
  });
}

/**
 * Enumera los dispositivos criptográficos conectados
 * @returns Promise<string[]> Lista de dispositivos disponibles
 */
export async function listTokenDevices(): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    if (!window.firmaDigitalChile) {
      reject(new Error('La extensión de firma digital no está disponible'));
      return;
    }
    
    window.firmaDigitalChile.listDevices()
      .then((devices) => {
        if (!devices || devices.length === 0) {
          console.warn("No se detectaron dispositivos físicos");
        } else {
          console.info(`Dispositivos detectados: ${devices.length}`);
        }
        resolve(devices);
      })
      .catch((err: Error) => {
        console.error("Error al listar dispositivos:", err);
        reject(new Error(`Error al listar dispositivos: ${err.message}`));
      });
  });
}

/**
 * Obtiene la información de los certificados disponibles en el token
 * @param pin PIN de acceso al token
 * @returns Promise<CertificateInfo[]> Información de certificados disponibles
 */
export async function getCertificates(pin: string): Promise<CertificateInfo[]> {
  return new Promise<CertificateInfo[]>((resolve, reject) => {
    if (!window.firmaDigitalChile) {
      reject(new Error('La extensión de firma digital no está disponible'));
      return;
    }
    
    if (!pin || pin.trim() === '') {
      reject(new Error('El PIN no puede estar vacío'));
      return;
    }
    
    window.firmaDigitalChile.getCertificates(pin)
      .then((certs) => {
        if (!certs || certs.length === 0) {
          console.warn("No se encontraron certificados en el dispositivo");
          resolve([]);
          return;
        }
        
        console.info(`Certificados obtenidos: ${certs.length}`);
        
        const certificateInfoList: CertificateInfo[] = certs.map(cert => ({
          serialNumber: cert.serialNumber || cert.serial || '',
          subject: cert.subject,
          issuer: cert.issuer,
          validFrom: new Date(cert.validFrom),
          validTo: new Date(cert.validTo),
          provider: mapProviderFromIssuer(cert.issuer)
        }));
        
        resolve(certificateInfoList);
      })
      .catch((err: Error) => {
        console.error("Error al obtener certificados:", err);
        reject(new Error(`Error al obtener certificados: ${err.message}`));
      });
  });
}

/**
 * Firma un documento utilizando un certificado específico
 * @param provider Proveedor del token
 * @param certificateSerialNumber Número de serie del certificado
 * @param data Datos a firmar (generalmente el hash del documento)
 * @param pin PIN para desbloquear el token
 * @returns Resultado de la firma
 */
export async function signWithCertificate(
  provider: TokenProvider, 
  certificateSerialNumber: string,
  data: string,
  pin: string
): Promise<SignatureResult> {
  try {
    // Utilizamos la función general de firma
    const result = await signData(data, certificateSerialNumber, pin);
    return result;
  } catch (error: any) {
    console.error("Error en signWithCertificate:", error);
    throw new Error(`Error al firmar con certificado: ${error.message}`);
  }
}

/**
 * Firma datos utilizando el certificado seleccionado
 * @param data Datos a firmar (generalmente un hash)
 * @param certificateSerialNumber Número de serie del certificado a usar
 * @param pin PIN de acceso al token
 * @returns Promise<SignatureResult> Resultado de la firma
 */
export async function signData(
  data: string,
  certificateSerialNumber: string,
  pin: string
): Promise<SignatureResult> {
  return new Promise<SignatureResult>((resolve, reject) => {
    if (!window.firmaDigitalChile) {
      reject(new Error('La extensión de firma digital no está disponible'));
      return;
    }
    
    if (!data) {
      reject(new Error('Los datos a firmar no pueden estar vacíos'));
      return;
    }
    
    if (!certificateSerialNumber) {
      reject(new Error('Debe especificar un certificado para firmar'));
      return;
    }
    
    if (!pin) {
      reject(new Error('El PIN no puede estar vacío'));
      return;
    }
    
    // Algoritmo estándar para firmas digitales en Chile
    const algorithm = 'SHA256withRSA';
    
    console.info(`Iniciando firma de datos con certificado: ${certificateSerialNumber.substring(0, 8)}...`);
    
    window.firmaDigitalChile.signData({
      data,
      certificateSerialNumber,
      pin,
      algorithm
    })
      .then((result) => {
        console.info("Firma completada correctamente");
        
        const signatureResult: SignatureResult = {
          signature: result.signature,
          certificate: result.certificate,
          timestamp: result.timestamp || new Date().toISOString(),
          provider: mapProviderFromIssuer(result.issuer),
          algorithm: result.algorithm || algorithm
        };
        
        resolve(signatureResult);
      })
      .catch((err: Error) => {
        console.error("Error al firmar datos:", err);
        reject(new Error(`Error al firmar datos: ${err.message}`));
      });
  });
}

/**
 * Verifica una firma digital
 * @param originalData Datos originales que fueron firmados
 * @param signatureResult Resultado de la firma a verificar
 * @returns Promise<boolean> true si la firma es válida
 */
export async function verifySignature(
  originalData: string,
  signatureResult: SignatureResult
): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    if (!window.firmaDigitalChile) {
      reject(new Error('La extensión de firma digital no está disponible'));
      return;
    }
    
    if (!originalData) {
      reject(new Error('Los datos originales no pueden estar vacíos'));
      return;
    }
    
    if (!signatureResult || !signatureResult.signature || !signatureResult.certificate) {
      reject(new Error('El resultado de la firma es inválido'));
      return;
    }
    
    console.info("Verificando firma digital...");
    
    window.firmaDigitalChile.verifySignature({
      originalData,
      signature: signatureResult.signature,
      certificate: signatureResult.certificate,
      algorithm: signatureResult.algorithm
    })
      .then((result) => {
        console.info(`Resultado de verificación: ${result.valid ? 'Válida' : 'Inválida'}`);
        resolve(result.valid);
      })
      .catch((err: Error) => {
        console.error("Error al verificar firma:", err);
        reject(new Error(`Error al verificar firma: ${err.message}`));
      });
  });
}

/**
 * Obtiene el sello de tiempo de un servidor TSA acreditado
 * @param signatureResult Resultado de la firma a sellar
 * @returns Promise<string> Sello de tiempo en formato base64
 */
export async function getTimestamp(signatureResult: SignatureResult): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!window.firmaDigitalChile) {
      reject(new Error('La extensión de firma digital no está disponible'));
      return;
    }
    
    if (!signatureResult || !signatureResult.signature || !signatureResult.certificate) {
      reject(new Error('El resultado de la firma es inválido'));
      return;
    }
    
    console.info("Solicitando sello de tiempo...");
    
    window.firmaDigitalChile.getTimestamp({
      signature: signatureResult.signature,
      certificate: signatureResult.certificate
    })
      .then((result) => {
        console.info("Sello de tiempo obtenido correctamente");
        resolve(result.timestamp);
      })
      .catch((err: Error) => {
        console.error("Error al obtener sello de tiempo:", err);
        reject(new Error(`Error al obtener sello de tiempo: ${err.message}`));
      });
  });
}

/**
 * Función auxiliar para determinar el proveedor a partir del emisor del certificado
 */
function mapProviderFromIssuer(issuer: string): TokenProvider {
  if (!issuer) {
    console.warn("Emisor de certificado vacío");
    return TokenProvider.UNKNOWN;
  }
  
  issuer = issuer.toLowerCase();
  
  if (issuer.includes('e-cert')) {
    return TokenProvider.ECERT;
  } else if (issuer.includes('e-sign')) {
    return TokenProvider.ESIGN;
  } else if (issuer.includes('toc')) {
    return TokenProvider.TOC;
  } else if (issuer.includes('acepta')) {
    return TokenProvider.ACEPTA;
  } else if (issuer.includes('certinet')) {
    return TokenProvider.CERTINET;
  } else {
    console.warn(`Emisor de certificado desconocido: ${issuer}`);
    return TokenProvider.UNKNOWN;
  }
}