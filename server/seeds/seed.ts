import { seedDocumentTemplates } from "./document-templates";
import { seedPosDevices } from "./seed-pos-devices";

async function main() {
  try {
    console.log("Iniciando proceso de semillas...");
    
    // Ejecutar semillas de plantillas de documentos
    await seedDocumentTemplates();
    
    // Ejecutar semillas de dispositivos POS
    await seedPosDevices();
    
    console.log("Proceso de semillas completado exitosamente.");
  } catch (error) {
    console.error("Error durante el proceso de semillas:", error);
    process.exit(1);
  }
}

main();