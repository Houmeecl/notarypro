/**
 * Servicio de Verificación de Identidad
 * 
 * Este módulo proporciona integración con servicios externos de verificación de identidad
 * como Onfido y Jumio, además de implementar verificaciones locales según los
 * requerimientos de la Ley 19.799 de Chile sobre Firma Electrónica.
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { identityVerifications, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Tipos para verificación de identidad
export enum VerificationProvider {
  ONFIDO = 'onfido',
  JUMIO = 'jumio',
  GETAPI = 'getapi', // API de verificación chilena
  INTERNAL = 'internal' // Verificación interna (NFC + selfie)
}

export enum VerificationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ERROR = 'error'
}

export enum VerificationType {
  DOCUMENT = 'document',
  BIOMETRIC = 'biometric',
  NFC = 'nfc',
  ADDRESS = 'address',
  COMBINED = 'combined'
}

interface VerificationResult {
  success: boolean;
  verificationId: string;
  provider: VerificationProvider;
  status: VerificationStatus;
  details?: Record<string, any>;
  error?: string;
}

/**
 * Clase abstracta que define la interfaz para proveedores de verificación
 */
abstract class IdentityVerificationProvider {
  abstract name: VerificationProvider;
  abstract initVerification(userId: number, type: VerificationType): Promise<VerificationResult>;
  abstract checkVerificationStatus(verificationId: string): Promise<VerificationStatus>;
  abstract getVerificationDetails(verificationId: string): Promise<Record<string, any>>;
}

/**
 * Implementación para Onfido
 */
class OnfidoProvider implements IdentityVerificationProvider {
  name: VerificationProvider = VerificationProvider.ONFIDO;
  
  private apiKey: string;
  private apiUrl: string = 'https://api.onfido.com/v3';
  
  constructor() {
    const apiKey = process.env.ONFIDO_API_KEY;
    if (!apiKey) {
      throw new Error('ONFIDO_API_KEY no está configurado en las variables de entorno');
    }
    this.apiKey = apiKey;
  }
  
