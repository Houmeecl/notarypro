/**
 * ===============================================================
 * Vecinos NotaryPro Express - SDK para Puntos de Servicio v1.3.1
 * ===============================================================
 * 
 * GUÍA DE INSTALACIÓN:
 * 1. Descarga este archivo y guárdalo como 'vecinos-notarypro-sdk.js'
 * 2. Incluye el archivo en tu proyecto Android en la carpeta 'assets/js'
 * 3. Carga el SDK en un WebView usando los métodos de Android
 * 4. ¡Listo! Puedes empezar a usar las funciones del SDK
 * 
 * Ejemplo de carga en Android Studio:
 * ```java
 * WebView webView = findViewById(R.id.webView);
 * webView.getSettings().setJavaScriptEnabled(true);
 * webView.loadUrl("file:///android_asset/js/vecinos-notarypro-sdk.js");
 * ```
 * 
 * ACTUALIZACIÓN v1.3.1:
 * - A partir de esta versión, SOLO se acepta pago con tarjeta.
 * - Los métodos de pago en efectivo y transferencia ya no están disponibles.
 * - Las URLs del servicio ahora utilizan el dominio tuu.cl
 * - Compatible con integración de aplicaciones de pago inter-app
 * 
 * DOCUMENTACIÓN COMPLETA:
 * - Guía general: https://developers.tuu.cl/docs/getting-started
 * - Integración de pagos: https://developers.tuu.cl/docs/integración-de-aplicaciones-de-pago-inter-app
 * 
 * Este SDK está diseñado para ser fácil de usar, incluso sin experiencia previa
 * en programación. Sigue los ejemplos para procesar documentos rápidamente.
 * 
 * NOTA SOBRE PAGOS:
 * Este SDK ahora soporta integración con aplicaciones de pago externas.
 * Consulta la documentación específica para implementar la funcionalidad
 * de pago mediante aplicaciones de terceros.
 */

