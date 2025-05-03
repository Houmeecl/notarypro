/**
 * Rutas API para la gestión de contratos digitales
 * 
 * Este módulo proporciona endpoints para listar, ver y generar contratos
 * con datos específicos del usuario.
 */

import { Router, Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

export const contractRouter = Router();

// Lista de contratos disponibles
const contratos = [
  {
    id: "compraventa-vehiculo",
    name: "Contrato de Compraventa de Vehículo",
    filename: "compraventa_vehiculo.html"
  },
  {
    id: "transferencia-vehiculo",
    name: "Contrato de Transferencia de Vehículo",
    filename: "transferencia_vehiculo.html"
  }
];

// Definición de los campos necesarios para cada contrato
const camposContratos: Record<string, any> = {
  "compraventa-vehiculo": [
    { name: "ciudad", label: "Ciudad", type: "text", required: true },
    { name: "fecha", label: "Fecha", type: "date", required: true },
    { name: "nombreVendedor", label: "Nombre completo del vendedor", type: "text", required: true },
    { name: "nacionalidadVendedor", label: "Nacionalidad del vendedor", type: "text", required: true },
    { name: "rutVendedor", label: "RUT del vendedor", type: "text", required: true },
    { name: "domicilioVendedor", label: "Domicilio del vendedor", type: "text", required: true },
    { name: "nombreComprador", label: "Nombre completo del comprador", type: "text", required: true },
    { name: "nacionalidadComprador", label: "Nacionalidad del comprador", type: "text", required: true },
    { name: "rutComprador", label: "RUT del comprador", type: "text", required: true },
    { name: "domicilioComprador", label: "Domicilio del comprador", type: "text", required: true },
    { name: "marcaVehiculo", label: "Marca del vehículo", type: "text", required: true },
    { name: "modeloVehiculo", label: "Modelo del vehículo", type: "text", required: true },
    { name: "añoVehiculo", label: "Año del vehículo", type: "number", required: true },
    { name: "colorVehiculo", label: "Color del vehículo", type: "text", required: true },
    { name: "numeroMotor", label: "Número de motor", type: "text", required: true },
    { name: "numeroChasis", label: "Número de chasis", type: "text", required: true },
    { name: "placaPatente", label: "Placa patente", type: "text", required: true },
    { name: "precioVehiculo", label: "Precio de venta", type: "text", required: true },
    { name: "formaPago", label: "Forma de pago", type: "text", required: true },
    { name: "responsableTransferencia", label: "Responsable de la transferencia", type: "text", required: true },
    { name: "ciudadDomicilio", label: "Ciudad de domicilio legal", type: "text", required: true }
  ],
  "transferencia-vehiculo": [
    { name: "ciudad", label: "Ciudad", type: "text", required: true },
    { name: "fecha", label: "Fecha", type: "date", required: true },
    { name: "nombreCedente", label: "Nombre completo del cedente", type: "text", required: true },
    { name: "nacionalidadCedente", label: "Nacionalidad del cedente", type: "text", required: true },
    { name: "rutCedente", label: "RUT del cedente", type: "text", required: true },
    { name: "domicilioCedente", label: "Domicilio del cedente", type: "text", required: true },
    { name: "nombreCesionario", label: "Nombre completo del cesionario", type: "text", required: true },
    { name: "nacionalidadCesionario", label: "Nacionalidad del cesionario", type: "text", required: true },
    { name: "rutCesionario", label: "RUT del cesionario", type: "text", required: true },
    { name: "domicilioCesionario", label: "Domicilio del cesionario", type: "text", required: true },
    { name: "tipoVehiculo", label: "Tipo de vehículo", type: "text", required: true },
    { name: "marcaVehiculo", label: "Marca del vehículo", type: "text", required: true },
    { name: "modeloVehiculo", label: "Modelo del vehículo", type: "text", required: true },
    { name: "añoVehiculo", label: "Año del vehículo", type: "number", required: true },
    { name: "colorVehiculo", label: "Color del vehículo", type: "text", required: true },
    { name: "numeroMotor", label: "Número de motor", type: "text", required: true },
    { name: "numeroChasis", label: "Número de chasis", type: "text", required: true },
    { name: "placaPatente", label: "Placa patente", type: "text", required: true },
    { name: "numeroInscripcion", label: "Número de inscripción", type: "text", required: true },
    { name: "precioTransferencia", label: "Precio de transferencia", type: "text", required: true },
    { name: "formaPago", label: "Forma de pago", type: "text", required: true },
    { name: "responsableTransferencia", label: "Responsable de la transferencia", type: "text", required: true },
    { name: "ciudadDomicilio", label: "Ciudad de domicilio legal", type: "text", required: true }
  ]
};

// Middleware para verificar autenticación (opcional)
function isAuthenticated(req: Request, res: Response, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Debe iniciar sesión para acceder a esta funcionalidad' });
}

/**
 * Obtener lista de todos los contratos disponibles
 * GET /api/contracts
 */
contractRouter.get('/', async (req: Request, res: Response) => {
  try {
    res.json({ contratos });
  } catch (error) {
    console.error('Error al obtener contratos:', error);
    res.status(500).json({ error: 'Error al obtener la lista de contratos' });
  }
});

/**
 * Obtener un contrato específico
 * GET /api/contracts/:id
 */
contractRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const contratoId = req.params.id;
    const contrato = contratos.find(c => c.id === contratoId);
    
    if (!contrato) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }
    
    res.json({ contrato });
  } catch (error) {
    console.error('Error al obtener contrato:', error);
    res.status(500).json({ error: 'Error al obtener el contrato' });
  }
});

