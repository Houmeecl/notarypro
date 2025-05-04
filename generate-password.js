import crypto from 'crypto';
import { promisify } from 'util';

const { scrypt, randomBytes } = crypto;
const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64));
  return `${buf.toString('hex')}.${salt}`;
}

async function main() {
  const passwordHash = await hashPassword('certif123');
  console.log('Password hash for certif123:', passwordHash);
  
  const passwordHash2 = await hashPassword('certif456');
  console.log('Password hash for certif456:', passwordHash2);
}

main().catch(console.error);