"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webappRouter = void 0;
const express_1 = require("express");
exports.webappRouter = (0, express_1.Router)();
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).send('Unauthorized');
}
function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user && req.user.role === 'admin') {
        return next();
    }
    res.status(403).send('Forbidden');
}
// Endpoint para login de tienda mediante código
exports.webappRouter.post('/store-login', async (req, res) => {
    try {
        const { storeCode } = req.body;
        if (!storeCode) {
            return res.status(400).json({ error: 'El código de tienda es requerido' });
        }
        // Verificación manual de códigos de tienda para pruebas
        // Esta es una solución temporal mientras se implementa la base de datos
        const vecinosTestStores = {
            'LOCAL-XP125': {
                id: 125,
                businessName: 'Mini Market El Sol',
                address: 'Av. Providencia 1234, Santiago',
                ownerName: 'María López',
                commissionRate: 0.08,
                active: true,
                createdAt: new Date('2025-03-10')
            },
            'LOCAL-XP201': {
                id: 201,
                businessName: 'Farmacia Vida',
                address: 'Las Condes 567, Santiago',
                ownerName: 'Carlos Rodríguez',
                commissionRate: 0.1,
                active: true,
                createdAt: new Date('2025-03-15')
            },
            'LOCAL-XP315': {
                id: 315,
                businessName: 'Librería Central',
                address: 'Manuel Montt 890, Providencia',
                ownerName: 'Ana Martínez',
                commissionRate: 0.07,
                active: true,
                createdAt: new Date('2025-03-20')
            },
            'LOCAL-XP427': {
                id: 427,
                businessName: 'Café Internet Express',
                address: 'Irarrázaval 1234, Ñuñoa',
                ownerName: 'Pedro Sánchez',
                commissionRate: 0.12,
                active: true,
                createdAt: new Date('2025-03-25')
            }
        };
        const store = vecinosTestStores[storeCode];
        if (!store) {
            return res.status(404).json({ error: 'Tienda no encontrada o código incorrecto' });
        }
        if (!store.active) {
            return res.status(403).json({ error: 'Esta tienda está desactivada. Contacte al administrador.' });
        }
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
    }
    catch (error) {
        console.error('Error en login de tienda:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// Endpoint para obtener tipos de documentos
exports.webappRouter.get('/document-types', async (req, res) => {
    try {
        // Datos de prueba temporales para tipos de documento
        const documentTypes = [
            { id: 1, name: 'Contrato de Arriendo', price: 5000, description: 'Contrato de arrendamiento estándar' },
            { id: 2, name: 'Poder Simple', price: 3500, description: 'Poder para trámites básicos' },
            { id: 3, name: 'Declaración Jurada', price: 4000, description: 'Declaración bajo juramento' },
            { id: 4, name: 'Finiquito Laboral', price: 6000, description: 'Documento de término de relación laboral' },
            { id: 5, name: 'Compraventa', price: 8000, description: 'Contrato de compraventa de bienes' }
        ];
        return res.json(documentTypes);
    }
    catch (error) {
        console.error('Error al obtener tipos de documentos:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// Endpoint para obtener transacciones de una tienda
exports.webappRouter.get('/transactions/:storeId', async (req, res) => {
    try {
        const { storeId } = req.params;
        if (!storeId || isNaN(Number(storeId))) {
            return res.status(400).json({ error: 'ID de tienda inválido' });
        }
        // Datos de prueba temporales para transacciones
        const sid = Number(storeId);
        const sampleTransactions = [
            {
                id: 10001,
                storeId: sid,
                documentName: "Contrato de Arriendo",
                clientName: "Juan Pérez",
                amount: 5000,
                commission: 500,
                commissionRate: 0.1,
                status: "completed",
                createdAt: new Date('2025-04-20T14:30:00')
            },
            {
                id: 10002,
                storeId: sid,
                documentName: "Declaración Jurada",
                clientName: "María González",
                amount: 4000,
                commission: 400,
                commissionRate: 0.1,
                status: "completed",
                createdAt: new Date('2025-04-25T09:15:00')
            },
            {
                id: 10003,
                storeId: sid,
                documentName: "Poder Simple",
                clientName: "Roberto Silva",
                amount: 3500,
                commission: 350,
                commissionRate: 0.1,
                status: "completed",
                createdAt: new Date('2025-04-28T16:45:00')
            }
        ];
        return res.json(sampleTransactions);
    }
    catch (error) {
        console.error('Error al obtener transacciones:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// Endpoint para procesar un nuevo documento (sin autenticación para pruebas)
exports.webappRouter.post('/process-document', async (req, res) => {
    try {
        const { storeId, documentTypeId, clientData } = req.body;
        if (!storeId || !documentTypeId || !clientData) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }
        // Verificación manual de storeId para pruebas
        const vecinosTestStores = {
            125: {
                id: 125,
                businessName: 'Mini Market El Sol',
                address: 'Av. Providencia 1234, Santiago',
                ownerName: 'María López',
                commissionRate: 0.08,
                active: true,
                createdAt: new Date('2025-03-10')
            },
            201: {
                id: 201,
                businessName: 'Farmacia Vida',
                address: 'Las Condes 567, Santiago',
                ownerName: 'Carlos Rodríguez',
                commissionRate: 0.1,
                active: true,
                createdAt: new Date('2025-03-15')
            },
            315: {
                id: 315,
                businessName: 'Librería Central',
                address: 'Manuel Montt 890, Providencia',
                ownerName: 'Ana Martínez',
                commissionRate: 0.07,
                active: true,
                createdAt: new Date('2025-03-20')
            },
            427: {
                id: 427,
                businessName: 'Café Internet Express',
                address: 'Irarrázaval 1234, Ñuñoa',
                ownerName: 'Pedro Sánchez',
                commissionRate: 0.12,
                active: true,
                createdAt: new Date('2025-03-25')
            }
        };
        const sid = Number(storeId);
        const store = vecinosTestStores[sid];
        if (!store) {
            return res.status(404).json({ error: 'Tienda no encontrada' });
        }
        // Verificación manual de documentTypeId para pruebas
        const documentTypes = [
            { id: 1, name: 'Contrato de Arriendo', price: 5000, description: 'Contrato de arrendamiento estándar' },
            { id: 2, name: 'Poder Simple', price: 3500, description: 'Poder para trámites básicos' },
            { id: 3, name: 'Declaración Jurada', price: 4000, description: 'Declaración bajo juramento' },
            { id: 4, name: 'Finiquito Laboral', price: 6000, description: 'Documento de término de relación laboral' },
            { id: 5, name: 'Compraventa', price: 8000, description: 'Contrato de compraventa de bienes' }
        ];
        const documentType = documentTypes.find(d => d.id === Number(documentTypeId));
        if (!documentType) {
            return res.status(404).json({ error: 'Tipo de documento no encontrado' });
        }
        // Generar código único para el documento
        const processingCode = `VC-${Date.now().toString().slice(-6)}`;
        console.log(`Documento procesado: ${documentType.name} para ${clientData.name} en tienda ${store.businessName} (ID: ${store.id})`);
        return res.status(200).json({
            message: 'Documento procesado correctamente',
            processingCode,
            store: {
                id: store.id,
                name: store.businessName
            },
            document: {
                id: Date.now(),
                name: documentType.name,
                price: documentType.price,
                client: clientData.name,
                processingDate: new Date()
            }
        });
    }
    catch (error) {
        console.error('Error al procesar documento:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// Endpoint para crear una nueva tienda (sin autenticación para pruebas)
exports.webappRouter.post('/create-store', async (req, res) => {
    try {
        const { businessName, ownerName, email, phone, address, region, commune, commissionRate, } = req.body;
        // Validaciones
        if (!businessName || !email || !phone || !address) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }
        // Verificación de email único (simulado con datos de prueba)
        const testEmails = ['tienda1@test.com', 'tienda2@test.com', 'tienda3@test.com'];
        if (testEmails.includes(email)) {
            return res.status(400).json({ error: 'Ya existe una tienda con ese email' });
        }
        // Generar código único para la tienda
        const storeCode = `LOCAL-XP${Math.floor(100 + Math.random() * 900)}`;
        // Simulación de creación exitosa sin acceso a la base de datos
        const newPartner = {
            id: Math.floor(1000 + Math.random() * 9000),
            businessName,
            email,
            storeCode,
            active: true,
            commissionRate: commissionRate || 0.05,
            createdAt: new Date()
        };
        console.log(`Nueva tienda creada: ${businessName} (Código: ${storeCode})`);
        // Enviar respuesta
        return res.status(201).json({
            id: newPartner.id,
            businessName: newPartner.businessName,
            email: newPartner.email,
            storeCode: newPartner.storeCode,
            message: 'Tienda creada correctamente',
        });
    }
    catch (error) {
        console.error('Error al crear tienda:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});
