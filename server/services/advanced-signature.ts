/**
 * Servicio de Firma Electrónica Avanzada
 * 
 * Este módulo implementa la integración con servicios de firma digital que cumplen
 * con la Ley N° 19.799 de Chile sobre Firma Electrónica.
 * 
 * Soporta integraciones con:
 * - DocuSign
 * - HelloSign
 * - Firma local con certificado digital (eToken)
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { documents, users } from '@shared/schema';

// Temporalmente utilizamos definiciones locales hasta que se actualice el esquema principal
const signatures = {
  id: "signatures.id",
  userId: "signatures.user_id",
  provider: "signatures.provider",
  status: "signatures.status"
};

const documentSignatures = {
  documentId: "document_signatures.document_id",
  signatureId: "document_signatures.signature_id"
};
import { eq, and } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Tipos para manejo de firmas electrónicas
export enum SignatureProvider {
  DOCUSIGN = 'docusign',
  HELLOSIGN = 'hellosign',
  ETOKEN = 'etoken', // Firma con certificado digital local
  SIMPLE = 'simple'  // Firma simple (no avanzada)
}

export enum SignatureStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  ERROR = 'error'
}

export enum SignatureType {
  SIMPLE = 'simple',       // Firma electrónica simple
  ADVANCED = 'advanced',   // Firma electrónica avanzada
  QUALIFIED = 'qualified'  // Firma electrónica calificada (con certificado acreditado)
}

interface SignatureResult {
  success: boolean;
  signatureId: string;
  provider: SignatureProvider;
  status: SignatureStatus;
  redirectUrl?: string;
  signatureUrl?: string;
  verificationCode?: string;
  details?: Record<string, any>;
  error?: string;
}

/**
 * Clase base para proveedores de firma electrónica
 */
abstract class ElectronicSignatureProvider {
  abstract name: SignatureProvider;
  abstract initSignature(documentId: number, userId: number, type: SignatureType): Promise<SignatureResult>;
  abstract checkSignatureStatus(signatureId: string): Promise<SignatureStatus>;
  abstract getSignatureDetails(signatureId: string): Promise<Record<string, any>>;
  abstract generateVerificationCode(signatureId: string): Promise<string>;
}

/**
 * Implementación para DocuSign
 */
class DocuSignProvider implements ElectronicSignatureProvider {
  name: SignatureProvider = SignatureProvider.DOCUSIGN;
  
  private accessToken: string | null = null;
  private accessTokenExpiry: Date | null = null;
  
  private clientId: string;
  private clientSecret: string;
  private accountId: string;
  private userId: string;
  private baseUrl: string;
  private authServer: string;
  