(function(global) {

  /**
   * TIPOS DE DOCUMENTOS
   * Lista de documentos que pueden procesarse en el punto de servicio
   */
  const TIPO_DOCUMENTO = {
    PODER: 'poder',
    DECLARACION_JURADA: 'declaracion_jurada',
    CONTRATO: 'contrato', 
    CERTIFICADO: 'certificado',
    FINIQUITO: 'finiquito',
    OTRO: 'otro'
  };

  /**
   * ESTADOS DE DOCUMENTOS
   * Estados en los que puede encontrarse un documento
   */
  const ESTADO_DOCUMENTO = {
    RECIBIDO: 'recibido',         // Recién ingresado al sistema
    EN_PROCESO: 'en_proceso',     // En revisión por la central
    COMPLETADO: 'completado',     // Proceso finalizado correctamente
    RECHAZADO: 'rechazado'        // Documento rechazado (ver motivo)
  };

  /**
   * MÉTODOS DE PAGO
   * Formas de pago aceptadas para el servicio
   * Nota: A partir de la versión 1.3.1, SOLO se acepta pago con tarjeta
   * Los métodos "efectivo" y "transferencia" han sido eliminados
   */
  const METODO_PAGO = {
    TARJETA: 'tarjeta'
  };

  /**
   * VecinosPOS - Clase principal para el punto de servicio
   */
  class VecinosPOS {
    /**
     * CONSTRUCTOR: Inicializa un nuevo punto de servicio
     * 
     * @param {Object} config - Configuración del punto de servicio:
     *   - id: Número de identificación de la tienda
     *   - nombre: Nombre de la tienda
     *   - direccion: Dirección física
     *   - region: Región de Chile
     *   - comuna: Comuna
     *   - apiKey: Clave de acceso proporcionada por NotaryPro
     */
    constructor(config) {
      // Verificar configuración mínima requerida
      if (!config.id || !config.nombre || !config.apiKey) {
        console.error('⚠️ Error: Configuración incompleta. Verifique que tenga id, nombre y apiKey.');
      }
      
      this.config = config;
      this.apiUrl = "https://api.tuu.cl";
      this.modoOffline = false;
      this.documentosPendientes = [];
      this.clientesPendientes = [];
      
      // Almacenamiento local
      this._initLocalStorage();
      
      // Verificar conexión a internet
      this._verificarConexion();
      
      console.log('✅ Punto de servicio configurado: ' + config.nombre);
      
      // Mostrar mensaje al desarrollador
      if (typeof navigator !== 'undefined' && navigator.userAgent) {
        console.log('📱 Detectado en: ' + navigator.userAgent);
      }
    }
    
    /**
     * Inicializa el almacenamiento local
     * @private
     */
    _initLocalStorage() {
      try {
        // Intentar cargar datos almacenados previamente
        const storedClients = localStorage.getItem('vecinos_pos_clientes');
        const storedDocs = localStorage.getItem('vecinos_pos_documentos');
        
        if (storedClients) {
          this.clientesPendientes = JSON.parse(storedClients);
          console.log(`🔄 Cargados ${this.clientesPendientes.length} clientes del almacenamiento local`);
        }
        
        if (storedDocs) {
          this.documentosPendientes = JSON.parse(storedDocs);
          console.log(`🔄 Cargados ${this.documentosPendientes.length} documentos del almacenamiento local`);
        }
      } catch (e) {
        console.error('Error cargando datos locales:', e);
        // Iniciar con datos vacíos si hay error
        this.clientesPendientes = [];
        this.documentosPendientes = [];
      }
    }
    
    /**
     * Guarda los datos en almacenamiento local
     * @private
     */
    _saveToLocalStorage() {
      try {
        localStorage.setItem('vecinos_pos_clientes', JSON.stringify(this.clientesPendientes));
        localStorage.setItem('vecinos_pos_documentos', JSON.stringify(this.documentosPendientes));
      } catch (e) {
        console.error('Error guardando datos locales:', e);
      }
    }
    
    /**
     * Verifica si hay conexión a internet
     * @private
     */
    async _verificarConexion() {
      try {
        const respuesta = await fetch(this.apiUrl + '/api/status', { 
          method: 'GET',
          cache: 'no-cache',
          timeout: 5000
        });
        
        if (respuesta.ok) {
          this.modoOffline = false;
          console.log('🌐 Conexión a internet disponible');
          
          // Intentar sincronizar datos pendientes
          if (this.documentosPendientes.length > 0 || this.clientesPendientes.length > 0) {
            this._sincronizar();
          }
        } else {
          this.modoOffline = true;
          console.log('📴 Sin conexión a internet. Activando modo offline.');
        }
      } catch (error) {
        this.modoOffline = true;
        console.log('📴 Sin conexión a internet. Activando modo offline.');
      }
      
      // Programar próxima verificación
      setTimeout(() => this._verificarConexion(), 5 * 60 * 1000);
    }
    
    /**
     * Sincroniza datos almacenados localmente con el servidor
     * @private
     */
    async _sincronizar() {
      if (this.modoOffline) return;
      
      console.log('🔄 Iniciando sincronización de datos...');
      
      // Sincronizar clientes pendientes
      const clientesParaSincronizar = [...this.clientesPendientes];
      for (const cliente of clientesParaSincronizar) {
        try {
          // Solo sincronizar clientes con ID temporal (negativo)
          if (cliente.id < 0) {
            const respuesta = await fetch(`${this.apiUrl}/api/pos/clientes`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-API-KEY": this.config.apiKey
              },
              body: JSON.stringify({
                nombre: cliente.nombre,
                rut: cliente.rut,
                email: cliente.email,
                telefono: cliente.telefono,
                partnerId: this.config.id
              })
            });
            
            if (respuesta.ok) {
              const resultado = await respuesta.json();
              console.log(`✓ Cliente sincronizado: ${cliente.nombre}`);
              
              // Eliminar de la lista de pendientes
              this.clientesPendientes = this.clientesPendientes.filter(c => c.id !== cliente.id);
              
              // Actualizar documentos que referencian este cliente
              this.documentosPendientes.forEach(doc => {
                if (doc.clienteId === cliente.id) {
                  doc.clienteId = resultado.id;
                }
              });
            }
          }
        } catch (error) {
          console.error(`Error sincronizando cliente ${cliente.nombre}:`, error);
        }
      }
      
      // Sincronizar documentos pendientes
      const docsParaSincronizar = [...this.documentosPendientes];
      for (const doc of docsParaSincronizar) {
        try {
          // Solo sincronizar documentos con ID temporal (negativo)
          if (doc.id < 0) {
            // Verificar que el clienteId ya no sea temporal
            if (doc.clienteId < 0) {
              console.log(`⏳ Documento ${doc.titulo} pendiente: esperando sincronización del cliente`);
              continue;
            }
            
            const respuesta = await fetch(`${this.apiUrl}/api/pos/documentos`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-API-KEY": this.config.apiKey
              },
              body: JSON.stringify({
                clienteId: doc.clienteId,
                partnerId: this.config.id,
                tipo: doc.tipo,
                titulo: doc.titulo,
                detalle: doc.detalle || "",
                monto: doc.monto,
                metodoPago: doc.metodoPago
              })
            });
            
            if (respuesta.ok) {
              const resultado = await respuesta.json();
              console.log(`✓ Documento sincronizado: ${doc.titulo}`);
              
              // Eliminar de la lista de pendientes
              this.documentosPendientes = this.documentosPendientes.filter(d => d.id !== doc.id);
              
              // Registrar comisión
              await this._registrarComision(resultado.id, doc.monto);
            }
          }
        } catch (error) {
          console.error(`Error sincronizando documento ${doc.titulo}:`, error);
        }
      }
      
      // Guardar cambios en almacenamiento local
      this._saveToLocalStorage();
      
      console.log('✅ Sincronización completada');
    }
    
    /**
     * Registra comisión por procesamiento de documento
     * @private
     */
    async _registrarComision(documentoId, monto) {
      const comision = monto * 0.15; // 15% fijo
      
      try {
        const respuesta = await fetch(`${this.apiUrl}/api/partner-sales`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": this.config.apiKey
          },
          body: JSON.stringify({
            partnerId: this.config.id,
            documentId: documentoId,
            amount: monto,
            commission: comision,
            description: `Comisión por procesamiento de documento #${documentoId}`
          })
        });
        
        if (respuesta.ok) {
          console.log(`✓ Comisión registrada: $${comision}`);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error registrando comisión:', error);
        return false;
      }
    }
    
    /**
     * PASO 1: Registra un nuevo cliente o busca uno existente
     * 
     * @param {Object} cliente - Datos del cliente:
     *   - nombre: Nombre completo
     *   - rut: RUT chileno (formato XX.XXX.XXX-X)
     *   - email: Correo electrónico
     *   - telefono: Número de teléfono (opcional)
     * 
     * @returns {Promise<Object>} Resultado con ID del cliente y sus datos
     */
    async registrarCliente(cliente) {
      console.log('👤 Registrando cliente:', cliente.nombre);
      
      // Validar datos mínimos
      if (!cliente.nombre || !cliente.rut || !cliente.email) {
        throw new Error('Datos de cliente incompletos. Nombre, RUT y email son obligatorios.');
      }
      
      // Buscar cliente existente por RUT
      try {
        const clienteExistente = await this.buscarClientePorRut(cliente.rut);
        if (clienteExistente) {
          console.log('✓ Cliente encontrado en el sistema');
          return clienteExistente;
        }
      } catch (error) {
        // Continuar con registro si hay error
      }
      
      // Modo offline: guardar localmente
      if (this.modoOffline) {
        const idTemporal = -Math.floor(Math.random() * 10000);
        console.log('✓ Cliente guardado localmente (modo offline)');
        
        const nuevoCliente = {
          id: idTemporal,
          ...cliente,
          createdAt: new Date().toISOString()
        };
        
        this.clientesPendientes.push(nuevoCliente);
        this._saveToLocalStorage();
        
        return {
          id: idTemporal,
          cliente
        };
      }
      
      // Modo online: enviar al servidor
      try {
        const respuesta = await fetch(`${this.apiUrl}/api/pos/clientes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": this.config.apiKey
          },
          body: JSON.stringify({
            ...cliente,
            partnerId: this.config.id
          })
        });
        
        if (!respuesta.ok) {
          throw new Error(`Error del servidor: ${respuesta.status}`);
        }
        
        const resultado = await respuesta.json();
        console.log('✓ Cliente registrado correctamente en el servidor');
        
        return {
          id: resultado.id,
          cliente
        };
      } catch (error) {
        // En caso de error, activar modo offline y guardar localmente
        console.error('⚠️ Error al registrar cliente:', error.message);
        this.modoOffline = true;
        
        const idTemporal = -Math.floor(Math.random() * 10000);
        const nuevoCliente = {
          id: idTemporal,
          ...cliente,
          createdAt: new Date().toISOString()
        };
        
        this.clientesPendientes.push(nuevoCliente);
        this._saveToLocalStorage();
        
        return {
          id: idTemporal,
          cliente
        };
      }
    }
    
    /**
     * Busca un cliente por su RUT en el sistema
     * 
     * @param {string} rut - RUT chileno (formato XX.XXX.XXX-X)
     * @returns {Promise<Object|null>} Datos del cliente o null si no existe
     */
    async buscarClientePorRut(rut) {
      console.log('🔍 Buscando cliente con RUT:', rut);
      
      // Buscar primero en la lista local
      if (this.clientesPendientes.length > 0) {
        const clienteLocal = this.clientesPendientes.find(c => c.rut === rut);
        if (clienteLocal) {
          console.log('✓ Cliente encontrado en almacenamiento local');
          return {
            id: clienteLocal.id,
            cliente: {
              nombre: clienteLocal.nombre,
              rut: clienteLocal.rut,
              email: clienteLocal.email,
              telefono: clienteLocal.telefono
            }
          };
        }
      }
      
      // Si estamos en modo offline, retornar null
      if (this.modoOffline) {
        return null;
      }
      
      // Buscar en el servidor
      try {
        const respuesta = await fetch(
          `${this.apiUrl}/api/pos/clientes/buscar?rut=${encodeURIComponent(rut)}`,
          {
            headers: {
              "X-API-KEY": this.config.apiKey
            }
          }
        );
        
        if (!respuesta.ok) {
          console.log('✓ Cliente no encontrado en el sistema');
          return null;
        }
        
        const datos = await respuesta.json();
        if (!datos) return null;
        
        console.log('✓ Cliente encontrado en el servidor');
        return {
          id: datos.id,
          cliente: {
            nombre: datos.nombre,
            rut: datos.rut,
            email: datos.email,
            telefono: datos.telefono
          }
        };
      } catch (error) {
        console.error('⚠️ Error buscando cliente:', error.message);
        this.modoOffline = true;
        return null;
      }
    }
    
    /**
     * PASO 2: Procesa un documento para un cliente
     * 
     * @param {number} clienteId - ID del cliente (obtenido del paso 1)
     * @param {Object} documento - Datos del documento:
     *   - tipo: Tipo de documento (usar constantes TIPO_DOCUMENTO)
     *   - titulo: Título descriptivo 
     *   - detalle: Información adicional (opcional)
     *   - monto: Cantidad cobrada (en pesos chilenos)
     *   - metodoPago: Forma de pago (usar constantes METODO_PAGO)
     * 
     * @returns {Promise<Object>} Resultado con ID y estado del documento
     */
    async procesarDocumento(clienteId, documento) {
      console.log('📄 Procesando documento:', documento.titulo);
      
      // Validar datos mínimos
      if (!clienteId || !documento.tipo || !documento.titulo || !documento.monto || !documento.metodoPago) {
        throw new Error('Datos de documento incompletos. Verifique tipo, título, monto y método de pago.');
      }
      
      // Validar que el método de pago sea tarjeta
      if (documento.metodoPago !== METODO_PAGO.TARJETA) {
        throw new Error('Método de pago no válido. Solo se aceptan pagos con tarjeta.');
      }
      
      // Modo offline: guardar localmente
      if (this.modoOffline) {
        const idTemporal = -Math.floor(Math.random() * 10000);
        
        const nuevoDocumento = {
          id: idTemporal,
          clienteId,
          ...documento,
          estado: ESTADO_DOCUMENTO.RECIBIDO,
          createdAt: new Date().toISOString()
        };
        
        this.documentosPendientes.push(nuevoDocumento);
        this._saveToLocalStorage();
        
        console.log('✓ Documento guardado localmente (modo offline)');
        
        return {
          documentoId: idTemporal,
          estado: ESTADO_DOCUMENTO.RECIBIDO
        };
      }
      
      // Modo online: enviar al servidor
      try {
        const respuesta = await fetch(`${this.apiUrl}/api/pos/documentos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": this.config.apiKey
          },
          body: JSON.stringify({
            clienteId,
            partnerId: this.config.id,
            tipo: documento.tipo,
            titulo: documento.titulo,
            detalle: documento.detalle || "",
            monto: documento.monto,
            metodoPago: documento.metodoPago
          })
        });
        
        if (!respuesta.ok) {
          throw new Error(`Error del servidor: ${respuesta.status}`);
        }
        
        const resultado = await respuesta.json();
        console.log('✓ Documento procesado correctamente en el servidor');
        
        // Registrar comisión automáticamente
        this._registrarComision(resultado.id, documento.monto);
        
        return {
          documentoId: resultado.id,
          estado: ESTADO_DOCUMENTO.RECIBIDO
        };
      } catch (error) {
        // En caso de error, activar modo offline y guardar localmente
        console.error('⚠️ Error al procesar documento:', error.message);
        this.modoOffline = true;
        
        const idTemporal = -Math.floor(Math.random() * 10000);
        
        const nuevoDocumento = {
          id: idTemporal,
          clienteId,
          ...documento,
          estado: ESTADO_DOCUMENTO.RECIBIDO,
          createdAt: new Date().toISOString()
        };
        
        this.documentosPendientes.push(nuevoDocumento);
        this._saveToLocalStorage();
        
        return {
          documentoId: idTemporal,
          estado: ESTADO_DOCUMENTO.RECIBIDO
        };
      }
    }
    
    /**
     * PASO 3: Genera e imprime un recibo para el cliente
     * 
     * @param {number} documentoId - ID del documento
     * @param {Object} cliente - Datos del cliente
     * @param {Object} documento - Datos del documento
     * 
     * @returns {Promise<Object>} URL del recibo y código QR de verificación
     */
    async imprimirRecibo(documentoId, cliente, documento) {
      console.log('🖨️ Generando recibo para el documento:', documentoId);
      
      // Obtener código de verificación
      let codigoVerificacion = "";
      
      if (!this.modoOffline) {
        try {
          const respuesta = await fetch(`${this.apiUrl}/api/pos/verificacion/${documentoId}`, {
            headers: {
              "X-API-KEY": this.config.apiKey
            }
          });
          
          if (respuesta.ok) {
            const datos = await respuesta.json();
            codigoVerificacion = datos.codigo;
          }
        } catch (error) {
          console.error('⚠️ Error al obtener código de verificación:', error.message);
        }
      }
      
      if (!codigoVerificacion) {
        // Generar código provisional para modo offline
        codigoVerificacion = `TEMP-${Math.floor(Math.random() * 10000)}`;
      }
      
      // Generar recibo HTML
      const reciboHtml = this._generarReciboHtml(documentoId, cliente, documento, codigoVerificacion);
      
      // En un entorno real, aquí se enviaría a la impresora Bluetooth
      // Para la demo, simplemente retornamos la URL del recibo
      
      const reciboUrl = `data:text/html;charset=utf-8,${encodeURIComponent(reciboHtml)}`;
      const codigoQR = `https://tuu.cl/verificar/${codigoVerificacion}`;
      
      console.log('✓ Recibo generado correctamente');
      
      return {
        reciboUrl,
        codigoQR,
        verificacionCodigo: codigoVerificacion
      };
    }
    
    /**
     * Genera el HTML para un recibo
     * @private
     */
    _generarReciboHtml(documentoId, cliente, documento, codigoVerificacion) {
      const fecha = new Date().toLocaleDateString('es-CL');
      const hora = new Date().toLocaleTimeString('es-CL');
      
      // Mapeo de tipos de documento a nombres legibles
      const tiposDocumento = {
        'poder': 'Poder Simple',
        'declaracion_jurada': 'Declaración Jurada',
        'contrato': 'Contrato',
        'certificado': 'Certificado',
        'finiquito': 'Finiquito',
        'otro': 'Otro Documento'
      };
      
      // Mapeo de métodos de pago a nombres legibles
      // Solo se acepta tarjeta como método de pago
      const metodosPago = {
        'tarjeta': 'Tarjeta'
      };
      
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recibo de Documento - NotaryPro Express</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      max-width: 400px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .store-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .store-address {
      font-size: 14px;
      color: #555;
    }
    .receipt-title {
      text-align: center;
      font-size: 18px;
      margin: 15px 0;
      border-bottom: 1px solid #ccc;
      padding-bottom: 10px;
    }
    .receipt-info {
      margin-bottom: 20px;
    }
    .info-row {
      display: flex;
      margin-bottom: 8px;
    }
    .info-label {
      font-weight: bold;
      width: 120px;
    }
    .info-value {
      flex: 1;
    }
    .verification {
      text-align: center;
      margin: 20px 0;
      padding: 15px;
      border: 1px dashed #ccc;
    }
    .verification-text {
      font-size: 14px;
      color: #555;
    }
    .verification-code {
      font-weight: bold;
      margin-top: 10px;
      font-size: 16px;
    }
    .verification-url {
      margin-top: 5px;
      font-size: 12px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 14px;
      color: #777;
    }
    .thank-you {
      font-weight: bold;
      margin-bottom: 5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">NotaryPro Express</div>
    <div class="store-name">${this.config.nombre}</div>
    <div class="store-address">
      ${this.config.direccion}, ${this.config.comuna}, ${this.config.region}
    </div>
  </div>
  
  <div class="receipt-title">
    Comprobante de Documento
  </div>
  
  <div class="receipt-info">
    <div class="info-row">
      <div class="info-label">Fecha:</div>
      <div class="info-value">${fecha} - ${hora}</div>
    </div>
    <div class="info-row">
      <div class="info-label">N° Documento:</div>
      <div class="info-value">${documentoId}</div>
    </div>
  </div>
  
  <div class="receipt-info">
    <div class="info-row">
      <div class="info-label">Cliente:</div>
      <div class="info-value">${cliente.nombre}</div>
    </div>
    <div class="info-row">
      <div class="info-label">RUT:</div>
      <div class="info-value">${cliente.rut}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Email:</div>
      <div class="info-value">${cliente.email}</div>
    </div>
  </div>
  
  <div class="receipt-info">
    <div class="info-row">
      <div class="info-label">Documento:</div>
      <div class="info-value">${documento.titulo}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Tipo:</div>
      <div class="info-value">${tiposDocumento[documento.tipo] || documento.tipo}</div>
    </div>
    ${documento.detalle ? `
    <div class="info-row">
      <div class="info-label">Detalle:</div>
      <div class="info-value">${documento.detalle}</div>
    </div>
    ` : ''}
    <div class="info-row">
      <div class="info-label">Monto:</div>
      <div class="info-value">$${documento.monto.toLocaleString('es-CL')}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Método de pago:</div>
      <div class="info-value">${metodosPago[documento.metodoPago] || documento.metodoPago}</div>
    </div>
  </div>
  
  <div class="verification">
    <div class="verification-text">Para verificar la autenticidad de este documento:</div>
    <div class="verification-code">${codigoVerificacion}</div>
    <div class="verification-url">Visite: tuu.cl/verificar</div>
  </div>
  
  <div class="footer">
    <div class="thank-you">¡Gracias por utilizar NotaryPro Express!</div>
    <div>Este comprobante sirve como respaldo de su trámite</div>
  </div>
</body>
</html>`;
    }
    
    /**
     * Obtiene estadísticas del punto de servicio
     * 
     * @returns {Promise<Object>} Estadísticas del punto de servicio
     */
    async obtenerEstadisticas() {
      console.log('📊 Obteniendo estadísticas del punto de servicio');
      
      if (!this.modoOffline) {
        try {
          const respuesta = await fetch(`${this.apiUrl}/api/pos/estadisticas/${this.config.id}`, {
            headers: {
              "X-API-KEY": this.config.apiKey
            }
          });
          
          if (respuesta.ok) {
            const stats = await respuesta.json();
            console.log('✓ Estadísticas obtenidas correctamente');
            return stats;
          }
        } catch (error) {
          console.error('⚠️ Error al obtener estadísticas:', error.message);
          this.modoOffline = true;
        }
      }
      
      // Si estamos offline, generar estadísticas locales
      const documentosLocales = this.documentosPendientes.length;
      const totalVentas = this.documentosPendientes.reduce((sum, doc) => sum + doc.monto, 0);
      const comisionPendiente = Math.round(totalVentas * 0.15);
      
      return {
        totalDocumentos: documentosLocales,
        comisionPendiente,
        comisionPagada: 0,
        totalVentas
      };
    }
  }
  
  // Exponer globalmente las constantes y la clase
  global.TIPO_DOCUMENTO = TIPO_DOCUMENTO;
  global.METODO_PAGO = METODO_PAGO;
  global.ESTADO_DOCUMENTO = ESTADO_DOCUMENTO;
  global.VecinosPOS = VecinosPOS;
  
})(typeof window !== 'undefined' ? window : this);