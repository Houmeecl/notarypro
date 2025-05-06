/**
 * Servicio de integración con Zoho Sign para firma electrónica avanzada
 * 
 * Este servicio maneja la autenticación y operaciones con la API de Zoho Sign
 * permitiendo la creación, envío y gestión de documentos para firma electrónica
 * avanzada cumpliendo con la ley chilena 19.799 sobre documentos electrónicos
 * y firma electrónica.
 */

import axios from 'axios';
import FormData from 'form-data';
import path from 'path';
import { promises as fs } from 'fs';

// Constantes para la API de Zoho
const ZOHO_ACCOUNTS_URL = process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com';
const ZOHO_SIGN_API_URL = process.env.ZOHO_SIGN_API_URL || 'https://sign.zoho.com/api/v1';

// Credenciales de Zoho (obtenidas de variables de entorno)
const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;

// Cache para el token de acceso
let accessToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Interfaces para los campos de firma
 */
export interface SignatureField {
  name: string;
  type: 'signature' | 'initial' | 'date' | 'text' | 'dropdown' | 'checkbox' | 'radio';
  page: number;
  x_coord: number;
  y_coord: number;
  recipient_name?: string;
  recipient_email?: string;
  is_mandatory?: boolean;
  default_value?: string;
}

/**
 * Interfaces para los destinatarios de firma
 */
export interface Recipient {
  name: string;
  email: string;
  phonenumber?: string;
  sign_sequence?: number;
  verification_type?: string;
  role?: "signer" | "viewer" | "approver";
  private_notes?: string;
  action_type?: string;
}

/**
 * Interfaz para la solicitud de firma
 */
export interface SignRequest {
  document_name: string;
  document_path: string;
  recipients: Recipient[];
  fields?: SignatureField[];
  expiry_days?: number;
  reminder_period?: number;
  notes?: string;
  callback_url?: string;
  custom_data?: Record<string, string>;
}

/**
 * Interfaz para la respuesta de la solicitud de firma
 */
export interface SignRequestResponse {
  request_id: string;
  request_status: string;
  document_ids: string[];
  request_name: string;
  expiry_date: string;
  is_sequential: boolean;
  sign_url: string;
  download_url?: string;
}

/**
 * Obtiene un token de acceso para la API de Zoho Sign
 * @returns Token de acceso válido
 */
async function getAccessToken(): Promise<string> {
  const now = Date.now();
  
  // Si tenemos un token válido, lo devolvemos
  if (accessToken && tokenExpiresAt > now) {
    return accessToken;
  }

  try {
    // Asegurarse de que los tokens estén disponibles  
    if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) {
      throw new Error('Faltan credenciales de Zoho Sign. Asegúrese de configurar las variables de entorno: ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN');
    }
    
    // Obtenemos un nuevo token usando el refresh token
    const response = await axios.post(
      `${ZOHO_ACCOUNTS_URL}/oauth/v2/token`,
      null,
      {
        params: {
          refresh_token: ZOHO_REFRESH_TOKEN,
          client_id: ZOHO_CLIENT_ID,
          client_secret: ZOHO_CLIENT_SECRET,
          grant_type: 'refresh_token'
        }
      }
    );

    if (response.data && response.data.access_token) {
      accessToken = response.data.access_token;
      // Zoho tokens typically expire in 1 hour, setting to 55 minutes to be safe
      tokenExpiresAt = now + (response.data.expires_in || 3300) * 1000;
      return accessToken;
    } else {
      throw new Error('No se pudo obtener el token de acceso: Respuesta inválida');
    }
  } catch (error: any) {
    console.error('Error al obtener token de acceso de Zoho:', error.message);
    if (error.response) {
      console.error('Detalles:', error.response.data);
    }
    throw new Error(`Error de autenticación con Zoho: ${error.message}`);
  }
}

/**
 * Crea y envía una solicitud de firma mediante Zoho Sign
 * @param signRequest Datos de la solicitud de firma
 * @returns Respuesta con los datos de la solicitud creada
 */
