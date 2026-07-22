// Script para convertir el archivo Markdown a PDF
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { mdToPdf } from 'md-to-pdf';

// Obtener el directorio actual cuando se usa ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePDF() {
  console.log('Generando PDF del manual técnico...');
  
  const mdFilePath = path.join(__dirname, 'VecinosExpress_Manual_Tecnico.md');
  const pdfFilePath = path.join(__dirname, 'VecinosExpress_Manual_Tecnico.pdf');
  
  try {
    const pdf = await mdToPdf({ path: mdFilePath }, {
      dest: pdfFilePath,
      pdf_options: {
        format: 'A4',
        margin: '20mm',
        printBackground: true,
        headerTemplate: '<div></div>',
        footerTemplate: '<div style="font-size: 10px; width: 100%; text-align: center; color: #777;">VecinosExpress - Manual Técnico - Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
        displayHeaderFooter: true,
      },
      stylesheet_paths: [path.join(__dirname, 'pdf-style.css')],
      as_html: false
    });
    
    if (pdf) {
      console.log(`PDF generado correctamente: ${pdfFilePath}`);
      return pdfFilePath;
    } else {
      console.error('Error al generar el PDF: No se obtuvo resultado');
      return null;
    }
  } catch (error) {
    console.error('Error al generar el PDF:', error);
    return null;
  }
}

// Ejecutar la función principal
generatePDF().then(filePath => {
  if (filePath) {
    console.log(`PDF generado y listo para descarga: ${filePath}`);
  } else {
    console.error('No se pudo generar el PDF');
  }
});

export { generatePDF };