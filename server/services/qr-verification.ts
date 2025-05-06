/**
 * Servicio de Verificación mediante Códigos QR
 * 
 * Este módulo proporciona funcionalidades para generar y validar
 * códigos QR de verificación para documentos firmados electrónicamente.
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { documents } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';
import QRCode from 'qrcode';

// Temporalmente utilizamos definiciones locales hasta que se actualice el esquema principal
const documentQrCodes = {
  id: "document_qr_codes.id",
  documentId: "document_qr_codes.document_id",
  signatureId: "document_qr_codes.signature_id",
  userId: "document_qr_codes.user_id",
  codeType: "document_qr_codes.code_type",
  verificationCode: "document_qr_codes.verification_code",
  status: "document_qr_codes.status"
};

const signatures = {
  id: "signatures.id",
  userId: "signatures.user_id",
  provider: "signatures.provider",
  status: "signatures.status"
};

// Tipos para verificación de QR
export enum QRCodeType {
  DOCUMENT_VERIFICATION = 'document_verification',
  SIGNATURE_VERIFICATION = 'signature_verification',
  ACCESS_LINK = 'access_link',
  MOBILE_SIGNING = 'mobile_signing'
}

export enum QRCodeStatus {
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
  REVOKED = 'revoked'
}

interface QRGenerationResult {
  success: boolean;
  qrCodeId: string;
  qrImageBase64?: string;
  qrUrl?: string;
  verificationCode?: string;
  expiresAt?: Date;
  error?: string;
}

interface QRVerificationResult {
  isValid: boolean;
  documentId?: number;
  signatureId?: string;
  qrCodeType?: QRCodeType;
  details?: Record<string, any>;
  error?: string;
}

/**
 * Clase principal del servicio de verificación por QR
 */
export class QRVerificationService {
  /**
   * Genera un código QR para verificación de documento
   */
  async generateDocumentVerificationQR(
    documentId: number,
    options?: {
      expiresInDays?: number;
      includeSignatures?: boolean;
      size?: number;
    }
  ): Promise<QRGenerationResult> {
    try {
      // Verificar que el documento existe
      const [document] = await db
        .select()
        .from(documents)
        .where(eq(documents.id, documentId));
      
      if (!document) {
        throw new Error('Documento no encontrado');
      }
      
      const expiresInDays = options?.expiresInDays || 365; // 1 año por defecto
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
      
      // Generar código único de verificación
      const verificationCode = this.generateVerificationCode();
      
      // Crear registro de código QR en la base de datos
      const qrCodeId = uuidv4();
      
      await db.insert(documentQrCodes).values({
        id: qrCodeId,
        documentId,
        codeType: QRCodeType.DOCUMENT_VERIFICATION,
        verificationCode,
        status: QRCodeStatus.ACTIVE,
        createdAt: new Date(),
        expiresAt,
        details: {
          includeSignatures: options?.includeSignatures || false,
          createdAt: new Date().toISOString()
        }
      });
      
      // Crear URL de verificación
      const baseUrl = process.env.APP_URL || 'https://notarypro.cl';
      const verificationUrl = `${baseUrl}/verificar/${verificationCode}`;
      
      // Generar imagen QR
      const size = options?.size || 200;
      const qrImageBase64 = await this.generateQRImageBase64(verificationUrl, size);
      
      return {
        success: true,
        qrCodeId,
        qrImageBase64,
        qrUrl: verificationUrl,
        verificationCode,
        expiresAt
      };
      
    } catch (error) {
      console.error('Error al generar QR de verificación de documento:', error);
      
      return {
        success: false,
        qrCodeId: uuidv4(), // ID temporal para error
        error: error.message || 'Error desconocido al generar QR'
      };
    }
  }
  
