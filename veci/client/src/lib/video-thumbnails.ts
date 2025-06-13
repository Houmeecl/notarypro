// Definición de miniaturas (thumbnails) para los distintos tipos de videos

/**
 * Miniaturas profesionales para los videos corporativos.
 * Cada miniatura refleja el contenido del video correspondiente:
 * - explanation: Vista general de la plataforma y sus beneficios
 * - tutorial: Demostración de firma de documentos
 * - verification: Proceso de verificación de identidad
 */
const videoThumbnails = {
  // Thumbnail para la explicación general de la plataforma - Persona usando la web/app
  explanation: "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  
  // Thumbnail para el tutorial - Oficinistas discutiendo sobre implementación empresarial
  tutorial: "https://images.unsplash.com/photo-1577412647305-991150c7d163?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  
  // Thumbnail para el proceso de verificación - Tienda local/minimarket (Vecinos Express)
  verification: "https://images.unsplash.com/photo-1581955957646-b8c6b58d91f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
};

// Rutas a los guiones detallados para cada video
export const videoScripts = {
  explanation: "/videos/guiones/guion-explicativo.md",
  tutorial: "/videos/guiones/guion-tutorial.md",
  verification: "/videos/guiones/guion-verificacion.md"
};

export default videoThumbnails;