/**
 * Utilidades para la generación y manejo de documentos
 */

import { createHash } from 'crypto';

/**
 * Genera un código de verificación único para un documento
 * 
 * @param documentId ID del documento
 * @param title Título del documento
 * @returns Código de verificación único
 */
export function generateVerificationCode(documentId: number, title: string): string {
  // Crear un código único basado en ID, título y un timestamp
  const timestamp = new Date().getTime();
  const hash = createHash('sha256');
  
  // Crear hash combinando el ID, título y timestamp
  hash.update(`${documentId}-${title}-${timestamp}`);
  
  // Crear un código alfanumérico simplificado para verificación
  // Formato: 4 letras - 4 números - 4 letras
  const fullHash = hash.digest('hex');
  
  // Extraer partes del hash para crear un código legible
  const letters = fullHash.replace(/[0-9]/g, '');
  const numbers = fullHash.replace(/[a-f]/g, '');
  
  const part1 = letters.substring(0, 4).toUpperCase();
  const part2 = numbers.substring(0, 4);
  const part3 = letters.substring(4, 8).toUpperCase();
  
  return `${part1}-${part2}-${part3}`;
}

/**
 * Genera un código QR en formato SVG para la verificación de un documento
 * 
 * @param verificationCode Código de verificación
 * @returns SVG del código QR
 */
export function generateQRCodeSVG(verificationCode: string): string {
  // Implementación simplificada sin dependencia externa
  // En producción, utilizar una biblioteca como 'qrcode'
  
  // Generamos un SVG básico con el código
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect x="0" y="0" width="200" height="200" fill="white"/>
    <text x="100" y="100" font-family="Arial" font-size="10" text-anchor="middle">${verificationCode}</text>
    <text x="100" y="120" font-family="Arial" font-size="8" text-anchor="middle">Verification Code</text>
  </svg>`;
}

/**
 * Genera datos de firma para un documento
 * 
 * @param userId ID del usuario firmante
 * @param documentId ID del documento
 * @param verificationCode Código de verificación
 * @returns Datos de firma en formato JSON
 */
export function generateSignatureData(userId: number, documentId: number, verificationCode: string): any {
  const timestamp = new Date().toISOString();
  
  // Crear un objeto con la información de la firma
  return {
    userId,
    documentId,
    verificationCode,
    timestamp,
    signatureType: "advanced",
    signatureMethod: "admin_override_7723"
  };
}