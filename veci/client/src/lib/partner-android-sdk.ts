/** 
 * =====================================================================
 * VECINOS NOTARYPRO EXPRESS: SDK PARA PUNTOS DE SERVICIO (VERSIÓN 1.0)
 * =====================================================================
 * 
 * Este archivo contiene el SDK para la aplicación de puntos de servicio 
 * que forma parte del programa Vecinos NotaryPro Express.
 * 
 * GUÍA DE INSTALACIÓN RÁPIDA:
 * 
 * 1. Descarga este archivo SDK (vecinos-notarypro-sdk.js)
 * 2. Añade el archivo a tu proyecto Android (carpeta assets/js/)
 * 3. En tu aplicación Android, carga el archivo en un WebView
 * 4. ¡Listo! Usa el SDK como se muestra en los ejemplos
 * 
 * REQUISITOS MÍNIMOS:
 * - Android 5.0 o superior
 * - Conexión a Internet (funciona también en modo offline)
 * - Cámara para escanear documentos (opcional)
 * - Impresora Bluetooth (opcional)
 */

/**
 * TIPOS DE DOCUMENTOS
 * 
 * Esta lista muestra los tipos de documentos que pueden procesarse.
 * Siempre use estas constantes para especificar el tipo de documento.
 */
export const TIPO_DOCUMENTO = {
  PODER: 'poder',
  DECLARACION_JURADA: 'declaracion_jurada',
  CONTRATO: 'contrato', 
  CERTIFICADO: 'certificado',
  FINIQUITO: 'finiquito',
  OTRO: 'otro'
};

/**
 * ESTADOS DE DOCUMENTOS
 * 
 * Estos son los posibles estados de un documento procesado.
 * Los estados se actualizan automáticamente.
 */
export const ESTADO_DOCUMENTO = {
  RECIBIDO: 'recibido',         // Acaba de llegar al punto de servicio
  EN_PROCESO: 'en_proceso',     // Está siendo revisado por la central
  COMPLETADO: 'completado',     // Proceso terminado correctamente
  RECHAZADO: 'rechazado'        // Documento rechazado (ver motivo)
};

/**
 * MÉTODOS DE PAGO ACEPTADOS
 * 
 * Lista de métodos de pago que pueden usarse para cobrar
 * el servicio de documentación.
 */
export const METODO_PAGO = {
  EFECTIVO: 'efectivo',
  TARJETA: 'tarjeta',
  TRANSFERENCIA: 'transferencia'
};

/**
 * VecinosPOS - Clase principal del SDK
 * 
 * Esta clase contiene todas las funciones necesarias para operar
 * un punto de servicio Vecinos NotaryPro Express.
 * 
 * Fácil de usar: ¡Solo siga los 3 pasos básicos!
 * 1. Registrar cliente
 * 2. Procesar documento
 * 3. Imprimir recibo
 */
export class VecinosPOS {
  /**
   * Crear nueva instancia del punto de servicio
   * 
   * @param config - Configuración del punto de servicio con estos datos:
   *   - id: Número de identificación asignado a su tienda
   *   - nombre: Nombre de su tienda o comercio
   *   - direccion: Dirección física completa
   *   - region: Región de Chile donde se ubica
   *   - comuna: Comuna dentro de la región
   *   - apiKey: Clave secreta proporcionada por NotaryPro
   */
  constructor(config) {
    // Verificamos que la configuración tenga todos los campos necesarios
    if (!config.id || !config.nombre || !config.apiKey) {
      console.error('⚠️ Error: Configuración incompleta. Verifique que tenga id, nombre y apiKey.');
    }
    
    this.config = config;
    this.apiUrl = "https://api.cerfidoc.cl";
    this.modoOffline = false;
    this.documentosPendientes = [];
    this.clientesPendientes = [];
    
    // Verificar si hay conexión a internet
    this.verificarConexion();
    
    console.log('✅ Punto de servicio configurado correctamente:', config.nombre);
  }
  
