import { sql } from 'drizzle-orm';
import { db } from '../server/db';

async function main() {
  console.log('Ejecutando migración para agregar columna platform a la tabla users...');
  
  try {
    // Verificar si la columna ya existe
    const columnExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'platform'
      );
    `);
    
    if (!columnExists.rows[0].exists) {
      // Agregar la columna platform a la tabla users
      await db.execute(sql`
        ALTER TABLE users ADD COLUMN platform text DEFAULT 'notarypro';
      `);
      console.log('Columna platform agregada exitosamente a la tabla users');
    } else {
      console.log('La columna platform ya existe en la tabla users');
    }
    
    // Actualizar los usuarios existentes (opcional)
    await db.execute(sql`
      UPDATE users 
      SET platform = 'notarypro' 
      WHERE platform IS NULL;
    `);
    console.log('Usuarios existentes actualizados con platform = notarypro');
    
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