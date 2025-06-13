import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Building, 
  Users, 
  Briefcase, 
  DollarSign, 
  HandHelping, 
  Award, 
  BookOpen, 
  ShieldCheck, 
  MapPin,
  Phone, 
  Mail, 
  FileCheck,
  Clock,
  CheckCircle,
  Store
} from 'lucide-react';
import notaryProLogo from '../../assets/notary-pro-logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function PartnersPublicPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setLocation('/partners/registration-form?email=' + encodeURIComponent(email));
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img 
              src={notaryProLogo} 
              alt="NotaryPro Logo" 
              className="h-10" 
            />
            <span className="font-bold text-xl text-[#EC1C24]">Vecinos Express</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#beneficios" className="text-gray-700 hover:text-[#EC1C24] transition-colors">Beneficios</a>
            <a href="#como-funciona" className="text-gray-700 hover:text-[#EC1C24] transition-colors">Cómo funciona</a>
            <a href="#testimonios" className="text-gray-700 hover:text-[#EC1C24] transition-colors">Testimonios</a>
            <a href="#preguntas" className="text-gray-700 hover:text-[#EC1C24] transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost"
              className="text-gray-700 hover:text-[#EC1C24]"
              onClick={() => setLocation("/partners/partner-login")}
            >
              Iniciar sesión
            </Button>
            <Button 
              className="bg-[#EC1C24] hover:bg-[#d91920] text-white"
              onClick={() => setLocation("/partners/registration-form")}
            >
              Registrarse
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#EC1C24] to-[#e43d42] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-pattern-grid"></div>
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Vecinos NotaryPro Express
              </h1>
              <p className="text-xl md:text-2xl mb-6 font-light">
                Transforme su negocio local en un punto de servicio documental y obtenga ingresos adicionales
              </p>
              <p className="mb-8 text-white/90">
                Únase a nuestra red de tiendas asociadas y ofrezca servicios documentales certificados a sus clientes. Gane comisiones por cada documento procesado.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => setLocation("/partners/registration-form")}
                  className="bg-white text-[#EC1C24] hover:bg-white/90 px-6 py-3 text-lg"
                >
                  Unirse al programa
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10 px-6 py-3 text-lg"
                  onClick={() => setLocation("/partners/partner-login")}
                >
                  Iniciar sesión
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-white rounded-lg blur opacity-30"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8">
                  <div className="flex items-center mb-6">
                    <Building className="h-8 w-8 mr-3" />
                    <h3 className="text-xl font-bold">¿Tiene un negocio local?</h3>
                  </div>
                  <p className="mb-6">
                    Regístrese hoy y comience a ofrecer servicios documentales certificados. Sin costos iniciales.
                  </p>
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <Input 
                      type="email"
                      placeholder="Su correo electrónico"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)} 
                    />
                    <Button type="submit" className="w-full bg-white text-[#EC1C24] hover:bg-white/90">
                      Comenzar registro
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex justify-center">
              <img src={notaryProLogo} alt="NotaryPro Logo" className="h-12 mb-4" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Beneficios del programa</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Convierta su negocio en un punto de servicio oficial y obtenga ventajas exclusivas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-t-4 border-t-[#EC1C24] shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <DollarSign className="h-12 w-12 text-[#EC1C24] mb-2" />
                <CardTitle className="text-xl">Ingresos adicionales</CardTitle>
                <CardDescription>
                  Reciba comisiones por cada documento procesado en su establecimiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-gray-700">
                    <span className="font-bold text-[#EC1C24]">15%</span> de comisión sobre cada trámite.
                    <br />
                    Pagos mensuales automáticos a su cuenta bancaria.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-[#EC1C24] shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Store className="h-12 w-12 text-[#EC1C24] mb-2" />
                <CardTitle className="text-xl">Aumente su negocio</CardTitle>
                <CardDescription>
                  Atraiga nuevos clientes a su tienda ofreciendo servicios adicionales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-gray-700">
                    Los clientes que buscan servicios documentales también consumirán 
                    sus productos habituales, aumentando sus ventas diarias.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-[#EC1C24] shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <HandHelping className="h-12 w-12 text-[#EC1C24] mb-2" />
                <CardTitle className="text-xl">Todo incluido</CardTitle>
                <CardDescription>
                  Sin costos iniciales. Le proporcionamos todo lo necesario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-gray-700">
                    Capacitación gratuita, soporte técnico y equipamiento incluido.
                    <br />
                    Tablet con la aplicación NotaryPro Express preinstalada.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="como-funciona" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex justify-center">
              <img src={notaryProLogo} alt="NotaryPro Logo" className="h-12 mb-4" />
            </div>
            <h2 className="text-3xl font-bold mb-4">¿Cómo funciona?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Un proceso simple diseñado para integrarse fácilmente con su negocio local
            </p>
          </div>

          <div className="relative">
            {/* Connector Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-red-100 -translate-x-1/2 hidden md:block"></div>
            
            <div className="space-y-16 relative">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 order-1 md:order-1 md:text-right bg-white p-6 rounded-lg shadow-sm md:shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold mb-3 text-[#333333]">1. Regístrese en el programa</h3>
                  <p className="text-gray-700">
                    Complete el formulario online con los datos de su negocio.
                    Nuestro equipo revisará su solicitud y se pondrá en contacto 
                    con usted en un plazo de 24-48 horas.
                  </p>
                </div>
                <div className="md:w-24 relative z-10 order-0 md:order-2">
                  <div className="w-16 h-16 rounded-full bg-[#EC1C24] text-white flex items-center justify-center mx-auto shadow-lg">
                    <FileCheck className="h-8 w-8" />
                  </div>
                </div>
                <div className="md:w-1/2 order-2 md:order-3 md:hidden">
                  {/* Empty div for mobile layout */}
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 order-1 md:order-1 md:hidden">
                  {/* Empty div for mobile layout */}
                </div>
                <div className="md:w-24 relative z-10 order-0 md:order-2">
                  <div className="w-16 h-16 rounded-full bg-[#EC1C24] text-white flex items-center justify-center mx-auto shadow-lg">
                    <BookOpen className="h-8 w-8" />
                  </div>
                </div>
                <div className="md:w-1/2 order-2 md:order-3 bg-white p-6 rounded-lg shadow-sm md:shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold mb-3 text-[#333333]">2. Reciba capacitación completa</h3>
                  <p className="text-gray-700">
                    Le proporcionamos capacitación personalizada y una tablet 
                    con nuestra aplicación NotaryPro Express preinstalada para
                    procesar documentos de forma rápida y sencilla.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 order-1 md:order-1 md:text-right bg-white p-6 rounded-lg shadow-sm md:shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold mb-3 text-[#333333]">3. Comience a procesar documentos</h3>
                  <p className="text-gray-700">
                    Atienda a clientes que necesiten servicios documentales, 
                    registre sus datos y documentos en la aplicación. El proceso
                    toma solo minutos y no requiere conocimientos técnicos.
                  </p>
                </div>
                <div className="md:w-24 relative z-10 order-0 md:order-2">
                  <div className="w-16 h-16 rounded-full bg-[#EC1C24] text-white flex items-center justify-center mx-auto shadow-lg">
                    <Store className="h-8 w-8" />
                  </div>
                </div>
                <div className="md:w-1/2 order-2 md:order-3 md:hidden">
                  {/* Empty div for mobile layout */}
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 order-1 md:order-1 md:hidden">
                  {/* Empty div for mobile layout */}
                </div>
                <div className="md:w-24 relative z-10 order-0 md:order-2">
                  <div className="w-16 h-16 rounded-full bg-[#EC1C24] text-white flex items-center justify-center mx-auto shadow-lg">
                    <DollarSign className="h-8 w-8" />
                  </div>
                </div>
                <div className="md:w-1/2 order-2 md:order-3 bg-white p-6 rounded-lg shadow-sm md:shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold mb-3 text-[#333333]">4. Reciba sus comisiones</h3>
                  <p className="text-gray-700">
                    Las comisiones se calculan automáticamente (15% del valor de cada documento) 
                    y se transfieren a su cuenta bancaria cada mes. Acceda a su 
                    panel de control para ver sus estadísticas y ganancias en tiempo real.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Button 
              onClick={() => setLocation("/partners/registration-form")}
              className="bg-[#EC1C24] hover:bg-[#d91920] text-white px-8 py-3 text-lg"
            >
              Comenzar el proceso de registro
            </Button>
          </div>
        </div>
      </section>

      {/* Partner Testimonials */}
      <section id="testimonios" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex justify-center">
              <img src={notaryProLogo} alt="NotaryPro Logo" className="h-12 mb-4" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Lo que dicen nuestros socios</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comercios que ya son parte del programa Vecinos NotaryPro Express
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-2 bg-[#EC1C24]"></div>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mb-4 flex items-center justify-center">
                    <Store className="h-8 w-8 text-[#EC1C24]" />
                  </div>
                  <div className="bg-gray-50 p-5 rounded-lg mb-4 relative">
                    <div className="absolute top-0 left-5 transform -translate-y-1/2 rotate-45 w-4 h-4 bg-gray-50"></div>
                    <p className="text-gray-700 italic">
                      "Ha sido un excelente complemento para mi minimarket. No solo genera 
                      ingresos adicionales, sino que atrae más clientes a mi negocio."
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#333333]">Pedro Ramírez</h4>
                    <p className="text-sm text-gray-500">Minimarket Don Pedro, Santiago</p>
                    <div className="flex justify-center mt-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <CheckCircle key={i} className="h-4 w-4 text-[#EC1C24] mr-1" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-2 bg-[#EC1C24]"></div>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mb-4 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-[#EC1C24]" />
                  </div>
                  <div className="bg-gray-50 p-5 rounded-lg mb-4 relative">
                    <div className="absolute top-0 left-5 transform -translate-y-1/2 rotate-45 w-4 h-4 bg-gray-50"></div>
                    <p className="text-gray-700 italic">
                      "La aplicación es muy fácil de usar y el soporte del equipo 
                      técnico es excelente. Mis clientes valoran el nuevo servicio."
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#333333]">María González</h4>
                    <p className="text-sm text-gray-500">Librería Educativa, Valparaíso</p>
                    <div className="flex justify-center mt-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <CheckCircle key={i} className="h-4 w-4 text-[#EC1C24] mr-1" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-2 bg-[#EC1C24]"></div>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mb-4 flex items-center justify-center">
                    <Briefcase className="h-8 w-8 text-[#EC1C24]" />
                  </div>
                  <div className="bg-gray-50 p-5 rounded-lg mb-4 relative">
                    <div className="absolute top-0 left-5 transform -translate-y-1/2 rotate-45 w-4 h-4 bg-gray-50"></div>
                    <p className="text-gray-700 italic">
                      "Estaba buscando formas de diversificar mi negocio. Este programa 
                      fue la solución perfecta. Recomiendo 100% participar."
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#333333]">Juan Morales</h4>
                    <p className="text-sm text-gray-500">Bazar Central, Concepción</p>
                    <div className="flex justify-center mt-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <CheckCircle key={i} className="h-4 w-4 text-[#EC1C24] mr-1" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="preguntas" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex justify-center">
              <img src={notaryProLogo} alt="NotaryPro Logo" className="h-12 mb-4" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Preguntas frecuentes</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Respondemos las dudas más comunes sobre el programa Vecinos NotaryPro Express
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
            <Accordion type="single" collapsible className="border-none">
              <AccordionItem value="item-1" className="border-b border-gray-200 py-4">
                <AccordionTrigger className="hover:text-[#EC1C24] font-medium text-lg">
                  ¿Qué tipos de negocios pueden participar?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pt-2">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    Cualquier negocio con atención al público puede participar: minimarkets, 
                    librerías, bazares, farmacias, centros de fotocopiado, y similares. 
                    El requisito principal es contar con un espacio adecuado para atender 
                    a los clientes y conexión a internet.
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className="border-b border-gray-200 py-4">
                <AccordionTrigger className="hover:text-[#EC1C24] font-medium text-lg">
                  ¿Qué documentos puedo procesar como punto de servicio?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pt-2">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    Podrá procesar diversos tipos de documentos: declaraciones juradas, 
                    poderes simples, certificados, contratos, finiquitos, entre otros. 
                    Todos estos documentos serán verificados y certificados por nuestro 
                    equipo de profesionales.
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="border-b border-gray-200 py-4">
                <AccordionTrigger className="hover:text-[#EC1C24] font-medium text-lg">
                  ¿Cómo se calculan y pagan las comisiones?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pt-2">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    Usted recibe una comisión del 15% del valor de cada documento procesado 
                    en su establecimiento. Las comisiones se acumulan automáticamente en su 
                    cuenta de partner y se transfieren a su cuenta bancaria mensualmente.
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4" className="border-b border-gray-200 py-4">
                <AccordionTrigger className="hover:text-[#EC1C24] font-medium text-lg">
                  ¿Necesito conocimientos legales para participar?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pt-2">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    No, no necesita conocimientos legales previos. Nosotros le proporcionamos 
                    toda la capacitación necesaria y nuestra aplicación está diseñada para ser 
                    muy intuitiva y fácil de usar. Además, nuestro equipo de certificadores se 
                    encarga de la validación legal de los documentos.
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5" className="py-4">
                <AccordionTrigger className="hover:text-[#EC1C24] font-medium text-lg">
                  ¿Qué equipamiento necesito?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pt-2">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    Lo ideal es contar con una tablet con sistema Android, pero si no tiene, 
                    podemos proporcionarle una en comodato mientras sea parte del programa. 
                    También es recomendable tener una impresora para los recibos, aunque no 
                    es estrictamente necesario.
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#EC1C24] to-[#d91920] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <img src={notaryProLogo} alt="NotaryPro Logo" className="h-16 mx-auto mb-6 filter brightness-0 invert" />
          <h2 className="text-4xl font-bold mb-6">¿Listo para comenzar?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Únase a nuestra red de puntos de servicio y transforme su negocio en un centro de trámites documentales certificados
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setLocation("/partners/registration-form")}
              className="bg-white text-[#EC1C24] hover:bg-white/90 px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              Registrar mi negocio
            </Button>
            <Button 
              onClick={() => setLocation("/partners/partner-login")}
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg"
            >
              Iniciar sesión
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10">
            <div className="flex items-center mb-6 md:mb-0">
              <img src={notaryProLogo} alt="NotaryPro Logo" className="h-10 mr-3 filter brightness-0 invert" />
              <div>
                <h3 className="text-xl font-bold">Vecinos NotaryPro Express</h3>
                <p className="text-gray-400 text-sm">Transformando negocios locales</p>
              </div>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#EC1C24] transition-colors">
                <Mail className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#EC1C24] transition-colors">
                <Phone className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#EC1C24] transition-colors">
                <MapPin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8 border-t border-gray-800">
            <div>
              <h3 className="text-lg font-bold mb-4">Sobre NotaryPro</h3>
              <p className="text-gray-400">
                Programa de puntos de servicio para trámites documentales certificados. 
                Expandiendo el acceso a servicios legales en todo Chile.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Contacto</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-[#EC1C24]" />
                  <span>Av. Principal 123, Santiago</span>
                </li>
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-[#EC1C24]" />
                  <span>+56 2 2123 4567</span>
                </li>
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-[#EC1C24]" />
                  <span>partners@cerfidoc.cl</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Enlaces</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#beneficios" className="hover:text-white hover:ml-1 transition-all flex items-center">
                    <span className="text-[#EC1C24] mr-2">→</span> Beneficios
                  </a>
                </li>
                <li>
                  <a href="#como-funciona" className="hover:text-white hover:ml-1 transition-all flex items-center">
                    <span className="text-[#EC1C24] mr-2">→</span> Cómo funciona
                  </a>
                </li>
                <li>
                  <a href="#testimonios" className="hover:text-white hover:ml-1 transition-all flex items-center">
                    <span className="text-[#EC1C24] mr-2">→</span> Testimonios
                  </a>
                </li>
                <li>
                  <a href="#preguntas" className="hover:text-white hover:ml-1 transition-all flex items-center">
                    <span className="text-[#EC1C24] mr-2">→</span> Preguntas frecuentes
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Reciba actualizaciones</h3>
              <p className="text-gray-400 mb-4">
                Suscríbase para recibir las últimas novedades sobre nuestro programa
              </p>
              <form className="flex">
                <Input 
                  type="email"
                  placeholder="Su correo electrónico"
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-r-none"
                />
                <Button type="submit" className="bg-[#EC1C24] hover:bg-[#d91920] rounded-l-none">
                  Enviar
                </Button>
              </form>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p>&copy; {new Date().getFullYear()} CerfiDoc NotaryPro. Todos los derechos reservados.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white">Términos y condiciones</a>
                <a href="#" className="text-gray-400 hover:text-white">Política de privacidad</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}