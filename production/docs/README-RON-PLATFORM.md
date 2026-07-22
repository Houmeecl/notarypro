
# VecinoXpress - Plataforma de Certificación RON

**Plataforma de Certificación Notarial Remota (RON) conforme a Ley 19.799**

## Descripción General

VecinoXpress RON es una plataforma completa de Certificación Notarial Remota (Remote Online Notarization) que permite realizar procesos de certificación de documentos con validez legal en conformidad con la Ley 19.799 sobre documentos electrónicos y firma electrónica.

La plataforma facilita:
- Verificación de identidad biométrica en tiempo real
- Videollamadas seguras entre certificador y cliente
- Gestión y firma digital de documentos
- Trazabilidad y registro legal completo de las sesiones

## Flujo de Trabajo RON

1. **Verificación de identidad**
   - Verificación biométrica facial
   - Verificación de documento de identidad
   - Preguntas de seguridad personalizadas

2. **Revisión de documentos**
   - Carga o creación de documentos para certificación
   - Revisión conjunta en tiempo real del contenido
   - Comentarios y anotaciones sobre el documento

3. **Proceso de firma**
   - Firma del cliente mediante firma manuscrita digitalizada
   - Verificación y firma del certificador (simple o eToken)
   - Sellado de tiempo y registro notarial

4. **Certificación y entrega**
   - Generación de documento certificado final
   - Envío automático por email a participantes
   - Registro en sistema de gestión documental

## Características técnicas

- Videoconferencia: Agora RTC para videollamada en tiempo real
- Seguridad: TLS/SSL, cifrado end-to-end en comunicaciones
- Verificación: Sistema biométrico avanzado con detección de vida
- Firmas: Soporte para firma simple, avanzada y cualificada
- Almacenamiento: Sistema seguro y redundante de documentos
- Cumplimiento legal: Conforme a Ley 19.799 y normativas complementarias

## Checklist de QA para pruebas

### 1. Verificación de videollamada
- [ ] Acceso a la sala RON con código válido
- [ ] Solicitud automática de permisos de cámara y micrófono
- [ ] Visualización correcta del video local
- [ ] Conexión exitosa con participante remoto
- [ ] Funcionalidad de los controles (mute, cámara, finalizar)

### 2. Verificación de identidad
- [ ] Captura correcta de imágenes para verificación
- [ ] Comunicación con API de verificación biométrica
- [ ] Validación de documento de identidad
- [ ] Comprobación de preguntas de seguridad
- [ ] Actualización del estado del sistema tras verificación

### 3. Gestión de documentos
- [ ] Carga de documentos PDF
- [ ] Creación de documentos desde plantillas
- [ ] Visualización correcta del contenido
- [ ] Navegación y edición de documentos
- [ ] Validación de metadatos y campos requeridos

### 4. Proceso de firma
- [ ] Apertura del panel de firma
- [ ] Funcionalidad de Signature Pad
- [ ] Almacenamiento correcto de la firma
- [ ] Visualización de firmas existentes
- [ ] Verificación de firmas (cliente/certificador)

### 5. Finalización y entrega
- [ ] Generación correcta del documento final
- [ ] Almacenamiento en sistema de gestión documental
- [ ] Envío automático por email
- [ ] Registro completo de datos en base de datos
- [ ] Generación de certificado y registro de auditoría

## Aspectos legales

La plataforma VecinoXpress RON cumple con los requisitos establecidos por:

- **Ley 19.799** sobre Documentos Electrónicos y Firma Electrónica
- **Decreto Supremo N° 181** sobre reglamentación de documentos y firma digital
- Requerimientos de **seguridad digital** y protección de datos personales
- Normativas sobre **verificación biométrica** y autenticación remota

---

© 2025 VecinoXpress - Soluciones Notariales Digitales
Plataforma desarrollada por NotaryPro | Todos los derechos reservados
