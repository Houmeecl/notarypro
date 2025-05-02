/**
 * Rutas API para la integración con GetAPI.cl
 * 
 * Este módulo proporciona endpoints para la validación de identidad
 * utilizando los servicios de GetAPI.cl
 */

import { Router, Request, Response } from 'express';
import axios from 'axios';

// Crear el router
export const getApiRouter = Router();

// Constantes
const API_KEY = process.env.GETAPI_API_KEY;
const API_BASE_URL = 'https://api.getapi.cl';

// Middleware de autenticación
function isAuthenticated(req: Request, res: Response, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "No autenticado" });
}

// Middleware para verificar rol de certificador
function isCertifier(req: Request, res: Response, next: any) {
  if (req.isAuthenticated() && req.user && req.user.role === 'certifier') {
    return next();
  }
  res.status(403).json({ error: "Acceso denegado. Se requiere rol de certificador." });
}

// Middleware para verificar rol de administrador
function isAdmin(req: Request, res: Response, next: any) {
  if (req.isAuthenticated() && req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: "Acceso denegado. Se requiere rol de administrador." });
}

/**
 * Verificación básica de identidad
 * POST /api/identity/verify
 */
getApiRouter.post('/verify', isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ 
        error: "La API key de GetAPI.cl no está configurada" 
      });
    }

    const { person, options } = req.body;

    // Validar datos mínimos requeridos
    if (!person || !person.nombre || !person.apellido || !person.rut) {
      return res.status(400).json({ 
        error: "Faltan datos requeridos: nombre, apellido y RUT son obligatorios" 
      });
    }

    // Preparar el payload para GetAPI
    const payload = {
      identity: {
        name: person.nombre,
        lastName: person.apellido,
        rut: formatRut(person.rut),
        dateOfBirth: person.fechaNacimiento || '',
        phone: person.numeroCelular || '',
        email: person.email || ''
      },
      options: {
        strictMode: options?.strictMode || false,
        requiredScore: options?.requiredScore || 80,
        verifyLivingStatus: options?.verifyLivingStatus !== undefined ? options.verifyLivingStatus : true
      }
    };

    // Realizar la llamada a la API
    const response = await axios.post(
      `${API_BASE_URL}/v1/identity/verify`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Registrar la verificación en el histórico
    const verificationRecord = {
      userId: req.user?.id,
      rut: person.rut,
      timestamp: new Date(),
      result: response.data.verified,
      score: response.data.score,
      referenceId: response.data.referenceId
    };

    // TODO: Guardar verificationRecord en la base de datos cuando esté disponible

    // Devolver respuesta
    res.status(200).json({
      status: 'success',
      verified: response.data.verified,
      score: response.data.score,
      details: {
        nameMatch: response.data.details?.nameMatch,
        lastNameMatch: response.data.details?.lastNameMatch,
        dateOfBirthMatch: response.data.details?.dobMatch,
        documentValid: response.data.details?.documentValid,
        livingStatus: response.data.details?.livingStatus
      },
      referenceId: response.data.referenceId
    });
  } catch (error) {
    console.error('Error al verificar identidad con GetAPI:', error);
    
    let errorMessage = 'Error al conectar con el servicio de verificación';
    let statusCode = 500;
    
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = `Error ${error.response.status}: ${
        error.response.data?.message || 'Error del servicio de verificación'
      }`;
      statusCode = error.response.status;
    }
    
    res.status(statusCode).json({
      status: 'error',
      message: errorMessage
    });
  }
});

/**
 * Verificación de identidad con documento
 * POST /api/identity/verify-document
 */
