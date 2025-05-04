import { Router, Request, Response } from 'express';
import { db } from './db';
import { SQL, sql } from 'drizzle-orm';
import { 
  posDevices, 
  posSessions, 
  posSales,
  insertPosDeviceSchema,
  openSessionSchema,
  closeSessionSchema,
  insertPosSaleSchema,
  generateSessionCode
} from '@shared/pos-schema';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { ZodError } from 'zod';

export const posManagementRouter = Router();

// Middleware para verificar autenticación
function isAuthenticated(req: Request, res: Response, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Acceso no autorizado' });
}

// Middleware para verificar rol de administrador o certificador
function hasAuthorizedRole(req: Request, res: Response, next: any) {
  if (req.isAuthenticated() && 
      (req.user.role === 'admin' || 
       req.user.role === 'certifier' || 
       req.user.role === 'manager')) {
    return next();
  }
  res.status(403).json({ error: 'No tienes permisos para esta operación' });
}

/**
 * Obtener todos los dispositivos POS
 * GET /api/pos-management/devices
 */
posManagementRouter.get('/devices', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const devices = await db.select().from(posDevices).orderBy(posDevices.deviceCode);
    res.json(devices);
  } catch (error) {
    console.error('Error al obtener dispositivos POS:', error);
    res.status(500).json({ error: 'Error al obtener dispositivos POS' });
  }
});

/**
 * Obtener un dispositivo POS específico
 * GET /api/pos-management/devices/:deviceCode
 */
posManagementRouter.get('/devices/:deviceCode', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { deviceCode } = req.params;
    const [device] = await db.select().from(posDevices).where(eq(posDevices.deviceCode, deviceCode));
    
    if (!device) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }
    
    res.json(device);
  } catch (error) {
    console.error('Error al obtener dispositivo POS:', error);
    res.status(500).json({ error: 'Error al obtener dispositivo POS' });
  }
});

/**
 * Registrar un nuevo dispositivo POS
 * POST /api/pos-management/devices
 */
posManagementRouter.post('/devices', hasAuthorizedRole, async (req: Request, res: Response) => {
  try {
    const validatedData = insertPosDeviceSchema.parse(req.body);
    
    // Verificar si el código ya existe
    const [existingDevice] = await db.select({ id: posDevices.id })
      .from(posDevices)
      .where(eq(posDevices.deviceCode, validatedData.deviceCode));
    
    if (existingDevice) {
      return res.status(400).json({ error: 'El código de dispositivo ya existe' });
    }
    
    // Agregar el ID del usuario que registra el dispositivo
    const dataToInsert = {
      ...validatedData,
      createdBy: req.user?.id
    };
    
    const [newDevice] = await db.insert(posDevices).values(dataToInsert).returning();
    res.status(201).json(newDevice);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    console.error('Error al registrar dispositivo POS:', error);
    res.status(500).json({ error: 'Error al registrar dispositivo POS' });
  }
});

/**
 * Actualizar un dispositivo POS
 * PUT /api/pos-management/devices/:deviceCode
 */
posManagementRouter.put('/devices/:deviceCode', hasAuthorizedRole, async (req: Request, res: Response) => {
  try {
    const { deviceCode } = req.params;
    const validatedData = insertPosDeviceSchema.partial().parse(req.body);
    
    // Verificar si el dispositivo existe
    const [existingDevice] = await db.select().from(posDevices).where(eq(posDevices.deviceCode, deviceCode));
    
    if (!existingDevice) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }
    
    const [updatedDevice] = await db.update(posDevices)
      .set({
        ...validatedData,
        // No permitir modificar el código de dispositivo
        deviceCode: existingDevice.deviceCode,
        updatedAt: new Date()
      })
      .where(eq(posDevices.deviceCode, deviceCode))
      .returning();
    
    res.json(updatedDevice);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    console.error('Error al actualizar dispositivo POS:', error);
    res.status(500).json({ error: 'Error al actualizar dispositivo POS' });
  }
});

/**
 * Obtener la sesión activa de un dispositivo
 * GET /api/pos-management/devices/:deviceCode/active-session
 */
posManagementRouter.get('/devices/:deviceCode/active-session', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { deviceCode } = req.params;
    
    // Buscar sesión activa
    const [activeSession] = await db.select()
      .from(posSessions)
      .where(
        and(
          eq(posSessions.deviceCode, deviceCode),
          eq(posSessions.status, 'open')
        )
      );
    
    if (!activeSession) {
      return res.status(404).json({ error: 'No hay sesión activa para este dispositivo' });
    }
    
    res.json(activeSession);
  } catch (error) {
    console.error('Error al obtener sesión activa:', error);
    res.status(500).json({ error: 'Error al obtener sesión activa' });
  }
});

