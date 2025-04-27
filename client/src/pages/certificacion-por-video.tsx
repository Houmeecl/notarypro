import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Shield, 
  Clock, 
  FileCheck, 
  Video, 
  Globe, 
  LucideMonitor, 
  UserCheck, 
  CalendarClock,
  Info,
  FileQuestion,
  Play
} from "lucide-react";
import { ExplanatoryVideo } from "@/components/ui/explanatory-video";

export default function CertificacionPorVideo() {
  const [selectedTab, setSelectedTab] = useState("individual");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center text-primary hover:underline mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Link>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/95 to-primary rounded-lg shadow-lg p-8 md:p-12 mb-12 text-white">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Certificación Remota por Video (RON)
            </h1>
            <p className="text-lg text-white/90 mb-6">
              Realice trámites notariales desde cualquier lugar mediante videoconferencia con nuestros certificadores profesionales. Solución 100% digital, validada por la Ley 19.799 de Chile.
            </p>
            <Button className="bg-white text-primary hover:bg-white/90">
              Agendar una sesión
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-12">
            <h2 className="text-2xl font-bold text-center mb-6">¿Qué es RON?</h2>
            
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2">
                <p className="text-gray-700 mb-4">
                  <span className="font-semibold">RON (Remote Online Notarization)</span>, o Certificación Remota Online, es un sistema de certificación digital que permite validar documentos a distancia mediante una sesión de video en vivo con un certificador profesional autorizado.
                </p>
                <p className="text-gray-700 mb-4">
                  Este innovador sistema, adaptado a la legislación chilena bajo la Ley 19.799, permite a las personas realizar trámites notariales sin necesidad de presentarse físicamente, ahorrando tiempo y facilitando procesos desde cualquier ubicación.
                </p>
                <div className="flex items-center space-x-2 text-primary font-medium mb-4">
                  <Globe className="h-5 w-5" />
                  <span>Sistema reconocido internacionalmente</span>
                </div>
                <div className="flex items-center space-x-2 text-primary font-medium">
                  <Shield className="h-5 w-5" />
                  <span>Cumple con la normativa chilena</span>
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-md">
                  <ExplanatoryVideo
                    title="¿Qué es la Certificación Remota por Video (RON)?"
                    description="Conoce cómo la certificación remota por video está respaldada por la Ley 19.799 en Chile, otorgando validez legal a las firmas electrónicas y documentos certificados a distancia."
                    videoType="explanation"
                    triggerLabel="Ver explicación"
                  >
                    <div className="w-full h-full flex items-center justify-center cursor-pointer relative group">
                      <img 
                        src="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                        alt="Mujer en videoconferencia"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                        <div className="bg-primary/90 text-white rounded-full p-3">
                          <Play className="h-8 w-8" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-primary/90 text-white text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        <span>Validez Legal</span>
                      </div>
                    </div>
                  </ExplanatoryVideo>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">¿Cómo Funciona?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border border-gray-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarClock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">1. Agenda tu sesión</h3>
                  <p className="text-sm text-gray-600">
                    Programa una cita con uno de nuestros certificadores autorizados según tu disponibilidad horaria.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LucideMonitor className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">2. Conéctate por video</h3>
                  <p className="text-sm text-gray-600">
                    Únete a la sesión de video mediante nuestro sistema seguro. Solo necesitas un dispositivo con cámara e internet.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileCheck className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">3. Completa tu trámite</h3>
                  <p className="text-sm text-gray-600">
                    El certificador verificará tu identidad, revisará tus documentos y añadirá la certificación oficial con validez legal.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-bold mb-2">Requisitos técnicos:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Computador o dispositivo móvil con cámara</span>
                </div>
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Navegador web actualizado (Chrome, Safari, Firefox)</span>
                </div>
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Conexión a internet estable (mínimo 5 Mbps)</span>
                </div>
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Cédula de identidad o pasaporte vigente</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
              <ExplanatoryVideo
                title="Proceso de Certificación por Video - Paso a Paso"
                description="En este video detallamos cada etapa del proceso de certificación remota: desde la verificación de identidad, validación de documentos hasta la firma electrónica avanzada. Todos los pasos cumplen con la Ley 19.799 de Chile, garantizando la validez legal de los documentos certificados."
                videoType="tutorial"
                triggerLabel="Ver proceso completo"
              >
                <Button className="flex items-center gap-2">
                  Ver demostración
                  <FileQuestion className="h-4 w-4" />
                </Button>
              </ExplanatoryVideo>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <h2 className="text-2xl font-bold text-center mb-6">Nuestros Servicios RON</h2>
            
            <Tabs defaultValue="individual" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="individual">Para Individuos</TabsTrigger>
                <TabsTrigger value="business">Para Empresas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="individual" className="space-y-6">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-bold mb-2 flex items-center">
                      <FileCheck className="h-5 w-5 text-primary mr-2" />
                      Certificaciones de firmas
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Certificación de tu firma en documentos personales, contratos, acuerdos o poderes simples.
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>Desde $9.990 por documento</span>
                      <Button size="sm" variant="outline">Agendar</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-bold mb-2 flex items-center">
                      <UserCheck className="h-5 w-5 text-primary mr-2" />
                      Declaraciones juradas
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Certificación de declaraciones juradas para trámites personales, institucionales o empresariales.
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>Desde $12.990 por documento</span>
                      <Button size="sm" variant="outline">Agendar</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-bold mb-2 flex items-center">
                      <Shield className="h-5 w-5 text-primary mr-2" />
                      Poderes simples
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Certificación de poderes simples para representación en trámites específicos.
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>Desde $14.990 por documento</span>
                      <Button size="sm" variant="outline">Agendar</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="business" className="space-y-6">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-bold mb-2 flex items-center">
                      <FileCheck className="h-5 w-5 text-primary mr-2" />
                      Certificación corporativa
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Certificación de firmas para contratos comerciales, actas de directorio o documentos empresariales.
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>Desde $19.990 por documento</span>
                      <Button size="sm" variant="outline">Agendar</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-bold mb-2 flex items-center">
                      <UserCheck className="h-5 w-5 text-primary mr-2" />
                      Certificación masiva
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Servicio para empresas que requieren certificación de múltiples documentos o firmas de forma recurrente.
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>Planes personalizados</span>
                      <Button size="sm" variant="outline">Consultar</Button>
                    </div>
                  </div>
                  
                  <div className="border border-primary rounded-lg p-4 bg-primary/5">
                    <h3 className="font-bold mb-2 flex items-center">
                      <Globe className="h-5 w-5 text-primary mr-2" />
                      RON Internacional
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Servicio de certificación para empresas con operaciones internacionales, compatible con jurisdicciones extranjeras.
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>Desde $29.990 por documento</span>
                      <Button size="sm" variant="outline">Consultar</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Benefits Section */}
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Ventajas de la Certificación Remota (RON)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Ahorra tiempo</h3>
                <p className="text-gray-600 text-sm">
                  Realiza trámites notariales sin salir de casa o la oficina. Sin filas ni desplazamientos.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Acceso global</h3>
                <p className="text-gray-600 text-sm">
                  Realiza certificaciones desde cualquier parte del mundo, 24/7, con validez legal en Chile.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Máxima seguridad</h3>
                <p className="text-gray-600 text-sm">
                  Verificación biométrica, grabación de la sesión y cifrado de extremo a extremo para proteger tus datos.
                </p>
              </div>
            </div>
          </div>
          
          {/* FAQ Section */}
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Preguntas frecuentes sobre RON
          </h2>
          
          <div className="space-y-4 mb-12">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-bold text-lg mb-2">
                ¿Es legalmente válida la certificación por video en Chile?
              </h3>
              <p className="text-gray-600">
                Sí, la certificación remota por video (RON) está respaldada por la Ley 19.799 sobre Documentos Electrónicos y Firma Electrónica en Chile. Nuestros certificadores están oficialmente autorizados para realizar estas certificaciones con plena validez legal.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-bold text-lg mb-2">
                ¿Qué documentos puedo certificar mediante RON?
              </h3>
              <p className="text-gray-600">
                Puedes certificar una amplia variedad de documentos, incluyendo contratos comerciales, acuerdos, poderes simples, declaraciones juradas, y certificaciones de firma. Sin embargo, algunos documentos como testamentos, escrituras públicas o ciertos trámites inmobiliarios aún requieren presencia física por ley.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-bold text-lg mb-2">
                ¿Cómo se garantiza la seguridad y validez del proceso?
              </h3>
              <p className="text-gray-600">
                Implementamos múltiples capas de seguridad: verificación de identidad mediante documentos oficiales, autenticación biométrica, grabación encriptada de la sesión completa, sellos de tiempo certificados, y asignación de un número de registro único para cada documento. Todo el proceso cumple con estándares internacionales de seguridad.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-bold text-lg mb-2">
                ¿Cuánto tiempo dura una sesión de RON?
              </h3>
              <p className="text-gray-600">
                La mayoría de las sesiones de certificación remota duran entre 15 y 30 minutos, dependiendo del tipo de documento y complejidad del trámite. Te recomendamos reservar 45 minutos para tu primera sesión para asegurar que haya tiempo suficiente para resolver cualquier consulta.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-bold text-lg mb-2">
                ¿Los documentos certificados mediante RON son aceptados por instituciones chilenas?
              </h3>
              <p className="text-gray-600">
                Sí, los documentos certificados mediante nuestro sistema RON son aceptados por instituciones públicas y privadas en Chile, incluyendo bancos, instituciones educativas, y entidades gubernamentales, ya que cumplen con todos los requisitos legales establecidos en la legislación chilena.
              </p>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="bg-secondary/5 rounded-lg p-8 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">
              Experimenta la certificación del futuro
            </h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Únete a miles de chilenos que ya utilizan nuestro sistema de certificación remota para realizar trámites desde la comodidad de su hogar u oficina. Rápido, seguro y con plena validez legal.
            </p>
            <Button className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 h-auto">
              Agendar sesión RON
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}