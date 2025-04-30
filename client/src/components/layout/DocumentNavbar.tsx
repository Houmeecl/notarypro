import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { FileText, FileSignature, Home, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function DocumentNavbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const isActive = (path: string) => {
    return location.startsWith(path);
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <div className="border-b">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <FileSignature className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">CerfiDoc</span>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-4 md:gap-6">
              <Link href="/document-categories">
                <div className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${isActive("/document-categories") ? "text-primary" : "text-gray-600"}`}>
                  Nuevo Documento
                </div>
              </Link>
              <Link href="/documents">
                <div className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${isActive("/documents") ? "text-primary" : "text-gray-600"}`}>
                  Mis Documentos
                </div>
              </Link>
              <Link href="/verificar-documento">
                <div className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${isActive("/verificar-documento") ? "text-primary" : "text-gray-600"}`}>
                  Verificar Documento
                </div>
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/user-dashboard">
                  <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Mi perfil
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost" size="sm">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="sm">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
            
            <Link href="/">
              <Button variant="outline" size="icon" className="md:hidden">
                <Home className="h-4 w-4" />
                <span className="sr-only">Inicio</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}