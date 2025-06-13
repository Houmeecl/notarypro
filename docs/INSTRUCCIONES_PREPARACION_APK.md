# Instrucciones de Preparación para APK - Lenovo Tablets NFC

## Requisitos Previos para Mañana

Para poder crear la APK nativa para tablets Lenovo, necesitarás tener lo siguiente preparado:

### 1. Entorno de Desarrollo

- **Computadora con Java Development Kit (JDK) 11 o superior**
  * Puedes descargar desde: https://www.oracle.com/java/technologies/javase-jdk11-downloads.html
  * O usar OpenJDK: https://adoptopenjdk.net/

- **Node.js y NPM**
  * Descargar desde: https://nodejs.org/en/download/ 
  * Versión recomendada: 16.x o superior

- **Android Studio**
  * Descargar desde: https://developer.android.com/studio
  * Durante la instalación, asegúrate de incluir:
    - Android SDK Platform-Tools
    - Android SDK Build-Tools
    - Al menos una versión de Android SDK (recomendado API 30 o superior)

### 2. Configuración del Entorno

- Asegúrate de tener configuradas las variables de entorno:
  * JAVA_HOME: Apuntando a tu instalación de JDK
  * ANDROID_HOME: Apuntando a tu instalación de Android SDK

- Instala Capacitor globalmente:
  ```bash
  npm install -g @capacitor/cli
  ```

### 3. Componentes Android Específicos

- Abre Android Studio y utiliza SDK Manager para instalar:
  * Android SDK Platform 30 (o superior)
  * Android SDK Build-Tools 30.0.3 (o compatible)
  * Android Emulator (opcional, para pruebas)
  * Intel x86 Emulator Accelerator (opcional, para pruebas más rápidas)

## Preparación de Archivos

1. **Código del Proyecto**: Ten todo el código actualizado
2. **Archivos de configuración**: Revisa el archivo capacitor.config.ts
3. **Imágenes e iconos**: Prepara los íconos de la aplicación en `android/app/src/main/res/`

## Pasos Para Mañana

1. Ejecutar el script `build-lenovo-tablet.sh` que ya está preparado
2. O seguir las instrucciones en `CREAR_APK_LENOVO_TABLET.md` para el proceso manual

## Solución de Problemas Comunes

- Si Android Studio no reconoce JDK, configúralo manualmente en:
  File > Project Structure > SDK Location

- Si hay problemas con la variable ANDROID_HOME, configúrala así:
  * En Windows: 
    ```
    set ANDROID_HOME=C:\Users\USERNAME\AppData\Local\Android\Sdk
    ```
  * En macOS/Linux: 
    ```
    export ANDROID_HOME=$HOME/Android/Sdk
    ```

- Para tablets Lenovo específicas, recuerda que necesitarás:
  * API NFC habilitada
  * Permisos en el AndroidManifest.xml
  * Configuración del intent filter para NFC

## Soporte

Si tienes preguntas o necesitas ayuda mañana, contáctanos por los canales habituales.

**¡Estaremos listos para empezar con la generación del APK mañana!**