import { Router, Request, Response } from "express";
import { translateText, translateDocumentContent, SUPPORTED_LANGUAGES } from "./services/translation-service";

export const translationRouter = Router();

// Middleware para comprobar si el usuario está autenticado
function isAuthenticated(req: Request, res: Response, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "No autorizado" });
}

/**
 * Obtener idiomas soportados
 */
translationRouter.get("/supported-languages", (req: Request, res: Response) => {
  try {
    res.json(SUPPORTED_LANGUAGES);
  } catch (error: any) {
    console.error("Error al obtener idiomas soportados:", error);
    res.status(500).json({ error: "Error al obtener idiomas soportados" });
  }
});

/**
 * Traducir texto
 */
translationRouter.post("/translate", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ error: "Se requiere texto y idioma destino" });
    }

    const translatedText = await translateText(text, targetLanguage, sourceLanguage);
    res.json({ translatedText });
  } catch (error: any) {
    console.error("Error al traducir texto:", error);
    res.status(500).json({ error: `Error al traducir texto: ${error.message}` });
  }
});

/**
 * Traducir contenido de documento
 */
translationRouter.post("/translate-document", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { documentId, content, targetLanguage, sourceLanguage } = req.body;

    if ((!documentId && !content) || !targetLanguage) {
      return res.status(400).json({ error: "Se requiere ID de documento o contenido, y idioma destino" });
    }

    // Si se proporcionó contenido directamente, traducirlo
    if (content) {
      const translatedContent = await translateDocumentContent(content, targetLanguage, sourceLanguage);
      return res.json({ translatedContent });
    }

    // Si no, se asume que se proporcionó un ID de documento
    // Aquí habría que obtener el contenido del documento desde la base de datos
    // y luego traducirlo

    // Esto es solo un ejemplo, habría que adaptarlo según la estructura de la base de datos
    try {
      // Aquí se obtendría el documento de la base de datos
      // const document = await storage.getDocument(documentId);
      // if (!document) {
      //   return res.status(404).json({ error: "Documento no encontrado" });
      // }
      
      // Temporalmente se retorna un error indicando que no se implementó esta funcionalidad
      return res.status(501).json({ error: "Traducción por ID de documento no implementada aún" });
      
      // const translatedContent = await translateDocumentContent(document.content, targetLanguage, sourceLanguage);
      // return res.json({ translatedContent });
    } catch (dbError) {
      console.error("Error al obtener documento para traducción:", dbError);
      return res.status(500).json({ error: "Error al obtener documento para traducción" });
    }
  } catch (error: any) {
    console.error("Error al traducir documento:", error);
    res.status(500).json({ error: `Error al traducir documento: ${error.message}` });
  }
});