getApiRouter.post('/verify-document', isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ 
        error: "La API key de GetAPI.cl no está configurada" 
      });
    }

    const { person, document, selfie } = req.body;

    // Validar datos mínimos requeridos
    if (!person || !person.nombre || !person.apellido || !person.rut) {
      return res.status(400).json({ 
        error: "Faltan datos requeridos: nombre, apellido y RUT son obligatorios" 
      });
    }

    if (!document || !document.image) {
      return res.status(400).json({ 
        error: "La imagen del documento es obligatoria" 
      });
    }

    // Preparar el payload para GetAPI
    const payload = {
      identity: {
        name: person.nombre,
        lastName: person.apellido,
        rut: formatRut(person.rut),
        dateOfBirth: person.fechaNacimiento || '',
        phone: person.numeroCelular || '',
        email: person.email || ''
      },
      document: {
        image: document.image
      },
      ...(selfie && selfie.image && { selfie: { image: selfie.image } })
    };

    // Realizar la llamada a la API
    const response = await axios.post(
      `${API_BASE_URL}/v1/identity/verify-document`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Registrar la verificación en el histórico
    const verificationRecord = {
      userId: req.user?.id,
      rut: person.rut,
      timestamp: new Date(),
      result: response.data.verified,
      score: response.data.score,
      referenceId: response.data.referenceId,
      includesDocument: true,
      includesSelfie: Boolean(selfie && selfie.image)
    };

    // TODO: Guardar verificationRecord en la base de datos cuando esté disponible

    // Devolver respuesta
    res.status(200).json({
      status: 'success',
      verified: response.data.verified,
      score: response.data.score,
      details: {
        nameMatch: response.data.details?.nameMatch,
        lastNameMatch: response.data.details?.lastNameMatch,
        dateOfBirthMatch: response.data.details?.dobMatch,
        documentValid: response.data.details?.documentValid
      },
      referenceId: response.data.referenceId
    });
  } catch (error) {
    console.error('Error al verificar identidad con documento en GetAPI:', error);
    
    let errorMessage = 'Error al conectar con el servicio de verificación';
    let statusCode = 500;
    
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = `Error ${error.response.status}: ${
        error.response.data?.message || 'Error del servicio de verificación'
      }`;
      statusCode = error.response.status;
    }
    
    res.status(statusCode).json({
      status: 'error',
      message: errorMessage
    });
  }
});

/**
 * Captura de información desde un documento
 * POST /api/identity/extract-document
 */
getApiRouter.post('/extract-document', isCertifier, async (req: Request, res: Response) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ 
        error: "La API key de GetAPI.cl no está configurada" 
      });
    }

    const { documentImage } = req.body;

    if (!documentImage) {
      return res.status(400).json({ 
        error: "La imagen del documento es obligatoria" 
      });
    }

    // Realizar la llamada a la API
    const response = await axios.post(
      `${API_BASE_URL}/v1/identity/extract-document`,
      { document: { image: documentImage } },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Devolver respuesta
    res.status(200).json({
      status: 'success',
      extracted: response.data.extracted,
      data: {
        name: response.data.data?.name,
        lastName: response.data.data?.lastName,
        rut: response.data.data?.rut,
        dateOfBirth: response.data.data?.dateOfBirth,
        nationality: response.data.data?.nationality,
        documentNumber: response.data.data?.documentNumber,
        documentType: response.data.data?.documentType,
        expiryDate: response.data.data?.expiryDate
      },
      referenceId: response.data.referenceId
    });
  } catch (error) {
    console.error('Error al extraer información del documento con GetAPI:', error);
    
    let errorMessage = 'Error al conectar con el servicio de extracción';
    let statusCode = 500;
    
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = `Error ${error.response.status}: ${
        error.response.data?.message || 'Error del servicio de extracción'
      }`;
      statusCode = error.response.status;
    }
    
    res.status(statusCode).json({
      status: 'error',
      message: errorMessage
    });
  }
});

/**
 * Obtener historial de verificaciones
 * GET /api/identity/verification-history
 */
getApiRouter.get('/verification-history', isAdmin, async (req: Request, res: Response) => {
  try {
    // TODO: Implementar cuando la base de datos esté disponible
    // Por ahora devolvemos un array vacío
    res.status(200).json([]);
  } catch (error) {
    console.error('Error al obtener historial de verificaciones:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener historial de verificaciones'
    });
  }
});

/**
 * Formatea un RUT al formato estándar XX.XXX.XXX-X
 * 
 * @param rut RUT a formatear
 * @returns RUT formateado
 */
function formatRut(rut: string): string {
  // Eliminar puntos y guiones
  let cleanRut = rut.toString().replace(/\./g, '').replace('-', '');
  
  // Separar cuerpo y dígito verificador
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toUpperCase();
  
  // Formatear el cuerpo con puntos
  let formattedBody = '';
  let count = 0;
  
  for (let i = body.length - 1; i >= 0; i--) {
    count++;
    formattedBody = body.charAt(i) + formattedBody;
    if (count === 3 && i !== 0) {
      formattedBody = '.' + formattedBody;
      count = 0;
    }
  }
  
  // Retornar RUT formateado
  return `${formattedBody}-${dv}`;
}