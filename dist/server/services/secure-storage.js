"use strict";
/**
 * Servicio de Almacenamiento Seguro
 *
 * Este módulo proporciona integración con sistemas de almacenamiento seguro
 * para documentos firmados electrónicamente, cumpliendo con los requisitos
 * de la Ley 19.799 de Chile. Implementa cifrado AES para los documentos
 * y metadatos asociados.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.secureStorageService = exports.SecureStorageService = exports.SecureStorageProviderFactory = exports.EncryptionType = exports.StorageProvider = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("../db");
const uuid_1 = require("uuid");
// Temporalmente utilizamos definiciones locales hasta que se actualice el esquema principal
const documentStorageRecords = {
    id: "document_storage_records.id",
    documentId: "document_storage_records.document_id",
    storageLocation: "document_storage_records.storage_location",
    documentHash: "document_storage_records.document_hash"
};
// Helpers para manejo de Streams y buffers
const streamToBuffer = async (stream) => {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
};
// Enums y tipos de almacenamiento seguro
var StorageProvider;
(function (StorageProvider) {
    StorageProvider["S3"] = "s3";
    StorageProvider["LOCAL"] = "local"; // Almacenamiento local (para desarrollo/pruebas)
})(StorageProvider || (exports.StorageProvider = StorageProvider = {}));
var EncryptionType;
(function (EncryptionType) {
    EncryptionType["AES_256_GCM"] = "aes-256-gcm";
    EncryptionType["AES_256_CBC"] = "aes-256-cbc";
})(EncryptionType || (exports.EncryptionType = EncryptionType = {}));
/**
 * Clase base para proveedores de almacenamiento seguro
 */
class SecureStorageProvider {
}
/**
 * Implementación para Amazon S3
 */
