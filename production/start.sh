#!/bin/bash

echo "🚀 Iniciando NotaryVecino en producción..."

# Cargar variables de entorno
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Verificar que el puerto esté libre
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️ Puerto 5000 ya está en uso. Deteniendo proceso anterior..."
    pkill -f "node.*index.js" || true
    sleep 2
fi

# Iniciar servidor
echo "🔄 Iniciando servidor en puerto 5000..."
node dist/index.js

