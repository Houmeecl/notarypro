# Instalación desde Pendrive en tablet Lenovo

Esta guía te ayudará a instalar la aplicación usando archivos desde un pendrive directamente en la tablet Lenovo.

## Paso 1: Preparar los archivos en el pendrive

1. Conecta el pendrive a tu computadora
2. Crea una carpeta llamada "VecinoXpress" en el pendrive
3. Descarga los siguientes archivos en esa carpeta:
   - La APK de VecinoXpress
   - Los archivos de configuración NFC

Puedes descargar la APK desde la URL:
```
https://efad5f4d-d814-4e6d-886e-d786af273b3e-00-2ov6r7zg15uqi.riker.replit.dev/downloads/vecinoxpress-nfc.apk
```

(Si la URL no funciona, copia manualmente los archivos del proyecto)

## Paso 2: Conectar el pendrive a la tablet

1. Usa un adaptador USB OTG si la tablet no tiene puerto USB completo
2. Conecta el pendrive a la tablet
3. Espera a que la tablet reconozca el pendrive
4. Si aparece un diálogo preguntando qué hacer, selecciona "Abrir con Administrador de archivos"

## Paso 3: Copiar e instalar la APK

1. Abre el administrador de archivos en la tablet
2. Navega hasta el pendrive
3. Accede a la carpeta "VecinoXpress"
4. Copia la APK a la memoria interna de la tablet:
   - Mantén presionado el archivo APK
   - Selecciona "Copiar"
   - Navega a la carpeta "Descargas" en la memoria interna
   - Pega el archivo

5. Instala la APK:
   - Toca en el archivo APK
   - Si aparece una advertencia de seguridad, ve a Configuración > Seguridad y activa "Fuentes desconocidas"
   - Confirma la instalación

## Paso 4: Copiar archivos de configuración (opcional)

Si hay archivos de configuración adicionales:

1. Cópialos a la carpeta adecuada en la tablet
2. Por lo general, esto sería en:
   ```
   /sdcard/Android/data/cl.vecinoxpress.pos/files/
   ```

## Paso 5: Configurar NFC

1. Abre la aplicación recién instalada
2. Inicia sesión con:
   - Usuario: **miadmin**
   - Contraseña: **miadmin123**
3. Ve a Configuración > NFC y verifica que los ajustes sean correctos

## Alternativa: Instalar directamente desde el navegador

Si prefieres no usar el pendrive, puedes:

1. Abrir Chrome en la tablet
2. Ir a la URL:
   ```
   https://efad5f4d-d814-4e6d-886e-d786af273b3e-00-2ov6r7zg15uqi.riker.replit.dev/verificacion-nfc
   ```
3. Iniciar sesión con las credenciales indicadas
4. Usar la aplicación directamente en el navegador
5. Para un acceso más rápido, agregar la página a la pantalla de inicio

## Solución de problemas

Si tienes problemas para instalar la APK:

1. Verifica que la tablet permita instalaciones desde fuentes desconocidas
2. Asegúrate de que la APK sea compatible con tu versión de Android
3. Si la APK no se instala, intenta usar una aplicación como "APK Installer" desde Google Play

Si tienes problemas con NFC:

1. Verifica que NFC esté activado en la tablet
2. Consulta la guía SOLUCIONAR_PROBLEMAS_NFC_LENOVO.md incluida en el pendrive