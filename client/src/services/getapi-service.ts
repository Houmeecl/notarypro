/**
 * Servicio para integración con GetAPI.cl - API de verificación
 * de identidad y validación de documentos chilenos con biometría
 */
import axios from "axios";
import { BiometricVerificationResult } from "../components/verification/BiometricVerification";

// Tipos para la API
export interface GetApiVerifyDocumentRequest {
  documentImage: string; // Base64 de la imagen del documento
  selfieImage?: string;  // Base64 de la selfie (opcional)
  rut?: string;          // RUT a verificar (opcional)
  verificationType: "document" | "selfie" | "both";
}

export interface GetApiVerifyDocumentResponse {
  success: boolean;
  score: number;
  document_data?: {
    document_type: string;
    document_number: string;
    full_name: string;
    nationality: string;
    birth_date: string;
    issue_date: string;
    expiry_date: string;
  };
  face_match?: {
    matched: boolean;
    score: number;
  };
  verification_id: string;
  timestamp: string;
}

/**
 * Clase para interactuar con la API de GetAPI.cl para
 * verificación de identidad biométrica
 */
class GetApiService {
  private baseUrl: string = "https://api.getapi.cl/v1";
  private apiKey: string = process.env.GETAPI_API_KEY || "";
  
  /**
   * Verifica si la API key está configurada
   */
  public isConfigured(): boolean {
    return this.apiKey !== "";
  }
  
  /**
   * Establece la API key para GetAPI.cl
   * @param apiKey Clave de API de GetAPI.cl
   */
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }
  
  /**
   * Verifica un documento de identidad y/o selfie
   * @param params Parámetros de verificación
   * @returns Resultado de la verificación
   */
  public async verifyDocument(
    params: GetApiVerifyDocumentRequest
  ): Promise<BiometricVerificationResult> {
    try {
      // En un entorno real, aquí se haría la llamada a la API
      // Por ahora, simulamos una respuesta exitosa
      
      // Simulación de retraso de red
      await this.delay(3000);
      
      // Respuesta simulada
      const apiResponse: GetApiVerifyDocumentResponse = {
        success: true,
        score: 96.8,
        document_data: {
          document_type: "CÉDULA DE IDENTIDAD",
          document_number: "17.254.336-8",
          full_name: "EDUARDO ANTONIO VENEGAS BERRÍOS",
          nationality: "CHILENA",
          birth_date: "1989-06-15",
          issue_date: "2022-03-10",
          expiry_date: "2032-03-09"
        },
        face_match: params.verificationType !== "document" ? {
          matched: true,
          score: 95.2
        } : undefined,
        verification_id: "VX" + Math.floor(Math.random() * 1000000),
        timestamp: new Date().toISOString()
      };
      
      // Convertir la respuesta de la API al formato interno
      return this.convertApiResponse(apiResponse, params.verificationType);
    } catch (error) {
      console.error("Error verifying document with GetAPI:", error);
      throw new Error("Error en la verificación de identidad: " + 
                     (error instanceof Error ? error.message : "Error desconocido"));
    }
  }
  
  /**
   * Convierte la respuesta de la API a nuestro formato interno
   */
  private convertApiResponse(
    response: GetApiVerifyDocumentResponse,
    verificationType: "document" | "selfie" | "both"
  ): BiometricVerificationResult {
    return {
      verified: response.success,
      score: response.score,
      method: verificationType,
      timestamp: response.timestamp,
      documentData: response.document_data ? {
        documentType: response.document_data.document_type,
        documentNumber: response.document_data.document_number,
        fullName: response.document_data.full_name,
        nationality: response.document_data.nationality,
        birthDate: response.document_data.birth_date,
        issueDate: response.document_data.issue_date,
        expiryDate: response.document_data.expiry_date
      } : undefined
    };
  }
  
  /**
   * Método helper para simular retrasos de red
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Exportar como singleton
export const getApiService = new GetApiService();