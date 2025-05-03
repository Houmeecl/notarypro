import { sql } from 'drizzle-orm';
import { db } from '../server/db';

async function main() {
  console.log('Ejecutando migración para actualizar la tabla users...');
  
  try {
    // Verificar y agregar columna business_name si no existe
    const businessNameExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'business_name'
      );
    `);
    
    if (!businessNameExists.rows[0].exists) {
      await db.execute(sql`
        ALTER TABLE users ADD COLUMN business_name text;
      `);
      console.log('Columna business_name agregada exitosamente a la tabla users');
    } else {
      console.log('La columna business_name ya existe en la tabla users');
    }
    
    // Verificar y agregar columna address si no existe
    const addressExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'address'
      );
    `);
    
    if (!addressExists.rows[0].exists) {
      await db.execute(sql`
        ALTER TABLE users ADD COLUMN address text;
      `);
      console.log('Columna address agregada exitosamente a la tabla users');
    } else {
      console.log('La columna address ya existe en la tabla users');
    }
    
    // Verificar y agregar columna region si no existe
    const regionExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'region'
      );
    `);
    
    if (!regionExists.rows[0].exists) {
      await db.execute(sql`
        ALTER TABLE users ADD COLUMN region text;
      `);
      console.log('Columna region agregada exitosamente a la tabla users');
    } else {
      console.log('La columna region ya existe en la tabla users');
    }
    
    // Verificar y agregar columna comuna si no existe
    const comunaExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'comuna'
      );
    `);
    
    if (!comunaExists.rows[0].exists) {
      await db.execute(sql`
        ALTER TABLE users ADD COLUMN comuna text;
      `);
      console.log('Columna comuna agregada exitosamente a la tabla users');
    } else {
      console.log('La columna comuna ya existe en la tabla users');
    }
    
    console.log('Migración completada exitosamente');
  } catch (error) {
    console.error('Error durante la migración:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error en la migración:', error);
    process.exit(1);
  });