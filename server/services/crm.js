"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
function createContact(contactData) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            if (!API_KEY) {
                throw new Error("CRM_API_KEY no está configurada");
            }
            const response = yield axios_1.default.post(`${HUBSPOT_API_URL}/objects/contacts`, {
                properties: {
                    email: contactData.email,
                    firstname: contactData.firstName,
                    lastname: contactData.lastName,
                    phone: contactData.phone,
                    company: contactData.company,
                    region: contactData.region,
                    commune: contactData.commune,
                    user_role: contactData.role,
                    document_count: ((_a = contactData.documentCount) === null || _a === void 0 ? void 0 : _a.toString()) || "0"
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
    });
}
/**
 * Actualiza un contacto existente en HubSpot
 * @param hubspotId ID del contacto en HubSpot
 * @param contactData Datos a actualizar
 * @returns Datos del contacto actualizado
 */
function updateContact(hubspotId, contactData) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const response = yield axios_1.default.patch(`${HUBSPOT_API_URL}/objects/contacts/${hubspotId}`, { properties }, {
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
    });
}
/**
 * Crea un negocio/oportunidad en HubSpot
 * @param dealData Datos del negocio a crear
 * @returns Datos del negocio creado
 */
function createDeal(dealData) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const response = yield axios_1.default.post(`${HUBSPOT_API_URL}/objects/deals`, dealRequest, {
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
    });
}
/**
 * Busca un contacto por email en HubSpot
 * @param email Email del contacto a buscar
 * @returns Datos del contacto encontrado o null
 */
function findContactByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!API_KEY) {
                throw new Error("CRM_API_KEY no está configurada");
            }
            const response = yield axios_1.default.post(`${HUBSPOT_API_URL}/objects/contacts/search`, {
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
    });
}
/**
 * Registra actividad de documento en HubSpot
 * @param contactId ID del contacto en HubSpot
 * @param documentTitle Título del documento
 * @param action Acción realizada (creación, firma, etc.)
 * @returns Datos de la actividad registrada
 */
function logDocumentActivity(contactId, documentTitle, action) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!API_KEY) {
                throw new Error("CRM_API_KEY no está configurada");
            }
            // En HubSpot, podemos registrar notas como actividad
            const response = yield axios_1.default.post(`${HUBSPOT_API_URL}/objects/notes`, {
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
    });
}
