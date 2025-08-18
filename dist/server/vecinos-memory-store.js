"use strict";
// Almacenamiento en memoria para socios Vecinos
Object.defineProperty(exports, "__esModule", { value: true });
exports.vecinosStore = exports.VecinosMemoryStore = void 0;
// Datos de ejemplo de socios
const partners = [
    {
        id: 1,
        username: 'demopartner',
        password: 'password123',
        storeName: 'Minimarket El Sol',
        businessType: 'tienda',
        address: 'Av. Principal 123',
        city: 'Santiago',
        phone: '912345678',
        email: 'demo@vecinos.test',
        ownerName: 'Juan Pérez',
        ownerRut: '12345678-9',
        ownerPhone: '987654321',
        commissionRate: 20,
        balance: 15600,
        status: 'approved',
        avatarUrl: '/images/store-icon.png',
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date()
    },
    {
        id: 2,
        username: 'partner2',
        password: 'partner123',
        storeName: 'Farmacia Vida',
        businessType: 'farmacia',
        address: 'Las Condes 567',
        city: 'Santiago',
        phone: '987654321',
        email: 'partner2@vecinos.test',
        ownerName: 'Carlos Rodríguez',
        ownerRut: '11222333-4',
        ownerPhone: '912345678',
        bankName: 'Banco Estado',
        accountType: 'Cuenta Corriente',
        accountNumber: '12345678',
        commissionRate: 10,
        balance: 25400,
        status: 'approved',
        createdAt: new Date('2025-02-10'),
        updatedAt: new Date()
    },
    {
        id: 3,
        username: 'partner3',
        password: 'partner456',
        storeName: 'Librería Central',
        businessType: 'libreria',
        address: 'Manuel Montt 890',
        city: 'Providencia',
        phone: '945678912',
        email: 'partner3@vecinos.test',
        ownerName: 'Ana Martínez',
        ownerRut: '14789632-5',
        ownerPhone: '956789123',
        commissionRate: 15,
        balance: 5800,
        status: 'approved',
        createdAt: new Date('2025-03-05'),
        updatedAt: new Date()
    },
    {
        id: 4,
        username: 'partner4',
        password: 'partner789',
        storeName: 'Café Internet Express',
        businessType: 'cafe',
        address: 'Irarrázaval 1234',
        city: 'Ñuñoa',
        phone: '978912345',
        email: 'partner4@vecinos.test',
        ownerName: 'Pedro Sánchez',
        ownerRut: '16987456-2',
        ownerPhone: '923456789',
        commissionRate: 12,
        balance: 18700,
        status: 'approved',
        createdAt: new Date('2025-03-15'),
        updatedAt: new Date()
    }
];
// Datos de ejemplo de documentos
const documents = [
    {
        id: 1,
        title: 'Contrato de Arriendo',
        type: 'contrato-arriendo',
        price: 4900,
        status: 'completed',
        partnerId: 1,
        clientName: 'María González',
        clientRut: '15456789-0',
        clientPhone: '956781234',
        clientEmail: 'maria@ejemplo.cl',
        verificationCode: 'ABC123',
        commissionRate: 20,
        createdAt: new Date('2025-04-15T10:30:00'),
        updatedAt: new Date('2025-04-15T10:45:00')
    },
    {
        id: 2,
        title: 'Declaración Jurada',
        type: 'declaracion-jurada',
        price: 3900,
        status: 'completed',
        partnerId: 1,
        clientName: 'Roberto Torres',
        clientRut: '9876543-2',
        clientPhone: '912345678',
        verificationCode: 'DEF456',
        commissionRate: 20,
        createdAt: new Date('2025-04-20T14:15:00'),
        updatedAt: new Date('2025-04-20T14:25:00')
    },
    {
        id: 3,
        title: 'Finiquito',
        type: 'finiquito',
        price: 4500,
        status: 'completed',
        partnerId: 1,
        clientName: 'Carlos Medina',
        clientRut: '18765432-1',
        clientPhone: '945678912',
        clientEmail: 'carlos@ejemplo.cl',
        verificationCode: 'GHI789',
        commissionRate: 20,
        createdAt: new Date('2025-04-28T09:10:00'),
        updatedAt: new Date('2025-04-28T09:25:00')
    }
];
// Datos de ejemplo de transacciones
const transactions = [
    {
        id: 1,
        partnerId: 1,
        documentId: 1,
        amount: 980,
        type: 'commission',
        status: 'completed',
        description: 'Comisión por Contrato de Arriendo',
        createdAt: new Date('2025-04-15T10:45:00')
    },
    {
        id: 2,
        partnerId: 1,
        documentId: 2,
        amount: 780,
        type: 'commission',
        status: 'completed',
        description: 'Comisión por Declaración Jurada',
        createdAt: new Date('2025-04-20T14:25:00')
    },
    {
        id: 3,
        partnerId: 1,
        documentId: 3,
        amount: 900,
        type: 'commission',
        status: 'completed',
        description: 'Comisión por Finiquito',
        createdAt: new Date('2025-04-28T09:25:00')
    }
];
// Datos de ejemplo de notificaciones
const notifications = [
    {
        id: 1,
        partnerId: 1,
        title: 'Nuevo documento procesado',
        message: 'Has procesado un Contrato de Arriendo con éxito. Comisión: $980',
        type: 'success',
        read: true,
        readAt: new Date('2025-04-15T11:20:00'),
        createdAt: new Date('2025-04-15T10:45:00')
    },
    {
        id: 2,
        partnerId: 1,
        title: 'Nuevo documento procesado',
        message: 'Has procesado una Declaración Jurada con éxito. Comisión: $780',
        type: 'success',
        read: true,
        readAt: new Date('2025-04-20T15:05:00'),
        createdAt: new Date('2025-04-20T14:25:00')
    },
    {
        id: 3,
        partnerId: 1,
        title: 'Nuevo documento procesado',
        message: 'Has procesado un Finiquito con éxito. Comisión: $900',
        type: 'success',
        read: false,
        createdAt: new Date('2025-04-28T09:25:00')
    }
];
// Clase para gestionar el almacenamiento en memoria
class VecinosMemoryStore {
    constructor() {
        this.partners = partners;
        this.documents = documents;
        this.transactions = transactions;
        this.notifications = notifications;
    }
    // Obtener un socio por ID
    getPartnerById(id) {
        return this.partners.find(p => p.id === id);
    }
    // Obtener un socio por nombre de usuario
    getPartnerByUsername(username) {
        return this.partners.find(p => p.username === username);
    }
    // Actualizar último login del socio
    updateLastLogin(id) {
        const partner = this.getPartnerById(id);
        if (partner) {
            partner.lastLoginAt = new Date();
            partner.updatedAt = new Date();
        }
    }
    // Obtener documentos de un socio
    getPartnerDocuments(partnerId) {
        return this.documents
            .filter(d => d.partnerId === partnerId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    // Obtener transacciones de un socio
    getPartnerTransactions(partnerId) {
        return this.transactions
            .filter(t => t.partnerId === partnerId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    // Obtener notificaciones de un socio
    getPartnerNotifications(partnerId) {
        return this.notifications
            .filter(n => n.partnerId === partnerId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    // Marcar notificación como leída
    markNotificationAsRead(notificationId, partnerId) {
        const notification = this.notifications.find(n => n.id === notificationId && n.partnerId === partnerId);
        if (notification) {
            notification.read = true;
            notification.readAt = new Date();
            return true;
        }
        return false;
    }
    // Procesar un nuevo documento
    processDocument(partnerId, data) {
        const partner = this.getPartnerById(partnerId);
        if (!partner) {
            throw new Error("Socio no encontrado");
        }
        // Definir precios según el tipo de documento
        const documentPrices = {
            "contrato-arriendo": 4900,
            "contrato-trabajo": 3900,
            "autorizacion-viaje": 5900,
            "finiquito": 4500,
            "certificado-residencia": 3500,
            "declaracion-jurada": 3900,
            "poder-simple": 3800,
            "certificado-nacimiento": 3200,
        };
        // Obtener nombre y precio del documento
        const documentPrice = documentPrices[data.documentType] || 3500;
        let documentTitle = "Documento";
        switch (data.documentType) {
            case "contrato-arriendo":
                documentTitle = "Contrato de Arriendo";
                break;
            case "contrato-trabajo":
                documentTitle = "Contrato de Trabajo";
                break;
            case "autorizacion-viaje":
                documentTitle = "Autorización de Viaje";
                break;
            case "finiquito":
                documentTitle = "Finiquito";
                break;
            case "certificado-residencia":
                documentTitle = "Certificado de Residencia";
                break;
            case "declaracion-jurada":
                documentTitle = "Declaración Jurada";
                break;
            case "poder-simple":
                documentTitle = "Poder Simple";
                break;
            case "certificado-nacimiento":
                documentTitle = "Certificado de Nacimiento";
                break;
            default: documentTitle = "Documento General";
        }
        // Generar código de verificación único
        const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        // Calcular comisión del socio
        const commissionRate = partner.commissionRate;
        const commissionAmount = Math.round(documentPrice * (commissionRate / 100));
        // Crear nuevo documento
        const newDocumentId = this.documents.length > 0
            ? Math.max(...this.documents.map(d => d.id)) + 1
            : 1;
        const newDocument = {
            id: newDocumentId,
            title: documentTitle,
            type: data.documentType,
            price: documentPrice,
            status: "completed",
            partnerId: partnerId,
            clientName: data.clientInfo.name,
            clientRut: data.clientInfo.rut,
            clientPhone: data.clientInfo.phone,
            clientEmail: data.clientInfo.email || null,
            verificationCode: verificationCode,
            commissionRate: commissionRate,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.documents.push(newDocument);
        // Crear nueva transacción
        const newTransactionId = this.transactions.length > 0
            ? Math.max(...this.transactions.map(t => t.id)) + 1
            : 1;
        const newTransaction = {
            id: newTransactionId,
            partnerId: partnerId,
            documentId: newDocument.id,
            amount: commissionAmount,
            type: "commission",
            status: "completed",
            description: `Comisión por ${documentTitle}`,
            createdAt: new Date()
        };
        this.transactions.push(newTransaction);
        // Actualizar balance del socio
        partner.balance += commissionAmount;
        partner.updatedAt = new Date();
        // Crear notificación
        const newNotificationId = this.notifications.length > 0
            ? Math.max(...this.notifications.map(n => n.id)) + 1
            : 1;
        const newNotification = {
            id: newNotificationId,
            partnerId: partnerId,
            title: "Nuevo documento procesado",
            message: `Has procesado un ${documentTitle} con éxito. Comisión: $${commissionAmount}`,
            type: "success",
            read: false,
            createdAt: new Date()
        };
        this.notifications.push(newNotification);
        return {
            document: newDocument,
            transaction: newTransaction
        };
    }
}
exports.VecinosMemoryStore = VecinosMemoryStore;
// Instancia singleton del almacenamiento
exports.vecinosStore = new VecinosMemoryStore();
