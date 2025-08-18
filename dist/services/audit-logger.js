"use strict";
/**
 * Servicio de Registro de Auditoría
 *
 * Este módulo implementa un sistema de registro de auditoría para acciones críticas
 * relacionadas con documentos, firmas electrónicas y verificación de identidad,
 * cumpliendo con los requerimientos de la Ley 19.799 de Chile.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogService = exports.AuditLogService = exports.AuditSeverity = exports.AuditCategory = exports.AuditActionType = void 0;
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const uuid_1 = require("uuid");
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
var AuditActionType;
(function (AuditActionType) {
    AuditActionType["DOCUMENT_CREATED"] = "document_created";
    AuditActionType["DOCUMENT_VIEWED"] = "document_viewed";
    AuditActionType["DOCUMENT_DOWNLOADED"] = "document_downloaded";
    AuditActionType["DOCUMENT_SIGNED"] = "document_signed";
    AuditActionType["DOCUMENT_VERIFIED"] = "document_verified";
    AuditActionType["DOCUMENT_STORED"] = "document_stored";
    AuditActionType["DOCUMENT_SHARED"] = "document_shared";
    AuditActionType["IDENTITY_VERIFICATION_INITIATED"] = "identity_verification_initiated";
    AuditActionType["IDENTITY_VERIFICATION_COMPLETED"] = "identity_verification_completed";
    AuditActionType["IDENTITY_VERIFICATION_FAILED"] = "identity_verification_failed";
    AuditActionType["SIGNATURE_INITIATED"] = "signature_initiated";
    AuditActionType["SIGNATURE_COMPLETED"] = "signature_completed";
    AuditActionType["SIGNATURE_REJECTED"] = "signature_rejected";
    AuditActionType["SIGNATURE_VERIFIED"] = "signature_verified";
    AuditActionType["USER_LOGIN"] = "user_login";
    AuditActionType["USER_LOGOUT"] = "user_logout";
    AuditActionType["USER_CREATED"] = "user_created";
    AuditActionType["USER_UPDATED"] = "user_updated";
    AuditActionType["USER_DELETED"] = "user_deleted";
    AuditActionType["ADMIN_ACTION"] = "admin_action";
    AuditActionType["SECURITY_EVENT"] = "security_event";
})(AuditActionType || (exports.AuditActionType = AuditActionType = {}));
var AuditCategory;
(function (AuditCategory) {
    AuditCategory["DOCUMENT"] = "document";
    AuditCategory["IDENTITY"] = "identity";
    AuditCategory["SIGNATURE"] = "signature";
    AuditCategory["USER"] = "user";
    AuditCategory["SECURITY"] = "security";
    AuditCategory["ADMIN"] = "admin";
})(AuditCategory || (exports.AuditCategory = AuditCategory = {}));
var AuditSeverity;
(function (AuditSeverity) {
    AuditSeverity["INFO"] = "info";
    AuditSeverity["WARNING"] = "warning";
    AuditSeverity["ERROR"] = "error";
    AuditSeverity["CRITICAL"] = "critical";
})(AuditSeverity || (exports.AuditSeverity = AuditSeverity = {}));
/**
 * Clase principal para el servicio de auditoría
 */
class AuditLogService {
    /**
     * Registra una acción en los logs de auditoría
     */
    async log(entry) {
        try {
            const logId = entry.id || (0, uuid_1.v4)();
            await db_1.db.insert(auditLogs).values({
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
        }
        catch (error) {
            console.error('Error al registrar entrada de auditoría:', error);
            // En caso de error, intentar guardar en archivo de respaldo
            this.logToBackupFile({
                ...entry,
                error: error.message,
                timestamp: new Date().toISOString()
            });
            return (0, uuid_1.v4)(); // Generar un ID aunque haya fallado
        }
    }
    /**
     * Método de respaldo: guarda el log en archivo en caso de fallo de DB
     */
    logToBackupFile(data) {
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
            fs.appendFileSync(logFilePath, JSON.stringify(data) + '\n', 'utf8');
        }
        catch (backupError) {
            console.error('Error crítico al intentar registrar en archivo de respaldo:', backupError);
        }
    }
    /**
     * Registra acción relacionada con documentos
     */
    async logDocumentAction(actionType, documentId, userId, details, request, severity = AuditSeverity.INFO) {
        let ipAddress;
        let userAgent;
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
    async logIdentityAction(actionType, userId, details, request, severity = AuditSeverity.INFO) {
        let ipAddress;
        let userAgent;
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
    async logSignatureAction(actionType, userId, documentId, details, request, severity = AuditSeverity.INFO) {
        let ipAddress;
        let userAgent;
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
    async logUserAction(actionType, userId, details, request, severity = AuditSeverity.INFO) {
        let ipAddress;
        let userAgent;
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
    async logSecurityEvent(actionType, details, userId, request, severity = AuditSeverity.WARNING) {
        let ipAddress;
        let userAgent;
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
    async searchLogs(options) {
        try {
            let query = db_1.db.select().from(auditLogs);
            // Aplicar filtros
            if (options.actionType) {
                query = query.where((0, drizzle_orm_1.eq)(auditLogs.actionType, options.actionType));
            }
            if (options.category) {
                query = query.where((0, drizzle_orm_1.eq)(auditLogs.category, options.category));
            }
            if (options.userId) {
                query = query.where((0, drizzle_orm_1.eq)(auditLogs.userId, options.userId));
            }
            if (options.documentId) {
                query = query.where((0, drizzle_orm_1.eq)(auditLogs.documentId, options.documentId));
            }
            if (options.severity) {
                query = query.where((0, drizzle_orm_1.eq)(auditLogs.severity, options.severity));
            }
            if (options.startDate) {
                query = query.where(gte(auditLogs.createdAt, options.startDate));
            }
            if (options.endDate) {
                query = query.where(lte(auditLogs.createdAt, options.endDate));
            }
            // Ordenar por fecha (más reciente primero)
            query = query.orderBy((0, drizzle_orm_1.desc)(auditLogs.createdAt));
            // Paginación
            if (options.limit) {
                query = query.limit(options.limit);
            }
            if (options.offset) {
                query = query.offset(options.offset);
            }
            return await query;
        }
        catch (error) {
            console.error('Error al buscar logs de auditoría:', error);
            return [];
        }
    }
    /**
     * Obtiene estadísticas de actividad
     */
    async getActivityStats(options = {}) {
        try {
            // Construir consulta base
            let query = db_1.db.select().from(auditLogs);
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
                byCategory: {},
                byActionType: {},
                bySeverity: {}
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
        }
        catch (error) {
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
exports.AuditLogService = AuditLogService;
// Exportar instancia del servicio
exports.auditLogService = new AuditLogService();
