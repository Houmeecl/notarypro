import * as qrcode from 'qrcode';
import { nanoid } from 'nanoid';

/**
 * Genera un código de verificación para un documento
 * @param documentId ID del documento
 * @param title Título del documento
 * @returns Código de verificación
 */
export function generateVerificationCode(documentId: number, title: string): string {
  // Generar un código aleatorio de 8 caracteres con nanoid
  const randomCode = nanoid(8);
  
  // Convertir el ID del documento a string y rellenarlo con ceros a la izquierda hasta completar 6 caracteres
  const documentIdStr = documentId.toString().padStart(6, '0');
  
  // Concatenar un prefijo, el ID del documento y el código aleatorio
  // El formato final será: CDF-XXXXXX-YYYYYYYY (donde X es el ID del documento y Y es el código aleatorio)
  return `CDF-${documentIdStr}-${randomCode}`;
}

/**
 * Genera los datos de una firma para un documento
 * @param userId ID del usuario que firma
 * @param documentId ID del documento
 * @param verificationCode Código de verificación
 * @returns Objeto con datos de la firma
 */
export function generateSignatureData(userId: number, documentId: number, verificationCode: string): any {
  const timestamp = new Date();
  const formattedDate = timestamp.toISOString();
  
  // Los datos de la firma incluyen información sobre quién firmó, cuándo, y el código de verificación
  return {
    signerId: userId,
    documentId: documentId,
    timestamp: formattedDate,
    verificationCode: verificationCode,
    method: "advanced", // Método de firma (simple, advanced, qualified)
    platform: "web", // Plataforma desde donde se firmó (web, mobile, pos)
    verified: true // La firma ha sido verificada
  };
}

/**
 * Genera un código QR en formato SVG para un código de verificación
 * @param verificationCode Código de verificación
 * @returns String con el SVG del código QR
 */
export function generateQRCodeSVG(verificationCode: string): string {
  try {
    // URL de verificación
    const verificationUrl = `https://www.cerfidoc.cl/verificar-documento/${verificationCode}`;
    
    // Generar el código QR como SVG de forma sincrónica
    const svg = qrcode.toString(verificationUrl, { 
      type: 'svg',
      errorCorrectionLevel: 'H', // Alta corrección de errores
      margin: 1,
      scale: 4,
      color: {
        dark: '#333333', // Color oscuro (hexadecimal)
        light: '#ffffff' // Color claro (hexadecimal)
      }
    });
    
    return svg;
  } catch (error) {
    console.error('Error generando código QR:', error);
    return '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="10" y="50" fill="red">Error QR</text></svg>';
  }
}

/**
 * Genera una representación en HTML de un documento a partir de los datos del formulario y una plantilla
 * @param formData Datos del formulario
 * @param htmlTemplate Plantilla HTML
 * @returns HTML renderizado
 */
export function renderDocumentHTML(formData: any, htmlTemplate: string): string {
  let html = htmlTemplate;
  
  // Reemplazar todas las variables de plantilla (formato: {{variable}}) con los datos del formulario
  if (formData) {
    Object.keys(formData).forEach(key => {
      const value = formData[key] || '';
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value);
    });
  }
  
  // Reemplazar la fecha actual si existe en la plantilla
  const today = new Date();
  const dateStr = today.toLocaleDateString('es-CL');
  html = html.replace(/{{date}}/g, dateStr);
  html = html.replace(/{{currentDate}}/g, dateStr);
  
  // Reemplazar cualquier variable no encontrada con un espacio vacío
  html = html.replace(/{{[^{}]+}}/g, '');
  
  return html;
}

/**
 * Genera una representación en HTML de la zona de firma para un documento
 * @param signatureData Datos de la firma
 * @param verificationCode Código de verificación
 * @param qrCodeSvg SVG del código QR
 * @returns HTML de la zona de firma
 */
export function generateSignatureHTML(signatureData: any, verificationCode: string, qrCodeSvg: string): string {
  const timestamp = new Date(signatureData.timestamp);
  const formattedDate = timestamp.toLocaleDateString('es-CL');
  const formattedTime = timestamp.toLocaleTimeString('es-CL');
  
  return `
    <div class="signature-zone" style="margin-top: 2rem; padding: 1rem; border-top: 1px solid #ccc;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="max-width: 70%;">
          <h3 style="margin: 0; font-size: 1.2rem; color: #333;">Documento firmado electrónicamente</h3>
          <p style="margin: 0.5rem 0; font-size: 0.9rem;">Firmado el ${formattedDate} a las ${formattedTime}</p>
          <p style="margin: 0.5rem 0; font-size: 0.9rem;">Código de verificación: <strong>${verificationCode}</strong></p>
          <p style="margin: 0.5rem 0; font-size: 0.9rem;">Para verificar la validez de este documento, escanee el código QR o visite <a href="https://www.cerfidoc.cl/verificar-documento" style="color: #EC1C24;">www.cerfidoc.cl/verificar-documento</a> e ingrese el código de verificación.</p>
        </div>
        <div style="width: 100px; height: 100px;">
          ${qrCodeSvg}
        </div>
      </div>
    </div>
  `;
}

/**
 * Genera un PDF a partir del HTML del documento y la firma
 * @param documentHTML HTML del documento
 * @param signatureHTML HTML de la firma
 * @returns Promesa con el buffer del PDF
 */
export async function generatePDF(documentHTML: string, signatureHTML: string): Promise<Buffer> {
  // Esta función normalmente usaría una biblioteca como puppeteer o html-pdf
  // Para este proyecto, dejaríamos esta implementación para más adelante
  
  // Placeholder
  return Buffer.from('PDF placeholder');
}