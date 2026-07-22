const fs = require('fs');
const path = require('path');
const { mdToPdf } = require('md-to-pdf');

async function generateCodeSourcePDF() {
  console.log('Generando documentación del código fuente...');
  
  // Contenido del markdown
  const markdown = `
# Documentación Técnica Completa - NotaryPro / VecinosExpress POS

## Información del Desarrollador

**Nombre del Proyecto:** NotaryPro / VecinosExpress POS
**Versión:** 3.0.1
**Fecha de Documentación:** ${new Date().toLocaleDateString()}
**Desarrollado por:** Equipo de Desarrollo VecinosExpress
**Contacto:** desarrollo@notarypro.cl / soporte@vecinosexpress.cl
**Desarrollador Principal:** Eduardo Venegas
**Licencia:** Propietaria

## Estructura General del Proyecto

El proyecto VecinosExpress POS es una plataforma de notarización digital y servicios legales que sigue una arquitectura cliente-servidor con un frontend en React y TypeScript y un backend en Node.js con Express.

### Tecnologías Principales

- **Frontend:** React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend:** Node.js, Express
- **Base de Datos:** PostgreSQL con Drizzle ORM
- **Autenticación:** Passport.js con sesiones
- **Servicios Externos:** PayPal, Stripe, MercadoPago, Agora, SendGrid, GetAPI.cl

## Componentes Principales del Sistema

El sistema está organizado en varios componentes clave que trabajan juntos:

1. **Interfaz de Usuario (React)**
   - Páginas de usuario, certificador, abogado y admin
   - Componentes reutilizables
   - Gestión de estado con React Query

2. **API Backend (Express)**
   - Rutas para autenticación y gestión de usuarios
   - Rutas para gestión documental
   - Rutas para verificación de identidad
   - Rutas para procesamiento de pagos

3. **Base de Datos (PostgreSQL)**
   - Modelos definidos con Drizzle ORM
   - Tablas para usuarios, documentos, verificaciones, etc.

4. **Servicios Externos**
   - Integración con pasarelas de pago
   - Servicios de verificación de identidad
   - Videollamadas para notarización remota

## Archivos Clave y sus Interacciones

### Frontend

#### Estructura de Carpetas
\`\`\`
client/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── hooks/          # Hooks personalizados
│   ├── lib/            # Funciones de utilidad
│   ├── pages/          # Páginas de la aplicación
│   └── App.tsx         # Punto de entrada principal
\`\`\`

#### Archivos Clave del Frontend

1. **client/src/App.tsx**
   - Componente principal que configura las rutas y proveedores de contexto
   - Maneja la inicialización de la aplicación y establece el contexto de autenticación

2. **client/src/pages/landing-page.tsx**
   - Página principal del sitio
   - Incluye enlaces a la documentación técnica
   - Activa el modo de funcionalidad real

3. **client/src/pages/documentacion-page.tsx**
   - Página dedicada para acceder a la documentación técnica
   - Permite descargar la documentación en diferentes formatos

4. **client/src/components/landing/Header.tsx**
   - Barra de navegación principal para la página de inicio
   - Contiene enlaces a las principales secciones del sitio

5. **client/src/hooks/use-auth.ts**
   - Hook personalizado para gestionar la autenticación
   - Proporciona información del usuario actual y métodos para iniciar/cerrar sesión

6. **client/src/lib/nfc-reader.ts**
   - Clase NFCReader para interactuar con dispositivos NFC
   - Implementa métodos para leer cédulas de identidad chilenas

### Backend

#### Estructura de Carpetas
\`\`\`
server/
├── auth.ts            # Configuración de autenticación
├── contract-routes.ts # Rutas para gestión de contratos
├── db.ts              # Conexión a la base de datos
├── document-*.ts      # Rutas y servicios para documentos
├── getapi-routes.ts   # Rutas para verificación de identidad
├── index.ts           # Punto de entrada del servidor
├── ron-routes.ts      # Rutas para notarización remota
└── services/          # Servicios del backend
\`\`\`

#### Archivos Clave del Backend

1. **server/index.ts**
   - Punto de entrada principal del servidor
   - Configura middleware, rutas y servicios
   - Inicia el servidor HTTP

2. **server/auth.ts**
   - Configuración de autenticación con Passport.js
   - Definición de estrategias de autenticación
   - Funciones para hashear y comparar contraseñas

3. **server/db.ts**
   - Conexión a la base de datos PostgreSQL
   - Exporta instancia de Drizzle ORM
   - Incluye funciones para operaciones comunes de base de datos

4. **server/document-management-routes.ts**
   - Rutas para la gestión documental
   - Manejo de subida, descarga y verificación de documentos
   - Integración con el sistema de contratos

5. **server/getapi-routes.ts**
   - Rutas para la verificación de identidad
   - Integración con GetAPI.cl para validación de documentos

### Modelos y Schema (Drizzle ORM)

1. **shared/schema.ts**
   - Definición de todos los modelos de la base de datos
   - Relaciones entre las tablas
   - Tipos de inserción y selección

## Flujos Principales del Sistema

### Flujo de Autenticación

1. El usuario ingresa credenciales en la página de login
2. El frontend envía una solicitud POST a '/api/auth/login'
3. El backend valida las credenciales con Passport.js
4. Si son válidas, se crea una sesión y se devuelve información del usuario
5. El frontend almacena el estado de autenticación con useAuth hook

### Flujo de Notarización Remota (RON)

1. El usuario inicia una sesión RON desde el dashboard
2. El sistema genera tokens para videoconferencia con Agora
3. Se establece una conexión entre el certificador y el cliente
4. El certificador verifica la identidad del cliente
5. El cliente firma digitalmente el documento
6. El sistema registra la firma y sella el documento

### Flujo de Verificación de Identidad

1. El usuario inicia el proceso de verificación
2. El sistema captura datos biométricos (foto, NFC)
3. Se envían estos datos a GetAPI.cl para validación
4. El sistema almacena el resultado de la verificación
5. Se notifica al usuario sobre el resultado

## Integración con Servicios Externos

### Pasarelas de Pago
- **PayPal:** Integrado para pagos internacionales
- **Stripe:** Procesamiento de pagos con tarjeta
- **MercadoPago:** Pagos locales en Chile

### Verificación de Identidad
- **GetAPI.cl:** Validación de identidad chilena

### Comunicación en Tiempo Real
- **Agora:** Videoconferencias para notarización remota

## Consideraciones de Seguridad

- Autenticación basada en sesiones con cookies seguras
- Contraseñas hasheadas con bcrypt
- Validación de datos de entrada con Zod
- HTTPS obligatorio en producción
- Verificación en tiempo real de identidad
- Registros de auditoría para todas las acciones críticas

## Conclusiones

El código fuente de VecinosExpress POS implementa una solución completa para notarización digital y servicios legales, cumpliendo con todas las normativas de la Ley 19.799 para servicios digitales en Chile. El sistema está diseñado con una arquitectura escalable y modular, permitiendo fácil mantenimiento y extensión.

La documentación técnica completa está disponible en formatos HTML, PDF, DOCX y Markdown para facilitar su consulta por diferentes miembros del equipo de desarrollo.

---

# MANUAL COMPLETO DE NOTARYPRO

## 1. Introducción a NotaryPro

NotaryPro es una plataforma integral para la notarización digital y servicios legales en Chile, diseñada para cumplir con todas las normativas de la Ley 19.799 sobre documentos electrónicos y firma electrónica avanzada.

### 1.1 Propósito del Sistema

El sistema NotaryPro tiene como propósito principal:
- Facilitar la notarización remota de documentos (RON - Remote Online Notarization)
- Proporcionar verificación de identidad biométrica
- Gestionar documentos legales con validez jurídica
- Integrar servicios de firma electrónica avanzada
- Ofrecer trazabilidad completa de todas las operaciones

### 1.2 Enlaces Principales

- **Sitio Web Principal**: [https://notarypro.cl](https://notarypro.cl)
- **Panel de Administración**: [https://notarypro.cl/admin-dashboard](https://notarypro.cl/admin-dashboard)
- **Documentación Técnica**: [https://notarypro.cl/documentacion-tecnica.html](https://notarypro.cl/documentacion-tecnica.html)
- **Centro de Ayuda**: [https://notarypro.cl/ayuda](https://notarypro.cl/ayuda)
- **Videoconferencia RON**: [https://notarypro.cl/ron-session](https://notarypro.cl/ron-session)

## 2. Arquitectura del Sistema

### 2.1 Diagrama de Arquitectura

La arquitectura de NotaryPro sigue un modelo cliente-servidor con múltiples capas:

\`\`\`
+-------------------+     +-------------------+     +-------------------+
| Capa de           |     | Capa de           |     | Capa de           |
| Presentación      |<--->| Aplicación        |<--->| Datos             |
| (React/TypeScript)|     | (Node.js/Express) |     | (PostgreSQL)      |
+-------------------+     +-------------------+     +-------------------+
         ^                         ^                         ^
         |                         |                         |
         v                         v                         v
+-------------------+     +-------------------+     +-------------------+
| Servicios de      |     | Servicios de      |     | Servicios de      |
| UI/UX             |     | Negocio           |     | Persistencia      |
+-------------------+     +-------------------+     +-------------------+
\`\`\`

### 2.2 Componentes Principales

- **Frontend (React/TypeScript)**: Interfaz de usuario responsive
- **Backend (Node.js/Express)**: API RESTful y lógica de negocio
- **Base de Datos (PostgreSQL)**: Almacenamiento persistente
- **Servicios de Identidad**: Verificación biométrica y NFC
- **Servicios de Videoconferencia**: Para sesiones RON
- **Sistema de Firma Digital**: Compatible con firma electrónica avanzada chilena

## 3. Módulos Funcionales

### 3.1 Módulo de Verificación de Identidad

Este módulo permite verificar la identidad de los usuarios mediante:
- Captura y análisis de documento de identidad (cédula chilena)
- Lectura NFC de cédulas de identidad (cuando el dispositivo lo soporta)
- Verificación biométrica facial (comparación con foto del documento)
- Verificación mediante servicios de GetAPI.cl

**Enlaces:**
- [Verificación Simple](https://notarypro.cl/verificacion-selfie-simple)
- [Verificación NFC](https://notarypro.cl/verificacion-nfc-fixed)
- [Verificación ID](https://notarypro.cl/readid-verification)

### 3.2 Módulo de Gestión Documental

Proporciona herramientas para:
- Creación de documentos a partir de plantillas
- Subida de documentos existentes
- Versionado de documentos
- Categorización y etiquetado
- Búsqueda avanzada
- Verificación de autenticidad mediante códigos QR

**Enlaces:**
- [Explorador de Documentos](https://notarypro.cl/document-explorer)
- [Gestor de Plantillas](https://notarypro.cl/document-templates)
- [Verificación de Documentos](https://notarypro.cl/verificar-documento)

### 3.3 Módulo de Firma Digital

Permite la firma de documentos con distintos niveles de seguridad:
- Firma simple (trazo digital)
- Firma con certificado digital simple
- Firma electrónica avanzada (compatible con Ley 19.799)
- Firma con verificación en tiempo real

**Enlaces:**
- [Firma Móvil](https://notarypro.cl/sign-mobile)
- [Signature Demo](https://notarypro.cl/signature-demo)
- [Firmar Documento](https://notarypro.cl/document-sign)

### 3.4 Módulo de Notarización Remota (RON)

Permite realizar sesiones de notarización remota con las siguientes características:
- Videoconferencia en tiempo real
- Verificación de identidad del firmante
- Registro de la sesión (video y metadatos)
- Firma del documento durante la sesión
- Expedición de certificado de notarización

**Enlaces:**
- [RON Platform](https://notarypro.cl/ron-platform)
- [RON Session](https://notarypro.cl/ron-session)
- [Certificación por Video](https://notarypro.cl/certificacion-por-video)

### 3.5 Módulo de Pagos

Integra múltiples pasarelas de pago:
- Stripe para pagos con tarjeta internacional
- PayPal para pagos internacionales
- MercadoPago para pagos locales en Chile

**Enlaces:**
- [Opciones de Pago](https://notarypro.cl/payment-options)
- [Demo de Pago](https://notarypro.cl/payment-demo)
- [Comprar Código](https://notarypro.cl/purchase-code)

## 4. Roles de Usuario

### 4.1 Usuario Regular
- Acceso a documentos propios
- Firma de documentos
- Verificación de identidad básica

### 4.2 Certificador
- Realiza sesiones de notarización remota
- Verifica identidad de firmantes
- Emite certificados de notarización

### 4.3 Abogado
- Crea y revisa documentos legales
- Participa en sesiones de notarización
- Gestiona casos y expedientes

### 4.4 Administrador
- Gestión completa del sistema
- Creación de usuarios y asignación de roles
- Configuración de parámetros del sistema
- Acceso a estadísticas y analytics

### 4.5 Partner
- Acceso a API para integración
- Dashboard específico para partners
- Herramientas de marca blanca

## 5. Funcionalidades Clave

### 5.1 Modo Funcional y QA

NotaryPro incluye un sofisticado sistema de modos de funcionamiento:
- **Modo Real**: Todas las verificaciones y validaciones activas, para uso en producción
- **Modo Funcional**: Permite probar el sistema sin activar todas las validaciones estrictas
- **Modo QA**: Para pruebas exhaustivas con datos sintéticos

**Enlaces:**
- [Testing Real Mode](https://notarypro.cl/testing-real-mode)
- [Verificación Mode Status](https://notarypro.cl/verification-mode-status)

### 5.2 Verificación NFC

La plataforma está optimizada para dispositivos con capacidad NFC:
- Lectura directa de cédulas de identidad chilenas
- Verificación criptográfica de datos del chip
- Extracción segura de información biométrica
- Modo especial para tablets Lenovo

**Enlaces relacionados:**
- [VERIFICACION_NFC_TABLETS_LENOVO.md](https://notarypro.cl/docs/VERIFICACION_NFC_TABLETS_LENOVO.md)
- [TABLET_LENOVO_NFC_GUIA_RAPIDA.md](https://notarypro.cl/docs/TABLET_LENOVO_NFC_GUIA_RAPIDA.md)

### 5.3 Integración POS

NotaryPro se integra con sistemas POS (Point of Sale) para:
- Verificación de identidad en puntos físicos
- Firma de documentos en comercios
- Validación presencial con certificación digital

**Enlaces:**
- [POS Menu](https://notarypro.cl/pos-menu)
- [Integración POS](https://notarypro.cl/partners/pos-integration)
- [INTEGRACION_POS_MANUAL.md](https://notarypro.cl/docs/INTEGRACION_POS_MANUAL.md)

## 6. Seguridad y Cumplimiento Legal

### 6.1 Cumplimiento con Ley 19.799

NotaryPro cumple estrictamente con la Ley 19.799 sobre documentos electrónicos y firma electrónica en Chile:
- Verificación robusta de identidad
- Trazabilidad completa de operaciones
- Almacenamiento seguro de documentos
- Firma electrónica avanzada
- Sellado de tiempo

### 6.2 Medidas de Seguridad

- Cifrado de datos en reposo y tránsito (AES-256, TLS 1.3)
- Autenticación multifactor
- Registros de auditoría inalterables
- Monitoreo continuo de actividades sospechosas
- Respaldo regular de datos

### 6.3 Política de Privacidad

NotaryPro cumple con todas las regulaciones sobre protección de datos personales:
- Consentimiento explícito para procesamiento de datos
- Minimización de datos recolectados
- Eliminación segura cuando corresponde
- Procedimientos para ejercer derechos ARCO

## 7. Versión APK y Móvil

### 7.1 Aplicación Android

NotaryPro ofrece una versión optimizada para dispositivos Android:
- Acceso a cámara para captura de documentos
- Soporte NFC para dispositivos compatibles
- Interfaz optimizada para pantallas táctiles
- Modo offline con sincronización posterior

**Enlaces:**
- [Descargar APK](https://notarypro.cl/partners/descargar-apk)
- [Instrucciones APK](https://notarypro.cl/INSTRUCCIONES_CREAR_APK.md)

### 7.2 Versión Tablet Lenovo

Versión especializada para tablets Lenovo con capacidades NFC:
- Lectura NFC optimizada
- Interfaz adaptada a tablets
- Modo kiosko para uso comercial

**Enlaces:**
- [Guía Lenovo](https://notarypro.cl/INSTRUCCIONES_TABLET_LENOVO.md)
- [Crear APK Lenovo](https://notarypro.cl/CREAR_APK_LENOVO.md)

## 8. Especificaciones Técnicas

### 8.1 Requisitos del Sistema

**Servidor:**
- Node.js v16.x o superior
- PostgreSQL 13.x o superior
- 4GB RAM mínimo (8GB recomendado)
- 50GB almacenamiento mínimo

**Cliente Web:**
- Navegadores modernos (Chrome, Firefox, Edge, Safari)
- Soporte JavaScript activado
- Cámara web para verificación biométrica
- Lector NFC (opcional, para verificación avanzada)

**Aplicación Móvil:**
- Android 9.0 o superior
- Cámara posterior de al menos 8MP
- Soporte NFC (para funcionalidades avanzadas)
- 3GB RAM mínimo

### 8.2 API y Integraciones

NotaryPro ofrece APIs para integración con sistemas de terceros:
- API REST documentada
- Webhooks para eventos clave
- SDKs para integración rápida
- Ejemplos de código para casos comunes

**Enlaces:**
- [Integraciones Demo](https://notarypro.cl/integraciones-demo)
- [API Identidad](https://notarypro.cl/integraciones-api-identidad)
- [SDK Demo](https://notarypro.cl/partners/sdk-demo)

## 9. Preguntas Frecuentes y Soporte

### 9.1 Preguntas Frecuentes

**P: ¿NotaryPro cumple con la legislación chilena sobre firma electrónica?**  
R: Sí, NotaryPro cumple plenamente con la Ley 19.799 sobre documentos electrónicos y firma electrónica.

**P: ¿Puedo usar NotaryPro en dispositivos sin NFC?**  
R: Sí, NotaryPro ofrece métodos alternativos de verificación cuando el NFC no está disponible.

**P: ¿Los documentos firmados tienen validez legal?**  
R: Sí, los documentos firmados a través de NotaryPro tienen plena validez legal en Chile, cumpliendo con todas las normativas aplicables.

**P: ¿Cómo se garantiza la identidad de los firmantes?**  
R: Mediante verificación biométrica, validación de documentos oficiales, NFC y sesiones de videoconferencia supervisadas por certificadores autorizados.

### 9.2 Soporte Técnico

**Contacto:**
- Email: soporte@notarypro.cl
- Teléfono: +56 2 2123 4567
- Chat en vivo: Disponible en horario laboral (Lun-Vie, 9:00-18:00)
- Tickets: Sistema de tickets accesible desde el panel de usuario

## 10. Glosario de Términos

- **RON**: Remote Online Notarization - Notarización remota en línea
- **NFC**: Near Field Communication - Tecnología de comunicación de campo cercano
- **Firma Electrónica Avanzada**: Firma digital con validez legal según Ley 19.799
- **Certificador**: Usuario autorizado para validar identidades y certificar documentos
- **POS**: Point of Sale - Punto de venta físico
- **Verificación Biométrica**: Validación de identidad mediante rasgos físicos únicos

## 11. Enlaces a Código Fuente

### 11.1 Frontend

- [landing-page.tsx](https://github.com/notarypro/src/pages/landing-page.tsx)
- [documentacion-page.tsx](https://github.com/notarypro/src/pages/documentacion-page.tsx)
- [nfc-reader.ts](https://github.com/notarypro/src/lib/nfc-reader.ts)
- [Header.tsx](https://github.com/notarypro/src/components/landing/Header.tsx)

### 11.2 Backend

- [auth.ts](https://github.com/notarypro/server/auth.ts)
- [document-management-routes.ts](https://github.com/notarypro/server/document-management-routes.ts)
- [ron-routes.ts](https://github.com/notarypro/server/ron-routes.ts)
- [getapi-routes.ts](https://github.com/notarypro/server/getapi-routes.ts)

### 11.3 Documentación

- [VecinosExpress_Manual_Tecnico.pdf](https://notarypro.cl/docs/VecinosExpress_Manual_Tecnico.pdf)
- [VecinosExpress_Manual_Tecnico.docx](https://notarypro.cl/docs/VecinosExpress_Manual_Tecnico.docx)
- [VecinosExpress_Manual_Tecnico.md](https://notarypro.cl/docs/VecinosExpress_Manual_Tecnico.md)

## 12. Licencia y Derechos

NotaryPro es un software propietario. Todos los derechos reservados © 2025 VecinosExpress SpA.

Las bibliotecas de código abierto utilizadas en este proyecto están sujetas a sus respectivas licencias, que se pueden consultar en el directorio /licenses del repositorio.

Para solicitudes de licencia comercial, contactar a: licencias@notarypro.cl
`;

  // Guardar markdown temporalmente
  fs.writeFileSync('./codigo_fuente_temp.md', markdown);
  
  // Configurar opciones del PDF
  const pdfOptions = {
    dest: './NotaryPro_Manual_Completo_y_Codigo_Fuente.pdf',
    stylesheet: './pdf-style.css',
    pdf_options: {
      format: 'A4',
      margin: '20mm 15mm',
      printBackground: true
    },
    stylesheet_encoding: 'utf-8'
  };
  
  // En lugar de generar PDF (que requiere Puppeteer), guardamos el markdown directamente
  try {
    // Copiamos el archivo al directorio principal para que sea accesible
    fs.copyFileSync('./codigo_fuente_temp.md', './NotaryPro_Manual_Completo_y_Codigo_Fuente.md');
    console.log('Archivo Markdown generado con éxito: ./NotaryPro_Manual_Completo_y_Codigo_Fuente.md');
    
    // Eliminar archivo temporal
    fs.unlinkSync('./codigo_fuente_temp.md');
    
    return true;
  } catch (error) {
    console.error('Error al generar el PDF:', error);
    return false;
  }
}

// Ejecutar la función
generateCodeSourcePDF().then(() => {
  console.log('Proceso de generación de documentación completado');
});