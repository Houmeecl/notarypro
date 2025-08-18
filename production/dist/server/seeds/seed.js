"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const document_templates_1 = require("./document-templates");
const seed_pos_devices_1 = require("./seed-pos-devices");
async function main() {
    try {
        console.log("Iniciando proceso de semillas...");
        // Ejecutar semillas de plantillas de documentos
        await (0, document_templates_1.seedDocumentTemplates)();
        // Ejecutar semillas de dispositivos POS
        await (0, seed_pos_devices_1.seedPosDevices)();
        console.log("Proceso de semillas completado exitosamente.");
    }
    catch (error) {
        console.error("Error durante el proceso de semillas:", error);
        process.exit(1);
    }
}
main();
