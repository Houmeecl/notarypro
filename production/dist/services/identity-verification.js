"use strict";
/**
 * Servicio de Verificación de Identidad
 *
 * Este módulo proporciona integración con servicios externos de verificación de identidad
 * como Onfido y Jumio, además de implementar verificaciones locales según los
 * requerimientos de la Ley 19.799 de Chile sobre Firma Electrónica.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.identityVerificationService = exports.IdentityVerificationService = exports.IdentityVerificationProviderFactory = exports.VerificationType = exports.VerificationStatus = exports.VerificationProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const db_1 = require("../db");
const schema_1 = require("@shared/schema");
const drizzle_orm_1 = require("drizzle-orm");
// Tipos para verificación de identidad
var VerificationProvider;
(function (VerificationProvider) {
    VerificationProvider["ONFIDO"] = "onfido";
    VerificationProvider["JUMIO"] = "jumio";
    VerificationProvider["GETAPI"] = "getapi";
    VerificationProvider["INTERNAL"] = "internal"; // Verificación interna (NFC + selfie)
})(VerificationProvider || (exports.VerificationProvider = VerificationProvider = {}));
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["PENDING"] = "pending";
    VerificationStatus["IN_PROGRESS"] = "in_progress";
    VerificationStatus["APPROVED"] = "approved";
    VerificationStatus["REJECTED"] = "rejected";
    VerificationStatus["ERROR"] = "error";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
var VerificationType;
(function (VerificationType) {
    VerificationType["DOCUMENT"] = "document";
    VerificationType["BIOMETRIC"] = "biometric";
    VerificationType["NFC"] = "nfc";
    VerificationType["ADDRESS"] = "address";
    VerificationType["COMBINED"] = "combined";
})(VerificationType || (exports.VerificationType = VerificationType = {}));
/**
 * Clase abstracta que define la interfaz para proveedores de verificación
 */
class IdentityVerificationProvider {
}
/**
 * Implementación para Onfido
 */
