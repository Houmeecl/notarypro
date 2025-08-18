# Crear APK con APK Creator en la tablet Lenovo

Esta guía te permitirá crear una APK directamente en la tablet Lenovo usando la aplicación APK Creator que viene preinstalada.

## Requisitos

- Tablet Lenovo con APK Creator instalado
- Acceso a internet
- Permisos de administrador en la tablet

## Pasos para crear la APK

### 1. Preparar la configuración

1. Abre la aplicación APK Creator en tu tablet Lenovo
2. Si es la primera vez que la usas, acepta los términos y permisos necesarios
3. Selecciona "Crear nueva APK" o "Nueva aplicación"

### 2. Configurar la aplicación web

1. En la sección "Tipo de aplicación", selecciona "Aplicación Web" o "WebView"
2. En "URL de la aplicación", ingresa:
   ```
   https://efad5f4d-d814-4e6d-886e-d786af273b3e-00-2ov6r7zg15uqi.riker.replit.dev/verificacion-nfc
   ```
3. En "Nombre de la aplicación", escribe:
   ```
   VecinoXpress NFC
   ```
4. En "Paquete" o "Identificador", escribe:
   ```
   cl.vecinoxpress.pos
   ```

### 3. Configurar permisos

En la sección de permisos, asegúrate de activar:

- ✓ Internet
- ✓ Acceso a la red
- ✓ NFC
- ✓ Cámara
- ✓ Almacenamiento

### 4. Configurar apariencia

1. En "Ícono de la aplicación", puedes usar un ícono personalizado
   - Si no tienes uno, usa el generador de íconos integrado
   - Usa el color principal #2d219b (azul índigo)

2. En "Pantalla de carga" (Splash Screen):
   - Color de fondo: #2d219b
   - Mostrar spinner: Activado
   - Color del spinner: #ffffff
   - Duración: 2000ms (2 segundos)

3. En "Tema de la aplicación":
   - Color primario: #2d219b
   - Color de acento: #50e3c2
   - Tema oscuro: Opcional

### 5. Configurar orientación y otras opciones

1. Orientación: Selecciona "Portrait" (Vertical)
2. Versión de Android mínima: API 24 (Android 7.0)
3. Versión de Android objetivo: API 33 (Android 13)
4. Versión de la aplicación: 1.0.0
5. Código de versión: 1

### 6. Configurar ajustes avanzados

1. Habilitar JavaScript: Activado
2. Permitir acceso a archivos: Activado
3. Caché web: Activado
4. Permitir zoom: Activado
5. Abrir enlaces externos en navegador: Activado
6. Mantener la pantalla encendida: Activado

### 7. Generar y firmar la APK

1. Selecciona "Compilar APK" o "Generar APK"
2. Espera a que se complete el proceso de compilación
   - Esto puede tomar entre 1 y 5 minutos dependiendo de la tablet
3. Cuando termine, se mostrará la ubicación de la APK generada

### 8. Instalar la APK

1. Selecciona "Instalar" en la pantalla de finalización
   - O ve a la ubicación de la APK (normalmente en /sdcard/APKCreator/)
2. Si es necesario, permite la instalación desde fuentes desconocidas:
   - Ve a Configuración > Seguridad > Fuentes desconocidas
3. Completa la instalación siguiendo las indicaciones

## Configurar NFC después de instalar

1. Abre la aplicación VecinoXpress NFC que acabas de instalar
2. Inicia sesión con:
   - Usuario: `miadmin`
   - Contraseña: `miadmin123`
3. Si la aplicación solicita permisos de NFC, acéptalos
4. Si la aplicación no solicita permisos automáticamente:
   - Ve a Configuración > Aplicaciones > VecinoXpress NFC > Permisos
   - Activa el permiso de NFC y Cámara

## Solución de problemas comunes

### Error "No se puede compilar la APK"

- Verifica que tengas suficiente espacio de almacenamiento (al menos 500MB libres)
- Cierra otras aplicaciones para liberar memoria
- Reinicia APK Creator e intenta nuevamente

### Error "No se puede acceder a NFC"

- Verifica que NFC esté activado en la tablet:
  - Ve a Configuración > Conexiones > NFC
- Verifica que la aplicación tenga permisos de NFC:
  - Configuración > Aplicaciones > VecinoXpress NFC > Permisos

### Pantalla en blanco al abrir la aplicación

- Verifica tu conexión a internet
- Si el problema persiste, regresa a APK Creator y asegúrate de que la URL sea correcta
- Puedes intentar agregar esta configuración en APK Creator:
  - En la sección avanzada, habilita "Modo de compatibilidad WebView"
  - Activa "Manejo de errores offline"

## Verificación de la APK

Para comprobar si la aplicación funciona correctamente:

1. Abre la aplicación VecinoXpress NFC
2. Inicia sesión con las credenciales proporcionadas
3. Navega a la sección de verificación NFC
4. Acerca una cédula chilena al lector NFC
5. Verifica que la aplicación pueda leer y procesar la información