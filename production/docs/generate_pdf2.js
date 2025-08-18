import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import MarkdownIt from 'markdown-it';

// Obtener el directorio actual cuando se usa ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar markdown-it con opciones
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true
});

async function generatePDF() {
  console.log('Generando PDF del manual técnico usando pdfkit...');
  
  const mdFilePath = path.join(__dirname, 'VecinosExpress_Manual_Tecnico.md');
  const pdfFilePath = path.join(__dirname, 'VecinosExpress_Manual_Tecnico.pdf');
  
  try {
    // Leer el archivo markdown
    const markdownContent = fs.readFileSync(mdFilePath, 'utf-8');
    
    // Convertir markdown a HTML
    const htmlContent = md.render(markdownContent);
    
    // Crear un documento PDF
    const doc = new PDFDocument({
      margins: { top: 50, bottom: 50, left: 72, right: 72 },
      info: {
        Title: 'Manual Técnico: VecinosExpress',
        Author: 'Sistema VecinosExpress',
        Subject: 'Documentación técnica',
        Keywords: 'manual, técnico, sistema, documentación',
        CreationDate: new Date()
      }
    });
    
    // Stream el PDF a un archivo
    const stream = fs.createWriteStream(pdfFilePath);
    doc.pipe(stream);
    
    // Crear una versión simplificada para PDF
    // Nota: Esto es una solución básica ya que pdfkit no soporta renderizado de HTML directamente
    doc.fontSize(22).text('Manual Técnico: VecinosExpress', { align: 'center' });
    doc.moveDown(2);
    
    // Extraer secciones principales y textos
    const lines = markdownContent.split('\n');
    let currentFontSize = 12;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Encabezados
      if (line.startsWith('# ')) {
        doc.addPage();
        doc.fontSize(20).text(line.replace('# ', '').trim(), { align: 'center' });
        doc.moveDown(1);
        currentFontSize = 12;
      } else if (line.startsWith('## ')) {
        doc.moveDown(1);
        doc.fontSize(16).text(line.replace('## ', '').trim(), { underline: true });
        doc.moveDown(0.5);
        currentFontSize = 12;
      } else if (line.startsWith('### ')) {
        doc.moveDown(0.5);
        doc.fontSize(14).text(line.replace('### ', '').trim(), { underline: true });
        doc.moveDown(0.5);
        currentFontSize = 12;
      } else if (line.startsWith('```')) {
        // Bloques de código
        i++; // Saltar la línea ```
        let codeBlock = '';
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeBlock += lines[i] + '\n';
          i++;
        }
        doc.fontSize(10).font('Courier').text(codeBlock, { align: 'left' });
        doc.font('Helvetica').fontSize(currentFontSize);
        doc.moveDown(0.5);
      } else if (line.trim().startsWith('- ')) {
        // Listas
        doc.fontSize(currentFontSize).text(line.trim(), { indent: 10 });
      } else if (line.trim() !== '') {
        // Texto normal
        doc.fontSize(currentFontSize).text(line.trim());
      } else {
        // Línea en blanco
        doc.moveDown(0.5);
      }
    }
    
    // Finalizar el documento
    doc.end();
    
    // Esperar a que se complete la escritura
    return new Promise((resolve) => {
      stream.on('finish', () => {
        console.log(`PDF generado correctamente: ${pdfFilePath}`);
        resolve(pdfFilePath);
      });
    });
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