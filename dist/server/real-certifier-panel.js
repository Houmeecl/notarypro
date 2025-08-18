"use strict";
/**
 * PANEL DE CERTIFICADOR REAL COMPLETO
 * Sistema real para certificadores con documentos reales de base de datos
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.realCertifierRouter = void 0;
const express_1 = __importDefault(require("express"));
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("@shared/schema");
const jwt_auth_service_1 = require("./services/jwt-auth-service");
const date_fns_1 = require("date-fns");
const fs_1 = __importDefault(require("fs"));
const realCertifierRouter = express_1.default.Router();
exports.realCertifierRouter = realCertifierRouter;
// Middleware de autenticación para certificadores
realCertifierRouter.use(jwt_auth_service_1.authenticateJWT);
realCertifierRouter.use((0, jwt_auth_service_1.requireRole)(['certifier', 'admin', 'notary']));
/**
 * GET /api/real-certifier/pending-documents
 * Obtener documentos reales pendientes de certificación
 */
realCertifierRouter.get('/pending-documents', async (req, res) => {
    try {
        const { limit = 20, priority = 'all' } = req.query;
        // Obtener documentos pendientes con información del usuario
        const pendingDocuments = await db_1.db
            .select({
            id: schema_1.documents.id,
            title: schema_1.documents.title,
            documentType: schema_1.documents.documentType,
            description: schema_1.documents.description,
            status: schema_1.documents.status,
            fileName: schema_1.documents.fileName,
            fileSize: schema_1.documents.fileSize,
            mimeType: schema_1.documents.mimeType,
            createdAt: schema_1.documents.createdAt,
            updatedAt: schema_1.documents.updatedAt,
            // Información del usuario
            userId: schema_1.users.id,
            userName: schema_1.users.fullName,
            userEmail: schema_1.users.email,
            userRole: schema_1.users.role,
            userPlatform: schema_1.users.platform,
            // Calcular prioridad basada en tiempo
            daysSinceUpload: (0, drizzle_orm_1.sql) `EXTRACT(DAY FROM (NOW() - ${schema_1.documents.createdAt}))`
        })
            .from(schema_1.documents)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.documents.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.documents.status, 'uploaded'), (0, drizzle_orm_1.eq)(schema_1.documents.status, 'processing')))
            .orderBy(schema_1.documents.createdAt) // Más antiguos primero
            .limit(Number(limit));
        // Clasificar por prioridad
        const documentsWithPriority = pendingDocuments.map(doc => {
            const days = doc.daysSinceUpload || 0;
            let priorityLevel = 'normal';
            if (days > 7)
                priorityLevel = 'high';
            else if (days > 3)
                priorityLevel = 'medium';
            return {
                ...doc,
                priority: priorityLevel,
                urgency: days > 7 ? 'urgent' : days > 3 ? 'important' : 'normal'
            };
        });
        // Filtrar por prioridad si se especifica
        const filteredDocuments = priority !== 'all'
            ? documentsWithPriority.filter(doc => doc.priority === priority)
            : documentsWithPriority;
        res.json({
            success: true,
            documents: filteredDocuments,
            summary: {
                total: pendingDocuments.length,
                urgent: documentsWithPriority.filter(d => d.urgency === 'urgent').length,
                important: documentsWithPriority.filter(d => d.urgency === 'important').length,
                normal: documentsWithPriority.filter(d => d.urgency === 'normal').length
            }
        });
    }
    catch (error) {
        console.error('Error obteniendo documentos pendientes:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener documentos pendientes'
        });
    }
});
/**
 * GET /api/real-certifier/document/:id
 * Obtener documento específico para certificación
 */
