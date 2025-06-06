// Ejecuta con: npx ts-node repair-project.ts

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = process.cwd();

const essentialFiles = {
  'package.json': `...`,
  'tsconfig.json': `...`,
  'vite.config.ts': `...`,
  'index.html': `...`
};

// Crear archivos si no existen
for (const [file, content] of Object.entries(essentialFiles)) {
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Creado: ${file}`);
  }
}

const fixImports = (filePath: string) => {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/from\s+['"]@\/components\//g, 'from '@components/');
  content = content.replace(/from\s+['"]@\/pages\//g, 'from '@pages/');
  fs.writeFileSync(filePath, content, 'utf8');
};

const walk = (dir: string) => {
  fs.readdirSync(dir).forEach(file => {
    const abs = path.join(dir, file);
    if (fs.statSync(abs).isDirectory()) walk(abs);
    else if (abs.endsWith('.ts') || abs.endsWith('.tsx')) fixImports(abs);
  });
};

const SRC = path.join(ROOT, 'src');
if (fs.existsSync(SRC)) {
  console.log('🔁 Reparando rutas en src...');
  walk(SRC);
}

try {
  console.log('📦 Instalando dependencias...');
  execSync('npm install', { stdio: 'inherit' });
} catch {
  console.error('❌ Error al instalar dependencias');
}

try {
  console.log('🏗️ Ejecutando build...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Proyecto listo. Carpeta /dist generada.');
} catch {
  console.error('❌ Error en el build. Revisa los errores anteriores.');
}
