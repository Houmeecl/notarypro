/**
 * Servicio de notificaciones para enviar información del documento por diversos canales
 * - Email (usando SendGrid)
 * - WhatsApp (simulado/preparado para integrar con API de WhatsApp Business)
 */

import axios from 'axios';

interface EmailData {
  to: string;
  subject: string;
  clientName: string;
  documentType: string;
  documentId: string;
  verificationCode: string;
  documentUrl?: string;
}

interface WhatsAppData {
  to: string;
  clientName: string;
  documentType: string;
  documentId: string;
  verificationCode: string;
  documentUrl?: string;
}

class NotificationService {
  /**
   * Envía un email con información del documento
   * @param data Datos para el email
   * @returns Resultado del envío
   */
  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      // Llamada a la API para enviar el email usando SendGrid
      const response = await axios.post('/api/notifications/send-email', {
        to: data.to,
        subject: data.subject,
        clientName: data.clientName,
        documentType: data.documentType,
        documentId: data.documentId,
        verificationCode: data.verificationCode,
        documentUrl: data.documentUrl || `https://vecinoxpress.cl/verificar/${data.documentId}`
      });
      
      return response.data.success;
    } catch (error) {
      console.error("Error enviando email:", error);
      return false;
    }
  }
  
  /**
   * Envía un mensaje de WhatsApp con información del documento
   * @param data Datos para el mensaje de WhatsApp
   * @returns Resultado del envío
   */
  async sendWhatsApp(data: WhatsAppData): Promise<boolean> {
    try {
      // Normalizar número de teléfono
      const phone = this.normalizePhoneNumber(data.to);
      
      if (!phone) {
        throw new Error("Número de teléfono inválido");
      }
      
      // En una implementación real, aquí se llamaría a la API de WhatsApp Business
      // Por ahora, simulamos la llamada API
      
      // Esta es la llamada que se haría en producción:
      /*
      const response = await axios.post('/api/notifications/send-whatsapp', {
        to: phone,
        clientName: data.clientName,
        documentType: data.documentType,
        documentId: data.documentId,
        verificationCode: data.verificationCode,
        documentUrl: data.documentUrl
      });
      
      return response.data.success;
      */
      
      // Para la versión de demo, generamos un enlace de WhatsApp directo
      const message = `Hola ${data.clientName}, su documento ${data.documentType} ha sido procesado correctamente. ID: ${data.documentId}. Verifíquelo en: ${data.documentUrl || `https://vecinoxpress.cl/verificar/${data.documentId}`}`;
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      
      // Abrimos en una nueva ventana (sólo para demostración)
      window.open(whatsappUrl, '_blank');
      
      return true;
    } catch (error) {
      console.error("Error enviando WhatsApp:", error);
      return false;
    }
  }
  
  /**
   * Normaliza un número de teléfono para el formato internacional
   * @param phone Número de teléfono a normalizar
   * @returns Número normalizado o null si es inválido
   */
  private normalizePhoneNumber(phone: string): string | null {
    try {
      // Eliminar espacios, guiones y paréntesis
      let normalized = phone.replace(/[\s\-\(\)]/g, '');
      
      // Si comienza con +, asumimos que ya está en formato internacional
      if (normalized.startsWith('+')) {
        return normalized;
      }
      
      // Si comienza con 9, asumimos que es un número chileno
      if (normalized.startsWith('9')) {
        return '+569' + normalized;
      }
      
      // Si comienza con 0, eliminamos el 0 inicial
      if (normalized.startsWith('0')) {
        normalized = normalized.substring(1);
      }
      
      // Si comienza con 56, asumimos que es un número chileno sin el +
      if (normalized.startsWith('56')) {
        return '+' + normalized;
      }
      
      // Si no cumple ninguno de los casos anteriores, asumimos que es un número chileno sin el prefijo
      return '+56' + normalized;
    } catch (error) {
      console.error("Error normalizando número de teléfono:", error);
      return null;
    }
  }
}

// Exportar una instancia singleton del servicio
export const notificationService = new NotificationService();