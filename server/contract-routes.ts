/**
 * Rutas API para la gestión de contratos digitales
 * 
 * Este módulo proporciona endpoints para listar, ver y generar contratos
 * con datos específicos del usuario.
 */

import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';

export const contractRouter = Router();

// Función para verificar autenticación
function isAuthenticated(req: Request, res: Response, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "No autorizado" });
}

/**
 * Obtener lista de todos los contratos disponibles
 * GET /api/contracts
 */
contractRouter.get('/', async (req: Request, res: Response) => {
  try {
    const contratosPath = path.join(process.cwd(), 'docs', 'contratos');
    
    // Verificar si el directorio existe
    if (!fs.existsSync(contratosPath)) {
      return res.status(404).json({ error: 'Directorio de contratos no encontrado' });
    }
    
    const files = fs.readdirSync(contratosPath);
    
    // Formatear la respuesta para mostrar información más amigable
    const contratos = files.map(file => {
      // Eliminar la extensión .html y convertir guiones bajos a espacios
      const name = file.replace('.html', '').replace(/_/g, ' ');
      
      // Capitalizar cada palabra
      const formattedName = name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return {
        id: file.replace('.html', ''),
        name: formattedName,
        filename: file
      };
    });
    
    res.json({ contratos });
  } catch (error) {
    console.error('Error al listar contratos:', error);
    res.status(500).json({ error: 'Error al listar contratos disponibles' });
  }
});

/**
 * Obtener un contrato específico
 * GET /api/contracts/:id
 */
contractRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const contractId = req.params.id;
    const contractPath = path.join(process.cwd(), 'docs', 'contratos', `${contractId}.html`);
    
    if (!fs.existsSync(contractPath)) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }
    
    const contractContent = fs.readFileSync(contractPath, 'utf8');
    res.send(contractContent);
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
    const contractId = req.params.id;
    
    // Definir los campos requeridos según el tipo de contrato
    let fields: {name: string, label: string, type: string, required: boolean}[] = [];
    
    if (contractId === 'compraventa_vehiculo') {
      fields = [
        { name: 'fecha', label: 'Fecha', type: 'date', required: true },
        { name: 'nombreDeudor', label: 'Nombre del Deudor', type: 'text', required: true },
        { name: 'rutDeudor', label: 'RUT del Deudor', type: 'text', required: true },
        { name: 'nombreEntidadAcreedora', label: 'Nombre de la Entidad Acreedora', type: 'text', required: true },
        { name: 'rutEntidadAcreedora', label: 'RUT de la Entidad Acreedora', type: 'text', required: true },
        { name: 'representanteLegal', label: 'Representante Legal', type: 'text', required: true },
        { name: 'rutRepresentante', label: 'RUT del Representante', type: 'text', required: true },
        { name: 'marcaVehiculo', label: 'Marca del Vehículo', type: 'text', required: true },
        { name: 'modeloVehiculo', label: 'Modelo del Vehículo', type: 'text', required: true },
        { name: 'anioVehiculo', label: 'Año del Vehículo', type: 'number', required: true },
        { name: 'patenteVehiculo', label: 'Patente del Vehículo', type: 'text', required: true },
        { name: 'numeroMotor', label: 'Número de Motor', type: 'text', required: true },
        { name: 'numeroChasis', label: 'Número de Chasis', type: 'text', required: true },
        { name: 'fechaContratoPrenda', label: 'Fecha del Contrato de Prenda', type: 'date', required: true },
        { name: 'notaria', label: 'Notaría', type: 'text', required: true },
        { name: 'deudaOriginal', label: 'Deuda Original (CLP)', type: 'number', required: true }
      ];
    } else if (contractId === 'transferencia_vehiculo') {
      fields = [
        { name: 'fecha', label: 'Fecha', type: 'date', required: true },
        { name: 'nombreVendedor', label: 'Nombre del Vendedor', type: 'text', required: true },
        { name: 'rutVendedor', label: 'RUT del Vendedor', type: 'text', required: true },
        { name: 'domicilioVendedor', label: 'Domicilio del Vendedor', type: 'text', required: true },
        { name: 'nombreComprador', label: 'Nombre del Comprador', type: 'text', required: true },
        { name: 'rutComprador', label: 'RUT del Comprador', type: 'text', required: true },
        { name: 'domicilioComprador', label: 'Domicilio del Comprador', type: 'text', required: true },
        { name: 'tipoVehiculo', label: 'Tipo de Vehículo', type: 'text', required: true },
        { name: 'marcaVehiculo', label: 'Marca del Vehículo', type: 'text', required: true },
        { name: 'modeloVehiculo', label: 'Modelo del Vehículo', type: 'text', required: true },
        { name: 'anioVehiculo', label: 'Año del Vehículo', type: 'number', required: true },
        { name: 'colorVehiculo', label: 'Color del Vehículo', type: 'text', required: true },
        { name: 'patenteVehiculo', label: 'Patente del Vehículo', type: 'text', required: true },
        { name: 'numeroMotor', label: 'Número de Motor', type: 'text', required: true },
        { name: 'numeroChasis', label: 'Número de Chasis', type: 'text', required: true },
        { name: 'numeroInscripcion', label: 'Número de Inscripción', type: 'text', required: true },
        { name: 'precioVenta', label: 'Precio de Venta (CLP)', type: 'number', required: true },
        { name: 'formaPago', label: 'Forma de Pago', type: 'text', required: true }
      ];
    } else {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }
    
    res.json({ fields });
  } catch (error) {
    console.error('Error al obtener campos del contrato:', error);
    res.status(500).json({ error: 'Error al obtener campos del contrato' });
  }
});

/**
 * Generar un contrato con datos específicos
 * POST /api/contracts/:id/generate
 */
contractRouter.post('/:id/generate', async (req: Request, res: Response) => {
  try {
    const contractId = req.params.id;
    const formData = req.body;
    
    const contractPath = path.join(process.cwd(), 'docs', 'contratos', `${contractId}.html`);
    
    if (!fs.existsSync(contractPath)) {
      return res.status(404).json({ error: 'Plantilla de contrato no encontrada' });
    }
    
    // Leer la plantilla de contrato
    let contractTemplate = fs.readFileSync(contractPath, 'utf8');
    
    // Generar un código de verificación único
    const verificationCode = uuidv4().substring(0, 8).toUpperCase();
    formData.codigoVerificacion = verificationCode;
    
    // Reemplazar las variables en la plantilla con los datos del formulario
    Object.keys(formData).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      contractTemplate = contractTemplate.replace(regex, formData[key]);
    });
    
    // Crear un nombre de archivo único para el contrato generado
    const timestamp = Date.now();
    const generatedFilename = `${contractId}_${timestamp}.html`;
    const outputPath = path.join(process.cwd(), 'docs', 'contratos', 'generados');
    
    // Asegurarse de que el directorio de contratos generados exista
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    
    const outputFilePath = path.join(outputPath, generatedFilename);
    
    // Guardar el contrato generado
    fs.writeFileSync(outputFilePath, contractTemplate);
    
    res.json({
      success: true,
      message: 'Contrato generado exitosamente',
      contractUrl: `/docs/contratos/generados/${generatedFilename}`,
      verificationCode
    });
  } catch (error) {
    console.error('Error al generar contrato:', error);
    res.status(500).json({ error: 'Error al generar el contrato con los datos proporcionados' });
  }
});