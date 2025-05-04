/**
 * Rutas para gestión de dispositivos POS
 * 
 * Este módulo proporciona endpoints para la gestión remota de dispositivos POS,
 * incluyendo configuración, diagnóstico y reportes de errores.
 */

import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { db } from './db';

export const posManagementRouter = Router();

// Middleware de autenticación básica para endpoints de administración
function isAdmin(req: Request, res: Response, next: any) {
  if (!req.isAuthenticated() || req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acceso denegado' });
  }
  next();
}

/**
 * Obtener configuración remota para dispositivos POS
 * GET /api/pos-config
 */
posManagementRouter.get('/pos-config', async (req: Request, res: Response) => {
  try {
    // Opcionalmente, identificar el dispositivo específico
    const deviceId = req.query.deviceId as string;
    
    // Obtener configuración global
    let config = await getGlobalPosConfig();
    
    // Si hay un ID de dispositivo, mezclar con configuración específica
    if (deviceId) {
      const deviceConfig = await getDeviceSpecificConfig(deviceId);
      if (deviceConfig) {
        config = mergeConfigs(config, deviceConfig);
      }
    }
    
    // Verificar por configuración regional
    const regionCode = req.query.region as string || 'CL'; // Chile por defecto
    const regionalConfig = await getRegionalConfig(regionCode);
    if (regionalConfig) {
      config.regional = regionalConfig;
    }
    
    res.json(config);
  } catch (error) {
    console.error('Error al obtener configuración POS:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener configuración'
    });
  }
});

/**
 * Actualizar configuración remota (admin)
 * PUT /api/pos-config
 */
posManagementRouter.put('/pos-config', isAdmin, async (req: Request, res: Response) => {
  try {
    const config = req.body;
    const deviceId = req.query.deviceId as string;
    
    if (deviceId) {
      // Actualizar configuración para dispositivo específico
      await updateDeviceConfig(deviceId, config);
    } else {
      // Actualizar configuración global
      await updateGlobalConfig(config);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar configuración POS:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar configuración'
    });
  }
});

/**
 * Recibir registros de error de dispositivos POS
 * POST /api/pos-logs/report-errors
 */
posManagementRouter.post('/pos-logs/report-errors', async (req: Request, res: Response) => {
  try {
    const { reports, deviceId, timestamp, batchId } = req.body;
    
    if (!reports || !Array.isArray(reports) || reports.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Formato de reporte inválido' 
      });
    }
    
    // Guardar reportes en la base de datos
    await saveErrorReports(reports, deviceId, batchId);
    
    // Analizar errores para detectar patrones
    const criticalErrors = reports.filter(r => r.severity === 'critical').length;
    const deviceRequiresAttention = criticalErrors > 0;
    
    // Responder con acciones que el dispositivo debe tomar
    res.json({ 
      success: true, 
      requiresAttention: deviceRequiresAttention,
      actions: generateResponseActions(reports, deviceId)
    });
  } catch (error) {
    console.error('Error al procesar reportes de errores:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al procesar reportes'
    });
  }
});

/**
 * Verificar actualizaciones disponibles para el dispositivo
 * GET /api/pos-updates/check
 */
posManagementRouter.get('/pos-updates/check', async (req: Request, res: Response) => {
  try {
    const deviceId = req.query.deviceId as string;
    const currentVersion = req.query.version as string;
    
    if (!deviceId || !currentVersion) {
      return res.status(400).json({ 
        success: false, 
        message: 'Falta ID de dispositivo o versión actual' 
      });
    }
    
    const updateInfo = await checkForDeviceUpdates(deviceId, currentVersion);
    
    res.json({
      success: true,
      hasUpdate: !!updateInfo,
      updateInfo
    });
  } catch (error) {
    console.error('Error al verificar actualizaciones:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al verificar actualizaciones'
    });
  }
});

/**
 * Ping para verificar conectividad y medir latencia
 * GET /api/ping
 */
posManagementRouter.get('/ping', (req: Request, res: Response) => {
  res.json({ 
    success: true, 
    timestamp: Date.now() 
  });
});

/**
 * Dashboard de administración de dispositivos POS (admin)
 * GET /api/pos-admin/dashboard
 */
posManagementRouter.get('/pos-admin/dashboard', isAdmin, async (req: Request, res: Response) => {
  try {
    const stats = await getDeviceStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de dispositivos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estadísticas'
    });
  }
});

/**
 * Enviar comando a un dispositivo específico (admin)
 * POST /api/pos-admin/send-command
 */
posManagementRouter.post('/pos-admin/send-command', isAdmin, async (req: Request, res: Response) => {
  try {
    const { deviceId, command, params } = req.body;
    
    if (!deviceId || !command) {
      return res.status(400).json({ 
        success: false, 
        message: 'Falta ID de dispositivo o comando' 
      });
    }
    
    // Registrar comando para que el dispositivo lo recoja en su próxima conexión
    await registerDeviceCommand(deviceId, command, params);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error al enviar comando:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al enviar comando'
    });
  }
});

// Funciones auxiliares

/**
 * Obtiene la configuración global para dispositivos POS
 */
