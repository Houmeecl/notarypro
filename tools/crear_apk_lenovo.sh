#!/bin/bash

# Script simplificado para crear APK para tablet Lenovo
# Este script es una versión optimizada que reduce el tiempo de construcción

echo "=== Iniciando creación de APK para tablet Lenovo ==="

# 1. Verificar si estamos en la tablet
echo "Verificando dispositivo..."
IS_TABLET=false
if [ -f "/system/build.prop" ]; then
  # Estamos en un dispositivo Android
  IS_TABLET=true
  echo "✓ Detectado dispositivo Android"
else
  echo "✓ Ejecutando en entorno de desarrollo"
fi

# 2. Crear directorio para la APK
echo "Creando directorio para APK..."
mkdir -p apk_lenovo

# 3. Generar archivo de configuración Capacitor específico para Lenovo
echo "Generando configuración para tablets Lenovo..."
cat > apk_lenovo/capacitor.config.json << EOL
{
  "appId": "cl.vecinoxpress.pos",
  "appName": "VecinoXpress",
  "webDir": "../client/dist",
  "server": {
    "androidScheme": "https",
    "cleartext": true,
    "url": "https://app.vecinoxpress.cl",
    "initialPath": "/verificacion-nfc"
  },
  "plugins": {
    "SplashScreen": {
      "launchAutoHide": false,
      "backgroundColor": "#2d219b",
      "showSpinner": true,
      "spinnerColor": "#ffffff",
      "androidSpinnerStyle": "large"
    }
  },
  "android": {
    "flavor": "vecinoexpress",
    "minSdkVersion": 24,
    "targetSdkVersion": 33,
    "buildOptions": {
      "keystorePath": "../my-release-key.keystore",
      "keystorePassword": "vecinos123",
      "keystoreAlias": "vecinoxpress",
      "keystoreAliasPassword": "vecinos123",
      "minifyEnabled": true,
      "shrinkResources": true,
      "proguardKeepAttributes": "Signature,Exceptions,InnerClasses,*Annotation*"
    }
  }
}
EOL

# 4. Generar manifest simple para NFC
echo "Generando AndroidManifest.xml con soporte NFC..."
mkdir -p apk_lenovo/android/app/src/main
cat > apk_lenovo/android/app/src/main/AndroidManifest.xml << EOL
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme.NoActionBar">
        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name="cl.vecinoxpress.pos.MainActivity"
            android:label="@string/app_name"
            android:screenOrientation="portrait"
            android:launchMode="singleTask"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
    
    <!-- Permisos -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.NFC" />
    <uses-permission android:name="android.permission.CAMERA" />
    
    <!-- Características -->
    <uses-feature android:name="android.hardware.nfc" android:required="true" />
    <uses-feature android:name="android.hardware.camera" android:required="true" />
</manifest>
EOL

# 5. Crear instrucciones para instalar la APK
echo "Generando instrucciones de instalación..."
cat > apk_lenovo/INSTRUCCIONES_INSTALACION.txt << EOL
INSTRUCCIONES PARA INSTALAR LA APK EN TABLET LENOVO

1. Descarga la APK desde:
   https://app.vecinoxpress.cl/downloads/vecinoxpress-lenovo.apk

2. En la tablet, ve a Configuración > Seguridad

3. Activa "Fuentes desconocidas" o "Instalar aplicaciones desconocidas"

4. Abre el archivo APK descargado e instálalo

5. Al abrir la aplicación, asegúrate de que:
   - El NFC esté activado en la tablet
   - La tablet tenga conexión a internet

CREDENCIALES DE PRUEBA:
Usuario: miadmin
Contraseña: miadmin123

SOPORTE:
Si encuentras algún problema, contacta a soporte@vecinoxpress.cl
EOL

# 6. Mensaje final
echo "=== APK para tablet Lenovo =="
echo "✓ Se han generado los archivos de configuración en la carpeta 'apk_lenovo'"
echo "✓ Para generar la APK completa, necesitas ejecutar estos archivos en un entorno con Android Studio"
echo ""
echo "PASOS ADICIONALES (en entorno de desarrollo con Android Studio):"
echo "1. Copia estos archivos a tu proyecto Android"
echo "2. Usa el siguiente comando para generar la APK:"
echo "   ./gradlew assembleRelease"
echo ""
echo "ALTERNATIVA (para probar sin APK):"
echo "1. Accede directamente desde el navegador Chrome de la tablet a:"
echo "   https://app.vecinoxpress.cl/verificacion-nfc"
echo "2. Inicia sesión con miadmin/miadmin123"
echo "3. El navegador pedirá permisos para NFC, acéptalos"
echo ""
echo "¡Listo! Los archivos para la APK Lenovo han sido generados."