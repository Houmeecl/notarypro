import { useEffect, useRef, useState } from 'react';
import { webSocketService } from '../lib/websocket';

type WebSocketStatus = 'disconnected' | 'connecting' | 'connected';

export function useWebSocket() {
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<any>(null);
  const listenersRef = useRef<{[key: string]: (data: any) => void}>({});

  useEffect(() => {
    // Establece las callbacks para actualizar el estado
    const onConnect = () => setStatus('connected');
    const onDisconnect = () => setStatus('disconnected');
    const onError = () => setStatus('disconnected');

    // Registra los listeners
    webSocketService.on('connection', onConnect);
    webSocketService.on('disconnect', onDisconnect);
    webSocketService.on('error', onError);

    // Inicia la conexión
    webSocketService.connect();
    setStatus('connecting');

    // Limpieza al desmontar
    return () => {
      webSocketService.off('connection', onConnect);
      webSocketService.off('disconnect', onDisconnect);
      webSocketService.off('error', onError);
      webSocketService.disconnect();
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