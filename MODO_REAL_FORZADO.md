# Activación Permanente del Modo Real (Notarial)

Este documento describe los cambios realizados para eliminar completamente el modo demo y forzar el modo real en toda la aplicación.

## Cambios Realizados

1. **Modificación de la Página de Login**
   - Se eliminaron las credenciales de demostración
   - Se removió la pestaña "Acceso App", dejando solo "Acceso Notarial"
   - Se actualizó terminología a lenguaje notarial profesional
   - Se mejoraron mensajes de error/éxito con formato notarial formal

2. **Configuración del Detector de Modo**
   - Se modificó `deviceModeDetector.ts` para deshabilitar el modo demo
   - Se configuró el sistema para usar siempre DeviceMode.REAL
   - Se actualizaron todas las funciones para que siempre devuelvan modo real:
     - `checkIsDemoMode()` siempre devuelve `false`
     - `setDemoMode()` ahora fuerza modo real y registra advertencia
     - `resetToAutoMode()` siempre establece modo real
     - `updateConfig()` fuerza modo real independientemente de la configuración solicitada

3. **Inicialización del Modo Real**
   - Se agregó código de inicialización en `main.tsx` para forzar el modo real
   - Se eliminan las claves de localStorage que puedan estar forzando modo demo
   - Se establece explícitamente el modo real en la configuración

4. **Resolución de Conflictos**
   - Se cambió el puerto del servidor de 5000 a 5500 para resolver conflictos
   - Se creó script `start-app.sh` para iniciar la aplicación en el puerto correcto

## Información Técnica

### Configuración de Modo Real
La aplicación ahora usa esta configuración inmutable para forzar el modo real:

```javascript
{
  mode: DeviceMode.REAL,
  demoDeviceIds: [], // No hay dispositivos en modo demo
  realDeviceIds: ['*'], // Todos los dispositivos son reales
  forceDemoParameter: '', // Parámetro deshabilitado para modo demo
  forceRealParameter: 'real'
}
```

### Credenciales de Administrador
Las credenciales de administrador para acceder al sistema de verificación son:
- Username: `miadmin`
- Password: `miadmin123`

## Uso

Para iniciar la aplicación, ejecute:

```bash
./start-app.sh
```

La aplicación se iniciará en modo real forzado en el puerto 5500.