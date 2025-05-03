import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { posTransactions, insertPosTransactionSchema } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

const paymentsRouter = express.Router();

// Endpoint para procesar un pago
paymentsRouter.post('/process', async (req, res) => {
  const {
    serviceId,
    amount,
    partnerCode,
    clientId,
    paymentMethod,
    cardInfo,
    description
  } = req.body;

  if (!serviceId || !amount || !partnerCode || !paymentMethod) {
    return res.status(400).json({
      message: "Los campos serviceId, amount, partnerCode y paymentMethod son obligatorios."
    });
  }

  try {
    // Generar ID de transacción
    const transactionId = 'TX-' + uuidv4().substring(0, 8).toUpperCase();
    
    // Calcular comisiones
    const partnerCommission = amount * 0.1; // 10% para el punto Vecino
    const supervisorCommission = amount * 0.02; // 2% para el supervisor
    const sellerCommission = amount * 0.01; // 1% para el vendedor
    const netAmount = amount - (partnerCommission + supervisorCommission + sellerCommission);
    
    // Obtener información del punto Vecino
    const [partner] = await db.query.partners.findMany({
      where: eq(sql`LOWER(code)`, partnerCode.toLowerCase()),
      limit: 1
    });
    
    if (!partner) {
      return res.status(404).json({
        message: "No se encontró el punto Vecino con el código proporcionado."
      });
    }
    
    // Obtener información del vendedor y supervisor asignados
    const sellerId = partner.sellerId;
    let supervisorId = null;
    
    if (sellerId) {
      const [seller] = await db.query.users.findMany({
        where: eq(sql`id`, sellerId),
        limit: 1
      });
      
      if (seller) {
        // Buscar el supervisor asignado al vendedor
        // Esto dependerá de cómo esté estructurada la relación en la base de datos
        // Por ahora, asumimos que es a través de una tabla de asignaciones
        // Esta consulta es un ejemplo y puede necesitar adaptarse
        const [supervisorAssignment] = await db.select()
          .from(sql`seller_assignments`)
          .where(eq(sql`seller_id`, sellerId))
          .limit(1);
        
        if (supervisorAssignment) {
          supervisorId = supervisorAssignment.supervisorId;
        }
      }
    }
    
    // Crear la transacción
    const newTransaction = {
      transactionId,
      partnerId: partner.id,
      amount,
      netAmount,
      partnerCommission,
      supervisorCommission,
      sellerCommission,
      sellerId,
      supervisorId,
      clientId: clientId || 'guest',
      serviceId,
      paymentMethod,
      cardLast4: cardInfo?.last4 || null,
      description,
      status: 'completed',
      createdAt: new Date()
    };
    
    // Validar con el esquema de inserción
    const validatedData = insertPosTransactionSchema.parse(newTransaction);
    
    // Insertar en la base de datos
    const [insertedTransaction] = await db.insert(posTransactions)
      .values(validatedData)
      .returning();
    
    // Actualizar métricas del partner (transacciones totales, comisiones, etc.)
    await db.query.partners.update()
      .set({
        totalTransactions: sql`total_transactions + 1`,
        totalCommissions: sql`total_commissions + ${partnerCommission}`
      })
      .where(eq(sql`id`, partner.id));
    
    res.status(200).json({
      transactionId,
      status: 'completed',
      amount,
      partnerCommission,
      processedAt: new Date()
    });
  } catch (error: any) {
    console.error('Error procesando pago:', error);
    
    res.status(500).json({
      message: "Error interno procesando el pago.",
      details: error.message
    });
  }
});

// Endpoint para obtener una transacción específica
paymentsRouter.get('/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const [transaction] = await db.query.posTransactions.findMany({
      where: eq(posTransactions.transactionId, transactionId),
      limit: 1
    });
    
    if (!transaction) {
      return res.status(404).json({
        message: "Transacción no encontrada."
      });
    }
    
    res.status(200).json(transaction);
  } catch (error: any) {
    console.error('Error al obtener transacción:', error);
    
    res.status(500).json({
      message: "Error interno al obtener la transacción.",
      details: error.message
    });
  }
});