  async initVerification(userId: number, type: VerificationType): Promise<VerificationResult> {
    try {
      // Obtener información del usuario
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      
      // Crear un solicitante en Onfido
      const applicantResponse = await axios.post(
        `${this.apiUrl}/applicants`,
        {
          first_name: user.firstName || 'Usuario',
          last_name: user.lastName || 'Apellido',
          email: user.email
        },
        {
          headers: {
            'Authorization': `Token token=${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const applicantId = applicantResponse.data.id;
      
      // Crear verificación según el tipo solicitado
      let checkType = '';
      switch (type) {
        case VerificationType.DOCUMENT:
          checkType = 'document';
          break;
        case VerificationType.BIOMETRIC:
          checkType = 'facial_similarity';
          break;
        case VerificationType.COMBINED:
          checkType = 'standard';
          break;
        default:
          checkType = 'document';
      }
      
      // Crear un SDK token para la verificación del lado del cliente
      const sdkTokenResponse = await axios.post(
        `${this.apiUrl}/sdk_token`,
        {
          applicant_id: applicantId,
          referrer: '*://*/*'
        },
        {
          headers: {
            'Authorization': `Token token=${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const verificationId = uuidv4();
      
      // Guardar la información de verificación en la base de datos
      await db.insert(identityVerifications).values({
        id: verificationId,
        userId,
        provider: this.name,
        providerReferenceId: applicantId,
        status: VerificationStatus.PENDING,
        type,
        createdAt: new Date(),
        details: {
          applicantId,
          sdkToken: sdkTokenResponse.data.token,
          checkType
        }
      });
      
      return {
        success: true,
        verificationId,
        provider: this.name,
        status: VerificationStatus.PENDING,
        details: {
          applicantId,
          sdkToken: sdkTokenResponse.data.token
        }
      };
      
    } catch (error) {
      console.error('Error al iniciar verificación con Onfido:', error);
      
      return {
        success: false,
        verificationId: uuidv4(),
        provider: this.name,
        status: VerificationStatus.ERROR,
        error: error.message || 'Error desconocido al iniciar la verificación'
      };
    }
  }
  
  async checkVerificationStatus(verificationId: string): Promise<VerificationStatus> {
    try {
      // Obtener detalles de la verificación desde la base de datos
      const [verification] = await db
        .select()
        .from(identityVerifications)
        .where(eq(identityVerifications.id, verificationId));
      
      if (!verification) {
        throw new Error('Verificación no encontrada');
      }
      
      if (!verification.details || !verification.details.applicantId) {
        throw new Error('Detalles de verificación no válidos');
      }
      
      const applicantId = verification.details.applicantId;
      
      // Consultar el estado en Onfido
      const checksResponse = await axios.get(
        `${this.apiUrl}/applicants/${applicantId}/checks`,
        {
          headers: {
            'Authorization': `Token token=${this.apiKey}`
          }
        }
      );
      
      const checks = checksResponse.data.checks || [];
      
      if (checks.length === 0) {
        return VerificationStatus.PENDING;
      }
      
      // Evaluar el estado general de las verificaciones
      const latestCheck = checks[0];
      
      let status: VerificationStatus;
      
      switch (latestCheck.status) {
        case 'in_progress':
          status = VerificationStatus.IN_PROGRESS;
          break;
        case 'complete':
          if (latestCheck.result === 'clear') {
            status = VerificationStatus.APPROVED;
          } else {
            status = VerificationStatus.REJECTED;
          }
          break;
        case 'awaiting_applicant':
          status = VerificationStatus.PENDING;
          break;
        default:
          status = VerificationStatus.ERROR;
      }
      
      // Actualizar el estado en la base de datos
      await db
        .update(identityVerifications)
        .set({
          status,
          updatedAt: new Date(),
          details: {
            ...verification.details,
            checkStatus: latestCheck.status,
            checkResult: latestCheck.result,
            lastChecked: new Date().toISOString()
          }
        })
        .where(eq(identityVerifications.id, verificationId));
      
      return status;
      
    } catch (error) {
      console.error('Error al verificar estado con Onfido:', error);
      return VerificationStatus.ERROR;
    }
  }
  
  async getVerificationDetails(verificationId: string): Promise<Record<string, any>> {
    try {
      const [verification] = await db
        .select()
        .from(identityVerifications)
        .where(eq(identityVerifications.id, verificationId));
      
      if (!verification) {
        throw new Error('Verificación no encontrada');
      }
      
      return verification.details || {};
      
    } catch (error) {
      console.error('Error al obtener detalles de verificación:', error);
      return { error: error.message };
    }
  }
}

/**
 * Implementación para Jumio
 */
class JumioProvider implements IdentityVerificationProvider {
  name: VerificationProvider = VerificationProvider.JUMIO;
  
  private apiToken: string;
  private apiSecret: string;
  private apiUrl: string = 'https://api.jumio.com';
  
  constructor() {
    const apiToken = process.env.JUMIO_API_TOKEN;
    const apiSecret = process.env.JUMIO_API_SECRET;
    
    if (!apiToken || !apiSecret) {
      throw new Error('JUMIO_API_TOKEN o JUMIO_API_SECRET no están configurados en las variables de entorno');
    }
    
    this.apiToken = apiToken;
    this.apiSecret = apiSecret;
  }
  
  async initVerification(userId: number, type: VerificationType): Promise<VerificationResult> {
    try {
      // Obtener información del usuario
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      
      // Crear una transacción en Jumio
      const auth = Buffer.from(`${this.apiToken}:${this.apiSecret}`).toString('base64');
      
      const transactionResponse = await axios.post(
        `${this.apiUrl}/web/v4/initiateNetverify`,
        {
          customerInternalReference: `user-${userId}`,
          userReference: `user-${userId}`,
          successUrl: `${process.env.APP_URL}/verificacion/exito`,
          errorUrl: `${process.env.APP_URL}/verificacion/error`,
          callbackUrl: `${process.env.API_URL}/api/identity-verification/jumio-callback`,
          workflowId: type === VerificationType.COMBINED ? 100 : 
                       type === VerificationType.DOCUMENT ? 200 : 
                       type === VerificationType.BIOMETRIC ? 300 : 100
        },
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
            'User-Agent': 'NotaryPro/1.0.0'
          }
        }
      );
      
      const verificationId = uuidv4();
      
      // Guardar la información de verificación en la base de datos
      await db.insert(identityVerifications).values({
        id: verificationId,
        userId,
        provider: this.name,
        providerReferenceId: transactionResponse.data.transactionReference,
        status: VerificationStatus.PENDING,
        type,
        createdAt: new Date(),
        details: {
          transactionReference: transactionResponse.data.transactionReference,
          redirectUrl: transactionResponse.data.redirectUrl,
          workflowId: transactionResponse.data.workflowId
        }
      });
      
      return {
        success: true,
        verificationId,
        provider: this.name,
        status: VerificationStatus.PENDING,
        details: {
          redirectUrl: transactionResponse.data.redirectUrl,
          transactionReference: transactionResponse.data.transactionReference
        }
      };
      
    } catch (error) {
      console.error('Error al iniciar verificación con Jumio:', error);
      
      return {
        success: false,
        verificationId: uuidv4(),
        provider: this.name,
        status: VerificationStatus.ERROR,
        error: error.message || 'Error desconocido al iniciar la verificación'
      };
    }
  }
  
  async checkVerificationStatus(verificationId: string): Promise<VerificationStatus> {
    try {
      // Obtener detalles de la verificación desde la base de datos
      const [verification] = await db
        .select()
        .from(identityVerifications)
        .where(eq(identityVerifications.id, verificationId));
      
      if (!verification) {
        throw new Error('Verificación no encontrada');
      }
      
      if (!verification.details || !verification.details.transactionReference) {
        throw new Error('Detalles de verificación no válidos');
      }
      
      const transactionReference = verification.details.transactionReference;
      const auth = Buffer.from(`${this.apiToken}:${this.apiSecret}`).toString('base64');
      
      // Consultar el estado en Jumio
      const transactionResponse = await axios.get(
        `${this.apiUrl}/web/v4/transactions/${transactionReference}`,
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'User-Agent': 'NotaryPro/1.0.0'
          }
        }
      );
      
      let status: VerificationStatus;
      
      switch (transactionResponse.data.status) {
        case 'PENDING':
          status = VerificationStatus.PENDING;
          break;
        case 'PROCESSING':
          status = VerificationStatus.IN_PROGRESS;
          break;
        case 'DONE':
        case 'APPROVED':
          status = VerificationStatus.APPROVED;
          break;
        case 'DENIED':
        case 'FAILED':
          status = VerificationStatus.REJECTED;
          break;
        default:
          status = VerificationStatus.ERROR;
      }
      
      // Actualizar el estado en la base de datos
      await db
        .update(identityVerifications)
        .set({
          status,
          updatedAt: new Date(),
          details: {
            ...verification.details,
            jumioStatus: transactionResponse.data.status,
            lastChecked: new Date().toISOString()
          }
        })
        .where(eq(identityVerifications.id, verificationId));
      
      return status;
      
    } catch (error) {
      console.error('Error al verificar estado con Jumio:', error);
      return VerificationStatus.ERROR;
    }
  }
  
