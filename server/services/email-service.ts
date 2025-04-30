import { MailService } from '@sendgrid/mail';

const mailService = new MailService();

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable is not set. Email service will not work properly.");
} else {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailConfig {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
}

interface SendGridMailData {
  to: string;
  from: {
    email: string;
    name: string;
  };
  subject: string;
  text: string;
  html: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
}

const FROM_EMAIL = 'notificaciones@cerfidoc.cl';
const FROM_NAME = 'CerfiDoc Notificaciones';

/**
 * Servicio para enviar correos electrónicos usando SendGrid
 */
class EmailService {
  
  /**
   * Envía un correo electrónico transaccional
   */
  async sendEmail(config: EmailConfig): Promise<boolean> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.error("No se puede enviar email: SENDGRID_API_KEY no está configurada");
        return false;
      }
      
      const mailData: SendGridMailData = {
        to: config.to,
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME
        },
        subject: config.subject,
        text: config.text || '',
        html: config.html || '',
        attachments: config.attachments
      };
      
      await mailService.send(mailData);
      
      console.log(`Email enviado exitosamente a ${config.to}`);
      return true;
    } catch (error) {
      console.error('Error enviando email con SendGrid:', error);
      return false;
    }
  }
  
  /**
   * Envía una confirmación de pago con información del documento
   */
  async sendPaymentConfirmation(
    email: string, 
    documentTitle: string, 
    documentId: number,
    paymentAmount: number,
    paymentId: string,
    userName?: string
  ): Promise<boolean> {
    const subject = `Confirmación de pago - ${documentTitle}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #EC1C24; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">CerfiDoc</h1>
        </div>
        
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
          <h2>Confirmación de Pago</h2>
          <p>Estimado/a ${userName || 'Usuario'}:</p>
          
          <p>Hemos recibido correctamente el pago por su documento:</p>
          
          <div style="background-color: #f8f8f8; padding: 15px; margin: 15px 0; border-left: 4px solid #EC1C24;">
            <p><strong>Documento:</strong> ${documentTitle}</p>
            <p><strong>ID de Documento:</strong> ${documentId}</p>
            <p><strong>Monto:</strong> $${paymentAmount} CLP</p>
            <p><strong>ID de Transacción:</strong> ${paymentId}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CL')}</p>
          </div>
          
          <p>Puede acceder a su documento en cualquier momento ingresando a su cuenta en nuestra plataforma.</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://cerfidoc.cl/document-view/${documentId}" style="background-color: #EC1C24; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Ver mi documento</a>
          </div>
          
          <p>Si tiene alguna consulta, no dude en contactarnos respondiendo a este correo o a través de nuestro centro de soporte.</p>
          
          <p>Atentamente,</p>
          <p><strong>Equipo CerfiDoc</strong></p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© ${new Date().getFullYear()} CerfiDoc. Todos los derechos reservados.</p>
          <p>Este es un correo automático, por favor no responda a esta dirección.</p>
        </div>
      </div>
    `;
    
    return this.sendEmail({
      to: email,
      subject,
      html
    });
  }
  
  /**
   * Envía una copia del documento firmado como PDF
   */
  async sendDocumentCopy(
    email: string,
    documentTitle: string,
    documentId: number,
    pdfBase64?: string,
    pdfUrl?: string
  ): Promise<boolean> {
    const subject = `Su documento firmado - ${documentTitle}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #EC1C24; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">CerfiDoc</h1>
        </div>
        
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
          <h2>Su Documento Firmado</h2>
          <p>Estimado/a Usuario:</p>
          
          <p>Adjunto encontrará una copia de su documento firmado:</p>
          
          <div style="background-color: #f8f8f8; padding: 15px; margin: 15px 0; border-left: 4px solid #EC1C24;">
            <p><strong>Documento:</strong> ${documentTitle}</p>
            <p><strong>ID de Documento:</strong> ${documentId}</p>
            <p><strong>Fecha de firma:</strong> ${new Date().toLocaleString('es-CL')}</p>
          </div>
          
          ${pdfUrl ? `
          <p>También puede acceder a su documento en línea a través del siguiente enlace:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${pdfUrl}" style="background-color: #EC1C24; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Ver documento en línea</a>
          </div>
          ` : ''}
          
          <p>Este documento ha sido firmado digitalmente y tiene plena validez legal según la Ley 19.799 sobre Documentos Electrónicos.</p>
          
          <p>Atentamente,</p>
          <p><strong>Equipo CerfiDoc</strong></p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© ${new Date().getFullYear()} CerfiDoc. Todos los derechos reservados.</p>
          <p>Este es un correo automático, por favor no responda a esta dirección.</p>
        </div>
      </div>
    `;
    
    const emailConfig: EmailConfig = {
      to: email,
      subject,
      html
    };
    
    // Si tenemos el PDF en base64, lo adjuntamos al correo
    if (pdfBase64) {
      emailConfig.attachments = [
        {
          content: pdfBase64,
          filename: `${documentTitle.replace(/\s+/g, '_')}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ];
    }
    
    return this.sendEmail(emailConfig);
  }
  
  /**
   * Envía una notificación sobre el estado del documento
   */
  async sendDocumentStatusUpdate(
    email: string,
    documentTitle: string,
    documentId: number,
    status: string
  ): Promise<boolean> {
    let statusText = '';
    let subject = '';
    
    switch (status) {
      case 'pending':
        subject = `Documento pendiente de verificación - ${documentTitle}`;
        statusText = 'Su documento está siendo revisado por nuestro equipo de certificadores. Le notificaremos cuando esté listo para firmar.';
        break;
      case 'validated':
        subject = `Documento validado - ${documentTitle}`;
        statusText = 'Su documento ha sido validado y está listo para ser firmado.';
        break;
      case 'signed':
        subject = `Documento firmado exitosamente - ${documentTitle}`;
        statusText = 'Su documento ha sido firmado exitosamente y ahora tiene validez legal completa.';
        break;
      case 'rejected':
        subject = `Documento requiere correcciones - ${documentTitle}`;
        statusText = 'Su documento requiere algunas correcciones antes de poder ser certificado. Por favor revise los comentarios en la plataforma.';
        break;
      default:
        subject = `Actualización de estado - ${documentTitle}`;
        statusText = `El estado de su documento ha cambiado a: ${status}`;
    }
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #EC1C24; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">CerfiDoc</h1>
        </div>
        
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
          <h2>Actualización de Estado de Documento</h2>
          <p>Estimado/a Usuario:</p>
          
          <p>${statusText}</p>
          
          <div style="background-color: #f8f8f8; padding: 15px; margin: 15px 0; border-left: 4px solid #EC1C24;">
            <p><strong>Documento:</strong> ${documentTitle}</p>
            <p><strong>ID de Documento:</strong> ${documentId}</p>
            <p><strong>Estado actual:</strong> ${status}</p>
            <p><strong>Actualizado el:</strong> ${new Date().toLocaleString('es-CL')}</p>
          </div>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://cerfidoc.cl/document-view/${documentId}" style="background-color: #EC1C24; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Ver mi documento</a>
          </div>
          
          <p>Si tiene alguna consulta, no dude en contactarnos respondiendo a este correo o a través de nuestro centro de soporte.</p>
          
          <p>Atentamente,</p>
          <p><strong>Equipo CerfiDoc</strong></p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© ${new Date().getFullYear()} CerfiDoc. Todos los derechos reservados.</p>
          <p>Este es un correo automático, por favor no responda a esta dirección.</p>
        </div>
      </div>
    `;
    
    return this.sendEmail({
      to: email,
      subject,
      html
    });
  }
}

export const emailService = new EmailService();