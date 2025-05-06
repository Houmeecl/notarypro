/**
 * Definición de tipos para la API de firma digital 
 * para Chile según Ley 19.799
 */

interface Certificate {
  serialNumber?: string;
  serial?: string;
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
}

interface SignDataOptions {
  data: string;
  certificateSerialNumber: string;
  pin: string;
  algorithm?: string;
}

interface SignatureResult {
  signature: string;
  certificate: string;
  timestamp?: string;
  issuer: string;
  algorithm?: string;
}

interface VerifySignatureOptions {
  originalData: string;
  signature: string;
  certificate: string;
  algorithm?: string;
}

interface VerifySignatureResult {
  valid: boolean;
  details?: string;
}

interface TimestampOptions {
  signature: string;
  certificate: string;
}

interface TimestampResult {
  timestamp: string;
  provider?: string;
}

/**
 * Interfaz para la extensión de firma digital
 */
interface FirmaDigitalChile {
  /**
   * Verifica si la extensión está disponible y funcional
   */
  isAvailable(): Promise<boolean>;
  
  /**
   * Lista los dispositivos PKCS#11 conectados
   */
  listDevices(): Promise<string[]>;
  
  /**
   * Obtiene los certificados disponibles en el dispositivo
   * @param pin PIN de acceso al dispositivo
   */
  getCertificates(pin: string): Promise<Certificate[]>;
  
  /**
   * Firma datos utilizando el certificado seleccionado
   * @param options Opciones para la firma
   */
  signData(options: SignDataOptions): Promise<SignatureResult>;
  
  /**
   * Verifica una firma digital
   * @param options Opciones para la verificación
   */
  verifySignature(options: VerifySignatureOptions): Promise<VerifySignatureResult>;
  
  /**
   * Obtiene un sello de tiempo de un servidor TSA acreditado
   * @param options Opciones para el sello de tiempo
   */
  getTimestamp(options: TimestampOptions): Promise<TimestampResult>;
}

declare global {
  interface Window {
    /**
     * API de firma digital para Chile
     */
    firmaDigitalChile?: FirmaDigitalChile;
  }
}