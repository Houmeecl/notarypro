import axios from "axios";

/**
 * Configuración de la API de HubSpot
 */
const HUBSPOT_API_URL = "https://api.hubapi.com/crm/v3";
const API_KEY = process.env.CRM_API_KEY;

// Comprobar si la API key está configurada
if (!API_KEY) {
  console.warn("CRM_API_KEY no está configurada. La integración con HubSpot no funcionará.");
}

/**
 * Interfaces para datos de contacto y negocio
 */
interface ContactData {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  region?: string;
  commune?: string;
  role?: string;
  documentCount?: number;
}

interface DealData {
  name: string;
  amount: number;
  stage?: string;
  type?: string;
  contactId?: string;
}

/**
 * Crea un contacto en HubSpot
 * @param contactData Datos del contacto a crear
 * @returns Datos del contacto creado
 */
export async function createContact(contactData: ContactData) {
  try {
    if (!API_KEY) {
      throw new Error("CRM_API_KEY no está configurada");
    }
    
    const response = await axios.post(
      `${HUBSPOT_API_URL}/objects/contacts`,
      {
        properties: {
          email: contactData.email,
          firstname: contactData.firstName,
          lastname: contactData.lastName,
          phone: contactData.phone,
          company: contactData.company,
          region: contactData.region,
          commune: contactData.commune,
          user_role: contactData.role,
          document_count: contactData.documentCount?.toString() || "0"
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Error creando contacto en HubSpot:", error);
    throw new Error("Error en la integración con CRM");
  }
}

/**
 * Actualiza un contacto existente en HubSpot
 * @param hubspotId ID del contacto en HubSpot
 * @param contactData Datos a actualizar
 * @returns Datos del contacto actualizado
 */
export async function updateContact(hubspotId: string, contactData: Partial<ContactData>) {
  try {
    if (!API_KEY) {
      throw new Error("CRM_API_KEY no está configurada");
    }
    
    const properties: Record<string, string> = {};
    
    // Solo añadir las propiedades que se han proporcionado
    if (contactData.email) properties.email = contactData.email;
    if (contactData.firstName) properties.firstname = contactData.firstName;
    if (contactData.lastName) properties.lastname = contactData.lastName;
    if (contactData.phone) properties.phone = contactData.phone;
    if (contactData.company) properties.company = contactData.company;
    if (contactData.region) properties.region = contactData.region;
    if (contactData.commune) properties.commune = contactData.commune;
    if (contactData.role) properties.user_role = contactData.role;
    if (contactData.documentCount !== undefined) {
      properties.document_count = contactData.documentCount.toString();
    }
    
    const response = await axios.patch(
      `${HUBSPOT_API_URL}/objects/contacts/${hubspotId}`,
      { properties },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Error actualizando contacto en HubSpot:", error);
    throw new Error("Error en la integración con CRM");
  }
}

/**
 * Crea un negocio/oportunidad en HubSpot
 * @param dealData Datos del negocio a crear
 * @returns Datos del negocio creado
 */
export async function createDeal(dealData: DealData) {
  try {
    if (!API_KEY) {
      throw new Error("CRM_API_KEY no está configurada");
    }
    
    const dealRequest: any = {
      properties: {
        dealname: dealData.name,
        amount: dealData.amount.toString(),
        dealstage: dealData.stage || "presentationscheduled",
        pipeline: "default",
        dealtype: dealData.type || "newbusiness"
      }
    };
    
    // Añadir asociación de contacto si se proporciona contactId
    if (dealData.contactId) {
      dealRequest.associations = [
        {
          to: { id: dealData.contactId },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: 3
            }
          ]
        }
      ];
    }
    
    const response = await axios.post(
      `${HUBSPOT_API_URL}/objects/deals`,
      dealRequest,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Error creando negocio en HubSpot:", error);
    throw new Error("Error en la integración con CRM");
  }
}

/**
 * Busca un contacto por email en HubSpot
 * @param email Email del contacto a buscar
 * @returns Datos del contacto encontrado o null
 */
export async function findContactByEmail(email: string) {
  try {
    if (!API_KEY) {
      throw new Error("CRM_API_KEY no está configurada");
    }
    
    const response = await axios.post(
      `${HUBSPOT_API_URL}/objects/contacts/search`,
      {
        filterGroups: [
          {
            filters: [
              {
                propertyName: "email",
                operator: "EQ",
                value: email
              }
            ]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        }
      }
    );
    
    const results = response.data.results;
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error("Error buscando contacto en HubSpot:", error);
    throw new Error("Error en la integración con CRM");
  }
}

/**
 * Registra actividad de documento en HubSpot
 * @param contactId ID del contacto en HubSpot
 * @param documentTitle Título del documento
 * @param action Acción realizada (creación, firma, etc.)
 * @returns Datos de la actividad registrada
 */
export async function logDocumentActivity(
  contactId: string,
  documentTitle: string,
  action: string
) {
  try {
    if (!API_KEY) {
      throw new Error("CRM_API_KEY no está configurada");
    }
    
    // En HubSpot, podemos registrar notas como actividad
    const response = await axios.post(
      `${HUBSPOT_API_URL}/objects/notes`,
      {
        properties: {
          hs_note_body: `Actividad de documento: ${action} - ${documentTitle}`,
          hs_timestamp: Date.now().toString()
        },
        associations: [
          {
            to: { id: contactId },
            types: [
              {
                associationCategory: "HUBSPOT_DEFINED",
                associationTypeId: 1
              }
            ]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Error registrando actividad en HubSpot:", error);
    throw new Error("Error en la integración con CRM");
  }
}