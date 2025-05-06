/**
 * Servicio WebSocket para comunicación en tiempo real
 * Esta implementación es tolerante a fallos para evitar que bloquee la aplicación
 */

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimeout: any = null;
  private listeners: Map<string, Array<(data: any) => void>> = new Map();
  private connectionEnabled: boolean = true; // Flag para control de conexión

  /**
   * Inicializa la conexión WebSocket
   */
  public connect() {
    // Si se ha desactivado la conexión, no intentar conectar
    if (!this.connectionEnabled) {
      console.log("WebSocket está desactivado, no se intentará conectar");
      return;
    }

    // Si ya está conectado, no hacer nada
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log("WebSocket ya está conectado");
      return;
    }
    
    // Limpiar conexión anterior si existe
    if (this.socket) {
      this.disconnect();
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      // Aseguramos usar un path único para evitar conflictos con el HMR de Vite en Replit
      const wsUrl = `${protocol}//${window.location.host}/api/websocket`;
      
      console.log("Intentando conectar a WebSocket:", wsUrl);
      
      // Protección de error con timeout para evitar bloqueos
      const connectionTimeout = setTimeout(() => {
        console.log("Timeout al conectar WebSocket - continuando sin él");
        this.disableConnection();
      }, 5000);
      
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log("Conexión WebSocket establecida exitosamente");
        this.notifyListeners("connection", { status: "connected" });
        
        // Limpiar cualquier timeout de reconexión
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
      };
      
      // Configurar handlers inmediatamente
      this.setupSocketHandlers();
      
    } catch (error) {
      console.error("Error al crear conexión WebSocket:", error);
      // Si falla más de X veces, desactivar WebSocket completamente
      this.failConnectionAttempt();
    }
  }
  
  /**
   * Configura los manejadores de eventos del socket
   * Esta función se separa para mejorar la legibilidad y mantenimiento
   */
  private setupSocketHandlers() {
    if (!this.socket) return;
    
    this.socket.onmessage = (event) => {
      try {
        // Asegurarse de que estamos trabajando con una cadena
        const dataString = typeof event.data === 'string' 
          ? event.data 
          : new TextDecoder().decode(event.data as ArrayBuffer);
        
        const data = JSON.parse(dataString);
        if (data && data.type) {
          this.notifyListeners(data.type, data);
        }
      } catch (error) {
        console.error("Error al procesar mensaje WebSocket:", error);
      }
    };

    this.socket.onclose = () => {
      console.log("Conexión WebSocket cerrada");
      this.notifyListeners("disconnect", { status: "disconnected" });
      
      // Solo intentar reconectar si la conexión está habilitada
      if (this.connectionEnabled) {
        this.scheduleReconnect(5000);
      }
    };

    this.socket.onerror = (error) => {
      console.error("Error de WebSocket:", { error });
      this.notifyListeners("error", { error });
      this.failConnectionAttempt();
    };
  }
  
  /**
   * Registra un intento fallido de conexión 
   * Después de varios intentos, desactiva completamente el WebSocket
   */
  private failCount = 0;
  private failConnectionAttempt() {
    this.failCount++;
    console.log(`Intento fallido de conexión: ${this.failCount}`);
    
    // Después de solo 1 intento fallido, desactivar WebSocket 
    // para evitar bucles de reconexión que afecten la experiencia
    if (this.failCount >= 1) {
      console.log("Desactivando WebSocket para evitar problemas de conexión");
      this.disableConnection();
    } else {
      this.scheduleReconnect();
    }
  }
  
  /**
   * Desactiva completamente la conexión WebSocket
   */
  private disableConnection() {
    this.connectionEnabled = false;
    this.disconnect();
    console.log("WebSocket desactivado permanentemente para esta sesión");
    this.notifyListeners("disabled", { 
      reason: "Connection failed repeatedly", 
      message: "La conexión WebSocket ha sido desactivada debido a errores repetidos" 
    });
  }

  /**
   * Cierra la conexión WebSocket
   */
  public disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Envía un mensaje al servidor
   */
  public send(type: string, data: any = {}) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type,
        ...data
      }));
      return true;
    } else {
      console.warn("Intento de enviar mensaje mientras WebSocket no está conectado");
      return false;
    }
  }

  /**
   * Registra un listener para un tipo de evento específico
   */
  public on(type: string, callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)?.push(callback);
  }

  /**
   * Elimina un listener para un tipo de evento específico
   */
  public off(type: string, callback: (data: any) => void) {
    if (this.listeners.has(type)) {
      const callbacks = this.listeners.get(type) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Notifica a todos los listeners de un evento
   */
  private notifyListeners(type: string, data: any) {
    if (this.listeners.has(type)) {
      const callbacks = this.listeners.get(type) || [];
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error en listener para ${type}:`, error);
        }
      });
    }
  }

  /**
   * Verifica si la conexión WebSocket está activa
   */
  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
  
  /**
   * Programa un intento de reconexión
   */
  private scheduleReconnect(delay: number = 3000) {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    console.log(`Programando reconexión en ${delay}ms...`);
    this.reconnectTimeout = setTimeout(() => {
      console.log("Intentando reconectar...");
      this.connect();
    }, delay);
  }
}

// Exportamos una instancia singleton
export const webSocketService = new WebSocketService();