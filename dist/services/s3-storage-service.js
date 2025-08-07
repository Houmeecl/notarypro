"use strict";
/**
 * Servicio de Almacenamiento Seguro S3
 *
 * Implementa la integración con Amazon S3 para almacenamiento seguro de documentos
 * y evidencias de certificación remota (RON), cumpliendo con los requisitos de seguridad.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3StorageService = void 0;
const crypto_1 = require("crypto");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
class S3StorageService {
    constructor() {
        const region = process.env.AWS_REGION || 'us-east-1';
        this.bucketName = process.env.AWS_S3_BUCKET || '';
        // Crear cliente S3
        this.s3Client = new client_s3_1.S3Client({
            region,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
            }
        });
        // Clave para cifrado adicional (además del cifrado de S3)
        // Idealmente, esto estaría en AWS KMS en producción
        const encryptionKeyHex = process.env.STORAGE_ENCRYPTION_KEY || '';
        this.encryptionKey = encryptionKeyHex
            ? Buffer.from(encryptionKeyHex, 'hex')
            : (0, crypto_1.randomBytes)(32); // Clave temporal si no está configurada
        if (!this.bucketName || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            console.warn('AWS S3 credentials not properly configured. Secure storage will not work.');
        }
    }
    /**
     * Verifica si el servicio está configurado correctamente
     */
    isConfigured() {
        return Boolean(this.bucketName &&
            process.env.AWS_ACCESS_KEY_ID &&
            process.env.AWS_SECRET_ACCESS_KEY);
    }
    /**
     * Sube un archivo a S3 con cifrado opcional
     */
    async uploadFile(key, data, options = {}) {
        if (!this.isConfigured()) {
            console.error('S3 storage not properly configured');
            return null;
        }
        try {
            // Preparar metadatos
            const now = new Date();
            const expiresAt = options.expiresInDays
                ? new Date(now.getTime() + options.expiresInDays * 24 * 60 * 60 * 1000)
                : undefined;
            // Convertir a Buffer si es string
            let dataBuffer = typeof data === 'string' ? Buffer.from(data) : data;
            // Calcular hash del contenido original
            const contentHash = (0, crypto_1.createHash)('sha256').update(dataBuffer).digest('hex');
            // Cifrar si es necesario
            let encryptedData = dataBuffer;
            let isEncrypted = false;
            if (options.encrypt) {
                // Cifrado AES-256-GCM
                const iv = (0, crypto_1.randomBytes)(16);
                const cipher = (0, crypto_1.createCipheriv)('aes-256-gcm', this.encryptionKey, iv);
                const encrypted = Buffer.concat([
                    cipher.update(dataBuffer),
                    cipher.final()
                ]);
                // Añadir IV y authTag para descifrado posterior
                const authTag = cipher.getAuthTag();
                encryptedData = Buffer.concat([
                    iv,
                    authTag,
                    encrypted
                ]);
                isEncrypted = true;
            }
            // Extraer información sobre el archivo
            const fileName = key.split('/').pop() || 'unknown';
            const fileType = options.contentType || 'application/octet-stream';
            // Categoría según la ruta
            let category = 'document';
            if (key.includes('evidence'))
                category = 'evidence';
            else if (key.includes('certificate'))
                category = 'certificate';
            else if (key.includes('identity'))
                category = 'identity';
            // Preparar metadatos para S3
            const s3Metadata = {
                ...options.metadata,
                'content-hash': contentHash,
                'encrypted': String(isEncrypted),
                'created-at': now.toISOString(),
            };
            if (expiresAt) {
                s3Metadata['expires-at'] = expiresAt.toISOString();
            }
            // Subir a S3
            await this.s3Client.send(new client_s3_1.PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: encryptedData,
                ContentType: fileType,
                Metadata: s3Metadata,
            }));
            // Devolver metadatos del archivo
            return {
                fileName,
                fileType,
                size: encryptedData.length,
                category,
                isEncrypted,
                contentHash,
                createdAt: now,
                expiresAt,
                customMetadata: options.metadata
            };
        }
        catch (error) {
            console.error('Failed to upload file to S3:', error);
            return null;
        }
    }
    /**
     * Descarga un archivo de S3 con descifrado opcional
     */
    async downloadFile(key, options = {}) {
        if (!this.isConfigured()) {
            console.error('S3 storage not properly configured');
            return null;
        }
        try {
            // Obtener objeto de S3
            const response = await this.s3Client.send(new client_s3_1.GetObjectCommand({
                Bucket: this.bucketName,
                Key: key
            }));
            // Convertir stream a buffer
            const chunks = [];
            if (response.Body) {
                // @ts-ignore - el tipo es diferente en la definición pero funciona
                for await (const chunk of response.Body) {
                    chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
                }
            }
            const dataBuffer = Buffer.concat(chunks);
            // Extraer metadatos
            const s3Metadata = response.Metadata || {};
            const isEncrypted = s3Metadata['encrypted'] === 'true';
            const contentHash = s3Metadata['content-hash'];
            const createdAt = s3Metadata['created-at']
                ? new Date(s3Metadata['created-at'])
                : new Date();
            const expiresAt = s3Metadata['expires-at']
                ? new Date(s3Metadata['expires-at'])
                : undefined;
            // Determinar categoría basado en la ruta
            let category = 'document';
            if (key.includes('evidence'))
                category = 'evidence';
            else if (key.includes('certificate'))
                category = 'certificate';
            else if (key.includes('identity'))
                category = 'identity';
            // Extraer información del archivo
            const fileName = key.split('/').pop() || 'unknown';
            const fileType = response.ContentType || 'application/octet-stream';
            // Crear objeto de metadatos
            const metadata = {
                fileName,
                fileType,
                size: dataBuffer.length,
                category,
                isEncrypted,
                contentHash,
                createdAt,
                expiresAt,
                customMetadata: { ...s3Metadata }
            };
            // Descifrar si es necesario y está cifrado
            let finalData = dataBuffer;
            if (isEncrypted && options.decrypt) {
                // El buffer contiene: [IV (16 bytes) | AuthTag (16 bytes) | Datos cifrados]
                const iv = dataBuffer.subarray(0, 16);
                const authTag = dataBuffer.subarray(16, 32);
                const encryptedData = dataBuffer.subarray(32);
                // Descifrar usando AES-256-GCM
                const decipher = (0, crypto_1.createDecipheriv)('aes-256-gcm', this.encryptionKey, iv);
                decipher.setAuthTag(authTag);
                finalData = Buffer.concat([
                    decipher.update(encryptedData),
                    decipher.final()
                ]);
            }
            return { data: finalData, metadata };
        }
        catch (error) {
            console.error('Failed to download file from S3:', error);
            return null;
        }
    }
    /**
     * Genera una URL prefirmada para acceder temporalmente a un archivo
     */
    async generatePresignedUrl(key, expiresInSeconds = 60 * 60 // 1 hora por defecto
    ) {
        if (!this.isConfigured()) {
            console.error('S3 storage not properly configured');
            return null;
        }
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucketName,
                Key: key
            });
            const url = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, {
                expiresIn: expiresInSeconds
            });
            return url;
        }
        catch (error) {
            console.error('Failed to generate presigned URL:', error);
            return null;
        }
    }
    /**
     * Elimina un archivo de S3
     */
    async deleteFile(key) {
        if (!this.isConfigured()) {
            console.error('S3 storage not properly configured');
            return false;
        }
        try {
            await this.s3Client.send(new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key
            }));
            return true;
        }
        catch (error) {
            console.error('Failed to delete file from S3:', error);
            return false;
        }
    }
    /**
     * Helper para generar rutas de archivo para diferentes tipos de documentos RON
     */
    getFilePath(type, id, fileName) {
        const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
        return `ron/${type}s/${id}/${timestamp}_${fileName}`;
    }
}
exports.s3StorageService = new S3StorageService();
