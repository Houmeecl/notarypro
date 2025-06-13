import { useState, useEffect } from 'react';
import { API_ENDPOINTS, API_CONFIG } from '@/config/api';

interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  role: 'user' | 'certifier' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Login con Passport.js (sesiones)
  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: API_CONFIG.headers,
        credentials: API_CONFIG.credentials,
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const user = await response.json();
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
        return { success: true, user };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Error de login' };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: 'Error de conexión' };
    }
  };

  // Registro
  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role?: 'user' | 'certifier' | 'admin';
  }) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: API_CONFIG.headers,
        credentials: API_CONFIG.credentials,
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const user = await response.json();
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
        return { success: true, user };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Error de registro' };
      }
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, error: 'Error de conexión' };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: API_CONFIG.credentials,
      });
      
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  // Verificar usuario actual
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/user', {
        credentials: API_CONFIG.credentials,
      });

      if (response.ok) {
        const user = await response.json();
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    checkAuth,
  };
}; 
