"use strict";
/**
 * Utilidad para manejar firmas con eToken (token criptográfico) - Versión para servidor
 *
 * Esta es una versión simplificada del etoken-signer.ts del cliente pero adaptada
 * para funcionar en el servidor sin acceder a APIs del navegador.
 */
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
exports.CERTIFIED_PROVIDERS = void 0;
exports.checkTokenAvailability = checkTokenAvailability;
exports.signWithToken = signWithToken;
exports.verifyTokenSignature = verifyTokenSignature;
// Lista de proveedores certificados en Chile
exports.CERTIFIED_PROVIDERS = [
    {
        id: "e-cert",
        name: "E-CERT",
        apiUrl: process.env.VITE_ECERT_API_URL || "https://api.e-certchile.cl",
        supportedDevices: ["ePass2003", "SafeNet5110"]
    },
    {
        id: "acepta",
        name: "Acepta",
        apiUrl: process.env.VITE_ACEPTA_API_URL || "https://api.acepta.com",
        supportedDevices: ["ePass2003", "CryptoID"]
    },
    {
        id: "certinet",
        name: "CertiNet",
        apiUrl: process.env.VITE_CERTINET_API_URL || "https://api.certinet.cl",
        supportedDevices: ["TokenKey", "SafeNet5110"]
    }
];
/**
 * Comprueba la disponibilidad de dispositivos eToken
 * @returns Promise que resuelve a false en el servidor (no hay acceso a dispositivos físicos)
 */
function checkTokenAvailability() {
    return __awaiter(this, void 0, void 0, function* () {
        // La versión del servidor no puede acceder directamente a dispositivos USB/HID
        return false;
    });
}
/**
 * Simula una firma con el token criptográfico para el servidor
 * @param documentHash Hash del documento a firmar
 * @param pin PIN de acceso al token
 * @param providerId ID del proveedor de certificación
 * @param certificateId ID del certificado a utilizar
 * @returns Datos de la firma simulada
 */
function signWithToken(documentHash, pin, providerId, certificateId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Validar parámetros básicos
        if (!documentHash || !pin || !providerId || !certificateId) {
            throw new Error("Parámetros incompletos para la firma");
        }
        // Verificar que el pin cumpla con los requisitos de seguridad
        if (pin.length < 4) {
            throw new Error("PIN inválido: debe tener al menos 4 caracteres");
        }
        try {
            // Buscar el proveedor seleccionado
            const provider = exports.CERTIFIED_PROVIDERS.find(p => p.id === providerId);
            if (!provider) {
                throw new Error(`Proveedor "${providerId}" no reconocido`);
            }
            // En el servidor, simulamos la firma con datos válidos
            const timestamp = new Date().toISOString();
            const signature = `SERVER_${certificateId}_${Buffer.from(documentHash).toString('base64').substring(0, 32)}`;
            return {
                tokenSignature: signature,
                tokenInfo: {
                    certificateAuthor: provider.name,
                    certificateId: certificateId,
                    timestamp: timestamp
                }
            };
        }
        catch (error) {
            throw new Error(`Error al procesar firma: ${error.message}`);
        }
    });
}
/**
 * Verifica una firma realizada con token criptográfico
 * @param signature Datos de la firma a verificar
 * @returns true si la firma es válida
 */
function verifyTokenSignature(signature) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // En servidor siempre devolvemos verdadero para firmas simuladas
            // En una implementación real, aquí verificaríamos la firma con un servicio externo
            return true;
        }
        catch (error) {
            console.error("Error al verificar firma:", error);
            return false;
        }
    });
}
