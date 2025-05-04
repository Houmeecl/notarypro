import { Router, Request, Response } from 'express';
import { db } from './db';
import { posDevices, posSessions, posSales } from '@shared/pos-schema';
import { 
  insertPosDeviceSchema, 
  insertPosSessionSchema, 
  insertPosSaleSchema,
  closePosSessionSchema
} from '@shared/pos-schema';
import { randomUUID } from 'crypto';
import { eq, and, desc } from 'drizzle-orm';

export const posManagementRouter = Router();

// Middleware para verificar autenticación
function isAuthenticated(req: Request, res: Response, next: any) {
  if (req.isAuthenticated() || process.env.NODE_ENV === 'development') {
    return next();
  }
  res.status(401).json({ error: 'No autorizado' });
}

// Middleware para verificar permisos de administrador
function isAdmin(req: Request, res: Response, next: any) {
  if ((req.isAuthenticated() && req.user?.role === 'admin') || process.env.NODE_ENV === 'development') {
    return next();
  }
  res.status(403).json({ error: 'Acceso denegado' });
}

/**
 * Obtener todos los dispositivos POS
 * GET /api/pos-management/devices
 */
posManagementRouter.get('/devices', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const devices = await db.query.posDevices.findMany({
      orderBy: [desc(posDevices.createdAt)],
    });
    res.json(devices);
  } catch (error) {
    console.error('Error al obtener dispositivos POS:', error);
    res.status(500).json({ error: 'Error al obtener los dispositivos' });
  }
});

/**
 * Obtener un dispositivo POS específico
 * GET /api/pos-management/devices/:id
 */
posManagementRouter.get('/devices/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [device] = await db
      .select()
      .from(posDevices)
      .where(eq(posDevices.id, parseInt(id)));

    if (!device) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }

    res.json(device);
  } catch (error) {
    console.error('Error al obtener dispositivo POS:', error);
    res.status(500).json({ error: 'Error al obtener el dispositivo' });
  }
});

/**
 * Crear un nuevo dispositivo POS
 * POST /api/pos-management/devices
 */
posManagementRouter.post('/devices', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const validatedData = insertPosDeviceSchema.parse(req.body);
    
    // Verificar si ya existe un dispositivo con el mismo código
    const existingDevice = await db
      .select()
      .from(posDevices)
      .where(eq(posDevices.deviceCode, validatedData.deviceCode));
    
    if (existingDevice.length > 0) {
      return res.status(400).json({ 
        error: 'Ya existe un dispositivo con ese código' 
      });
    }
    
    const [newDevice] = await db
      .insert(posDevices)
      .values(validatedData)
      .returning();
    
    res.status(201).json(newDevice);
  } catch (error) {
    console.error('Error al crear dispositivo POS:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: 'Error al crear el dispositivo' });
  }
});

/**
 * Actualizar un dispositivo POS
 * PUT /api/pos-management/devices/:id
 */
posManagementRouter.put('/devices/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = insertPosDeviceSchema.partial().parse(req.body);
    
    // Verificar si el dispositivo existe
    const [existingDevice] = await db
      .select()
      .from(posDevices)
      .where(eq(posDevices.id, parseInt(id)));
    
    if (!existingDevice) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }
    
    // Si se intenta cambiar el código, verificar que no exista otro dispositivo con ese código
    if (
      validatedData.deviceCode && 
      validatedData.deviceCode !== existingDevice.deviceCode
    ) {
      const [duplicateCode] = await db
        .select()
        .from(posDevices)
        .where(eq(posDevices.deviceCode, validatedData.deviceCode));
      
      if (duplicateCode) {
        return res.status(400).json({ 
          error: 'Ya existe un dispositivo con ese código' 
        });
      }
    }
    
    const [updatedDevice] = await db
      .update(posDevices)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(posDevices.id, parseInt(id)))
      .returning();
    
    res.json(updatedDevice);
  } catch (error) {
    console.error('Error al actualizar dispositivo POS:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: 'Error al actualizar el dispositivo' });
  }
});

/**
 * Eliminar un dispositivo POS
 * DELETE /api/pos-management/devices/:id
 */
posManagementRouter.delete('/devices/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar si el dispositivo existe
    const [existingDevice] = await db
      .select()
      .from(posDevices)
      .where(eq(posDevices.id, parseInt(id)));
    
    if (!existingDevice) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }
    
    // Verificar si hay sesiones activas
    const [activeSession] = await db
      .select()
      .from(posSessions)
      .where(
        and(
          eq(posSessions.deviceId, parseInt(id)),
          eq(posSessions.isOpen, true)
        )
      );
    
    if (activeSession) {
      return res.status(400).json({ 
        error: 'No se puede eliminar un dispositivo con sesiones activas' 
      });
    }
    
    // Eliminar el dispositivo
    await db
      .delete(posDevices)
      .where(eq(posDevices.id, parseInt(id)));
    
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar dispositivo POS:', error);
    res.status(500).json({ error: 'Error al eliminar el dispositivo' });
  }
});

/**
 * Obtener la sesión activa de un dispositivo
 * GET /api/pos-management/devices/:id/active-session
 */
