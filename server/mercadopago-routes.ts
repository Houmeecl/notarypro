import { Router, Request, Response } from "express";
import MercadoPagoService from "./services/payment";

export const mercadoPagoRouter = Router();

// Middleware para verificar autenticación
function isAuthenticated(req: Request, res: Response, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "No autenticado" });
}

// Ruta para obtener la clave pública de MercadoPago
mercadoPagoRouter.get("/public-key", (req: Request, res: Response) => {
  try {
    const publicKey = MercadoPagoService.getPublicKey();
    res.json({ publicKey });
  } catch (error) {
    console.error("Error al obtener la clave pública:", error);
    res.status(500).json({ message: "Error al obtener la clave pública" });
  }
});

// Ruta para crear una preferencia de pago
mercadoPagoRouter.post("/create-preference", async (req: Request, res: Response) => {
  try {
    const { items, backUrls, externalReference } = req.body;
    
    // Determinar información de pago basado en si el usuario está autenticado o viene del POS
    let payer;
    
    if (req.isAuthenticated() && req.user) {
      // Si hay usuario autenticado, usar su información
      payer = {
        email: req.user.email || '',
        name: req.user.fullName || '',
        identification: req.body.identification || undefined
      };
    } else if (req.body.customer) {
      // Si viene del POS, usar la información del cliente
      payer = {
        email: req.body.customer.email || '',
        name: req.body.customer.name || '',
        identification: req.body.identification || undefined
      };
    } else {
      // POS sin información de cliente
      payer = {
        email: '',
        name: '',
        identification: req.body.identification || undefined
      };
    }
    
    const preference = await MercadoPagoService.createPaymentPreference(
      items,
      payer,
      backUrls,
      externalReference
    );
    
    res.json(preference);
  } catch (error: any) {
    console.error("Error al crear preferencia de pago:", error);
    res.status(500).json({ 
      message: "Error al crear preferencia de pago",
      error: error.message
    });
  }
});

// Ruta para obtener información de un pago
mercadoPagoRouter.get("/payment/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const paymentId = req.params.id;
    const payment = await MercadoPagoService.getPaymentInfo(paymentId);
    res.json(payment);
  } catch (error: any) {
    console.error("Error al obtener información del pago:", error);
    res.status(500).json({ 
      message: "Error al obtener información del pago",
      error: error.message
    });
  }
});

// Webhook para recibir notificaciones de MercadoPago
mercadoPagoRouter.post("/webhook", async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;
    
    // Solo procesar notificaciones de tipo "payment"
    if (type === "payment") {
      const paymentId = data.id;
      
      // Obtener información del pago
      const paymentInfo = await MercadoPagoService.getPaymentInfo(paymentId);
      
      // Aquí puedes implementar tu lógica para actualizar el estado del pago en tu base de datos
      // Por ejemplo:
      // await updatePaymentStatus(paymentInfo.external_reference, paymentInfo.status);
      
      console.log(`Notificación de pago recibida: ${paymentId}`, paymentInfo);
    }
    
    res.status(200).json({ message: "Webhook recibido correctamente" });
  } catch (error: any) {
    console.error("Error al procesar webhook:", error);
    res.status(500).json({ 
      message: "Error al procesar webhook",
      error: error.message
    });
  }
});

// Ruta para procesar un pago directo (sin redirección)
mercadoPagoRouter.post("/process-payment", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const paymentData = req.body;
    
    // Validar datos mínimos requeridos
    if (!paymentData.token || !paymentData.payment_method_id || !paymentData.transaction_amount) {
      return res.status(400).json({ message: "Datos de pago incompletos" });
    }
    
    const result = await MercadoPagoService.processPayment(paymentData);
    res.json(result);
  } catch (error: any) {
    console.error("Error al procesar pago:", error);
    res.status(500).json({ 
      message: "Error al procesar pago", 
      error: error.message
    });
  }
});

export default mercadoPagoRouter;