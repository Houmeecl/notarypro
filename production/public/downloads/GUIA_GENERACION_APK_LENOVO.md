# Guía para generar APK en Tablet Lenovo con Terminal

Esta guía está diseñada para generar una APK directamente en la tablet Lenovo, sin necesidad de una computadora externa.

## Prerrequisitos

- Tablet Lenovo con Android 7.0 o superior
- Aplicación "Termux" instalada (disponible en Google Play o F-Droid)
- Espacio libre (mínimo 2GB)
- Conexión a Internet estable

## Instalación y configuración de Termux

1. **Instalar Termux** desde Play Store o F-Droid

2. **Abrir Termux** y ejecutar los siguientes comandos:

```bash
# Actualizar repositorios
pkg update

# Instalar paquetes necesarios
pkg install git nodejs-lts openjdk-17 gradle

# Verificar instalaciones
node --version
java --version
gradle --version

# Configurar directorio de trabajo
mkdir -p ~/vecinoxpress
cd ~/vecinoxpress
```

## Clonar el repositorio y preparar el entorno

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/vecinoxpress.git .

# Instalar dependencias
npm install

# Crear archivo de entorno
echo "NODE_ENV=production" > .env
```

## Generar APK simplificada

```bash
# Construir proyecto web
npm run build

# Configurar Capacitor
npm install @capacitor/cli @capacitor/android
npx cap init VecinoXpress cl.vecinoxpress.pos --web-dir=client/dist

# Crear configuración específica
cat > capacitor.config.json << EOL
{
  "appId": "cl.vecinoxpress.pos",
  "appName": "VecinoXpress",
  "webDir": "client/dist",
  "server": {
    "androidScheme": "https",
    "url": "https://app.vecinoxpress.cl",
    "initialPath": "/verificacion-nfc"
  },
  "plugins": {
    "SplashScreen": {
      "launchAutoHide": false,
      "backgroundColor": "#2d219b",
      "showSpinner": true
    }
  },
  "android": {
    "minSdkVersion": 24
  }
}
EOL

# Agregar plataforma Android
npx cap add android

# Sincronizar archivos
npx cap sync android

# Generar APK (modo debug)
cd android
chmod +x gradlew
./gradlew assembleDebug

# La APK estará en:
echo "APK generada en: ~/vecinoxpress/android/app/build/outputs/apk/debug/app-debug.apk"
```

## Instalar la APK generada

```bash
# Instalar la APK (requiere permitir instalar desde fuentes desconocidas)
cd ~/vecinoxpress
cp android/app/build/outputs/apk/debug/app-debug.apk /sdcard/Download/VecinoXpress.apk
```

Luego:
1. Abre el administrador de archivos
2. Navega a la carpeta "Download"
3. Toca en "VecinoXpress.apk" para instalar

## Alternativa: Generar APK con Termux:API

Si tienes problemas con la forma anterior, puedes usar Termux:API:

1. **Instalar Termux:API**:
```bash
pkg install termux-api
```

2. **Crear script para simplificar**:
```bash
cat > build-apk.sh << 'EOL'
#!/bin/bash

# Configuración
APP_NAME="VecinoXpress"
APP_PACKAGE="cl.vecinoxpress.pos"
WEB_DIR="client/dist"

# Función para mostrar progreso
show_progress() {
  termux-toast "Paso $1 de 5: $2"
  echo "=== Paso $1 de 5: $2 ==="
}

# Paso 1: Construir aplicación web
show_progress 1 "Construyendo aplicación web"
npm run build

# Paso 2: Inicializar Capacitor si no existe
show_progress 2 "Configurando Capacitor"
if [ ! -f "capacitor.config.json" ]; then
  npx cap init "$APP_NAME" "$APP_PACKAGE" --web-dir="$WEB_DIR"
  
  # Crear configuración personalizada
  cat > capacitor.config.json << EOLC
{
  "appId": "${APP_PACKAGE}",
  "appName": "${APP_NAME}",
  "webDir": "${WEB_DIR}",
  "server": {
    "androidScheme": "https",
    "url": "https://app.vecinoxpress.cl",
    "initialPath": "/verificacion-nfc"
  },
  "plugins": {
    "SplashScreen": {
      "launchAutoHide": false,
      "backgroundColor": "#2d219b"
    }
  }
}
EOLC
fi

# Paso 3: Configurar Android
show_progress 3 "Configurando Android"
npx cap add android
npx cap sync android

# Paso 4: Configurar permisos NFC
show_progress 4 "Agregando permisos NFC"
MANIFEST_FILE="android/app/src/main/AndroidManifest.xml"
if grep -q "android.permission.NFC" "$MANIFEST_FILE"; then
  echo "Permisos NFC ya configurados"
else
  # Agregar permisos NFC antes del cierre de manifest
  sed -i '/<\/manifest>/i \    <uses-permission android:name="android.permission.NFC" \/>\n    <uses-feature android:name="android.hardware.nfc" android:required="true" \/>' "$MANIFEST_FILE"
fi

# Paso 5: Construir APK
show_progress 5 "Generando APK"
cd android
chmod +x gradlew
./gradlew assembleDebug

# Copiar APK a descargas
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
  cp "$APK_PATH" /sdcard/Download/VecinoXpress.apk
  termux-notification --title "APK Generada" --content "VecinoXpress.apk está en tu carpeta de Descargas"
  echo "✅ APK generada exitosamente en /sdcard/Download/VecinoXpress.apk"
else
  termux-notification --title "Error" --content "No se pudo generar la APK"
  echo "❌ Error al generar la APK"
fi
EOL

# Hacer ejecutable el script
chmod +x build-apk.sh

# Ejecutar script
./build-apk.sh
```

## Solución de problemas comunes

- **Error "No se puede abrir archivo JAR"**: Verifica la instalación de Java:
  ```bash
  pkg reinstall openjdk-17
  ```

- **Error "Memoria insuficiente"**: Cierra otras aplicaciones y agrega memoria swap:
  ```bash
  pkg install tsu
  sudo swapon /sdcard/swapfile
  ```

- **Error de permisos NFC**: La APK debe ser firmada correctamente y solicitar permisos NFC. Verifica el archivo AndroidManifest.xml antes de compilar.

## Alternativa a APK: Progressive Web App (PWA)

Si la generación de APK es complicada, considera usar la aplicación como PWA:

1. Abre Chrome en la tablet
2. Visita `https://app.vecinoxpress.cl/verificacion-nfc`
3. Toca en menú (tres puntos) > "Añadir a pantalla de inicio"
4. Acepta permisos de NFC cuando la aplicación lo solicite