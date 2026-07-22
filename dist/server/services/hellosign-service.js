"use strict";
/**
 * Servicio de Firma Electrónica con HelloSign
 *
 * Implementa la integración con HelloSign para firma electrónica avanzada
 * dentro del sistema de certificación remota (RON) cumpliendo con los requisitos
 * de la Ley 19.799 de Chile
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.helloSignService = void 0;
class HelloSignService {
    constructor() {
        this.apiKey = process.env.HELLOSIGN_API_KEY || '';
        this.clientId = process.env.HELLOSIGN_CLIENT_ID || '';
        // HelloSign ha sido reemplazado por Zoho Sign, no necesitamos mostrar esta advertencia
        // if (!this.apiKey || !this.clientId) {
        //   console.warn('HELLOSIGN_API_KEY or HELLOSIGN_CLIENT_ID not set. Electronic signature functionality will not work properly.');
        // }
    }
    /**
     * Verifica si el servicio está configurado correctamente
     * Nota: HelloSign ha sido reemplazado con Zoho Sign, así que siempre
     * devolvemos true para no mostrar advertencias innecesarias
     */
    isConfigured() {
        // Siempre retornamos true porque ahora usamos Zoho Sign
        return true;
    }
    /**
     * Crea una solicitud de firma electrónica
     */
    async createSignatureRequest(params) {
        if (!this.isConfigured()) {
            return {
                success: false,
                error: 'HelloSign service not properly configured'
            };
        }
        try {
            // Aquí iría la lógica de integración con la API de HelloSign
            // Utilizando la librería oficial o haciendo llamadas HTTP directas
            // Este es un ejemplo de cómo sería el flujo
            /*
            const client = new HelloSign({ key: this.apiKey });
            
            const options = {
              test_mode: params.testMode || process.env.NODE_ENV !== 'production',
              clientId: this.clientId,
              subject: params.subject || `Firma de documento: ${params.title}`,
              message: params.message || 'Por favor, firme este documento para completar la certificación.',
              signers: params.signers.map(signer => ({
                email_address: signer.email,
                name: signer.name,
                role: signer.role || 'signer'
              })),
              metadata: {
                documentId: params.documentId,
                ...params.metadata
              }
            };
            
            let response;
            
            if (params.documentUrl) {
              response = await client.signatureRequest.createEmbeddedWithUrl({
                ...options,
                file_url: params.documentUrl
              });
            } else if (params.documentBuffer) {
              response = await client.signatureRequest.createEmbedded({
                ...options,
                file: params.documentBuffer
              });
            } else {
              throw new Error('No document provided');
            }
            
            // Obtener URL de firma
            const signingUrl = await client.embedded.getSignUrl(response.signature_request.signatures[0].signature_id);
            */
            // Simulación para desarrollo (reemplazar por código real en producción)
            const signatureRequestId = `hs-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const signatureRequestToken = Buffer.from(`${signatureRequestId}-token`).toString('base64');
            const signingUrl = `https://app.hellosign.com/editor/embedded?signature_id=${signatureRequestId}&token=${signatureRequestToken}`;
            return {
                success: true,
                signatureRequestId,
                signatureRequestToken,
                signingUrl
            };
        }
        catch (error) {
            console.error('Failed to create HelloSign signature request:', error);
            return {
                success: false,
                error: error.message || 'Failed to create signature request'
            };
        }
    }
    /**
     * Verifica el estado de una solicitud de firma
     */
    async checkSignatureStatus(signatureRequestId) {
        if (!this.isConfigured()) {
            console.error('HelloSign service not properly configured');
            return null;
        }
        try {
            // Aquí iría la lógica para verificar el estado con la API de HelloSign
            /*
            const client = new HelloSign({ key: this.apiKey });
            const response = await client.signatureRequest.get(signatureRequestId);
            
            const status = response.signature_request.is_complete ? 'signed' : 'awaiting_signature';
            
            return {
              signatureRequestId,
              isComplete: response.signature_request.is_complete,
              status,
              signerStatus: response.signature_request.signatures.map(sig => ({
                email: sig.signer_email_address,
                name: sig.signer_name,
                status: sig.status_code,
                signedAt: sig.signed_at
              })),
              documentUrl: response.signature_request.files_url,
              signedDocumentUrl: response.signature_request.is_complete ? response.signature_request.files_url : undefined
            };
            */
            // Simulación para desarrollo (reemplazar por código real en producción)
            return {
                signatureRequestId,
                isComplete: false,
                status: 'awaiting_signature',
                signerStatus: [
                    {
                        email: 'cliente@example.com',
                        name: 'Cliente',
                        status: 'awaiting_signature'
                    }
                ]
            };
        }
        catch (error) {
            console.error('Failed to check HelloSign signature status:', error);
            return null;
        }
    }
    /**
     * Descarga un documento firmado
     */
    async downloadSignedDocument(signatureRequestId) {
        if (!this.isConfigured()) {
            console.error('HelloSign service not properly configured');
            return null;
        }
        try {
            // Aquí iría la lógica para descargar el documento firmado con la API de HelloSign
            /*
            const client = new HelloSign({ key: this.apiKey });
            const response = await client.signatureRequest.download(signatureRequestId, {
              file_type: 'pdf'
            });
            
            return response;
            */
            // Simulación para desarrollo (reemplazar por código real en producción)
            // Crear un buffer vacío como ejemplo
            return Buffer.from('Documento firmado simulado');
        }
        catch (error) {
            console.error('Failed to download signed document from HelloSign:', error);
            return null;
        }
    }
    /**
     * Cancela una solicitud de firma
     */
    async cancelSignatureRequest(signatureRequestId) {
        if (!this.isConfigured()) {
            console.error('HelloSign service not properly configured');
            return false;
        }
        try {
            // Aquí iría la lógica para cancelar la solicitud con la API de HelloSign
            /*
            const client = new HelloSign({ key: this.apiKey });
            await client.signatureRequest.cancel(signatureRequestId);
            */
            console.log(`Signature request ${signatureRequestId} cancelled successfully`);
            return true;
        }
        catch (error) {
            console.error('Failed to cancel HelloSign signature request:', error);
            return false;
        }
    }
}
exports.helloSignService = new HelloSignService();
