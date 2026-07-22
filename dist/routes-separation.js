"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const http_1 = require("http");
const vecinos_routes_1 = require("./vecinos/vecinos-routes");
const notarypro_routes_1 = require("./notarypro/notarypro-routes");
const identity_api_routes_1 = require("./identity-api-routes");
const ron_routes_1 = require("./ron-routes");
const getapi_routes_1 = require("./getapi-routes");
const mercadopago_routes_1 = require("./mercadopago-routes");
const ws_1 = require("ws");
const auth_1 = require("./auth");
// Middlewares de verificación de plataforma
function checkVecinosPlatform(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.user.platform !== "vecinos") {
        return res.status(403).json({ message: "Forbidden: This endpoint is only for Vecinos platform" });
    }
    next();
}
function checkNotaryProPlatform(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.user.platform !== "notarypro") {
        return res.status(403).json({ message: "Forbidden: This endpoint is only for NotaryPro platform" });
    }
    next();
}
// Función principal que registra las rutas separadas por plataforma
async function registerRoutes(app) {
    // Configuración de autenticación compartida
    (0, auth_1.setupAuth)(app);
    // Rutas específicas para Vecinos
    app.use("/api/vecinos", vecinos_routes_1.vecinosRouter);
    // Rutas específicas para NotaryPro
    app.use("/api/notarypro", notarypro_routes_1.notaryproRouter);
    // Rutas compartidas (con verificación de plataforma cuando sea necesario)
    app.use("/api/identity", identity_api_routes_1.identityApiRouter);
    app.use("/api/ron", ron_routes_1.ronRouter);
    app.use("/api/identity-verification", getapi_routes_1.getApiRouter);
    app.use("/api/payments", mercadopago_routes_1.mercadoPagoRouter);
    // Endpoint para verificar el estado de la plataforma
    app.get("/api/platform-status", (req, res) => {
        const platformInfo = {
            vecinos: {
                status: "active",
                version: "1.3.1"
            },
            notarypro: {
                status: "active",
                version: "2.0.5"
            }
        };
        res.json(platformInfo);
    });
    // Creación del servidor HTTP
    const httpServer = (0, http_1.createServer)(app);
    // Configuración de WebSocket para comunicación en tiempo real
    const wss = new ws_1.WebSocketServer({ server: httpServer, path: '/ws' });
    wss.on('connection', (ws) => {
        console.log('Nueva conexión WebSocket establecida');
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                // Aquí se puede manejar mensajes específicos por plataforma
                if (data.platform === 'vecinos') {
                    // Lógica para mensajes de Vecinos
                }
                else if (data.platform === 'notarypro') {
                    // Lógica para mensajes de NotaryPro
                }
            }
            catch (err) {
                console.error('Error al procesar mensaje WebSocket:', err);
            }
        });
        ws.on('close', () => {
            console.log('Conexión WebSocket cerrada');
        });
    });
    return httpServer;
}
