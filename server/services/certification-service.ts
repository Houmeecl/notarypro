/**
 * Servicio de Certificación RON
 * 
 * Este servicio integra las funcionalidades de videollamadas, verificación de identidad,
 * firma electrónica y generación de constancias para el sistema RON.
 */

import { agoraService, VideoSessionToken } from './agora-service';
import { helloSignService } from './hellosign-service';
import { s3StorageService } from './s3-storage-service';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import QRCode from 'qrcode';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { storage } from '../storage';
import { comparePasswords } from '../auth';

export interface IdVerificationResult {
  success: boolean;
  verificationId?: string;
  documentType?: string;
  documentNumber?: string;
  fullName?: string;
  birthDate?: string;
  issuingCountry?: string;
  capturedImageUrl?: string;
  error?: string;
}

export interface CertificateGenerationParams {
  sessionId: string;
  documentId: string;
  documentName: string;
  participantName: string;
  certifierName: string;
  verificationResult: IdVerificationResult;
  signatureInfo?: {
    signatureId: string;
    signedAt: Date;
  };
}

export interface RONSessionInitParams {
  sessionId: string;
  documentId: string;
  documentName: string;
  certifierId: string | number;
  clientId: string | number;
  clientEmail: string;
  clientName: string;
}

class CertificationService {
  /**
   * Autentica a un usuario para acceso RON
   * Verifica que el usuario exista y tenga permisos para RON (admin o certificador)
   */
  async authenticateRONUser(username: string, password: string) {
    try {
      // Buscar usuario por nombre de usuario
      const user = await storage.getUserByUsername(username);
      
      // Si no existe el usuario, devolver null
      if (!user) {
        console.log(`RON Auth: Usuario ${username} no encontrado`);
        return null;
      }
      
      // Verificar contraseña
      const passwordValid = await comparePasswords(password, user.password);
      if (!passwordValid) {
        console.log(`RON Auth: Contraseña inválida para ${username}`);
        return null;
      }
      
      // Verificar rol (sólo admin o certificador pueden usar RON)
      if (user.role !== 'admin' && user.role !== 'certifier') {
        console.log(`RON Auth: Usuario ${username} no tiene permisos de RON (rol: ${user.role})`);
        return null;
      }
      
      // Usuario autenticado correctamente con permisos RON
      return user;
    } catch (error) {
      console.error('Error en autenticación RON:', error);
      return null;
    }
  }
  /**
   * Inicia una sesión de certificación RON
   */
  async initializeRONSession(params: RONSessionInitParams): Promise<{
    success: boolean;
    sessionId?: string;
    videoTokens?: {
      certifier: VideoSessionToken | null;
      client: VideoSessionToken | null;
    };
    error?: string;
  }> {
    try {
      // Crear tokens para videollamada con Agora
      const videoSession = agoraService.createVideoSession(
        params.sessionId,
        params.certifierId,
        params.clientId
      );
      
      if (!videoSession.certifierToken || !videoSession.clientToken) {
        return {
          success: false,
          error: 'No se pudieron generar los tokens para la videollamada'
        };
      }
      
      // Registrar sesión en base de datos
      // Aquí iría el código para registrar o actualizar la sesión en la BD
      
      return {
        success: true,
        sessionId: params.sessionId,
        videoTokens: {
          certifier: videoSession.certifierToken,
          client: videoSession.clientToken
        }
      };
    } catch (error: any) {
      console.error('Error initializing RON session:', error);
      return {
        success: false,
        error: error.message || 'Error al inicializar la sesión de certificación'
      };
    }
  }
  
