# Guía de Verificación de Funcionalidad NFC en Tablets Lenovo

Esta guía detalla los pasos para verificar que la funcionalidad NFC esté operando correctamente en las tablets Lenovo después de instalar la APK de VecinoXpress.

## Requisitos previos

- Tablet Lenovo con soporte NFC (Tab M10, M8 Plus o similar)
- APK de VecinoXpress instalada
- Cédula de identidad chilena con chip NFC
- Conexión a internet activa

## Verificación del hardware NFC

### 1. Verificar que el NFC esté activado en la tablet

1. Ve a **Configuración** > **Conexiones** o **Configuración** > **Dispositivos conectados**
2. Busca la opción **NFC** y asegúrate de que esté activada
3. Si no encuentras la opción NFC, es posible que la tablet no tenga esta característica

### 2. Prueba básica de NFC del sistema

1. Descarga e instala una aplicación básica de lectura NFC (como "NFC Tools") desde Google Play Store
2. Abre la aplicación
3. Acerca una tarjeta o cédula con NFC a la parte trasera de la tablet
4. La aplicación debe detectar la tarjeta y mostrar alguna información básica
5. Si esto funciona, significa que el hardware NFC de la tablet está operativo

## Verificación en la aplicación VecinoXpress

### 1. Acceder a la sección de prueba NFC

1. Abre la aplicación VecinoXpress
2. Inicia sesión con las credenciales de prueba:
   - Usuario: `miadmin`
   - Contraseña: `miadmin123`
3. Navega a la sección **Verificación NFC** o **Testing Real Mode**

### 2. Realizar la prueba de lectura NFC

1. En la sección de verificación, presiona el botón "Iniciar Verificación" o "Leer NFC"
2. La aplicación mostrará una pantalla indicando que acerques la cédula al lector NFC
3. Acerca una cédula chilena a la parte trasera de la tablet (donde se encuentra la antena NFC)
4. Mantén la cédula cerca sin movimiento durante algunos segundos
5. La aplicación debería mostrar mensajes de progreso:
   - "Estableciendo conexión con el chip..."
   - "Leyendo datos personales..."
   - "Verificando firma digital..."
   - "Procesando información..."

### 3. Verificar la información leída

Si la lectura es exitosa, la aplicación mostrará:

1. Datos básicos de la cédula:
   - RUT
   - Nombres
   - Apellidos
   - Fecha de nacimiento
   - Fecha de emisión del documento
   - Fecha de expiración
   - Sexo
   - Nacionalidad

2. Si está disponible, también mostrará:
   - Fotografía (en algunos modelos)
   - Número de documento
   - Número de serie del chip

### 4. Prueba completa del flujo de verificación

1. Intenta completar un flujo completo de verificación:
   - Inicia el proceso de verificación de identidad
   - Captura una foto del documento (frontal)
   - Captura una selfie
   - Realiza la lectura NFC
   - Completa el proceso de verificación

2. Al finalizar, verifica que la aplicación indique que la verificación fue exitosa

## Resolución de problemas

### Problema: No se detecta la cédula

**Posibles causas y soluciones:**

1. **NFC desactivado:**
   - Verifica que el NFC esté activado en la configuración de la tablet

2. **Posición incorrecta:**
   - La ubicación de la antena NFC varía según el modelo de tablet
   - Prueba diferentes áreas en la parte trasera de la tablet
   - Normalmente se encuentra en la parte central o superior trasera

3. **Interferencia:**
   - Retira cualquier funda o protector metálico
   - Aléjate de otros dispositivos electrónicos

4. **Cédula dañada:**
   - Intenta con otra cédula para descartar problemas con el chip

### Problema: La aplicación se cierra durante la lectura

**Posibles causas y soluciones:**

1. **Permisos insuficientes:**
   - Verifica que la aplicación tenga todos los permisos necesarios
   - Ve a Configuración > Aplicaciones > VecinoXpress > Permisos

2. **Memoria insuficiente:**
   - Cierra otras aplicaciones en segundo plano
   - Reinicia la tablet

3. **Problemas de la aplicación:**
   - Verifica si hay actualizaciones disponibles
   - Desinstala y vuelve a instalar la aplicación

### Problema: La lectura es incompleta o incorrecta

**Posibles causas y soluciones:**

1. **Movimiento durante la lectura:**
   - Mantén la cédula inmóvil durante todo el proceso
   - Usa una superficie estable

2. **Chip dañado:**
   - Si la cédula ha sufrido daños físicos, es posible que el chip no funcione correctamente
   - Prueba con otra cédula

3. **Problemas de implementación:**
   - Verifica si hay logs de error en la aplicación
   - Reporta el problema con el detalle de la cédula utilizada

## Registro de pruebas

Mantén un registro de las pruebas realizadas con el siguiente formato:

```
Fecha de prueba: [FECHA]
Modelo de tablet: [MODELO]
Versión de Android: [VERSIÓN]
Versión de la APK: [VERSIÓN]
Resultado: [EXITOSO/FALLIDO]
Notas: [OBSERVACIONES]
```

## Contacto para soporte

Si encuentras problemas persistentes con la funcionalidad NFC:

1. Captura capturas de pantalla del error
2. Anota el mensaje exacto del error
3. Registra el modelo exacto de la tablet Lenovo
4. Contacta al equipo de soporte técnico a través de la sección de soporte de la aplicación o envía un correo a [correo de soporte]