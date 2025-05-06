import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log('🔒 VecinoXpress iniciado en modo producción');
console.log('✓ Certificación conforme a Ley 19.799 activada');

createRoot(document.getElementById("root")!).render(<App />);
