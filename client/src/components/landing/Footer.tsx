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
                src="/assets/nuevo-logo.png" 
                alt="NotaryPro" 
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-gray-600 mb-4">
              Plataforma líder en firma y certificación digital de documentos para profesionales jurídicos y empresas en Chile, en cumplimiento con la Ley 19.799 sobre documentos electrónicos.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors duration-150">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors duration-150">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors duration-150">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600 transition-colors duration-150">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-secondary mb-4">Servicios</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/document-templates" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Documentos y Plantillas
                </Link>
              </li>
              <li>
                <Link href="/document-categories" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Categorías de Documentos
                </Link>
              </li>
              <li>
                <Link href="/certificacion-por-video" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Certificación por Video
                </Link>
              </li>
              <li>
                <Link href="/curso-certificador" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Curso de Certificador
                </Link>
              </li>
              <li>
                <Link href="/servicios-empresariales" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Soluciones Empresariales
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-secondary mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/quienes-somos" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Quiénes Somos
                </Link>
              </li>
              <li>
                <Link href="/comunicado-prensa-redaccion-documentos" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Comunicados de Prensa
                </Link>
              </li>
              <li>
                <Link href="/unete-al-equipo" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Únete al Equipo
                </Link>
              </li>
              <li>
                <Link href="/partners/sdk-demo" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Programa de Partners
                </Link>
              </li>
              <li>
                <Link href="/#contacto" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-secondary mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/aviso-legal" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Aviso Legal
                </Link>
              </li>
              <li>
                <Link href="/ayuda-legal" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Ayuda Legal
                </Link>
              </li>
              <li>
                <Link href="/verificar-documento" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Verificar Documento
                </Link>
              </li>
              <li>
                <a href="https://www.bcn.cl/leychile/navegar?idNorma=196640" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Ley 19.799 - Documentos Electrónicos
                </a>
              </li>
              <li>
                <Link href="/ron-login" className="text-gray-600 hover:text-primary transition-colors duration-150">
                  Plataforma RON
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-center text-gray-600 mb-4 max-w-3xl mx-auto">
            NotaryPro permite a cualquier persona firmar documentos legales de forma segura y verificable. Con certificación digital respaldada por la Ley 19.799, nuestros documentos tienen plena validez legal en Chile y en el extranjero mediante apostilla electrónica.
          </p>
        </div>
        
        <div className="border-t border-gray-200 mt-6 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} NotaryPro Chile. Todos los derechos reservados.
          </p>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="flex items-center bg-gray-100 px-3 py-1 rounded">
              <img
                src="/src/assets/local/logo12582620.png"
                alt="Certificación Chile"
                className="h-8"
              />
              <span className="ml-2 text-sm text-gray-600 font-medium">Certificado por Ley 19.799</span>
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded">
              <span className="text-sm text-gray-600 font-medium">Seguridad ISO 27001</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