// Endpoint para obtener transacciones por punto Vecino
paymentsRouter.get('/partner/:partnerCode', async (req, res) => {
  try {
    const { partnerCode } = req.params;
    const { limit = '20', page = '1' } = req.query;
    
    const limitNum = parseInt(limit as string, 10);
    const pageNum = parseInt(page as string, 10);
    const offset = (pageNum - 1) * limitNum;
    
    // Primero obtener el ID del partner por su código
    const [partner] = await db.query.partners.findMany({
      where: eq(sql`LOWER(code)`, partnerCode.toLowerCase()),
      limit: 1
    });
    
    if (!partner) {
      return res.status(404).json({
        message: "No se encontró el punto Vecino con el código proporcionado."
      });
    }
    
    // Ahora obtener sus transacciones
    const transactions = await db.query.posTransactions.findMany({
      where: eq(posTransactions.partnerId, partner.id),
      limit: limitNum,
      offset,
      orderBy: (posTransactions, { desc }) => [desc(posTransactions.createdAt)]
    });
    
    // Obtener el total de transacciones para calcular la paginación
    const [{ count }] = await db.select({
      count: sql<number>`count(*)`
    })
    .from(posTransactions)
    .where(eq(posTransactions.partnerId, partner.id));
    
    res.status(200).json({
      transactions,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(count / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Error al obtener transacciones del partner:', error);
    
    res.status(500).json({
      message: "Error interno al obtener las transacciones.",
      details: error.message
    });
  }
});

// Endpoint para obtener estadísticas de transacciones
paymentsRouter.get('/stats/overview', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFilter;
    const now = new Date();
    
    switch(period) {
      case 'day':
        // Hoy
        dateFilter = sql`DATE(created_at) = CURRENT_DATE`;
        break;
      case 'week':
        // Esta semana
        dateFilter = sql`created_at >= DATE_TRUNC('week', CURRENT_DATE)`;
        break;
      case 'month':
      default:
        // Este mes
        dateFilter = sql`created_at >= DATE_TRUNC('month', CURRENT_DATE)`;
        break;
      case 'year':
        // Este año
        dateFilter = sql`created_at >= DATE_TRUNC('year', CURRENT_DATE)`;
        break;
      case 'all':
        // Todas
        dateFilter = sql`1=1`;
        break;
    }
    
    // Obtener estadísticas generales
    const [stats] = await db.select({
      totalTransactions: sql<number>`count(*)`,
      totalAmount: sql<number>`sum(amount)`,
      totalPartnerCommissions: sql<number>`sum(partner_commission)`,
      totalSupervisorCommissions: sql<number>`sum(supervisor_commission)`,
      totalSellerCommissions: sql<number>`sum(seller_commission)`,
      avgTransaction: sql<number>`avg(amount)`,
      maxTransaction: sql<number>`max(amount)`
    })
    .from(posTransactions)
    .where(dateFilter);
    
    // Obtener datos por método de pago
    const paymentMethodStats = await db.select({
      paymentMethod: posTransactions.paymentMethod,
      count: sql<number>`count(*)`,
      totalAmount: sql<number>`sum(amount)`
    })
    .from(posTransactions)
    .where(dateFilter)
    .groupBy(posTransactions.paymentMethod);
    
    // Obtener top partners
    const topPartners = await db.select({
      partnerId: posTransactions.partnerId,
      partnerCode: sql<string>`(SELECT code FROM partners WHERE id = pos_transactions.partner_id)`,
      partnerName: sql<string>`(SELECT name FROM partners WHERE id = pos_transactions.partner_id)`,
      transactions: sql<number>`count(*)`,
      amount: sql<number>`sum(amount)`,
      commission: sql<number>`sum(partner_commission)`
    })
    .from(posTransactions)
    .where(dateFilter)
    .groupBy(posTransactions.partnerId)
    .orderBy(sql`sum(amount) DESC`)
    .limit(5);
    
    res.status(200).json({
      period,
      stats: {
        ...stats,
        totalTransactions: stats.totalTransactions || 0,
        totalAmount: stats.totalAmount || 0,
        totalPartnerCommissions: stats.totalPartnerCommissions || 0,
        totalSupervisorCommissions: stats.totalSupervisorCommissions || 0,
        totalSellerCommissions: stats.totalSellerCommissions || 0,
        avgTransaction: stats.avgTransaction || 0,
        maxTransaction: stats.maxTransaction || 0
      },
      paymentMethodStats,
      topPartners
    });
  } catch (error: any) {
    console.error('Error al obtener estadísticas de transacciones:', error);
    
    res.status(500).json({
      message: "Error interno al obtener las estadísticas.",
      details: error.message
    });
  }
});

export default paymentsRouter;