  /**
   * Registra la captura de documento de identidad
   */
  async captureIdentityDocument(
    sessionId: string, 
    documentImage: Buffer,
    metadata: {
      capturedBy: string | number;
      documentType?: string;
      notes?: string;
    }
  ): Promise<IdVerificationResult> {
    try {
      // Generar un ID único para esta verificación
      const verificationId = uuidv4();
      
      // Calcular hash de la imagen para garantizar integridad
      const imageHash = createHash('sha256').update(documentImage).digest('hex');
      
      // Subir la imagen a almacenamiento seguro
      const fileName = `identity_doc_${Date.now()}.jpg`;
      const filePath = s3StorageService.getFilePath('identity', sessionId, fileName);
      
      const uploadResult = await s3StorageService.uploadFile(
        filePath,
        documentImage,
        {
          encrypt: true,
          contentType: 'image/jpeg',
          metadata: {
            sessionId,
            verificationId,
            capturedBy: metadata.capturedBy.toString(),
            imageHash,
            documentType: metadata.documentType || 'unknown',
            timestamp: new Date().toISOString()
          }
        }
      );
      
      if (!uploadResult) {
        return {
          success: false,
          error: 'No se pudo almacenar la imagen del documento de identidad'
        };
      }
      
      // Generar URL de acceso temporal a la imagen
      const imageUrl = await s3StorageService.generatePresignedUrl(filePath, 60 * 60); // 1 hora
      
      // Aquí se podría integrar con un servicio de OCR/verificación de identidad
      // pero por ahora simplemente registramos la captura
      
      // Registrar verificación en base de datos
      // Aquí iría el código para registrar la verificación en la BD
      
      return {
        success: true,
        verificationId,
        documentType: metadata.documentType || 'Documento de identidad',
        capturedImageUrl: imageUrl || undefined
      };
    } catch (error: any) {
      console.error('Error capturing identity document:', error);
      return {
        success: false,
        error: error.message || 'Error al capturar documento de identidad'
      };
    }
  }
  
