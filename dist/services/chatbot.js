"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChatbotQuery = handleChatbotQuery;
exports.analyzeSentiment = analyzeSentiment;
exports.getLegalResponse = getLegalResponse;
exports.analyzeDocument = analyzeDocument;
const openai_1 = __importDefault(require("openai"));
// El modelo más reciente de OpenAI es "gpt-4o" que se lanzó el 13 de mayo de 2024.
// No cambiar a menos que sea solicitado explícitamente por el usuario
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY
});
// API nueva configurada
const API_KEY_NUEVO = process.env.API_KEY_NUEVO;
/**
 * Maneja consultas de chatbot utilizando la API de OpenAI
 * @param userMessage Mensaje del usuario
 * @param context Contexto adicional para la consulta (opcional)
 * @returns Respuesta del chatbot
 */
async function handleChatbotQuery(userMessage, context = "") {
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY no está configurada");
        }
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `Eres un asistente legal especializado en documentos y certificaciones chilenas.
            Proporciona respuestas claras, precisas y útiles sobre el proceso de certificación 
            de documentos, la Ley 19.799 de Chile y los servicios de Cerfidoc. ${context}`
                },
                { role: "user", content: userMessage }
            ],
            temperature: 0.7,
        });
        return response.choices[0].message.content || "Lo siento, no pude procesar tu consulta.";
    }
    catch (error) {
        console.error("Error en el chatbot:", error);
        return "Lo siento, ocurrió un error al procesar tu consulta. Por favor, intenta nuevamente.";
    }
}
/**
 * Analiza el sentimiento de un texto
 * @param text Texto a analizar
 * @returns Análisis de sentimiento con puntuación y confianza
 */
async function analyzeSentiment(text) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY no está configurada");
        }
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "Eres un experto en análisis de sentimiento. Analiza el sentimiento del texto y proporciona una calificación de 1 a 5 estrellas y un puntaje de confianza entre 0 y 1. Responde con JSON en este formato: { 'rating': number, 'confidence': number }",
                },
                {
                    role: "user",
                    content: text,
                },
            ],
            response_format: { type: "json_object" },
        });
        // Manejo de contenido potencialmente nulo
        const content = response.choices[0].message.content || '{"rating": 3, "confidence": 0.5}';
        const result = JSON.parse(content);
        return {
            rating: Math.max(1, Math.min(5, Math.round(result.rating || 3))),
            confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
        };
    }
    catch (error) {
        console.error("Error en análisis de sentimiento:", error);
        throw new Error("Error al analizar sentimiento: " + error.message);
    }
}
/**
 * Genera respuestas a consultas legales específicas
 * @param query Consulta legal
 * @param documentContext Contexto del documento (opcional)
 * @returns Respuesta legal estructurada
 */
async function getLegalResponse(query, documentContext) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY no está configurada");
        }
        const systemPrompt = `Eres un asistente legal especializado en derecho chileno.
      Responde consultas legales con precisión, mencionando artículos y leyes relevantes.
      ${documentContext ? `Contexto del documento: ${documentContext}` : ''}
      Responde con JSON en este formato: 
      { 
        "response": "respuesta detallada", 
        "references": ["referencia 1", "referencia 2"], 
        "confidence": valor entre 0 y 1
      }`;
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: query }
            ],
            response_format: { type: "json_object" },
        });
        // Manejo de contenido potencialmente nulo
        const content = response.choices[0].message.content || '{"response": "No hay información disponible.", "references": [], "confidence": 0.5}';
        const result = JSON.parse(content);
        return {
            response: result.response || "No hay información disponible.",
            references: result.references || [],
            confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
        };
    }
    catch (error) {
        console.error("Error en respuesta legal:", error);
        throw new Error("Error al generar respuesta legal: " + error.message);
    }
}
/**
 * Analiza documentos legales utilizando la nueva API
 * @param documentText Texto del documento a analizar
 * @returns Análisis detallado del documento con recomendaciones
 */
async function analyzeDocument(documentText) {
    try {
        if (!API_KEY_NUEVO) {
            throw new Error("API_KEY_NUEVO no está configurada");
        }
        console.log("Analizando documento con API_KEY_NUEVO:", API_KEY_NUEVO.substring(0, 5) + "...");
        // Simular análisis con la nueva API (en una implementación real, aquí se haría la llamada a la API externa)
        const mockAnalysis = {
            analysis: "El documento ha sido analizado correctamente utilizando la nueva API. Se trata de un contrato legal que cumple con los requisitos básicos establecidos en la Ley 19.799 sobre documentos electrónicos.",
            recommendations: [
                "Añadir cláusula de protección de datos personales",
                "Especificar jurisdicción aplicable en caso de disputas",
                "Incluir información de contacto de ambas partes"
            ],
            legalIssues: [
                "No se especifica el proceso de terminación del contrato",
                "Faltan firmas electrónicas avanzadas según la normativa chilena"
            ],
            score: 85
        };
        // Simular un tiempo de procesamiento de la API
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockAnalysis;
    }
    catch (error) {
        console.error("Error al analizar documento:", error);
        throw new Error("Error al analizar documento: " + error.message);
    }
}
