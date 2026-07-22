"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContact = createContact;
exports.updateContact = updateContact;
exports.createDeal = createDeal;
exports.findContactByEmail = findContactByEmail;
exports.logDocumentActivity = logDocumentActivity;
const axios_1 = __importDefault(require("axios"));
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
 * Crea un contacto en HubSpot
 * @param contactData Datos del contacto a crear
 * @returns Datos del contacto creado
 */
async function createContact(contactData) {
    try {
        if (!API_KEY) {
            throw new Error("CRM_API_KEY no está configurada");
        }
        const response = await axios_1.default.post(`${HUBSPOT_API_URL}/objects/contacts`, {
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
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            }
        });
        return response.data;
    }
    catch (error) {
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
async function updateContact(hubspotId, contactData) {
    try {
        if (!API_KEY) {
            throw new Error("CRM_API_KEY no está configurada");
        }
        const properties = {};
        // Solo añadir las propiedades que se han proporcionado
        if (contactData.email)
            properties.email = contactData.email;
        if (contactData.firstName)
            properties.firstname = contactData.firstName;
        if (contactData.lastName)
            properties.lastname = contactData.lastName;
        if (contactData.phone)
            properties.phone = contactData.phone;
        if (contactData.company)
            properties.company = contactData.company;
        if (contactData.region)
            properties.region = contactData.region;
        if (contactData.commune)
            properties.commune = contactData.commune;
        if (contactData.role)
            properties.user_role = contactData.role;
        if (contactData.documentCount !== undefined) {
            properties.document_count = contactData.documentCount.toString();
        }
        const response = await axios_1.default.patch(`${HUBSPOT_API_URL}/objects/contacts/${hubspotId}`, { properties }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            }
        });
        return response.data;
    }
    catch (error) {
        console.error("Error actualizando contacto en HubSpot:", error);
        throw new Error("Error en la integración con CRM");
    }
}
/**
 * Crea un negocio/oportunidad en HubSpot
 * @param dealData Datos del negocio a crear
 * @returns Datos del negocio creado
 */
async function createDeal(dealData) {
    try {
        if (!API_KEY) {
            throw new Error("CRM_API_KEY no está configurada");
        }
        const dealRequest = {
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
        const response = await axios_1.default.post(`${HUBSPOT_API_URL}/objects/deals`, dealRequest, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            }
        });
        return response.data;
    }
    catch (error) {
        console.error("Error creando negocio en HubSpot:", error);
        throw new Error("Error en la integración con CRM");
    }
}
/**
 * Busca un contacto por email en HubSpot
 * @param email Email del contacto a buscar
 * @returns Datos del contacto encontrado o null
 */
async function findContactByEmail(email) {
    try {
        if (!API_KEY) {
            throw new Error("CRM_API_KEY no está configurada");
        }
        const response = await axios_1.default.post(`${HUBSPOT_API_URL}/objects/contacts/search`, {
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
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            }
        });
        const results = response.data.results;
        return results.length > 0 ? results[0] : null;
    }
    catch (error) {
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
async function logDocumentActivity(contactId, documentTitle, action) {
    try {
        if (!API_KEY) {
            throw new Error("CRM_API_KEY no está configurada");
        }
        // En HubSpot, podemos registrar notas como actividad
        const response = await axios_1.default.post(`${HUBSPOT_API_URL}/objects/notes`, {
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
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            }
        });
        return response.data;
    }
    catch (error) {
        console.error("Error registrando actividad en HubSpot:", error);
        throw new Error("Error en la integración con CRM");
    }
}
