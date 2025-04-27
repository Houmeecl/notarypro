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
  CheckCircle
} from 'lucide-react';
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
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Beneficios del programa</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Convierta su negocio en un punto de servicio oficial y aproveche estas ventajas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <DollarSign className="h-10 w-10 text-[#EC1C24] mb-2" />
                <CardTitle>Ingresos adicionales</CardTitle>
                <CardDescription>
                  Reciba comisiones por cada documento procesado en su establecimiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Ganancia del 15% del valor de cada documento procesado. 
                  Pagos mensuales automáticos a su cuenta bancaria.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-[#EC1C24] mb-2" />
                <CardTitle>Más clientes</CardTitle>
                <CardDescription>
                  Atraiga nuevos clientes a su negocio ofreciendo servicios adicionales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Las personas que buscan servicios documentales también consumirán 
                  sus productos habituales, aumentando sus ventas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <HandHelping className="h-10 w-10 text-[#EC1C24] mb-2" />
                <CardTitle>Sin inversión inicial</CardTitle>
                <CardDescription>
                  Comience sin costos. Le proporcionamos todo lo necesario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Reciba capacitación gratuita, soporte técnico y el material 
                  necesario para operar como punto de servicio.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">¿Cómo funciona?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              El proceso es simple y está diseñado para integrarse fácilmente con su negocio actual
            </p>
          </div>

          <div className="relative">
            {/* Connector Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-200 -translate-x-1/2 hidden md:block"></div>
            
            <div className="space-y-12 relative">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 order-1 md:order-1 md:text-right">
                  <h3 className="text-xl font-bold mb-2">Regístrese en el programa</h3>
                  <p className="text-gray-600">
                    Complete el formulario de registro con los datos de su negocio.
                    Nuestro equipo revisará su solicitud y se pondrá en contacto con usted.
                  </p>
                </div>
                <div className="md:w-24 relative z-10 order-0 md:order-2">
                  <div className="w-12 h-12 rounded-full bg-[#EC1C24] text-white flex items-center justify-center mx-auto">
                    <span className="font-bold">1</span>
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
                  <div className="w-12 h-12 rounded-full bg-[#EC1C24] text-white flex items-center justify-center mx-auto">
                    <span className="font-bold">2</span>
                  </div>
                </div>
                <div className="md:w-1/2 order-2 md:order-3">
                  <h3 className="text-xl font-bold mb-2">Reciba capacitación y equipamiento</h3>
                  <p className="text-gray-600">
                    Le proporcionamos toda la capacitación necesaria y una tablet 
                    con nuestra aplicación para procesar documentos.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 order-1 md:order-1 md:text-right">
                  <h3 className="text-xl font-bold mb-2">Comience a procesar documentos</h3>
                  <p className="text-gray-600">
                    Atienda a clientes que necesiten servicios documentales, 
                    registre sus datos y documentos en la aplicación.
                  </p>
                </div>
                <div className="md:w-24 relative z-10 order-0 md:order-2">
                  <div className="w-12 h-12 rounded-full bg-[#EC1C24] text-white flex items-center justify-center mx-auto">
                    <span className="font-bold">3</span>
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
                  <div className="w-12 h-12 rounded-full bg-[#EC1C24] text-white flex items-center justify-center mx-auto">
                    <span className="font-bold">4</span>
                  </div>
                </div>
                <div className="md:w-1/2 order-2 md:order-3">
                  <h3 className="text-xl font-bold mb-2">Reciba sus comisiones</h3>
                  <p className="text-gray-600">
                    Las comisiones se calculan automáticamente y se transfieren 
                    a su cuenta bancaria cada mes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Lo que dicen nuestros socios</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comercios que ya son parte del programa Vecinos NotaryPro Express
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                  <p className="text-gray-700 mb-4 italic">
                    "Ha sido un excelente complemento para mi minimarket. No solo genera 
                    ingresos adicionales, sino que atrae más clientes."
                  </p>
                  <div>
                    <h4 className="font-semibold">Pedro Ramírez</h4>
                    <p className="text-sm text-gray-500">Minimarket Don Pedro, Santiago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                  <p className="text-gray-700 mb-4 italic">
                    "La aplicación es muy fácil de usar y el soporte del equipo 
                    técnico es excelente. Mis clientes valoran el servicio."
                  </p>
                  <div>
                    <h4 className="font-semibold">María González</h4>
                    <p className="text-sm text-gray-500">Librería Educativa, Valparaíso</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                  <p className="text-gray-700 mb-4 italic">
                    "Estaba buscando formas de diversificar mi negocio. Este programa 
                    fue la solución perfecta. Recomiendo 100%."
                  </p>
                  <div>
                    <h4 className="font-semibold">Juan Morales</h4>
                    <p className="text-sm text-gray-500">Bazar Central, Concepción</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Preguntas frecuentes</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Respondemos las dudas más comunes sobre el programa Vecinos NotaryPro Express
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>¿Qué tipos de negocios pueden participar?</AccordionTrigger>
                <AccordionContent>
                  Cualquier negocio con atención al público puede participar: minimarkets, 
                  librerías, bazares, farmacias, centros de fotocopiado, y similares. 
                  El requisito principal es contar con un espacio adecuado para atender 
                  a los clientes y conexión a internet.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>¿Qué documentos puedo procesar como punto de servicio?</AccordionTrigger>
                <AccordionContent>
                  Podrá procesar diversos tipos de documentos: declaraciones juradas, 
                  poderes simples, certificados, contratos, finiquitos, entre otros. 
                  Todos estos documentos serán verificados y certificados por nuestro 
                  equipo de profesionales.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>¿Cómo se calculan y pagan las comisiones?</AccordionTrigger>
                <AccordionContent>
                  Usted recibe una comisión del 15% del valor de cada documento procesado 
                  en su establecimiento. Las comisiones se acumulan automáticamente en su 
                  cuenta de partner y se transfieren a su cuenta bancaria mensualmente.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>¿Necesito conocimientos legales para participar?</AccordionTrigger>
                <AccordionContent>
                  No, no necesita conocimientos legales previos. Nosotros le proporcionamos 
                  toda la capacitación necesaria y nuestra aplicación está diseñada para ser 
                  muy intuitiva y fácil de usar. Además, nuestro equipo de certificadores se 
                  encarga de la validación legal de los documentos.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>¿Qué equipamiento necesito?</AccordionTrigger>
                <AccordionContent>
                  Lo ideal es contar con una tablet con sistema Android, pero si no tiene, 
                  podemos proporcionarle una en comodato mientras sea parte del programa. 
                  También es recomendable tener una impresora para los recibos, aunque no 
                  es estrictamente necesario.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#EC1C24] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar?</h2>
          <p className="text-xl mb-8">
            Únase a nuestra red de puntos de servicio y expanda su negocio hoy mismo
          </p>
          <Button 
            onClick={() => navigate("/partners/registration-form")}
            className="bg-white text-[#EC1C24] hover:bg-white/90 px-8 py-3 text-lg"
          >
            Registrar mi negocio
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Vecinos NotaryPro Express</h3>
              <p className="text-gray-400">
                Programa de puntos de servicio para trámites documentales certificados
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Contacto</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Av. Principal 123, Santiago</span>
                </li>
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>+56 2 2123 4567</span>
                </li>
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>partners@cerfidoc.cl</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Enlaces</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">Sobre nosotros</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">Términos y condiciones</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">Política de privacidad</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Suscríbase</h3>
              <p className="text-gray-400 mb-4">
                Reciba información sobre nuestro programa de partners
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
            <p>&copy; {new Date().getFullYear()} CerfiDoc. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}