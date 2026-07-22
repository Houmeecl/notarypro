/**
 * Servicio de Autenticación del Cliente
 * Manejo completo de JWT tokens en el frontend
 */

import { apiRequest } from '@/lib/queryClient';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  platform: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email: string;
  fullName: string;
  role?: string;
  platform?: string;
}

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: User | null = null;

  constructor() {
    // Cargar tokens del localStorage al inicializar
    this.loadTokensFromStorage();
  }

  /**
   * Login con credenciales
   */
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include' // Para incluir cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en el login');
      }

      if (data.success) {
        this.setTokens(data.data.accessToken, data.data.refreshToken);
        this.setUser(data.data.user);
        
        // Guardar en localStorage
        this.saveTokensToStorage();
        
        return data.data;
      }

      throw new Error('Respuesta de login inválida');
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Registro de usuario
   */
  async register(userData: RegisterData): Promise<AuthTokens> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en el registro');
      }

      if (data.success) {
        this.setTokens(data.data.accessToken, data.data.refreshToken);
        this.setUser(data.data.user);
        this.saveTokensToStorage();
        
        return data.data;
      }

      throw new Error('Respuesta de registro inválida');
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      this.clearTokens();
      this.clearStorage();
    }
  }

  /**
   * Obtener información del usuario actual
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.authenticatedRequest('/api/auth/me');
      
      if (response.success) {
        this.setUser(response.data.user);
        return response.data.user;
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }

  /**
   * Renovar access token
   */
  async refreshAccessToken(): Promise<string | null> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.setAccessToken(data.data.accessToken);
        this.saveTokensToStorage();
        return data.data.accessToken;
      }

      // Si el refresh token es inválido, hacer logout
      this.logout();
      return null;
    } catch (error) {
      console.error('Error renovando token:', error);
      this.logout();
      return null;
    }
  }

  /**
   * Verificar si el token es válido
   */
  async verifyToken(): Promise<boolean> {
    try {
      const response = await this.authenticatedRequest('/api/auth/verify-token');
      return response.success && response.valid;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener permisos del usuario
   */
  async getUserPermissions(): Promise<string[]> {
    try {
      const response = await this.authenticatedRequest('/api/auth/permissions');
      
      if (response.success) {
        return response.data.permissions;
      }
      
      return [];
    } catch (error) {
      console.error('Error obteniendo permisos:', error);
      return [];
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await this.authenticatedRequest('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      if (!response.success) {
        throw new Error(response.error || 'Error cambiando contraseña');
      }
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      throw error;
    }
  }

  /**
   * Hacer una petición autenticada
   */
  async authenticatedRequest(url: string, options: RequestInit = {}): Promise<any> {
    const token = this.getAccessToken();
    
    if (!token) {
      throw new Error('No hay token de acceso');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
        credentials: 'include'
      });

      // Si el token expiró, intentar renovarlo
      if (response.status === 401) {
        const newToken = await this.refreshAccessToken();
        
        if (newToken) {
          // Reintentar la petición con el nuevo token
          return this.authenticatedRequest(url, options);
        }
        
        throw new Error('Token expirado y no se pudo renovar');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error('Error en petición autenticada:', error);
      throw error;
    }
  }

  // Métodos de gestión de tokens
  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  private setAccessToken(accessToken: string): void {
    this.accessToken = accessToken;
  }

  private setUser(user: User): void {
    this.user = user;
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
  }

  // Métodos de localStorage
  private saveTokensToStorage(): void {
    if (this.accessToken) {
      localStorage.setItem('access_token', this.accessToken);
    }
    if (this.refreshToken) {
      localStorage.setItem('refresh_token', this.refreshToken);
    }
    if (this.user) {
      localStorage.setItem('user', JSON.stringify(this.user));
    }
  }

  private loadTokensFromStorage(): void {
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user from storage:', error);
      }
    }
  }

  private clearStorage(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // Getters públicos
  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.user;
  }

  hasRole(role: string): boolean {
    return this.user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return !!this.user?.role && roles.includes(this.user.role);
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isCertifier(): boolean {
    return this.hasAnyRole(['certifier', 'admin']);
  }

  isPosUser(): boolean {
    return this.hasAnyRole(['pos-user', 'operator', 'admin']);
  }
}

// Instancia singleton
export const authService = new AuthService();

export default authService;