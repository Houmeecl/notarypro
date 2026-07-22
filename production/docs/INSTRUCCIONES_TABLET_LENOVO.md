# Instrucciones para usar VecinoXpress en Tablet Lenovo

## Opción 1: Acceder a la aplicación web directamente

Si estás leyendo esto en la tablet Lenovo, puedes acceder a la aplicación web directamente:

1. Abre el navegador Chrome en la tablet Lenovo
2. Accede a la aplicación web en: https://app.vecinoxpress.cl
3. Inicia sesión con tus credenciales:
   - Usuario: `miadmin`
   - Contraseña: `miadmin123`

## Opción 2: Instalar la APK desde una fuente externa

Para instalar la APK en la tablet Lenovo:

1. Desde la tablet, abre el navegador y ve a la siguiente URL:
   https://drive.google.com/file/d/xxxxxxxxxxxx/view?usp=sharing
   (Reemplaza los xxxxxxxxxxxx con el ID del archivo compartido)

2. Descarga la APK

3. Una vez descargada, presiona sobre el archivo para instalarla

4. Si aparece una advertencia de seguridad, deberás permitir la instalación de fuentes desconocidas:
   - Ve a Configuración > Seguridad
   - Activa "Fuentes desconocidas"
   - Vuelve a intentar la instalación

## Opción 3: Generar la APK en un equipo de desarrollo

Para generar la APK en un equipo de desarrollo:

1. Clona el repositorio en un equipo con Android Studio instalado

2. Ejecuta los siguientes comandos:
   ```bash
   npm install
   npm run build
   npx cap sync android
   ```

3. Abre la carpeta "android" con Android Studio

4. Genera la APK desde Android Studio:
   Build > Build Bundle(s) / APK(s) > Build APK(s)

5. Transfiere la APK generada a la tablet Lenovo vía USB o servicio de almacenamiento en la nube

## Configuración para usar NFC en el navegador

Si accedes a través del navegador, para usar NFC:

1. Asegúrate de usar Chrome para Android (versión 89 o superior)

2. Activa el NFC en la tablet:
   - Desliza hacia abajo desde la parte superior de la pantalla
   - Presiona y mantén presionado el ícono NFC para ir a configuración
   - Activa NFC

3. En la aplicación web, cuando te solicite leer una cédula:
   - Aparecerá una solicitud de permiso para usar NFC
   - Acepta el permiso
   - Acerca la cédula a la parte trasera de la tablet (donde está la antena NFC)

## Solución de problemas

Si encuentras problemas con NFC:

1. **NFC no detecta la cédula**:
   - Asegúrate de que el NFC esté activado
   - Prueba diferentes posiciones de la cédula en la tablet
   - Intenta mover la cédula lentamente alrededor de la parte trasera para encontrar la ubicación del lector NFC

2. **Error "No se pudo leer la información del chip NFC"**:
   - Verifica que la cédula tenga chip NFC (las cédulas chilenas emitidas después de 2013 lo tienen)
   - Asegúrate de que el chip no esté dañado
   - Intenta con otra cédula para verificar si el problema es la cédula o la tablet

3. **Permiso NFC denegado**:
   - Reinicia el navegador
   - Ve a Configuración > Aplicaciones > Chrome > Permisos
   - Activa el permiso NFC