  /**
   * Genera un código QR para verificación de firma
   */
  async generateSignatureVerificationQR(
    signatureId: string,
    options?: {
      expiresInDays?: number;
      size?: number;
    }
  ): Promise<QRGenerationResult> {
    try {
      // Verificar que la firma existe
      const [signature] = await db
        .select()
        .from(signatures)
        .where(eq(signatures.id, signatureId));
      
      if (!signature) {
        throw new Error('Firma no encontrada');
      }
      
      // Buscar el documento asociado a la firma
      const [docSignature] = await db
        .select()
        .from(documentSignatures)
        .where(eq(documentSignatures.signatureId, signatureId));
      
      if (!docSignature) {
        throw new Error('No se encontró documento asociado a la firma');
      }
      
      const documentId = docSignature.documentId;
      
      const expiresInDays = options?.expiresInDays || 365; // 1 año por defecto
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
      
      // Generar código único de verificación
      const verificationCode = this.generateVerificationCode();
      
      // Crear registro de código QR en la base de datos
      const qrCodeId = uuidv4();
      
      await db.insert(documentQrCodes).values({
        id: qrCodeId,
        documentId,
        signatureId,
        codeType: QRCodeType.SIGNATURE_VERIFICATION,
        verificationCode,
        status: QRCodeStatus.ACTIVE,
        createdAt: new Date(),
        expiresAt,
        details: {
          createdAt: new Date().toISOString()
        }
      });
      
      // Crear URL de verificación
      const baseUrl = process.env.APP_URL || 'https://notarypro.cl';
      const verificationUrl = `${baseUrl}/verificar/${verificationCode}`;
      
      // Generar imagen QR
      const size = options?.size || 200;
      const qrImageBase64 = await this.generateQRImageBase64(verificationUrl, size);
      
      return {
        success: true,
        qrCodeId,
        qrImageBase64,
        qrUrl: verificationUrl,
        verificationCode,
        expiresAt
      };
      
    } catch (error) {
      console.error('Error al generar QR de verificación de firma:', error);
      
      return {
        success: false,
        qrCodeId: uuidv4(), // ID temporal para error
        error: error.message || 'Error desconocido al generar QR'
      };
    }
  }
  
