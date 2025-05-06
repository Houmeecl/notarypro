import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logoImg from "@/assets/logo12582620.png";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="relative bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo - Solo imagen sin texto */}
          <div className="flex items-center">
            <Link href="/">
              <img 
                src={logoImg} 
                alt="NotaryPro Logo" 
                className="h-10 w-auto" 
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            <a href="#servicios" className="text-secondary hover:text-primary font-medium text-sm transition duration-150">
              Servicios
            </a>
            <a href="#como-funciona" className="text-secondary hover:text-primary font-medium text-sm transition duration-150">
              Cómo funciona
            </a>
            <a href="#precios" className="text-secondary hover:text-primary font-medium text-sm transition duration-150">
              Precios
            </a>
            <a href="#faq" className="text-secondary hover:text-primary font-medium text-sm transition duration-150">
              FAQ
            </a>
            <a href="#contacto" className="text-secondary hover:text-primary font-medium text-sm transition duration-150">
              Contacto
            </a>
            <Link href="/vecinos-express" className="text-secondary hover:text-primary font-medium text-sm transition duration-150">
              Vecinos Express
            </Link>
            <Link href="/vecinos/login" className="text-secondary hover:text-primary font-medium text-sm transition duration-150">
              Acceso Vecinos
            </Link>
            <Link href="/vecinos" className="text-secondary hover:text-primary font-medium text-sm transition duration-150">
              Vecinos Web
            </Link>
            <Link href="/integraciones-demo" className="text-secondary hover:text-primary font-medium text-sm transition duration-150">
              Demo Integraciones
            </Link>
            <Link href="/payment-demo" className="text-secondary hover:text-primary font-medium text-sm transition duration-150">
              Demo Pagos
            </Link>
            <a href="/documentacion-tecnica.html" className="text-secondary hover:text-primary font-medium text-sm transition duration-150" target="_blank" rel="noopener noreferrer">
              Documentación
            </a>
            
            {user ? (
              <Link href={user.role === "certifier" ? "/certifier-dashboard" : (user.role === "admin" ? "/admin-dashboard" : "/user-dashboard")}>
                <Button variant="default" className="ml-4 bg-primary hover:bg-red-700">
                  Mi Panel
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button variant="default" className="ml-4 bg-primary hover:bg-red-700">
                  Iniciar Sesión
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" onClick={toggleMenu} className="text-secondary hover:text-primary focus:outline-none">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-4 space-y-1">
              <a
                href="#servicios"
                className="block px-3 py-2 text-base font-medium text-secondary hover:text-primary hover:bg-light rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Servicios
              </a>
              <a
                href="#como-funciona"
                className="block px-3 py-2 text-base font-medium text-secondary hover:text-primary hover:bg-light rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Cómo funciona
              </a>
              <a
                href="#precios"
                className="block px-3 py-2 text-base font-medium text-secondary hover:text-primary hover:bg-light rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Precios
              </a>
              <a
                href="#faq"
                className="block px-3 py-2 text-base font-medium text-secondary hover:text-primary hover:bg-light rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </a>
              <a
                href="#contacto"
                className="block px-3 py-2 text-base font-medium text-secondary hover:text-primary hover:bg-light rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </a>
              <Link 
                href="/vecinos-express"
                className="block px-3 py-2 text-base font-medium text-secondary hover:text-primary hover:bg-light rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Vecinos Express
              </Link>
              <Link 
                href="/vecinos/login"
                className="block px-3 py-2 text-base font-medium text-secondary hover:text-primary hover:bg-light rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Acceso Vecinos
              </Link>
              <Link 
                href="/vecinos"
                className="block px-3 py-2 text-base font-medium text-secondary hover:text-primary hover:bg-light rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Vecinos Web
              </Link>
              <Link 
                href="/integraciones-demo"
                className="block px-3 py-2 text-base font-medium text-secondary hover:text-primary hover:bg-light rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Demo Integraciones
              </Link>
              <Link 
                href="/payment-demo"
                className="block px-3 py-2 text-base font-medium text-secondary hover:text-primary hover:bg-light rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Demo Pagos
              </Link>
              <a 
                href="/documentacion-tecnica.html"
                className="block px-3 py-2 text-base font-medium text-secondary hover:text-primary hover:bg-light rounded-md"
                onClick={() => setIsMenuOpen(false)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Documentación
              </a>
              
              {user ? (
                <Link href={user.role === "certifier" ? "/certifier-dashboard" : (user.role === "admin" ? "/admin-dashboard" : "/user-dashboard")}>
                  <Button variant="default" className="w-full mt-4 bg-primary hover:bg-red-700">
                    Mi Panel
                  </Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button variant="default" className="w-full mt-4 bg-primary hover:bg-red-700">
                    Iniciar Sesión
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
