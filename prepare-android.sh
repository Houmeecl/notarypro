#!/bin/bash

# Script para inicializar el proyecto Android con Capacitor

echo "Inicializando proyecto Android para VecinoXpress POS..."

# Verificar si ya existe la carpeta android
if [ -d "./android" ]; then
  echo "La carpeta android ya existe. Continuando con la sincronización..."
else
  echo "Inicializando proyecto Android con Capacitor..."
  npx cap add android
fi

# Sincronizar con Capacitor
echo "Sincronizando recursos con Capacitor..."
npx cap sync android

# Copiar el ícono personalizado a recursos de Android
echo "Copiando ícono a recursos de Android..."
mkdir -p android/app/src/main/res/drawable
cp client/src/assets/icon.svg android/app/src/main/res/drawable/ic_launcher.xml

echo "Proceso completado! Ya puedes ejecutar './build-android.sh' para construir la APK."