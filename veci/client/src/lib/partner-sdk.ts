import { apiRequest } from "./queryClient";
import type { Document, Partner, PartnerSale } from "@shared/schema";

/**
 * PartnerPOS SDK: SDK especializado para el punto de cobro (POS) de partners de Vecinos NotaryPro Express
 * 
 * Este SDK facilita la integración de tiendas y comercios en el programa Vecinos NotaryPro Express,
 * proporcionando funciones para gestionar la recepción, procesamiento y seguimiento de documentos
 * en el punto de servicio.
 */
export class PartnerPOS {
  private partnerId: number;
  private apiKey: string;
  
  /**
   * Inicializa el SDK con las credenciales del partner
   * @param partnerId ID del partner en el sistema
   * @param apiKey Clave de API para autenticación (se obtiene al ser aprobado)
   */
  constructor(partnerId: number, apiKey: string) {
    this.partnerId = partnerId;
    this.apiKey = apiKey;
  }
  
  /**
   * Obtiene información del partner actualmente autenticado
   */
  async getPartnerInfo(): Promise<Partner> {
    const response = await apiRequest(
      "GET", 
      `/api/partners/${this.partnerId}`,
      undefined,
      { "X-API-KEY": this.apiKey }
    );
    return response.json();
  }
  
  /**
   * Inicia un nuevo proceso de documentación para un cliente
   * @param clientData Datos básicos del cliente
   */
  async startDocumentProcess(clientData: {
    fullName: string;
    email: string;
    phone?: string;
    documentType: string;
  }) {
    const response = await apiRequest(
      "POST",
      "/api/pos/start-document-process",
      {
        ...clientData,
        partnerId: this.partnerId
      },
      { "X-API-KEY": this.apiKey }
    );
    return response.json();
  }
  
  /**
   * Registra un nuevo documento recibido en el punto de servicio
   * @param data Información del documento
   */
  async registerDocument(data: {
    clientId: number;
    documentTypeId: number;
    title: string;
    description?: string;
    paymentMethod: string;
    paymentAmount: number;
  }) {
    const response = await apiRequest(
      "POST",
      "/api/pos/register-document",
      {
        ...data,
        partnerId: this.partnerId
      },
      { "X-API-KEY": this.apiKey }
    );
    
    // Registra automáticamente una venta al completar el registro del documento
    await this.registerSale({
      documentId: response.json().id,
      amount: data.paymentAmount,
      description: `Servicio de documentación: ${data.title}`
    });
    
    return response.json();
  }
  
  /**
   * Obtiene una lista de documentos procesados por este partner
   * @param filters Opciones de filtrado
   */
  async getProcessedDocuments(filters?: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    clientName?: string;
  }): Promise<Document[]> {
    // Construir parámetros de consulta
    const params = new URLSearchParams();
    if (filters) {
      if (filters.startDate) params.append("startDate", filters.startDate.toISOString());
      if (filters.endDate) params.append("endDate", filters.endDate.toISOString());
      if (filters.status) params.append("status", filters.status);
      if (filters.clientName) params.append("clientName", filters.clientName);
    }
    
    const url = `/api/pos/documents/${this.partnerId}${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await apiRequest(
      "GET",
      url,
      undefined,
      { "X-API-KEY": this.apiKey }
    );
    return response.json();
  }
  
  /**
   * Registra una nueva venta (normalmente llamada automáticamente por registerDocument)
   */
  private async registerSale(data: {
    documentId: number;
    amount: number;
    description: string;
  }) {
    // Cálculo de la comisión basado en el monto (15%)
    const commission = data.amount * 0.15;
    
    const response = await apiRequest(
      "POST",
      "/api/partner-sales",
      {
        partnerId: this.partnerId,
        documentId: data.documentId,
        amount: data.amount,
        commission: commission,
        description: data.description
      },
      { "X-API-KEY": this.apiKey }
    );
    return response.json();
  }
  
  /**
   * Obtiene estadísticas de ventas para este partner
   */
  async getSalesStats() {
    const response = await apiRequest(
      "GET", 
      `/api/partner-sales-stats/${this.partnerId}`,
      undefined,
      { "X-API-KEY": this.apiKey }
    );
    return response.json();
  }
  
  /**
   * Obtiene ventas registradas para este partner
   * @param status Filtrar por estado (opcional)
   */
  async getSales(status?: string): Promise<PartnerSale[]> {
    const url = status 
      ? `/api/partner-sales/${this.partnerId}?status=${status}`
      : `/api/partner-sales/${this.partnerId}`;
      
    const response = await apiRequest(
      "GET",
      url,
      undefined,
      { "X-API-KEY": this.apiKey }
    );
    return response.json();
  }
  
  /**
   * Busca información sobre el estado de un documento
   * @param documentId ID del documento
   */
  async checkDocumentStatus(documentId: number) {
    const response = await apiRequest(
      "GET",
      `/api/pos/document-status/${documentId}`,
      undefined,
      { "X-API-KEY": this.apiKey }
    );
    return response.json();
  }
  
  /**
   * Genera un código QR para verificar un documento
   * @param documentId ID del documento
   */
  async generateVerificationQR(documentId: number) {
    const response = await apiRequest(
      "GET",
      `/api/pos/generate-qr/${documentId}`,
      undefined,
      { "X-API-KEY": this.apiKey }
    );
    return response.json();
  }
  
  /**
   * Imprime un recibo para el cliente
   * @param documentId ID del documento
   */
  async printReceipt(documentId: number): Promise<{receiptUrl: string}> {
    const response = await apiRequest(
      "GET",
      `/api/pos/receipt/${documentId}`,
      undefined,
      { "X-API-KEY": this.apiKey }
    );
    return response.json();
  }
  
  /**
   * Consulta de listado de tipos de documentos disponibles
   */
  async getAvailableDocumentTypes() {
    const response = await apiRequest(
      "GET",
      "/api/document-templates",
      undefined,
      { "X-API-KEY": this.apiKey }
    );
    return response.json();
  }
  
  /**
   * Envía un mensaje al sistema de soporte
   */
  async sendSupportMessage(message: string) {
    const response = await apiRequest(
      "POST",
      "/api/pos/support-message",
      {
        partnerId: this.partnerId,
        message
      },
      { "X-API-KEY": this.apiKey }
    );
    return response.json();
  }
}

/**
 * SDK para gestionar el proceso de registro de partners
 * Se utiliza para facilitar el proceso de registro de nuevos comercios 
 * al programa Vecinos NotaryPro Express
 */
export class PartnerRegistration {
  /**
   * Registra un nuevo partner en el sistema
   */
  static async registerPartner(partnerData: {
    storeName: string;
    managerName: string;
    region: string;
    commune: string;
    address: string;
    phone: string;
    email: string;
    hasInternet: boolean;
    hasDevice: boolean;
  }) {
    const response = await apiRequest("POST", "/api/partners/register", partnerData);
    return response.json();
  }
  
  /**
   * Verifica el estado de registro de un partner
   */
  static async checkRegistrationStatus(email: string) {
    const response = await apiRequest("GET", `/api/partners/check-status?email=${encodeURIComponent(email)}`);
    return response.json();
  }
  
  /**
   * Busca puntos de servicio (partners aprobados)
   * Opcionalmente filtra por región y/o comuna
   */
  static async findServicePoints(options?: { region?: string; commune?: string }) {
    let url = "/api/service-points";
    
    if (options) {
      const params = new URLSearchParams();
      if (options.region) params.append("region", options.region);
      if (options.commune) params.append("commune", options.commune);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const response = await apiRequest("GET", url);
    return response.json();
  }
}