/**
 * Migración para crear las tablas del sistema de seguridad
 * 
 * Esta migración crea las siguientes tablas:
 * - identity_verifications: Verificaciones de identidad
 * - signatures: Firmas electrónicas
 * - document_signatures: Relación entre documentos y firmas
 * - document_storage_records: Registros de almacenamiento seguro
 * - document_qr_codes: Códigos QR para verificación
 * - audit_logs: Registros de auditoría
 */

import { sql } from 'drizzle-orm';
import { db } from '../server/db';

export async function createSecurityTables() {
  try {
    // Crear enums para verificación de identidad
    await db.execute(sql`
      CREATE TYPE identity_verification_provider AS ENUM (
        'onfido', 'jumio', 'getapi', 'internal'
      );
      
      CREATE TYPE identity_verification_status AS ENUM (
        'pending', 'in_progress', 'approved', 'rejected', 'error'
      );
      
      CREATE TYPE identity_verification_type AS ENUM (
        'document', 'biometric', 'nfc', 'address', 'combined'
      );
    `);

    // Crear tabla de verificaciones de identidad
    await db.execute(sql`
      CREATE TABLE identity_verifications (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        provider identity_verification_provider NOT NULL,
        provider_reference_id TEXT,
        status identity_verification_status NOT NULL,
        type identity_verification_type NOT NULL,
        verification_code TEXT,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP,
        details JSONB
      );
      
      CREATE INDEX identity_verifications_user_id_idx ON identity_verifications(user_id);
    `);

    // Crear enums para firmas electrónicas
    await db.execute(sql`
      CREATE TYPE signature_provider AS ENUM (
        'docusign', 'hellosign', 'etoken', 'simple'
      );
      
      CREATE TYPE signature_status AS ENUM (
        'pending', 'in_progress', 'completed', 'rejected', 'expired', 'error'
      );
      
      CREATE TYPE signature_type AS ENUM (
        'simple', 'advanced', 'qualified'
      );
    `);

    // Crear tabla de firmas
    await db.execute(sql`
      CREATE TABLE signatures (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        provider signature_provider NOT NULL,
        provider_reference_id TEXT,
        status signature_status NOT NULL,
        type signature_type NOT NULL,
        verification_code TEXT,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP,
        details JSONB
      );
      
      CREATE INDEX signatures_user_id_idx ON signatures(user_id);
      CREATE INDEX signatures_verification_code_idx ON signatures(verification_code);
    `);

    // Crear tabla de relación documento-firma
    await db.execute(sql`
      CREATE TABLE document_signatures (
        id SERIAL PRIMARY KEY,
        document_id INTEGER NOT NULL REFERENCES documents(id),
        signature_id TEXT NOT NULL REFERENCES signatures(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP NOT NULL,
        details JSONB,
        UNIQUE(document_id, signature_id)
      );
      
      CREATE INDEX document_signatures_document_id_idx ON document_signatures(document_id);
      CREATE INDEX document_signatures_signature_id_idx ON document_signatures(signature_id);
      CREATE INDEX document_signatures_user_id_idx ON document_signatures(user_id);
    `);

    // Crear enums para almacenamiento seguro
    await db.execute(sql`
      CREATE TYPE storage_provider AS ENUM (
        's3', 'local'
      );
      
      CREATE TYPE encryption_type AS ENUM (
        'aes-256-gcm', 'aes-256-cbc'
      );
    `);

    // Crear tabla de registros de almacenamiento
    await db.execute(sql`
      CREATE TABLE document_storage_records (
        id TEXT PRIMARY KEY,
        document_id INTEGER NOT NULL REFERENCES documents(id),
        provider storage_provider NOT NULL,
        encryption_type encryption_type NOT NULL,
        storage_location TEXT NOT NULL,
        document_hash TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP,
        metadata JSONB
      );
      
      CREATE INDEX document_storage_records_document_id_idx ON document_storage_records(document_id);
    `);

    // Crear enums para códigos QR
    await db.execute(sql`
      CREATE TYPE qr_code_type AS ENUM (
        'document_verification', 'signature_verification', 'access_link', 'mobile_signing'
      );
      
      CREATE TYPE qr_code_status AS ENUM (
        'active', 'used', 'expired', 'revoked'
      );
    `);

    // Crear tabla de códigos QR
    await db.execute(sql`
      CREATE TABLE document_qr_codes (
        id TEXT PRIMARY KEY,
        document_id INTEGER NOT NULL REFERENCES documents(id),
        signature_id TEXT REFERENCES signatures(id),
        user_id INTEGER REFERENCES users(id),
        code_type qr_code_type NOT NULL,
        verification_code TEXT NOT NULL UNIQUE,
        status qr_code_status NOT NULL,
        created_at TIMESTAMP NOT NULL,
        expires_at TIMESTAMP,
        details JSONB
      );
      
      CREATE INDEX document_qr_codes_document_id_idx ON document_qr_codes(document_id);
      CREATE INDEX document_qr_codes_verification_code_idx ON document_qr_codes(verification_code);
    `);

    // Crear enums para logs de auditoría
    await db.execute(sql`
      CREATE TYPE audit_category AS ENUM (
        'document', 'identity', 'signature', 'user', 'security', 'admin'
      );
      
      CREATE TYPE audit_severity AS ENUM (
        'info', 'warning', 'error', 'critical'
      );
    `);

    // Crear tabla de logs de auditoría
    await db.execute(sql`
      CREATE TABLE audit_logs (
        id TEXT PRIMARY KEY,
        action_type TEXT NOT NULL,
        category audit_category NOT NULL,
        severity audit_severity NOT NULL,
        user_id INTEGER REFERENCES users(id),
        document_id INTEGER REFERENCES documents(id),
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP NOT NULL,
        details JSONB
      );
      
      CREATE INDEX audit_logs_user_id_idx ON audit_logs(user_id);
      CREATE INDEX audit_logs_document_id_idx ON audit_logs(document_id);
      CREATE INDEX audit_logs_created_at_idx ON audit_logs(created_at);
    `);

    console.log('✅ Tablas de seguridad creadas correctamente');
    
  } catch (error) {
    console.error('Error al crear tablas de seguridad:', error);
    throw error;
  }
}

// Ejecutar solo si este archivo se ejecuta directamente
if (require.main === module) {
  createSecurityTables()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error en la migración:', error);
      process.exit(1);
    });
}