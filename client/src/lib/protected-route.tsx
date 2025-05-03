import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles = ["user", "certifier", "admin"],
}: {
  path: string;
  component: () => React.JSX.Element;
  allowedRoles?: string[];
}) {
  // MODO DE DESARROLLO - Acceso sin restricciones temporalmente
  // IMPORTANTE: En producción, este código debe eliminarse
  const BYPASS_AUTH = true;
  
  if (BYPASS_AUTH) {
    // En modo desarrollo, simplemente renderizamos el componente
    return <Route path={path} component={Component} />;
  }
  
  const { user, isLoading } = useAuth();

  // Componente para renderizar cuando no hay autenticación
  const UnauthenticatedComponent = () => {
    console.log("Redireccionando a /auth desde ProtectedRoute");
    return <Redirect to="/auth" />;
  };

  // Componente para renderizar cuando está cargando
  const LoadingComponent = () => {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  };

  // Componente para renderizar cuando no tiene permisos suficientes
  const UnauthorizedComponent = () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-2">Acceso denegado</h1>
        <p className="text-gray-600 text-center">No tienes permiso para acceder a esta página.</p>
      </div>
    );
  };

  // Decidir qué componente renderizar basado en el estado de autenticación
  let ComponentToRender = Component;

  if (isLoading) {
    ComponentToRender = LoadingComponent;
  } else if (!user) {
    ComponentToRender = UnauthenticatedComponent;
  } else if (!allowedRoles.includes(user.role)) {
    ComponentToRender = UnauthorizedComponent;
  }

  // Siempre devolvemos una ruta con el componente adecuado
  return <Route path={path} component={ComponentToRender} />;
}
