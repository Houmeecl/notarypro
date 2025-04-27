import { Check, FileSignature, Shield, GraduationCap, ArrowRight } from "lucide-react";

export default function Services() {
  return (
    <section id="servicios" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-secondary font-heading mb-4">Nuestros Servicios</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Ofrecemos soluciones completas para la firma electrónica de documentos, con todas las garantías legales necesarias para particulares y empresas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Servicio 1 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="p-1 bg-primary"></div>
            <div className="p-6">
              <div className="w-14 h-14 bg-primary/10 flex items-center justify-center rounded-lg mb-4">
                <FileSignature className="text-primary h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-secondary font-heading mb-2">Firma Electrónica Simple</h3>
              <p className="text-gray-600 mb-4">
                Firma tus documentos de forma rápida y sencilla desde cualquier dispositivo. Ideal para contratos básicos.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">Validez legal básica</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">Firma en segundos</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">Múltiples firmantes</span>
                </li>
              </ul>
              <a href="#" className="text-primary font-medium hover:text-red-700 transition-colors duration-150 inline-flex items-center">
                Saber más
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Servicio 2 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="p-1 bg-primary"></div>
            <div className="p-6">
              <div className="w-14 h-14 bg-primary/10 flex items-center justify-center rounded-lg mb-4">
                <Shield className="text-primary h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-secondary font-heading mb-2">Firma Electrónica Avanzada</h3>
              <p className="text-gray-600 mb-4">
                Firma con validación de identidad y certificación por un tercero autorizado. Máxima validez legal.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">Validación de identidad</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">Certificación oficial</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">Validez legal completa</span>
                </li>
              </ul>
              <a href="#" className="text-primary font-medium hover:text-red-700 transition-colors duration-150 inline-flex items-center">
                Saber más
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Servicio 3 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="p-1 bg-primary"></div>
            <div className="p-6">
              <div className="w-14 h-14 bg-primary/10 flex items-center justify-center rounded-lg mb-4">
                <GraduationCap className="text-primary h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-secondary font-heading mb-2">Cursos de Certificación</h3>
              <p className="text-gray-600 mb-4">
                Capacitación para convertirte en certificador autorizado y validar documentos de terceros.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">Formación completa</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">Certificación oficial</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">Acceso al dashboard</span>
                </li>
              </ul>
              <a href="#" className="text-primary font-medium hover:text-red-700 transition-colors duration-150 inline-flex items-center">
                Saber más
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
