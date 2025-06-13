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
  FileText, 
  CreditCard, 
  HelpCircle,
  BarChart3,
  Monitor,
  ChevronRight
} from "lucide-react";

interface VecinosLayoutProps {
  children: ReactNode;
  title?: string;
  showNavigation?: boolean;
}

export default function VecinosLayout({ 
  children, 
  title = "Vecinos NotaryPro Express", 
  showNavigation = true 
}: VecinosLayoutProps) {
  const [_, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const isLoggedIn = localStorage.getItem("vecinos_token") !== null;
  
  const handleLogout = () => {
    localStorage.removeItem("vecinos_token");
    setLocation("/vecinos/login");
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
                onClick={() => setLocation(isLoggedIn ? "/vecinos/dashboard" : "/vecinos")}
              >
                <img src="/images/logo-notarypro-rojo.svg" alt="NotaryPro Logo" className="h-8 mr-2" />
                <span className="text-red-600 font-light">Vecinos <span className="font-semibold">NotaryPro</span></span>
              </div>
            </div>
            
            <div className="flex items-center">
              {isLoggedIn ? (
                <>
                  <Button 
                    variant="outline" 
                    className="text-gray-700 border-0 hover:bg-gray-50 font-normal mr-2 text-sm"
                    onClick={() => setLocation("/vecinos/cuenta")}
                  >
                    <User className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="hidden md:inline">Mi Cuenta</span>
                  </Button>
                  
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
                <>
                  <Button 
                    variant="outline" 
                    className="text-gray-700 border-gray-200 hover:bg-gray-50 mr-2 font-normal text-sm"
                    onClick={() => setLocation("/vecinos/registro")}
                  >
                    Registro
                  </Button>
                  <Button 
                    className="bg-red-600 hover:bg-red-700 text-white font-normal text-sm"
                    onClick={() => setLocation("/vecinos/login")}
                  >
                    Acceder
                  </Button>
                </>
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
      {isLoggedIn && showNavigation && (
        <div className="hidden md:block bg-white border-b border-gray-100">
          <div className="container mx-auto px-4">
            <nav className="flex space-x-6">
              <Button 
                variant="link" 
                className="text-gray-600 hover:text-red-600 font-normal text-sm h-12"
                onClick={() => setLocation("/vecinos/dashboard")}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="link" 
                className="text-gray-600 hover:text-red-600 font-normal text-sm h-12"
                onClick={() => setLocation("/vecinos/pos-app")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Procesar Docs
              </Button>
              <Button 
                variant="link" 
                className="text-gray-600 hover:text-red-600 font-normal text-sm h-12"
                onClick={() => window.open("/partners/webapp-pos-official", "_blank")}
              >
                <Monitor className="h-4 w-4 mr-2" />
                POS Web
              </Button>
              <Button 
                variant="link" 
                className="text-gray-600 hover:text-red-600 font-normal text-sm h-12"
                onClick={() => setLocation("/vecinos/retiros")}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Retiros
              </Button>
            </nav>
          </div>
        </div>
      )}
      
      {/* Menú móvil */}
      {menuOpen && isLoggedIn && showNavigation && (
        <div className="md:hidden bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-2">
            <nav className="flex flex-col">
              <Button 
                variant="link" 
                className="text-gray-600 hover:text-red-600 justify-start h-10 px-0 font-normal"
                onClick={() => {
                  setLocation("/vecinos/dashboard");
                  setMenuOpen(false);
                }}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="link" 
                className="text-gray-600 hover:text-red-600 justify-start h-10 px-0 font-normal"
                onClick={() => {
                  setLocation("/vecinos/pos-app");
                  setMenuOpen(false);
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Procesar Documentos
              </Button>
              <Button 
                variant="link" 
                className="text-gray-600 hover:text-red-600 justify-start h-10 px-0 font-normal"
                onClick={() => {
                  window.open("/partners/webapp-pos-official", "_blank");
                  setMenuOpen(false);
                }}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Abrir POS Web
              </Button>
              <Button 
                variant="link" 
                className="text-gray-600 hover:text-red-600 justify-start h-10 px-0 font-normal"
                onClick={() => {
                  setLocation("/vecinos/retiros");
                  setMenuOpen(false);
                }}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Retiros
              </Button>
              <Button 
                variant="link" 
                className="text-gray-600 hover:text-red-600 justify-start h-10 px-0 font-normal"
                onClick={() => {
                  setLocation("/vecinos/cuenta");
                  setMenuOpen(false);
                }}
              >
                <User className="h-4 w-4 mr-2" />
                Mi Cuenta
              </Button>
              <Button 
                variant="link" 
                className="text-gray-600 hover:text-red-600 justify-start h-10 px-0 font-normal"
                onClick={() => {
                  setLocation("/vecinos/soporte");
                  setMenuOpen(false);
                }}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Soporte
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
                onClick={() => setLocation("/vecinos/soporte")}
              >
                Soporte
              </Button>
              <Button 
                variant="link" 
                className="text-gray-500 text-xs p-0 h-auto font-normal"
                onClick={() => setLocation("/vecinos/faq")}
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