# Guía para Crear APK de VecinoXpress para Tablets Lenovo

Este documento proporciona instrucciones detalladas para generar una APK optimizada para tablets Lenovo con soporte NFC, para ser utilizada con la plataforma VecinoXpress.

## Requisitos previos

Antes de comenzar, asegúrate de tener instalados:

1. Node.js (14.x o superior)
2. Android Studio 
3. Android SDK (API 24 o superior)
4. Java Development Kit (JDK 11 recomendado)
5. ADB (Android Debug Bridge)

## Pasos para generar la APK

### 1. Preparar el entorno Android

Ejecuta el script `prepare-android.sh` para configurar el proyecto Android:

```bash
chmod +x prepare-android.sh
./prepare-android.sh
```

Este script realiza las siguientes tareas:
- Inicializa el proyecto de Android con Capacitor (si no existe)
- Configura los colores y temas de la aplicación
- Establece permisos necesarios como NFC
- Configura el AndroidManifest.xml con las opciones correctas

### 2. Construir la APK optimizada para Tablets Lenovo

Hay dos opciones para construir la APK:

#### Opción 1: APK estándar

Ejecuta el script `build-android.sh`:

```bash
chmod +x build-android.sh
./build-android.sh
```

Este script:
- Construye la aplicación web en modo producción
- Optimiza los archivos eliminando sourcemaps
- Sincroniza con Capacitor
- Configura opciones para reducir tamaño
- Genera la APK en `android/app/build/outputs/apk/release/app-release.apk`

#### Opción 2: APK optimizada para tablets Lenovo (Recomendada)

Ejecuta el script `build-lenovo-tablet.sh`:

```bash
chmod +x build-lenovo-tablet.sh
./build-lenovo-tablet.sh
```

Este script incluye optimizaciones específicas para tablets Lenovo:
- Detecta automáticamente si hay una tablet conectada por USB
- Aplica configuraciones optimizadas para tablets Lenovo
- Configura soporte NFC específico
- Optimiza el tamaño y rendimiento de la APK
- Genera la APK en `builds/VecinoXpress_Lenovo_vX.X.X_YYYYMMDD.apk`
- Ofrece instalar directamente en la tablet si está conectada

## Instalación en la tablet

### Si usaste build-lenovo-tablet.sh y la tablet está conectada:
El script te preguntará si deseas instalar directamente en la tablet. Responde 's' para instalar.

### Instalación manual:
1. Conecta la tablet Lenovo vía USB
2. Activa la depuración USB en la tablet
3. Ejecuta el siguiente comando:

```bash
# Para la APK estándar:
adb install android/app/build/outputs/apk/release/app-release.apk

# Para la APK optimizada para Lenovo:
adb install builds/VecinoXpress_Lenovo_v*.apk
```

## Configuración de la aplicación

Al iniciar la aplicación en la tablet:

1. La aplicación se conectará al servidor configurado en `capacitor.config.ts`
2. Se iniciará en la ruta `/vecinos/login` 
3. Asegúrate de que las credenciales de prueba estén configuradas en el servidor

## Solución de problemas

### Error de NFC
Si la aplicación no detecta el NFC, verifica:
- Que el NFC esté activado en la tablet
- Que los permisos de NFC estén concedidos a la aplicación
- Que la tablet soporte NFC (requisito imprescindible)

### Problemas de conexión
Si la aplicación no se conecta al servidor:
- Verifica la configuración URL en `capacitor.config.ts`
- Asegúrate de que la tablet tenga acceso a internet
- Verifica que el servidor esté en funcionamiento

### Errores de construcción
Si el proceso de construcción falla:
- Verifica que Android Studio y las herramientas de línea de comandos estén correctamente instalados
- Asegúrate de que JAVA_HOME y ANDROID_HOME estén correctamente configurados
- Verifica que Capacitor esté correctamente instalado con `npx cap doctor`