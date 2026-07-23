"use strict";
/**
 * Rutas API para la integración con Tuu Payments
 *
 * Este módulo proporciona endpoints para el procesamiento de pagos
 * utilizando los servicios de Tuu Payments para:
 * - Terminales POS físicos (Sunmi T5810)
 * - Pasarela web online
 * - Dispositivos móviles y tablets
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tuuPaymentRouter = void 0;
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
exports.tuuPaymentRouter = (0, express_1.Router)();
// Configuración de la API de Tuu
const TUU_API_BASE_URL = "https://api.tuu.cl";
const TUU_API_VERSION = "v1";
const TUU_WEB_GATEWAY_URL = "https://checkout.tuu.cl";
/**
 * Iniciar una transacción de pago
 * POST /api/tuu-payment/create-transaction
 */
exports.tuuPaymentRouter.post('/create-transaction', async (req, res) => {
    try {
        const { amount, currency, description, terminalId, clientTransactionId, clientRut } = req.body;
        // Validar campos requeridos
        if (!amount || !terminalId) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren los campos amount y terminalId'
            });
        }
        // Crear transacción en Tuu
        const response = await (0, axios_1.default)({
            method: 'POST',
            url: `${TUU_API_BASE_URL}/${TUU_API_VERSION}/transactions`,
            headers: {
                'Authorization': `Bearer ${process.env.POS_PAYMENT_API_KEY}`,
                'Content-Type': 'application/json'
            },
            data: {
                amount,
                currency: currency || 'CLP',
                description: description || 'Pago NotaryPro',
                terminal_id: terminalId,
                client_transaction_id: clientTransactionId || generateTransactionId(),
                client_rut: clientRut
            }
        });
        return res.status(201).json({
            success: true,
            data: response.data
        });
    }
    catch (error) {
        console.error('Error al crear transacción en Tuu:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Error al procesar la solicitud de pago',
            error: error.response?.data || error.message
        });
    }
});
/**
 * Verificar estado de una transacción
 * GET /api/tuu-payment/transaction/:id
 */
exports.tuuPaymentRouter.get('/transaction/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await (0, axios_1.default)({
            method: 'GET',
            url: `${TUU_API_BASE_URL}/${TUU_API_VERSION}/transactions/${id}`,
            headers: {
                'Authorization': `Bearer ${process.env.POS_PAYMENT_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return res.status(200).json({
            success: true,
            data: response.data
        });
    }
    catch (error) {
        console.error('Error al consultar transacción en Tuu:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            success: false,
            message: 'Error al consultar el estado de la transacción',
            error: error.response?.data || error.message
        });
    }
});
/**
 * Cancelar una transacción
 * POST /api/tuu-payment/transaction/:id/cancel
 */
exports.tuuPaymentRouter.post('/transaction/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await (0, axios_1.default)({
            method: 'POST',
            url: `${TUU_API_BASE_URL}/${TUU_API_VERSION}/transactions/${id}/cancel`,
            headers: {
                'Authorization': `Bearer ${process.env.POS_PAYMENT_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return res.status(200).json({
            success: true,
            data: response.data
        });
    }
    catch (error) {
        console.error('Error al cancelar transacción en Tuu:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            success: false,
            message: 'Error al cancelar la transacción',
            error: error.response?.data || error.message
        });
    }
});
/**
 * Obtener terminales disponibles
 * GET /api/tuu-payment/terminals
 */
exports.tuuPaymentRouter.get('/terminals', async (req, res) => {
    try {
        const response = await (0, axios_1.default)({
            method: 'GET',
            url: `${TUU_API_BASE_URL}/${TUU_API_VERSION}/terminals`,
            headers: {
                'Authorization': `Bearer ${process.env.POS_PAYMENT_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return res.status(200).json({
            success: true,
            data: response.data
        });
    }
    catch (error) {
        console.error('Error al obtener terminales de Tuu:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            success: false,
            message: 'Error al obtener la lista de terminales',
            error: error.response?.data || error.message
        });
    }
});
/**
 * Webhook para recibir notificaciones de Tuu
 * POST /api/tuu-payment/webhook
 */
exports.tuuPaymentRouter.post('/webhook', async (req, res) => {
    try {
        // Aquí procesaríamos las notificaciones webhook desde Tuu
        // Por seguridad, deberíamos verificar la firma de la notificación
        const eventData = req.body;
        console.log('Webhook de Tuu recibido:', eventData);
        // Actualizar el estado de la transacción en nuestra base de datos
        // implementar lógica según el tipo de evento recibido
        // Responder con éxito para confirmar la recepción
        return res.status(200).json({ received: true });
    }
    catch (error) {
        console.error('Error al procesar webhook de Tuu:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al procesar la notificación webhook'
        });
    }
});
/**
 * Crear una sesión de pago web (pasarela en línea)
 * POST /api/tuu-payment/create-web-payment
 */
exports.tuuPaymentRouter.post('/create-web-payment', async (req, res) => {
    try {
        const { amount, currency, description, clientName, clientEmail, clientRut, successUrl, cancelUrl, metadata } = req.body;
        // Validar campos requeridos
        if (!amount) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere el campo amount'
            });
        }
        // ID único para esta transacción
        const clientTransactionId = generateTransactionId();
        // Crear sesión de pago en la pasarela web de Tuu
        const response = await (0, axios_1.default)({
            method: 'POST',
            url: `${TUU_API_BASE_URL}/${TUU_API_VERSION}/checkout/sessions`,
            headers: {
                'Authorization': `Bearer ${process.env.POS_PAYMENT_API_KEY}`,
                'Content-Type': 'application/json'
            },
            data: {
                amount,
                currency: currency || 'CLP',
                description: description || 'Pago VecinoXpress',
                client_name: clientName,
                client_email: clientEmail,
                client_rut: clientRut,
                client_transaction_id: clientTransactionId,
                success_url: successUrl || `${req.protocol}://${req.get('host')}/payment-success`,
                cancel_url: cancelUrl || `${req.protocol}://${req.get('host')}/payment-cancel`,
                metadata: metadata || {}
            }
        });
        // Asegurémonos de devolver la URL de redirección en el formato que espera el cliente
        return res.status(201).json({
            success: true,
            redirectUrl: `${TUU_WEB_GATEWAY_URL}/${response.data.id}`,
            data: {
                ...response.data,
                checkout_url: `${TUU_WEB_GATEWAY_URL}/${response.data.id}`
            }
        });
    }
    catch (error) {
        console.error('Error al crear sesión de pago web en Tuu:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Error al procesar la solicitud de pago web',
            error: error.response?.data || error.message
        });
    }
});
/**
 * Crear un enlace de pago (para compartir por correo, WhatsApp, etc.)
 * POST /api/tuu-payment/create-payment-link
 */
