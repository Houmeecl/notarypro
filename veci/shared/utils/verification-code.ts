import crypto from 'crypto';

/**
 * Genera un código de verificación único para un documento
 * @param documentId - ID del documento
 * @param title - Título del documento
 * @param timestamp - Timestamp de la firma (opcional)
 * @returns String con código de verificación alfanumérico
 */
export function generateVerificationCode(documentId: number, title: string, timestamp: Date = new Date()): string {
  // Crear un hash basado en varios parámetros para garantizar unicidad
  const data = `${documentId}-${title}-${timestamp.getTime()}-${crypto.randomBytes(8).toString('hex')}`;
  // Generar un hash SHA-256 y tomar los primeros 8 caracteres
  const hash = crypto.createHash('sha256').update(data).digest('hex').substring(0, 8);
  
  // Formatear como código alfanumérico con guiones para mejor legibilidad
  // Formato: XX-XXXX-XX (donde X es alfanumérico)
  return `${hash.substring(0, 2)}-${hash.substring(2, 6)}-${hash.substring(6, 8)}`.toUpperCase();
}

/**
 * Genera una URL para verificar un documento
 * @param code - Código de verificación del documento
 * @returns URL para verificación
 */
export function getVerificationUrl(code: string): string {
  return `/verificar-documento/${code}`;
}

/**
 * Genera un código QR para verificación de documento
 * @param code - Código de verificación del documento
 * @returns String con el código QR en formato SVG
 */
export function generateQRCodeSVG(code: string): string {
  // Esta función generaría el SVG del código QR pero requiere una librería adicional
  // Ejemplo de implementación con una librería ficticia:
  
  // Para simplificar, retornamos un marcador de posición de SVG
  return `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="#ffffff"/>
    <text x="10" y="50" font-family="Arial" font-size="12" fill="#000000">
      QR: ${code}
    </text>
  </svg>`;
}

/**
 * Genera una cadena con datos de firma para un documento
 * @param userId - ID del usuario que firma
 * @param documentId - ID del documento
 * @param verificationCode - Código de verificación
 * @returns Cadena con datos de firma
 */
export function generateSignatureData(userId: number, documentId: number, verificationCode: string): string {
  const timestamp = new Date().toISOString();
  return JSON.stringify({
    userId,
    documentId,
    verificationCode,
    timestamp
  });
}

/**
 * Extrae información de la cadena de datos de firma
 * @param signatureData - Cadena JSON con datos de firma
 * @returns Objeto con datos de la firma
 */
export function parseSignatureData(signatureData: string): {
  userId: number;
  documentId: number;
  verificationCode: string;
  timestamp: string;
} {
  try {
    return JSON.parse(signatureData);
  } catch (error) {
    throw new Error('Formato de datos de firma inválido');
  }
}