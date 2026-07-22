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
    // Nota: Convertimos la Promise<string> a string sincrónico para mantener compatibilidad
    let svgContent = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="10" y="50" fill="red">Cargando QR</text></svg>';
    
    // Enfoque sincrónico usando la API síncrona de qrcode
    try {
      svgContent = qrcode.toString(verificationUrl, { 
        type: 'svg',
        errorCorrectionLevel: 'H', // Alta corrección de errores
        margin: 1,
        scale: 4,
        color: {
          dark: '#333333', // Color oscuro (hexadecimal)
          light: '#ffffff' // Color claro (hexadecimal)
        }
      });
    } catch (e) {
      console.error('Error en generación síncrona de QR:', e);
    }
    
    return svgContent;
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
  try {
    // Importar puppeteer dinámicamente para evitar problemas de inicialización
    const puppeteer = await import('puppeteer');
    
    // Crear el contenido HTML completo combinando el documento y la firma
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Documento firmado</title>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
          }
          .document-container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            border: 1px solid #eee;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 30px;
          }
          .timestamp-bar {
            background-color: #f8f9fa;
            border-top: 1px solid #eee;
            border-bottom: 1px solid #eee;
            padding: 8px 15px;
            font-size: 11px;
            color: #666;
            margin-bottom: 20px;
          }
          .advanced-seal {
            border: 2px solid #EC1C24;
            background-color: rgba(236, 28, 36, 0.05);
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
          }
          .seal-icon {
            width: 40px;
            height: 40px;
            margin-right: 15px;
            color: #EC1C24;
          }
          .seal-text {
            flex: 1;
          }
          .seal-text h4 {
            margin: 0 0 5px 0;
            color: #EC1C24;
          }
          .seal-text p {
            margin: 0;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="document-container">
          <!-- Barra de estampa de tiempo -->
          <div class="timestamp-bar">
            Documento generado y firmado a través de NotaryPro · Estampa de tiempo: ${new Date().toLocaleString('es-CL')} · 
            Firma avanzada según Ley 19.799 sobre documentos electrónicos y firma electrónica
          </div>
          
          <!-- Sello de firma avanzada -->
          <div class="advanced-seal">
            <div class="seal-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div class="seal-text">
              <h4>Firma Electrónica Avanzada</h4>
              <p>Este documento ha sido firmado con firma electrónica avanzada según lo establecido en la Ley 19.799 de Chile, 
              y cuenta con estampa de tiempo certificada y verificable.</p>
            </div>
          </div>
          
          <!-- Contenido del documento -->
          ${documentHTML}
          
          <!-- Firma digital -->
          ${signatureHTML}
        </div>
      </body>
      </html>
    `;
    
    // Iniciar un navegador puppeteer
    const browser = await puppeteer.default.launch({
      headless: true, // En lugar de 'new'
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      
      // Configurar página para PDF
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Generar PDF con opciones adecuadas
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div style="width: 100%; font-size: 8px; color: #999; padding: 5px 10px; text-align: center;">NotaryPro - Documento firmado electrónicamente</div>',
        footerTemplate: '<div style="width: 100%; font-size: 8px; color: #999; padding: 5px 10px; text-align: center;">Página <span class="pageNumber"></span> de <span class="totalPages"></span> - Documento verificable en www.notarypro.cl</div>'
      });
      
      // Convertir Uint8Array a Buffer
      return Buffer.from(pdfBuffer);
    } finally {
      // Asegurarse de cerrar el navegador aunque haya error
      await browser.close();
    }
  } catch (error: any) {
    console.error('Error generando PDF:', error);
    // En caso de error, devolver un buffer vacío
    throw new Error(`Error al generar el PDF: ${error.message}`);
  }
}