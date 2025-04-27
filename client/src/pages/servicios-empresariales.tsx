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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
            
            <Card className="border border-gray-200 hover:border-primary transition-colors duration-200">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="text-primary h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="2" width="16" height="20" rx="2" />
                    <line x1="8" y1="2" x2="8" y2="22" />
                    <line x1="16" y1="2" x2="16" y2="22" />
                    <circle cx="12" cy="18" r="1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-secondary mb-2">Estaciones de Firma Digital</h3>
                <p className="text-gray-600">
                  Tablets y kioscos con nuestra aplicación instalada para firmas presenciales en sus oficinas, minas, o cualquier ubicación en territorio chileno.
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

          {/* Kioscos y Tablets Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-12">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2">
                <h3 className="text-2xl font-bold text-secondary mb-4">
                  Estaciones de Firma en Kioscos y Tablets
                </h3>
                <p className="text-gray-700 mb-4">
                  Nuestro servicio de kioscos y tablets ofrece una solución completa para empresas que necesitan capturar firmas electrónicas en sitio, ideal para:
                </p>
                <ul className="list-disc pl-5 text-gray-700 space-y-3 mb-6">
                  <li><span className="font-medium">Sitios mineros y operaciones remotas</span>: Instalamos estaciones de firma en faenas mineras y operaciones industriales en cualquier parte de Chile.</li>
                  <li><span className="font-medium">Oficinas corporativas</span>: Implemente kioscos de firma en sus instalaciones para visitantes y colaboradores.</li>
                  <li><span className="font-medium">Eventos y ferias comerciales</span>: Dispositivos portátiles para capturar firmas durante eventos especiales.</li>
                  <li><span className="font-medium">Operaciones multiubicación</span>: Mantenga consistencia en la firma de documentos a través de múltiples ubicaciones.</li>
                </ul>
                <h4 className="font-bold text-lg mb-2">Tarifas y planes:</h4>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="font-medium text-primary mb-2">Cuota de implementación inicial:</p>
                  <p className="mb-3">Incluye configuración personalizada de sus documentos, integración con su sistema de gestión documental para auditoría, y capacitación del personal.</p>
                  <div className="mb-4 border-b pb-3">
                    <div className="flex justify-between mb-1">
                      <span>1-5 dispositivos</span>
                      <span>$350.000 + IVA</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>6-20 dispositivos</span>
                      <span>$650.000 + IVA</span>
                    </div>
                    <div className="flex justify-between">
                      <span>21+ dispositivos</span>
                      <span>Consultar</span>
                    </div>
                  </div>
                  
                  <p className="font-medium text-primary mb-2">Suscripción mensual por dispositivo:</p>
                  <div className="flex justify-between mb-1">
                    <span>1-5 dispositivos</span>
                    <span>$29.990 + IVA / mes</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>6-20 dispositivos</span>
                    <span>$24.990 + IVA / mes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>21+ dispositivos</span>
                    <span>Consultar por precios corporativos</span>
                  </div>
                </div>
                <Button className="w-full md:w-auto">Consultar por este servicio</Button>
              </div>
              <div className="md:w-1/2">
                <div className="rounded-lg bg-gray-100 p-6 h-full flex flex-col justify-center">
                  <h4 className="font-bold text-xl mb-4">Todo incluido en el servicio:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Hardware: Tablet o kiosco según sus necesidades</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Software: Aplicación NotaryPro con su marca personalizada</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Conexión: Configuración de conectividad 4G o WiFi</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Instalación: Configuración y puesta en marcha</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Registro único: Cada documento recibe un número único para verificación posterior</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Gestor documental: Sistema integrado para auditoría y almacenamiento seguro</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Soporte: Mantenimiento y atención técnica 24/7</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Capacitación: Formación para su personal</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* NotaryPro Vecino Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-12">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2">
                <h3 className="text-2xl font-bold text-secondary mb-4">
                  Programa NotaryPro Vecino
                </h3>
                <p className="text-gray-700 mb-4">
                  Convierta su negocio local en un punto autorizado para servicios de certificación documental. Nuestro programa NotaryPro Vecino permite a almacenes, locutorios, centros de internet y otros comercios de barrio ofrecer servicios de firma digital y legalización de documentos.
                </p>
                <h4 className="font-bold text-lg mb-2">Beneficios para su negocio:</h4>
                <ul className="list-disc pl-5 text-gray-700 space-y-2 mb-6">
                  <li>Ingresos adicionales por cada documento procesado</li>
                  <li>Aumento del flujo de clientes a su local</li>
                  <li>Sin inversión inicial - solo una pequeña cuota mensual</li>
                  <li>Formación completa y soporte continuo</li>
                  <li>Diferenciación frente a la competencia</li>
                </ul>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-bold text-lg mb-2">Modalidad de servicio:</h4>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Cuota mensual</span>
                    <span className="font-medium">$19.990 + IVA</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Comisión por documento</span>
                    <span className="font-medium">20% del valor</span>
                  </div>
                  <p className="text-sm mt-2">*El cliente paga directamente en su terminal POS. NotaryPro retiene su comisión y liquida el pago semanalmente.</p>
                </div>
                <Button className="w-full md:w-auto">Unirse al programa NotaryPro Vecino</Button>
              </div>
              <div className="md:w-1/2">
                <div className="rounded-lg bg-gray-100 p-6 h-full flex flex-col justify-center">
                  <h4 className="font-bold text-xl mb-4">Incluye en su local:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Tablet con aplicación NotaryPro preinstalada</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Terminal POS para pagos con tarjeta</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Señalética y materiales promocionales</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Capacitación para uso del sistema</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Sistema de registro único para cada documento</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Liquidación semanal de comisiones</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Soporte técnico telefónico prioritario</span>
                    </li>
                  </ul>
                </div>
              </div>
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
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-bold text-secondary mb-2">
                ¿Cómo funciona el servicio de tablets y kioscos para firmas?
              </h3>
              <p className="text-gray-600">
                Nuestro servicio incluye todo lo necesario: dispositivos, software personalizado, instalación y mantenimiento. Instalamos tablets o kioscos en sus instalaciones con nuestra aplicación preconfigurada, proporcionamos capacitación a su personal y ofrecemos soporte continuo. El servicio se contrata mediante suscripción mensual con una cuota inicial de implementación para la configuración de sus documentos, y los documentos firmados se almacenan automáticamente en nuestro gestor documental para auditoría.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-bold text-secondary mb-2">
                ¿Cómo verifico la autenticidad de un documento firmado con NotaryPro?
              </h3>
              <p className="text-gray-600">
                Cada documento procesado a través de nuestra plataforma recibe un número de registro único que se incorpora al documento firmado. Este identificador puede utilizarse en nuestro portal de verificación para comprobar la autenticidad del documento, fecha y hora de firma, identidad de los firmantes y cualquier otra información relevante. Este sistema de verificación cumple con los requisitos de trazabilidad y no repudio establecidos en la Ley 19.799.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-bold text-secondary mb-2">
                ¿Qué es el programa NotaryPro Vecino?
              </h3>
              <p className="text-gray-600">
                Es nuestro programa para comercios y negocios locales que desean ofrecer servicios de certificación de documentos. Proporcionamos una tablet con nuestra aplicación y un terminal POS para pagos. Los clientes pueden acudir a estos locales para firmar y legalizar documentos, pagando directamente en el comercio. El propietario del negocio recibe una comisión por cada documento procesado, generando un ingreso adicional mientras ofrece un servicio valioso a su comunidad.
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