realCertifierRouter.get('/document/:id', async (req, res) => {
    try {
        const documentId = Number(req.params.id);
        const [document] = await db_1.db
            .select({
            id: schema_1.documents.id,
            title: schema_1.documents.title,
            documentType: schema_1.documents.documentType,
            description: schema_1.documents.description,
            status: schema_1.documents.status,
            filePath: schema_1.documents.filePath,
            fileName: schema_1.documents.fileName,
            fileSize: schema_1.documents.fileSize,
            mimeType: schema_1.documents.mimeType,
            fileHash: schema_1.documents.fileHash,
            createdAt: schema_1.documents.createdAt,
            updatedAt: schema_1.documents.updatedAt,
            // Información completa del usuario
            userId: schema_1.users.id,
            userName: schema_1.users.fullName,
            userEmail: schema_1.users.email,
            userRole: schema_1.users.role,
            userPlatform: schema_1.users.platform,
            userAddress: schema_1.users.address,
            userRegion: schema_1.users.region,
            userComuna: schema_1.users.comuna
        })
            .from(schema_1.documents)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.documents.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, documentId));
        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Documento no encontrado'
            });
        }
        // Verificar si el archivo existe físicamente
        const fileExists = fs_1.default.existsSync(document.filePath);
        // Obtener verificaciones de identidad del usuario
        const userVerifications = await db_1.db
            .select({
            id: schema_1.identityVerifications.id,
            status: schema_1.identityVerifications.status,
            verificationType: schema_1.identityVerifications.verificationType,
            createdAt: schema_1.identityVerifications.createdAt
        })
            .from(schema_1.identityVerifications)
            .where((0, drizzle_orm_1.eq)(schema_1.identityVerifications.userId, document.userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.identityVerifications.createdAt))
            .limit(5);
        // Historial de cambios del documento
        const documentHistory = await db_1.db
            .select({
            eventType: schema_1.analyticsEvents.eventType,
            metadata: schema_1.analyticsEvents.metadata,
            createdAt: schema_1.analyticsEvents.createdAt
        })
            .from(schema_1.analyticsEvents)
            .where((0, drizzle_orm_1.eq)(schema_1.analyticsEvents.documentId, documentId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.analyticsEvents.createdAt));
        res.json({
            success: true,
            document: {
                ...document,
                fileExists,
                verifications: userVerifications,
                history: documentHistory,
                canCertify: ['uploaded', 'processing'].includes(document.status),
                certificationInfo: {
                    requiredVerifications: ['identity', 'document'],
                    hasIdentityVerification: userVerifications.some(v => v.status === 'verified'),
                    readyForCertification: userVerifications.some(v => v.status === 'verified') && fileExists
                }
            }
        });
    }
    catch (error) {
        console.error('Error obteniendo documento para certificación:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener documento'
        });
    }
});
/**
 * POST /api/real-certifier/document/:id/certify
 * Certificar documento real
 */
realCertifierRouter.post('/document/:id/certify', async (req, res) => {
    try {
        const documentId = Number(req.params.id);
        const { notes, certificationLevel = 'standard' } = req.body;
        const certifierId = req.user?.userId;
        const certifierName = req.user?.fullName;
        // Verificar que el documento existe y está en estado correcto
        const [document] = await db_1.db
            .select()
            .from(schema_1.documents)
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, documentId));
        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Documento no encontrado'
            });
        }
        if (!['uploaded', 'processing'].includes(document.status)) {
            return res.status(400).json({
                success: false,
                error: 'El documento no está en estado válido para certificación'
            });
        }
        // Actualizar documento a certificado
        const [certifiedDocument] = await db_1.db
            .update(schema_1.documents)
            .set({
            status: 'certified',
            updatedAt: new Date(),
            description: notes || document.description
        })
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, documentId))
            .returning();
        // Registrar evento de certificación
        await db_1.db.insert(schema_1.analyticsEvents).values({
            eventType: 'document_certified',
            userId: document.userId,
            documentId: documentId,
            metadata: {
                certifierId,
                certifierName,
                certificationLevel,
                notes,
                timestamp: new Date()
            },
            createdAt: new Date()
        });
        res.json({
            success: true,
            message: 'Documento certificado exitosamente',
            document: certifiedDocument,
            certification: {
                certifiedBy: certifierName,
                certificationDate: new Date(),
                level: certificationLevel,
                notes
            }
        });
    }
    catch (error) {
        console.error('Error certificando documento:', error);
        res.status(500).json({
            success: false,
            error: 'Error al certificar documento'
        });
    }
});
/**
 * POST /api/real-certifier/document/:id/reject
 * Rechazar documento real
 */