/**
 * Abrir una nueva sesión
 * POST /api/pos-management/sessions/open
 */
posManagementRouter.post('/sessions/open', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const validatedData = openSessionSchema.parse(req.body);
    const { deviceCode, initialAmount = 0, notes } = validatedData;
    
    // Verificar si ya existe una sesión activa para este dispositivo
    const [activeSession] = await db.select({ id: posSessions.id })
      .from(posSessions)
      .where(
        and(
          eq(posSessions.deviceCode, deviceCode),
          eq(posSessions.status, 'open')
        )
      );
    
    if (activeSession) {
      return res.status(400).json({ error: 'Ya existe una sesión activa para este dispositivo' });
    }
    
    // Verificar si el dispositivo existe
    const [device] = await db.select().from(posDevices).where(eq(posDevices.deviceCode, deviceCode));
    
    if (!device) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }
    
    // Generar código de sesión
    const sessionCode = generateSessionCode(deviceCode);
    
    // Crear nueva sesión
    const [newSession] = await db.insert(posSessions)
      .values({
        deviceId: device.id,
        deviceCode: deviceCode,
        sessionCode,
        userId: req.user?.id,
        openingUserId: req.user?.id,
        initialAmount: initialAmount.toString(),
        notes,
        status: 'open'
      })
      .returning();
    
    // Actualizar última actividad del dispositivo
    await db.update(posDevices)
      .set({ lastActive: new Date() })
      .where(eq(posDevices.id, device.id));
    
    res.status(201).json(newSession);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    console.error('Error al abrir sesión:', error);
    res.status(500).json({ error: 'Error al abrir sesión' });
  }
});

/**
 * Cerrar una sesión
 * POST /api/pos-management/sessions/close
 */
posManagementRouter.post('/sessions/close', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const validatedData = closeSessionSchema.parse(req.body);
    const { sessionId, finalAmount, notes } = validatedData;
    
    // Verificar si la sesión existe y está abierta
    const [session] = await db.select()
      .from(posSessions)
      .where(
        and(
          eq(posSessions.id, sessionId),
          eq(posSessions.status, 'open')
        )
      );
    
    if (!session) {
      return res.status(404).json({ error: 'Sesión no encontrada o ya está cerrada' });
    }
    
    // Obtener totales de ventas
    const salesCountResult = await db.execute(
      sql`SELECT COUNT(*) as total_transactions, COALESCE(SUM(amount), 0) as total_sales
          FROM pos_sales
          WHERE session_id = ${sessionId}`
    );
    const salesStats = salesCountResult.rows[0];
    
    // Cerrar sesión
    const [closedSession] = await db.update(posSessions)
      .set({
        closingUserId: req.user?.id,
        closingTime: new Date(),
        finalAmount: finalAmount.toString(),
        totalSales: salesStats.total_sales || '0',
        transactionCount: parseInt(salesStats.total_transactions) || 0,
        notes: notes || session.notes,
        status: 'closed',
        updatedAt: new Date()
      })
      .where(eq(posSessions.id, sessionId))
      .returning();
    
    res.json(closedSession);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    console.error('Error al cerrar sesión:', error);
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
});

/**
 * Registrar una venta
 * POST /api/pos-management/sales
 */
posManagementRouter.post('/sales', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const validatedData = insertPosSaleSchema.parse(req.body);
    
    // Verificar si la sesión existe y está abierta
    if (validatedData.sessionId) {
      const [session] = await db.select()
        .from(posSessions)
        .where(
          and(
            eq(posSessions.id, validatedData.sessionId),
            eq(posSessions.status, 'open')
          )
        );
      
      if (!session) {
        return res.status(400).json({ error: 'Sesión no encontrada o cerrada' });
      }
      
      // Verificar si el dispositivo existe
      const [device] = await db.select().from(posDevices).where(eq(posDevices.id, validatedData.deviceId));
      
      if (!device) {
        return res.status(404).json({ error: 'Dispositivo no encontrado' });
      }
    }
    
    // Registrar la venta con el usuario actual
    const saleData = {
      ...validatedData,
      userId: req.user?.id
    };
    
    // Registrar la venta
    const [newSale] = await db.insert(posSales).values(saleData).returning();
    
    res.status(201).json(newSale);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    console.error('Error al registrar venta:', error);
    res.status(500).json({ error: 'Error al registrar venta' });
  }
});

