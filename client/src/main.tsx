import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Configuración inicial - Forzar modo real
(() => {
  // Eliminar cualquier forzado de modo demo
  localStorage.removeItem('vx_force_demo');
  
  // Establecer configuración explícita para modo real
  const deviceModeConfig = {
    mode: 'real', // DeviceMode.REAL
    demoDeviceIds: [], // No hay dispositivos en modo demo
    realDeviceIds: ['*'], // Todos los dispositivos son reales
    forceDemoParameter: '', // Parámetro deshabilitado para modo demo
    forceRealParameter: 'real'
  };

  // Guardar configuración en localStorage
  localStorage.setItem('vx_device_mode_config', JSON.stringify(deviceModeConfig));
  
  console.log('🔒 VecinoXpress iniciado en modo real exclusivo (notarial)');
})();

createRoot(document.getElementById("root")!).render(<App />);
