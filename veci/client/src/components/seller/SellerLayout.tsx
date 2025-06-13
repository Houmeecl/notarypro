import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useState, ReactNode } from "react";
import { 
  LogOut, 
  Menu, 
  X, 
  Home, 
  User, 
  Target, 
  Store, 
  HelpCircle,
  MapPin,
  ChevronRight,
  Settings,
  FileText,
  CalendarRange,
  Trophy
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SellerLayoutProps {
  children: ReactNode;
  title?: string;
  showNavigation?: boolean;
}

export default function SellerLayout({ 
  children, 
  title = "Panel de Vendedor", 
  showNavigation = true 
}: SellerLayoutProps) {
  const [_, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white text-gray-900 border-b border-gray-100 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div 
                className="font-bold text-xl cursor-pointer flex items-center" 
                onClick={() => setLocation("/")}
              >
                <img src="/images/logo-notarypro-rojo.svg" alt="NotaryPro Logo" className="h-8 mr-2" />
                <span className="text-red-600 font-medium">Vecinos <span className="font-bold">NotaryPro</span></span>
              </div>
              <div className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                Ventas Territorial
              </div>
            </div>

            <div className="flex items-center">
              {user ? (
                <>
                  <div className="hidden md:flex items-center mr-2">
                    <span className="text-sm text-gray-600 mr-2">Hola, {user.username}</span>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                        {user.username?.substring(0, 2).toUpperCase() || "VD"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    className="text-red-600 hover:bg-red-50 font-normal text-sm"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    <span className="hidden md:inline">Salir</span>
                  </Button>
                </>
              ) : (
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white font-normal text-sm"
                  onClick={() => setLocation("/auth")}
                >
                  Acceder
                </Button>
              )}
              
              {/* Botón de menú móvil */}
              <div className="md:hidden ml-4">
                <Button 
                  variant="ghost" 
                  className="text-gray-500"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación de escritorio */}
      {user && showNavigation && (
        <div className="hidden md:block bg-white border-b border-gray-100">
          <div className="container mx-auto px-4">
            <nav className="flex space-x-6">
              <Button 
                variant="link" 
                className="text-gray-600 hover:text-green-600 font-normal text-sm h-12"
                onClick={() => setLocation("/seller/dashboard")}
              >
                <Home className="h-4 w-4 mr-2" />
                Inicio
              </Button>
              <Button 
                variant="link" 
                className="text-gray-600 hover:text-green-600 font-normal text-sm h-12"
                onClick={() => setLocation("/seller/leads")}
              >
                <Target className="h-4 w-4 mr-2" />
                Leads
              </Button>
              <Button 
                variant="link" 
                className="text-gray-600 hover:text-green-600 font-normal text-sm h-12"
                onClick={() => setLocation("/seller/partners")}
              >
                <Store className="h-4 w-4 mr-2" />
                Socios
              </Button>
              <Button 
                variant="link" 
                className="text-gray-600 hover:text-green-600 font-normal text-sm h-12"
                onClick={() => setLocation("/seller/visits")}
              >
                <CalendarRange className="h-4 w-4 mr-2" />
                Visitas
              </Button>
              <Button 
                variant="link" 
                className="text-gray-600 hover:text-green-600 font-normal text-sm h-12"
                onClick={() => setLocation("/seller/performance")}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Desempeño
              </Button>
            </nav>
          </div>
        </div>
      )}
      
      {/* Menú móvil */}
      {menuOpen && user && showNavigation && (
        <div className="md:hidden bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-2">
            <nav className="flex flex-col">
              <Button 
                variant="link" 
                className="text-gray-600 hover:text-green-600 justify-start h-10 px-0 font-normal"
                onClick={() => {
                  setLocation("/seller/dashboard");
                  setMenuOpen(false);
                }}
              >
                <Home className="h-4 w-4 mr-2" />
                Inicio
              </Button>
              <Button 
                variant="link" 
                className="text-gray-600 hover:text-green-600 justify-start h-10 px-0 font-normal"
                onClick={() => {
                  setLocation("/seller/leads");
                  setMenuOpen(false);
                }}
              >
                <Target className="h-4 w-4 mr-2" />
                Leads
              </Button>
              <Button 
                variant="link" 
                className="text-gray-600 hover:text-green-600 justify-start h-10 px-0 font-normal"
                onClick={() => {
                  setLocation("/seller/partners");
                  setMenuOpen(false);
                }}
              >
                <Store className="h-4 w-4 mr-2" />
                Socios
              </Button>
              <Button 
                variant="link" 
                className="text-gray-600 hover:text-green-600 justify-start h-10 px-0 font-normal"
                onClick={() => {
                  setLocation("/seller/visits");
                  setMenuOpen(false);
                }}
              >
                <CalendarRange className="h-4 w-4 mr-2" />
                Visitas
              </Button>
              <Button 
                variant="link" 
                className="text-gray-600 hover:text-green-600 justify-start h-10 px-0 font-normal"
                onClick={() => {
                  setLocation("/seller/performance");
                  setMenuOpen(false);
                }}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Desempeño
              </Button>
              <Button 
                variant="link" 
                className="text-gray-600 hover:text-green-600 justify-start h-10 px-0 font-normal"
                onClick={() => {
                  setLocation("/seller/profile");
                  setMenuOpen(false);
                }}
              >
                <User className="h-4 w-4 mr-2" />
                Mi Perfil
              </Button>
            </nav>
          </div>
        </div>
      )}
      
      {/* Ruta de navegación */}
      {title && (
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center text-sm text-gray-500">
              <span>Inicio</span>
              <ChevronRight className="h-3 w-3 mx-1" />
              <span className="font-medium text-gray-800">{title}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Contenido principal */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-4 mt-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-xs text-gray-500">
                © 2025 Vecinos NotaryPro Express | Una empresa de CerfiDoc
              </p>
            </div>
            <div className="flex space-x-4">
              <Button 
                variant="link" 
                className="text-gray-500 text-xs p-0 h-auto font-normal"
                onClick={() => setLocation("/support")}
              >
                Soporte
              </Button>
              <Button 
                variant="link" 
                className="text-gray-500 text-xs p-0 h-auto font-normal"
                onClick={() => setLocation("/faq")}
              >
                Preguntas Frecuentes
              </Button>
              <Button 
                variant="link" 
                className="text-gray-500 text-xs p-0 h-auto font-normal"
                onClick={() => setLocation("/aviso-legal")}
              >
                Términos y Condiciones
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}