/**
 * Obtener campos requeridos para un contrato específico
 * GET /api/contracts/:id/fields
 */
contractRouter.get('/:id/fields', async (req: Request, res: Response) => {
  try {
    const contratoId = req.params.id;
    const campos = camposContratos[contratoId];
    
    if (!campos) {
      return res.status(404).json({ error: 'Campos de contrato no encontrados' });
    }
    
    res.json({ fields: campos });
  } catch (error) {
    console.error('Error al obtener campos del contrato:', error);
    res.status(500).json({ error: 'Error al obtener los campos del contrato' });
  }
});

/**
 * Generar un contrato con datos específicos
 * POST /api/contracts/:id/generate
 */
contractRouter.post('/:id/generate', async (req: Request, res: Response) => {
  try {
    const contratoId = req.params.id;
    const contrato = contratos.find(c => c.id === contratoId);
    
    if (!contrato) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }
    
    const campos = camposContratos[contratoId];
    
    // Verificar si todos los campos requeridos están presentes
    const camposFaltantes = campos
      .filter(campo => campo.required)
      .filter(campo => !req.body[campo.name]);
    
    if (camposFaltantes.length > 0) {
      return res.status(400).json({ 
        error: 'Campos requeridos faltantes', 
        campos: camposFaltantes.map(c => c.name) 
      });
    }
    
    // Generar código de verificación único
    const verificationCode = generateVerificationCode();
    
    // Leer la plantilla del contrato
    const templatePath = path.join(process.cwd(), 'docs', 'contratos', contrato.filename);
    let templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // Reemplazar variables en la plantilla
    const formData = req.body;
    templateContent = templateContent.replace(/{{verificationCode}}/g, verificationCode);
    templateContent = templateContent.replace(/{{fechaGeneracion}}/g, new Date().toLocaleDateString('es-CL'));
    
    // Reemplazar todos los campos de datos
    for (const key in formData) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      templateContent = templateContent.replace(regex, formData[key]);
    }
    
    // Generar archivo final
    const outputFilename = `${contratoId}-${verificationCode}.html`;
    const outputPath = path.join(process.cwd(), 'docs', 'contratos', 'generados', outputFilename);
    
    // Crear directorio si no existe
    const outputDir = path.join(process.cwd(), 'docs', 'contratos', 'generados');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, templateContent);
    
    // Devolver URL del contrato generado
    const contractUrl = `/docs/contratos/generados/${outputFilename}`;
    
    res.json({ 
      message: 'Contrato generado correctamente',
      contractUrl,
      verificationCode
    });
  } catch (error) {
    console.error('Error al generar contrato:', error);
    res.status(500).json({ error: 'Error al generar el contrato' });
  }
});

/**
 * Generar un código de verificación único
 * @returns Código de verificación
 */
function generateVerificationCode(): string {
  // Generar un código alfanumérico de 8 caracteres
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}