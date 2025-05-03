/**
 * Rutas API para la integración con Tuu Payments
 * 
 * Este módulo proporciona endpoints para el procesamiento de pagos
 * utilizando los servicios de Tuu Payments para terminales POS
 */

import { Router, Request, Response } from "express";
import axios from "axios";

export const tuuPaymentRouter = Router();

// Constantes para la API de Tuu
const TUU_API_BASE_URL = "https://api.tuu.cl";
const TUU_API_VERSION = "v1";

/**
 * Iniciar una transacción de pago
 * POST /api/tuu-payment/create-transaction
 */
tuuPaymentRouter.post('/create-transaction', async (req: Request, res: Response) => {
  try {
    const { amount, currency, description, terminalId, clientTransactionId, clientRut } = req.body;
    
    // Validar campos requeridos
    if (!amount || !terminalId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requieren los campos amount y terminalId' 
      });
    }

    // Crear transacción en Tuu
    const response = await axios({
      method: 'POST',
      url: `${TUU_API_BASE_URL}/${TUU_API_VERSION}/transactions`,
      headers: {
        'Authorization': `Bearer ${process.env.POS_PAYMENT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        amount,
        currency: currency || 'CLP',
        description: description || 'Pago NotaryPro',
        terminal_id: terminalId,
        client_transaction_id: clientTransactionId || generateTransactionId(),
        client_rut: clientRut
      }
    });

    return res.status(201).json({
      success: true,
      data: response.data
    });
  } catch (error: any) {
    console.error('Error al crear transacción en Tuu:', error.response?.data || error.message);
    
    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Error al procesar la solicitud de pago',
      error: error.response?.data || error.message
    });
  }
});

/**
 * Verificar estado de una transacción
 * GET /api/tuu-payment/transaction/:id
 */
tuuPaymentRouter.get('/transaction/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const response = await axios({
      method: 'GET',
      url: `${TUU_API_BASE_URL}/${TUU_API_VERSION}/transactions/${id}`,
      headers: {
        'Authorization': `Bearer ${process.env.POS_PAYMENT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error: any) {
    console.error('Error al consultar transacción en Tuu:', error.response?.data || error.message);
    
    return res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error al consultar el estado de la transacción',
      error: error.response?.data || error.message
    });
  }
});

/**
 * Cancelar una transacción
 * POST /api/tuu-payment/transaction/:id/cancel
 */
tuuPaymentRouter.post('/transaction/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const response = await axios({
      method: 'POST',
      url: `${TUU_API_BASE_URL}/${TUU_API_VERSION}/transactions/${id}/cancel`,
      headers: {
        'Authorization': `Bearer ${process.env.POS_PAYMENT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error: any) {
    console.error('Error al cancelar transacción en Tuu:', error.response?.data || error.message);
    
    return res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error al cancelar la transacción',
      error: error.response?.data || error.message
    });
  }
});

/**
 * Obtener terminales disponibles
 * GET /api/tuu-payment/terminals
 */
tuuPaymentRouter.get('/terminals', async (req: Request, res: Response) => {
  try {
    const response = await axios({
      method: 'GET',
      url: `${TUU_API_BASE_URL}/${TUU_API_VERSION}/terminals`,
      headers: {
        'Authorization': `Bearer ${process.env.POS_PAYMENT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error: any) {
    console.error('Error al obtener terminales de Tuu:', error.response?.data || error.message);
    
    return res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error al obtener la lista de terminales',
      error: error.response?.data || error.message
    });
  }
});

/**
 * Webhook para recibir notificaciones de Tuu
 * POST /api/tuu-payment/webhook
 */
tuuPaymentRouter.post('/webhook', async (req: Request, res: Response) => {
  try {
    // Aquí procesaríamos las notificaciones webhook desde Tuu
    // Por seguridad, deberíamos verificar la firma de la notificación
    
    const eventData = req.body;
    console.log('Webhook de Tuu recibido:', eventData);
    
    // Actualizar el estado de la transacción en nuestra base de datos
    // implementar lógica según el tipo de evento recibido

    // Responder con éxito para confirmar la recepción
    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Error al procesar webhook de Tuu:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al procesar la notificación webhook' 
    });
  }
});

/**
 * Generar un ID de transacción único
 */
function generateTransactionId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 10);
  return `notarypro-${timestamp}-${random}`;
}