class OnfidoProvider {
    constructor() {
        this.name = VerificationProvider.ONFIDO;
        this.apiUrl = 'https://api.onfido.com/v3';
        const apiKey = process.env.ONFIDO_API_KEY;
        if (!apiKey) {
            throw new Error('ONFIDO_API_KEY no está configurado en las variables de entorno');
        }
        this.apiKey = apiKey;
    }
    async initVerification(userId, type) {
        try {
            // Obtener información del usuario
            const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            // Crear un solicitante en Onfido
            const applicantResponse = await axios_1.default.post(`${this.apiUrl}/applicants`, {
                first_name: user.firstName || 'Usuario',
                last_name: user.lastName || 'Apellido',
                email: user.email
            }, {
                headers: {
                    'Authorization': `Token token=${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const applicantId = applicantResponse.data.id;
            // Crear verificación según el tipo solicitado
            let checkType = '';
            switch (type) {
                case VerificationType.DOCUMENT:
                    checkType = 'document';
                    break;
                case VerificationType.BIOMETRIC:
                    checkType = 'facial_similarity';
                    break;
                case VerificationType.COMBINED:
                    checkType = 'standard';
                    break;
                default:
                    checkType = 'document';
            }
            // Crear un SDK token para la verificación del lado del cliente
            const sdkTokenResponse = await axios_1.default.post(`${this.apiUrl}/sdk_token`, {
                applicant_id: applicantId,
                referrer: '*://*/*'
            }, {
                headers: {
                    'Authorization': `Token token=${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const verificationId = (0, uuid_1.v4)();
            // Guardar la información de verificación en la base de datos
            await db_1.db.insert(schema_1.identityVerifications).values({
                id: verificationId,
                userId,
                provider: this.name,
                providerReferenceId: applicantId,
                status: VerificationStatus.PENDING,
                type,
                createdAt: new Date(),
                details: {
                    applicantId,
                    sdkToken: sdkTokenResponse.data.token,
                    checkType
                }
            });
            return {
                success: true,
                verificationId,
                provider: this.name,
                status: VerificationStatus.PENDING,
                details: {
                    applicantId,
                    sdkToken: sdkTokenResponse.data.token
                }
            };
        }
        catch (error) {
            console.error('Error al iniciar verificación con Onfido:', error);
            return {
                success: false,
                verificationId: (0, uuid_1.v4)(),
                provider: this.name,
                status: VerificationStatus.ERROR,
                error: error.message || 'Error desconocido al iniciar la verificación'
            };
        }
    }
    async checkVerificationStatus(verificationId) {
        try {
            // Obtener detalles de la verificación desde la base de datos
            const [verification] = await db_1.db
                .select()
                .from(schema_1.identityVerifications)
                .where((0, drizzle_orm_1.eq)(schema_1.identityVerifications.id, verificationId));
            if (!verification) {
                throw new Error('Verificación no encontrada');
            }
            if (!verification.details || !verification.details.applicantId) {
                throw new Error('Detalles de verificación no válidos');
            }
            const applicantId = verification.details.applicantId;
            // Consultar el estado en Onfido
            const checksResponse = await axios_1.default.get(`${this.apiUrl}/applicants/${applicantId}/checks`, {
                headers: {
                    'Authorization': `Token token=${this.apiKey}`
                }
            });
            const checks = checksResponse.data.checks || [];
            if (checks.length === 0) {
                return VerificationStatus.PENDING;
            }
            // Evaluar el estado general de las verificaciones
            const latestCheck = checks[0];
            let status;
            switch (latestCheck.status) {
                case 'in_progress':
                    status = VerificationStatus.IN_PROGRESS;
                    break;
                case 'complete':
                    if (latestCheck.result === 'clear') {
                        status = VerificationStatus.APPROVED;
                    }
                    else {
                        status = VerificationStatus.REJECTED;
                    }
                    break;
                case 'awaiting_applicant':
                    status = VerificationStatus.PENDING;
                    break;
                default:
                    status = VerificationStatus.ERROR;
            }
            // Actualizar el estado en la base de datos
            await db_1.db
                .update(schema_1.identityVerifications)
                .set({
                status,
                updatedAt: new Date(),
                details: {
                    ...verification.details,
                    checkStatus: latestCheck.status,
                    checkResult: latestCheck.result,
                    lastChecked: new Date().toISOString()
                }
            })
                .where((0, drizzle_orm_1.eq)(schema_1.identityVerifications.id, verificationId));
            return status;
        }
        catch (error) {
            console.error('Error al verificar estado con Onfido:', error);
            return VerificationStatus.ERROR;
        }
    }
    async getVerificationDetails(verificationId) {
        try {
            const [verification] = await db_1.db
                .select()
                .from(schema_1.identityVerifications)
                .where((0, drizzle_orm_1.eq)(schema_1.identityVerifications.id, verificationId));
            if (!verification) {
                throw new Error('Verificación no encontrada');
            }
            return verification.details || {};
        }
        catch (error) {
            console.error('Error al obtener detalles de verificación:', error);
            return { error: error.message };
        }
    }
}
/**
 * Implementación para Jumio
 */
class JumioProvider {
    constructor() {
        this.name = VerificationProvider.JUMIO;
        this.apiUrl = 'https://api.jumio.com';
        const apiToken = process.env.JUMIO_API_TOKEN;
        const apiSecret = process.env.JUMIO_API_SECRET;
        if (!apiToken || !apiSecret) {
            throw new Error('JUMIO_API_TOKEN o JUMIO_API_SECRET no están configurados en las variables de entorno');
        }
        this.apiToken = apiToken;
        this.apiSecret = apiSecret;
    }
    async initVerification(userId, type) {
        try {
            // Obtener información del usuario
            const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            // Crear una transacción en Jumio
            const auth = Buffer.from(`${this.apiToken}:${this.apiSecret}`).toString('base64');
            const transactionResponse = await axios_1.default.post(`${this.apiUrl}/web/v4/initiateNetverify`, {
                customerInternalReference: `user-${userId}`,
                userReference: `user-${userId}`,
                successUrl: `${process.env.APP_URL}/verificacion/exito`,
                errorUrl: `${process.env.APP_URL}/verificacion/error`,
                callbackUrl: `${process.env.API_URL}/api/identity-verification/jumio-callback`,
                workflowId: type === VerificationType.COMBINED ? 100 :
                    type === VerificationType.DOCUMENT ? 200 :
                        type === VerificationType.BIOMETRIC ? 300 : 100
            }, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'NotaryPro/1.0.0'
                }
            });
            const verificationId = (0, uuid_1.v4)();
            // Guardar la información de verificación en la base de datos
            await db_1.db.insert(schema_1.identityVerifications).values({
                id: verificationId,
                userId,
                provider: this.name,
                providerReferenceId: transactionResponse.data.transactionReference,
                status: VerificationStatus.PENDING,
                type,
                createdAt: new Date(),
                details: {
                    transactionReference: transactionResponse.data.transactionReference,
                    redirectUrl: transactionResponse.data.redirectUrl,
                    workflowId: transactionResponse.data.workflowId
                }
            });
            return {
                success: true,
                verificationId,
                provider: this.name,
                status: VerificationStatus.PENDING,
                details: {
                    redirectUrl: transactionResponse.data.redirectUrl,
                    transactionReference: transactionResponse.data.transactionReference
                }
            };
        }
        catch (error) {
            console.error('Error al iniciar verificación con Jumio:', error);
            return {
                success: false,
                verificationId: (0, uuid_1.v4)(),
                provider: this.name,
                status: VerificationStatus.ERROR,
                error: error.message || 'Error desconocido al iniciar la verificación'
            };
        }
    }
    async checkVerificationStatus(verificationId) {
        try {
            // Obtener detalles de la verificación desde la base de datos
            const [verification] = await db_1.db
                .select()
                .from(schema_1.identityVerifications)
                .where((0, drizzle_orm_1.eq)(schema_1.identityVerifications.id, verificationId));
            if (!verification) {
                throw new Error('Verificación no encontrada');
            }
            if (!verification.details || !verification.details.transactionReference) {
                throw new Error('Detalles de verificación no válidos');
            }
            const transactionReference = verification.details.transactionReference;
            const auth = Buffer.from(`${this.apiToken}:${this.apiSecret}`).toString('base64');
            // Consultar el estado en Jumio
            const transactionResponse = await axios_1.default.get(`${this.apiUrl}/web/v4/transactions/${transactionReference}`, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'User-Agent': 'NotaryPro/1.0.0'
                }
            });
            let status;
            switch (transactionResponse.data.status) {
                case 'PENDING':
                    status = VerificationStatus.PENDING;
                    break;
                case 'PROCESSING':
                    status = VerificationStatus.IN_PROGRESS;
                    break;
                case 'DONE':
                case 'APPROVED':
                    status = VerificationStatus.APPROVED;
                    break;
                case 'DENIED':
                case 'FAILED':
                    status = VerificationStatus.REJECTED;
                    break;
                default:
                    status = VerificationStatus.ERROR;
            }
            // Actualizar el estado en la base de datos
            await db_1.db
                .update(schema_1.identityVerifications)
                .set({
                status,
                updatedAt: new Date(),
                details: {
                    ...verification.details,
                    jumioStatus: transactionResponse.data.status,
                    lastChecked: new Date().toISOString()
                }
            })
                .where((0, drizzle_orm_1.eq)(schema_1.identityVerifications.id, verificationId));
            return status;
        }
        catch (error) {
            console.error('Error al verificar estado con Jumio:', error);
            return VerificationStatus.ERROR;
        }
    }
    async getVerificationDetails(verificationId) {
        try {
            const [verification] = await db_1.db
                .select()
                .from(schema_1.identityVerifications)
                .where((0, drizzle_orm_1.eq)(schema_1.identityVerifications.id, verificationId));
            if (!verification) {
                throw new Error('Verificación no encontrada');
            }
            return verification.details || {};
        }
        catch (error) {
            console.error('Error al obtener detalles de verificación:', error);
            return { error: error.message };
        }
    }
}
/**
 * Implementación para GetAPI (API Chilena)
 */
