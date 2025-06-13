/**
 * Sistema de reporte de errores para VecinoXpress POS
 * 
 * Este módulo permite registrar, almacenar y enviar errores al servidor central,
 * lo que permite identificar y corregir problemas en dispositivos POS remotos.
 */

import { getRemoteConfigValue } from './remoteConfig';
import { apiRequest } from '@/lib/queryClient';

// Tipos de error
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  NETWORK = 'network',
  PAYMENT = 'payment',
  NFC = 'nfc',
  CAMERA = 'camera',
  DATABASE = 'database',
  UI = 'ui',
  HARDWARE = 'hardware',
  PERMISSION = 'permission',
  AUTHENTICATION = 'authentication',
  UNKNOWN = 'unknown'
}

// Interfaz para errores
export interface ErrorReport {
  id: string;
  timestamp: string;
  message: string;
  code?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  deviceInfo: DeviceInfo;
  metadata?: Record<string, any>;
  stackTrace?: string;
  userAction?: string;
  networkStatus?: NetworkStatus;
  screenshot?: string; // Base64
  reproSteps?: string[];
}

// Información del dispositivo
interface DeviceInfo {
  deviceId: string;
  model: string;
  osVersion: string;
  appVersion: string;
  batteryLevel?: number;
  storageAvailable?: number;
  locale: string;
  timezone: string;
  connectionType?: string;
  screenResolution?: string;
}

// Estado de la red
interface NetworkStatus {
  connected: boolean;
  connectionType?: string;
  signalStrength?: number;
  latency?: number;
  ipAddress?: string;
}

// Clase principal para reportes de error
class ErrorReporter {
  private static instance: ErrorReporter;
  private deviceInfo: DeviceInfo;
  private pendingReports: ErrorReport[] = [];
  private isReporting = false;
  private storageKey = 'vx_error_reports';
  private sendingInterval: number | null = null;
  
  private constructor() {
    // Inicializar información del dispositivo
    this.deviceInfo = this.getDeviceInfo();
    
    // Cargar reportes pendientes de localStorage
    this.loadPendingReports();
    
    // Configurar intervalo para envío automático
    this.setupAutomaticReporting();
    
    // Capturar errores no manejados
    this.setupGlobalErrorHandling();
  }
  
