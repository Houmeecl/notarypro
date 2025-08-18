import { pgTable, text, timestamp, integer, boolean, serial, pgEnum, json, uniqueIndex } from 'drizzle-orm/pg-core';
import { InferSelectModel, relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

/*********************
 * TABLAS ADICIONALES PARA SEGURIDAD Y VERIFICACIÓN
 *********************/

// Verificación de identidad
export const identityVerificationProviderEnum = pgEnum('identity_verification_provider', [
  'onfido', 'jumio', 'getapi', 'internal'
]);

export const identityVerificationStatusEnum = pgEnum('identity_verification_status', [
  'pending', 'in_progress', 'approved', 'rejected', 'error'
]);

export const identityVerificationTypeEnum = pgEnum('identity_verification_type', [
  'document', 'biometric', 'nfc', 'address', 'combined'
]);

export const identityVerifications = pgTable('identity_verifications', {
  id: text('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  provider: identityVerificationProviderEnum('provider').notNull(),
  providerReferenceId: text('provider_reference_id'),
  status: identityVerificationStatusEnum('status').notNull(),
  type: identityVerificationTypeEnum('type').notNull(),
  verificationCode: text('verification_code'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at'),
  details: json('details')
});

// Tipo para selección de verificación de identidad
export type IdentityVerification = InferSelectModel<typeof identityVerifications>;
// Schema para inserción de verificación de identidad
export const insertIdentityVerificationSchema = createInsertSchema(identityVerifications);
// Tipo para inserción de verificación de identidad
export type InsertIdentityVerification = z.infer<typeof insertIdentityVerificationSchema>;

// Relaciones de verificación de identidad
export const identityVerificationsRelations = relations(identityVerifications, ({ one }) => ({
  user: one(users, {
    fields: [identityVerifications.userId],
    references: [users.id]
  })
}));

// Firmas electrónicas
export const signatureProviderEnum = pgEnum('signature_provider', [
  'docusign', 'hellosign', 'etoken', 'simple'
]);

export const signatureStatusEnum = pgEnum('signature_status', [
  'pending', 'in_progress', 'completed', 'rejected', 'expired', 'error'
]);

export const signatureTypeEnum = pgEnum('signature_type', [
  'simple', 'advanced', 'qualified'
]);

export const signatures = pgTable('signatures', {
  id: text('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  provider: signatureProviderEnum('provider').notNull(),
  providerReferenceId: text('provider_reference_id'),
  status: signatureStatusEnum('status').notNull(),
  type: signatureTypeEnum('type').notNull(),
  verificationCode: text('verification_code'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at'),
  details: json('details')
});

// Tipo para selección de firma
export type Signature = InferSelectModel<typeof signatures>;
// Schema para inserción de firma
export const insertSignatureSchema = createInsertSchema(signatures);
// Tipo para inserción de firma
export type InsertSignature = z.infer<typeof insertSignatureSchema>;

// Relación entre documentos y firmas
export const documentSignatures = pgTable('document_signatures', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull().references(() => documents.id),
  signatureId: text('signature_id').notNull().references(() => signatures.id),
  userId: integer('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull(),
  details: json('details')
}, (table) => {
  return {
    documentSignatureUnique: uniqueIndex('document_signature_unique').on(
      table.documentId, table.signatureId
    )
  };
});

// Tipo para selección de relación documento-firma
export type DocumentSignature = InferSelectModel<typeof documentSignatures>;
// Schema para inserción de relación documento-firma
export const insertDocumentSignatureSchema = createInsertSchema(documentSignatures);
// Tipo para inserción de relación documento-firma
export type InsertDocumentSignature = z.infer<typeof insertDocumentSignatureSchema>;

// Relaciones de documento-firma
export const documentSignaturesRelations = relations(documentSignatures, ({ one }) => ({
  document: one(documents, {
    fields: [documentSignatures.documentId],
    references: [documents.id]
  }),
  signature: one(signatures, {
    fields: [documentSignatures.signatureId],
    references: [signatures.id]
  }),
  user: one(users, {
    fields: [documentSignatures.userId],
    references: [users.id]
  })
}));

// Relaciones de firmas
export const signaturesRelations = relations(signatures, ({ one, many }) => ({
  user: one(users, {
    fields: [signatures.userId],
    references: [users.id]
  }),
  documentSignatures: many(documentSignatures)
}));

// Almacenamiento seguro de documentos
export const storageProviderEnum = pgEnum('storage_provider', ['s3', 'local']);
export const encryptionTypeEnum = pgEnum('encryption_type', ['aes-256-gcm', 'aes-256-cbc']);

export const documentStorageRecords = pgTable('document_storage_records', {
  id: text('id').primaryKey(),
  documentId: integer('document_id').notNull().references(() => documents.id),
  provider: storageProviderEnum('provider').notNull(),
  encryptionType: encryptionTypeEnum('encryption_type').notNull(),
  storageLocation: text('storage_location').notNull(),
  documentHash: text('document_hash').notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at'),
  metadata: json('metadata')
});

// Tipo para selección de registro de almacenamiento
export type DocumentStorageRecord = InferSelectModel<typeof documentStorageRecords>;
// Schema para inserción de registro de almacenamiento
export const insertDocumentStorageRecordSchema = createInsertSchema(documentStorageRecords);
// Tipo para inserción de registro de almacenamiento
export type InsertDocumentStorageRecord = z.infer<typeof insertDocumentStorageRecordSchema>;

// Relaciones de registro de almacenamiento
export const documentStorageRecordsRelations = relations(documentStorageRecords, ({ one }) => ({
  document: one(documents, {
    fields: [documentStorageRecords.documentId],
    references: [documents.id]
  })
}));

// Códigos QR para verificación
export const qrCodeTypeEnum = pgEnum('qr_code_type', [
  'document_verification', 'signature_verification', 'access_link', 'mobile_signing'
]);

export const qrCodeStatusEnum = pgEnum('qr_code_status', [
  'active', 'used', 'expired', 'revoked'
]);

export const documentQrCodes = pgTable('document_qr_codes', {
  id: text('id').primaryKey(),
  documentId: integer('document_id').notNull().references(() => documents.id),
  signatureId: text('signature_id').references(() => signatures.id),
  userId: integer('user_id').references(() => users.id),
  codeType: qrCodeTypeEnum('code_type').notNull(),
  verificationCode: text('verification_code').notNull().unique(),
  status: qrCodeStatusEnum('status').notNull(),
  createdAt: timestamp('created_at').notNull(),
  expiresAt: timestamp('expires_at'),
  details: json('details')
});

// Tipo para selección de código QR
export type DocumentQrCode = InferSelectModel<typeof documentQrCodes>;
// Schema para inserción de código QR
export const insertDocumentQrCodeSchema = createInsertSchema(documentQrCodes);
// Tipo para inserción de código QR
export type InsertDocumentQrCode = z.infer<typeof insertDocumentQrCodeSchema>;

// Relaciones de código QR
export const documentQrCodesRelations = relations(documentQrCodes, ({ one }) => ({
  document: one(documents, {
    fields: [documentQrCodes.documentId],
    references: [documents.id]
  }),
  signature: one(signatures, {
    fields: [documentQrCodes.signatureId],
    references: [signatures.id]
  }),
  user: one(users, {
    fields: [documentQrCodes.userId],
    references: [users.id]
  })
}));

// Registro de auditoría
export const auditCategoryEnum = pgEnum('audit_category', [
  'document', 'identity', 'signature', 'user', 'security', 'admin'
]);

export const auditSeverityEnum = pgEnum('audit_severity', [
  'info', 'warning', 'error', 'critical'
]);

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  actionType: text('action_type').notNull(),
  category: auditCategoryEnum('category').notNull(),
  severity: auditSeverityEnum('severity').notNull(),
  userId: integer('user_id').references(() => users.id),
  documentId: integer('document_id').references(() => documents.id),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull(),
  details: json('details')
});

// Tipo para selección de log de auditoría
export type AuditLog = InferSelectModel<typeof auditLogs>;
// Schema para inserción de log de auditoría
export const insertAuditLogSchema = createInsertSchema(auditLogs);
// Tipo para inserción de log de auditoría
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Relaciones de log de auditoría
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id]
  }),
  document: one(documents, {
    fields: [auditLogs.documentId],
    references: [documents.id]
  })
}));