  /**
   * Genera un código QR para firma en dispositivo móvil
   */
  async generateMobileSigningQR(
    documentId: number,
    userId: number,
    options?: {
      expiresInHours?: number;
      size?: number;
      additionalData?: Record<string, any>;
    }
  ): Promise<QRGenerationResult> {
    try {
      // Verificar que el documento existe
      const [document] = await db
        .select()
        .from(documents)
        .where(eq(documents.id, documentId));
      
      if (!document) {
        throw new Error('Documento no encontrado');
      }
      
      const expiresInHours = options?.expiresInHours || 24; // 24 horas por defecto
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiresInHours);
      
      // Generar código único de verificación
      const verificationCode = this.generateVerificationCode();
      
      // Crear registro de código QR en la base de datos
      const qrCodeId = uuidv4();
      
      await db.insert(documentQrCodes).values({
        id: qrCodeId,
        documentId,
        userId,
        codeType: QRCodeType.MOBILE_SIGNING,
        verificationCode,
        status: QRCodeStatus.ACTIVE,
        createdAt: new Date(),
        expiresAt,
        details: {
          ...options?.additionalData,
          createdAt: new Date().toISOString()
        }
      });
      
      // Crear URL de firma móvil
      const baseUrl = process.env.APP_URL || 'https://notarypro.cl';
      const signingUrl = `${baseUrl}/sign-mobile/${verificationCode}`;
      
      // Generar imagen QR
      const size = options?.size || 200;
      const qrImageBase64 = await this.generateQRImageBase64(signingUrl, size);
      
      return {
        success: true,
        qrCodeId,
        qrImageBase64,
        qrUrl: signingUrl,
        verificationCode,
        expiresAt
      };
      
    } catch (error) {
      console.error('Error al generar QR para firma móvil:', error);
      
      return {
        success: false,
        qrCodeId: uuidv4(), // ID temporal para error
        error: error.message || 'Error desconocido al generar QR'
      };
    }
  }
  
  /**
   * Verifica un código de verificación
   */
  async verifyCode(verificationCode: string): Promise<QRVerificationResult> {
    try {
      // Buscar el código en la base de datos
      const [qrCode] = await db
        .select()
        .from(documentQrCodes)
        .where(eq(documentQrCodes.verificationCode, verificationCode));
      
      if (!qrCode) {
        return {
          isValid: false,
          error: 'Código de verificación no encontrado'
        };
      }
      
      // Verificar estado del código
      if (qrCode.status !== QRCodeStatus.ACTIVE) {
        return {
          isValid: false,
          error: `El código ha sido ${qrCode.status === QRCodeStatus.USED ? 'utilizado' : 
                                   qrCode.status === QRCodeStatus.EXPIRED ? 'expirado' : 
                                   'revocado'}`
        };
      }
      
      // Verificar fecha de expiración
      if (qrCode.expiresAt && qrCode.expiresAt < new Date()) {
        // Actualizar estado a expirado
        await db
          .update(documentQrCodes)
          .set({ status: QRCodeStatus.EXPIRED })
          .where(eq(documentQrCodes.id, qrCode.id));
        
        return {
          isValid: false,
          error: 'El código ha expirado'
        };
      }
      
      // Si es un código de tipo firma móvil, marcarlo como usado
      if (qrCode.codeType === QRCodeType.MOBILE_SIGNING) {
        await db
          .update(documentQrCodes)
          .set({ status: QRCodeStatus.USED })
          .where(eq(documentQrCodes.id, qrCode.id));
      }
      
      // Buscar documento asociado
      const [document] = await db
        .select()
        .from(documents)
        .where(eq(documents.id, qrCode.documentId));
      
      if (!document) {
        return {
          isValid: false,
          error: 'El documento asociado no fue encontrado'
        };
      }
      
      // Preparar respuesta según tipo de código
      const result: QRVerificationResult = {
        isValid: true,
        documentId: qrCode.documentId,
        qrCodeType: qrCode.codeType as QRCodeType,
        details: {
          documentTitle: document.title,
          documentType: document.type,
          createdAt: document.createdAt,
          ...qrCode.details
        }
      };
      
      // Añadir información de firma si corresponde
      if (qrCode.signatureId) {
        result.signatureId = qrCode.signatureId;
        
        // Buscar información de la firma
        const [signature] = await db
          .select()
          .from(signatures)
          .where(eq(signatures.id, qrCode.signatureId));
        
        if (signature) {
          result.details = {
            ...result.details,
            signatureProvider: signature.provider,
            signatureType: signature.type,
            signatureStatus: signature.status,
            signatureCreatedAt: signature.createdAt
          };
        }
      }
      
      return result;
      
    } catch (error) {
      console.error('Error al verificar código QR:', error);
      
      return {
        isValid: false,
        error: error.message || 'Error desconocido al verificar código'
      };
    }
  }
  
  /**
   * Genera un código de verificación único
   */
  private generateVerificationCode(): string {
    // Generar código alfanumérico de 8 caracteres
    const hash = crypto.createHash('sha256');
    hash.update(uuidv4() + Date.now().toString());
    return hash.digest('hex').substring(0, 8).toUpperCase();
  }
  
  /**
   * Genera una imagen QR en formato Base64
   */
  private async generateQRImageBase64(data: string, size: number = 200): Promise<string> {
    try {
      const qrOptions = {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 2,
        width: size,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      };
      
      return await QRCode.toDataURL(data, qrOptions);
      
    } catch (error) {
      console.error('Error al generar imagen QR:', error);
      throw error;
    }
  }
  
  /**
   * Revoca un código QR
   */
  async revokeQRCode(qrCodeId: string): Promise<boolean> {
    try {
      await db
        .update(documentQrCodes)
        .set({ status: QRCodeStatus.REVOKED })
        .where(eq(documentQrCodes.id, qrCodeId));
      
      return true;
      
    } catch (error) {
      console.error('Error al revocar código QR:', error);
      return false;
    }
  }
}

// Exportar instancia del servicio
export const qrVerificationService = new QRVerificationService();