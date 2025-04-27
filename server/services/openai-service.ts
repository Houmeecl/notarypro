import OpenAI from "openai";

// Configuración del cliente de OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Clase para gestionar las interacciones con OpenAI
export class OpenAIService {
  /**
   * Genera un análisis estratégico basado en los datos de operación
   * 
   * @param analysisType Tipo de análisis a generar ('business', 'market', 'expansion', 'pricing', 'marketing')
   * @param data Datos de operación para el análisis
   * @param options Opciones adicionales (profundidad, modelo, etc.)
   */
  async generateStrategicAnalysis(
    analysisType: string,
    data: any,
    options: {
      model?: string;
      depth?: number;
      includeRecommendations?: boolean;
    } = {}
  ) {
    // Configurar opciones por defecto
    const model = options.model || "gpt-4o";
    const depth = options.depth || 75;
    const includeRecommendations = options.includeRecommendations !== undefined ? options.includeRecommendations : true;
    
    try {
      // Construir el prompt para el análisis
      const prompt = this.buildAnalysisPrompt(analysisType, data, depth, includeRecommendations);
      
      // Realizar la llamada a la API
      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content: "Eres un asistente especializado en análisis estratégico de negocios y marketing para empresas de tecnología legal. Debes proporcionar análisis detallados, específicos y accionables basados en los datos proporcionados."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });
      
      // Procesar la respuesta
      if (response.choices && response.choices.length > 0) {
        const analysisContent = response.choices[0].message.content;
        
        if (analysisContent) {
          try {
            // Parsear el JSON de respuesta
            const analysis = JSON.parse(analysisContent);
            
            // Enriquecer con metadatos
            analysis.generatedAt = new Date().toISOString();
            analysis.model = model;
            
            return analysis;
          } catch (parseError) {
            console.error("Error al parsear la respuesta JSON de OpenAI:", parseError);
            throw new Error("Formato de respuesta inválido");
          }
        }
      }
      
