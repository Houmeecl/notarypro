import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { ExplanatoryVideo } from "@/components/ui/explanatory-video";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Video, 
  FileText, 
  UserCheck, 
  Share2, 
  Camera, 
  Monitor, 
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Link } from "wouter";

export default function VideoCallSystemExplanation() {
  return (
    <Card className="bg-white shadow-md border-0">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Video className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Sistema de Certificación por Video</CardTitle>
            <CardDescription>
              Herramienta integrada para certificación y redacción de documentos en línea
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="overview">Descripción General</TabsTrigger>
            <TabsTrigger value="features">Funcionalidades</TabsTrigger>
            <TabsTrigger value="demo">Demostración</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="pt-4">
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-gray-100 relative">
                <div className="aspect-video relative">
                  <img 
                    src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                    alt="Interfaz de videollamada" 
                    className="w-full h-full object-cover brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                    <h3 className="text-white font-bold text-xl mb-2">Certificación por Videollamada</h3>
                    <p className="text-white/90 text-sm">
                      Interacción en tiempo real para verificación, firma y redacción conjunta de documentos
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-700">
                El sistema integrado de certificación por video permite realizar la verificación de identidad, 
                redacción colaborativa y certificación de documentos, todo dentro de una misma plataforma.
                Como certificador, usted podrá:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <div className="flex gap-3 items-start border p-3 rounded-lg">
                  <div className="h-7 w-7 bg-primary/10 rounded-full flex-shrink-0 flex items-center justify-center">
                    <Camera className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Verificación por Video</h4>
                    <p className="text-xs text-gray-600">Validar la identidad del usuario en tiempo real mediante videollamada</p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-start border p-3 rounded-lg">
                  <div className="h-7 w-7 bg-primary/10 rounded-full flex-shrink-0 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Redacción Colaborativa</h4>
                    <p className="text-xs text-gray-600">Editar y ajustar documentos junto con el usuario durante la sesión</p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-start border p-3 rounded-lg">
                  <div className="h-7 w-7 bg-primary/10 rounded-full flex-shrink-0 flex items-center justify-center">
                    <Share2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Compartir Pantalla</h4>
                    <p className="text-xs text-gray-600">Mostrar documentos o guiar al usuario durante el proceso</p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-start border p-3 rounded-lg">
                  <div className="h-7 w-7 bg-primary/10 rounded-full flex-shrink-0 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Certificación Digital</h4>
                    <p className="text-xs text-gray-600">Aplicar su firma electrónica avanzada con validez legal</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-primary/5 rounded-lg p-3 border border-primary/10 text-sm">
                <p className="font-medium mb-1">¿Lo sabía?</p>
                <p className="text-gray-700 text-xs">
                  Este sistema pionero en Chile cumple con todos los requerimientos de la Ley 19.799 sobre 
                  documentos electrónicos y firma electrónica, otorgando plena validez legal a los documentos 
                  certificados mediante videollamada.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="features" className="pt-4">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-primary/10">
                  <CardHeader className="pb-2">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                      <Video className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">Videollamada Segura</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-600">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Conexión encriptada de extremo a extremo</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Grabación automática para auditoría</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Control de cámara y micrófono</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border-primary/10">
                  <CardHeader className="pb-2">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                      <UserCheck className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">Verificación de Identidad</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-600">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Validación de documento de identidad</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Verificación facial biométrica</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Comprobación de prueba de vida</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border-primary/10">
                  <CardHeader className="pb-2">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">Redacción Colaborativa</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-600">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Editor de texto en tiempo real</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Plantillas predefinidas por categoría</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Control de versiones de documentos</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h3 className="font-medium mb-2 flex items-center">
                  <Monitor className="h-5 w-5 text-primary mr-2" />
                  Interfaz de la Plataforma
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  La interfaz del sistema ha sido diseñada para facilitar la certificación en línea, 
                  incorporando todas las herramientas necesarias en un solo lugar.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-white p-3 rounded-md border">
                    <h4 className="font-medium mb-1">Panel Principal</h4>
                    <ul className="space-y-1 text-xs text-gray-600">
                      <li>• Transmisión de video del usuario y certificador</li>
                      <li>• Control de sesión y herramientas de comunicación</li>
                      <li>• Visor y editor de documentos</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-3 rounded-md border">
                    <h4 className="font-medium mb-1">Panel Lateral</h4>
                    <ul className="space-y-1 text-xs text-gray-600">
                      <li>• Información del trámite y solicitante</li>
                      <li>• Herramientas de redacción y edición</li>
                      <li>• Acciones de certificación</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="demo" className="pt-4">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border text-center">
                <h3 className="font-medium mb-2">Vea cómo funciona el sistema</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Este video muestra el proceso completo de certificación por videollamada, 
                  incluyendo la redacción colaborativa de documentos.
                </p>
                
                <div className="relative rounded-lg overflow-hidden bg-gray-100">
                  <div className="aspect-video">
                    <ExplanatoryVideo
                      title="Sistema de Certificación por Video y Redacción en Línea"
                      description="Este video explica detalladamente cómo funciona el sistema de certificación por video y redacción en línea desde la perspectiva del certificador. Muestra el proceso completo desde la verificación de identidad hasta la firma electrónica avanzada."
                      videoType="tutorial"
                      triggerLabel="Ver demostración completa"
                    >
                      <div className="w-full h-full flex items-center justify-center cursor-pointer">
                        <div className="h-16 w-16 bg-primary/90 text-white rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                        </div>
                      </div>
                    </ExplanatoryVideo>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Card className="flex-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Pasos clave del proceso</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <ol className="space-y-2 text-gray-700">
                      <li className="flex gap-2">
                        <span className="bg-primary/10 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary text-xs font-bold">1</span>
                        </span>
                        <span>El usuario agenda una cita y recibe un enlace único</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="bg-primary/10 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary text-xs font-bold">2</span>
                        </span>
                        <span>Ambas partes se conectan a la videollamada segura</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="bg-primary/10 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary text-xs font-bold">3</span>
                        </span>
                        <span>Se verifica la identidad del solicitante</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="bg-primary/10 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary text-xs font-bold">4</span>
                        </span>
                        <span>Redacción/edición colaborativa del documento</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="bg-primary/10 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary text-xs font-bold">5</span>
                        </span>
                        <span>El certificador aplica su firma electrónica avanzada</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="bg-primary/10 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary text-xs font-bold">6</span>
                        </span>
                        <span>Documento certificado enviado al usuario</span>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
                
                <Card className="flex-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Requisitos Técnicos</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="space-y-4">
                      <p className="text-gray-700">
                        Para garantizar una experiencia óptima durante las sesiones de certificación, 
                        asegúrese de cumplir con los siguientes requisitos:
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Conexión a internet estable (mínimo 10 Mbps)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Cámara web de buena calidad (720p o superior)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Micrófono con cancelación de ruido</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Navegador actualizado (Chrome, Firefox, Edge)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Ambiente bien iluminado y sin ruido</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-center pt-2">
                <Button asChild>
                  <Link href="/videocall-interface-demo">
                    Ver demostración interactiva
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}