import { db } from '../server/db';
import { posDevices, posSessions, posSales } from '../shared/pos-schema';
import { sql } from 'drizzle-orm';

/**
 * Migración para crear las tablas del sistema de gestión POS
 * 
 * Esta migración crea las siguientes tablas:
 * - pos_devices: Dispositivos POS
 * - pos_sessions: Sesiones de dispositivos POS
 * - pos_sales: Ventas realizadas en cada sesión
 */
async function createPOSTables() {
  console.log('Iniciando migración de tablas POS...');

  try {
    // Verificar si las tablas ya existen
    const tablesResult = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('pos_devices', 'pos_sessions', 'pos_sales')
    `);
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    
    // Crear tabla de dispositivos POS si no existe
    if (!existingTables.includes('pos_devices')) {
      console.log('Creando tabla pos_devices...');
      await db.execute(sql`
        CREATE TABLE pos_devices (
          id SERIAL PRIMARY KEY,
          device_name VARCHAR(100) NOT NULL,
          device_code VARCHAR(50) NOT NULL UNIQUE,
          device_type VARCHAR(20) NOT NULL DEFAULT 'pos',
          device_model VARCHAR(100),
          location VARCHAR(200),
          store_code VARCHAR(50),
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          is_demo BOOLEAN NOT NULL DEFAULT FALSE,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
      `);
      console.log('Tabla pos_devices creada correctamente');
    } else {
      console.log('La tabla pos_devices ya existe');
    }
    
    // Crear tabla de sesiones POS si no existe
    if (!existingTables.includes('pos_sessions')) {
      console.log('Creando tabla pos_sessions...');
      await db.execute(sql`
        CREATE TABLE pos_sessions (
          id SERIAL PRIMARY KEY,
          device_id INTEGER NOT NULL REFERENCES pos_devices(id),
          session_code VARCHAR(20) NOT NULL UNIQUE,
          operator_id INTEGER,
          operator_name VARCHAR(100),
          initial_amount DECIMAL(10,2) DEFAULT 0,
          final_amount DECIMAL(10,2),
          is_open BOOLEAN NOT NULL DEFAULT TRUE,
          status VARCHAR(20) NOT NULL DEFAULT 'active',
          notes TEXT,
          opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          closed_at TIMESTAMP
        )
      `);
      console.log('Tabla pos_sessions creada correctamente');
    } else {
      console.log('La tabla pos_sessions ya existe');
    }
    
    // Crear tabla de ventas POS si no existe
    if (!existingTables.includes('pos_sales')) {
      console.log('Creando tabla pos_sales...');
      await db.execute(sql`
        CREATE TABLE pos_sales (
          id SERIAL PRIMARY KEY,
          session_id INTEGER NOT NULL REFERENCES pos_sessions(id),
          device_id INTEGER NOT NULL REFERENCES pos_devices(id),
          receipt_number VARCHAR(50) NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          payment_method VARCHAR(50) NOT NULL,
          document_type VARCHAR(50),
          document_id INTEGER,
          customer_name VARCHAR(100),
          customer_id VARCHAR(50),
          status VARCHAR(20) NOT NULL DEFAULT 'completed',
          description TEXT,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
      `);
      console.log('Tabla pos_sales creada correctamente');
    } else {
      console.log('La tabla pos_sales ya existe');
    }
    
    // Crear algunos dispositivos POS de ejemplo si no existen
    const deviceCount = await db.execute(sql`SELECT COUNT(*) FROM pos_devices`);
    
    if (parseInt(deviceCount.rows[0].count) === 0) {
      console.log('Creando dispositivos POS de ejemplo...');
      
      await db.insert(posDevices).values([
        {
          deviceName: 'Terminal POS Principal',
          deviceCode: 'POS-TUU-001',
          deviceType: 'pos',
          deviceModel: 'TUU Terminal',
          location: 'Tienda Central',
          isActive: true,
          isDemo: false,
          notes: 'Terminal principal para pagos en tienda',
        },
        {
          deviceName: 'POS Sunmi',
          deviceCode: 'POS-SM-001',
          deviceType: 'pos',
          deviceModel: 'Sunmi V2 Pro',
          location: 'Mostrador Principal',
          isActive: true,
          isDemo: false,
          notes: 'Terminal con Android 9 y soporte NFC',
        },
        {
          deviceName: 'POS P2Mini',
          deviceCode: 'POS-P2M-001',
          deviceType: 'pos',
          deviceModel: 'P2mini-8766wb',
          location: 'Caja Registradora',
          isActive: true,
          isDemo: false,
          notes: 'Terminal con Android 9',
        },
        {
          deviceName: 'Tablet Demo',
          deviceCode: 'POS-DEMO-001',
          deviceType: 'tablet',
          deviceModel: 'Android Tablet',
          location: 'Demostración',
          isActive: true,
          isDemo: true,
          notes: 'Dispositivo para demostraciones',
        }
      ]);
      
      console.log('Dispositivos POS de ejemplo creados correctamente');
    } else {
      console.log('Ya existen dispositivos POS en la base de datos');
    }
    
    console.log('Migración de tablas POS completada correctamente');
  } catch (error) {
    console.error('Error en la migración de tablas POS:', error);
    throw error;
  }
}

// Ejecutar la migración
createPOSTables().then(() => {
  console.log('Migración completada');
  process.exit(0);
}).catch((error) => {
  console.error('Error en la migración:', error);
  process.exit(1);
});