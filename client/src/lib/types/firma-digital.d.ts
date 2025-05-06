/**
 * Declaración de tipos para la extensión Firma Digital Chile
 */

interface FirmaDigitalChile {
  /**
   * Comprueba si la extensión está disponible y funcionando
   */
  isAvailable(): Promise<boolean>;
  
  /**
   * Lista los dispositivos criptográficos conectados
   */
  listDevices(): Promise<string[]>;
  
  /**
   * Obtiene los certificados disponibles en el token
   * @param pin PIN de acceso al token
   */
  getCertificates(pin: string): Promise<{
    serialNumber: string;
    serial?: string;
    subject: string;
    issuer: string;
    validFrom: string;
    validTo: string;
  }[]>;
  
  /**
   * Firma datos con un certificado específico
   */
  signData(options: {
    data: string;
    certificateSerialNumber: string;
    pin: string;
    algorithm: string;
  }): Promise<{
    signature: string;
    certificate: string;
    timestamp: string;
    issuer: string;
    algorithm: string;
  }>;
  
  /**
   * Verifica una firma digital
   */
  verifySignature(options: {
    originalData: string;
    signature: string;
    certificate: string;
    algorithm: string;
  }): Promise<{
    valid: boolean;
  }>;
  
  /**
   * Obtiene un sello de tiempo para una firma
   */
  getTimestamp(options: {
    signature: string;
    certificate: string;
  }): Promise<{
    timestamp: string;
  }>;
  
  /**
   * Versión de la extensión
   */
  version: string;
}

/**
 * Extendemos el objeto Window para incluir la propiedad firmaDigitalChile
 */
interface Window {
  firmaDigitalChile?: FirmaDigitalChile;
}