import { apiRequest } from './queryClient';

/**
 * Interfaz para los resultados del análisis forense de documentos
 */
export interface DocumentForensicsResults {
  status: string;
  message: string;
  documentDimensions?: {
    width: number;
    height: number;
  };
  results: {
    document_detected: boolean;
    mrz_detected: boolean;
    mrz_confidence: number;
    uv_features_detected: boolean;
    alterations_detected: boolean;
    alterations_confidence: number;
    overall_authenticity: number;
  };
}

/**
 * Servicio para realizar análisis forense de documentos
 */
export const DocumentForensicsService = {
  /**
   * Analiza un documento utilizando técnicas forenses
   * 
   * @param documentImage - Imagen en formato base64 del documento a analizar
   * @returns Resultados del análisis forense
   */
  async analyzeDocument(documentImage: string): Promise<DocumentForensicsResults> {
    try {
      const response = await apiRequest("POST", "/api/document-forensics/analyze", {
        documentImage
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en el análisis forense');
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error en el análisis forense:", error);
      throw error;
    }
  },
  
  /**
   * Obtiene un mensaje descriptivo del nivel de autenticidad
   * 
   * @param score - Puntuación de autenticidad (0-100)
   * @returns Mensaje descriptivo y nivel de confianza
   */
  getAuthenticityDescription(score: number): { message: string, level: 'high' | 'medium' | 'low' } {
    if (score >= 85) {
      return {
        message: 'Documento altamente confiable',
        level: 'high'
      };
    } else if (score >= 60) {
      return {
        message: 'Documento probablemente auténtico',
        level: 'medium'
      };
    } else {
      return {
        message: 'Documento con baja confiabilidad',
        level: 'low'
      };
    }
  }
};

export default DocumentForensicsService;