import { useWebSocket } from "@/hooks/use-websocket";
import { useEffect, useState } from "react";

/**
 * Componente para mostrar el estado de la conexión WebSocket (usado para debugging)
 */
export function WebSocketDebugger() {
  const { status, isConnected, subscribe, unsubscribe, send } = useWebSocket();
  const [messages, setMessages] = useState<string[]>([]);
  const [pingCount, setPingCount] = useState(0);

  useEffect(() => {
    // Suscribirse a todos los mensajes
    const handleMessage = (data: any) => {
      setMessages((prev) => [...prev, JSON.stringify(data)].slice(-5));
    };

    subscribe("connection", handleMessage);
    subscribe("disconnect", handleMessage);
    subscribe("error", handleMessage);
    subscribe("document_update", handleMessage);
    subscribe("notification", handleMessage);

    // Limpiar suscripciones
    return () => {
      unsubscribe("connection");
      unsubscribe("disconnect");
      unsubscribe("error");
      unsubscribe("document_update");
      unsubscribe("notification");
    };
  }, [subscribe, unsubscribe]);

  // Enviar un ping periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        send("ping", { timestamp: new Date().toISOString() });
        setPingCount((count) => count + 1);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isConnected, send]);

  // Desactivado para todos los entornos
  return null;
}