/**
 * Módulo de integración con GetAPI.cl para validación de identidad
 * 
 * Este módulo proporciona funciones para verificar la identidad de los usuarios
 * utilizando los servicios de GetAPI.cl.
 * 
 * La documentación de referencia completa está disponible en:
 * https://getapi.cl/identity-validation/
 */

import axios from 'axios';

const API_KEY = process.env.GETAPI_API_KEY;
const API_BASE_URL = 'https://api.getapi.cl';

/**
 * Interfaz para los datos de la persona a validar
 */
export interface PersonData {
  nombre: string;
  apellido: string;
  rut: string;
  fechaNacimiento?: string; // Formato YYYY-MM-DD
  numeroCelular?: string;
  email?: string;
}

/**
 * Respuesta de la verificación de identidad
 */
export interface IdentityVerificationResponse {
  status: 'success' | 'error';
  verified: boolean;
  score: number; // 0-100
  details?: {
    nameMatch?: boolean;
    lastNameMatch?: boolean;
    dateOfBirthMatch?: boolean;
    documentValid?: boolean;
    livingStatus?: 'alive' | 'deceased' | 'unknown';
  };
  message?: string;
  referenceId?: string;
}

/**
 * Opciones de configuración para la verificación
 */
export interface VerificationOptions {
  requiredScore?: number; // Puntaje mínimo para aprobar la verificación (0-100)
  verifyLivingStatus?: boolean; // Verificar si la persona está viva
  strictMode?: boolean; // Modo estricto para validación
}

/**
 * Verifica la identidad de una persona utilizando GetAPI.cl
 * 
 * @param person Datos de la persona a verificar
 * @param options Opciones de verificación
 * @returns Respuesta con el resultado de la verificación
 */
export async function verifyIdentity(
  person: PersonData,
  options: VerificationOptions = { requiredScore: 80, verifyLivingStatus: true, strictMode: false }
): Promise<IdentityVerificationResponse> {
  try {
    // Verificar que tenemos la API key configurada
    if (!API_KEY) {
      throw new Error('GETAPI_API_KEY no está configurada en las variables de entorno');
    }

    // Validar el formato del RUT antes de enviar
    if (!validateRut(person.rut)) {
      return {
        status: 'error',
        verified: false,
        score: 0,
        message: 'El formato del RUT es inválido'
      };
    }

    // Preparar el payload para la API
    const payload = {
      identity: {
        name: person.nombre,
        lastName: person.apellido,
        rut: formatRut(person.rut), // Aseguramos formato estándar XX.XXX.XXX-X
        dateOfBirth: person.fechaNacimiento || '',
        phone: person.numeroCelular || '',
        email: person.email || ''
      },
      options: {
        strictMode: options.strictMode,
        requiredScore: options.requiredScore || 80,
        verifyLivingStatus: options.verifyLivingStatus || true
      }
    };

    // Realizar la llamada a la API
    const response = await axios.post(
      `${API_BASE_URL}/v1/identity/verify`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Procesar la respuesta
    const { data } = response;
    
    return {
      status: 'success',
      verified: data.verified,
      score: data.score,
      details: {
        nameMatch: data.details?.nameMatch,
        lastNameMatch: data.details?.lastNameMatch,
        dateOfBirthMatch: data.details?.dobMatch,
        documentValid: data.details?.documentValid,
        livingStatus: data.details?.livingStatus
      },
      referenceId: data.referenceId
    };
  } catch (error) {
    console.error('Error al verificar identidad con GetAPI:', error);
    
    let errorMessage = 'Error al conectar con el servicio de verificación';
    
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = `Error ${error.response.status}: ${
        error.response.data?.message || 'Error del servicio de verificación'
      }`;
    }
    
    return {
      status: 'error',
      verified: false,
      score: 0,
      message: errorMessage
    };
  }
}

/**
 * Verifica una identidad contra una imagen de documento
 * 
 * @param person Datos de la persona a verificar
 * @param documentImage Base64 de la imagen del documento
 * @param selfieImage Base64 de la selfie (opcional)
 * @returns Respuesta con el resultado de la verificación
 */
export async function verifyIdentityWithDocument(
  person: PersonData,
  documentImage: string,
  selfieImage?: string
): Promise<IdentityVerificationResponse> {
  try {
    // Verificar que tenemos la API key configurada
    if (!API_KEY) {
      throw new Error('GETAPI_API_KEY no está configurada en las variables de entorno');
    }

    // Validar el formato del RUT
    if (!validateRut(person.rut)) {
      return {
        status: 'error',
        verified: false,
        score: 0,
        message: 'El formato del RUT es inválido'
      };
    }

    // Preparar el payload para la API
    const payload = {
      identity: {
        name: person.nombre,
        lastName: person.apellido,
        rut: formatRut(person.rut),
        dateOfBirth: person.fechaNacimiento || '',
        phone: person.numeroCelular || '',
        email: person.email || ''
      },
      document: {
        image: documentImage
      },
      ...(selfieImage && { selfie: { image: selfieImage } })
    };

    // Realizar la llamada a la API
    const response = await axios.post(
      `${API_BASE_URL}/v1/identity/verify-document`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Procesar la respuesta
    const { data } = response;
    
    return {
      status: 'success',
      verified: data.verified,
      score: data.score,
      details: {
        nameMatch: data.details?.nameMatch,
        lastNameMatch: data.details?.lastNameMatch,
        dateOfBirthMatch: data.details?.dobMatch,
        documentValid: data.details?.documentValid
      },
      referenceId: data.referenceId
    };
  } catch (error) {
    console.error('Error al verificar identidad con documento en GetAPI:', error);
    
    let errorMessage = 'Error al conectar con el servicio de verificación';
    
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = `Error ${error.response.status}: ${
        error.response.data?.message || 'Error del servicio de verificación'
      }`;
    }
    
    return {
      status: 'error',
      verified: false,
      score: 0,
      message: errorMessage
    };
  }
}

/**
 * Valida el formato del RUT chileno
 * 
 * @param rut RUT a validar
 * @returns true si el RUT es válido
 */
export function validateRut(rut: string): boolean {
  // Eliminar puntos y guiones
  const cleanRut = rut.replace(/\./g, '').replace('-', '');
  
  // Verificar longitud mínima
  if (cleanRut.length < 2) return false;
  
  // Separar cuerpo y dígito verificador
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toUpperCase();
  
  // Verificar que el cuerpo sean solo números
  if (!/^\d+$/.test(body)) return false;
  
  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body.charAt(i)) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const expectedDV = 11 - (sum % 11);
  const calculatedDV = expectedDV === 11 ? '0' : expectedDV === 10 ? 'K' : expectedDV.toString();
  
  return dv === calculatedDV;
}

/**
 * Formatea un RUT al formato estándar XX.XXX.XXX-X
 * 
 * @param rut RUT a formatear
 * @returns RUT formateado
 */
export function formatRut(rut: string): string {
  // Eliminar puntos y guiones
  let cleanRut = rut.replace(/\./g, '').replace('-', '');
  
  // Separar cuerpo y dígito verificador
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toUpperCase();
  
  // Formatear el cuerpo con puntos
  let formattedBody = '';
  let count = 0;
  
  for (let i = body.length - 1; i >= 0; i--) {
    count++;
    formattedBody = body.charAt(i) + formattedBody;
    if (count === 3 && i !== 0) {
      formattedBody = '.' + formattedBody;
      count = 0;
    }
  }
  
  // Retornar RUT formateado
  return `${formattedBody}-${dv}`;
}