/**
 * Obtener historial de sesiones de un dispositivo
 * GET /api/pos-management/devices/:deviceCode/sessions
 */
posManagementRouter.get('/devices/:deviceCode/sessions', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { deviceCode } = req.params;
    
    // Obtener dispositivo primero para obtener su ID
    const [device] = await db.select().from(posDevices).where(eq(posDevices.deviceCode, deviceCode));
    
    if (!device) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }
    
    // Obtener todas las sesiones del dispositivo, ordenadas por fecha
    const sessions = await db.select()
      .from(posSessions)
      .where(eq(posSessions.deviceId, device.id))
      .orderBy(desc(posSessions.openingTime));
    
    res.json(sessions);
  } catch (error) {
    console.error('Error al obtener historial de sesiones:', error);
    res.status(500).json({ error: 'Error al obtener historial de sesiones' });
  }
});

/**
 * Obtener ventas de una sesión específica
 * GET /api/pos-management/sessions/:sessionId/sales
 */
posManagementRouter.get('/sessions/:sessionId/sales', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    // Obtener ventas de la sesión
    const sales = await db.select()
      .from(posSales)
      .where(eq(posSales.sessionId, parseInt(sessionId)))
      .orderBy(desc(posSales.createdAt));
    
    res.json(sales);
  } catch (error) {
    console.error('Error al obtener ventas de la sesión:', error);
    res.status(500).json({ error: 'Error al obtener ventas de la sesión' });
  }
});

/**
 * Obtener estadísticas de un dispositivo
 * GET /api/pos-management/devices/:deviceCode/stats
 */
posManagementRouter.get('/devices/:deviceCode/stats', hasAuthorizedRole, async (req: Request, res: Response) => {
  try {
    const { deviceCode } = req.params;
    
    // Obtener dispositivo primero para obtener su ID
    const [device] = await db.select().from(posDevices).where(eq(posDevices.deviceCode, deviceCode));
    
    if (!device) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }
    
    // Obtener estadísticas de sesiones
    const sessionCountResult = await db.execute(
      sql`SELECT COUNT(*) as total_sessions, MAX(opening_time) as last_session
          FROM pos_sessions 
          WHERE device_id = ${device.id}`
    );
    const sessionStats = sessionCountResult.rows[0];
    
    // Obtener estadísticas de ventas
    const salesStatsResult = await db.execute(
      sql`SELECT COUNT(*) as total_sales, 
             COALESCE(SUM(amount), 0) as total_amount,
             COALESCE(SUM(commission), 0) as total_commission
          FROM pos_sales 
          WHERE device_id = ${device.id}`
    );
    const salesStats = salesStatsResult.rows[0];
    
    res.json({
      deviceCode,
      sessions: {
        total: parseInt(sessionStats.total_sessions) || 0,
        lastActive: sessionStats.last_session || null
      },
      sales: {
        total: parseInt(salesStats.total_sales) || 0,
        amount: parseFloat(salesStats.total_amount) || 0,
        commission: parseFloat(salesStats.total_commission) || 0
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del dispositivo:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas del dispositivo' });
  }
});

/**
 * Verificar código de dispositivo
 * GET /api/pos-management/verify-device/:deviceCode
 */
posManagementRouter.get('/verify-device/:deviceCode', async (req: Request, res: Response) => {
  try {
    const { deviceCode } = req.params;
    
    // Verificar si el dispositivo existe y está activo
    const [device] = await db.select()
      .from(posDevices)
      .where(
        and(
          eq(posDevices.deviceCode, deviceCode),
          eq(posDevices.isActive, true)
        )
      );
    
    if (!device) {
      return res.status(404).json({ 
        valid: false,
        message: 'Dispositivo no encontrado o inactivo' 
      });
    }
    
    // Verificar si hay una sesión activa
    const [activeSession] = await db.select()
      .from(posSessions)
      .where(
        and(
          eq(posSessions.deviceCode, deviceCode),
          eq(posSessions.status, 'open')
        )
      );
    
    res.json({
      valid: true,
      device,
      hasActiveSession: !!activeSession,
      activeSession: activeSession || null
    });
  } catch (error) {
    console.error('Error al verificar código de dispositivo:', error);
    res.status(500).json({ 
      valid: false,
      message: 'Error al verificar código de dispositivo' 
    });
  }
});