exports.tuuPaymentRouter.post('/create-payment-link', async (req, res) => {
    try {
        const { amount, currency, description, expiresAt, metadata } = req.body;
        if (!amount) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere el campo amount'
            });
        }
        // Crear enlace de pago en Tuu
        const response = await (0, axios_1.default)({
            method: 'POST',
            url: `${TUU_API_BASE_URL}/${TUU_API_VERSION}/payment-links`,
            headers: {
                'Authorization': `Bearer ${process.env.POS_PAYMENT_API_KEY}`,
                'Content-Type': 'application/json'
            },
            data: {
                amount,
                currency: currency || 'CLP',
                description: description || 'Pago VecinoXpress',
                client_transaction_id: generateTransactionId(),
                expires_at: expiresAt,
                metadata: metadata || {}
            }
        });
        return res.status(201).json({
            success: true,
            data: response.data
        });
    }
    catch (error) {
        console.error('Error al crear enlace de pago en Tuu:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Error al crear enlace de pago',
            error: error.response?.data || error.message
        });
    }
});
/**
 * Obtener detalles de una sesión de pago
 * GET /api/tuu-payment/checkout-session/:id
 */
exports.tuuPaymentRouter.get('/checkout-session/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await (0, axios_1.default)({
            method: 'GET',
            url: `${TUU_API_BASE_URL}/${TUU_API_VERSION}/checkout/sessions/${id}`,
            headers: {
                'Authorization': `Bearer ${process.env.POS_PAYMENT_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return res.status(200).json({
            success: true,
            data: response.data
        });
    }
    catch (error) {
        console.error('Error al consultar sesión de pago en Tuu:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            success: false,
            message: 'Error al consultar la sesión de pago',
            error: error.response?.data || error.message
        });
    }
});
/**
 * Procesar un pago móvil (para app o tablets)
 * POST /api/tuu-payment/mobile-payment
 */
exports.tuuPaymentRouter.post('/mobile-payment', async (req, res) => {
    try {
        const { amount, currency, description, paymentMethod, cardToken, clientName, clientEmail, clientRut, clientPhone, metadata } = req.body;
        if (!amount || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren los campos amount y paymentMethod'
            });
        }
        // Crear pago móvil en Tuu
        const response = await (0, axios_1.default)({
            method: 'POST',
            url: `${TUU_API_BASE_URL}/${TUU_API_VERSION}/mobile/payments`,
            headers: {
                'Authorization': `Bearer ${process.env.POS_PAYMENT_API_KEY}`,
                'Content-Type': 'application/json'
            },
            data: {
                amount,
                currency: currency || 'CLP',
                description: description || 'Pago móvil VecinoXpress',
                payment_method: paymentMethod,
                card_token: cardToken,
                client_transaction_id: generateTransactionId(),
                client_name: clientName,
                client_email: clientEmail,
                client_rut: clientRut,
                client_phone: clientPhone,
                metadata: metadata || {}
            }
        });
        // Formatear la respuesta para incluir paymentUrl si está disponible en la respuesta
        const paymentUrl = response.data.payment_url || response.data.redirect_url || null;
        return res.status(201).json({
            success: true,
            paymentUrl,
            status: response.data.status || 'processing',
            transactionId: response.data.id || req.body.transactionId,
            data: response.data
        });
    }
    catch (error) {
        console.error('Error al procesar pago móvil en Tuu:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Error al procesar pago móvil',
            error: error.response?.data || error.message
        });
    }
});
/**
 * Obtener métodos de pago disponibles
 * GET /api/tuu-payment/payment-methods
 */
exports.tuuPaymentRouter.get('/payment-methods', async (req, res) => {
    try {
        const response = await (0, axios_1.default)({
            method: 'GET',
            url: `${TUU_API_BASE_URL}/${TUU_API_VERSION}/payment-methods`,
            headers: {
                'Authorization': `Bearer ${process.env.POS_PAYMENT_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return res.status(200).json({
            success: true,
            data: response.data
        });
    }
    catch (error) {
        console.error('Error al obtener métodos de pago de Tuu:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            success: false,
            message: 'Error al obtener métodos de pago',
            error: error.response?.data || error.message
        });
    }
});
/**
 * Generar un ID de transacción único
 */
function generateTransactionId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 10);
    return `vecinoxpress-${timestamp}-${random}`;
}