posManagementRouter.get('/devices/:id/active-session', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [activeSession] = await db
      .select()
      .from(posSessions)
      .where(
        and(
          eq(posSessions.deviceId, parseInt(id)),
          eq(posSessions.isOpen, true)
        )
      );
    
    if (!activeSession) {
      return res.status(404).json({ error: 'No hay sesión activa para este dispositivo' });
    }
    
    res.json(activeSession);
  } catch (error) {
    console.error('Error al obtener sesión activa:', error);
    res.status(500).json({ error: 'Error al obtener la sesión activa' });
  }
});

/**
 * Obtener las ventas de una sesión
 * GET /api/pos-management/devices/:id/sales
 */
posManagementRouter.get('/devices/:id/sales', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Obtener la sesión activa
    const [activeSession] = await db
      .select()
      .from(posSessions)
      .where(
        and(
          eq(posSessions.deviceId, parseInt(id)),
          eq(posSessions.isOpen, true)
        )
      );
    
    if (!activeSession) {
      return res.json([]);
    }
    
    // Obtener las ventas de la sesión
    const sales = await db
      .select()
      .from(posSales)
      .where(eq(posSales.sessionId, activeSession.id))
      .orderBy(desc(posSales.createdAt));
    
    res.json(sales);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ error: 'Error al obtener las ventas' });
  }
});

/**
 * Crear una nueva sesión para un dispositivo
 * POST /api/pos-management/devices/:id/sessions
 */
posManagementRouter.post('/devices/:id/sessions', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = insertPosSessionSchema.parse(req.body);
    
    // Verificar si el dispositivo existe
    const [device] = await db
      .select()
      .from(posDevices)
      .where(eq(posDevices.id, parseInt(id)));
    
    if (!device) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }
    
    // Verificar si el dispositivo está activo
    if (!device.isActive) {
      return res.status(400).json({ 
        error: 'No se puede abrir una sesión en un dispositivo inactivo' 
      });
    }
    
    // Verificar si ya hay una sesión activa
    const [activeSession] = await db
      .select()
      .from(posSessions)
      .where(
        and(
          eq(posSessions.deviceId, parseInt(id)),
          eq(posSessions.isOpen, true)
        )
      );
    
    if (activeSession) {
      return res.status(400).json({ 
        error: 'Ya existe una sesión activa para este dispositivo' 
      });
    }
    
    // Generar código de sesión
    const sessionCode = generateSessionCode();
    
    // Crear la sesión
    const [newSession] = await db
      .insert(posSessions)
      .values({
        ...validatedData,
        deviceId: parseInt(id),
        sessionCode,
        operatorName: req.user?.username || 'Usuario del sistema',
        operatorId: req.user?.id || null,
      })
      .returning();
    
    res.status(201).json(newSession);
  } catch (error) {
    console.error('Error al crear sesión:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: 'Error al crear la sesión' });
  }
});

/**
 * Cerrar una sesión
 * POST /api/pos-management/sessions/:id/close
 */
posManagementRouter.post('/sessions/:id/close', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = closePosSessionSchema.parse(req.body);
    
    // Verificar si la sesión existe
    const [session] = await db
      .select()
      .from(posSessions)
      .where(eq(posSessions.id, parseInt(id)));
    
    if (!session) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }
    
    // Verificar si la sesión está abierta
    if (!session.isOpen) {
      return res.status(400).json({ error: 'La sesión ya está cerrada' });
    }
    
    // Cerrar la sesión
    const [updatedSession] = await db
      .update(posSessions)
      .set({
        isOpen: false,
        status: 'closed',
        closedAt: new Date(),
        finalAmount: validatedData.finalAmount.toString(),
        notes: validatedData.notes || session.notes,
      })
      .where(eq(posSessions.id, parseInt(id)))
      .returning();
    
    res.json(updatedSession);
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: 'Error al cerrar la sesión' });
  }
});

/**
 * Registrar una venta en una sesión
 * POST /api/pos-management/sessions/:id/sales
 */
posManagementRouter.post('/sessions/:id/sales', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = insertPosSaleSchema.parse(req.body);
    
    // Verificar si la sesión existe
    const [session] = await db
      .select()
      .from(posSessions)
      .where(eq(posSessions.id, parseInt(id)));
    
    if (!session) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }
    
    // Verificar si la sesión está abierta
    if (!session.isOpen) {
      return res.status(400).json({ error: 'No se puede registrar una venta en una sesión cerrada' });
    }
    
    // Registrar la venta
    const [sale] = await db
      .insert(posSales)
      .values({
        ...validatedData,
        sessionId: parseInt(id),
        deviceId: session.deviceId,
      })
      .returning();
    
    res.status(201).json(sale);
  } catch (error) {
    console.error('Error al registrar venta:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: 'Error al registrar la venta' });
  }
});

/**
 * Obtener historial de sesiones de un dispositivo
 * GET /api/pos-management/devices/:id/sessions
 */
posManagementRouter.get('/devices/:id/sessions', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const sessions = await db
      .select()
      .from(posSessions)
      .where(eq(posSessions.deviceId, parseInt(id)))
      .orderBy(desc(posSessions.openedAt));
    
    res.json(sessions);
  } catch (error) {
    console.error('Error al obtener historial de sesiones:', error);
    res.status(500).json({ error: 'Error al obtener el historial de sesiones' });
  }
});

/**
 * Generar un código de sesión único
 * @returns Código de sesión en formato 'XXX-NNNNN'
 */
function generateSessionCode(): string {
  const prefix = 'POS';
  const random = Math.floor(10000 + Math.random() * 90000); // Número aleatorio de 5 dígitos
  return `${prefix}-${random}`;
}