realCertifierRouter.post('/document/:id/reject', async (req, res) => {
    try {
        const documentId = Number(req.params.id);
        const { reason, details } = req.body;
        const certifierId = req.user?.userId;
        const certifierName = req.user?.fullName;
        if (!reason) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere especificar la razón del rechazo'
            });
        }
        const [document] = await db_1.db
            .select()
            .from(schema_1.documents)
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, documentId));
        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Documento no encontrado'
            });
        }
        // Actualizar documento a rechazado
        const [rejectedDocument] = await db_1.db
            .update(schema_1.documents)
            .set({
            status: 'rejected',
            updatedAt: new Date(),
            description: `RECHAZADO: ${reason}. ${details || ''}`
        })
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, documentId))
            .returning();
        // Registrar evento de rechazo
        await db_1.db.insert(schema_1.analyticsEvents).values({
            eventType: 'document_rejected',
            userId: document.userId,
            documentId: documentId,
            metadata: {
                certifierId,
                certifierName,
                reason,
                details,
                timestamp: new Date()
            },
            createdAt: new Date()
        });
        res.json({
            success: true,
            message: 'Documento rechazado',
            document: rejectedDocument,
            rejection: {
                rejectedBy: certifierName,
                rejectionDate: new Date(),
                reason,
                details
            }
        });
    }
    catch (error) {
        console.error('Error rechazando documento:', error);
        res.status(500).json({
            success: false,
            error: 'Error al rechazar documento'
        });
    }
});
/**
 * GET /api/real-certifier/my-certifications
 * Obtener certificaciones realizadas por el certificador
 */
realCertifierRouter.get('/my-certifications', async (req, res) => {
    try {
        const certifierId = req.user?.userId;
        const { page = 1, limit = 20, period = '30' } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const startDate = (0, date_fns_1.subDays)(new Date(), Number(period));
        // Obtener certificaciones realizadas
        const certifications = await db_1.db
            .select({
            eventId: schema_1.analyticsEvents.id,
            documentId: schema_1.analyticsEvents.documentId,
            eventType: schema_1.analyticsEvents.eventType,
            metadata: schema_1.analyticsEvents.metadata,
            createdAt: schema_1.analyticsEvents.createdAt,
            // Información del documento
            documentTitle: schema_1.documents.title,
            documentType: schema_1.documents.documentType,
            documentStatus: schema_1.documents.status,
            // Información del usuario del documento
            userName: schema_1.users.fullName,
            userEmail: schema_1.users.email
        })
            .from(schema_1.analyticsEvents)
            .leftJoin(schema_1.documents, (0, drizzle_orm_1.eq)(schema_1.analyticsEvents.documentId, schema_1.documents.id))
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.documents.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.analyticsEvents.eventType, 'document_certified'), (0, drizzle_orm_1.sql) `${schema_1.analyticsEvents.metadata}->>'certifierId' = ${certifierId.toString()}`, (0, drizzle_orm_1.gte)(schema_1.analyticsEvents.createdAt, startDate)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.analyticsEvents.createdAt))
            .limit(Number(limit))
            .offset(offset);
        // Estadísticas del certificador
        const [certificationStats] = await db_1.db
            .select({
            totalCertifications: (0, drizzle_orm_1.sql) `count(*)`
        })
            .from(schema_1.analyticsEvents)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.analyticsEvents.eventType, 'document_certified'), (0, drizzle_orm_1.sql) `${schema_1.analyticsEvents.metadata}->>'certifierId' = ${certifierId.toString()}`));
        // Certificaciones por tipo de documento
        const certificationsByType = await db_1.db
            .select({
            documentType: schema_1.documents.documentType,
            count: (0, drizzle_orm_1.sql) `count(*)`
        })
            .from(schema_1.analyticsEvents)
            .leftJoin(schema_1.documents, (0, drizzle_orm_1.eq)(schema_1.analyticsEvents.documentId, schema_1.documents.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.analyticsEvents.eventType, 'document_certified'), (0, drizzle_orm_1.sql) `${schema_1.analyticsEvents.metadata}->>'certifierId' = ${certifierId.toString()}`, (0, drizzle_orm_1.gte)(schema_1.analyticsEvents.createdAt, startDate)))
            .groupBy(schema_1.documents.documentType)
            .orderBy((0, drizzle_orm_1.sql) `count(*) DESC`);
        res.json({
            success: true,
            certifications,
            stats: {
                totalCertifications: certificationStats?.totalCertifications || 0,
                periodCertifications: certifications.length,
                period: `${period} días`
            },
            charts: {
                certificationsByType
            },
            pagination: {
                page: Number(page),
                limit: Number(limit),
                hasMore: certifications.length === Number(limit)
            }
        });
    }
    catch (error) {
        console.error('Error obteniendo certificaciones:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener certificaciones'
        });
    }
});
/**
 * GET /api/real-certifier/dashboard
 * Dashboard real del certificador con métricas
 */
