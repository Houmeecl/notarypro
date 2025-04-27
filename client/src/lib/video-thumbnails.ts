// Definición de miniaturas (thumbnails) para los distintos tipos de videos

/**
 * Miniaturas profesionales para los videos corporativos.
 * Cada miniatura refleja el contenido del video correspondiente:
 * - explanation: Vista general de la plataforma y sus beneficios
 * - tutorial: Demostración de firma de documentos
 * - verification: Proceso de verificación de identidad
 */
const videoThumbnails = {
  // Thumbnail para la explicación general de la plataforma
  explanation: "https://images.unsplash.com/photo-1554224155-8d04cb21ed6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  
  // Thumbnail para el tutorial paso a paso
  tutorial: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  
  // Thumbnail para el proceso de verificación
  verification: "https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
};

// Rutas a los guiones detallados para cada video
export const videoScripts = {
  explanation: "/videos/guiones/guion-explicativo.md",
  tutorial: "/videos/guiones/guion-tutorial.md",
  verification: "/videos/guiones/guion-verificacion.md"
};

export default videoThumbnails;