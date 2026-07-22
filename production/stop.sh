#!/bin/bash

echo "🛑 Deteniendo NotaryVecino..."

# Buscar y detener procesos de Node.js relacionados
pkill -f "node.*index.js" || echo "No se encontraron procesos activos"

echo "✅ NotaryVecino detenido"