realCertifierRouter.get('/dashboard', async (req, res) => {
    try {
        const certifierId = req.user?.userId;
        const today = new Date();
        const last7Days = (0, date_fns_1.subDays)(today, 7);
        const last30Days = (0, date_fns_1.subDays)(today, 30);
        // Métricas del certificador
        const [pendingCount, todayCertifications, weeklyCertifications, totalCertifications] = await Promise.all([
            // Documentos pendientes
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema_1.documents)
                .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.documents.status, 'uploaded'), (0, drizzle_orm_1.eq)(schema_1.documents.status, 'processing'))),
            // Certificaciones de hoy
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema_1.analyticsEvents)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.analyticsEvents.eventType, 'document_certified'), (0, drizzle_orm_1.sql) `${schema_1.analyticsEvents.metadata}->>'certifierId' = ${certifierId.toString()}`, (0, drizzle_orm_1.gte)(schema_1.analyticsEvents.createdAt, new Date(today.toDateString())))),
            // Certificaciones de la semana
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema_1.analyticsEvents)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.analyticsEvents.eventType, 'document_certified'), (0, drizzle_orm_1.sql) `${schema_1.analyticsEvents.metadata}->>'certifierId' = ${certifierId.toString()}`, (0, drizzle_orm_1.gte)(schema_1.analyticsEvents.createdAt, last7Days))),
            // Total de certificaciones
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema_1.analyticsEvents)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.analyticsEvents.eventType, 'document_certified'), (0, drizzle_orm_1.sql) `${schema_1.analyticsEvents.metadata}->>'certifierId' = ${certifierId.toString()}`))
        ]);
        // Documentos urgentes (más de 7 días)
        const urgentDocuments = await db_1.db
            .select({
            id: schema_1.documents.id,
            title: schema_1.documents.title,
            documentType: schema_1.documents.documentType,
            createdAt: schema_1.documents.createdAt,
            userName: schema_1.users.fullName,
            daysPending: (0, drizzle_orm_1.sql) `EXTRACT(DAY FROM (NOW() - ${schema_1.documents.createdAt}))`
        })
            .from(schema_1.documents)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.documents.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.documents.status, 'uploaded'), (0, drizzle_orm_1.eq)(schema_1.documents.status, 'processing')), (0, drizzle_orm_1.sql) `EXTRACT(DAY FROM (NOW() - ${schema_1.documents.createdAt})) > 7`))
            .orderBy(schema_1.documents.createdAt)
            .limit(5);
        // Actividad de certificación últimos 7 días
        const dailyCertifications = await db_1.db
            .select({
            date: (0, drizzle_orm_1.sql) `DATE(${schema_1.analyticsEvents.createdAt})`,
            count: (0, drizzle_orm_1.sql) `count(*)`
        })
            .from(schema_1.analyticsEvents)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.analyticsEvents.eventType, 'document_certified'), (0, drizzle_orm_1.sql) `${schema_1.analyticsEvents.metadata}->>'certifierId' = ${certifierId.toString()}`, (0, drizzle_orm_1.gte)(schema_1.analyticsEvents.createdAt, last7Days)))
            .groupBy((0, drizzle_orm_1.sql) `DATE(${schema_1.analyticsEvents.createdAt})`)
            .orderBy((0, drizzle_orm_1.sql) `DATE(${schema_1.analyticsEvents.createdAt})`);
        res.json({
            success: true,
            dashboard: {
                metrics: {
                    pendingDocuments: pendingCount[0]?.count || 0,
                    todayCertifications: todayCertifications[0]?.count || 0,
                    weeklyCertifications: weeklyCertifications[0]?.count || 0,
                    totalCertifications: totalCertifications[0]?.count || 0,
                    urgentDocuments: urgentDocuments.length
                },
                urgentDocuments,
                charts: {
                    dailyCertifications
                },
                certifier: {
                    id: certifierId,
                    name: req.user?.fullName,
                    role: req.user?.role
                },
                lastUpdated: new Date()
            }
        });
    }
    catch (error) {
        console.error('Error obteniendo dashboard del certificador:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener dashboard'
        });
    }
});
/**
 * POST /api/real-certifier/batch-action
 * Acción en lote sobre múltiples documentos
 */
