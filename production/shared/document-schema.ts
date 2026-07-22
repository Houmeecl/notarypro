/**
 * Esquema para el Sistema de Gestión Documental
 * 
 * Este archivo define las tablas y relaciones necesarias para soportar
 * el sistema centralizado de gestión documental que sirve a todo el
 * ecosistema VecinoXpress y NotaryPro.
 */

import { pgTable, serial, text, timestamp, integer, boolean, json } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './schema';

/**
 * Categorías de documentos
 */
export const documentCategories = pgTable('document_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'), // Nombre del icono de Lucide
  color: text('color'), // Color en formato hex para UI
  parentId: integer('parent_id').references(() => documentCategories.id), // Para categorías anidadas
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
});

/**
 * Esquema de documentos principal
 */
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  filePath: text('file_path').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  fileType: text('file_type').notNull(),
  categoryId: integer('category_id').references(() => documentCategories.id).notNull(),
  verificationCode: text('verification_code').unique().notNull(),
  status: text('status').notNull().default('active'),
  accessLevel: text('access_level').default('private'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: integer('created_by').references(() => users.id),
  updatedAt: timestamp('updated_at'),
  updatedBy: integer('updated_by').references(() => users.id),
  metadata: json('metadata')
});

/**
 * Versiones de documentos
 */
export const documentVersions = pgTable('document_versions', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').references(() => documents.id).notNull(),
  version: integer('version').notNull(),
  filePath: text('file_path').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  fileType: text('file_type').notNull(),
  changes: text('changes'),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: integer('created_by').references(() => users.id),
  metadata: json('metadata')
});

/**
 * Etiquetas de documentos
 */
export const documentTags = pgTable('document_tags', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').references(() => documents.id).notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

/**
 * Compartir documentos
 */
export const documentShares = pgTable('document_shares', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').references(() => documents.id).notNull(),
  userId: integer('user_id').references(() => users.id),
  email: text('email'),
  accessCode: text('access_code'),
  accessLevel: text('access_level').default('read'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: integer('created_by').references(() => users.id),
  isUsed: boolean('is_used').default(false),
  usedAt: timestamp('used_at')
});

/**
 * Documentos notariales
 */
export const notaryDocuments = pgTable('notary_documents', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').references(() => documents.id), // Referencia a la tabla general
  title: text('title').notNull(),
  description: text('description'),
  filePath: text('file_path').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  fileType: text('file_type').notNull(),
  documentType: text('document_type').notNull(), // declaración jurada, poder simple, etc.
  urgency: text('urgency').default('normal'),
  userId: integer('user_id').references(() => users.id).notNull(),
  status: text('status').notNull().default('pending'),
  verificationCode: text('verification_code').unique().notNull(),
  certifiedBy: integer('certified_by').references(() => users.id),
  certifiedAt: timestamp('certified_at'),
  certifiedFilePath: text('certified_file_path'),
  certifiedFileName: text('certified_file_name'),
  createdAt: timestamp('created_at').defaultNow(),
  metadata: json('metadata')
});

/**
 * Certificaciones de documentos
 */
export const notaryCertifications = pgTable('notary_certifications', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').references(() => notaryDocuments.id).notNull(),
  certifierId: integer('certifier_id').references(() => users.id).notNull(),
  certificationDate: timestamp('certification_date').notNull(),
  certificationMethod: text('certification_method').notNull(), // standard, advanced, video
  certificationNote: text('certification_note'),
  certifiedFilePath: text('certified_file_path').notNull(),
  certifiedFileName: text('certified_file_name').notNull(),
  verificationUrl: text('verification_url'),
  metadataSnapshot: json('metadata_snapshot'),
  createdAt: timestamp('created_at').defaultNow()
});

/**
 * Procesos notariales (trámites)
 */
export const notaryProcesses = pgTable('notary_processes', {
  id: serial('id').primaryKey(),
  code: text('code').unique().notNull(),
  title: text('title').notNull(),
  description: text('description'),
  processType: text('process_type').notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  status: text('status').notNull().default('initiated'),
  currentStep: integer('current_step').default(1),
  totalSteps: integer('total_steps').notNull(),
  assignedTo: integer('assigned_to').references(() => users.id),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
  metadata: json('metadata')
});

/**
 * Plantillas de documentos notariales
 */
export const notaryTemplates = pgTable('notary_templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  documentType: text('document_type').notNull(),
  templatePath: text('template_path').notNull(),
  thumbnailPath: text('thumbnail_path'),
  formSchema: json('form_schema').notNull(), // JSON Schema para el formulario
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: integer('created_by').references(() => users.id),
  updatedAt: timestamp('updated_at'),
  updatedBy: integer('updated_by').references(() => users.id)
});

// Esquemas para inserción con Zod
export const insertDocumentCategorySchema = createInsertSchema(documentCategories);
export const insertDocumentSchema = createInsertSchema(documents, {
  status: z.enum(['active', 'archived', 'pending', 'certified', 'rejected']),
  accessLevel: z.enum(['private', 'public', 'shared'])
});
export const insertDocumentVersionSchema = createInsertSchema(documentVersions);
export const insertDocumentTagSchema = createInsertSchema(documentTags);
export const insertDocumentShareSchema = createInsertSchema(documentShares, {
  accessLevel: z.enum(['read', 'edit', 'admin'])
});

export const insertNotaryDocumentSchema = createInsertSchema(notaryDocuments, {
  documentType: z.enum(['declaracion_jurada', 'poder_simple', 'autorizacion', 'certificado', 'otro']),
  urgency: z.enum(['low', 'normal', 'high', 'urgent']),
  status: z.enum(['pending', 'certified', 'rejected', 'canceled'])
});
export const insertNotaryCertificationSchema = createInsertSchema(notaryCertifications, {
  certificationMethod: z.enum(['standard', 'advanced', 'video', 'biometric'])
});
export const insertNotaryProcessSchema = createInsertSchema(notaryProcesses, {
  status: z.enum(['initiated', 'in_progress', 'pending_client', 'completed', 'canceled'])
});
export const insertNotaryTemplateSchema = createInsertSchema(notaryTemplates);

// Tipos para TypeScript
export type DocumentCategory = typeof documentCategories.$inferSelect;
export type InsertDocumentCategory = z.infer<typeof insertDocumentCategorySchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type DocumentVersion = typeof documentVersions.$inferSelect;
export type InsertDocumentVersion = z.infer<typeof insertDocumentVersionSchema>;

export type DocumentTag = typeof documentTags.$inferSelect;
export type InsertDocumentTag = z.infer<typeof insertDocumentTagSchema>;

export type DocumentShare = typeof documentShares.$inferSelect;
export type InsertDocumentShare = z.infer<typeof insertDocumentShareSchema>;

export type NotaryDocument = typeof notaryDocuments.$inferSelect;
export type InsertNotaryDocument = z.infer<typeof insertNotaryDocumentSchema>;

export type NotaryCertification = typeof notaryCertifications.$inferSelect;
export type InsertNotaryCertification = z.infer<typeof insertNotaryCertificationSchema>;

export type NotaryProcess = typeof notaryProcesses.$inferSelect;
export type InsertNotaryProcess = z.infer<typeof insertNotaryProcessSchema>;

export type NotaryTemplate = typeof notaryTemplates.$inferSelect;
export type InsertNotaryTemplate = z.infer<typeof insertNotaryTemplateSchema>;