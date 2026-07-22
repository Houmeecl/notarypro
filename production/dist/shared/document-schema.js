"use strict";
/**
 * Esquema para el Sistema de Gestión Documental
 *
 * Este archivo define las tablas y relaciones necesarias para soportar
 * el sistema centralizado de gestión documental que sirve a todo el
 * ecosistema VecinoXpress y NotaryPro.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertNotaryTemplateSchema = exports.insertNotaryProcessSchema = exports.insertNotaryCertificationSchema = exports.insertNotaryDocumentSchema = exports.insertDocumentShareSchema = exports.insertDocumentTagSchema = exports.insertDocumentVersionSchema = exports.insertDocumentSchema = exports.insertDocumentCategorySchema = exports.notaryTemplates = exports.notaryProcesses = exports.notaryCertifications = exports.notaryDocuments = exports.documentShares = exports.documentTags = exports.documentVersions = exports.documents = exports.documentCategories = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const schema_1 = require("./schema");
/**
 * Categorías de documentos
 */
exports.documentCategories = (0, pg_core_1.pgTable)('document_categories', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    icon: (0, pg_core_1.text)('icon'), // Nombre del icono de Lucide
    color: (0, pg_core_1.text)('color'), // Color en formato hex para UI
    parentId: (0, pg_core_1.integer)('parent_id').references(() => exports.documentCategories.id), // Para categorías anidadas
    metadata: (0, pg_core_1.json)('metadata'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at')
});
/**
 * Esquema de documentos principal
 */
exports.documents = (0, pg_core_1.pgTable)('documents', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    title: (0, pg_core_1.text)('title').notNull(),
    description: (0, pg_core_1.text)('description'),
    filePath: (0, pg_core_1.text)('file_path').notNull(),
    fileName: (0, pg_core_1.text)('file_name').notNull(),
    fileSize: (0, pg_core_1.integer)('file_size').notNull(),
    fileType: (0, pg_core_1.text)('file_type').notNull(),
    categoryId: (0, pg_core_1.integer)('category_id').references(() => exports.documentCategories.id).notNull(),
    verificationCode: (0, pg_core_1.text)('verification_code').unique().notNull(),
    status: (0, pg_core_1.text)('status').notNull().default('active'),
    accessLevel: (0, pg_core_1.text)('access_level').default('private'),
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    createdBy: (0, pg_core_1.integer)('created_by').references(() => schema_1.users.id),
    updatedAt: (0, pg_core_1.timestamp)('updated_at'),
    updatedBy: (0, pg_core_1.integer)('updated_by').references(() => schema_1.users.id),
    metadata: (0, pg_core_1.json)('metadata')
});
/**
 * Versiones de documentos
 */
exports.documentVersions = (0, pg_core_1.pgTable)('document_versions', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    documentId: (0, pg_core_1.integer)('document_id').references(() => exports.documents.id).notNull(),
    version: (0, pg_core_1.integer)('version').notNull(),
    filePath: (0, pg_core_1.text)('file_path').notNull(),
    fileName: (0, pg_core_1.text)('file_name').notNull(),
    fileSize: (0, pg_core_1.integer)('file_size').notNull(),
    fileType: (0, pg_core_1.text)('file_type').notNull(),
    changes: (0, pg_core_1.text)('changes'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    createdBy: (0, pg_core_1.integer)('created_by').references(() => schema_1.users.id),
    metadata: (0, pg_core_1.json)('metadata')
});
/**
 * Etiquetas de documentos
 */
exports.documentTags = (0, pg_core_1.pgTable)('document_tags', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    documentId: (0, pg_core_1.integer)('document_id').references(() => exports.documents.id).notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow()
});
/**
 * Compartir documentos
 */
exports.documentShares = (0, pg_core_1.pgTable)('document_shares', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    documentId: (0, pg_core_1.integer)('document_id').references(() => exports.documents.id).notNull(),
    userId: (0, pg_core_1.integer)('user_id').references(() => schema_1.users.id),
    email: (0, pg_core_1.text)('email'),
    accessCode: (0, pg_core_1.text)('access_code'),
    accessLevel: (0, pg_core_1.text)('access_level').default('read'),
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    createdBy: (0, pg_core_1.integer)('created_by').references(() => schema_1.users.id),
    isUsed: (0, pg_core_1.boolean)('is_used').default(false),
    usedAt: (0, pg_core_1.timestamp)('used_at')
});
/**
 * Documentos notariales
 */
