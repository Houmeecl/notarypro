# Guía rápida para crear APK para tablet Lenovo

Esta guía está pensada para tablets Lenovo con soporte NFC, concentrándose en pasos simples para generar una APK funcional.

## Opción 1: Usar Android Studio (recomendado)

1. **Clonar el proyecto**:
   ```bash
   git clone [URL del repositorio]
   cd vecinoxpress
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Construir la aplicación web**:
   ```bash
   npm run build
   ```

4. **Preparar para Android**:
   ```bash
   npx cap sync android
   ```

5. **Abrir en Android Studio**:
   ```bash
   npx cap open android
   ```

6. **Generar APK**:
   - En Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)
   - La APK se generará en: `android/app/build/outputs/apk/debug/app-debug.apk`

## Opción 2: Línea de comandos (sin Android Studio)

1. **Clonar e instalar**:
   ```bash
   git clone [URL del repositorio]
   cd vecinoxpress
   npm install
   ```

2. **Construir y sincronizar**:
   ```bash
   npm run build
   npx cap sync android
   ```

3. **Construir APK**:
   ```bash
   cd android
   chmod +x gradlew
   ./gradlew assembleDebug
   ```

4. **Ubicación de la APK**:
   - La APK estará en: `android/app/build/outputs/apk/debug/app-debug.apk`

## Verificar la APK

Para comprobar si la APK tiene acceso a NFC correctamente, puedes:

1. Instalar la APK en la tablet
2. Abrir la aplicación
3. Iniciar sesión con: usuario `miadmin`, contraseña `miadmin123`
4. Ir a la sección "Verificación NFC"
5. Acercar una cédula chilena al lector NFC

## Solución de problemas comunes

- **Error "SDK location not found"**: Crear archivo `android/local.properties` con `sdk.dir=/ruta/al/android/sdk`
- **NFC no funciona**: Verificar que NFC esté activado en la tablet y que la app tenga permisos
- **Pantalla en blanco**: Verificar conexión a internet y que el servidor esté accesible

## Alternativa web (sin APK)

Si no puedes crear la APK, puedes usar la versión web:

1. Abre Chrome en la tablet
2. Ve a `https://app.vecinoxpress.cl/verificacion-nfc`
3. Inicia sesión con `miadmin`/`miadmin123`
4. Acepta los permisos de cámara y NFC cuando se soliciten