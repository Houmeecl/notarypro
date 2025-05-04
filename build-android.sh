#!/bin/bash

# Script para construir APK de Android para VecinoXpress POS

echo "Iniciando construcción de APK para VecinoXpress POS..."

# Primero, construir la aplicación web
echo "1. Construyendo aplicación web con Vite..."
npm run build

# Sincronizar con Capacitor
echo "2. Sincronizando con Capacitor..."
npx cap sync android

# Construir la APK de depuración
echo "3. Construyendo APK de depuración..."
cd android
./gradlew assembleDebug
cd ..

echo "APK de depuración generada en: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "Para instalar en un dispositivo USB conectado, ejecutar:"
echo "adb install android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "Proceso completado!"