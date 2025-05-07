/**
 * Servicio de integración con GetAPI.cl para validación de identidad
 * 
 * Este servicio implementa la integración con la API de validación de identidad
 * de GetAPI.cl (https://getapi.cl/identity-validation/)
 */

import axios from 'axios';
import { createHash } from 'crypto';

// URL base para las API de GetAPI.cl
const GET_API_BASE_URL = 'https://api.getapi.cl/v1';

// Tipos para respuestas de GetAPI
interface GetAPIResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

interface IdentityValidationResponse extends GetAPIResponse {
  data?: {
    documentId: string;
    fullName: string;
    rut?: string;
    nationality?: string;
    birthDate?: string;
    gender?: string;
    expirationDate?: string;
    verificationScore?: number;
    facialMatchScore?: number;
    validationId: string;
  }
}

interface FacialVerificationResponse extends GetAPIResponse {
  data?: {
    matchScore: number;
    liveness: boolean;
    validationId: string;
  }
}

class GetAPIService {
  private apiKey: string;
  
  constructor() {
    // Verificar que tenemos API key
    if (!process.env.GETAPI_API_KEY) {
      console.warn("ADVERTENCIA: GETAPI_API_KEY no está definida en variables de entorno");
    }
    
    this.apiKey = process.env.GETAPI_API_KEY || '';
  }
  
  /**
   * Genera una solicitud a GetAPI con la configuración adecuada
   */
  private async makeRequest(endpoint: string, method: 'GET' | 'POST', data?: any): Promise<any> {
    try {
      // Generar un ID de solicitud único basado en timestamp
      const requestId = `vecinos-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const response = await axios({
        method,
        url: `${GET_API_BASE_URL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
          'X-Request-ID': requestId
        },
        data
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error en solicitud a GetAPI (${endpoint}):`, error);
      
      // Transformar error de axios a formato estándar
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          error: error.response.data?.error || error.message,
          statusCode: error.response.status
        };
      }
      
      // Error genérico
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al contactar GetAPI'
      };
    }
  }
  
  /**
   * Validación de documento de identidad
   * 
   * Envía las imágenes del documento para validar su autenticidad y extraer información
   * 
   * @param frontImage Imagen del frente del documento en base64
   * @param backImage Imagen del reverso del documento en base64 (opcional)
   * @param faceImage Imagen del rostro de la persona en base64 (opcional para comparación)
   */
  async validateIdentityDocument(
    frontImage: string, 
    backImage?: string, 
    faceImage?: string
  ): Promise<IdentityValidationResponse> {
    // Preparar datos para enviar
    const payload: any = {
      documentFront: frontImage.startsWith('data:') ? frontImage : `data:image/jpeg;base64,${frontImage}`
    };
    
    if (backImage) {
      payload.documentBack = backImage.startsWith('data:') ? backImage : `data:image/jpeg;base64,${backImage}`;
    }
    
    if (faceImage) {
      payload.faceImage = faceImage.startsWith('data:') ? faceImage : `data:image/jpeg;base64,${faceImage}`;
    }
    
    // Realizar solicitud a la API
    return this.makeRequest('/identity/validate-document', 'POST', payload);
  }
  
  /**
   * Verificación facial
   * 
   * Compara una imagen de rostro con datos previamente validados
   * 
   * @param faceImage Imagen del rostro en base64
   * @param documentId Identificador del documento (RUT, DNI, etc.)
   * @param sessionId Identificador de sesión para trazabilidad (opcional)
   */
  async verifyFacialIdentity(
    faceImage: string,
    documentId: string,
    sessionId?: string
  ): Promise<FacialVerificationResponse> {
    // Preparar datos para enviar
    const payload = {
      faceImage: faceImage.startsWith('data:') ? faceImage : `data:image/jpeg;base64,${faceImage}`,
      documentId,
      sessionId: sessionId || `session-${Date.now()}`
    };
    
    // Realizar solicitud a la API
    return this.makeRequest('/identity/verify-face', 'POST', payload);
  }
  
  /**
   * Verificación de vitalidad (liveness)
   * 
   * Verifica que la imagen facial corresponde a una persona real y no una fotografía
   * 
   * @param faceImage Imagen del rostro en base64
   * @param sessionId Identificador de sesión para trazabilidad (opcional)
   */
  async verifyLiveness(
    faceImage: string,
    sessionId?: string
  ): Promise<GetAPIResponse> {
    // Preparar datos para enviar
    const payload = {
      faceImage: faceImage.startsWith('data:') ? faceImage : `data:image/jpeg;base64,${faceImage}`,
      sessionId: sessionId || `liveness-${Date.now()}`
    };
    
    // Realizar solicitud a la API
    return this.makeRequest('/identity/verify-liveness', 'POST', payload);
  }
  
  /**
   * Verificación rápida de identidad
   * 
   * Valida la información de identidad básica
   * 
   * @param rut RUT o número de documento
   * @param fullName Nombre completo
   * @param birthDate Fecha de nacimiento (YYYY-MM-DD)
   */
  async quickVerifyIdentity(
    rut: string,
    fullName: string,
    birthDate: string
  ): Promise<GetAPIResponse> {
    // Normalizar RUT (quitar puntos y guión)
    const normalizedRut = rut.replace(/\./g, '').replace(/-/g, '');
    
    // Preparar datos para enviar
    const payload = {
      documentId: normalizedRut,
      fullName,
      birthDate
    };
    
    // Realizar solicitud a la API
    return this.makeRequest('/identity/quick-verify', 'POST', payload);
  }
  
  /**
   * Genera un hash para la verificación de un documento
   * 
   * @param documentData Datos del documento
   * @returns Hash único para el documento
   */
  generateVerificationHash(documentData: any): string {
    const data = typeof documentData === 'string' 
      ? documentData 
      : JSON.stringify(documentData);
    
    return createHash('sha256')
      .update(data)
      .digest('hex');
  }
}

// Exportar instancia singleton
export const getAPIService = new GetAPIService();