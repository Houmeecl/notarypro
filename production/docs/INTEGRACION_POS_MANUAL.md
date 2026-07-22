# Manual de Integración y Uso del Sistema POS de VecinoXpress

Este documento describe la integración y funcionamiento del sistema POS (Point of Sale) de VecinoXpress, diseñado para funcionar en tablets Lenovo con soporte NFC.

## Componentes del Sistema POS

El sistema POS de VecinoXpress está compuesto por:

1. **Hardware**:
   - Tablet Lenovo con NFC
   - Opcionalmente: Impresora térmica Bluetooth para recibos
   - Opcionalmente: Terminal de pago (si no se usa el propio sistema integrado)

2. **Software**:
   - Aplicación VecinoXpress en su versión para tablets
   - Módulos de gestión de sesiones POS
   - Sistema de verificación de identidad con NFC
   - Procesamiento de pagos con Tuu Payments y/o Mercado Pago

## Funcionalidades Principales

### 1. Gestión de Dispositivos POS

La aplicación permite registrar y gestionar dispositivos POS (tablets) desde el panel de administración:

- **Registro de dispositivos**: Cada dispositivo tiene un código único (ej. POS-001)
- **Activación/desactivación**: Control de dispositivos activos
- **Monitoreo**: Seguimiento de actividad y estado de cada dispositivo

### 2. Gestión de Sesiones

Cada vez que un operador utiliza la tablet, debe abrir una sesión:

- **Apertura de sesión**: Se registra el operador, hora de inicio y monto inicial
- **Operaciones durante la sesión**: Todas las transacciones quedan vinculadas a la sesión
- **Cierre de sesión**: Se registra hora de cierre, detalles de ventas y totales

### 3. Procesamiento de Documentos

El sistema permite:

- Selección de documentos desde el catálogo
- Personalización de documentos con datos del cliente
- Verificación de identidad mediante NFC
- Firma digital de documentos
- Emisión y envío de documentos firmados

### 4. Procesamiento de Pagos

VecinoXpress POS incorpora dos opciones de procesamiento de pagos:

- **Tuu Payments**: Sistema principal para pagos con tarjeta de crédito/débito
- **Mercado Pago**: Integración alternativa para pagos móviles y tarjetas

## Flujo de Trabajo Típico

1. **Inicio de sesión POS**:
   - El operador inicia la aplicación
   - Inicia sesión con sus credenciales
   - Abre una sesión POS especificando monto inicial y notas

2. **Atención al cliente**:
   - Selección del servicio o documento requerido
   - Captura de datos del cliente
   - Verificación de identidad con NFC (lectura de cédula)
   - Personalización del documento

3. **Procesamiento del pago**:
   - Selección del método de pago (Tuu o Mercado Pago)
   - Procesamiento de la transacción
   - Confirmación del pago

4. **Finalización del servicio**:
   - Emisión del documento firmado
   - Envío por correo electrónico al cliente
   - Impresión de recibo (opcional)
   - Registro de la transacción en el sistema

5. **Cierre de sesión**:
   - Al finalizar el día o turno, cierre de la sesión
   - Conciliación de pagos y servicios prestados
   - Generación de reporte de cierre

## Guía de Integración Técnica

### Componentes Clave del Sistema POS

Los principales archivos relacionados con el sistema POS son:

1. **Páginas principales**:
   - `client/src/pages/pos-menu.tsx`: Menú principal del sistema POS
   - `client/src/pages/pos-session.tsx`: Gestión de sesiones POS
   - `client/src/pages/register-pos-device.tsx`: Registro de dispositivos
   - `client/src/pages/real-pos-payment.tsx`: Procesamiento de pagos reales

2. **Componentes**:
   - `client/src/components/payments/TuuPOSPayment.tsx`: Integración con Tuu Payments
   - `client/src/components/identity/NFCIdentityReader.tsx`: Lector de identidad con NFC

3. **APIs de backend**:
   - `server/pos-management-routes.ts`: Gestión de dispositivos y sesiones
   - `server/tuu-payment-routes.ts`: Procesamiento de pagos con Tuu

### Integración de NFC

Para integrar la funcionalidad NFC con el sistema POS:

