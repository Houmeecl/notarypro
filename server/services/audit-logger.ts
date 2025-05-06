/**
 * Servicio de Registro de Auditoría
 * 
 * Este módulo implementa un sistema de registro de auditoría para acciones críticas
 * relacionadas con documentos, firmas electrónicas y verificación de identidad,
 * cumpliendo con los requerimientos de la Ley 19.799 de Chile.
 */

import { db } from '../db';
import { documents, users } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Temporalmente utilizamos definiciones locales hasta que se actualice el esquema principal
const auditLogs = {
  id: "audit_logs.id",
  actionType: "audit_logs.action_type",
  category: "audit_logs.category",
  userId: "audit_logs.user_id",
  documentId: "audit_logs.document_id",
  ipAddress: "audit_logs.ip_address"
};

// Tipos para el sistema de auditoría
export enum AuditActionType {
  DOCUMENT_CREATED = 'document_created',
  DOCUMENT_VIEWED = 'document_viewed',
  DOCUMENT_DOWNLOADED = 'document_downloaded',
  DOCUMENT_SIGNED = 'document_signed',
  DOCUMENT_VERIFIED = 'document_verified',
  DOCUMENT_STORED = 'document_stored',
  DOCUMENT_SHARED = 'document_shared',
  
  IDENTITY_VERIFICATION_INITIATED = 'identity_verification_initiated',
  IDENTITY_VERIFICATION_COMPLETED = 'identity_verification_completed',
  IDENTITY_VERIFICATION_FAILED = 'identity_verification_failed',
  
  SIGNATURE_INITIATED = 'signature_initiated',
  SIGNATURE_COMPLETED = 'signature_completed',
  SIGNATURE_REJECTED = 'signature_rejected',
  SIGNATURE_VERIFIED = 'signature_verified',
  
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  
  ADMIN_ACTION = 'admin_action',
  SECURITY_EVENT = 'security_event'
}

export enum AuditCategory {
  DOCUMENT = 'document',
  IDENTITY = 'identity',
  SIGNATURE = 'signature',
  USER = 'user',
  SECURITY = 'security',
  ADMIN = 'admin'
}

export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

interface AuditLogEntry {
  id?: string;
  actionType: AuditActionType;
  category: AuditCategory;
  severity: AuditSeverity;
  userId?: number;
  documentId?: number;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  createdAt?: Date;
}

/**
 * Clase principal para el servicio de auditoría
 */
