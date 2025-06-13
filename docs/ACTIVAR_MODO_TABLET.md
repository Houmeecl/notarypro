# Guía para activar modo tablet con NFC

## Configuración en la tablet Lenovo

### Activar NFC en la tablet

1. Ve a **Configuración**
2. Busca **Conexiones** o **Conectividad**
3. Activa el interruptor **NFC**
4. Si existe una opción **Lector/Escritor de tarjetas**, actívala también

### Configurar el navegador Chrome

1. Abre **Chrome**
2. Ve a **chrome://flags** en la barra de direcciones
3. Busca **Web NFC**
4. Cámbialo a **Enabled**
5. Reinicia Chrome cuando se te solicite

### Verificar compatibilidad NFC

1. Abre Chrome
2. Ve a esta URL de prueba: **https://webnfc-test.web.app/**
3. Toca en **Leer etiqueta NFC**
4. Acerca una cédula chilena al lector NFC
5. Si detecta la lectura, significa que el NFC está funcionando correctamente

## Crear acceso directo a la aplicación

### Usando APK Creator

Sigue las instrucciones en **CREAR_APK_CON_APKCREATOR.md**

### Usando Chrome (sin APK)

1. Abre Chrome
2. Ve a nuestra URL: **https://efad5f4d-d814-4e6d-886e-d786af273b3e-00-2ov6r7zg15uqi.riker.replit.dev/verificacion-nfc**
3. Toca el menú (tres puntos)
4. Selecciona **Añadir a pantalla de inicio**
5. Confirma el nombre (**VecinoXpress**) y añade el acceso directo

## Modo de prueba rápida para NFC

Si necesitas probar rápidamente el lector NFC:

1. Instala alguna de estas aplicaciones desde Google Play Store:
   - **NFC Tools**
   - **NFC TagInfo**
   - **NFC TagWriter**

2. Abre la aplicación y sigue las instrucciones para leer una etiqueta NFC
3. Acerca una cédula u otra tarjeta con NFC
4. La aplicación debería mostrar información sobre la tarjeta

## Consejos para usar NFC en tablets Lenovo

- **Posición del lector**: Cada modelo de tablet tiene el lector NFC en una posición diferente. Prueba distintas zonas de la parte trasera.
- **Mantén la cédula inmóvil**: Evita mover la cédula durante la lectura.
- **Elimina interferencias**: Quita fundas protectoras y evita superficies metálicas.
- **Batería suficiente**: Asegúrate de que la tablet tenga al menos 15% de batería.
- **Activar modo depuración**: Si tienes problemas persistentes, activa el modo desarrollador y la depuración USB para ver registros detallados.