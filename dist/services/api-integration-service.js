"use strict";
/**
 * Servicio para gestionar las integraciones de API
 * Este servicio se encarga de:
 * - Almacenar y recuperar configuraciones de API
 * - Validar conexiones con servicios externos
 * - Activar/desactivar integraciones
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIntegrationsStatus = getIntegrationsStatus;
exports.saveIntegrationConfig = saveIntegrationConfig;
exports.testIntegrationConnection = testIntegrationConnection;
exports.toggleIntegration = toggleIntegration;
exports.getIntegrationConfig = getIntegrationConfig;
const videox_service_1 = require("./videox-service");
// Mock de la base de datos para integraciones
let integrations = {
    crm: {
        id: 'crm',
        name: 'CRM Integration',
        credentials: {},
        status: {
            isConfigured: false,
            isEnabled: false
        }
    },
    whatsapp: {
        id: 'whatsapp',
        name: 'WhatsApp Business API',
        credentials: {},
        status: {
            isConfigured: false,
            isEnabled: false
        }
    },
    dialogflow: {
        id: 'dialogflow',
        name: 'Dialogflow (AI Chat)',
        credentials: {},
        status: {
            isConfigured: false,
            isEnabled: false
        }
    },
    videox: {
        id: 'videox',
        name: 'VideoX Conference',
        credentials: {},
        status: {
            isConfigured: false,
            isEnabled: false
        }
    },
    stripe: {
        id: 'stripe',
        name: 'Stripe Payments',
        credentials: {},
        status: {
            isConfigured: false,
            isEnabled: false
        }
    },
    sendgrid: {
        id: 'sendgrid',
        name: 'SendGrid Email',
        credentials: {},
        status: {
            isConfigured: false,
            isEnabled: false
        }
    }
};
// Servicios
/**
 * Obtiene el estado actual de todas las integraciones
 */
async function getIntegrationsStatus() {
    const result = {};
    // Obtener estado de todas las integraciones
    for (const [id, integration] of Object.entries(integrations)) {
        result[id] = { ...integration.status };
    }
    // Verificar estado real basado en variables de entorno
    result.crm.isConfigured = !!process.env.CRM_API_KEY && !!process.env.CRM_API_URL;
    result.whatsapp.isConfigured = !!process.env.WHATSAPP_API_KEY && !!process.env.WHATSAPP_API_URL;
    result.dialogflow.isConfigured = !!process.env.DIALOGFLOW_API_KEY;
    result.videox.isConfigured = !!process.env.VIDEOX_API_KEY && !!process.env.VIDEOX_API_SECRET && !!process.env.VIDEOX_ACCOUNT_ID;
    result.stripe.isConfigured = !!process.env.STRIPE_SECRET_KEY && !!process.env.VITE_STRIPE_PUBLIC_KEY;
    result.sendgrid.isConfigured = !!process.env.SENDGRID_API_KEY;
    return result;
}
/**
 * Guarda la configuración de una integración
 */
async function saveIntegrationConfig(apiId, config) {
    if (!integrations[apiId]) {
        throw new Error(`Integración no encontrada: ${apiId}`);
    }
    // Actualizar credenciales
    integrations[apiId].credentials = config;
    // Marcar como configurado
    integrations[apiId].status.isConfigured = true;
    // Aquí se guardaría en una base de datos persistente
    // o se actualizarían variables de entorno mediante un proceso seguro
    // También podríamos establecer las variables de entorno para la sesión actual
    // (esto no persiste en reinicios del servidor)
    for (const [key, value] of Object.entries(config)) {
        process.env[key] = value;
    }
    return integrations[apiId];
}
/**
 * Prueba la conexión con una API integrada
 */
