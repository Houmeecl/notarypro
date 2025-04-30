import OpenAI from "openai";

// El modelo más reciente de OpenAI es "gpt-4o" que se lanzó el 13 de mayo de 2024.
// No cambiar a menos que sea solicitado explícitamente por el usuario
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

/**
 * Maneja consultas de chatbot utilizando la API de OpenAI
 * @param userMessage Mensaje del usuario
 * @param context Contexto adicional para la consulta (opcional)
 * @returns Respuesta del chatbot
 */
export async function handleChatbotQuery(
  userMessage: string,
  context: string = ""
): Promise<string> {
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
  } catch (error) {
    console.error("Error en el chatbot:", error);
    return "Lo siento, ocurrió un error al procesar tu consulta. Por favor, intenta nuevamente.";
  }
}

/**
 * Analiza el sentimiento de un texto
 * @param text Texto a analizar
 * @returns Análisis de sentimiento con puntuación y confianza
 */
export async function analyzeSentiment(text: string): Promise<{
  rating: number,
  confidence: number
}> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY no está configurada");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en análisis de sentimiento. Analiza el sentimiento del texto y proporciona una calificación de 1 a 5 estrellas y un puntaje de confianza entre 0 y 1. Responde con JSON en este formato: { 'rating': number, 'confidence': number }",
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
  } catch (error) {
    console.error("Error en análisis de sentimiento:", error);
    throw new Error("Error al analizar sentimiento: " + (error as Error).message);
  }
}

/**
 * Genera respuestas a consultas legales específicas
 * @param query Consulta legal
 * @param documentContext Contexto del documento (opcional)
 * @returns Respuesta legal estructurada
 */
export async function getLegalResponse(
  query: string,
  documentContext?: string
): Promise<{
  response: string;
  references?: string[];
  confidence: number;
}> {
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
  } catch (error) {
    console.error("Error en respuesta legal:", error);
    throw new Error("Error al generar respuesta legal: " + (error as Error).message);
  }
}