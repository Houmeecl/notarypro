# Guía de implementación: Validación de identidad con GetAPI.cl

## Introducción

Esta guía explica cómo implementar la validación de identidad en tu aplicación utilizando los servicios de GetAPI.cl a través de nuestra plataforma NotaryPro.

La validación de identidad es un componente crítico para el cumplimiento de la Ley 19.799 sobre documentos electrónicos y firma electrónica, especialmente cuando se requiere una verificación robusta de la identidad de los firmantes.

## ¿Qué es GetAPI.cl?

GetAPI.cl es un proveedor chileno especializado en servicios de validación de identidad y verificación de documentos. Su API permite:

- Verificar la identidad de una persona contra registros oficiales
- Validar documentos de identificación (cédula de identidad, pasaporte)
- Realizar verificación biométrica mediante comparación de rostros
- Extraer datos automáticamente desde documentos de identidad

## Tipos de validación disponibles

1. **Validación básica de identidad**
   - Verifica que el RUT corresponda a una persona real
   - Comprueba que el nombre y apellido coincidan con el RUT
   - Confirma si la persona está viva o fallecida

2. **Validación con documento**
   - Verifica la validez del documento de identidad
   - Comprueba que la información del documento coincida con los registros
   - Extrae automáticamente información del documento

3. **Validación biométrica**
   - Compara la foto del documento con una selfie del usuario
   - Detecta fraudes como imágenes falsas o foto de una foto

## Implementación en el frontend

### 1. Validación básica de identidad

```typescript
import { verifyIdentity } from '@/lib/getapi-validator';

// Función para verificar identidad
async function verificarIdentidad() {
  try {
    const result = await verifyIdentity({
      nombre: "Juan",
      apellido: "Pérez",
      rut: "12.345.678-9",
      fechaNacimiento: "1980-01-01"
    }, {
      requiredScore: 80,
      verifyLivingStatus: true,
      strictMode: false
    });
    
    if (result.verified) {
      // Identidad verificada correctamente
      console.log(`Verificación exitosa con puntaje: ${result.score}`);
    } else {
      // Identidad no verificada
      console.log(`Verificación fallida: ${result.message}`);
    }
  } catch (error) {
    console.error("Error en la verificación:", error);
  }
}
```

### 2. Validación con documento e imagen

```typescript
import { verifyIdentityWithDocument } from '@/lib/getapi-validator';

// Función para capturar imagen del documento y verificar
async function capturarYValidarDocumento() {
  // Obtener la imagen en base64 (desde una cámara web o input de archivo)
  const documentoBase64 = await capturarImagen(); // Función personalizada
  const selfieBase64 = await capturarSelfie(); // Opcional
  
  try {
    const result = await verifyIdentityWithDocument(
      {
        nombre: "Juan",
        apellido: "Pérez",
        rut: "12.345.678-9"
      },
      documentoBase64,
      selfieBase64 // Opcional, para validación biométrica
    );
    
    if (result.verified) {
      // Documento válido y coincide con la identidad
      console.log(`Documento verificado con puntaje: ${result.score}`);
      console.log(`Detalles: ${JSON.stringify(result.details)}`);
    } else {
      // Documento no válido o no coincide
      console.log(`Verificación fallida: ${result.message}`);
    }
  } catch (error) {
    console.error("Error en la verificación del documento:", error);
  }
}
```

## Implementación en el backend

También puedes utilizar nuestros endpoints REST para integrar la verificación en tu backend:

### 1. Validación básica de identidad

```bash
POST /api/identity/verify
Content-Type: application/json
Authorization: Bearer TU_TOKEN_JWT

{
  "person": {
    "nombre": "Juan",
    "apellido": "Pérez",
    "rut": "12.345.678-9",
    "fechaNacimiento": "1980-01-01",
    "numeroCelular": "+56912345678",
    "email": "juan@ejemplo.cl"
  },
  "options": {
    "strictMode": false,
    "requiredScore": 80,
    "verifyLivingStatus": true
  }
}
```

### 2. Validación con documento

```bash
POST /api/identity/verify-document
Content-Type: application/json
Authorization: Bearer TU_TOKEN_JWT

{
  "person": {
    "nombre": "Juan",
    "apellido": "Pérez",
    "rut": "12.345.678-9"
  },
  "document": {
    "image": "BASE64_DE_LA_IMAGEN"
  },
  "selfie": {
    "image": "BASE64_DE_LA_SELFIE"  // Opcional
  }
}
```

### 3. Extracción de información del documento

```bash
POST /api/identity/extract-document
Content-Type: application/json
Authorization: Bearer TU_TOKEN_JWT

{
  "documentImage": "BASE64_DE_LA_IMAGEN"
}
```

## Mejores prácticas

1. **Privacidad de datos**:
   - Nunca almacenes imágenes de documentos o selfies más tiempo del necesario
   - Informa claramente a los usuarios sobre el procesamiento de sus datos
   - Cumple con la Ley de Protección de Datos Personales de Chile

2. **Experiencia de usuario**:
   - Guía al usuario sobre cómo tomar correctamente las fotos (buena iluminación, sin reflejos)
   - Proporciona instrucciones claras durante el proceso de verificación
   - Incluye mensajes de error específicos y soluciones cuando la verificación falla

3. **Seguridad**:
   - Utiliza siempre HTTPS para las comunicaciones
   - Almacena los resultados de verificación de forma segura
   - Implementa límites de intentos para prevenir abusos

## Código de ejemplo completo

Puedes encontrar ejemplos completos de implementación en nuestro repositorio:
https://github.com/notarypro/identity-verification-examples

## Recursos adicionales

- [Documentación oficial de GetAPI.cl](https://www.getapi.cl/identity-validation/)
- [Integración con firmas electrónicas avanzadas](https://developers.tuu.cl/docs/firmas-avanzadas)
- [Guía sobre cumplimiento con Ley 19.799](https://developers.tuu.cl/docs/ley-19799)

Para más información o soporte, contacta a nuestro equipo de desarrollo en developers@tuu.cl.

---

© 2025 NotaryPro - Última actualización: 2 de mayo, 2025