class GetAPIProvider {
    constructor() {
        this.name = VerificationProvider.GETAPI;
        this.apiUrl = 'https://api.getapi.cl/v1';
        const apiKey = process.env.GETAPI_API_KEY;
        if (!apiKey) {
            throw new Error('GETAPI_API_KEY no está configurado en las variables de entorno');
        }
        this.apiKey = apiKey;
    }
    async initVerification(userId, type) {
        try {
            // Obtener información del usuario
            const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            // Determinar el endpoint según el tipo de verificación
            let endpoint;
            let payload = {};
            switch (type) {
                case VerificationType.DOCUMENT:
                    endpoint = '/identidad/documento';
                    payload = {
                        type: 'cedula_cl',
                        documentNumber: user.documentNumber || ''
                    };
                    break;
                case VerificationType.BIOMETRIC:
                    endpoint = '/biometria/facial';
                    payload = {
                        documentNumber: user.documentNumber || '',
                        selfieImage: user.selfieImage || ''
                    };
                    break;
                case VerificationType.COMBINED:
                    endpoint = '/identidad/validacion-completa';
                    payload = {
                        rut: user.documentNumber || '',
                        name: user.firstName || '',
                        lastName: user.lastName || '',
                        selfieImage: user.selfieImage || ''
                    };
                    break;
                default:
                    endpoint = '/identidad/documento';
                    payload = {
                        type: 'cedula_cl',
                        documentNumber: user.documentNumber || ''
                    };
            }
            // Iniciar verificación con GetAPI
            const verificationResponse = await axios_1.default.post(`${this.apiUrl}${endpoint}`, payload, {
                headers: {
                    'x-api-key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });
            const verificationId = (0, uuid_1.v4)();
            // Guardar la información de verificación en la base de datos
            await db_1.db.insert(schema_1.identityVerifications).values({
                id: verificationId,
                userId,
                provider: this.name,
                providerReferenceId: verificationResponse.data.requestId || verificationId,
                status: this.mapGetAPIStatus(verificationResponse.data.status),
                type,
                createdAt: new Date(),
                details: {
                    response: verificationResponse.data,
                    endpoint,
                    lastChecked: new Date().toISOString()
                }
            });
            return {
                success: verificationResponse.data.valid === true,
                verificationId,
                provider: this.name,
                status: this.mapGetAPIStatus(verificationResponse.data.status),
                details: verificationResponse.data
            };
        }
        catch (error) {
            console.error('Error al iniciar verificación con GetAPI:', error);
            return {
                success: false,
                verificationId: (0, uuid_1.v4)(),
                provider: this.name,
                status: VerificationStatus.ERROR,
                error: error.message || 'Error desconocido al iniciar la verificación'
            };
        }
    }
    async checkVerificationStatus(verificationId) {
        try {
            // En GetAPI, las verificaciones son síncronas, por lo que solo verificamos
            // el registro en nuestra base de datos
            const [verification] = await db_1.db
                .select()
                .from(schema_1.identityVerifications)
                .where((0, drizzle_orm_1.eq)(schema_1.identityVerifications.id, verificationId));
            if (!verification) {
                throw new Error('Verificación no encontrada');
            }
            return verification.status;
        }
        catch (error) {
            console.error('Error al verificar estado con GetAPI:', error);
            return VerificationStatus.ERROR;
        }
    }
    async getVerificationDetails(verificationId) {
        try {
            const [verification] = await db_1.db
                .select()
                .from(schema_1.identityVerifications)
                .where((0, drizzle_orm_1.eq)(schema_1.identityVerifications.id, verificationId));
            if (!verification) {
                throw new Error('Verificación no encontrada');
            }
            return verification.details || {};
        }
        catch (error) {
            console.error('Error al obtener detalles de verificación:', error);
            return { error: error.message };
        }
    }
    mapGetAPIStatus(apiStatus) {
        switch (apiStatus) {
            case 'success':
                return VerificationStatus.APPROVED;
            case 'rejected':
                return VerificationStatus.REJECTED;
            case 'pending':
                return VerificationStatus.PENDING;
            case 'processing':
                return VerificationStatus.IN_PROGRESS;
            default:
                return VerificationStatus.ERROR;
        }
    }
}
/**
 * Implementación para verificación interna (NFC + selfie)
 */
class InternalProvider {
    constructor() {
        this.name = VerificationProvider.INTERNAL;
    }
    async initVerification(userId, type) {
        try {
            // Obtener información del usuario
            const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            const verificationId = (0, uuid_1.v4)();
            // Crear un registro de verificación interna
            await db_1.db.insert(schema_1.identityVerifications).values({
                id: verificationId,
                userId,
                provider: this.name,
                providerReferenceId: verificationId,
                status: VerificationStatus.PENDING,
                type,
                createdAt: new Date(),
                details: {
                    requiredSteps: type === VerificationType.COMBINED ? ['nfc', 'selfie'] :
                        type === VerificationType.NFC ? ['nfc'] :
                            type === VerificationType.BIOMETRIC ? ['selfie'] : ['nfc'],
                    completedSteps: [],
                    initiatedAt: new Date().toISOString()
                }
            });
            return {
                success: true,
                verificationId,
                provider: this.name,
                status: VerificationStatus.PENDING,
                details: {
                    requiredSteps: type === VerificationType.COMBINED ? ['nfc', 'selfie'] :
                        type === VerificationType.NFC ? ['nfc'] :
                            type === VerificationType.BIOMETRIC ? ['selfie'] : ['nfc']
                }
            };
        }
        catch (error) {
            console.error('Error al iniciar verificación interna:', error);
            return {
                success: false,
                verificationId: (0, uuid_1.v4)(),
                provider: this.name,
                status: VerificationStatus.ERROR,
                error: error.message || 'Error desconocido al iniciar la verificación'
            };
        }
    }
    async checkVerificationStatus(verificationId) {
        try {
            const [verification] = await db_1.db
                .select()
                .from(schema_1.identityVerifications)
                .where((0, drizzle_orm_1.eq)(schema_1.identityVerifications.id, verificationId));
            if (!verification) {
                throw new Error('Verificación no encontrada');
            }
            return verification.status;
        }
        catch (error) {
            console.error('Error al verificar estado interno:', error);
            return VerificationStatus.ERROR;
        }
    }
    async getVerificationDetails(verificationId) {
        try {
            const [verification] = await db_1.db
                .select()
                .from(schema_1.identityVerifications)
                .where((0, drizzle_orm_1.eq)(schema_1.identityVerifications.id, verificationId));
            if (!verification) {
                throw new Error('Verificación no encontrada');
            }
            return verification.details || {};
        }
        catch (error) {
            console.error('Error al obtener detalles de verificación:', error);
            return { error: error.message };
        }
    }
    async completeVerificationStep(verificationId, step, stepData) {
        try {
            const [verification] = await db_1.db
                .select()
                .from(schema_1.identityVerifications)
                .where((0, drizzle_orm_1.eq)(schema_1.identityVerifications.id, verificationId));
            if (!verification) {
                throw new Error('Verificación no encontrada');
            }
            if (!verification.details || !verification.details.requiredSteps) {
                throw new Error('Detalles de verificación no válidos');
            }
            const requiredSteps = verification.details.requiredSteps;
            const completedSteps = (verification.details.completedSteps || []);
            if (!requiredSteps.includes(step)) {
                throw new Error(`Paso de verificación ${step} no requerido`);
            }
            if (completedSteps.includes(step)) {
                return verification.status;
            }
            // Añadir el paso a los completados
            completedSteps.push(step);
            // Guardar los datos del paso
            const stepDetails = {
                ...verification.details,
                completedSteps,
                [`${step}Data`]: stepData,
                [`${step}CompletedAt`]: new Date().toISOString()
            };
            // Determinar si todos los pasos se han completado
            const allStepsCompleted = requiredSteps.every(s => completedSteps.includes(s));
            let newStatus = verification.status;
            if (allStepsCompleted) {
                newStatus = VerificationStatus.APPROVED;
            }
            else {
                newStatus = VerificationStatus.IN_PROGRESS;
            }
            // Actualizar el registro de verificación
            await db_1.db
                .update(schema_1.identityVerifications)
                .set({
                status: newStatus,
                updatedAt: new Date(),
                details: stepDetails
            })
                .where((0, drizzle_orm_1.eq)(schema_1.identityVerifications.id, verificationId));
            return newStatus;
        }
        catch (error) {
            console.error('Error al completar paso de verificación:', error);
            return VerificationStatus.ERROR;
        }
    }
}
/**
 * Factoría para obtener un proveedor específico de verificación
 */
class IdentityVerificationProviderFactory {
    static getProvider(provider) {
        switch (provider) {
            case VerificationProvider.ONFIDO:
                return new OnfidoProvider();
            case VerificationProvider.JUMIO:
                return new JumioProvider();
            case VerificationProvider.GETAPI:
                return new GetAPIProvider();
            case VerificationProvider.INTERNAL:
                return new InternalProvider();
            default:
                throw new Error(`Proveedor de verificación no soportado: ${provider}`);
        }
    }
    static getDefaultProvider() {
        // Priorizar proveedores según disponibilidad
        if (process.env.GETAPI_API_KEY) {
            return new GetAPIProvider();
        }
        else if (process.env.ONFIDO_API_KEY) {
            return new OnfidoProvider();
        }
        else if (process.env.JUMIO_API_TOKEN && process.env.JUMIO_API_SECRET) {
            return new JumioProvider();
        }
        else {
            return new InternalProvider();
        }
    }
}
exports.IdentityVerificationProviderFactory = IdentityVerificationProviderFactory;
/**
 * Servicio unificado de verificación de identidad
 */
class IdentityVerificationService {
    async initVerification(userId, type = VerificationType.COMBINED, provider) {
        try {
            const verificationProvider = provider
                ? IdentityVerificationProviderFactory.getProvider(provider)
                : IdentityVerificationProviderFactory.getDefaultProvider();
            return await verificationProvider.initVerification(userId, type);
        }
        catch (error) {
            console.error('Error al iniciar verificación de identidad:', error);
            return {
                success: false,
                verificationId: (0, uuid_1.v4)(),
                provider: provider || VerificationProvider.INTERNAL,
                status: VerificationStatus.ERROR,
                error: error.message || 'Error desconocido al iniciar la verificación'
            };
        }
    }
    async checkVerificationStatus(verificationId) {
        try {
            const [verification] = await db_1.db
                .select()
                .from(schema_1.identityVerifications)
                .where((0, drizzle_orm_1.eq)(schema_1.identityVerifications.id, verificationId));
            if (!verification) {
                throw new Error('Verificación no encontrada');
            }
            const provider = IdentityVerificationProviderFactory.getProvider(verification.provider);
            return await provider.checkVerificationStatus(verificationId);
        }
        catch (error) {
            console.error('Error al verificar estado de identidad:', error);
            return VerificationStatus.ERROR;
        }
    }
    async getVerificationDetails(verificationId) {
        try {
            const [verification] = await db_1.db
                .select()
                .from(schema_1.identityVerifications)
                .where((0, drizzle_orm_1.eq)(schema_1.identityVerifications.id, verificationId));
            if (!verification) {
                throw new Error('Verificación no encontrada');
            }
            const provider = IdentityVerificationProviderFactory.getProvider(verification.provider);
            return await provider.getVerificationDetails(verificationId);
        }
        catch (error) {
            console.error('Error al obtener detalles de verificación:', error);
            return { error: error.message };
        }
    }
    async completeInternalVerificationStep(verificationId, step, stepData) {
        try {
            const [verification] = await db_1.db
                .select()
                .from(schema_1.identityVerifications)
                .where((0, drizzle_orm_1.eq)(schema_1.identityVerifications.id, verificationId));
            if (!verification) {
                throw new Error('Verificación no encontrada');
            }
            if (verification.provider !== VerificationProvider.INTERNAL) {
                throw new Error('Esta función solo es válida para verificaciones internas');
            }
            const internalProvider = IdentityVerificationProviderFactory.getProvider(VerificationProvider.INTERNAL);
            return await internalProvider.completeVerificationStep(verificationId, step, stepData);
        }
        catch (error) {
            console.error('Error al completar paso de verificación interna:', error);
            return VerificationStatus.ERROR;
        }
    }
    async getUserVerifications(userId) {
        try {
            const userVerifications = await db_1.db
                .select()
                .from(schema_1.identityVerifications)
                .where((0, drizzle_orm_1.eq)(schema_1.identityVerifications.userId, userId))
                .orderBy(schema_1.identityVerifications.createdAt);
            return userVerifications;
        }
        catch (error) {
            console.error('Error al obtener verificaciones del usuario:', error);
            return [];
        }
    }
    async getUserLatestVerificationStatus(userId) {
        try {
            const userVerifications = await db_1.db
                .select()
                .from(schema_1.identityVerifications)
                .where((0, drizzle_orm_1.eq)(schema_1.identityVerifications.userId, userId))
                .orderBy(schema_1.identityVerifications.createdAt, 'desc')
                .limit(1);
            if (userVerifications.length === 0) {
                return { hasValidVerification: false };
            }
            const latestVerification = userVerifications[0];
            const isApproved = latestVerification.status === VerificationStatus.APPROVED;
            return {
                hasValidVerification: isApproved,
                latestVerification
            };
        }
        catch (error) {
            console.error('Error al obtener estado de verificación del usuario:', error);
            return { hasValidVerification: false };
        }
    }
}
exports.IdentityVerificationService = IdentityVerificationService;
// Exportar instancia de servicio
exports.identityVerificationService = new IdentityVerificationService();
