# Generación manual de APK para tablets Lenovo con Android Studio

Estas instrucciones detalladas te permitirán crear una APK optimizada para tablets Lenovo con soporte NFC utilizando Android Studio.

## Requisitos previos

- Android Studio instalado (última versión estable)
- JDK 11 o superior
- Node.js y npm instalados
- Git instalado

## Proceso paso a paso

### 1. Clonar el repositorio e instalar dependencias

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/vecinoxpress.git
cd vecinoxpress

# Instalar dependencias
npm install
```

### 2. Construir la aplicación web

```bash
# Construir la aplicación
npm run build
```

### 3. Configurar Capacitor

```bash
# Si es la primera vez, agregar la plataforma Android
npx cap add android

# Sincronizar los archivos construidos con el proyecto Android
npx cap sync android
```

### 4. Realizar ajustes específicos para tablets Lenovo

#### Modificar capacitor.config.ts:

Edita el archivo `capacitor.config.ts` para que contenga lo siguiente:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cl.vecinoxpress.pos',
  appName: 'VecinoXpress',
  webDir: './client/dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    // Descomentar para modo de producción
    // url: 'https://app.vecinoxpress.cl',
    // initialPath: '/verificacion-nfc'
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

#### Generar un keystore para firmar la APK:

```bash
keytool -genkey -v -keystore my-release-key.keystore -alias vecinoxpress -keyalg RSA -keysize 2048 -validity 10000 -storepass vecinos123 -keypass vecinos123
```

### 5. Modificar el AndroidManifest.xml para soporte NFC

Abrir el archivo `android/app/src/main/AndroidManifest.xml` y asegurarse de que tenga estos permisos:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.NFC" />
<uses-permission android:name="android.permission.CAMERA" />

<uses-feature android:name="android.hardware.nfc" android:required="true" />
<uses-feature android:name="android.hardware.camera" android:required="true" />
```

Y configurar la actividad principal para orientación portrait:

```xml
<activity
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
    android:name="cl.vecinoxpress.pos.MainActivity"
    android:label="@string/app_name"
    android:screenOrientation="portrait"
    android:theme="@style/AppTheme.NoActionBar"
    android:exported="true">
    <!-- ... resto del código ... -->
</activity>
```

### 6. Ajustes para optimizar el rendimiento en tablets Lenovo

Modificar el archivo `android/app/build.gradle`:

```gradle
android {
    // ... configuración existente ...
    
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    
    // Agregar esta configuración para tablets
    aaptOptions {
        cruncherEnabled = false
        useNewCruncher = false
    }
    
    // Optimizaciones para tablets
    defaultConfig {
        // ... configuración existente ...
        
        // Agregar esto para tablets
        ndk {
            abiFilters "armeabi-v7a", "arm64-v8a"
        }
    }
}
```

### 7. Configurar colores específicos

Editar `android/app/src/main/res/values/colors.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#2d219b</color>
    <color name="colorPrimaryDark">#2d219b</color>
    <color name="colorAccent">#50e3c2</color>
    <color name="ic_launcher_background">#2d219b</color>
</resources>
```

### 8. Ajustar el estilo para tablets

Editar `android/app/src/main/res/values/styles.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Base application theme -->
    <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
        <item name="colorPrimary">@color/colorPrimary</item>
        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
        <item name="colorAccent">@color/colorAccent</item>
    </style>

    <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
        <item name="android:background">@null</item>
        <item name="colorPrimary">@color/colorPrimary</item>
        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
        <item name="colorAccent">@color/colorAccent</item>
        <!-- Para tablets con notch o recortes de pantalla -->
        <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
    </style>
</resources>
```

### 9. Abrir el proyecto en Android Studio y generar la APK

1. Abrir Android Studio
2. Seleccionar "Open an existing project"
3. Navegar hasta la carpeta `android` del proyecto y abrir
4. Esperar a que el proyecto sincronice
5. Seleccionar en el menú: Build > Build Bundle(s) / APK(s) > Build APK(s)
6. Esperar a que la construcción termine

La APK se generará en: `android/app/build/outputs/apk/release/app-release.apk`

### 10. Instalar en la tablet Lenovo

1. Conectar la tablet vía USB al computador
2. Habilitar depuración USB en la tablet (Configuración > Opciones de desarrollador)
3. Ejecutar:
   ```bash
   adb install -r android/app/build/outputs/apk/release/app-release.apk
   ```

O alternativamente:
1. Copiar el archivo APK a la tablet (vía USB, email o cloud)
2. En la tablet, ir a Configuración > Seguridad
3. Activar "Fuentes desconocidas" o "Instalar apps desconocidas"
4. Usar el administrador de archivos para navegar hasta la APK y tocarla para instalar

## Solución de problemas comunes

### Error "SDK location not found"

Crear un archivo `android/local.properties` con:
```
sdk.dir=/ruta/al/android/sdk
```

### Error al sincronizar Gradle

Ejecutar:
```bash
cd android
./gradlew clean
```

### Problemas con NFC

Si el NFC no funciona en la APK instalada:

1. Verificar que NFC esté activo en la tablet
2. Revisar que la app tenga permisos NFC (Configuración > Aplicaciones > VecinoXpress > Permisos)
3. Revisar los logs para diagnóstico:
   ```bash
   adb logcat | grep -i nfc
   ```