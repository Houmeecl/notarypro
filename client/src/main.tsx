import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { activarModoFuncional } from "./lib/modoFuncionalActivator";

// Activar explícitamente el modo funcional
activarModoFuncional();

// Exponer la función de activación como global para consola de desarrollador
(window as any).activarModoFuncional = activarModoFuncional;

// Agregar logs adicionales de confirmación
console.log('🔒 VecinoXpress iniciado en modo real funcional (QA sin verificaciones)');
console.log('🔧 Todas las verificaciones internas y RON configurados para funcionar sin interrupciones');

createRoot(document.getElementById("root")!).render(<App />);