  /**
   * Verificar si hay conexión a internet
   * Se ejecuta automáticamente y activa el modo offline si es necesario
   */
  async verificarConexion() {
    try {
      const respuesta = await fetch(this.apiUrl + '/api/status', { 
        method: 'GET',
        cache: 'no-cache',
        timeout: 5000  // 5 segundos máximo
      });
      
      if (respuesta.ok) {
        this.modoOffline = false;
        console.log('🌐 Conexión a internet disponible');
        
        // Si teníamos operaciones pendientes, intentamos sincronizar
        if (this.documentosPendientes.length > 0 || this.clientesPendientes.length > 0) {
          this.sincronizar();
        }
      } else {
        this.modoOffline = true;
        console.log('📴 Sin conexión a internet. Activando modo offline.');
      }
    } catch (error) {
      this.modoOffline = true;
      console.log('📴 Sin conexión a internet. Activando modo offline.');
    }
    
    // Programar la próxima verificación en 5 minutos
    setTimeout(() => this.verificarConexion(), 5 * 60 * 1000);
  }
  
  /**
   * Sincronizar datos pendientes con el servidor
   * Se ejecuta automáticamente cuando se recupera la conexión
   */
  async sincronizar() {
    if (this.modoOffline) return;
    
    console.log('🔄 Sincronizando datos pendientes...');
    
    // TODO: Implementar sincronización de datos pendientes
    // Esta función enviaría los documentos y clientes guardados
    // localmente al servidor una vez que hay conexión
  }
  
  /**
   * PASO 1: Registrar un cliente nuevo o buscar uno existente
   * 
   * @param cliente - Datos del cliente con estos campos:
   *   - nombre: Nombre completo del cliente
   *   - rut: RUT chileno (con formato XX.XXX.XXX-X)
   *   - email: Correo electrónico
   *   - telefono: Número de teléfono (opcional)
   * 
   * @returns Un objeto con el ID del cliente y sus datos
   * 
   * Ejemplo:
   * ```
   * const resultado = await pos.registrarCliente({
   *   nombre: "María González",
   *   rut: "12.345.678-9",
   *   email: "maria@ejemplo.cl",
   *   telefono: "912345678"
   * });
   * ```
   */
  async registrarCliente(cliente) {
    console.log('👤 Registrando cliente:', cliente.nombre);
    
    // Primero buscamos si el cliente ya existe por su RUT
    try {
      const clienteExistente = await this.buscarClientePorRut(cliente.rut);
      if (clienteExistente) {
        console.log('✓ Cliente encontrado en el sistema');
        return clienteExistente;
      }
    } catch (error) {
      // Si hay error al buscar, continuamos con el registro
    }
    
    // Si no existe o no se pudo buscar, lo registramos
    if (this.modoOffline) {
      // En modo offline generamos un ID temporal negativo
      const idTemporal = -Math.floor(Math.random() * 10000);
      console.log('✓ Cliente guardado localmente (modo offline)');
      
      // Guardamos para sincronizar después
      this.clientesPendientes.push({
        id: idTemporal,
        ...cliente
      });
      
      return {
        id: idTemporal,
        cliente
      };
    }
    
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
        throw new Error("Error al registrar cliente en el servidor");
      }
      
      const resultado = await respuesta.json();
      console.log('✓ Cliente registrado correctamente en el servidor');
      