export class AuditLogService {
  /**
   * Registra una acción en los logs de auditoría
   */
  async log(entry: AuditLogEntry): Promise<string> {
    try {
      const logId = entry.id || uuidv4();
      
      await db.insert(auditLogs).values({
        id: logId,
        actionType: entry.actionType,
        category: entry.category,
        severity: entry.severity,
        userId: entry.userId,
        documentId: entry.documentId,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        details: entry.details || {},
        createdAt: entry.createdAt || new Date()
      });
      
      return logId;
      
    } catch (error) {
      console.error('Error al registrar entrada de auditoría:', error);
      
      // En caso de error, intentar guardar en archivo de respaldo
      this.logToBackupFile({
        ...entry,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      return uuidv4(); // Generar un ID aunque haya fallado
    }
  }
  
  /**
   * Método de respaldo: guarda el log en archivo en caso de fallo de DB
   */
  private logToBackupFile(data: any): void {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const logDir = path.join(process.cwd(), 'logs');
      
      // Crear directorio si no existe
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const today = new Date();
      const logFileName = `audit_${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}.log`;
      const logFilePath = path.join(logDir, logFileName);
      
      // Añadir log al archivo
      fs.appendFileSync(
        logFilePath,
        JSON.stringify(data) + '\n',
        'utf8'
      );
      
    } catch (backupError) {
      console.error('Error crítico al intentar registrar en archivo de respaldo:', backupError);
    }
  }
  
  /**
   * Registra acción relacionada con documentos
   */
  async logDocumentAction(
    actionType: AuditActionType,
    documentId: number,
    userId?: number,
    details?: Record<string, any>,
    request?: any,
    severity: AuditSeverity = AuditSeverity.INFO
  ): Promise<string> {
    let ipAddress: string | undefined;
    let userAgent: string | undefined;
    
    if (request) {
      ipAddress = request.ip || 
                 request.headers['x-forwarded-for'] || 
                 request.connection?.remoteAddress;
      
      userAgent = request.headers['user-agent'];
    }
    
    return this.log({
      actionType,
      category: AuditCategory.DOCUMENT,
      severity,
      userId,
      documentId,
      ipAddress,
      userAgent,
      details
    });
  }
  
  /**
   * Registra acción relacionada con verificación de identidad
   */
  async logIdentityAction(
    actionType: AuditActionType,
    userId: number,
    details?: Record<string, any>,
    request?: any,
    severity: AuditSeverity = AuditSeverity.INFO
  ): Promise<string> {
    let ipAddress: string | undefined;
    let userAgent: string | undefined;
    
    if (request) {
      ipAddress = request.ip || 
                 request.headers['x-forwarded-for'] || 
                 request.connection?.remoteAddress;
      
      userAgent = request.headers['user-agent'];
    }
    
    return this.log({
      actionType,
      category: AuditCategory.IDENTITY,
      severity,
      userId,
      ipAddress,
      userAgent,
      details
    });
  }
  
  /**
   * Registra acción relacionada con firmas electrónicas
   */
  async logSignatureAction(
    actionType: AuditActionType,
    userId: number,
    documentId: number,
    details?: Record<string, any>,
    request?: any,
    severity: AuditSeverity = AuditSeverity.INFO
  ): Promise<string> {
    let ipAddress: string | undefined;
    let userAgent: string | undefined;
    
    if (request) {
      ipAddress = request.ip || 
                 request.headers['x-forwarded-for'] || 
                 request.connection?.remoteAddress;
      
      userAgent = request.headers['user-agent'];
    }
    
    return this.log({
      actionType,
      category: AuditCategory.SIGNATURE,
      severity,
      userId,
      documentId,
      ipAddress,
      userAgent,
      details
    });
  }
  
  /**
   * Registra acción relacionada con usuarios
   */
  async logUserAction(
    actionType: AuditActionType,
    userId: number,
    details?: Record<string, any>,
    request?: any,
    severity: AuditSeverity = AuditSeverity.INFO
  ): Promise<string> {
    let ipAddress: string | undefined;
    let userAgent: string | undefined;
    
    if (request) {
      ipAddress = request.ip || 
                 request.headers['x-forwarded-for'] || 
                 request.connection?.remoteAddress;
      
      userAgent = request.headers['user-agent'];
    }
    
    return this.log({
      actionType,
      category: AuditCategory.USER,
      severity,
      userId,
      ipAddress,
      userAgent,
      details
    });
  }
  
  /**
   * Registra evento de seguridad
   */
  async logSecurityEvent(
    actionType: AuditActionType,
    details: Record<string, any>,
    userId?: number,
    request?: any,
    severity: AuditSeverity = AuditSeverity.WARNING
  ): Promise<string> {
    let ipAddress: string | undefined;
    let userAgent: string | undefined;
    
    if (request) {
      ipAddress = request.ip || 
                 request.headers['x-forwarded-for'] || 
                 request.connection?.remoteAddress;
      
      userAgent = request.headers['user-agent'];
    }
    
    return this.log({
      actionType,
      category: AuditCategory.SECURITY,
      severity,
      userId,
      ipAddress,
      userAgent,
      details
    });
  }
  
  /**
   * Busca logs de auditoría
   */
  async searchLogs(options: {
    actionType?: AuditActionType;
    category?: AuditCategory;
    userId?: number;
    documentId?: number;
    startDate?: Date;
    endDate?: Date;
    severity?: AuditSeverity;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    try {
      let query = db.select().from(auditLogs);
      
      // Aplicar filtros
      if (options.actionType) {
        query = query.where(eq(auditLogs.actionType, options.actionType));
      }
      
      if (options.category) {
        query = query.where(eq(auditLogs.category, options.category));
      }
      
      if (options.userId) {
        query = query.where(eq(auditLogs.userId, options.userId));
      }
      
      if (options.documentId) {
        query = query.where(eq(auditLogs.documentId, options.documentId));
      }
      
      if (options.severity) {
        query = query.where(eq(auditLogs.severity, options.severity));
      }
      
      if (options.startDate) {
        query = query.where(gte(auditLogs.createdAt, options.startDate));
      }
      
      if (options.endDate) {
        query = query.where(lte(auditLogs.createdAt, options.endDate));
      }
      
      // Ordenar por fecha (más reciente primero)
      query = query.orderBy(desc(auditLogs.createdAt));
      
      // Paginación
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.offset(options.offset);
      }
      
      return await query;
      
    } catch (error) {
      console.error('Error al buscar logs de auditoría:', error);
      return [];
    }
  }
  
  /**
   * Obtiene estadísticas de actividad
   */
  async getActivityStats(options: {
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<{
    totalLogs: number;
    byCategory: Record<string, number>;
    byActionType: Record<string, number>;
    bySeverity: Record<string, number>;
  }> {
    try {
      // Construir consulta base
      let query = db.select().from(auditLogs);
      
      // Aplicar filtros de fecha
      if (options.startDate) {
        query = query.where(gte(auditLogs.createdAt, options.startDate));
      }
      
      if (options.endDate) {
        query = query.where(lte(auditLogs.createdAt, options.endDate));
      }
      
      // Ejecutar consulta
      const logs = await query;
      
      // Calcular estadísticas
      const stats = {
        totalLogs: logs.length,
        byCategory: {} as Record<string, number>,
        byActionType: {} as Record<string, number>,
        bySeverity: {} as Record<string, number>
      };
      
      // Procesar resultados
      logs.forEach(log => {
        // Por categoría
        if (log.category) {
          if (!stats.byCategory[log.category]) {
            stats.byCategory[log.category] = 0;
          }
          stats.byCategory[log.category]++;
        }
        
        // Por tipo de acción
        if (log.actionType) {
          if (!stats.byActionType[log.actionType]) {
            stats.byActionType[log.actionType] = 0;
          }
          stats.byActionType[log.actionType]++;
        }
        
        // Por severidad
        if (log.severity) {
          if (!stats.bySeverity[log.severity]) {
            stats.bySeverity[log.severity] = 0;
          }
          stats.bySeverity[log.severity]++;
        }
      });
      
      return stats;
      
    } catch (error) {
      console.error('Error al obtener estadísticas de auditoría:', error);
      return {
        totalLogs: 0,
        byCategory: {},
        byActionType: {},
        bySeverity: {}
      };
    }
  }
}

// Exportar instancia del servicio
export const auditLogService = new AuditLogService();