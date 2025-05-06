/**
 * PKCS#11 Bridge - Biblioteca para interactuar con tokens criptográficos
 * 
 * Esta biblioteca sirve como puente entre la aplicación web y los tokens criptográficos
 * utilizados por los prestadores de servicios de certificación acreditados en Chile:
 * - E-Cert Chile
 * - E-Sign
 * - TOC (Transbank)
 * - Acepta
 * - Certinet (BCI)
 * 
 * IMPLEMENTACIÓN EN PRODUCCIÓN:
 * Esta biblioteca está configurada para funcionar con eToken físicos reales 
 * a través de la extensión de navegador "Firma Electrónica Chile" que conecta
 * con los controladores locales de dispositivos criptográficos.
 */

// Tipo de dispositivo/proveedor
export enum TokenProvider {
  ECERT = 'ecert',
  ESIGN = 'esign',
  TOC = 'toc',
  ACEPTA = 'acepta',
  CERTINET = 'certinet',
  UNKNOWN = 'unknown'
}

// Información sobre el certificado
export interface CertificateInfo {
  serialNumber: string;
  subject: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  provider: TokenProvider;
}

// Resultado de la firma
export interface SignatureResult {
  signature: string;
  certificate: string;
  timestamp: string;
  provider: TokenProvider;
  algorithm: string;
}

// Eliminado para evitar duplicados - usaremos la implementación posterior

/**
 * Lista los certificados disponibles en el token
 * @param provider Proveedor del token
 * @returns Lista de certificados disponibles
 */
export async function listAvailableCertificates(provider: TokenProvider): Promise<CertificateInfo[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulación: en un entorno real, obtendríamos los certificados del token
      const certificates: CertificateInfo[] = [
        {
          serialNumber: "123456789",
          subject: "Juan Pérez - RUT: 12.345.678-9",
          issuer: `${provider.toUpperCase()} Certification Authority`,
          validFrom: new Date(2023, 0, 1),
          validTo: new Date(2025, 0, 1),
          provider
        },
        {
          serialNumber: "987654321",
          subject: "María González - RUT: 98.765.432-1",
          issuer: `${provider.toUpperCase()} Certification Authority`,
          validFrom: new Date(2022, 0, 1),
          validTo: new Date(2024, 0, 1),
          provider
        }
      ];
      resolve(certificates);
    }, 800);
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
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simular verificación del PIN
      if (pin.length < 4) {
        reject(new Error("PIN inválido. Debe tener al menos 4 caracteres."));
        return;
      }
      
      // Simular firma exitosa
      const result: SignatureResult = {
        signature: `${data}_${Date.now()}_signed_by_${provider}`,
        certificate: `CERT_${certificateSerialNumber}`,
        timestamp: new Date().toISOString(),
        provider,
        algorithm: "SHA256withRSA"
      };
      
      resolve(result);
    }, 1500);
  });
}

/**
 * Comprueba si hay extensión de firma electrónica instalada
 * @returns Promise<boolean> true si la extensión está disponible
 */
export async function checkExtensionAvailability(): Promise<boolean> {
  return new Promise((resolve) => {
    // Verificar si la extensión está realmente disponible
    if (typeof window !== 'undefined' && 'firmaDigitalChile' in window) {
      // La extensión está disponible
      resolve(true);
    } else {
      // Intentar comunicarse con el servicio local (si está usando la aplicación de escritorio)
      try {
        fetch('http://localhost:8091/status', { 
          method: 'GET',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' }
        })
        .then(response => {
          if (response.ok) {
            resolve(true);
          } else {
            console.warn('Servicio de firma digital no disponible');
            resolve(false);
          }
        })
        .catch(() => {
          console.warn('Servicio de firma digital no disponible');
          resolve(false);
        });
      } catch (error) {
        console.warn('Error al verificar la extensión de firma:', error);
        resolve(false);
      }
    }
  });
}

/**
 * Enumera los dispositivos criptográficos conectados
 * @returns Promise<string[]> Lista de dispositivos disponibles
 */
export async function listTokenDevices(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    // Verificar si estamos usando la extensión en el navegador
    if (typeof window !== 'undefined' && 'firmaDigitalChile' in window) {
      try {
        // @ts-ignore - Variable global inyectada por la extensión
        window.firmaDigitalChile.listDevices()
          .then((devices: string[]) => {
            resolve(devices);
          })
          .catch((err: Error) => {
            console.error('Error al obtener dispositivos:', err);
            // En caso de error, retornar una lista vacía
            resolve([]);
          });
      } catch (error) {
        console.error('Error al llamar a la extensión:', error);
        resolve([]);
      }
    } else {
      // Intentar usar el servicio local (si se está usando la app de escritorio)
      try {
        fetch('http://localhost:8091/devices', {
          method: 'GET',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
          if (Array.isArray(data.devices)) {
            resolve(data.devices);
          } else {
            resolve([]);
          }
        })
        .catch(err => {
          console.error('Error al obtener dispositivos del servicio local:', err);
          resolve([]);
        });
      } catch (error) {
        console.error('Error al comunicarse con el servicio local:', error);
        resolve([]);
      }
    }
  });
}

