import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Ruta a la que ofrecer ir como acceso alternativo (por defecto /acceso-directo). */
  fallbackPath?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Límite de error de React. Captura errores de renderizado en el árbol de
 * componentes hijo y muestra una interfaz de recuperación en lugar de dejar
 * la pantalla en blanco.
 *
 * Reemplaza el patrón roto de `try/catch` alrededor de un JSX (que no captura
 * errores de render porque el renderizado ocurre después del try).
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary capturó un error de renderizado:", error, info);
  }

  render() {
    if (this.state.hasError) {
      const fallbackPath = this.props.fallbackPath ?? "/acceso-directo";
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
          <h1 className="text-2xl font-bold mb-2">Algo salió mal al cargar esta página</h1>
          <p className="text-gray-600 mb-6 max-w-md">
            Ocurrió un error inesperado. Puedes recargar la página o usar el acceso
            alternativo mientras lo solucionamos.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Recargar
            </button>
            <a
              href={fallbackPath}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Ir al acceso directo
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
