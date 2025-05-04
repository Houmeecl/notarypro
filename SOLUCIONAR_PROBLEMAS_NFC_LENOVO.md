# Solución de problemas NFC en tablets Lenovo

Si tienes dificultades para que el NFC funcione en tu tablet Lenovo, este documento te ayudará a solucionar los problemas más comunes.

## Problemas básicos

### 1. NFC no activado correctamente

**Problema**: La tablet muestra que NFC está activado, pero no lee las tarjetas.

**Soluciones**:
- Desactiva y vuelve a activar NFC
- Reinicia la tablet completamente
- Verifica que no esté en modo avión
- Busca "NFC" en la configuración y asegúrate de que todas las opciones relacionadas estén activadas

### 2. Problemas con la aplicación

**Problema**: La aplicación no detecta NFC aunque otras apps sí lo hagan.

**Soluciones**:
- Verifica que la aplicación tenga permisos de NFC:
  - Configuración > Aplicaciones > [Aplicación] > Permisos > NFC
- Desinstala y vuelve a instalar la aplicación
- Borra la caché de la aplicación:
  - Configuración > Aplicaciones > [Aplicación] > Almacenamiento > Borrar caché

### 3. Problemas con Chrome

**Problema**: La API web NFC no funciona en Chrome.

**Soluciones**:
- Actualiza Chrome a la última versión
- Habilita la función experimental: 
  - Abre Chrome, navega a `chrome://flags`
  - Busca "NFC" y habilita todas las opciones relacionadas
  - Reinicia Chrome

## Problemas específicos de Lenovo

### 1. Problemas de hardware NFC

**Problema**: El hardware NFC está fallando o desactivado a nivel de sistema.

**Soluciones**:
- Prueba con una aplicación básica como "NFC Tools" para verificar si el hardware funciona
- En algunos modelos Lenovo, hay una opción adicional en:
  - Configuración > Conexiones > Más opciones de conexión > NFC
- Verifica que la tablet no esté en modo de ahorro de energía extremo, ya que esto puede desactivar NFC

### 2. Problemas con la posición del lector

**Problema**: No encuentras la posición correcta del lector NFC.

**Soluciones**:
- Modelo Tab M10: El lector está generalmente en la parte central trasera
- Modelo Tab P11/P12: El lector está en la parte superior trasera, cerca de la cámara
- Prueba moviendo la tarjeta lentamente por toda la parte trasera
- Quita cualquier funda o protector

### 3. Problemas con la intensidad de la señal

**Problema**: El lector detecta la tarjeta pero pierde la conexión rápidamente.

**Soluciones**:
- Mantén la tarjeta inmóvil durante toda la lectura
- Asegúrate de que la batería esté por encima del 15%
- Desactiva el Bluetooth mientras usas NFC
- Evita usar NFC cerca de otros dispositivos electrónicos

## Soluciones avanzadas

### 1. Reinicio del sistema NFC

Si ninguna de las soluciones anteriores funciona, puedes intentar reiniciar el sistema NFC:

```
1. Marca *#*#2222#*#* en la aplicación de teléfono
2. Selecciona "Service mode"
3. Busca la opción "NFC"
4. Selecciona "Reset" o "Reiniciar"
```

(Este código puede variar según el modelo)

### 2. Actualizar drivers NFC

En algunos casos, los drivers NFC pueden estar desactualizados:

1. Ve a la página de soporte de Lenovo para tu modelo específico
2. Busca actualizaciones de firmware que mencionen "NFC"
3. Sigue las instrucciones para actualizar

### 3. Modo de compatibilidad

Si tu tablet es antigua, intenta estas opciones:

1. Instala la aplicación "NFC Enabler" desde Google Play
2. Ejecuta la aplicación y sigue las instrucciones
3. Esto puede ayudar a habilitar NFC en tablets con software antiguo

## Opciones alternativas si NFC no funciona

Si después de intentar todas las soluciones anteriores, el NFC sigue sin funcionar, considera estas alternativas:

### 1. Usar una aplicación alternativa

Algunas aplicaciones tienen mejor compatibilidad con NFC:
- "NFC Tools Pro"
- "NFC Reader"
- "Tag Info"

### 2. Usar un lector NFC externo

Si el NFC interno no funciona, puedes usar un lector NFC USB:
1. Conecta un lector NFC USB compatible con OTG a tu tablet
2. Instala el driver correspondiente
3. Usa una aplicación compatible con lectores externos

### 3. Alternativa a NFC: Escaneo de código QR

Si el NFC no funciona, considera usar códigos QR como alternativa:
1. Nuestra aplicación también admite verificación por código QR
2. Ve a la sección "Verificación por QR" en la aplicación
3. Sigue las instrucciones para escanear el código QR en lugar de usar NFC