import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { generateRandomPassword } from '../../shared/utils/password-util';

export const webappRouter = Router();

function isAuthenticated(req: Request, res: Response, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send('Unauthorized');
}

function isAdmin(req: Request, res: Response, next: any) {
  if (req.isAuthenticated() && req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).send('Forbidden');
}

// Endpoint para login de tienda mediante código
webappRouter.post('/store-login', async (req: Request, res: Response) => {
  try {
    const { storeCode } = req.body;
    
    if (!storeCode) {
      return res.status(400).json({ error: 'El código de tienda es requerido' });
    }
    
    // Buscar la tienda por su código
    const store = await storage.getPartnerByStoreCode(storeCode);
    
    if (!store) {
      return res.status(404).json({ error: 'Tienda no encontrada o código incorrecto' });
    }
    
    if (!store.active) {
      return res.status(403).json({ error: 'Esta tienda está desactivada. Contacte al administrador.' });
    }
    
    // Actualizar último inicio de sesión
    await storage.updatePartnerStoreLastLogin(store.id);
    
    // No enviar la contraseña ni información sensible
    const safeStoreData = {
      id: store.id,
      storeName: store.businessName,
      address: store.address,
      ownerName: store.ownerName,
      commissionRate: store.commissionRate || 0.05,
      joinedAt: store.createdAt,
    };
    
    console.log(`Inicio de sesión exitoso: Tienda ${store.businessName} (ID: ${store.id})`);
    return res.status(200).json(safeStoreData);
  } catch (error) {
    console.error('Error en login de tienda:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para obtener tipos de documentos
webappRouter.get('/document-types', async (req: Request, res: Response) => {
  try {
    const documentTypes = await storage.getDocumentTypes();
    return res.json(documentTypes);
  } catch (error) {
    console.error('Error al obtener tipos de documentos:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para obtener transacciones de una tienda
webappRouter.get('/transactions/:storeId', async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    
    if (!storeId || isNaN(Number(storeId))) {
      return res.status(400).json({ error: 'ID de tienda inválido' });
    }
    
    const transactions = await storage.getPartnerSales(Number(storeId));
    return res.json(transactions);
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para procesar un nuevo documento (admin o supervisor)
webappRouter.post('/process-document', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { storeId, documentTypeId, clientData } = req.body;
    
    if (!storeId || !documentTypeId || !clientData) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    
    // Verificar que la tienda existe
    const store = await storage.getPartner(Number(storeId));
    
    if (!store) {
      return res.status(404).json({ error: 'Tienda no encontrada' });
    }
    
    // Verificar que el tipo de documento existe
    const documentType = await storage.getDocumentType(Number(documentTypeId));
    
    if (!documentType) {
      return res.status(404).json({ error: 'Tipo de documento no encontrado' });
    }
    
    // Procesar el documento
    // TODO: Implementar lógica de procesamiento de documentos
    
    return res.status(200).json({ 
      message: 'Documento procesado correctamente',
      processingCode: `VC-${Date.now().toString().slice(-6)}`,
    });
  } catch (error) {
    console.error('Error al procesar documento:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para crear una nueva tienda (admin o supervisor)
webappRouter.post('/create-store', isAdmin, async (req: Request, res: Response) => {
  try {
    const {
      businessName,
      ownerName,
      email,
      phone,
      address,
      region,
      commune,
      commissionRate,
    } = req.body;
    
    // Validaciones
    if (!businessName || !email || !phone || !address) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    
    // Verificar si ya existe una tienda con ese email
    const existingPartner = await storage.getPartnerByEmail(email);
    
    if (existingPartner) {
      return res.status(400).json({ error: 'Ya existe una tienda con ese email' });
    }
    
    // Generar código único para la tienda
    const storeCode = `VC-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Generar contraseña aleatoria segura
    const password = generateRandomPassword();
    
    // Crear la tienda
    const newPartner = await storage.createPartner({
      businessName,
      ownerName,
      email,
      phone,
      address,
      region,
      commune,
      commissionRate: commissionRate || 0.05,
      status: 'active',
      username: email,
      password,
      storeCode,
    });
    
    // Enviar respuesta sin incluir la contraseña en claro
    return res.status(201).json({
      id: newPartner.id,
      businessName: newPartner.businessName,
      email: newPartner.email,
      storeCode: newPartner.storeCode,
      message: 'Tienda creada correctamente',
    });
  } catch (error) {
    console.error('Error al crear tienda:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});