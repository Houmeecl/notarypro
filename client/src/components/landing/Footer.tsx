import { Link } from "wouter";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center mb-4">
              <img 
                src="/assets/notarypro-logo.png" 
                alt="NotaryPro" 
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-gray-600 mb-4">
              Plataforma líder en firma y certificación digital notarial para profesionales jurídicos y empresas en Canadá.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-150">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-150">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-150">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-150">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-secondary mb-4">Servicios</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Firma Electrónica Simple
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Firma Electrónica Avanzada
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Certificación Digital
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Cursos de Certificación
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Soluciones Empresariales
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-secondary mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Sobre Nosotros
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Empleo
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Prensa
                </a>
              </li>
              <li>
                <a href="#contacto" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-secondary mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Política de Cookies
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Cumplimiento Legal
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Certificaciones
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} NotaryPro. Todos los derechos reservados.
          </p>
          <div className="mt-4 md:mt-0">
            <img
              src="https://via.placeholder.com/300x50?text=Logotipos+de+Certificaciones"
              alt="Certificaciones"
              className="h-10"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
