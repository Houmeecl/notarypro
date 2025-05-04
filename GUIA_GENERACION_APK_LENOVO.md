# Guía de Generación de APK para Tablets Lenovo

## Requisitos previos

Antes de comenzar, asegúrate de tener instalado en tu computadora local:

- **Node.js** (versión 16 o superior)
- **Android Studio** (última versión estable)
- **Java Development Kit (JDK)** (versión 11 o superior)
- **Android SDK** (API 24 o superior, para compatibilidad con Android 7.0+)
- **Git** (para clonar el repositorio)

## Pasos para la generación de la APK

### 1. Clonar y preparar el repositorio

```bash
# Clonar el repositorio (reemplaza URL_DEL_REPOSITORIO con la URL correcta)
git clone URL_DEL_REPOSITORIO vecinoxpress
cd vecinoxpress

# Instalar dependencias
npm install
```

### 2. Configurar las variables de entorno

Crea un archivo `.env` con las variables necesarias:

```
# Variables de entorno para la generación de APK
DATABASE_URL=postgres://usuario:contraseña@host:puerto/basededatos
MERCADOPAGO_ACCESS_TOKEN=tu_token_de_mercadopago
MERCADOPAGO_PUBLIC_KEY=tu_clave_publica_de_mercadopago
SENDGRID_API_KEY=tu_clave_de_sendgrid
OPENAI_API_KEY=tu_clave_de_openai
```

### 3. Modificar la configuración de Capacitor

Edita el archivo `capacitor.config.ts` para asegurarte de que contenga la configuración correcta para tablets Lenovo:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cl.vecinoxpress.pos',
  appName: 'VecinoXpress',
  webDir: './client/dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    // URL que utilizará la app para conectarse al servidor
    // En producción, se debe configurar la URL del servidor real
    url: 'https://app.vecinoxpress.cl',
    initialPath: '/vecinos/login'
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#2d219b",
      showSpinner: true,
      spinnerColor: "#ffffff",
      androidSpinnerStyle: "large"
    }
  },
  android: {
    flavor: 'vecinoexpress',
    // Optimizaciones para tablet Lenovo
    minSdkVersion: 24, // Compatible con Android 7.0+
    targetSdkVersion: 33, // Android 13
    buildOptions: {
      keystorePath: './my-release-key.keystore',
      keystorePassword: 'vecinos123',
      keystoreAlias: 'vecinoxpress',
      keystoreAliasPassword: 'vecinos123',
      // Habilitar estas opciones para reducir el tamaño de la APK
      minifyEnabled: true,
      shrinkResources: true,
      proguardKeepAttributes: "Signature,Exceptions,InnerClasses,*Annotation*"
    }
  }
};

export default config;
```

### 4. Crear el keystore para firmar la APK (si no existe)

```bash
keytool -genkey -v -keystore my-release-key.keystore -alias vecinoxpress -keyalg RSA -keysize 2048 -validity 10000 -storepass vecinos123 -keypass vecinos123
```

### 5. Preparar el proyecto Android

```bash
# Construir la aplicación web
npm run build

# Si es la primera vez, agrega la plataforma Android
npx cap add android

# Sincronizar los archivos con Capacitor
npx cap sync android
```

### 6. Configurar permisos NFC y otras optimizaciones para tablets Lenovo

Edita el archivo `android/app/src/main/AndroidManifest.xml` para añadir los permisos NFC:

```xml
<!-- Asegúrate de que estos permisos estén presentes en el manifest -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc" android:required="true" />
```

Edita el archivo `android/app/build.gradle` para habilitar la optimización de APK:

```gradle
// En la sección android -> buildTypes -> release, asegúrate de tener:
release {
    minifyEnabled true
    shrinkResources true
    proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
}
```

### 7. Construir la APK

#### Opción 1: Mediante Android Studio (recomendado)

1. Abre la carpeta `android` con Android Studio
2. Espera a que el proyecto sincronice
3. Selecciona Build > Build Bundle(s) / APK(s) > Build APK(s)
4. La APK generada se ubicará en `android/app/build/outputs/apk/release/app-release.apk`

#### Opción 2: Desde la línea de comandos

```bash
cd android
./gradlew assembleRelease
cd ..
```

La APK generada estará disponible en `android/app/build/outputs/apk/release/app-release.apk`

### 8. Instalar la APK en la tablet Lenovo

Conecta la tablet Lenovo mediante USB y habilita la depuración USB en la tablet.

```bash
# Verificar que la tablet está conectada
adb devices

# Instalar la APK
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

## Resolución de problemas comunes

### Error: "Could not find tools.jar"

Este error ocurre cuando el JDK no está correctamente configurado.

Solución: Asegúrate de que la variable de entorno JAVA_HOME está configurada correctamente.

```bash
export JAVA_HOME=/ruta/a/tu/jdk
```

### Error: "SDK location not found"

Este error ocurre cuando Android Studio no puede encontrar el SDK de Android.

Solución: Crea un archivo `local.properties` en la carpeta `android` con:

```
sdk.dir=/ruta/a/tu/android/sdk
```

### Error: "Execution failed for task ':app:processReleaseManifest'"

Este error puede ocurrir por problemas de configuración en el AndroidManifest.xml.

Solución: Revisa que no haya duplicados de permisos o características en el AndroidManifest.xml.

### Error en la lectura NFC

Si la aplicación no puede leer tarjetas NFC:

1. Verifica que el NFC esté activado en la tablet
2. Asegúrate de que la app tiene permisos de NFC
3. Revisa los logs de la aplicación con:

```bash
adb logcat | grep -i nfc
```

## Configuración específica para tablet Lenovo Tab M10 o similares

Para tablets Lenovo Tab M10 (o modelos similares), es posible que necesites estas configuraciones adicionales:

1. **Optimizaciones de pantalla**: Edita el archivo `android/app/src/main/res/values/styles.xml` para añadir:

```xml
<style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
    <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
</style>
```

2. **Activar modo tablet**: Edita el archivo `android/app/src/main/res/values/strings.xml` para añadir:

```xml
<string name="is_tablet_mode">true</string>
```

3. **Asegurar rotación de pantalla**: Añade esta línea en `android/app/src/main/AndroidManifest.xml` dentro de la actividad principal:

```xml
android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
```

## Notas importantes

1. **Acceso al servidor**: La APK se conectará al servidor configurado en `capacitor.config.ts`. Asegúrate de que la URL sea la correcta.

2. **Requerimiento de NFC**: Esta aplicación requiere NFC para funcionar correctamente. Verifica que las tablets Lenovo seleccionadas cuenten con soporte NFC.

3. **Seguridad del Keystore**: Guarda el archivo keystore en un lugar seguro, ya que lo necesitarás para futuras actualizaciones de la APK.