export async function createSigningRequest(signRequest: SignRequest): Promise<SignRequestResponse> {
  try {
    const token = await getAccessToken();
    
    const formData = new FormData();
    formData.append('document_name', signRequest.document_name);
    
    // Adjuntar el documento
    const documentData = await fs.readFile(signRequest.document_path);
    formData.append('file', documentData, path.basename(signRequest.document_path));
    
    // Configurar destinatarios
    signRequest.recipients.forEach((recipient, index) => {
      formData.append(`recipients[${index}][email]`, recipient.email);
      formData.append(`recipients[${index}][name]`, recipient.name);
      
      if (recipient.phonenumber) {
        formData.append(`recipients[${index}][phonenumber]`, recipient.phonenumber);
      }
      
      if (recipient.sign_sequence) {
        formData.append(`recipients[${index}][sign_sequence]`, recipient.sign_sequence.toString());
      }
      
      if (recipient.verification_type) {
        formData.append(`recipients[${index}][verification_type]`, recipient.verification_type);
      }
      
      if (recipient.role) {
        formData.append(`recipients[${index}][role]`, recipient.role);
      }
      
      if (recipient.private_notes) {
        formData.append(`recipients[${index}][private_notes]`, recipient.private_notes);
      }
      
      if (recipient.action_type) {
        formData.append(`recipients[${index}][action_type]`, recipient.action_type);
      }
    });
    
    // Configurar campos de firma
    if (signRequest.fields && signRequest.fields.length > 0) {
      signRequest.fields.forEach((field, index) => {
        formData.append(`field_data[${index}][field_name]`, field.name);
        formData.append(`field_data[${index}][field_type]`, field.type);
        formData.append(`field_data[${index}][page_no]`, field.page.toString());
        formData.append(`field_data[${index}][x_coord]`, field.x_coord.toString());
        formData.append(`field_data[${index}][y_coord]`, field.y_coord.toString());
        
        if (field.recipient_email) {
          formData.append(`field_data[${index}][recipient_email]`, field.recipient_email);
        }
        
        if (field.is_mandatory !== undefined) {
          formData.append(`field_data[${index}][is_mandatory]`, field.is_mandatory ? 'true' : 'false');
        }
        
        if (field.default_value) {
          formData.append(`field_data[${index}][default_value]`, field.default_value);
        }
      });
    }
    
    // Configuración adicional
    if (signRequest.expiry_days) {
      formData.append('expiry_days', signRequest.expiry_days.toString());
    }
    
    if (signRequest.reminder_period) {
      formData.append('reminder_period', signRequest.reminder_period.toString());
    }
    
    if (signRequest.notes) {
      formData.append('notes', signRequest.notes);
    }
    
    if (signRequest.callback_url) {
      formData.append('callback_url', signRequest.callback_url);
    }
    
    // Datos personalizados
    if (signRequest.custom_data) {
      Object.entries(signRequest.custom_data).forEach(([key, value]) => {
        formData.append(`custom_data[${key}]`, value);
      });
    }
    
    const response = await axios.post(
      `${ZOHO_SIGN_API_URL}/requests`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Zoho-oauthtoken ${token}`
        }
      }
    );
    
    if (response.data && response.data.requests) {
      return {
        request_id: response.data.requests.request_id,
        request_status: response.data.requests.request_status,
        document_ids: response.data.requests.document_ids || [],
        request_name: response.data.requests.request_name,
        expiry_date: response.data.requests.expiry_date,
        is_sequential: response.data.requests.is_sequential,
        sign_url: response.data.requests.sign_url,
        download_url: response.data.requests.download_link
      };
    } else {
      throw new Error('Respuesta inválida de Zoho Sign API');
    }
  } catch (error: any) {
    console.error('Error al crear solicitud de firma en Zoho Sign:', error.message);
    if (error.response) {
      console.error('Detalles:', error.response.data);
    }
    throw new Error(`Error al crear solicitud de firma: ${error.message}`);
  }
}

/**
 * Obtiene el estado actual de una solicitud de firma
 * @param requestId ID de la solicitud de firma
 * @returns Estado actual de la solicitud
 */
export async function getSigningRequestStatus(requestId: string): Promise<any> {
  try {
    const token = await getAccessToken();
    
    const response = await axios.get(
      `${ZOHO_SIGN_API_URL}/requests/${requestId}`,
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${token}`
        }
      }
    );
    
    return response.data.requests;
  } catch (error: any) {
    console.error('Error al obtener estado de solicitud en Zoho Sign:', error.message);
    if (error.response) {
      console.error('Detalles:', error.response.data);
    }
    throw new Error(`Error al obtener estado de solicitud: ${error.message}`);
  }
}

/**
 * Descarga un documento firmado de Zoho Sign
 * @param requestId ID de la solicitud de firma
 * @param documentId ID del documento
 * @param outputPath Ruta donde se guardará el documento descargado
 * @returns Ruta del archivo descargado
 */
export async function downloadSignedDocument(
  requestId: string,
  documentId: string,
  outputPath: string
): Promise<string> {
  try {
    const token = await getAccessToken();
    
    const response = await axios.get(
      `${ZOHO_SIGN_API_URL}/requests/${requestId}/documents/${documentId}/pdf`,
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${token}`
        },
        responseType: 'arraybuffer'
      }
    );
    
    await fs.writeFile(outputPath, response.data);
    return outputPath;
  } catch (error: any) {
    console.error('Error al descargar documento firmado de Zoho Sign:', error.message);
    if (error.response) {
      console.error('Detalles:', error.response.data);
    }
    throw new Error(`Error al descargar documento firmado: ${error.message}`);
  }
}

/**
 * Recordatorio a los firmantes de completar la firma
 * @param requestId ID de la solicitud de firma
 * @returns Respuesta de la API
 */
export async function sendReminder(requestId: string): Promise<any> {
  try {
    const token = await getAccessToken();
    
    const response = await axios.post(
      `${ZOHO_SIGN_API_URL}/requests/${requestId}/reminder`,
      {},
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error al enviar recordatorio en Zoho Sign:', error.message);
    if (error.response) {
      console.error('Detalles:', error.response.data);
    }
    throw new Error(`Error al enviar recordatorio: ${error.message}`);
  }
}

/**
 * Cancela una solicitud de firma
 * @param requestId ID de la solicitud de firma
 * @returns Respuesta de la API
 */
export async function cancelSigningRequest(requestId: string): Promise<any> {
  try {
    const token = await getAccessToken();
    
    const response = await axios.delete(
      `${ZOHO_SIGN_API_URL}/requests/${requestId}`,
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error al cancelar solicitud en Zoho Sign:', error.message);
    if (error.response) {
      console.error('Detalles:', error.response.data);
    }
    throw new Error(`Error al cancelar solicitud: ${error.message}`);
  }
}

/**
 * Verifica la autenticación con Zoho Sign
 * @returns true si la autenticación es exitosa
 */
export async function verifyZohoAuthentication(): Promise<boolean> {
  try {
    await getAccessToken();
    return true;
  } catch (error) {
    return false;
  }
}