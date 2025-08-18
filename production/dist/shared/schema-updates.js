"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogsRelations = exports.insertAuditLogSchema = exports.auditLogs = exports.auditSeverityEnum = exports.auditCategoryEnum = exports.documentQrCodesRelations = exports.insertDocumentQrCodeSchema = exports.documentQrCodes = exports.qrCodeStatusEnum = exports.qrCodeTypeEnum = exports.documentStorageRecordsRelations = exports.insertDocumentStorageRecordSchema = exports.documentStorageRecords = exports.encryptionTypeEnum = exports.storageProviderEnum = exports.signaturesRelations = exports.documentSignaturesRelations = exports.insertDocumentSignatureSchema = exports.documentSignatures = exports.insertSignatureSchema = exports.signatures = exports.signatureTypeEnum = exports.signatureStatusEnum = exports.signatureProviderEnum = exports.identityVerificationsRelations = exports.insertIdentityVerificationSchema = exports.identityVerifications = exports.identityVerificationTypeEnum = exports.identityVerificationStatusEnum = exports.identityVerificationProviderEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
/*********************
 * TABLAS ADICIONALES PARA SEGURIDAD Y VERIFICACIÓN
 *********************/
// Verificación de identidad
exports.identityVerificationProviderEnum = (0, pg_core_1.pgEnum)('identity_verification_provider', [
    'onfido', 'jumio', 'getapi', 'internal'
]);
exports.identityVerificationStatusEnum = (0, pg_core_1.pgEnum)('identity_verification_status', [
    'pending', 'in_progress', 'approved', 'rejected', 'error'
]);
exports.identityVerificationTypeEnum = (0, pg_core_1.pgEnum)('identity_verification_type', [
    'document', 'biometric', 'nfc', 'address', 'combined'
]);
exports.identityVerifications = (0, pg_core_1.pgTable)('identity_verifications', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(() => users.id),
    provider: (0, exports.identityVerificationProviderEnum)('provider').notNull(),
    providerReferenceId: (0, pg_core_1.text)('provider_reference_id'),
    status: (0, exports.identityVerificationStatusEnum)('status').notNull(),
    type: (0, exports.identityVerificationTypeEnum)('type').notNull(),
    verificationCode: (0, pg_core_1.text)('verification_code'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at'),
    details: (0, pg_core_1.json)('details')
});
// Schema para inserción de verificación de identidad
exports.insertIdentityVerificationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.identityVerifications);
// Relaciones de verificación de identidad
exports.identityVerificationsRelations = (0, drizzle_orm_1.relations)(exports.identityVerifications, ({ one }) => ({
    user: one(users, {
        fields: [exports.identityVerifications.userId],
        references: [users.id]
    })
}));
// Firmas electrónicas
exports.signatureProviderEnum = (0, pg_core_1.pgEnum)('signature_provider', [
    'docusign', 'hellosign', 'etoken', 'simple'
]);
exports.signatureStatusEnum = (0, pg_core_1.pgEnum)('signature_status', [
    'pending', 'in_progress', 'completed', 'rejected', 'expired', 'error'
]);
exports.signatureTypeEnum = (0, pg_core_1.pgEnum)('signature_type', [
    'simple', 'advanced', 'qualified'
]);
exports.signatures = (0, pg_core_1.pgTable)('signatures', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(() => users.id),
    provider: (0, exports.signatureProviderEnum)('provider').notNull(),
    providerReferenceId: (0, pg_core_1.text)('provider_reference_id'),
    status: (0, exports.signatureStatusEnum)('status').notNull(),
    type: (0, exports.signatureTypeEnum)('type').notNull(),
    verificationCode: (0, pg_core_1.text)('verification_code'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at'),
    details: (0, pg_core_1.json)('details')
});
// Schema para inserción de firma
exports.insertSignatureSchema = (0, drizzle_zod_1.createInsertSchema)(exports.signatures);
// Relación entre documentos y firmas
exports.documentSignatures = (0, pg_core_1.pgTable)('document_signatures', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    documentId: (0, pg_core_1.integer)('document_id').notNull().references(() => documents.id),
    signatureId: (0, pg_core_1.text)('signature_id').notNull().references(() => exports.signatures.id),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(() => users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull(),
    details: (0, pg_core_1.json)('details')
}, (table) => {
    return {
        documentSignatureUnique: (0, pg_core_1.uniqueIndex)('document_signature_unique').on(table.documentId, table.signatureId)
    };
});
// Schema para inserción de relación documento-firma
exports.insertDocumentSignatureSchema = (0, drizzle_zod_1.createInsertSchema)(exports.documentSignatures);
// Relaciones de documento-firma
exports.documentSignaturesRelations = (0, drizzle_orm_1.relations)(exports.documentSignatures, ({ one }) => ({
    document: one(documents, {
        fields: [exports.documentSignatures.documentId],
        references: [documents.id]
    }),
    signature: one(exports.signatures, {
        fields: [exports.documentSignatures.signatureId],
        references: [exports.signatures.id]
    }),
    user: one(users, {
        fields: [exports.documentSignatures.userId],
        references: [users.id]
    })
}));
// Relaciones de firmas
exports.signaturesRelations = (0, drizzle_orm_1.relations)(exports.signatures, ({ one, many }) => ({
    user: one(users, {
        fields: [exports.signatures.userId],
        references: [users.id]
    }),
    documentSignatures: many(exports.documentSignatures)
}));
// Almacenamiento seguro de documentos
exports.storageProviderEnum = (0, pg_core_1.pgEnum)('storage_provider', ['s3', 'local']);
exports.encryptionTypeEnum = (0, pg_core_1.pgEnum)('encryption_type', ['aes-256-gcm', 'aes-256-cbc']);
exports.documentStorageRecords = (0, pg_core_1.pgTable)('document_storage_records', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    documentId: (0, pg_core_1.integer)('document_id').notNull().references(() => documents.id),
    provider: (0, exports.storageProviderEnum)('provider').notNull(),
    encryptionType: (0, exports.encryptionTypeEnum)('encryption_type').notNull(),
    storageLocation: (0, pg_core_1.text)('storage_location').notNull(),
    documentHash: (0, pg_core_1.text)('document_hash').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at'),
    metadata: (0, pg_core_1.json)('metadata')
});
// Schema para inserción de registro de almacenamiento
exports.insertDocumentStorageRecordSchema = (0, drizzle_zod_1.createInsertSchema)(exports.documentStorageRecords);
// Relaciones de registro de almacenamiento
exports.documentStorageRecordsRelations = (0, drizzle_orm_1.relations)(exports.documentStorageRecords, ({ one }) => ({
    document: one(documents, {
        fields: [exports.documentStorageRecords.documentId],
        references: [documents.id]
    })
}));
// Códigos QR para verificación
exports.qrCodeTypeEnum = (0, pg_core_1.pgEnum)('qr_code_type', [
    'document_verification', 'signature_verification', 'access_link', 'mobile_signing'
]);
exports.qrCodeStatusEnum = (0, pg_core_1.pgEnum)('qr_code_status', [
    'active', 'used', 'expired', 'revoked'
]);
exports.documentQrCodes = (0, pg_core_1.pgTable)('document_qr_codes', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    documentId: (0, pg_core_1.integer)('document_id').notNull().references(() => documents.id),
    signatureId: (0, pg_core_1.text)('signature_id').references(() => exports.signatures.id),
    userId: (0, pg_core_1.integer)('user_id').references(() => users.id),
    codeType: (0, exports.qrCodeTypeEnum)('code_type').notNull(),
    verificationCode: (0, pg_core_1.text)('verification_code').notNull().unique(),
    status: (0, exports.qrCodeStatusEnum)('status').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    details: (0, pg_core_1.json)('details')
});
// Schema para inserción de código QR
exports.insertDocumentQrCodeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.documentQrCodes);
// Relaciones de código QR
exports.documentQrCodesRelations = (0, drizzle_orm_1.relations)(exports.documentQrCodes, ({ one }) => ({
    document: one(documents, {
        fields: [exports.documentQrCodes.documentId],
        references: [documents.id]
    }),
    signature: one(exports.signatures, {
        fields: [exports.documentQrCodes.signatureId],
        references: [exports.signatures.id]
    }),
    user: one(users, {
        fields: [exports.documentQrCodes.userId],
        references: [users.id]
    })
}));
// Registro de auditoría
exports.auditCategoryEnum = (0, pg_core_1.pgEnum)('audit_category', [
    'document', 'identity', 'signature', 'user', 'security', 'admin'
]);
exports.auditSeverityEnum = (0, pg_core_1.pgEnum)('audit_severity', [
    'info', 'warning', 'error', 'critical'
]);
exports.auditLogs = (0, pg_core_1.pgTable)('audit_logs', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    actionType: (0, pg_core_1.text)('action_type').notNull(),
    category: (0, exports.auditCategoryEnum)('category').notNull(),
    severity: (0, exports.auditSeverityEnum)('severity').notNull(),
    userId: (0, pg_core_1.integer)('user_id').references(() => users.id),
    documentId: (0, pg_core_1.integer)('document_id').references(() => documents.id),
    ipAddress: (0, pg_core_1.text)('ip_address'),
    userAgent: (0, pg_core_1.text)('user_agent'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull(),
    details: (0, pg_core_1.json)('details')
});
// Schema para inserción de log de auditoría
exports.insertAuditLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.auditLogs);
// Relaciones de log de auditoría
exports.auditLogsRelations = (0, drizzle_orm_1.relations)(exports.auditLogs, ({ one }) => ({
    user: one(users, {
        fields: [exports.auditLogs.userId],
        references: [users.id]
    }),
    document: one(documents, {
        fields: [exports.auditLogs.documentId],
        references: [documents.id]
    })
}));
