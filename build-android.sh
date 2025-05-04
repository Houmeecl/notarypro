#!/bin/bash

# Script para construir APK de Android para VecinoXpress con optimizaciones de tamaño

echo "Iniciando construcción de APK para VecinoXpress..."

# Primero, construir la aplicación web optimizada para producción
echo "1. Construyendo aplicación web con Vite (modo producción)..."
NODE_ENV=production npm run build

# Optimizaciones adicionales para reducir el tamaño
echo "2. Aplicando optimizaciones de tamaño..."
# Remover sourcemaps de producción
find ./client/dist -name "*.map" -type f -delete

# Sincronizar con Capacitor
echo "3. Sincronizando con Capacitor..."
npx cap sync android

# Configurar opciones de construcción para reducir tamaño
echo "4. Configurando opciones de construcción..."
# Modificar build.gradle para activar shrinking y minificación
BUILD_GRADLE="android/app/build.gradle"
if [ -f "$BUILD_GRADLE" ]; then
    # Asegurarse de que el shrinking esté activado
    sed -i 's/minifyEnabled false/minifyEnabled true/g' "$BUILD_GRADLE"
    sed -i 's/shrinkResources false/shrinkResources true/g' "$BUILD_GRADLE"
    # Podemos activar aapt optimization
    sed -i '/buildTypes {/,/}/s/release {/release {\n            aaptOptions.cruncherEnabled = false\n            aaptOptions.useNewCruncher = false/g' "$BUILD_GRADLE"
    echo "   Optimizaciones de Gradle configuradas"
else
    echo "   No se encontró el archivo build.gradle, omitiendo optimizaciones"
fi

# Construir la APK optimizada
echo "5. Construyendo APK optimizada..."
cd android
./gradlew assembleRelease
cd ..

echo "APK de producción generada en: android/app/build/outputs/apk/release/app-release.apk"
echo "APK de depuración disponible en: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "Para instalar la versión de producción en un dispositivo USB conectado, ejecutar:"
echo "adb install android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "Proceso completado!"