async function getGlobalPosConfig() {
  // En una implementación real, esto vendría de la base de datos
  // Por ahora, usamos una configuración predeterminada
  return {
    payment: {
      demoModeEnabled: false,
      maxRetries: 3,
      retryTimeout: 5000
    },
    nfc: {
      enabled: true,
      timeout: 30,
      maxRetries: 3,
      useFallbackApi: false
    },
    camera: {
      preferredResolution: 'medium',
      enableFlash: false,
      useBackCamera: true,
      scanTimeout: 60
    },
    network: {
      requestTimeout: 10000,
      maxRetries: 3,
      retryInterval: 2000,
      cacheFailedRequests: true
    },
    debugging: {
      logLevel: 1,
      autoSendLogs: true,
      logSendInterval: 3600000, // 1 hora
      showDebugTools: false
    },
    updates: {
      checkAutomatically: true,
      checkInterval: 86400000, // 24 horas
      downloadAutomatically: false
    },
    regional: {
      regionCode: 'CL',
      dateFormat: 'DD/MM/YYYY',
      currencyFormat: '$ #.###'
    }
  };
}

/**
 * Obtiene configuración específica para un dispositivo
 */
async function getDeviceSpecificConfig(deviceId: string) {
  // En una implementación real, esto vendría de la base de datos
  // Por ahora, devolvemos null (usa la configuración global)
  return null;
}

/**
 * Obtiene configuración regional específica
 */
async function getRegionalConfig(regionCode: string) {
  // En una implementación real, esto vendría de la base de datos
  // Configuración específica para Chile
  if (regionCode === 'CL') {
    return {
      regionCode: 'CL',
      dateFormat: 'DD/MM/YYYY',
      currencyFormat: '$ #.###'
    };
  }
  
  // Configuración específica para Perú
  if (regionCode === 'PE') {
    return {
      regionCode: 'PE',
      dateFormat: 'DD/MM/YYYY',
      currencyFormat: 'S/ #.##0,00'
    };
  }
  
  return null;
}

/**
 * Combina dos objetos de configuración
 */
function mergeConfigs(baseConfig: any, overrideConfig: any) {
  return { ...baseConfig, ...overrideConfig };
}

/**
 * Actualiza la configuración global
 */
async function updateGlobalConfig(config: any) {
  // En una implementación real, esto actualizaría la base de datos
  console.log('Actualizando configuración global:', config);
  return true;
}

/**
 * Actualiza la configuración específica de un dispositivo
 */
async function updateDeviceConfig(deviceId: string, config: any) {
  // En una implementación real, esto actualizaría la base de datos
  console.log(`Actualizando configuración para dispositivo ${deviceId}:`, config);
  return true;
}

/**
 * Guarda reportes de error en la base de datos
 */
async function saveErrorReports(reports: any[], deviceId: string, batchId: string) {
  // En una implementación real, esto guardaría en la base de datos
  console.log(`Guardando ${reports.length} reportes de error para dispositivo ${deviceId}`);
  
  // Guardar también capturas de pantalla si existen
  reports.forEach(report => {
    if (report.screenshot) {
      const screenshotData = report.screenshot.replace(/^data:image\/\w+;base64,/, '');
      const screenshotBuffer = Buffer.from(screenshotData, 'base64');
      
      const screenshotDir = path.join(process.cwd(), 'uploads', 'screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      
      const filename = `${deviceId}_${report.id}.png`;
      fs.writeFileSync(path.join(screenshotDir, filename), screenshotBuffer);
      
      // Reemplazar datos base64 con referencia a archivo para ahorrar espacio
      report.screenshot = `/uploads/screenshots/${filename}`;
    }
  });
  
  return true;
}

/**
 * Genera acciones que el dispositivo debe tomar en respuesta a errores
 */
function generateResponseActions(reports: any[], deviceId: string) {
  const actions = [];
  
  // Verificar errores críticos
  const criticalErrors = reports.filter(r => r.severity === 'critical');
  if (criticalErrors.length > 0) {
    actions.push({
      action: 'show_maintenance_mode',
      params: {
        message: 'Este dispositivo requiere mantenimiento. Contacte a soporte.'
      }
    });
  }
  
  // Verificar errores de NFC
  const nfcErrors = reports.filter(r => r.category === 'nfc');
  if (nfcErrors.length > 2) {
    actions.push({
      action: 'update_config',
      params: {
        nfc: {
          useFallbackApi: true
        }
      }
    });
  }
  
  // Verificar errores de red
  const networkErrors = reports.filter(r => r.category === 'network');
  if (networkErrors.length > 3) {
    actions.push({
      action: 'update_config',
      params: {
        network: {
          maxRetries: 5,
          retryInterval: 5000
        }
      }
    });
  }
  
  return actions;
}

/**
 * Verifica si hay actualizaciones disponibles para un dispositivo
 */
async function checkForDeviceUpdates(deviceId: string, currentVersion: string) {
  // En una implementación real, esto verificaría la base de datos
  // Por ahora, devolvemos null (no hay actualizaciones)
  return null;
}

/**
 * Registra un comando para que un dispositivo lo recoja
 */
async function registerDeviceCommand(deviceId: string, command: string, params: any) {
  // En una implementación real, esto guardaría en la base de datos
  console.log(`Registrando comando '${command}' para dispositivo ${deviceId}:`, params);
  return true;
}

/**
 * Obtiene estadísticas de dispositivos para el dashboard de administración
 */
async function getDeviceStats() {
  // En una implementación real, esto consultaría la base de datos
  return {
    totalDevices: 0,
    activeDevices: 0,
    devicesWithErrors: 0,
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0
  };
}