  public static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }
  
  /**
   * Registra un error para su envío posterior
   */
  public async reportError(
    message: string,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    metadata?: Record<string, any>,
    code?: string
  ): Promise<string> {
    const errorId = `error_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    
    let stackTrace: string | undefined;
    try {
      // Capturar stack trace actual
      const error = new Error();
      stackTrace = error.stack || undefined;
    } catch (e) {
      // No hacer nada si no se puede capturar
    }
    
    // Obtener estado de la red
    const networkStatus = await this.getNetworkStatus();
    
    // Crear reporte
    const report: ErrorReport = {
      id: errorId,
      timestamp: new Date().toISOString(),
      message,
      code,
      severity,
      category,
      deviceInfo: this.deviceInfo,
      metadata,
      stackTrace,
      networkStatus
    };
    
    // Agregar a la cola de reportes pendientes
    this.pendingReports.push(report);
    this.savePendingReports();
    
    // Intentar enviar inmediatamente si es crítico
    if (severity === ErrorSeverity.CRITICAL) {
      this.sendReports();
    }
    
    // Registrar en consola para debug local
    console.error(`[${severity}] ${category}: ${message}`, metadata);
    
    return errorId;
  }
  
  /**
   * Envía todos los reportes pendientes al servidor
   */
  public async sendReports(): Promise<boolean> {
    if (this.isReporting || this.pendingReports.length === 0) {
      return false;
    }
    
    this.isReporting = true;
    
    try {
      // Verificar conexión a internet
      const isOnline = navigator.onLine;
      if (!isOnline) {
        this.isReporting = false;
        return false;
      }
      
      // Copiar reportes para enviar (por si se agregan nuevos durante el envío)
      const reportsToSend = [...this.pendingReports];
      
      const response = await apiRequest('POST', '/api/pos-logs/report-errors', {
        reports: reportsToSend,
        deviceId: this.deviceInfo.deviceId,
        timestamp: new Date().toISOString(),
        batchId: `batch_${Date.now()}`
      });
      
      if (response.ok) {
        // Eliminar los reportes enviados correctamente
        this.pendingReports = this.pendingReports.filter(
          report => !reportsToSend.some(sent => sent.id === report.id)
        );
        this.savePendingReports();
        
        console.log(`Enviados ${reportsToSend.length} reportes de error al servidor.`);
        this.isReporting = false;
        return true;
      } else {
        throw new Error(`Error al enviar reportes: ${response.status}`);
      }
    } catch (error) {
      console.error('Error al enviar reportes:', error);
      this.isReporting = false;
      return false;
    }
  }
  
  /**
   * Adjunta una captura de pantalla al error más reciente
   */
  public async attachScreenshotToLatestError(screenshotBase64: string): Promise<boolean> {
    if (this.pendingReports.length === 0) return false;
    
    // Adjuntar al error más reciente
    const latestReport = this.pendingReports[this.pendingReports.length - 1];
    latestReport.screenshot = screenshotBase64;
    
    this.savePendingReports();
    return true;
  }
  
  /**
   * Registra la acción del usuario que llevó al error
   */
  public recordUserAction(errorId: string, action: string): void {
    const report = this.pendingReports.find(r => r.id === errorId);
    if (report) {
      report.userAction = action;
      this.savePendingReports();
    }
  }
  
  /**
   * Registra los pasos para reproducir el error
   */
  public recordReproSteps(errorId: string, steps: string[]): void {
    const report = this.pendingReports.find(r => r.id === errorId);
    if (report) {
      report.reproSteps = steps;
      this.savePendingReports();
    }
  }
  
  /**
   * Obtiene todos los errores pendientes
   */
  public getPendingReports(): ErrorReport[] {
    return [...this.pendingReports];
  }
  
  /**
   * Limpia todos los errores pendientes
   */
  public clearPendingReports(): void {
    this.pendingReports = [];
    this.savePendingReports();
  }
  
  // Métodos privados
  
  private setupGlobalErrorHandling() {
    // Capturar errores no manejados de JavaScript
    window.addEventListener('error', (event) => {
      this.reportError(
        event.message || 'Error no controlado',
        ErrorSeverity.ERROR,
        ErrorCategory.UNKNOWN,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      );
    });

    // Capturar rechazos de promesas no manejados
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError(
        `Promesa rechazada no manejada: ${event.reason}`,
        ErrorSeverity.ERROR,
        ErrorCategory.UNKNOWN,
        {
          reason: event.reason ? event.reason.toString() : 'Unknown'
        }
      );
    });
  }
  
  private getDeviceInfo(): DeviceInfo {
    // Generar o recuperar ID de dispositivo
    let deviceId = localStorage.getItem('vx_device_id');
    if (!deviceId) {
      deviceId = `pos_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
      localStorage.setItem('vx_device_id', deviceId);
    }
    
    // Información básica del dispositivo
    const userAgent = navigator.userAgent;
    const appVersion = '1.0.0'; // Actualizar con versión real
    const locale = navigator.language;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Intentar determinar el modelo (limitado en navegadores)
    let model = 'Unknown';
    if (userAgent.includes('Android')) {
      const match = userAgent.match(/Android\s([0-9.]+);\s(.*?)\s/);
      model = match ? match[2] : 'Android Device';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      model = userAgent.includes('iPhone') ? 'iPhone' : 'iPad';
    } else {
      model = 'Desktop/Other';
    }
    
    // Detectar sistema operativo
    let osVersion = 'Unknown';
    if (userAgent.includes('Android')) {
      const match = userAgent.match(/Android\s([0-9.]+)/);
      osVersion = match ? `Android ${match[1]}` : 'Android';
    } else if (userAgent.includes('iPhone OS') || userAgent.includes('iPad')) {
      const match = userAgent.match(/OS\s([0-9_]+)/);
      osVersion = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
    } else if (userAgent.includes('Windows')) {
      osVersion = 'Windows';
    } else if (userAgent.includes('Mac OS X')) {
      osVersion = 'macOS';
    } else if (userAgent.includes('Linux')) {
      osVersion = 'Linux';
    }
    
    // Resolución de pantalla
    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    
    return {
      deviceId,
      model,
      osVersion,
      appVersion,
      locale,
      timezone,
      screenResolution
    };
  }
  
  private async getNetworkStatus(): Promise<NetworkStatus> {
    const connected = navigator.onLine;
    
    // El tipo de conexión y la intensidad de la señal solo están disponibles
    // en algunas implementaciones modernas y APIs experimentales
    let connectionType: string | undefined;
    let signalStrength: number | undefined;
    
    // @ts-ignore: NetworkInformation API experimental
    if (navigator.connection) {
      // @ts-ignore: NetworkInformation API experimental
      connectionType = navigator.connection.effectiveType || navigator.connection.type;
    }
    
    // Medir latencia aproximada
    let latency: number | undefined;
    if (connected) {
      try {
        const startTime = Date.now();
        await fetch('/api/ping', { method: 'HEAD', cache: 'no-store' });
        latency = Date.now() - startTime;
      } catch (e) {
        // Falló la medición de latencia
      }
    }
    
    return {
      connected,
      connectionType,
      signalStrength,
      latency
    };
  }
  
  private loadPendingReports() {
    try {
      const storedReports = localStorage.getItem(this.storageKey);
      if (storedReports) {
        this.pendingReports = JSON.parse(storedReports);
      }
    } catch (e) {
      console.error('Error al cargar reportes de error:', e);
      this.pendingReports = [];
    }
  }
  
  private savePendingReports() {
    try {
      // Limitar el tamaño de los errores almacenados (máximo 50)
      if (this.pendingReports.length > 50) {
        // Mantener los más recientes
        this.pendingReports = this.pendingReports.slice(-50);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(this.pendingReports));
    } catch (e) {
      console.error('Error al guardar reportes de error:', e);
    }
  }
  
  private async setupAutomaticReporting() {
    // Configurar intervalo según configuración remota
    const setupInterval = async () => {
      // Obtener intervalo de la configuración remota
      const logSendInterval = await getRemoteConfigValue<number>('debugging.logSendInterval');
      const autoSendLogs = await getRemoteConfigValue<boolean>('debugging.autoSendLogs');
      
      // Limpiar intervalo existente
      if (this.sendingInterval) {
        clearInterval(this.sendingInterval);
        this.sendingInterval = null;
      }
      
      // Configurar nuevo intervalo si está habilitado
      if (autoSendLogs && logSendInterval > 0) {
        this.sendingInterval = window.setInterval(() => {
          this.sendReports();
        }, logSendInterval);
      }
    };
    
    // Configurar inicialmente
    await setupInterval();
    
    // Actualizar cada hora por si cambia la configuración
    setInterval(setupInterval, 3600000); // 1 hora
  }
}

