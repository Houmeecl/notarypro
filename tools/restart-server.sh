#!/bin/bash

# Intentar detener procesos node existentes (si hay)
pkill -f "node --require" || true
pkill -f "tsx server/index.ts" || true
pkill -f "node server/index.js" || true

# Esperar un momento para asegurarse de que se liberan los puertos
sleep 2

# Iniciar el servidor
npm run dev