import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

/**
 * Hook que verifica si el usuario está autenticado
 * y redirecciona si no lo está
 */
export function useRequireAuth(redirectTo = '/auth') {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Solo redirigir si ha terminado la carga y no hay usuario
    if (!isLoading && !user) {
      console.log(`Usuario no autenticado. Redirigiendo a ${redirectTo}`);
      setLocation(redirectTo);
    }
  }, [user, isLoading, redirectTo, setLocation]);

  return { user, isLoading };
}

/**
 * Componente que muestra un indicador de carga
 */
export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="mt-2 text-lg">Cargando...</p>
    </div>
  );
}

/**
 * Componente HOC (High Order Component) que protege una ruta
 * exigiendo autenticación para acceder a ella
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options = { redirectTo: '/auth' }
) {
  return function ProtectedComponent(props: P) {
    const { user, isLoading } = useRequireAuth(options.redirectTo);
    
    // Mostrar spinner de carga
    if (isLoading) {
      return <LoadingSpinner />;
    }
    
    // Si no hay usuario, el useRequireAuth ya se encargó de la redirección
    // Si hay usuario, renderizar el componente protegido
    return user ? <Component {...props} /> : null;
  };
}