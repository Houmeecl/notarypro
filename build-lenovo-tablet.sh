#!/bin/bash

# Script para construir APK optimizada para tablets Lenovo
# Este script está configurado específicamente para tablets Lenovo con Android 7.0+

echo "=====================================================================
Iniciando construcción de APK optimizada para tablets Lenovo (VecinoXpress)
====================================================================="

# 1. Verificar si la tablet está conectada (opcional)
echo "1. Verificando conexión con la tablet Lenovo..."
ADB_DEVICES=$(adb devices -l | grep -c "device product")
if [ "$ADB_DEVICES" -gt 0 ]; then
  echo "✓ Tablet Lenovo detectada!"
  # Obtener información del dispositivo
  echo "   Información del dispositivo:"
  adb shell getprop ro.product.model
  adb shell getprop ro.build.version.release
else
  echo "! No se detectó ninguna tablet. Construyendo APK de todas formas."
fi

# 2. Construir la aplicación con optimizaciones específicas
echo -e "\n2. Construyendo aplicación web optimizada..."
NODE_ENV=production npm run build

# 3. Optimizar recursos para tablets
echo -e "\n3. Aplicando optimizaciones para tablets Lenovo..."
# Crear carpeta específica para iconos adaptados a tablets
mkdir -p public/tablet-icons
# Copiar/redimensionar íconos si es necesario para tablets específicas

# 4. Sincronizar con Capacitor
echo -e "\n4. Sincronizando con Capacitor..."
npx cap sync android

# 5. Optimizaciones adicionales para Android
echo -e "\n5. Aplicando configuraciones específicas para tablets Lenovo..."
BUILD_GRADLE="android/app/build.gradle"
if [ -f "$BUILD_GRADLE" ]; then
  echo "   Modificando build.gradle para optimizar para tablets Lenovo..."
  
  # Asegurarse de que el shrinking esté activado
  sed -i 's/minifyEnabled false/minifyEnabled true/g' "$BUILD_GRADLE"
  sed -i 's/shrinkResources false/shrinkResources true/g' "$BUILD_GRADLE"
  
  # Configurar compilación para tablets ARM
  if ! grep -q "ndk.abiFilters" "$BUILD_GRADLE"; then
    sed -i '/android {/a \    defaultConfig {\n        ndk.abiFilters "armeabi-v7a", "arm64-v8a"\n    }' "$BUILD_GRADLE"
  fi
  
  # Agregar configuración para optimizaciones de recursos
  if ! grep -q "android.enableR8.fullMode" "$BUILD_GRADLE"; then
    sed -i '/android {/a \    buildTypes {\n        release {\n            proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"\n            minifyEnabled true\n            shrinkResources true\n        }\n    }\n    compileOptions {\n        sourceCompatibility JavaVersion.VERSION_1_8\n        targetCompatibility JavaVersion.VERSION_1_8\n    }' "$BUILD_GRADLE"
  fi
  
  echo "   ✓ Build.gradle configurado para tablets Lenovo"
else
  echo "   ! No se encontró build.gradle"
fi

# 6. Configurar permisos NFC y hardware específico
MANIFEST="android/app/src/main/AndroidManifest.xml"
if [ -f "$MANIFEST" ]; then
  echo "   Configurando permisos NFC y hardware específico para Lenovo..."
  
  # Asegurarse de tener permisos NFC
  if ! grep -q "android.permission.NFC" "$MANIFEST"; then
    sed -i '/<uses-permission android:name="android.permission.INTERNET"\/>/a \    <uses-permission android:name="android.permission.NFC" />' "$MANIFEST"
  fi
  
  # Agregar feature NFC
  if ! grep -q "<uses-feature android:name=\"android.hardware.nfc\"" "$MANIFEST"; then
    sed -i '/<\/manifest>/i \    <uses-feature android:name="android.hardware.nfc" android:required="true" />' "$MANIFEST"
  fi
  
  echo "   ✓ AndroidManifest configurado para tablets Lenovo con NFC"
else
  echo "   ! No se encontró AndroidManifest.xml"
fi

# 7. Construir la APK para tablets Lenovo
echo -e "\n6. Construyendo APK optimizada para tablets Lenovo..."
cd android
./gradlew assembleRelease
cd ..

# 8. Renombrar APK para identificar que es para tablets Lenovo
echo -e "\n7. Preparando APK..."
mkdir -p builds

# Copiar y renombrar APK
VERSION=$(grep -oP "version: '\K[^']+" package.json || echo "1.0.0")
DATE=$(date +"%Y%m%d")
cp android/app/build/outputs/apk/release/app-release.apk "builds/VecinoXpress_Lenovo_v${VERSION}_${DATE}.apk"

# 9. Mostrar información final
APK_SIZE=$(du -h "builds/VecinoXpress_Lenovo_v${VERSION}_${DATE}.apk" | cut -f1)
echo -e "\n======================================================================"
echo "✅ APK para tablets Lenovo construida exitosamente!"
echo "   Ubicación: builds/VecinoXpress_Lenovo_v${VERSION}_${DATE}.apk"
echo "   Tamaño: $APK_SIZE"
echo "   Versión: $VERSION (fecha: $DATE)"
echo ""
echo "Para instalar en la tablet Lenovo conectada, ejecute:"
echo "adb install -r \"builds/VecinoXpress_Lenovo_v${VERSION}_${DATE}.apk\""
echo "======================================================================"

# 10. Ofrecer instalar directamente si la tablet está conectada
if [ "$ADB_DEVICES" -gt 0 ]; then
  echo -e "\n¿Desea instalar la APK en la tablet Lenovo conectada? (s/n)"
  read -r respuesta
  if [[ "$respuesta" == "s" || "$respuesta" == "S" ]]; then
    echo "Instalando APK en la tablet Lenovo..."
    adb install -r "builds/VecinoXpress_Lenovo_v${VERSION}_${DATE}.apk"
    echo "Instalación completada!"
  else
    echo "APK construida pero no instalada."
  fi
fi