#!/bin/sh
set -e

echo "🚀 Iniciando NotaryVecino en contenedor Docker..."

# Verificar variables de entorno críticas
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL no está configurada"
    exit 1
fi

# Esperar a que la base de datos esté lista
echo "⏳ Esperando conexión a base de datos..."
until node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect()
  .then(() => { console.log('✅ Base de datos conectada'); client.end(); })
  .catch(err => { console.log('❌ Error DB:', err.message); process.exit(1); });
" 2>/dev/null; do
    echo "⏳ Esperando base de datos..."
    sleep 5
done

# Ejecutar migraciones si es necesario
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "🔄 Ejecutando migraciones..."
    # Aquí se ejecutarían las migraciones si están implementadas
fi

# Ejecutar semillas si es necesario
if [ "$RUN_SEEDS" = "true" ]; then
    echo "🌱 Ejecutando semillas de base de datos..."
    node server/seeds/seed.js || echo "⚠️ Semillas ejecutadas parcialmente"
fi

# Crear directorios necesarios
mkdir -p uploads/documents uploads/images
mkdir -p docs
mkdir -p logs

# Mostrar información del entorno
echo "ℹ️ Información del entorno:"
echo "  NODE_ENV: $NODE_ENV"
echo "  PORT: $PORT"
echo "  Database: $(echo $DATABASE_URL | sed 's/:[^:]*@/:***@/')"
echo "  JWT configurado: $([ -n "$JWT_SECRET" ] && echo "✅" || echo "❌")"
echo "  Agora configurado: $([ -n "$AGORA_APP_ID" ] && echo "✅" || echo "❌")"
echo "  GetAPI configurado: $([ -n "$GETAPI_API_KEY" ] && echo "✅" || echo "❌")"
echo "  AWS S3 configurado: $([ -n "$AWS_ACCESS_KEY_ID" ] && echo "✅" || echo "❌")"

# Iniciar aplicación
echo "🚀 Iniciando servidor NotaryVecino..."
exec node dist/index.js