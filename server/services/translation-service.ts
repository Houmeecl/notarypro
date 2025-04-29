import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Idiomas soportados por el servicio de traducción
 */
export const SUPPORTED_LANGUAGES = [
  { code: "es", name: "Español" },
  { code: "en", name: "Inglés" },
  { code: "fr", name: "Francés" },
  { code: "pt", name: "Portugués" },
  { code: "de", name: "Alemán" },
  { code: "it", name: "Italiano" },
  { code: "zh", name: "Chino" },
  { code: "ja", name: "Japonés" },
  { code: "ko", name: "Coreano" },
  { code: "ru", name: "Ruso" },
  { code: "ar", name: "Árabe" },
];

/**
 * Traduce texto a un idioma destino
 * @param text Texto a traducir
 * @param targetLanguage Código del idioma destino (e.g., 'en', 'es', 'fr')
 * @param sourceLanguage Código del idioma fuente (opcional)
 * @returns Texto traducido
 */
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<string> {
  try {
    // Verificar si el idioma destino es soportado
    const isTargetSupported = SUPPORTED_LANGUAGES.some(lang => lang.code === targetLanguage);
    if (!isTargetSupported) {
      throw new Error(`El idioma destino '${targetLanguage}' no es soportado.`);
    }

    // Si el texto está vacío, retornar texto vacío
    if (!text || text.trim() === "") {
      return "";
    }

    // Construir el prompt para la traducción
    let prompt = `Traduce el siguiente texto al ${getLanguageName(targetLanguage)}`;
    if (sourceLanguage) {
      prompt += ` desde ${getLanguageName(sourceLanguage)}`;
    }
    prompt += `. Mantén el formato exacto, incluyendo saltos de línea y formato especial. Devuelve únicamente el texto traducido, sin explicaciones adicionales:\n\n${text}`;

    // Llamar a la API de OpenAI para la traducción
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "Eres un traductor profesional experto en documentos legales y notariales. Tu tarea es traducir el texto proporcionado manteniendo el formato original y el significado legal exacto." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3, // Valor bajo para mantener fidelidad a la traducción
    });

    // Extraer el texto traducido de la respuesta
    const translatedText = response.choices[0].message.content || "";
    return translatedText;
  } catch (error: any) {
    console.error("Error en la traducción:", error);
    throw new Error(`Error al traducir el texto: ${error.message}`);
  }
}

/**
 * Traduce el contenido de un documento a un idioma destino
 * @param documentContent Contenido del documento a traducir
 * @param targetLanguage Código del idioma destino (e.g., 'en', 'es', 'fr')
 * @param sourceLanguage Código del idioma fuente (opcional)
 * @returns Contenido del documento traducido
 */
export async function translateDocumentContent(
  documentContent: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<string> {
  return translateText(documentContent, targetLanguage, sourceLanguage);
}

/**
 * Obtiene el nombre del idioma a partir de su código
 * @param languageCode Código del idioma (e.g., 'en', 'es', 'fr')
 * @returns Nombre del idioma
 */
function getLanguageName(languageCode: string): string {
  const language = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
  return language ? language.name : languageCode;
}