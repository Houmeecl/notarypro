/**
 * CONFIGURACIÓN DE BASE DE DATOS REAL
 * Script para configurar la base de datos Neon PostgreSQL con datos reales
 */

const { Client } = require('pg');
const bcrypt = require('bcrypt');

// URL de conexión real a Neon
const DATABASE_URL = "postgres://neondb_owner:npg_M2DXbHesGL7y@ep-dawn-night-ad9ixxns-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";

console.log('🗄️ CONFIGURACIÓN DE BASE DE DATOS REAL - NotaryVecino');
console.log('====================================================');
console.log('');

async function setupRealDatabase() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Conectando a base de datos Neon...');
    await client.connect();
    console.log('✅ Conexión exitosa a base de datos Neon');
    console.log('');

    console.log('🏗️ CREANDO ESTRUCTURA DE TABLAS');
    console.log('================================');
    console.log('');

    // Crear tabla users
    console.log('  Creando tabla users...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        platform TEXT DEFAULT 'notarypro',
        business_name TEXT,
        address TEXT,
        region TEXT,
        comuna TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('  ✅ Tabla users creada');

    // Crear tabla documents
    console.log('  Creando tabla documents...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        document_type TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'uploaded',
        file_path TEXT,
        file_name TEXT,
        file_size INTEGER,
        mime_type TEXT,
        file_hash TEXT,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('  ✅ Tabla documents creada');

    // Crear tabla document_categories
    console.log('  Creando tabla document_categories...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS document_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        parent_id INTEGER REFERENCES document_categories(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('  ✅ Tabla document_categories creada');

    // Crear tabla identity_verifications
    console.log('  Creando tabla identity_verifications...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS identity_verifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        verification_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        verification_data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('  ✅ Tabla identity_verifications creada');

    // Crear tabla analytics_events
    console.log('  Creando tabla analytics_events...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id SERIAL PRIMARY KEY,
        event_type TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id),
        document_id INTEGER REFERENCES documents(id),
        template_id INTEGER,
        course_id INTEGER,
        video_call_id INTEGER,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('  ✅ Tabla analytics_events creada');

    // Crear tabla audit_logs
    console.log('  Creando tabla audit_logs...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action_type TEXT NOT NULL,
        details JSONB,
        timestamp TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('  ✅ Tabla audit_logs creada');

    console.log('');
    console.log('⚡ CREANDO ÍNDICES PARA RENDIMIENTO');
    console.log('==================================');
    console.log('');

    // Crear índices
    const indices = [
      'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);',
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
      'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);',
      'CREATE INDEX IF NOT EXISTS idx_users_platform ON users(platform);',
      'CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);',
      'CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);',
      'CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);',
      'CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);',
      'CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);'
    ];

    for (const indexQuery of indices) {
      await client.query(indexQuery);
      console.log('  ✅ Índice creado');
    }

    console.log('');
    console.log('🌱 INSERTANDO DATOS INICIALES');
    console.log('=============================');
    console.log('');

    // Insertar categorías
    console.log('  Insertando categorías de documentos...');
    await client.query(`
      INSERT INTO document_categories (name, description) VALUES 
      ('Certificado', 'Certificados oficiales y documentos de identidad'),
      ('Contrato', 'Contratos y acuerdos legales'),
      ('Poder', 'Poderes notariales y representación legal'),
      ('Declaración', 'Declaraciones juradas y testimonios'),
      ('Escritura', 'Escrituras públicas y documentos notariales'),
      ('Trámite', 'Trámites municipales y gubernamentales')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log('  ✅ Categorías insertadas');

    // Hashear contraseñas reales
    const adminPassword = await bcrypt.hash('adminq', 10);
    const certifierPassword = await bcrypt.hash('cert123456', 10);
    const userPassword = await bcrypt.hash('user123456', 10);
    const partnerPassword = await bcrypt.hash('partner123456', 10);

    // Insertar usuarios reales
    console.log('  Insertando usuarios de prueba...');
    await client.query(`
      INSERT INTO users (username, password, email, full_name, role, platform, business_name, region, comuna) VALUES 
      ($1, $2, 'admin@notarypro.cl', 'Edward Admin Real', 'admin', 'notarypro', 'NotaryPro Admin', 'Región Metropolitana', 'Santiago'),
      ($3, $4, 'certifier@notarypro.cl', 'Certificador Real', 'certifier', 'notarypro', 'Certificaciones Pro', 'Región Metropolitana', 'Las Condes'),
      ($5, $6, 'user@notarypro.cl', 'Usuario Real', 'user', 'notarypro', NULL, 'Región Metropolitana', 'Providencia'),
      ($7, $8, 'partner@vecinoxpress.cl', 'Partner Vecinos Real', 'partner', 'vecinos', 'Servicios Vecinales Ltda', 'Región Metropolitana', 'Ñuñoa')
      ON CONFLICT (username) DO NOTHING;
    `, ['Edwardadmin', adminPassword, 'realcertifier', certifierPassword, 'realuser', userPassword, 'vecinospartner', partnerPassword]);
    console.log('  ✅ Usuarios insertados');

    // Obtener IDs de usuarios para documentos
    const usersResult = await client.query('SELECT id, username FROM users ORDER BY id LIMIT 4');
    const userIds = usersResult.rows.map(row => row.id);

    if (userIds.length >= 2) {
      // Insertar documentos de muestra
      console.log('  Insertando documentos de muestra...');
      await client.query(`
        INSERT INTO documents (title, document_type, description, status, file_name, file_size, mime_type, user_id, file_path) VALUES 
        ('Contrato de Arrendamiento Real', 'Contrato', 'Contrato de arrendamiento de propiedad residencial', 'uploaded', 'contrato_arrendamiento_real.pdf', 245760, 'application/pdf', $1, '/uploads/documents/contrato_real.pdf'),
        ('Poder Notarial Real', 'Poder', 'Poder notarial para representación legal completa', 'processing', 'poder_notarial_real.pdf', 189440, 'application/pdf', $2, '/uploads/documents/poder_real.pdf'),
        ('Declaración de Ingresos Real', 'Declaración', 'Declaración jurada de ingresos anuales 2024', 'certified', 'declaracion_ingresos_real.pdf', 156890, 'application/pdf', $1, '/uploads/documents/declaracion_real.pdf'),
        ('Certificado de Residencia Real', 'Certificado', 'Certificado de residencia municipal oficial', 'completed', 'certificado_residencia_real.pdf', 123450, 'application/pdf', $2, '/uploads/documents/certificado_real.pdf'),
        ('Escritura de Compraventa Real', 'Escritura', 'Escritura de compraventa de inmueble', 'uploaded', 'escritura_compraventa_real.pdf', 298760, 'application/pdf', $1, '/uploads/documents/escritura_real.pdf')
        ON CONFLICT DO NOTHING;
      `, [userIds[0], userIds[1]]);
      console.log('  ✅ Documentos insertados');

      // Insertar verificaciones de identidad
      console.log('  Insertando verificaciones de identidad...');
      await client.query(`
        INSERT INTO identity_verifications (user_id, verification_type, status, verification_data) VALUES 
        ($1, 'facial_recognition', 'verified', '{"confidence": 0.95, "method": "biometric", "timestamp": "2025-01-15T10:30:00Z"}'),
        ($2, 'document_scan', 'verified', '{"document_type": "cedula", "confidence": 0.98, "ocr_data": "valid"}'),
        ($1, 'nfc_reading', 'verified', '{"chip_data": "valid", "document_type": "cedula", "serial": "123456789"}'),
        ($2, 'liveness_detection', 'verified', '{"confidence": 0.92, "method": "blink_detection"}')
        ON CONFLICT DO NOTHING;
      `, [userIds[0], userIds[1]]);
      console.log('  ✅ Verificaciones insertadas');

      // Insertar eventos de analytics
      console.log('  Insertando eventos de analytics...');
      
      const analyticsEvents = [
        ['document_uploaded', userIds[0], 1, '{"source": "web", "size": 245760, "ip": "192.168.1.100"}'],
        ['document_certified', userIds[1], 1, `{"certifierId": ${userIds[1]}, "certifierName": "Certificador Real", "level": "standard"}`],
        ['identity_verified', userIds[0], null, '{"method": "facial_recognition", "confidence": 0.95, "provider": "getapi"}'],
        ['user_login', userIds[0], null, '{"platform": "notarypro", "ip": "192.168.1.100", "device": "desktop"}'],
        ['ron_session_created', userIds[1], 2, `{"sessionId": "RON-2025-001", "clientId": ${userIds[0]}, "certifierId": ${userIds[1]}}`],
        ['payment_completed', userIds[0], null, '{"amount": 2500, "method": "credit_card", "provider": "mercadopago"}'],
        ['document_processed', userIds[1], 3, '{"processing_time": 180, "automated": true}'],
        ['service_completed', userIds[0], null, '{"service_type": "certification", "duration": 300}']
      ];

      for (const [eventType, userId, documentId, metadata] of analyticsEvents) {
        await client.query(`
          INSERT INTO analytics_events (event_type, user_id, document_id, metadata, created_at) VALUES 
          ($1, $2, $3, $4, NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days')
        `, [eventType, userId, documentId, metadata]);
      }
      console.log('  ✅ Eventos de analytics insertados');
    }

    console.log('');
    console.log('📊 VERIFICANDO DATOS INSERTADOS');
    console.log('===============================');
    console.log('');

    // Verificar datos
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const docCount = await client.query('SELECT COUNT(*) FROM documents');
    const categoryCount = await client.query('SELECT COUNT(*) FROM document_categories');
    const verificationCount = await client.query('SELECT COUNT(*) FROM identity_verifications');
    const analyticsCount = await client.query('SELECT COUNT(*) FROM analytics_events');

    console.log(`  👥 Usuarios: ${userCount.rows[0].count}`);
    console.log(`  📄 Documentos: ${docCount.rows[0].count}`);
    console.log(`  📂 Categorías: ${categoryCount.rows[0].count}`);
    console.log(`  🆔 Verificaciones: ${verificationCount.rows[0].count}`);
    console.log(`  📊 Eventos Analytics: ${analyticsCount.rows[0].count}`);

    console.log('');
    console.log('👥 USUARIOS CREADOS:');
    const users = await client.query('SELECT username, full_name, role, platform FROM users ORDER BY id');
    users.rows.forEach(user => {
      console.log(`  • ${user.username} (${user.full_name}) - ${user.role} - ${user.platform}`);
    });

    console.log('');
    console.log('📄 DOCUMENTOS CREADOS:');
    const docs = await client.query('SELECT title, document_type, status FROM documents ORDER BY id');
    docs.rows.forEach(doc => {
      console.log(`  • ${doc.title} (${doc.document_type}) - ${doc.status}`);
    });

    console.log('');
    console.log('✅ BASE DE DATOS REAL CONFIGURADA EXITOSAMENTE');
    console.log('');
    console.log('🎯 PRÓXIMOS PASOS:');
    console.log('  1. Copiar configuración: cp .env.real .env');
    console.log('  2. Iniciar servidor: npm start');
    console.log('  3. Probar sistema: ./test-real-system.sh');
    console.log('  4. Acceder: http://localhost:5000');
    console.log('');
    console.log('👥 CREDENCIALES DE ACCESO:');
    console.log('  • Admin: Edwardadmin / adminq');
    console.log('  • Certificador: realcertifier / cert123456');
    console.log('  • Usuario: realuser / user123456');
    console.log('  • Partner: vecinospartner / partner123456');
    console.log('');
    console.log('🚀 SISTEMA REAL LISTO CON BASE DE DATOS NEON');

  } catch (error) {
    console.error('❌ Error configurando base de datos:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Ejecutar configuración
setupRealDatabase();