  async getVerificationDetails(verificationId: string): Promise<Record<string, any>> {
    try {
      const [verification] = await db
        .select()
        .from(identityVerifications)
        .where(eq(identityVerifications.id, verificationId));
      
      if (!verification) {
        throw new Error('Verificación no encontrada');
      }
      
      return verification.details || {};
      
    } catch (error) {
      console.error('Error al obtener detalles de verificación:', error);
      return { error: error.message };
    }
  }
}

/**
 * Implementación para GetAPI (API Chilena)
 */
class GetAPIProvider implements IdentityVerificationProvider {
  name: VerificationProvider = VerificationProvider.GETAPI;
  
  private apiKey: string;
  private apiUrl: string = 'https://api.getapi.cl/v1';
  
  constructor() {
    const apiKey = process.env.GETAPI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GETAPI_API_KEY no está configurado en las variables de entorno');
    }
    
    this.apiKey = apiKey;
  }
  
  async initVerification(userId: number, type: VerificationType): Promise<VerificationResult> {
    try {
      // Obtener información del usuario
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      
      // Determinar el endpoint según el tipo de verificación
      let endpoint: string;
      let payload: any = {};
      
      switch (type) {
        case VerificationType.DOCUMENT:
          endpoint = '/identidad/documento';
          payload = {
            type: 'cedula_cl',
            documentNumber: user.documentNumber || ''
          };
          break;
        case VerificationType.BIOMETRIC:
          endpoint = '/biometria/facial';
          payload = {
            documentNumber: user.documentNumber || '',
            selfieImage: user.selfieImage || ''
          };
          break;
        case VerificationType.COMBINED:
          endpoint = '/identidad/validacion-completa';
          payload = {
            rut: user.documentNumber || '',
            name: user.firstName || '',
            lastName: user.lastName || '',
            selfieImage: user.selfieImage || ''
          };
          break;
        default:
          endpoint = '/identidad/documento';
          payload = {
            type: 'cedula_cl',
            documentNumber: user.documentNumber || ''
          };
      }
      
      // Iniciar verificación con GetAPI
      const verificationResponse = await axios.post(
        `${this.apiUrl}${endpoint}`,
        payload,
        {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const verificationId = uuidv4();
      
      // Guardar la información de verificación en la base de datos
      await db.insert(identityVerifications).values({
        id: verificationId,
        userId,
        provider: this.name,
        providerReferenceId: verificationResponse.data.requestId || verificationId,
        status: this.mapGetAPIStatus(verificationResponse.data.status),
        type,
        createdAt: new Date(),
        details: {
          response: verificationResponse.data,
          endpoint,
          lastChecked: new Date().toISOString()
        }
      });
      
      return {
        success: verificationResponse.data.valid === true,
        verificationId,
        provider: this.name,
        status: this.mapGetAPIStatus(verificationResponse.data.status),
        details: verificationResponse.data
      };
      
    } catch (error) {
      console.error('Error al iniciar verificación con GetAPI:', error);
      
      return {
        success: false,
        verificationId: uuidv4(),
        provider: this.name,
        status: VerificationStatus.ERROR,
        error: error.message || 'Error desconocido al iniciar la verificación'
      };
    }
  }
  
  async checkVerificationStatus(verificationId: string): Promise<VerificationStatus> {
    try {
      // En GetAPI, las verificaciones son síncronas, por lo que solo verificamos
      // el registro en nuestra base de datos
      const [verification] = await db
        .select()
        .from(identityVerifications)
        .where(eq(identityVerifications.id, verificationId));
      
      if (!verification) {
        throw new Error('Verificación no encontrada');
      }
      
      return verification.status as VerificationStatus;
      
    } catch (error) {
      console.error('Error al verificar estado con GetAPI:', error);
      return VerificationStatus.ERROR;
    }
  }
  
  async getVerificationDetails(verificationId: string): Promise<Record<string, any>> {
    try {
      const [verification] = await db
        .select()
        .from(identityVerifications)
        .where(eq(identityVerifications.id, verificationId));
      
      if (!verification) {
        throw new Error('Verificación no encontrada');
      }
      
      return verification.details || {};
      
    } catch (error) {
      console.error('Error al obtener detalles de verificación:', error);
      return { error: error.message };
    }
  }
  
  private mapGetAPIStatus(apiStatus: string): VerificationStatus {
    switch (apiStatus) {
      case 'success':
        return VerificationStatus.APPROVED;
      case 'rejected':
        return VerificationStatus.REJECTED;
      case 'pending':
        return VerificationStatus.PENDING;
      case 'processing':
        return VerificationStatus.IN_PROGRESS;
      default:
        return VerificationStatus.ERROR;
    }
  }
}

/**
 * Implementación para verificación interna (NFC + selfie)
 */
class InternalProvider implements IdentityVerificationProvider {
  name: VerificationProvider = VerificationProvider.INTERNAL;
  
  async initVerification(userId: number, type: VerificationType): Promise<VerificationResult> {
    try {
      // Obtener información del usuario
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      
      const verificationId = uuidv4();
      
      // Crear un registro de verificación interna
      await db.insert(identityVerifications).values({
        id: verificationId,
        userId,
        provider: this.name,
        providerReferenceId: verificationId,
        status: VerificationStatus.PENDING,
        type,
        createdAt: new Date(),
        details: {
          requiredSteps: type === VerificationType.COMBINED ? ['nfc', 'selfie'] :
                         type === VerificationType.NFC ? ['nfc'] :
                         type === VerificationType.BIOMETRIC ? ['selfie'] : ['nfc'],
          completedSteps: [],
          initiatedAt: new Date().toISOString()
        }
      });
      
      return {
        success: true,
        verificationId,
        provider: this.name,
        status: VerificationStatus.PENDING,
        details: {
          requiredSteps: type === VerificationType.COMBINED ? ['nfc', 'selfie'] :
                         type === VerificationType.NFC ? ['nfc'] :
                         type === VerificationType.BIOMETRIC ? ['selfie'] : ['nfc']
        }
      };
      
    } catch (error) {
      console.error('Error al iniciar verificación interna:', error);
      
      return {
        success: false,
        verificationId: uuidv4(),
        provider: this.name,
        status: VerificationStatus.ERROR,
        error: error.message || 'Error desconocido al iniciar la verificación'
      };
    }
  }
  
  async checkVerificationStatus(verificationId: string): Promise<VerificationStatus> {
    try {
      const [verification] = await db
        .select()
        .from(identityVerifications)
        .where(eq(identityVerifications.id, verificationId));
      
      if (!verification) {
        throw new Error('Verificación no encontrada');
      }
      
      return verification.status as VerificationStatus;
      
    } catch (error) {
      console.error('Error al verificar estado interno:', error);
      return VerificationStatus.ERROR;
    }
  }
  
  async getVerificationDetails(verificationId: string): Promise<Record<string, any>> {
    try {
      const [verification] = await db
        .select()
        .from(identityVerifications)
        .where(eq(identityVerifications.id, verificationId));
      
      if (!verification) {
        throw new Error('Verificación no encontrada');
      }
      
      return verification.details || {};
      
    } catch (error) {
      console.error('Error al obtener detalles de verificación:', error);
      return { error: error.message };
    }
  }
  
  async completeVerificationStep(verificationId: string, step: string, stepData: Record<string, any>): Promise<VerificationStatus> {
    try {
      const [verification] = await db
        .select()
        .from(identityVerifications)
        .where(eq(identityVerifications.id, verificationId));
      
      if (!verification) {
        throw new Error('Verificación no encontrada');
      }
      
      if (!verification.details || !verification.details.requiredSteps) {
        throw new Error('Detalles de verificación no válidos');
      }
      
      const requiredSteps = verification.details.requiredSteps as string[];
      const completedSteps = (verification.details.completedSteps || []) as string[];
      
      if (!requiredSteps.includes(step)) {
        throw new Error(`Paso de verificación ${step} no requerido`);
      }
      
      if (completedSteps.includes(step)) {
        return verification.status as VerificationStatus;
      }
      
      // Añadir el paso a los completados
      completedSteps.push(step);
      
      // Guardar los datos del paso
      const stepDetails = {
        ...verification.details,
        completedSteps,
        [`${step}Data`]: stepData,
        [`${step}CompletedAt`]: new Date().toISOString()
      };
      
      // Determinar si todos los pasos se han completado
      const allStepsCompleted = requiredSteps.every(s => completedSteps.includes(s));
      let newStatus: VerificationStatus = verification.status as VerificationStatus;
      
      if (allStepsCompleted) {
        newStatus = VerificationStatus.APPROVED;
      } else {
        newStatus = VerificationStatus.IN_PROGRESS;
      }
      
      // Actualizar el registro de verificación
      await db
        .update(identityVerifications)
        .set({
          status: newStatus,
          updatedAt: new Date(),
          details: stepDetails
        })
        .where(eq(identityVerifications.id, verificationId));
      
      return newStatus;
      
    } catch (error) {
      console.error('Error al completar paso de verificación:', error);
      return VerificationStatus.ERROR;
    }
  }
}

/**
 * Factoría para obtener un proveedor específico de verificación
 */
export class IdentityVerificationProviderFactory {
  static getProvider(provider: VerificationProvider): IdentityVerificationProvider {
    switch (provider) {
      case VerificationProvider.ONFIDO:
        return new OnfidoProvider();
      case VerificationProvider.JUMIO:
        return new JumioProvider();
      case VerificationProvider.GETAPI:
        return new GetAPIProvider();
      case VerificationProvider.INTERNAL:
        return new InternalProvider();
      default:
        throw new Error(`Proveedor de verificación no soportado: ${provider}`);
    }
  }
  
  static getDefaultProvider(): IdentityVerificationProvider {
    // Priorizar proveedores según disponibilidad
    if (process.env.GETAPI_API_KEY) {
      return new GetAPIProvider();
    } else if (process.env.ONFIDO_API_KEY) {
      return new OnfidoProvider();
    } else if (process.env.JUMIO_API_TOKEN && process.env.JUMIO_API_SECRET) {
      return new JumioProvider();
    } else {
      return new InternalProvider();
    }
  }
}

/**
 * Servicio unificado de verificación de identidad
 */
export class IdentityVerificationService {
  async initVerification(
    userId: number,
    type: VerificationType = VerificationType.COMBINED,
    provider?: VerificationProvider
  ): Promise<VerificationResult> {
    try {
      const verificationProvider = provider 
        ? IdentityVerificationProviderFactory.getProvider(provider)
        : IdentityVerificationProviderFactory.getDefaultProvider();
      
      return await verificationProvider.initVerification(userId, type);
      
    } catch (error) {
      console.error('Error al iniciar verificación de identidad:', error);
      
      return {
        success: false,
        verificationId: uuidv4(),
        provider: provider || VerificationProvider.INTERNAL,
        status: VerificationStatus.ERROR,
        error: error.message || 'Error desconocido al iniciar la verificación'
      };
    }
  }
  
  async checkVerificationStatus(verificationId: string): Promise<VerificationStatus> {
    try {
      const [verification] = await db
        .select()
        .from(identityVerifications)
        .where(eq(identityVerifications.id, verificationId));
      
      if (!verification) {
        throw new Error('Verificación no encontrada');
      }
      
      const provider = IdentityVerificationProviderFactory.getProvider(
        verification.provider as VerificationProvider
      );
      
      return await provider.checkVerificationStatus(verificationId);
      
    } catch (error) {
      console.error('Error al verificar estado de identidad:', error);
      return VerificationStatus.ERROR;
    }
  }
  
  async getVerificationDetails(verificationId: string): Promise<Record<string, any>> {
    try {
      const [verification] = await db
        .select()
        .from(identityVerifications)
        .where(eq(identityVerifications.id, verificationId));
      
      if (!verification) {
        throw new Error('Verificación no encontrada');
      }
      
      const provider = IdentityVerificationProviderFactory.getProvider(
        verification.provider as VerificationProvider
      );
      
      return await provider.getVerificationDetails(verificationId);
      
    } catch (error) {
      console.error('Error al obtener detalles de verificación:', error);
      return { error: error.message };
    }
  }
  
  async completeInternalVerificationStep(
    verificationId: string,
    step: string,
    stepData: Record<string, any>
  ): Promise<VerificationStatus> {
    try {
      const [verification] = await db
        .select()
        .from(identityVerifications)
        .where(eq(identityVerifications.id, verificationId));
      
      if (!verification) {
        throw new Error('Verificación no encontrada');
      }
      
      if (verification.provider !== VerificationProvider.INTERNAL) {
        throw new Error('Esta función solo es válida para verificaciones internas');
      }
      
      const internalProvider = IdentityVerificationProviderFactory.getProvider(
        VerificationProvider.INTERNAL
      ) as InternalProvider;
      
      return await internalProvider.completeVerificationStep(verificationId, step, stepData);
      
    } catch (error) {
      console.error('Error al completar paso de verificación interna:', error);
      return VerificationStatus.ERROR;
    }
  }
  
  async getUserVerifications(userId: number): Promise<any[]> {
    try {
      const userVerifications = await db
        .select()
        .from(identityVerifications)
        .where(eq(identityVerifications.userId, userId))
        .orderBy(identityVerifications.createdAt);
      
      return userVerifications;
      
    } catch (error) {
      console.error('Error al obtener verificaciones del usuario:', error);
      return [];
    }
  }
  
  async getUserLatestVerificationStatus(userId: number): Promise<{
    hasValidVerification: boolean;
    latestVerification?: any;
  }> {
    try {
      const userVerifications = await db
        .select()
        .from(identityVerifications)
        .where(eq(identityVerifications.userId, userId))
        .orderBy(identityVerifications.createdAt, 'desc')
        .limit(1);
      
      if (userVerifications.length === 0) {
        return { hasValidVerification: false };
      }
      
      const latestVerification = userVerifications[0];
      const isApproved = latestVerification.status === VerificationStatus.APPROVED;
      
      return {
        hasValidVerification: isApproved,
        latestVerification
      };
      
    } catch (error) {
      console.error('Error al obtener estado de verificación del usuario:', error);
      return { hasValidVerification: false };
    }
  }
}

// Exportar instancia de servicio
export const identityVerificationService = new IdentityVerificationService();