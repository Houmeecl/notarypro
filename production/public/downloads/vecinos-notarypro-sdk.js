/**
 * Vecinos NotaryPro Express SDK v1.0
 * 
 * SDK para la integración de puntos de servicio Vecinos con la plataforma NotaryPro
 * Copyright (c) 2025 CerfiDoc
 * 
 * Este archivo contiene todas las funciones necesarias para procesar documentos
 * en puntos de servicio Vecinos.
 */

// Constantes
const TIPO_DOCUMENTO = {
  DECLARACION_JURADA: 'declaracion_jurada',
  AUTORIZACION: 'autorizacion',
  CONTRATO_SIMPLE: 'contrato_simple',
  PODER_SIMPLE: 'poder_simple',
  FINIQUITO: 'finiquito'
};

const METODO_PAGO = {
  EFECTIVO: 'efectivo',
  TRANSFERENCIA: 'transferencia',
  TARJETA: 'tarjeta'
};

// Clase principal
class VecinosPOS {
  constructor(config = {}) {
    this.apiUrl = config.apiUrl || 'https://api.cerfidoc.cl/v1';
    this.partnerId = config.partnerId || null;
    this.apiKey = config.apiKey || null;
    this.modoOffline = config.modoOffline || false;
    this.offlineQueue = [];
    this._connected = false;
    this._lastSync = null;
    
    // Verificar conexión
    if (!this.modoOffline) {
      this._checkConnection();
    }
  }
  
  // Métodos públicos
  
  /**
   * Registra un nuevo cliente en el sistema
   * @param {Object} cliente - Datos del cliente
   * @returns {Promise} - Promise con los datos del cliente registrado
   */
  async registrarCliente(cliente) {
    if (!cliente.nombre || !cliente.rut) {
      throw new Error('Nombre y RUT son campos obligatorios');
    }
    
    if (this.modoOffline) {
      const clienteOffline = {
        ...cliente,
        id: this._generateTempId(),
        createdAt: new Date()
      };
      this.offlineQueue.push({
        type: 'CLIENTE',
        data: clienteOffline
      });
      return clienteOffline;
    }
    
    try {
      const response = await this._apiCall('/clientes', 'POST', cliente);
      return response;
    } catch (error) {
      console.error('Error al registrar cliente:', error);
      throw error;
    }
  }
  
  /**
   * Procesa un documento para un cliente
   * @param {Object} documento - Datos del documento
   * @param {number} clienteId - ID del cliente
   * @returns {Promise} - Promise con los datos del documento procesado
   */
  async procesarDocumento(documento, clienteId) {
    if (!documento.tipo || !documento.titulo) {
      throw new Error('Tipo y título son campos obligatorios');
    }
    
    if (!clienteId) {
      throw new Error('ID de cliente es obligatorio');
    }
    
    if (this.modoOffline) {
      const documentoOffline = {
        ...documento,
        id: this._generateTempId(),
        clienteId,
        createdAt: new Date(),
        comision: documento.monto * 0.15
      };
      this.offlineQueue.push({
        type: 'DOCUMENTO',
        data: documentoOffline
      });
      return documentoOffline;
    }
    
    try {
      const response = await this._apiCall('/documentos', 'POST', {
        ...documento,
        clienteId
      });
      return response;
    } catch (error) {
      console.error('Error al procesar documento:', error);
      throw error;
    }
  }
  
  /**
   * Genera un recibo para un documento procesado
   * @param {number} documentoId - ID del documento
   * @returns {Promise} - Promise con los datos del recibo generado
   */
  async generarRecibo(documentoId) {
    if (!documentoId) {
      throw new Error('ID de documento es obligatorio');
    }
    
    if (this.modoOffline) {
      const documento = this.offlineQueue.find(
        item => item.type === 'DOCUMENTO' && item.data.id === documentoId
      );
      
      if (!documento) {
        throw new Error('Documento no encontrado');
      }
      
      const reciboOffline = {
        id: this._generateTempId(),
        documentoId,
        createdAt: new Date(),
        montoTotal: documento.data.monto,
        comision: documento.data.comision,
        metodoPago: documento.data.metodoPago,
        codigoVerificacion: this._generateVerificationCode()
      };
      
      this.offlineQueue.push({
        type: 'RECIBO',
        data: reciboOffline
      });
      
      return reciboOffline;
    }
    
    try {
      const response = await this._apiCall(`/documentos/${documentoId}/recibo`, 'POST');
      return response;
    } catch (error) {
      console.error('Error al generar recibo:', error);
      throw error;
    }
  }
  
  /**
   * Sincroniza datos pendientes cuando la conexión vuelve
   * @returns {Promise} - Promise con el resultado de la sincronización
   */
  async sincronizar() {
    if (this.offlineQueue.length === 0) {
      return { success: true, message: 'No hay datos para sincronizar' };
    }
    
    try {
      const response = await this._apiCall('/sync', 'POST', {
        data: this.offlineQueue
      });
      
      if (response.success) {
        this.offlineQueue = [];
        this._lastSync = new Date();
      }
      
      return response;
    } catch (error) {
      console.error('Error al sincronizar datos:', error);
      throw error;
    }
  }
  
  /**
   * Verifica el estado de la conexión
   * @returns {boolean} - Estado de la conexión
   */
  isConnected() {
    return this._connected;
  }
  
  /**
   * Obtiene la última sincronización
   * @returns {Date|null} - Fecha de la última sincronización
   */
  getLastSync() {
    return this._lastSync;
  }
  
  // Métodos privados
  
  /**
   * Verifica la conexión con el servidor
   * @private
   */
  async _checkConnection() {
    try {
      const response = await this._apiCall('/ping', 'GET');
      this._connected = response.success;
      return this._connected;
    } catch (error) {
      this._connected = false;
      return false;
    }
  }
  
  /**
   * Realiza una llamada a la API
   * @private
   */
  async _apiCall(endpoint, method, data = null) {
    try {
      // Simulación de respuesta para el SDK de muestra
      return {
        success: true,
        data: {
          ...data,
          id: this._generateTempId()
        }
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Genera un ID temporal para modo offline
   * @private
   */
  _generateTempId() {
    return 'tmp_' + Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * Genera un código de verificación para documentos
   * @private
   */
  _generateVerificationCode() {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }
}

// Exportar para uso en navegador y Node.js
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = {
    VecinosPOS,
    TIPO_DOCUMENTO,
    METODO_PAGO
  };
} else {
  window.VecinosPOS = VecinosPOS;
  window.TIPO_DOCUMENTO = TIPO_DOCUMENTO;
  window.METODO_PAGO = METODO_PAGO;
}