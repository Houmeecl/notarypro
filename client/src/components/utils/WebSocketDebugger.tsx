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

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 p-3 rounded-lg shadow-md z-50 text-xs">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">WebSocket Debug</h3>
        <span className={`px-2 py-1 rounded-full text-white ${status === 'connected' ? 'bg-green-500' : status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}`}>
          {status}
        </span>
      </div>
      
      <div className="mt-2">
        <p>Pings enviados: {pingCount}</p>
      </div>
      
      <div className="mt-2">
        <p className="font-semibold">Últimos mensajes:</p>
        {messages.length === 0 ? (
          <p className="italic">No hay mensajes</p>
        ) : (
          <ul className="max-h-32 overflow-y-auto list-disc pl-5">
            {messages.map((msg, idx) => (
              <li key={idx} className="truncate max-w-xs">
                {msg}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button 
          onClick={() => send("ping", { type: "manual" })}
          className="bg-blue-500 text-white rounded px-2 py-1 text-xs"
        >
          Enviar Ping
        </button>
        
        <button 
          onClick={() => location.reload()}
          className="bg-red-500 text-white rounded px-2 py-1 text-xs"
        >
          Refrescar
        </button>
      </div>
    </div>
  );
}