class S3StorageProvider {
    constructor() {
        this.name = StorageProvider.S3;
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
        const region = process.env.AWS_REGION || 'us-east-1';
        const bucketName = process.env.S3_BUCKET_NAME;
        const encryptionKey = process.env.ENCRYPTION_KEY;
        if (!accessKeyId || !secretAccessKey || !bucketName) {
            throw new Error('Faltan credenciales de AWS S3 en las variables de entorno');
        }
        if (!encryptionKey) {
            throw new Error('Falta clave de cifrado en las variables de entorno');
        }
        // Derivar clave de cifrado a partir del secreto
        this.encryptionKey = crypto_1.default.scryptSync(encryptionKey, 'salt', 32);
        this.s3Client = new client_s3_1.S3Client({
            region,
            credentials: {
                accessKeyId,
                secretAccessKey
            }
        });
        this.bucketName = bucketName;
    }
    /**
     * Cifra los datos con AES
     */
    encryptData(data, type = EncryptionType.AES_256_GCM) {
        // Generar IV aleatorio
        const iv = crypto_1.default.randomBytes(16);
        if (type === EncryptionType.AES_256_GCM) {
            // Cifrado GCM (más seguro, con autenticación)
            const cipher = crypto_1.default.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
            const encryptedData = Buffer.concat([cipher.update(data), cipher.final()]);
            const authTag = cipher.getAuthTag();
            return { encryptedData, iv, authTag };
        }
        else {
            // Cifrado CBC (compatible con más sistemas)
            const cipher = crypto_1.default.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
            const encryptedData = Buffer.concat([cipher.update(data), cipher.final()]);
            return { encryptedData, iv };
        }
    }
    /**
     * Descifra los datos con AES
     */
    decryptData(encryptedData, iv, type = EncryptionType.AES_256_GCM, authTag) {
        if (type === EncryptionType.AES_256_GCM) {
            // Descifrado GCM
            if (!authTag) {
                throw new Error('Se requiere authTag para descifrar datos con AES-GCM');
            }
            const decipher = crypto_1.default.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
            decipher.setAuthTag(authTag);
            return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
        }
        else {
            // Descifrado CBC
            const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
            return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
        }
    }
    async storeDocument(documentId, documentData, metadata, encryptionType = EncryptionType.AES_256_GCM) {
        try {
            const storageId = (0, uuid_1.v4)();
            const now = new Date();
            const folderPath = `documents/${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
            const fileName = `${storageId}.bin`;
            const fullPath = `${folderPath}/${fileName}`;
            // Calcular hash del documento original (SHA-256)
            const hash = crypto_1.default.createHash('sha256');
            hash.update(documentData);
            const documentHash = hash.digest('hex');
            // Cifrar documento
            const { encryptedData, iv, authTag } = this.encryptData(documentData, encryptionType);
            // Preparar metadatos en formato JSON y cifrarlos
            const metadataWithEncryption = {
                ...metadata,
                documentId,
                documentHash,
                encryptionType,
                iv: iv.toString('base64'),
                ...(authTag ? { authTag: authTag.toString('base64') } : {})
            };
            const metadataStr = JSON.stringify(metadataWithEncryption);
            const { encryptedData: encryptedMetadata, iv: metadataIv, authTag: metadataAuthTag } = this.encryptData(Buffer.from(metadataStr), encryptionType);
            // Subir documento cifrado
            const uploadParams = {
                Bucket: this.bucketName,
                Key: fullPath,
                Body: encryptedData,
                ContentType: 'application/octet-stream',
                Metadata: {
                    'x-amz-meta-encrypted': 'true',
                    'x-amz-meta-encryption-type': encryptionType,
                    'x-amz-meta-document-hash': documentHash,
                    'x-amz-meta-metadata-iv': metadataIv.toString('base64'),
                    ...(metadataAuthTag ? { 'x-amz-meta-metadata-auth-tag': metadataAuthTag.toString('base64') } : {}),
                    'x-amz-meta-encrypted-metadata': encryptedMetadata.toString('base64')
                }
            };
            await this.s3Client.send(new client_s3_1.PutObjectCommand(uploadParams));
            // Generar URL prefirmada (expira en 1 hora)
            const expiresIn = 60 * 60; // 1 hora en segundos
            const cmd = new client_s3_1.GetObjectCommand({
                Bucket: this.bucketName,
                Key: fullPath
            });
            const presignedUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, cmd, { expiresIn });
            // Guardar registro en la base de datos
            await db_1.db.insert(documentStorageRecords).values({
                id: storageId,
                documentId,
                provider: this.name,
                encryptionType,
                storageLocation: fullPath,
                documentHash,
                createdAt: new Date(),
                metadata: {
                    encryptedMetadataBase64: encryptedMetadata.toString('base64'),
                    metadataIv: metadataIv.toString('base64'),
                    ...(metadataAuthTag ? { metadataAuthTag: metadataAuthTag.toString('base64') } : {})
                }
            });
            return {
                success: true,
                storageId,
                provider: this.name,
                encryptionType,
                documentHash,
                fileUrl: presignedUrl
            };
        }
        catch (error) {
            console.error('Error al almacenar documento en S3:', error);
            return {
                success: false,
                storageId: (0, uuid_1.v4)(), // ID temporal para el error
                provider: this.name,
                encryptionType: encryptionType,
                documentHash: '',
                error: error.message || 'Error desconocido al almacenar documento'
            };
        }
    }
    async retrieveDocument(storageId, options) {
        try {
            // Obtener información del documento
            const [storageRecord] = await db_1.db
                .select()
                .from(documentStorageRecords)
                .where(eq => eq(documentStorageRecords.id, storageId));
            if (!storageRecord) {
                throw new Error('Registro de almacenamiento no encontrado');
            }
            // Descargar documento cifrado de S3
            const getParams = {
                Bucket: this.bucketName,
                Key: storageRecord.storageLocation
            };
            const response = await this.s3Client.send(new client_s3_1.GetObjectCommand(getParams));
            if (!response.Body) {
                throw new Error('No se pudo obtener el cuerpo del documento');
            }
            // Convertir stream a buffer
            const encryptedData = await streamToBuffer(response.Body);
            // Extraer metadatos
            const encryptedMetadataBase64 = storageRecord.metadata.encryptedMetadataBase64;
            const metadataIv = Buffer.from(storageRecord.metadata.metadataIv, 'base64');
            const metadataAuthTag = storageRecord.metadata.metadataAuthTag
                ? Buffer.from(storageRecord.metadata.metadataAuthTag, 'base64')
                : undefined;
            // Descifrar metadatos
            const encryptedMetadata = Buffer.from(encryptedMetadataBase64, 'base64');
            const decryptedMetadataBuffer = this.decryptData(encryptedMetadata, metadataIv, storageRecord.encryptionType, metadataAuthTag);
            const decryptedMetadataStr = decryptedMetadataBuffer.toString();
            const metadata = JSON.parse(decryptedMetadataStr);
            // Si no se requiere descifrar, retornar documento cifrado
            if (options?.decrypt === false) {
                return {
                    data: encryptedData,
                    metadata
                };
            }
            // Extraer información de cifrado de los metadatos
            const iv = Buffer.from(metadata.iv, 'base64');
            const authTag = metadata.authTag ? Buffer.from(metadata.authTag, 'base64') : undefined;
            // Descifrar documento
            const decryptedData = this.decryptData(encryptedData, iv, storageRecord.encryptionType, authTag);
            // Validar hash
            const hash = crypto_1.default.createHash('sha256');
            hash.update(decryptedData);
            const calculatedHash = hash.digest('hex');
            if (calculatedHash !== metadata.documentHash) {
                throw new Error('El hash del documento no coincide - posible manipulación');
            }
            return {
                data: decryptedData,
                metadata
            };
        }
        catch (error) {
            console.error('Error al recuperar documento de S3:', error);
            throw error;
        }
    }
    async generatePresignedUrl(storageId, expiresIn = 3600) {
        try {
            // Obtener información del documento
            const [storageRecord] = await db_1.db
                .select()
                .from(documentStorageRecords)
                .where(eq => eq(documentStorageRecords.id, storageId));
            if (!storageRecord) {
                throw new Error('Registro de almacenamiento no encontrado');
            }
            // Generar URL prefirmada
            const cmd = new client_s3_1.GetObjectCommand({
                Bucket: this.bucketName,
                Key: storageRecord.storageLocation
            });
            return await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, cmd, { expiresIn });
        }
        catch (error) {
            console.error('Error al generar URL prefirmada:', error);
            throw error;
        }
    }
    async deleteDocument(storageId) {
        try {
            // Obtener información del documento
            const [storageRecord] = await db_1.db
                .select()
                .from(documentStorageRecords)
                .where(eq => eq(documentStorageRecords.id, storageId));
            if (!storageRecord) {
                throw new Error('Registro de almacenamiento no encontrado');
            }
            // Eliminar de S3
            const deleteParams = {
                Bucket: this.bucketName,
                Key: storageRecord.storageLocation
            };
            await this.s3Client.send(new client_s3_1.DeleteObjectCommand(deleteParams));
            // Eliminar registro de la base de datos
            await db_1.db
                .delete(documentStorageRecords)
                .where(eq => eq(documentStorageRecords.id, storageId));
            return true;
        }
        catch (error) {
            console.error('Error al eliminar documento de S3:', error);
            return false;
        }
    }
}
/**
 * Implementación para almacenamiento local (desarrollo/pruebas)
 */
class LocalStorageProvider {
    constructor() {
        this.name = StorageProvider.LOCAL;
        const encryptionKey = process.env.ENCRYPTION_KEY;
        if (!encryptionKey) {
            throw new Error('Falta clave de cifrado en las variables de entorno');
        }
        // Derivar clave de cifrado a partir del secreto
        this.encryptionKey = crypto_1.default.scryptSync(encryptionKey, 'salt', 32);
        // Directorio de almacenamiento local (relativo a raíz del proyecto)
        this.storageDir = process.env.LOCAL_STORAGE_DIR || './uploads/secure-documents';
        // Asegurar que el directorio exista
        if (!fs_1.default.existsSync(this.storageDir)) {
            fs_1.default.mkdirSync(this.storageDir, { recursive: true });
        }
    }
    /**
     * Cifra los datos con AES
     */
    encryptData(data, type = EncryptionType.AES_256_GCM) {
        // Generar IV aleatorio
        const iv = crypto_1.default.randomBytes(16);
        if (type === EncryptionType.AES_256_GCM) {
            // Cifrado GCM (más seguro, con autenticación)
            const cipher = crypto_1.default.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
            const encryptedData = Buffer.concat([cipher.update(data), cipher.final()]);
            const authTag = cipher.getAuthTag();
            return { encryptedData, iv, authTag };
        }
        else {
            // Cifrado CBC (compatible con más sistemas)
            const cipher = crypto_1.default.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
            const encryptedData = Buffer.concat([cipher.update(data), cipher.final()]);
            return { encryptedData, iv };
        }
    }
    /**
     * Descifra los datos con AES
     */
    decryptData(encryptedData, iv, type = EncryptionType.AES_256_GCM, authTag) {
        if (type === EncryptionType.AES_256_GCM) {
            // Descifrado GCM
            if (!authTag) {
                throw new Error('Se requiere authTag para descifrar datos con AES-GCM');
            }
            const decipher = crypto_1.default.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
            decipher.setAuthTag(authTag);
            return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
        }
        else {
            // Descifrado CBC
            const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
            return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
        }
    }
    async storeDocument(documentId, documentData, metadata, encryptionType = EncryptionType.AES_256_GCM) {
        try {
            const storageId = (0, uuid_1.v4)();
            const now = new Date();
            const folderPath = path_1.default.join(this.storageDir, String(now.getFullYear()), String(now.getMonth() + 1), String(now.getDate()));
            // Asegurar que el directorio exista
            if (!fs_1.default.existsSync(folderPath)) {
                fs_1.default.mkdirSync(folderPath, { recursive: true });
            }
            const fileName = `${storageId}.bin`;
            const metadataFileName = `${storageId}_metadata.json`;
            const fullPath = path_1.default.join(folderPath, fileName);
            const metadataPath = path_1.default.join(folderPath, metadataFileName);
            // Calcular hash del documento original (SHA-256)
            const hash = crypto_1.default.createHash('sha256');
            hash.update(documentData);
            const documentHash = hash.digest('hex');
            // Cifrar documento
            const { encryptedData, iv, authTag } = this.encryptData(documentData, encryptionType);
            // Preparar metadatos en formato JSON y cifrarlos
            const metadataWithEncryption = {
                ...metadata,
                documentId,
                documentHash,
                encryptionType,
                iv: iv.toString('base64'),
                ...(authTag ? { authTag: authTag.toString('base64') } : {})
            };
            const metadataStr = JSON.stringify(metadataWithEncryption);
            const { encryptedData: encryptedMetadata, iv: metadataIv, authTag: metadataAuthTag } = this.encryptData(Buffer.from(metadataStr), encryptionType);
            // Guardar documento cifrado
            fs_1.default.writeFileSync(fullPath, encryptedData);
            // Guardar metadatos cifrados
            const metadataToStore = {
                encryptedMetadataBase64: encryptedMetadata.toString('base64'),
                metadataIv: metadataIv.toString('base64'),
                ...(metadataAuthTag ? { metadataAuthTag: metadataAuthTag.toString('base64') } : {})
            };
            fs_1.default.writeFileSync(metadataPath, JSON.stringify(metadataToStore));
            // Guardar registro en la base de datos
            await db_1.db.insert(documentStorageRecords).values({
                id: storageId,
                documentId,
                provider: this.name,
                encryptionType,
                storageLocation: fullPath,
                documentHash,
                createdAt: new Date(),
                metadata: {
                    encryptedMetadataBase64: encryptedMetadata.toString('base64'),
                    metadataIv: metadataIv.toString('base64'),
                    metadataPath: metadataPath,
                    ...(metadataAuthTag ? { metadataAuthTag: metadataAuthTag.toString('base64') } : {})
                }
            });
            return {
                success: true,
                storageId,
                provider: this.name,
                encryptionType,
                documentHash,
                fileUrl: `file://${fullPath}`
            };
        }
        catch (error) {
            console.error('Error al almacenar documento localmente:', error);
            return {
                success: false,
                storageId: (0, uuid_1.v4)(),
                provider: this.name,
                encryptionType,
                documentHash: '',
                error: error.message || 'Error desconocido al almacenar documento'
            };
        }
    }
    async retrieveDocument(storageId, options) {
        try {
            // Obtener información del documento
            const [storageRecord] = await db_1.db
                .select()
                .from(documentStorageRecords)
                .where(eq => eq(documentStorageRecords.id, storageId));
            if (!storageRecord) {
                throw new Error('Registro de almacenamiento no encontrado');
            }
            // Verificar que los archivos existan
            if (!fs_1.default.existsSync(storageRecord.storageLocation)) {
                throw new Error('Archivo de documento no encontrado');
            }
            // Leer documento cifrado
            const encryptedData = fs_1.default.readFileSync(storageRecord.storageLocation);
            // Extraer metadatos
            const encryptedMetadataBase64 = storageRecord.metadata.encryptedMetadataBase64;
            const metadataIv = Buffer.from(storageRecord.metadata.metadataIv, 'base64');
            const metadataAuthTag = storageRecord.metadata.metadataAuthTag
                ? Buffer.from(storageRecord.metadata.metadataAuthTag, 'base64')
                : undefined;
            // Descifrar metadatos
            const encryptedMetadata = Buffer.from(encryptedMetadataBase64, 'base64');
            const decryptedMetadataBuffer = this.decryptData(encryptedMetadata, metadataIv, storageRecord.encryptionType, metadataAuthTag);
            const decryptedMetadataStr = decryptedMetadataBuffer.toString();
            const metadata = JSON.parse(decryptedMetadataStr);
            // Si no se requiere descifrar, retornar documento cifrado
            if (options?.decrypt === false) {
                return {
                    data: encryptedData,
                    metadata
                };
            }
            // Extraer información de cifrado de los metadatos
            const iv = Buffer.from(metadata.iv, 'base64');
            const authTag = metadata.authTag ? Buffer.from(metadata.authTag, 'base64') : undefined;
            // Descifrar documento
            const decryptedData = this.decryptData(encryptedData, iv, storageRecord.encryptionType, authTag);
            // Validar hash
            const hash = crypto_1.default.createHash('sha256');
            hash.update(decryptedData);
            const calculatedHash = hash.digest('hex');
            if (calculatedHash !== metadata.documentHash) {
                throw new Error('El hash del documento no coincide - posible manipulación');
            }
            return {
                data: decryptedData,
                metadata
            };
        }
        catch (error) {
            console.error('Error al recuperar documento local:', error);
            throw error;
        }
    }
    async generatePresignedUrl(storageId, expiresIn = 3600) {
        try {
            // Obtener información del documento
            const [storageRecord] = await db_1.db
                .select()
                .from(documentStorageRecords)
                .where(eq => eq(documentStorageRecords.id, storageId));
            if (!storageRecord) {
                throw new Error('Registro de almacenamiento no encontrado');
            }
            // En almacenamiento local, no hay URLs prefirmadas
            // En su lugar, devolvemos una URL de acceso directo con un token
            const token = crypto_1.default.randomBytes(16).toString('hex');
            const expiryTimestamp = Math.floor(Date.now() / 1000) + expiresIn;
            // En un entorno real, guardaríamos el token y su tiempo de expiración
            // en una cache o base de datos
            // ...
            return `${process.env.APP_URL || ''}/api/secure-documents/${storageId}/download?token=${token}&expires=${expiryTimestamp}`;
        }
        catch (error) {
            console.error('Error al generar URL de acceso temporal:', error);
            throw error;
        }
    }
    async deleteDocument(storageId) {
        try {
            // Obtener información del documento
            const [storageRecord] = await db_1.db
                .select()
                .from(documentStorageRecords)
                .where(eq => eq(documentStorageRecords.id, storageId));
            if (!storageRecord) {
                throw new Error('Registro de almacenamiento no encontrado');
            }
            // Eliminar archivos
            if (fs_1.default.existsSync(storageRecord.storageLocation)) {
                fs_1.default.unlinkSync(storageRecord.storageLocation);
            }
            // Si hay un archivo de metadatos, eliminarlo también
            const metadataPath = storageRecord.metadata.metadataPath;
            if (metadataPath && fs_1.default.existsSync(metadataPath)) {
                fs_1.default.unlinkSync(metadataPath);
            }
            // Eliminar registro de la base de datos
            await db_1.db
                .delete(documentStorageRecords)
                .where(eq => eq(documentStorageRecords.id, storageId));
            return true;
        }
        catch (error) {
            console.error('Error al eliminar documento local:', error);
            return false;
        }
    }
}
/**
 * Factoría para proveedores de almacenamiento seguro
 */
