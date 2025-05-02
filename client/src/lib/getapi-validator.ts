/**
 * Cliente para la API de GetAPI.cl
 * 
 * Este archivo proporciona utilidades para validar identidad
 * mediante la API de GetAPI.cl
 */

import axios from 'axios';

// Tipos para las opciones de validación
export interface ValidationOptions {
  strictMode?: boolean;
  requiredScore?: number;
  verifyLivingStatus?: boolean;
}

// Tipos para la respuesta de la API
export interface ValidationResponse {
  success: boolean;
  score?: number;
  message?: string;
  validatedFields?: string[];
  errors?: string[];
  data?: any;
}

// Cliente para validación de identidad
class GetAPIValidator {
  private apiBaseUrl: string = '/api/identity';
  
  /**
   * Validación básica de identidad usando RUT y nombre
   * 
   * @param rut RUT de la persona a validar
   * @param nombre Nombre de la persona
   * @param apellido Apellido de la persona
   * @param options Opciones adicionales de validación
   */
  async validateIdentity(
    rut: string, 
    nombre: string, 
    apellido: string, 
    options: ValidationOptions = {}
  ): Promise<ValidationResponse> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/verify`, {
        rut,
        nombre,
        apellido,
        options: {
          strictMode: options.strictMode ?? true,
          requiredScore: options.requiredScore ?? 80,
          verifyLivingStatus: options.verifyLivingStatus ?? false
        }
      });
      
      return response.data;
    } catch (error) {
      console.error("Error validando identidad:", error);
      
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data?.message || 'Error en la validación de identidad',
          errors: [error.response.data?.message || error.message]
        };
      }
      
      return {
        success: false,
        message: 'Error de conexión con el servicio de validación',
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }
  
  /**
   * Validación de identidad con documento
   * 
   * @param formData FormData con los datos del documento y la identidad
   */
  async validateWithDocument(formData: FormData): Promise<ValidationResponse> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/verify-document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error("Error validando documento:", error);
      
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data?.message || 'Error en la validación del documento',
          errors: [error.response.data?.message || error.message]
        };
      }
      
      return {
        success: false,
        message: 'Error de conexión con el servicio de validación',
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }
  
  /**
   * Extracción de información desde un documento
   * 
   * @param documentImage Imagen del documento en formato Base64 o Blob
   */
  async extractDocumentInfo(documentImage: Blob | string): Promise<ValidationResponse> {
    try {
      const formData = new FormData();
      
      if (typeof documentImage === 'string') {
        // Convertir base64 a Blob
        const response = await fetch(documentImage);
        const blob = await response.blob();
        formData.append('documentImage', blob, 'document.jpg');
      } else {
        formData.append('documentImage', documentImage, 'document.jpg');
      }
      
      const response = await axios.post(`${this.apiBaseUrl}/extract-document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error("Error extrayendo información del documento:", error);
      
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data?.message || 'Error al extraer información del documento',
          errors: [error.response.data?.message || error.message]
        };
      }
      
      return {
        success: false,
        message: 'Error de conexión con el servicio de extracción',
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }
  
  /**
   * Formatear un RUT en formato estándar XX.XXX.XXX-X
   * 
   * @param rut RUT a formatear
   */
  formatRut(rut: string): string {
    // Eliminar puntos y guiones
    let value = rut.replace(/\./g, '').replace(/-/g, '').trim().toLowerCase();
    
    // Verificar si tiene dígito verificador
    if (value.length <= 1) {
      return value;
    }
    
    // Extraer dígito verificador
    const dv = value.substring(value.length - 1);
    const rutBody = value.substring(0, value.length - 1);
    
    // Aplicar formato a la parte numérica
    let formatted = rutBody.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    // Retornar con formato XX.XXX.XXX-X
    return `${formatted}-${dv}`;
  }
}

export const getAPIValidator = new GetAPIValidator();