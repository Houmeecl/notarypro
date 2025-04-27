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
import { ArrowRight, ArrowLeft, Check, Shield, Clock, FileCheck, UserCheck, Lock } from "lucide-react";

export default function NotarizeOnline() {
  const [selectedTab, setSelectedTab] = useState("individual");

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
              Notarización Digital de Documentos en Chile
            </h1>
            <p className="text-lg text-white/90 mb-6">
              Firme sus documentos en línea y obtenga certificación de un profesional autorizado. Proceso seguro, legal y conforme a la Ley 19.799 de Chile.
            </p>
            <Button className="bg-white text-primary hover:bg-white/90">
              Empezar ahora
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-12">
            <h2 className="text-2xl font-bold text-center mb-6">Elija el tipo de servicio</h2>
            
            <Tabs defaultValue="individual" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="individual">Para Individuos</TabsTrigger>
                <TabsTrigger value="business">Para Empresas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="individual" className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">Notarización para personas naturales</h3>
                  <p className="text-gray-600">
                    Ideal para trámites personales, contratos individuales y documentos familiares
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-2 hover:border-primary transition-colors duration-200">
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <h4 className="text-lg font-bold">Básico</h4>
                        <div className="text-3xl font-bold my-2">$4.990</div>
                        <p className="text-sm text-gray-500">Por documento</p>
                      </div>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>1 documento</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Firma electrónica simple</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Certificado digital</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Validez legal en Chile</span>
                        </li>
                      </ul>
                      <Button className="w-full">Seleccionar</Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-primary shadow-md relative">
                    <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                      Más popular
                    </div>
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <h4 className="text-lg font-bold">Estándar</h4>
                        <div className="text-3xl font-bold my-2">$9.990</div>
                        <p className="text-sm text-gray-500">Por documento</p>
                      </div>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>1 documento</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Firma electrónica avanzada</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Verificación de identidad</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Certificado digital</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Certificación por profesional</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Validez legal en Chile</span>
                        </li>
                      </ul>
                      <Button className="w-full">Seleccionar</Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 hover:border-primary transition-colors duration-200">
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <h4 className="text-lg font-bold">Premium</h4>
                        <div className="text-3xl font-bold my-2">$19.990</div>
                        <p className="text-sm text-gray-500">Hasta 3 documentos</p>
                      </div>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Hasta 3 documentos</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Firma electrónica avanzada</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Verificación de identidad</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Certificado digital</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Certificación prioritaria</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Soporte telefónico</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Validez legal en Chile</span>
                        </li>
                      </ul>
                      <Button className="w-full">Seleccionar</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="business" className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">Notarización para empresas</h3>
                  <p className="text-gray-600">
                    Soluciones para firmas masivas, contratos empresariales y documentación corporativa
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-2 hover:border-primary transition-colors duration-200">
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <h4 className="text-lg font-bold">Empresarial</h4>
                        <div className="text-3xl font-bold my-2">$49.990</div>
                        <p className="text-sm text-gray-500">Hasta 10 documentos/mes</p>
                      </div>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>10 documentos mensuales</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Firma electrónica avanzada</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Plantillas personalizadas</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Verificación de identidad</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Certificación profesional</span>
                        </li>
                      </ul>
                      <Button className="w-full">Seleccionar</Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-primary shadow-md relative">
                    <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                      Más popular
                    </div>
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <h4 className="text-lg font-bold">Empresarial Plus</h4>
                        <div className="text-3xl font-bold my-2">$99.990</div>
                        <p className="text-sm text-gray-500">Hasta 25 documentos/mes</p>
                      </div>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>25 documentos mensuales</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Firma electrónica avanzada</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Plantillas personalizadas</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Verificación de identidad</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Certificación profesional</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>API para integración</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Soporte dedicado</span>
                        </li>
                      </ul>
                      <Button className="w-full">Seleccionar</Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 hover:border-primary transition-colors duration-200">
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <h4 className="text-lg font-bold">Corporativo</h4>
                        <div className="text-3xl font-bold my-2">Personalizado</div>
                        <p className="text-sm text-gray-500">Soluciones a medida</p>
                      </div>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Volumen ilimitado</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Firma electrónica avanzada</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Plantillas personalizadas</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Verificación de identidad</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Integración personalizada</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Gestor de cuenta dedicado</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Acuerdo personalizado</span>
                        </li>
                      </ul>
                      <Button className="w-full">Contactar</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Process Steps */}
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Proceso de Notarización Digital
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center relative">
              <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">1</div>
              <h3 className="text-lg font-bold mb-2">Suba su documento</h3>
              <p className="text-gray-600 text-sm">
                Cargue el documento que necesita notarizar en formato PDF o Word
              </p>
              <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 hidden md:block">
                <ArrowRight className="h-6 w-6 text-gray-300" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center relative">
              <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">2</div>
              <h3 className="text-lg font-bold mb-2">Verifique su identidad</h3>
              <p className="text-gray-600 text-sm">
                Complete el proceso de verificación de identidad con su cédula y una selfie
              </p>
              <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 hidden md:block">
                <ArrowRight className="h-6 w-6 text-gray-300" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center relative">
              <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">3</div>
              <h3 className="text-lg font-bold mb-2">Firme electrónicamente</h3>
              <p className="text-gray-600 text-sm">
                Firme su documento con nuestra herramienta de firma electrónica
              </p>
              <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 hidden md:block">
                <ArrowRight className="h-6 w-6 text-gray-300" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">4</div>
              <h3 className="text-lg font-bold mb-2">Reciba su documento certificado</h3>
              <p className="text-gray-600 text-sm">
                Descargue su documento certificado con validez legal en Chile
              </p>
            </div>
          </div>
          
          {/* Features Section */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">
              Ventajas de nuestra notarización digital
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Rápido y eficiente</h3>
                <p className="text-gray-600 text-sm">
                  Complete todo el proceso en minutos, sin filas ni esperas
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Seguridad garantizada</h3>
                <p className="text-gray-600 text-sm">
                  Encriptación de extremo a extremo y verificación biométrica de identidad
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <FileCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Validez legal</h3>
                <p className="text-gray-600 text-sm">
                  Documentos con plena validez según la Ley 19.799 sobre Documentos Electrónicos
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Profesionales certificados</h3>
                <p className="text-gray-600 text-sm">
                  Nuestros certificadores están oficialmente autorizados para validar documentos
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Verificación de identidad</h3>
                <p className="text-gray-600 text-sm">
                  Sistema avanzado de verificación para prevenir fraudes y suplantaciones
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Número de registro único</h3>
                <p className="text-gray-600 text-sm">
                  Cada documento recibe un número de registro único para verificación posterior
                </p>
              </div>
            </div>
          </div>
          
          {/* FAQ Section */}
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Preguntas frecuentes
          </h2>
          
          <div className="space-y-4 mb-12">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-bold text-lg mb-2">
                ¿Qué documentos puedo notarizar digitalmente?
              </h3>
              <p className="text-gray-600">
                Puede notarizar una amplia variedad de documentos, incluyendo contratos, poderes simples, declaraciones juradas, acuerdos comerciales, y documentos corporativos. Sin embargo, hay algunos documentos que por ley requieren presencia física, como testamentos o escrituras públicas.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-bold text-lg mb-2">
                ¿Tienen validez legal estos documentos en Chile?
              </h3>
              <p className="text-gray-600">
                Sí, los documentos firmados y certificados en nuestra plataforma tienen plena validez legal en Chile según la Ley 19.799 sobre Documentos Electrónicos, Firma Electrónica y Servicios de Certificación. Esta ley establece que las firmas electrónicas avanzadas tienen el mismo valor legal que las firmas manuscritas.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-bold text-lg mb-2">
                ¿Cómo se verifica mi identidad?
              </h3>
              <p className="text-gray-600">
                Utilizamos un proceso de verificación de identidad de dos factores. Primero, deberá subir una foto de su cédula de identidad o pasaporte. Luego, tomará una selfie en tiempo real. Nuestro sistema biométrico comparará ambas imágenes para confirmar que se trata de la misma persona.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-bold text-lg mb-2">
                ¿Cuánto tiempo tarda el proceso?
              </h3>
              <p className="text-gray-600">
                El proceso completo, desde la carga del documento hasta la recepción del documento certificado, suele tomar entre 10 y 30 minutos para planes individuales. Los documentos empresariales pueden requerir verificaciones adicionales que pueden extender este tiempo hasta 2 horas.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-bold text-lg mb-2">
                ¿Cómo puedo verificar la autenticidad de un documento firmado?
              </h3>
              <p className="text-gray-600">
                Cada documento procesado en nuestra plataforma recibe un número de registro único que puede ser verificado en nuestro portal de validación. Cualquier persona puede comprobar la autenticidad del documento utilizando este número de registro.
              </p>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="bg-secondary/5 rounded-lg p-8 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">
              Comience a notarizar sus documentos hoy mismo
            </h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Experimente la forma más rápida y segura de firmar y certificar sus documentos con validez legal en Chile. Nuestro sistema cumple con todos los requisitos de la Ley 19.799.
            </p>
            <Button className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 h-auto">
              Comenzar ahora
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}