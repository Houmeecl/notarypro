#!/bin/bash

# Script para crear una APK optimizada para tablets Lenovo con soporte NFC
# Autor: VecinoXpress
# Fecha: Mayo 2025

echo "========================================"
echo "CREANDO APK PARA TABLETS LENOVO CON NFC"
echo "========================================"

# Verificar que todas las herramientas necesarias estén instaladas
command -v npm >/dev/null 2>&1 || { echo "npm no está instalado. Abortando."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "node no está instalado. Abortando."; exit 1; }
command -v npx >/dev/null 2>&1 || { echo "npx no está instalado. Abortando."; exit 1; }
command -v java >/dev/null 2>&1 || { echo "Java no está instalado. Abortando."; exit 1; }

echo "[1/7] Instalando dependencias Capacitor..."
npm install @capacitor/core @capacitor/android

# Verificar si el proyecto ya ha sido inicializado con Capacitor
if [ ! -f "capacitor.config.ts" ]; then
  echo "[2/7] Inicializando Capacitor..."
  npx cap init VecinoXpressNFC cl.vecinos.nfc
else
  echo "[2/7] Capacitor ya está inicializado"
fi

# Verificar si la plataforma Android ya ha sido añadida
if [ ! -d "android" ]; then
  echo "[3/7] Añadiendo plataforma Android..."
  npx cap add android
else
  echo "[3/7] Plataforma Android ya añadida"
fi

echo "[4/7] Compilando aplicación web para producción..."
npm run build

echo "[5/7] Copiando archivos web a la plataforma Android..."
npx cap copy android

echo "[6/7] Actualizando plugins nativos..."
npx cap update android

echo "[7/7] Creando APK con Gradle..."
cd android
if [ -f "./gradlew" ]; then
  chmod +x ./gradlew
  ./gradlew assembleDebug
  
  echo "========================================"
  echo "APK creada exitosamente en:"
  echo "android/app/build/outputs/apk/debug/app-debug.apk"
  echo ""
  echo "Para crear una versión de lanzamiento firmada:"
  echo "1. Abre el proyecto en Android Studio: npx cap open android"
  echo "2. Selecciona Build > Generate Signed Bundle/APK"
  echo "3. Sigue las instrucciones para crear una APK firmada"
  echo "========================================"
else
  echo "ERROR: No se puede encontrar gradlew. Por favor, abre el proyecto en Android Studio:"
  echo "npx cap open android"
  echo "Y luego genera la APK desde allí."
fi

# Regresar al directorio original
cd ..

echo "Proceso completado."