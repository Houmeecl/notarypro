"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuperAdmin = createSuperAdmin;
exports.createSebaAdmin = createSebaAdmin;
const db_1 = require("../db");
const schema_1 = require("@shared/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = require("crypto");
const util_1 = require("util");
const scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
async function hashPassword(password) {
    const salt = (0, crypto_1.randomBytes)(16).toString('hex');
    const buf = (await scryptAsync(password, salt, 64));
    return `${buf.toString('hex')}.${salt}`;
}
/**
 * Crea o actualiza el usuario administrador principal
 * Este usuario tiene acceso completo a todas las funcionalidades del sistema
 */
async function createSuperAdmin() {
    try {
        const username = 'Edwardadmin';
        const password = 'adminq';
        const email = 'admin@notarypro.cl';
        const fullName = 'Edward Admin';
        // Verificar si el usuario ya existe
        const existingUser = await db_1.db.select({
            id: schema_1.users.id,
            username: schema_1.users.username,
            password: schema_1.users.password,
            email: schema_1.users.email,
            fullName: schema_1.users.fullName,
            role: schema_1.users.role
        })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.username, username))
            .limit(1);
        if (existingUser.length > 0) {
            console.log(`El administrador ${username} ya existe. Actualizando contraseña...`);
            // Actualizar contraseña del admin existente
            await db_1.db.update(schema_1.users)
                .set({
                password: await hashPassword(password),
                email,
                fullName
            })
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, existingUser[0].id));
            console.log(`Contraseña del administrador ${username} actualizada.`);
            return;
        }
        // Crear el administrador
        const [admin] = await db_1.db.insert(schema_1.users)
            .values({
            username,
            password: await hashPassword(password),
            email,
            fullName,
            role: 'admin'
        })
            .returning({
            id: schema_1.users.id,
            username: schema_1.users.username,
            email: schema_1.users.email,
            fullName: schema_1.users.fullName,
            role: schema_1.users.role
        });
        console.log(`Administrador ${username} creado con ID: ${admin.id}`);
    }
    catch (error) {
        console.error('Error al crear/actualizar el administrador:', error);
    }
}
/**
 * Crea o actualiza el usuario administrador adicional solicitado
 */
async function createSebaAdmin() {
    try {
        const username = 'Sebadmin';
        const password = 'admin123'; // Cambiado para que coincida con lo que se documentó
        const email = 'seba@notarypro.cl';
        const fullName = 'Sebastian Admin';
        // Verificar si el usuario ya existe
        const existingUser = await db_1.db.select({
            id: schema_1.users.id,
            username: schema_1.users.username,
            password: schema_1.users.password,
            email: schema_1.users.email,
            fullName: schema_1.users.fullName,
            role: schema_1.users.role
        })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.username, username))
            .limit(1);
        if (existingUser.length > 0) {
            console.log(`El administrador ${username} ya existe. Actualizando contraseña...`);
            // Actualizar contraseña del admin existente
            await db_1.db.update(schema_1.users)
                .set({
                password: await hashPassword(password),
                email,
                fullName
            })
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, existingUser[0].id));
            console.log(`Contraseña del administrador ${username} actualizada.`);
            return;
        }
        // Crear el administrador
        const [admin] = await db_1.db.insert(schema_1.users)
            .values({
            username,
            password: await hashPassword(password),
            email,
            fullName,
            role: 'admin'
        })
            .returning({
            id: schema_1.users.id,
            username: schema_1.users.username,
            email: schema_1.users.email,
            fullName: schema_1.users.fullName,
            role: schema_1.users.role
        });
        console.log(`Administrador ${username} creado con ID: ${admin.id}`);
    }
    catch (error) {
        console.error('Error al crear/actualizar el administrador:', error);
    }
}
// Con módulos ES no podemos comprobar si es el archivo principal
// con require.main === module, así que removemos esta parte para evitar errores
// La función createSuperAdmin se llamará desde routes.ts