      throw new Error("No se obtuvo respuesta del análisis");
    } catch (error) {
      console.error("Error en el servicio OpenAI:", error);
      throw error;
    }
  }
  
  /**
   * Construye el prompt para el análisis estratégico
   */
  private buildAnalysisPrompt(analysisType: string, data: any, depth: number, includeRecommendations: boolean): string {
    let contextDescription = "";
    let specificInstructions = "";
    
    // Información de contexto base sobre NotaryPro
    contextDescription = `
      NotaryPro es una plataforma digital de certificación y firma de documentos en Chile que cumple con la ley 19.799.
      Ofrece servicios de certificación digital, firma electrónica avanzada, y validación de identidad.
      Cuenta con un programa llamado "Vecinos NotaryPro Express" que permite a tiendas de barrio ofrecer servicios de certificación.
      Los usuarios pueden ser: clientes finales, certificadores (equivalentes a notarios) y socios comerciales (tiendas).
    `;
    
    // Instrucciones específicas según el tipo de análisis
    switch (analysisType) {
      case "business":
        specificInstructions = `
          Analiza el rendimiento general del negocio, incluyendo crecimiento de usuarios, documentos procesados, 
          ingresos, eficiencia operativa y oportunidades de mejora. Identifica tendencias clave y riesgos potenciales.
        `;
        break;
        
      case "market":
        specificInstructions = `
          Analiza el posicionamiento en el mercado chileno de servicios de certificación, 
          identificando segmentos clave, competidores principales, y oportunidades de diferenciación.
          Evalúa el tamaño de mercado potencial y la penetración actual.
        `;
        break;
        
      case "expansion":
        specificInstructions = `
          Evalúa oportunidades de expansión geográfica en Chile, identificando regiones prioritarias 
          basadas en demanda potencial, facilidad de implementación y retorno de inversión estimado.
          Sugiere estrategias para expansión del programa Vecinos NotaryPro Express.
        `;
        break;
        
      case "pricing":
        specificInstructions = `
          Analiza la elasticidad de precios y sugiere estrategias de optimización, considerando 
          diferentes segmentos de cliente y tipos de documento. Evalúa la viabilidad de modelos 
          de suscripción para clientes empresariales y oportunidades de descuentos estratégicos.
        `;
        break;
        
      case "marketing":
        specificInstructions = `
          Identifica canales de marketing óptimos, segmentos de audiencia prioritarios, y mensajes clave
          para aumentar adquisición de usuarios y retención. Sugiere estrategias de contenido y campañas específicas
          para diferentes segmentos, incluyendo pymes, corporaciones y usuarios individuales.
        `;
        break;
        
      default:
        specificInstructions = `
          Proporciona un análisis general del negocio con recomendaciones para mejorar el rendimiento,
          incrementar la adquisición de usuarios y optimizar las operaciones.
        `;
    }
    
    // Ajustar nivel de detalle según la profundidad solicitada
    let detailLevel = "moderado";
    if (depth < 50) {
      detailLevel = "básico";
    } else if (depth > 85) {
      detailLevel = "exhaustivo";
    }
    
    // Construir el prompt completo
    return `
      CONTEXTO:
      ${contextDescription}
      
      DATOS DE ANÁLISIS:
      ${JSON.stringify(data, null, 2)}
      
      TIPO DE ANÁLISIS: ${analysisType}
      
      INSTRUCCIONES ESPECÍFICAS:
      ${specificInstructions}
      
      NIVEL DE DETALLE REQUERIDO: ${detailLevel}
      
      ${includeRecommendations ? "Incluye recomendaciones específicas y accionables." : "No incluyas recomendaciones, solo análisis."}
      
      Devuelve tu respuesta como un objeto JSON con la siguiente estructura:
      {
        "analysisTitle": "Título descriptivo del análisis",
        "executiveSummary": "Resumen ejecutivo de 3-5 frases con los hallazgos principales",
        "keyMetrics": [
          {
            "title": "Título de la métrica",
            "value": "Valor (numérico o texto)",
            "comparison": "Comparación con período anterior",
            "trend": "up/down/stable",
            "trendValue": "Valor del cambio (ej: +15%)",
            "icon": "Nombre del icono sugerido",
            "isMonetary": true/false
          }
        ],
        "keyFindings": [
          {
            "title": "Título del hallazgo",
            "description": "Descripción detallada",
            "type": "positive/negative/neutral"
          }
        ],
        "recommendations": [
          {
            "title": "Título de la recomendación",
            "description": "Descripción detallada",
            "priority": "high/medium/low",
            "timeframe": "Plazo estimado de implementación"
          }
        ]
      }
      
      Para tipos de análisis específicos, añade las secciones correspondientes.
    `;
  }
  
  /**
   * Genera un email de marketing basado en un objetivo específico
   */
  async generateMarketingEmail(
    objective: string,
    audience: string,
    productInfo: any,
    options: {
      model?: string;
      tone?: string;
      length?: string;
    } = {}
  ) {
    // Configurar opciones por defecto
    const model = options.model || "gpt-4o";
    const tone = options.tone || "profesional";
    const length = options.length || "medio";
    
    try {
      // Construir el prompt para el email
      const prompt = `
        Genera un email de marketing para NotaryPro con el siguiente objetivo: ${objective}.
        
        Audiencia objetivo: ${audience}
        
        Información del producto/servicio:
        ${JSON.stringify(productInfo, null, 2)}
        
        Tono deseado: ${tone}
        Longitud: ${length}
        
        El email debe incluir:
        - Asunto atractivo
        - Saludo personalizado
        - Introducción que capte la atención
        - Valor principal del producto/servicio
        - Llamado a la acción claro
        - Cierre profesional
        
        Devuelve tu respuesta como un objeto JSON con la siguiente estructura:
        {
          "subject": "Asunto del email",
          "body": "Cuerpo completo del email",
          "type": "Tipo de email (promoción, recordatorio, bienvenida, etc.)",
          "openRate": "Tasa de apertura estimada (porcentaje)"
        }
      `;
      
      // Realizar la llamada a la API
      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content: "Eres un especialista en marketing digital con experiencia en redacción de emails efectivos para servicios legales y tecnológicos."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" }
      });
      
      // Procesar la respuesta
      if (response.choices && response.choices.length > 0) {
        const emailContent = response.choices[0].message.content;
        
        if (emailContent) {
          try {
            // Parsear el JSON de respuesta
            return JSON.parse(emailContent);
          } catch (parseError) {
            console.error("Error al parsear la respuesta JSON de OpenAI:", parseError);
            throw new Error("Formato de respuesta inválido");
          }
        }
      }
      
      throw new Error("No se obtuvo respuesta para el email de marketing");
    } catch (error) {
      console.error("Error al generar email de marketing:", error);
      throw error;
    }
  }
}

// Exportar instancia del servicio
export const openaiService = new OpenAIService();