exports.notaryDocuments = (0, pg_core_1.pgTable)('notary_documents', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    documentId: (0, pg_core_1.integer)('document_id').references(() => exports.documents.id), // Referencia a la tabla general
    title: (0, pg_core_1.text)('title').notNull(),
    description: (0, pg_core_1.text)('description'),
    filePath: (0, pg_core_1.text)('file_path').notNull(),
    fileName: (0, pg_core_1.text)('file_name').notNull(),
    fileSize: (0, pg_core_1.integer)('file_size').notNull(),
    fileType: (0, pg_core_1.text)('file_type').notNull(),
    documentType: (0, pg_core_1.text)('document_type').notNull(), // declaración jurada, poder simple, etc.
    urgency: (0, pg_core_1.text)('urgency').default('normal'),
    userId: (0, pg_core_1.integer)('user_id').references(() => schema_1.users.id).notNull(),
    status: (0, pg_core_1.text)('status').notNull().default('pending'),
    verificationCode: (0, pg_core_1.text)('verification_code').unique().notNull(),
    certifiedBy: (0, pg_core_1.integer)('certified_by').references(() => schema_1.users.id),
    certifiedAt: (0, pg_core_1.timestamp)('certified_at'),
    certifiedFilePath: (0, pg_core_1.text)('certified_file_path'),
    certifiedFileName: (0, pg_core_1.text)('certified_file_name'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    metadata: (0, pg_core_1.json)('metadata')
});
/**
 * Certificaciones de documentos
 */
exports.notaryCertifications = (0, pg_core_1.pgTable)('notary_certifications', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    documentId: (0, pg_core_1.integer)('document_id').references(() => exports.notaryDocuments.id).notNull(),
    certifierId: (0, pg_core_1.integer)('certifier_id').references(() => schema_1.users.id).notNull(),
    certificationDate: (0, pg_core_1.timestamp)('certification_date').notNull(),
    certificationMethod: (0, pg_core_1.text)('certification_method').notNull(), // standard, advanced, video
    certificationNote: (0, pg_core_1.text)('certification_note'),
    certifiedFilePath: (0, pg_core_1.text)('certified_file_path').notNull(),
    certifiedFileName: (0, pg_core_1.text)('certified_file_name').notNull(),
    verificationUrl: (0, pg_core_1.text)('verification_url'),
    metadataSnapshot: (0, pg_core_1.json)('metadata_snapshot'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow()
});
/**
 * Procesos notariales (trámites)
 */
exports.notaryProcesses = (0, pg_core_1.pgTable)('notary_processes', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    code: (0, pg_core_1.text)('code').unique().notNull(),
    title: (0, pg_core_1.text)('title').notNull(),
    description: (0, pg_core_1.text)('description'),
    processType: (0, pg_core_1.text)('process_type').notNull(),
    userId: (0, pg_core_1.integer)('user_id').references(() => schema_1.users.id).notNull(),
    status: (0, pg_core_1.text)('status').notNull().default('initiated'),
    currentStep: (0, pg_core_1.integer)('current_step').default(1),
    totalSteps: (0, pg_core_1.integer)('total_steps').notNull(),
    assignedTo: (0, pg_core_1.integer)('assigned_to').references(() => schema_1.users.id),
    completedAt: (0, pg_core_1.timestamp)('completed_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at'),
    metadata: (0, pg_core_1.json)('metadata')
});
/**
 * Plantillas de documentos notariales
 */
exports.notaryTemplates = (0, pg_core_1.pgTable)('notary_templates', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    documentType: (0, pg_core_1.text)('document_type').notNull(),
    templatePath: (0, pg_core_1.text)('template_path').notNull(),
    thumbnailPath: (0, pg_core_1.text)('thumbnail_path'),
    formSchema: (0, pg_core_1.json)('form_schema').notNull(), // JSON Schema para el formulario
    active: (0, pg_core_1.boolean)('active').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    createdBy: (0, pg_core_1.integer)('created_by').references(() => schema_1.users.id),
    updatedAt: (0, pg_core_1.timestamp)('updated_at'),
    updatedBy: (0, pg_core_1.integer)('updated_by').references(() => schema_1.users.id)
});
// Esquemas para inserción con Zod
exports.insertDocumentCategorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.documentCategories);
exports.insertDocumentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.documents, {
    status: zod_1.z.enum(['active', 'archived', 'pending', 'certified', 'rejected']),
    accessLevel: zod_1.z.enum(['private', 'public', 'shared'])
});
exports.insertDocumentVersionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.documentVersions);
exports.insertDocumentTagSchema = (0, drizzle_zod_1.createInsertSchema)(exports.documentTags);
exports.insertDocumentShareSchema = (0, drizzle_zod_1.createInsertSchema)(exports.documentShares, {
    accessLevel: zod_1.z.enum(['read', 'edit', 'admin'])
});
exports.insertNotaryDocumentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.notaryDocuments, {
    documentType: zod_1.z.enum(['declaracion_jurada', 'poder_simple', 'autorizacion', 'certificado', 'otro']),
    urgency: zod_1.z.enum(['low', 'normal', 'high', 'urgent']),
    status: zod_1.z.enum(['pending', 'certified', 'rejected', 'canceled'])
});
exports.insertNotaryCertificationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.notaryCertifications, {
    certificationMethod: zod_1.z.enum(['standard', 'advanced', 'video', 'biometric'])
});
exports.insertNotaryProcessSchema = (0, drizzle_zod_1.createInsertSchema)(exports.notaryProcesses, {
    status: zod_1.z.enum(['initiated', 'in_progress', 'pending_client', 'completed', 'canceled'])
});
exports.insertNotaryTemplateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.notaryTemplates);
