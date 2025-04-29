/**
 * Servicio WebSocket para comunicación en tiempo real
 */

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimeout: any = null;
  private listeners: Map<string, Array<(data: any) => void>> = new Map();

  /**
   * Inicializa la conexión WebSocket
   */
  public connect() {
    if (this.socket) {
      this.disconnect();
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log("Conexión WebSocket establecida");
      this.notifyListeners("connection", { status: "connected" });
      
      // Limpiar cualquier timeout de reconexión
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    };

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
      
      // Intentar reconectar después de 5 segundos
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, 5000);
    };

    this.socket.onerror = (error) => {
      console.error("Error en la conexión WebSocket:", error);
      this.notifyListeners("error", { error });
    };
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
    if (this.socket && this.socket.readyState === 1) { // 1 = OPEN
      this.socket.send(JSON.stringify({
        type,
        ...data
      }));
      return true;
    }
    return false;
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
    return this.socket !== null && this.socket.readyState === 1; // 1 = OPEN
  }
}

// Exportamos una instancia singleton
export const webSocketService = new WebSocketService();