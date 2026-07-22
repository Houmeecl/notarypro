/**
 * Utilidad para convertir terminología presencial a remota en documentos legales
 */

// Mapeo de términos presenciales a sus equivalentes remotos
const PRESENTIAL_TO_REMOTE_TERMS: Record<string, string> = {
  // Términos generales
  'presencial': 'remoto',
  'presencialmente': 'remotamente',
  'en persona': 'por videoconferencia',
  'físicamente': 'virtualmente',
  'comparecer físicamente': 'comparecer virtualmente',
  'comparecencia física': 'comparecencia virtual',
  'reunión presencial': 'videoconferencia',
  'presente físicamente': 'presente virtualmente',
  'asistir personalmente': 'asistir por videollamada',
  'acudir a la oficina': 'conectarse a la sesión virtual',
  'en las oficinas': 'a través de la plataforma digital',
  'presencia física': 'presencia virtual',
  'de forma presencial': 'de forma telemática',
  
  // Términos notariales específicos
  'ante notario': 'ante certificador en línea',
  'notario público': 'certificador digital',
  'oficina notarial': 'plataforma de certificación digital',
  'despacho notarial': 'servicio de certificación en línea',
  'sede notarial': 'sesión de certificación remota',
  'notaría': 'certificación en línea',
  'acto notarial presencial': 'acto notarial remoto',
  'escritura pública presencial': 'escritura pública electrónica',
  'firma manuscrita': 'firma electrónica avanzada',
  'acta notarial física': 'acta notarial digital',
  'testimonio físico': 'testimonio digital',
  'diligencia presencial': 'diligencia remota',
  'documento físico': 'documento electrónico',
  'original físico': 'original digital',
  'copia física': 'copia digital',
  'papel': 'formato digital',
  'firmar en papel': 'firmar electrónicamente',
  'sello notarial físico': 'sello electrónico certificado',
  'estampar sello': 'aplicar sello electrónico',
  'rúbrica manuscrita': 'firma digital certificada',
};

/**
 * Convierte texto con terminología presencial a su equivalente remoto
 * @param text - Texto a convertir
 * @returns Texto con terminología remota
 */
export function convertPresentialToRemote(text: string): string {
  let convertedText = text;
  
  // Reemplazar todos los términos presenciales por sus equivalentes remotos
  for (const [presential, remote] of Object.entries(PRESENTIAL_TO_REMOTE_TERMS)) {
    // Usa una expresión regular para hacer coincidir el término completo y con distinción entre mayúsculas/minúsculas
    const regex = new RegExp(`\\b${presential}\\b`, 'gi');
    convertedText = convertedText.replace(regex, (match) => {
      // Preservar el caso (mayúscula/minúscula)
      if (match === match.toLowerCase()) {
        return remote;
      } else if (match === match.toUpperCase()) {
        return remote.toUpperCase();
      } else if (match[0] === match[0].toUpperCase()) {
        return remote.charAt(0).toUpperCase() + remote.slice(1);
      }
      return remote;
    });
  }
  
  return convertedText;
}

/**
 * Analiza un texto y devuelve los términos presenciales identificados
 * @param text - Texto a analizar
 * @returns Array de términos presenciales encontrados
 */
export function identifyPresentialTerms(text: string): string[] {
  const foundTerms: string[] = [];
  
  for (const presential of Object.keys(PRESENTIAL_TO_REMOTE_TERMS)) {
    const regex = new RegExp(`\\b${presential}\\b`, 'gi');
    if (regex.test(text)) {
      foundTerms.push(presential);
    }
  }
  
  return foundTerms;
}

/**
 * Genera un informe de los cambios que se harían al convertir la terminología
 * @param text - Texto original a analizar
 * @returns Objeto con la lista de cambios propuestos
 */
export function generateConversionReport(text: string): { 
  totalTermsFound: number, 
  uniqueTermsFound: number,
  termDetails: Array<{ original: string, replacement: string, count: number }>
} {
  const termCounts: Record<string, number> = {};
  
  // Contar ocurrencias de cada término
  for (const presential of Object.keys(PRESENTIAL_TO_REMOTE_TERMS)) {
    const regex = new RegExp(`\\b${presential}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      termCounts[presential] = matches.length;
    }
  }
  
  // Generar detalles de términos
  const termDetails = Object.entries(termCounts).map(([term, count]) => ({
    original: term,
    replacement: PRESENTIAL_TO_REMOTE_TERMS[term],
    count
  }));
  
  // Calcular estadísticas
  const totalTermsFound = termDetails.reduce((sum, item) => sum + item.count, 0);
  const uniqueTermsFound = termDetails.length;
  
  return {
    totalTermsFound,
    uniqueTermsFound,
    termDetails
  };
}

/**
 * Verifica si un documento requiere conversión a terminología remota
 * @param text - Texto del documento a verificar
 * @returns true si se encontraron términos presenciales, false en caso contrario
 */
export function documentRequiresConversion(text: string): boolean {
  return identifyPresentialTerms(text).length > 0;
}