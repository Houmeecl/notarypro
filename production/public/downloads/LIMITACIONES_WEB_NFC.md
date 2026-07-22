# Limitaciones de NFC en Entorno Web para Tablets Lenovo

Este documento explica por qué la solución web tiene limitaciones para acceder a NFC en tablets Lenovo y por qué necesitamos una APK nativa.

## Problemas conocidos con Web NFC en tablets Lenovo

1. **Compatibilidad limitada**: 
   - Web NFC es una API experimental y no está completamente implementada en todos los navegadores
   - En tablets Lenovo, Chrome tiene soporte parcial que frecuentemente falla con las cédulas chilenas

2. **Permisos restringidos**:
   - Los navegadores limitan el acceso NFC por razones de seguridad
   - La lectura de cédulas chilenas requiere permisos de bajo nivel que los navegadores no suelen conceder

3. **Inconsistencias de detección**:
   - El sensor NFC en tablets Lenovo requiere una implementación específica
   - Chrome no puede acceder directamente al hardware NFC de manera confiable en estos dispositivos

4. **Intermitencia en la lectura**:
   - Incluso cuando el NFC es detectado, las lecturas son inconsistentes
   - Los datos de la cédula chilena requieren procesamiento específico que funciona mejor con acceso nativo

## Ventajas de la solución APK nativa

1. **Acceso directo al hardware**:
   - Una APK nativa puede acceder directamente al controlador NFC del dispositivo
   - Mayor velocidad y confiabilidad en la lectura de cédulas

2. **Soporte para modos específicos**:
   - Permite el modo específico requerido para cédulas chilenas (IsoDep)
   - Acceso completo a todas las capacidades del chip NFC

3. **Permisos de sistema**:
   - Solicitud clara y permanente de permisos NFC
   - No requiere solicitar permisos en cada sesión

4. **Optimizaciones específicas para Lenovo**:
   - La APK puede contener código específico optimizado para el hardware Lenovo
   - Gestión de energía mejorada para mantener el NFC activo

5. **Funcionamiento offline**:
   - La APK puede seguir funcionando incluso sin conexión a internet
   - Almacenamiento local de datos para procesar verificaciones

## Recomendaciones

Por estas razones, recomendamos **fuertemente** el uso de la APK nativa para cualquier implementación que requiera lectura NFC confiable de cédulas chilenas en tablets Lenovo.

La versión web debe considerarse únicamente como una solución de respaldo temporal y no para uso en producción.