realCertifierRouter.post('/batch-action', async (req, res) => {
    try {
        const { documentIds, action, notes } = req.body;
        const certifierId = req.user?.userId;
        const certifierName = req.user?.fullName;
        if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere una lista de IDs de documentos'
            });
        }
        if (!['certify', 'reject', 'set-processing'].includes(action)) {
            return res.status(400).json({
                success: false,
                error: 'Acción no válida'
            });
        }
        const results = [];
        for (const docId of documentIds) {
            try {
                let newStatus = action === 'certify' ? 'certified' :
                    action === 'reject' ? 'rejected' : 'processing';
                const [updatedDoc] = await db_1.db
                    .update(schema_1.documents)
                    .set({
                    status: newStatus,
                    updatedAt: new Date(),
                    ...(notes && { description: notes })
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.documents.id, Number(docId)))
                    .returning();
                if (updatedDoc) {
                    // Registrar evento
                    await db_1.db.insert(schema_1.analyticsEvents).values({
                        eventType: action === 'certify' ? 'document_certified' :
                            action === 'reject' ? 'document_rejected' : 'document_updated',
                        userId: updatedDoc.userId,
                        documentId: Number(docId),
                        metadata: {
                            certifierId,
                            certifierName,
                            action,
                            notes,
                            batchOperation: true,
                            timestamp: new Date()
                        },
                        createdAt: new Date()
                    });
                    results.push({
                        documentId: docId,
                        success: true,
                        newStatus
                    });
                }
            }
            catch (error) {
                results.push({
                    documentId: docId,
                    success: false,
                    error: 'Error al procesar documento'
                });
            }
        }
        const successCount = results.filter(r => r.success).length;
        res.json({
            success: true,
            message: `Acción aplicada a ${successCount} de ${documentIds.length} documentos`,
            results,
            summary: {
                total: documentIds.length,
                successful: successCount,
                failed: documentIds.length - successCount,
                action
            }
        });
    }
    catch (error) {
        console.error('Error en acción en lote:', error);
        res.status(500).json({
            success: false,
            error: 'Error al ejecutar acción en lote'
        });
    }
});
/**
 * GET /api/real-certifier/workload
 * Carga de trabajo real del certificador
 */
realCertifierRouter.get('/workload', async (req, res) => {
    try {
        const certifierId = req.user?.userId;
        const last30Days = (0, date_fns_1.subDays)(new Date(), 30);
        // Carga de trabajo por día
        const dailyWorkload = await db_1.db
            .select({
            date: (0, drizzle_orm_1.sql) `DATE(${schema_1.analyticsEvents.createdAt})`,
            certifications: (0, drizzle_orm_1.sql) `count(*)`
        })
            .from(schema_1.analyticsEvents)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.analyticsEvents.eventType, 'document_certified'), (0, drizzle_orm_1.sql) `${schema_1.analyticsEvents.metadata}->>'certifierId' = ${certifierId.toString()}`, (0, drizzle_orm_1.gte)(schema_1.analyticsEvents.createdAt, last30Days)))
            .groupBy((0, drizzle_orm_1.sql) `DATE(${schema_1.analyticsEvents.createdAt})`)
            .orderBy((0, drizzle_orm_1.sql) `DATE(${schema_1.analyticsEvents.createdAt})`);
        // Promedio de certificaciones por día
        const avgCertificationsPerDay = dailyWorkload.length > 0
            ? dailyWorkload.reduce((sum, day) => sum + (day.certifications || 0), 0) / dailyWorkload.length
            : 0;
        // Tipos de documentos más certificados
        const topDocumentTypes = await db_1.db
            .select({
            documentType: schema_1.documents.documentType,
            count: (0, drizzle_orm_1.sql) `count(*)`
        })
            .from(schema_1.analyticsEvents)
            .leftJoin(schema_1.documents, (0, drizzle_orm_1.eq)(schema_1.analyticsEvents.documentId, schema_1.documents.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.analyticsEvents.eventType, 'document_certified'), (0, drizzle_orm_1.sql) `${schema_1.analyticsEvents.metadata}->>'certifierId' = ${certifierId.toString()}`, (0, drizzle_orm_1.gte)(schema_1.analyticsEvents.createdAt, last30Days)))
            .groupBy(schema_1.documents.documentType)
            .orderBy((0, drizzle_orm_1.sql) `count(*) DESC`)
            .limit(5);
        res.json({
            success: true,
            workload: {
                period: '30 días',
                averagePerDay: Math.round(avgCertificationsPerDay * 100) / 100,
                totalCertifications: dailyWorkload.reduce((sum, day) => sum + (day.certifications || 0), 0),
                activeDays: dailyWorkload.length,
                charts: {
                    dailyWorkload,
                    topDocumentTypes
                },
                certifier: {
                    id: certifierId,
                    name: req.user?.fullName
                }
            }
        });
    }
    catch (error) {
        console.error('Error obteniendo carga de trabajo:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener carga de trabajo'
        });
    }
});