async function testIntegrationConnection(apiId) {
    if (!integrations[apiId]) {
        throw new Error(`Integración no encontrada: ${apiId}`);
    }
    if (!integrations[apiId].status.isConfigured) {
        throw new Error(`La integración no está configurada: ${apiId}`);
    }
    // En una implementación real, aquí se realizaría una prueba de conexión
    // con el servicio externo usando las credenciales almacenadas
    try {
        let isConnected = false;
        let error = undefined;
        // Ejemplo de prueba de conexión para cada API
        switch (apiId) {
            case 'crm':
                // Simulación de prueba de conexión al CRM
                if (!process.env.CRM_API_KEY || !process.env.CRM_API_URL) {
                    throw new Error('Credenciales de CRM incompletas');
                }
                isConnected = true;
                break;
            case 'whatsapp':
                // Simulación de prueba de conexión a WhatsApp
                if (!process.env.WHATSAPP_API_KEY || !process.env.WHATSAPP_API_URL) {
                    throw new Error('Credenciales de WhatsApp incompletas');
                }
                isConnected = true;
                break;
            case 'dialogflow':
                // Simulación de prueba de conexión a Dialogflow
                if (!process.env.DIALOGFLOW_API_KEY) {
                    throw new Error('Credenciales de Dialogflow incompletas');
                }
                isConnected = true;
                break;
            case 'videox':
                // Usar el servicio real de VideoX para probar la conexión
                if (!process.env.VIDEOX_API_KEY || !process.env.VIDEOX_API_SECRET || !process.env.VIDEOX_ACCOUNT_ID) {
                    throw new Error('Credenciales de VideoX incompletas');
                }
                const videoXResult = await videox_service_1.videoXService.testConnection();
                if (!videoXResult.success) {
                    throw new Error(videoXResult.message);
                }
                isConnected = true;
                break;
            case 'stripe':
                // Simulación de prueba de conexión a Stripe
                if (!process.env.STRIPE_SECRET_KEY) {
                    throw new Error('Credenciales de Stripe incompletas');
                }
                isConnected = true;
                break;
            case 'sendgrid':
                // Simulación de prueba de conexión a SendGrid
                if (!process.env.SENDGRID_API_KEY) {
                    throw new Error('Credenciales de SendGrid incompletas');
                }
                isConnected = true;
                break;
            default:
                throw new Error(`Tipo de integración no soportada: ${apiId}`);
        }
        // Actualizar estado
        integrations[apiId].status.isConnected = isConnected;
        integrations[apiId].status.lastChecked = new Date();
        integrations[apiId].status.error = error;
        return { ...integrations[apiId].status };
    }
    catch (error) {
        // Actualizar estado con error
        integrations[apiId].status.isConnected = false;
        integrations[apiId].status.lastChecked = new Date();
        integrations[apiId].status.error = error.message;
        throw error;
    }
}
/**
 * Activa o desactiva una integración
 */
async function toggleIntegration(apiId, isEnabled) {
    if (!integrations[apiId]) {
        throw new Error(`Integración no encontrada: ${apiId}`);
    }
    if (!integrations[apiId].status.isConfigured) {
        throw new Error(`No se puede activar una integración no configurada: ${apiId}`);
    }
    // Actualizar estado
    integrations[apiId].status.isEnabled = isEnabled;
    return { ...integrations[apiId].status };
}
/**
 * Obtiene la configuración completa de una integración
 */
async function getIntegrationConfig(apiId) {
    if (!integrations[apiId]) {
        throw new Error(`Integración no encontrada: ${apiId}`);
    }
    // Por seguridad, no devolvemos las credenciales completas
    const result = { ...integrations[apiId] };
    // Ocultar valores de credenciales secretas
    const safeCredentials = {};
    for (const [key, value] of Object.entries(result.credentials)) {
        // Si es una credencial secreta (como API keys), ocultarla
        if (key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD')) {
            safeCredentials[key] = value ? '********' : '';
        }
        else {
            safeCredentials[key] = value;
        }
    }
    result.credentials = safeCredentials;
    return result;
}
