import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

/**
 * Crea o actualiza el usuario administrador principal
 * Este usuario tiene acceso completo a todas las funcionalidades del sistema
 */
export async function createSuperAdmin() {
  try {
    const username = 'Edwardadmin';
    const password = 'adminq';
    const email = 'admin@notarypro.cl';
    const fullName = 'Edward Admin';
    
    // Verificar si el usuario ya existe
    const existingUser = await db.select({
        id: users.id,
        username: users.username,
        password: users.password,
        email: users.email,
        fullName: users.fullName,
        role: users.role
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    
    if (existingUser.length > 0) {
      console.log(`El administrador ${username} ya existe. Actualizando contraseña...`);
      
      // Actualizar contraseña del admin existente
      await db.update(users)
        .set({ 
          password: await hashPassword(password),
          email,
          fullName
        })
        .where(eq(users.id, existingUser[0].id));
        
      console.log(`Contraseña del administrador ${username} actualizada.`);
      return;
    }
    
    // Crear el administrador
    const [admin] = await db.insert(users)
      .values({
        username,
        password: await hashPassword(password),
        email,
        fullName,
        role: 'admin'
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
        role: users.role
      });
    
    console.log(`Administrador ${username} creado con ID: ${admin.id}`);
  } catch (error) {
    console.error('Error al crear/actualizar el administrador:', error);
  }
}

/**
 * Crea o actualiza el usuario administrador adicional solicitado
 */
export async function createSebaAdmin() {
  try {
    const username = 'Sebadmin';
    const password = 'admin123'; // Cambiado para que coincida con lo que se documentó
    const email = 'seba@notarypro.cl';
    const fullName = 'Sebastian Admin';
    
    // Verificar si el usuario ya existe
    const existingUser = await db.select({
        id: users.id,
        username: users.username,
        password: users.password,
        email: users.email,
        fullName: users.fullName,
        role: users.role
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    
    if (existingUser.length > 0) {
      console.log(`El administrador ${username} ya existe. Actualizando contraseña...`);
      
      // Actualizar contraseña del admin existente
      await db.update(users)
        .set({ 
          password: await hashPassword(password),
          email,
          fullName
        })
        .where(eq(users.id, existingUser[0].id));
        
      console.log(`Contraseña del administrador ${username} actualizada.`);
      return;
    }
    
    // Crear el administrador
    const [admin] = await db.insert(users)
      .values({
        username,
        password: await hashPassword(password),
        email,
        fullName,
        role: 'admin'
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
        role: users.role
      });
    
    console.log(`Administrador ${username} creado con ID: ${admin.id}`);
  } catch (error) {
    console.error('Error al crear/actualizar el administrador:', error);
  }
}

// Con módulos ES no podemos comprobar si es el archivo principal
// con require.main === module, así que removemos esta parte para evitar errores
// La función createSuperAdmin se llamará desde routes.ts