// Export singleton instance
export const errorReporter = ErrorReporter.getInstance();

// Export helper functions for easy use
export function reportError(
  message: string,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  metadata?: Record<string, any>,
  code?: string
): Promise<string> {
  return errorReporter.reportError(message, severity, category, metadata, code);
}

export function reportNetworkError(message: string, metadata?: Record<string, any>): Promise<string> {
  return errorReporter.reportError(message, ErrorSeverity.ERROR, ErrorCategory.NETWORK, metadata);
}

export function reportNfcError(message: string, metadata?: Record<string, any>): Promise<string> {
  return errorReporter.reportError(message, ErrorSeverity.ERROR, ErrorCategory.NFC, metadata);
}

export function reportCameraError(message: string, metadata?: Record<string, any>): Promise<string> {
  return errorReporter.reportError(message, ErrorSeverity.ERROR, ErrorCategory.CAMERA, metadata);
}

export function reportPaymentError(message: string, metadata?: Record<string, any>): Promise<string> {
  return errorReporter.reportError(message, ErrorSeverity.ERROR, ErrorCategory.PAYMENT, metadata);
}

export function reportCriticalError(message: string, category: ErrorCategory, metadata?: Record<string, any>): Promise<string> {
  return errorReporter.reportError(message, ErrorSeverity.CRITICAL, category, metadata);
}