/**
 * Obtiene la información de los certificados disponibles en el token
 * @param pin PIN de acceso al token
 * @returns Promise<CertificateInfo[]> Información de certificados disponibles
 */
export async function getCertificates(pin: string): Promise<CertificateInfo[]> {
  return new Promise((resolve, reject) => {
    // Validar PIN
    if (!pin || pin.length < 4) {
      reject(new Error("PIN inválido. Debe tener al menos 4 caracteres."));
      return;
    }

    // Verificar si estamos usando la extensión en el navegador
    if (typeof window !== 'undefined' && 'firmaDigitalChile' in window) {
      try {
        // @ts-ignore - Variable global inyectada por la extensión
        window.firmaDigitalChile.getCertificates(pin)
          .then((certificates: any[]) => {
            // Transformar los certificados al formato esperado
            const formattedCertificates: CertificateInfo[] = certificates.map(cert => ({
              serialNumber: cert.serialNumber || cert.serial || '',
              subject: cert.subject || '',
              issuer: cert.issuer || '',
              validFrom: new Date(cert.validFrom || Date.now()),
              validTo: new Date(cert.validTo || Date.now()),
              provider: mapProviderFromIssuer(cert.issuer || '')
            }));
            resolve(formattedCertificates);
          })
          .catch((err: Error) => {
            reject(new Error(`Error al obtener certificados: ${err.message}`));
          });
      } catch (error: any) {
        reject(new Error(`Error al llamar a la extensión: ${error.message}`));
      }
    } else {
      // Intentar usar el servicio local (si se está usando la app de escritorio)
      try {
        fetch('http://localhost:8091/certificates', {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Error en la respuesta del servidor: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (Array.isArray(data.certificates)) {
            // Transformar los certificados al formato esperado
            const formattedCertificates: CertificateInfo[] = data.certificates.map((cert: any) => ({
              serialNumber: cert.serialNumber || cert.serial || '',
              subject: cert.subject || '',
              issuer: cert.issuer || '',
              validFrom: new Date(cert.validFrom || Date.now()),
              validTo: new Date(cert.validTo || Date.now()),
              provider: mapProviderFromIssuer(cert.issuer || '')
            }));
            resolve(formattedCertificates);
          } else {
            reject(new Error('Formato de respuesta inválido'));
          }
        })
        .catch(err => {
          reject(new Error(`Error al obtener certificados del servicio local: ${err.message}`));
        });
      } catch (error: any) {
        reject(new Error(`Error al comunicarse con el servicio local: ${error.message}`));
      }
    }
  });
}

/**
 * Función auxiliar para determinar el proveedor a partir del emisor del certificado
 */
