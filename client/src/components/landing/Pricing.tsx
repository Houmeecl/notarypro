import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "wouter";

export default function Pricing() {
  return (
    <section id="precios" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-secondary font-heading mb-4">Planes y Precios</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Ofrecemos diferentes planes para adaptarnos a tus necesidades, desde usuarios individuales hasta empresas con alto volumen de firmas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Plan 1 */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="p-1 bg-gray-100"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-secondary font-heading mb-2">Plan Básico</h3>
              <p className="text-gray-600 mb-4">
                Ideal para uso personal ocasional.
              </p>
              <div className="mb-4">
                <span className="text-3xl font-bold text-secondary">$9.90</span>
                <span className="text-gray-500">/documento</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">Firma simple por documento</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">Hasta 2 firmantes</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">Validez legal básica</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">Almacenamiento 30 días</span>
                </li>
              </ul>
              <Link href="/auth">
                <Button variant="outline" className="w-full">
                  Seleccionar plan
                </Button>
              </Link>
            </div>
          </div>

          {/* Plan 2 - Featured */}
          <div className="bg-white border-2 border-primary rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform md:-translate-y-4">
            <div className="bg-primary text-white text-center py-2 text-sm font-medium">
              RECOMENDADO
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-secondary font-heading mb-2">Plan Profesional</h3>
              <p className="text-gray-600 mb-4">
                Para profesionales y pequeñas empresas.
              </p>
              <div className="mb-4">
                <span className="text-3xl font-bold text-secondary">$49.90</span>
                <span className="text-gray-500">/mes</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">10 documentos mensuales</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">Hasta 5 firmantes</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">Firma avanzada incluida</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">Almacenamiento 1 año</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">Plantillas personalizadas</span>
                </li>
              </ul>
              <Link href="/auth">
                <Button className="w-full bg-primary hover:bg-red-700">
                  Seleccionar plan
                </Button>
              </Link>
            </div>
          </div>

          {/* Plan 3 */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="p-1 bg-gray-100"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-secondary font-heading mb-2">Plan Empresarial</h3>
              <p className="text-gray-600 mb-4">
                Para empresas con alto volumen de firmas.
              </p>
              <div className="mb-4">
                <span className="text-3xl font-bold text-secondary">$199.90</span>
                <span className="text-gray-500">/mes</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">50 documentos mensuales</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">Firmantes ilimitados</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">Firma avanzada incluida</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">Almacenamiento ilimitado</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">API para integración</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">Soporte prioritario</span>
                </li>
              </ul>
              <Link href="/auth">
                <Button variant="outline" className="w-full">
                  Seleccionar plan
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">¿Necesitas un plan personalizado para tu empresa?</p>
          <a href="#contacto">
            <Button variant="outline">
              Contacta con nosotros
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
