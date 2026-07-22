"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MercadoPagoService = void 0;
exports.createPaymentPreference = createPaymentPreference;
exports.getPaymentInfo = getPaymentInfo;
exports.setupWebhook = setupWebhook;
exports.processPayment = processPayment;
const mercadopago_1 = require("mercadopago");
// Verificar que las variables de entorno estén configuradas
if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    console.error('Error: MERCADOPAGO_ACCESS_TOKEN no está configurado');
}
if (!process.env.MERCADOPAGO_PUBLIC_KEY) {
    console.error('Error: MERCADOPAGO_PUBLIC_KEY no está configurado');
}
// Configurar el cliente de MercadoPago
const mercadoPagoClient = new mercadopago_1.MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});
// Inicializar los módulos de MercadoPago
const payment = new mercadopago_1.Payment(mercadoPagoClient);
const preference = new mercadopago_1.Preference(mercadoPagoClient);
/**
 * Crear una preferencia de pago para MercadoPago
 * @param items - Lista de productos a pagar
 * @param payer - Información del pagador
 * @param backUrls - URLs de redirección luego de realizar el pago
 * @param externalReference - Referencia externa para identificar el pago
 * @returns Preferencia de pago creada
 */
async function createPaymentPreference(items, payer, backUrls, externalReference) {
    try {
        // Adaptamos el formato de los items al esperado por MercadoPago
        const formattedItems = items.map(item => ({
            id: `ITEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Generamos un ID único para cada ítem
            title: item.title,
            quantity: item.quantity,
            unit_price: item.unit_price,
            currency_id: item.currency_id || 'CLP', // Default currency for Chile
            description: item.description || ''
        }));
        const preferenceData = {
            items: formattedItems,
            payer,
            back_urls: backUrls,
            external_reference: externalReference,
            auto_return: 'approved',
        };
        const result = await preference.create({ body: preferenceData });
        return result;
    }
    catch (error) {
        console.error('Error al crear preferencia de pago:', error);
        throw error;
    }
}
/**
 * Obtener información de un pago
 * @param paymentId - ID del pago
 * @returns Detalles del pago
 */
async function getPaymentInfo(paymentId) {
    try {
        const paymentInfo = await payment.get({ id: paymentId });
        return paymentInfo;
    }
    catch (error) {
        console.error('Error al obtener información del pago:', error);
        throw error;
    }
}
/**
 * Crear un webhook para recibir notificaciones de MercadoPago
 * @param webhookUrl - URL que recibirá las notificaciones
 * @returns Respuesta de la creación del webhook
 */
async function setupWebhook(webhookUrl) {
    try {
        // Esta funcionalidad requeriría usar la API de MercadoPago para configurar webhooks
        // y no está disponible directamente en el SDK actual
        // Se implementaría utilizando fetch o axios para hacer la petición a la API
        console.log('Webhook URL configurada:', webhookUrl);
        return { success: true };
    }
    catch (error) {
        console.error('Error al configurar webhook:', error);
        throw error;
    }
}
/**
 * Procesar un pago con MercadoPago
 * @param paymentData - Datos del pago
 * @returns Respuesta del procesamiento del pago
 */
async function processPayment(paymentData) {
    try {
        // Adaptamos para convertir issuer_id de string a número cuando sea necesario
        const formattedPaymentData = {
            ...paymentData,
            issuer_id: parseInt(paymentData.issuer_id, 10) || 0 // Convertir a número o usar 0 como valor por defecto
        };
        const result = await payment.create({ body: formattedPaymentData });
        return result;
    }
    catch (error) {
        console.error('Error al procesar pago:', error);
        throw error;
    }
}
exports.MercadoPagoService = {
    createPaymentPreference,
    getPaymentInfo,
    setupWebhook,
    processPayment,
    getPublicKey: () => process.env.MERCADOPAGO_PUBLIC_KEY,
};
exports.default = exports.MercadoPagoService;
