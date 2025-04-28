import { Router, Request, Response } from 'express';
import { db } from '../db';
import { partnerStores, users, documentTemplates, partnerTransactions } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

export const webappRouter = Router();

// Middleware para validar el código de local (opcional)
async function validateStoreCode(code: string): Promise<boolean> {
  try {
    const [store] = await db
      .select()
      .from(partnerStores)
      .where(eq(partnerStores.storeCode, code));
    
    return !!store;
  } catch (error) {
    console.error("Error validando código de local:", error);
    return false;
  }
}

// Login de local con código
webappRouter.post('/store-login', async (req: Request, res: Response) => {
  try {
    const { storeCode } = req.body;
    
    if (!storeCode) {
      return res.status(400).json({ error: 'Código de local requerido' });
    }
    
    // Validar código de local
    const isValid = await validateStoreCode(storeCode);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Código de local inválido' });
    }
    
    // Obtener información del local
    const [store] = await db
      .select()
      .from(partnerStores)
      .where(eq(partnerStores.storeCode, storeCode));
    
    // Obtener información del propietario
    const [owner] = await db
      .select()
      .from(users)
      .where(eq(users.id, store.ownerId));
    
    // Retornar información básica del local
    res.status(200).json({
      id: store.id,
      storeName: store.name,
      address: store.address,
      ownerName: owner ? owner.fullName : undefined,
      commissionRate: store.commissionRate,
      joinedAt: store.createdAt
    });
  } catch (error) {
    console.error("Error en login de local:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener tipos de documentos disponibles
webappRouter.get('/document-types', async (req: Request, res: Response) => {
  try {
    // Obtener todos los templates de documentos
    const templates = await db
      .select({
        id: documentTemplates.id,
        name: documentTemplates.name,
        categoryId: documentTemplates.categoryId,
        price: documentTemplates.price
      })
      .from(documentTemplates)
      .where(eq(documentTemplates.active, true));
    
    res.status(200).json(templates);
  } catch (error) {
    console.error("Error obteniendo tipos de documentos:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Schema para validar la información del cliente
const clientInfoSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(8),
  documentNumber: z.string().optional()
});

// Schema para validar la solicitud de procesamiento de documento
const processDocumentSchema = z.object({
  storeId: z.number(),
  documentTypeId: z.number(),
  clientInfo: clientInfoSchema
});

// Procesar un documento
webappRouter.post('/process-document', async (req: Request, res: Response) => {
  try {
    // Validar datos de entrada
    const validatedData = processDocumentSchema.parse(req.body);
    
    // Verificar que el local existe
    const [store] = await db
      .select()
      .from(partnerStores)
      .where(eq(partnerStores.id, validatedData.storeId));
    
    if (!store) {
      return res.status(404).json({ error: 'Local no encontrado' });
    }
    
    // Verificar que el tipo de documento existe
    const [documentType] = await db
      .select()
      .from(documentTemplates)
      .where(eq(documentTemplates.id, validatedData.documentTypeId));
    
    if (!documentType) {
      return res.status(404).json({ error: 'Tipo de documento no encontrado' });
    }
    
    // Crear la transacción
    const [transaction] = await db
      .insert(partnerTransactions)
      .values({
        storeId: validatedData.storeId,
        documentTemplateId: validatedData.documentTypeId,
        clientName: validatedData.clientInfo.name,
        clientEmail: validatedData.clientInfo.email,
        clientPhone: validatedData.clientInfo.phone,
        clientDocument: validatedData.clientInfo.documentNumber || '',
        amount: documentType.price || 20000,
        commission: (documentType.price || 20000) * (store.commissionRate || 0.1),
        status: 'pending',
        processingCode: `VC-${Math.floor(Math.random() * 9000) + 1000}`
      })
      .returning();
    
    // Devolver información de la transacción
    res.status(201).json({
      id: transaction.id,
      documentType: documentType.name,
      clientName: validatedData.clientInfo.name,
      clientEmail: validatedData.clientInfo.email,
      status: transaction.status,
      commission: transaction.commission,
      processingCode: transaction.processingCode,
      createdAt: transaction.createdAt
    });
  } catch (error) {
    console.error("Error procesando documento:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Cerrar sesión (simplemente para validar que el endpoint existe)
webappRouter.post('/store-logout', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Sesión cerrada correctamente' });
});

// Obtener historial de transacciones de un local
webappRouter.get('/transactions/:storeId', async (req: Request, res: Response) => {
  try {
    const storeId = parseInt(req.params.storeId);
    
    if (isNaN(storeId)) {
      return res.status(400).json({ error: 'ID de local inválido' });
    }
    
    // Obtener transacciones del local
    const transactions = await db
      .select({
        id: partnerTransactions.id,
        documentTemplateId: partnerTransactions.documentTemplateId,
        clientName: partnerTransactions.clientName,
        amount: partnerTransactions.amount,
        commission: partnerTransactions.commission,
        status: partnerTransactions.status,
        processingCode: partnerTransactions.processingCode,
        createdAt: partnerTransactions.createdAt
      })
      .from(partnerTransactions)
      .where(eq(partnerTransactions.storeId, storeId));
    
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error obteniendo transacciones:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});