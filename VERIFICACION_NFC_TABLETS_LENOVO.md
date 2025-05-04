# Guía de verificación NFC para tablets Lenovo

## Conexión directa a la aplicación

Si la tablet Lenovo tiene acceso a internet, puedes usar la aplicación web directamente:

1. Abre Chrome en la tablet
2. Accede a la URL: `https://efad5f4d-d814-4e6d-886e-d786af273b3e-00-2ov6r7zg15uqi.riker.replit.dev/verificacion-nfc`
3. Inicia sesión con:
   - Usuario: `miadmin`
   - Contraseña: `miadmin123`
4. Acepta los permisos de NFC cuando se soliciten
5. Sigue las instrucciones en pantalla para verificar una cédula chilena

## Generar APK que apunte a Replit

Para crear una APK que use la URL de Replit, sigue estos pasos:

### En computadora con Android Studio

1. Clona el repositorio
2. Edita el archivo `capacitor.config.ts`:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cl.vecinoxpress.pos',
  appName: 'VecinoXpress',
  webDir: './client/dist',
  server: {
    androidScheme: 'https', 
    cleartext: true,
    // Apunta directamente a la aplicación en Replit
    url: 'https://efad5f4d-d814-4e6d-886e-d786af273b3e-00-2ov6r7zg15uqi.riker.replit.dev',
    initialPath: '/verificacion-nfc'
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
    minSdkVersion: 24
  }
};

export default config;
```

3. Construye la aplicación web:
```bash
npm run build
```

4. Prepara para Android:
```bash
npx cap add android
npx cap sync android
```

5. Abre en Android Studio:
```bash
npx cap open android
```

6. En Android Studio, construye la APK:
   - Build > Build Bundle(s) / APK(s) > Build APK(s)

7. Transfiere la APK a la tablet e instálala

## Uso de NFC en tablets Lenovo

### Activar NFC en la tablet

1. Ve a Configuración (Settings)
2. Busca "Conexiones" o "Conectividad" (Connections)
3. Activa el interruptor NFC
4. Si hay una opción "Lector/Escritor de tarjetas" o "Lector NFC", asegúrate de que también esté activada

### Posición correcta para la cédula

La ubicación del lector NFC varía según el modelo de tablet:

- **Lenovo Tab M8/M10**: El lector NFC está generalmente en la parte trasera central
- **Lenovo Yoga Tab**: El lector suele estar cerca del logotipo de Lenovo en la parte trasera
- **Lenovo Tab P11/P12**: El lector está usualmente en la parte superior trasera

Para mejor lectura:
1. Coloca la cédula plana contra la parte trasera de la tablet
2. Mueve lentamente la cédula hasta encontrar la posición exacta del lector
3. Mantén la cédula inmóvil durante la lectura (2-3 segundos)
4. No separes la cédula hasta que la aplicación confirme la lectura exitosa

### Solución de problemas comunes

- **NFC no detecta la cédula**: 
  - Verifica que NFC esté activado en la tablet
  - Asegúrate de que la cédula sea compatible con NFC (modelos nuevos)
  - Prueba diferentes posiciones en la parte trasera de la tablet
  
- **Error "No se puede acceder a NFC"**:
  - Reinicia la tablet
  - Ve a Configuración > Aplicaciones > Chrome > Permisos, y asegúrate de que NFC esté permitido
  
- **Lectura inconsistente**:
  - Limpia la parte trasera de la tablet y la cédula
  - Quita cualquier funda o protector de la tablet
  - Evita interferencias (no coloques la tablet sobre superficies metálicas)

## Modo sin conexión

Para verificación NFC sin internet:

1. Accede primero a la aplicación con conexión a internet
2. Una vez cargada, puedes desconectar el WiFi
3. El lector NFC seguirá funcionando para verificar la validez de la cédula
4. Reconecta para sincronizar los resultados de verificación

## Crear acceso directo en pantalla de inicio

Para una experiencia más similar a una app nativa:

1. En Chrome, accede a la URL de la aplicación
2. Toca el menú (tres puntos) en la esquina superior derecha
3. Selecciona "Añadir a pantalla de inicio" o "Instalar aplicación"
4. Confirma la acción
5. Ahora tendrás un ícono en la pantalla de inicio que abrirá la aplicación en modo pantalla completa