  constructor() {
    const clientId = process.env.DOCUSIGN_CLIENT_ID;
    const clientSecret = process.env.DOCUSIGN_CLIENT_SECRET;
    const accountId = process.env.DOCUSIGN_ACCOUNT_ID;
    const userId = process.env.DOCUSIGN_USER_ID;
    const baseUrl = process.env.DOCUSIGN_BASE_URL || 'https://demo.docusign.net/restapi';
    const authServer = process.env.DOCUSIGN_AUTH_SERVER || 'https://account-d.docusign.com';
    
    if (!clientId || !clientSecret || !accountId || !userId) {
      throw new Error('Faltan credenciales de DocuSign en las variables de entorno');
    }
    
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accountId = accountId;
    this.userId = userId;
    this.baseUrl = baseUrl;
    this.authServer = authServer;
  }
  
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.accessTokenExpiry && this.accessTokenExpiry > new Date()) {
      return this.accessToken;
    }
    
    try {
      const authString = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(
        `${this.authServer}/oauth/token`,
        'grant_type=client_credentials&scope=signature',
        {
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      this.accessToken = response.data.access_token;
      this.accessTokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
      
      return this.accessToken;
      
    } catch (error) {
      console.error('Error al obtener token de DocuSign:', error);
      throw error;
    }
  }
  
  async initSignature(documentId: number, userId: number, type: SignatureType): Promise<SignatureResult> {
    try {
      // Obtener información del usuario y documento
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      const [document] = await db.select().from(documents).where(eq(documents.id, documentId));
      
      if (!user || !document) {
        throw new Error('Usuario o documento no encontrado');
      }
      
      // Si el documento no tiene contenido, no se puede firmar
      if (!document.content) {
        throw new Error('El documento no tiene contenido para firmar');
      }
      
      // Obtener token de acceso
      const accessToken = await this.getAccessToken();
      
      // Crear sobre en DocuSign
      const envelopeDefinition = {
        emailSubject: 'Por favor firme este documento',
        documents: [
          {
            documentBase64: Buffer.from(document.content).toString('base64'),
            name: document.title || 'Documento.pdf',
            fileExtension: 'pdf',
            documentId: '1'
          }
        ],
        recipients: {
          signers: [
            {
              email: user.email,
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
              recipientId: '1',
              routingOrder: '1',
              tabs: {
                signHereTabs: [
                  {
                    documentId: '1',
                    pageNumber: '1',
                    xPosition: '200',
                    yPosition: '400'
                  }
                ]
              }
            }
          ]
        },
        status: 'sent'
      };
      
      // Crear sobre para firma
      const envelopeResponse = await axios.post(
        `${this.baseUrl}/v2.1/accounts/${this.accountId}/envelopes`,
        envelopeDefinition,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const envelopeId = envelopeResponse.data.envelopeId;
      
      // Obtener URL de firma incrustada
      const recipientViewRequest = {
        authenticationMethod: 'none',
        clientUserId: user.id.toString(),
        recipientId: '1',
        returnUrl: `${process.env.APP_URL}/signature-complete/${documentId}`,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
        email: user.email
      };
      
      const viewResponse = await axios.post(
        `${this.baseUrl}/v2.1/accounts/${this.accountId}/envelopes/${envelopeId}/views/recipient`,
        recipientViewRequest,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const signatureId = uuidv4();
      
      // Generar código de verificación único
      const verificationCode = await this.generateVerificationCode(signatureId);
      
      // Guardar registro de firma en base de datos
      await db.insert(signatures).values({
        id: signatureId,
        userId,
        provider: this.name,
        providerReferenceId: envelopeId,
        status: SignatureStatus.IN_PROGRESS,
        type,
        verificationCode,
        createdAt: new Date(),
        details: {
          envelopeId,
          recipientId: '1',
          signingUrl: viewResponse.data.url,
          createdAt: new Date().toISOString()
        }
      });
      
      // Asociar firma con documento
      await db.insert(documentSignatures).values({
        documentId,
        signatureId,
        userId,
        createdAt: new Date()
      });
      
      return {
        success: true,
        signatureId,
        provider: this.name,
        status: SignatureStatus.IN_PROGRESS,
        redirectUrl: viewResponse.data.url,
        verificationCode,
        details: {
          envelopeId,
          recipientId: '1'
        }
      };
      
    } catch (error) {
      console.error('Error al iniciar firma con DocuSign:', error);
      
      return {
        success: false,
        signatureId: uuidv4(),
        provider: this.name,
        status: SignatureStatus.ERROR,
        error: error.message || 'Error desconocido al iniciar firma'
      };
    }
  }
  
  async checkSignatureStatus(signatureId: string): Promise<SignatureStatus> {
    try {
      // Obtener información de la firma
      const [signature] = await db
        .select()
        .from(signatures)
        .where(eq(signatures.id, signatureId));
      
      if (!signature) {
        throw new Error('Firma no encontrada');
      }
      
      const envelopeId = signature.providerReferenceId;
      
      // Obtener token de acceso
      const accessToken = await this.getAccessToken();
      
      // Consultar estado del sobre
      const envelopeResponse = await axios.get(
        `${this.baseUrl}/v2.1/accounts/${this.accountId}/envelopes/${envelopeId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      let status: SignatureStatus;
      
      // Mapear estado de DocuSign a nuestro enum
      switch (envelopeResponse.data.status) {
        case 'completed':
          status = SignatureStatus.COMPLETED;
          break;
        case 'sent':
        case 'delivered':
          status = SignatureStatus.IN_PROGRESS;
          break;
        case 'declined':
          status = SignatureStatus.REJECTED;
          break;
        case 'voided':
          status = SignatureStatus.EXPIRED;
          break;
        default:
          status = SignatureStatus.IN_PROGRESS;
      }
      
      // Actualizar estado en la base de datos
      await db
        .update(signatures)
        .set({
          status,
          updatedAt: new Date(),
          details: {
            ...signature.details,
            docusignStatus: envelopeResponse.data.status,
            lastChecked: new Date().toISOString()
          }
        })
        .where(eq(signatures.id, signatureId));
      
      return status;
      
    } catch (error) {
      console.error('Error al verificar estado de firma con DocuSign:', error);
      return SignatureStatus.ERROR;
    }
  }
  
  async getSignatureDetails(signatureId: string): Promise<Record<string, any>> {
    try {
      // Obtener información de la firma
      const [signature] = await db
        .select()
        .from(signatures)
        .where(eq(signatures.id, signatureId));
      
      if (!signature) {
        throw new Error('Firma no encontrada');
      }
      
      return signature.details || {};
      
    } catch (error) {
      console.error('Error al obtener detalles de firma con DocuSign:', error);
      return { error: error.message };
    }
  }
  
  async generateVerificationCode(signatureId: string): Promise<string> {
    // Generar código único para verificación
    const hash = crypto.createHash('sha256');
    hash.update(signatureId + Date.now().toString());
    return hash.digest('hex').substring(0, 8).toUpperCase();
  }
}

/**
 * Implementación para HelloSign
 */
class HelloSignProvider implements ElectronicSignatureProvider {
  name: SignatureProvider = SignatureProvider.HELLOSIGN;
  
  private apiKey: string;
  private clientId: string;
  private baseUrl: string = 'https://api.hellosign.com/v3';
  
  constructor() {
    const apiKey = process.env.HELLOSIGN_API_KEY;
    const clientId = process.env.HELLOSIGN_CLIENT_ID;
    
    if (!apiKey || !clientId) {
      throw new Error('Faltan credenciales de HelloSign en las variables de entorno');
    }
    
    this.apiKey = apiKey;
    this.clientId = clientId;
  }
  
  async initSignature(documentId: number, userId: number, type: SignatureType): Promise<SignatureResult> {
    try {
      // Obtener información del usuario y documento
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      const [document] = await db.select().from(documents).where(eq(documents.id, documentId));
      
      if (!user || !document) {
        throw new Error('Usuario o documento no encontrado');
      }
      
      // Si el documento no tiene contenido, no se puede firmar
      if (!document.content) {
        throw new Error('El documento no tiene contenido para firmar');
      }
      
      // Codificar el documento a base64
      const fileContent = Buffer.from(document.content).toString('base64');
      
      // Crear solicitud de firma en HelloSign
      const auth = Buffer.from(this.apiKey + ':').toString('base64');
      
      const signatureRequestData = {
        client_id: this.clientId,
        title: document.title || 'Documento para firma',
        subject: 'Por favor firme este documento',
        message: 'Este documento requiere su firma electrónica avanzada',
        signers: [
          {
            email_address: user.email,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
            order: 0
          }
        ],
        file_urls: [],
        file_data: {
          'document.pdf': fileContent
        },
        metadata: {
          documentId: documentId.toString(),
          userId: userId.toString()
        },
        test_mode: process.env.NODE_ENV !== 'production'
      };
      
      // Crear solicitud de firma en HelloSign
      const response = await axios.post(
        `${this.baseUrl}/signature_request/create_embedded`,
        signatureRequestData,
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const signatureRequestId = response.data.signature_request.signature_request_id;
      const signatureId = uuidv4();
      
      // Obtener URL de firma
      const signatureResponse = await axios.get(
        `${this.baseUrl}/embedded/sign_url/${response.data.signatures[0].signature_id}`,
        {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        }
      );
      
      // Generar código de verificación único
      const verificationCode = await this.generateVerificationCode(signatureId);
      
      // Guardar registro de firma en base de datos
      await db.insert(signatures).values({
        id: signatureId,
        userId,
        provider: this.name,
        providerReferenceId: signatureRequestId,
        status: SignatureStatus.IN_PROGRESS,
        type,
        verificationCode,
        createdAt: new Date(),
        details: {
          signatureRequestId,
          helloSignSignatureId: response.data.signatures[0].signature_id,
          signingUrl: signatureResponse.data.embedded.sign_url,
          createdAt: new Date().toISOString()
        }
      });
      
      // Asociar firma con documento
      await db.insert(documentSignatures).values({
        documentId,
        signatureId,
        userId,
        createdAt: new Date()
      });
      
      return {
        success: true,
        signatureId,
        provider: this.name,
        status: SignatureStatus.IN_PROGRESS,
        redirectUrl: signatureResponse.data.embedded.sign_url,
        verificationCode,
        details: {
          signatureRequestId,
          helloSignSignatureId: response.data.signatures[0].signature_id
        }
      };
      
    } catch (error) {
      console.error('Error al iniciar firma con HelloSign:', error);
      
      return {
        success: false,
        signatureId: uuidv4(),
        provider: this.name,
        status: SignatureStatus.ERROR,
        error: error.message || 'Error desconocido al iniciar firma'
      };
    }
  }
  
  async checkSignatureStatus(signatureId: string): Promise<SignatureStatus> {
    try {
      // Obtener información de la firma
      const [signature] = await db
        .select()
        .from(signatures)
        .where(eq(signatures.id, signatureId));
      
      if (!signature) {
        throw new Error('Firma no encontrada');
      }
      
      const signatureRequestId = signature.providerReferenceId;
      const auth = Buffer.from(this.apiKey + ':').toString('base64');
      
      // Consultar estado de la solicitud de firma
      const response = await axios.get(
        `${this.baseUrl}/signature_request/${signatureRequestId}`,
        {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        }
      );
      
      let status: SignatureStatus;
      
      // Determinar estado de la firma
      if (response.data.signature_request.is_complete) {
        status = SignatureStatus.COMPLETED;
      } else if (response.data.signature_request.is_declined) {
        status = SignatureStatus.REJECTED;
      } else {
        status = SignatureStatus.IN_PROGRESS;
      }
      
      // Actualizar estado en la base de datos
      await db
        .update(signatures)
        .set({
          status,
          updatedAt: new Date(),
          details: {
            ...signature.details,
            helloSignStatus: status,
            lastChecked: new Date().toISOString()
          }
        })
        .where(eq(signatures.id, signatureId));
      
      return status;
      
    } catch (error) {
      console.error('Error al verificar estado de firma con HelloSign:', error);
      return SignatureStatus.ERROR;
    }
  }
  
  async getSignatureDetails(signatureId: string): Promise<Record<string, any>> {
    try {
      // Obtener información de la firma
      const [signature] = await db
        .select()
        .from(signatures)
        .where(eq(signatures.id, signatureId));
      
      if (!signature) {
        throw new Error('Firma no encontrada');
      }
      
      return signature.details || {};
      
    } catch (error) {
      console.error('Error al obtener detalles de firma con HelloSign:', error);
      return { error: error.message };
    }
  }
  
  async generateVerificationCode(signatureId: string): Promise<string> {
    // Generar código único para verificación
    const hash = crypto.createHash('sha256');
    hash.update(signatureId + Date.now().toString());
    return hash.digest('hex').substring(0, 8).toUpperCase();
  }
}

/**
 * Implementación para firma con eToken (certificado digital local)
 */
class ETokenProvider implements ElectronicSignatureProvider {
  name: SignatureProvider = SignatureProvider.ETOKEN;
  
  async initSignature(documentId: number, userId: number, type: SignatureType): Promise<SignatureResult> {
    try {
      // Obtener información del usuario y documento
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      const [document] = await db.select().from(documents).where(eq(documents.id, documentId));
      
      if (!user || !document) {
        throw new Error('Usuario o documento no encontrado');
      }
      
      const signatureId = uuidv4();
      const verificationCode = await this.generateVerificationCode(signatureId);
      
      // Guardar registro de firma en base de datos
      await db.insert(signatures).values({
        id: signatureId,
        userId,
        provider: this.name,
        providerReferenceId: signatureId,
        status: SignatureStatus.PENDING,
        type,
        verificationCode,
        createdAt: new Date(),
        details: {
          documentId,
          userId,
          initiatedAt: new Date().toISOString(),
          documentName: document.title || 'Documento sin título'
        }
      });
      
      // Asociar firma con documento
      await db.insert(documentSignatures).values({
        documentId,
        signatureId,
        userId,
        createdAt: new Date()
      });
      
      return {
        success: true,
        signatureId,
        provider: this.name,
        status: SignatureStatus.PENDING,
        verificationCode,
        details: {
          documentId,
          userId,
          documentName: document.title || 'Documento sin título'
        }
      };
      
    } catch (error) {
      console.error('Error al iniciar firma con eToken:', error);
      
      return {
        success: false,
        signatureId: uuidv4(),
        provider: this.name,
        status: SignatureStatus.ERROR,
        error: error.message || 'Error desconocido al iniciar firma'
      };
    }
  }
  
  async checkSignatureStatus(signatureId: string): Promise<SignatureStatus> {
    try {
      // En firma con eToken, el estado se actualiza manualmente
      const [signature] = await db
        .select()
        .from(signatures)
        .where(eq(signatures.id, signatureId));
      
      if (!signature) {
        throw new Error('Firma no encontrada');
      }
      
      return signature.status as SignatureStatus;
      
    } catch (error) {
      console.error('Error al verificar estado de firma con eToken:', error);
      return SignatureStatus.ERROR;
    }
  }
  
  async getSignatureDetails(signatureId: string): Promise<Record<string, any>> {
    try {
      const [signature] = await db
        .select()
        .from(signatures)
        .where(eq(signatures.id, signatureId));
      
      if (!signature) {
        throw new Error('Firma no encontrada');
      }
      
      return signature.details || {};
      
    } catch (error) {
      console.error('Error al obtener detalles de firma con eToken:', error);
      return { error: error.message };
    }
  }
  
  async completeETokenSignature(
    signatureId: string, 
    signatureData: { 
      certificate: string;
      timestamp: string;
      signature: string;
    }
  ): Promise<SignatureStatus> {
    try {
      const [signature] = await db
        .select()
        .from(signatures)
        .where(eq(signatures.id, signatureId));
      
      if (!signature) {
        throw new Error('Firma no encontrada');
      }
      
      // Actualizar estado de la firma
      await db
        .update(signatures)
        .set({
          status: SignatureStatus.COMPLETED,
          updatedAt: new Date(),
          details: {
            ...signature.details,
            completedAt: new Date().toISOString(),
            certificate: signatureData.certificate,
            timestamp: signatureData.timestamp,
            signature: signatureData.signature
          }
        })
        .where(eq(signatures.id, signatureId));
      
      return SignatureStatus.COMPLETED;
      
    } catch (error) {
      console.error('Error al completar firma con eToken:', error);
      return SignatureStatus.ERROR;
    }
  }
  
  async generateVerificationCode(signatureId: string): Promise<string> {
    // Generar código único para verificación
    const hash = crypto.createHash('sha256');
    hash.update(signatureId + Date.now().toString());
    return hash.digest('hex').substring(0, 8).toUpperCase();
  }
}

/**
 * Implementación para firma simple (no avanzada)
 */
class SimpleSignatureProvider implements ElectronicSignatureProvider {
  name: SignatureProvider = SignatureProvider.SIMPLE;
  
  async initSignature(documentId: number, userId: number, type: SignatureType): Promise<SignatureResult> {
    try {
      // Obtener información del usuario y documento
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      const [document] = await db.select().from(documents).where(eq(documents.id, documentId));
      
      if (!user || !document) {
        throw new Error('Usuario o documento no encontrado');
      }
      
      const signatureId = uuidv4();
      const verificationCode = await this.generateVerificationCode(signatureId);
      
      // Guardar registro de firma en base de datos
      await db.insert(signatures).values({
        id: signatureId,
        userId,
        provider: this.name,
        providerReferenceId: signatureId,
        status: SignatureStatus.IN_PROGRESS,
        type: SignatureType.SIMPLE, // Siempre es firma simple
        verificationCode,
        createdAt: new Date(),
        details: {
          documentId,
          userId,
          initiatedAt: new Date().toISOString(),
          documentName: document.title || 'Documento sin título'
        }
      });
      
      // Asociar firma con documento
      await db.insert(documentSignatures).values({
        documentId,
        signatureId,
        userId,
        createdAt: new Date()
      });
      
      return {
        success: true,
        signatureId,
        provider: this.name,
        status: SignatureStatus.IN_PROGRESS,
        verificationCode,
        details: {
          documentId,
          userId,
          documentName: document.title || 'Documento sin título'
        }
      };
      
    } catch (error) {
      console.error('Error al iniciar firma simple:', error);
      
      return {
        success: false,
        signatureId: uuidv4(),
        provider: this.name,
        status: SignatureStatus.ERROR,
        error: error.message || 'Error desconocido al iniciar firma'
      };
    }
  }
  
  async checkSignatureStatus(signatureId: string): Promise<SignatureStatus> {
    try {
      const [signature] = await db
        .select()
        .from(signatures)
        .where(eq(signatures.id, signatureId));
      
      if (!signature) {
        throw new Error('Firma no encontrada');
      }
      
      return signature.status as SignatureStatus;
      
    } catch (error) {
      console.error('Error al verificar estado de firma simple:', error);
      return SignatureStatus.ERROR;
    }
  }
  
  async getSignatureDetails(signatureId: string): Promise<Record<string, any>> {
    try {
      const [signature] = await db
        .select()
        .from(signatures)
        .where(eq(signatures.id, signatureId));
      
      if (!signature) {
        throw new Error('Firma no encontrada');
      }
      
      return signature.details || {};
      
    } catch (error) {
      console.error('Error al obtener detalles de firma simple:', error);
      return { error: error.message };
    }
  }
  
  async completeSimpleSignature(
    signatureId: string,
    signatureImageData: string
  ): Promise<SignatureStatus> {
    try {
      const [signature] = await db
        .select()
        .from(signatures)
        .where(eq(signatures.id, signatureId));
      
      if (!signature) {
        throw new Error('Firma no encontrada');
      }
      
      // Actualizar estado de la firma
      await db
        .update(signatures)
        .set({
          status: SignatureStatus.COMPLETED,
          updatedAt: new Date(),
          details: {
            ...signature.details,
            completedAt: new Date().toISOString(),
            signatureImage: signatureImageData
          }
        })
        .where(eq(signatures.id, signatureId));
      
      return SignatureStatus.COMPLETED;
      
    } catch (error) {
      console.error('Error al completar firma simple:', error);
      return SignatureStatus.ERROR;
    }
  }
  
  async generateVerificationCode(signatureId: string): Promise<string> {
    // Generar código único para verificación
    const hash = crypto.createHash('sha256');
    hash.update(signatureId + Date.now().toString());
    return hash.digest('hex').substring(0, 8).toUpperCase();
  }
}

/**
 * Factoría para obtener proveedores de firma específicos
 */
export class ElectronicSignatureProviderFactory {
  static getProvider(provider: SignatureProvider): ElectronicSignatureProvider {
    switch (provider) {
      case SignatureProvider.DOCUSIGN:
        return new DocuSignProvider();
      case SignatureProvider.HELLOSIGN:
        return new HelloSignProvider();
      case SignatureProvider.ETOKEN:
        return new ETokenProvider();
      case SignatureProvider.SIMPLE:
        return new SimpleSignatureProvider();
      default:
        throw new Error(`Proveedor de firma no soportado: ${provider}`);
    }
  }
  
  static getDefaultAdvancedProvider(): ElectronicSignatureProvider {
    // Determinar el proveedor de firma avanzada predeterminado según configuración
    if (process.env.DOCUSIGN_CLIENT_ID && 
        process.env.DOCUSIGN_CLIENT_SECRET &&
        process.env.DOCUSIGN_ACCOUNT_ID) {
      return new DocuSignProvider();
    } else if (process.env.HELLOSIGN_API_KEY && 
               process.env.HELLOSIGN_CLIENT_ID) {
      return new HelloSignProvider();
    } else {
      return new ETokenProvider();
    }
  }
  
  static getSimpleProvider(): ElectronicSignatureProvider {
    return new SimpleSignatureProvider();
  }
}

/**
 * Servicio unificado de firma electrónica
 */
export class ElectronicSignatureService {
  /**
   * Inicia un proceso de firma electrónica
   */
  async initSignature(
    documentId: number,
    userId: number,
    type: SignatureType = SignatureType.ADVANCED,
    provider?: SignatureProvider
  ): Promise<SignatureResult> {
    try {
      let signatureProvider: ElectronicSignatureProvider;
      
      // Determinar proveedor según tipo de firma
      if (type === SignatureType.SIMPLE) {
        signatureProvider = ElectronicSignatureProviderFactory.getSimpleProvider();
      } else {
        signatureProvider = provider 
          ? ElectronicSignatureProviderFactory.getProvider(provider)
          : ElectronicSignatureProviderFactory.getDefaultAdvancedProvider();
      }
      
      return await signatureProvider.initSignature(documentId, userId, type);
      
    } catch (error) {
      console.error('Error al iniciar firma electrónica:', error);
      
      return {
        success: false,
        signatureId: uuidv4(),
        provider: provider || SignatureProvider.SIMPLE,
        status: SignatureStatus.ERROR,
        error: error.message || 'Error desconocido al iniciar firma'
      };
    }
  }
  
  /**
   * Verifica el estado de una firma
   */
  async checkSignatureStatus(signatureId: string): Promise<SignatureStatus> {
    try {
      const [signature] = await db
        .select()
        .from(signatures)
        .where(eq(signatures.id, signatureId));
      
      if (!signature) {
        throw new Error('Firma no encontrada');
      }
      
      const provider = ElectronicSignatureProviderFactory.getProvider(
        signature.provider as SignatureProvider
      );
      
      return await provider.checkSignatureStatus(signatureId);
      
    } catch (error) {
      console.error('Error al verificar estado de firma:', error);
      return SignatureStatus.ERROR;
    }
  }
  
  /**
   * Obtiene detalles de una firma
   */
  async getSignatureDetails(signatureId: string): Promise<Record<string, any>> {
    try {
      const [signature] = await db
        .select()
        .from(signatures)
        .where(eq(signatures.id, signatureId));
      
      if (!signature) {
        throw new Error('Firma no encontrada');
      }
      
      const provider = ElectronicSignatureProviderFactory.getProvider(
        signature.provider as SignatureProvider
      );
      
      return await provider.getSignatureDetails(signatureId);
      
    } catch (error) {
      console.error('Error al obtener detalles de firma:', error);
      return { error: error.message };
    }
  }
  
  /**
   * Completa una firma con eToken
   */
  async completeETokenSignature(
    signatureId: string,
    signatureData: {
      certificate: string;
      timestamp: string;
      signature: string;
    }
  ): Promise<SignatureStatus> {
    try {
      const [signature] = await db
        .select()
        .from(signatures)
        .where(eq(signatures.id, signatureId));
      
      if (!signature) {
        throw new Error('Firma no encontrada');
      }
      
      if (signature.provider !== SignatureProvider.ETOKEN) {
        throw new Error('Esta función solo es válida para firmas con eToken');
      }
      
      const provider = ElectronicSignatureProviderFactory.getProvider(
        SignatureProvider.ETOKEN
      ) as ETokenProvider;
      
      return await provider.completeETokenSignature(signatureId, signatureData);
      
    } catch (error) {
      console.error('Error al completar firma con eToken:', error);
      return SignatureStatus.ERROR;
    }
  }
  
  /**
   * Completa una firma simple
   */
  async completeSimpleSignature(
    signatureId: string,
    signatureImageData: string
  ): Promise<SignatureStatus> {
    try {
      const [signature] = await db
        .select()
        .from(signatures)
        .where(eq(signatures.id, signatureId));
      
      if (!signature) {
        throw new Error('Firma no encontrada');
      }
      
      if (signature.provider !== SignatureProvider.SIMPLE) {
        throw new Error('Esta función solo es válida para firmas simples');
      }
      
      const provider = ElectronicSignatureProviderFactory.getProvider(
        SignatureProvider.SIMPLE
      ) as SimpleSignatureProvider;
      
      return await provider.completeSimpleSignature(signatureId, signatureImageData);
      
    } catch (error) {
      console.error('Error al completar firma simple:', error);
      return SignatureStatus.ERROR;
    }
  }
  
  /**
   * Verifica la autenticidad de una firma
   */
  async verifySignature(verificationCode: string): Promise<{
    isValid: boolean;
    documentId?: number;
    signatureDetails?: any;
    documentDetails?: any;
    error?: string;
  }> {
    try {
      // Buscar firma por código de verificación
      const [signature] = await db
        .select()
        .from(signatures)
        .where(eq(signatures.verificationCode, verificationCode));
      
      if (!signature) {
        return {
          isValid: false,
          error: 'Código de verificación no válido'
        };
      }
      
      // Verificar que la firma esté completada
      if (signature.status !== SignatureStatus.COMPLETED) {
        return {
          isValid: false,
          error: 'La firma no está completada'
        };
      }
      
      // Obtener documento asociado
      const [documentSignature] = await db
        .select()
        .from(documentSignatures)
        .where(eq(documentSignatures.signatureId, signature.id));
      
      if (!documentSignature) {
        return {
          isValid: false,
          error: 'No se encontró documento asociado a la firma'
        };
      }
      
      const [document] = await db
        .select()
        .from(documents)
        .where(eq(documents.id, documentSignature.documentId));
      
      if (!document) {
        return {
          isValid: false,
          error: 'No se encontró el documento'
        };
      }
      
      return {
        isValid: true,
        documentId: document.id,
        signatureDetails: {
          id: signature.id,
          provider: signature.provider,
          type: signature.type,
          createdAt: signature.createdAt,
          completedAt: signature.updatedAt
        },
        documentDetails: {
          id: document.id,
          title: document.title,
          type: document.type,
          createdAt: document.createdAt
        }
      };
      
    } catch (error) {
      console.error('Error al verificar firma:', error);
      return {
        isValid: false,
        error: error.message || 'Error desconocido al verificar firma'
      };
    }
  }
  
  /**
   * Genera un código QR para verificación de firma
   */
  async generateVerificationQR(
    signatureId: string,
    options?: {
      size?: number;
      includeVerificationUrl?: boolean;
    }
  ): Promise<{
    qrData: string;
    verificationUrl: string;
    verificationCode: string;
  }> {
    try {
      const [signature] = await db
        .select()
        .from(signatures)
        .where(eq(signatures.id, signatureId));
      
      if (!signature) {
        throw new Error('Firma no encontrada');
      }
      
      const verificationCode = signature.verificationCode;
      
      if (!verificationCode) {
        throw new Error('La firma no tiene código de verificación');
      }
      
      // Crear URL de verificación
      const baseUrl = process.env.APP_URL || 'https://notarypro.cl';
      const verificationUrl = `${baseUrl}/verificar/${verificationCode}`;
      
      // Datos para el QR
      const qrData = options?.includeVerificationUrl 
        ? verificationUrl 
        : verificationCode;
      
      // En una implementación real, aquí se generaría la imagen del QR
      // En este caso, solo devolvemos los datos necesarios
      
      return {
        qrData,
        verificationUrl,
        verificationCode
      };
      
    } catch (error) {
      console.error('Error al generar QR de verificación:', error);
      throw error;
    }
  }
}

// Exportar instancia del servicio
export const electronicSignatureService = new ElectronicSignatureService();