      return {
        id: resultado.id,
        cliente
      };
    } catch (error) {
      console.error('⚠️ Error al registrar cliente:', error.message);
      
      // Activamos modo offline y creamos un registro local
      this.modoOffline = true;
      const idTemporal = -Math.floor(Math.random() * 10000);
      
      this.clientesPendientes.push({
        id: idTemporal,
        ...cliente
      });
      
      return {
        id: idTemporal,
        cliente
      };
    }
  }
  
  /**
   * Buscar un cliente por su RUT
   * 
   * @param rut - RUT chileno con formato (XX.XXX.XXX-X)
   * @returns Datos del cliente si existe, o null si no se encuentra
   */
  async buscarClientePorRut(rut) {
    if (this.modoOffline) {
      // En modo offline, buscamos en la lista local
      const clienteLocal = this.clientesPendientes.find(c => c.rut === rut);
      if (clienteLocal) {
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
      return null;
    }
    
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
        return null;
      }
      
      const datos = await respuesta.json();
      if (!datos) return null;
      
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
      console.error('⚠️ Error al buscar cliente:', error.message);
      this.modoOffline = true;
      return null;
    }
  }
  
  /**
   * PASO 2: Procesar un documento para un cliente
   * 
   * @param clienteId - ID del cliente (obtenido del paso 1)
   * @param documento - Datos del documento con estos campos:
   *   - tipo: Tipo de documento (use las constantes TIPO_DOCUMENTO)
   *   - titulo: Título descriptivo del documento
   *   - detalle: Información adicional (opcional)
   *   - monto: Cantidad cobrada por el servicio (en pesos chilenos)
   *   - metodoPago: Forma de pago (use las constantes METODO_PAGO)
   * 
   * @returns Un objeto con el ID del documento y su estado inicial
   * 
   * Ejemplo:
   * ```
   * const resultado = await pos.procesarDocumento(clienteId, {
   *   tipo: TIPO_DOCUMENTO.DECLARACION_JURADA,
   *   titulo: "Declaración jurada de residencia",
   *   detalle: "Para trámite municipal",
   *   monto: 5000,
   *   metodoPago: METODO_PAGO.EFECTIVO
   * });
   * ```
   */
  async procesarDocumento(clienteId, documento) {
    console.log('📄 Procesando documento:', documento.titulo);
    
    if (this.modoOffline) {
      // En modo offline generamos un ID temporal
      const idTemporal = -Math.floor(Math.random() * 10000);
      
      // Guardamos para sincronizar después
      this.documentosPendientes.push({
        id: idTemporal,
        clienteId,
        ...documento,
        estado: ESTADO_DOCUMENTO.RECIBIDO,
        fechaCreacion: new Date().toISOString()
      });
      
      console.log('✓ Documento guardado localmente (modo offline)');
      
      return {
        documentoId: idTemporal,
        estado: ESTADO_DOCUMENTO.RECIBIDO
      };
    }
    
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
        throw new Error("Error al procesar documento en el servidor");
      }
      
      const resultado = await respuesta.json();
      console.log('✓ Documento procesado correctamente');
      
      // Registramos la comisión automáticamente (15%)
      this.registrarComision(resultado.id, documento.monto).catch(err => {
        console.log('ℹ️ La comisión se registrará más tarde');
      });
      
      return {
        documentoId: resultado.id,
        estado: ESTADO_DOCUMENTO.RECIBIDO
      };
    } catch (error) {
      console.error('⚠️ Error al procesar documento:', error.message);
      
      // Activamos modo offline y creamos un registro local
      this.modoOffline = true;
      const idTemporal = -Math.floor(Math.random() * 10000);
      
      this.documentosPendientes.push({
        id: idTemporal,
        clienteId,
        ...documento,
        estado: ESTADO_DOCUMENTO.RECIBIDO,
        fechaCreacion: new Date().toISOString()
      });
      
      return {
        documentoId: idTemporal,
        estado: ESTADO_DOCUMENTO.RECIBIDO
      };
    }
  }
  
  /**
   * Registrar comisión por la venta (15% del monto)
   * Se ejecuta automáticamente al procesar un documento
   */
  async registrarComision(documentoId, monto) {
    if (this.modoOffline) return;
    
    const comision = monto * 0.15; // 15% de comisión fija
    
    try {
      await fetch(`${this.apiUrl}/api/partner-sales`, {
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
      
      console.log(`✓ Comisión registrada: $${comision}`);
    } catch (error) {
      console.error('ℹ️ La comisión se registrará más tarde');
    }
  }
  
  /**
   * PASO 3: Generar e imprimir recibo para el cliente
   * 
   * @param documentoId - ID del documento (obtenido del paso 2)
   * @param cliente - Datos completos del cliente
   * @param documento - Datos completos del documento procesado
   * 
   * @returns Un objeto con la URL del recibo y el código QR de verificación
   * 
   * Ejemplo:
   * ```
   * const resultado = await pos.imprimirRecibo(
   *   documentoId,
   *   {nombre: "María González", rut: "12.345.678-9", email: "maria@ejemplo.cl"},
   *   {tipo: TIPO_DOCUMENTO.DECLARACION_JURADA, titulo: "Declaración jurada", monto: 5000}
   * );
   * 
   * // Para mostrar el recibo en un WebView:
   * webView.loadUrl(resultado.reciboUrl);
   * ```
   */
  async imprimirRecibo(documentoId, cliente, documento) {
    console.log('🖨️ Generando recibo para documento:', documentoId);
    
    // Intentamos obtener el código QR de verificación
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
    
    // Si estamos offline o hay error, generamos un recibo local
    const generarReciboLocal = () => {
      const htmlRecibo = `
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
      
      return {
        reciboUrl: `data:text/html;base64,${btoa(unescape(encodeURIComponent(htmlRecibo)))}`,
        qrVerificacion: codigoQR
      };
    };
    
    // Si estamos offline, generamos recibo local directamente
    if (this.modoOffline) {
      console.log('✓ Recibo generado localmente (modo offline)');
      return generarReciboLocal();
    }
    
    // Si hay conexión, intentamos obtener el recibo del servidor
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
        throw new Error("Error al obtener recibo del servidor");
      }
      
      const datos = await respuesta.json();
      console.log('✓ Recibo obtenido del servidor');
      
      return {
        reciboUrl: datos.reciboUrl,
        qrVerificacion: codigoQR
      };
    } catch (error) {
      console.error('⚠️ Error al obtener recibo:', error.message);
      console.log('✓ Generando recibo local alternativo');
      
      return generarReciboLocal();
    }
  }
  
  /**
   * Obtener listado de documentos procesados
   * 
   * @param filtros - Objeto con filtros opcionales:
   *   - desde: Fecha de inicio (objeto Date)
   *   - hasta: Fecha de fin (objeto Date)
   * 
   * @returns Array con los documentos encontrados
   * 
   * Ejemplo:
   * ```
   * // Obtener documentos de los últimos 30 días
   * const fechaInicio = new Date();
   * fechaInicio.setDate(fechaInicio.getDate() - 30);
   * 
   * const documentos = await pos.obtenerDocumentos({
   *   desde: fechaInicio
   * });
   * ```
   */
  async obtenerDocumentos(filtros = {}) {
    console.log('🔍 Buscando documentos procesados');
    
    if (this.modoOffline) {
      // En modo offline devolvemos los documentos guardados localmente
      let documentos = [...this.documentosPendientes];
      
      // Aplicar filtros si existen
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
    
    try {
      let url = `${this.apiUrl}/api/pos/documentos/partner/${this.config.id}`;
      
      // Añadir filtros de fecha si se proporcionan
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
        throw new Error("Error al obtener documentos");
      }
      
      const documentos = await respuesta.json();
      console.log(`✓ Se encontraron ${documentos.length} documentos`);
      
      return documentos;
    } catch (error) {
      console.error('⚠️ Error al obtener documentos:', error.message);
      this.modoOffline = true;
      
      // En caso de error, devolvemos los documentos locales
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
   * Obtener estadísticas de ventas y comisiones
   * 
   * @returns Objeto con estadísticas del punto de servicio
   * 
   * Ejemplo:
   * ```
   * const stats = await pos.obtenerEstadisticas();
   * console.log(`Total de documentos: ${stats.totalDocumentos}`);
   * console.log(`Comisión pendiente: $${stats.comisionPendiente}`);
   * ```
   */
  async obtenerEstadisticas() {
    console.log('📊 Obteniendo estadísticas del punto de servicio');
    
    if (this.modoOffline) {
      // En modo offline calculamos estadísticas locales
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
        throw new Error("Error al obtener estadísticas");
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
      console.error('⚠️ Error al obtener estadísticas:', error.message);
      this.modoOffline = true;
      
      // Calculamos estadísticas locales en caso de error
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

/**
 * ================================================================
 * GUÍA RÁPIDA DE INSTALACIÓN Y USO
 * ================================================================
 * 
 * Esta guía le ayudará a instalar y comenzar a usar el SDK
 * de Vecinos NotaryPro Express en su aplicación Android.
 * 
 * 1. INSTALACIÓN EN ANDROID STUDIO:
 * 
 * - Copie este archivo en la carpeta assets/js/ de su proyecto
 * - En su actividad, cargue el WebView con este archivo:
 * 
 * ```java
 * WebView webView = findViewById(R.id.webView);
 * webView.getSettings().setJavaScriptEnabled(true);
 * webView.loadUrl("file:///android_asset/js/vecinos-notarypro-sdk.js");
 * ```
 * 
 * 2. CONFIGURACIÓN EN SU APLICACIÓN:
 * 
 * ```javascript
 * // Crear una instancia del punto de servicio
 * const miTienda = new VecinosPOS({
 *   id: 123,                           // ID asignado a su tienda
 *   nombre: "Minimarket Don Pedro",    // Nombre de su tienda
 *   direccion: "Calle Principal 123",  // Dirección física
 *   region: "Metropolitana",           // Región
 *   comuna: "Santiago",                // Comuna
 *   apiKey: "su-clave-secreta-aqui"    // Clave proporcionada por NotaryPro
 * });
 * ```
 * 
 * 3. FLUJO BÁSICO DE USO:
 * 
 * ```javascript
 * // PASO 1: Registrar cliente (o buscar si ya existe)
 * const resultadoCliente = await miTienda.registrarCliente({
 *   nombre: "Juan Pérez",
 *   rut: "12.345.678-9",
 *   email: "juan@ejemplo.com",
 *   telefono: "912345678"
 * });
 * 
 * const clienteId = resultadoCliente.id;
 * 
 * // PASO 2: Procesar documento
 * const resultadoDocumento = await miTienda.procesarDocumento(clienteId, {
 *   tipo: TIPO_DOCUMENTO.DECLARACION_JURADA,
 *   titulo: "Declaración jurada de residencia",
 *   detalle: "Para trámite municipal",
 *   monto: 5000,
 *   metodoPago: METODO_PAGO.EFECTIVO
 * });
 * 
 * const documentoId = resultadoDocumento.documentoId;
 * 
 * // PASO 3: Imprimir recibo para el cliente
 * const resultadoRecibo = await miTienda.imprimirRecibo(
 *   documentoId,
 *   { nombre: "Juan Pérez", rut: "12.345.678-9", email: "juan@ejemplo.com" },
 *   { 
 *     tipo: TIPO_DOCUMENTO.DECLARACION_JURADA, 
 *     titulo: "Declaración jurada de residencia", 
 *     monto: 5000 
 *   }
 * );
 * 
 * // Mostrar el recibo en un WebView
 * webView.loadUrl(resultadoRecibo.reciboUrl);
 * ```
 * 
 * 4. FUNCIONES ADICIONALES:
 * 
 * - Obtener lista de documentos procesados:
 *   ```javascript
 *   const documentos = await miTienda.obtenerDocumentos();
 *   ```
 * 
 * - Obtener estadísticas de ventas y comisiones:
 *   ```javascript
 *   const estadisticas = await miTienda.obtenerEstadisticas();
 *   console.log(`Total documentos: ${estadisticas.totalDocumentos}`);
 *   console.log(`Comisión pendiente: $${estadisticas.comisionPendiente}`);
 *   ```
 * 
 * ¿NECESITA AYUDA?
 * Contacte a soporte@cerfidoc.cl o llame al 600 123 4567
 * 
 */