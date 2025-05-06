/**
 * Configuración para los diferentes modos del POS (Point of Sale)
 * 
 * Este archivo contiene la configuración para los diferentes modos
 * de punto de venta: real (producción) y prueba (testing)
 */

export type POSMode = 'real' | 'test';

export interface POSConfig {
  apiEndpoint: string;
  webhookEndpoint: string;
  paymentEnabled: boolean;
  testMode: boolean;
  nfcEnabled: boolean;
  storeCodes: string[];
  mercadoPagoEnabled: boolean;
  paypalEnabled: boolean;
}

// Configuración para POS en modo real (producción)
export const realPOSConfig: POSConfig = {
  apiEndpoint: '/api/transactions',
  webhookEndpoint: '/api/mercadopago/webhook',
  paymentEnabled: true,
  testMode: false,  // Este es siempre false en producción real
  nfcEnabled: true,
  storeCodes: ['LOCAL-XP125', 'LOCAL-XP201', 'LOCAL-XP315', 'LOCAL-XP427'],
  mercadoPagoEnabled: true,
  paypalEnabled: true
};

// Configuración para POS en modo prueba (testing)
export const testPOSConfig: POSConfig = {
  apiEndpoint: '/api/transactions/test',
  webhookEndpoint: '/api/mercadopago/webhook/test',
  paymentEnabled: true,
  testMode: true,
  nfcEnabled: true,
  storeCodes: ['TEST-XP001', 'TEST-XP002', 'TEST-XP003'],
  mercadoPagoEnabled: true,
  paypalEnabled: true
};

// Obtener la configuración según el modo elegido
export function getPOSConfig(mode: POSMode): POSConfig {
  return mode === 'real' ? realPOSConfig : testPOSConfig;
}

// Constantes compartidas entre ambos modos
export const POS_CONSTANTS = {
  AVAILABLE_SERVICES: [
    { id: 'doc-cert', name: 'Certificación de documentos', price: 3000, icon: 'document-text' },
    { id: 'doc-sign', name: 'Firma de documentos', price: 2500, icon: 'pen-tool' },
    { id: 'doc-verify', name: 'Verificación de documentos', price: 1500, icon: 'shield-check' },
    { id: 'doc-scan', name: 'Escaneo de documentos', price: 1000, icon: 'scan' },
    { id: 'id-verify', name: 'Verificación de identidad', price: 3500, icon: 'fingerprint' },
    { id: 'copy-service', name: 'Servicio de fotocopias', price: 500, icon: 'copy' },
    { id: 'print-service', name: 'Servicio de impresión', price: 800, icon: 'printer' },
  ],
  SERVICE_CATEGORIES: [
    { id: 'document', name: 'Documentos' },
    { id: 'identity', name: 'Identidad' },
    { id: 'general', name: 'Servicios generales' },
  ],
  TAX_RATE: 0.19, // 19% IVA
  COMMISSION_RATE: 0.10, // 10% comisión para el comercio
};