```typescript
// Ejemplo de cómo utilizar el lector NFC en un componente POS
import { readCedulaChilena, NFCReadStatus } from '@/lib/nfc-reader';

// En tu componente:
async function verificarIdentidad() {
  try {
    setEstado('leyendo');
    
    // Callback para recibir actualizaciones del estado de la lectura
    const handleStatusChange = (status: NFCReadStatus, message?: string) => {
      setEstadoNFC(status);
      setMensajeNFC(message || '');
    };
    
    // Iniciar lectura NFC - esta función gestiona todos los tipos de lectores
    const datosCedula = await readCedulaChilena(handleStatusChange);
    
    // Procesar los datos obtenidos
    if (datosCedula) {
      // Validar identidad con los datos obtenidos
      setClienteVerificado(true);
      setDatosCliente(datosCedula);
    }
  } catch (error) {
    console.error('Error en verificación:', error);
    setEstado('error');
  }
}
```

### Integración de Pagos con Tuu

Para integrar pagos con el terminal POS de Tuu:

```typescript
// Ejemplo de cómo procesar un pago con Tuu Payments
import { procesarPagoTuu } from '@/lib/tuu-payments';

// En tu componente:
async function procesarPago(monto: number) {
  try {
    setEstadoPago('procesando');
    
    // Datos de la transacción
    const datosTransaccion = {
      monto,
      moneda: 'CLP',
      descripcion: 'Servicio de certificación de documento',
      referencia: `DOC-${generarReferencia()}`,
      datosCliente: {
        nombre: datosCliente.nombres,
        apellido: datosCliente.apellidos,
        rut: datosCliente.rut
      }
    };
    
    // Procesar el pago - utiliza el SDK de Tuu
    const resultado = await procesarPagoTuu(datosTransaccion);
    
    if (resultado.exitoso) {
      // Registrar la transacción en el sistema
      await registrarTransaccion({
        sesionId: sesionActual.id,
        monto,
        tipo: 'documento',
        referencia: datosTransaccion.referencia,
        detalles: {
          idTransaccion: resultado.idTransaccion,
          metodo: 'Tuu POS',
          estado: 'completado'
        }
      });
      
      setEstadoPago('completado');
      return true;
    } else {
      setEstadoPago('error');
      setErrorPago(resultado.mensaje || 'Error desconocido');
      return false;
    }
  } catch (error) {
    console.error('Error en pago:', error);
    setEstadoPago('error');
    setErrorPago(error instanceof Error ? error.message : 'Error desconocido');
    return false;
  }
}
```

## Configuración del Sistema POS

### Tabla de Comisiones

El sistema maneja automáticamente las comisiones para los socios que operan los POS:

| Tipo de Servicio | Comisión para el Socio | Comisión VecinoXpress |
|------------------|------------------------|------------------------|
| Documentos básicos | 60% | 40% |
| Certificaciones | 50% | 50% |
| Verificaciones | 70% | 30% |
| Trámites legales | 45% | 55% |

### Configuración de Mercado Pago

Para utilizar Mercado Pago, asegúrate de configurar estas variables de entorno:

```
MERCADOPAGO_ACCESS_TOKEN=tu_token_de_acceso
MERCADOPAGO_PUBLIC_KEY=tu_clave_publica
```

### Configuración de Tuu Payments

Para la integración con Tuu Payments:

```
POS_PAYMENT_API_KEY=tu_clave_api_de_tuu
```

## Resolución de Problemas

### Problemas comunes del POS

1. **Error de conexión con el terminal**:
   - Verifica que el Bluetooth esté activado
   - Reinicia el terminal de pago
   - Reinicia la aplicación VecinoXpress

2. **Error de lectura NFC**:
   - Verifica que el NFC esté activado en la tablet
   - Posiciona correctamente la cédula sobre el área NFC
   - Asegúrate de que la cédula tenga chip NFC funcionando

3. **Transacción rechazada**:
   - Verifica la conexión a internet
   - Confirma que la tarjeta tenga fondos disponibles
   - Revisa los logs de Tuu Payments para detalles específicos

4. **Error al guardar transacción**:
   - Verifica la conexión con el servidor
   - Comprueba que la sesión POS esté abierta y activa
   - Sincroniza manualmente si es necesario

## Notas sobre Implementación Técnica

1. **Modo sin conexión**:
   - La aplicación puede funcionar temporalmente sin conexión
   - Los datos se almacenan localmente y se sincronizan cuando hay conexión
   - La verificación NFC funciona sin necesidad de conexión a internet

2. **Seguridad**:
   - Todas las transacciones incluyen logs detallados para auditoría
   - Las sesiones de usuario tienen tiempo de expiración
   - La información sensible no se almacena localmente

3. **Rendimiento**:
   - La aplicación está optimizada para tablets Lenovo
   - Se recomienda reiniciar la aplicación una vez al día
   - El cierre correcto de las sesiones es fundamental para la integridad de los datos

---

Para soporte técnico adicional, contactar al equipo de desarrollo de VecinoXpress.