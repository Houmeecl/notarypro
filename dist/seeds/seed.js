"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const document_templates_1 = require("./document-templates");
async function main() {
    try {
        console.log("Iniciando proceso de semillas...");
        // Ejecutar semillas de plantillas de documentos
        await (0, document_templates_1.seedDocumentTemplates)();
        console.log("Proceso de semillas completado exitosamente.");
    }
    catch (error) {
        console.error("Error durante el proceso de semillas:", error);
        process.exit(1);
    }
}
main();
