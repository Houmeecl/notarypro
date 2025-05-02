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
  Monitor
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div 
                className="font-bold text-xl cursor-pointer flex items-center" 
                onClick={() => setLocation(isLoggedIn ? "/vecinos/dashboard" : "/vecinos")}
              >
                <span className="bg-white text-green-600 px-2 py-1 rounded-md mr-2 font-bold">VX</span>
                <span>Vecinos Xpress</span>
              </div>
              
              {isLoggedIn && showNavigation && (
                <div className="hidden md:block ml-8">
                  <nav className="flex space-x-4">
                    <Button 
                      variant="link" 
                      className="text-white"
                      onClick={() => setLocation("/vecinos/dashboard")}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                    <Button 
                      variant="link" 
                      className="text-white"
                      onClick={() => setLocation("/vecinos/pos-app")}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Procesar Docs
                    </Button>
                    <Button 
                      variant="link" 
                      className="text-white"
                      onClick={() => window.open("/partners/webapp-pos-buttons", "_blank")}
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      POS Web
                    </Button>
                    <Button 
                      variant="link" 
                      className="text-white"
                      onClick={() => setLocation("/vecinos/retiros")}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Retiros
                    </Button>
                  </nav>
                </div>
              )}
            </div>
            
            <div className="flex items-center">
              {isLoggedIn ? (
                <>
                  <Button 
                    variant="ghost" 
                    className="text-white"
                    onClick={() => setLocation("/vecinos/cuenta")}
                  >
                    <User className="h-5 w-5" />
                    <span className="ml-2 hidden md:inline">Mi Cuenta</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="text-white"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="ml-2 hidden md:inline">Salir</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    className="text-white"
                    onClick={() => setLocation("/vecinos/registro")}
                  >
                    Registro
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="text-white bg-green-700"
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
                  className="text-white"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Menú móvil */}
      {menuOpen && isLoggedIn && showNavigation && (
        <div className="md:hidden bg-green-800 text-white">
          <div className="container mx-auto px-4 py-2">
            <nav className="flex flex-col space-y-2">
              <Button 
                variant="ghost" 
                className="text-white justify-start"
                onClick={() => {
                  setLocation("/vecinos/dashboard");
                  setMenuOpen(false);
                }}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                className="text-white justify-start"
                onClick={() => {
                  setLocation("/vecinos/pos-app");
                  setMenuOpen(false);
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Procesar Documentos
              </Button>
              <Button 
                variant="ghost" 
                className="text-white justify-start"
                onClick={() => {
                  window.open("/partners/webapp-pos-buttons", "_blank");
                  setMenuOpen(false);
                }}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Abrir POS Web
              </Button>
              <Button 
                variant="ghost" 
                className="text-white justify-start"
                onClick={() => {
                  setLocation("/vecinos/retiros");
                  setMenuOpen(false);
                }}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Retiros
              </Button>
              <Button 
                variant="ghost" 
                className="text-white justify-start"
                onClick={() => {
                  setLocation("/vecinos/cuenta");
                  setMenuOpen(false);
                }}
              >
                <User className="h-4 w-4 mr-2" />
                Mi Cuenta
              </Button>
              <Button 
                variant="ghost" 
                className="text-white justify-start"
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
      
      {/* Contenido principal */}
      <main className="flex-grow">
        {title && (
          <div className="bg-white border-b">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            </div>
          </div>
        )}
        
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-600">
                © 2025 Vecinos NotaryPro Express | Una empresa de CerfiDoc
              </p>
            </div>
            <div className="flex space-x-4">
              <Button 
                variant="link" 
                className="text-gray-600 text-sm p-0 h-auto"
                onClick={() => setLocation("/vecinos/soporte")}
              >
                Soporte
              </Button>
              <Button 
                variant="link" 
                className="text-gray-600 text-sm p-0 h-auto"
                onClick={() => setLocation("/vecinos/faq")}
              >
                Preguntas Frecuentes
              </Button>
              <Button 
                variant="link" 
                className="text-gray-600 text-sm p-0 h-auto"
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