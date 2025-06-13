 // Configuración de API para Passport.js + Sesiones
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Autenticación (YA FUNCIONAN en tu servidor)
  auth: {
    login: '/api/login',           // ✅ POST /api/login
    register: '/api/register',     // ✅ POST /api/register  
    logout: '/api/logout',         // ✅ POST /api/logout
    user: '/api/user',            // ✅ GET /api/user
  },
  
  // Admin (basado en admin-routes.ts)
  admin: {
    dashboard: '/api/admin/dashboard',
    users: '/api/admin/users',
    masterDashboard: '/api/admin/master-dashboard',
    systemStatus: '/api/admin/system-status',
    documents: '/api/admin/documents',
    certifiers: '/api/admin/certifiers',
    aiAnalysis: '/api/admin/ai-analysis',
  },
  
  // Partners (basado en tu estructura)
  partners: {
    mobileApi: '/api/partners/mobile-api',
    posRoutes: '/api/partners/partner-pos-routes',
    webapp: '/api/partners/webapp-routes',
  },
  
  // Vecinos (basado en tu estructura)
  vecinos: {
    routes: '/api/vecinos/vecinos-routes',
    signDocument: '/api/vecinos/document-sign-routes',
    payments: '/api/vecinos/payments-api',
    qrSignature: '/api/vecinos/qr-signature-routes',
  }
};

// Configuración para sesiones (NO JWT)
export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include' as RequestCredentials, // ¡CRÍTICO para sesiones!
};

export default API_BASE_URL;
