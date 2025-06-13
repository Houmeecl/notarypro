"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const document_templates_1 = require("./document-templates");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Iniciando proceso de semillas...");
            // Ejecutar semillas de plantillas de documentos
            yield (0, document_templates_1.seedDocumentTemplates)();
            console.log("Proceso de semillas completado exitosamente.");
        }
        catch (error) {
            console.error("Error durante el proceso de semillas:", error);
            process.exit(1);
        }
    });
}
main();
