# Guía para crear APK específica para tablets Lenovo

Esta guía explica cómo crear una APK optimizada para tablets Lenovo con soporte NFC.

## Requisitos previos

1. Node.js instalado en tu computadora
2. Capacitor instalado globalmente: `npm install -g @capacitor/cli`
3. Android Studio instalado
4. JDK 11 o superior instalado

## Pasos para crear la APK

### 1. Preparar el proyecto

```bash
# Instalar dependencias
npm install @capacitor/core @capacitor/android

# Inicializar Capacitor en el proyecto 
npx cap init VecinoXpressNFC cl.vecinos.nfc

# Añadir Android como plataforma
npx cap add android
```

### 2. Configurar el proyecto para Lenovo

Edita el archivo `capacitor.config.ts` y asegúrate de tener esta configuración:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cl.vecinos.nfc',
  appName: 'VecinoXpress NFC',
  webDir: 'dist',
  server: {
    url: 'https://efad5f4d-d814-4e6d-886e-d786af273b3e-00-2ov6r7zg15uqi.riker.replit.dev',
    cleartext: true,
    allowNavigation: ['*'],
    initialPath: '/nfc-validation'
  },
  android: {
    buildOptions: {
      minifyEnabled: false,
      keystorePath: 'vecinoxpress.keystore',
      keystoreAlias: 'vecinoxpress'
    },
    intentFilters: [
      {
        action: 'android.nfc.action.TECH_DISCOVERED',
        categories: ['android.intent.category.DEFAULT']
      }
    ]
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
```

### 3. Editar el archivo AndroidManifest.xml

Localiza el archivo AndroidManifest.xml en `android/app/src/main/AndroidManifest.xml` y añade los siguientes permisos:

```xml
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc" android:required="true" />
```

También añade esto dentro del tag `<activity>` principal:

```xml
<intent-filter>
    <action android:name="android.nfc.action.TECH_DISCOVERED"/>
    <category android:name="android.intent.category.DEFAULT"/>
</intent-filter>
<meta-data android:name="android.nfc.action.TECH_DISCOVERED" android:resource="@xml/nfc_tech_filter" />
```

### 4. Crear archivo nfc_tech_filter.xml

Crea un nuevo archivo en `android/app/src/main/res/xml/nfc_tech_filter.xml` con el siguiente contenido:

```xml
<resources xmlns:xliff="urn:oasis:names:tc:xliff:document:1.2">
    <tech-list>
        <tech>android.nfc.tech.IsoDep</tech>
    </tech-list>
    <tech-list>
        <tech>android.nfc.tech.NfcA</tech>
    </tech-list>
    <tech-list>
        <tech>android.nfc.tech.NfcB</tech>
    </tech-list>
    <tech-list>
        <tech>android.nfc.tech.NfcF</tech>
    </tech-list>
    <tech-list>
        <tech>android.nfc.tech.NfcV</tech>
    </tech-list>
    <tech-list>
        <tech>android.nfc.tech.Ndef</tech>
    </tech-list>
    <tech-list>
        <tech>android.nfc.tech.NdefFormatable</tech>
    </tech-list>
    <tech-list>
        <tech>android.nfc.tech.MifareClassic</tech>
    </tech-list>
    <tech-list>
        <tech>android.nfc.tech.MifareUltralight</tech>
    </tech-list>
</resources>
```

### 5. Compilar la aplicación web

```bash
# Compilar para producción
npm run build

# Copiar los archivos web a Android
npx cap copy android
```

### 6. Generar APK usando Android Studio

```bash
# Abrir el proyecto en Android Studio
npx cap open android
```

En Android Studio:

1. Selecciona **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Una vez completada la compilación, haz clic en **locate** para encontrar la APK
3. La APK estará en `android/app/build/outputs/apk/debug/app-debug.apk`

### 7. Generar APK firmada para distribución

Para generar una APK firmada, ideal para distribución:

1. En Android Studio, selecciona **Build > Generate Signed Bundle / APK**
2. Selecciona **APK** y haz clic en **Next**
3. Crea un nuevo keystore o usa uno existente
4. Completa la información requerida (contraseña, alias, etc.)
5. Selecciona **release** como Build Variant
6. Haz clic en **Finish**

La APK firmada estará en `android/app/release/app-release.apk`

## Optimizaciones para tablets Lenovo

### Configuración específica para modelos Lenovo

Para optimizar el rendimiento en tablets Lenovo, edita el archivo `MainActivity.java` en `android/app/src/main/java/cl/vecinos/nfc/` y añade:

```java
@Override
public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Configuraciones para mejorar el rendimiento NFC en Lenovo
    NfcAdapter nfcAdapter = NfcAdapter.getDefaultAdapter(this);
    if (nfcAdapter != null) {
        if (!nfcAdapter.isEnabled()) {
            // Mostrar diálogo para activar NFC
            Toast.makeText(this, "Por favor active NFC para usar esta aplicación", Toast.LENGTH_LONG).show();
            startActivity(new Intent(Settings.ACTION_NFC_SETTINGS));
        }
    }
}
```

### Ajustes para tablets Lenovo específicos

Algunos modelos de tablets Lenovo requieren ajustes adicionales. Añade estas líneas en el método `onCreate`:

```java
// Ajustes específicos para tablets Lenovo
if (Build.MANUFACTURER.toLowerCase().contains("lenovo")) {
    // Aumentar el tiempo de espera NFC para Lenovo
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    
    // Optimizaciones de rendimiento
    if (Build.MODEL.contains("TB")) {
        // Es una tablet de la serie TB (como TB-X306F)
        Toast.makeText(this, "Tablet Lenovo detectada. Optimizando NFC...", Toast.LENGTH_SHORT).show();
    }
}
```

## Comandos rápidos

Para simplificar el proceso, puedes crear un script bash:

```bash
#!/bin/bash
echo "Creando APK para Lenovo Tablet..."
npm run build
npx cap copy android
cd android
./gradlew assembleRelease
echo "APK creada en android/app/build/outputs/apk/release/app-release.apk"
```

Guarda este script como `build-lenovo-tablet.sh` y ejecuta:

```bash
chmod +x build-lenovo-tablet.sh
./build-lenovo-tablet.sh
```

## Solución de problemas comunes

1. **Error: No se puede acceder a la URL en la APK**
   - Verifica que `server.cleartext: true` esté en tu `capacitor.config.ts`
   - Añade `android:usesCleartextTraffic="true"` al tag `<application>` en AndroidManifest.xml

2. **NFC no funciona**
   - Verifica que el dispositivo tenga NFC habilitado
   - Prueba usar `android.nfc.action.NDEF_DISCOVERED` en lugar de `TECH_DISCOVERED`
   - Asegúrate de que el formato de la tarjeta NFC coincida con los filtros

3. **La aplicación se cierra al iniciarse**
   - Verifica los logs con `adb logcat`
   - Asegúrate de que todas las dependencias estén correctamente configuradas

4. **Problemas específicos con Lenovo**
   - Algunos modelos pueden requerir configuraciones adicionales
   - Prueba desactivar el modo de ahorro de energía antes de usar NFC
   - En algunos modelos, la posición del sensor NFC varía considerablemente