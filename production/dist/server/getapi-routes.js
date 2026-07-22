"use strict";
/**
 * Rutas API para la integración con GetAPI.cl
 *
 * Este módulo proporciona endpoints para la validación de identidad
 * utilizando los servicios de GetAPI.cl
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiRouter = void 0;
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Configurar multer para subida de archivos
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = path_1.default.join(__dirname, '../uploads/temp');
            // Crear directorio si no existe
            if (!fs_1.default.existsSync(uploadDir)) {
                fs_1.default.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            // Generar nombre único para evitar colisiones
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024 // Limitar a 5MB
    }
});
// Router para endpoints de identidad
exports.getApiRouter = (0, express_1.Router)();
// Middlewares de autenticación
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ status: 'error', message: 'No autenticado' });
}
function isCertifier(req, res, next) {
    if (req.isAuthenticated() && (req.user.role === 'certifier' || req.user.role === 'admin')) {
        return next();
    }
    res.status(403).json({ status: 'error', message: 'Acceso denegado' });
}
function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ status: 'error', message: 'Acceso denegado' });
}
/**
 * Verificación básica de identidad
 * POST /api/identity/verify
 */
exports.getApiRouter.post('/verify', async (req, res) => {
    try {
        const { rut, nombre, apellido, options = {} } = req.body;
        if (!rut || !nombre) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere al menos RUT y nombre para la verificación'
            });
        }
        // Formatear los datos para la API de GetAPI
        const apiRequestData = {
            rut: formatRut(rut),
            nombres: nombre,
            apellidos: apellido || '',
            options: {
                strictMode: options.strictMode !== undefined ? options.strictMode : true,
                requiredScore: options.requiredScore || 80,
                verifyLivingStatus: options.verifyLivingStatus || false
            }
        };
        // Verificar si tenemos la API key configurada
        if (!process.env.GETAPI_API_KEY) {
            console.warn('GETAPI_API_KEY no está configurada. Se retornará una simulación de respuesta.');
            // Simular respuesta para desarrollo/demo
            const mockResponse = {
                success: Math.random() > 0.3, // Simular éxito/fracaso aleatorio
                score: Math.floor(Math.random() * 100),
                validatedFields: ['rut', 'nombre', 'apellido'],
                message: 'Simulación de verificación completada'
            };
            // Registrar intento de verificación
            logVerificationAttempt({
                rut: formatRut(rut),
                nombre,
                apellido: apellido || '',
                result: mockResponse,
                userId: req.user?.id
            });
            return res.json(mockResponse);
        }
        // Realizar solicitud a GetAPI.cl
        const response = await axios_1.default.post('https://api.getapi.cl/v1/identity/verify', apiRequestData, {
            headers: {
                'Authorization': `Bearer ${process.env.GETAPI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        // Procesar la respuesta
        const result = {
            success: response.data.success,
            score: response.data.score,
            validatedFields: response.data.validated_fields || [],
            message: response.data.message || 'Verificación completada',
            data: response.data
        };
        // Registrar intento de verificación
        logVerificationAttempt({
            rut: formatRut(rut),
            nombre,
            apellido: apellido || '',
            result,
            userId: req.user?.id
        });
        return res.json(result);
    }
    catch (error) {
        console.error('Error en la verificación de identidad:', error);
        if (axios_1.default.isAxiosError(error) && error.response) {
            return res.status(error.response.status).json({
                success: false,
                message: 'Error del servicio de verificación',
                errors: [error.response.data?.message || error.message]
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            errors: [error instanceof Error ? error.message : 'Error desconocido']
        });
    }
});
/**
 * Verificación de identidad con documento
 * POST /api/identity/verify-document
 */
exports.getApiRouter.post('/verify-document', upload.single('documentImage'), async (req, res) => {
    try {
        const { rut, nombre, apellido } = req.body;
        const documentFile = req.file;
        if (!documentFile) {
            return res.status(400).json({
                success: false,
                message: 'No se ha proporcionado imagen del documento'
            });
        }
        if (!rut) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere el RUT para la verificación'
            });
        }
        // Verificar si tenemos la API key configurada
        if (!process.env.GETAPI_API_KEY) {
            console.warn('GETAPI_API_KEY no está configurada. Se retornará una simulación de respuesta.');
            // Limpiar el archivo temporal
            if (documentFile && documentFile.path) {
                fs_1.default.unlink(documentFile.path, (err) => {
                    if (err)
                        console.error('Error eliminando archivo temporal:', err);
                });
            }
            // Simular respuesta para desarrollo/demo
            const mockResponse = {
                success: Math.random() > 0.3, // Simular éxito/fracaso aleatorio
                score: Math.floor(Math.random() * 100),
                document: {
                    type: 'CI',
                    number: formatRut(rut),
                    name: nombre || 'Juan Ejemplo',
                    lastName: apellido || 'Pérez Demo',
                    expirationDate: '2028-12-31'
                },
                message: 'Simulación de verificación con documento completada'
            };
            // Registrar intento de verificación
            logVerificationAttempt({
                rut: formatRut(rut),
                nombre: nombre || 'Juan Ejemplo',
                apellido: apellido || 'Pérez Demo',
                result: mockResponse,
                documentVerified: true,
                userId: req.user?.id
            });
            return res.json(mockResponse);
        }
        // Preparar datos para GetAPI.cl
        const formData = new FormData();
        formData.append('rut', formatRut(rut));
        if (nombre)
            formData.append('nombre', nombre);
        if (apellido)
            formData.append('apellido', apellido);
        // Adjuntar la imagen del documento
        const fileBuffer = fs_1.default.readFileSync(documentFile.path);
        formData.append('documentImage', new Blob([fileBuffer]), documentFile.originalname);
        // Realizar solicitud a GetAPI.cl
        const response = await axios_1.default.post('https://api.getapi.cl/v1/identity/verify-document', formData, {
            headers: {
                'Authorization': `Bearer ${process.env.GETAPI_API_KEY}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        // Limpiar el archivo temporal
        if (documentFile && documentFile.path) {
            fs_1.default.unlink(documentFile.path, (err) => {
                if (err)
                    console.error('Error eliminando archivo temporal:', err);
            });
        }
        // Procesar la respuesta
        const result = {
            success: response.data.success,
            score: response.data.score,
            document: response.data.document || {},
            message: response.data.message || 'Verificación con documento completada',
            data: response.data
        };
        // Registrar intento de verificación
        logVerificationAttempt({
            rut: formatRut(rut),
            nombre: result.document.name || nombre,
            apellido: result.document.lastName || apellido,
            result,
            documentVerified: true,
            userId: req.user?.id
        });
        return res.json(result);
    }
    catch (error) {
        console.error('Error en la verificación con documento:', error);
        // Limpiar el archivo temporal si existe
        if (req.file && req.file.path) {
            fs_1.default.unlink(req.file.path, (err) => {
                if (err)
                    console.error('Error eliminando archivo temporal:', err);
            });
        }
        if (axios_1.default.isAxiosError(error) && error.response) {
            return res.status(error.response.status).json({
                success: false,
                message: 'Error del servicio de verificación',
                errors: [error.response.data?.message || error.message]
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            errors: [error instanceof Error ? error.message : 'Error desconocido']
        });
    }
});
/**
 * Captura de información desde un documento
 * POST /api/identity/extract-document
 */
exports.getApiRouter.post('/extract-document', upload.single('documentImage'), async (req, res) => {
    try {
        const documentFile = req.file;
        if (!documentFile) {
            return res.status(400).json({
                success: false,
                message: 'No se ha proporcionado imagen del documento'
            });
        }
        // Verificar si tenemos la API key configurada
        if (!process.env.GETAPI_API_KEY) {
            console.warn('GETAPI_API_KEY no está configurada. Se retornará una simulación de respuesta.');
            // Limpiar el archivo temporal
            if (documentFile && documentFile.path) {
                fs_1.default.unlink(documentFile.path, (err) => {
                    if (err)
                        console.error('Error eliminando archivo temporal:', err);
                });
            }
            // Simular respuesta para desarrollo/demo
            const mockResponse = {
                success: true,
                document: {
                    type: 'CI',
                    number: '12.345.678-9',
                    name: 'JUAN PEDRO',
                    lastName: 'PÉREZ GONZÁLEZ',
                    nationality: 'CHILENA',
                    birthDate: '1985-05-20',
                    expirationDate: '2028-12-31',
                    issueDate: '2020-12-31',
                    address: 'CALLE EJEMPLO 123, SANTIAGO, CHILE'
                },
                message: 'Simulación de extracción de información completada'
            };
            return res.json(mockResponse);
        }
        // Preparar datos para GetAPI.cl
        const formData = new FormData();
        // Adjuntar la imagen del documento
        const fileBuffer = fs_1.default.readFileSync(documentFile.path);
        formData.append('documentImage', new Blob([fileBuffer]), documentFile.originalname);
        // Realizar solicitud a GetAPI.cl
        const response = await axios_1.default.post('https://api.getapi.cl/v1/identity/extract-document', formData, {
            headers: {
                'Authorization': `Bearer ${process.env.GETAPI_API_KEY}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        // Limpiar el archivo temporal
        if (documentFile && documentFile.path) {
            fs_1.default.unlink(documentFile.path, (err) => {
                if (err)
                    console.error('Error eliminando archivo temporal:', err);
            });
        }
        // Procesar la respuesta
        const result = {
            success: response.data.success,
            document: response.data.document || {},
            message: response.data.message || 'Extracción de información completada',
            data: response.data
        };
        return res.json(result);
    }
    catch (error) {
        console.error('Error en la extracción de información del documento:', error);
        // Limpiar el archivo temporal si existe
        if (req.file && req.file.path) {
            fs_1.default.unlink(req.file.path, (err) => {
                if (err)
                    console.error('Error eliminando archivo temporal:', err);
            });
        }
        if (axios_1.default.isAxiosError(error) && error.response) {
            return res.status(error.response.status).json({
                success: false,
                message: 'Error del servicio de extracción',
                errors: [error.response.data?.message || error.message]
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            errors: [error instanceof Error ? error.message : 'Error desconocido']
        });
    }
});
/**
 * Obtener historial de verificaciones
 * GET /api/identity/verification-history
 */
exports.getApiRouter.get('/verification-history', isAdmin, async (req, res) => {
    try {
        // Implementación pendiente: obtener historial desde la base de datos
        const mockHistory = [
            {
                id: 1,
                rut: '12.345.678-9',
                nombre: 'Juan Pérez',
                timestamp: new Date(),
                success: true,
                score: 95,
                documentVerified: false
            },
            {
                id: 2,
                rut: '9.876.543-2',
                nombre: 'María González',
                timestamp: new Date(Date.now() - 86400000), // 1 día antes
                success: true,
                score: 87,
                documentVerified: true
            }
        ];
        return res.json({
            success: true,
            history: mockHistory
        });
    }
    catch (error) {
        console.error('Error obteniendo historial de verificaciones:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            errors: [error instanceof Error ? error.message : 'Error desconocido']
        });
    }
});
/**
 * Formatea un RUT al formato estándar XX.XXX.XXX-X
 *
 * @param rut RUT a formatear
 * @returns RUT formateado
 */
function formatRut(rut) {
    // Eliminar puntos y guiones
    let value = rut.replace(/\./g, '').replace(/-/g, '').trim().toLowerCase();
    // Verificar si tiene dígito verificador
    if (value.length <= 1) {
        return value;
    }
    // Extraer dígito verificador
    const dv = value.substring(value.length - 1);
    const rutBody = value.substring(0, value.length - 1);
    // Aplicar formato a la parte numérica
    let formatted = rutBody.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    // Retornar con formato XX.XXX.XXX-X
    return `${formatted}-${dv}`;
}
/**
 * Registra un intento de verificación de identidad
 *
 * @param data Datos del intento de verificación
 */
async function logVerificationAttempt(data) {
    try {
        // Implementación pendiente: guardar en la base de datos
        console.info('Verificación de identidad:', {
            timestamp: new Date(),
            ...data
        });
    }
    catch (error) {
        console.error('Error registrando intento de verificación:', error);
    }
}
