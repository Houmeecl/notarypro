/**
 * Servicio independiente para la versión standalone de Vecinos Express
 * Este servicio proporciona funcionalidades separadas para que la aplicación
 * pueda funcionar completamente independiente del sistema principal.
 */

import axios from 'axios';

// Constantes para almacenamiento local
export const VECINOS_STANDALONE_USER_KEY = 'vecinos_standalone_user';
export const VECINOS_STANDALONE_TOKEN_KEY = 'vecinos_standalone_token';

// Interfaz para la respuesta de login
interface LoginResponse {
  user: any;
  token: string;
  role: string;
}

// Crear una instancia de axios independiente
const standaloneApi = axios.create({
  baseURL: '/api/vecinos-standalone',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token de autenticación
standaloneApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(VECINOS_STANDALONE_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Servicio para la gestión de autenticación y datos en Vecinos Express Standalone
 */
const VecinosStandaloneService = {
  /**
   * Iniciar sesión en el sistema standalone
   */
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      // Usamos temporalmente el endpoint original mientras migramos a uno independiente
      const response = await axios.post('/api/vecinos/login', { username, password });
      
      // Almacenar datos usando las claves específicas para standalone
      if (response.data && response.data.token) {
        localStorage.setItem(VECINOS_STANDALONE_USER_KEY, JSON.stringify(response.data.user));
        localStorage.setItem(VECINOS_STANDALONE_TOKEN_KEY, response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error en login standalone:', error);
      throw error;
    }
  },
  
  /**
   * Cerrar sesión en el sistema standalone
   */
  logout: (): void => {
    localStorage.removeItem(VECINOS_STANDALONE_USER_KEY);
    localStorage.removeItem(VECINOS_STANDALONE_TOKEN_KEY);
  },
  
  /**
   * Verificar si el usuario está autenticado en el sistema standalone
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(VECINOS_STANDALONE_TOKEN_KEY);
  },
  
  /**
   * Obtener el usuario actual del sistema standalone
   */
  getCurrentUser: (): any => {
    const userJson = localStorage.getItem(VECINOS_STANDALONE_USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (error) {
        console.error('Error al parsear datos de usuario standalone:', error);
        return null;
      }
    }
    return null;
  },
  
  /**
   * Verificar si el usuario actual tiene rol de administrador
   */
  isAdmin: (): boolean => {
    const user = VecinosStandaloneService.getCurrentUser();
    return user && user.role === 'admin';
  },
  
  /**
   * Obtener datos de documento (simulado para demostración)
   */
  getDocuments: async (): Promise<any[]> => {
    // En el futuro, esto se conectará a un endpoint dedicado para standalone
    // Por ahora devolvemos datos de ejemplo
    return [
      {
        id: 1,
        title: 'Contrato de Prestación de Servicios',
        clientName: 'Juan Pérez González',
        status: 'pending',
        createdAt: '2025-05-02T10:15:00Z',
        type: 'contract',
        verificationCode: 'ABC12345'
      },
      {
        id: 2,
        title: 'Declaración Jurada Simple',
        clientName: 'María Rodríguez Silva',
        status: 'completed',
        createdAt: '2025-05-01T08:30:00Z',
        type: 'declaration',
        verificationCode: 'DEF67890'
      },
      {
        id: 3,
        title: 'Poder Simple',
        clientName: 'Carlos López Muñoz',
        status: 'signing',
        createdAt: '2025-04-30T14:45:00Z',
        type: 'power',
        verificationCode: 'GHI01234'
      }
    ];
  },
  
  /**
   * Obtener datos de transacciones (simulado para demostración)
   */
  getTransactions: async (): Promise<any[]> => {
    // En el futuro, esto se conectará a un endpoint dedicado para standalone
    // Por ahora devolvemos datos de ejemplo
    return [
      {
        id: 101,
        description: 'Pago por servicio notarial',
        amount: 15000,
        status: 'completed',
        date: '2025-05-02T11:30:00Z',
        method: 'card'
      },
      {
        id: 102,
        description: 'Comisión por documento firmado',
        amount: 5000,
        status: 'completed',
        date: '2025-05-01T09:45:00Z',
        method: 'transfer'
      },
      {
        id: 103,
        description: 'Pago pendiente',
        amount: 8000,
        status: 'pending',
        date: '2025-04-30T16:20:00Z',
        method: 'pending'
      }
    ];
  },
  
  /**
   * Obtener estadísticas del usuario (simulado para demostración)
   */
  getUserStats: async (): Promise<any> => {
    // En el futuro, esto se conectará a un endpoint dedicado para standalone
    // Por ahora devolvemos datos de ejemplo
    return {
      documentsCount: 12,
      pendingDocuments: 3,
      completedDocuments: 9,
      recentEarnings: 45000
    };
  }
};

export default VecinosStandaloneService;