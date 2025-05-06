#!/bin/bash

# Detener cualquier proceso existente
pkill -f "node.*server/index.ts" || true
pkill -f "python.*document-forensics.py" || true
pkill -f "node.*dist/index.js" || true
sleep 2

# Iniciar la aplicación en el puerto 5000
NODE_ENV=development tsx server/index.ts