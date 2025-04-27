import { ArrowLeft, Building2, Users, FileCheck, ShieldCheck, BarChart2, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ServiciosEmpresariales() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <Link href="/">
          <a className="inline-flex items-center text-primary hover:underline mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </a>
        </Link>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/95 to-primary rounded-lg shadow-lg p-8 md:p-12 mb-12 text-white">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Soluciones de Firma Electrónica para Empresas en Chile
            </h1>
            <p className="text-lg text-white/90 mb-6">
              Automatice sus procesos documentales y cumpla con la Ley 19.799 con nuestra solución integral de firma electrónica y certificación digital para empresas.
            </p>
            <Button className="bg-white text-primary hover:bg-white/90">
              Solicitar una demostración
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-6">
            Transforme los procesos documentales de su empresa
          </h2>
          
          <p className="text-gray-700 mb-8">
            En el entorno empresarial actual de Chile, la gestión eficiente de documentos es crucial para mantener la competitividad. NotaryPro Chile ofrece soluciones avanzadas de firma electrónica que permiten a las empresas chilenas reducir costos, mejorar la eficiencia y cumplir con todas las normativas legales establecidas en la Ley 19.799 sobre Documentos Electrónicos y Firma Electrónica.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="border border-gray-200 hover:border-primary transition-colors duration-200">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-2">API para Empresas</h3>
                <p className="text-gray-600">
                  Integre nuestra API de firma electrónica directamente en sus sistemas existentes para automatizar procesos documentales en cumplimiento con la legislación chilena.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:border-primary transition-colors duration-200">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-2">Portal Empresarial</h3>
                <p className="text-gray-600">
                  Plataforma personalizada con su marca, que permite a sus colaboradores y clientes firmar documentos de forma segura con validez legal en Chile.
                </p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-6">
            Beneficios para su empresa en Chile
          </h2>

          <div className="space-y-6 mb-12">
            <div className="flex items-start">
              <div className="bg-primary/10 p-3 rounded-full mr-4 flex-shrink-0">
                <FileCheck className="text-primary h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-secondary mb-1">Validez legal garantizada</h3>
                <p className="text-gray-600">
                  Todos los documentos firmados a través de nuestra plataforma cumplen con los requisitos establecidos en la Ley 19.799, garantizando su plena validez legal en Chile y asegurando el no repudio.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-primary/10 p-3 rounded-full mr-4 flex-shrink-0">
                <ShieldCheck className="text-primary h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-secondary mb-1">Seguridad de nivel empresarial</h3>
                <p className="text-gray-600">
                  Implementamos cifrado de extremo a extremo, autenticación de múltiples factores y cumplimos con estándares internacionales de seguridad, adaptados a los requerimientos específicos de la normativa chilena.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-primary/10 p-3 rounded-full mr-4 flex-shrink-0">
                <BarChart2 className="text-primary h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-secondary mb-1">Reducción de costos operativos</h3>
                <p className="text-gray-600">
                  Nuestros clientes en Chile han reportado ahorros de hasta un 80% en costos relacionados con la gestión documental, eliminando gastos en papel, impresión, almacenamiento físico y envío de documentos.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-primary/10 p-3 rounded-full mr-4 flex-shrink-0">
                <MessageCircle className="text-primary h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-secondary mb-1">Soporte local especializado</h3>
                <p className="text-gray-600">
                  Contamos con un equipo de expertos en Chile familiarizados con la legislación local, disponibles para resolver dudas técnicas y legales sobre la implementación de firma electrónica en su empresa.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-6">
            Sectores que confían en nosotros
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <h3 className="font-bold text-secondary mb-2">Servicios Financieros</h3>
              <p className="text-gray-600 text-sm">
                Contratos de préstamo, pólizas de seguro, documentación de cumplimiento
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <h3 className="font-bold text-secondary mb-2">Recursos Humanos</h3>
              <p className="text-gray-600 text-sm">
                Contratos laborales, confidencialidad, políticas internas, onboarding
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <h3 className="font-bold text-secondary mb-2">Sector Inmobiliario</h3>
              <p className="text-gray-600 text-sm">
                Contratos de arriendo, compraventa, documentos notariales
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <h3 className="font-bold text-secondary mb-2">Sector Legal</h3>
              <p className="text-gray-600 text-sm">
                Acuerdos de confidencialidad, contratos, poderes, representaciones
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <h3 className="font-bold text-secondary mb-2">Salud</h3>
              <p className="text-gray-600 text-sm">
                Consentimientos informados, documentación clínica, prescripciones
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <h3 className="font-bold text-secondary mb-2">Educación</h3>
              <p className="text-gray-600 text-sm">
                Certificados, matrículas, contratos educacionales, documentación académica
              </p>
            </div>
          </div>

          {/* Compliance Section */}
          <div className="bg-gray-100 p-6 rounded-lg mb-12">
            <h3 className="text-xl font-bold text-secondary mb-4">
              Cumplimiento con la Ley 19.799 de Chile
            </h3>
            <p className="text-gray-700 mb-4">
              Nuestra plataforma está diseñada específicamente para cumplir con todos los requisitos de la Ley 19.799 sobre Documentos Electrónicos y Firma Electrónica, garantizando:
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>Validez legal equivalente a documentos físicos firmados a mano</li>
              <li>Procesos de verificación de identidad sólidos en cumplimiento con la normativa chilena</li>
              <li>Encriptación avanzada que garantiza la integridad del documento firmado</li>
              <li>Sellos de tiempo que certifican el momento exacto de la firma</li>
              <li>Certificación de terceros confiables conforme a la regulación local</li>
            </ul>
          </div>

          {/* CTA Section */}
          <div className="bg-secondary/5 p-8 rounded-lg text-center mb-12">
            <h2 className="text-2xl font-bold text-secondary mb-4">
              Comience a transformar sus procesos documentales hoy
            </h2>
            <p className="text-gray-700 mb-6">
              Agende una demostración gratuita con un especialista que le mostrará cómo NotaryPro Chile puede adaptarse a las necesidades específicas de su empresa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-primary hover:bg-primary/90">
                Solicitar demostración
              </Button>
              <Button variant="outline">
                Descargar brochure
              </Button>
            </div>
          </div>

          {/* Testimonials */}
          <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-6">
            Empresas chilenas que confían en NotaryPro
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <p className="italic text-gray-600 mb-4">
                  "Implementar NotaryPro Chile nos ha permitido reducir el tiempo de procesamiento de contratos en un 70%, además de garantizar el cumplimiento de la Ley 19.799, algo fundamental para nuestra operación."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <p className="font-bold text-secondary">María Fernández</p>
                    <p className="text-sm text-gray-500">Gerente Legal, Empresa Financiera</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <p className="italic text-gray-600 mb-4">
                  "La plataforma es extremadamente intuitiva y nos ha permitido digitalizar todos nuestros procesos de firma de documentos, cumpliendo con la normativa chilena y mejorando sustancialmente la experiencia de nuestros clientes."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <p className="font-bold text-secondary">Carlos Mendoza</p>
                    <p className="text-sm text-gray-500">Director de Operaciones, Inmobiliaria</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-6">
            Preguntas frecuentes sobre nuestros servicios empresariales
          </h2>

          <div className="space-y-4 mb-12">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-bold text-secondary mb-2">
                ¿Las firmas electrónicas generadas en su plataforma son legalmente vinculantes en Chile?
              </h3>
              <p className="text-gray-600">
                Sí, todas las firmas electrónicas en nuestra plataforma cumplen con los requisitos de la Ley 19.799, lo que les otorga plena validez legal en Chile. La firma electrónica avanzada tiene el mismo valor jurídico que una firma manuscrita según el Artículo 3° de dicha ley.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-bold text-secondary mb-2">
                ¿Puedo integrar NotaryPro Chile con mis sistemas actuales?
              </h3>
              <p className="text-gray-600">
                Sí, ofrecemos APIs y webhooks que permiten una integración completa con sus sistemas existentes como CRM, ERP, o plataformas de gestión documental, adaptándonos a la infraestructura tecnológica de su empresa en Chile.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-bold text-secondary mb-2">
                ¿Cómo garantizan la seguridad de los documentos firmados?
              </h3>
              <p className="text-gray-600">
                Implementamos múltiples capas de seguridad que incluyen cifrado de extremo a extremo, autenticación multifactor, y verificación biométrica de identidad. Todos nuestros procesos están diseñados para cumplir con los estándares de seguridad establecidos en la normativa chilena.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-bold text-secondary mb-2">
                ¿Ofrecen planes personalizados para empresas?
              </h3>
              <p className="text-gray-600">
                Sí, disponemos de planes empresariales personalizados según el volumen de documentos, número de usuarios y necesidades específicas de integración, con tarifas especiales para empresas chilenas de diferentes tamaños.
              </p>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center">
            <Button className="bg-primary hover:bg-primary/90">
              Contactar a un especialista
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}