class SecureStorageProviderFactory {
    static getProvider(provider) {
        switch (provider) {
            case StorageProvider.S3:
                return new S3StorageProvider();
            case StorageProvider.LOCAL:
                return new LocalStorageProvider();
            default:
                throw new Error(`Proveedor de almacenamiento no soportado: ${provider}`);
        }
    }
    static getDefaultProvider() {
        // Determinar el proveedor de almacenamiento predeterminado
        if (process.env.AWS_ACCESS_KEY_ID &&
            process.env.AWS_SECRET_ACCESS_KEY &&
            process.env.S3_BUCKET_NAME) {
            return new S3StorageProvider();
        }
        else {
            return new LocalStorageProvider();
        }
    }
}
exports.SecureStorageProviderFactory = SecureStorageProviderFactory;
/**
 * Servicio unificado de almacenamiento seguro
 */
class SecureStorageService {
    /**
     * Almacena un documento de forma segura
     */
    async storeDocument(documentId, documentData, metadata, options) {
        try {
            const provider = options?.provider
                ? SecureStorageProviderFactory.getProvider(options.provider)
                : SecureStorageProviderFactory.getDefaultProvider();
            const encryptionType = options?.encryptionType || EncryptionType.AES_256_GCM;
            return await provider.storeDocument(documentId, documentData, metadata, encryptionType);
        }
        catch (error) {
            console.error('Error al almacenar documento:', error);
            return {
                success: false,
                storageId: (0, uuid_1.v4)(),
                provider: options?.provider || StorageProvider.LOCAL,
                encryptionType: options?.encryptionType || EncryptionType.AES_256_GCM,
                documentHash: '',
                error: error.message || 'Error desconocido al almacenar documento'
            };
        }
    }
    /**
     * Recupera un documento almacenado de forma segura
     */
    async retrieveDocument(storageId, options) {
        try {
            // Obtener información del almacenamiento
            const [storageRecord] = await db_1.db
                .select()
                .from(documentStorageRecords)
                .where(eq => eq(documentStorageRecords.id, storageId));
            if (!storageRecord) {
                throw new Error('Registro de almacenamiento no encontrado');
            }
            const provider = SecureStorageProviderFactory.getProvider(storageRecord.provider);
            return await provider.retrieveDocument(storageId, options);
        }
        catch (error) {
            console.error('Error al recuperar documento:', error);
            throw error;
        }
    }
    /**
     * Genera una URL temporal para acceso a un documento
     */
    async generatePresignedUrl(storageId, expiresIn = 3600) {
        try {
            // Obtener información del almacenamiento
            const [storageRecord] = await db_1.db
                .select()
                .from(documentStorageRecords)
                .where(eq => eq(documentStorageRecords.id, storageId));
            if (!storageRecord) {
                throw new Error('Registro de almacenamiento no encontrado');
            }
            const provider = SecureStorageProviderFactory.getProvider(storageRecord.provider);
            return await provider.generatePresignedUrl(storageId, expiresIn);
        }
        catch (error) {
            console.error('Error al generar URL temporal:', error);
            throw error;
        }
    }
    /**
     * Elimina un documento almacenado
     */
    async deleteDocument(storageId) {
        try {
            // Obtener información del almacenamiento
            const [storageRecord] = await db_1.db
                .select()
                .from(documentStorageRecords)
                .where(eq => eq(documentStorageRecords.id, storageId));
            if (!storageRecord) {
                throw new Error('Registro de almacenamiento no encontrado');
            }
            const provider = SecureStorageProviderFactory.getProvider(storageRecord.provider);
            return await provider.deleteDocument(storageId);
        }
        catch (error) {
            console.error('Error al eliminar documento:', error);
            return false;
        }
    }
    /**
     * Verifica la integridad de un documento
     */
    async verifyDocumentIntegrity(storageId) {
        try {
            // Obtener información del almacenamiento
            const [storageRecord] = await db_1.db
                .select()
                .from(documentStorageRecords)
                .where(eq => eq(documentStorageRecords.id, storageId));
            if (!storageRecord) {
                return {
                    isValid: false,
                    error: 'Registro de almacenamiento no encontrado'
                };
            }
            const provider = SecureStorageProviderFactory.getProvider(storageRecord.provider);
            // Recuperar documento y metadatos
            const { data, metadata } = await provider.retrieveDocument(storageId);
            // Verificar hash
            const hash = crypto_1.default.createHash('sha256');
            hash.update(data);
            const calculatedHash = hash.digest('hex');
            if (calculatedHash !== metadata.documentHash) {
                return {
                    isValid: false,
                    documentHash: calculatedHash,
                    error: 'El hash del documento no coincide - posible manipulación'
                };
            }
            return {
                isValid: true,
                documentHash: calculatedHash
            };
        }
        catch (error) {
            console.error('Error al verificar integridad del documento:', error);
            return {
                isValid: false,
                error: error.message || 'Error desconocido al verificar documento'
            };
        }
    }
}
exports.SecureStorageService = SecureStorageService;
// Exportar instancia del servicio
exports.secureStorageService = new SecureStorageService();
