
/**
 * Módulo de gestión de modo funcional para documentos
 * 
 * Este módulo proporciona funciones para habilitar la funcionalidad real
 * en los documentos, asegurando que se procesen y firmen correctamente
 * incluso en entornos de prueba.
 */

import { esFuncionalidadRealActiva, esModoQAActivo, obtenerDatosSimuladosQA } from './funcionalidad-real';

// Tipos para documentos funcionales
export interface DocumentoFuncional {
  id: string;
  titulo: string;
  contenido: string;
  estado: 'BORRADOR' | 'ENVIADO' | 'FIRMADO' | 'RECHAZADO' | 'VENCIDO';
  fechaCreacion: string;
  fechaModificacion?: string;
  fechaFirma?: string;
  firmas?: FirmaDocumento[];
  propietario?: Usuario;
  destinatarios?: Usuario[];
}

interface FirmaDocumento {
  idUsuario: number;
  nombre: string;
  fecha: string;
  metodo: 'SIMPLE' | 'AVANZADA' | 'QR' | 'BIOMETRICA';
  certificado?: string;
}

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  documentoIdentidad?: string;
}

/**
 * Verifica si un documento puede ser procesado en modo funcional
 * 
 * @param documento El documento a verificar
 * @returns {boolean} True si el documento puede procesarse
 */
export function esDocumentoProcesable(documento: DocumentoFuncional): boolean {
  // En modo QA, todos los documentos son procesables
  if (esModoQAActivo()) {
    return true;
  }
  
  // En modo funcional normal, verificar requisitos mínimos
  if (esFuncionalidadRealActiva()) {
    // Verificar que tenga datos mínimos
    if (!documento.id || !documento.titulo || !documento.contenido) {
      return false;
    }
    
    // Verificar estado válido para procesamiento
    return ['BORRADOR', 'ENVIADO'].includes(documento.estado);
  }
  
  // Si no está en modo funcional, retornar false
  return false;
}

/**
 * Asegura que un documento esté en modo funcional,
 * corrigiendo cualquier problema que pudiera tener
 * 
 * @param documento El documento a corregir
 * @returns {DocumentoFuncional} Documento corregido
 */
export function asegurarDocumentoFuncional(documento: Partial<DocumentoFuncional>): DocumentoFuncional {
  // Si no estamos en modo funcional, simplemente retornar el documento convertido
  if (!esFuncionalidadRealActiva()) {
    return {
      id: documento.id || `doc-${Date.now()}`,
      titulo: documento.titulo || 'Documento sin título',
      contenido: documento.contenido || '',
      estado: documento.estado || 'BORRADOR',
      fechaCreacion: documento.fechaCreacion || new Date().toISOString(),
      firmas: documento.firmas || []
    };
  }
  
  // Si estamos en modo funcional, corregir el documento
  const documentoCorregido: DocumentoFuncional = {
    id: documento.id || `doc-${Date.now()}`,
    titulo: documento.titulo || 'Documento funcional',
    contenido: documento.contenido || '<p>Contenido del documento en modo funcional</p>',
    estado: documento.estado || 'BORRADOR',
    fechaCreacion: documento.fechaCreacion || new Date().toISOString(),
    fechaModificacion: documento.fechaModificacion || new Date().toISOString(),
    firmas: documento.firmas || []
  };
  
  // Si está en modo QA y no tiene propietario, añadirlo
  if (esModoQAActiva() && !documento.propietario) {
    documentoCorregido.propietario = {
      id: 1,
      nombre: 'Usuario',
      apellido: 'Funcional',
      email: 'usuario@ejemplo.com',
      documentoIdentidad: '12.345.678-9'
    };
  }
  
  return documentoCorregido;
}

/**
 * Simula la firma de un documento en modo funcional
 * 
 * @param documento El documento a firmar
 * @param metodoFirma El método de firma a utilizar
 * @returns {DocumentoFuncional} Documento firmado
 */
export function firmarDocumentoFuncional(
  documento: DocumentoFuncional,
  metodoFirma: 'SIMPLE' | 'AVANZADA' | 'QR' | 'BIOMETRICA' = 'SIMPLE'
): DocumentoFuncional {
  // Clonar el documento para no modificar el original
  const documentoFirmado: DocumentoFuncional = { ...documento };
  
  // Actualizar el estado y la fecha de firma
  documentoFirmado.estado = 'FIRMADO';
  documentoFirmado.fechaFirma = new Date().toISOString();
  
  // Crear una firma
  const nuevaFirma: FirmaDocumento = {
    idUsuario: 1,
    nombre: 'Usuario Funcional',
    fecha: new Date().toISOString(),
    metodo: metodoFirma
  };
  
  // Si es firma avanzada, añadir certificado
  if (metodoFirma === 'AVANZADA') {
    nuevaFirma.certificado = 'CERT-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  
  // Añadir la firma al documento
  if (!documentoFirmado.firmas) {
    documentoFirmado.firmas = [];
  }
  documentoFirmado.firmas.push(nuevaFirma);
  
  return documentoFirmado;
}

/**
 * Genera documentos de ejemplo para modo funcional
 * 
 * @param cantidad Cantidad de documentos a generar
 * @returns {DocumentoFuncional[]} Array de documentos funcionales
 */
export function generarDocumentosFuncionales(cantidad: number = 3): DocumentoFuncional[] {
  const documentos: DocumentoFuncional[] = [];
  
  const tiposDocumento = [
    'Contrato de Arrendamiento',
    'Poder Simple',
    'Declaración Jurada',
    'Contrato de Trabajo',
    'Finiquito Laboral',
    'Certificado de Residencia'
  ];
  
  const estados: Array<'BORRADOR' | 'ENVIADO' | 'FIRMADO' | 'RECHAZADO' | 'VENCIDO'> = [
    'BORRADOR', 'ENVIADO', 'FIRMADO'
  ];
  
  for (let i = 0; i < cantidad; i++) {
    const tipoDocumento = tiposDocumento[Math.floor(Math.random() * tiposDocumento.length)];
    const estado = estados[Math.floor(Math.random() * estados.length)];
    
    const documento: DocumentoFuncional = {
      id: `doc-${Date.now()}-${i}`,
      titulo: tipoDocumento,
      contenido: `<h1>${tipoDocumento}</h1><p>Este es un documento generado en modo funcional.</p>`,
      estado,
      fechaCreacion: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      propietario: {
        id: 1,
        nombre: 'Usuario',
        apellido: 'Funcional',
        email: 'usuario@ejemplo.com',
        documentoIdentidad: '12.345.678-9'
      }
    };
    
    // Si el documento está firmado, añadir firma
    if (estado === 'FIRMADO') {
      documento.fechaFirma = new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000).toISOString();
      documento.firmas = [{
        idUsuario: 1,
        nombre: 'Usuario Funcional',
        fecha: documento.fechaFirma,
        metodo: Math.random() > 0.5 ? 'SIMPLE' : 'AVANZADA',
        certificado: Math.random() > 0.5 ? 'CERT-' + Math.random().toString(36).substring(2, 10).toUpperCase() : undefined
      }];
    }
    
    documentos.push(documento);
  }
  
  return documentos;
}