  /**
   * Inicia el proceso de firma electrónica
   */
  async initializeSignatureProcess(
    sessionId: string,
    documentId: string,
    documentName: string,
    documentBuffer: Buffer,
    signers: Array<{
      email: string;
      name: string;
      role?: string;
    }>
  ) {
    try {
      // Almacenar documento en S3
      const fileName = `${documentName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
      const filePath = s3StorageService.getFilePath('document', documentId, fileName);
      
      await s3StorageService.uploadFile(
        filePath,
        documentBuffer,
        {
          contentType: 'application/pdf',
          metadata: {
            sessionId,
            documentId,
            documentName
          }
        }
      );
      
      // Generar URL temporal para HelloSign
      const documentUrl = await s3StorageService.generatePresignedUrl(filePath);
      
      if (!documentUrl) {
        throw new Error('No se pudo generar URL para el documento');
      }
      
      // Crear solicitud de firma en HelloSign
      const signatureRequest = await helloSignService.createSignatureRequest({
        documentId,
        title: documentName,
        subject: `Firma de documento: ${documentName}`,
        message: 'Por favor, firme este documento para completar el proceso de certificación.',
        signers,
        documentUrl,
        metadata: {
          sessionId,
          documentId
        }
      });
      
      return signatureRequest;
    } catch (error: any) {
      console.error('Error initializing signature process:', error);
      return {
        success: false,
        error: error.message || 'Error al iniciar proceso de firma'
      };
    }
  }
  
  /**
   * Genera la constancia de certificación con código QR
   */
  async generateCertificate(params: CertificateGenerationParams): Promise<{
    success: boolean;
    certificateId?: string;
    certificateUrl?: string;
    qrCodeUrl?: string;
    error?: string;
  }> {
    try {
      // Crear un nuevo documento PDF
      const pdfDoc = await PDFDocument.create();
      
      // Agregar una página
      const page = pdfDoc.addPage([595.28, 841.89]); // A4
      
      // Obtener fuentes estándar
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Configurar tamaños de texto
      const titleSize = 16;
      const subtitleSize = 14;
      const normalSize = 12;
      const smallSize = 10;
      
      // Generar un ID único para la constancia
      const certificateId = uuidv4();
      
      // Crear URL de verificación para el código QR
      const verificationUrl = `https://notarypro.cl/verificar/${certificateId}`;
      
      // Generar código QR como imagen
      const qrCodeImage = await QRCode.toDataURL(verificationUrl);
      
      // Extraer la parte base64 y convertir a buffer
      const qrImageData = qrCodeImage.split(',')[1];
      const qrImageBuffer = Buffer.from(qrImageData, 'base64');
      
      // Integrar QR en el PDF
      const qrImage = await pdfDoc.embedPng(qrImageBuffer);
      const qrDims = qrImage.scale(0.5); // Escalar al 50%
      
      // Dibujar en el PDF
      const { width, height } = page.getSize();
      const margin = 50;
      
      // Título y encabezado
      page.drawText("CONSTANCIA DE CERTIFICACIÓN REMOTA", {
        x: margin,
        y: height - margin,
        size: titleSize,
        font: helveticaBold,
        color: rgb(0, 0, 0.7)
      });
      
      page.drawText(`ID de Certificación: ${certificateId}`, {
        x: margin,
        y: height - margin - 25,
        size: normalSize,
        font: helveticaFont
      });
      
      page.drawText(`Fecha: ${new Date().toLocaleDateString()}`, {
        x: margin,
        y: height - margin - 45,
        size: normalSize,
        font: helveticaFont
      });
      
      // Dibujar línea separadora
      page.drawLine({
        start: { x: margin, y: height - margin - 60 },
        end: { x: width - margin, y: height - margin - 60 },
        thickness: 1,
        color: rgb(0, 0, 0.5)
      });
      
      // Información del documento
      page.drawText("Información del Documento", {
        x: margin,
        y: height - margin - 90,
        size: subtitleSize,
        font: helveticaBold
      });
      
      page.drawText(`Documento: ${params.documentName}`, {
        x: margin,
        y: height - margin - 115,
        size: normalSize,
        font: helveticaFont
      });
      
      page.drawText(`ID de Documento: ${params.documentId}`, {
        x: margin,
        y: height - margin - 135,
        size: normalSize,
        font: helveticaFont
      });
      
      page.drawText(`Participante: ${params.participantName}`, {
        x: margin,
        y: height - margin - 155,
        size: normalSize,
        font: helveticaFont
      });
      
      page.drawText(`Certificador: ${params.certifierName}`, {
        x: margin,
        y: height - margin - 175,
        size: normalSize,
        font: helveticaFont
      });
      
      // Información de la sesión RON
      page.drawText("Sesión de Certificación Remota (RON)", {
        x: margin,
        y: height - margin - 205,
        size: subtitleSize,
        font: helveticaBold
      });
      
      page.drawText(`ID de Sesión: ${params.sessionId}`, {
        x: margin,
        y: height - margin - 230,
        size: normalSize,
        font: helveticaFont
      });
      
      page.drawText(`Fecha y hora: ${new Date().toLocaleString()}`, {
        x: margin,
        y: height - margin - 250,
        size: normalSize,
        font: helveticaFont
      });
      
      // Información de verificación de identidad
      page.drawText("Verificación de Identidad", {
        x: margin,
        y: height - margin - 280,
        size: subtitleSize,
        font: helveticaBold
      });
      
      if (params.verificationResult.success) {
        page.drawText("✓ Identidad verificada correctamente", {
          x: margin,
          y: height - margin - 305,
          size: normalSize,
          font: helveticaFont,
          color: rgb(0, 0.5, 0)
        });
        
        if (params.verificationResult.documentType) {
          page.drawText(`Tipo de documento: ${params.verificationResult.documentType}`, {
            x: margin,
            y: height - margin - 325,
            size: normalSize,
            font: helveticaFont
          });
        }
        
        if (params.verificationResult.documentNumber) {
          page.drawText(`Número de documento: ${params.verificationResult.documentNumber}`, {
            x: margin,
            y: height - margin - 345,
            size: normalSize,
            font: helveticaFont
          });
        }
      } else {
        page.drawText("✗ No se realizó verificación de identidad", {
          x: margin,
          y: height - margin - 305,
          size: normalSize,
          font: helveticaFont,
          color: rgb(0.7, 0, 0)
        });
      }
      
      // Información de firma
      page.drawText("Firma Electrónica", {
        x: margin,
        y: height - margin - 375,
        size: subtitleSize,
        font: helveticaBold
      });
      
      if (params.signatureInfo) {
        page.drawText("✓ Documento firmado electrónicamente", {
          x: margin,
          y: height - margin - 400,
          size: normalSize,
          font: helveticaFont,
          color: rgb(0, 0.5, 0)
        });
        
        page.drawText(`ID de firma: ${params.signatureInfo.signatureId}`, {
          x: margin,
          y: height - margin - 420,
          size: normalSize,
          font: helveticaFont
        });
        
        page.drawText(`Fecha y hora de firma: ${params.signatureInfo.signedAt.toLocaleString()}`, {
          x: margin,
          y: height - margin - 440,
          size: normalSize,
          font: helveticaFont
        });
      } else {
        page.drawText("✗ Documento pendiente de firma", {
          x: margin,
          y: height - margin - 400,
          size: normalSize,
          font: helveticaFont,
          color: rgb(0.7, 0, 0)
        });
      }
      
      // Dibujar QR en la esquina
      page.drawImage(qrImage, {
        x: width - margin - qrDims.width,
        y: margin,
        width: qrDims.width,
        height: qrDims.height
      });
      
      // Texto debajo del QR
      page.drawText("Escanee para verificar", {
        x: width - margin - qrDims.width / 2 - 50,
        y: margin - 15,
        size: smallSize,
        font: helveticaFont
      });
      
      // Nota legal al pie
      page.drawText("Este documento constituye una constancia de certificación remota según la Ley 19.799 de Chile.", {
        x: margin,
        y: margin + 50,
        size: smallSize,
        font: helveticaFont
      });
      
      // Convertir a bytes
      const pdfBytes = await pdfDoc.save();
      
      // Guardar en S3
      const fileName = `certificado_${certificateId}.pdf`;
      const filePath = s3StorageService.getFilePath('certificate', params.sessionId, fileName);
      
      await s3StorageService.uploadFile(
        filePath,
        Buffer.from(pdfBytes),
        {
          contentType: 'application/pdf',
          metadata: {
            certificateId,
            sessionId: params.sessionId,
            documentId: params.documentId,
            participantName: params.participantName,
            certifierName: params.certifierName,
            timestamp: new Date().toISOString()
          }
        }
      );
      
      // Generar URL de acceso al certificado
      const certificateUrl = await s3StorageService.generatePresignedUrl(filePath);
      
      // Guardar el QR como imagen independiente
      const qrFilePath = s3StorageService.getFilePath('certificate', params.sessionId, `qr_${certificateId}.png`);
      
      await s3StorageService.uploadFile(
        qrFilePath,
        qrImageBuffer,
        {
          contentType: 'image/png',
          metadata: {
            certificateId,
            sessionId: params.sessionId,
            documentId: params.documentId,
            verificationUrl
          }
        }
      );
      
      // Generar URL de acceso al QR
      const qrCodeUrl = await s3StorageService.generatePresignedUrl(qrFilePath);
      
      return {
        success: true,
        certificateId,
        certificateUrl: certificateUrl || undefined,
        qrCodeUrl: qrCodeUrl || undefined
      };
    } catch (error: any) {
      console.error('Error generating certificate:', error);
      return {
        success: false,
        error: error.message || 'Error al generar certificado'
      };
    }
  }
  
  /**
   * Finaliza una sesión RON, guardando todos los artefactos
   */
  async completeRONSession(
    sessionId: string,
    metadata: {
      documentId: string;
      certifierId: string | number;
      clientId: string | number;
      verificationId?: string;
      signatureId?: string;
      certificateId?: string;
      status: 'completed' | 'cancelled' | 'failed';
      notes?: string;
    }
  ): Promise<boolean> {
    try {
      // Aquí iría el código para actualizar el estado de la sesión en la BD
      // y registrar la finalización
      
      // Si la sesión se canceló, revocar tokens de Agora
      if (metadata.status === 'cancelled' || metadata.status === 'failed') {
        agoraService.revokeSessionTokens(sessionId);
      }
      
      return true;
    } catch (error) {
      console.error('Error completing RON session:', error);
      return false;
    }
  }
}

export const certificationService = new CertificationService();