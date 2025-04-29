import { useEffect, useRef, useState } from 'react';
import { webSocketService } from '../lib/websocket';

type WebSocketStatus = 'disconnected' | 'connecting' | 'connected';

export function useWebSocket() {
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<any>(null);
  const listenersRef = useRef<{[key: string]: (data: any) => void}>({});
  const connectionAttemptRef = useRef(0);

  useEffect(() => {
    // Establece las callbacks para actualizar el estado
    const onConnect = (data: any) => {
      console.log("WebSocket conectado:", data);
      setStatus('connected');
      connectionAttemptRef.current = 0; // Resetear contador de intentos cuando conecta
    };
    
    const onDisconnect = () => {
      console.log("WebSocket desconectado");
      setStatus('disconnected');
    };
    
    const onError = (error: any) => {
      console.error("Error de WebSocket:", error);
      setStatus('disconnected');
      
      // Incrementar contador de intentos, pero mantener un máximo
      connectionAttemptRef.current = Math.min(connectionAttemptRef.current + 1, 5);
    };

    // Registra los listeners
    webSocketService.on('connection', onConnect);
    webSocketService.on('disconnect', onDisconnect);
    webSocketService.on('error', onError);

    // Iniciar la conexión solo si no está ya conectado
    if (!webSocketService.isConnected()) {
      console.log("Iniciando conexión WebSocket desde hook...");
      webSocketService.connect();
      setStatus('connecting');
    } else {
      console.log("WebSocket ya conectado");
      setStatus('connected');
    }

    // Limpieza al desmontar
    return () => {
      console.log("Limpiando listeners WebSocket");
      webSocketService.off('connection', onConnect);
      webSocketService.off('disconnect', onDisconnect);
      webSocketService.off('error', onError);
      
      // No desconectar automáticamente, ya que otros componentes podrían estar usando la conexión
      // webSocketService.disconnect();
    };
  }, []);

  // Función para registrar un listener para un tipo de mensaje
  const subscribe = (type: string, callback: (data: any) => void) => {
    if (!listenersRef.current[type]) {
      listenersRef.current[type] = (data: any) => {
        setLastMessage(data);
        callback(data);
      };
      webSocketService.on(type, listenersRef.current[type]);
    }
  };

  // Función para eliminar un listener
  const unsubscribe = (type: string) => {
    if (listenersRef.current[type]) {
      webSocketService.off(type, listenersRef.current[type]);
      delete listenersRef.current[type];
    }
  };

  // Función para enviar un mensaje
  const send = (type: string, data: any = {}) => {
    return webSocketService.send(type, data);
  };

  return {
    status,
    isConnected: status === 'connected',
    lastMessage,
    subscribe,
    unsubscribe,
    send
  };
}