/**
 * ===============================================================
 * Vecinos NotaryPro Express - SDK para Puntos de Servicio v1.0
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
 * Este SDK está diseñado para ser fácil de usar, incluso sin experiencia previa
 * en programación. Sigue los ejemplos para procesar documentos rápidamente.
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
   */
  const METODO_PAGO = {
    EFECTIVO: 'efectivo',
    TARJETA: 'tarjeta',
    TRANSFERENCIA: 'transferencia'
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
      this.apiUrl = "https://api.cerfidoc.cl";
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
        throw new Error('Datos de documento incompletos. Todos los campos son obligatorios excepto detalle.');
      }
      
      // Modo offline: guardar localmente
      if (this.modoOffline) {
        const idTemporal = -Math.floor(Math.random() * 10000);
        
        const nuevoDoc = {
          id: idTemporal,
          clienteId,
          ...documento,
          estado: ESTADO_DOCUMENTO.RECIBIDO,
          fechaCreacion: new Date().toISOString()
        };
        
        this.documentosPendientes.push(nuevoDoc);
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
        this._registrarComision(resultado.id, documento.monto).catch(err => {
          console.log('ℹ️ La comisión se registrará más tarde');
        });
        
        return {
          documentoId: resultado.id,
          estado: ESTADO_DOCUMENTO.RECIBIDO
        };
      } catch (error) {
        // En caso de error, activar modo offline y guardar localmente
        console.error('⚠️ Error al procesar documento:', error.message);
        this.modoOffline = true;
        
        const idTemporal = -Math.floor(Math.random() * 10000);
        
        const nuevoDoc = {
          id: idTemporal,
          clienteId,
          ...documento,
          estado: ESTADO_DOCUMENTO.RECIBIDO,
          fechaCreacion: new Date().toISOString()
        };
        
        this.documentosPendientes.push(nuevoDoc);
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
     * @param {number} documentoId - ID del documento procesado
     * @param {Object} cliente - Datos del cliente
     * @param {Object} documento - Datos del documento
     * 
     * @returns {Promise<Object>} URLs del recibo y código QR
     */
    async imprimirRecibo(documentoId, cliente, documento) {
      console.log('🖨️ Generando recibo para documento:', documentoId);
      
      // Obtener código QR (o generar uno local)
      let codigoQR = "";
      
      if (!this.modoOffline) {
        try {
          const respuestaQR = await fetch(
            `${this.apiUrl}/api/pos/qr/${documentoId}`,
            {
              headers: {
                "X-API-KEY": this.config.apiKey
              }
            }
          );
          
          if (respuestaQR.ok) {
            const datosQR = await respuestaQR.json();
            codigoQR = datosQR.qrCode;
          }
        } catch (error) {
          codigoQR = `Verificar: cerfidoc.cl/verificar - Documento #${documentoId}`;
        }
      } else {
        codigoQR = `Verificar: cerfidoc.cl/verificar - Documento #${documentoId}`;
      }
      
      // Función para generar recibo HTML
      const generarReciboHTML = () => {
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 20px; }
              .store-name { font-size: 22px; font-weight: bold; margin-bottom: 5px; }
              .store-address { font-size: 14px; color: #555; }
              .receipt-title { text-align: center; font-size: 18px; margin: 15px 0; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
              .receipt-info { margin-bottom: 20px; }
              .info-row { display: flex; margin-bottom: 8px; }
              .info-label { font-weight: bold; width: 120px; }
              .info-value { flex: 1; }
              .verification { text-align: center; margin: 20px 0; padding: 15px; border: 1px dashed #ccc; }
              .verification-text { font-size: 14px; color: #555; }
              .verification-code { font-weight: bold; margin-top: 10px; word-break: break-all; }
              .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #777; }
              .thank-you { font-weight: bold; margin-bottom: 5px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="store-name">Vecinos NotaryPro Express</div>
              <div class="store-address">${this.config.nombre}</div>
              <div class="store-address">${this.config.direccion || ''}</div>
              <div class="store-address">${this.config.comuna || ''}, ${this.config.region || ''}</div>
            </div>
            
            <div class="receipt-title">Recibo de Servicio Documental #${documentoId}</div>
            
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
                <div class="info-label">Documento:</div>
                <div class="info-value">${documento.titulo}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Tipo:</div>
                <div class="info-value">${documento.tipo}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Fecha:</div>
                <div class="info-value">${new Date().toLocaleString('es-CL')}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Monto:</div>
                <div class="info-value">$${documento.monto.toLocaleString('es-CL')}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Método de pago:</div>
                <div class="info-value">${documento.metodoPago}</div>
              </div>
            </div>
            
            <div class="verification">
              <div class="verification-text">Para verificar la autenticidad de este documento, visite:</div>
              <div class="verification-code">cerfidoc.cl/verificar</div>
              <div class="verification-text">Ingrese el código: ${documentoId}</div>
            </div>
            
            <div class="footer">
              <div class="thank-you">¡Gracias por utilizar nuestros servicios!</div>
              <div>Este documento fue procesado a través del programa</div>
              <div>Vecinos NotaryPro Express</div>
            </div>
          </body>
          </html>
        `;
      };
      
      // Si estamos en modo offline o hay error, generar recibo local
      if (this.modoOffline) {
        console.log('✓ Recibo generado localmente (modo offline)');
        
        const htmlRecibo = generarReciboHTML();
        return {
          reciboUrl: `data:text/html;base64,${this._btoa(htmlRecibo)}`,
          qrVerificacion: codigoQR
        };
      }
      
      // Obtener recibo del servidor
      try {
        const respuesta = await fetch(
          `${this.apiUrl}/api/pos/recibo/${documentoId}`,
          {
            headers: {
              "X-API-KEY": this.config.apiKey
            }
          }
        );
        
        if (!respuesta.ok) {
          throw new Error(`Error del servidor: ${respuesta.status}`);
        }
        
        const datos = await respuesta.json();
        console.log('✓ Recibo obtenido del servidor');
        
        return {
          reciboUrl: datos.reciboUrl,
          qrVerificacion: codigoQR
        };
      } catch (error) {
        console.error('⚠️ Error obteniendo recibo:', error.message);
        
        // Generar recibo local en caso de error
        const htmlRecibo = generarReciboHTML();
        return {
          reciboUrl: `data:text/html;base64,${this._btoa(htmlRecibo)}`,
          qrVerificacion: codigoQR
        };
      }
    }
    
    /**
     * Helper para codificar en base64 (compatible con más entornos)
     * @private
     */
    _btoa(str) {
      try {
        return btoa(unescape(encodeURIComponent(str)));
      } catch (e) {
        // Fallback para entornos sin btoa
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let output = '';
        
        for (
          let block = 0, charCode, i = 0, map = chars;
          str.charAt(i | 0) || (map = '=', i % 1);
          output += map.charAt(63 & block >> 8 - i % 1 * 8)
        ) {
          charCode = str.charCodeAt(i += 3/4);
          block = block << 8 | charCode;
        }
        
        return output;
      }
    }
    
    /**
     * Obtiene listado de documentos procesados
     * 
     * @param {Object} filtros - Objeto con filtros opcionales:
     *   - desde: Fecha de inicio (objeto Date)
     *   - hasta: Fecha de fin (objeto Date)
     * 
     * @returns {Promise<Array>} Lista de documentos
     */
    async obtenerDocumentos(filtros = {}) {
      console.log('🔍 Consultando documentos procesados');
      
      // En modo offline, devolver documentos locales
      if (this.modoOffline) {
        let documentos = [...this.documentosPendientes];
        
        // Aplicar filtros de fecha
        if (filtros.desde) {
          const desde = new Date(filtros.desde);
          documentos = documentos.filter(doc => {
            const fechaDoc = new Date(doc.fechaCreacion);
            return fechaDoc >= desde;
          });
        }
        
        if (filtros.hasta) {
          const hasta = new Date(filtros.hasta);
          documentos = documentos.filter(doc => {
            const fechaDoc = new Date(doc.fechaCreacion);
            return fechaDoc <= hasta;
          });
        }
        
        return documentos.map(doc => ({
          id: doc.id,
          titulo: doc.titulo,
          fecha: doc.fechaCreacion,
          monto: doc.monto,
          estado: doc.estado
        }));
      }
      
      // Obtener documentos del servidor
      try {
        let url = `${this.apiUrl}/api/pos/documentos/partner/${this.config.id}`;
        
        // Añadir filtros de fecha
        if (filtros.desde || filtros.hasta) {
          const params = new URLSearchParams();
          if (filtros.desde) params.append("desde", filtros.desde.toISOString());
          if (filtros.hasta) params.append("hasta", filtros.hasta.toISOString());
          url += `?${params.toString()}`;
        }
        
        const respuesta = await fetch(url, {
          headers: {
            "X-API-KEY": this.config.apiKey
          }
        });
        
        if (!respuesta.ok) {
          throw new Error(`Error del servidor: ${respuesta.status}`);
        }
        
        const documentos = await respuesta.json();
        console.log(`✓ Se encontraron ${documentos.length} documentos`);
        
        return documentos;
      } catch (error) {
        console.error('⚠️ Error obteniendo documentos:', error.message);
        this.modoOffline = true;
        
        // En caso de error, devolver documentos locales
        return this.documentosPendientes.map(doc => ({
          id: doc.id,
          titulo: doc.titulo,
          fecha: doc.fechaCreacion,
          monto: doc.monto,
          estado: doc.estado
        }));
      }
    }
    
    /**
     * Obtiene estadísticas del punto de servicio
     * 
     * @returns {Promise<Object>} Objeto con estadísticas
     */
    async obtenerEstadisticas() {
      console.log('📊 Consultando estadísticas del punto de servicio');
      
      // En modo offline, calcular estadísticas locales
      if (this.modoOffline) {
        const totalDocumentos = this.documentosPendientes.length;
        const totalVentas = this.documentosPendientes.reduce(
          (total, doc) => total + (doc.monto || 0), 0
        );
        const comisionPendiente = Math.round(totalVentas * 0.15);
        
        return {
          totalDocumentos,
          comisionPendiente,
          comisionPagada: 0,
          totalVentas
        };
      }
      
      // Obtener estadísticas del servidor
      try {
        const respuesta = await fetch(
          `${this.apiUrl}/api/partner-sales-stats/${this.config.id}`,
          {
            headers: {
              "X-API-KEY": this.config.apiKey
            }
          }
        );
        
        if (!respuesta.ok) {
          throw new Error(`Error del servidor: ${respuesta.status}`);
        }
        
        const datos = await respuesta.json();
        console.log('✓ Estadísticas obtenidas correctamente');
        
        return {
          totalDocumentos: datos.salesCount || 0,
          comisionPendiente: datos.pendingCommission || 0,
          comisionPagada: datos.paidCommission || 0,
          totalVentas: datos.totalSales || 0
        };
      } catch (error) {
        console.error('⚠️ Error obteniendo estadísticas:', error.message);
        this.modoOffline = true;
        
        // Calcular estadísticas locales en caso de error
        const totalDocumentos = this.documentosPendientes.length;
        const totalVentas = this.documentosPendientes.reduce(
          (total, doc) => total + (doc.monto || 0), 0
        );
        const comisionPendiente = Math.round(totalVentas * 0.15);
        
        return {
          totalDocumentos,
          comisionPendiente,
          comisionPagada: 0,
          totalVentas
        };
      }
    }
  }
  
  // Exponer constantes y clase al entorno global
  global.TIPO_DOCUMENTO = TIPO_DOCUMENTO;
  global.ESTADO_DOCUMENTO = ESTADO_DOCUMENTO;
  global.METODO_PAGO = METODO_PAGO;
  global.VecinosPOS = VecinosPOS;
  
  // Versión y datos del SDK
  global.SDK_VERSION = "1.0.0";
  global.SDK_DATE = "2025-04-27";
  
  console.log(`📱 Vecinos NotaryPro Express SDK v${global.SDK_VERSION} cargado correctamente`);
  console.log('Para comenzar, cree una instancia con: const pos = new VecinosPOS({ ... })');

})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this);

/**
 * =====================================================================
 * EJEMPLOS DE USO
 * =====================================================================
 * 
 * // PASO 1: Crear una instancia con los datos del punto de servicio
 * const miTienda = new VecinosPOS({
 *   id: 123,                           // ID asignado a su tienda
 *   nombre: "Minimarket Don Pedro",    // Nombre de su tienda
 *   direccion: "Calle Principal 123",  // Dirección física
 *   region: "Metropolitana",           // Región
 *   comuna: "Santiago",                // Comuna
 *   apiKey: "su-clave-secreta-aqui"    // Clave proporcionada por NotaryPro
 * });
 * 
 * // PASO 2: Registrar un cliente (o buscar uno existente por RUT)
 * async function ejemploRegistrarCliente() {
 *   const resultado = await miTienda.registrarCliente({
 *     nombre: "María González",
 *     rut: "12.345.678-9",
 *     email: "maria@ejemplo.cl",
 *     telefono: "912345678"
 *   });
 *   
 *   // Guardar el ID del cliente para usarlo después
 *   const clienteId = resultado.id;
 *   console.log("Cliente registrado con ID:", clienteId);
 *   return clienteId;
 * }
 * 
 * // PASO 3: Procesar un documento para el cliente
 * async function ejemploProcesarDocumento(clienteId) {
 *   const resultado = await miTienda.procesarDocumento(clienteId, {
 *     tipo: TIPO_DOCUMENTO.DECLARACION_JURADA,
 *     titulo: "Declaración jurada de residencia",
 *     detalle: "Para trámite municipal",
 *     monto: 5000,
 *     metodoPago: METODO_PAGO.EFECTIVO
 *   });
 *   
 *   // Guardar el ID del documento para imprimir recibo
 *   const documentoId = resultado.documentoId;
 *   console.log("Documento procesado con ID:", documentoId);
 *   return documentoId;
 * }
 * 
 * // PASO 4: Imprimir recibo para el cliente
 * async function ejemploImprimirRecibo(documentoId, cliente, documento) {
 *   const resultado = await miTienda.imprimirRecibo(
 *     documentoId,
 *     cliente,
 *     documento
 *   );
 *   
 *   // Mostrar recibo en WebView
 *   webView.loadUrl(resultado.reciboUrl);
 * }
 * 
 * // Funciones adicionales
 * 
 * // Obtener lista de documentos procesados
 * async function verDocumentosProcesados() {
 *   // Documentos de los últimos 30 días
 *   const fechaInicio = new Date();
 *   fechaInicio.setDate(fechaInicio.getDate() - 30);
 *   
 *   const documentos = await miTienda.obtenerDocumentos({
 *     desde: fechaInicio
 *   });
 *   
 *   console.log(`Documentos procesados: ${documentos.length}`);
 *   return documentos;
 * }
 * 
 * // Obtener estadísticas
 * async function verEstadisticas() {
 *   const stats = await miTienda.obtenerEstadisticas();
 *   console.log(`Total documentos: ${stats.totalDocumentos}`);
 *   console.log(`Comisión pendiente: $${stats.comisionPendiente}`);
 *   console.log(`Comisión pagada: $${stats.comisionPagada}`);
 *   console.log(`Total ventas: $${stats.totalVentas}`);
 * }
 * 
 * // EJEMPLO DE FLUJO COMPLETO
 * async function ejemploCompleto() {
 *   try {
 *     // 1. Registrar cliente
 *     const clienteData = {
 *       nombre: "Juan Pérez",
 *       rut: "12.345.678-9",
 *       email: "juan@ejemplo.cl",
 *       telefono: "912345678"
 *     };
 *     const resultado1 = await miTienda.registrarCliente(clienteData);
 *     const clienteId = resultado1.id;
 *     
 *     // 2. Procesar documento
 *     const documentoData = {
 *       tipo: TIPO_DOCUMENTO.DECLARACION_JURADA,
 *       titulo: "Declaración jurada de residencia",
 *       detalle: "Para trámite municipal",
 *       monto: 5000,
 *       metodoPago: METODO_PAGO.EFECTIVO
 *     };
 *     const resultado2 = await miTienda.procesarDocumento(clienteId, documentoData);
 *     const documentoId = resultado2.documentoId;
 *     
 *     // 3. Imprimir recibo
 *     const resultado3 = await miTienda.imprimirRecibo(
 *       documentoId,
 *       clienteData,
 *       documentoData
 *     );
 *     
 *     // Mostrar recibo en WebView
 *     webView.loadUrl(resultado3.reciboUrl);
 *     
 *     // 4. Opcional: Ver estadísticas
 *     const stats = await miTienda.obtenerEstadisticas();
 *     console.log(`Total documentos: ${stats.totalDocumentos}`);
 *     console.log(`Comisión pendiente: $${stats.comisionPendiente}`);
 *   } catch (error) {
 *     console.error("Error en el proceso:", error);
 *   }
 * }
 */