import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  UserCheck, 
  FileText, 
  MessageSquare, 
  Send, 
  Download, 
  CheckCircle, 
  XCircle, 
  ScreenShare, 
  Share2
} from "lucide-react";

export function VideoCallInterface() {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [currentTab, setCurrentTab] = useState("document");
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "rejected">("pending");
  const [message, setMessage] = useState("");
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 bg-gray-100 border-b">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          <span className="font-medium">Sesión de Certificación Online</span>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className={!micEnabled ? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700" : ""} 
            onClick={() => setMicEnabled(!micEnabled)}
          >
            {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={!videoEnabled ? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700" : ""} 
            onClick={() => setVideoEnabled(!videoEnabled)}
          >
            {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm">
            <ScreenShare className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-5 gap-4 p-4 flex-grow">
        <div className="col-span-3 flex flex-col">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden flex-grow mb-4">
            {/* Main video screen - Participant */}
            <div className="w-full h-full flex items-center justify-center">
              {videoEnabled ? (
                <div className="w-full h-full bg-gray-800">
                  {/* This would be replaced with actual video component */}
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <span>Transmisión de video del participante</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-white">
                  <VideoOff className="h-12 w-12 mb-2" />
                  <span>Cámara desactivada</span>
                </div>
              )}
            </div>
            
            {/* Small certifier video */}
            <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden shadow-lg border-2 border-gray-600">
              <div className="w-full h-full flex items-center justify-center text-white text-sm">
                <span>Video del certificador</span>
              </div>
            </div>
          </div>
          
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="document">
                <FileText className="h-4 w-4 mr-2" />
                Documento
              </TabsTrigger>
              <TabsTrigger value="identity">
                <UserCheck className="h-4 w-4 mr-2" />
                Verificación de Identidad
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="document" className="flex-grow">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    Revisión de Documento
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="rounded-md border h-96 overflow-auto p-4 bg-white">
                    {/* This would be replaced with actual document content/editor */}
                    <div className="prose max-w-none">
                      <h1>Contrato de Prestación de Servicios</h1>
                      <p>En Santiago de Chile, a [FECHA], entre las partes:</p>
                      <p><strong>PARTE CONTRATANTE:</strong> [NOMBRE DEL CLIENTE], RUT [RUT], domiciliado en [DIRECCIÓN], en adelante "el Cliente".</p>
                      <p><strong>PARTE CONTRATADA:</strong> [NOMBRE DEL PRESTADOR], RUT [RUT], domiciliado en [DIRECCIÓN], en adelante "el Prestador".</p>
                      <p>Se ha convenido el siguiente contrato de prestación de servicios profesionales:</p>
                      <h2>PRIMERO: Objeto</h2>
                      <p>El Prestador se obliga a proporcionar al Cliente los servicios profesionales de [DESCRIPCIÓN DE SERVICIOS], los cuales se detallan en el Anexo A que forma parte integrante de este contrato.</p>
                      <h2>SEGUNDO: Plazo</h2>
                      <p>Los servicios se prestarán por un período de [DURACIÓN], comenzando el [FECHA INICIO] y finalizando el [FECHA TÉRMINO].</p>
                      <h2>TERCERO: Honorarios y Forma de Pago</h2>
                      <p>El Cliente pagará al Prestador la suma de $[MONTO] por los servicios descritos. El pago se realizará de la siguiente manera: [CONDICIONES DE PAGO].</p>
                    </div>
                  </div>
                  <div className="flex justify-between mt-4">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline">Solicitar cambios</Button>
                      <Button>Aprobar documento</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="identity" className="flex-grow">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg flex items-center">
                    <UserCheck className="h-5 w-5 mr-2 text-primary" />
                    Verificación de Identidad
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-3">Documento de Identidad</h3>
                      <div className="aspect-[4/3] bg-gray-100 rounded-md mb-3 flex items-center justify-center">
                        <div className="text-gray-500 text-sm">
                          Imagen del documento de identidad
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Nombre completo:</label>
                          <Input defaultValue="Juan Carlos Pérez González" disabled />
                        </div>
                        <div>
                          <label className="text-sm font-medium">RUT/DNI:</label>
                          <Input defaultValue="12.345.678-9" disabled />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Fecha de nacimiento:</label>
                          <Input defaultValue="15/05/1985" disabled />
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-3">Validación Biométrica</h3>
                      <div className="aspect-[4/3] bg-gray-100 rounded-md mb-3 flex items-center justify-center">
                        <div className="text-gray-500 text-sm">
                          Captura en vivo del rostro
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${verificationStatus === "verified" ? "bg-green-500" : verificationStatus === "rejected" ? "bg-red-500" : "bg-yellow-500"}`}></div>
                          <span className="text-sm font-medium">
                            {verificationStatus === "verified" ? "Identidad verificada" : 
                             verificationStatus === "rejected" ? "Verificación fallida" : 
                             "Verificación pendiente"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setVerificationStatus("rejected")} className="flex-1">
                            <XCircle className="h-4 w-4 mr-2" />
                            Rechazar
                          </Button>
                          <Button onClick={() => setVerificationStatus("verified")} className="flex-1">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verificar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="chat" className="flex-grow">
              <Card className="h-full flex flex-col">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                    Chat de la Sesión
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-grow flex flex-col">
                  <div className="flex-grow border rounded-md p-3 mb-3 overflow-y-auto h-64">
                    <div className="space-y-3">
                      <div className="flex flex-col">
                        <div className="bg-gray-100 p-2 rounded-lg max-w-[80%] self-start">
                          <p className="text-sm">Buenos días, soy el certificador asignado para esta sesión. ¿Está listo para comenzar con la verificación de identidad?</p>
                          <span className="text-xs text-gray-500 mt-1">Certificador, 10:03</span>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="bg-primary/10 p-2 rounded-lg max-w-[80%] self-end">
                          <p className="text-sm">Buenos días, sí estoy listo. Ya tengo mi cédula de identidad a mano.</p>
                          <span className="text-xs text-gray-500 mt-1">Usuario, 10:04</span>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="bg-gray-100 p-2 rounded-lg max-w-[80%] self-start">
                          <p className="text-sm">Perfecto. Por favor, muestre su cédula a la cámara, asegurándose que se vean claramente todos los datos.</p>
                          <span className="text-xs text-gray-500 mt-1">Certificador, 10:05</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Textarea 
                      placeholder="Escriba su mensaje..." 
                      className="resize-none"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button className="flex-shrink-0" disabled={!message.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Información del Trámite</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Tipo de documento:</label>
                  <p className="text-sm">Contrato de Prestación de Servicios</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Solicitante:</label>
                  <p className="text-sm">Juan Carlos Pérez González</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Fecha y hora:</label>
                  <p className="text-sm">27/04/2025, 10:00 hrs.</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Estado:</label>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                    <p className="text-sm">En proceso</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Herramienta de Redacción</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-4">
                <p className="text-sm">
                  Use esta herramienta para colaborar con el usuario en la redacción o modificación de documentos durante la sesión en vivo.
                </p>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Edición de texto:</label>
                  <Textarea 
                    placeholder="Ingrese el texto a modificar o añadir al documento..."
                    className="resize-none h-28"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Plantillas disponibles:</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Seleccione una plantilla</option>
                    <option>Contrato de Trabajo</option>
                    <option>Poder Simple</option>
                    <option>Declaración Jurada</option>
                    <option>Contrato de Arriendo</option>
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir pantalla
                  </Button>
                  <Button className="flex-1">
                    Aplicar cambios
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Acciones de Certificación</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline">
                    Revisar documento
                  </Button>
                  <Button variant="outline">
                    Guardar cambios
                  </Button>
                  <Button variant="outline">
                    Rechazar trámite
                  </Button>
                  <Button variant="outline">
                    Solicitar información
                  </Button>
                </div>
                
                <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                  Certificar Documento
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}