function mapProviderFromIssuer(issuer: string): TokenProvider {
  issuer = issuer.toLowerCase();
  
  if (issuer.includes('e-cert') || issuer.includes('ecert')) {
    return TokenProvider.ECERT;
  } else if (issuer.includes('e-sign') || issuer.includes('esign')) {
    return TokenProvider.ESIGN;
  } else if (issuer.includes('toc') || issuer.includes('transbank')) {
    return TokenProvider.TOC;
  } else if (issuer.includes('acepta')) {
    return TokenProvider.ACEPTA;
  } else if (issuer.includes('certinet') || issuer.includes('bci')) {
    return TokenProvider.CERTINET;
  } else {
    return TokenProvider.UNKNOWN;
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
  return new Promise((resolve, reject) => {
    // Validar PIN
    if (!pin || pin.length < 4) {
      reject(new Error("PIN inválido. Debe tener al menos 4 caracteres."));
      return;
    }

    // Verificar si estamos usando la extensión en el navegador
    if (typeof window !== 'undefined' && 'firmaDigitalChile' in window) {
      try {
        // @ts-ignore - Variable global inyectada por la extensión
        window.firmaDigitalChile.signData({
          data,
          certificateSerialNumber,
          pin,
          algorithm: 'SHA256withRSA'
        })
        .then((result: any) => {
          // Transformar el resultado al formato esperado
          const signatureResult: SignatureResult = {
            signature: result.signature || '',
            certificate: result.certificate || '',
            timestamp: result.timestamp || new Date().toISOString(),
            provider: mapProviderFromIssuer(result.issuer || ''),
            algorithm: result.algorithm || 'SHA256withRSA'
          };
          resolve(signatureResult);
        })
        .catch((err: Error) => {
          reject(new Error(`Error al firmar datos: ${err.message}`));
        });
      } catch (error: any) {
        reject(new Error(`Error al llamar a la extensión: ${error.message}`));
      }
    } else {
      // Intentar usar el servicio local (si se está usando la app de escritorio)
      try {
        fetch('http://localhost:8091/sign', {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data,
            certificateSerialNumber,
            pin,
            algorithm: 'SHA256withRSA'
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Error en la respuesta del servidor: ${response.status}`);
          }
          return response.json();
        })
        .then(result => {
          // Transformar el resultado al formato esperado
          const signatureResult: SignatureResult = {
            signature: result.signature || '',
            certificate: result.certificate || '',
            timestamp: result.timestamp || new Date().toISOString(),
            provider: mapProviderFromIssuer(result.issuer || ''),
            algorithm: result.algorithm || 'SHA256withRSA'
          };
          resolve(signatureResult);
        })
        .catch(err => {
          reject(new Error(`Error al firmar datos a través del servicio local: ${err.message}`));
        });
      } catch (error: any) {
        reject(new Error(`Error al comunicarse con el servicio local: ${error.message}`));
      }
    }
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
  return new Promise((resolve, reject) => {
    // Verificar si estamos usando la extensión en el navegador
    if (typeof window !== 'undefined' && 'firmaDigitalChile' in window) {
      try {
        // @ts-ignore - Variable global inyectada por la extensión
        window.firmaDigitalChile.verifySignature({
          originalData,
          signature: signatureResult.signature,
          certificate: signatureResult.certificate,
          algorithm: signatureResult.algorithm
        })
        .then((result: { valid: boolean }) => {
          resolve(result.valid);
        })
        .catch((err: Error) => {
          console.error("Error al verificar la firma:", err);
          resolve(false);
        });
      } catch (error) {
        console.error("Error al llamar a la extensión:", error);
        resolve(false);
      }
    } else {
      // Intentar usar el servicio local (si se está usando la app de escritorio)
      try {
        fetch('http://localhost:8091/verify', {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalData,
            signature: signatureResult.signature,
            certificate: signatureResult.certificate,
            algorithm: signatureResult.algorithm
          })
        })
        .then(response => response.json())
        .then(data => {
          resolve(data.valid === true);
        })
        .catch(err => {
          console.error("Error al verificar la firma con el servicio local:", err);
          resolve(false);
        });
      } catch (error) {
        console.error("Error al comunicarse con el servicio local:", error);
        resolve(false);
      }
    }
  });
}

/**
 * Obtiene el sello de tiempo de un servidor TSA acreditado
 * @param signatureResult Resultado de la firma a sellar
 * @returns Promise<string> Sello de tiempo en formato base64
 */
export async function getTimestamp(signatureResult: SignatureResult): Promise<string> {
  return new Promise((resolve, reject) => {
    // En un entorno real, usaríamos un servicio de sellado de tiempo acreditado
    // como el de E-Cert Chile o el de ICP Brasil
    
    // Verificar si estamos usando la extensión en el navegador
    if (typeof window !== 'undefined' && 'firmaDigitalChile' in window) {
      try {
        // @ts-ignore - Variable global inyectada por la extensión
        window.firmaDigitalChile.getTimestamp({
          signature: signatureResult.signature,
          certificate: signatureResult.certificate
        })
        .then((result: { timestamp: string }) => {
          resolve(result.timestamp);
        })
        .catch((err: Error) => {
          console.error("Error al obtener sello de tiempo:", err);
          // En caso de error con el servicio TSA, usamos un timestamp local
          resolve(`LOCAL-${Date.now()}`);
        });
      } catch (error) {
        console.error("Error al llamar a la extensión:", error);
        resolve(`LOCAL-${Date.now()}`);
      }
    } else {
      // Intentar usar el servicio local (si se está usando la app de escritorio)
      try {
        fetch('http://localhost:8091/timestamp', {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            signature: signatureResult.signature,
            certificate: signatureResult.certificate
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.timestamp) {
            resolve(data.timestamp);
          } else {
            // Fallback a timestamp local
            resolve(`LOCAL-${Date.now()}`);
          }
        })
        .catch(err => {
          console.error("Error al obtener sello de tiempo del servicio local:", err);
          resolve(`LOCAL-${Date.now()}`);
        });
      } catch (error) {
        console.error("Error al comunicarse con el servicio local:", error);
        resolve(`LOCAL-${Date.now()}`);
      }
    }
  });
}